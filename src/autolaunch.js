const AutoLaunch = require('auto-launch');

const autoLauncher = new AutoLaunch({
  name: 'ClipboardWatcher'
});

const autoLaunch = () => {
  autoLauncher.isEnabled().then(function(isEnabled) {
    if (isEnabled) return;
    autoLauncher.enable();
  }).catch(function (err) {
    throw err;
  });  
}

exports.autoLaunch = autoLaunch;
