var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/instagramclone');

var User = mongoose.model('User', {name: String});

var user = new User({name: "Markus"});
user.save(function (err) {
    if (err) {
        console.log('failed');
    } else {
        console.log('saved');
    }
})
