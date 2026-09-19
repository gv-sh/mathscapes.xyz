// A single full-screen triangle; no textures, meshes or per-frame allocations.
const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float influence;
uniform float time;
out vec4 color;
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y * 2.7;
  vec2 delta = p - pointer;
  vec2 q = p + 0.28 * influence * exp(-3.0 * dot(delta, delta)) * delta;
  float f = length(q) + 0.22 * sin(2.8 * q.x + 0.65 * time)
                              * sin(2.2 * q.y - 0.48 * time);
  float bands = f / 0.075;
  float distanceToLine = abs(fract(bands + 0.5) - 0.5);
  float width = max(fwidth(bands), 0.001);
  float line = 1.0 - smoothstep(0.2 * width, 0.95 * width, distanceToLine);
  float fade = 1.0 - smoothstep(0.88, 1.43, length(p));
  float tint = 0.5 + 0.5 * sin(2.0 * q.x - q.y + 0.12 * time);
  vec3 ink = mix(vec3(0.18, 0.19, 0.20), vec3(0.47, 0.35, 0.39), tint);
  color = vec4(mix(vec3(1.0), ink, line * fade * 0.78), 1.0);
}`;

function createGPU(canvas) {
  const gl = canvas.getContext('webgl2', {antialias:false, depth:false, stencil:false, powerPreference:'low-power'});
  if (!gl) return null;
  const program=gl.createProgram();
  const shaders=[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].map((type,i)=>{
    const shader=gl.createShader(type);
    gl.shaderSource(shader,i===0?vertex:fragment);gl.compileShader(shader);gl.attachShader(program,shader);
    return shader;
  });
  gl.linkProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(['resolution','pointer','influence','time'].map(name=>[name,gl.getUniformLocation(program,name)]));
  return {
    draw(t,x,y,strength){
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      gl.uniform2f(uniforms.pointer,x,y);gl.uniform1f(uniforms.influence,strength);gl.uniform1f(uniforms.time,t);
      gl.drawArrays(gl.TRIANGLES,0,3);
    },
    dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  };
}

// If WebGL is blocked or lost, trace the same level sets on a separate 2D canvas.
function createCPU(canvas) {
  const context=canvas.getContext('2d');
  if(!context)return null;
  return {
    draw(t,mx,my,strength){
      const w=canvas.width,h=canvas.height,scale=h/2.7;
      context.clearRect(0,0,w,h);
      context.lineWidth=Math.max(.7,w/canvas.clientWidth*.65);
      context.strokeStyle='#785964';
      for(let n=1;n<=20;n++){
        context.beginPath();
        for(let i=0;i<=96;i++){
          const a=i/96*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
          let lo=0,hi=2,r=0;
          for(let j=0;j<12;j++){
            r=(lo+hi)/2;
            const px=r*c,py=r*s,dx=px-mx,dy=py-my;
            const bend=.28*strength*Math.exp(-3*(dx*dx+dy*dy));
            const qx=px+bend*dx,qy=py+bend*dy;
            const f=Math.hypot(qx,qy)+.22*Math.sin(2.8*qx+.65*t)*Math.sin(2.2*qy-.48*t);
            if(f<n*.075)lo=r;else hi=r;
          }
          const x=w/2+r*c*scale,y=h/2-r*s*scale;
          if(i===0)context.moveTo(x,y);else context.lineTo(x,y);
        }
        context.closePath();context.globalAlpha=.75*Math.max(0,Math.min(1,(1.5-n*.075)/.5));context.stroke();
      }
      context.globalAlpha=1;
    },
    dispose(){context.clearRect(0,0,canvas.width,canvas.height);}
  };
}

export function createContourRenderer(canvas, backup, onState) {
  let backend;
  try{backend=createGPU(canvas);}catch{backend=null;}
  let engine=backend?'webgl':'canvas';
  if(!backend)backend=createCPU(backup);
  if(!backend)return null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false, optedIn=false, visible=false, disposed=false, frame=0,last=0,elapsed=0;
  let x=0,y=0,targetX=0,targetY=0,strength=0,targetStrength=0;
  const active=()=>!disposed&&!paused&&(!motion.matches||optedIn)&&visible&&!document.hidden;
  function draw(){if(!disposed)backend.draw(elapsed,x,y,strength);}
  function tick(now){
    frame=0;if(!active())return;
    if(!last||now-last>=1000/30-1){
      elapsed+=last?Math.min((now-last)/1000,.06):0;last=now;
      x+=(targetX-x)*.09;y+=(targetY-y)*.09;strength+=(targetStrength-strength)*.09;draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;
    const state=paused?'paused':motion.matches&&!optedIn?'static':active()?'running':'idle';
    canvas.dataset.state=state;onState(state,engine);
    if(active())frame=requestAnimationFrame(tick);
  }
  function resize(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
    for(const surface of [canvas,backup]){
      surface.width=Math.max(1,Math.round(rect.width*ratio));surface.height=Math.max(1,Math.round(rect.height*ratio));
    }
    draw();
  }
  function move(event){
    if(!active()||event.pointerType==='touch')return;
    const rect=canvas.getBoundingClientRect();
    targetX=(event.clientX-rect.left-rect.width/2)/rect.height*2.7;
    targetY=(rect.height/2-(event.clientY-rect.top))/rect.height*2.7;targetStrength=1;
  }
  const surface=canvas.parentElement;
  const leave=()=>{targetStrength=0;};
  const preference=()=>{optedIn=false;sync();};
  const loss=event=>{
    event.preventDefault();
    if(disposed||engine!=='webgl')return;
    backend.dispose();backend=createCPU(backup);engine='canvas';
    if(!backend){cancelAnimationFrame(frame);onState('fallback','svg');return;}
    resize();sync();
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});
  const resizeObserver=new ResizeObserver(resize);
  observer.observe(canvas);resizeObserver.observe(canvas);
  surface.addEventListener('pointermove',move);surface.addEventListener('pointerleave',leave);
  canvas.addEventListener('webglcontextlost',loss);
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',preference);
  resize();sync();
  return {
    pause(value){paused=value;if(!value)optedIn=true;sync();},
    dispose(){
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();
      surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerleave',leave);
      canvas.removeEventListener('webglcontextlost',loss);
      document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',preference);
      backend?.dispose();
    }
  };
}
