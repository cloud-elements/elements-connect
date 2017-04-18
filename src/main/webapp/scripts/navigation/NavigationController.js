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

        me.$scope.shownav = false;
        me.$scope.onSignout = me.onSignout.bind(me);
        me.$scope.onHelp = me.onHelp.bind(me);
        me.$scope.contactSupport = me.contactSupport.bind(me);
        me.$scope.openSideNav = me.openSideNav.bind(me);
        me.$scope.stepClass = me.stepClass.bind(me);
        me.$scope.showStepTitle = me.showStepTitle.bind(me);
        me.$scope.onJobHistory = me.onJobHistory.bind(me);
        me.$scope.onScheduledJobs = me.onScheduledJobs.bind(me);
        me.$scope.nextButtonText = 'Save and Schedule Job';
        // Google Tag Manager for HubSpot only
        me.$scope.hsanalytics = me._application.isHS();

        // change the name of the 'Next' button text if this is for the CAaaS
        if(me._application.isCAaaS()) {
            me.$scope.nextButtonText = 'Save and Configure Formula';
        }

        me.seedSteps();

        if(me._application.showScheduling()) {
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
        $event.preventDefault();
        $event.stopPropagation();
        me._help.openHelp();
        me.$mdSidenav('left').close();
    },

    contactSupport: function($event) {
        var me = this;
        $event.preventDefault();
        $event.stopPropagation();
        var supportURL = "http://support.cloud-elements.com/hc/en-us/requests/new?preview%5Btheme_id%5D=203658075&preview_as_role=end_user&use_theme_settings=false";
        if (me._application.configuration.supportURL) {
            supportURL = me._application.configuration.supportURL;
        }
        window.open(supportURL, "_blank");
        me.$mdSidenav('left').close();
    },

    openSideNav: function(navID, $event) {
        var me = this;
        $event.preventDefault();
        $event.stopPropagation();
        console.log('click menu');
        return me.$mdSidenav(navID).toggle();

    },

    seedSteps: function() {
        var me = this;
        // the CAaaS/mapper only has two steps
        if(me._application.isCAaaS() && me._application.ignoreMapper() == true) {
            me.$scope.steps = [
                {
                    step: '1',
                    stepName: 'Select it',
                    description: 'select the services, the source and target for your data.'
                },
                {
                    step: '2',
                    stepName: 'Configure it',
                    description: 'choose the formula template and configure it.'
                }
            ]
        }
        else if(me._application.isCAaaS() && me._application.getView() == 'mapper') {
            me.$scope.steps = [
                {
                    step: '1',
                    stepName: 'Select it',
                    description: 'select the services, the source and target for your data.'
                },
                {
                    step: '2',
                    stepName: 'Map it',
                    description: 'drag and drop the fields you wish to map from the source to the target.'
                },
                {
                    step: '3',
                    stepName: 'Configure it',
                    description: 'choose the formula template and configure it.'
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
                    stepName: 'Select it',
                    description: 'select the services, the source and target for your data.'
                },
                {
                    step: '2',
                    stepName: 'Map it',
                    description: 'drag and drop the fields you wish to map from the source to the target.'
                },
                {
                    step: '3',
                    stepName: 'Schedule it',
                    description: 'select transfer now or schedule. data will be pulled from your system starting from this date to the present time.'
                }
            ]
        }

        // To Hide navbar style on first time load or reload
        if(!me._cloudElementsUtils.isEmpty(me._picker._appname)){
            me.$scope.shownav = true;
        }

    },

    stepClass: function(step, stepName) {
        var me = this;

        if((step == '1' && stepName == 'picker') || (step == '2' && stepName == 'mapper') || (step == '2' && stepName == 'datalist') || (step == '3' && stepName == 'schedule') || (step == '3' && stepName == 'formula')) {
            return 'active'
        }
        else if((step == '1' && stepName == 'mapper') || (step == '1' && stepName == 'schedule') || (step == '2' && stepName == 'schedule') || (step == '1' && stepName == 'datalist') || (step == '1' && stepName == 'formula') || (step == '2' && stepName == 'formula')) {
            return 'completed'
        }

    },

    showStepTitle: function(step, stepName) {
        if((step == '1' && stepName == 'picker') || (step == '2' && stepName == 'mapper') || (step == '2' && stepName == 'datalist') || (step == '3' && stepName == 'schedule') || (step == '3' && stepName == 'formula')) {
            return true
        }
    },

    onJobHistory: function() {
        var me = this;

        if(me._application.isBulkloader()) {
            me.$location.path('/jobhistory');
        } else {
            me.$location.path('/history');
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
