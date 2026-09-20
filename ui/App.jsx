import React, {useEffect, useState} from 'react';

export const services = [
  {title:'Applied ML & research tooling',text:'Models and analysis pipelines for engineering data, delivered as documented, tested software your team can keep.'},
  {title:'Technical figures & communication',text:'Diagrams, mathematical explanations and data visualizations for papers and reports, built with editable source.'}
];
export function researchText(data) {
  return [
    '# Mathscapes', '', data.site.description, '', `Website: ${data.site.url}`, `Contact: ${data.site.author.email}`,
    '', '## Services', ...services.flatMap(s=>['',`### ${s.title}`,s.text]),
    '', '## Selected work', ...data.portfolio.flatMap(p=>['',`### ${p.title}`,p.summary,`PDF: ${data.site.url}/assets/portfolio/${p.slug}.pdf`,`Details: ${data.site.url}/portfolio/${p.slug}/`,`Source: ${p.source.url}`,`Scope: ${p.scope}`]),
    '', '## Publications', ...data.publications.flatMap(p=>['',`### ${p.year} — ${p.title}`,`${p.authors}. ${p.venue}.`,p.url]),
    '', '## People', ...data.people.flatMap(p=>['',p.name,p.affiliation,`${data.site.url}${p.url}`]), ''
  ].join('\n');
}
function Portfolio({pieces,publications,topics,ready}) {
  const [filter,setFilter]=useState('all');
  const items=[...pieces,...publications.map(p=>({...p,group:'research'}))];
  const categories=topics.filter(topic=>items.some(p=>p.topics.includes(topic.id)));
  const visible=filter==='all'?items:items.filter(p=>p.topics.includes(filter));
  return <section id="work" className="work-section">
    <div className="section-top"><h2>Work</h2><div className="filters" role="group" aria-label="Filter work by subject">{[{id:'all',label:'All'},...categories].map(({id,label})=><button key={id} type="button" aria-pressed={filter===id} disabled={!ready} onClick={()=>setFilter(id)}>{label}</button>)}</div></div>
    <div className="portfolio-grid">{visible.map((p,i)=>p.group==='research'?<article className="work-card publication-card" key={p.url}>
      {p.preview&&<a className="poster-stage portrait" href={p.preview.pdf} aria-label={`Open ${p.title} (${p.preview.version || 'PDF'})`}><img src={`/assets/publications/${p.preview.image}`} alt="" width={p.preview.width} height={p.preview.height} loading="lazy"/><span className="preview-action">View PDF</span></a>}
      <div className="publication-caption"><h3><a href={p.url}>{p.title}</a></h3><p><span className="publication-year">{p.year}</span>{p.preview?.version&&<> · {p.preview.version}</>}</p></div>
    </article>:<article className="work-card portfolio-card" key={p.slug}>
      <a className={`poster-stage ${p.orientation}`} href={`/assets/portfolio/${p.slug}.pdf`} aria-label={`Open ${p.title} (PDF)`}><img src={`/assets/portfolio/${p.slug}-1.webp`} alt="" width={p.previewWidth} height={p.previewHeight} loading={i<3?'eager':'lazy'}/><span className="preview-action">View PDF</span></a>
      <div className="poster-caption"><a href={`/assets/portfolio/${p.slug}.pdf`}>{p.title}</a><a className="details-link" href={`/portfolio/${p.slug}/`} aria-label={`Details and sources for ${p.title}`}>Details</a></div>
    </article>)}</div><span className="sr-only" role="status">{visible.length} items</span>
  </section>;
}
export default function App({data}) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{setReady(true);},[]);
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="home-header"><a className="brand" href="/" aria-label="Mathscapes home"><img src="/assets/ms_light.png" alt="Mathscapes" width="267" height="48"/></a><h1>Research, software and technical communication.</h1></header>
    <main id="main-content" tabIndex="-1"><Portfolio pieces={data.portfolio} publications={data.publications} topics={data.topics} ready={ready}/><noscript><p className="no-script">Browse the <a href="/research.txt">text research index</a>. Enable JavaScript to filter work.</p></noscript></main>

    <footer className="profile-directory" aria-label="People">{data.people.map(p=><a href={p.url} key={p.url}>{p.name}</a>)}</footer>
  </div>;
}
