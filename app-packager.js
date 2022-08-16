const packager = require('electron-packager');
const clc = require("cli-color");
const { program, Option } = require('commander');

program
  .argument('<platform>', 'Target platform to create package. Available options are: win darwin mas linux')
  .argument('<architecture>', 'Target architecture to create package. Available options are: x64 arm64')

program.addOption((new Option('--do-sign', 'Code sign created application with Apple Developer Identity.').env('BAI_APP_SIGN')))
program.addOption((new Option('--sign-apple-id <john@example.com>')).env('BAI_APP_SIGN_APPLE_ID'))
program.addOption((new Option('--sign-apple-id-password <aaaa-bbbb-cccc-dddd>')).env('BAI_APP_SIGN_APPLE_ID_PASSWORD'))
program.addOption((new Option('--sign-identity <Apple Distribution: Example Inc. (AAAAAAAAAA)>')).env('BAI_APP_SIGN_IDENTITY'))
program.addOption((new Option('--sign-keychain <Name of keychain>')).env('BAI_APP_SIGN_KEYCHAIN'))

let baseOptions = {
  name: 'Backend.AI Desktop',
  dir: './build/electron-app',
  out: 'app',
  asar: true,
  junk: true,
  overwrite: true,
  ignore: [
    '.git',
    '.git(ignore|modules)',
    'node_modules/electron-packager'
  ],
  platform: 'darwin',
  arch: 'arm64',
  icon: 'manifest/backend-ai.icns',
};
let options = baseOptions;
const { args } = program.parse();
const selectedOptions = program.opts()

switch (args[0]) {
  case 'win':
    options.platform = 'win32';
    options.icon = 'manifest/backend-ai.ico';
    break;
  case 'darwin':
    options.platform = 'darwin';
    options.icon = 'manifest/backend-ai.icns';
    break;
  case 'mas':
    options.platform = 'mas';
    options.icon = 'manifest/backend-ai.icns';
    break;
  case 'linux':
    options.platform = 'linux';
    options.icon = 'manifest/backend-ai.ico';
    break;
  default:
    console.log('Unsupported platform.');
    process.exit(1);
}

switch (args[1]) {
  case 'x64':
    options.arch = 'x64';
    break;
  case 'arm64':
    options.arch = 'arm64';
    break;
  default:
    console.log(clc.red('[ERROR]') + ' Unsupported architecture.');
    process.exit(1);
}

if (selectedOptions.doSign === true) {
  if (args[0] !== 'mas' && args[0] !== 'darwin') {
    console.log(clc.red('[ERROR]') + '--sign option is only available when packaging macOS application.');
    process.exit(-1);
  }
  if (!selectedOptions.signAppleId || !selectedOptions.signAppleIdPassword || !selectedOptions.signIdentity) {
    console.log(clc.red('[ERROR]') + '--sign-apple-id, --sign-apple-id-password, --sign-identity parameter is required when code signing macOS application.');
    process.exit(-1);
  }
  options.osxSign = {
    identity: selectedOptions.signIdentity,
    'hardened-runtime': true,
    'signature-flags': 'library',
    keychain: selectedOptions.signKeychain,
  }
  if (args[0] === 'mas') {
    options.osxSign.entitlements = 'entitlements-mas.plist'
    options.osxSign['entitlements-inherit'] = 'entitlements-mas.plist'
  } else {
    options.osxSign.entitlements = 'entitlements.plist'
    options.osxSign['entitlements-inherit'] = 'entitlements.plist'
  }

  options.osxNotarize = {
    appleId: selectedOptions.signAppleId,
    appleIdPassword: selectedOptions.signAppleIdPassword,
  }
  
  console.log(clc.blue('\n[BUILD]') + ` Signing package with identity ${clc.yellow(options.osxSign.identity)}`);
  if (selectedOptions.signKeychain) {
    console.log(clc.blue('\n[BUILD]') + ` Using keychain ${clc.yellow(selectedOptions.signKeychain)} instead of default`);
  }
}

const run = async () => {
  console.log(clc.blue('\n[BUILD]') + ' Now packaging for ' + clc.yellow(options.platform) + ' with ' + clc.yellow(options.arch) + ' architecture.\n');
  await packager(options);
  console.log(clc.blue('\n[BUILD]') + ' Done.\n');
}


run();