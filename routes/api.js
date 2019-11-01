/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
	// Node Modules
	const RoutesVersioning = require( 'express-routes-versioning' )();
	
	// Controllers
	const Controllers = {
		v_1_2: {
			Finding: require( _directory_base + '/app/v1.2/Http/Controllers/FindingController.js' ),
			Report: require( _directory_base + '/app/v1.2/Http/Controllers/ReportController.js' ),
			SyncMobile: require( _directory_base + '/app/v1.2/Http/Controllers/SyncMobileController.js' ),
			Summary: require( _directory_base + '/app/v1.2/Http/Controllers/SummaryController.js' )
		},
		v_1_1: {
			Finding: require( _directory_base + '/app/v1.1/Http/Controllers/FindingController.js' ),
			Report: require( _directory_base + '/app/v1.1/Http/Controllers/ReportController.js' ),
			SyncMobile: require( _directory_base + '/app/v1.1/Http/Controllers/SyncMobileController.js' ),
			Summary: require( _directory_base + '/app/v1.1/Http/Controllers/SummaryController.js' ),
			ExportKafka: require( _directory_base + '/app/v1.1/Http/Controllers/ExportKafkaController.js' )
		},
		v_1_0: {
			Finding: require( _directory_base + '/app/v1.0/Http/Controllers/FindingController.js' ),
			Report: require( _directory_base + '/app/v1.0/Http/Controllers/ReportController.js' ),
			SyncMobile: require( _directory_base + '/app/v1.0/Http/Controllers/SyncMobileController.js' ),
			Summary: require( _directory_base + '/app/v1.0/Http/Controllers/SummaryController.js' )
		}
	}

	// Middleware
	const Middleware = {
		v_1_2: {
			SyncDatabase_TR_FINDING: require( _directory_base + '/app/v1.2/Http/Middleware/SyncDatabase/TR_FINDING.js' ),
			SyncDatabase_TR_FINDING_COMMENT: require( _directory_base + '/app/v1.2/Http/Middleware/SyncDatabase/TR_FINDING_COMMENT.js' ),
			VerifyToken: require( _directory_base + '/app/v1.2/Http/Middleware/VerifyToken.js' )
		},
		v_1_1: {
			// SyncDatabase_TR_FINDING: require( _directory_base + '/app/v1.1/Http/Middleware/SyncDatabase/TR_FINDING.js' ),
			// SyncDatabase_TR_FINDING_COMMENT: require( _directory_base + '/app/v1.1/Http/Middleware/SyncDatabase/TR_FINDING_COMMENT.js' ),
			VerifyToken: require( _directory_base + '/app/v1.1/Http/Middleware/VerifyToken.js' )
		},
		v_1_0: {
			VerifyToken: require( _directory_base + '/app/v1.0/Http/Middleware/VerifyToken.js' )
		}
	}

