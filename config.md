<!--
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 15:13:53
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 15:39:58
-->

# 工程配置

## 别名配置

```javascript
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  // 配置解析别名
  alias: {
    '@': resolve('../src'),
    components: resolve('../src/components'),
    api: resolve('../src/api'),
    assets: resolve('../src/assets'),
    img: resolve('../src/assets/img')
  }
};
```

## 代理配置

```javascript

const proxyObj = {};

let urlArr = [
  { name: 'api_test', url: 'http://171.217.92.188:8088' }
];

urlArr.forEach(item => {
  proxyObj[item.name] = {};
  proxyObj[item.name].target = item.url;
  proxyObj[item.name].pathRewrite = {
    [`^/${item.name}`]: ''
  };
});

module.exports = {
  publicPath: './',
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 7070,
    hotOnly: true,
    proxy: proxyObj
  }
}
```

## 全局组件

```javascript
//自定义全局组件
const components = {};
const componentsContext = require.context('../components/global', true, /index\.vue$/);

componentsContext.keys().forEach(key => {
  components[key.replace(/.vue/, '').split('/')[1]] = componentsContext(key).default;
  return componentsContext(key).default;
});

Object.keys(components).forEach(key => {
  Vue.component(components[key].name, components[key]);
});
```

## 公共路由

```javascript
//views 的公共路由
const routerArr = [];

const routerArrContext = require.context('../views', true, /module\.router\.js$/);

routerArrContext.keys().forEach(key => {
  routerArr.push(routerArrContext(key).default);
});

```
