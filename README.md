# node-wechat-simple-framework

微信服务号的Node.js简单框架

mysql和内存缓存token和jsapiTicket。

用header的Referer和过滤器进行jsapi的签名。用过滤器进行微信的oauth的自动登陆将openid等数据存入session。用过滤器暴露openid到url可以以此跟踪用户传播后点击情况。


Simple framework for Wechat Service Account .

Cache token and jsapiTicket in memory and mysql . Use header "Referer" and filter sign jsapi . Auto process oauth login on wechat public platform . 
