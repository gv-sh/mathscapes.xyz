const strip = value => String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
module.exports = function(data) {
  const people = data.collections.people || [];
  const publications = [...new Map(people.flatMap(p => (p.data.publications || []).filter(publication => publication.mathscapes === true)).map(p => [p.url, {...p, authors:strip(p.authors), venue:strip(p.venue)}])).values()].sort((a,b) => b.year-a.year);
  return {
    site:data.site, portfolio:data.portfolio, publications:publications.map(p=>({...p,preview:data.publicationPreviews?.[p.url]})),
    people:people.map(p=>({name:p.data.name,affiliation:strip(p.data.affiliation),url:p.url})),
    posts:(data.collections.posts || []).slice(0,4).map(p=>({title:p.data.title,url:p.url}))
  };
};
