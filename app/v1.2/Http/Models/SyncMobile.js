/*
 |--------------------------------------------------------------------------
 | Models - Sync Mobile
 |--------------------------------------------------------------------------
 */
	const Mongoose = require( 'mongoose' );
	const db = require( '../../../../config/database.js' );
	const connAuth = Mongoose.createConnection( db.auth[config.app.env].url );
	const SyncMobileSchema = Mongoose.Schema({});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = connAuth.model( 'SyncMobile_v_1_2', SyncMobileSchema, 'T_MOBILE_SYNC' );