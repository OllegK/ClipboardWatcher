const electron = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const { template } = require('./traymenutemplate')
const { autoLaunch } = require('./autolaunch');
autoLaunch();

// const autoUpdater = require('./autoupdater');
const {
  app, Tray, Menu, clipboard,
} = electron;

if (!app.isPackaged) {
  require('electron-reload')(__dirname, {
    electron: path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd'),
  });  
}

// Log a message
log.info('Application started...');

const STACK_SIZE = 20;
const ITEM_MAX_LENGTH = 20;

function addToStack(item, stack) {
  return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, STACK_SIZE - 1) : stack);
}

function formatItem(item) {
  return item && item.length > ITEM_MAX_LENGTH ? `${item.substr(0, ITEM_MAX_LENGTH)}...` : item;
}

function formatMenuTemplateForStack(clipboard, stack) {
  const arr = stack.map((item) => ({
    label: `Copy: ${formatItem(item)}`,
    click: (_) => clipboard.writeText(item),
  }));
  return template.concat(arr);
}

function checkClipboardForChange(clipboard, onChange) {
  let cache = clipboard.readText();
  let latest;
  setInterval((_) => {
    latest = clipboard.readText();
    if (latest !== cache) {
      cache = latest;
      onChange(cache);
    }
  }, 1000);
}

function setContextMenu(tray, stack) {
  tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)));
}

app.on('ready', (_) => {
  // autoUpdater.init();
  autoUpdater.checkForUpdatesAndNotify();
  console.log('started...');

  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    console.log('Second instance.........');
    app.quit();
  }
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('inside second instance..........', event, commandLine, workingDirectory);
  });

  const tray = new Tray(path.join(__dirname, 'img/icon16.png'));
  let stack = clipboard.readText() ? [clipboard.readText()] : [];
  setContextMenu(tray, stack);

  checkClipboardForChange(clipboard, (text) => {
    stack = addToStack(text, stack);
    setContextMenu(tray, stack);
  });
});
