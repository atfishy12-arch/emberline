import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/**
 * `EXPORT_MODE=github` switches the build to a fully static export suitable
 * for GitHub Pages. It is opt-in so local dev keeps server-side image
 * optimisation and serves from the root path.
 */
const isGithubPages = process.env.EXPORT_MODE === 'github';
const repo = '/emberline';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // There are lockfiles above this directory; pin the root so Turbopack does
  // not infer the home folder as the workspace.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },

  ...(isGithubPages
    ? {
        output: 'export',
        // Pages serves a project site from /<repo>/, so every asset and
        // internal link needs the prefix or it 404s.
        basePath: repo,
        assetPrefix: repo,
        trailingSlash: true,
        // The export has no server, so there is nothing to optimise images
        // on request — they ship as authored.
        images: { unoptimized: true },
      }
    : {
        images: { formats: ['image/avif', 'image/webp'] },
      }),
};

export default nextConfig;
