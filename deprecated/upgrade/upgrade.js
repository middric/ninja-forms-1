jQuery(document).ready(function($) {

    /**
     * Show an opt-in modal if the user isn't currently opted in.
     */
    if ( 0 == nfThreeUpgrade.optedIn ) {
        var optinModal = new jBox( 'Modal', {
            content:        jQuery( '#optin-modal' ),
            closeOnEsc:     false,
            closeOnClick:   false,
            title:          jQuery( '#optin-modal-title' )
        } );
         
        optinModal.open();
        
        // Show/Hide email field, based on the opt-in checkbox.
        jQuery( '#optin-send-email' ).click( function( e ) {
            if( jQuery( this ).is( ':checked' ) ) {
                jQuery( '#optin-block' ).show();
            } else {
                jQuery( '#optin-block' ).hide();
            }
        } )

        jQuery( '#optin' ).click( function( e ) {
            var sendEmail;

            if ( jQuery( '#optin-send-email' ).attr( 'checked' ) ) {
                sendEmail = 1;
                userEmail = jQuery( '#optin-email-address' ).val();
            } else {
                sendEmail = 0;
                userEmail = '';
            }

            // Show spinner
            jQuery( '#optin-spinner' ).css( 'visibility', 'visible' );
            // Hit AJAX endpoint and opt-in.
            jQuery.post( ajaxurl, { action: 'ninja_forms_optin', send_email: sendEmail, user_email: userEmail }, function( response ) {
                jQuery( '#optin-spinner' ).css( 'visibility', 'hidden' );
                optinModal.setContent( jQuery( '#optin-thankyou' ) );
                /**
                 * When we get a response from our endpoint, show a thank you and set a timeout
                 * to close the modal.
                 */
                setTimeout (
                    function(){
                        optinModal.close();
                    },
                    2000
                );
            } );            
        } );


        jQuery( '#optout' ).click( function( e ) {
            // Show spinner
            jQuery( '#optin-spinner' ).attr( 'visibility', 'visible' );
            // Hit AJAX endpoint and opt-in.
             jQuery.post( ajaxurl, { action: 'ninja_forms_optout' }, function( response ) {
                jQuery( '#optin-spinner' ).attr( 'visibility', 'hidden' );
                // When we get a response from our endpoint, close the modal. 
                optinModal.close();
            } );            
        } );

    }

    /*
     |--------------------------------------------------------------------------
     | Ninja Forms THREE Upgrade App
     |--------------------------------------------------------------------------
     */

    var nfUpgradeApp = {

        forms: [],

        step: 'checking',

        container: '#nfUpgradeApp',

        tmpl: {
            test: wp.template( 'test' ),
            table: wp.template( 'table' ),
            legend: wp.template( 'legend' ),
        },

        formCheckPointer: 0,
        formConvertPointer: 0,

        updateTable: function(){

            var data = {
                title: '',
                headers: [ 'Title', 'Status' ],
                rows: this.forms,
                step: this.step,
                showSupportLink: 0,
            };

            if( 'checking' == this.step ) {

                data.title = 'Form Upgrade List';

                data.legend = this.tmpl.legend( {
                    no_issues_detected: 'No Issues Detected',
                    will_need_attention: 'Will Need Attention After Upgrade',
                }),

                data.next = 'Start Upgrade';

                data.readyToConvert = 1;
                _.each(this.forms, function (form) {
                    if ( ! form.checked ) data.readyToConvert = 0;
                }, this);
            }

            if( 'converting' == this.step ) {
                data.title = 'Converting Forms';

                var redirectToThree = 1;
                _.each(this.forms, function (form) {
                    if ( ! form.converted ) redirectToThree = 0;
                    if ( form.failed ) data.showSupportLink = 1;
                }, this);
                if( redirectToThree ) {
                    jQuery( window ).unbind( 'beforeunload' );
                    window.location.href = nfThreeUpgrade.redirectURL;
                }
            }

            jQuery( this.container ).html( this.tmpl.table( data ) );
        },

        checkForms: function() {
            var form = this.forms[ this.formCheckPointer ] || null;
            if( form ) this.checkForm( form );
            this.formCheckPointer++;
        },

        checkForm: function( form ) {

            var that = this;
            $.post( ajaxurl, { action: 'ninja_forms_upgrade_check', formID: form.id }, function( response ) {

                var icon = ( response.canUpgrade ) ? '' : 'flag';
                var flagged = ( response.canUpgrade ) ? 0 : 1;
                that.updateForm( form.id, 'title', response.title );
                that.updateForm( form.id, 'icon', icon );
                that.updateForm( form.id, 'checked', true );
                that.updateForm( form.id, 'flagged', flagged );
                that.updateTable();

                that.checkForms();
            }, 'json' );
        },

        updateForm: function( formID, property, value ) {
            _.each( this.forms, function( form ) {
                if( formID != form.id ) return;
                form[ property ] = value;
            });
        },

        start: function () {

            _.each( nfThreeUpgrade.forms, function( formID ) {
                this.forms.push({
                    id: formID,
                    title: '',
                    icon: 'update',
                    checked: false,
                    converted: false,
                    failed: false,
                });
            }, this );

            this.checkForms();
            this.updateTable();

            var that = this;
            jQuery( '#nfUpgradeApp' ).on( 'click','.js-nfUpgrade-startConversion', function() {
                that.startConversion( that );
            } );
        },

        startConversion: function( app ) {
            console.log( 'HERE' );
            console.log( app );
            app.step = 'converting';

            // Add a notice if the user tries to navigate away during conversion.
            jQuery( window ).bind( 'beforeunload', function(){
                return 'You have unsaved changes.';
            } );

            $.post( ajaxurl, { nf2to3: 1, action: 'ninja_forms_ajax_migrate_database' }, function( response ) {

                $.post( ajaxurl, { action: 'nfThreeUpgrade_GetSerializedFields' }, function( fieldsExport ) {
                    $.post(ajaxurl, { nf2to3: 1, fields: fieldsExport.serialized, action: 'ninja_forms_ajax_import_fields' }, function ( fieldsImport ) {
                        app.convertForms();
                    }, 'json' );
                }, 'json' );
            });
        },


        convertForms: function() {
            var form = this.forms[ this.formConvertPointer ] || null;
            if( form ) this.convertForm( form );
            this.formConvertPointer++;
        },

        convertForm: function( form ) {
            var app =  this;
            console.log( 'Converting...' );
            console.log( form );

            form.icon = 'update'
            app.updateTable();

            $.post(ajaxurl, {action: 'nfThreeUpgrade_GetSerializedForm', formID: form.id}, function ( formExport ) {
                $.post(ajaxurl, { nf2to3: 1, action: 'ninja_forms_ajax_import_form', formID: form.id, import: formExport.serialized, flagged: form.flagged }, function ( formImport ) {
                    form.converted = true;
                    form.icon = 'yes';
                    app.updateTable();
                }, 'json').fail( function() {
                    form.converted = false;
                    form.failed = true;
                    form.icon = 'no';
                    app.updateTable();
                }).always( function() {
                    app.convertForms();
                });

            }, 'json' );
        }

    };

    nfUpgradeApp.start();

});
