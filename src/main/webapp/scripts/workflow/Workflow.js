/**
 * Workflow factor class as a helper to the Workflow controller
 * @author jjwyse
 */
var Workflow = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _allElements: null,

    _handleLoadError: function(error) {
        // ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    }
});

/**
 * Workflow factory object creation
 */
(function() {

    var WorkflowObject = Class.extend({

        instance: new Workflow(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Application', function(CloudElementsUtils, ElementsService, Notifications, Application) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._application = Application;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Workflow', WorkflowObject);
}());