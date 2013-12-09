var photomgrControllers = angular.module('photomgrControllers', []);

photomgrControllers.controller('HomeCtrl', ['$scope', 'photos',
	function($scope, photos) {

		$scope.homeMsg = "PhotoManager lets you upload photos and create galleries of your favorite pics!";
		$scope.randomPhoto = window._.sample(photos);
	}
]);

photomgrControllers.controller('NavCtrl', ['$scope', '$location',
	function($scope, $location) {

        $scope.highlight = function (regexp) {
            return RegExp(regexp).test($location.path());
        };
	}
]);

photomgrControllers.controller('modalInstanceCtrl', ['$scope', '$modalInstance', 'photos', 'albums',
	function($scope, $modalInstance, photos, albums) {

		$scope.photos = photos;
		$scope.albums = albums;

		$scope.ok = function (result) {
			$modalInstance.close(result);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};		
	}
]);

photomgrControllers.controller('deleteAlbumModalCtrl', ['$scope', '$modalInstance', 'album',
	function($scope, $modalInstance, album) {

		$scope.album = album;

		$scope.ok = function (result) {
			$modalInstance.close(result);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};		
	}
]);

photomgrControllers.controller('deletePhotoModalCtrl', ['$scope', '$modalInstance', 'photo',
	function($scope, $modalInstance, photo) {

		$scope.photo = photo;

		$scope.ok = function (result) {
			$modalInstance.close(result);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};		
	}
]);


photomgrControllers.controller('PhotoCtrl', ['$scope', '$location', '$modal', 'Util', 'PhotoMgrService', 'albums', 'photos', 'photo', 'view',
	function($scope, $location, $modal, Util, PhotoMgrService, albums, photos, photo, view	) {

		$scope.uploadFile = function (files) {
			var fd  = new FormData();
			fd.append('uploadfile', files[0]);
			$scope.pmSvc.uploadFile(fd).then(function(res) {
				$scope.photo.filepath = res.path;
			});
		};

		$scope.deletePhoto = function(deletedPhoto, redirect) {
			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/deletePhotoModal.html',
				controller: 'deletePhotoModalCtrl',
				resolve: { photo: function(){return deletedPhoto} }
			});

			modalInstance.result.then(function () {
				//remove albumID from all associated photo documents
				Util.removePhotoReferences(deletedPhoto);				
				// then delete the photo and either update photo list or redirect to it
				$scope.pmSvc.deletePhoto(deletedPhoto).then( function(){
					if (redirect) {
						$location.path('/photos');
					} else {
						$scope.photos.splice(window._.indexOf($scope.photos, deletedPhoto), 1); //remove from list				
					}
				});	
			}, function () {
				console.log('Modal dismissed');
			});

		};				

		$scope.addPhotoToAlbum = function(photo, album) {
			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/selectAlbumModal.html',
				controller: 'modalInstanceCtrl',
				resolve: {
					albums: function () {
						return albums;
					},
					photos:{}
				}
			})

			modalInstance.result.then(function (album) {
				Util.addPhotoToAlbum(album,$scope.photo);
	            $scope.inAlbums.push(album); 
			}, function () {
				console.log('Modal dismissed');
			});

		};

		$scope.removePhotoFromAlbum = function(album) {
			Util.removePhotoFromAlbum(album,$scope.photo);
			//update display
			$scope.inAlbums.splice(window._.indexOf($scope.inAlbums, album), 1);
		}		

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //view = list if not set in route params
		$scope.photo = photo;
		$scope.albums = albums;		
		$scope.photos = photos;
		$scope.pmSvc.filter = ''; //for search box in child subnav.html to find it 
		$scope.section = {'name': 'Photo', 'url':'/photos'}; //used in shared subnav.html
		
		switch($scope.view) {
			case 'list':
				window._.each(photos, function(photo) {
					var names = [];
					window._.each(photo.albums, function(album) {
						var b = window._.findWhere(albums, {_id: album});
						names.push({_id: b._id, name: b.name});
					});
					photo.albumNames = names;
				});
			case 'detail':
				$scope.inAlbums = [];
				window._.each(photo.albums, function(album) {
					var a = window._.findWhere(albums, {_id: album})
					$scope.inAlbums.push(a);		
				});						
		}

	}
]);

