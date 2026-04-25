const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:3000/login');
  
  // Set localStorage
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ role: 'buyer', _id: '123' }));
  });

  await page.goto('http://localhost:3000/matches');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const content = await page.content();
  if (content.includes('My Matches')) {
    console.log('PAGE RENDERED SUCCESSFULLY');
  } else {
    console.log('PAGE IS BLANK OR HAS ERROR');
    console.log(content.substring(0, 500));
  }
  
  await browser.close();
})();
