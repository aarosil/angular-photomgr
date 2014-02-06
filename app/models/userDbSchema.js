var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
exports.userModel = mongoose.model('User', userSchema);


/**
//seed a new user
var user = new userModel({ username: 'Aaron', email: 'test@test.com', password: '12345', admin: false });
user.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('user: ' + user.username + " saved.");
  }
});
**/
