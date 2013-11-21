var mongodb = require('mongodb');
var BSON = require('mongodb').BSONPure;
var ObjectID = require('mongodb').ObjectID;

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://user:pass@localhost:27017/ng-photomanager-db';

mongodb.MongoClient.connect(mongoUri, function (err, db) {
	if(!err) {
		console.log('Connected to the database');
		db.collection('photos', {safe:true}, function(err, collection) {
			if (err) {
				console.log(err);
			} else {
				console.log('Collection: photos');
			}
		});

	} else {
		console.log("error: " + err);
	}
});

exports.findAllPhotos = function(req,res) {
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('photos', function(err, collection) {
			collection.find().toArray(function(err,items) {
				res.send(items);		
			});
		});
	});
};

exports.findAllAlbums = function(req, res) {
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('albums', function(err, collection) {
			collection.find().toArray(function(err,items) {
				if (items) {
					res.send(items);		
				} else {
					console.log(err);
					res.send(err);
				}
			});
		});
	});
};

exports.findAllPhotosInAlbum = function(req, res) {
	var id = req.params.id;
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('photos', function(err, collection) {
			collection.find({'album': id}).toArray(function(err,items) {
				res.send(items);
			});
		});
	});
};

exports.findPhotoById = function(req, res) {
    var id = req.params.id;
	console.log("Lookup PhotoID: " + id); 
	mongodb.MongoClient.connect(mongoUri, function (err, db) {   
	    db.collection('photos', function(err, collection) {
	        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
	            res.send(item);
	        });
	    });
    });
};

exports.findAlbumName = function(req, res) {
	var id = req.params.id;
	console.log("Lookup AlbumID: " + id);
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('albums', function(err, collection) {
			collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
				if (err) {
					console.log(err);
					res.send(err);
				} else {
					res.send(item);
				}				
			});
		});
	});
};

exports.addAlbum = function(req, res) { 
	var album = req.body;
	console.log('Adding album: ' + JSON.stringify(album));
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('albums', function (err, collection) {
			collection.insert(album, {safe:true}, function(err, result) {
				if (err) {
					res.send({'error':'An error has occurred'});
				} else {
					console.log('Success: ' + JSON.stringify(result[0]));
					res.send(result[0]);
				}
			});
		});
	});
};

exports.updateAlbum = function(req,res) {
	var id = req.params.id;
	var album = req.body;
	delete album._id;
	console.log("Updating album: " + id)
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('albums', function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, album, {safe:true}, function(err,result){
				if (err) {
					res.send({'error':'An error has occurred - ' + err});
					console.log(err);
				} else {
					console.log('' + result + ' documents updated');
					req.body['_id'] = id;
					res.send(req.body);

				}
			});
		});
	});
};

exports.addPhoto = function(req,res) {
	var photo = req.body;
	console.log('Adding photo: ' + JSON.stringify(photo));
	mongodb.MongoClient.connect(mongoUri, function (err, db) {
		db.collection('photos', function(err, collection) {
			collection.insert(photo, {safe:true}, function(err, result) {
				if (err) {
					res.send({'error':'An error has occurred'});
				} else {
					console.log('Success' + JSON.stringify(result[0]));
					res.send(result[0]);
				}
			});
		});
	});
};

exports.updatePhoto = function(req,res) {
	var id = req.params.id;
	var photo = req.body;
	delete photo._id;
	console.log("Updating photo: " + id)
	mongodb.MongoClient.connect(mongoUri, function (err, db) {	
		db.collection('photos', function(err, collection) {
			collection.update({'_id': new BSON.ObjectID(id)}, photo, {safe:true}, function(err,result){
				if (err) {
					res.send({'error':'An error has occurred - ' + err});
					console.log(err);
				} else {
					console.log('' + result + ' documents updated');
					req.body['_id'] = id;
					res.send(req.body);
				}
			});
		});
	});
};

exports.deletePhoto = function(req, res) {
    var id = req.params.id;
    console.log('Deleting photo: ' + id);
    mongodb.MongoClient.connect(mongoUri, function (err, db) {	
	    db.collection('photos', function(err, collection) {
	        collection.remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred - ' + err});
	            } else {
	                console.log('' + result + ' document(s) deleted');
	                res.send(result[0]);                
	            }
	        });
	    });
    });
};

exports.deleteAlbum = function(req, res) {
    var id = req.params.id;
    console.log('Deleting album: ' + id);
    mongodb.MongoClient.connect(mongoUri, function (err, db) {
	    db.collection('albums', function(err, collection) {
	        collection.remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred - ' + err});
	            } else {
	                console.log('' + result + ' document(s) deleted');
	                res.send(req.body);                
	            }
	        });
	    });
    });
};


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

