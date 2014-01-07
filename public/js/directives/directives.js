var photomgrDirectives = angular.module('photomgrDirectives', []);

photomgrDirectives.directive('login', [ 'Auth', '$compile',
	function(Auth, $compile){
		return {
			
			restrict: 'A',
			//templateUrl: 'tpl/loginDirective.html',
			template: '',
			scope: {},

			controller: function($scope, $element, $attrs, $rootScope) {

		        $scope.auth = Auth;	

		        $scope.logout = function () {
		        	console.log("logout")
		        	Auth.logOut().then(function(data,status,header){
		        		$scope.auth.isLoggedIn = false;
		        		$scope.auth.user = {};
		        		$rootScope.$broadcast('logOut');
		        	});
		        };

		        $scope.$on('logOut', function(event){
		        	console.log("on logout")
		        	$scope.auth.isLoggedIn = false;
		        });

		        $scope.$on('logIn', function(event, user){
		        	console.log("on login")
		        	$scope.auth.isLoggedIn = true;	        	
		        });		        

			},

			//compile: function() {
			//},

			link: function(scope, element, attrs) {

				var welcomeUserTpl = '<li><a href="" data-ng-click="logout()">Logout</a></li>'
				var loginTpl = '<li><a href="#/login">Login</a></li>';

	        	var updateContent = function(loggedIn) {  
	        		console.log('update') 		
					var content = $compile(loggedIn ? welcomeUserTpl : loginTpl)(scope)
					element.replaceWith(content);			 
					element = content;       	
	        	}

		        scope.$watch('auth.isLoggedIn',
		        	function(newVal, oldVal) {
		        		if (newVal !== oldVal) {
		        			console.log("login status changed: "  + newVal);
		        			updateContent(newVal);
		        		}
		        	}
		        );

		        updateContent(scope.auth.isLoggedIn)

			},


		}

	}]);