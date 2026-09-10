import {chromium} from 'playwright';
import {findProductArrays, normalizeJdItem} from './normalize';
import {findBrowserExecutable} from '../utils/browserExecutable';

export const JD_LIST_URL = 'https://pmsearch.jd.com/?publishSource=9&productLocation=19';
const verification = /验证码|安全验证|滑动验证|完成拼图|访问过于频繁/;

export const fetchAuctionList = async (limit = 3) => {
  const executablePath = await findBrowserExecutable();
  const isDockerLinux = process.platform === 'linux' && process.env.DOCKER === 'true';
  // Docker 使用系统 Chromium 并关闭沙箱；本地开发继续使用 Playwright 默认配置。
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: isDockerLinux ? ['--no-sandbox', '--disable-dev-shm-usage'] : [],
  });
  try {
    const page = await browser.newPage();
    const payloads: unknown[] = [];
    page.on('response', async (response) => {
      if (!['xhr', 'fetch'].includes(response.request().resourceType())) return;
      try { payloads.push(await response.json()); } catch { /* 非 JSON 响应忽略 */ }
    });
    await page.goto(JD_LIST_URL, {waitUntil: 'domcontentloaded', timeout: 30_000});
    await page.waitForTimeout(1800);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1200);
    if (verification.test(await page.locator('body').innerText())) throw new Error('检测到京东安全验证，请人工处理后重试。');
    const candidates = payloads.flatMap(findProductArrays).flat();
    const seen = new Set<string>();
    const products = candidates.map(normalizeJdItem).filter((item): item is NonNullable<ReturnType<typeof normalizeJdItem>> => {
      if (item === null || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    if (!products.length) throw new Error('未从京东列表响应中找到有效拍卖商品数据。');
    return products.slice(0, limit);
  } finally { await browser.close(); }
};
