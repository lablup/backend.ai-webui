import { runCli } from './run.js';

const exitCode = await runCli({
  argv: process.argv.slice(2),
  cwd: process.cwd(),
  io: {
    stdout: (chunk) => process.stdout.write(chunk),
    stderr: (chunk) => process.stderr.write(chunk),
  },
});

process.exitCode = exitCode;
