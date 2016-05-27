

var demoMod = angular.module('demoApp', ['ui.bootstrap','ngTagsInput']);

demoMod.controller('demoCtrl', ['$scope','$http','$uibModal',
	function($scope, $http, $uibModal){

		// static values
		$scope.verticals = ['Commercial','Education','General','Government',
			'Healthcare','Public Safety','Transport','Various'];


		$http.defaults.headers.post["Content-Type"] = "application/json";

		// capitalizes first letter
		var toTitleCase = function(str){
			return str.replace(/\w\S*/g, 
				function(txt){
					return txt.charAt(0).toUpperCase() + txt.substr(1);
				});
		};

		// format date before sending to server
		var formatDate = function(dt){
			return dt.toISOString().slice(0, 10);
		};

		// convert tag inputs into an array
		var tagInput2Array = function(tagInput){
			for (var i = 0; i < tagInput.length; i++) {
				tagInput[i] = toTitleCase(tagInput[i]['text']);
			};
			return tagInput;
		};


		// data refresh
		var refresh = function(){
			$http.get('/demolist').success(function(res){
				console.log('refresh: controller rcv data with ' + 
					res.length + ' items');
				$scope.demos = res;
				$scope.newdemo = null;
				// hackish way to prevent modal hanging page :|
				$(".modal-backdrop").remove();
				$("body").attr("class","modal-close");
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
			if(!demo.hasOwnProperty('AnalyticTechniques')){
				demo['AnalyticTechniques'] = [];
			} else if (!demo['AnalyticTechniques'] === Array) {
				console.log('Type of Analytics is not an Array!');
			} else {
				demo['AnalyticTechniques'] = tagInput2Array(demo['AnalyticTechniques']);
			};
			if(!demo.hasOwnProperty('Technology')){
				demo['Technology'] = [];
			} else if (!demo['Technology'] === Array) {
				console.log('Technology is not an Array!');
			} else {
				demo['Technology'] = tagInput2Array(demo['Technology']);
			};
			return demo;
		};

		$scope.addDemo = function(newdemo){
			console.log('adding');
			newdemo = cleanDemo(newdemo);
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
				templateUrl: 'views/modal.html',
				controller: 'modalCtrl',
				resolve: {
					verticals: function(){
						return $scope.verticals;
					}
				}
			});

			// refresh data whenever the modal is closed
			modalInstance.closed.then(function(data){
				refresh();
			});

			// add newdemo upon closing the modal and receiving the object
			modalInstance.result.then(function(newdemo){
				console.log('closed modal with newdemo');
				$scope.addDemo(newdemo);
			});
		};


		refresh();


}]);


// controller for modal
demoMod.controller('modalCtrl', 
	function($scope, $http, $uibModalInstance, verticals){

	// static values
	$scope.verticals = verticals;
	// tags-input options
	$scope.technology = ["R","Python","Shiny","Tableau","TIBCO Spotfire",
	"Qlikview","SAS Visual Analytics","SAS Enterprise Miner",
	"Microstrategy","Gephi","Java","Matlab"]
	$scope.techniques = ["Predictive Analytics","Text Analytics",
	"Forecasting","Social Media Analytics","Optimization","Simulation",
	"CEP","Clustering","Association Rules Mining","Network Analytics"];


	// datepicker pop-up settings
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

	// close the modal and return newdemo object
	$scope.addDemo = function(newdemo){
		$uibModalInstance.close(newdemo);
	};

	// dismiss the modal without result
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});