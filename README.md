# Mathscapes website

```sh
npm ci
npm run build
npm run dev
```

The homepage uses React, rendered to static HTML by Eleventy and hydrated in the browser. Profile and portfolio detail pages remain static. The approved layout is implemented in `ui/App.jsx` and `ui/site.css`; `lib/home-data.js` derives publications from the contributor profiles. Only records explicitly marked `mathscapes: true` appear on the homepage, and in the text indexes. Set that flag only when the work has a Mathscapes affiliation; unmarked publications remain on personal profiles.

`npm run dev` watches both React and Eleventy sources. `npm test` runs the Playwright checks (local Chrome on macOS; install Chromium with `npx playwright install chromium` elsewhere). A plain-text research index remains available at `/research.txt`.

The website is built with Eleventy. Portfolio PDFs and their finished WebP previews live in `src/assets/portfolio/`; titles and supporting text live in `src/_data/portfolio.json`.

A compact masthead pairs the Mathscapes wordmark with its tagline; the rest of the homepage is a full-width work grid. The homepage combines six selected examples and three research papers in one Work grid, with All, ML, Figures and Research filters. Publication previews live in `src/assets/publications/`, with DOI-keyed image dimensions and external PDF links in `src/_data/publicationPreviews.json`. They show the opening article page: page 2 of the IOP download (after its cover), page 1 of the Zenodo Iterflow paper, and page 1 of the auxetics accepted manuscript. Publication titles link to their DOI records; preview tiles link to the PDFs. Personal publication lists are unchanged. These are finished WebP assets, so building the website does not require a PDF renderer.

## Research poster sources

PDF generation lives in the sibling repository [`mathscapes-publications`](../mathscapes-publications). This website has no Python, font-processing or chart-rendering build dependency.

After rebuilding and checking the posters in that repository, export the finished assets:

```sh
cd ../mathscapes-publications
npm run export:website -- ../mathscapes.xyz
```

Then build this website normally. The export includes final PDFs, previews and website metadata, never generator sources or manifests.
