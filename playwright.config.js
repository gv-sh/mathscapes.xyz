const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests',fullyParallel:false,workers:1,
  use:{baseURL:'http://localhost:4178',launchOptions:process.platform==='darwin'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{}},
  webServer:{command:'npm run dev',url:'http://localhost:4178',reuseExistingServer:!process.env.CI,timeout:30000}
});
