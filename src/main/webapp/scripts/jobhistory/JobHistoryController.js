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
        me.$scope.selectedIndex = -1;
        me.$scope.showLogGrid = false;
        me.$scope.onSelectJob = me.onSelectJob.bind(this);

//      example store to work with UI
        me.$scope.jobhistorydata = [
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'leads',
                "downloadCount": '1',
                "failCount": '3',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'campaings',
                "downloadCount": '12',
                "failCount": '123',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Eloqua',
                "sourceObject": 'contact',
                "targetObject": 'person',
                "downloadCount": '2345',
                "failCount": '193',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_eloqua.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'leads',
                "downloadCount": '1',
                "failCount": '3',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'campaings',
                "downloadCount": '12',
                "failCount": '123',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Eloqua',
                "sourceObject": 'contact',
                "targetObject": 'person',
                "downloadCount": '2345',
                "failCount": '193',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_eloqua.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'leads',
                "downloadCount": '1',
                "failCount": '3',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'campaings',
                "downloadCount": '12',
                "failCount": '123',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Eloqua',
                "sourceObject": 'contact',
                "targetObject": 'person',
                "downloadCount": '2345',
                "failCount": '193',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_eloqua.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'leads',
                "downloadCount": '1',
                "failCount": '3',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Marketo',
                "sourceObject": 'contact',
                "targetObject": 'campaings',
                "downloadCount": '12',
                "failCount": '123',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_marketo.png'
            },
            {
                "date": '01/01/2015',
                "time": '12:12:34',
                "source": 'Box',
                "target": 'Eloqua',
                "sourceObject": 'contact',
                "targetObject": 'person',
                "downloadCount": '2345',
                "failCount": '193',
                "sourceLogo": 'http://localhost:8080/elements/images/elements/provider_box.png',
                "targetLogo": 'http://localhost:8080/elements/images/elements/provider_eloqua.png'
            }
        ];
        me.$scope.jobExecutions = [
            {id: "1", text: "Uer wouldn't hit a man with no trousers on, would you? jasper: your baby is the miracle the whole world "},
            {id: "2", text: "T stuck in me throat, i've had a stiff neck for hours. it's not the size mate"},
            {id: "3", text: "Pull my finger! i took a viagra, got stuck in me throat, i've had a stiff neck for hours. when i get back"},
            {id: "4", text: "At this point, i'd set you up with a chimpanzee if it'd brought you back to the world! you wouldn't"},
            {id: "5", text: "My lord! you're a tripod. i want to shoot the pigeons... off my roof. at this point, i'd set you up with"}
        ];
        me.$scope.jobExecutionsOptions = {
            data: 'jobExecutions',
            enableRowHeaderSelection: false,
            columnDefs: [
                {field: 'id', width: 50},
                {field: 'text'}
            ]
        };

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
    },

    onSelectJob:function($index){
        var me = this;
        me.$scope.selectedIndex = $index;
        me.$scope.showLogGrid = true;

    }
});

JobHistoryController.$inject = ['$scope','CloudElementsUtils', 'Notifications', 'Credentials', 'MaskLoader', '$window', '$location', '$interval', '$filter', '$route', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('JobHistoryController', JobHistoryController);
