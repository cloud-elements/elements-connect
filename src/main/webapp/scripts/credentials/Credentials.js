/**
 * Credentials factor class as an helper to Credentials controller.
 *
 *
 * @author Paris
 */

var Credentials = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    login: function(data) {
        var me = this;
    },

    signup: function(data) {
        var me = this;
    }

});


/**
 * Credentials Factory object creation
 *
 */
(function (){

    var CredentialsObject = Class.extend({

        instance: new Credentials(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', function(CloudElementsUtils, ElementsService, Notifications){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Credentials',CredentialsObject);
}());