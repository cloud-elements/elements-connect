/*
    Wise.io BulkLoader - view.js 
    
    Description: This file helps load and initialize
    all of the semantic-ui modules, and other various
    helpers for the BulkLoader mockup.
*/

var bulkView = (function() {
    
    return {
        init: function() {
            this.dropdown();
            this.modal();
            this.checkbox();
            this.checkboxList();
            this.launchScheduling();
            this.checkboxAllObjects();
            //this.datePicker();
            
            // This is for demo purposes ONLY.
            this.demoCode();
        },
        
        demoCode: function() {
            $('#picker .services-selections a').not('i').on('click', function(e) {
                
                // Promise that the icon inside the anchor does not trigger the mapping screen
                if (e.target.classList[0] != 'icon') {    
                    var service = $(this).attr('alt');

                    $('.animated-card').addClass('push-back');
                    $('.from-right').removeClass('from-right'); 
                }
            });
        },
        
        dropdown: function() {
            $('.dropdown').dropdown();
        },
        
        modal: function() {
            $('.modal').modal();
        },
        
        checkbox: function() {
            $('.checkbox').checkbox();  
        },
        
        checkboxList: function() {
           $('.checkbox').on('click', function() {
               var parent = $(this).parent();
               var status = $(this).hasClass('checked');
               var parentStatus = $(this).parents('ul').siblings('.checkbox').hasClass('checked')         
               
               if (status) {
                   parent.find('ul .checkbox').not('.checked').addClass('checked');
                   parent.find('ul input:checkbox').attr('checked', true);
               }
               if (!status && parentStatus) {
                    parent.parents('ul').siblings('.checkbox').removeClass('checked');
                    parent.parents('ul').siblings('input:checkbox').attr('checked', false);
               }     
            
            });
        },
        
        checkboxAllObjects: function() {
            $('.dropdown .checkbox').on('click', function() {
                $('#data-list-body, .dropdown .item').toggleClass('disabled');
            });
        },
        
        button: function() {
            
        },
        
        selectService: function(service) {
            $('.service').text(service + ' objects:');
        },
        
        launchScheduling: function() {
            $('#save, .services-selections i.icon.wait').on('click', function(e) {
                
                $('.basic.modal').modal('show')   
            });
        }
    }
    
})();

$(document).ready(function() {
    bulkView.init();
});