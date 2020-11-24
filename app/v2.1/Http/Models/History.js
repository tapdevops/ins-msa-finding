const mongoose = require( 'mongoose' );
require( 'mongoose-double' )(mongoose);
const db = require(_directory_base + '/config/database.js');
const connectAuth = mongoose.createConnection(db.auth[config.app.env].url, {useNewUrlParser: true});
const History = mongoose.Schema({
	USER_AUTH_CODE: String,
	PERIOD: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return null;
		}
	},
    DATE: {
		type: Number,
		get: v => Math.floor( v ),
		set: v => Math.floor( v ),
		alias: 'i',
		default: function() {
			return null;
		}
	},
    BA_CODE: String,
    POINT: Number,
    TYPE: String,
    REMARKS: String,
    REFERENCE: String
});

module.exports = connectAuth.model( 'History', History, 'TR_HISTORY' );