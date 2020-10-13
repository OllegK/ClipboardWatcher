const electron = require('electron')
const path = require('path')

const { app, Tray, Menu, clipboard } = electron

const STACK_SIZE = 5;
const ITEM_MAX_LENGTH = 20;

function addToStack(item, stack) {
    return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, STACK_SIZE - 1) : stack)
}

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + '...' : item
}

function formatMenuTemplateForStack(clipboard, stack) {
    return stack.map ((item, i) => {return {
        label: `Copy: ${formatItem(item)}`,
        click: _ => clipboard.writeText(item),
    }})
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

app.on('ready', _ => {
    let stack = []
    const tray = new Tray(path.join('src', 'icon32.png'))
    tray.setContextMenu (Menu.buildFromTemplate([{ label: '<Empty>', enabled: false }]))

    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack)
        tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)))
    })
})
