/**
 * AppKey factor class as an helper to AppKey controller.
 *
 *
 * @author Paris
 */
bulkloader.events.APPKEY_ENTERED = 'APPKEY_ENTERED';
var AppKey = Class.extend({
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


    openAppKey: function () {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'AppKey.html',
                controller: 'AppKeyController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdrop',
                backdrop: 'static',
                size: 'lg'
            });
        }
    },

    closeAppKey: function () {
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

    var AppKeyObject = Class.extend({

        instance: new AppKey(),

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
        .provider('AppKey',AppKeyObject);
}());