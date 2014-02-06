var photomgrControllers = angular.module('photomgrControllers', ['photomgrDirectives']);

photomgrControllers.controller('HomeCtrl', ['$scope', 'photos',
	function($scope, photos) {

		$scope.homeMsg = "PhotoManager lets you upload photos and create galleries of your favorite pics!";
		$scope.randomPhoto = window._.sample(photos);
	}
]);

photomgrControllers.controller('NavCtrl', ['$scope', '$location', 'Auth',
	function($scope, $location, Auth) {

		$scope.auth = Auth;
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


photomgrControllers.controller('PhotoCtrl', ['$scope', '$location', '$modal', 'PhotoMgrService', 'photos', 'photo', 'view',
	function($scope, $location, $modal, PhotoMgrService, photos, photo, view	) {

		$scope.uploadFile = function (files) {
			var fd  = new FormData();
			fd.append('uploadfile', files[0]);
			$scope.pmSvc.uploadFile(fd).then(function(res) {
				$scope.photo.filepath = res.path;
			});
		};

		$scope.savePhoto = function (photo) {
			$scope.pmSvc.savePhoto(photo).then( function(data) {
				$location.path('/photos/detail/'+data._id);
			});
		};

		$scope.deletePhoto = function(deletedPhoto, redirect) {
			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/deletePhotoModal.html',
				controller: 'deletePhotoModalCtrl',
				resolve: { photo: function(){return deletedPhoto} }
			});

			modalInstance.result.then(function () {		
				// Delete the photo and either update photo list or redirect to it
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
					albums: function () {return PhotoMgrService.getAllAlbums().$promise;},
					photos:{}
				}
			})

			modalInstance.result.then(function (album) {
				$scope.pmSvc.editAlbumPhotos('add',$scope.photo, album);
	            $scope.photo.albums.push(album); 
			}, function () {
				console.log('Modal dismissed');
			});

		};

		$scope.removePhotoFromAlbum = function(album) {
			$scope.pmSvc.editAlbumPhotos('remove',$scope.photo,album);
			//update display
			$scope.photo.albums.splice(window._.indexOf($scope.inAlbums, album), 1);
		}		

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //view = list if not set in route params
		$scope.photo = photo;
		$scope.photos = photos;
		$scope.pmSvc.filter = ''; //for search box in child subnav.html to find it 
		$scope.section = {'name': 'Photo', 'url':'/photos'}; //used in shared subnav.html
		
	}
]);

