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
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, Schedule, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._schedule = Schedule;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;

        me.$scope.queryStartDate = null;

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);

        // Datepicker Actions
        me.$scope.open = me.open.bind(this);
        me.$scope.clear = me.clear.bind(this);
        me.$scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };
        me.$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'MMMM dd, yyyy'];
        me.$scope.format = me.$scope.formats[4];


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

        me._maskLoader.show('Scheduling...');
        me._schedule.runScheduledJob(me._picker.selectedElementInstance, me._datalist.all,
                                     me.$scope.queryStartDate.toISOString());
        me._maskLoader.hide();
        me.$location.path('/');
    },

    clear: function () {
        var me = this;
        me.$scope.queryStartDate = null;
    },

    open: function($event) {
        var me = this;
        $event.preventDefault();
        $event.stopPropagation();

        me.$scope.opened = true;
    }

});

ScheduleController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'Schedule', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('ScheduleController', ScheduleController);



