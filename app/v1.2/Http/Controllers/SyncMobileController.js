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

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.2/Http/Libraries/HelperLib.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Sync
	  * Untuk memberi data pada mobile berdasarkan range terakhir melakukan 
	  * synchronize ke server. Contohnya, User A terakhir melakukan sync 
	  * tanggal 26 Maret 2019, dan hari ini, tanggal 30 April 2019, dia kembali 
	  * melakukan sync, maka range data yang diambil adalah mulai dari tanggal 
	  * 26 Maret 2019 sampai dengan 30 April 2019.
	  * --------------------------------------------------------------------
	*/
	exports.synchronize = ( req, res ) => {
		var auth = req.auth;
		var start_date = req.params.start_date;
		var end_date = req.params.end_date;
		var location_code_group = String( auth.LOCATION_CODE ).split( ',' );
		var ref_role = auth.REFFERENCE_ROLE;
		var location_code_final = [];
		var query_search = [];
		var afd_code = '';

		if ( ref_role != 'ALL' ) {
			location_code_group.forEach( function( data ) {
				switch ( ref_role ) {
					case 'REGION_CODE':
						location_code_final.push( data.substr( 1, 1 ) );
					break;
					case 'COMP_CODE':
						location_code_final.push( data.substr( 0, 2 ) );
					break;
					case 'AFD_CODE':
						location_code_final.push( data );
					break;
					case 'BA_CODE':
						location_code_final.push( data.substr( 0, 4 ) );
					break;
				}
			} );
		}

		switch ( ref_role ) {
			case 'REGION_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 1 ) ) );
				} );
			break;
			case 'COMP_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 2 ) ) );
				} );
			break;
			case 'AFD_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 4 ) ) )
					afd_code = q.substr( 4, 10 );
				} );
			break;
			case 'BA_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( q );
				} );
			break;
			case 'NATIONAL':
			break;
		}

		// console.log(query_search);

		if ( ref_role == 'NATIONAL' ) {
			FindingModel.aggregate( [
				{ 
					"$project" : {
						"_id" : 0.0, 
						"__v" : 0.0
					}
				}, 
				{ 
					"$sort" : {
						"INSERT_TIME" : -1.0
					}
				}, 
				{ 
					"$match" : {
						DELETE_USER: "",
						$and: [
							{
								$or: [
									{
										INSERT_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									},
									{
										UPDATE_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									},
									{
										DELETE_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									}
								]
							}
						]
					}
				}
			] )
			.then( data_insert => {

				// console.log("A");

				if( !data_insert ) {
					return res.send( {
						status: false,
						message: config.app.error_message.find_404,
						data: {}
					} );
				}
				
				var temp_insert = [];
				var temp_update = [];
				var temp_delete = [];
				
				data_insert.forEach( function( data ) {
					if ( data.DELETE_TIME > 0 ) {
						if ( data.DELETE_TIME >= start_date && data.DELETE_TIME <= end_date ) {
							temp_delete.push( {
								FINDING_CODE: data.FINDING_CODE,
								WERKS: data.WERKS,
								AFD_CODE: data.AFD_CODE,
								BLOCK_CODE: data.BLOCK_CODE,
								FINDING_CATEGORY: data.FINDING_CATEGORY,
								FINDING_DESC: data.FINDING_DESC,
								FINDING_PRIORITY: data.FINDING_PRIORITY,
								//DUE_DATE: Number( data.DUE_DATE ) || 0,
								DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
								ASSIGN_TO: data.ASSIGN_TO,
								PROGRESS: data.PROGRESS,
								LAT_FINDING: data.LAT_FINDING,
								LONG_FINDING: data.LONG_FINDING,
								REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
								INSERT_USER: data.INSERT_USER,
								INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								UPDATE_USER: data.UPDATE_USER || '',
								UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS_SYNC: "N",
								RATING_VALUE: data.RATING_VALUE,
								RATING_MESSAGE: data.RATING_MESSAGE,
								END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
							} );
						}
					}

					if ( data.INSERT_TIME >= start_date && data.INSERT_TIME <= end_date ) {
						//console.log(result.PROGRESS );
						temp_insert.push( {
							FINDING_CODE: data.FINDING_CODE,
							WERKS: data.WERKS,
							AFD_CODE: data.AFD_CODE,
							BLOCK_CODE: data.BLOCK_CODE,
							FINDING_CATEGORY: data.FINDING_CATEGORY,
							FINDING_DESC: data.FINDING_DESC,
							FINDING_PRIORITY: data.FINDING_PRIORITY,
							//DUE_DATE: Number( data.DUE_DATE ) || 0,
							DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
							STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
							ASSIGN_TO: data.ASSIGN_TO,
							PROGRESS: data.PROGRESS,
							LAT_FINDING: data.LAT_FINDING,
							LONG_FINDING: data.LONG_FINDING,
							REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
							// RATING: rating_column,
							INSERT_USER: data.INSERT_USER,
							INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
							UPDATE_USER: data.UPDATE_USER || '',
							UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
							STATUS_SYNC: "N",
							RATING_VALUE: data.RATING_VALUE,
							RATING_MESSAGE: data.RATING_MESSAGE,
							END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
						} );
					}
					if ( data.UPDATE_TIME > 0 ) {
						if ( data.UPDATE_TIME >= start_date && data.UPDATE_TIME <= end_date ) {
							temp_update.push( {
								FINDING_CODE: data.FINDING_CODE,
								WERKS: data.WERKS,
								AFD_CODE: data.AFD_CODE,
								BLOCK_CODE: data.BLOCK_CODE,
								FINDING_CATEGORY: data.FINDING_CATEGORY,
								FINDING_DESC: data.FINDING_DESC,
								FINDING_PRIORITY: data.FINDING_PRIORITY,
								//DUE_DATE: Number( data.DUE_DATE ) || 0,
								DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
								ASSIGN_TO: data.ASSIGN_TO,
								PROGRESS: data.PROGRESS,
								LAT_FINDING: data.LAT_FINDING, 
								LONG_FINDING: data.LONG_FINDING,
								REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
								// RATING: rating_column,
								INSERT_USER: data.INSERT_USER,
								INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								UPDATE_USER: data.UPDATE_USER || '',
								UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS_SYNC: "Y",
								RATING_VALUE: data.RATING_VALUE,
								RATING_MESSAGE: data.RATING_MESSAGE,
								END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
							} );
						}
					}

				} );

				res.json( {
					status: true,
					message: 'Data Sync tanggal ' + HelperLib.date_format( start_date, 'YYYY-MM-DD hh-mm-ss' ) + ' s/d ' + HelperLib.date_format( end_date, 'YYYY-MM-DD hh-mm-ss' ),
					data: {
						"hapus": temp_delete,
						"simpan": temp_insert,
						"ubah": temp_update,
					}
				} );
			} ).catch( err => {
				res.send( {
					status: false,
					message: config.app.error_message.find_500,
					data: {}
				} );
			} );
		}
		else {
			console.log(req.auth);
			FindingModel.aggregate([
				{ 
					"$project" : {
						"_id" : 0.0, 
						"__v" : 0.0
					}
				}, 
				{ 
					"$sort" : {
						"INSERT_TIME" : -1.0
					}
				}, 
				{ 
					"$match" : {
						DELETE_USER: "",
						WERKS: {
							"$in": query_search
						},
						$and: [
							{
								$or: [
									{
										INSERT_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									},
									{
										UPDATE_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									},
									{
										DELETE_TIME: {
											$gte: parseInt( start_date ),
											$lte: parseInt( end_date )
										}
									}
								]
							}
						]
					}
				}
			])
			.then( data_insert => {
				if( !data_insert ) {
					return res.send( {
						status: false,
						message: config.app.error_message.find_404,
						data: {}
					} );
				}

				//console.log( data_insert );

				var temp_insert = [];
				var temp_update = [];
				var temp_delete = [];

				
				data_insert.forEach( function( data ) {

					if ( data.DELETE_TIME > 0 ) {
						if ( data.DELETE_TIME >= start_date && data.DELETE_TIME <= end_date ) {
							temp_delete.push( {
								FINDING_CODE: data.FINDING_CODE,
								WERKS: data.WERKS,
								AFD_CODE: data.AFD_CODE,
								BLOCK_CODE: data.BLOCK_CODE,
								FINDING_CATEGORY: data.FINDING_CATEGORY,
								FINDING_DESC: data.FINDING_DESC,
								FINDING_PRIORITY: data.FINDING_PRIORITY,
								//DUE_DATE: Number( data.DUE_DATE ) || 0,
								DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
								ASSIGN_TO: data.ASSIGN_TO,
								PROGRESS: data.PROGRESS,
								LAT_FINDING: data.LAT_FINDING,
								LONG_FINDING: data.LONG_FINDING,
								REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
								// RATING: rating_column,
								INSERT_USER: data.INSERT_USER,
								INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								UPDATE_USER: data.UPDATE_USER || '',
								UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS_SYNC: "N",
								RATING_VALUE: data.RATING_VALUE,
								RATING_MESSAGE: data.RATING_MESSAGE,
								END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
							} );
						}
					}

					if ( data.INSERT_TIME >= start_date && data.INSERT_TIME <= end_date ) {
						//console.log(result.PROGRESS );
						temp_insert.push( {
							FINDING_CODE: data.FINDING_CODE,
							WERKS: data.WERKS,
							AFD_CODE: data.AFD_CODE,
							BLOCK_CODE: data.BLOCK_CODE,
							FINDING_CATEGORY: data.FINDING_CATEGORY,
							FINDING_DESC: data.FINDING_DESC,
							FINDING_PRIORITY: data.FINDING_PRIORITY,
							//DUE_DATE: Number( data.DUE_DATE ) || 0,
							DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
							STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
							ASSIGN_TO: data.ASSIGN_TO,
							PROGRESS: data.PROGRESS,
							LAT_FINDING: data.LAT_FINDING,
							LONG_FINDING: data.LONG_FINDING,
							REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
							// RATING: rating_column,
							INSERT_USER: data.INSERT_USER,
							INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
							UPDATE_USER: data.UPDATE_USER || '',
							UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
							STATUS_SYNC: "N",
							RATING_VALUE: data.RATING_VALUE,
							RATING_MESSAGE: data.RATING_MESSAGE,
							END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
						} );
					}
					if ( data.UPDATE_TIME > 0 ) {
						if ( data.UPDATE_TIME >= start_date && data.UPDATE_TIME <= end_date ) {
							temp_update.push( {
								FINDING_CODE: data.FINDING_CODE,
								WERKS: data.WERKS,
								AFD_CODE: data.AFD_CODE,
								BLOCK_CODE: data.BLOCK_CODE,
								FINDING_CATEGORY: data.FINDING_CATEGORY,
								FINDING_DESC: data.FINDING_DESC,
								FINDING_PRIORITY: data.FINDING_PRIORITY,
								//DUE_DATE: Number( data.DUE_DATE ) || 0,
								DUE_DATE: HelperLib.date_format( String( data.DUE_DATE ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS: HelperLib.status_finding( String( data.PROGRESS ) ),
								ASSIGN_TO: data.ASSIGN_TO,
								PROGRESS: data.PROGRESS,
								LAT_FINDING: data.LAT_FINDING, 
								LONG_FINDING: data.LONG_FINDING,
								REFFERENCE_INS_CODE: data.REFFERENCE_INS_CODE,
								// RATING: rating_column,
								INSERT_USER: data.INSERT_USER,
								INSERT_TIME: HelperLib.date_format( String( data.INSERT_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								UPDATE_USER: data.UPDATE_USER || '',
								UPDATE_TIME: HelperLib.date_format( String( data.UPDATE_TIME ), 'YYYY-MM-DD hh-mm-ss' ),
								STATUS_SYNC: "Y",
								RATING_VALUE: data.RATING_VALUE,
								RATING_MESSAGE: data.RATING_MESSAGE,
								END_TIME: HelperLib.date_format( String( data.END_TIME ), 'YYYY-MM-DD hh-mm-ss' )
							} );
						}
					}
				} );

				res.json( {
					status: true,
					message: 'Data Sync tanggal ' + HelperLib.date_format( start_date, 'YYYY-MM-DD hh-mm-ss' ) + ' s/d ' + HelperLib.date_format( end_date, 'YYYY-MM-DD hh-mm-ss' ),
					data: {
						"hapus": temp_delete,
						"simpan": temp_insert,
						"ubah": temp_update,
					}
				} );
			} ).catch( err => {
				console.log(err);
				res.send( {
					status: false,
					message: config.app.error_message.find_500,
					data: {}
				} );
			} );
		}
	};

	/** 
 	  * Sync
	  * Untuk mencari data Finding Code berdasar range data tertentu, untuk
	  * kemudian digunakan pada Microservice Images.
	  * --------------------------------------------------------------------
	*/
	exports.synchronize_images = async ( req, res ) => {

		var auth = req.auth;
		var start_date = req.params.start_date;
		var end_date = req.params.end_date;
		var location_code_group = String( auth.LOCATION_CODE ).split( ',' );
		var ref_role = auth.REFFERENCE_ROLE;
		var location_code_final = [];
		var query_search = [];
		var afd_code = '';

		if ( ref_role != 'ALL' ) {
			location_code_group.forEach( function( data ) {
				switch ( ref_role ) {
					case 'REGION_CODE':
						location_code_final.push( data.substr( 1, 1 ) );
					break;
					case 'COMP_CODE':
						location_code_final.push( data.substr( 0, 2 ) );
					break;
					case 'AFD_CODE':
						location_code_final.push( data );
					break;
					case 'BA_CODE':
						location_code_final.push( data.substr( 0, 4 ) );
					break;
				}
			} );
		}

		switch ( ref_role ) {
			case 'REGION_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 1 ) ) );
				} );
			break;
			case 'COMP_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 2 ) ) );
				} );
			break;
			case 'AFD_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( new RegExp( '^' + q.substr( 0, 4 ) ) )
					afd_code = q.substr( 4, 10 );
				} );
			break;
			case 'BA_CODE':
				location_code_final.forEach( function( q ) {
					query_search.push( q );
				} );
			break;
		}

		if ( ref_role == 'NATIONAL' ) {
			var query = await FindingModel
				.find( {
					DELETE_USER: "",
					$and: [
						{
							INSERT_TIME: {
								$gte: parseInt( start_date ),
								$lte: parseInt( end_date )
							}
						},
						{
							UPDATE_TIME: {
								$gte: parseInt( start_date ),
								$lte: parseInt( end_date )
							}
						}
					]
				} )
				.select( {
					_id: 0,
					FINDING_CODE: 1,
					INSERT_TIME: 1
				} )
				.sort( {
					INSERT_TIME:-1
				} );
		}
		else {
			var query = await FindingModel
				.find( {
					DELETE_USER: "",
					WERKS: query_search,
					$and: [
						{
							$or: [
								{
									INSERT_TIME: {
										$gte: parseInt( start_date ),
										$lte: parseInt( end_date )
									}
								},
								{
									UPDATE_TIME: {
										$gte: parseInt( start_date ),
										$lte: parseInt( end_date )
									}
								}
							]
						}
					]
				} )
				.select( {
					_id: 0,
					FINDING_CODE: 1,
					INSERT_TIME: 1
				} )
				.sort( {
					INSERT_TIME:-1
				} );
		}

		if ( query.length > 0 ) {
			var results = [];
			query.forEach( function( result ) {
				results.push( String( result.FINDING_CODE ) );
			} );

			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}
		else {
			if ( ref_role == 'NATIONAL' ) {
				var query = await FindingModel
					.find( {
						DELETE_USER: ""
					} )
					.select( {
						_id: 0,
						FINDING_CODE: 1,
						INSERT_TIME: 1
					} )
					.sort( {
						INSERT_TIME:-1
					} );
			}
			else {
				var query = await FindingModel
					.find( {
						DELETE_USER: "",
						WERKS: query_search
					} )
					.select( {
						_id: 0,
						FINDING_CODE: 1,
						INSERT_TIME: 1
					} )
					.sort( {
						INSERT_TIME:-1
					} );
			}

			if ( query.length > 0 ) {
				var results = [];
				query.forEach( function( result ) {
					results.push( String( result.FINDING_CODE ) );
				} );
				res.send( {
					status: true,
					message: config.app.error_message.find_200,
					data: results
				} );
			}
			else {
				res.send( {
					status: false,
					message: config.app.error_message.find_404,
					data: {}
				} );
			}
			
		}
	};