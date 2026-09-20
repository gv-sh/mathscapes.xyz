const rssPlugin = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("publicationTopics", function(publications, taxonomy) {
    const present = new Set((publications || []).flatMap(p => taxonomy.papers[p.url] || []));
    return taxonomy.topics.filter(topic => present.has(topic.id));
  });
  eleventyConfig.addGlobalData("uiVersion", () => JSON.parse(require("node:fs").readFileSync(".cache/ui-version.json", "utf8")).version);
  eleventyConfig.addFilter("authorBadges", require("./lib/author-badges"));

  eleventyConfig.addFilter("authorPalette", require("./lib/author-badges").paletteStyle);

  // Add RSS plugin
  eleventyConfig.addPlugin(rssPlugin);
  
  // Copy assets to output
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  
  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget(".cache/render-home.cjs");
  eleventyConfig.addWatchTarget(".cache/ui-version.json");
  
  // Collections
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("src/posts/*.md")
      .filter(post => !post.data.draft)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  // Date filter for dd.mm.yy format
  eleventyConfig.addFilter("shortDate", function(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  });

  // Deterministic Gravatar-style identicon (5x5 mirrored grid) as inline SVG,
  // seeded from a paper's DOI/title so each work gets a unique, stable thumbnail.
  eleventyConfig.addFilter("authorInitials", require("./lib/author-badges").initials);



  // Group a list of publications by year, newest year first
  eleventyConfig.addFilter("groupByYear", function(pubs) {
    const groups = {};
    (pubs || []).forEach(function(p) {
      const y = String(p.year);
      (groups[y] = groups[y] || []).push(p);
    });
    return Object.keys(groups)
      .sort(function(a, b) { return Number(b) - Number(a); })
      .map(function(y) { return { year: y, items: groups[y] }; });
  });

  // Date filter for post pages (full format)
  eleventyConfig.addFilter("date", function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Contributor (person) pages collection
  eleventyConfig.addCollection("people", function(collection) {
    return collection.getFilteredByGlob("src/people/*.md")
      .sort((a, b) => (a.data.name || "").localeCompare(b.data.name || ""));
  });

  // Strip HTML tags / decode a couple of entities for use in metadata
  const stripTags = function(s) {
    return String(s == null ? "" : s)
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  };
  eleventyConfig.addFilter("stripTags", stripTags);

  // JSON-LD for a contributor page: a Person plus their ScholarlyArticles
  // (with authors, DOI identifiers and venues) so search engines and scholarly
  // indexers can discover and attribute the papers.
  eleventyConfig.addFilter("personLd", function(name, affiliation, pageUrl, publications, links, siteUrl, tags) {
    siteUrl = siteUrl || "";
    const authorUrl = siteUrl + pageUrl;
    const personId = authorUrl + "#person";
    const person = { "@type": "Person", "@id": personId, "name": name, "url": authorUrl };
    const aff = stripTags(affiliation);
    if (aff) person.affiliation = { "@type": "Organization", "name": aff };
    const sameAs = (links || []).map(l => l.url).filter(u => /^https?:/.test(u));
    if (sameAs.length) person.sameAs = sameAs;
    if (tags && tags.length) person.knowsAbout = tags.map(stripTags);

    const works = (publications || []).map(function(p) {
      const authors = stripTags(p.authors).split(",").map(s => s.trim()).filter(Boolean)
        .map(n => (n === name ? { "@id": personId } : { "@type": "Person", "name": n }));
      const w = {
        "@type": "ScholarlyArticle",
        "name": p.title,
        "headline": p.title,
        "author": authors.length ? authors : { "@id": personId },
        "datePublished": String(p.year)
      };
      if (p.url) { w["@id"] = p.url; w.url = p.url; w.sameAs = p.url; }
      const m = p.url && p.url.match(/doi\.org\/(.+)$/);
      if (m) w.identifier = { "@type": "PropertyValue", "propertyID": "DOI", "value": m[1] };
      if (p.venue) w.isPartOf = { "@type": "Periodical", "name": stripTags(p.venue) };
      return w;
    });

    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "ProfilePage", "@id": authorUrl, "url": authorUrl, "name": name, "mainEntity": { "@id": personId } },
        person
      ].concat(works)
    });
  });

  // JSON-LD Organization schema for the home page
  eleventyConfig.addFilter("orgLd", function(site) {
    const u = site.url;
    const a = site.author || {};
    const sameAs = [];
    if (a.twitter) sameAs.push("https://twitter.com/" + a.twitter);
    if (a.github) sameAs.push("https://github.com/" + a.github);
    if (a.instagram) sameAs.push("https://instagram.com/" + a.instagram);
    sameAs.push("https://www.linkedin.com/company/mathscapes-research/");
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["Organization", "ResearchOrganization"],
      "name": site.title,
      "url": u,
      "description": site.description,
      "logo": u + "/assets/ms_light.png",
      "founder": { "@type": "Person", "name": "Gaurav Singh", "url": u + "/people/gaurav-singh/" },
      "member": [
        { "@type": "Person", "name": "Gaurav Singh", "url": u + "/people/gaurav-singh/" },
        { "@type": "Person", "name": "Rahul Singh Dhari", "url": u + "/people/rahul-singh-dhari/" }
      ],
      "sameAs": sameAs
    });
  });
  
  // Basic configuration
  return {
    // Input and output directories
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    
    // Template formats to process
    templateFormats: ["md", "njk", "html", "11ty.js"],
    
    // Use Nunjucks for markdown and HTML files
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    
    // Use Nunjucks for data cascade
    dataTemplateEngine: "njk"
  };
};