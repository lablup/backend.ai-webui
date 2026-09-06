import { CliError } from './errors.js';
import { createInterface } from 'node:readline';

/**
 * The questions `init` asks. Prompts go to stderr so `--json` keeps stdout as
 * one envelope; answers come from stdin. Outside a TTY nothing is asked — the
 * caller must have the answer in a flag, or it is a usage error.
 */
export interface Prompter {
  readonly interactive: boolean;
  text(question: string, fallback?: string): Promise<string>;
  confirm(question: string, fallback: boolean): Promise<boolean>;
}

function askLine(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function stdioPrompter(): Prompter {
  const interactive = Boolean(process.stdin.isTTY && process.stderr.isTTY);
  return {
    interactive,
    async text(question, fallback) {
      const suffix = fallback ? ` [${fallback}]` : '';
      const answer = await askLine(`? ${question}${suffix}: `);
      return answer || fallback || '';
    },
    async confirm(question, fallback) {
      const hint = fallback ? 'Y/n' : 'y/N';
      for (;;) {
        const answer = (
          await askLine(`? ${question} (${hint}) `)
        ).toLowerCase();
        if (answer === '') return fallback;
        if (answer === 'y' || answer === 'yes') return true;
        if (answer === 'n' || answer === 'no') return false;
      }
    },
  };
}

/** The error a non-interactive run gets instead of a question it cannot answer. */
export function needsFlagError(what: string, flags: string[]): CliError {
  return new CliError(
    'usage',
    `No TTY to ask for ${what}; pass ${flags.join(' or ')}.`,
    { suggestions: flags, hint: `bai-agent init ${flags[0]}` },
  );
}
