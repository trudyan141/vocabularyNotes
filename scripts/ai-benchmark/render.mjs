/** Render only repository-authored synthetic worksheets. No provider or network. */
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url);
const dir = new URL('docs/evaluations/t00/', root);
const cases = JSON.parse(await readFile(new URL('cases.json', dir), 'utf8'));
const sha = (data) => createHash('sha256').update(data).digest('hex');
await mkdir(new URL('images/', dir), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1556 }, deviceScaleFactor: 1 });
  await page.route('**/*', (route) => route.abort());
  const images = [];
  for (const item of cases.cases) {
    await page.setContent('<html><body style="margin:0"><canvas width="1100" height="1556"></canvas></body></html>');
    await page.evaluate((item) => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, 1100, 1556);
      ctx.save(); ctx.translate(550, 778);
      ctx.rotate((item.rotate ?? 0) * Math.PI / 180);
      ctx.fillStyle = 'white'; ctx.fillRect(-520, -746, 1040, 1492);
      ctx.fillStyle = '#222'; ctx.font = '26px Arial';
      ctx.fillText(item.id + ' · synthetic worksheet', -450, -670);
      ctx.font = item.style === 'cursive' ? 'italic 48px cursive' : (item.style === 'small' ? '24px Arial' : '48px Arial');
      if (item.style === 'blur') ctx.filter = 'blur(2px)';
      item.lines.forEach((line, i) => ctx.fillText(line, -440, -500 + i * 110));
      ctx.filter = 'none'; ctx.restore();
      if (item.style === 'shadow') {
        const g = ctx.createLinearGradient(0, 0, 1100, 1000);
        g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1100, 1556);
      }
      if (item.style === 'glare') {
        const g = ctx.createRadialGradient(600, 800, 50, 600, 800, 430);
        g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1100, 1556);
      }
    }, item);
    const buffer = await page.locator('canvas').screenshot();
    const name = `images/${item.id}.png`;
    await writeFile(new URL(name, dir), buffer);
    images.push({ caseId: item.id, file: name, sha256: sha(buffer), bytes: buffer.length, width: 1100, height: 1556 });
  }
  await writeFile(new URL('manifest.json', dir), JSON.stringify({
    datasetVersion: cases.datasetVersion, groundTruthReview: 'agent-authored; human review pending',
    rendererSha256: sha(await readFile(new URL(import.meta.url))),
    casesSha256: sha(await readFile(new URL('cases.json', dir))),
    schemaSha256: sha(await readFile(new URL('docs/contracts/analysis.schema.json', root))),
    promptSha256: sha(await readFile(new URL('extraction-prompt.txt', dir))),
    browserVersion: browser.version(), images,
  }, null, 2) + '\n');
  const thumbnails = await Promise.all(images.map(async (entry) => ({ id: entry.caseId,
    data: (await readFile(new URL(entry.file, dir))).toString('base64') })));
  await page.setViewportSize({ width: 1600, height: 3050 });
  await page.setContent('<html><body style="margin:0"><canvas width="1600" height="3050"></canvas></body></html>');
  await page.evaluate(async (entries) => {
    const ctx = document.querySelector('canvas').getContext('2d');
    ctx.fillStyle = '#ddd'; ctx.fillRect(0, 0, 1600, 3050);
    for (let i = 0; i < entries.length; i++) {
      const img = new Image(); img.src = `data:image/png;base64,${entries[i].data}`; await img.decode();
      const x = (i % 4) * 400, y = Math.floor(i / 4) * 610;
      ctx.drawImage(img, x + 10, y + 32, 380, 538);
      ctx.fillStyle = '#111'; ctx.font = 'bold 22px Arial'; ctx.fillText(entries[i].id, x + 12, y + 24);
    }
  }, thumbnails);
  await page.locator('canvas').screenshot({ path: new URL('contact-sheet.png', dir).pathname });
  process.stdout.write(`Rendered ${images.length} synthetic PNGs; manifest and contact sheet written.\n`);
} finally { await browser.close(); }
