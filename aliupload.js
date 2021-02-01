/*
 * @Author: MrBai
 * @Email: 568604944@qq.com
 * @Date: 2021-02-01 15:42:53
 * @LastEditors: MrBai
 * @LastEditTime: 2021-02-01 15:46:56
 */

// oss上传 需要引入ali-oss插件
// oss凭证接口 BaseUrl/xxxxxx
// 图片oss转化接口 BaseUrl/xxxxxx

// 视频上传需引入aliVod文件夹,存放于public文件夹下
// 并于index.html文件中加入script 
/** 
  <script src="<%= BASE_URL %>aliVod/aliyun-upload-sdk-min.js"></script>
  <script src="<%= BASE_URL %>aliVod/lib/es6-promise.min.js"></script>
  <script src="<%= BASE_URL %>aliVod/lib/aliyun-oss-sdk-5.3.1.min.js"></script> 
  */
/*
 使用方法引入 AliUpload,

 上传图片 list: 图片路径数组 errMsg: 错误消息
 AliUpload.ossUpload([file1, file2], (list, errMsg) => {

 })

 上传视频 tokenStr: 用户token, url: 视频地址 errMsg: 错误消息
 Aliupload.videoUpload( file:, tokenStr, (url, errMsg) => {

 })

*/

import axios from 'axios';

let BaseUrl = 'xxxxx';

export default class AliUpload {

  // 图片回调数组
  static _filesUrl = []

  // 图片上传
  static ossUpload(files, cb) {
    AliUpload._filesUrl = [];
    axios.get(`${BaseUrl}xxxxxx`).then(res => {
      if (res.status == 200 && res.data && res.data.StatusCode == 200) {
        AliUpload._startOssUpload(res.data, files, cb);
      } else {
        cb([], '获取上传凭证失败');
      }
    }).catch(err => {
      cb([], '获取上传凭证失败');
    });
  }

  static async _startOssUpload(res, files, cb) {
    console.log('获取上传凭证成功');

    // eslint-disable-next-line import/no-unresolved
    let OSS = require('ali-oss');
    let client = new OSS({
      region: 'oss-cn-beijing',
      secure: true, // secure: 配合region使用，如果指定了secure为true，则使用HTTPS访问
      accessKeyId: res.AccessKeyId,
      accessKeySecret: res.AccessKeySecret,
      stsToken: res.SecurityToken,
      bucket: 'anquanyunketang'
    });

    let ary = [];
    for (const file of files) {
      ary.push(AliUpload._put(file, client));
    }
    Promise.all(ary).then(() => {
      cb(AliUpload._filesUrl);
    });
  }

  static async _put(file, client) {
    // TODO 可以重新命名 并进行图片压缩
    let name = `${file.name.split('.')[0]}_${file.uid}`;
    let upRes = await client.put(name, file);
    console.log('上传完成', upRes);
    await AliUpload._converUrl(upRes.name);
  }

  static async _converUrl(name) {
    let res = await axios.get(`${BaseUrl}xxxxxx`);
    if (res.status == 200) {
      console.log('图片地址转化完成');
      AliUpload._filesUrl.push(res.data.data);
    }
  }

  // 视频或音频上传
  static videoUpload(file, tokenStr, cb) {
    axios({
      method: 'post',
      url: `${BaseUrl}xxxxxx`,
      headers: { token: tokenStr }
    }).then(res => {
      console.log('获取上传凭证', res);
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        let uploader = new AliyunUpload.Vod({
          //分片大小默认1M，不能小于100K
          partSize: 1048576,
          //并行上传分片个数，默认5
          parallel: 5,
          //网络原因失败时，重新上传次数，默认为3
          retryCount: 3,
          //网络原因失败时，重新上传间隔时间，默认为2秒
          retryDuration: 2,
          //是否上报上传日志到点播，默认为true
          enableUploadProgress: true,
          // 开始上传
          onUploadstarted(uploadInfo) {
            //获取STS Token,设置到SDK
            uploader.setSTSToken(uploadInfo, res.data.accessKeyId, res.data.accessKeySecret, res.data.securityToken);
          },
          // 文件上传成功
          onUploadSucceed(uploadInfo) {
            // 视频id => uploadInfo.videoId
            console.log('onUploadSucceed:', uploadInfo);
            cb([`http://api.jsy360.cn/get.php?VideoId=${uploadInfo.videoIdVal}`]);
          },
          // 文件上传失败
          onUploadFailed(uploadInfo, code, message) {
            console.log('onUploadFailed:', code, message);
            cb([], message);
          },
          // 文件上传进度，单位：字节
          onUploadProgress(uploadInfo, totalSize, loadedPercent) {
            console.log(`onUploadProgress:file:${uploadInfo.file.name}, fileSize:${totalSize}, percent:${Math.ceil(loadedPercent * 100)}%`);
          },
          // 上传凭证超时
          onUploadTokenExpired(uploadInfo) {
            console.log('onUploadTokenExpired');
            cb([], '上传超时');
          },
          //全部文件上传结束
          onUploadEnd(uploadInfo) {
            console.log('onUploadEnd: uploaded all the files');
          }
        });
        // TODO 描述针对各系统做特定描述,具体描述问罗总
        let lastName = file.name.substring(file.name.lastIndexOf('.'));
        console.log('=-=-=-=', lastName);
        // let userData = `{"Vod":{"Title":"${file.name.split('.')[0]}_${file.uid}.${lastName}","Description":"课件&试题数据系统"}}`;
        // uploader.addFile(file, null, null, null, userData);
        // uploader.startUpload();
      }
    }).catch(err => {
      console.log(cb([], '获取上传凭证失败'));
    });
  }

}
