/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const FindingModel = require( _directory_base + '/app/v1.2/Http/Models/Finding.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.2/Http/Models/SummaryWeekly.js' );

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.2/Http/Libraries/HelperLib.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Total
	  * --------------------------------------------------------------------
	*/
 	exports.finding = async ( req, res ) => {
 		var finding_query = await SummaryWeeklyModel.aggregate( [
 			{
 				"$match": {
 					"INSERT_USER": req.auth.USER_AUTH_CODE
 				}
 			},
 			{
				$sort: {
					SUMMARY_DATE: -1
				}
			},
			{
				$limit: 1
			}
 		] );
		if( req.body.IS_VIEW == 1 ){
			SummaryWeeklyModel.findOneAndUpdate( {
				INSERT_USER: req.auth.USER_AUTH_CODE,
				IS_VIEW : 0	
			},
			{
				IS_VIEW: 1
			},
			{
				new: true
			} ).then( data => {
				console.log( data );
			} )
		}

		if ( finding_query.length == 0 ) {
			var now = HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' );
			var set = new SummaryWeeklyModel( {
				"TOTAL_COMPLETE": 0,
				"TOTAL_INCOMPLETE": 0,
				"SUMMARY_DATE": parseInt( now.toString().substr( 0, 8 ) ),
				"IS_VIEW": 0, 
				"INSERT_USER": req.auth.USER_AUTH_CODE, // Hardcode
				"INSERT_TIME": now
			} );
			set.save();
		}

 		return res.status( 200 ).json( {
 			status: ( finding_query.length > 0 ? ( finding_query[0].IS_VIEW == 1 ? false : true ) : false ),
 			message: "OK",
 			data: {
 				complete: ( finding_query.length > 0 ? finding_query[0].TOTAL_COMPLETE : 0 ) ,
 				incomplete: ( finding_query.length > 0 ? finding_query[0].TOTAL_INCOMPLETE + finding_query[0].TOTAL_COMPLETE : 0 ) ,
 				target: 0
 			}
 		} );
 	}

 	/** 
 	  * Process Weekly
	  * --------------------------------------------------------------------
	*/
 	exports.process_weekly = async ( req, res ) => {
 		var authCode = req.auth.USER_AUTH_CODE;
		var date_now = new Date();
			date_now = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
		var date_min_1_week = new Date();
			date_min_1_week.setDate( date_min_1_week.getDate() - 7 );
			date_min_1_week = parseInt( MomentTimezone( date_min_1_week ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '000000' );
		var max_date = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );


 		var query = await FindingModel.aggregate( [
			{
				$match: {
					END_TIME: {
						$gte: date_min_1_week,
						$lte: date_now,
					}
				}
			},
			{
				$group: {
					_id: {
						ASSIGN_TO: "$ASSIGN_TO"
					}
				}
			},
			{
				$project: {
					_id: 0,
					USER_AUTH_CODE: "$_id.ASSIGN_TO"
				}
			}
		] ); 
		if( query.length > 0 ) {
			query.forEach( async function( q ) {
				var finding_progress_complete = await FindingModel.aggregate( [
		 			{
		 				"$match": {
		 					"END_TIME": {
		 						"$gte": date_min_1_week,
		 						"$lte": date_now
		 					},
		 					"ASSIGN_TO": q.USER_AUTH_CODE,
		 					"PROGRESS": 100
		 				}
		 			},
		 			{
		 				"$count": "jumlah"
		 			}
				 ] );
				 
		 		var finding_progress_incomplete = await FindingModel.aggregate( [
		 			{
		 				"$match": {
		 					"ASSIGN_TO": q.USER_AUTH_CODE,
		 					"PROGRESS": {
		 						"$lte": 100
		 					}
		 				}
		 			},
		 			{
		 				"$count": "jumlah"
		 			}
		 		] );
				SummaryWeeklyModel.findOne( {
					INSERT_USER: q.USER_AUTH_CODE,
					SUMMARY_DATE: parseInt( date_now.toString().substr( 0, 8 ) )
				} ).then( dt => {
					let complete = finding_progress_complete;
					let incomplete = finding_progress_incomplete;
					console.log( complete[0].jumlah );
					console.log( complete[0].jumlah + incomplete[0].jumlah );
					if ( !dt ) {
						var set = new SummaryWeeklyModel( {
							"TOTAL_COMPLETE": ( complete.length > 0 ? complete[0].jumlah : 0 ),
							"TOTAL_INCOMPLETE": ( incomplete.length > 0 ? incomplete[0].jumlah : 0 ),
							"SUMMARY_DATE": parseInt( date_now.toString().substr( 0, 8 ) ),
							"IS_VIEW": 0,
							"INSERT_USER": q.USER_AUTH_CODE,
							"INSERT_TIME": HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' )
						} );
						set.save()
					}
				} );
			} );
		}

 		return res.status( 200 ).json( {
 			status: true,
 			message: "OK",
 			data: {
 			}
 		} );
 	}