/**
 * Navigation controller for selection of the service.
 *
 *
 * @author Paris
 */

var NavigationController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _application: null,
    _jobs: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,
    _navigation: null,

    init: function($scope, CloudElementsUtils, Picker, Application, Notifications, Navigation, Jobs, JobHistory, Credentials, MaskLoader, Help, $window, $location, $interval, $filter, $route, $mdDialog, $mdSidenav) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._credentials = Credentials;
        me._application = Application;
        me.$window = $window;
        me._jobs = Jobs;
        me._help = Help;
        me._history = JobHistory;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me.$mdSidenav = $mdSidenav;
        me._navigation = Navigation;
        me._super($scope);
    },

    defineScope: function() {
        var me = this;

        me.$scope.shownav = true;
        me.$scope.onSignout = me.onSignout.bind(me);
        me.$scope.onHelp = me.onHelp.bind(me);
        me.$scope.openSideNav = me.openSideNav.bind(me);
        me.$scope.stepClass = me.stepClass.bind(me);
        me.$scope.showStepTitle = me.showStepTitle.bind(me);
        me.$scope.onJobHistory = me.onJobHistory.bind(me);
        me.$scope.onScheduledJobs = me.onScheduledJobs.bind(me);
        me.$scope.nextButtonText = 'Save and Schedule Job';
        // change the name of the 'Next' button text if this is for the CAaaS
        if(me._application.isCAaaS()) {
            me.$scope.nextButtonText = 'Save';
        }

        me.seedSteps();

        if(!me._cloudElementsUtils.isEmpty(me._application.configuration) && !me._cloudElementsUtils.isEmpty(me._application.getDisplay())
            && me._application.getDisplay().scheduling == true) {
            me.$scope.showScheduling = true;
        } else {
            me.$scope.showScheduling = false;
        }
    },

    onSignout: function() {
        var me = this;
        me._application.resetConfiguration();
        me.$location.path('/credentials');
    },

    onHelp: function($event) {
        var me = this;
        event.preventDefault();
        event.stopPropagation();
        me._help.openHelp();
    },

    openSideNav: function(navID) {
        var me = this;
        me.$mdSidenav(navID)
            .toggle();
    },

    seedSteps: function() {
        var me = this;
        // the CAaaS/mapper only has two steps
        if(me._application.isCAaaS() && me._application.getView() == 'mapper') {
            me.$scope.steps = [
                {
                    step: '1',
                    stepname: 'select it',
                    description: 'select the services, the source and target for your data.'
                },
                {
                    step: '2',
                    stepname: 'map it',
                    description: 'drag and drop the fields you wish to map from the source to the target.'
                }
            ]
        }
        else if(me._application.isBulkloader() && me._application.getView() == 'datalist') {
            me.$scope.steps = [
                {
                    step: '1',
                    stepName: 'Select it',
                    description: 'Select a service, the source of your data.'
                },
                {
                    step: '2',
                    stepName: 'Map it',
                    description: 'Select the fields you wish to map.'
                },
                {
                    step: '3',
                    stepName: 'Schedule it',
                    description: 'Select the calendar to choose a date. Data will be pulled from your system starting from this date to the present time.'
                }
            ]
        } else {
            me.$scope.steps = [
                {
                    step: '1',
                    stepname: 'select it',
                    description: 'select the services, the source and target for your data.'
                },
                {
                    step: '2',
                    stepname: 'map it',
                    description: 'drag and drop the fields you wish to map from the source to the target.'
                },
                {
                    step: '3',
                    stepname: 'schedule it',
                    description: 'select transfer now or schedule. data will be pulled from your system starting from this date to the present time.'
                }
            ]
        }
    },

    stepClass: function(step, stepname) {
        var me = this;

        if((step == '1' && stepname == 'picker') || (step == '2' && stepname == 'mapper') || (step == '2' && stepname == 'datalist') || (step == '3' && stepname == 'schedule')) {
            return 'active'
        }
        else if((step == '1' && stepname == 'mapper') || (step == '1' && stepname == 'schedule') || (step == '2' && stepname == 'schedule') || (step == '1' && stepname == 'datalist')) {
            return 'completed'
        }

    },

    showStepTitle: function(step, stepname) {
        if((step == '1' && stepname == 'picker') || (step == '2' && stepname == 'mapper') || (step == '2' && stepname == 'datalist') || (step == '3' && stepname == 'schedule')) {
            return true
        }
    },

    onJobHistory: function() {
        var me = this;

        if(me._application.isBulkloader()) {
            me.$location.path('/jobhistory');
        } else {
            me.$location.path('/caaashistory');
        }

    },

    onScheduledJobs: function() {
        var me = this;
        me.$location.path('/jobs');
    }


});

NavigationController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Application', 'Navigation', 'Jobs', 'JobHistory', 'Notifications', 'Credentials', 'MaskLoader', 'Help', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog', '$mdSidenav'];

angular.module('bulkloaderApp')
    .controller('NavigationController', NavigationController);
