// imports
var mongoose = require('mongoose');
var _ = require('underscore');
var Album = require('./albumDbSchema');

var Schema = mongoose.Schema;

// Photo schema
var photoSchema = new Schema({
	filepath: { type: String},
	name: { type: String, required: true},
	location: { type: String},
	year: { type: String},
	description: { type: String},
	albums  : [ {type : mongoose.Schema.ObjectId, ref : 'Album'} ]
});

// after removing the photo, delete references to it
// from within any album documents 
photoSchema.post('remove', function(photo) {
	var self = this
	_.each(photo.albums, function(entry){
		self.model('Album').findOne({_id: entry})
			.exec(function(err,album){
				console.log("Removing ID from Album " + album.name)
				album.photoList.id(photo._id).remove();
				album.save();
			})
	})
})

// Export photo model
module.exports = mongoose.model('Photo', photoSchema);