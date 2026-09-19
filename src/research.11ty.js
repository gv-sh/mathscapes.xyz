const homeData=require('../lib/home-data');
module.exports=class {
  data(){return {permalink:'/research.txt',eleventyExcludeFromCollections:true};}
  render(data){return require('../.cache/render-home.cjs').researchText(homeData(data));}
};
