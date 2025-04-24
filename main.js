// main.js
// author: Aryan

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { URL } = require('url');

const ALLOWED_DOMAINS = [
  'leetcode.com',
  'challenges.cloudflare.com',

  // Google OAuth & related (chatGPT generated, might not work for everyone)
  'google.com',
  'google.nl',           // covers accounts.google.nl
  'youtube.com',         // covers accounts.youtube.com
  'googleusercontent.com',
  'gstatic.com',         // static assets
  'oauth2.googleapis.com',
  'www.googleapis.com',
  'accounts.google.com',
  'accounts.youtube.com',
  'fonts.googleapis.com', 
  'fonts.gstatic.com'
];

function isAllowed(urlString) {
  try {
    const host = new URL(urlString).host;
    return ALLOWED_DOMAINS.some(domain => host.endsWith(domain));
  } catch {
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    title: 'LeetCode',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      partition: 'persist:leetcode-session'
    }
  });

  // allow Google OAuth pop-ups, only for allowed domains
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowed(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          parent: win,
          // you can drop modal: true, TOGGLE normal window
          modal: true,
          webPreferences: win.webPreferences
        }
      };
    }
    return { action: 'deny' };
  });

  // block all navigations except the whitelist
  win.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    (details, callback) => {
      callback({ cancel: !isAllowed(details.url) });
    }
  );

  // disable DevTools + right-click
  win.webContents.on('before-input-event', (e, i) => {
    if (i.control && i.shift && i.key.toLowerCase() === 'i') e.preventDefault();
  });
  win.webContents.on('context-menu', e => e.preventDefault());

  win.loadURL('https://leetcode.com');
}

app.whenReady().then(createWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
