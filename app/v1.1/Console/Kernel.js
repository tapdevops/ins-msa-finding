/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
    
    // Models
	const FindingModel = require( _directory_base + '/app/v1.1/Http/Models/Finding.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.1/Http/Models/SummaryWeekly.js' );

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.1/Http/Libraries/HelperLib.js' );

/*
|--------------------------------------------------------------------------
| Kernel
|--------------------------------------------------------------------------
|
| In the past, you may have generated a Cron entry for each task you needed
| to schedule on your server. However, this can quickly become a pain,
| because your task schedule is no longer in source control and you must
| SSH into your server to add additional Cron entries.
|
*/
    class Kernel {

        /*
        |--------------------------------------------------------------------------
        | Update Transaksi Complete
        |--------------------------------------------------------------------------
        |
        | Untuk mengupdate transaksi-transaksi yang sudah complete. Cron jalan setiap
        | jam 5 pagi.
        |
        */
        async job_update_transaksi_complete() {
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
                            .then( data => {
                                console.log( 'Sukses simpan' );
                            } )
                            .catch( err => {
                                console.log( err.message );
                            } );
                        }
                    } ).catch( err => {
                        console.log( `ERROR: ${err.message}` );
                    } );
                } );
            }
            else {
                console.log( `data di TR_FINDING untuk minggu ini kosong!` );
            }
        }
    }


    module.exports = new Kernel();
