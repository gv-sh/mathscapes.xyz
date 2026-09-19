import React, {useEffect, useRef, useState} from 'react';
import {createContourRenderer} from './contour-renderer.js';

export function ContourDefinition() {
  return <aside className="contour-definition" aria-label="Contour field equation and parameters">
    <span className="contour-label">FIELD / 001</span>
    <code>{'f(q,t) = ‖q‖\n  + 0.22 sin(2.8qₓ + 0.65t)\n         sin(2.2qᵧ − 0.48t)\n\nContours: f = 0.075n, n ∈ ℕ\nq = p + 0.28h exp(−3‖p−m‖²)(p−m)'}</code>
    <p>p: position · m: pointer · t: seconds<br/>h: smoothed pointer influence, 0–1</p>
  </aside>;
}
export default function ContourField() {
  const canvas=useRef(null),backup=useRef(null),renderer=useRef(null);
  const [state,setState]=useState('fallback');
  const [engine,setEngine]=useState('svg');
  useEffect(()=>{
    try{renderer.current=createContourRenderer(canvas.current,backup.current,(next,backend)=>{setState(next);setEngine(backend);});}catch{setState('fallback');setEngine('svg');}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[]);
  const enabled=state!=='fallback';
  const stopped=state==='paused'||state==='static';
  function toggle(){if(enabled)renderer.current?.pause(!stopped);}
  const label=stopped?'Play animation':'Pause animation';
  const caption=state==='static'?'Reduced motion':state==='fallback'?'Static preview':state==='paused'?'Paused':engine==='canvas'?'Canvas animation':'Live contour field';
  return <figure className="contour-field" data-renderer={state} data-engine={engine}>
    <button className="contour-surface" type="button" disabled={!enabled} onClick={toggle} aria-label={label}>
      <img className="contour-fallback" src="/assets/contour-field.svg" width="400" height="320" alt="Fine contour lines forming a softly warped mathematical surface"/>
      <canvas ref={canvas} className="contour-gpu" aria-hidden="true"/>
      <canvas ref={backup} className="contour-cpu" aria-hidden="true"/>
    </button>
    <figcaption><span className="contour-label">FIELD / 001</span><span className="contour-controls"><span>{caption}</span>{enabled&&<button type="button" onClick={toggle} aria-label={label}>{stopped?'Play':'Pause'}</button>}</span></figcaption>
  </figure>;
}
