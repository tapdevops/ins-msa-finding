/*
 |--------------------------------------------------------------------------
 | Models - View User Auth
 |--------------------------------------------------------------------------
 */
	const Mongoose = require( 'mongoose' );
	const db = require( '../../../../config/database.js' );
	const connAuth = Mongoose.createConnection(db.auth[config.app.env].url);
	const ViewUserAuthSchema = Mongoose.Schema( {});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = connAuth.model( 'ViewUserAuth_v_1_2', ViewUserAuthSchema, 'VIEW_USER_AUTH' );