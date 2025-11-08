import { Order, OrderType, OrderStatus } from '../models/order.model';

export class OrderService {
  private vipQueue: Order[] = [];
  private normalQueue: Order[] = [];
  private processingOrders: Order[] = [];
  private completedOrders: Order[] = [];
  private orderCounter: number = 1000;

  createOrder(type: OrderType): Order {
    const order: Order = {
      id: ++this.orderCounter,
      type,
      status: 'PENDING',
      createdAt: new Date()
    };

    if (type === 'VIP') {
      this.vipQueue.push(order);
    } else {
      this.normalQueue.push(order);
    }

    return order;
  }

  getNextPendingOrder(): Order | undefined {
    // VIP orders always have priority
    const order = this.vipQueue.shift() || this.normalQueue.shift();
    return order;
  }

  markOrderAsProcessing(orderId: number, botId: number): Order | undefined {
    // Find order in either queue
    let order = this.vipQueue.find(o => o.id === orderId);
    if (order) {
      this.vipQueue = this.vipQueue.filter(o => o.id !== orderId);
    } else {
      order = this.normalQueue.find(o => o.id === orderId);
      if (order) {
        this.normalQueue = this.normalQueue.filter(o => o.id !== orderId);
      }
    }

    if (order) {
      order.status = 'PROCESSING';
      order.processingStartedAt = new Date();
      order.botId = botId;
      this.processingOrders.push(order);
    }

    return order;
  }

  markOrderAsComplete(orderId: number): Order | undefined {
    const order = this.processingOrders.find(o => o.id === orderId);
    if (order) {
      this.processingOrders = this.processingOrders.filter(o => o.id !== orderId);
      order.status = 'COMPLETE';
      order.completedAt = new Date();
      this.completedOrders.push(order);
    }
    return order;
  }

  returnOrderToPending(orderId: number): Order | undefined {
    const order = this.processingOrders.find(o => o.id === orderId);
    if (order) {
      this.processingOrders = this.processingOrders.filter(o => o.id !== orderId);
      order.status = 'PENDING';
      order.processingStartedAt = undefined;
      order.botId = undefined;

      // Put back in appropriate queue
      if (order.type === 'VIP') {
        this.vipQueue.push(order);
      } else {
        this.normalQueue.push(order);
      }
    }
    return order;
  }

  getPendingOrders(): Order[] {
    return [...this.vipQueue, ...this.normalQueue];
  }

  getProcessingOrders(): Order[] {
    return [...this.processingOrders];
  }

  getCompletedOrders(): Order[] {
    return [...this.completedOrders];
  }

  getAllOrders(): { pending: Order[], processing: Order[], completed: Order[] } {
    return {
      pending: this.getPendingOrders(),
      processing: this.getProcessingOrders(),
      completed: this.getCompletedOrders()
    };
  }

  getPendingOrderCount(): number {
    return this.vipQueue.length + this.normalQueue.length;
  }
}
