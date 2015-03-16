/**
 * Schedule controller for selecting the fields.
 *
 *
 * @author Paris
 */

var ScheduleController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _datalist: null,
    _schedule: null,
    _instances: null,
    $modal: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, Schedule, Notifications, $window, $location, $filter, $route, $modal){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._schedule = Schedule;
        me.$modal = $modal;
        me.$window = $window;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        me.$scope.queryStartDate = null;

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);
    },

    defineListeners:function(){
        var me = this;

//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    _seedSchedule: function() {
      var me = this;

    },

    cancel: function() {
        var me = this;

        me._schedule.closeSchedule();
        me.$location.path('/datalist');
    },

    save: function() {
        var me = this;

        me._schedule.runScheduledJob(me._picker.selectedElementInstance, me._datalist.all,
                                     me.$scope.queryStartDate.toISOString());
        me.$location.path('/');
    }
});

ScheduleController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'Schedule', 'Notifications', '$window', '$location', '$filter', '$route', '$modal'];


angular.module('bulkloaderApp')
    .controller('ScheduleController', ScheduleController);



