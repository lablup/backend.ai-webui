/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { parseCliCommand, tokenizeShellCommand } from './parseCliCommand';

describe('tokenizeShellCommand', () => {
  it('should split basic whitespace-separated tokens', () => {
    expect(tokenizeShellCommand('vllm serve /models/my-model')).toEqual([
      'vllm',
      'serve',
      '/models/my-model',
    ]);
  });

  it('should handle double-quoted strings', () => {
    expect(tokenizeShellCommand('echo "hello world"')).toEqual([
      'echo',
      'hello world',
    ]);
  });

  it('should handle single-quoted strings', () => {
    expect(tokenizeShellCommand("echo 'hello world'")).toEqual([
      'echo',
      'hello world',
    ]);
  });

  it('should handle escaped spaces', () => {
    expect(tokenizeShellCommand('echo hello\\ world')).toEqual([
      'echo',
      'hello world',
    ]);
  });

  it('should handle multiple spaces and tabs', () => {
    expect(tokenizeShellCommand('a   b\tc')).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty input', () => {
    expect(tokenizeShellCommand('')).toEqual([]);
  });

  it('should handle multiline input', () => {
    expect(tokenizeShellCommand('vllm serve\n  --tp 2')).toEqual([
      'vllm',
      'serve',
      '--tp',
      '2',
    ]);
  });
});

