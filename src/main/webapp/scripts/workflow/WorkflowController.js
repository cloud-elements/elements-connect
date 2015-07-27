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
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.workflows = [];

        // load the workflow templates
        me._maskLoader.show(me.$scope, 'Loading workflow templates...');
        me._loadWorkflowData();
    },

    defineListeners: function() {
        var me = this;
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    cancel: function() {
        var me = this;
        me.$location.path('/mapper');
    },

    onSelect: function(workflowTemplate) {
        var me = this;
        // TODO - JJW check to see if the workflow instance already exists
        me._createWorkflowInstance(workflowTemplate);
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
            var filteredWorkflowTemplates = [];
            for(var i = 0; i < me._application.configuration.workflows.length; i++) {
                var workflowAppConfig = me._application.configuration.workflows[i];

                // look through each workflow template we loaded and we have a workflow template with the name in the workflow app config, then include it
                for(var j = 0; j < workflowTemplates.length; j++) {
                    var workflowTemplate = workflowTemplates[j];
                    if(workflowAppConfig.name === workflowTemplate.name) {

                        // go through each config on the workflow template, and set default values with our target and source element instances, if possible
                        if(workflowTemplate.configuration) {
                            for(var k = 0; k < workflowTemplate.configuration.length; k++) {
                                var workflowTemplateConfig = workflowTemplate.configuration[k];
                                if(workflowTemplateConfig.type === 'elementInstance') {
                                    var configKey = workflowTemplateConfig.key;
                                    var elementKey = configKey.substr(0, configKey.indexOf('.'));
                                    console.log("Looking for source or target instance with key: " + elementKey);
                                    if(me._picker.selectedElementInstance.element.key === elementKey) {
                                        workflowTemplateConfig.defaultElementInstance = me._picker.selectedElementInstance;
                                    } else if(me._picker.targetElementInstance.element.key === elementKey) {
                                        workflowTemplateConfig.defaultElementInstance = me._picker.targetElementInstance;
                                    }
                                }
                            }
                        }
                        filteredWorkflowTemplates.push(workflowTemplate);
                    }
                }
            }
            me.$scope.workflows = filteredWorkflowTemplates;
        } else {
            // if we do NOT have any workflows defined in our app config, then just show all of the workflow templates
            me.$scope.workflows = workflowTemplates;
        }
    }
});

WorkflowController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Workflow', 'WorkflowInstance', 'Notifications', 'ElementsService', 'MaskLoader', 'Picker', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('WorkflowController', WorkflowController);
