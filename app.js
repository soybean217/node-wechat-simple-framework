'use strict';
var express = require('express');
var path = require('path');
var sign = require('./sign.js');
var CONFIG = require('./config.js');
var globalInfo = require('./globalInfo.js');
var app = express();
var mysql = require('mysql');
var url = require('url');
var fs = require("fs");
var pu = require('./privateUtil.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
// log4js.configure({ 
// 	appenders: [{  
// 		type: 'console',
// 		  layout: {   
// 			type: 'pattern',
// 			   pattern: '[%r] [%[%5.5p%]] - %m%n'  
// 		} 
// 	}]
// })
logger.setLevel(CONFIG.LOG_LEVEL);
// logger.appender.layout.pattern("[%h %x{pid}] - [%d] [%p] %c %m");
var session = require('express-session');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var poolConfig = mysql.createPool({
	host: CONFIG.DBPRODUCT.HOST,
	user: CONFIG.DBPRODUCT.USER,
	password: CONFIG.DBPRODUCT.PASSWORD,
	database: CONFIG.DBPRODUCT.DATABASE,
	port: CONFIG.DBPRODUCT.PORT
});

var selectSQL = "show variables like 'wait_timeout'";

poolConfig.getConnection(function(err, conn) {
	if (err) console.log("POOL ==> " + err);

	function query() {
		conn.query(selectSQL, function(err, res) {
			console.log(new Date());
			console.log(res);
			conn.release();
		});
	}
	query();
	// setInterval(query, 5000);
});
var tokenWechat = require('./tokenWechat.js');
var wechatToken = tokenWechat(poolConfig);
var cacheTemplate = require('./cacheTemplate.js');
cacheTemplate();
// tokenWechat.freshToken(poolConfig);

// function goMy(a) {};
// goMy(tokenWechat(poolConfig));

app.use(session({
	secret: 'keyboard',
	rolling: true,
	cookie: {
		maxAge: 30 * 60000
	}
}))

//过滤器页面检查，HEADER检查，code参数检查，session参数检查
app.use(function(req, res, next) {
	logger.debug(req.url)
	var isNext = true;
	if (req.url.indexOf('\/page\/') != -1 && req.url.indexOf('.js') == -1 && req.url.indexOf('.css') == -1) {
		logger.debug('begin page filter' + req.url)
		if (checkWechatHeader()) {
			if (req.query.code) {
				isNext = false
				oAuthBaseProcess(req.query.code)
			} else {
				if (!req.session.wechatBase) {
					// only support get method
					var scope = 'snsapi_userinfo';
					// var scope = 'snsapi_base';
					var urlEncodedUrl = encodeURIComponent(req.protocol + '://' + req.hostname + req.url)
					var oAuthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + CONFIG.WECHAT.APPID + '&redirect_uri=' + urlEncodedUrl + '&response_type=code&scope=' + scope + '&state=123#wechat_redirect'
					isNext = false
					return res.send('<script>location="' + oAuthUrl + '"</script>')
				} else {
					if (!req.query.f) {
						isNext = false
						return redirectAfterOAuthSuccess()
					} else {
						logger.debug('ok request page')
					}
				}
			}
		} else {
			isNext = false
			return res.send(globalInfo.cacheTemplate['wechatOnly.htm'].content)
		}
	}
	if (isNext) {
		next();
	}

	function checkWechatHeader() {
		if (req.header('User-Agent').toLowerCase().indexOf('micromessenger') != -1) {
			return true
		} else {
			return false
		}
	};

	function oAuthBaseProcess(code) {
		var https = require('https');
		var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + CONFIG.WECHAT.APPID + '&secret=' + CONFIG.WECHAT.SECRET + '&code=' + code + '&grant_type=authorization_code'
		https.get(url, function(response) {
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				logger.debug(body);
				var rev = JSON.parse(body);
				if (rev.openid) {
					// can trace f parameter (from openid) here , and replace it here if you need .
					req.session.wechatBase = rev
					if (rev.scope == 'snsapi_userinfo') {
						oAuthUserInfo();
					} else {
						redirectAfterOAuthSuccess();
					}
				} else {
					logger.error(req.originalUrl)
					logger.error('oAuthBaseProcess can not get openid from wechat')
					return res.send(globalInfo.cacheTemplate['error.htm'].content)
				}
			});
		});
	};

	function oAuthUserInfo(code) {
		var https = require('https');
		var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + req.session.wechatBase.access_token + '&openid=' + req.session.wechatBase.openid + '&lang=zh_CN'
		https.get(url, function(response) {
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				logger.debug(body);
				var rev = JSON.parse(body);
				if (rev.openid) {
					req.session.wechatUserInfo = rev
					redirectAfterOAuthSuccess();
				} else {
					logger.error(url)
					logger.error('oAuthUserInfo can not get userinfo from wechat')
					return res.send(globalInfo.cacheTemplate['error.htm'].content)
				}
			});
		});
	};

	function redirectAfterOAuthSuccess() {
		var target = pu.cleanedUrl(req)
		if (target.indexOf('f=') == -1) {
			if (target.indexOf('?') == -1) {
				target += '?f=' + req.session.wechatBase.openid
			} else {
				target += '&f=' + req.session.wechatBase.openid
			}
		}
		logger.debug('redirectAfterOAuthSuccess:' + target)
		return res.send('<script>location="' + target + '"</script>')
			// return res.redirect(target);
	}
})

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', index);
app.get(CONFIG.DIR_FIRST + 'page/signWechat.js', signOut);
app.get(CONFIG.DIR_FIRST + 'page/wechatTestOauth', wechatTestOauth);
// app.get('/node/sessionTest', sessionTest);
app.post(CONFIG.DIR_FIRST + 'ajax/picUploadAjax', jsonParser, picUploadAjax);

