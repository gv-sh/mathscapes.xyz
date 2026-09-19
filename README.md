# Mathscapes website

```sh
npm ci
npm run build
npm run dev
```

The website is built with Eleventy. Portfolio PDFs and their finished WebP previews live in `src/assets/portfolio/`; titles and supporting text live in `src/_data/portfolio.json`.

## Research poster sources

PDF generation lives in the sibling repository [`mathscapes-publications`](../mathscapes-publications). This website has no Python, font-processing or chart-rendering build dependency.

After rebuilding and checking the posters in that repository, export the finished assets:

```sh
cd ../mathscapes-publications
npm run export:website -- ../mathscapes.xyz
```

Then build this website normally. The export includes final PDFs, previews and website metadata, never generator sources or manifests.
