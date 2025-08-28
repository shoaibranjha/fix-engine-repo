javascript
const { v4: uuidv4 } = require('uuid');
const { setupLogger } = require('../utils/logger');
const { EventEmitter } = require('events');

const logger = setupLogger('order-service');
const orderEvents = new EventEmitter();

class OrderService {
  constructor(fixEngine) {
    this.fixEngine = fixEngine;
    this.orders = new Map();
    this.executions = new Map();
    this.mockMode = false;
    
    // Listen for execution reports from the FIX engine
    if (fixEngine) {
      fixEngine.on('execution-report', (data) => {
        this.processExecutionReport(data);
      });
      
      fixEngine.on('order-cancel-reject', (data) => {
        this.processOrderCancelReject(data);
      });
    }
  }

  async initialize() {
    logger.info('Order service initialized');
    return this;
  }

  async submitOrder(orderData) {
    try {
      // Generate a client order ID if not provided
      const clOrdID = orderData.clOrdID || uuidv4();
      
      // Create the order object
      const order = {
        clOrdID,
        symbol: orderData.symbol,
        side: orderData.side,
        orderType: orderData.orderType,
        quantity: orderData.quantity,
        price: orderData.price,
        timeInForce: orderData.timeInForce || '0', // Day order by default
        status: 'PENDING_NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
        executions: []
      };
      
      // Store the order
      this.orders.set(clOrdID, order);
      
      // If connected to FIX, send the order
      if (this.fixEngine && this.fixEngine.getConnectionStatus().connected && !this.mockMode) {
        await this.fixEngine.sendOrder({
          clOrdID,
          symbol: orderData.symbol,
          side: orderData.side,
          quantity: orderData.quantity,
          orderType: orderData.orderType,
          price: orderData.price,
          timeInForce: orderData.timeInForce
        });
        
        logger.info(