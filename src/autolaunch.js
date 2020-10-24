const AutoLaunch = require('auto-launch');
const log = require('electron-log');

const autoLauncher = new AutoLaunch({
  name: 'ClipboardWatcher',
});

const autoLauncherStatus = () => new Promise((resolve) => {
  autoLauncher.isEnabled().then((isEnabled) => {
    log.info(`Checking autolaunch status ${isEnabled}`);
    resolve(isEnabled);
  });
});

const toggleAutoLauncher = () => {
  autoLauncherStatus().then((status) => {
    if (status) {
      log.info('Disable auto-launch');
      return autoLauncher.disable();
    }
    log.info('Enable auto-launch');
    return autoLauncher.enable();
  });
};

exports.autoLauncherStatus = autoLauncherStatus;
exports.toggleAutoLauncher = toggleAutoLauncher;
