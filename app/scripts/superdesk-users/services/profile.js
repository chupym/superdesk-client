define(['angular'], function(angular) {
    'use strict';

    var module = angular.module('superdesk.users.services', []);

    module.service('profileService', ['api', function(api) {
        /**
         * User profile service
         */
        return {
            getUserActivity: function(user, maxResults, page) {
                var q = {
                    where: {user: user._id},
                    sort: '[(\'_created\',-1)]',
                    embedded: {user: 1}
                };

                if (maxResults) {
                    q.max_results = maxResults;
                }

                if (page > 1) {
                    q.page = page;
                }

                return api.activity.query(q);
            },

            getUserActivityFiltered: function(maxResults, page) {
                var q = {
                    sort: '[(\'_created\',-1)]',
                    embedded: {user: 1}
                };

                if (maxResults) {
                    q.max_results = maxResults;
                }

                if (page > 1) {
                    q.page = page;
                }

                return api.activity.query(q);
            }
        };
    }]);
});
