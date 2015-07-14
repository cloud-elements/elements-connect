/**
 * CAaaS Picker factor class as an helper to picker controller.
 *
 * @author jjwyse
 */

namespace('bulkloader.CAaaSPicker').oauthElementKey = null;

var CAaaSPicker = Picker.extend({
});

// CAaaS picker factory object creation
(function() {

    var CAaaSPickerObject = Class.extend({

        instance: new CAaaSPicker(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Application', 'Notifications', function(CloudElementsUtils, ElementsService, Application, Notifications) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._application = Application;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('CAaaSPicker', CAaaSPickerObject);
}());