photomgrControllers.controller('AlbumCtrl', ['$location', '$scope', '$modal', 'Util', 'PhotoMgrService', 'album', 'albums', 'photo', 'photos', 'view',
	function($location, $scope, $modal, Util, PhotoMgrService, album, albums, photo, photos, view) {

		$scope.clickPhoto = function(p) {
			$scope.displayPhoto = p;
		};

		$scope.setCoverPic = function(p) { //used by select to set photoId and path of the album's cover photo
			$scope.album.coverPicPath = p.filepath;
			$scope.album.coverPic = p._id;
		};

		$scope.clickEnabled = function(index) {  // when user clicks film icon in list view
			$scope.albums[index].enabled = !$scope.albums[index].enabled;
			$scope.pmSvc.saveAlbum($scope.albums[index]);
		}

		$scope.saveAlbum = function (album, redirect) {
			if (!album._id) { //album is new
				album.photos = [];
				album.order = albums.length;
			} 
			$scope.pmSvc.saveAlbum(album).then( function(data) {
				$scope.albums.push(data); //add new album to list &  clear form
				if (redirect) {
					$location.path('/albums/detail/'+data._id);
				} else {
					$scope.newAlbum = $scope.pmSvc.newAlbum();				
				}
			});
		};

		$scope.deleteAlbum = function(deletedAlbum, redirect) {

			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/deleteAlbumModal.html',
				controller: 'deleteAlbumModalCtrl',
				resolve: { album: function(){return deletedAlbum} }
			});

			modalInstance.result.then(function () {
				//remove albumID from all associated photo documents
				Util.removeAlbumReferences(deletedAlbum);				
				// then delete the album and either update album list or redirect to it
				$scope.pmSvc.deleteAlbum(deletedAlbum).then( function(){
					if (redirect) {
						$location.path('/albums');
					} else {
						$scope.albums.splice(window._.indexOf($scope.albums, deletedAlbum), 1); //remove from list
						reNumberAlbums();					
					}
				});	
			}, function () {
				console.log('Modal dismissed');
			});

		};

		var reNumberAlbums = function () {
			$( ".album-list-table").children('.sortable').each(function(index) {
	            // get old item index
	            var oldIndex = parseInt($(this).attr("data-ng-album-order"), 10);
	            if ($scope.albums[oldIndex]) {
	            	$scope.albums[oldIndex].order = index;
	            	$scope.pmSvc.saveAlbum($scope.albums[oldIndex]);
	            }
        	});		
		};

		$scope.sortAlbums = { //used by sortable album list element
			cancel: '.nonsortable',
			items: '.sortable',
			stop: function () {reNumberAlbums()}
		}			

		var reNumberPhotos = function() {
			//update display
			$( ".photo-list").children('.sortable').each(function(index) {
				//get old item index
				var oldIndex = parseInt($(this).attr("data-ng-photo-order"), 10);
	            if ($scope.displayPhotos[oldIndex]) {
		            $scope.displayPhotos[oldIndex].order = index;
	        	} 
			});
			//reorder the album photos in the same order & save album
			window._.each($scope.displayPhotos, function(photo, index){
				album.photos[index] = window._.pick(photo, '_id', 'order');
			})
			$scope.pmSvc.saveAlbum(album);
		};

		$scope.sortPhotos = { //used by sortable photo list element
			stop: function() {reNumberPhotos()}
		}		

		$scope.addPhotoToAlbum = function() {
			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/selectPhotoModal.html',
				controller: 'modalInstanceCtrl',
				resolve: {
					photos: function () {return PhotoMgrService.getAllPhotos();},
					albums: {}
				}
			});			 
			modalInstance.result.then(function (photo) {
				//update display and select the freshly added photo
				$scope.displayPhotos.push(photo);
				$scope.displayPhoto = photo; 
				Util.addPhotoToAlbum(album,photo)
			}, function () {
				console.log('Modal dismissed');
			});

		};

		$scope.removePhotoFromAlbum = function(removedPhoto) {
			$scope.displayPhotos.splice(window._.indexOf($scope.displayPhotos, removedPhoto), 1);
			Util.removePhotoFromAlbum(album,removedPhoto);
			updateAlbumPhotos();
		}

		var updateAlbumPhotos = function() { //reorder photos & save album when photo deleted
			var a = []
			window._.each($scope.displayPhotos, function(photo){
				a.push({order: photo.order, _id: photo._id})//recreate album.photos from displayPhotos 
			})
			album.photos = a;
			$scope.pmSvc.saveAlbum(album);

		}

		var extendAlbumPhotos = function() {
			var displayPhotos = []
			window._.each(album.photos, function(photo) {
				var p = window._.clone(photo)
				window._.extend(p, window._.findWhere(photos, {_id: photo._id}))
				displayPhotos.push(p)
			});
			$scope.displayPhotos = displayPhotos;
		}

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //if view not set in route params,view = list
		$scope.album = album;
		$scope.newAlbum = $scope.pmSvc.newAlbum()
		$scope.albums = albums;
		$scope.pmSvc.filter = '';
		$scope.section = {'name': 'Album', 'url':'/albums'}; //used in subnav.html

		
		if (view === 'detail') {
			//merge attributes from album.photos and photos into $scope.displayPhotos
			extendAlbumPhotos();
			if ($scope.displayPhotos.length > 0) {
				$scope.displayPhoto = $scope.displayPhotos[0];
				$scope.coverPic = window._.findWhere($scope.displayPhotos, {_id: album.coverPic})
			}
		};

	}
])

photomgrControllers.controller('GalleryCtrl', ['$scope', 'albums', 'photos',
	function($scope, albums, photos) {
		
		$scope.clickPhoto = function(albumID, index) {
			if (albumID !== $scope.album._id) {
				$scope.album = window._.findWhere($scope.albums, {_id: albumID})
			}
			$scope.prev = (index - 1) < 0 ? $scope.album.photos.length - 1: index - 1;
			$scope.next = (index + 1) % $scope.album.photos.length;
			$scope.photo = $scope.album.photos[index];
		}

		$scope.clickAlbum = function(i) { 
			$scope.albums[i].opened = !$scope.albums[i].opened; 
			if ($scope.albums[i].opened) {
				$scope.album = $scope.albums[i]
				$scope.photo = $scope.album.photos[0]
			}
		}

		$scope.albums = window._.where(albums, {enabled: true});
		//load photo data into $scope.albums
		window._.each($scope.albums, function(album) {
			window._.each(album.photos, function(photo) {
				window._.extend(photo, window._.findWhere(photos, {_id: photo._id}));	
			});			
		});

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
			return Photo.query().$promise;
		}
	},

	view: function($route) {
		return $route.current.params.view;
	}
};

//Preload all photos and albums 
GalleryData = {
	albums: function(Album) {
		return Album.query().$promise;
	},

	photos: function(Photo, $route) {
		return $route.current.params.albumId ? Album.getPhotos({id: $route.current.params.albumId}).$promise : Photo.query().$promise;
	}
};

//Pre load entire photo list; TODO: move random selection from HomeCtrl to backend 
HomeData = {
	photos: function(Photo) {
		return Photo.query().$promise;
	}
};
