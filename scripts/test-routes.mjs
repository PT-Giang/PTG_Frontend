import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router';

// Render the real route tree without a DOM. Browser interactions need separate QA.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/app/App.tsx');
  const routes = [
    ['/', 'Tạo bộ học liệu'], ['/login', 'INS'], ['/register', 'INS'],
    ['/forgot-password?email=learner%40example.com', 'learner@example.com'],
    ['/profile', 'INS'], ['/profile/edit', 'INS'], ['/profile/activity', 'INS'],
    ...['study', 'smartStudy', 'studyGuides', 'summaries', 'podcasts', 'test'].map(view => [`/${view}/demo-1`, 'Đang tải bộ học liệu']),
    ...['list', 'flashcards', 'games'].map(mode => [`/memorize/demo-1/${mode}`, 'Đang tải bộ học liệu']),
    ['/memorize/demo-1/invalid', '404'], ['/missing-route', '404'],
  ];
  for (const [route, expected] of routes) {
    const html = await new Promise((resolve, reject) => {
      const output = new PassThrough();
      let content = '';
      output.on('data', chunk => { content += chunk; });
      output.on('end', () => resolve(content));
      output.on('error', reject);
      const stream = renderToPipeableStream(createElement(MemoryRouter, { initialEntries: [route] }, createElement(App)), {
        onAllReady() { stream.pipe(output); }, onShellError: reject, onError: reject,
      });
    });
    assert.ok(html.includes(expected), `Unexpected route content: ${route}`);
    assert.ok(!html.includes('/_next/'), `Next asset remains: ${route}`);
    console.log(`PASS ${route}`);
  }
  console.log(`${routes.length} route render checks passed.`);
} finally { await server.close(); }
