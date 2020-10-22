const electron = require('electron');

const { app } = electron;

const template = [{
  label: `Exit ${app.getVersion()}`,
  click: () => app.quit(),
}, {
  type: 'separator',
}];

exports.template = template;
