var mongoose = require('mongoose');
var _ = require('underscore');
var Album = mongoose.model('Album');
var Photo = mongoose.model('Photo');


var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

exports.findAllPhotos = function(req, res) {
	Photo.find({}).populate('albums', 'name').exec(function(err, photos) {
		res.send(photos);
	})
}

exports.findAllAlbums = function(req, res) {
	Album.find({},  null, {sort: {order: 1}}, function(err, albums) {
		res.send(albums);
	})
}

exports.findAllPhotosInAlbum = function (req, res) {
	Album.findOne({_id: req.params.id}).populate('photoList._id').select('photoList._id').exec(function(err,album){
		var photos = [];
		_.each(album.photoList, function(entry) {
			photos.push(entry._id); //entry._id represents entire photo document
		})
		res.send(photos)
	})
}

exports.editAlbumPhotos = function(req, res) {
	var action = req.params.action;
	var albumId = req.params.id;
	var photoId = req.params.photoId;
	
	Album.findById(albumId, function(err,album){
		if (err) console.log("Error finding album: " + err)

		if (action === 'add') {
			album.addPhoto(photoId, function(data){
				res.send(data);
			});
		} else { // action === 'remove'
			album.removePhoto(photoId, function(data){
				res.send(data);
			});			
		}
	})
}

exports.findPhotoById = function(req, res) {
	Photo.findOne({_id: req.params.id})
		.populate('albums', 'name')
		.exec(function(err,photo){
			if (err) console.log("error finding photo: " + err)
			res.send(photo);
		})
}

exports.findAlbumById = function(req, res) {
	Album.findOne({_id: req.params.id})
		.populate('photoList._id')
		.exec(function(err,album){
			if (err) console.log("error finding album: " + err)
			res.send(album);
	})
}

exports.addPhoto = function(req, res) {
	var newPhoto = req.body;
	console.log("Adding Photo: " + JSON.stringify(newPhoto));
	Photo.create(newPhoto, function(err, photo){
		if (err) console.log("error: " + err);
		res.send(photo);
	})
}

exports.addAlbum = function(req, res) {
	var newAlbum = req.body;
	console.log("Adding Album: " + JSON.stringify(newAlbum));
	Album.create(newAlbum, function(err, album){
		if (err) console.log("error: " + err);
		res.send(album);
	});
}

exports.updateAlbum = function(req, res) {
	Album.findById(req.params.id, function(err, album){
		if (err) console.log("error: " + err)
		_.extend(album, req.body);
		album.save(function(err,album,numAffected){
			if (err) console.log("Error saving album: " + err)
			console.log(numAffected + " documents updated.")
			res.send(album)
		});
	});
}

exports.updatePhoto = function(req, res) {
	Photo.findById(req.params.id, function(err, photo){
		if (err) console.log("error: " + err)
		_.extend(photo, req.body);
		photo.save(function(err,photo,numAffected){
			if (err) console.log("Error saving photo: " + err)
			console.log(numAffected + " documents updated.")
			res.send(photo)
		});
	});
}


exports.deletePhoto = function(req, res) {
	Photo.findById(req.params.id, function (err, doc) {
		if (!err) { 
			doc.remove( function() {
				res.send(req.body);
			});
		} else {
			console.log("error: "+ err);
		}
	})
}

exports.deleteAlbum = function(req, res) {
	Album.findById(req.params.id, function (err, doc) {
		if (!err) { 
			doc.remove( function() {
				res.send(req.body);
			});
		} else {
			console.log("error: "+ err);
		}
	})
}	

exports.uploadPhoto = function(req, res) {
	var uploadfile = req.files.uploadfile.path;
	var filename  =  req.files.uploadfile.name;
	console.log("path: " + uploadfile + " name: " + filename);
	// TODO: Change local path into a config param
	var localPath = 'c:/Users/HOME/ngPhotoMgr/public/img/' + filename;

	require('fs').rename(uploadfile, localPath, function (error) {
		if (error) {
			res.send({error: "File Upload Failed!"});
			return
		}
		// TODO: change static img folder to config param
		res.send({path: '/img/' + filename});
	});
};

exports.uploadPhotoAWS = function (req, res) { 
	
	var bucket = 'young-badlands-8496';

	var uploadfile = req.files.uploadfile.path;
	var name = 'img/' + req.files.uploadfile.name;
	var fs = require('fs');

	fs.stat(uploadfile, function(err, file_info) {

		if (err) {
			console.log("ERROR UPLOAD: " + err)
		} else {

		    var bodyStream = fs.createReadStream(uploadfile);

		    var params = {
		    	ACL			: 'public-read',
		        Bucket    	: bucket,
		        Key			: name,
		        ContentLength : file_info.size,
		        Body          : bodyStream
		    };

		    s3bucket = new AWS.S3({params: {Bucket: bucket}});

		    s3bucket.putObject(params, function(err, data) {
		        if(err){
		        	console.log(err);
		        } else {
		        	res.send({path: 'http://young-badlands-8496.s3-website-us-east-1.amazonaws.com/' + name})	
		        }
		    	
		    });

		}

	});	
}
