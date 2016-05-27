

var demoMod = angular.module('demoApp', ['ui.bootstrap']);

demoMod.controller('demoCtrl', ['$scope','$http','$uibModal',
	function($scope, $http, $uibModal){

		// static values
		$scope.verticals = ['Commercial','Education','General','Government',
			'Healthcare','Public Safety','Transport','Various'];
		// pop-up settings
		$scope.popupDate = {
			opened: false
		};
		$scope.openDate = function() {
			$scope.popupDate.opened = true
		};
		$scope.dateOptions = {
			formatYear: 'yy',
			maxDate: new Date(),
			minDate: new Date(2015, 1, 1),
			startingDay: 1
			};
		$scope.altInputFormats = ['M!/d!/yyyy'];

		$http.defaults.headers.post["Content-Type"] = "application/json";

		// capitalizes first letter
		function toTitleCase(str){
			return str.replace(/\w\S*/g, 
				function(txt){
					return txt.charAt(0).toUpperCase() + txt.substr(1);
				});
		};

		// format date before sending to server
		function formatDate(dt){
			return dt.toISOString().slice(0, 10);
		};


		// data refresh
		var refresh = function(){
			$http.get('/demolist').success(function(response){
				console.log('controller rcv data with ' + 
					response.length + ' items');
				// hackish way to prevent modal hanging page :|
				$(".modal-backdrop").remove();
				$("body").attr("class","modal-close");
				$scope.demos = response;
				$scope.newdemo = null;
			});
		};

		// performs cleaning on demo
		var cleanDemo = function(demo){
			if(demo.hasOwnProperty('Creator')) {
				demo['Creator'] = toTitleCase(demo['Creator']);	
			};
			if(demo.hasOwnProperty('LastUpdated')) {
				demo['LastUpdated'] = formatDate(demo['LastUpdated']);
			}
			
			// check for array fields
			// if (!demo['AnalyticTechniques'] === Array) {
			// 	console.log('Type of Analytics is not an Array!');
			// };
			// if (!demo['Technology'] === Array) {
			// 	console.log('Technology is not an Array!');
			// };
			return demo;
		};

		$scope.addDemo = function(newdemo){
			console.log('adding');
			console.log(newdemo);
			newdemo = cleanDemo(newdemo);
			console.log(newdemo);
			$http.post('/demolist', newdemo).success(function(res){
				console.log('rcv from db:');
				console.log(res);
				refresh();
			});
		};

		$scope.editDemo = function(demo){
			console.log('editing');
			console.log(demo);
			// cleanDemo(demo);
			// alternative syntax for a http request
			$http({
				url:'/demolist/' + demo._id,
				method: 'PUT',
				data: demo
			}).success(function(res){
				console.log('rcv from db:');
				console.log(res);
			})
			// $scope.refresh();
		}

		$scope.removeDemo = function(demo){
			var winRemove = window.confirm(
				'Are you sure you want to remove use case ' + 
				demo['UseCase'] + '?');
			if (winRemove == true) {
				console.log('removing ' + demo._id);
				$http.delete('/demolist/' + demo._id);
				window.alert(demo['UseCase'] + ' removed!');
				refresh();
			}

		};

		// modal stuff
		$scope.openModal = function(){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/myModalContent.html',
				controller: 'modalCtrl',
				resolve: {
					verticals: function(){
						return $scope.verticals;
					}
				}
			});

			modalInstance.closed.then(function(data){
				console.log('closed modal');
			});

			modalInstance.result.then(function(data){
				console.log('closed modal with data');
				$scope.addDemo(data);
			});
		};


		refresh();


}]);


demoMod.controller('modalCtrl', 
	function($scope, $http, $uibModalInstance, verticals){

	$scope.verticals = verticals;

	$scope.addDemo = function(newdemo){
		$uibModalInstance.close(newdemo);
	};

	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});