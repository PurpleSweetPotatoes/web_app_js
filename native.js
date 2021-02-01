/*
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 10:50:06
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 14:46:53
 */

import Device from './device';
// app启动三方库
import CallApp from 'callapp-lib';

//安卓
function androidSetWebViewJavascriptBridge(callback) {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  console.log('没有WebViewJavascriptBridge对象,等待WebViewJavascriptBridgeReady事件回调');
  document.addEventListener(
    'WebViewJavascriptBridgeReady'
    , () => {
      console.log('WebViewJavascriptBridgeReady事件回调了');
      callback(window.WebViewJavascriptBridge);
    },
    false
  );
}

/**
 * 建议使用方式: main.js文件中
 * import Native from './common/native';
 * Native.openJsBridge();
 * Vue.prototype.native = Native;
 * 
 * 业务逻辑中打开新的webView:
 * this.native.test();
 */
export default class Native {

  static isApp = false;
  static jsBridge = undefined;
  static funcList = [];

  // 初始化JsBridge
  static openJsBridge() {

    // 初始化设备信息
    Device.loadDeviceInfo();
    // todo 判断是否为自定义浏览器
    this.isApp = true;

    if (Device.android) {
      let that = this;
      //先注释掉 初始化jsBridge 需要用到时再初始化
      androidSetWebViewJavascriptBridge(bridge => {
        bridge.init((message, responseCallback) => {
          responseCallback(message);
        });      
        console.log('初始化JSBridge完成,开始加载JS交互队列');
        that.jsBridge = bridge;
        that.funcList.forEach(func => func());
        that.funcList = [];
      });
    } else {
      console.log('非android自定义浏览器,无法初始化jsbridge');
    }
  }

  static test() {
    this.jsCallNative('openUrlWithWebVc', {url: 'https://www.baidu.com'});
  }

  // 使用示例:
  // 开始录音
  // static test() {
  //   this.jsCallNative('openUrlWithWebVc', {url: 'https://www.baidu.com'});
  // }
  static jsCallNative(name, params = {}, blockFunc = null) {
    if (this.isApp) {
      console.log('开始js交互', name, params);
      try {
        if (Device.ios) { // iOS js交互
          let handle = window.webkit.messageHandlers[name];
          console.log(window.webkit);
          handle.postMessage(params);
        } else if (Device.android) { // Android js交互
          let that = this;
          this.androidJsCall(() => {
            that.jsBridge.callHandler(
              name,
              params,
              blockFunc
            );
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('非原生app，无法进行js交互');
    }
  }

  static androidJsCall(func) {
    if (this.jsBridge) {
      func();
    } else {
      console.log('jsBridge未初始化完成，js交互存入队列');
      this.funcList.push(func);
    }
  }

  // 打开对应App,跳转参数和链接根据具体情况配置,time：启动应用实践，超时进入app下载界面
  static openApp(time = 4) {
    return new Promise(resolve => {

      let schemeName = this.$route.query.appScheme || 'jtaqykt';

      if (device.isWeixin) { // 微信浏览器
        // todo 一般在这里打开引导页
        
      } else if (device.ios && !device.isApp) {
        let option = {
          scheme: {
            protocol: schemeName //URL Scheme 的 scheme 字段，要打开的 APP 的标识
          },
          appstore: 'https://itunes.apple.com/cn/app/id1371283948?mt=8',
          timeout: time * 1000
        };
        let lib = new CallApp(option);
        let obj = {
          path: 'webappOpenUrl',
          param: {
            url: window.location.href
          }
        };
        console.log('iOS准备打开app');
        lib.open(obj);
      } else if (device.android && !device.isApp) {
        console.log('andorid准备打开app');
        const url = `${schemeName}://app.staq360.com/basicres/StandardWebActivity?url=${window.location.href}`;
        window.location.href = url;
        setTimeout(() => {
          toast1.clear();
          window.location.href = 'http://sc.staq360.com/down/app.html';
        }, time * 1000);
      }
      resolve(this.isApp);
    });
  }
}
