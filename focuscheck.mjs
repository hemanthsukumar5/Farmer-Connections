import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto('http://127.0.0.1:4173/register', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('button#next-btn').click();
  await page.waitForTimeout(500);
  const fullName = page.locator('#full-name');
  await fullName.click();
  await fullName.type('JohnSmith', { delay: 80 });
  console.log(JSON.stringify({
    value: await fullName.inputValue(),
    focusAfter: await page.evaluate(() => {
      const el = document.activeElement;
      return el ? (el.id || el.tagName || 'none') : 'none';
    })
  }, null, 2));
} finally {
  await browser.close();
}
