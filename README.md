# Mathscapes website

```sh
npm ci
npm run build
npm run dev
```

The homepage uses React, rendered to static HTML by Eleventy and hydrated in the browser. Profile and portfolio detail pages remain static. The approved layout is implemented in `ui/App.jsx` and `ui/site.css`; `lib/home-data.js` derives publications from the contributor profiles. Only records explicitly marked `mathscapes: true` appear on the homepage, in Machine mode, and in the text indexes. Set that flag only when the work has a Mathscapes affiliation; unmarked publications remain on personal profiles.

`npm run dev` watches both React and Eleventy sources. `npm test` runs the Playwright checks (local Chrome on macOS; install Chromium with `npx playwright install chromium` elsewhere). The Human/Machine switch exposes the same research as a copyable text index at `/research.txt`.

The website is built with Eleventy. Portfolio PDFs and their finished WebP previews live in `src/assets/portfolio/`; titles and supporting text live in `src/_data/portfolio.json`.

## Research poster sources

PDF generation lives in the sibling repository [`mathscapes-publications`](../mathscapes-publications). This website has no Python, font-processing or chart-rendering build dependency.

After rebuilding and checking the posters in that repository, export the finished assets:

```sh
cd ../mathscapes-publications
npm run export:website -- ../mathscapes.xyz
```

Then build this website normally. The export includes final PDFs, previews and website metadata, never generator sources or manifests.
