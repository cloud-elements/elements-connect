/**
 * JobHistory controller for selection of the service.
 *
 *
 * @author Paris
 */

var JobHistoryController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init: function($scope, CloudElementsUtils, Picker, JobHistory, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._picker = Picker;
        me._history = JobHistory;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

    },

    defineScope: function() {
        var me = this;
        me.$scope.selectedIndex = -1;
        me.$scope.hideGrid = true;
        me.$scope.selectJobs = false;
        me.$scope.noJobsMessage = true;

        me.$scope.onSelectJob = me.onSelectJob.bind(this);
        me.$scope.close = me.close.bind(this);

        me.$scope.jobExecutionsOptions = {
            data: 'jobExecutions',
            enableColumnMenus: false,
            enableRowHeaderSelection: false,
            paginationPageSizes: [50],
            paginationPageSize: 50,
            columnDefs: [
                {field: 'status', width: 250},
                {field: 'response'}
            ]
        };
        me.$scope.jobhistorydata = null;
        me.$scope.jobExecutions = null;
        me.$scope.showErrors = false;
        me.$scope.showNoErrors = false;
        me.$scope.errorMessage = null;

        me.seedHistory();
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

    seedHistory: function() {
        var me = this;

        if(me._picker.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }

        me._history.getHistory().then(me._handleGetHistory.bind(me));
    },

    _handleGetHistory: function(results) {
        var me = this;
        me.$scope.jobhistorydata = results;
    },

    onSelectJob: function($index) {
        var me = this;

        me.$scope.showErrors = false;
        me.$scope.showNoErrors = false;
        me.$scope.noJobsMessage = false;

        me.$scope.selectedJob = me.$scope.jobhistorydata[$index];

        me.$scope.selectedIndex = $index;

        if(me.$scope.selectedJob.status == 'ERROR') {
            me.$scope.errorMessage = me.$scope.selectedJob.statusMessage;
            return;
        }

        if(me.$scope.selectedJob.sourceStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetStatus == 'COMPLETED'
            && me.$scope.selectedJob.targetErrorCount == 0) {
            me.$scope.showNoErrors = true;
            me.$scope.errorMessage = 'No errors, data transfer completed successfully';
            return;
        }

//        document.getElementsByClassName('grid')[0]).css('width', '100%');

        //Check for any errors, Check if source has errors, if not then check for Target
//        if(me.$scope.selectedJob.sourceStatus != 'COMPLETED'
//            && me.$scope.selectedJob.sourceErrorCount > 0) {
//            //call the API for source error records
//            return me._history.getJobErrors(me.$scope.selectedJob.sourceElementKey, me.$scope.selectedJob.sourceJobId).then(me._handleGetJobErrors.bind(me));
//        } else if(me.$scope.selectedJob.sourceStatus != 'COMPLETED'){
//            me.$scope.errorMessage = me.$scope.selectedJob.sourceStatusMessage;
//            return;
//        }

        //Check if target has errors
//        if(me.$scope.selectedJob.targetStatus != 'COMPLETED'
//            && me.$scope.selectedJob.targetErrorCount > 0) {
            //call the API for target error records
            return me._history.getJobErrors(me.$scope.selectedJob.targetElementKey, me.$scope.selectedJob.targetJobId).then(me._handleGetJobErrors.bind(me));
//        } else if(me.$scope.selectedJob.targetStatus != 'COMPLETED'){
//            me.$scope.errorMessage = me.$scope.selectedJob.targetStatusMessage;
//            return;
//        }
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

JobHistoryController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'JobHistory', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('JobHistoryController', JobHistoryController);
