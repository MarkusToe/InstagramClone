// set up ======================================================================
var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var fs = require("fs");
var multer = require("multer");
var imagemagick = require("imagemagick");
var cors = require("cors");
var amqp = require("amqp");
var io = require("socket.io")(server);

var morgan = require("morgan");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration
var User = require('./lib/models/user');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(express.static(__dirname + '/public'));
app.use(multer({dest: "./public/uploads/fullsize/"}));
app.use(cors());

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// rabbitmq ====================================================================
app.rabbitMqConnection = amqp.createConnection({ host: 'localhost' });
app.rabbitMqConnection.on('ready', function () {
    console.log("RabbitMQ connected!");
});

require('./lib/image-resize')(app);

// default values for rabbitmq server connection
app.connectionStatus = 'No server connection';
app.exchangeStatus = 'No exchange established';
app.queueStatus = 'No queue established';

// required for passport
app.use(session({ secret: 'officialdoctorchemicalworld' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./lib/routes.js')(app, passport, multer, fs, imagemagick, rabbitMq, io); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
server.listen(port);
console.log('The magic happens on port ' + port);

// socket.io ===================================================================
var rabbitMq = amqp.createConnection({ host: 'localhost' });

var clients = {};

rabbitMq.on('ready', function () {

    console.log("RabbitMQ connected!");

    io.sockets.on('connection', function (socket) {

        clients[socket.id] = socket;

        console.log("Sockets connected!");

        rabbitMq.queue('my-queue', function (q) {
            q.bind("image-resize-exchange", "#");
            q.subscribe(function (message) {
                console.log(message.user_name);

                // get all users where uploading user is in friends-list
                User.find({ friends: { "$in": [message.user_name] } }, function (err, results) {
                    console.log("Friends:");
                    console.log(results);
                });

                io.sockets.emit('new-image', { image: message.imageName, user: message.user_name });
            })
        });
    });
});