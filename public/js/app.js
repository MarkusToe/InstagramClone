var instagramclone = angular.module("instagramclone", []);

instagramclone.controller("AppCtrl", function ($scope, $http) {
    var app = this;
    $http.get("http://localhost:3000/images").success(function (images) {
        app.images = images;
    });

    $scope.makeGallery = function (user) {
        console.log("in the function");
        $http.get("http://localhost:3000/images/" + user).success(function (images) {
            app.userImages = images;
        });
    }
});

instagramclone.directive("gallery", function () {
    return function (scope, element, attrs) {
        scope.$apply("makeGallery({{attrs.user}})")
    }
})