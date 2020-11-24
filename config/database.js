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
				url: 'mongodb://s_auth:s_auth@dbmongodev.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_auth:4uth2019@dbmongoqa.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_auth:4uth2019@dbmongo.tap-agri.com:4848/s_auth?authSource=s_auth',
				ssl: false
			}
		},
		finding: {
			dev: {
				url: 'mongodb://s_finding:s_finding@dbmongodev.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_finding:f1n2019@dbmongoqa.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_finding:f1n2019@dbmongo.tap-agri.com:4848/s_finding?authSource=s_finding',
				ssl: false
			}
		},
		hectareStatement: {
            dev: {
                url: 'mongodb://s_hectare_statement:s_hectare_statement@dbmongodev.tap-agri.com:4848/s_hectare_statement?authSource=s_hectare_statement',
                ssl: false
            },
            qa: {
                url: 'mongodb://s_hectare_statement:h52019@dbmongoqa.tap-agri.com:4848/s_hectare_statement?authSource=s_hectare_statement',
                ssl: false
            },
            prod: {
                url: 'mongodb://s_hectare_statement:h52019@dbmongo.tap-agri.com:4848/s_hectare_statement?authSource=s_hectare_statement',
                ssl: false
            }
        },
		inspection: {
			dev: {
				url: 'mongodb://s_inspeksi:s_inspeksi@dbmongodev.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_inspeksi:1nsp3k5i2019@dbmongoqa.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_inspeksi:1nsp3k5i2019@dbmongo.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
				ssl: false
			}
		},
		ebccVal: {
			dev: {
				url: 'mongodb://s_ebcc_validation:s_ebcc_validation@dbmongodev.tap-agri.com:4848/s_ebcc_validation?authSource=s_ebcc_validation',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_ebcc_validation:38ccvalid2019@dbmongoqa.tap-agri.com:4848/s_ebcc_validation?authSource=s_ebcc_validation',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_ebcc_validation:38ccvalid2019@dbmongo.tap-agri.com:4848/s_ebcc_validation?authSource=s_ebcc_validation',
				ssl: false
			}
		},
		report: {
			dev: {
				url: 'mongodb://s_report:s_report@dbmongodev.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			},
			qa: {
				url: 'mongodb://s_report:r3p0rt2019@dbmongoqa.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			},
			prod: {
				url: 'mongodb://s_report:r3p0rt2019@dbmongo.tap-agri.com:4848/s_report?authSource=s_report',
				ssl: false
			}
		}
	}
