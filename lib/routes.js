/**
 * Created by markustorok on 02/07/14.
 */

module.exports = function (app, passport, fs) {

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile', {user: req.user});
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
    app.post('/upload', function(req, res) {

        fs.readFile(req.files.image.path, function (err, data) {

            var imageName = req.files.image.name

            /// If there's an error
            if(!imageName){
                res.redirect("/profile");
                res.end();

            } else {

                var newPath = __dirname + "/uploads/fullsize/" + imageName;

                /// write file to uploads/fullsize folder
                fs.writeFile(newPath, data, function (err) {

                    /// let's see it
                    res.redirect("/uploads/fullsize/" + imageName);

                });
            }
        });
    });

    // Show files
    app.get('/uploads/fullsize/:file', function (req, res){
        file = req.params.file;
        var img = fs.readFileSync(__dirname + "/uploads/fullsize/" + file);
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