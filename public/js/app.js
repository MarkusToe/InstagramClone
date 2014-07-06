var instagramclone = angular.module("instagramclone", []);

instagramclone.controller("AppCtrl", function ($http) {
    var app = this;
    $http.get("http://localhost:3000/images").success(function (images) {
        app.images = images;
    })
});