const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.route('https://www.googletagmanager.com/**',route=>route.abort());
});
test('approved layout, filters, research and existing links',async({page,context,request})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading',{level:1})).toHaveText('Research, software and technical communication.');
  await expect(page.locator('.home-header nav, .intro, #services, #people')).toHaveCount(0);
  await expect(page.locator('.portfolio-card')).toHaveCount(6);
  await expect(page.locator('.work-card')).toHaveCount(9);
  for(const [label,count] of [['Machine learning',4],['Streaming statistics',5],['Materials & mechanics',3],['All',9]]){
    await page.getByRole('button',{name:label,exact:true}).click();
    await expect(page.locator('.work-card')).toHaveCount(count);
  }
  await expect(page.locator('.publication-card')).toHaveCount(3);
  await expect(page.locator('.publication-card .poster-stage img')).toHaveCount(3);
  for(const link of await page.locator('.publication-card .poster-stage').all()) {
    expect(await link.getAttribute('href')).toMatch(/^https:\/\/.*(?:pdf|pdf#page=2)$/);
    await expect(link).toHaveAccessibleName(/Open /);
  }
  await expect(page.locator('body')).not.toContainText('↗');
  await expect(page.locator('#work')).not.toContainText('scutoid');
  await expect(page.locator('#work')).not.toContainText('ReRide');
  const personal=await (await request.get('/people/rahul-singh-dhari/')).text();
  expect(personal).toContain('scutoid-based');
  const machineIndex=await (await request.get('/research.txt')).text();
  const llms=await (await request.get('/llms.txt')).text();
  for(const text of [machineIndex,llms]){
    expect(text).not.toContain('scutoid-based');
    expect(text).not.toContain('ReRide');
    expect(text).toContain('ae7df3');
  }
  const paths=await page.locator('a[href^="/"]').evaluateAll(links=>[...new Set(links.map(a=>a.getAttribute('href')))]);
  for(const path of paths)expect((await request.get(path)).ok(),path).toBeTruthy();
  await expect(page.getByRole('group',{name:'Viewing mode'})).toHaveCount(0);
  await page.goto('/?mode=machine',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.portfolio-card')).toHaveCount(6);
  await expect(page.locator('.work-card')).toHaveCount(9);
  expect(errors).toEqual([]);
});
test('responsive previews and keyboard controls',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    for(const img of await page.locator('.poster-stage img').all()){
      await img.scrollIntoViewIfNeeded();
      await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBeTruthy();
      expect(await img.evaluate(el=>{const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();return r.left>=p.left&&r.right<=p.right+.5&&r.top>=p.top&&r.bottom<=p.bottom+.5;})).toBeTruthy();
    }
    await page.locator('#work').screenshot({path:`test-results/publications-${width}.png`});
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});
  }
  const filter=page.getByRole('button',{name:'Machine learning',exact:true});
  await filter.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.portfolio-card')).toHaveCount(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('static content and favicon work without JavaScript',async({browser,request})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.portfolio-card')).toHaveCount(6);
  await expect(page.locator('.work-card')).toHaveCount(9);
  await expect(page.getByRole('link',{name:'text research index'})).toBeVisible();
  const favicon=await page.locator('link[rel=icon]').getAttribute('href');
  const response=await request.get(favicon);expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain('<svg');
  await context.close();
});

test('profile links and publication grids',async({page})=>{
  await page.goto('/');
  for(const [name,slug,count] of [['Gaurav Singh','gaurav-singh',7],['Rahul Singh Dhari','rahul-singh-dhari',19]]){
    await page.getByRole('link',{name,exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`/people/${slug}/$`));
    await expect(page.getByRole('heading',{level:1})).toHaveText(name);
    await expect(page.locator('.publication-card')).toHaveCount(count);
    await expect(page.locator('.publication-card .poster-stage img')).toHaveCount(count);
    await expect(page.locator('.citation-stage')).toHaveCount(0);
    const subjects=slug==='gaurav-singh'
      ? [['Machine learning',2],['Streaming statistics',1],['Materials & mechanics',1],['Interaction design',3],['Transport & sustainability',1]]
      : [['Machine learning',2],['Materials & mechanics',18]];
    await expect(page.locator('[data-topic]')).toHaveCount(subjects.length+1);
    for(const [label,total] of subjects){
      const button=page.getByRole('button',{name:label,exact:true});
      await button.focus(); await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('.publication-card:visible')).toHaveCount(total);
      await expect(page.getByRole('status')).toHaveText(`${total} ${total===1?'paper':'papers'}`);
    }
    await page.getByRole('button',{name:'All',exact:true}).click();
    await expect(page.locator('.publication-card:visible')).toHaveCount(count);
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:900});
      await page.evaluate(()=>document.fonts.ready);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
      for(const img of await page.locator('.poster-stage img').all()){
        await img.scrollIntoViewIfNeeded();
        await expect.poll(()=>img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBeTruthy();
      }
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:`test-results/${slug}-${width}.png`,fullPage:false});
    }
    await page.getByRole('link',{name:'Mathscapes home',exact:true}).click();
    await expect(page.locator('.work-card')).toHaveCount(9);
  }
});
