const { app, Menu, dialog } = require('electron');
const { setupLogger } = require('./utils/logger');

const logger = setupLogger('menu');

function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Connect',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'connect');
            }
          }
        },
        {
          label: 'Disconnect',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'disconnect');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'open-settings');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Market Data',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'view-market-data');
            }
          }
        },
        {
          label: 'Order Book',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'view-order-book');
            }
          }
        },
        {
          label: 'Positions',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'view-positions');
            }
          }
        },
        {
          label: 'Reports',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'view-reports');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload();
            }
          }
        }
      ]
    },
    {
      label: 'Trading',
      submenu: [
        {
          label: 'New Order',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'new-order');
            }
          }
        },
        {
          label: 'Cancel Order',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'cancel-order');
            }
          }
        }
      ]
    },
    {
      label: 'Reports',
      submenu: [
        {
          label: 'Trade Report',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'trade-report');
            }
          }
        },
        {
          label: 'P&L Report',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'pnl-report');
            }
          }
        },
        {
          label: 'Position Report',
          click: async (menuItem, browserWindow) => {
            if (browserWindow) {
              browserWindow.webContents.send('menu-action', 'position-report');
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/yourusername/fix-trading-platform/wiki');
          }
        },
        {
          label: 'About',
          click: async (menuItem, browserWindow) => {
            dialog.showMessageBox(browserWindow, {
              title: 'About FIX Trading Platform',
              message: 'FIX Trading Platform v1.0.0\nA comprehensive trading platform using FIX protocol',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

module.exports = { createAppMenu };