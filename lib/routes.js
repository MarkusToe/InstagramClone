/**
 * Created by markustorok on 02/07/14.
 */

module.exports = function (app) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/', function (req, res) {
        res.render('login');
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

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