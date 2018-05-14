# musicman

> 一个无限制下载QQ无损音乐的应用

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
pm2 delete musciman
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
