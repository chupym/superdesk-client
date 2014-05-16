define([
    'angular',
    'require'
], function(angular, require) {
    'use strict';

    angular.module('superdesk.widgets.ingeststats', [])
        .config(['superdeskProvider', function(superdesk) {
            superdesk
                .widget('ingest-stats', {
                    label: 'Ingest Stats',
                    multiple: true,
                    icon: 'signal',
                    max_sizex: 1,
                    max_sizey: 1,
                    sizex: 1,
                    sizey: 1,
                    thumbnail: require.toUrl('./thumbnail.png'),
                    template: require.toUrl('./widget-ingeststats.html'),
                    configurationTemplate: require.toUrl('./configuration.html'),
                    configuration: {
                        source: 'provider',
                        colorScheme: 'superdesk',
                        updateInterval: 5
                    },
                    description: 'Displaying news ingest statistics. You have ability to switch color themes or graph sources.'
                });
        }])
        .controller('IngestStatsController', ['$scope', '$timeout', 'em',
        function ($scope, $timeout, em) {
            function updateData() {
                em.getRepository('ingest').matching().then(function(items) {
                    $scope.items = items;

                    $timeout(function() {
                        updateData();
                    }, $scope.widget.configuration.updateInterval * 1000 * 60);
                });
            }

            updateData();
        }])
        .controller('IngestStatsConfigController', ['$scope', 'colorSchemes',
        function ($scope, colorSchemes) {
            colorSchemes.get(function(colorsData) {
                $scope.schemes = colorsData.schemes;
            });
        }]);
});