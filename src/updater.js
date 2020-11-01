const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

autoUpdater.logger = require('electron-log');

autoUpdater.logger.transports.file.level = 'info';

module.exports = () => {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      title: 'Update downloaded',
      type: 'info',
      message: 'Install and restart now?',
      buttons: ['Yes', 'Later'],
    }).then((result) => {
      const buttonIndex = result.response;
      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });
};
