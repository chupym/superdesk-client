
'use strict';

angular.module('superdesk.editor', [])
    .directive('sdTextEditor', function() {
        var config = {
            buttons: ['bold', 'italic', 'underline', 'quote']
        };

        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {

                function updateModel() {
                    scope.$apply(function() {
                        ngModel.$setViewValue(elem.html());
                    });
                }

                elem.on('input', updateModel);
                elem.on('blur', updateModel);

                ngModel.$render = function() {
                    elem.empty();
                    elem.html(ngModel.$viewValue || '<p></p>'); // this p can use some css min-height
                    this.editor = new window.MediumEditor(elem, config);
                };
            }
        };
    });
