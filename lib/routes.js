/**
 * Created by markustorok on 02/07/14.
 */

// load up the user model
var Image = require('../lib/models/image');

module.exports = function (app, passport, multer, fs, imagemagick) {

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        Image.find(function (err, images) {
            res.render('index', images);
        })
    });

    app.get('/images', function (req, res) {
        Image.find(function (err, images) {
            res.send(images);
        });
    });

    app.get('/profile', isLoggedIn, function (req, res) {

        var query = Image.find({'user_id': req.user._id});

        query.exec(function (err, images) {
            res.render('profile', {username: req.user.username, images: images});
        });
    });

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

    // FILEUPLOAD ==========================
    app.post('/upload', function (req, res, next) {

        fs.readFile(req.files.image.path, function (err, data) {

            var imageName = req.files.image.name;
            console.log("User ID:");
            console.log(req.user._id);

            /// If there's an error
            if(!imageName){
                res.redirect("/profile");
                res.end();

            } else {

                var newPath = __dirname + "/../public/uploads/fullsize/" + imageName;
                var thumbPath = __dirname + "/../public/uploads/thumbs/" + imageName;

                var image = new Image({fullSizePath: "/uploads/fullsize/" + imageName, thumbPath: "/uploads/thumbs/" + imageName, user_id: req.user._id});
                image.save(function (err) {
                    if (err) {
                        console.log('failed');
                    } else {
                        console.log('saved');
                    }
                });

                /// write file to uploads/fullsize folder
                fs.writeFile(newPath, data, function (err) {

                    /// write file to uploads/thumbs folder
                    imagemagick.resize({
                        srcPath: newPath,
                        dstPath: thumbPath,
                        width: 200
                    }, function (err, stdout, stderr) {
                        if (err) throw err;
                        console.log('resized image to fit within 200x200px');
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
        var img = fs.readFileSync(__dirname + "/uploads/thumbs/" + file);
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