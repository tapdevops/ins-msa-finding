/*
 |--------------------------------------------------------------------------
 | Database Connections
 |--------------------------------------------------------------------------
 |
 | Here are each of the database connections setup for your application.
 | Of course, examples of configuring each database platform that is
 | supported by NodeJS is shown below to make development simple.
 |
 */
	module.exports = {
		auth:{
			dev: {
				url: 'mongodb://s_auth:s_auth@dbappdev.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_auth:4uth2019@dbappqa.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_auth:4uth2019@dbapp.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			}
		},
		finding: {
			dev: {
				url: 'mongodb://s_finding:s_finding@dbappdev.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_finding:f1n2019@dbappqa.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_finding:f1n2019@dbapp.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			}
		},
		report: {
			dev: {
				url: 'mongodb://s_report:s_report@dbappdev.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_report:r3p0rt2019@dbappqa.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_report:r3p0rt2019@dbapp.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			}
		}
	}
