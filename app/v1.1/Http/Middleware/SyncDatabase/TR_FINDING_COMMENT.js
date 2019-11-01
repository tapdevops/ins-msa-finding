/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
	const Model = require( _directory_base + '/app/v1.1/Http/Middleware/SyncDatabase/Models/TR_FINDING.js' );
/*
|--------------------------------------------------------------------------
| Verify Token Middleware
|--------------------------------------------------------------------------
|
| When they present the JWT, you want to check the token to ensure that 
| it's valid. This library does the following checks when you call the verify 
| method: It was created by you (by verifying the signature, using the secret 
| signing key)
|
*/
	module.exports = function( req, res, next ) {

		if ( req.headers.action == 'insert' ) {
			// Simpan data baru
			new Model( req.headers.data ).save().then( data => {
				if ( data ) {
					console.log( "Middleware Sync Database Success (Insert)." );
				}
				else {
					console.log( "Middleware Sync Database Failed (Insert)." );
				}
			} );
		}
		else {
			console.log( req.headers.data );
			Model.findOneAndUpdate( { 
				FINDING_CODE : req.headers.id
			}, req.headers.data, { new: true } ).then( data => {
				if ( data ) {
					console.log( "Middleware Sync Database Success (Update)." );
				}
				else {
					console.log( "Middleware Sync Database Failed (Update)." );
				}
			} );
		}
	}