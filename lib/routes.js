/**
 * Created by markustorok on 02/07/14.
 */

// load up the user model
var Image = require('../lib/models/image');
var User = require('../lib/models/user');
var amqp = require("amqp");

module.exports = function (app, passport, multer, fs, imagemagick, rabbitMq, io) {

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {

        app.e = app.rabbitMqConnection.exchange('image-exchange', {type: 'fanout'});
        app.exc = app.rabbitMqConnection.exchange('image-resize-exchange', {type: 'fanout'});

        Image.find(function (err, images) {
            res.render('index',
                {
                    images: images,
                    user: req.user,
                    connectionStatus: app.connectionStatus,
                    exchangeStatus: app.exchangeStatus,
                    queueStatus: app.queueStatus
                });
        })
    });

    /*    // Messaging ===============================
     app.post('/start-server', function(req, res){
     app.rabbitMqConnection = amqp.createConnection({ host: 'localhost' });
     app.rabbitMqConnection.on('ready', function(){
     app.connectionStatus = 'Connected!';
     res.redirect('/');
     });
     });

     app.post('/new-exchange', function(req, res){
     app.e = app.rabbitMqConnection.exchange('test-exchange');
     app.exchangeStatus = 'An exchange has been established!';
     res.redirect('/');
     });

     app.post('/new-queue', function(req, res){
     app.q = app.rabbitMqConnection.queue('test-queue');
     app.queueStatus = 'The queue is ready for use!';
     res.redirect('/');
     });

     app.get('/message-service', function(req, res){
     // bind our app.q message queue to our app.e message exchange
     app.q.bind(app.e, '#');
     res.render('message-service',
     {
     title: 'Welcome to the messaging service',
     sentMessage: ''
     });
     });

     app.post('/newMessage', function(req, res){
     var newMessage = req.body.newMessage;

     console.log(newMessage);

     app.e.publish('routingKey', { message: newMessage });

     app.q.subscribe(function(msg){

     console.log(msg);

     res.render('/message-service',
     {
     title: 'You\'ve got mail!',
     sentMessage: msg.message
     });
     });
     });*/

    app.get('/images', function(req, res) {
        Image.find(function(err, images) {
            res.send(images);
        })
    });

    app.get('/images/:username', function(req, res) {
        User.findOne({'username': req.params.username}, function (err, user) {
            Image.find({'user_id': user.id}, function (err, images) {
                res.send(images);
            });
        })
    });

    app.get('/profile/:username?', function (req, res) {
        var userParam = req.params.username;

        io.sockets.emit('username-socket')

        // username parameter was not given
        if (!userParam) {
            // and user is logged in
            if (req.isAuthenticated()) {
                User.findOne({'username': req.user.username}, function (err, user) {
                    Image.find(
                        { "$or": [
                            {"user_id": user.id},
                            {"user_name": {"$in": user.friends}}
                        ] },
                        function (err, images) {
                            res.render('profile',
                                {
                                    username: req.user.username,
                                    images: images, ownPage: true,
                                    loggedIn: true, user: req.user,
                                    friends: req.user.friends
                                });
                    });
                })
            } else {
                res.redirect('/');
            }

            // if username parameter was given
        } else {
            if (req.isAuthenticated()) {

                var ownPage = false;

                if (req.user.username == userParam)
                    ownPage = true;

                User.findOne({'username': userParam}, function (err, user) {
                    Image.find(
                        { "$or": [
                            {"user_id": user.id},
                            {"user_name": {"$in": user.friends}}
                        ] },
                        function (err, images) {
                            res.render('profile',
                                {
                                    username: userParam,
                                    images: images,
                                    loggedIn: true,
                                    ownPage: ownPage,
                                    user: req.user
                                });
                    });
                });
            } else {
                User.findOne({'username': userParam}, function (err, user) {
                    Image.find({'user_id': user.id}, function (err, images) {
                        res.render('profile',
                            {
                                username: userParam,
                                images: images,
                                loggedIn: false,
                                user: req.user
                            });
                    });
                })
            }
        }
    });

    app.get('/follow/:user', function (req, res) {
        var userToFollow = req.params.user;

        User.findOne({'username': userToFollow}, function (err, userToFollow) {
            var followId = userToFollow.username;

            User.update({'username': req.user.username}, { "$push": { "friends": followId }}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added");
                }
            });
            res.redirect('/profile/' + userToFollow.username);
        })
    })

    // LOGIN ===============================
    app.get('/login', function (req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP ==============================
    app.get('/signup', function (req, res) {
        res.render('signup', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // FILEUPLOAD ==========================
    app.post('/upload', function (req, res, next) {

        fs.readFile(req.files.image.path, function (err, data) {

            var imageName = req.files.image.name;

            /// If there's an error
            if(!imageName){
                res.redirect("/profile");
                res.end();

            } else {

                var newPath = __dirname + "/../public/uploads/fullsize/" + imageName;
                var thumbPath = __dirname + "/../public/uploads/thumbs/" + imageName;

                // write image path to database
                var image = new Image(
                    {
                        fullSizePath: "/uploads/fullsize/" + imageName,
                        thumbPath: "/uploads/thumbs/" + imageName,
                        user_id: req.user._id,
                        user_name: req.user.username
                    });

                image.save(function (err) {
                    if (err) {
                        console.log('failed');
                    } else {
                        console.log('saved');
                    }
                });

                /// write file to uploads/fullsize folder
                fs.writeFile(newPath, data, function (err) {

                    app.e.publish('routingKey',
                        {
                            srcPath: newPath,
                            dstPath: thumbPath,
                            imageName: imageName,
                            user_name: req.user.username
                        });

                    /// let's see it
                    res.redirect("/uploads/fullsize/" + imageName);

                });
            }
        });

    });

    // Show files
    app.get('/uploads/fullsize/:file', function (req, res){
        file = req.params.file;
        var img = fs.readFileSync(__dirname + "/../public/uploads/fullsize/" + file);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');
    });

    app.get('/uploads/thumbs/:file', function (req, res) {
        file = req.params.file;
        var img = fs.readFileSync(__dirname + "/../public/uploads/thumbs/" + file);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');

    });

    // custom 404 page
    app.use(function (req, res, next) {
        res.status(404);
        res.render('404');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}