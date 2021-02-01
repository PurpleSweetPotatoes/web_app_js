/*
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 14:50:41
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 15:13:11
 */

import axios from 'axios';
import Qs from 'qs';

window._axiosLoading = 0;

axios.defaults.timeout = 10000;
const service = axios.create();

/**
 * 请求request配置
 */
service.interceptors.request.use(
  config => {
    // todo配置request信息

    return config;
  }, error => Promise.reject(error)
);

/**
 * 数据响应统一处理
 */
service.interceptors.response.use( //特殊处理
  response => {
    // todo 统一处理响应体

    return response;
  },
  error => {
    let msg = error.message;
    let code = error.response?.status || '';
    console.log(code, msg);

    // todo 统一的错误处理
    if (!error.response) {
      return Promise.reject({
        success: false,
        msg: '网络好像有点问题，请检查后重试～'
      });
    }

    let str = '网络好像有点问题，请检查后重试～';

    if (msg.indexOf('Network Error') != -1) {
      str = '网络好像有点问题，请检查后重试～';
      code = 404;
    } else if (msg.indexOf('timeout') != -1) {
      str = '网络请求超时';
      code = 404;
    }

    return Promise.reject({
      success: false,
      msg: str,
      code
    });
  }
);

const repMsgHandle = (msg, loading) => {
  
  if (msg && msg.length > 0) {
    // todo 消息展示
  } 

  //需要loading时，_axiosLoading--
  if (loading) {
    window._axiosLoading--;
  }

  //等于0时清除loading
  if (window._axiosLoading === 0) {
    
  }
}

const request = options => {
  let {
    url, //请求路径
    method = 'GET', //请求方式
    data, //请求参数
    showErr = true, //是否显示错误信息
    loading = true, //需要loading
    headers = {'Content-Type': 'multipart/form-data'}, //自定义header
    progress, //上传中，回调函数（获取上传进度）
    isLogin = true,
    noQs = false //不需要序列化数据
  } = options;

  const methodType = method.toLowerCase();
  const axData = {
    url: url,
    headers,
    method: methodType,
    data: noQs ? data : Qs.stringify(data)
  };
 
  //需要loading时，_axiosLoading++
  if (loading) {
    window._axiosLoading++;
  }

  switch (methodType) {
    case 'get'://get请求
      data.t = new Date().getTime(); //请求随机数，防止ie缓存
      axData.params = data;
      break;
    case 'post': //post请求
      break;
    case 'delete': //delete请求
      break;
    case 'put': //put请求
      break;
    case 'upload': //上传请求
      axData.data = data;
      if (!headers) {
        axData.headers = {};
      }
      axData.method = 'post';
      if (typeof progress === 'function') {
        axData.onUploadProgress = progressEvent => {
          if (progressEvent.lengthComputable) {
            //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
            //如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
            progress(progressEvent);
          }
        };
      }
      break;
    default:
      break;
  }

  return service(axData).then(res => {
    const serveData = res.data;
    const msg = serveData.msg;
    // todo 特定情况处理
    
    repMsgHandle(msg, loading);
    return serveData;
  }).catch(err => {
    repMsgHandle(err.msg, loading);
    return err;
  });
};

export const http = {
  get: (url, data = {}, option) => request({ //get请求
    method: 'get', url, data, ...option
  }),
  post: (url, data = {}, option) => request({ //post请求
    method: 'post', url, data, ...option
  }),
  delete: (url, data = {}, option) => request({ //post请求
    method: 'delete', url, data, ...option
  }),
  put: (url, data = {}, option) => request({ //post请求
    method: 'put', url, data, ...option
  }),
  upload: (url, data = {}, option) => request({ //普通上传
    method: 'upload', url, data, ...option
  })
};

export default http;
