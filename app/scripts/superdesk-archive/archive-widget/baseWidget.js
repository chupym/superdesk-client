(function() {
    'use strict';

    angular.module('superdesk.widgets.base', [])
        .factory('BaseWidgetController', ['$location', '$timeout', 'superdesk', 'storage', 'es',
        function BaseWidgetControllerFactory($location, $timeout, superdesk, storage, es) {

            var INGEST_EVENT = 'ingest:update';

            return function BaseWidgetController($scope) {
                var config;
                var refresh = _.debounce(_refresh, 1000);
                var pinnedList = {};

                $scope.selected = null;
                $scope.pinnedItems = storage.getItem($scope.type + ':pinned') || [];
                _.each($scope.pinnedItems, function(item) {
                    pinnedList[item._id] = true;
                });
                $scope.processedItems = null;

                $scope.$on(INGEST_EVENT, function() {
                    $timeout(refresh);
                });

                $scope.$watchGroup({
                    provider: 'widget.configuration.provider',
                    size: 'widget.configuration.maxItems',
                    search: 'query || widget.configuration.search',
                    item: 'item',
                    headline: 'headline'
                }, function(vals) {
                    config = vals || {};
                    refresh();
                });

                function moreLikeThis(item) {
                    var filters = [];

                    if (item.slugline) {
                        filters.push({term: {slugline: item.slugline}});
                    }

                    if (item.subject && item.subject.length) {
                        filters.push({terms: {'subject.code': _.pluck(item.subject, 'code')}});
                    }

                    return filters;
                }

                function getSearchCriteria(config) {
                    var params = {
                        q: config.search || null,
                        size: config.size || 10
                    };

                    var filters = [];
                    if (config.provider && config.provider !== 'all') {
                        filters.push({term: {provider: config.provider}});
                    }

                    if (config.item && !config.search) {
                        var itemFilters = moreLikeThis(config.item);
                        if (itemFilters.length) {
                            filters.push({or: itemFilters});
                        } else {
                            params.q = config.item.headline || null;
                        }
                    }

                    var result = es(params, filters);
                    result.sort = [{firstcreated: 'desc'}];

                    return result;
                }

                function processItems() {
                    $scope.processedItems = $scope.pinnedItems.concat($scope.items._items);
                }

                function _refresh() {
                    var criteria = getSearchCriteria(config);
                    $scope.api.query({source: criteria}).then(function(items) {
                        $scope.items = items;
                        processItems();
                    });
                }

                $scope.view = function(item) {
                    $scope.selected = item;
                };

                $scope.go = function(item) {
                    $location.path('/workspace/content');
                    $location.search('_id', item._id);
                };

                $scope.pin = function(item) {
                    var newItem = _.cloneDeep(item);
                    newItem.pinnedInstance = true;
                    $scope.pinnedItems.push(newItem);
                    $scope.pinnedItems = _.uniq($scope.pinnedItems, '_id');
                    pinnedList[item._id] = true;
                    storage.setItem($scope.type + ':pinned', $scope.pinnedItems);
                    processItems();
                };

                $scope.unpin = function(item) {
                    _.remove($scope.pinnedItems, {_id: item._id});
                    pinnedList[item._id] = false;
                    storage.setItem($scope.type + ':pinned', $scope.pinnedItems);
                    processItems();
                };

                $scope.isPinned = function(item) {
                    return !!pinnedList[item._id];
                };
            };
        }])
        .factory('BaseWidgetConfigController', [
        function BaseWidgetConfigControllerFactory() {

            return function BaseWidgetConfigController($scope) {
                $scope.fetchProviders = function() {
                    $scope.api.query({source: {size: 0}}).then(function(items) {
                        $scope.availableProviders = ['all'].concat(_.pluck(items._facets.provider.terms, 'term'));
                    });
                };

                $scope.notIn = function(haystack) {
                    return function(needle) {
                        return haystack.indexOf(needle) === -1;
                    };
                };
            };
        }]);
})();
