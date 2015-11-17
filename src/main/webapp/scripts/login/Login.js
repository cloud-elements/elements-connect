/**
 * Login factor class as an helper to Login controller.
 *
 *
 * @author Paris
 */
bulkloader.events.LOGIN_ENTERED = 'LOGIN_ENTERED';
var Login = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    _openedModal: null,
    _mdDialog: null,
    _jobs: new Array(),

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },


    openLogin: function () {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'login.html',
                controller: 'LoginController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdrop',
                backdrop: 'static',
                size: 'lg'
            });
        }
    },

    closeLogin: function () {
        var me = this;
        me._openedModal.close();
        me._openedModal = null;
    }

});


/**
 * Schedule Factory object creation
 *
 */
(function (){

    var LoginObject = Class.extend({

        instance: new Login(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Notifications, $modal, $mdDialog){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Login',LoginObject);
}());