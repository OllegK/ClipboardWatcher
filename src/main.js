const electron = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const { app, Tray, Menu, clipboard } = electron

const STACK_SIZE = 5;
const ITEM_MAX_LENGTH = 20;
const menuItems = [{ 
    label: `Exit ${app.getVersion()}`, 
    click: _ => app.quit(),  
}, {
    type: 'separator',
}]

function addToStack(item, stack) {
    return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, STACK_SIZE - 1) : stack)
}

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + '...' : item
}

function formatMenuTemplateForStack(clipboard, stack) {
    const arr = stack.map ((item) => { return {
        label: `Copy: ${formatItem(item)}`,
        click: _ => clipboard.writeText(item),
    }})
    return menuItems.concat(arr)
}

function checkClipboardForChange(clipboard, onChange) {
    let cache = clipboard.readText();
    let latest
    setInterval(_ => {
        latest = clipboard.readText()
        if (latest !== cache) {
            cache = latest
            onChange(cache)
        }
    }, 1000)
}

function setContextMenu (tray, stack) {
    tray.setContextMenu (Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)))
}

app.on('ready', _ => {
    autoUpdater.checkForUpdatesAndNotify()
                                      
    const tray = new Tray(path.join(__dirname, 'icon16.png'))
    let stack = clipboard.readText() ? [clipboard.readText()] : []
    setContextMenu(tray, stack)

    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack)
        setContextMenu(tray, stack)
    })
})
