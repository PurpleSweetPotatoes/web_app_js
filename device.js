/*
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 10:41:35
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 14:47:49
 */

 /**
  * 设备信息
  */
export default class Device {
  
  static ios = false;
  static android = false;
  static ipad = false;
  static iphone = false;
  static wechat = false;
  static ua = undefined;

  static loadDeviceInfo() {
    let ua = navigator.userAgent;
    this.ua = ua;
    console.log('浏览器信息:', ua);
    // Android
    if (/MicroMessenger/i.test(ua)) { // 微信浏览器
      this.wechat = true;
    } else if (ua.match(/(Android)?[\s/]+([\d.]+)?/)) {
      this.android = true;
    } else {
      // iOS
      this.ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      this.iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
      let ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      this.ios = this.ipad || this.ipod || ipod;
    }
  }
}
