/**
 * Jobs controller for selection of the service.
 *
 *
 * @author Paris
 */

var JobsController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _jobs: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init: function($scope, CloudElementsUtils, Picker, Jobs, JobHistory, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._picker = Picker;
        me._jobs = Jobs;
        me._history = JobHistory;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

    },

    defineScope: function() {
        var me = this;

        me.$scope.selectedIndex = -1;
        me.$scope.noJobsMessage = true;
        me.$scope.onSelectJob = me.onSelectJob.bind(this);
        me.$scope.onSelectScheduledJob = me.onSelectScheduledJob.bind(this);
        me.$scope.close = me.close.bind(this);

        // Store for schedule job data
        me.$scope.jobscheduledata = [],

        // Store for Scheduled jobs Details
        me.$scope.jobscheduledetails = [
            {
                sourceObject: 'users',
                targetObject: 'details',
                status: 'RUNNING',
                downloadCount: '30',
                errorCount: '12',
                createdDate: '1433547078167'
            },
            {
                sourceObject: 'contacts',
                targetObject: 'contacts',
                status: 'COMPLETED',
                downloadCount: '3',
                errorCount: '0',
                createdDate: '1433546675983'
            },
            {
                sourceObject: 'account',
                targetObject: 'leads',
                status: 'ERROR',
                downloadCount: '5',
                errorCount: '2304',
                createdDate: '1433546675983'
            }
        ]

        me._seedJobs();
    },

    defineListeners: function() {
        var me = this;
        me._super();
//        TODO Add handleError and showMask
//        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
//        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;
//        TODO Add handleError and showMask
//        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
//        me._notifications.removeEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
    },

    _seedJobs: function() {
        var me = this;

        if(me._picker.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }
        me._maskLoader.show(me.$scope, 'Loading...');
        me._jobs.getJobs().then(me._handleGetJobs.bind(me));
    },

    _handleGetJobs: function(results) {
        var me = this;
        me.$scope.jobscheduledata = results;
        me._maskLoader.hide();
    },

    onSelectScheduledJob: function($index) {
        var me = this;


        me.$scope.noJobsMessage = false;
        me.$scope.selectedIndex = $index;

        me.$scope.selectedJob = me.$scope.jobscheduledata[$index];
        me._jobs.getHistory(me.$scope.selectedJob.jobId).then(me._handleGetHistory.bind(me));
    },

    _handleGetHistory: function(results) {
        var me = this;
        me.$scope.jobscheduledetails = results;
    },

    onSelectJob: function($index) {
        var me = this;

        me.$scope.showErrors = false;
        me.$scope.showNoErrors = false;
        me.$scope.noJobsMessage = false;

        me.$scope.selectedJob = me.$scope.jobscheduledetails[$index];

        me.$scope.selectedIndex = $index;

        if(me.$scope.selectedJob.sourceStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetErrorCount == 0) {
            me.$scope.showNoErrors = true;
            me.$scope.errorMessage = 'No errors, data transfer completed successfully';
            return;
        }

        //call the API for target error records
        if (!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.targetElementKey)) {
            return me._history.getJobErrors(me.$scope.selectedJob.targetElementKey, me.$scope.selectedJob.targetJobId).then(me._handleGetJobErrors.bind(me));
        } else {
            return me._history.getJobErrors(me.$scope.selectedJob.sourceElementKey, me.$scope.selectedJob.sourceJobId).then(me._handleGetJobErrors.bind(me));
        }
    },

    _handleGetJobErrors: function(results) {
        var me = this;

        //Construct the message here based on the
        me.$scope.jobExecutions = results;
        var err = null;
        if (!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.sourceStatusMessage)) {
            err = me.$scope.selectedJob.sourceStatusMessage
        }

        if (!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.targetStatusMessage)) {
            if(err == null) {
                err = '';
            } else {
                err += '<BR>'
            }
            err = me.$scope.selectedJob.targetStatusMessage
        }

        if(me.$scope.selectedJob.status == 'ERROR') {
            err = me.$scope.selectedJob.statusMessage;
        }

        if(err == null
            && me.$scope.selectedJob.status == 'RUNNING') {
            err = 'Data transfer in progress';
        }

        if(err == null
            && me.$scope.selectedJob.status == 'RUNNING') {
            err = 'Data transfer in progress';
        }

        if(err == null && results.length == 0) {
            err = 'No errors, data transfer completed successfully';
        }

        if(err != null ) {
            me.$scope.showNoErrors = true;
            me.$scope.errorMessage = err;
        }

        if(results.length > 0) {
            me.$scope.showErrors = true;
        }
    },

    close: function() {
        var me = this;
        me.$location.path('/');
    }

});

JobsController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Jobs', 'JobHistory', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('JobsController', JobsController);
