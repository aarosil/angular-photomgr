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

    pmSvc.deleteAlbum = function (id) {
        return Album.delete({id: id});
    }

    pmSvc.deletePhoto = function (id) {
        return Photo.delete({id: id});
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