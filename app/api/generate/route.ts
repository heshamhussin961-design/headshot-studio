import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 8 * 1024 * 1024;

const STYLES: Record<string, string> = {
  corporate:
    "a navy or charcoal tailored suit with a crisp shirt, soft neutral grey studio backdrop, classic corporate headshot",
  linkedin:
    "smart business-casual outfit, bright clean light-grey background, friendly confident expression, LinkedIn profile photo",
  studio:
    "dark charcoal studio backdrop with dramatic but flattering rim light, black tailored blazer, editorial magazine portrait",
  outdoor:
    "smart-casual outfit, softly blurred modern city background in natural golden-hour light, approachable executive portrait",
};

function prompt(style: string) {
  return [
    "Transform this photo into a professional headshot of the SAME person.",
    "Keep the face, identity, facial structure, skin tone, eye color, hairline and facial hair exactly as in the original photo — do not beautify, slim or change ethnicity or age.",
    `Style: ${STYLES[style] ?? STYLES.corporate}.`,
    "Head and shoulders framing, camera at eye level, 85mm lens look, shallow depth of field, soft key light, natural skin texture, sharp focus on the eyes, photorealistic, high resolution.",
    "No text, no watermark, no logos, no props, no extra people.",
  ].join(" ");
}

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Server is missing OPENAI_API_KEY." }, { status: 500 });
  }

  const form = await req.formData();
  const photo = form.get("photo");
  const style = String(form.get("style") || "corporate");

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "Upload a photo first." }, { status: 400 });
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });
  }

  const body = new FormData();
  body.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
  body.append("image", photo, photo.name || "photo.png");
  body.append("prompt", prompt(style));
  body.append("size", "1024x1024");
  body.append("quality", process.env.OPENAI_IMAGE_QUALITY || "high");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || `Generation failed (${res.status}).`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "No image returned." }, { status: 502 });
  }
  return NextResponse.json({ image: `data:image/png;base64,${b64}` });
}
