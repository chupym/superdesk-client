define([
    'lodash',
    'require',
    'angular',
    './controllers/list-workstation',
    './controllers/list-workitem',
    './directives'
], function(_, require, angular) {
    'use strict';

    return angular.module('superdesk.workflow', [
        'superdesk.workflow.directives',
        'superdesk.typeahead.directives'])
        .config(['superdeskProvider', function(superdesk) {
            superdesk.activity('/workflow', {
                label: gettext('Workflow'),
                controller: require('./controllers/list-workstation'),
                templateUrl: require.toUrl('./views/workstation-list.html'),
                category: superdesk.MENU_MAIN,
                priority: 1001
            });
        }])
        .config(['superdeskProvider', function(superdesk) {
            superdesk.activity('/workitem', {
                label: gettext('Task'),
                controller: require('./controllers/list-workitem'),
                templateUrl: require.toUrl('./views/workplace-view.html'),
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
            }).api('workplace', {
                type: 'http',
                backend: {rel: 'workplace'}
            }).api('workitem', {
                type: 'http',
                backend: {rel: 'workitem'}
            });
        }]);
});
