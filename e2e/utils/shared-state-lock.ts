import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Cross-worker mutex for tests that rewrite state shared by the whole server
 * (`--repeat-each` runs repeats on different workers at the same time).
 * A lock is a directory holding the owner's pid. Only its owner removes it,
 * except that a dead owner's lock is reclaimed under a separate, short
 * reclaim mutex, so two waiters can never both break and retake it.
 */
const LOCK_ROOT = path.join(os.tmpdir(), 'backend.ai-webui-e2e-locks');
// The reclaim mutex is held only for a few synchronous fs calls.
const RECLAIM_STALE_MS = 10_000;
const PID_WRITE_GRACE_MS = 5_000;

function readOwnerPid(lockDir: string): number | undefined {
  try {
    const pid = Number.parseInt(
      fs.readFileSync(path.join(lockDir, 'pid'), 'utf8'),
      10,
    );
    return Number.isFinite(pid) ? pid : undefined;
  } catch {
    return undefined;
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM: the process exists but belongs to someone else.
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

function ageMs(dir: string): number | undefined {
  try {
    return Date.now() - fs.statSync(dir).mtimeMs;
  } catch {
    return undefined;
  }
}

function isAbandoned(lockDir: string): boolean {
  const pid = readOwnerPid(lockDir);
  if (pid !== undefined) return !isProcessAlive(pid);
  // No pid yet: the owner may be between mkdir and writing it.
  const age = ageMs(lockDir);
  return age !== undefined && age > PID_WRITE_GRACE_MS;
}

/** Removes `lockDir` if its owner is gone; synchronous on purpose. */
function reclaimIfAbandoned(lockDir: string): void {
  const reclaimDir = `${lockDir}.reclaim`;
  try {
    fs.mkdirSync(reclaimDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const age = ageMs(reclaimDir);
    if (age !== undefined && age > RECLAIM_STALE_MS) {
      fs.rmSync(reclaimDir, { recursive: true, force: true });
    }
    return;
  }
  try {
    // Re-checked under the reclaim mutex: a lock changes hands only through
    // its live owner's release or through here, so the check cannot go stale.
    if (fs.existsSync(lockDir) && isAbandoned(lockDir)) {
      fs.rmSync(lockDir, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(reclaimDir, { recursive: true, force: true });
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

  for (;;) {
    try {
      fs.mkdirSync(lockDir);
      fs.writeFileSync(path.join(lockDir, 'pid'), String(process.pid));
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    if (isAbandoned(lockDir)) {
      reclaimIfAbandoned(lockDir);
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
