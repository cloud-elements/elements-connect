/**
 * Help controller for selecting the fields.
 *
 *
 * @author Paris
 */

var HelpController = BaseController.extend({

    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _application: null,
    _instances: null,
    $modal: null,
    $mdDialog: null,
    _maskLoader: null,

    init:function($scope, CloudElementsUtils, Picker, Application, Notifications, MaskLoader, Help, $window, $location, $filter, $route, $modal, $mdDialog){
        var me = this;

        me._notifications = Notifications;
        me._cloudElementsUtils = CloudElementsUtils;
        me._picker = Picker;
        me._application = Application;
        me._help = Help;
        me.$modal = $modal;
        me.$mdDialog = $mdDialog;
        me.$window = $window;
        me._maskLoader = MaskLoader;
        me.$location = $location;
        me._super($scope);
    },

    defineScope:function() {
        var me = this;
        me.$scope.cancel = me.cancel.bind(me);

        if(me._application.getConfigName() == 'swiftpage') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/SelectSource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/BigCommerce.png', steps:[{text:'BigCommerce.'},{text:'For additional information on where to find these values:'}, {link:'http://swiftpage-docs.cloud-elements.com/docs/services/bigcommerce/bigcommerce-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/Ecwid.png', steps:[{text:'Ecwid'},{text:'To set up your Ecwid account, please sign in and go to:'},{link:'https://my.ecwid.com/cp/CP.html#legacy_api'},{text:'For additional information on where to find these values:'}, {link:'http://swiftpage-docs.cloud-elements.com/docs/services/ecwid/ecwid-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/Etsy.png', steps:[{text:'Etsy'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/etsy/etsy-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/Shopify.png', steps:[{text:'Shopify'}, {text:'Enter Store Name, Username, and Password'}]},
                {imageURL: 'swiftpage-help-images/Volusion.png', steps:[{text:'Volusion'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/volusion/volusion-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/WooCommerce.png', steps:[{text:'WooCommerce'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/woocommerce/woocommerce-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/SelectTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},

                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/ClickMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/ClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/History.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'bigcommerce.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/BCSource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/BigCommerce.png', steps:[{text:'BigCommerce.'},{text:'For additional information on where to find these values:'}, {link:'http://swiftpage-docs.cloud-elements.com/docs/services/bigcommerce/bigcommerce-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/BCTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/BCMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/BCClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/BCHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'ecwid.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/EcwidSource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/Ecwid.png', steps:[{text:'Ecwid'},{text:'To set up your Ecwid account, please sign in and go to:'},{link:'https://my.ecwid.com/cp/CP.html#legacy_api'},{text:'For additional information on where to find these values:'}, {link:'http://swiftpage-docs.cloud-elements.com/docs/services/ecwid/ecwid-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/EcwidTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/EcwidMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/EcwidClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/EcwidHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'etsy.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/EtsySource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/Etsy.png', steps:[{text:'Etsy'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/etsy/etsy-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/EtsyTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/EtsyMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/EtsyClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/EtsyHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'shopify.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/ShopifySource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/Shopify.png', steps:[{text:'Shopify'}, {text:'Enter Store Name, Username, and Password'}]},
                {imageURL: 'swiftpage-help-images/ShopifyTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/ShopifyMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/ShopifyClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/ShopifyHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'volusion.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/VolusionSource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/Volusion.png', steps:[{text:'Volusion'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/volusion/volusion-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/VolusionTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/VolusionMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/VolusionClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/VolusionHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if(me._application.getConfigName() == 'woocommerce.actpremium') {
            me.$scope.helpList = [
                {imageURL: 'swiftpage-help-images/WCSource.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'swiftpage-help-images/WooCommerce.png', steps:[{text:'WooCommerce'},{text:'For additional information on where to find these values:'},{link:'http://swiftpage-docs.cloud-elements.com/docs/services/woocommerce/woocommerce-endpoint-setup.html'}]},
                {imageURL: 'swiftpage-help-images/WCTarget.png', steps:[{text:'Select a service, the target of your data.'}]},
                {imageURL: 'swiftpage-help-images/ActPremium.png', steps:[{text:'Act! Premium'},{text:'Enter Act!' +
                ' Premium URL, Username, Password, and Database Name. For additional information on where to find' +
                ' these values:'},{link:'http://kb.act.com/app/answers/detail/a_id/38287'}]},
                {imageURL: 'swiftpage-help-images/SelectFormula.png', steps:[{text:'Select a formula to use'}]},
                {imageURL: 'swiftpage-help-images/Create.png', steps:[{text:'Create the connection.'}]},
                {imageURL: 'swiftpage-help-images/ClickDone.png', steps:[{text:'Click Done in the upper right corner.'}]},
                {imageURL: 'swiftpage-help-images/WCMenu.png', steps:[{text:'Click Menu in the upper left corner.'}]},
                {imageURL: 'swiftpage-help-images/WCClickHistory.png', steps:[{text:'Click History.'}]},
                {imageURL: 'swiftpage-help-images/WCHistory.png', steps:[{text:'This is where you can view active connections.'},{text:'By selecting a connection, you can view when it has executed.'}]}
            ]
        } else if (me._application.getView() == 'mapper') {
            me.$scope.helpList = [
                {imageURL: 'help-images/BulkloaderClickThrough-1.png', steps:[{text:'1. Select a service, the source of your data.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-2.png', steps:[{text:'2. Enter Zoho Username'}, {text:'3. Enter Zoho Password.'}, {text:'4. Click "Create".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-3.png', steps:[{text:'5. Select HubSpot to connect your account.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-4.png', steps:[{text:'6. Enter your HubSpot Portal ID.'}, {text:'7. Click "Create".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-5.png', steps:[{text:'8. Login to your HubSpot Account.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-6.png', steps:[{text:'9. Authorize the application.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-7.png', steps:[{text:'10. Select an object to map from the source application.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-8.png', steps:[{text:'11. Drag and drop the fields you wish to map from the source to the target.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-9.png', steps:[{text:'12. The "X" will delete a field if necessary.'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-10.png', steps:[{text:'13. Click "Save and Schedule Job".'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-11.png', steps:[{text:'14. Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'}, {text: '15. Select Date'}, {text:'16. Click "Transfer Now"'}]},
                {imageURL: 'help-images/BulkloaderClickThrough-12.png', steps:[{text:'17. Click "OK".  An email will notify you when the job has completed.'}]}
            ]
        } else {
            me.$scope.helpList = [
                {imageURL: 'wise-help-images/BulkloaderClickThrough-01.png', steps:[{text:'Select a service, the source of your data.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-02.png', steps:[{text:'Enter your credentials for that service.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-03.png', steps:[{text:'Select an object to map from the source application.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-04.png', steps:[{text:'The button at the top will select all fields for the object.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-05.png', steps:[{text:'Or select the fields you wish to map.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-06.png', steps:[{text:'Click "Save and Schedule Job".'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-07.png', steps:[{text:'Select the calendar to choose a date.  Data will be pulled from your system starting from this date to the present time.'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-08.png', steps:[{text:'Click "Schedule Job".'}]},
                {imageURL: 'wise-help-images/BulkloaderClickThrough-09.png', steps:[{text:'Click "OK".  An email will notify you when the job has completed.'}]}
            ]
        }

    },

    cancel: function() {
        var me = this;

        me._help.closeHelp();
    }

});

HelpController.$inject = ['$scope','CloudElementsUtils','Picker', 'Application', 'Notifications', 'MaskLoader', 'Help', '$window', '$location', '$filter', '$route', '$modal', '$mdDialog'];


angular.module('bulkloaderApp')
    .controller('HelpController', HelpController);



