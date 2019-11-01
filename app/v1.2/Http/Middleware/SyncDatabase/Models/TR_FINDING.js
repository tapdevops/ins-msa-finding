/*
 |--------------------------------------------------------------------------
 | Models - Finding
 |--------------------------------------------------------------------------
 */
	const Mongoose = require( 'mongoose' );
	const DB = require( _directory_base + '/config/database.js' );
	const DatabaseConnection = Mongoose.createConnection( DB.report[config.app.env].url );
	const Schema = Mongoose.Schema( {
		FINDING_CODE: String,
		WERKS: String,
		AFD_CODE: String,
		BLOCK_CODE: String,
		FINDING_CATEGORY: String,
		FINDING_DESC: String,
		FINDING_PRIORITY: String,
		DUE_DATE: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		ASSIGN_TO: String,
		PROGRESS: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		LAT_FINDING: String,
		LONG_FINDING: String,
		REFFERENCE_INS_CODE: String,
		INSERT_USER: String,
		INSERT_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		UPDATE_USER: String,
		UPDATE_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		DELETE_USER: String,
		DELETE_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		RATING_VALUE: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		RATING_MESSAGE: String
	} );

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = DatabaseConnection.model( 'TR_FINDING', Schema, 'TR_FINDING' );