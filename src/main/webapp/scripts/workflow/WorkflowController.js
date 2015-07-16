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
    _instances: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, Application, Workflow, WorkflowInstance, Notifications, ElementsService, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._elementsService = ElementsService;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._application = Application;
        me._workflow = Workflow;
        me._workflowInstance = WorkflowInstance;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;
        me.$scope.processtep = 'workflow';
        me.$scope.appName = me._application.getApplicationName();
        me.$scope.onSelect = me.onSelect.bind(this);
        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.workflows = [];

        // load the workflow templates
        me._maskLoader.show(me.$scope, 'Loading workflow templates...');
        me._loadWorkflowTemplates();
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

    _loadWorkflowTemplates: function() {
        var me = this;
        me._workflow.loadWorkflowTemplates().then(me._handleWorkflowTemplatesLoaded.bind(me));
    },

    _handleWorkflowTemplatesLoaded: function(workflowTemplates) {
        var me = this;
        me._maskLoader.hide();
        console.log("Loaded " + workflowTemplates.length + " workflow templates");
        me.$scope.workflows = workflowTemplates;
    }
});

WorkflowController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Workflow', 'WorkflowInstance', 'Notifications', 'ElementsService', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('WorkflowController', WorkflowController);
