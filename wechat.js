/*
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 15:41:11
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 15:42:03
 */

import wx from 'weixin-js-sdk';
import http from './http';

function loadWxInfo(params) {
  return http.post('/admin/passport/jsToken/v3', params, { headers: { loading: true } });
}

// 微信鉴权
export function wxAuthInfo() {
  let params = {
    currentUrl: window.location.href,
    thirdpartyId: 10,
    redirectUrl: 'http://es.staq360.com/admin/passport/businesscollege/redirect?url=%s'
  };
  return http.post('/admin/passport/transToWxAuth2Url', params, { headers: { loading: true } });
}

export function regiestWx(func) {
  loadWxInfo({ url: window.location.href }).then(res => {
    console.log('微信配置信息');
    console.log(res);
    wx.config({
      debug: false,
      appId: res.data.appid, // 和获取Ticke的必须一样------必填，公众号的唯一标识
      timestamp: res.data.timestamp, // 必填，生成签名的时间戳
      nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
      signature: res.data.signature, // 必填，签名，见附录1
      //需要使用的js方法列表
      jsApiList: [
        'openLocation', //微信地图
        'chooseWXPay', //微信支付
        'updateAppMessageShareData', //“分享给朋友”及“分享到QQ”
        'updateTimelineShareData', //“分享到朋友圈”及“分享到QQ空间”
        'onMenuShareWeibo', //分享到腾讯微博
        'previewImage' //预览图片
      ]
    });
    wx.ready(() => {
      console.log('微信配置成功');
      func();
    });
    wx.error(err => {
      console.log('微信配置失败:', err);
    });
  });
}

// 调起微信地图
export function openWxLocation(params) {
  console.log('打开微信地图', params);
  wx.openLocation({
    latitude: params.lat, // 纬度，浮点数，范围为90 ~ -90
    longitude: params.lng, // 经度，浮点数，范围为180 ~ -180。
    name: params.name, // 位置名
    address: params.address, // 地址详情说明
    scale: 14, // 地图缩放级别,整形值,范围从1~28。默认为最大
    infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
  });
}

// 调起微信支付
export function openWxPay(params, func) {
  wx.chooseWXPay({
    timestamp: params.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
    nonceStr: params.nonceStr, // 支付签名随机串，不长于 32 位
    package: params.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
    signType: params.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
    paySign: params.paySign, // 支付签名
    success(res) {
      // 支付成功后的回调函数
      func(res);
    }
  });
}

// 分享消息
export function configShareInfo(params, func) {
  console.log('配置分享内容', params);

  let {
    title, desc, link, imgUrl
  } = params;

  wx.updateAppMessageShareData({
    title, // 分享标题
    desc, // 分享描述
    link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl, // 分享图标
    success() {
      // 设置成功
      func();
    }
  });
  wx.updateTimelineShareData({
    title, // 分享标题
    link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl, // 分享图标
    success() {
      // 设置成功
      func();
    }
  });
  wx.onMenuShareWeibo({
    title, // 分享标题
    desc, // 分享描述
    link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl, // 分享图标
    success() {
      // 用户确认分享后执行的回调函数
      func();
    },
    cancel() {
      // 用户取消分享后执行的回调函数
      console.log('分享配置失败');
    }
  });
}

//预览图片
export function previewImage(urls, index) {
  wx.previewImage({
    current: urls[index], // 当前显示图片的http链接
    urls // 需要预览的图片http链接列表
  });
}