function index(req, res) {
	res.send('Hello World!');
}

function signOut(req, res) {
	var result = 'var sign = ' + JSON.stringify(sign(globalInfo.jsapiTicket.value, req.header('Referer')));
	res.send(result);
}

function wechatTestOauth(req, res) {
	logger.debug(req.url)
	logger.debug(req.hostname)
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query
	logger.debug(query)
		// res.send("ok");
		// res.end()
}

function sessionTest(req, res) {
	var sess = req.session
	if (sess.count) {
		sess.count++;
	} else {
		sess.count = 1;
	}
	console.log(sess.count)
	res.send('<script src="js/jquery-3.2.1.min.js"></script><script>$.get("sessionTest", function(result){console.log(result);});</script>');
	res.end()
}

var COS = require('cos-nodejs-sdk-v5');

function picUploadAjax(req, res) {
	if (!req.body) return res.sendStatus(400)
	logger.debug(globalInfo)
	var successCount = 0
	for (i = 0; i < req.body.serverId.length; i++) {
		downloadWechatPicMedia(req.body.serverId[i]);
	}
	res.send('{status:"ok"}');
	res.end()

	function downloadWechatPicMedia(mediaId) {
		var https = require('https');
		var url = 'https://api.weixin.qq.com/cgi-bin/media/get?access_token=' + globalInfo.token.value + '&media_id=' + mediaId
		https.get(url, function(response) {
			response.setEncoding("binary");
			var body = '';
			response.on('data', function(d) {
				body += d;
			});
			response.on('end', function() {
				fs.writeFile("./tmp/" + mediaId + ".jpg", body, "binary", function(err) {
					if (err) {
						logger.error(url);
						logger.error("down fail");
					}
					var cos = new COS({
						AppId: CONFIG.QCLOUD_PARA.AppId,
						SecretId: CONFIG.QCLOUD_PARA.SecretId,
						SecretKey: CONFIG.QCLOUD_PARA.SecretKey,
					});
					// 分片上传
					cos.sliceUploadFile({
						Bucket: CONFIG.QCLOUD_PARA.COS.Bucket,
						Region: CONFIG.QCLOUD_PARA.COS.Region,
						Key: mediaId + '.jpg',
						FilePath: './tmp/' + mediaId + '.jpg'
					}, function(err, data) {
						logger.debug(err, data);
					});
					logger.debug(url);
					logger.debug("down success");
					successCount++
				});
			});
		});
	};
}

// console.log(sign(poolConfig, 'http://example.com'));

var server = app.listen(CONFIG.LISTEN_PORT, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});