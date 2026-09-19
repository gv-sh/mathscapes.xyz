const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.route('https://www.googletagmanager.com/**',r=>r.abort());
  await page.addInitScript(()=>{
    window.shaderDraws=0;
    const draw=WebGL2RenderingContext.prototype.drawArrays;
    WebGL2RenderingContext.prototype.drawArrays=function(...args){window.shaderDraws++;return draw.apply(this,args);};
  });
});
test('shader renders, pauses by keyboard, stops offscreen and exposes its equation',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const field=page.locator('.contour-field');
  await expect(field).toHaveAttribute('data-renderer','running');
  const before=await page.evaluate(()=>window.shaderDraws);
  await page.waitForTimeout(500);
  const frames=await page.evaluate(()=>window.shaderDraws);
  expect(frames-before).toBeGreaterThan(2);
  expect(frames-before).toBeLessThanOrEqual(20);
  const surface=page.locator('.contour-surface');
  await surface.hover({position:{x:100,y:130}});
  await page.waitForTimeout(350);
  await surface.focus();await page.keyboard.press('Space');
  await expect(field).toHaveAttribute('data-renderer','paused');
  const paused=await page.evaluate(()=>window.shaderDraws);
  await page.waitForTimeout(200);
  expect(await page.evaluate(()=>window.shaderDraws)).toBe(paused);
  await page.screenshot({path:'test-results/shader-desktop.png'});
  await page.keyboard.press('Space');
  await expect(field).toHaveAttribute('data-renderer','running');
  await page.locator('#people').scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute('data-renderer','idle');
  const idle=await page.evaluate(()=>window.shaderDraws);
  await page.waitForTimeout(200);
  expect(await page.evaluate(()=>window.shaderDraws)).toBe(idle);
  await page.getByRole('button',{name:'Machine',exact:true}).click();
  await expect(page.getByLabel('Contour field equation and parameters')).toContainText('0.075n');
  expect(await page.locator('canvas').count()).toBe(0);
  expect(errors).toEqual([]);
});
test('reduced motion stays static, including pointer movement',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.contour-field')).toHaveAttribute('data-renderer','static');
  await expect(page.locator('.contour-surface')).toBeDisabled();
  await page.waitForTimeout(200);
  const frames=await page.evaluate(()=>window.shaderDraws);
  await page.mouse.move(180,480);
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>window.shaderDraws)).toBe(frames);
  await page.screenshot({path:'test-results/shader-mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('unavailable WebGL retains a visible static field',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.contour-field')).toHaveAttribute('data-renderer','fallback');
  await expect(page.locator('.contour-fallback')).toBeVisible();
  await expect(page.locator('.contour-surface')).toBeDisabled();
  expect(await page.evaluate(()=>window.shaderDraws)).toBe(0);
});
