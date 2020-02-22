var express = require('express');
var app = express();

// 处理静态资源
app.use('/public/', express.static('./public'));

// 配置模板引擎
app.engine('html', require('express-art-template'));
// 配置body-parser中间件
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));

// 配置路由
var router = require('./router.js');
app.use(router);

app.listen(3000, function(){
    console.log("Express app is running at http://127.0.0.1:3000");
});