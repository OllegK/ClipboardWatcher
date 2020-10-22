const AutoLaunch = require('auto-launch');

const autoLauncher = new AutoLaunch({
  name: 'ClipboardWatcher',
});

const autoLaunch = () => {
  autoLauncher.isEnabled().then((isEnabled) => {
    if (isEnabled) return;
    autoLauncher.enable();
  }).catch((err) => {
    throw err;
  });
};

exports.autoLaunch = autoLaunch;
