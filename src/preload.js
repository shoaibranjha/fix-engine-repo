const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functions to renderer process
contextBridge.exposeInMainWorld('api', {
  // Market data
  subscribeMarketData: (symbol) => ipcRenderer.invoke('subscribe-market-data', symbol),
  unsubscribeMarketData: (symbol) => ipcRenderer.invoke('unsubscribe-market-data', symbol),
  
  // Orders
  submitOrder: (orderData) => ipcRenderer.invoke('submit-order', orderData),
  cancelOrder: (orderId) => ipcRenderer.invoke('cancel-order', orderId),
  getOrders: () => ipcRenderer.invoke('get-orders'),
  
  // Positions
  getPositions: () => ipcRenderer.invoke('get-positions'),
  
  // Reporting
  generateReport: (reportType, params) => ipcRenderer.invoke('generate-report', reportType, params),
  
  // Connection
  connectFix: (connectionDetails) => ipcRenderer.invoke('connect-fix', connectionDetails),
  disconnectFix: () => ipcRenderer.invoke('disconnect-fix'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Listeners
  onMarketDataUpdate: (callback) => {
    ipcRenderer.on('market-data-update', (event, data) => callback(data));
    return () => ipcRenderer.removeListener('market-data-update', callback);
  },
  
  onOrderUpdate: (callback) => {
    ipcRenderer.on('order-update', (event, data) => callback(data));
    return () => ipcRenderer.removeListener('order-update', callback);
  },
  
  onPositionUpdate: (callback) => {
    ipcRenderer.on('position-update', (event, data) => callback(data));
    return () => ipcRenderer.removeListener('position-update', callback);
  },
  
  onConnectionStatus: (callback) => {
    ipcRenderer.on('connection-status', (event, status) => callback(status));
    return () => ipcRenderer.removeListener('connection-status', callback);
  }
});