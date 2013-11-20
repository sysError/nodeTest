
/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('login', { title: 'Express',nap:'napster' });
// };

module.exports = function(app) {

	var crypto = require('crypto');
	var User = require('../models/user');
	var Post = require('../models/post');

	//登陆拦截器
	app.get('/*',function(req,res,next) {
		req.session.error = null;
		req.session.success = null;
		var url = req.originalUrl;
	    if (url != '/login' && url != '/' && !req.session.user) {
	        return res.redirect('/login');
	    }
	    next();
	})


	app.get('/',function(req, res) {
		try{
			Post.getPostsByCount(9,function(err, posts) {
				if(err) {
					req.session.error = err;
					return res.redirect('/');
				}
				
				res.render('index',{
					title : '首页',
					posts : posts
				});
				
			});
		}catch(e){
			console.log('Exception Coursor')
		}
		
	});

	app.get('/modifyPwd', function(req, res) {
		req.session.error = null;
		res.render('modifyPwd',{
			title : '修改口令'
		});
	});

	app.post('/modifyPwd',function(req, res) {
		var password = req.body['password'];
		var passwordRepeat = req.body['password-repeat'];

		//检测密码长度为6~20位之间
		if(password.length < 6 || password.length > 20) {
			req.session.error = 'pwdformaterror';
			return res.redirect('/modifyPwd');
		}

		//检测用户两次输入的口令是否一致
		if(password != passwordRepeat) {
			req.session.error = 'pwdnothesanme';
			return res.redirect('/modifyPwd');
		}

		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var newPassword = md5.update(password).digest('base64');

		if(req.session.user.password != newPassword) {
			//检查口令是否已经存在
			User.get(newPassword, function(err, user) {
				if(user) {
					req.session.error = 'passwordisexsit';
					return res.redirect('/modifyPwd');
				}
				if(err) {
					req.session.error = err;
					return res.redirect('/modifyPwd');
				}

				//如果不存在则更新该用户口令
				User.set(req.session.user,newPassword,function(err,result) {
					console.log('>>third<<');
					req.session.success = 'success';
					return res.redirect('/modifyPwd');
				})

			});
		}else{
			req.session.success = 'success';
			return res.redirect('/modifyPwd');
		}

		
	}); 


	app.get('/login' , function(req, res) {
		res.render('login', {
			title : '用户登入'
		});
	});	

	//新成员录入
	app.get('/addUser' , function(req, res) {
		res.render('addUser', {
			title : '新成员录入'
		});
	});	

	app.post('/addUser',function(req,res) {
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password || '123456').digest('base64');

		var name = req.body.name;
		var mobile = req.body.mobile;
		var authority = req.body.authority;

		if(name.replace(/\s*/g,'') === '') {
			req.session.error = 'namenotnull';
			return res.redirect('/addUser');
		}
		if(mobile.replace(/\s*/g,'') === '') {
			req.session.error = 'mobilenotnull';
			return res.redirect('/addUser');
		}
		if(!(/^1[3|4|5|8][0-9]\d{4,8}$/.test(mobile))){ 
			req.session.error = 'mobileformaterror';
		return res.redirect('/addUser');
		}

		var newUser = new User({
			 name : name,
			 password : password,
			 role : authority,
			 mobile : mobile
		});

		//将新成员录入数据库
		newUser.save(function(err) {
			if(err) {
				console.log(err)
				req.session.error = 'saveError';
				return res.redirect('/addUser');
			}
			
			// req.session.user = newUser;
			req.session.success = 'saveSuccess';
			req.session.error = null;
			
			res.redirect('/addUser');
		});

	});

	app.post('/login',function(req, res) {
		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		User.get(password, function(err, user) {
			if(!user) {
				req.session.error = 'usernotexsit';
				return res.redirect('/login');
			}
			// if(user.password != password) {
			// 	req.session.error = 'pwderror';
			// 	return res.redirect('/login');
			// }
			console.log(user)
			req.session.user = user;
			req.session.success = '登入成功';
			req.session.error = null;
			res.redirect('/');
		});
	});

	app.get('/logout', function(req, res) {
		req.session.user =  null;
		req.session.success = '登出成功';
		res.redirect('/');
	});

	app.get('/webList' , function(req, res) {
		var user = new User(req.session.user);
		user.getUsers(function(err,datas) {
			user.getAdmins(function(err,data) {
				res.render('webList', {
					title : '前端人员名单列表',
					users : datas,
					admin : data
				});
			})
		})
	});	

	// app.post('/post',function(req, res) {
	// 	var currentUser = req.session.user;
	// 	var post = new Post(currentUser.name, req.body.post);
	// 	post.save(function(err) {
	// 		if(err) {
	// 			req.session.error = err;
	// 			return res.redirect('/');
	// 		}
	// 		req.session.success = '发表成功';
	// 		res.redirect('/u/'+currentUser.name);
	// 	});
	// });

	app.get('/u/:user', function(req, res) {
		User.get(req.params.user, function(err, user) {
			if(!user) {
				req.session.error = '用户名不存在';
				req.session.success = '';
				return res.redirect('/');
			}
			Post.get(user.name,function(err, posts) {
				if(err) {
					req.session.error = err;
					return res.redirect('/');
				}
				res.render('user', {
					title : user.name,
					posts : posts 
				});
			});
		});
	});


};