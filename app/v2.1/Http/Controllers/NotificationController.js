/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
     // Models
    const Notification = require( _directory_base + '/app/v2.1/Http/Models/Notification.js');
    const History = require( _directory_base + '/app/v2.1/Http/Models/History.js');
	const Finding = require( _directory_base + '/app/v2.0/Http/Models/Finding.js' );
    const InspectionH = require( _directory_base + '/app/v2.1/Http/Models/InspectionH.js');
    const EBCCValidationHeader = require( _directory_base + '/app/v2.1/Http/Models/EBCCValidationHeader.js');
	const HelperLib = require( _directory_base + '/app/v2.0/Http/Libraries/HelperLib.js' );
    const async = require('async');
    const dateformat = require('dateformat');
    const { v4: uuidv4 } = require('uuid');

    exports.syncNotification = async (req, res) => {
        let auth = req.auth;
        let startDate = parseInt(req.params.startDate);
        let endDate = parseInt(req.params.endDate);

        try {
            let notification = await Notification.aggregate([
                {
                    $match: {
                        INSERT_TIME: {
                            $gte: startDate,
                            $lte: endDate
                        },
                        NOTIFICATION_TO: auth.USER_AUTH_CODE
                    }
                }, {
                    $project: {
                        _id: 0
                    }
                }
            ]);
            return res.send({
                status: true,
                message: 'success',
                data: notification
            });
        } catch(err) {
        console.log(err);
        return res.send({
            status: false,
            message: 'internal server error',
            data: []
        });
        }
    }

    exports.create = async ( req, res ) => {
        let body = req.body;
        try {
            body.NOTIFICATION_ID = uuidv4();
            let notification = new Notification(body);
            await notification.save();
            res.send({
                status: true,
                message: 'success',
                data: []
            })
        } catch(err) {
            console.log(err)
            res.send({
                status: false,
                message: 'internal server error',
                data: []
            });
        }
    }

    exports.notifPoint = async (req, res) => {
        let auth = req.auth;
        let currentDate = HelperLib.date_format('now', 'YYYYMMDDhhmmss').substring( 0, 8 );
        let date = new Date();
        let dateFormatted = dateformat(date, 'dd mmm yyyy');
        let currentTime = HelperLib.date_format('now', 'YYYYMMDDhhmmss');
        async.auto({
            getCurrentDateInspection: function(callback) {
                InspectionH.find({
                    SYNC_TIME: {
                        $gte: parseInt(currentDate + '000000'),
                        $lte: parseInt(currentDate + '235959')
                    },
                    INSERT_USER: auth.USER_AUTH_CODE
                }).count()
                .then(data => {
                    console.log(data);
                    callback(null, data);
                })
                .catch(err => {
                    callback(err, null)
                    return;
                })
            },
            getCurrentDateEbcc: function(callback) {
                EBCCValidationHeader.find({
                    SYNC_TIME: {
                        $gte: parseInt(currentDate + '000000'),
                        $lte: parseInt(currentDate + '235959')
                    },
                    INSERT_USER: auth.USER_AUTH_CODE
                }).count()
                .then(data => {
                    console.log('data ebcc:', data);
                    callback(null, data);
                })
                .catch(err => {
                    callback(err, null)
                    return;
                })
            },
            getCurrentDateFinding: function(callback) {
                Finding.find({
                    UPDATE_TIME: {
                        $gte: parseInt(currentDate + '000000'),
                        $lte: parseInt(currentDate + '235959')
                    },
                    END_TIME: {
                        $ne: 0
                    },
                    ASSIGN_TO: auth.USER_AUTH_CODE
                    // $expr: { $gt: [ "$DUE_DATE" , "$END_TIME" ] }
                }).count()
                .then(data => {
                    console.log(data);
                    callback(null, data);
                })
                .catch(err => {
                    callback(err, null)
                    return;
                })
            },
            getCurrentDateRating: function(callback) {
                Finding.find({
                    UPDATE_TIME: {
                        $gte: parseInt(currentDate + '000000'),
                        $lte: parseInt(currentDate + '235959')
                    },
                    END_TIME: {
                        $ne: 0
                    },
                    RATING_VALUE: {
                        $ne: 0
                    },
                    ASSIGN_TO: auth.USER_AUTH_CODE
                })
                .then(data => {
                    let point = 0;
                    for(let i = 0; i < data.length; i++) {
                        point += data[i] - 2;
                    }
                    callback(null, point);
                })
                .catch(err => {
                    callback(err, null)
                    return;
                })
            },
            notifPoint: ['getCurrentDateInspection', 'getCurrentDateEbcc', 'getCurrentDateFinding', 'getCurrentDateRating', function(results, callback) {
                let inspectionPoint = 1 * results.getCurrentDateInspection;
                let findingPoint = 1 * results.getCurrentDateFinding;
                let ebccPoint = 1 * results.getCurrentDateEbcc;
                let ratingPoint = results.getCurrentDateRating;

                let inspectionMessage = inspectionPoint > 0 ? inspectionPoint +' point dari inspeksi' : '';
                let findingMessage = findingPoint > 0 ? (inspectionPoint > 0 ? ', '  : ' ') + findingPoint +' point dari finding' : '';
                let ebccMessage = ebccPoint > 0 ? ((findingPoint > 0) || (inspectionPoint > 0 )? ', '  : ' ')  + ebccPoint +' point dari sampling EBCC' : '';
                let ratingMessage = ratingPoint > 0 ? ((findingPoint > 0) || (inspectionPoint > 0 ) || (ebccPoint > 0) ? ', '  : ' ') + ratingPoint +' point dari rating.' : '.';
                
                let totalPoint = inspectionPoint + ebccPoint + findingPoint + ratingPoint;
                console.log('totalPoint: ', totalPoint)
                // History.aggregate([
                //     {
                //         $group: {
                //             _id: {
                //                 USER_AUTH_CODE: "$USER_AUTH_CODE",
                //                 DATE: "$DATE"
                //             },
                //             TOTAL: { $sum: "$POINT" }
                //         }
                //     }, {
                //         $project: {
                //             _id: 0,
                //             USER_AUTH_CODE: "$_id.USER_AUTH_CODE",
                //             DATE: "$_id.DATE",
                //             TOTAL_POINT: "$TOTAL"
                //         }
                //     }, {
                //         $match: {
                //             USER_AUTH_CODE: auth.USER_AUTH_CODE,
                //             DATE: parseInt(currentDate)
                //         }
                //     }
                // ])
                // .then(data => {
                //     console.log(data);
                    // if(data.length > 0) {
                        // if(totalPoint > 0 && totalPoint > data[0].TOTAL_POINT) {
                        if(totalPoint > 0) {
                            let message = "";
                            message += 'Tanggal '+ dateFormatted +' kamu telah mendapatkan '+ totalPoint +' point: ' + inspectionMessage + findingMessage + ebccMessage + ratingMessage;
                            let notification = new Notification({
                                NOTIFICATION_ID: uuidv4(), 
                                FINDING_CODE: '-',
                                CATEGORY: 'DAPAT POINT',
                                NOTIFICATION_TO: auth.USER_AUTH_CODE,
                                MESSAGE: message,
                                INSERT_TIME: currentTime
                            });
                            notification.save()
                            .then(() => {
                                callback(null, 'berhasil simpan notif');
                            })
                            .catch(err => {
                                console.log(err)
                                callback(err, null)
                            })
                        }else {
                            callback(null, 'skip karena totalPoint <= 0');
                        }
                //     } else {
                //         callback(null, 'skip karena data history 0');
                //     }
                // })
                // .catch(err => {
                //     console.log(err);
                //     callback(err, null);
                //     return;
                // })
            }]           
        }, function(err, results) {
            console.log(results.notifPoint);
        })
    }