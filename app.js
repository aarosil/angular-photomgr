/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var pm = require('./photomanager');
var app = express();

/**
 * Configurations.
 */
// all environments
app.set('port', process.env.PORT || 3001);
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Assign Routes.
 */
/** File upload from user **/
app.post('/upload', pm.uploadPhoto);
/** File C.R.U.D. **/
app.post('/photos', pm.addPhoto);
app.get('/photos', pm.findAllPhotos);
app.get('/photos/:id', pm.findPhotoById);
app.put('/photos/:id', pm.updatePhoto);
app.post('/photos/:id', pm.updatePhoto);
app.delete('/photos/:id', pm.deletePhoto);
/** Album C.R.U.D. **/
app.post('/albums', pm.addAlbum);
app.get('/albums', pm.findAllAlbums);
app.get('/albums/:id', pm.findAlbumName);
app.put('/albums/:id', pm.updateAlbum);
app.post('/albums/:id', pm.updateAlbum);
app.delete('/albums/:id', pm.deleteAlbum);
/** Gallery - returns all photos with album = id **/
app.get('/gallery/:id', pm.findAllPhotosInAlbum);

/**
 * Start Server.
 */
http.createServer(app).listen(app.get('port'), function () {
    console.log("Server listening on port " + app.get('port'));
});

