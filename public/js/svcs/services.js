var photomgrServices = angular.module('photomgrServices', ['ngResource']);

photomgrServices.factory('Photo', ['$resource', 
	function($resource){
		return $resource('/photos/:id/', { id: '@_id'}, {
			query: {method:'GET', isArray:true},
			uploadPhoto: {
            method: 'POST',
            url: '/upload',
            headers: {'Content-Type': undefined },
            transformRequest: angular.identity
      }
   	});
   }]);

photomgrServices.factory('Album', ['$resource', 
	function($resource){
		return $resource('/albums/:id/', {id: '@_id'}, {
			query: {method:'GET', isArray:true},
         getPhotos: {
             method:'GET', isArray:true, url:'/gallery/:id/'
         }
		});
	}]);

photomgrServices.factory('PhotoMgrService', ['Album', 'Photo',    
   function(Album, Photo) {

   var pmSvc = {};
    
   pmSvc.getAlbum = function (id) {
      return Album.get({id: id}, function(data) {
         return data;
      }); 
   }    

   pmSvc.getPhoto = function(id) {
      return Photo.get({id: id}, function(data) {
         return data;
      });
   }

   pmSvc.getAllPhotos = function() {
      return Photo.query({}, function(data) {
         return data;
      });
   }

   pmSvc.saveAlbum = function(album) {
      return Album.save({}, album, function(data) {
         return data;
      });
   }

   pmSvc.savePhoto = function (photo) {
      return Photo.save({}, photo, function(data) {
         return data; 
      });
   }

   pmSvc.deleteAlbum = function (album) {
      return Album.delete({}, album, function(data) {
         return data;
      });
   }

   pmSvc.deletePhoto = function (photo) {
      return Photo.delete({}, photo, function(data) {
         return data;
      });
   }

   pmSvc.toggleEnabled = function(id) {
      return Album.get({id: id}, function(album) {
         album.enabled = (!album.enabled) 
         album.$save();
      });
   }

   pmSvc.getAlbumPhotos = function(id) {
      return Album.getPhotos({id: id}, function(data) {
         return data;
      });
   }

   pmSvc.newAlbum = function () {
      return new Album();
   }
    
   pmSvc.newPhoto = function () {
      return new Photo();
   }

   pmSvc.uploadFile = function (formData) {
      return Photo.uploadPhoto({}, formData).$promise;
   }
 
   return pmSvc;

}]);

photomgrServices.factory('Util', ['$q', 'Album', 'Photo',   
   function($q, Album, Photo) {

      var util = {};
      
      util.addPhotoToAlbum = function (album,photo){
         //verify not duplicate entry then add and save
         if (!window._.contains(photo.albums, album._id)) {
            if (!photo.albums) {photo.albums = []}
            photo.albums.push(album._id);
            console.log("Added album " + album.name + " to Photo " + photo.name)
            photo.$save()  
         } else {
            console.log("Error adding to PHOTO");
         }
         if (!window._.findWhere(album.photos, {_id: photo._id})) {
            album.photos.push({order: album.photos.length, _id: photo._id})   
            console.log("Added photo " + photo.name + " to Album " + album.name)
            album.$save()              
         } else {
            console.log("Error adding to ALBUM");
         }
      };

      util.removePhotoFromAlbum = function(album,photo){
         if (window._.contains(photo.albums, album._id)) {
            photo.albums.splice(window._.indexOf(photo.albums, album._id), 1);
            console.log(photo)
            Photo.save(photo);
            console.log("Removed album " + album.name + " from Photo " + photo.name)
         } else {
            console.log("Error removing from PHOTO");
         }
         if (window._.findWhere(album.photos, {_id: photo._id})) {
            album.photos.splice(window._.indexOf(album.photos, photo), 1);
            Album.save(album);   
            console.log("Removed photo " + photo.name + " from Album " + album.name)          
         } else {
            console.log("Error removing from Album");
         }               
      };

      return util;
}]);