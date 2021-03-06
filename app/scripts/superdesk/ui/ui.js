define([
    'angular',
    'require',
    './autoheight-directive'
], function(angular, require) {
    'use strict';

    /**
     * Gives toggle functionality to the box
     *
     * Usage:
     * <div sd-toggle-box data-title="Some title" data-open="true" data-icon="list"></div>
     *
     */
    function ToggleBoxDirective() {
    	return {
            templateUrl: 'scripts/superdesk/ui/views/toggle-box.html',
            transclude: true,
            scope: true,
            link: function($scope, element, attrs) {
                $scope.title = attrs.title;
                $scope.isOpen = attrs.open === 'true';
                $scope.icon = attrs.icon;
                $scope.toggleModule = function() {
                    $scope.isOpen = !$scope.isOpen;
                };
            }
        };
    }

    /**
     * Gives top shadow for scroll elements
     *
     * Usage:
     * <div sd-shadow></div>
     *
     */
    ShadowDirective.$inject = ['$timeout'];
    function ShadowDirective($timeout) {
        return {
            link: function(scope, element, attrs) {

                $timeout(function() {
                    var el = $(element);
                    var shadow = $('<div class="scroll-shadow"><div class="inner"></div></div>');

                    el.addClass('shadow-list-holder');
                    el.parent().prepend(shadow);

                    el.scroll(function() {
                        if ($(this).scrollTop() > 0) {
                            shadow.addClass('shadow');
                        } else {
                            shadow.removeClass('shadow');
                        }
                    });
                }, 500);
            }
        };
    }

    /**
     * Convert newline charachter from text into given html element (default <br/>)
     *
     * Usage:
     * <div data-html="text | nl2el"></div>
     * or
     * <div data-html="text | nl2el:'</p><p>'"></div> for specific replace element
     */
    function NewlineToElement() {
        return function(input, el) {
            return input.replace(/(?:\r\n|\r|\n)/g, el || '<br/>');
        };
    }

    return angular.module('superdesk.ui', [])

        .directive('sdShadow', ShadowDirective)
        .directive('sdAutoHeight', require('./autoheight-directive'))
        .directive('sdToggleBox', ToggleBoxDirective)
        .filter('nl2el', NewlineToElement);
});
