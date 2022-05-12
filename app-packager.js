const packager = require('electron-packager');
const clc = require("cli-color");

if ( process.argv.length != 4 
  || !['win', 'mac', 'linux'].includes(process.argv[2])
  || !['x64', 'arm64'].includes(process.argv[3])) {
  console.log(clc.red('\n[ERROR]') + ` Please give platform / architecture as argument.\n`);
  console.log(clc.green('Supporting platforms') + `     : win, mac, linux`);
  console.log(clc.green('Supporting architectures')+ ` : x64, arm64\n`);
  console.log(clc.green('Example (Generating macos / arm64 build):'));
  console.log(clc.green('> ') + clc.yellow('node ./app-packager.js mac arm64'));
  process.exit(1);
}

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
switch (process.argv[2]) {
  case 'win':
    options.platform = 'win32';
    options.icon = 'manifest/backend-ai.ico';
    break;
  case 'mac':
    options.platform = 'darwin';
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

switch (process.argv[3]) {
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

console.log(clc.blue('\n[BUILD]') + ' Now packaging for ' + clc.yellow(options.platform) + ' with ' + clc.yellow(options.arch) + ' architecture.\n');
packager(options).then(()=>{
  console.log(clc.blue('\n[BUILD]') + ' Done.\n');
});
