define([], function() {
    'use strict';

    ChangeAvatarController.$inject = ['$scope'];
    function ChangeAvatarController($scope) {

        $scope.method = 'computer';
        $scope.preview = {url: null};

        $scope.setMethod = function(method) {
            $scope.method = method;
            $scope.preview.url = null;
        };

        $scope.upload = function(config) {
            return $scope.resolve(config);
        };
    }

    return ChangeAvatarController;
});