# baro
baro source test

python -m pip install PyQt5
python -m pip install PyQtWebEngine


set PATH=\Lib\site-packages\pywin32_system32;%PATH%
python -m pip install pywin32

import win32.win32gui as win32gui
import win32.win32clipboard as win32clipboard
import pythonwin.win32ui as win32ui
import win32.lib.win32con as win32con

## vew webpack
npm install vue vue-loader vue-template-compiler webpack webpack-cli webpack-d
ev-server babel-loader @babel/core @babel/preset-env css-loader vue-style-loader sass-loader html-webpack-plugin rimraf -D


npm webpack webpack-cli webpack-dev-server webpack-merge html-webpack-plugin -D 
npm install vue vue-loader vue-template-compiler -D
  - webpack.common.js
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//Just to help us with directories and folders path
const __base = path.resolve(__dirname, '..');
const __src = path.resolve(__base, 'src');

module.exports = {
    //Entry: main file that init our application
    entry: path.resolve(__src, 'main.js'),

    //Output: result of the bundle after webpack run
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__base, 'dist'),
        clean: true
    },

    //Plugins to help and include additionals functionalities to webpack
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Minimal Vue Webpack',
            favicon: path.resolve(__src, 'static', 'favicon.ico'),
            template: path.resolve(__src, 'templates', 'index.html'),
        })
    ]
}
```
  - webpack.dev.js
```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

//Configure dev enviroment by combining common configuration and adding some more options
module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        open: true,
        hot: true
    }
})
```
