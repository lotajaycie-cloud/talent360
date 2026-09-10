/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Talent 360 Mobile is the main app.
  //
  // It is a single self-contained HTML document (built from the Claude Design
  // file) rather than React components, so it is served from public/ and mounted
  // at the site root with a rewrite. `beforeFiles` runs ahead of the App Router,
  // so "/" reaches the mobile app instead of a React page.
  //
  // Why not port it to JSX: the HTML build is already verified end to end
  // (14-step assessment, scoring, all three roles). Re-expressing ~2,000 lines
  // of it as components would risk regressions for no functional gain today.
  // If it later needs to share state with the desktop routes, that is the point
  // to port it properly.
  //
  // The desktop app keeps all of its routes and now lives at /desktop.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/talent360_mobile.html' },
      ],
    };
  },
};

module.exports = nextConfig;
