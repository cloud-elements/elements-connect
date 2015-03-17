/**
 * Schedule factor class as an helper to picker controller.
 *
 *
 * @author Paris
 */

var Schedule = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    _objectMetadata: null,
    _objectMetadataFlat: null,

    _openedModal: null,
    _jobs: new Array(),

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    openSchedule: function () {
        var me = this;

        if(me._cloudElementsUtils.isEmpty(me._openedModal)) {
            me._openedModal = me.$modal.open({
                templateUrl: 'schedule.html',
                controller: 'ScheduleController',
                windowClass: 'bulkloaderModalWindow',
                backdropClass: 'bulkloaderModalbackdrop',
                backdrop: 'static',
                size: 'lg'
            });
        }
    },

    closeSchedule: function () {
        var me = this;
        me._openedModal.close();
        me._openedModal = null;
    },

    runScheduledJob: function (selectedInstance, allObjects, startDate) {
        var me = this;

      // VSJ console.log("Campaigns field count: " + me._datalist.all[me._picker.selectedElementInstance.element.key].transformations.campaigns.fields.length);
        var transformations = allObjects[selectedInstance.element.key].transformations;

		    if (me._cloudElementsUtils.isEmpty(transformations)) {
		        return;
		    }

        var objects = Object.keys(transformations);

		    if (me._cloudElementsUtils.isEmpty(objects)) {
            return;
        }

        var fieldList = '';

		    for (var i = 0; i < objects.length; i++) {
            var fields = transformations[objects[i]].fields;

            if (me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                continue;
            }

            for (var j = 0; j < fields.length; j++) {
                fieldList = fieldList + fields[j].path;

                if (j < fields.length - 1) {
                    fieldList = fieldList + ', '
                }
            }

            var query = "select " + fieldList + " from " + objects[i] + " where lastRunDate = '" + startDate + "'";

            var job = new Object();

            job.query = query;
            job.objectName = objects[i];
            job.statusCheckInterval = 1000;

            var targetConfiguration = new Object();

            // targetConfiguration.path = '/hubs/documents/files';
            targetConfiguration.path = me._elementsService.configuration.targetPath;
            // targetConfiguration.method = 'POST';
            targetConfiguration.method = me._elementsService.configuration.targetMethod;
            targetConfiguration.token = me._elementsService.configuration.targetToken;

            var parameters = new Object();

            // parameters.folder = '/CloudElements';
            parameters.folder = me._elementsService.configuration.targetFolder;

            targetConfiguration.parameters = parameters;

            job.targetConfiguration = targetConfiguration;

            var notificationConfiguration = new Object();

            notificationConfiguration.token = me._elementsService.configuration.notificationToken;
            notificationConfiguration.to = me._elementsService.configuration.notificationEmail;
            // notificationConfiguration.to = "vineet@cloud-elements.com";

            job.notificationConfiguration = notificationConfiguration;

            me._elementsService.scheduleJob(selectedInstance, job)
              .then(me._handleJobScheduled.bind(me, selectedInstance),
                    me._handleJobSchedulingError.bind(me, selectedInstance));
        }

        me.closeSchedule();
    },

    _handleJobScheduled: function(selectedInstance, job) {
        var me = this;

        me._jobs.push(job);
    },

    _handleJobSchedulingError: function(selectedInstance, error) {
        var me = this;
    }

});


/**
 * Schedule Factory object creation
 *
 */
(function (){

    var ScheduleObject = Class.extend({

        instance: new Schedule(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', '$modal', function(CloudElementsUtils, ElementsService, Notifications, $modal){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Schedule',ScheduleObject);
}());


