var amqp = require("amqp");
var imagemagick = require("imagemagick");

//create connection with amqp
var rabbitMq = amqp.createConnection({ host: 'localhost' });

module.exports = function (app) {

    rabbitMq.on('ready', function () {

        rabbitMq.queue('image-queue', function (q) {
            q.bind("image-exchange", "#");
            q.subscribe(function (message) {

                var srcPath = message.srcPath;
                var dstPath = message.dstPath;

                /// write file to uploads/thumbs folder
                imagemagick.resize({
                    srcPath: srcPath,
                    dstPath: dstPath,
                    width: 200
                }, function (err, stdout, stderr) {
                    if (err) throw err;
                    console.log('resized image to fit within 200x200px');

                    app.exc.publish('routingKey', {imageName: message.imageName, user_name: message.user_name});
                });
            })
        })
    })
}