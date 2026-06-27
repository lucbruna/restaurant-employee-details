import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
// Platforms like Render set HOSTNAME to a container identifier, not a bindable host.
const hostname = dev
  ? process.env.HOST || process.env.HOSTNAME || '0.0.0.0'
  : process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const displayHost = hostname === '0.0.0.0' ? 'localhost' : hostname;
const allowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || process.env.APP_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const logInDev = (...args: Parameters<typeof console.log>) => {
  if (dev) {
    console.log(...args);
  }
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(
    server,
    allowedOrigins.length
      ? {
          cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
          },
        }
      : undefined
  );

  io.on('connection', (socket) => {
    logInDev(`Socket connected: ${socket.id}`);

    socket.on('kitchen:join', ({ outletId }) => {
      socket.join(`kitchen:${outletId}`);
      logInDev(`Socket ${socket.id} joined kitchen:${outletId}`);
    });

    socket.on('pos:join', ({ outletId }) => {
      socket.join(`outlet:${outletId}`);
      logInDev(`Socket ${socket.id} joined outlet:${outletId}`);
    });

    socket.on('table:select', ({ tableId }) => {
      socket.join(`table:${tableId}`);
      logInDev(`Socket ${socket.id} selected table:${tableId}`);
    });

    socket.on('kot:markStatus', ({ kotId, status, outletId }) => {
      io.to(`kitchen:${outletId}`).to(`outlet:${outletId}`).emit('kot:updated', { kotId, status, updatedAt: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      logInDev(`Socket disconnected: ${socket.id}`);
    });
  });

  // Make io accessible to API routes if needed (e.g., via global object)
  (globalThis as typeof globalThis & { io?: Server }).io = io;

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${displayHost}:${port}`);
  });
});