describe('parseCliCommand', () => {
  describe('empty/blank input', () => {
    it('should return defaults for empty string', () => {
      const result = parseCliCommand('');
      expect(result.runtime).toBe('unknown');
      expect(result.port).toBe(8000);
      expect(result.healthCheckPath).toBe('/health');
      expect(result.modelMountDestination).toBe('/models');
      expect(result.gpuHint).toBeNull();
      expect(result.envVars).toEqual([]);
      expect(result.startCommandTokens).toEqual([]);
    });

    it('should return defaults for whitespace-only string', () => {
      const result = parseCliCommand('   ');
      expect(result.startCommandTokens).toEqual([]);
    });
  });

  describe('vllm runtime detection', () => {
    it('should detect vllm serve command', () => {
      const result = parseCliCommand(
        'vllm serve /models/my-model --tensor-parallel-size 2 --quantization awq --port 8080',
      );
      expect(result.runtime).toBe('vllm');
      expect(result.port).toBe(8080);
      expect(result.healthCheckPath).toBe('/health');
      expect(result.gpuHint).toBe(2);
    });

    it('should use vllm default port when --port is not specified', () => {
      const result = parseCliCommand('vllm serve /models/my-model');
      expect(result.runtime).toBe('vllm');
      expect(result.port).toBe(8000);
    });

    it('should detect python -m vllm', () => {
      const result = parseCliCommand(
        'python -m vllm.entrypoints.openai.api_server --model /models/my-model',
      );
      expect(result.runtime).toBe('vllm');
    });
  });

  describe('sglang runtime detection', () => {
    it('should detect sglang via python -m', () => {
      const result = parseCliCommand(
        'python -m sglang.launch_server --model /models/llama --tp 4 --port 9001',
      );
      expect(result.runtime).toBe('sglang');
      expect(result.port).toBe(9001);
      expect(result.healthCheckPath).toBe('/health');
      expect(result.gpuHint).toBe(4);
    });

    it('should use sglang default port', () => {
      const result = parseCliCommand(
        'python -m sglang.launch_server --model /models/llama',
      );
      expect(result.runtime).toBe('sglang');
      expect(result.port).toBe(9001);
    });
  });

  describe('TGI runtime detection', () => {
    it('should detect text-generation-launcher', () => {
      const result = parseCliCommand(
        'text-generation-launcher --model-id /models/my-model --port 3000',
      );
      expect(result.runtime).toBe('tgi');
      expect(result.port).toBe(3000);
      expect(result.healthCheckPath).toBe('/info');
    });

    it('should use tgi default port', () => {
      const result = parseCliCommand(
        'text-generation-launcher --model-id /models/my-model',
      );
      expect(result.port).toBe(3000);
    });
  });

  describe('unknown runtime', () => {
    it('should use generic defaults for unrecognized commands', () => {
      const result = parseCliCommand('./run.sh');
      expect(result.runtime).toBe('unknown');
      expect(result.port).toBe(8000);
      expect(result.healthCheckPath).toBe('/health');
      expect(result.gpuHint).toBeNull();
    });

    it('should still extract --port from unknown commands', () => {
      const result = parseCliCommand(
        'python my_server.py --port 8000 --workers 4',
      );
      expect(result.runtime).toBe('unknown');
      expect(result.port).toBe(8000);
    });
  });

  describe('port extraction', () => {
    it('should extract --port N', () => {
      const result = parseCliCommand('vllm serve --port 9090');
      expect(result.port).toBe(9090);
    });

    it('should extract --port=N', () => {
      const result = parseCliCommand('vllm serve --port=9090');
      expect(result.port).toBe(9090);
    });
  });

  describe('GPU hint extraction', () => {
    it('should extract --tp N', () => {
      const result = parseCliCommand('vllm serve --tp 4');
      expect(result.gpuHint).toBe(4);
    });

    it('should extract --tensor-parallel-size N', () => {
      const result = parseCliCommand('vllm serve --tensor-parallel-size 8');
      expect(result.gpuHint).toBe(8);
    });

    it('should extract --tp=N', () => {
      const result = parseCliCommand('vllm serve --tp=2');
      expect(result.gpuHint).toBe(2);
    });

    it('should return null when no GPU flags', () => {
      const result = parseCliCommand('vllm serve /models/my-model');
      expect(result.gpuHint).toBeNull();
    });
  });

  describe('docker run parsing', () => {
    it('should extract env vars and container port', () => {
      const result = parseCliCommand(
        'docker run -e MY_VAR=hello -p 9090:8080 my-image:latest python serve.py',
      );
      expect(result.port).toBe(8080);
      expect(result.envVars).toEqual([{ variable: 'MY_VAR', value: 'hello' }]);
      expect(result.effectiveCommand).toBe('python serve.py');
    });

    it('should handle docker run with --rm and -d flags', () => {
      const result = parseCliCommand(
        'docker run --rm -d -e KEY=val -p 8080:3000 myimage cmd arg',
      );
      expect(result.port).toBe(3000);
      expect(result.envVars).toEqual([{ variable: 'KEY', value: 'val' }]);
      expect(result.effectiveCommand).toBe('cmd arg');
    });

    it('should handle multiple -e flags', () => {
      const result = parseCliCommand(
        'docker run -e A=1 -e B=2 -e C=3 myimage run',
      );
      expect(result.envVars).toHaveLength(3);
      expect(result.envVars[0]).toEqual({ variable: 'A', value: '1' });
      expect(result.envVars[1]).toEqual({ variable: 'B', value: '2' });
      expect(result.envVars[2]).toEqual({ variable: 'C', value: '3' });
    });

    it('should handle docker run with no command after image', () => {
      const result = parseCliCommand('docker run -p 8080:8000 my-image:latest');
      expect(result.port).toBe(8000);
      expect(result.effectiveCommand).toBe('');
    });

    it('should detect runtime inside docker command', () => {
      const result = parseCliCommand(
        'docker run --gpus all -p 8080:8000 vllm/vllm:latest vllm serve /models/my-model --tp 2',
      );
      expect(result.runtime).toBe('vllm');
      expect(result.gpuHint).toBe(2);
    });

    it('should handle podman as docker alias', () => {
      const result = parseCliCommand(
        'podman run -e MY_VAR=val -p 9090:8080 myimage cmd',
      );
      expect(result.port).toBe(8080);
      expect(result.envVars).toEqual([{ variable: 'MY_VAR', value: 'val' }]);
    });
  });

  describe('start_command tokenization', () => {
    it('should tokenize command into array for yaml', () => {
      const result = parseCliCommand(
        'vllm serve /models/my-model --tensor-parallel-size 2',
      );
      expect(result.startCommandTokens).toEqual([
        'vllm',
        'serve',
        '/models/my-model',
        '--tensor-parallel-size',
        '2',
      ]);
    });

    it('should use effective command tokens for docker', () => {
      const result = parseCliCommand(
        'docker run -p 8080:8000 myimage vllm serve /models/m --tp 2',
      );
      expect(result.startCommandTokens).toEqual([
        'vllm',
        'serve',
        '/models/m',
        '--tp',
        '2',
      ]);
    });
  });

  describe('spec acceptance criteria examples', () => {
    it('vllm with port override and TP', () => {
      const r = parseCliCommand(
        'vllm serve /models/my-model --tensor-parallel-size 2 --quantization awq --port 8080',
      );
      expect(r.port).toBe(8080);
      expect(r.healthCheckPath).toBe('/health');
      expect(r.gpuHint).toBe(2);
    });

    it('sglang with TP and port', () => {
      const r = parseCliCommand(
        'python -m sglang.launch_server --model /models/llama --tp 4 --port 9001',
      );
      expect(r.port).toBe(9001);
      expect(r.healthCheckPath).toBe('/health');
      expect(r.gpuHint).toBe(4);
    });

    it('TGI with port', () => {
      const r = parseCliCommand(
        'text-generation-launcher --model-id /models/my-model --port 3000',
      );
      expect(r.port).toBe(3000);
      expect(r.healthCheckPath).toBe('/info');
    });

    it('docker with env and port mapping', () => {
      const r = parseCliCommand(
        'docker run -e MY_VAR=hello -p 9090:8080 my-image:latest python serve.py',
      );
      expect(r.port).toBe(8080);
      expect(r.envVars).toEqual([{ variable: 'MY_VAR', value: 'hello' }]);
      expect(r.effectiveCommand).toBe('python serve.py');
    });

    it('python script with port', () => {
      const r = parseCliCommand('python my_server.py --port 8000 --workers 4');
      expect(r.port).toBe(8000);
      expect(r.healthCheckPath).toBe('/health');
    });

    it('unrecognized script with defaults', () => {
      const r = parseCliCommand('./run.sh');
      expect(r.port).toBe(8000);
      expect(r.healthCheckPath).toBe('/health');
      expect(r.gpuHint).toBeNull();
    });
  });
});
