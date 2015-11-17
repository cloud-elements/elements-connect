/**
 * Jobs controller for selection of the service.
 *
 *
 * @author Paris
 */

var JobsController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _jobs: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,
    _refreshtimer: null,

    init: function($scope, CloudElementsUtils, Application, Jobs, JobHistory, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._application = Application;
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
        me.$scope.selectedIndexJobDetails = -1;
        me.$scope.noJobsMessage = true;
        me.$scope.noJobsMessageDetailsErrors = false;
        me.$scope.onSelectJob = me.onSelectJob.bind(this);
        me.$scope.onSelectScheduledJob = me.onSelectScheduledJob.bind(this);
        me.$scope.close = me.close.bind(this);
        me.$scope.showEnable = me.showEnable.bind(this);
        me.$scope.onEnable = me.onEnable.bind(this);
        me.$scope.showDisable = me.showDisable.bind(this);
        me.$scope.onDisable = me.onDisable.bind(this);
        me.$scope.onDelete = me.onDelete.bind(this);

        // Store for schedule job data
        me.$scope.jobscheduledata = [];

        // Store for Scheduled jobs Details
        me.$scope.jobscheduledetails = [];

        me._seedJobs();
    },

    defineListeners: function() {
        var me = this;
        me._super();
        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    destroy: function() {
        var me = this;

        if(!me._cloudElementsUtils.isEmpty(me._refreshtimer)) {
            me.$interval.cancel(me._refreshtimer);
            me._refreshtimer = null;
        }

        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    _handleError: function(event, error) {

        var me = this;
        console.log('In error ' + me.$scope.$id);
        me._maskLoader.hide();

        var confirm = me.$mdDialog.alert()
            .title('Error')
            .content(error)
            .ok('OK');

        me.$mdDialog.show(confirm);
    },

    _seedJobs: function() {
        var me = this;

        if(me._application.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }
        me._maskLoader.show(me.$scope, 'Loading...');
        me._refreshtimer = me.$interval(me.getHistory.bind(me), 30000);
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

        me.$scope.noJobsMessageDetailsErrors = true;

        me.$scope.selectedJob = me.$scope.jobscheduledata[$index];
        me.getHistory();
    },

    getHistory: function() {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me.$scope.selectedJob)
            || me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.jobId)) {
            return;
        }

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

        me.$scope.selectedJob = me.$scope.jobscheduledetails[$index];

        me.$scope.selectedIndexJobDetails = $index;

        if(me.$scope.selectedJob.sourceStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetErrorCount == 0) {
            me.$scope.showNoErrors = true;
            me.$scope.errorMessage = 'No errors, data transfer completed successfully';
            return;
        }

        //call the API for target error records
        if(!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.targetElementKey)) {
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
        if(!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.sourceStatusMessage)) {
            err = me.$scope.selectedJob.sourceStatusMessage
        }

        if(!me._cloudElementsUtils.isEmpty(me.$scope.selectedJob.targetStatusMessage)) {
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

        if(err != null) {
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
    },

    showEnable: function(job) {
        var me = this;
        if(!(job.scheduleState == 'PAUSED')) {
            return true;
        }
        return false;
    },

    showDisable: function(job) {
        var me = this;
        if(job.scheduleState == 'PAUSED') {
            return true;
        }
        return false;
    },

    onEnable: function(job, $event) {
        var me = this;
        me._maskLoader.show(me.$scope, 'Enabling...');
        me._jobs.enableJob(job.jobId).then(me._handleOnEnable.bind(me, job));
        $event.preventDefault();
        $event.stopPropagation();

    },

    _handleOnEnable: function(job, results) {
        var me = this;
        job.scheduleState = 'BLOCKED';
        me._maskLoader.hide();
    },

    onDisable: function(job, $event) {
        var me = this;
        me._maskLoader.show(me.$scope, 'Disabling...');
        me._jobs.disableJob(job.jobId).then(me._handleOnDisable.bind(me, job));
        $event.preventDefault();
        $event.stopPropagation();

    },

    _handleOnDisable: function(job, results) {
        var me = this;
        job.scheduleState = 'PAUSED';
        me._maskLoader.hide();
    },

    onDelete: function(job, $event) {
        var me = this;
        me._maskLoader.show(me.$scope, 'Deleting...');
        me._jobs.deleteJob(job.jobId).then(me._handleOnDelete.bind(me));

        $event.preventDefault();
        $event.stopPropagation();
    },

    _handleOnDelete: function(results) {
        var me = this;
        me._maskLoader.hide();

        me._seedJobs();
    }


});

JobsController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'Jobs', 'JobHistory', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('JobsController', JobsController);
