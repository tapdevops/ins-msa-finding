/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
global._default_db = 'finding';
global._directory_base = __dirname;
global.config = {};
config.app = require('./config/app.js');
config.database = require('./config/database.js')[_default_db][config.app.env];

/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
// Node Modules
const BodyParser = require('body-parser');
const Express = require('express');
const Mongoose = require('mongoose');
const CronJob = require('cron').CronJob;

// Primary Variable
const App = Express();

//Kernel
const Kernel = require(_directory_base + '/app/v2.0/Console/Kernel.js');

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
// Parse request of content-type - application/x-www-form-urlencoded
App.use(BodyParser.urlencoded({ extended: false }));

// Parse request of content-type - application/json
App.use(BodyParser.json());

// Setup Database
Mongoose.Promise = global.Promise;
Mongoose.connect(config.database.url, {
	useNewUrlParser: true,
	ssl: config.database.ssl
}).then(() => {
	console.log("Database :");
	console.log("\tStatus \t\t: Connected");
	console.log("\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")");
}).catch(err => {
	console.log("Database :");
	console.log("\tDatabase Status : Not Connected");
	console.log("\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")");
});

// Server Running Message
let server = App.listen(parseInt(config.app.port[config.app.env]), () => {
	console.log("Server :");
	console.log("\tStatus \t\t: OK");
	console.log("\tService \t: " + config.app.name + " (" + config.app.env + ")");
	console.log("\tPort \t\t: " + config.app.port[config.app.env]);
});

const timeout = require('connect-timeout');
//set timeout 5 minutes
App.use(timeout('300s'));

//scheduling job_update_transaksi_complete() with cron 
new CronJob('5 0 * * MON', async () => {
	Kernel.job_update_transaksi_complete();
	console.log("running node-cron...");
}, null, true, 'Asia/Jakarta');

//scheduling check no respond finding
new CronJob('5 0 * * *', async () => {
// new CronJob('* * * * *', async () => {
	Kernel.checkDueDate();
}, null, true, 'Asia/Jakarta');

//scheduling check overdue finding
new CronJob('30 0 * * *', async () => {
// new CronJob('* * * * *', async () => {
	Kernel.checkOverdueFinding();
}, null, true, 'Asia/Jakarta');

// Routing
require('./routes/api.js')(App);

module.exports = App;