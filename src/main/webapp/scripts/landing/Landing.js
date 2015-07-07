/**
 * Landing factor class as an helper to Landing controller.
 *
 *
 * @author Paris
 */

var Landing = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _allElements: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    }

});

/**
 * Navigation Factory object creation
 *
 */
(function() {

    var LandingObject = Class.extend({

        instance: new Landing(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', function(CloudElementsUtils, ElementsService, Notifications) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Landing', LandingObject);
}());