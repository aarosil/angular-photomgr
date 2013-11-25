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
		};

		$scope.deletePhoto = function(photo) {
			$scope.pmSvc.deletePhoto(window._.findWhere($scope.photos, {_id: photo._id})).then( function(){
				$scope.photos.splice(window._.indexOf($scope.photos, photo), 1); //remove from list
			});
		};		

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //view = list if not set in route params
		$scope.photo = photo;
		$scope.photos = photos;
		$scope.albums = albums;
		$scope.pmSvc.filter = '';
		$scope.section = {'name': 'Photo', 'url':'/photos'}; //used in subnav.html
	}
]);

photomgrControllers.controller('AlbumCtrl', [ '$scope', 'PhotoMgrService', 'albums', 'photos', 'album', 'photo', 'view',
	function($scope, PhotoMgrService, albums, photos, album, photo, view) {

		$scope.clickPhoto = function(p) {
			$scope.photo = p;
		};

		$scope.clickEnabled = function(index) {
			$scope.albums[index].enabled = !$scope.albums[index].enabled;
			$scope.pmSvc.saveAlbum($scope.albums[index]);
		}

		$scope.setCoverPic = function(p) { //used by select to set photoId and path of the album's cover photo
			$scope.album.coverPicPath = p.filepath;
			$scope.album.coverPic = p._id;
		};

		$scope.saveAlbum = function (album) {
			$scope.pmSvc.saveAlbum(album).then( function(data) {
				console.log(data);
				$scope.albums.push(data); //add new album to list &  clear form
				$scope.newAlbum = $scope.pmSvc.newAlbum();				
			});
		};

		$scope.deleteAlbum = function(album) {
			$scope.pmSvc.deleteAlbum(window._.findWhere($scope.albums, {_id: album._id})).then( function(){
				$scope.albums.splice(window._.indexOf($scope.albums, album), 1); //remove from list
			});
		};

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //if view not set in route params,view = album-list
		$scope.album = album;
		$scope.photos = photos;
		$scope.newAlbum = $scope.pmSvc.newAlbum()
		$scope.albums = albums;
		$scope.pmSvc.filter = '';

		$scope.section = {'name': 'Album', 'url':'/albums'}; //used in subnav.html

		if ($scope.photos.length > 0) {$scope.clickPhoto($scope.photos[0]);}	
		$scope.coverPic = window._.findWhere(photos, {_id: $scope.album.coverPic});

		$( ".album-list-table" ).sortable({
			cancel: ".add-new-album",
			items: ".sortable"
		});

		$( ".album-list-table").on("sortupdate", function () {
	        $( ".album-list-table").children('.sortable').each(function(index) {
	            // get old item index
	            var oldIndex = parseInt($(this).attr("data-ng-album-order"), 10);
	            $scope.albums[oldIndex].order = index;
	            $scope.pmSvc.saveAlbum($scope.albums[oldIndex]);
        	});
		});
	}
]);

photomgrControllers.controller('GalleryCtrl', ['$scope', 'albums', 'photos',
	function($scope, albums, photos) {
		
		$scope.clickPhoto = function(albumID, index) {
			if (albumID !== $scope.album._id) {
				$scope.album = window._.findWhere(albums, {_id: albumID})
			}
			$scope.prev = (index - 1) < 0 ? $scope.album.photos.length - 1: index - 1;
			$scope.next = (index + 1) % $scope.album.photos.length;
			$scope.photo = $scope.album.photos[index];
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
		$scope.prev = $scope.album.photos.length - 1; 
		$scope.next = 1;

	}
]);

//To Pre-load Album & Photo data before route change 
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