/*
 |--------------------------------------------------------------------------
 | Routing
 |--------------------------------------------------------------------------
 */
	module.exports = ( app ) => {
		/*
		 |--------------------------------------------------------------------------
		 | Welcome Message
		 |--------------------------------------------------------------------------
		 */
			app.get( '/', ( req, res ) => {
				res.json( { 
					application: {
						name : config.app.name,
						env : config.app.env,
						port : config.app.port[config.app.env]
					} 
				} )
			} );
		/*
		 |--------------------------------------------------------------------------
		 | API Versi 1.2
		 |--------------------------------------------------------------------------
		 */
			// Finding
			app.get( '/api/v1.2/sync-mobile/comment', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.findComment );
			app.get( '/api/v1.2/finding/comment', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.findComment );
			app.get( '/api/v1.2/finding', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.find );
			app.get( '/api/v1.2/finding/all', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.findAll );
			app.get( '/api/v1.2/finding/q', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.findAll );
			app.get( '/api/v1.2/finding/:id', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.findOne );
			app.post( '/api/v1.2/finding', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.create_or_update );
			app.post( '/api/v1.2/finding/comment', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Finding.create_or_update_comment );

			// Summary
			app.post( '/api/v1.2/summary', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Summary.finding );
			app.get( '/api/v1.2/summary/generate', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Summary.process_weekly );
			// app.get( '/api/v1.2/summary/generate', Middleware.v_1_1.VerifyToken, Controllers.v_1_2.Summary.process_weekly );

			// Report
			app.get( '/api/v1.2/report/web/finding/all', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Report.find );
			app.get( '/api/v1.2/report/web/finding/q', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.Report.find );

			// Sync Mobile
			app.get( '/api/v1.2/sync-mobile/finding/:start_date/:end_date', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.SyncMobile.synchronize );
			app.get( '/api/v1.2/sync-mobile/finding-images/:start_date/:end_date', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.SyncMobile.synchronize_images );

		/*
		 |--------------------------------------------------------------------------
		 | API Versi 1.1
		 |--------------------------------------------------------------------------
		 */
			// Finding
			app.get( '/api/v1.1/sync-mobile/comment', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.findComment );
			app.get( '/api/v1.1/finding/comment', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.findComment );
			app.get( '/api/v1.1/finding', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.find );
			app.get( '/api/v1.1/finding/all', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.findAll );
			app.get( '/api/v1.1/finding/q', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.findAll );
			app.get( '/api/v1.1/finding/:id', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.findOne );
			app.post( '/api/v1.1/finding', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.create_or_update );
			app.post( '/api/v1.1/finding/comment', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Finding.create_or_update_comment );

			// Summary
			app.post( '/api/v1.1/summary', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Summary.finding );
			app.get( '/api/v1.1/summary/generate', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Summary.process_weekly );
			// app.get( '/api/v1.0/summary/generate', Middleware.v_1_1.VerifyToken, Controllers.v_1_0.Summary.process_weekly );

			// Report
			app.get( '/api/v1.1/report/web/finding/all', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Report.find );
			app.get( '/api/v1.1/report/web/finding/q', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.Report.find );
			
			// Sync Mobile
			app.get( '/api/v1.1/sync-mobile/finding/:start_date/:end_date', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.SyncMobile.synchronize );
			app.get( '/api/v1.1/sync-mobile/finding-images/:start_date/:end_date', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.SyncMobile.synchronize_images );

			//Export Kafka
			app.get( '/api/v1.1/export-kafka/finding', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafka.export_finding );
			

		/*
		 |--------------------------------------------------------------------------
		 | API Versi 1.0
		 |--------------------------------------------------------------------------
		 */
			// Finding
			app.get( '/api/v1.0/sync-mobile/comment', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.findComment );
			app.get( '/api/v1.0/finding/comment', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.findComment );
			app.get( '/api/v1.0/finding', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.find );
			app.get( '/api/v1.0/finding/all', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.findAll );
			app.get( '/api/v1.0/finding/q', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.findAll );
			app.get( '/api/v1.0/finding/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.findOne );
			app.post( '/api/v1.0/finding', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.create_or_update );
			app.post( '/api/v1.0/finding/comment', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Finding.create_or_update_comment );

			// Summary
			app.get( '/api/v1.0/summary/total', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Summary.total );

			// Report
			app.get( '/api/v1.0/report/web/finding/all', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Report.find );
			app.get( '/api/v1.0/report/web/finding/q', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.Report.find );

			// Sync Mobile
			app.get( '/api/v1.0/sync-mobile/finding/:start_date/:end_date', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.SyncMobile.synchronize );
			app.get( '/api/v1.0/sync-mobile/finding-images/:start_date/:end_date', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.SyncMobile.synchronize_images );

		/*
		 |--------------------------------------------------------------------------
		 | Old API
		 |--------------------------------------------------------------------------
		 */
			// Finding
			app.get( '/finding', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Finding.find
			} ) );

			app.get( '/finding/all', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Finding.findAll
			} ) );

			app.get( '/finding/q', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Finding.findAll
			} ) );
			
			app.get( '/finding/:id', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Finding.findOne
			} ) );

			app.post( '/finding', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Finding.create_or_update
			} ) );

			// Report
			app.get( '/finding-report/all', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Report.find
			} ) );

			app.get( '/finding-report/q', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.Report.find
			} ) );

			// Sync Mobile
			app.get( '/sync-mobile/finding/:start_date/:end_date', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.SyncMobile.synchronize
			} ) );

			app.get( '/sync-mobile/finding-images/:start_date/:end_date', Middleware.v_1_0.VerifyToken, RoutesVersioning( {
				"1.0.0": Controllers.v_1_0.SyncMobile.synchronize_images
			} ) );
			
	}