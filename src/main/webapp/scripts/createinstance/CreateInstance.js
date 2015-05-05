/**
 * CreateInstance factor class as an helper to CreateInstance controller.
 *
 *
 * @author Paris
 */

var CreateInstance = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    _openedModal: null,
    _mdDialog: null,
    _jobs: new Array(),
    element: null,
    selection: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },


    openCreateInstance: function (element, selection) {
        var me = this;

        me.element = element;
        me.selection = selection;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'createinstance.html',
                controller: 'CreateInstanceController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdrop',
                backdrop: 'static'
            });
        }
    },

    closeCreateInstance: function () {
        var me = this;
        me._openedModal.close();
        me._openedModal = null;
    },

    onSaveInstance: function(elementProvision){
        var me = this;
        me.closeCreateInstance();
        return me._elementsService.createNonOathInstance(elementProvision).then(
            me._picker._handleOnCreateInstance.bind(me._picker, elementProvision.element.key),
            me._picker._handleOnCreateInstanceFailed.bind(me._picker));
    }

});


/**
 * Schedule Factory object creation
 *
 */
(function (){

    var CreateInstanceObject = Class.extend({

        instance: new CreateInstance(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService', 'Picker','Notifications', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Picker, Notifications, $modal, $mdDialog){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('CreateInstance',CreateInstanceObject);
}());


