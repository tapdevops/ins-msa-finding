/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const FindingModel = require( _directory_base + '/app/v1.0/Http/Models/Finding.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.0/Http/Models/SummaryWeekly.js' );
	const Helper = require( _directory_base + '/app/v1.0/Http/Libraries/HelperLib.js' );
	// const InspectionHModel = require( _directory_base +  )

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Total
	  * --------------------------------------------------------------------
	*/
 	exports.total = async ( req, res ) => {
		

 		var date = new Date();
 			date.setDate( date.getDate() - 7 );
		var max_finding_date = parseInt( MomentTimezone( date ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
		var finding_progress_complete = await FindingModel.aggregate( [
			{
				"$match": {
					"INSERT_USER": req.auth.USER_AUTH_CODE,
					"PROGRESS": 100
				}
			},
			{
				"$count": 'jumlah'
			}
		 ] );
		var finding_progress_incomplete = await FindingModel.aggregate( [
			{
				"$match": {
					"INSERT_USER": req.auth.USER_AUTH_CODE,
					"PROGRESS": {
						"$lt": 100
					}
				}
			},
			{
				"$count": 'jumlah'
			}
		 ] );
		 return res.status( 200 ).json( {
			status: true,
			message: "OK",
			data: {
				complete: ( finding_progress_complete.length > 0 ? finding_progress_complete[0].jumlah : 0 ),
				incomplete: ( finding_progress_incomplete.length > 0 ? finding_progress_incomplete[0].jumlah : 0 ),
				target: 0 // Masih hardcode
			}
		} );
 	};

 	/** 
 	  * Process Weekly
	  * --------------------------------------------------------------------
	*/
 	exports.process_weekly = async ( req, res ) => {
		var authCode = req.auth.USER_AUTH_CODE;
		var date_now = new Date();
			date_now = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
 		var date = new Date();
 			date.setDate( date.getDate() - 7 );
		var max_finding_date = parseInt( MomentTimezone( date ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
		var query = await FindingModel.aggregate( [
			{
				$match: {
					INSERT_TIME: {
						$gte: date_min_1_week,
						$lte: date_now,
					}
				}
			},
			{
				$group: {
					_id: {
						INSERT_USER: "$INSERT_USER"
					}
				}
			},
			{
				$project: {
					_id: 0,
					USER_AUTH_CODE: "$_id.INSERT_USER"
				}
			}
		] );
		if( query.length > 0 ){
			for( i in query ){
				authCode = query[i].USER_AUTH_CODE;
				var finding_progress_complete = await FindingModel.aggregate( [
					{
						"$match": {
							"INSERT_USER": authCode,
							"PROGRESS": 100
						}
					},
					{
						"$count": 'jumlah'
					}
				 ] );
				var finding_progress_incomplete = await FindingModel.aggregate( [
					{
						"$match": {
							"INSERT_USER": authCode,
							"PROGRESS": {
								"$lt": 100
							}
						}
					},
					{
						"$count": 'jumlah'
					}
				] );
				var set = new SummaryWeeklyModel( {
					"TOTAL_FINDING_COMPLETE": finding_progress_complete[0].jumlah,
					"TOTAL_FINDING_INCOMPLETE": finding_progress_incomplete[0].jumlah,
					"SUMMARY_DATE": parseInt( date_now.toString().substr( 0, 8 ) ),
					"IS_VIEW": 0,
					"INSERT_USER": authCode,
					"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
				} );
				set.save();
			}
		}
		return res.status( 200 ).json( {
			status: true,
			message: "OK",
			data: {
				complete: ( finding_progress_complete.length > 0 ? finding_progress_complete[0].jumlah : 0 ),
				incomplete: ( finding_progress_incomplete.length > 0 ? finding_progress_incomplete[0].jumlah : 0 ),
				target: 0 
			}
		} );
 	};