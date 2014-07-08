var mongoose = require("mongoose");

var imageSchema = mongoose.Schema({
    fullSizePath: String,
    thumbPath: String,
    user_id: String,
    user_name: String
});

// create the model for users and expose it to our app
// module.exports is the object that's actually returned as the result of a require call.
module.exports = mongoose.model('Image', imageSchema);