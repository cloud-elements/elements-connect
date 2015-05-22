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
    _instances: null,
    _maskLoader: null,
    _credentials: null,

    init:function($scope, CloudElementsUtils, Notifications, Credentials, MaskLoader, $window, $location, $interval, $filter, $route, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._maskLoader = MaskLoader;
        me._cloudElementsUtils = CloudElementsUtils;
        me._credentials = Credentials;
        me.$window = $window;
        me.$location = $location;
        me.$interval = $interval;
        me.$mdDialog = $mdDialog;
        me._super($scope);

    },

    defineScope:function() {
        var me = this;

    },

    defineListeners:function() {
        var me = this;
        me._super();
//        TODO Add handleError and showMask
//        me._notifications.addEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
//        me._notifications.addEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
    },

    destroy:function(){
        var me = this;
//        TODO Add handleError and showMask
//        me._notifications.removeEventListener(bulkloader.events.ERROR, me._handleError.bind(me), me.$scope.$id);
//        me._notifications.removeEventListener(bulkloader.events.SHOW_MASK, me.showMask.bind(me), me.$scope.$id);
    }

});

JobHistoryController.$inject = ['$scope','CloudElementsUtils', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('JobHistoryController', JobHistoryController);
