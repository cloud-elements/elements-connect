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
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init: function($scope, CloudElementsUtils, Picker, Jobs, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog) {
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me._picker = Picker;
        me._jobs = Jobs;
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
        me.$scope.close = me.close.bind(this);

        // Temp Store for schedule job data
        me.$scope.jobscheduledata = [
            {
                source: 'Pipedrive',
                sourceLogo: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRHf3AxNjqGdISH5H9_vtTfFsMCA_D28QGk9eiK899BlteXOuCi',
                target: 'Hubspot',
                targetLogo: 'https://qa.cloud-elements.com/elements/images/elements/provider_hubspot.png',
                transformations:[
                    {
                        sourceObject: 'users',
                        targetObject: 'details'
                    },
                    {
                        sourceObject: 'contacts',
                        targetObject: 'contacts'
                    },
                    {
                        sourceObject: 'account',
                        targetObject: 'leads'
                    }
                ],
                scheduleType: 'monthly',
                scheduleTypeDetail: '1'
            },
            {
                source: 'Zoho CRM',
                sourceLogo: 'https://qa.cloud-elements.com/elements/images/elements/provider_zohocrm.png',
                target: 'Hubspot',
                targetLogo: 'https://qa.cloud-elements.com/elements/images/elements/provider_hubspot.png',
                transformations:[
                    {
                        sourceObject: 'users',
                        targetObject: 'details'
                    }
                ],
                scheduleType: 'hourly',
                scheduleTypeDetail: null
            }
        ],

        // Temp Store for Scheduled jobs Details
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

    onSelectJob: function($index) {
        var me = this;

//        me.$scope.selectedJob = me.$scope.jobhistorydata[$index];

        me.$scope.noJobsMessage = false;
        me.$scope.selectedIndex = $index;
    },

    close: function() {
        var me = this;
        me.$location.path('/');
    }

});

JobsController.$inject = ['$scope', 'CloudElementsUtils', 'Picker', 'Jobs', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];

angular.module('bulkloaderApp')
    .controller('JobsController', JobsController);
