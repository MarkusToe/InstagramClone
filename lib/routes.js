/**
 * Created by markustorok on 02/07/14.
 */

module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('login');
    });

// custom 404 page
    app.use(function (req, res, next) {
        res.status(404);
        res.render('404');
    });
}