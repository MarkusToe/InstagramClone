// set up ======================================================================
var express = require('express');
var app = express();
var http = require('http');
var mongoose = require("mongoose");
var passport = require("passport");

var morgan = require("morgan");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

app.set('port', 3000);

app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

// set up handlebars view engine
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// routes ======================================================================
require('./lib/routes.js')(app);

// launch ======================================================================
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
