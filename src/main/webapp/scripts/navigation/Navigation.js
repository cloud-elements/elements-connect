/**
 * Navigation factor class as an helper to Navigation controller.
 *
 *
 * @author Paris
 */

var Navigation = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
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

    var NavigationObject = Class.extend({

        instance: new Navigation(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Navigation', NavigationObject);
}());