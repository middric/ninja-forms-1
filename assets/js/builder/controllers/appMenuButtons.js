define( [], function() {
	var controller = Marionette.Object.extend( {
		initialize: function() {
			this.listenTo( nfRadio.channel( 'app' ), 'click:publish', this.publish );
			this.listenTo( nfRadio.channel( 'app' ), 'click:viewChanges', this.viewChanges );
		},

		publish: function() {
			console.log( 'publish changes' );
			nfRadio.channel( 'app' ).request( 'update:appSetting', 'clean', true );
		},

		viewChanges: function() {
			nfRadio.channel( 'app' ).request( 'open:drawer', 'viewChanges', { collection: nfUndoManager.stack } );
		}

	});

	return controller;
} );