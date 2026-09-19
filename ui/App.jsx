import React, {useEffect, useRef, useState} from 'react';
import ContourField, {ContourDefinition} from './ContourField.jsx';

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
function Portfolio({pieces,ready}) {
  const [filter,setFilter]=useState('all');
  const visible=filter==='all'?pieces:pieces.filter(p=>p.group===filter);
  return <section id="work" className="work-section">
    <div className="section-top"><h2>Selected work</h2><div className="filters" role="group" aria-label="Filter selected work">{[['all','All'],['tooling','ML'],['figures','Figures']].map(([value,label])=><button key={value} type="button" aria-pressed={filter===value} disabled={!ready} onClick={()=>setFilter(value)}>{label}</button>)}</div></div>
    <div className="portfolio-grid">{visible.map((p,i)=><article className="portfolio-card" key={p.slug}>
      <a className={`poster-stage ${p.orientation}`} href={`/assets/portfolio/${p.slug}.pdf`} aria-label={`Open ${p.title} (PDF)`}><img src={`/assets/portfolio/${p.slug}-1.webp`} alt="" width={p.previewWidth} height={p.previewHeight} loading={i<3?'eager':'lazy'}/><span className="preview-action">View PDF</span></a>
      <div className="poster-caption"><a href={`/assets/portfolio/${p.slug}.pdf`}>{p.title}</a><a className="details-link" href={`/portfolio/${p.slug}/`} aria-label={`Details and sources for ${p.title}`}>Details</a></div>
    </article>)}</div><span className="sr-only" role="status">{visible.length} PDF examples</span>
  </section>;
}
function Human({data,ready}) {
  const pubs=data.publications;
  return <>
    <section className="intro"><div className="intro-copy"><h1>Research, software<br/>and technical communication.</h1><div className="intro-bottom"><p>We build models, tools and visual explanations<br className="desktop-break"/> for research and engineering teams.</p><a className="contact-link" href={`mailto:${data.site.author.email}`}>Get in touch</a></div></div><ContourField/></section>
    <Portfolio pieces={data.portfolio} ready={ready}/>
    <section className="editorial-section" id="services"><h2>Services</h2><div className="service-list">{services.map(s=><div className="service-row" key={s.title}><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></section>
    <section className="editorial-section" id="publications"><h2>Publications</h2><div className="publication-list">{pubs.map(p=><a className="publication-row" key={p.url} href={p.url}><span className="publication-year">{p.year}</span><div><h3>{p.title}</h3><p>{p.venue}</p></div></a>)}</div></section>
    <section className="editorial-section" id="people"><h2>People</h2><div className="people-list">{data.people.map(p=><a href={p.url} key={p.url}><span>{p.name}</span><span className="affiliation">{p.affiliation}</span></a>)}</div></section>
    {data.posts.length>0&&<section className="editorial-section"><h2>Notes</h2><div>{data.posts.map(p=><p key={p.url}><a href={p.url}>{p.title}</a></p>)}</div></section>}
  </>;
}
function Machine({data}) {
  const [status,setStatus]=useState('');
  async function copy(){try{await navigator.clipboard.writeText(researchText(data));setStatus('Copied to clipboard.');}catch{setStatus('Copy unavailable. Use Download to save the index.');}}
  return <section className="machine-index"><div className="machine-intro"><div><div className="machine-top"><h1>Mathscapes / index</h1><div><button onClick={copy}>Copy</button><a href="/research.txt" download>Download <span aria-hidden="true">↓</span></a></div></div><p role="status" className="copy-status">{status||'Plain text · sources and direct links included'}</p></div><ContourDefinition/></div><pre tabIndex="0" aria-label="Machine-readable research index">{researchText(data)}</pre></section>;
}
export default function App({data}) {
  const [mode,setMode]=useState('human');
  const [ready,setReady]=useState(false);
  const main=useRef(null);
  useEffect(()=>{setReady(true);const update=()=>setMode(new URLSearchParams(location.search).get('mode')==='machine'?'machine':'human');update();window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update);},[]);
  function changeMode(next){setMode(next);const url=new URL(location.href);if(next==='machine')url.searchParams.set('mode','machine');else url.searchParams.delete('mode');url.hash='';history.pushState(null,'',url);main.current?.focus();window.scrollTo({top:0,behavior:'instant'});}
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="home-header"><a className="brand" href="/" aria-label="Mathscapes home"><img src="/assets/ms_light.png" alt="Mathscapes" width="267" height="48"/></a><nav aria-label="Main navigation"><a href={mode==='human'?'#work':'/?mode=human#work'}>Work</a><a href={mode==='human'?'#people':'/?mode=human#people'}>People</a><a href="#contact">Contact</a></nav></header>
    <main id="main-content" ref={main} tabIndex="-1">{mode==='human'?<Human data={data} ready={ready}/>:<Machine data={data}/>}</main>
    <footer id="contact"><div className="footer-row"><a className="email-link" href={`mailto:${data.site.author.email}`}>{data.site.author.email}</a><div className="social-links"><a href="https://github.com/mathscapes">GitHub</a><a href="https://www.linkedin.com/company/mathscapes-research/">LinkedIn</a></div></div><div className="mode-row"><div role="group" aria-label="Viewing mode" className="mode-toggle"><button disabled={!ready} aria-pressed={mode==='human'} onClick={()=>changeMode('human')}>Human</button><button disabled={!ready} aria-pressed={mode==='machine'} onClick={()=>changeMode('machine')}>Machine</button></div></div><noscript><p className="no-script">Browse the <a href="/research.txt">text research index</a>. Enable JavaScript to filter work and switch viewing modes.</p></noscript></footer>
  </div>;
}
