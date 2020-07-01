/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
const { Kafka } = require('kafkajs');


//Models
const KafkaErrorLog = require( _directory_base + '/app/v2.0/Http/Models/KafkaErrorLog.js' );
/*
|--------------------------------------------------------------------------
| Kafka Server Library
|--------------------------------------------------------------------------
|
| Apache Kafka is an open-source stream-processing software platform 
| developed by LinkedIn and donated to the Apache Software Foundation, 
| written in Scala and Java. The project aims to provide a unified, 
| high-throughput, low-latency platform for handling real-time data feeds.
|
*/
	const kafka = new Kafka({
		clientId: 'MSA-INSPECTION',
		brokers: [config.app.kafka[config.app.env].server_host]
	})
	
	const producer = kafka.producer()
	
	class KafkaServer {

		//producer dengan retry
		async producer(topic, message) {
			// Producing
			try {
				await producer.connect();
				await producer.send({
					topic: topic,
					messages: [
						{ value: message },
					],
					retry: {
						initialRetryTime: 100,
						retries: 5 //retry dengan maksimal lima kali percobaan gagal
					}
				});
				console.log( '[KAFKA PRODUCER] - Broker Update success.' );
			} catch (error) {
				console.log( '[KAFKA PRODUCER] - Connection Error.' );
				console.log(error);
				//throw err;
				let data = JSON.parse( message );

				let set = new KafkaErrorLog( {
					TR_CODE: data.FNDCD,
					TOPIC: topic,
					INSERT_TIME: data.INSTM
				});
				set.save();
				console.log( `simpan ke TR_KAFKA_ERROR_LOGS!` );
				console.log( set );
			}
		}
		/*producer ( topic, messages ) {
			// Class
			const Producer = Kafka.Producer;
			const Client = new Kafka.KafkaClient( { 
				kafkaHost: config.app.kafka[config.app.env].server_host
			} );

			// Variable
			const producer_kafka_client = new Producer( Client );
			const payloads = [
				{
					topic: topic,
					messages: messages
					
				}
			];

			producer_kafka_client.on( 'ready', async function() {
				const push_status = producer_kafka_client.send( payloads, ( err, data ) => {
					if ( err ) {
						console.log( '[KAFKA PRODUCER] - Broker Update Failed.' );
					} else {
						console.log( '[KAFKA PRODUCER] - Broker Update Success.' );
					}
				} );
			} );

			producer_kafka_client.on( 'error', function( err ) {
				console.log( err );
				console.log( '[KAFKA PRODUCER] - Connection Error.' );
				//throw err;

				let data = JSON.parse( messages );

				let set = new KafkaErrorLog( {
					TR_CODE: data.FNDCD,
					TOPIC: topic,
					INSERT_TIME: data.INSTM
				} )
				set.save();
				console.log( `simpan ke TR_KAFKA_ERROR_LOGS!` );
			});
		}

		*/

	}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = new KafkaServer();