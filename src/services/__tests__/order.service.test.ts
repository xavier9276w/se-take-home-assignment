import { OrderService } from '../order.service';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('createOrder', () => {
    it('should create a normal order', () => {
      const order = orderService.createOrder('NORMAL');
      expect(order).toBeDefined();
      expect(order.type).toBe('NORMAL');
      expect(order.status).toBe('PENDING');
      expect(order.id).toBeGreaterThan(1000);
    });

    it('should create a VIP order', () => {
      const order = orderService.createOrder('VIP');
      expect(order).toBeDefined();
      expect(order.type).toBe('VIP');
      expect(order.status).toBe('PENDING');
    });

    it('should generate unique order IDs', () => {
      const order1 = orderService.createOrder('NORMAL');
      const order2 = orderService.createOrder('NORMAL');
      expect(order1.id).not.toBe(order2.id);
      expect(order2.id).toBe(order1.id + 1);
    });
  });

  describe('getNextPendingOrder', () => {
    it('should return VIP orders before normal orders', () => {
      const normalOrder = orderService.createOrder('NORMAL');
      const vipOrder = orderService.createOrder('VIP');

      const nextOrder = orderService.getNextPendingOrder();
      expect(nextOrder?.id).toBe(vipOrder.id);
    });

    it('should return normal order when no VIP orders exist', () => {
      const normalOrder = orderService.createOrder('NORMAL');

      const nextOrder = orderService.getNextPendingOrder();
      expect(nextOrder?.id).toBe(normalOrder.id);
    });

    it('should return undefined when no orders exist', () => {
      const nextOrder = orderService.getNextPendingOrder();
      expect(nextOrder).toBeUndefined();
    });

    it('should maintain VIP priority with multiple orders', () => {
      orderService.createOrder('NORMAL');
      orderService.createOrder('VIP');
      orderService.createOrder('NORMAL');
      orderService.createOrder('VIP');

      const order1 = orderService.getNextPendingOrder();
      const order2 = orderService.getNextPendingOrder();
      const order3 = orderService.getNextPendingOrder();
      const order4 = orderService.getNextPendingOrder();

      expect(order1?.type).toBe('VIP');
      expect(order2?.type).toBe('VIP');
      expect(order3?.type).toBe('NORMAL');
      expect(order4?.type).toBe('NORMAL');
    });
  });

  describe('markOrderAsProcessing', () => {
    it('should mark order as processing', () => {
      const order = orderService.createOrder('NORMAL');
      const updatedOrder = orderService.markOrderAsProcessing(order.id, 1);

      expect(updatedOrder?.status).toBe('PROCESSING');
      expect(updatedOrder?.botId).toBe(1);
      expect(updatedOrder?.processingStartedAt).toBeDefined();
    });

    it('should remove order from pending queue', () => {
      const order = orderService.createOrder('NORMAL');
      orderService.markOrderAsProcessing(order.id, 1);

      const pendingOrders = orderService.getPendingOrders();
      expect(pendingOrders).toHaveLength(0);
    });
  });

  describe('markOrderAsComplete', () => {
    it('should mark order as complete', () => {
      const order = orderService.createOrder('NORMAL');
      orderService.markOrderAsProcessing(order.id, 1);
      const completedOrder = orderService.markOrderAsComplete(order.id);

      expect(completedOrder?.status).toBe('COMPLETE');
      expect(completedOrder?.completedAt).toBeDefined();
    });
  });

  describe('returnOrderToPending', () => {
    it('should return processing order back to pending', () => {
      const order = orderService.createOrder('NORMAL');
      orderService.markOrderAsProcessing(order.id, 1);
      const returnedOrder = orderService.returnOrderToPending(order.id);

      expect(returnedOrder?.status).toBe('PENDING');
      expect(returnedOrder?.botId).toBeUndefined();
      expect(returnedOrder?.processingStartedAt).toBeUndefined();

      const pendingOrders = orderService.getPendingOrders();
      expect(pendingOrders).toHaveLength(1);
    });
  });
});
