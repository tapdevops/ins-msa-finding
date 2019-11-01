/*
 |--------------------------------------------------------------------------
 | Models - Rating
 |--------------------------------------------------------------------------
 */
	const mongoose = require( 'mongoose' );
	const FindingCommentSchema = mongoose.Schema( {
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
	module.exports = mongoose.model( 'FindingComment', FindingCommentSchema, 'TR_FINDING_COMMENT' );
