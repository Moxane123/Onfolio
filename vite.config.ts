import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function solanaRpcProxyPlugin(): Plugin {
  return {
    name: 'solana-rpc-proxy',
    configureServer(server) {
      server.middlewares.use('/api/health', (_req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok', service: 'onfolio-protocol' }));
      });

      server.middlewares.use('/api/solana-rpc', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
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
                body,
              });

              const responseData = await solanaRes.text();
              res.statusCode = solanaRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(responseData);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'RPC Proxy Gateway Error';
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: { code: -32000, message },
                })
              );
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), solanaRpcProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
