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
    _application: null,
    _datalist: null,
    _mapper: null,
    _schedule: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init: function($scope, CloudElementsUtils, Picker, Application, Datalist, Mapper, Schedule, Notifications, MaskLoader, $window, $location, $filter, $route, $modal, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._application = Application;
        me._datalist = Datalist;
        me._mapper = Mapper;
        me._schedule = Schedule;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);

        me._getMappingTransformations();
    },

    defineScope: function() {
        var me = this;

        me.checkContinue();

        // This is for transitions
        me.$scope.pageClass = 'page-scheduler';

        me.$scope.queryStartDate = "January 01, 2015";

        me.$scope.cancel = me.cancel.bind(this);
        me.$scope.save = me.save.bind(this);

        // Datepicker Actions
        me.$scope.open = me.open.bind(this);
        me.$scope.clear = me.clear.bind(this);
        me.$scope.getDayClass = me.getDayClass.bind(this);
        me.$scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
        };
        me.$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'MMMM dd, yyyy'];
        me.$scope.format = me.$scope.formats[4];
        me.$scope.maxDate = me.$scope.maxDate ? null : new Date();

        me.$scope.showScheduling = false;
        me.$scope.datatransfer = 'transfernow';

        /* to show Calendar UI dropdown */
        me.$scope.opened = {
            transfernow: false,
            schedule: false,
            schedulemonth: false
        };

        me.$scope.sourceElement = me._picker.getElementConfig(me._picker.selectedElementInstance.element.key, 'source');
        me.$scope.sourceLogo = me.$scope.sourceElement.image;
        me.$scope.targetLogo = me._picker._target.image;
        me.$scope.sourceName = me.$scope.sourceElement.name;
        me.$scope.targetName = me._picker._target.name;

        // temp store to display current transformation
        me.$scope.currentTransfomations = null;

        if(me._application.getView() == 'datalist') {
            me.$scope.showTarget = false;
        } else {
            me.$scope.showTarget = true;
        }

        me.$scope.scheduleTypes = [
            {value: 'hourly', name: 'Hourly'},
            {value: 'daily', name: 'Daily'},
            {value: 'weekly', name: 'Weekly'},
            {value: 'monthly', name: 'Monthly'}
        ];
        me.$scope.datatransfer = 'transfernow';
        me.$scope.showschedulecalendar = false;
        me.$scope.onSelectSchedule = me.onSelectSchedule.bind();
        me.$scope.columnWidth = 'sixteen';
        me.$scope.processtep = 'schedule';

        me._seedSchedule();
    },

    defineListeners: function() {
        var me = this;

        me._notifications.addEventListener(bulkloader.events.SCHEDULE_ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;
        me._notifications.removeEventListener(bulkloader.events.SCHEDULE_ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    //This function checks if we need to continue in scheduling
    checkContinue: function() {
        var me = this;
        //Redirect to home page if null
        if(me._cloudElementsUtils.isEmpty(me._picker.selectedElementInstance)) {
            me.$location.path('/');
        }
    },

    _getMappingTransformations: function() {
        var me = this;

        if(me._application.getView() == 'datalist') {
            me.$scope.currentTransfomations = me._schedule.getDatalistTransformations(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                me._datalist.all);
        } else {
            me.$scope.currentTransfomations = me._schedule.getMappingTransformations(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                me._mapper.all);
        }
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

        if(!me._cloudElementsUtils.isEmpty(me._application.getDisplay())
            && me._application.getDisplay().scheduling == true) {
            me.$scope.showScheduling = true;
        } else {
            me.$scope.showScheduling = false;
        }
    },

    cancel: function() {
        var me = this;
        if(me._application.getView() == 'datalist') {
            me.$location.path('/datalist');
        }else{
            me.$location.path('/mapper');
        }
    },

    save: function() {
        var me = this;

        me._maskLoader.show(me.$scope, 'Scheduling...');

        var startdt = me.$scope.queryStartDate;
        if(me._cloudElementsUtils.isEmpty(startdt) || startdt == "January 01, 2015") {
            startdt = new Date('01 January 2015 00:00 UTC');
        }
        startdt = startdt.toISOString();

        //Construct CRON string if there is a selection
        var cronVal = null;
        if(me.$scope.datatransfer === 'schedule') {
            if(me._cloudElementsUtils.isEmpty(me.$scope.selectedScheduleType)
                || me._cloudElementsUtils.isEmpty(me.$scope.selectedScheduleType.value)) {
                var confirm = me.$mdDialog.alert()
                    .title('Missing How Often ?')
                    .content('Select how often you want to run.')
                    .ok('OK');

                me.$mdDialog.show(confirm);
                me._maskLoader.hide();
                return;
            }

            if((me.$scope.selectedScheduleType.value === 'weekly' || me.$scope.selectedScheduleType.value === 'monthly')
                && me._cloudElementsUtils.isEmpty(me.$scope.selectedScheduleType.typeValue)) {
                var confirm = me.$mdDialog.alert()
                    .title('Missing scheduling options')
                    .content('Select the options for the run.')
                    .ok('OK');

                me.$mdDialog.show(confirm);
                me._maskLoader.hide();
                return;
            }

            cronVal = me._schedule.constructCronExpression(me.$scope.selectedScheduleType);
        }

        var jobs = null;
        if(me._application.getView() == 'datalist') {
            jobs = me._schedule.runDatalistScheduledJob(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                me._datalist.all, startdt, me.$scope.currentTransfomations, cronVal);
        } else {
            jobs = me._schedule.runMapperScheduledJob(me._picker.selectedElementInstance, me._picker.targetElementInstance,
                me._mapper.all, startdt, me.$scope.currentTransfomations, cronVal);
        }
        if(jobs != false) {
            me._schedule.scheduleJobs(me._picker.selectedElementInstance, me._picker.targetElementInstance, jobs, cronVal);

            if(me.$scope.datatransfer === 'schedule') {
                me.$location.path('/jobs');
            } else {
                me.$location.path('/jobhistory');
            }
        }
        me._maskLoader.hide();
    },

    clear: function() {
        var me = this;
        me.$scope.queryStartDate = null;
    },

    open: function($event, calendar) {
        var me = this;
        $event.preventDefault();
        $event.stopPropagation();

        if(calendar == 'transfernow') {
            me.$scope.opened.transfernow = true;
        }
        else if(calendar == 'schedule') {
            me.$scope.opened.schedule = true;
        }
        else if(calendar == 'schedulemonth') {
            me.$scope.opened.schedulemonth = true;
        }

    },

    getDayClass: function(date, mode) {
        var me = this;
        if(mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for(var i = 0; i < me.$scope.events.length; i++) {
                var currentDay = new Date(me.$scope.events[i].date).setHours(0, 0, 0, 0);

                if(dayToCheck === currentDay) {
                    return me.$scope.events[i].status;
                }
            }
        }
    },

    onSelectSchedule: function() {
        var me = this;

    }

});

ScheduleController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Application', 'Datalist', 'Mapper', 'Schedule', 'Notifications', 'MaskLoader', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('ScheduleController', ScheduleController);



