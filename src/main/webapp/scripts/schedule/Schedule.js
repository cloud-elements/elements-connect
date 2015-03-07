/**
 * Schedule factor class as an helper to picker controller.
 *
 *
 * @author Paris
 */

var Schedule = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    //An Object which holds all the data at instance Level
    all: new Object,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    openSchedule: function () {
        var me = this;
        me.$modal.open({
            templateUrl: 'scripts/schedule/schedule.html',
            controller: 'ScheduleController',
            windowClass: 'bulkloaderModalWindow',
            backdropClass: 'bulkloaderModalbackdrop',
            size: 'lg'
        });
    }


});


/**
 * Schedule Factory object creation
 *
 */
(function (){

    var ScheduleObject = Class.extend({

        instance: new Schedule(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', '$modal', function(CloudElementsUtils, ElementsService, Notifications, $modal){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Schedule',ScheduleObject);
}());


