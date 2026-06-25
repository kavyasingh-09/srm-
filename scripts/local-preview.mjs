import { createServer } from 'vite';

const server = await createServer({
  configFile: 'vite.config.js',
});

await server.listen();
server.printUrls();

