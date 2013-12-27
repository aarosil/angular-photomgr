var photomgrApp = angular.module('photomgrApp', [
		'ngRoute',
		'photomgrControllers',
		'photomgrServices',
		'ui.sortable',
		'ui.bootstrap'
	]);

photomgrApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'tpl/home.html',
				controller: 'HomeCtrl',
				resolve: HomeData
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
				templateUrl: 'tpl/photo-detail.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).	
			when('/photos/:view', {
				templateUrl: 'tpl/photos.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).			
			when('/photos/:view/:photoId', {
				templateUrl: 'tpl/photo-detail.html',
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
				templateUrl:'tpl/album-detail.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).			
			when('/albums/:view', {
				templateUrl: 'tpl/albums.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).
			when('/albums/:view/:albumId', {
				templateUrl:'tpl/album-detail.html',
				controller: 'AlbumCtrl', 
				resolve: PhotoMgrData
			}).

			/** GALLERY ****/
			when('/gallery', {
				templateUrl: 'tpl/gallery.html', 
				controller: 'GalleryCtrl', 
				resolve: GalleryData
			}).

			when('/gallery/:albumId', {
				templateUrl: 'tpl/gallery.html', 
				controller: 'GalleryCtrl', 
				resolve: PhotoMgrData
			}).			
			/** LOGIN ****/
			when('/login', {
				templateUrl: 'tpl/login.html', 
				controller: 'LoginCtrl'
			}).
			otherwise({
				redirectTo: '/'
			})
	}]);
