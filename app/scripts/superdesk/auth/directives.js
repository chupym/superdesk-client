define([
    'jquery',
    'angular',
    'superdesk/auth/services',
    'bootstrap/bootstrap-modal'
], function($, angular) {
    'use strict';

    angular.module('superdesk.auth.directives', ['superdesk.auth.services']).
        directive('sdLoginModal', function($rootScope, authService) {
            return {
                restrict: 'A',
                replace: true,
                scope: {},
                templateUrl: 'scripts/superdesk/auth/views/login.html',
                link: function($scope, element, attrs) {
                    function doLogin() {
                        $(element).modal('show');
                        $(element).find('#username').focus();
                    }

                    $(element).modal({
                        keyboard: false,
                        show: false
                    });

                    $scope.submit = function() {
                        authService.login($scope.username, $scope.password, $scope.rememberMe).
                            then(function() {
                                $scope.password = null;
                                $scope.loginError = false;
                                $(element).modal('hide');
                            }, function() {
                                $scope.password = null;
                                $scope.loginError = true;
                            });
                    };

                    $rootScope.$on('auth.doLogin', doLogin);
                    if (!authService.hasIdentity()) {
                        doLogin();
                    }
                }
            };
        });
});