/*
 |--------------------------------------------------------------------------
 | Models - Rating
 |--------------------------------------------------------------------------
 */
	const Mongoose = require( 'mongoose' );
	const DB = require( _directory_base + '/config/database.js' );
	const DatabaseConnection = Mongoose.createConnection( DB.report[config.app.env].url );
	const Schema = Mongoose.Schema( {
		FINDING_COMMENT_ID: String,
		FINDING_CODE: String,
		USER_AUTH_CODE: String,
		MESSAGE: {
			type: String,
			default: function() {
				return "";
			}
		},
		INSERT_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		}
	});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = DatabaseConnection.model( 'TR_FINDING_COMMENT', Schema, 'TR_FINDING_COMMENT' );
