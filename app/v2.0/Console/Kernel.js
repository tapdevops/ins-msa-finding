/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
    
    // Models
	const FindingModel = require( _directory_base + '/app/v2.0/Http/Models/Finding.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v2.0/Http/Models/SummaryWeekly.js' );
    const Notification = require( _directory_base + '/app/v2.1/Http/Models/Notification.js' );
    const Estate = require( _directory_base + '/app/v2.1/Http/Models/Estate.js' );
	const Block = require( _directory_base + '/app/v2.1/Http/Models/Block.js' );
    const ViewUserAuth = require( _directory_base + '/app/v2.1/Http/Models/ViewUserAuth.js' );
    
	// Node Module
    const MomentTimezone = require( 'moment-timezone' );
    const async = require('async');
    const dateformat = require('dateformat');
	const { v4: uuidv4 } = require('uuid');
	// Libraries
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );

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

        checkDueDate() {
            async.auto({
                getNoDueDateFinding: function(callback) {
                    FindingModel.find({DUE_DATE: 0})
                    .then(data => {
                        callback(null, data);
                    })
                    .catch(err => {
                        console.log(err);
                        callback(err);
                        return;
                    });
                }, 
                dueDateNoResponds: ['getNoDueDateFinding', function(results, callback) {
                    let findings = results.getNoDueDateFinding;
                    var now = new Date().toLocaleString('en-US', {
                        timeZone: 'Asia/Jakarta'
                    });
                    now = parseInt(dateformat(now, 'yyyymmddHHMMss'));
                    let noRespondsFinding = [];
                    for(let i = 0; i < findings.length; i++) {
                        let selisihHari = now - findings[i].INSERT_TIME;
                        //jika due_date masih belum di set setelah tujuh hari dibuat
                        //maka masukan ke arrah noRespondFinding
                        if(selisihHari > 7000000 ) {
                            noRespondsFinding.push(findings[i]);
                        }
                    }
                    callback(null, noRespondsFinding);
                }]
                
            }, function(err, results) {
                if (err) {
                    return console.log(err);
                }
                let findings = results.dueDateNoResponds;
                var now = new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Jakarta'
                });
                now = parseInt(dateformat(now, 'yyyymmddHHMMss'));
                findings.map(async (finding) => {
                    try {
                        let estate = await Estate.findOne({WERKS: finding.WERKS}).select({_id: 0, EST_NAME: 1});
                        let block = await Block.findOne({WERKS: finding.WERKS, BLOCK_CODE: finding.BLOCK_CODE}).select({_id: 0, BLOCK_NAME: 1});
                        let assignToUser = await ViewUserAuth.findOne({USER_AUTH_CODE: finding.ASSIGN_TO}).select({_id: 0, HRIS_FULLNAME: 1, PJS_FULLNAME: 1});
                        let assignToName = assignToUser.HRIS_FULLNAME ? assignToUser.HRIS_FULLNAME : assignToUser.PJS_FULLNAME;
                        assignToName = assignToName.toLowerCase()
                                                    .split(' ')
                                                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                                    .join(' ');
                        let insertUser = await ViewUserAuth.findOne({USER_AUTH_CODE: finding.INSERT_USER}).select({_id: 0, HRIS_FULLNAME: 1, PJS_FULLNAME: 1});
                        let insertUserName = insertUser.HRIS_FULLNAME ? insertUser.HRIS_FULLNAME : insertUser.PJS_FULLNAME;
                            insertUserName = insertUserName.toLowerCase()
                                        .split(' ')
                                        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                        .join(' ');
                        let insertTime = HelperLib.date_format(finding.INSERT_TIME, 'YYYY-MM-DD');
                        let date = new Date(insertTime);
						let insertTimeFormatted = dateformat(date, 'dd mmm yyyy');
                        let messageInsertUser = `Kamu menugaskan ${assignToName} untuk mengerjakan temuan di ${estate.EST_NAME} Blok ${block.BLOCK_NAME} tanggal ${insertTimeFormatted} tapi ybs belum memberikan respon`;
                        let messageAssignTo = `Kamu ditugaskan ${insertUserName} untuk mengerjakan temuan di ${estate.EST_NAME} Blok ${block.BLOCK_NAME} tanggal ${insertTimeFormatted} tapi belum memberikan respon`;

                        let notifInsertUser = new Notification({
						    NOTIFICATION_ID: uuidv4(), 
                            FINDING_CODE: finding.FINDING_CODE,
                            CATEGORY: 'BELUM ADA RESPON',
                            NOTIFICATION_TO: finding.INSERT_USER,
                            MESSAGE: messageInsertUser,
                            INSERT_TIME: now
                        });
                        
                        let notifAssignTo = new Notification({
						    NOTIFICATION_ID: uuidv4(), 
                            FINDING_CODE: finding.FINDING_CODE,
                            CATEGORY: 'BELUM ADA RESPON',
                            NOTIFICATION_TO: finding.ASSIGN_TO,
                            MESSAGE: messageAssignTo,
                            INSERT_TIME: now
                        });

                        await notifInsertUser.save();
                        await notifAssignTo.save();
                        console.log('sukses saveToNotification');
                    }catch (err) {
                        console.log(err);
                    }
                })
            })
        }

        checkOverdueFinding() {
            var now = new Date().toLocaleString('en-US', {
                timeZone: 'Asia/Jakarta'
            });
            now = parseInt(dateformat(now, 'yyyymmddHHMMss'));
            async.auto({
                getAllOverdueFindings: function(callback) {
                    FindingModel.find({
                        DUE_DATE: {
                            $lt: now,
                            $ne: 0
                        },
                        PROGRESS: {
                            $ne: 100
                        }
                    })
                    .then( data => {
                        callback(null, data);
                    })
                    .catch(err => {
                        console.log(err);
                        return callback(err);
                    });
                }
            }, function(err, results) {
                if (err) {
                    return console.log(err);
                }
                let findings = results.getAllOverdueFindings;
                findings.map(async (finding) => {
                    let assignToUser = await ViewUserAuth.findOne({USER_AUTH_CODE: finding.ASSIGN_TO}).select({_id: 0, HRIS_FULLNAME: 1, PJS_FULLNAME: 1});
                    let assignToName = assignToUser.HRIS_FULLNAME ? assignToUser.HRIS_FULLNAME : assignToUser.PJS_FULLNAME;
                    assignToName = assignToName.toLowerCase()
                                                .split(' ')
                                                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                                                .join(' ');
                    let insertTime = HelperLib.date_format(finding.INSERT_TIME, 'YYYY-MM-DD');
                    let date = new Date(insertTime);
                    let insertTimeFormatted = dateformat(date, 'dd mmm yyyy');
                    let message = `Temuan yang ditugaskan ke ${assignToName} sudah melewati batas waktu tanggal ${insertTimeFormatted}`;
                    
                    let notif = new Notification({
						NOTIFICATION_ID: uuidv4(), 
                        FINDING_CODE: finding.FINDING_CODE,
                        CATEGORY: 'LEWAT BATAS WAKTU',
                        NOTIFICATION_TO: finding.INSERT_USER,
                        MESSAGE: message,
                        INSERT_TIME: now
                    });
                    await notif.save();
                    if (finding.INSERT_USER != finding.ASSIGN_TO) {
                        let notifAssignTo = new Notification({
                            NOTIFICATION_ID: uuidv4(), 
                            FINDING_CODE: finding.FINDING_CODE,
                            CATEGORY: 'LEWAT BATAS WAKTU',
                            NOTIFICATION_TO: finding.ASSIGN_TO,
                            MESSAGE: message,
                            INSERT_TIME: now
                        });
                        await notifAssignTo.save();
                    }
                    console.log('sukses Simpan');
                })
            })
        }
    }



    module.exports = new Kernel();
