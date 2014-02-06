var mongoose = require('mongoose');
exports.mongoose = mongoose;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://user:pass@localhost:27017/ng-photomanager-db';
var mongoOptions = { db: { safe: true }};


mongoose.connect(mongoUri, mongoOptions, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + mongoUri + ' : ' + err);
	} else {
		console.log ('Successfully connected to: ' + mongoUri);
	}
});

