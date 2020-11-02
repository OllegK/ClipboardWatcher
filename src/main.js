const electron = require('electron');
const path = require('path');
const log = require('electron-log');
const Store = require('electron-store');

const updater = require('./updater');
const { getTemplate } = require('./traymenutemplate');

const {
  app, Tray, Menu, clipboard,
} = electron;

const store = new Store();

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
  return getTemplate(arr);
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
  formatMenuTemplateForStack(clipboard, stack).then((template) => {
    tray.setContextMenu(Menu.buildFromTemplate(template));
  });
  // tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)));
}

app.on('ready', () => {
  log.info('app ready start...');

  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    log.info('Quitting as there is not lock');
    app.quit();
  }
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    log.info('inside second instance..........', event, commandLine, workingDirectory);
  });

  setTimeout(updater, 3000);

  const tray = new Tray(path.join(__dirname, 'img/icon16.png'));
  tray.setToolTip(app.name);

  // let stack = clipboard.readText() ? [clipboard.readText()] : [];
  // TODO: keep it, reading from clipboard and remove duplicates
  let stack = store.get('items') || [];

  setContextMenu(tray, stack);

  checkClipboardForChange(clipboard, (text) => {
    stack = addToStack(text, stack);
    store.set('items', stack);
    setContextMenu(tray, stack);
  });
});
