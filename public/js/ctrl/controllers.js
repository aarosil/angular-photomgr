var photomgrControllers = angular.module('photomgrControllers', []);

photomgrControllers.controller('HomeCtrl', ['$scope', 
	function($scope) {
		$scope.homeMsg = "PhotoManager lets you upload photos and create galleries of your favorite pics!";
	}
]);

photomgrControllers.controller('NavCtrl', ['$scope', '$location',
	function($scope, $location) {
        $scope.highlight = function (regexp) {
            return RegExp(regexp).test($location.path());
        };
	}
]);

photomgrControllers.controller('PhotoCtrl', ['$scope', 'PhotoMgrService', 'pmData',
	function($scope, PhotoMgrService, pmData) {
		
		$scope.uploadFile = function (files) {
			var fd  = new FormData();
			fd.append('uploadfile', files[0]);
			$scope.pmSvc.uploadFile(fd).then(function(res) {
				$scope.photo.filepath = res.path;
			})
		}

		$scope.pmSvc = PhotoMgrService;
		$scope.view = pmData.view ? pmData.view : 'list';
		$scope.photo = pmData.photo;
		$scope.photos = pmData.photos;
		$scope.albums = pmData.albums;
		$scope.section = {'name': 'Photo', 'url':'/photos'}; //used to set links in subnav.html
	}
]);

photomgrControllers.controller('AlbumCtrl', [ '$scope', '$route', '$location', 'PhotoMgrService', 'pmData', 
	function($scope, $route, $location, PhotoMgrService, pmData) {

		$scope.clickPhoto = function(p) {
			$scope.photo = p;
		};

		$scope.setCoverPic = function(p) { //used by select to set photoId and path of the album's cover photo
			$scope.album.coverPicPath = p.filepath;
			$scope.album.coverPic = p._id;
		};

		$scope.saveAlbum = function (album) {
			$scope.pmSvc.saveAlbum(album).then( function(data) {
				$scope.albums.push(data); //add new album to list &  clear form
				$scope.newAlbum = $scope.pmSvc.newAlbum();				
			});
		};

		$scope.pmSvc = PhotoMgrService;
		$scope.view = pmData.view ? pmData.view : 'list';
		$scope.album = pmData.album;
		$scope.photos = pmData.photos;
		$scope.newAlbum = $scope.pmSvc.newAlbum()


		$scope.albums = pmData.albums;
		$scope.photos = pmData.photos;

		$scope.section = {'name': 'Album', 'url':'/albums'}; //used to set links in subnav.html

		if ($scope.photos.length > 0) {$scope.clickPhoto($scope.photos[0]);}	
		$scope.coverPic = window._.findWhere(pmData.photos, {_id: $scope.album.coverPic});
	}
]);

photomgrControllers.controller('GalleryCtrl', ['$scope', 'albums', 'photos',
	function($scope, albums, photos) {
		
		$scope.clickPhoto = function(albumID, index) {
			if (albumID !== $scope.album._id) {
				$scope.album = window._.findWhere(albums, {_id: albumID})
			}
			$scope.photo = $scope.album.photos[index];
			$scope.prev = Math.max(index-1, 0);
			$scope.next = Math.min(index+1, $scope.album.photos.length-1);
		}

		$scope.clickAlbum = function(i) { 
			$scope.albums[i].opened = !$scope.albums[i].opened; 
		}

		window._.each(albums, function(album) {
			album.photos = window._.where(photos, {album: album._id});
		});

		$scope.albums = window._.where(albums, {enabled: true});
		$scope.album = $scope.albums[0];
		$scope.album.opened = true;
		$scope.photo  = $scope.album.photos[0];
		$scope.prev = 0; 
		$scope.next = 1;

	}
]);

//Pre-load Asynchronous data before route change 
PhotoMgrData = { 

	/** album: function(Album, $route) {
		return $route.current.params.albumId ? Album.get({id: $route.current.params.albumId}).$promise : new Album();
	},

	photo: function(Photo, Album, $route) {
		return $route.current.params.photoId ? Photo.get({id: $route.current.params.photoId}).$promise : new Photo();
	},

	albums: function(Album) {
		return Album.query().$promise;
	},	

	photos: function(Photo, Album, $route, $location) {	
		if ($location.path().indexOf('add') !== -1 ) {
			return '';
		} else {
			return $route.current.params.albumId ? Album.getPhotos({id: $route.current.params.albumId}).$promise : Photo.query().$promise;		
		}
	}, **/

	pmData: function($route, Photo, Album) {
		var pmData = {};

		if ($route.current.params.view === 'add') {
			pmData.photos = '';
		} else if ($route.current.params.albumId) {
			pmData.photos = Album.getPhotos({id: $route.current.params.albumId});
		} else {
			pmData.photos = Photo.query();
		}

		pmData.photo = $route.current.params.photoId ? Photo.get({id: $route.current.params.photoId}) : new Photo();
		pmData.album = $route.current.params.albumId ? Album.get({id: $route.current.params.albumId}) : new Album();
		pmData.view = $route.current.params.view;

		pmData.albums = Album.query();

		return pmData;
	}

};

GalleryData = {
	albums: function(Album) {
		return Album.query().$promise;
	},

	photos: function(Photo, $route) {
		return $route.current.params.albumId ? Album.getPhotos({id: $route.current.params.albumId}).$promise : Photo.query().$promise;
	}
}
