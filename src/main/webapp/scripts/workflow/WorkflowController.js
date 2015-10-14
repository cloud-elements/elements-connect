/**
 * Workflow controller for showing the available workflow templates and creating workflow instances from them
 * @author jjwyse
 */
var WorkflowController = BaseController.extend({
    _notifications: null,
    _elementsService: null,
    _cloudElementsUtils: null,
    _application: null,
    _workflow: null,
    _workflowInstance: null,
    _maskLoader: null,
    _picker: null,

    init: function($scope, CloudElementsUtils, Application, Workflow, WorkflowInstance, Notifications, ElementsService, MaskLoader, Picker, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._elementsService = ElementsService;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._application = Application;
        me._workflow = Workflow;
        me._workflowInstance = WorkflowInstance;
        me._picker = Picker;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;

        // make sure the user is authenticated
        if(me._application.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }

        me.$scope.processtep = 'workflow';
        me.$scope.appName = me._application.getApplicationName();
        me.$scope.onSelect = me.onSelect.bind(this);
        me.$scope.onEditWorkflowInstance = me.onEditWorkflowInstance.bind(this);
        me.$scope.onDeleteWorkflowInstance = me.onDeleteWorkflowInstance.bind(this);
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.done = me.done.bind(this);
        me.$scope.workflows = [];

        // load the workflow templates
        me._maskLoader.show(me.$scope, 'Loading workflow templates...');
        me._loadWorkflowData();
    },

    defineListeners: function() {
        var me = this;
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.addEventListener(bulkloader.events.NEW_WORKFLOW_INSTANCE_CREATED, me._onWorkflowInstancesRefresh.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
        me._notifications.removeEventListener(bulkloader.events.NEW_WORKFLOW_INSTANCE_CREATED, me._onWorkflowInstancesRefresh.bind(me), me.$scope.$id);
    },

    done: function() {
        var me = this;
        me.$location.path('/');
    },

    cancel: function() {
        var me = this;
        if(me._application.ignoreMapper() == false) {
            me.$location.path('/mapper');
        } else {
            me.$location.path('/');
        }
    },

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    onSelect: function(workflowTemplate) {
        var me = this;
        if(workflowTemplate.instanceId) {
            me._editWorkflowInstance(workflowTemplate.id, workflowTemplate.instanceId);
        } else {
            me._createWorkflowInstance(workflowTemplate);
        }
    },

    onEditWorkflowInstance: function(workflowTemplate, $event) {
        var me = this;

        var workflowId = workflowTemplate.id;
        var workflowInstanceId = workflowTemplate.instanceId;

        me._editWorkflowInstance(workflowId, workflowInstanceId);

        $event.preventDefault();
        $event.stopPropagation();
    },

    _editWorkflowInstance: function(workflowId, workflowInstanceId) {

    },

    onDeleteWorkflowInstance: function(workflowTemplate, $event) {
        var me = this;

        var workflowId = workflowTemplate.id;
        var workflowName = workflowTemplate.name;
        var workflowInstanceId = workflowTemplate.instanceId;

        me._deleteWorkflowInstance(workflowId, workflowName, workflowInstanceId);

        $event.preventDefault();
        $event.stopPropagation();
    },

    _deleteWorkflowInstance: function(workflowId, workflowName, workflowInstanceId) {
        var me = this;

        var confirm = me.$mdDialog.confirm()
            .title('Warning!')
            .content("Are you sure you want to delete your instance of the workflow: " + workflowName + "?")
            .ok('Yes')
            .cancel('No');

        me.$mdDialog.show(confirm).then(function() {
            //continue
            me.continueDelete(workflowId, workflowName, workflowInstanceId);
        }, function() {
            //Don't do anything
        });
    },

    continueDelete: function(workflowId, workflowName, workflowInstanceId) {
        var me = this;

        me._maskLoader.show(me.$scope, 'Deleting workflow instance...');

        me._elementsService.deleteWorkflowInstance(workflowId, workflowInstanceId)
            .then(me._handleOnDeleteWorkflowInstance.bind(me, workflowName));
    },

    _handleOnDeleteWorkflowInstance: function(workflowName) {
        var me = this;
        me._maskLoader.hide();

        angular.element(document.getElementById(workflowName)).removeClass('highlightingElement');

        // set the instance ID on this workflow to be null so the UI doesn't think it still exists and we can create a new one
        for(var i = 0; i < me.$scope.workflows.length; i++) {
            var workflow = me.$scope.workflows[i];
            if(workflow.name == workflowName) {
                workflow.instanceId = null;
            }
        }
    },

    _handleError: function(event, error) {
        var me = this;
        console.log('In error ' + me.$scope.$id);
        me._maskLoader.hide();

        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    _createWorkflowInstance: function(workflowTemplate) {
        var me = this;
        me._workflowInstance.openCreateWorkflowInstance(workflowTemplate);
    },

    _loadWorkflowData: function() {
        var me = this;
        me._workflow.loadWorkflowTemplates().then(me._handleWorkflowTemplatesLoaded.bind(me));
    },

    _handleWorkflowTemplatesLoaded: function(workflowTemplates) {
        var me = this;
        me._maskLoader.hide();
        console.log("Loaded " + workflowTemplates.length + " workflow templates");

        if(me._application.configuration.workflows && me._application.configuration.workflows.length > 0) {
            // if there is a workflows section in the app configuration, then filter out any that are not specified there
            me._filterWorkflowTemplates(workflowTemplates);
        } else {
            // if we do NOT have any workflows defined in our app config, then just show all of the workflow templates
            me.$scope.workflows = workflowTemplates;
        }

        // add any element instances we already know
        me._addDefaultValuesForConfig();

        // check for existing workflow instances
        me._highlightWorkflowInstances();
    },

    _highlightWorkflowInstances: function() {
        var me = this;

        if(me.$scope.workflows) {
            for(var i = 0; i < me.$scope.workflows.length; i++) {
                var workflowTemplate = me.$scope.workflows[i];
                me._elementsService.findWorkflowInstances(workflowTemplate.id).then(
                    me._handleLoadWorkflowInstances.bind(me, workflowTemplate),
                    me._handleLoadError.bind(me));
            }
        }
    },

    _addDefaultValuesForConfig: function() {
        var me = this;

        // go through each config on the workflow template, and set default values with our target and source element instances, if possible
        if(me.$scope.workflows) {
            for(var i = 0; i < me.$scope.workflows.length; i++) {
                var workflowTemplate = me.$scope.workflows[i];
                if(workflowTemplate.configuration) {
                    for(var k = 0; k < workflowTemplate.configuration.length; k++) {
                        var workflowTemplateConfig = workflowTemplate.configuration[k];
                        if(workflowTemplateConfig.type === 'elementInstance') {
                            var configKey = workflowTemplateConfig.key;
                            var elementKey = configKey.substr(0, configKey.indexOf('.'));
                            console.log("Looking for source or target instance with key: " + elementKey);

                            if(me._picker.selectedElementInstance.element.key === elementKey) {
                                workflowTemplateConfig.defaultValue = me._picker.selectedElementInstance.id;
                            } else if(me._picker.targetElementInstance.element.key === elementKey) {
                                workflowTemplateConfig.defaultValue = me._picker.targetElementInstance.id;
                            }
                        }
                    }
                }
            }
        }
    },

    _handleLoadWorkflowInstances: function(workflowTemplate, httpResult) {
        var me = this;

        var workflowInstances = httpResult.data;

        // assuming we limited the workflow to only have one instance
        if(workflowInstances && workflowInstances.length > 0) {
            workflowTemplate.instanceId = workflowInstances[0].id;
            angular.element(document.getElementById(workflowTemplate.name)).addClass('highlightingElement');
        }
    },

    _filterWorkflowTemplates: function(workflowTemplates) {
        var me = this;

        console.log("Filtering out workflows based on application configuration");

        var filteredWorkflowTemplates = [];
        for(var i = 0; i < me._application.configuration.workflows.length; i++) {
            var workflowAppConfig = me._application.configuration.workflows[i];

            // look through each workflow template we loaded and we have a workflow template with the name in the workflow app config, then include it
            for(var j = 0; j < workflowTemplates.length; j++) {
                var workflowTemplate = workflowTemplates[j];
                if(workflowAppConfig.name === workflowTemplate.name) {
                    filteredWorkflowTemplates.push(workflowTemplate);
                }
            }
        }
        me.$scope.workflows = filteredWorkflowTemplates;
    },

    _onWorkflowInstancesRefresh: function() {
        var me = this;
        console.log("Refreshing workflow instances");
        me._highlightWorkflowInstances();
    }
});

WorkflowController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Workflow', 'WorkflowInstance', 'Notifications', 'ElementsService', 'MaskLoader', 'Picker', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('WorkflowController', WorkflowController);
