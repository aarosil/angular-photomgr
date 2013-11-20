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

photomgrControllers.controller('PhotoCtrl', ['$scope', 'PhotoMgrService', 'photo', 'albums', 'photos', 'view',
	function($scope, PhotoMgrService, photo, albums, photos, view) {
		
		$scope.uploadFile = function (files) {
			var fd  = new FormData();
			fd.append('uploadfile', files[0]);
			$scope.pmSvc.uploadFile(fd).then(function(res) {
				$scope.photo.filepath = res.path;
			})
		}

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list';
		$scope.photo = photo;
		$scope.photos = photos;
		$scope.albums = albums;
		$scope.section = {'name': 'Photo', 'url':'/photos'};
	}
]);

photomgrControllers.controller('AlbumCtrl', ['$scope', 'PhotoMgrService', 'album', 'albums', 'photo', 'photos', '$location', 'view',
	function($scope, PhotoMgrService, album, albums, photo, photos, $location, view) {

		$scope.clickPhoto = function(id) {
			$scope.photo = $scope.pmSvc.getPhoto(id);
		}

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
		$scope.section = {'name': 'Album', 'url':'/albums'};

		if ($scope.photos.length > 0) {$scope.clickPhoto($scope.photos[0]._id);}		
	}
]);

photomgrControllers.controller('GalleryCtrl', ['$scope', 'photos', 'photo', 'album', 'albums', 'PhotoMgrService', 
	function($scope, photos, photo, album, albums, PhotoMgrService) {
		
		$scope.clickPhoto = function(id) {
			$scope.photo = $scope.pmSvc.getPhoto(id);
		}

		$scope.clickAlbum = function(id) {
			$scope.photo = $scope.pmSvc.getAlbum(id);
		}		

		$scope.pmSvc = PhotoMgrService;
		$scope.photos = photos;
		$scope.album = album;
		$scope.albums = albums;

	}
]);

//Pre-load Asynchronous data before route change 
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
		if ($location.path().indexOf('add') !== -1 ) {
			return '';
		} else {
			return $route.current.params.albumId ? Album.getPhotos({id: $route.current.params.albumId}).$promise : Photo.query().$promise;		
		}
	},

	view: function($location, $route) {
		return ($location.path().indexOf('add') !== -1 ) ? 'add' :  $route.current.params.view ;			
	},

	data: function() {

	}

};
