const homeData=require('../lib/home-data');
module.exports=class {
  data(){return {layout:'base.njk',title:'Home',modernHome:true};}
  render(data){
    const payload=homeData(data);
    const {render}=require('../.cache/render-home.cjs');
    return `<div id="home-root">${render(payload)}</div><script id="home-data" type="application/json">${JSON.stringify(payload).replace(/</g,'\\u003c')}</script><script type="module" src="/assets/ui/home.js?v=${data.uiVersion}"></script>`;
  }
};
