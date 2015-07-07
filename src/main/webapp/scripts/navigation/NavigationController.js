/**
 * Navigation controller for selection of the service.
 *
 *
 * @author Paris
 */

var NavigationController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _jobs: null,
    _history: null,
    _instances: null,
    _maskLoader: null,
    _credentials: null,
    _navigation: null,

    init: function($scope, CloudElementsUtils, Navigation, Jobs, JobHistory, Notifications, Credentials, MaskLoader, Help, $window, $location, $interval, $filter, $route, $mdDialog, $mdSidenav) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
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
        me.$scope.steps = [
            {
                step: '1',
                stepName: 'Select it',
                description: 'Select the services, the source and target for your data.'
            },
            {
                step: '2',
                stepName: 'Map it',
                description: 'Drag and drop the fields you wish to map from the source to the target.'
            },
            {
                step: '3',
                stepName: 'Schedule it',
                description: 'Select Transfer Now or Schedule. Data will be pulled from your system starting from this date to the present time.'
            }
        ]

    },

    defineListeners: function() {
        var me = this;
        me._super();
//        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
    },

    onSignout: function(){
        var me = this;
        me.$location.path('/credentials');
    },

    onHelp: function($event){
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

    stepClass: function(step, stepname){
        var me = this;

        if ((step == '1' && stepname == 'picker') || (step == '2' && stepname == 'mapper') || (step == '2' && stepname == 'datalist') || (step == '3' && stepname == 'schedule')){
            return 'active'
        }
        else if ((step == '1' && stepname == 'mapper') || (step == '1' && stepname == 'schedule') || (step == '2' && stepname == 'schedule') || (step == '2' && stepname == 'datalist')){
            return 'completed'
        }

    },

    showStepTitle: function(step, stepname){
        if ((step == '1' && stepname == 'picker') || (step == '2' && stepname == 'mapper') || (step == '2' && stepname == 'datalist') || (step == '3' && stepname == 'schedule')){
            return true
        }
    }

});

NavigationController.$inject = ['$scope', 'CloudElementsUtils', 'Navigation', 'Jobs', 'JobHistory', 'Notifications', 'Credentials', 'MaskLoader', 'Help', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog', '$mdSidenav'];

angular.module('bulkloaderApp')
    .controller('NavigationController', NavigationController);
