export function loadScript(url: string) {
  return new Promise((resolve) => {
    let script = document.getElementById(url) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      // script.id = url;
      script.src = url;
      script.type = 'text/javascript';
    }
    script.onload = () => {
      resolve(script);
    };
    script.addEventListener('error', () => {
      console.error('load script error', url);
    });
    document.body.appendChild(script);
  });
}

export async function loadLess() {
  if (window.less) {
    return window.less;
  }
  await loadScript(
    'https://gw.alipayobjects.com/os/lib/less/4.2.0/dist/less.min.js'
  );
  return window.less;
}

export async function loadPrettier() {
  await Promise.all([
    loadScript(
      'https://g.alicdn.com/code/lib/prettier/2.6.0/standalone.min.js'
    ),
    loadScript(
      'https://g.alicdn.com/code/lib/prettier/2.6.0/parser-postcss.min.js'
    ),
    loadScript(
      'https://g.alicdn.com/code/lib/prettier/2.6.0/parser-babel.min.js'
    ),
  ]);
  return window.prettier;
}

export async function loadBabel(): Promise<typeof import('@babel/standalone')> {
  const url =
    'https://gw.alipayobjects.com/os/lib/babel/standalone/7.22.13/babel.min.js';
  await loadScript(url);
  return (window as any).Babel;
}
