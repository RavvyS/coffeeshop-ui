// src/mocks/server.js
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Mock menu data
const mockMenu = {
  categories: ['coffee', 'non-coffee', 'food', 'sri-lankan-coffee'],
  items: [
    {
      id: '1',
      name: 'Cappuccino',
      price: 4.50,
      category: 'coffee',
      description: 'Classic Italian coffee with steamed milk foam',
      isHot: true,
      availability: { isAvailable: true, estimatedTime: 5 }
    },
    {
      id: '2',
      name: 'Iced Latte',
      price: 5.00,
      category: 'coffee',
      description: 'Espresso with cold milk and ice',
      isHot: false,
      availability: { isAvailable: true, estimatedTime: 3 }
    },
    {
      id: '3',
      name: 'Green Tea',
      price: 3.50,
      category: 'non-coffee',
      description: 'Premium Japanese green tea',
      isHot: true,
      availability: { isAvailable: true, estimatedTime: 2 }
    }
  ]
};

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/menu', (req, res) => {
  res.json(mockMenu);
});

app.post('/api/orders', (req, res) => {
  res.json({
    order_id: `ORDER_${Date.now()}`,
    total: 10.50,
    status: 'pending'
  });
});

app.post('/api/project-knowledge/search', (req, res) => {
  const { query } = req.body;
  res.json({
    response: `I found information about: ${query}`,
    confidence: 0.85,
    sources: ['menu', 'knowledge_base']
  });
});

app.post('/api/emotional-support/analyze', (req, res) => {
  res.json({
    emotion: 'happy',
    confidence: 0.9,
    recommendations: ['Cappuccino', 'Chocolate Croissant'],
    affirmation: 'You deserve this moment of joy!'
  });
});

app.get('/api/queue/status', (req, res) => {
  res.json({
    position: 3,
    estimatedWaitTime: 10,
    totalInQueue: 8,
    orderType: 'pickup',
    status: 'waiting'
  });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Mock API server running at http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const sessionId = req.url?.split('/').pop();
  console.log(`✅ WebSocket connected: ${sessionId}`);

  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connected',
    data: { sessionId },
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      // Echo back with AI response
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'message',
          data: {
            id: Date.now().toString(),
            role: 'assistant',
            content: `I understand you said: "${data.data.content}". How can I help you with your coffee order today?`,
            type: 'text'
          },
          timestamp: new Date().toISOString()
        }));
      }, 1000);
    } catch (error) {
      console.error('Message parse error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 WebSocket disconnected: ${sessionId}`);
  });
});