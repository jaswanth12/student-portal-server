var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const config =require('config');
var db=config.get('connection_url');
const connecting = async() => {
	try{
	await mongoose.connect(db);
	console.log('DB CONNECTED')
	}
	catch(err){
		console.log("ERROR IN DB CONNECTION");
		process.exit(1);
	}
}

module.exports = connecting;