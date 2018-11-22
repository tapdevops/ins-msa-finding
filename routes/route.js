function verifyToken( req, res, next ) {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];

	if ( typeof bearerHeader !== 'undefined' ) {
		const bearer = bearerHeader.split( ' ' );
		const bearerToken = bearer[1];

		req.token = bearerToken;
		next();
	}
	else {
		// Forbidden
		res.sendStatus( 403 );
	}
}

module.exports = ( app ) => {
	// Declare Controllers
	const finding = require( '../app/controllers/finding.js' );

	// ROUTE - FINDING
	app.post( '/finding', verifyToken, finding.create );
	app.get( '/finding', finding.find );
	app.get( '/finding/:id', finding.findOne );
	app.put( '/finding/:id', verifyToken, finding.update );
	app.delete( '/finding/:id', verifyToken, finding.delete );
}