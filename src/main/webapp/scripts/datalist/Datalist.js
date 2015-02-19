/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


var Datalist = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load selected Instance Objects
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    loadInstanceObjects:function(selectedInstance){

        var selectedInstance = angular.fromJson(selectedInstance);

        return this._elementsService.loadInstanceObjects(selectedInstance)
            .then(
            this._handleLoadIntanceObjects.bind(this),
            this._handleLoadIntanceObjectError.bind(this) );
    },

    _handleLoadIntanceObjects:function(result){
        return result.data;
    },

    _handleLoadIntanceObjectError: function(result) {
        return "Error getting the discovery object";
    }
});


/**
 * Picker Factory object creation
 *
 */
(function (){

    var DatalistObject = Class.extend({

        instance: new Datalist(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications',function(CloudElementsUtils, ElementsService, Notifications){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Datalist',DatalistObject);
}());
