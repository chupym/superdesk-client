define([
    'lodash',
    'require',
    'angular',
    './controllers/list',
    './directives'
], function(_, require, angular) {
    'use strict';

    return angular.module('superdesk.workflow', [
        'superdesk.workflow.directives',
        'superdesk.typeahead.directives'])
        .config(['superdeskProvider', function(superdesk) {
            superdesk.activity('/workflow', {
                label: gettext('Workflow'),
                controller: require('./controllers/list'),
                templateUrl: require.toUrl('./views/workflow-list.html'),
                category: superdesk.MENU_MAIN,
                priority: 1001
            });
        }])
        .config(['apiProvider', function(apiProvider) {
            apiProvider.api('workstation', {
                type: 'http',
                backend: {rel: 'workstation'}
            }).api('workflow', {
                type: 'http',
                backend: {rel: 'workflow'}
            });
        }]);
});
