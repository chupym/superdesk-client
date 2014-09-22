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
                    
                    function resetWorkstation(workstation) {
                        scope.error = null;
                        scope.workstation = _.create(workstation);
                    }

                    function processMembers(workstation){
                    	scope.members = [];
                    	api.workflow.query().then(function(workflows) {
                    		var workflowsById = {};
                    		_.each(workflows._items, function(workflow) {
                    			workflowsById[workflow._id] = workflow.name;
                    		});
                    		
                    		_.each(workstation.members, function(member) {
                            	var m = {
                            		userid: member.user,
                            		workflows: []
                            	};
                            	api.users.query({where: {_id: member.user}}).then(function(users) {
                            		m.username = users._items[0].username;
        	                    });
                            	_.each(member.workflows, function(workflow_id) {
                        			m.workflows.push(workflowsById[workflow_id]);
                        		});
                            	
                            	scope.members.push(m);
                            });
	                    });
                        
                    }
                    scope.$watch('origWorkstation', processMembers);
                    
                    scope.member = null;
                    scope.editMember = function(workstation) {
                    	scope.member = {workstation:workstation, data:{}, workflows:[]};
                    	api.workflow.query().then(function(workflows) {
                    		_.each(workflows._items, function(workflow) {
                    			//workflow.checked = scope.member.data.workflows.indexOf(workflow._id) > -1;
                    			workflow.checked = false;
                    			scope.member.workflows.push(workflow); 
                    		});
	                    });
                    };
                    scope.saveMember = function() {
                    	var workstation = scope.member.workstation;
                    	if (workstation.members){
                    		workstation.members = workstation.members.slice(0);
                    	} else {
                    		workstation.members = [];
                    	}
                    	
                    	var addMember = true;
                    	var member = scope.member.data;
                    	_.each(workstation.members, function(m) {
                			if(m.user == member.user) {
                				member = m;
                				addMember = false;
                				return false;
                			}
                		});
                    	
                    	member.workflows = [];
                    	_.each(scope.member.workflows, function(workflow) {
                			if(workflow.checked) {
                				member.workflows.push(workflow._id);
                			}
                		});
                    	if (addMember){
                    		workstation.members.push(member);
                    	}
                    	processMembers(workstation);
                    	scope.member = null;
                    };
                    scope.cancelMember = function() {
                    	scope.member = null;
                    };
                    scope.usersSearch = function(term) {
                    	var criteria = {
                             max_results: 5
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
                    	scope.member.userName = item.username;
                    	scope.member.data.user = item._id;
                    };
                    scope.users = [];
                    scope.workflowSelect = function(workflow) {
                    	alert(workflow);
                    };
                    
                }
            };
        }])
        
        
        
        
        .directive('sdWorkitemList', ['keyboardManager', 'api', function(keyboardManager, api) {
                return {
                    templateUrl: 'scripts/superdesk-workflow/views/workitem-list-item.html',
                    scope: {
                        workitems: '=',
                        destinations: '=',
                        selected: '=',
                        done: '='
                    },
                    link: function(scope, elem, attrs) {
                        scope.select = function(workitem) {
                            scope.selected = workitem;
                        };

                        function getSelectedIndex() {
                            return _.findIndex(scope.workitems, scope.selected);
                        }

                        keyboardManager.bind('up', function() {
                            var selectedIndex = getSelectedIndex();
                            if (selectedIndex !== -1) {
                                scope.select(scope.workitems[_.max([0, selectedIndex - 1])]);
                            }
                        });

                        keyboardManager.bind('down', function() {
                            var selectedIndex = getSelectedIndex();
                            if (selectedIndex !== -1) {
                                scope.select(scope.workitems[_.min([scope.workitems.length - 1, selectedIndex + 1])]);
                            }
                        });
                        scope.moveItem = function(items, index, target) {
                        	var item = items[index];
                        	var nitem = _.create(item);
                        	nitem.target = target;
                        	api.workitem.save(item, nitem);
                        	items.splice(index, 1);
                        };
                    }
                };
            }]);
});