photomgrControllers.controller('AlbumCtrl', ['$location', '$scope', '$modal', 'PhotoMgrService', 'album', 'albums', 'view',
	function($location, $scope, $modal, PhotoMgrService, album, albums, view) {

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
				// Delete the album and either update album list or redirect to it
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
			$( ".photo-list-table").children('.sortable').each(function(index) {
				//get old item index
				var oldIndex = parseInt($(this).attr("data-ng-photo-order"), 10);
	            if ($scope.displayPhotos[oldIndex]) {
		            $scope.displayPhotos[oldIndex].order = index;
	        	} 
			});
			//reorder the album photos in the same order & save album
			$scope.pmSvc.getAlbum(album._id).$promise.then(function(album){
				album.photoList=[];
				window._.each($scope.displayPhotos, function(photo, index){
					album.photoList[index] = window._.pick(photo, '_id', 'order');
				})				
				$scope.pmSvc.saveAlbum(album);	
			});			
		};

		$scope.sortPhotos = { //used by sortable photo list element
			cancel: '.nonsortable',
			items: '.sortable',				
			stop: function() {reNumberPhotos()}
		}		

		$scope.addPhotoToAlbum = function() {
			var modalInstance = $modal.open({
				templateUrl: 'tpl/modal/selectPhotoModal.html',
				controller: 'modalInstanceCtrl',
				resolve: {
					photos: function () {return PhotoMgrService.getAllPhotos().$promise;},
					albums: {}
				}
			});			 
			modalInstance.result.then(function (addedPhoto) {
				$scope.pmSvc.editAlbumPhotos('add', addedPhoto, album)
					.$promise.then(function(data){
						$scope.displayPhotos.push(data.photo);
						$scope.displayPhoto = data.photo; 
					});
			}, function () {
				console.log('Modal dismissed');
			});

		};

		$scope.removePhotoFromAlbum = function(removedPhoto) {
			$scope.displayPhotos.splice(window._.indexOf($scope.displayPhotos, removedPhoto), 1);
			$scope.pmSvc.editAlbumPhotos('remove', removedPhoto, album);
		}

		$scope.pmSvc = PhotoMgrService;
		$scope.view = view ? view : 'list'; //if view not set in route params,view = list
		$scope.album = album;
		$scope.newAlbum = $scope.pmSvc.newAlbum()
		$scope.albums = albums;
		$scope.pmSvc.filter = '';
		$scope.section = {'name': 'Album', 'url':'/albums'}; //used in subnav.html

		if (view === 'detail') {
			console.log(album)
			$scope.displayPhotos = [];
			window._.each(album.photoList, function(entry){
				$scope.displayPhotos.push(entry._id);
			})
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
			$scope.prev = (index - 1) < 0 ? $scope.album.photoList.length - 1: index - 1;
			$scope.next = (index + 1) % $scope.album.photoList.length;
			$scope.photo = $scope.album.photoList[index];
		}

		$scope.clickAlbum = function(i) { 
			$scope.albums[i].opened = !$scope.albums[i].opened; 
			if ($scope.albums[i].opened) {
				$scope.album = $scope.albums[i]
				$scope.photo = $scope.album.photoList[0]
			}
		}

		$scope.albums = window._.where(albums, {enabled: true});

		if ($scope.albums.length > 0) {
			
			//load photo data into $scope.albums
			window._.each($scope.albums, function(album) {
				window._.each(album.photoList, function(entry) {
					window._.extend(entry, window._.findWhere(photos, {_id: entry._id}));	
				});			
			});

			$scope.album = $scope.albums[0];
			$scope.album.opened = true;
			$scope.photo  = $scope.album.photoList[0];
			$scope.prev = $scope.album.photoList.length - 1; 
			$scope.next = 1;

		}

	}
]);

photomgrControllers.controller('LoginCtrl', ['$scope', '$location', 'Auth', '$rootScope',
	function($scope, $location, Auth, $rootScope) {
		
		$scope.auth = Auth;

		$scope.login = function() {
			Auth.logIn($scope.user).then(function(data,status,header){
				Auth.isLoggedIn = true;
				Auth.user = data.data;
				$rootScope.$broadcast('logIn', Auth.user);
				$location.path('/profile');
			});
		};

        $scope.register = function () {

        };	    

	}
]);

photomgrControllers.controller('ProfileCtrl', ['$scope', 'Auth', 
	function($scope, Auth) {
		$scope.auth = Auth;
	}
]);

//To Pre-load Album & Photo data before route change 
PhotoMgrData = { 

	album: function(Album, $route) {
		return $route.current.params.albumId ? Album.get({id: $route.current.params.albumId}).$promise : new Album();
	},

	photo: function(Photo, $route) {
		return $route.current.params.photoId ? Photo.get({id: $route.current.params.photoId}).$promise : new Photo();
	},

	albums: function(Album, $route, $location) { //return all albums only if URL /albums/* but not /albums/add
		if (RegExp('\/albums').test($location.path()) && $route.current.params.view !== 'add') {
			return Album.query().$promise;
		} else {
			return [];	
		}
	},	

	photos: function(Photo, $route, $location) { //return all photos only if URL /photos/* but not /photos/add
		if (RegExp('\/photos').test($location.path()) && $route.current.params.view !== 'add') {
			return Photo.query().$promise;
		} else {
			return [];	
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

