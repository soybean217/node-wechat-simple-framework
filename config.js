var log4js = require('log4js');
var DIRFIRST = '/node/' //和nginx配置统一
var CONFIG = {
  DBPRODUCT: {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: 'root',
    DATABASE: 'cms_db',
    PORT: 3306
  },
  DBLOG: {
    HOST: 'localhost',
    USER: 'logSmsService',
    PASSWORD: 'lj87dc6Z',
    DATABASE: 'log_general',
    PORT: 3306
  },
  WECHAT: {
    APPID: 'wxb011e7747898ad8c',
    TOKEN_REFRESH_INTERVAL: 50000,
    SECRET: '', //请注意将从数据库读出填入
  },
  VALID_TIME_LIMIT: 100000,
  DIR_FIRST: DIRFIRST,
  TEMPLATE_REFRESH_INTERVAL: 5000,
  TEMPLATE_DIR: './static' + DIRFIRST + 'page/',
  LISTEN_PORT: 20210,
  LOG_LEVEL: log4js.levels.DEBUG,
  QCLOUD_PARA: {
    AppId: '',
    SecretId: '',
    SecretKey: '',
    COS: {
      Bucket: 'pic01',
      Region: 'cn-south',
    },
  },
};

module.exports = CONFIG;