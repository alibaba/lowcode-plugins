const paths = require('./paths');

function getOutputConfig(env) {
  return env === 'production' ? {
    path: paths.appBuild,
    filename: 'index.umd.js',
    publicPath: paths.publicUrlOrPath,
    library: {
      name: 'LowcodePluginCodeEditor',
      type: 'umd',
    },
  } : {
    // The build folder.
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // There will be one main bundle, and one file per asynchronous chunk.
    // In development, it does not produce real files.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash][ext]',
    publicPath: paths.publicUrlOrPath,
  }
}

module.exports  = {
  getOutputConfig
}

// // The build folder.
// path: paths.appBuild,
// // Add /* filename */ comments to generated require()s in the output.
// pathinfo: isEnvDevelopment,
// // There will be one main bundle, and one file per asynchronous chunk.
// // In development, it does not produce real files.
// filename: isEnvProduction
//   ? 'static/js/[name].[contenthash:8].js'
//   : isEnvDevelopment && 'static/js/bundle.js',
// // There are also additional JS chunk files if you use code splitting.
// chunkFilename: isEnvProduction
//   ? 'static/js/[name].[contenthash:8].chunk.js'
//   : isEnvDevelopment && 'static/js/[name].chunk.js',
// assetModuleFilename: 'static/media/[name].[hash][ext]',
// // webpack uses `publicPath` to determine where the app is being served from.
// // It requires a trailing slash, or the file assets will get an incorrect path.
// // We inferred the "public path" (such as / or /my-project) from homepage.
// publicPath: paths.publicUrlOrPath,