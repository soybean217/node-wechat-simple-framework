/*
 * 注意：
 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
 * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
 * 3. 完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * 如有问题请通过以下渠道反馈：
 * 邮箱地址：weixin-open@qq.com
 * 邮件主题：【微信JS-SDK反馈】具体问题
 * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
 */
wx.ready(function() {
  // 1 判断当前版本是否支持指定 JS 接口，支持批量判断
  wx.checkJsApi({
    jsApiList: [
      'getNetworkType',
      'previewImage'
    ],
    success: function(res) {
      alert(JSON.stringify(res));
    }
  });

  // 5 图片接口
  // 5.1 拍照、本地选图
  var images = {
    localId: [],
    serverId: []
  };
  document.querySelector('#chooseImage').onclick = function() {
    wx.chooseImage({
      success: function(res) {
        images.localId = res.localIds;
        alert('已选择 ' + res.localIds.length + ' 张图片');
        var i = 0,
          length = images.localId.length;
        images.serverId = [];

        function upload() {
          wx.uploadImage({
            localId: images.localId[i],
            success: function(res) {
              i++;
              //alert('已上传：' + i + '/' + length);
              images.serverId.push(res.serverId);
              if (i < length) {
                upload();
              } else {
                alert(JSON.stringify(images));
                $.ajax({
                  url: "../ajax/picUploadAjax",
                  type: "post",
                  contentType: "application/json",
                  data: JSON.stringify(images),
                  success: function(result) {
                    alert(JSON.stringify(result))
                    console.log(result);
                  }
                });
              }
            },
            fail: function(res) {
              alert(JSON.stringify(res));
            }
          });
        }
        upload();
      }
    });
  };

  // 5.2 图片预览
  document.querySelector('#previewImage').onclick = function() {
    wx.previewImage({
      current: 'http://img5.douban.com/view/photo/photo/public/p1353993776.jpg',
      urls: [
        'http://img3.douban.com/view/photo/photo/public/p2152117150.jpg',
        'http://img5.douban.com/view/photo/photo/public/p1353993776.jpg',
        'http://img3.douban.com/view/photo/photo/public/p2152134700.jpg'
      ]
    });
  };

  // 5.3 上传图片
  document.querySelector('#uploadImage').onclick = function() {
    if (images.localId.length == 0) {
      alert('请先使用 chooseImage 接口选择图片');
      return;
    }
    var i = 0,
      length = images.localId.length;
    images.serverId = [];

    function upload() {
      wx.uploadImage({
        localId: images.localId[i],
        success: function(res) {
          i++;
          //alert('已上传：' + i + '/' + length);
          images.serverId.push(res.serverId);
          if (i < length) {
            upload();
          }
        },
        fail: function(res) {
          alert(JSON.stringify(res));
        }
      });
    }
    upload();
  };

  // 5.4 下载图片
  document.querySelector('#downloadImage').onclick = function() {
    if (images.serverId.length === 0) {
      alert('请先使用 uploadImage 上传图片');
      return;
    }
    var i = 0,
      length = images.serverId.length;
    images.localId = [];

    function download() {
      wx.downloadImage({
        serverId: images.serverId[i],
        success: function(res) {
          i++;
          alert('已下载：' + i + '/' + length);
          images.localId.push(res.localId);
          if (i < length) {
            download();
          }
        }
      });
    }
    download();
  };

  var shareData = {
    title: '微信JS-SDK Demo',
    desc: '微信JS-SDK,帮助第三方为用户提供更优质的移动web服务',
    link: 'http://demo.open.weixin.qq.com/jssdk/',
    imgUrl: 'http://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
  };
  wx.onMenuShareAppMessage(shareData);
  wx.onMenuShareTimeline(shareData);

  function decryptCode(code, callback) {
    $.getJSON('/jssdk/decrypt_code.php?code=' + encodeURI(code), function(res) {
      if (res.errcode == 0) {
        codes.push(res.code);
      }
    });
  }
});

wx.error(function(res) {
  alert(res.errMsg);
});