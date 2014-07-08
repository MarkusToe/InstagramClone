/**
 * Created by markustorok on 08/07/14.
 */

$(function () {
    var socket = io.connect('http://localhost:3000/');
    var images = [];

    socket.on('new-image', function (data) {
        //if(data.image) {
        console.log('new image');

        images.push(data.image);
        var html = '';
        for (var i = 0; i < images.length; i++) {
            html += "<li><img src=\"" + images[i] + "\" /></li>";
        }
        $('.image-list').append(html);
        //}
    });
});
