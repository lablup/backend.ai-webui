import { transformWithOxc, type Plugin } from 'vite';

export function umdWithoutAmd(): Plugin {
  return {
    name: 'bai-umd-without-amd',
    transform: {
      filter: { id: /[\\/]node_modules[\\/]/, code: /\bdefine\.amd\b/ },
      async handler(code, id) {
        const result = await transformWithOxc(code, id, {
          define: { define: 'undefined' },
        });
        return { code: result.code, map: result.map };
      },
    },
  };
}
