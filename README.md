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
```c
TreeNode* baroWidgetApply(LPCC tag, LPCC id, StrVar* var, int sp, int ep, LPCC classId ) {
    bool pageCheck=ccmp(tag,"page") || ccmp(tag,"dialog") || ccmp(tag,"main");
    bool widgetCheck=false;
    if( !pageCheck ) {
		widgetCheck=ccmp(tag,"widget") || ccmp(tag,"tree") || ccmp(tag,"grid") || ccmp(tag,"canvas") || ccmp(tag,"input") ||
        ccmp(tag,"editor") || ccmp(tag,"combo") || ccmp(tag,"input") || ccmp(tag,"video") || ccmp(tag,"webview") ||
        ccmp(tag,"button") || ccmp(tag,"check") || ccmp(tag,"radio") || ccmp(tag,"context") ||
        ccmp(tag,"calendar") || ccmp(tag,"spin") || ccmp(tag,"date") || ccmp(tag,"time") || ccmp(tag,"label") ||
        ccmp(tag,"group") || ccmp(tag,"tab") || ccmp(tag,"div") ||
        ccmp(tag,"table") || ccmp(tag,"widget") || ccmp(tag,"progress") || ccmp(tag,"toolbutton") || ccmp(tag,"splitter");
    }
```

## FTP 서버
python -m pyftpdlib -i localhost -p 2121 -w -d ./share
'''
# 실행 옵션

1) -i ADDRESS, --interface=ADDRESS
   : FTP 서버 주소 설정 (default: 0.0.0.0)

2) -p PORT, --port=PORT
   : FTP 서버의 포트 설정. (default: 2121)

3) -w --write
   : Write 권한을 '유저'에게 부여. (default: read-only)

4) -d FOLDER, --directory=FOLDER
   : 공유 디렉토리 설정. (default: 실행 경로)

5) -n ADDRESS, --nat-address=ADDRESS
   : NAT 주소 설정

6) -r FROM-TO, --range=FROM-TO
   : TCP 포트 범위 설정. (예: -r 60000-65535)

7) -D, --debug
   : 디버그 모드로 실행

8) -V, --verbose
   : 좀 더 상세한 로그 출력

9) -u USERNAME, --username=USERNAME
   : 접속 권한을 부여할 유저명

10) -P PASSWORD, --password=PASSWORD
   : 유저의 패스워드.

# 실행 옵션은 [ python -m pyftpdlib --help ]를 통해 확인할 수 있음.
'''


앱 키
네이티브 앱 키	b0ed6273b39301c5d619c457f498ba27
REST API 키	3ccf48f0f137d0a7de427ebab93b8cc4
JavaScript 키	1fbaed19691f4b0afe8906f79ddbda5b
Admin 키	f0ebfde9ed7a45417e9d03389f61fa9a



