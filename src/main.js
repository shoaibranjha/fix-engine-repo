const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { initializeFixEngine } = require('./server/fix-engine');
const { setupMarketDataService } = require('./server/market-data-service');
const { setupOrderService } = require('./server/order-service');
const { setupPositionService } = require('./server/position-service');
const { setupReportingService } = require('./server/reporting-service');
const { setupLogger } = require('./utils/logger');
const { createAppMenu } = require('./menu');

// Initialize store for app settings
const store = new Store();
let mainWindow;

// Initialize logger
const logger = setupLogger('main');

// Initialize services
let fixEngine;
let marketDataService;
let orderService;
let positionService;
let reportingService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Set application menu
  Menu.setApplicationMenu(createAppMenu());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeServices() {
  try {
    // Initialize FIX engine
    fixEngine = await initializeFixEngine();
    logger.info('FIX engine initialized');

    // Initialize market data service
    marketDataService = await setupMarketDataService(fixEngine);
    logger.info('Market data service initialized');

    // Initialize order service
    orderService = await setupOrderService(fixEngine);
    logger.info('Order service initialized');

    // Initialize position service
    positionService = await setupPositionService();
    logger.info('Position service initialized');

    // Initialize reporting service
    reportingService = await setupReportingService();
    logger.info('Reporting service initialized');

    // Setup IPC handlers for communication with renderer
    setupIpcHandlers();
    logger.info('IPC handlers set up');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
  }
}

function setupIpcHandlers() {
  // Market data handlers
  ipcMain.handle('subscribe-market-data', async (event, symbol) => {
    try {
      return await marketDataService.subscribeMarketData(symbol);
    } catch (error) {
      logger.error('Error subscribing to market data:', error);
      throw error;
    }
  });

  ipcMain.handle('unsubscribe-market-data', async (event, symbol) => {
    try {
      return await marketDataService.unsubscribeMarketData(symbol);
    } catch (error) {
      logger.error('Error unsubscribing from market data:', error);
      throw error;
    }
  });

  // Order handlers
  ipcMain.handle('submit-order', async (event, orderData) => {
    try {
      const result = await orderService.submitOrder(orderData);
      // Update positions when order is submitted
      await positionService.updatePosition(orderData);
      return result;
    } catch (error) {
      logger.error('Error submitting order:', error);
      throw error;
    }
  });

  ipcMain.handle('cancel-order', async (event, orderId) => {
    try {
      return await orderService.cancelOrder(orderId);
    } catch (error) {
      logger.error('Error canceling order:', error);
      throw error;
    }
  });

  ipcMain.handle('get-orders', async () => {
    try {
      return await orderService.getOrders();
    } catch (error) {
      logger.error('Error getting orders:', error);
      throw error;
    }
  });

  // Position handlers
  ipcMain.handle('get-positions', async () => {
    try {
      return await positionService.getPositions();
    } catch (error) {
      logger.error('Error getting positions:', error);
      throw error;
    }
  });

  // Reporting handlers
  ipcMain.handle('generate-report', async (event, reportType, params) => {
    try {
      return await reportingService.generateReport(reportType, params);
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  });

  // Connection handlers
  ipcMain.handle('connect-fix', async (event, connectionDetails) => {
    try {
      return await fixEngine.connect(connectionDetails);
    } catch (error) {
      logger.error('Error connecting to FIX:', error);
      throw error;
    }
  });

  ipcMain.handle('disconnect-fix', async () => {
    try {
      return await fixEngine.disconnect();
    } catch (error) {
      logger.error('Error disconnecting from FIX:', error);
      throw error;
    }
  });

  // Settings handlers
  ipcMain.handle('get-settings', () => {
    return store.get('settings') || {};
  });

  ipcMain.handle('save-settings', (event, settings) => {
    store.set('settings', settings);
    return true;
  });
}

app.whenReady().then(() => {
  createWindow();
  initializeServices();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Cleanup before quitting
  if (fixEngine) {
    await fixEngine.disconnect();
  }
  logger.info('Application shutting down');
});