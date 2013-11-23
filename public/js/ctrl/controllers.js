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

photomgrControllers.controller('PhotoCtrl', ['$scope', 'PhotoMgrService', 'albums', 'photos', 'album', 'photo', 'view',
	function($scope, PhotoMgrService, albums, photos, album, photo, view) {
		
		$scope.uploadFile = function (files) {
			var fd  = new FormData();
			fd.append('uploadfile', files[0]);
			$scope.pmSvc.uploadFile(fd).then(function(res) {
				$scope.photo.filepath = res.path;
			});
		}

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //view = list if not set in route params
		$scope.photo = photo;
		$scope.photos = photos;
		$scope.albums = albums;
		$scope.pmSvc.filter = '';
		$scope.section = {'name': 'Photo', 'url':'/photos'}; //used to set links in subnav.html
	}
]);

photomgrControllers.controller('AlbumCtrl', [ '$scope', 'PhotoMgrService', 'albums', 'photos', 'album', 'photo', 'view',
	function($scope, PhotoMgrService, albums, photos, album, photo, view) {

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
		$scope.view = view ? view : 'list';
		$scope.album = album;
		$scope.photos = photos;
		$scope.newAlbum = $scope.pmSvc.newAlbum()
		$scope.albums = albums;
		$scope.pmSvc.filter = '';

		$scope.section = {'name': 'Album', 'url':'/albums'}; //used to set links in subnav.html

		if ($scope.photos.length > 0) {$scope.clickPhoto($scope.photos[0]);}	
		$scope.coverPic = window._.findWhere(photos, {_id: $scope.album.coverPic});
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
			//$scope.albums[i].opened = true; 
			
			//window._.each($scope.albums, function(album, index) {
			//	if (index !== i) {$scope.albums[i].opened = false;}
			//})

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

//Pre-load Album & Photo data before route change 
PhotoMgrData = { 

	album: function(Album, $route) {
		return $route.current.params.albumId ? Album.get({id: $route.current.params.albumId}).$promise : new Album();
	},

	photo: function(Photo, Album, $route) {
		return $route.current.params.photoId ? Photo.get({id: $route.current.params.photoId}).$promise : new Photo();
	},

	albums: function(Album) {
		return Album.query().$promise;
	},	

	photos: function(Photo, Album, $route, $location) {	
		if ($route.current.params.view === 'add') {
			return '';
		} else if ($route.current.params.albumId) {
			return Album.getPhotos({id: $route.current.params.albumId}).$promise;
		} else {
			return Photo.query();
		}
	},

	view: function($route) {
		return $route.current.params.view;
	}
};

//Preload gallery data before the route change
GalleryData = {
	albums: function(Album) {
		return Album.query().$promise;
	},

	photos: function(Photo, $route) {
		return $route.current.params.albumId ? Album.getPhotos({id: $route.current.params.albumId}).$promise : Photo.query().$promise;
	}
}
