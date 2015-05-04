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
    _mapper: null,
    _schedule: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Datalist, Mapper, Schedule, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._datalist = Datalist;
        me._mapper = Mapper;
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

        me.$scope.queryStartDate = "January 01, 2015";

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

        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me));
//        me._notifications.addEventListener(bulkloader.events.SHOW_SCHEDULER, me._seedSchedule.bind(me));
    },

    _handleError: function(event, error) {
        var me = this;

        me._maskLoader.hide();
        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    _seedSchedule: function() {
      var me = this;

    },

    cancel: function() {
        var me = this;

        me._schedule.closeSchedule();
    },

    save: function() {
        var me = this;

        me._maskLoader.show(me.$scope, 'Scheduling...');

        var startdt = me.$scope.queryStartDate;
        if (me._cloudElementsUtils.isEmpty(startdt) || startdt == "January 01, 2015") {
            startdt = new Date('01 January 2015 00:00 UTC');
        }
        startdt = startdt.toISOString();

        if (me._cloudElementsUtils.isEmpty(me._picker.getTargetToken()) &&
                !me._cloudElementsUtils.isEmpty(me._picker.getTargetElementKey())) {
            me._schedule.runMapperScheduledJob(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                                               me._mapper.all, startdt);
        } else {
            me._schedule.runDatalistScheduledJob(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                                                 me._datalist.all, startdt);
        }

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

ScheduleController.$inject = ['$scope','CloudElementsUtils','Picker', 'Datalist', 'Mapper', 'Schedule', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('ScheduleController', ScheduleController);



