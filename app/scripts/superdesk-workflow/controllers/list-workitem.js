define(['lodash'], function(_) {
    'use strict';

    WorkitemListController.$inject = ['$scope', '$location', 'api', 'session', 'notify'];
    function WorkitemListController($scope, $location, api, session, notify) {
        $scope.maxResults = 25;

        $scope.selected = {workitem: null};
        $scope.createdWorkitems = [];

        function getCriteria() {
            var params = $location.search(),
                criteria = {
                    max_results: $scope.maxResults
                };

            var cwhere = [];
            if ($scope.selected.workplace){
            	cwhere.push({target: $scope.selected.workplace.target});
            }
            if (params.q) {
            	cwhere.push({name: {'$regex': params.q}});
            }
            if (cwhere.length > 0) {
            	criteria.where = JSON.stringify({'$or':cwhere});
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
        
        $scope.selected = {workplace: null};
        api.workplace.query({where: {user: session.identity._id}, sort: '[("name", 1)]'})
            .then(function(workplaces) {
                $scope.workplaces = workplaces._items;
                $scope.select($scope.workplaces[0]);
            });
        
        $scope.select = function(workplace) {
            $scope.selected.workplace = workplace;
            $scope.destinations = [];
            if (workplace.destinations.length > 0) {
	            _.each($scope.workplaces, function(wp) {
	            	if (workplace.destinations.indexOf(wp.target) > -1){
	            		$scope.destinations.push(wp);
	            	}
	    		});
            }
            fetchWorkitems(getCriteria());
        };
        
        $scope.createWorkitem = function() {
        	$scope.workitem = {};
        };
        $scope.cancelWorkitem = function() {
        	$scope.workitem = null;
        };
        $scope.saveWorkitem = function() {
        	$scope.createdWorkitems.push($scope.workitem);
        	$scope.workitem = null;
        };
        
        $scope.saveWorkitem = function() {
            $scope.error = null;
            notify.info(gettext('saving..'));
            $scope.workitem.target = $scope.selected.workplace.target;
            return api.workitem.save($scope.workitem).then(function(response) {
                notify.pop(JSON.stringify($scope.workitem));
                notify.success(gettext('Task item saved.'));
                $scope.createdWorkitems.push($scope.workitem);
            	$scope.workitem = null;

            }, function(response) {
                notify.pop();
                notify.error(gettext('Hmm, there was an error when saving the task item. '));
            });
        };

        function fetchWorkitems(criteria) {
            api.workitem.query(criteria)
                .then(function(workitems) {
                    $scope.workitems = workitems;
                    $scope.createdWorkitems = [];
                });
        }

        function formatSort(key, dir) {
            var val = dir === 'asc' ? 1 : -1;
            return '[("' + encodeURIComponent(key) + '", ' + val + ')]';
        }

        $scope.$watch(getCriteria, fetchWorkitems, true);
    }

    return WorkitemListController;
});