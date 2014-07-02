/**
 * Created by markustorok on 02/07/14.
 */

var express = require('express');
var http = require('http');

var app = express();

// set up handlebars view engine
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 3000);

//=Middleware==================================================================================================
app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

//=Routes======================================================================================================
app.get('/', function (req, res) {
    res.render('login');
});

// custom 404 page
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});