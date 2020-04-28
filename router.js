// 创建路由对象
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: '数据库用户名',
	password: '数据库密码',
	database: '数据库名称'
});
var fs = require("fs");

// 挂载路由
// 登录和注册页面
router.get('/', function(req, res){
    res.render("logAndReg.html",{});
});

// 博客首页
router.get('/blog', function(req, res){
    fs.readFile("./views/blog.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 用户个人页面
router.get('/blog/userPage', function(req, res){
    fs.readFile("./views/my.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 修改个人信息页面
router.get('/blog/changeInfoPage', function(req, res){
    fs.readFile("./views/changeInfo.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 添加博客页面
router.get('/blog/addPage', function(req, res){
    fs.readFile("./views/addBlog.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 博客的详情页面
router.get('/blog/detailPage', function(req, res){
    fs.readFile("./views/blogDetail.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 后台登录页面
router.get('/adminLogin', function(req, res){
    fs.readFile("./views/adminLogin.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 后台管理页面
router.get('/adminPage', function(req, res){
    fs.readFile("./views/admin.html", 'utf8', function(error, data){
        if(error){
            return console.log("文件读取失败");
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});



// 注册接口
router.post("/blog/register", function(req, res){
    connection.query("SELECT * FROM `user` WHERE phone=" + req.body.userName, function (error, results, fields) {
        if (error) {
            return res.send({msg:"注册失败", status: false});
        } else {
            if(results.length !== 0){
                res.send("该用户已注册");
            }else{
                let newUser = {
                    phone: req.body.userName,
                    password: req.body.passWord
                }
                connection.query("INSERT INTO `user` SET ?", [newUser], function (error, results, fields) {
                    if (error) {
                        return res.send({msg:"注册失败", status: false});
                    } else {
                        res.send({msg:"注册成功", status: true});
                    }
                });
            }
        }
    });
});

// 登录接口
router.post('/blog/login', function(req, res){
    var sql = "SELECT password, id, avatar, nick_name, phone, collection, email FROM `user` WHERE phone="+req.body.userName;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
            return res.send({msg: "登录失败，请重新登录", status: false});
        } else {
            if(results[0].password === req.body.passWord){
                delete results[0].password;
                res.send({msg:"登录成功", status: true, userInfo: results[0]});
            }else{
                res.send({msg:"账号或密码不正确", status:false});
            }
        }
    });
});

// 获取个人的详细信息接口
router.post('/blog/detailPage', function(req, res){
    var sql = "SELECT id, phone, nick_name, email, blog_num, avatar FROM `user` WHERE id="+req.body.id;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
            return res.send("获取用户信息失败");
        } else {
            res.send(results[0]);
        }
    });
});

// 修改个人信息接口
router.post('/blog/changeInfo', function(req, res){
    var sql = "UPDATE `user` SET nick_name='" + req.body.nick_name +
            "', phone='" + req.body.phone +
            "', email='" + req.body.email + 
            "' WHERE id=" + req.body.id;
    connection.query(sql, function(error, results, fields){
        if(error){
            console.log(error);
            res.send({msg:"失败", status:false});
        }else{
            res.send({msg:"成功", status:true});
        }
    });
});

// 修改头像接口
router.post("/blog/changeUserAvatar", function(req, res){
    var base64Data = req.body.baseData.replace(/^data:image\/\w+;base64,/, "");
    // var dataBuffer = new Buffer(base64Data, 'base64'); // 解码图片
    var dataBuffer = Buffer.from(base64Data, 'base64');

    // 利用时间戳和图片原本的名字来生成新的名称
    var date = new Date().getTime();
    var img_name = date + req.body.imgName; 

    // 这里将用户上传的头像，存放在public下的userAvatar目录下
    // 这样做，方便的地方是返回用户头像时，只需要返回一个路径即可
    // 不好的地方是用户上传的头像，都被暴露出去，其他人可以通过链接来访问
    fs.writeFile("./public/userAvatar/"+img_name, dataBuffer, function(err) {
        if(err){
            res.send({msg:"修改用户头像失败", status: false});
        }else{
            // 写入成功后，将用户的头像的路径存放到数据库当中
            var sql = "UPDATE user SET avatar=" + "'../public/userAvatar/" + img_name + "' WHERE id="+req.body.id;
            connection.query(sql, function(error, results, fields){
                if(error){
                    res.send({msg:"修改用户头像失败", status: false});
                }else{
                    res.send({msg:"修改用户头像成功", status: true, newAvatar:"../public/userAvatar/"+img_name});
                }
            });
        }
    });
});

// 获取博客的详情接口
router.post('/blog/blogDetail', function(req, res){
    var sql = "SELECT * FROM `blog_content` WHERE id="+req.body.id;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            return res.send("获取博客详情失败");
        } else {
            res.send(results[0]);
        }
    });
});

// 发布博客接口
router.post('/blog/addBlog', function(req, res){
    connection.query("INSERT INTO `blog_content` SET ?", [req.body], function (error, results, fields) {
        if (error) {
            return res.send({msg:"失败", status:false});
        } else {
            let sql = "UPDATE `user` SET blog_num=blog_num+1 WHERE id=" + req.body.user_id;
            connection.query(sql, function(error, results, fields){
                if(error){
                    return res.send({msg:"失败", status:false});
                }else{
                    res.send({msg:"成功", status:true});
                }
            });
        }
    });
});

// 首页获取博客接口
router.post("/blog/getBlogs", function(req, res){
    let sql = "SELECT b.id, b.title, b.content, b.collection_num, u.nick_name, u.avatar " + 
                "FROM `blog_content` b " +
                "INNER JOIN `user` u " +
                "ON b.user_id = u.id " + 
                "LIMIT 10 OFFSET " + 0;
    connection.query(sql, function(error, results, fields){
        if(error){
            res.send({msg:"获取博客列表失败", status: false});
        }else{
            res.send(results);
        }
    });
});

// 收藏和取消收藏博客
router.post("/blog/like", function(req, res){
    // 这里获取到了当前用户的id，以及点击的博客的id
    // 需要判断，当前博客是否为用户发布的博客，如果是，则不能收藏
    // 需要在user表，当中，添加一个字段，来存储用户发布的博客的id，是一个列表
    // 也可以直接进行查询,使用WHERE语句,查询blog_content表当中，符合当前用户id的博客
    // 再使用indexOf或for循环检查
    // 如果是当前用户的博客,则提示用户,不能收藏自己的博客
    // 如果不是,则进行下面的代码,收藏或取消收藏
    if(req.body.likeFlag){
        // 收藏：将博客的id，加入到用户的收藏列表当中，同时博客的收藏数加一
        var sql = "UPDATE blog_content SET collection_num=collection_num+1 WHERE id="+ req.body.blog_id;
        connection.query(sql, function(error, results, fields){
            if(error){
                res.send({msg:"收藏失败", status:false});
            }else{
                connection.query("SELECT collection FROM `user` WHERE id="+req.body.user_id, function(error, results, fields){
                    if(error){
                        res.send({msg:"收藏失败", status:false});
                    }else{
                        var user_collection = results[0].collection;
                        var collectionStr;
                        if(user_collection){
                            collectionStr = user_collection + "," + req.body.blog_id;
                        }else{
                            collectionStr = user_collection + req.body.blog_id;
                        }
                        var sql = "UPDATE `user` SET collection='" + collectionStr +"' WHERE id="+ req.body.user_id;
                        connection.query(sql, function(error, results, fields){
                            if(error){
                                console.log(error);
                                res.send({msg:"收藏失败", status:false});
                            }else{
                                res.send({msg:"收藏成功", status:true});
                            }
                        });
                    }
                });
            }
        });
        
    }else{
        // 取消收藏：将博客的id从用户的收藏列表当中删除， 同时博客的id减一
        var sql = "UPDATE blog_content SET collection_num=collection_num-1 WHERE id="+ req.body.blog_id;
        connection.query(sql, function(error, results, fields){
            if(error){
                res.send({msg:"取消收藏失败", status:false});
            }else{
                connection.query("SELECT collection FROM `user` WHERE id="+req.body.user_id, function(error, results, fields){
                    if(error){
                        res.send({msg:"收藏失败", status:false});
                    }else{
                        var user_collection = results[0].collection;
                        var collectionArr = user_collection.split(",");
                        var index = collectionArr.indexOf(req.body.blog_id.toString());
                        collectionArr.splice(index, 1);
                        var collectionStr = collectionArr.toString();
                        var sql = "UPDATE `user` SET collection='" + collectionStr +"' WHERE id="+ req.body.user_id;
                        connection.query(sql, function(error, results, fields){
                            if(error){
                                res.send({msg:"取消收藏失败", status:false});
                            }else{
                                res.send({msg:"取消收藏成功", status:true});
                            }
                        });
                    }
                });
            }
        });
    }
});

// 搜索博客接口
router.post("/blog/searchBlog", function(req, res){
    var sql = "SELECT b.id, b.title, b.content, b.collection_num, b.keywords, u.nick_name, u.avatar " + 
                "FROM `blog_content` b " +
                "INNER JOIN `user` u " +
                "ON b.user_id = u.id";
    connection.query(sql, function(error, results, fields){
        if(error){
            return res.send({msg:"搜索失败", status:false});
        }else{
            var searchResults = [];
            for(var i=0; i<results.length; i++){
                var reg = new RegExp(req.body.searchVal, "i");
                if(reg.test(results[i].keywords) || reg.test(results[i].title)){
                    searchResults.push(results[i]);
                }
            }
            res.send({msg:"搜索成功", status: true, results: searchResults});
        }
    });
});


// 后台接口

// 后台展示的用户数据，需要用到分页查询，根据前端传递过来的num来查询相应的数据
router.post("/admin/userData", function(req, res){
    connection.query("SELECT count(*) num FROM user", function(error, results, fields){
        if(error){
            return res.send({msg:"获取用户信息错误", status: false});
        }else{
            var allUsers = results[0].num;
            var sql = "SELECT u.id, u.nick_name, u.phone, u.email, u.blog_num " + 
                "FROM `user` u " +
                "LIMIT " + req.body.num +" OFFSET " + (req.body.page - 1)*req.body.num;
            connection.query(sql, function(error, results, fields){
                if(error){
                    return res.send({msg:"获取用户信息错误", status: false});
                }else{
                    res.send({msg:"获取用户信息成功", status:true, users: results, usersNum: allUsers});
                }
            });
        }
    });
});

// 后台展示的博客数据，需要用到分页查询，根据前端传递过来的num来查询相应的数据
router.post("/admin/blogData", function(req, res){
    connection.query("SELECT count(*) num FROM blog_content", function(error, results, fields){
        if(error){
            return res.send({msg:"获取博客错误", status: false});
        }else{
            var allBlogs = results[0].num;
            var sql = "SELECT b.id, b.user_id, b.title, b.content, b.keywords, b.collection_num " + 
                "FROM `blog_content` b " +
                "LIMIT " + req.body.num +" OFFSET " + (req.body.page - 1)*req.body.num;
            connection.query(sql, function(error, results, fields){
                if(error){
                    return res.send({msg:"获取博客错误", status: false});
                }else{
                    res.send({msg:"获取博客成功", status:true, blogs: results, blogsNum: allBlogs});
                }
            });
        }
    });
});

// 后台删除用户
router.post("/admin/deleteUser", function(req, res){
    connection.query("DELETE FROM `user` WHERE id=" + req.body.user_id, function(error, results, fields){
        if(error){
            return res.send({msg:"删除用户失败", status:false});
        }else{
            res.send({msg:"删除用户成功", status:true});
        }
    });
});

// 后台删除博客
router.post("/admin/deleteBlog", function(req, res){
    connection.query("DELETE FROM `blog_content` WHERE id=" + req.body.blog_id, function(error, results, fields){
        if(error){
            return res.send({msg:"删除博客失败", status:false});
        }else{
            res.send({msg:"删除博客成功", status:true});
        }
    });
});

// 后台登录
router.post("/admin/login", function(req, res){
    connection.query("SELECT * FROM `admin` WHERE user_name='" + req.body.userName + "'", function(error, results, fields){
        if(error){
            console.log(error);
            res.send({msg:"登录失败", status:false});
        }else{
            if(results.length == 0){
                res.send({msg:"用户不存在", status:false});
            }else{
                if(req.body.passWord === results[0].password){
                    var verifyNum = new Date().getTime() + Math.random()*1000;
                    res.send({msg:"登录成功", status:true, verify:verifyNum});
                }else{
                    res.send({msg:"密码错误", status:false});
                }
            }
        }
    });
});

// 处理404情况
router.get('*', function(req, res){
    fs.readFile("./views/notFound.html", 'utf8', function(error, data){
        if(error){
            return
        }else{
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    });
});

// 3、导出router
module.exports = router;
