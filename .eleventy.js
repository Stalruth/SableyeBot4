module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "static": "/" });
  eleventyConfig.addPassthroughCopy({ "node_modules/mvp.css/mvp.css" : "/css/mvp.css" });
};
