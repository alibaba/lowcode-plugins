module.exports = function (webpackEnv) {
  const isEnvProduction = webpackEnv === 'production';

  return isEnvProduction ? {
    'react': 'react',
    'react-dom': 'react-dom',
    '@alilc/lowcode-engine': '@alilc/lowcode-engine',
    '@alilc/lowcode-engine-ext': '@alilc/lowcode-engine-ext',
    '@alifd/next': '@alifd/next',
    'prettier/esm/standalone.mjs': 'prettier/esm/standalone.mjs',
  } : {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@alilc/lowcode-engine': 'AliLowCodeEngine',
    '@alilc/lowcode-engine-ext': 'AliLowCodeEngineExt',
    '@alifd/next': 'Next',
    'prettier/esm/standalone.mjs': 'prettier',
  }
}