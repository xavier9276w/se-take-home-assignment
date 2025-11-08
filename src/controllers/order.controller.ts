import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { BotService } from '../services/bot.service';

export class OrderController {
  constructor(
    private orderService: OrderService,
    private botService: BotService
  ) {}

  createNormalOrder = (req: Request, res: Response): void => {
    try {
      const order = this.orderService.createOrder('NORMAL');
      res.status(201).json({
        success: true,
        message: 'Normal order created',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  createVipOrder = (req: Request, res: Response): void => {
    try {
      const order = this.orderService.createOrder('VIP');
      res.status(201).json({
        success: true,
        message: 'VIP order created',
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getAllOrders = (req: Request, res: Response): void => {
    try {
      const orders = this.orderService.getAllOrders();
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  addBot = (req: Request, res: Response): void => {
    try {
      const bot = this.botService.addBot();
      res.status(201).json({
        success: true,
        message: 'Bot added',
        data: bot
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add bot',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  removeBot = (req: Request, res: Response): void => {
    try {
      const bot = this.botService.removeBot();
      if (bot) {
        res.status(200).json({
          success: true,
          message: 'Bot removed',
          data: bot
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No bots available to remove'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove bot',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getAllBots = (req: Request, res: Response): void => {
    try {
      const bots = this.botService.getBots();
      res.status(200).json({
        success: true,
        data: {
          bots,
          count: bots.length,
          active: this.botService.getActiveBotCount(),
          idle: this.botService.getIdleBotCount()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve bots',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getStatus = (req: Request, res: Response): void => {
    try {
      const orders = this.orderService.getAllOrders();
      const bots = this.botService.getBots();

      res.status(200).json({
        success: true,
        data: {
          orders: {
            pending: orders.pending.length,
            processing: orders.processing.length,
            completed: orders.completed.length
          },
          bots: {
            total: bots.length,
            active: this.botService.getActiveBotCount(),
            idle: this.botService.getIdleBotCount()
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
