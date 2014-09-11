define([
    'lodash',
    'jquery',
    'angular',
    'require'
], function(_, $, angular, require) {
    'use strict';

    angular.module('superdesk.workflow.directives', [])
        
        .directive('sdWorkstationList', ['keyboardManager', function(keyboardManager) {
            return {
                templateUrl: 'scripts/superdesk-workflow/views/workstation-list-item.html',
                scope: {
                    workstations: '=',
                    selected: '=',
                    done: '='
                },
                link: function(scope, elem, attrs) {
                    scope.select = function(workstation) {
                        scope.selected = workstation;
                    };

                    function getSelectedIndex() {
                        return _.findIndex(scope.workstations, scope.selected);
                    }

                    keyboardManager.bind('up', function() {
                        var selectedIndex = getSelectedIndex();
                        if (selectedIndex !== -1) {
                            scope.select(scope.workstations[_.max([0, selectedIndex - 1])]);
                        }
                    });

                    keyboardManager.bind('down', function() {
                        var selectedIndex = getSelectedIndex();
                        if (selectedIndex !== -1) {
                            scope.select(scope.workstations[_.min([scope.workstations.length - 1, selectedIndex + 1])]);
                        }
                    });
                }
            };
        }])
        .directive('sdWorkstationDetailsPane', ['$timeout', function($timeout) {
            return {
                replace: true,
                transclude: true,
                template: '<div class="workstation-details-pane" ng-transclude></div>',
                link: function(scope, element, attrs) {
                    $timeout(function() {
                        $('.user-details-pane').addClass('open');
                    });

                    scope.closePane = function() {
                        $('.user-details-pane').removeClass('open');
                    };
                }
            };
        }])
        .directive('sdWorkstationEdit', ['gettext', 'notify', 'api', 'session', '$location', '$route', 'superdesk',
        function(gettext, notify, api, session, $location, $route, superdesk) {
        	
        	var MAX_RESULTS = 10;
        	
            return {
                replace: true,
                templateUrl: require.toUrl('./views/edit-form.html'),
                scope: {
                    origWorkstation: '=workstation',
                    onsave: '&',
                    oncancel: '&'
                },
                link: function(scope, elem) {
                    scope.dirty = false;

                    scope.$watch('origWorkstation', resetWorkstation);

                    scope.$watchCollection('workstation', function(workstation) {
                        _.each(workstation, function(value, key) {
                            if (value === '') {
                                delete workstation[key];
                            }
                        });
                        scope.dirty = !angular.equals(workstation, scope.origWorkstation);
                    });

                    scope.cancel = function() {
                    	resetWorkstation(scope.origWorkstation);
                        if (!scope.origWorkstation.Id) {
                            scope.oncancel();
                        }
                    };

                    scope.save = function() {
                        scope.error = null;
                        notify.info(gettext('saving..'));
                        return api.workstation.save(scope.origWorkstation, scope.workstation).then(function(response) {
                            resetWorkstation(scope.origWorkstation);
                            notify.pop();
                            notify.success(gettext('Desk saved.'));
                            scope.onsave({workstation: scope.origWorkstation});

                            if (scope.workstation._id === session.identity._id) {
                                session.updateIdentity(scope.workstation);
                            }

                        }, function(response) {
                            notify.pop();
                            if (response.status === 404) {
                                if ($location.path() === '/workflow/') {
                                    $route.reload();
                                } else {
                                    $location.path('/workflow/');
                                }
                                notify.error(gettext('Desk is not found. It might be deleted.'));
                            } else {
                                
                                notify.error(gettext('Hmm, there was an error when saving desk. '));
                            }
                        });
                    };
                    
                    scope.memberNew = null;
                    scope.addMember = function() {
                    	scope.memberNew = {username:'Gabriel'};
                    };
                    

                    scope.$watch('origWorkstation', function(workstation) {
                        scope.members = [];
                        _.each(workstation.members, function(member) {
                        	var m = {
                        		userid: member.user
                        	};
                        	api.users.query({where: {_id: member.user}}).then(function(users) {
                        		m.username = users._items[0].username;
    	                    });
                        	scope.members.push(m);
                        });
                    });
                    scope.newUsername = '';
                    scope.usersSearch = function(term) {
                    	var criteria = {
                             max_results: MAX_RESULTS
                        };
                    	criteria.where = JSON.stringify({
                            '$or': [
                                {username: {'$regex': term}},
                            ]
                        });
                    	api.users.query(criteria).then(function(users) {
                    		scope.users = users._items;
	                    });
                    };
                    scope.userSelect = function(item) {
                    	scope.userTerm = item.username;
                    };
                    
                    
                    

                    function resetWorkstation(workstation) {
                        scope.error = null;
                        scope.workstation = _.create(workstation);
                    }
                }
            };
        }]);
});
