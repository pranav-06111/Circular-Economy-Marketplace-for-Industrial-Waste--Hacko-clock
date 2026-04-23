import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000/matches');
  
  // wait for the matches to load
  await page.waitForSelector('button:contains("VIEW ON MAP")', { timeout: 10000 }).catch(() => {});
  
  // click the first view on map button
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('VIEW ON MAP')) {
      await btn.click();
      break;
    }
  }

  // wait a bit for the modal to open and crash
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
