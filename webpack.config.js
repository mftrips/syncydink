'use strict';
var path = require('path');
var webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  stats: {
    assets: false,
    colors: true,
    version: false,
    hash: true,
    timings: true,
    chunks: false,
    chunkModules: false
  },
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules|vue\/src|tests/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            esModule: true
          }
        }
      },
      {
        test: /\.(png|jpg|gif|svg|eot|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.less$/,
        loader: 'less-loader'
      }
    ]
  },
  resolve: {
    extensions: [".vue", ".ts", ".js", ".json"],
    alias: {
      'vue$': path.resolve('./node_modules/vue/dist/vue.esm.js'),
      'vue-material$': path.resolve('./node_modules/vue-material/dist/vue-material.js'),
      'buttplug$': path.resolve('./node_modules/buttplug/dist/main/src/index.js')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.NamedModulesPlugin(),
    // We use text-encoding as a polyfill for node, but when packing for the
    // web, we can assume the browser will have it. Ignore it here and save
    // ourselves 600k of library!
    new webpack.IgnorePlugin(/text-encoding/),
  ],
  node: {
    fs: 'empty'
  }
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          keep_classnames: true,
          keep_fnames: true
        },
        compress: {
          keep_classnames: true,
          keep_fnames: true,
          warnings: false
        }
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
