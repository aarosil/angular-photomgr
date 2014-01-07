var mongoose = require('mongoose');
var SALT_WORK_FACTOR = 10;
exports.mongoose = mongoose;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://user:pass@localhost:27017/ng-photomanager-db';
var mongoOptions = { db: { safe: true }};


mongoose.connect(mongoUri, mongoOptions, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + mongoUri + '. ' + err);
	} else {
		console.log ('Successfully connected to: ' + mongoUri);
	}
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// User schema
var userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true},
	admin: { type: Boolean, required: true }
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	if (candidatePassword === this.password) {
		cb(null, true)
	} else {
		cb("Error: Passwords don't match")
	}
};

// Export user model
var userModel = mongoose.model('User', userSchema);
exports.userModel = userModel;


/**
//seed a new user
var user = new userModel({ username: 'Aaron', email: 'siladi@gmail.com', password: '12345', admin: false });
user.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('user: ' + user.username + " saved.");
  }
});
**/
