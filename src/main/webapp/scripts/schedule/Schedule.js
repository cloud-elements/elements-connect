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
    _mdDialog: null,
    _jobs: new Array(),

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    _scheduledConfirmation: function(ev) {
        var me = this;

        var confirm = me.$mdDialog.alert()
            .title('Your job has been scheduled')
            .content('You will receive an email when the job is completed."')
            .ariaLabel('Password notification')
            .ok('OK')
            .targetEvent(ev);

        me.$mdDialog.show(confirm).then(me.closeSchedule.bind(me));
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

    _buildFieldList: function(fields, fieldCheckType) {
        var me = this;

        var fieldList = '';
        var selectedFieldCount = 0;

        for (var i = 0; i < fields.length; i++) {
            if (fieldCheckType == 'vendorPath' && me._cloudElementsUtils.isEmpty(fields[i].vendorPath)) {
                continue;
            } else if (fieldCheckType == 'transform' &&
                        (me._cloudElementsUtils.isEmpty(fields[i].transform) || fields[i].transform == false)) {
                continue;
            }


            if (selectedFieldCount > 0) {
                fieldList = fieldList + ', '
            }

            if (fieldCheckType == 'vendorPath') {
                fieldList = fieldList + fields[i].path;
            } else if (fieldCheckType == 'transform') {
                fieldList = fieldList + fields[i].vendorPath;
            }

            selectedFieldCount++;
        }

        return fieldList;
    },

    _scheduleObjectJob: function(selectedInstance, targetInstance, objectName, fields, fieldCheckType,
                                 startDate, statusCheckInterval) {
        var me = this;
        var query = "select " + me._buildFieldList(fields, fieldCheckType) + " from " + objectName;
        var job = new Object();

        job.query = query;
        job.from = startDate;
        job.objectName = objectName;
        job.statusCheckInterval = statusCheckInterval;

        var targetConfiguration = new Object();

        if (me._cloudElementsUtils.isEmpty(me._elementsService.configuration.target.appendObjectName) ||
                me._elementsService.configuration.target.appendObjectName == false) {
            targetConfiguration.path = me._elementsService.configuration.target.path;
        } else {
            targetConfiguration.path = me._elementsService.configuration.target.path + '/' + objectName;
        }

        targetConfiguration.method = me._elementsService.configuration.target.method;

        if (me._cloudElementsUtils.isEmpty(me._elementsService.configuration.target.elementToken) == false) {
            targetConfiguration.token = me._elementsService.configuration.target.elementToken;
        } else {
            targetConfiguration.token = targetInstance.token;
        }

        var parameters = new Object();

        if (me._cloudElementsUtils.isEmpty(me._elementsService.configuration.target.other) == false) {
            for (key in me._elementsService.configuration.target.other) {
                if (me._elementsService.configuration.target.other.hasOwnProperty(key)) {
                    parameters[key] = me._elementsService.configuration.target.other[key];
                }
            }
        }

        targetConfiguration.parameters = parameters;

        job.targetConfiguration = targetConfiguration;

        var notificationConfiguration = new Object();

        notificationConfiguration.token = me._elementsService.configuration.notificationToken;
        notificationConfiguration.to = me._elementsService.configuration.notificationEmail;

        job.notificationConfiguration = notificationConfiguration;

        me._elementsService.scheduleJob(selectedInstance, job)
            .then(me._handleJobScheduled.bind(me, selectedInstance),
                  me._handleJobSchedulingError.bind(me, selectedInstance));
    },

    runMapperScheduledJob: function (selectedInstance, targetInstance, allObjects, startDate) {
        var me = this;

        var mappings = allObjects[selectedInstance.element.key].metamapping;

        if (me._cloudElementsUtils.isEmpty(mappings)) {
            // TODO: VSJ: Show an error message here.
            return;
        }

        var objects = Object.keys(mappings);

        if (me._cloudElementsUtils.isEmpty(objects)) {
            // TODO: VSJ: Show an error message here.
            return;
        }

        for (var i = 0; i < objects.length; i++) {
            var fields = mappings[objects[i]].fields;

            if (me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                continue;
            }

            me._scheduleObjectJob(selectedInstance, targetInstance, objects[i], fields, 'vendorPath', startDate, 60000);
        }

        me._scheduledConfirmation();
    },

    runDatalistScheduledJob: function (selectedInstance, targetInstance, allObjects, startDate) {
        var me = this;

        // VSJ console.log("Campaigns field count: " + me._datalist.all[me._picker.selectedElementInstance.element.key].transformations.campaigns.fields.length);
        var transformations = allObjects[selectedInstance.element.key].metadata;

        if (me._cloudElementsUtils.isEmpty(transformations)) {
            return;
        }

        var objects = Object.keys(transformations);

        if (me._cloudElementsUtils.isEmpty(objects)) {
            // TODO: VSJ: Show an error message here.
            return;
        }

        var objectsAndTrans = allObjects[selectedInstance.element.key].objectsAndTrans;

        if (me._cloudElementsUtils.isEmpty(objectsAndTrans)) {
            // TODO: VSJ: Show an error message here.
            return;
        }

        for (var i = 0; i < objects.length; i++) {
            if (me._cloudElementsUtils.isEmpty(objectsAndTrans[objects[i]]) || objectsAndTrans[objects[i]] == false) {
                continue;
            }

            var fields = transformations[objects[i]].fields;

            if (me._cloudElementsUtils.isEmpty(fields) || fields.length <= 0) {
                continue;
            }

            me._scheduleObjectJob(selectedInstance, targetInstance, objects[i], fields, 'transform', startDate, 60000);
        }

        me._scheduledConfirmation();



        /* VSJ
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

            // var query = "select " + fieldList + " from " + objects[i] + " where lastRunDate = '" + startDate + "'";
            var query = "select " + fieldList + " from " + objects[i];

            var job = new Object();

            job.query = query;
            job.from = startDate;
            job.objectName = objects[i];
            job.statusCheckInterval = 1000;

            var targetConfiguration = new Object();

            targetConfiguration.path = me._elementsService.configuration.target.path;
            targetConfiguration.method = me._elementsService.configuration.target.method;
            targetConfiguration.token = me._elementsService.configuration.target.elementToken;

            var parameters = new Object();

            if (me._cloudElementsUtils.isEmpty(me._elementsService.configuration.target.other) == false) {
                for (key in me._elementsService.configuration.target.other) {
                    if (me._elementsService.configuration.target.other.hasOwnProperty(key)) {
                        parameters[key] = me._elementsService.configuration.target.other[key];
                    }
                }
            }

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

        me._scheduledConfirmation();
        */
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
        $get:['CloudElementsUtils', 'ElementsService','Notifications', '$modal', '$mdDialog', function(CloudElementsUtils, ElementsService, Notifications, $modal, $mdDialog){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance.$modal = $modal;
            this.instance.$mdDialog = $mdDialog;

            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Schedule',ScheduleObject);
}());


