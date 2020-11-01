const { app } = require('electron');

const { autoLauncherStatus, toggleAutoLauncher } = require('./autolaunch');

const template = [{
  label: `Exit ${app.getVersion()}`,
  // click: () => app.quit(),
  role: 'quit',
}, {
  type: 'separator',
}];

exports.getTemplate = (arr) => new Promise((resolve) => {
  const ret = template.map((el) => el);
  autoLauncherStatus().then((status) => {
    ret.push({
      label: 'Auto-Launch',
      type: 'checkbox',
      checked: status,
      click: () => toggleAutoLauncher(),
    });
    ret.push({
      type: 'separator',
    });
    resolve(ret.concat(arr));
  });
});
