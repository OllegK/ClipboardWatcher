const electron = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const { template } = require('./traymenutemplate');

const { autoLaunch } = require('./autolaunch');

autoLaunch();

const {
  app, Tray, Menu, clipboard,
} = electron;

if (!app.isPackaged) {
  require('electron-reload')(__dirname, { // eslint-disable-line
    electron: path.join(process.cwd(), 'node_modules', '.bin', 'electron.cmd'),
  });
}

log.info('Application started...');

const STACK_SIZE = 20;
const ITEM_MAX_LENGTH = 20;

function addToStack(item, stack) {
  return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, STACK_SIZE - 1) : stack);
}

function formatItem(item) {
  return item && item.length > ITEM_MAX_LENGTH ? `${item.substr(0, ITEM_MAX_LENGTH)}...` : item;
}

function formatMenuTemplateForStack(clip, stack) {
  const arr = stack.map((item) => ({
    label: `Copy: ${formatItem(item)}`,
    click: () => clip.writeText(item),
  }));
  return template.concat(arr);
}

function checkClipboardForChange(clip, onChange) {
  let cache = clip.readText();
  let latest;
  setInterval(() => {
    latest = clip.readText();
    if (latest && latest !== cache) {
      cache = latest;
      onChange(cache);
    }
  }, 1000);
}

function setContextMenu(tray, stack) {
  tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)));
}

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();

  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  }
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    log.info('inside second instance..........', event, commandLine, workingDirectory);
  });

  const tray = new Tray(path.join(__dirname, 'img/icon16.png'));
  let stack = clipboard.readText() ? [clipboard.readText()] : [];
  setContextMenu(tray, stack);

  checkClipboardForChange(clipboard, (text) => {
    stack = addToStack(text, stack);
    setContextMenu(tray, stack);
  });
});
