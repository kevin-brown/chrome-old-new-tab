'use strict';
var controllers = angular.module('newTab.controllers', ['newTab.services']);

controllers.controller('MainController',
                       ['$scope', 'Apps',
                        function ($scope, Apps) {
    var show_top_key = 'old_ntp.show_top';

    $scope.tabs = {
        show_top: false
    };

    $(window).on("keydown", function (e) {
        if (e.which == 37) { // Left arrow key
            if (!$scope.tabs.show_top) {
                $scope.tabs.show_top = true;
            }
        } else if (e.which == 39) { // Right arrow key
            if ($scope.tabs.show_top) {
                $scope.tabs.show_top = false;
            }
        } else {
            return;
        }

        $scope.$apply();
    });

    $(window).on("mousewheel", function (e) {
        var delta = e.originalEvent.wheelDelta;

        if (delta > 0) { // Scrolling up/left
            if (!$scope.tabs.show_top) {
                $scope.tabs.show_top = true;
            }
        } else { // Scrolling down/right
            if ($scope.tabs.show_top) {
                $scope.tabs.show_top = false;
            }
        }

        $scope.$apply();
    });

    function savePreferences() {
        var obj = {};

        obj[show_top_key] = $scope.tabs.show_top;

        Apps.saveSetting(obj);

        // reload bookmarks and topSites
        loadBookmarks();
        loadTopSites();
    };

    function loadBookmarks() {
        return Apps.getBookmarksBar(12)
            .then(function (results) {
                $scope.bookmarks = results;
            });
    }

    function loadTopSites() {
        return Apps.topSites().then(function (sites) {
            $scope.top = sites.slice(0, 12);
        });
    }

    function loadApps() {
        return Apps.getAll()
            .then(function(results){
                $scope.apps = results.filter(function(result){
                    return (/^(extension|theme)$/).test(result.type) === false;
                });
            });
    }

    $scope.$on('UninstalledApp', loadApps);

    $scope.$watch("tabs.show_top", function () {
        savePreferences();
    });

    // initial page setup
    var querySettings = [show_top_key];

    Apps.getSetting(querySettings)
        .then(function(settings) {
            $scope.tabs.show_top = settings[show_top_key];
        })
        .then(function(){
            loadApps()
                .then(function(){
                    loadBookmarks();
                    loadTopSites();
                });
        })
        .then(function setupWatches(){
            $scope.$watch('bookmark_count', loadBookmarks);
            $scope.$watch('top_count', loadTopSites);
        });
}]);
