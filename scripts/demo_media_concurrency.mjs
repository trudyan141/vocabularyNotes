// Planning demo only: synthetic delays, no network, keys, OCR, or app integration.
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

async function runScenario(concurrency) {
  const savedText = { word: 'apple', meaningVi: 'quả táo', contentVersion: 1 };
  const originalText = structuredClone(savedText);
  let active = 0;
  let peak = 0;
  let next = 0;
  const calls = new Map();
  const inFlight = new Map();
  const inputs = ['apple:noun:fruit', 'apple:noun:fruit', 'book:noun:object',
    'book:verb:reserve', 'bank:noun:finance', 'bank:noun:river', 'missing:noun:demo'];
  const uniqueKeys = [...new Set(inputs)];
  const queue = uniqueKeys.map(key => ({ key, resolve: null, reject: null }));
  for (const job of queue) {
    inFlight.set(job.key, new Promise((resolve, reject) => {
      job.resolve = resolve;
      job.reject = reject;
    }));
  }
  // Attach handlers before starting the queue, including failures.
  const settled = Promise.allSettled(inputs.map(key => inFlight.get(key)));
  const started = performance.now();
  async function worker() {
    while (next < queue.length) {
      const job = queue[next++];
      active++;
      peak = Math.max(peak, active);
      calls.set(job.key, (calls.get(job.key) ?? 0) + 1);
      try {
        await delay(25);
        if (job.key === 'missing:noun:demo') throw new Error('simulated media search failure');
        job.resolve({ senseKey: job.key, status: 'candidates' });
      } catch (error) {
        job.reject(error);
      } finally {
        active--;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  const results = await settled;
  const elapsedMs = Math.round(performance.now() - started);
  assert.ok(peak <= concurrency);
  assert.equal(active, 0);
  assert.equal(calls.get('apple:noun:fruit'), 1);
  assert.equal(calls.size, 6);
  assert.equal(results[0].value, results[1].value);
  assert.notEqual(results[2].value.senseKey, results[3].value.senseKey);
  assert.notEqual(results[4].value.senseKey, results[5].value.senseKey);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 6);
  assert.equal(results.filter(r => r.status === 'rejected').length, 1);
  assert.deepEqual(savedText, originalText);
  return { concurrency, peak, uniqueSimulatedCalls: calls.size, elapsedMs,
    fulfilled: 6, failed: 1, textLibraryPreserved: true };
}

const sequential = await runScenario(1);
const boundedParallel = await runScenario(2);
console.log(JSON.stringify({ demo: 'Words for Kids synthetic media queue',
  sequential, boundedParallel,
  verified: ['bounded concurrency', 'in-flight dedup', 'sense separation', 'partial failure'],
  limitation: 'Synthetic timers only; no real AI/media latency, quota, cancellation, distributed limiter, or app tested.'
}, null, 2));
