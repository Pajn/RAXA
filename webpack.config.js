'use strict'

const path = require('path')
const webpack = require('webpack')

const production = process.env.NODE_ENV === 'production'

// Workaround for bug in sass
// https://github.com/sass/node-sass/issues/857
process.env.UV_THREADPOOL_SIZE = 100

const babelPlugins = ['jsx-tagclass']
const babelDevPlugins = babelPlugins
  .map(plugin => require.resolve(`babel-plugin-${plugin}`))
const babelProdPlugins = babelPlugins
  .concat([
    'transform-react-constant-elements',
    'transform-react-inline-elements',
  ])
  .map(plugin => require.resolve(`babel-plugin-${plugin}`))

const browserConfig = {
  name: 'browser',
  entry: {
    javascript: [
      'babel-polyfill',
      './ui/index',
    ],
    html: './ui/index.html'
  },
  output: {
    path: './ui/dist',
    filename: 'app.js',
    devtoolModuleFilenameTemplate: '/[absolute-resource-path]',
  },
  debug: !production,
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.[jt]s(x?)$/,
        exclude: /node_modules/,
        loaders: [
          'babel?' + JSON.stringify({
            presets: [
              require.resolve('babel-preset-react'),
              require.resolve('babel-preset-es2015'),
              require.resolve('babel-preset-stage-2'),
            ],
            plugins: production
              ? babelProdPlugins
              : babelDevPlugins,
          }),
        ],
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.scss$/,
        exclude: /\.global\.scss$/,
        loaders: [
          'style',
          'css?modules&importLoaders=1&localIdentName=[path][name]---[local]---[hash:base64:5]',
          'postcss',
        ],
      },
      {
        test: /\.global\.scss$/,
        loaders: [
          'style',
          'css',
          'postcss',
        ],
      },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss'],
    modulesDirectories: ['node_modules', path.resolve('./node_modules')],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      __ROOT_PATH__: `"${__dirname}"`,
    }),
  ],
  postcss: webpack => ({
    plugins: [
      require('postcss-easy-import')({
        addDependencyTo: webpack,
        path: ['node_modules/*.scss', path.resolve('./node_modules'), ''],
        extensions: ['.scss', '.css'],
      }),
      require('postcss-strip-inline-comments'),
      require('precss')({import: {disable: true}}),
      require('postcss-calc'),
      require('autoprefixer'),
    ],
    syntax: require('postcss-scss'),
  }),
}

if (production) {
  browserConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      test: /\.js$/,
    })
  )
}

module.exports = [browserConfig]
