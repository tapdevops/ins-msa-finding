/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const FindingModel = require( _directory_base + '/app/v1.1/Http/Models/Finding.js' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.1/Http/Libraries/HelperLib.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.1
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Find
	  * Untuk memberi data report pada web berdasarkan range terakhir melakukan 
	  * synchronize ke server. Contohnya, User A terakhir melakukan sync tanggal 
	  * 26 Maret 2019, dan hari ini, tanggal 30 April 2019, dia kembali melakukan 
	  * sync, maka range data yang diambil adalah mulai dari tanggal 26 Maret 2019 
	  * sampai dengan 30 April 2019. Juga bisa digabungkan dengan BA_CODE, AFD_CODE, 
	  * dan lain-lain. Contoh penggunaan URLnya adalah : 
	  * http://APP_URL/?WERKS=4421&START_DATE=20190124000000&END_DATE=20190725000000
	  * --------------------------------------------------------------------
	*/
 	exports.find = async ( req, res ) => {

		var url_query = req.query;
		var url_query_length = Object.keys( url_query ).length;
		var query = {};
			query.DELETE_USER = "";
		var results = null;

		// Find By Region Code
		if ( req.query.REGION_CODE && !req.query.COMP_CODE ) {
			results = await FindingModel.find( {
				WERKS: new RegExp( '^' + req.query.REGION_CODE.substr( 1, 2 ) ),
				INSERT_TIME: {
					$gte: Number( req.query.START_DATE ),
					$lte: Number( req.query.END_DATE )
				}
			} );
		}

		// Find By Comp Code
		if ( req.query.COMP_CODE && !req.query.WERKS ) {
			
			results = await FindingModel.find( {
				WERKS: new RegExp( '^' + req.query.COMP_CODE.substr( 0, 2 ) ),
				INSERT_TIME: {
					$gte: Number( req.query.START_DATE ),
					$lte: Number( req.query.END_DATE )
				}
			} );
		}

		// Find By BA Code / WERKS
		if ( req.query.WERKS && !req.query.AFD_CODE ) {
			results = await FindingModel.find( {
				WERKS: new RegExp( '^' + req.query.WERKS.substr( 0, 4 ) ),
				INSERT_TIME: {
					$gte: Number( req.query.START_DATE ),
					$lte: Number( req.query.END_DATE )
				}
			} );
		}
		// Find By AFD Code
		if ( req.query.AFD_CODE && req.query.WERKS && !req.query.BLOCK_CODE ) {
			results = await FindingModel.find( {
				WERKS: req.query.WERKS,
				AFD_CODE: req.query.AFD_CODE,
				INSERT_TIME: {
					$gte: Number( req.query.START_DATE ),
					$lte: Number( req.query.END_DATE )
				}
			} );
		}

		// Find By Block Code
		if ( req.query.BLOCK_CODE && req.query.AFD_CODE && req.query.WERKS ) {
			console.log( 'Find By Block Code' );
			results = await FindingModel.find( {
				WERKS: req.query.WERKS,
				AFD_CODE: req.query.AFD_CODE,
				BLOCK_CODE: req.query.BLOCK_CODE,
				INSERT_TIME: {
					$gte: Number( req.query.START_DATE ),
					$lte: Number( req.query.END_DATE )
				}
			} );
		}

		if ( results ) {
			var set_data = [];
			results.forEach( function( result ) {
				set_data.push( {
					FINDING_CODE: result.FINDING_CODE,
					WERKS: result.WERKS,
					AFD_CODE: result.AFD_CODE,
					BLOCK_CODE: result.BLOCK_CODE,
					FINDING_CATEGORY: result.FINDING_CATEGORY,
					FINDING_DESC: result.FINDING_DESC,
					FINDING_PRIORITY: result.FINDING_PRIORITY,
					DUE_DATE: HelperLib.date_format( String( result.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
					STATUS: HelperLib.status_finding( result.PROGRESS ),
					ASSIGN_TO: result.ASSIGN_TO,
					PROGRESS: result.PROGRESS,
					LAT_FINDING: result.LAT_FINDING,
					LONG_FINDING: result.LONG_FINDING,
					REFFERENCE_INS_CODE: result.REFFERENCE_INS_CODE,
					INSERT_USER: result.INSERT_USER,
					INSERT_TIME: HelperLib.date_format( String( result.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
					UPDATE_USER: result.UPDATE_USER,
					UPDATE_TIME: HelperLib.date_format( String( result.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
					END_TIME: HelperLib.date_format( String ( result.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
				} );
			} );
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: set_data
			} );
		}
		else {
			return res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: {}
			} );
		}
	};