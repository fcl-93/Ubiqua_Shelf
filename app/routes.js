// app/routes.js
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	//app.get('/', function(req, res) {
	//	res.render('index.ejs'); // load the index.ejs file
	//});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/stock',isLoggedIn, function(req,res){
		res.render('stock.ejs',{
			user: req.user
		});
	});

	app.get('/recipe',isLoggedIn, function(req,res){
		res.render('recipe.ejs',{
			user: req.user
		});
	});

	app.get('/settings',isLoggedIn, function(req,res){
		res.render('settings.ejs',{
			user: req.user
		});
	});

	app.get('/sensor',isLoggedIn, function(req,res){
		res.render('sensor.ejs',{
			user: req.user
		});
	});

	app.get('/shopping_list',isLoggedIn, function(req,res){
		res.render('shopping_list.ejs',{
			user: req.user
		});
	});

    app.get('/product', function(req,res){
        connection.query("SELECT * FROM `device_has_product_stock` ", function(err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){

                res.send({'products':'error'});
            }
            for (var i in rows) {
                res.send({'products':JSON.stringify(rows) });
            }
        });
    });

    app.post('/product',function(req,res){


       /* connection.query("INSERT INTO `device_has_product_stock`(`stock`, `stocked_weight`, `expiration_date`, `state`, `previous_weight`, `product_stock_id`, `device_id`) VALUES ([value-1],[value-2],[value-3],[value-4],[value-5],[value-6],[value-7])", function(err,res){
            if(err) throw err;

            console.log('Last insert ID:', res.insertId);
	    */

    });

    app.get('/product/:product_id/weight', function(req,res){
        connection.query("SELECT stocked_weight FROM `device_has_product_stock` where product_stock_id=" + req.params.product_id, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){

				res.send({'stocked_weight':'error'});
			}
            for (var i in rows) {
                res.send({'stocked_weight':rows[i].stocked_weight });
            }
        });
	});

    app.get('/product/:product_id/stock', function(req,res){
        connection.query("SELECT state FROM `device_has_product_stock` where product_stock_id=" + req.params.product_id, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){

                res.send({'state':'error'});
            }
            for (var i in rows) {
                res.send({'state':rows[i].state });
            }
        });
    });

    app.get('/product/:product_id/expiration_date',function(req,res){
        connection.query("SELECT expiration_date FROM `device_has_product_stock` where product_stock_id=" + req.params.product_id, function(err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){

                res.send({'expiration_date':'error'});
            }
            for (var i in rows) {
                res.send({'expiration_date':rows[i].expiration_date });
            }
        });
    });

    app.get('/shopping_list', function(req,res){
        connection.query("SELECT * FROM `device_has_product_stock` where stock='TOBUY'", function (err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){
                res.send({'c':'Non'});
            }

            var shopping_list = [];
            for (var i in rows) {
                connection.query("SELECT * FROM `product_stock`" +
                    "where product_stock.product_id = '" + rows[i].product_stock_id + "'", function (err, line, fields) {
                    if (err) throw err;
                    console.log(line.length);
                    if (line.length === 0) {
                        res.send({'c': 'Non'});
                    }
                    shopping_list.push({'product_name': line.product_name, 'stock': rows[i].stock});
                });
            }
            res.send({'shopping_list': JSON.stringify(shopping_list)});
        });
    });

    app.post('/spopping_list', function (req, res) {
        var product = req.body.product_name;

    });

    app.get('/device', function(req,res){
    });

    app.post('/device',function(req,res) {
        var device_name = req.body.device_name;
        console.log(Date.now());
        console.log(device_name);
        var formatedMysqlString = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        connection.query('SELECT `id`, `device_name`, `updated_on` FROM `device` WHERE device_name="'+device_name+'"', function (err, rows, fields) {
            if (err) throw err;
            console.log(rows.length);
            if(rows.length === 0){
                connection.beginTransaction(function(err) {
                    connection.query('INSERT INTO `device`(`device_name`, `updated_on`) VALUES ("' + device_name + '","' + formatedMysqlString + '")', function (err, rows, fields) {
                        if (err) {
                            connection.rollback(function() {
                                throw err;
                            });
                        }
                        connection.commit(function(err) {
                            if (err) {
                                connection.rollback(function () {
                                    throw err;
                                });
                            }
                        });
                        res.send('ok');
                    });
                });
            }else{
                res.send('unable to add device');
            }
        });
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
