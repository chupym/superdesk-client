define([], function() {
    'use strict';

    /**
     * Service for fetching users with caching.
     * Ideally, should be used app-wide.
     */
    UserListService.$inject = ['api', '$q', '$cacheFactory'];
    function UserListService(api, $q, $cacheFactory) {

        var userservice = {};

        var perPage = 100;
        var cache = $cacheFactory('userList');

        var DEFAULT_CACHE_KEY = '_nosearch';
        var DEFAULT_PAGE = 1;

        /**
         * Fetches and caches users, or returns from the cache.
         *
         * @param {String} search
         * @param {Integer} page (Shouldn't be used at the moment)
         * @returns {Promise}
         */
        userservice.get = function(search, page) {
            page = page || DEFAULT_PAGE;
            var key = search || DEFAULT_CACHE_KEY;
            key = buildKey(key, page);

            var value = cache.get(key);
            if (value) {
                return $q.when(value);
            } else {
                var criteria = {
                    max_results: perPage
                };
                if (search) {
                    criteria.where = JSON.stringify({
                        '$or': [
                            {username: {'$regex': search}},
                            {first_name: {'$regex': search}},
                            {last_name: {'$regex': search}},
                            {display_name: {'$regex': search}},
                            {email: {'$regex': search}}
                        ]
                    });
                }

                return api('users').query(criteria)
                .then(function(result) {
                    cache.put(key, result);
                    return result;
                });
            }
        };

        /**
         * Fetch single user from default cache, or make new api call
         *
         * @param {String} id of user
         * @returns {Promise}
         */
        userservice.getUser = function(id) {
            var default_cache = buildKey(DEFAULT_CACHE_KEY, DEFAULT_PAGE);

            var value = cache.get(default_cache);
            if (value) {
                var user = _.find(value._items, {_id: id});
                if (user) {
                    return $q.when(user);
                }
            }

            return api('users').getById(id)
            .then(function(result) {
                return result;
            });

        };

        function buildKey(key, page) {
            return key + '_' + page;
        }

        return userservice;
    }

    return UserListService;
});
