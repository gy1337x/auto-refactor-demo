// Main entry point - simple HTTP server
import * as http from 'http';
import { register, login, getProfile, updateProfile } from './user';
import { createTask, getTask, listTasks, updateTask } from './task';
import { config } from './config';

const PORT = config.port;

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // Auth routes
    if (url.pathname === '/api/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const result = register(body.name, body.email, body.password);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const result = login(body.email, body.password);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // Profile routes
    if (url.pathname === '/api/profile' && req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      // FIXME: should verify token first
      const userId = 1; // hardcoded
      const result = getProfile(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // Task routes
    if (url.pathname === '/api/tasks' && req.method === 'GET') {
      const status = url.searchParams.get('status') || undefined;
      const result = listTasks(status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (url.pathname === '/api/tasks' && req.method === 'POST') {
      const body = await parseBody(req);
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const result = createTask(body.title, body.description, token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (e) {
    console.error("Server error:", e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
