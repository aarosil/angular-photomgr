var photomgrApp = angular.module('photomgrApp', [
		'ngRoute',
		'ngCookies',
		'photomgrControllers',
		'photomgrServices',
		'photomgrDirectives',
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
				templateUrl: 'tpl/about.html',
				controller: 'LoginCtrl'
			}).	

			/** PHOTOS ****/
			when('/photos', {
				templateUrl: 'tpl/photos.html',
				controller: 'PhotoCtrl', 
				resolve: PhotoMgrData
			}).
			when('/photos/:view', {
				//templateUrl: 'tpl/photos.html',
				templateUrl: function(params){ 
					return (params.view === 'add') ? 'tpl/photo-detail.html': 'tpl/photos.html'
				},
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
		
			when('/albums/:view', {
				templateUrl: function(params){ 
					return (params.view === 'add') ? 'tpl/album-detail.html': 'tpl/albums.html'
				},
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

			/** LOGIN /USERPROFILE****/
			when('/login', {
				templateUrl: 'tpl/login.html', 
				controller: 'LoginCtrl'
			}).
			when('/register', {
				templateUrl: 'tpl/register.html', 
				controller: 'LoginCtrl'
			}).			
			when('/profile', {
				templateUrl: 'tpl/user-profile.html', 
				controller: 'ProfileCtrl'
			}).
			otherwise({
				redirectTo: '/'
			})
	}]);
