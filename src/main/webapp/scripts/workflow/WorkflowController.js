/**
 * Workflow controller for showing the available workflow templates and creating workflow instances from them
 * @author jjwyse
 */
var WorkflowController = BaseController.extend({
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _workflow: null,
    _instances: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, Application, Workflow, Notifications, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._application = Application;
        me._workflow = Workflow;
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
        me.$scope.workflows = [
            {
                "name": "POSable to Quickbooks"
            }
        ];
    },

    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    onSelect: function(workflowName) {
        var me = this;
        alert("Workflow: " + workflowName + " selected");
    }
});

WorkflowController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Workflow', 'Notifications', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('WorkflowController', WorkflowController);
