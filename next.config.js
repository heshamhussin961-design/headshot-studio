/** @type {import('next').NextConfig} */
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
module.exports = { basePath: base || undefined, output: "standalone" };
