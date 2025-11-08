import express, { Application } from 'express';
import { OrderService } from './services/order.service';
import { BotService } from './services/bot.service';
import { OrderController } from './controllers/order.controller';

export function createServer(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize services
  const orderService = new OrderService();
  const botService = new BotService(orderService);
  const controller = new OrderController(orderService, botService);

  // Routes
  app.post('/orders/normal', controller.createNormalOrder);
  app.post('/orders/vip', controller.createVipOrder);
  app.get('/orders', controller.getAllOrders);

  app.post('/bots', controller.addBot);
  app.delete('/bots', controller.removeBot);
  app.get('/bots', controller.getAllBots);

  app.get('/status', controller.getStatus);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Root endpoint with API documentation
  app.get('/', (req, res) => {
    res.status(200).json({
      message: "McDonald's Order Management System API",
      endpoints: {
        orders: {
          'POST /orders/normal': 'Create a new normal order',
          'POST /orders/vip': 'Create a new VIP order',
          'GET /orders': 'Get all orders grouped by status'
        },
        bots: {
          'POST /bots': 'Add a new bot',
          'DELETE /bots': 'Remove the newest bot',
          'GET /bots': 'Get all bots and their status'
        },
        status: {
          'GET /status': 'Get system status summary',
          'GET /health': 'Health check endpoint'
        }
      }
    });
  });

  return app;
}

export function startServer(port: number = 3000): void {
  const app = createServer();

  app.listen(port, () => {
    console.log(`\n🍔 McDonald's Order Management System`);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/`);
    console.log(`\n📝 Example commands:`);
    console.log(`   curl -X POST http://localhost:${port}/orders/normal`);
    console.log(`   curl -X POST http://localhost:${port}/orders/vip`);
    console.log(`   curl -X POST http://localhost:${port}/bots`);
    console.log(`   curl -X DELETE http://localhost:${port}/bots`);
    console.log(`   curl http://localhost:${port}/status\n`);
  });
}
