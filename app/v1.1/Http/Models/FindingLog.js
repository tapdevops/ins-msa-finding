/*
 |--------------------------------------------------------------------------
 | Models - Finding Log
 |--------------------------------------------------------------------------
 */
	const mongoose = require( 'mongoose' );
	const FindingLogSchema = mongoose.Schema( {
		FINDING_CODE: String,
		PROSES: String,
		PROGRESS: String,
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
	module.exports = mongoose.model( 'FindingLog_v_1_1', FindingLogSchema, 'TR_LOG_FINDING' );