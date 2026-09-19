import React, {useEffect, useRef, useState} from 'react';
import {createContourRenderer} from './contour-renderer.js';

export function ContourDefinition() {
  return <aside className="contour-definition" aria-label="Contour field equation and parameters">
    <span className="contour-label">FIELD / 001</span>
    <code>{'f(q,t) = ‖q‖\n  + 0.22 sin(2.8qₓ + 0.22t)\n         sin(2.2qᵧ − 0.16t)\n\nContours: f = 0.075n, n ∈ ℕ\nq = p + 0.28h exp(−3‖p−m‖²)(p−m)'}</code>
    <p>p: position · m: pointer · t: seconds<br/>h: smoothed pointer influence, 0–1</p>
  </aside>;
}
export default function ContourField() {
  const canvas=useRef(null), renderer=useRef(null);
  const [state,setState]=useState('fallback');
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    try{renderer.current=createContourRenderer(canvas.current,setState);}catch{setState('fallback');}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[]);
  const enabled=state!=='fallback'&&state!=='static';
  function toggle(){if(!enabled)return;const next=!paused;setPaused(next);renderer.current?.pause(next);}
  return <figure className="contour-field" data-renderer={state}>
    <button className="contour-surface" type="button" disabled={!enabled} onClick={toggle} aria-label={paused?'Resume contour animation':'Pause contour animation'} aria-pressed={paused}>
      <img className="contour-fallback" src="/assets/contour-field.svg" width="400" height="320" alt="Fine contour lines forming a softly warped mathematical surface"/>
      <canvas ref={canvas} aria-hidden="true"/>
    </button>
    <figcaption><span className="contour-label">FIELD / 001</span><span>{state==='static'||state==='fallback'?'Contour field':paused?'Paused · click to resume':'Move to shape · click to pause'}</span></figcaption>
  </figure>;
}
