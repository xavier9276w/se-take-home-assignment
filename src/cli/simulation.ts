import { OrderService } from '../services/order.service';
import { BotService } from '../services/bot.service';
import { Logger } from '../utils/logger';
import * as path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runSimulation(): Promise<void> {
  const outputPath = path.join(process.cwd(), 'scripts', 'result.txt');
  const logger = new Logger(outputPath);

  const orderService = new OrderService();
  const botService = new BotService(orderService);

  // Set up event listener for bot events
  botService.setEventCallback((event: string, data: any) => {
    switch (event) {
      case 'bot:created':
        logger.log(`Bot #${data.bot.id} created - Status: ACTIVE`);
        break;
      case 'bot:removed':
        logger.log(`Bot #${data.bot.id} destroyed while ${data.bot.status}`);
        break;
      case 'bot:idle':
        logger.log(`Bot #${data.bot.id} is now IDLE - No pending orders`);
        break;
      case 'order:processing':
        logger.log(`Bot #${data.bot.id} picked up ${data.order.type} Order #${data.order.id} - Status: PROCESSING`);
        break;
      case 'order:completed':
        logger.log(`Bot #${data.bot.id} completed ${data.order.type} Order #${data.order.id} - Status: COMPLETE (Processing time: 10s)`);
        break;
      case 'order:returned':
        logger.log(`Order #${data.orderId} returned to PENDING (Bot #${data.botId} was removed)`);
        break;
    }
  });

  logger.log("McDonald's Order Management System - Simulation Results");
  logger.log('');
  logger.log(`System initialized with ${botService.getBotCount()} bots`);

  // Scenario: Create orders and bots to demonstrate all requirements

  // 1. Create normal order
  await sleep(1000);
  const order1 = orderService.createOrder('NORMAL');
  logger.log(`Created Normal Order #${order1.id} - Status: PENDING`);

  // 2. Create VIP order (should go before normal order)
  await sleep(1000);
  const order2 = orderService.createOrder('VIP');
  logger.log(`Created VIP Order #${order2.id} - Status: PENDING`);

  // 3. Create another normal order
  await sleep(1000);
  const order3 = orderService.createOrder('NORMAL');
  logger.log(`Created Normal Order #${order3.id} - Status: PENDING`);

  // 4. Add first bot (should process VIP order first)
  await sleep(1000);
  botService.addBot();

  // 5. Add second bot (should process first normal order)
  await sleep(1000);
  botService.addBot();

  // Wait for first two orders to complete (10s + buffer)
  await sleep(10500);

  // 6. Bot should automatically pick up the third order
  // Wait a bit to see it pick up
  await sleep(500);

  // 7. Create a new VIP order while bot is processing
  const order4 = orderService.createOrder('VIP');
  logger.log(`Created VIP Order #${order4.id} - Status: PENDING`);

  // 8. Idle bot should pick it up immediately
  await sleep(500);

  // Wait for all orders to complete
  await sleep(10000);

  // 9. Remove one bot while idle
  await sleep(1000);
  botService.removeBot();

  await sleep(500);

  // Log final status
  logger.logFinalStatus(orderService, botService);

  console.log('\nSimulation completed. Results written to scripts/result.txt');
}
