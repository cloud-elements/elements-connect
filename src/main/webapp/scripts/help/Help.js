/**
 * Help factor class as an helper to Help controller.
 *
 *
 * @author Paris
 */

var Help = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,

    _openedModal: null,
    _mdDialog: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    openHelp: function () {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'help.html',
                controller: 'HelpController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdrop',
                backdrop: 'static',
                size: 'lg'
            });
        }
    },

    closeHelp: function () {
        var me = this;
        me._openedModal.close();
        me._openedModal = null;
    }

});


/**
 * Help Factory object creation
 *
 */
(function (){

    var HelpObject = Class.extend({

        instance: new Help(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', 'Picker', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Notifications, Picker, $modal, $mdDialog){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;
            this.instance._picker= Picker;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Help',HelpObject);
}());


