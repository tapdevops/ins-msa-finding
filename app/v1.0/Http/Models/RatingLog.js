/*
 |--------------------------------------------------------------------------
 | Models - Rating Log
 |--------------------------------------------------------------------------
 */
	const mongoose = require( 'mongoose' );
	const RatingLogSchema = mongoose.Schema( {
		FINDING_CODE: String,
		PROSES: String,
		IMEI: String,
		SYNC_TIME: {
			type: Date,
			default: function() {
				return null;
			}
		},
		SYNC_USER: String
	});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = mongoose.model( 'RatingLog', RatingLogSchema, 'TR_LOG_RATING' );