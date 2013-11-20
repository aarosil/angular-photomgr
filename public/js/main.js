var photomgrApp = angular.module('photomgrApp', [
		'ngRoute',
		'photomgrControllers',
		'photomgrServices'
	]);

photomgrApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'tpl/home.html',
				controller: 'HomeCtrl'
			}).
			when('/about', {
				templateUrl: 'tpl/about.html'
			}).	

			/** PHOTOS ****/
			when('/photos', {
				templateUrl: 'tpl/photos.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).
			when('/photos/add', {
				templateUrl: 'tpl/photos.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).			
			when('/photos/:photoId', {
				templateUrl: 'tpl/photos.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).

			/** ALBUMS ****/
			when('/albums', {
				templateUrl:'tpl/albums.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).
			when('/albums/add', {
				templateUrl: 'tpl/albums.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).
			when('/albums/:albumId', {
				templateUrl:'tpl/albums.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).

			/** GALLERY ****/
			when('/gallery', {
				templateUrl: 'tpl/gallery.html', 
				controller: 'GalleryCtrl', 
				resolve: PhotoMgrData
			}).
			when('/gallery/:albumId', {
				templateUrl: 'tpl/gallery.html', 
				controller: 'GalleryCtrl', 
				resolve: PhotoMgrData
			}).			
			otherwise({
				redirectTo: '/'
			})
	}]);
