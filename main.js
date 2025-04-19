const { app, BrowserWindow } = require('electron');
const path = require('path');

const ALLOWED_DOMAINS = ['leetcode.com', 'challenges.cloudflare.com'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      partition: 'persist:leetcode-session'
    }
  });

  // block  navigation  outside leetcode but allow cloudflare with ALLOWED DOMAINS
  win.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    (details, callback) => {
      const url = new URL(details.url);
      if (ALLOWED_DOMAINS.some(domain => url.host.endsWith(domain))) {
        callback({ cancel: false });
      } else {
        callback({ cancel: true });
      }
    }
  );

  // Disable DevTools shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      event.preventDefault();
    }
  });
  // Disable right-click context menu
  win.webContents.on('context-menu', (e) => e.preventDefault());

  win.loadURL('https://leetcode.com');
}

app.whenReady().then(createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
