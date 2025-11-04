const rssPlugin = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(rssPlugin);
  
  // Copy assets to output
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  
  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("src/assets/css/");
  
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

  // Date filter for post pages (full format)
  eleventyConfig.addFilter("date", function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    templateFormats: ["md", "njk", "html"],
    
    // Use Nunjucks for markdown and HTML files
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    
    // Use Nunjucks for data cascade
    dataTemplateEngine: "njk"
  };
};