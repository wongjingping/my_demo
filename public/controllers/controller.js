

var demoMod = angular.module('demoApp', ['ui.bootstrap','ngTagsInput']);

// main controller
demoMod.controller('demoCtrl', ['$scope','$http','$uibModal',
	function($scope, $http, $uibModal){

		// static values
		$http.defaults.headers.post["Content-Type"] = "application/json";


		// Helper Functions

		// copy an object (mainly for demo)
		var copyObject = function(obj){
			return JSON.parse(JSON.stringify(obj));
		};

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

		// convert array to tag inputs
		var array2TagInput = function(arr){
			for (var i = 0; i < arr.length; i++) {
				arr[i] = {"text":arr[i]};
			};
			return arr;
		};


		// data refresh
		var refresh = function(){
			$http.get('/demolist').success(function(res){
				console.log('refresh: controller rcv data with ' + 
					res.length + ' items');
				$scope.demos = res;
				$scope.newdemo = null;
			});
		};

		// performs cleaning on demo for saving to mongoDB
		var toMongoFields = function(demo){
			if(demo['Creator'] != null) {
				console.log('creator ' + demo['Creator']);
				demo['Creator'] = toTitleCase(demo['Creator']);	
			};
			if(demo['LastUpdated'] != null) {
				debugger;
				demo['LastUpdated'] = formatDate(demo['LastUpdated']);
			} else {
				demo['LastUpdated'] = '';
			};
			
			// check for array fields
			if(demo['AnalyticTechniques'] == null){
				demo['AnalyticTechniques'] = [];
			} else if (!demo['AnalyticTechniques'] === Array) {
				console.log('Type of Analytics is not an Array!');
			} else {
				demo['AnalyticTechniques'] = tagInput2Array(demo['AnalyticTechniques']);
			};
			if(demo['Technology'] == null){
				demo['Technology'] = [];
			} else if (!demo['Technology'] === Array) {
				console.log('Technology is not an Array!');
			} else {
				demo['Technology'] = tagInput2Array(demo['Technology']);
			};
			return demo;
		};

		// convert JSON data from mongoDB into field types
		var toModalFields = function(demo){
			// convert to date
			if(demo.hasOwnProperty('LastUpdated') && demo['LastUpdated'] != '') {
				demo['LastUpdated'] = new Date(demo['LastUpdated']);
			} else {
				demo['LastUpdated'] = null;
			};
			// check for array fields
			if(!demo.hasOwnProperty('AnalyticTechniques')){
				demo['AnalyticTechniques'] = [];
			} else if (!demo['AnalyticTechniques'] === Array) {
				console.log('Type of Analytics is not an Array!');
			} else {
				demo['AnalyticTechniques'] = array2TagInput(demo['AnalyticTechniques']);
			};
			if(!demo.hasOwnProperty('Technology')){
				demo['Technology'] = [];
			} else if (!demo['Technology'] === Array) {
				console.log('Technology is not an Array!');
			} else {
				demo['Technology'] = array2TagInput(demo['Technology']);
			};
			console.log('toModalFields');
			console.log(demo);
			return demo;
		}


		var addDemo = function(newdemo){
			console.log('adding');
			newdemo = toMongoFields(newdemo);
			$http.post('/demolist', newdemo).success(function(res){
				console.log('POST rcv from db:');
				console.log(res);
				refresh();
			});
		};

		var editDemo = function(demo){
			console.log('editing');
			demo = toMongoFields(demo);
			// swap the existing data in $scope with updated demo entry
			for (var i = 0; i < $scope.demos.length; i++) {
				if ($scope.demos[i]._id == demo._id) {
					console.log('matched id ' + demo._id);
					$scope.demos[i] = demo;
				};
			};
			// alternative syntax for a http request
			$http({
				url:'/demolist/' + demo._id,
				method: 'PUT',
				data: demo
			}).success(function(res){
				console.log('PUT rcv from db:');
				console.log(res);
			})
		}

		// open modal for adding a new entry
		$scope.openAddModal = function(){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/modal_fields.html',
				controller: 'modalCtrl',
				resolve: {
					operation: function(){
						return 'Add';
					},
					demo: function(){
						return null;
					}
				}
			});

			// refresh data whenever the modal is closed
			modalInstance.closed.then(function(data){
				console.log('add modal closed');
				refresh();
			});

			// add newdemo upon closing the modal and receiving the object
			modalInstance.result.then(function(newdemo){
				console.log('closed modal with newdemo');
				addDemo(newdemo);
			});
		};

		// open modal for editing an existing entry
		$scope.openEditModal = function(demo_i){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/modal_fields.html',
				controller: 'modalCtrl',
				resolve: {
					operation: function(){
						return 'Edit';
					},
					demo: function(){
						// copy demo to prevent 'live' updating in faded bg
						var demo = copyObject(demo_i);
						return toModalFields(demo);
					}
				}
			});

			// refresh data whenever the modal is closed
			modalInstance.closed.then(function(demo){
				console.log('edit modal closed');
				refresh();
			});

			// update demo upon closing the modal and receiving the object
			modalInstance.result.then(function(demo){
				console.log('closed modal with updated demo');
				editDemo(demo);
			});
		};

		// open modal for deleting an existing entry
		$scope.openRemoveModal = function(demo){
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/modal_confirm.html',
				controller: 'modalRemoveCtrl',
				resolve: {
					demo: function(){
						return demo;
					}
				}
			});

			// delete demo from view upon closing the modal and receiving the object
			modalInstance.result.then(function(id){
				console.log('closed modal and delete id ' + id);
				$http.delete('/demolist/' + id);
				// or replace with refresh?
				for (var i = 0; i < $scope.demos.length; i++) {
					if ($scope.demos[i]._id == id) {
						$scope.demos.splice(i, i+1);
						break;
					};
				};
			});
		};


		refresh();


}]);


// controller for add/edit modal
demoMod.controller('modalCtrl', 
	function($scope, $uibModalInstance, operation, demo){

	// static tags-input options
	$scope.verticals = ['Commercial','Education','General','Government',
	'Healthcare','Public Safety','Transport','Various'];
	$scope.technology = ["R","Python","Shiny","Tableau","TIBCO Spotfire",
	"Qlikview","SAS Visual Analytics","SAS Enterprise Miner",
	"Microstrategy","Gephi","Java","Matlab"]
	$scope.techniques = ["Predictive Analytics","Text Analytics",
	"Forecasting","Social Media Analytics","Optimization","Simulation",
	"CEP","Clustering","Association Rules Mining","Network Analytics"];

	// pass in demo details
	$scope.operation = operation
	$scope.demo = demo

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

	// close the modal and return demo object
	$scope.returnDemo = function(){
		$uibModalInstance.close($scope.demo);
	};

	// dismiss the modal without result
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});

// controller for confirming deletion
demoMod.controller('modalRemoveCtrl',
	function($scope, $uibModalInstance, demo){

	$scope.demo = demo;

	$scope.removeDemo = function(){
		$uibModalInstance.close($scope.demo._id);
	};

	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});