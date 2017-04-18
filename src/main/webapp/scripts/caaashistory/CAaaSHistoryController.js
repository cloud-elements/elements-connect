/**
 * CAaaSHistory controller for showing the history details
 *
 *
 * @author Ramana
 */

var CAaaSHistoryController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _application: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init: function($scope, CloudElementsUtils, Application, CAaaSHistory, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._application = Application;
        me._history = CAaaSHistory;
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
        me.$scope.showTarget = true;
        me.$scope.onSelectJob = me.onSelectJob.bind(this);
        me.$scope.close = me.close.bind(this);
        me.$scope.jobExecutionsOptions = {
            data: 'jobExecutions',
            enableColumnMenus: false,
            enableRowHeaderSelection: false,
            enableRowSelection: true,
            multiSelect: false,
            paginationPageSizes: [50],
            paginationPageSize: 50,
            columnDefs: [
                {field: 'id', width: 120},
                {field: 'createdDate'},
                {field: 'updatedDate'}
            ]
        };
        me.$scope.appName = me._application.getApplicationName();

        me.$scope.jobExecutionsOptions.onRegisterApi = function(gridApi){
            //set gridApi on scope
            me.$scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(me.$scope,function(row){
                me.selectExecution(row);
            });

        };

        me.seedHistory();
    },

    defineListeners: function() {
        var me = this;
    },

    destroy: function() {
        var me = this;
    },

    seedHistory: function() {
        var me = this;

        if(me._application.isSecretsPresent() == false) {
            me.$location.path('/');
            return;
        }

//        if(me._application.getView() == 'datalist') {
//            me.$scope.showTarget = false;
//        }

        me.getHistory();
//        me._refreshtimer = me.$interval(me.getHistory.bind(me), 30000);
    },

    getHistory: function() {
        var me = this;
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


        //call the API for execution error records
        return me._history.getInstanceExecution(me.$scope.selectedJob.formula.id, me.$scope.selectedJob.id).then(me._handleGetJobExecutions.bind(me));
    },

    _handleGetJobExecutions: function(results) {
        var me = this;

        //Construct the message here based on the
        me.$scope.jobExecutions = results;

        if(results.length > 0) {
            me.$scope.showErrors = true;
        }
    },

    selectExecution: function(row){
        var me = this;
        return me._history.getExecutionValues(me.$scope.selectedJob.formula.id, me.$scope.selectedJob.id, row.entity.id).then(me._handleGetJobExecutionValue.bind(me));
    },

    _handleGetJobExecutionValue: function(results) {
        var me = this;

        //Construct the message here based on the
        me.$scope.jobExecutionValue = results.stepExecutions;

        if(results.length > 0) {
            me.$scope.showValues = true;
        }
    },
    close: function() {
        var me = this;
        me.$location.path('/');
    }

});

CAaaSHistoryController.$inject = ['$scope', 'CloudElementsUtils', 'Application', 'CAaaSHistory', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('CAaaSHistoryController', CAaaSHistoryController);