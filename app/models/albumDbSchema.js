// imports
var mongoose = require('mongoose');
var _ = require('underscore');
var Photo = require('./photoDbSchema');

var Schema = mongoose.Schema;

// Photo List schema
var photoListSchema = new Schema({
	_id: {type : mongoose.Schema.ObjectId, ref : 'Photo'},
	order: {type: Number}
})

// Album Schema
var albumSchema = new Schema({
	name: { type: String, required: true},
	description: { type: String},
	order: { type: Number},
	enabled: { type: Boolean},
	coverPicPath: { type: String},
	coverPic: {type : mongoose.Schema.ObjectId, ref : 'Photo'},
	photoList  : [ photoListSchema ]
});

// Instance method to add photo
albumSchema.methods.addPhoto = function(photoId, callback) {
	var self = this;
	self.model('Album').findOne({_id: self._id}).exec(function(err, album){
		self.model('Photo').findOne({_id: photoId}).exec(function(err,photo){
			photo.albums.push(album._id);
			album.photoList.push({_id: photoId, order: album.photoList.length});
			photo.save();
			album.save(function(err){
				if (err) console.log("error adding photo to album: " + err)
				callback({photo: photo,album: album});
			});
		})
	})
};



albumSchema.methods.removePhoto = function(photoId, callback) {
	var self = this;
	self.model('Album').findOne({_id: self._id}).exec(function(err, album){
		self.model('Photo').findOne({_id: photoId}).exec(function(err,photo){
			if (photo.albums.indexOf(album._id) !== -1) {
				photo.albums.splice(_.indexOf(photo.albums, album._id), 1)
				photo.save();
			}
			album.photoList.remove({_id: photoId});
			album.photoList.forEach(function(photo, index){
				photo.order = index;
			})			
			album.save(function(err){
				if (err) console.log("error removing photo from album: " + err)
				callback({photo: photo,album: album});
			});
		})		
	})
};

// after removing the album, delete references to it
// from within any photo documents 
albumSchema.post('remove', function(album) {
	var self = this;
	_.each(album.photoList, function(entry){
		self.model('Photo').findOne({_id: entry._id})
			.exec(function(err,photo){
				console.log("Removing ID from Photo " + photo.name)
				photo.albums.splice(_.indexOf(photo.albums, album._id));
				photo.save();
			})
	})
})

// Export album model
module.exports = mongoose.model('Album', albumSchema);