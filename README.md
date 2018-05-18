# musicman

> 一个无限制下载QQ无损音乐的应用 Demo: http://music.mzz.pub

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# 生产环境下使用pm2启动后端，后端默认运行在9000端口
npm install -g pm2
pm2 start app.js --name musicman

# 终止后端进程
pm2 delete musicman

# 生产环境nginx配置
参见https://segmentfault.com/q/1010000006177894
```
+ 注意：域名如果使用SSL，则XHR所请求的域名必须是SSL的，但由于我们使用的下载链接所对应的证书无效，会导致下载失败的问题，解决方案参见: [**issue3**](https://github.com/mzz2017/musicman/issues/3) 
