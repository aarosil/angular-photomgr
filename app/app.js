/**
 * Module dependencies.
 */
var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var models = require('./models')
var dbCfg = require('./config/dbCfg');
var passportCfg = require('./config/passportCfg');
var http = require('http');
var path = require('path');
var pm = require('./photomanager');
var app = express();

/**
 * Configurations.
 */
// all environments
app.set('port', process.env.PORT || 3001);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: 'h0m3w0rk'}))
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../public')));
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Assign Routes.
 */
/** File upload from user **/
app.post('/upload', pm.uploadPhotoAWS);
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
app.post('/albums/:id/:action/:photoId', pm.editAlbumPhotos)
app.get('/albums/:id', pm.findAlbumById);
app.put('/albums/:id', pm.updateAlbum);
app.post('/albums/:id', pm.updateAlbum);
app.delete('/albums/:id', pm.deleteAlbum);
/** Gallery - returns all photos with album = id **/
app.get('/gallery/:id', pm.findAllPhotosInAlbum);
/** Login to App **/
app.post('/login', passportCfg.postLogin);
app.get('/logout', function(req, res){
	req.logOut(); 
	//res.clearCookie('user');
	res.send(200);
});
app.get('/protected', passportCfg.ensureAuthenticated, function(req, res){res.send('PROTECTED')})
app.get('/isloggedin', function(req, res) {
	res.send(req.isAuthenticated() ? req.user : 0)
});

/**
 * Start Server.
 */
http.createServer(app).listen(app.get('port'), function () {
    console.log("Server listening on port " + app.get('port'));
});

