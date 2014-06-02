var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var util = require('./routes/util');

var hurst = express();

// view engine setup
hurst.set('views', path.join(__dirname, 'views'));
hurst.set('view engine', 'ejs');

hurst.use(favicon());
hurst.use(logger('dev'));
hurst.use(bodyParser.json());
hurst.use(bodyParser.urlencoded());
hurst.use(cookieParser());
hurst.use(express.static(path.join(__dirname, 'public')));

hurst.listen(5000);

hurst.get('/', routes.index);
hurst.get('/gallery', routes.gallery);
hurst.get('/', routes.index);


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
