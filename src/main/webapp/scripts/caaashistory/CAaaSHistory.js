/**
 * CAaaSHistory factor class as an helper to CAaaSHistory controller.
 *
 *
 * @author Ramana
 */

var CAaaSHistory = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _allElements: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    }

});

/**
 * CAaaSHistory Factory object creation
 *
 */
(function() {

    var CAaaSHistoryObject = Class.extend({

        instance: new JobHistory(),

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
        .provider('CAaaSHistory', CAaaSHistoryObject);
}());