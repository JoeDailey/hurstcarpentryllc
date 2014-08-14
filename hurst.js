global.fs = require('fs');
global.secret = JSON.parse(fs.readFileSync(__dirname+"/.secret.json", 'utf8'));
global.settings = JSON.parse(fs.readFileSync(__dirname+"/settings.json", 'utf8'));
global.__project_dirname = __dirname;
var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/db.sqlite";
global.path = require('path');
var exists = fs.existsSync(file);
if (!exists) {
	console.log("Creating DB file.");
	fs.openSync(file, "w");
}
global.db = new sqlite3.Database(file);
if (!exists) {
	console.log("creating new db");
	db.serialize(function () {
		db.run('CREATE TABLE "showcases"("showcase_id" blob PRIMARY KEY NOT NULL, '+
										'"title" BLOB NOT NULL, '+
										'"filter_id" BLOB NOT NULL, '+
										'"about" BLOB NOT NULL, '+
										'"location" BLOB NOT NULL, '+
										'"price" BOOLEAN NOT NULL DEFAULT FALSE, '+
										'"created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP));');
		db.run('CREATE TABLE "comments" ("comment_id" BLOB PRIMARY KEY NOT NULL, '+
										'"comment_parent" BLOB NOT NULL, '+
										'"email_address" BLOB NOT NULL, '+
										'"created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP));');
		db.run('CREATE TABLE "filters"  ("filter_id" BLOB PRIMARY KEY NOT NULL, '+
										'"type" BLOB NOT NULL, '+
										'"details" BLOB NOT NULL, '+
										'"price" BLOB NOT NULL, '+
										'"price_per" BLOB NOT NULL, '+
										'"created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP));');
		db.run('CREATE TABLE "images"  ("image_id" BLOB PRIMARY KEY NOT NULL, '+
										'"image_url" BLOB NOT NULL, '+
										'"showcase_id" BLOB NOT NULL, '+
										'"image_order" INTEGER NOT NULL, '+
										'"created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP));');
	});
 }

global.nm = require("nodemailer");
global.s4 = function() {return Math.floor((1 + Math.random()) * 0x10000).toString(36);};

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// global.busboy = require('connect-busboy');

var routes = require('./routes/index');
var admin = require('./routes/admin');
var set = require('./routes/set');

var hurst = express();

// view engine setup
hurst.set('views', path.join(__dirname, 'views'));
hurst.set('view engine', 'ejs');

hurst.use(favicon());
hurst.use(logger('dev'));
// hurst.use(bodyParser.json());
// hurst.use(bodyParser.urlencoded({extended: true}));
hurst.use(cookieParser(""+secret.session));
hurst.use(session({
	"secret":""+secret.session+secret.session,
	 saveUninitialized: true,
	 resave: true
}));

hurst.use(express.static(path.join(__dirname, 'public')));

hurst.listen(5000);


hurst.use('/', routes);
hurst.use('/admin', admin);
hurst.use('/admin/set', set);


/// catch 404 and forward to error handler
hurst.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (hurst.get('env') === 'development') {
	hurst.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
hurst.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = hurst;
