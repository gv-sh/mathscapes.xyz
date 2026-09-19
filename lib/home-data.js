const strip = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
const featured = [
  '10.1088/3049-4761/ae7df3',
  '10.5281/zenodo.18610143',
  '10.1177/20414196241281069',
  '10.1080/13588265.2020.1866859'
];
module.exports = function(data) {
  const people = data.collections.people || [];
  const publications = [...new Map(people.flatMap(p => p.data.publications || []).map(p => [p.url, {...p, authors:strip(p.authors), venue:strip(p.venue)}])).values()].sort((a,b) => b.year-a.year);
  return {
    site:data.site, portfolio:data.portfolio, publications,
    featured:featured.map(doi=>publications.find(p=>p.url===`https://doi.org/${doi}`)).filter(Boolean),
    people:people.map(p=>({name:p.data.name,affiliation:strip(p.data.affiliation),url:p.url})),
    posts:(data.collections.posts || []).slice(0,4).map(p=>({title:p.data.title,url:p.url}))
  };
};
