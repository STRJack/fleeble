const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function afterSign(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`  • notarizing ${appPath}...`);

  await notarize({
    appPath,
    keychainProfile: 'fleeble-notarize',
  });

  console.log('  • notarization complete ✓');
};
