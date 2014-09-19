define(['lodash'], function(_) {
    'use strict';

    WorkstationListController.$inject = ['$scope', '$location', 'api'];
    function WorkstationListController($scope, $location, api) {
        $scope.maxResults = 25;

        $scope.selected = {workstation: null};
        $scope.createdWorkstations = [];

        $scope.preview = function(workstation) {
            $scope.selected.workstation = workstation;
        };

        $scope.createWorkstation = function() {
            $scope.preview({});
        };

        $scope.closePreview = function() {
            $scope.preview(null);
        };

        $scope.afterDelete = function(data) {
            if ($scope.selected.workstation && data.item && data.item.href === $scope.selected.workstation.href) {
                $scope.selected.workstation = null;
            }
            fetchWorkstations(getCriteria());
        };

        $scope.render = function(workstation) {
            if (_.find($scope.workstations._items, function(item) {
                return item._links.self.href === workstation._links.self.href;
            })) {
                return;
            }

            if (_.find($scope.createdWorkstations, function(item) {
                return item._links.self.href === workstation._links.self.href;
            })) {
                return;
            }

            $scope.createdWorkstations.unshift(workstation);
        };

        function getCriteria() {
            var params = $location.search(),
                criteria = {
                    max_results: $scope.maxResults
                };

            if (params.q) {
                criteria.where = JSON.stringify({
                    '$or': [
                        {name: {'$regex': params.q}}
                    ]
                });
            }

            if (params.page) {
                criteria.page = parseInt(params.page, 10);
            }

            if (params.sort) {
                criteria.sort = formatSort(params.sort[0], params.sort[1]);
            } else {
                criteria.sort = formatSort('name', 'asc');
            }

            return criteria;
        }

        function fetchWorkstations(criteria) {
            api.workstation.query(criteria)
                .then(function(workstations) {
                    $scope.workstations = workstations;
                    $scope.createdWorkstations = [];
                });
        }

        function formatSort(key, dir) {
            var val = dir === 'asc' ? 1 : -1;
            return '[("' + encodeURIComponent(key) + '", ' + val + ')]';
        }

        $scope.$watch(getCriteria, fetchWorkstations, true);
    }

    return WorkstationListController;
});
