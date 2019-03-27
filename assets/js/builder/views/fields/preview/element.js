define( [], function() {
	var view = Marionette.ItemView.extend({
		tagName: 'div',
		template: '#tmpl-nf-field-input',

		initialize: function() {

			var type = this.model.get('type');

			if('phone' == type) type = 'tel';
			if('spam' == type) type = 'input';
			if('confirm' == type) type = 'input';
			if('quantity' == type) type = 'number';
			if('liststate' == type) type = 'listselect';
			if('listcountry' == type) type = 'listselect';
			if('listmultiselect' == type) type = 'listselect';

			this.template = '#tmpl-nf-field-' + type;
		},

		onRender: function() {
			// ...
		},
        
		templateHelpers: function () {
	    	return {
	    		renderClasses: function() {
	    			// ...
                },
                renderPlaceholder: function() {
                    if('undefined' == typeof this.placeholder) return;
					return 'placeholder="' + jQuery.trim( this.placeholder ) + '"';
                },
                maybeDisabled: function() {
                    if('undefined' == typeof this.disable_input) return;
                    if(!this.disable_input) return;
                    return 'disabled="disabled"';
                },
                maybeRequired: function() {
					// ...
				},
				maybeInputLimit: function() {
					// ...
				},
				maybeDisableAutocomplete: function() {
					// ..
				},
				maybeChecked: function() {
					// ...
				},
				renderOptions: function() {
					console.log(this.type);
					console.log(this.options);

					switch(this.type) {
						case 'liststate':
						case 'listselect':
						case 'listmultiselect':
							var options = this.options.models.filter(function(option){
								return option.get('selected');
							});
							if(0 == options.length) options = this.options.models;
							return '<option>' + options[0].get('label') + '</option>';
						case 'listcheckbox':
							return this.options.models.reduce(function(html, option) {
								return html += '<input type="checkbox"><label>' + option.get('label')  + '</label>';
							}, '');
						case 'listradio':
							return this.options.models.reduce(function(html, option) {
								return html += '<input type="radio"><label>' + option.get('label')  + '</label>';
							}, '');
						case 'listcountry':
							return '<option>' + this.default + '</option>';
						default:
							return '';
					}
				},
				renderOtherAttributes: function() {
					// ...
				},
				renderProduct: function() {
					// ...
				},
				renderNumberDefault: function() {
					// ...
				},
				renderCurrencyFormatting: function() {
					// ...
				},
				renderRatings: function() {
					// ...
				}
            }
        }

	});

	return view;
} );