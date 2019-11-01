/*
 |--------------------------------------------------------------------------
 | Models - KafkaErrorLog
 |--------------------------------------------------------------------------
 */

 //Node Module
    const Mongoose = require( 'mongoose' );

    const KafkaErrorLogSchema = Mongoose.Schema( {
        TR_CODE: String,
        TOPIC: String,
        INSERT_TIME: {
            type: Number,
            get: v => Math.round( v ),
            set: v => Math.round( v )
        }
    } );

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
    module.exports = Mongoose.model( "KafkaErrorLog", KafkaErrorLogSchema, 'TR_KAFKA_ERROR_LOGS' );
 