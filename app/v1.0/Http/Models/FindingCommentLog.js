/*
 |--------------------------------------------------------------------------
 | Models - Rating Log
 |--------------------------------------------------------------------------
 */
	const mongoose = require( 'mongoose' );
	const FindingCommentLogSchema = mongoose.Schema( {
		FINDING_COMMENT_ID: String,
		PROSES: String,
		IMEI: String,
		SYNC_TIME: {
			type: Date,
			default: function() {
				return null;
			}
		}
	});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
	module.exports = mongoose.model( 'FindingCommentLog', FindingCommentLogSchema, 'TR_LOG_FINDING_COMMENT' );