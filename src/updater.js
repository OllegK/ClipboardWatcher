const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

autoUpdater.logger = require('electron-log');

autoUpdater.logger.transports.file.level = 'info';

module.exports = () => {
  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    dialog.showErrorBox('There was an error', `${err} occurred while trying to update your app`);
    autoUpdater.logger.info(`There was an error with updating your app: ${err}`);
  });

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
