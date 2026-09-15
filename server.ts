/**
 * Onfolio — Full-Stack Server Entry Point
 * Proxies Solana JSON-RPC requests server-to-server to avoid browser CORS/Origin 403 restrictions.
 * Serves Vite middleware in development and static production build in production.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'onfolio-protocol' });
  });

  // Server-side Solana RPC Proxy
  // Server-to-server calls do not send browser Origin headers, avoiding Solana public RPC 403 blocks
  app.post('/api/solana-rpc', async (req, res) => {
    try {
      const targetEndpoint =
        (req.headers['x-solana-endpoint'] as string) ||
        process.env.VITE_SOLANA_RPC_ENDPOINT ||
        'https://api.mainnet-beta.solana.com';

      const solanaRes = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const responseData = await solanaRes.text();
      res.status(solanaRes.status).type('application/json').send(responseData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'RPC Gateway Error';
      res.status(502).json({
        error: { code: -32000, message },
      });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Onfolio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
