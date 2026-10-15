import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Cross-worker mutex for tests that rewrite state shared by the whole server
 * (`--repeat-each` runs repeats on different workers at the same time).
 * A lock is a directory holding the owner's pid; a dead owner's lock is
 * broken instead of waiting for a fixed age.
 */
const LOCK_ROOT = path.join(os.tmpdir(), 'backend.ai-webui-e2e-locks');

function isOwnerAlive(lockDir: string): boolean {
  try {
    const pid = Number.parseInt(
      fs.readFileSync(path.join(lockDir, 'pid'), 'utf8'),
      10,
    );
    if (!Number.isFinite(pid)) return false;
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    // EPERM: the process exists but belongs to someone else.
    if (code === 'EPERM') return true;
    // ENOENT on the pid file: the owner is between mkdir and writing it.
    if (code === 'ENOENT') return fs.existsSync(lockDir);
    return false;
  }
}

export async function withSharedStateLock<T>(
  name: string,
  fn: () => Promise<T>,
  timeoutMs = 150_000,
): Promise<T> {
  fs.mkdirSync(LOCK_ROOT, { recursive: true });
  const lockDir = path.join(LOCK_ROOT, name);
  const deadline = Date.now() + timeoutMs;
  let pidMissingSince: number | undefined;

  for (;;) {
    try {
      fs.mkdirSync(lockDir);
      fs.writeFileSync(path.join(lockDir, 'pid'), String(process.pid));
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    const hasPid = fs.existsSync(path.join(lockDir, 'pid'));
    pidMissingSince = hasPid ? undefined : (pidMissingSince ?? Date.now());
    const ownerGone = hasPid
      ? !isOwnerAlive(lockDir)
      : Date.now() - (pidMissingSince ?? Date.now()) > 5_000;
    if (ownerGone) {
      fs.rmSync(lockDir, { recursive: true, force: true });
      continue;
    }
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for the e2e lock "${name}"`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  try {
    return await fn();
  } finally {
    fs.rmSync(lockDir, { recursive: true, force: true });
  }
}
