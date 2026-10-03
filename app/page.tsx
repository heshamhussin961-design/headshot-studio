"use client";

import { useState } from "react";

const STYLES = [
  { id: "corporate", label: "Corporate", hint: "Suit · grey studio" },
  { id: "linkedin", label: "LinkedIn", hint: "Business casual · bright" },
  { id: "studio", label: "Editorial", hint: "Dark studio · rim light" },
  { id: "outdoor", label: "City", hint: "Golden hour · blurred city" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState("corporate");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const body = new FormData();
    body.append("photo", file);
    body.append("style", style);
    try {
      const res = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data.image);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header>
        <span className="badge">AI · Photorealistic · Identity-preserving</span>
        <h1>
          Your selfie, <em>studio-grade.</em>
        </h1>
        <p className="sub">
          Upload one clear photo of your face. Pick a look. Get a professional headshot ready for
          LinkedIn, your CV or your team page.
        </p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>1 · Your photo</h2>
          <label
            className="drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files?.[0]);
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Your upload" />
            ) : (
              <span>Drop a photo here or click to upload<br /><small>JPG, PNG or WebP · max 8 MB</small></span>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
          </label>

          <h2>2 · Pick a look</h2>
          <div className="styles">
            {STYLES.map((s) => (
              <button key={s.id} className={s.id === style ? "style on" : "style"} onClick={() => setStyle(s.id)} type="button">
                <b>{s.label}</b>
                <small>{s.hint}</small>
              </button>
            ))}
          </div>

          <button className="go" onClick={generate} disabled={!file || loading} type="button">
            {loading ? "Shooting your headshot… (~30s)" : "Generate headshot"}
          </button>
          {error && <p className="err">{error}</p>}
        </div>

        <div className="card result">
          <h2>3 · Your headshot</h2>
          {result ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result} alt="Generated headshot" />
              <a className="go" href={result} download="headshot.png">Download</a>
            </>
          ) : (
            <div className="empty">{loading ? <span className="spin" /> : "Your result will appear here."}</div>
          )}
        </div>
      </section>

      <footer>
        Photos are sent to the image model only to generate your headshot and are not stored by this app.
      </footer>
    </main>
  );
}
