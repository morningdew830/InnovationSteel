$(document).foundation();

var app = angular.module('steel', ['ui.router', 'firebase', 'ngAnimate', 'selector', 'simplePagination']);
var firebaseURL = 'https://innovationsteel.firebaseio.com/';

app.controller('main', function($scope, $firebaseArray, $firebaseObject, $firebaseAuth, $state, $timeout, $rootScope, $http, Pagination) {

	var firebase = new Firebase(firebaseURL);
	$scope.test = 'Angular is active';
	$scope.addItemToggle = false;
	$scope.costPerworkingHour = 0;

	$scope.contentLoaded = true;
	$scope.itemsLoaded = true;

	$scope.columnTotalWeight = 0;

	$scope.sizeGrid = [];
	$scope.sizeGrid[4.25] = 3;
	$scope.sizeGrid[4.5] = 4;
	$scope.sizeGrid[5.5] = 5;
	$scope.sizeGrid[8] = 6;
	$scope.sizeGrid[9] = 7;
	$scope.sizeGrid[10.5] = 8;

	$scope.showItemGroup = {};
	$scope.viewingPDF = false;

	$scope.pagination = Pagination.getNew(5);

	$scope.firebaseUser = $firebaseAuth(firebase).$getAuth();
	$firebaseAuth(firebase).$onAuth(function() {
		$scope.firebaseUser = $firebaseAuth(firebase).$getAuth();
	});

	$scope.$on('$viewContentLoaded', function(event){ 


		$scope.$state = $state;
		$scope.currentPage = $state.current.name;
		$scope.stateParams = $state.params;

		// ESTIMATES
		if($state.current.name == 'add') {
			// var createdEstimate = firebase.child('Estimates').push();
			// var createdEstimateID = $firebaseObject(createdEstimate).$id;
			// var estimateObject = {estimateID: createdEstimateID};
			// $state.go('edit.estimateID', estimateObject);
		}

		if($state.current.name == 'view-pdf.estimateID') {
			$scope.viewingPDF = true;
		} else {
			$scope.viewingPDF = false;
		}
		//Bind Data to Forms For Updating
		if($state.current.name == 'edit.estimateID' || $state.current.name == 'view-pdf.estimateID') {
		  var estimate = firebase.child('Estimates').child($state.params.estimateID);
		  var groups = firebase.child('Groups').orderByChild('estimateID').equalTo($state.params.estimateID);
		  $scope.initialGroupID = '';
		  $scope.groups = $firebaseArray(groups);
		  $scope.estimate = $firebaseObject(estimate);

		  groups.once('value', function(snap) {
		  	snap.forEach(function(group) {
		  		$scope.initialGroupID = group.key();
		  		if(!$scope.initialGroupID) {
		  			$scope.item.groupID = 'new group';
		  		}
		  		//$scope.item.groupID=group.key();
		  		return true;
		  	});
		  });

		  if($state.current.name == 'view-pdf.estimateID') {
		  	$scope.hideSidebar = true;
		  } else {
		  	$scope.hideSidebar = false;
		  }

		} else {
		  // $scope.estimate = {};
		}
		if($state.current.name == 'estimates' || $state.current.name == 'logs') {
			var estimates = firebase.child('Estimates');
			$scope.estimates = $firebaseArray(estimates);
		}
		if($state.current.name == 'edit.estimateID'){
			var itemGroupsRef = firebase.child('Item Groups');
			var itemQuery = itemGroupsRef.orderByChild('estimateID').equalTo($state.params.estimateID);
			$scope.itemGroups = $firebaseArray(itemQuery);
			$scope.itemGroups.$loaded().then(function(){
		    	console.log($scope.itemGroups.length);    
		    	$scope.pagination.numPages = Math.ceil($scope.itemGroups.length/$scope.pagination.perPage);
		    });
			// $scope.pagination.numPages = Math.ceil($scope.itemGroups.length/$scope.pagination.perPage);
			// console.log($scope.itemGroups.length, $scope.pagination.perPage);
		}
		// PRESET USER VALUES
		if($scope.firebaseUser) {
			$scope.contentLoaded = false;

			// ALL COMPANY USER IS ASSIGNED TO WITH ROLE OF ADMIN
			var companyAssignments = firebase.child('CompanyAssignments').orderByChild('userID').equalTo($scope.firebaseUser.uid);
			$scope.companyAssignments = [];
			$scope.employees = $firebaseArray(firebase.child('Employees'));
			companyAssignments.on('value', function(snap){
				snap.forEach(function(assignment) {
					if(assignment.val().role == 'Admin') {
						$scope.companyAssignments.push(assignment.val().companyID);
					}
				});
			});
			$scope.companies = $firebaseArray(firebase.child('Companies'));

			var user = firebase.child('Users').orderByChild('userID').equalTo($scope.firebaseUser.uid);
			$scope.userObject = $firebaseArray(user);

			var usersRef = firebase.child('Users');
			$scope.users = $firebaseArray(usersRef);

			user.on('value', function(snap) {
				snap.forEach(function(userValue) {
					$scope.user = userValue.val();
					$scope.userID = userValue.key();
					var userID = $scope.userID;
					$scope.userKey = userValue.key();
					$scope.contentLoaded = true;

					// DEFAULT VALUES HOLD TO LAST VALUES
					// $scope.estimate.companyID = $scope.user.estimateCompanyID;
					// $scope.item.difficulty = $scope.user.itemDifficulty;
					// $scope.item.SACGroup = $scope.user.itemSACGroup;
					// $scope.item.SAC = $scope.user.itemSAC;
					// $scope.item.groupID = $scope.user.itemGroupID;
					// $scope.entry.group = $scope.user.itemGroupID;
					// $scope.entry.SACCode = $scope.user.itemSAC;
				});
			});
			

		} else {
			$scope.contentLoaded = true;
			// $state.go('login');
		}
		if($state.current.name == 'view.estimateID' || $state.current.name == 'view-pdf.estimateID' || $state.current.name == 'edit.estimateID' || $state.current.name == 'daily-log.estimateID' || $state.current.name == 'progress.estimateID') {
			var estimate = firebase.child('Estimates').child($state.params.estimateID);
			// $scope.estimate = $firebaseObject(estimate);
			$scope.groups = $firebaseArray(firebase.child('Groups').orderByChild('estimateID').equalTo($state.params.estimateID));
			var items = firebase.child('Items').orderByChild('estimateID').equalTo($state.params.estimateID);
			$scope.items = $firebaseArray(items);
		}
		if($state.current.name == 'daily-log.estimateID' || $state.current.name == 'progress.estimateID') {
			$scope.entries = $firebaseArray(firebase.child('Entries').orderByChild('estimateID').equalTo($state.params.estimateID));
			$scope.rates = $firebaseArray(firebase.child('Rates').orderByChild('estimateID').equalTo($state.params.estimateID));
		}
		if($state.current.name == 'employees') {
			$scope.checkEstimates = firebase.child('Estimates');
			$scope.checkRates = firebase.child('JobAssignments');
			$scope.rates = $firebaseArray(firebase.child('JobAssignments'));
			$scope.checkEntries = firebase.child('Entries');
			$scope.checkItems = firebase.child('Items');
		}
		$scope.deleteEstimate = function(estimateID) {
			var estimate = firebase.child('Estimates').child(estimateID);
			estimate.remove();
		}
	});

	$scope.standard = {};
	$scope.lap = {};
	$scope.column = {};
	$scope.vary = {};

	$scope.reset = function() {
		$scope.mesh = {};
		$scope.lap = {};
		$scope.column = {};
		$scope.vary = {};
		$scope.slab = {};
		$scope.circular = {};
		$scope.beam = {};
		$scope.standard = {};
	}

	$scope.setJobDefaults = function(estimate) {
		$scope.standard.size = estimate.size;
		$scope.standard.grade = estimate.gradeDefault;
		$scope.standard.waste = estimate.waste;

		if(estimate[estimate.size] == undefined) {
			estimate[estimate.size] = {};
		}

		$scope.circular.size = estimate.size;
		$scope.circular.grade = estimate.gradeDefault;
		$scope.circular.waste = estimate.waste;
		$scope.circular.spacingFT = estimate.spacing;
		$scope.circular.spacingIN = estimate.spacinginches;
		$scope.circular.stocklength = estimate.stocklength;
		$scope.circular.stocklengthinches = estimate.stocklengthinches;
		$scope.circular.diameterOver = estimate.diameterOver;
		$scope.circular.diameterOverInches = estimate.diameterOverInches;
		if(estimate[estimate.size] != undefined) {
			$scope.circular.diameter = estimate[estimate.size].diameter;
			$scope.circular.laplength = estimate[estimate.size].laplength;
		}

		$scope.vary.size = estimate.size;
		$scope.vary.grade = estimate.gradeDefault;
		$scope.vary.waste = estimate.waste;
		$scope.vary.spacing = estimate.spacing;
		$scope.vary.spacinginches = estimate.spacinginches;
		$scope.vary.stock = estimate.stocklength;
		$scope.vary.stockinches = estimate.stocklengthinches;
		$scope.vary.stocklength = estimate.stocklength;
		$scope.vary.stocklengthinches = estimate.stocklengthinches;
		$scope.vary.diameterOver = estimate.diameterOver;
		$scope.vary.diameterOverInches = estimate.diameterOverInches;
		$scope.vary.clearance = estimate.clearance;
		$scope.vary.clearanceinches = estimate.clearanceInches;
		if(estimate[estimate.size]) {
			$scope.vary.diameter = estimate[estimate.size].diameter;
			$scope.vary.laplength = estimate[estimate.size].laplength;
		}

		$scope.column.size = estimate.size;
		$scope.column.grade = estimate.gradeDefault;
		$scope.column.waste = estimate.waste;
		$scope.column.spacingFT = estimate.spacing;
		$scope.column.spacingIN = estimate.spacinginches;
		$scope.column.stocklength = estimate.stocklength;
		$scope.column.stocklengthinches = estimate.stocklengthinches;
		$scope.column.diameterOver = estimate.diameterOver;
		$scope.column.diameterOverInches = estimate.diameterOverInches;
		if(estimate[estimate.size]) {
			$scope.column.diameter = estimate[estimate.size].diameter;
			$scope.column.laplength = estimate[estimate.size].laplength;
		}
		$scope.column.tieLength = estimate.clearance;
		$scope.column.tieLengthInches = estimate.clearanceInches;
		$scope.column.circularTie.size = estimate.size;
		if(estimate[estimate.size]) {
			$scope.column.circularTie.diameter = estimate[estimate.size].diameter;
			$scope.column.circularTie.laplength = estimate[estimate.size].laplength;
		}
		$scope.column.interiorTieSize = estimate.interiorTieSize;
		$scope.column.interiorTieGrade = estimate.interiorTieGrade;
		$scope.column.exteriorTieSize = estimate.exteriorTieSize;
		$scope.column.exteriorTieGrade = estimate.exteriorTieGrade;

		$scope.lap.size = estimate.size;
		$scope.lap.grade = estimate.gradeDefault;
		$scope.lap.stocklength = estimate.stocklength;
		$scope.lap.stocklengthinches = estimate.stocklengthinches;
		if(estimate[estimate.size]) {
			$scope.lap.diameter = estimate[estimate.size].diameter;
			$scope.lap.laplength = estimate[estimate.size].laplength;
		}
		$scope.lap.diameterOver = estimate.diameterOver;
		$scope.lap.diameterOverInches = estimate.diameterOverInches;

		$scope.slab.size = estimate.size;
		$scope.slab.stocklength = estimate.stocklength;
		$scope.slab.stocklengthinches = estimate.stocklengthinches;
		if(estimate[estimate.size]) {
			$scope.slab.diameter = estimate[estimate.size].diameter;
			$scope.slab.laplength = estimate[estimate.size].laplength;
		}
		$scope.slab.spacing = estimate.spacing;
		$scope.slab.spacinginches = estimate.spacinginches;
		$scope.slab.diameterOver = estimate.diameterOver;
		$scope.slab.diameterOverInches = estimate.diameterOverInches;
		$scope.slab.grade = estimate.gradeDefault;
		$scope.slab.group2.size = estimate.size;
		$scope.slab.group2.stocklength = estimate.stocklength;
		$scope.slab.group2.stocklengthinches = estimate.stocklengthinches;
		if(estimate[estimate.size]) {
			$scope.slab.group2.diameter = estimate[estimate.size].diameter;
			$scope.slab.group2.laplength = estimate[estimate.size].laplength;
		}
		$scope.slab.group2.spacing = estimate.spacing;
		$scope.slab.group2.spacinginches = estimate.spacinginches;
		$scope.slab.group2.diameterOver = estimate.diameterOver;
		$scope.slab.group2.diameterOverInches = estimate.diameterOverInches;
		$scope.slab.group2.grade = estimate.gradeDefault;

		$scope.beam.tieLength = estimate.clearance;
		$scope.beam.tieLengthInches = estimate.clearanceInches;
		$scope.beam.size = estimate.size;
		$scope.beam.grade = estimate.gradeDefault;
		$scope.beam.stocklength = estimate.stocklength;
		$scope.beam.stocklengthinches = estimate.stocklengthinches;
		$scope.beam.interiorTieSize = estimate.interiorTieSize;
		$scope.beam.interiorTieGrade = estimate.interiorTieGrade;
		$scope.beam.exteriorTieSize = estimate.exteriorTieSize;
		$scope.beam.exteriorTieGrade = estimate.exteriorTieGrade;

		$scope.beam.topBar.stocklength = estimate.stocklength;
		$scope.beam.topBar.stocklengthinches = estimate.stocklengthinches;
		$scope.beam.topBar.diameterOver = estimate.diameterOver;
		$scope.beam.topBar.diameterOverInches = estimate.diameterOverInches;
		$scope.beam.topBar.size = estimate.size;
		if(estimate[estimate.size]) {
			$scope.beam.topBar.diameter = estimate[estimate.size].diameter;
			$scope.beam.topBar.laplength = estimate[estimate.size].diameter;
		}

		$scope.beam.midBar.stocklength = estimate.stocklength;
		$scope.beam.midBar.stocklengthinches = estimate.stocklengthinches;
		$scope.beam.midBar.diameterOver = estimate.diameterOver;
		$scope.beam.midBar.diameterOverInches = estimate.diameterOverInches;
		$scope.beam.midBar.size = estimate.size;
		if(estimate[estimate.size]) {
			$scope.beam.midBar.diameter = estimate[estimate.size].diameter;
			$scope.beam.midBar.laplength = estimate[estimate.size].diameter;
		}

		$scope.beam.bottomBar.stocklength = estimate.stocklength;
		$scope.beam.bottomBar.stocklengthinches = estimate.stocklengthinches;
		$scope.beam.bottomBar.diameterOver = estimate.diameterOver;
		$scope.beam.bottomBar.diameterOverInches = estimate.diameterOverInches;
		$scope.beam.bottomBar.size = estimate.size;
		if(estimate[estimate.size]) {
			$scope.beam.bottomBar.diameter = estimate[estimate.size].diameter;
			$scope.beam.bottomBar.laplength = estimate[estimate.size].diameter;
		}
	}
	$scope.setLaps = function(estimate) {
		$scope.lap.diameter = estimate[$scope.lap.size].diameter;
		$scope.lap.laplength = estimate[$scope.lap.size].laplength;
		$scope.lap.diameterOver = estimate.diameterOver;
		$scope.lap.diameterOverInches = estimate.diameterOverInches;

		$scope.slab.diameter = estimate[$scope.slab.size].diameter;
		$scope.slab.laplength = estimate[$scope.slab.size].laplength;

		$scope.circular.diameter = estimate[$scope.circular.size].diameter;
		$scope.circular.laplength = estimate[$scope.circular.size].laplength;
		$scope.circular.diameterOver = estimate.diameterOver;
		$scope.circular.diameterOverInches = estimate.diameterOverInches;

		$scope.column.diameter = estimate[$scope.column.size].diameter;
		$scope.column.laplength = estimate[$scope.column.size].laplength;
		$scope.column.circularTie.diameter = estimate[$scope.column.circularTie.size].diameter;
		$scope.column.circularTie.laplength = estimate[$scope.column.circularTie.size].laplength;
		$scope.column.diameterOver = estimate.diameterOver;
		$scope.column.diameterOverInches = estimate.diameterOverInches;

		$scope.vary.diameter = estimate[$scope.vary.size].diameter;
		$scope.vary.laplength = estimate[$scope.vary.size].laplength;

		$scope.slab.group2.diameter = estimate[$scope.slab.group2.size].diameter;
		$scope.slab.group2.laplength = estimate[$scope.slab.group2.size].laplength;
		$scope.slab.diameterOver = estimate.diameterOver;
		$scope.slab.diameterOverInches = estimate.diameterOverInches;
		$scope.slab.group2.diameterOver = estimate.diameterOver;
		$scope.slab.group2.diameterOverInches = estimate.diameterOverInches;

		$scope.beam.topBar.diameter = estimate[$scope.beam.topBar.size].diameter;
		$scope.beam.topBar.laplength = estimate[$scope.beam.topBar.size].laplength;
		$scope.beam.midBar.diameter = estimate[$scope.beam.midBar.size].diameter;
		$scope.beam.midBar.laplength = estimate[$scope.beam.midBar.size].laplength;
		$scope.beam.bottomBar.diameter = estimate[$scope.beam.bottomBar.size].diameter;
		$scope.beam.bottomBar.laplength = estimate[$scope.beam.bottomBar.size].laplength;

		$scope.beam.topBar.diameterOver = estimate.diameterOver;
		$scope.beam.topBar.diameterOverInches = estimate.diameterOverInches;
		$scope.beam.midBar.diameterOver = estimate.diameterOver;
		$scope.beam.midBar.diameterOverInches = estimate.diameterOverInches;
		$scope.beam.bottomBar.diameterOver = estimate.diameterOver;
		$scope.beam.bottomBar.diameterOverInches = estimate.diameterOverInches;
	}

	var estimatesRef = firebase.child('Estimates');
	$scope.estimates = $firebaseArray(estimatesRef);

	// $scope.estimate = {};
	$scope.company = {};
	$scope.addEstimate = function(estimate) {
		estimate.number = $scope.estimateNumber();
		estimate.date = $scope.currentDate();
		estimate.priority = -100;
		estimate.materialCost = 0.30;
		estimate.fabricationCost = 0.03;
		estimate.markupCost = 15;  // %
		estimate.userID = $scope.userKey;

		// if Creating a Company
		if($scope.company.name) {
			var createdCompany = firebase.child('Companies').push($scope.company);
			var createdCompanyID = $firebaseObject(createdCompany).$id;
			estimate.companyID = createdCompanyID;
			var companyAssignmentsRef = firebase.child('CompanyAssignments').push({
				companyID: createdCompanyID,
				role: 'Admin',
				userID: $scope.firebaseUser.uid
			})
		}

		var createdEstimate = firebase.child('Estimates').push(estimate);
		var createdEstimateID = $firebaseObject(createdEstimate).$id;
		var estimateObject = {estimateID: createdEstimateID};

		// CREATE THE FIRST GROUP
		var Groups = firebase.child('Groups');
		var newGroup = {};
		newGroup.estimateID = createdEstimateID;
		newGroup.title="Area 1";
		if(estimate.firstGroup) {
			newGroup.title = estimate.firstGroup;
		}
		var createdGroup = Groups.push(newGroup);
		var createdGroupID = $firebaseObject(createdGroup).$id;

		// SET THE DEFAULT GROUP TO THAT
		var user=firebase.child('Users').child($scope.userID);
		user.update({groupID:createdGroupID});

		$state.go('edit.estimateID', estimateObject);
	}

	$scope.companyName = function(companyID){
		if(companyID) {
			var company = firebase.child('Companies').child(companyID);
			var companyName = '';
			company.on('value', function(snap){
				if(snap.val()){
					companyName = snap.val().name;
				}
			});
		}
		return companyName;
	}

	$scope.employee = {};
	$scope.addEmployee = function() {
		$scope.employee.companyID = 1;
		var employeeAdded = firebase.child('Employees').push($scope.employee);
		var employeeAddedID = $firebaseObject(employeeAdded).$id;
		$scope.employee = {};
		$scope.setEmployeeCompany(employeeAddedID, $scope.user.companyBrowsing);
	}

	var SACRatesRef = firebase.child('SACRates');
	$scope.SACRates = $firebaseArray(SACRatesRef);

	$scope.setSACRateDefaults = function() {
		var userRates = SACRatesRef.child($scope.userID).child('rates');
		for(i=0; i<$scope.SACCodes.length; i++) {
			userRates.child(1).child($scope.SACCodes[i].code).set($scope.SACCodes[i].one);
			userRates.child(2).child($scope.SACCodes[i].code).set($scope.SACCodes[i].two);
			userRates.child(3).child($scope.SACCodes[i].code).set($scope.SACCodes[i].three);
		}
	}

	$scope.numSections = [];
	$scope.numSections.push('item');
	$scope.addColumnSection = function() {
		$scope.numSections.push('item');
	}
	$scope.numColumnBars = [];
	$scope.setColumnBars = function(amount) {
		$scope.numColumnBars = [];
		for(i=0; i<amount; i++){ 
			$scope.numColumnBars.push('item');
		}
	}
	$scope.numColumnSegments = [];
	$scope.setColumnSegments = function(amount) {
		// $scope.numColumnSegments = [];
		// for(i=0; i<amount; i++) {
		// 	$scope.numColumnSegments.push('item');
		// }
		if($scope.column.type!='Circular') {
			for(i=0; i<$scope.numColumnBars.length; i++) {
				$scope.column.bar[i].segments = amount;
			}
		}
	}
	$scope.range = function(count){

	  var items = []; 

	  for (var i = 0; i < count; i++) { 
	    items.push(i) 
	  } 

	  return items;
	}
	$scope.calculateBarLength = function(bar, numSegments) {
		$timeout(function() {
			bar.totalLength = 0;
			for(i=0; i<numSegments; i++) {
				if(bar[i]) {
					bar.totalLength += $scope.convertToInches(bar[i].ft, bar[i].inches);
					bar.totalLengthft = Math.floor(bar.totalLength / 12);
					bar.totalLengthin = getInchesExact(bar.totalLength);
				}
			}
		});
	}
	$scope.removeColumnSection = function(section) {
		$scope.numSections.splice(section, 1);
	}
	$scope.removeAllColumnSections = function() {
		$scope.numSections = [];
	}

	$scope.removeItems = function(itemGroup) {
		
		var items = firebase.child('Items');
		items.once('value', function(snap) {
			snap.forEach(function(item) {
				if(item.val().group == itemGroup.$id) {
					firebase.child('Items').child(item.key()).remove();
					$timeout(function() {
						$scope.reinit();
						
					});
				}
			});
		});
		setTimeout(function() {
	    	 //this triggers a $digest

	    	var itemGroupsRef = firebase.child('Item Groups');
			var itemQuery = itemGroupsRef.orderByChild('estimateID').equalTo($state.params.estimateID);
			$scope.itemGroups = $firebaseArray(itemQuery);
			$scope.itemGroups.$loaded().then(function(){
		    	console.log($scope.itemGroups.length);    
		    	$scope.pagination.numPages = Math.ceil($scope.itemGroups.length/$scope.pagination.perPage);
		    });
		    $scope.pagination = Pagination.getNew(5);
		    $scope.$apply();
	  		console.log("apply");
	  }, 500);
	}

	$scope.setAdder = function(adder) {
		firebase.child('Users').child($scope.userID).update({'adder':adder});
		$scope.setShapeFields();
		$scope.setBeamShapeFields();

		$scope.scrollToTool();
	}
	$scope.setQuickAdd = function(set) {
		firebase.child('Users').child($scope.userID).update({'quickAdd':set});
	}
	$scope.setItemCalculationAssistant = function(set) {
		firebase.child('Users').child($scope.userID).update({'calculationAssistant':set});
	}
	$scope.setEmployeeTab = function(tab) {
		firebase.child('Users').child($scope.userID).update({'employeeTab':tab});
	}
	$scope.setCompanyBrowsing = function(id) {
		firebase.child('Users').child($scope.userID).update({'companyBrowsing':id});
	}
	$scope.setEstimateCompanyID = function(id) {
		firebase.child('Users').child($scope.userID).update({'estimateCompanyID':id});
	}
	$scope.setItemDifficulty = function(item) {
		firebase.child('Users').child($scope.userID).update({'itemDifficulty':item});
	}
	$scope.setSACGroup = function(item) {
		firebase.child('Users').child($scope.userID).update({'itemSACGroup':item});
	}
	$scope.setItemSAC = function(item) {
		firebase.child('Users').child($scope.userID).update({'itemSAC':item});
	}
	$scope.setItemGroupID = function(item) {
		if(item != 'new group') {
			firebase.child('Users').child($scope.userID).update({'itemGroupID':item});
		}
	}
	$scope.editItemGroup = function(itemGroup) {
		// var items = firebase.child('Items');
		var items = firebase.child('Items').orderByChild('group').equalTo(parseFloat(itemGroup.$id));
		items.on('value', function(snap) {
		});
		items.on('value', function(snap) {
			snap.forEach(function(item) {
				if(itemGroup.tool == 'Standard') {
					$scope.standard = item.val();
					$scope.setAdder('standard');
				}
				if(itemGroup.tool == 'Lap') {
					$scope.lap = item.val();
					$scope.lap.multiplier = itemGroup.multiplier;
					$scope.lap.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('lap');
				}
				if(itemGroup.tool == 'Slab') {
					$scope.slab = item.val();
					$scope.slab.multiplier = itemGroup.multiplier;
					$scope.slab.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('slab');
				}
				if(itemGroup.tool == 'Circular') {
					$scope.circular = item.val();
					$scope.circular.multiplier = itemGroup.multiplier;
					$scope.circular.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('circular');
				}
				if(itemGroup.tool == 'Column') {
					$scope.column = item.val();
					$scope.column.size = item.val().originalSize;
					$scope.column.grade = item.val().originalGrade;
					$scope.column.multiplier = itemGroup.multiplier;
					$scope.column.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('column');
					$scope.setColumnBars($scope.column.numBars);
					$scope.column.customBar = item.val().customBar;
					$scope.column.bar = item.val().bar;
				}
				if(itemGroup.tool == 'Beam') {
					$scope.beam = item.val();
					$scope.beam.size = item.val().originalSize;
					$scope.beam.grade = item.val().originalGrade;
					$scope.beam.multiplier = itemGroup.multiplier;
					$scope.beam.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('beam');
					$scope.setColumnBars($scope.beam.numBars);
					$scope.beam.customBar = item.val().customBar;
					$scope.beam.bar = item.val().bar;
				}
				if(itemGroup.tool == 'Vary') {
					$scope.vary = item.val();
					$scope.vary.multiplier = itemGroup.multiplier;
					$scope.vary.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('vary');
				}
				if(itemGroup.tool == 'Mesh') {
					$scope.mesh = item.val();
					$scope.mesh.multiplier = itemGroup.multiplier;
					$scope.mesh.multiplier2 = itemGroup.multiplier2;
					$scope.setAdder('mesh');
				}
			});
		});
	}

	$scope.flashMessage = function(message, time) {
		if(!time) {
			time = 1000;
		}

		$rootScope.message = message;
		$rootScope.mouseX = '0px';
		$rootScope.mouseY = '91%';
		$rootScope.flashMessageWidth = '100%';
		$rootScope.flashMessageSize = '45';


		$timeout(function() {
			$rootScope.message = null;
		}, time);
	}
	$scope.globalMessage = function(message, time) {
		if(!time) {
			time = 1000;
		}

		$rootScope.message = message;
		$rootScope.mouseX = '0px';
		$rootScope.mouseY = '91%';
		$rootScope.flashMessageWidth = '100%';
		$rootScope.flashMessageSize = '45';

		$scope.$apply();
		$rootScope.$apply();


		$timeout(function() {
			$rootScope.message = null;
			$scope.$apply();
			$rootScope.$apply();
		}, time);
	}

	$scope.scrollToTool = function() {
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 300);
	}

	$scope.setEmployeeCompany = function(employeeID, companyID) {
		// Remove assignment if it exists otherwise add it in
		if(!$scope.isInCompany(employeeID, companyID)) {
			firebase.child('EmployeeAssignments').push({
				employeeID: employeeID,
				companyID: companyID
			});
		} else {
			var employeeAssignments = firebase.child('EmployeeAssignments').orderByChild('employeeID').equalTo(employeeID);
			var key = '';
			employeeAssignments.on('value', function(snap) {
				snap.forEach(function(assignment) {
					if(assignment.val().companyID == companyID) {
						key = assignment.key();
					}
				});
			});
			firebase.child('EmployeeAssignments').child(key).remove();
		}
	}
	$scope.isInCompany = function(employeeID, companyID) {
		var isInCompany = false;
		var employeeAssignments = firebase.child('EmployeeAssignments').orderByChild('employeeID').equalTo(employeeID);
		if(employeeAssignments) {
			employeeAssignments.on('value', function(snap) {
				snap.forEach(function(assignment) {
					if(assignment.val().companyID == companyID) {
						isInCompany = true;
					}
				});
			});
		}
		return isInCompany;
	}
	$scope.jobInCompany = function(estimateID, companyID) {
		var jobInCompany = false;
		var estimates = firebase.child('Estimates').child(estimateID);
		estimates.on('value', function(snap) {
			if(snap.val().companyID == companyID) {
				jobInCompany = true;
			}
		});
		return jobInCompany;
	}
	$scope.setEmployeeJob = function(employeeID, estimateID) {
		if(!$scope.isInJob(employeeID, estimateID)) {
			firebase.child('JobAssignments').push({
				employeeID: employeeID,
				estimateID: estimateID
			});
		} else {
			var JobAssignments = firebase.child('JobAssignments').orderByChild('employeeID').equalTo(employeeID);
			var key = '';
			JobAssignments.on('value', function(snap) {
				snap.forEach(function(assignment) {
					if(assignment.val().estimateID == estimateID) {
						key = assignment.key();
					}
				});
			});
			firebase.child('JobAssignments').child(key).remove();
		}
	}
	$scope.setJobRate = function(employeeID, estimateID, rate) {
		var JobAssignments = firebase.child('JobAssignments').orderByChild('employeeID').equalTo(employeeID);
		var key = '';
		JobAssignments.on('value', function(snap) {
			snap.forEach(function(assignment) {
				if(assignment.val().estimateID == estimateID) {
					key = assignment.key();
				}
			});
		});
		var JobAssignment = firebase.child('JobAssignments').child(key);
		JobAssignment.update({Rate:rate})
	}
	$scope.getJobRate = function(employeeID, estimateID) {
		var rate = null;
		var JobAssignments = firebase.child('JobAssignments').orderByChild('employeeID').equalTo(employeeID);
		JobAssignments.on('value', function(snap) {
			snap.forEach(function(assignment) {
				if(assignment.val().estimateID == estimateID) {
					rate = assignment.val().Rate;
				}
			});
		});
		return rate;
	}
	$scope.isInJob = function(employeeID, estimateID) {
		var isInJob = false;
		var jobAssignments = firebase.child('JobAssignments').orderByChild('employeeID').equalTo(employeeID);
		if(jobAssignments) {
			jobAssignments.on('value', function(snap) {
				snap.forEach(function(assignment) {
					if(assignment.val().estimateID == estimateID) {
						isInJob = true;
					}
				});
			});
		}
		return isInJob;
	}

	$scope.getCompanyName = function(companyID) {
		if(companyID) {
			var company = firebase.child('Companies').child(companyID);
			var name = '';
			company.on('value', function(snap) {
				if(snap.val()) {
					name = snap.val().name;
				}
			});
			return name;
		}
	}

	$scope.employeeHasJob = function(estimateID, employeeID) {
		var hasJob = false;
		var JobAssignments = firebase.child('JobAssignments').orderByChild('employeeID').equalTo(employeeID);
		JobAssignments.on('value', function(snap) {
			snap.forEach(function(assignment) {
				if(assignment.val().estimateID == estimateID) {
					hasJob = true;
				}
			});
		});
		return hasJob;
	}

	$scope.adminOfCompany = function(id) {
	       return $scope.companyAssignments.indexOf(id) != -1 || false;
	   }

	$scope.employeeHoursInJob = function(estimateID, employeeID, range) {
		var totalHours = 0;
		$scope.checkEntries.on('value', function(snap) {
			snap.forEach(function(entry) {
				if(!range || $scope.isDateInRange( $scope.createDate(entry.val().date), $scope.createDate(range.start), $scope.createDate(range.end) ) ) {
					if(entry.val().Employee == employeeID && entry.val().estimateID == estimateID) {
						if(entry.val().hours) {
							totalHours += parseFloat(entry.val().hours);
						}
					}
				}
			});
		});
		return totalHours;
	}

	$scope.employeeRateInJob = function(estimateID, employeeID) {
		var returnRate = 0;
		$scope.checkRates.on('value', function(snap) {
			snap.forEach(function(rate) {
				if(rate.val().employeeID == employeeID && rate.val().estimateID == estimateID) {
					if(rate.val().Rate) {
						returnRate = rate.val().Rate;
					}
				}
			});
		});
		return returnRate;
	}

	$scope.totalGrossPayInPeriod = function(employeeID, companyID, range) {
		var grossPay = 0;
		$scope.checkEstimates.on('value', function(snap) {
			snap.forEach(function(estimate) {
				if(estimate.val().companyID == companyID) {
					grossPay += $scope.employeeHoursInJob(estimate.key(), employeeID, range) * $scope.employeeRateInJob(estimate.key(), employeeID);
				}
			});
		});
		return grossPay;
	}

	$scope.isDateInRange = function(date, startDate, endDate) {
		return date >= startDate && date <= endDate;
	}

	$scope.savePDF = function() {
		html2canvas($("#pdfSave"), {
            onrendered: function(canvas) {
                theCanvas = canvas;

            	var doc = new jsPDF('landscape');
            	doc.addImage(canvas.toDataURL('image/jpeg'), 'jpeg', 0, 0, 5, 5);
            	doc.save('estimate.pdf');
            }
        });
	}

	var employeeGroupRef = firebase.child('employeeGroups');
	$scope.employeeGroups = $firebaseArray(employeeGroupRef);
	$scope.addEmployeeGroup = function(group) {
		group.userID = $scope.userID;
		firebase.child('employeeGroups').push(group);
	}
	$scope.calculateGroup = function(group) {
		var PTO = num(group.vacationDays) + num(group.sickDays) + num(group.holidays);
		var PTOHours = PTO * 8;
		var regularHours = 2080 - PTOHours;
		var annualWage = 2080 * num(group.baseRate);

		// PAYROLL TAXES
		var ficaMedicareAmount = num(group.medicarePercent/100) * num(group.baseRate);
		if(annualWage > num(group.limitFica)) {
			var ficaSocialAmount = num(group.limitFica / 2080) * num(group.ficaPercent/100);
		} else {
			var ficaSocialAmount = num(group.baseRate) * num(group.ficaPercent/100);
		}
		if(annualWage > num(group.limitFuta)) {
			var futaAmount = num(group.limitFuta / 2080) * num(group.futaPercent/100);
		} else {
			var futaAmount = num(group.baseRate) * num(group.futaPercent/100);
		}
		if(annualWage > num(group.limitSuta)) {
			var sutaAmount = num(group.limitSuta / 2080) * num(group.sutaPercent/100);
		} else {
			var sutaAmount = num(group.baseRate) * num(group.sutaPercent/100);
		}

		var totalPayRollTaxAmount = ficaMedicareAmount + ficaSocialAmount + futaAmount + sutaAmount;

		// LABOR DRIVEN INSURANCE
		var workersCompensationAmount = num(group.workersCompensation/100) * num(group.baseRate);
		var generalLiabilityAmount = num(group.generalLiability/100) * num(group.baseRate);

		var totalLaborDrivenInsuranceAmount = workersCompensationAmount + generalLiabilityAmount;

		var subTotalPrePTO = num(group.baseRate) + totalLaborDrivenInsuranceAmount + totalPayRollTaxAmount;


		// EMPLOYER PAID BENEFITS
		var FourOneKMatch = num(group.fourOneK) / regularHours;
		var healthBenefits = num(group.healthBenefits) / regularHours;
		var PTOBenefit = (PTOHours * subTotalPrePTO) / regularHours;

		var employeePaidBenefits = FourOneKMatch + healthBenefits + PTOBenefit;

		// OTHER LABOR DRIVEN BURDENS
		var vehicleFuel = num(group.vehicleFuel) / regularHours;
		var phoneCosts = num(group.phoneCosts) / regularHours;
		var computer = num(group.computer) / regularHours;
		var software = num(group.software) / regularHours;
		var tools = num(group.tools) / regularHours;
		var safetyEquipment = num(group.safetyEquipment) / regularHours;
		var bonus = num(group.bonus) / regularHours;
		var other1 = num(group.other1) / regularHours;
		var other2 = num(group.other2) / regularHours;
		var other3 = num(group.other3) / regularHours;


		var totalOtherLabor = vehicleFuel + phoneCosts + computer + software + tools + safetyEquipment + bonus + other1 + other2 + other3;

		var totalBurden = totalPayRollTaxAmount + totalLaborDrivenInsuranceAmount + employeePaidBenefits + totalOtherLabor;

		var costPerWorkingHour = totalBurden + num(group.baseRate);

		employeeGroupRef.child(group.$id).update({
			costPerWorkingHour: currencyRound(costPerWorkingHour)
		});


	}

	$scope.createDate = function(date) {
	    if ( date.indexOf('-') !== -1 ) {
	        var parts = date.split('-');
	        return new Date(parts[0], parts[1]-1, parts[2]);
	    } else if ( date.indexOf('/') !== -1 ) {
	        var parts = date.split('/');
	        return new Date(parts[2], parts[0]-1, parts[1]);
	    } else {
	        return new Date(date);
	    }

	} 

	$scope.addRate = function(estimateID, employeeID, newRate) {
		if(newRate) {
			var rate = {'estimateID':estimateID, 'employeeID':employeeID, 'rate':newRate, 'companyID':1};
			firebase.child('Rates').push(rate);
			$scope.newRate=null;
		}
	}

	var itemGroupsRef = firebase.child('Item Groups');
	//$scope.itemGroups = $firebaseArray(itemGroupsRef);

	$scope.addLapBars = function(lap) {
		var Items = firebase.child('Items');
		var groupID = lap.groupID;

		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(lap) {
			lap.estimateID = $state.params.estimateID;
			lap.groupID = groupID;
			lap.quantity = $scope.mainBarQuantity;
			lap.length = lap.stocklength;
			lap.lengthinches = lap.stocklengthinches;
			lap.tool = 'Lap';
			lap.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			lap.waste = 0;

			lap.savedMultiplier = lap.multiplier;
			lap.savedSecondMultiplier = lap.secondmultiplier;

			if(!lap.notes) {lap.notes='';}


			itemGroupsRef.child(lap.group).set({
				groupID:lap.group,
				estimateID:$state.params.estimateID,
				tool:'Lap',
				notes: lap.notes,
				topGroupID:groupID,
				multiplier: lap.multiplier,
				multiplier2: lap.multiplier2
			});

			lap.multiplier = 1;
			lap.secondmultiplier = 1;

			if(isValidItem(lap)) { Items.safePush(lap); }

			lap.quantity = $scope.extraBarQuantity;
			lap.length = $scope.extraBarFt;
			lap.lengthinches = $scope.extraBarIn;
			if(isValidItem(lap)) { Items.safePush(lap); }

			// Reset all non default items
			// $scope.lap.quantity = null;
			// $scope.lap.length = null;
			// $scope.lap.lengthinches = null;
			// $scope.lap.notes = null;
			// $scope.lap.lineType = 'Straight';
			// $scope.lap.multiplier = 1;
			// $scope.lap.multiplier2 = 1;
			// $scope.lap.difficulty = '1';
			// $scope.lap.toollength = null;
			// $scope.lap.toollengthinches = null;
			lap.multiplier = lap.savedMultiplier;
			lap.secondmultiplier = savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointLap').focus();
		$scope.flashMessage('Added Successfully', 1000);
	}

	$scope.addSlabBars = function(slab) {
		var Items = firebase.child('Items');
		var groupID = slab.groupID;


		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(slab) {
			slab.estimateID = $state.params.estimateID;
			slab.groupID = groupID;
			slab.quantity = $scope.mainBarQuantity;
			slab.length = slab.stocklength;
			slab.lengthinches = slab.stocklengthinches;
			slab.tool = 'Slab';
			slab.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			slab.waste = 0;

			slab.savedMultiplier = slab.multiplier;
			slab.savedSecondMultiplier = slab.secondmultiplier;

			if(!slab.notes) {slab.notes='';}
			if(!slab.group2.spacinginches) {slab.group2.spacinginches = 0;}
			if(!slab.spacinginches) {slab.spacinginches = 0;}

			slab = cleanObject(slab);

			if(!slab.itemsNegative) {
				slab.itemsNegative = false;
			}

			// CREATE A GROUPING TO MATCH
			itemGroupsRef.child(slab.group).set({
				groupID:slab.group,
				estimateID:$state.params.estimateID,
				tool:'Slab',
				notes: slab.notes,
				topGroupID: groupID,
				multiplier: slab.multiplier,
				multiplier2: slab.multiplier2,
				itemsNegative: slab.itemsNegative
			});

			slab.multiplier = 1;
			slab.secondmultiplier = 1;

			slab.group2 = cleanObject(slab.group2);

			if(isValidItem(slab)) { Items.safePush(slab); }

			slab.quantity = $scope.extraBarQuantity;
			slab.length = $scope.extraBarFt;
			slab.lengthinches = $scope.extraBarIn;
			cleanObject(slab.group2);
			if(isValidItem(slab)) { Items.safePush(slab); }

			// ADD BARS ALONG 2nd
			if(slab.option == '2 Way Bar') {
				slab.estimateID = $state.params.estimateID;
				slab.groupID = groupID;
				if(!$scope.slab.multiplier) {
					$scope.slab.multiplier = 1;
				}
				if(!$scope.slab.secondmultiplier) {
					$scope.slab.secondmultiplier = 1;
				}

				slab.quantity = $scope.SecondmainBarQuantity;
				slab.length = slab.stocklength;
				slab.lengthinches = slab.stocklengthinches;
				slab.tool = 'Slab';
				slab.group = slab.group;
				if(isValidItem(slab)) { Items.safePush(slab); }

				slab.quantity = $scope.SecondextraBarQuantity;
				slab.length = $scope.SecondextraBarFt;
				slab.lengthinches = $scope.SecondextraBarIn;
				if(isValidItem(slab)) { Items.safePush(slab); }
			}

			// ADD HOOKBAR 1
			if($scope.hookBar1Quantity) {
				slab.quantity = $scope.hookBar1Quantity;
				slab.length = $scope.hookBar1LengthFT;
				slab.lengthinches = $scope.hookBar1LengthIN;
				if(isValidItem(slab)) { Items.safePush(slab); }
			}
			// ADD HOOKBAR 2
			if($scope.hookBar2Quantity) {
				slab.quantity = $scope.hookBar2Quantity;
				slab.length = $scope.hookBar2LengthFT;
				slab.lengthinches = $scope.hookBar2LengthIN;
				if(isValidItem(slab)) { Items.safePush(slab); }
			}
			// ADD HOOKBAR 3
			if($scope.hookBar3Quantity) {
				slab.quantity = $scope.hookBar3Quantity;
				slab.length = $scope.hookBar3LengthFT;
				slab.lengthinches = $scope.hookBar3LengthIN;
				if(isValidItem(slab)) { Items.safePush(slab); }
			}
			// ADD HOOKBAR 4
			if($scope.hookBar4Quantity) {
				slab.quantity = $scope.hookBar4Quantity;
				slab.length = $scope.hookBar4LengthFT;
				slab.lengthinches = $scope.hookBar4LengthIN;
				if(isValidItem(slab)) { Items.safePush(slab); }
			}

			// Reset all non default items
			// $scope.slab.quantity = null;
			// $scope.slab.length = null;
			// $scope.slab.lengthinches = null;
			// $scope.slab.width = null;
			// $scope.slab.widthinches = null;
			// $scope.slab.notes = null;
			// $scope.slab.lineType = 'Straight';
			// $scope.slab.multiplier = 1;
			// $scope.slab.multiplier2 = 1;
			// $scope.slab.difficulty = '1';
			// $scope.slab.type = '1';
			// $scope.slab.option = '2 Way Bar';
			// $scope.slab.bendopt = '1Piece';
			// $scope.slab.spacingOptions = '1';
			// $scope.slab.end1='none:0';
			// $scope.slab.end2='none:0';
			// $scope.slab.group2.spacingOptions = '1';
			// $scope.slab.group2.end1='none:0';
			// $scope.slab.group2.end2='none:0';
			slab.multiplier = slab.savedMultiplier;
			slab.secondmultiplier = slab.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointSlab').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	// ADD VARY ITEMS
	$scope.addVaryBars = function(vary) {
		var Items = firebase.child('Items');
		var groupID = vary.groupID;

		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(vary) {
			vary.estimateID = $state.params.estimateID;
			vary.groupID = groupID;
			vary.quantity = $scope.mainBarQuantity;
			vary.length = num(vary.stocklength);
			vary.lengthinches = num(vary.stocklengthinches);
			vary.tool = 'Vary';
			vary.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			vary.waste = 0;

			vary.savedMultiplier = vary.multiplier;
			vary.savedSecondMultiplier = vary.secondmultiplier;

			vary = cleanObject(vary);

			itemGroupsRef.child(vary.group).safeSet({
				groupID:vary.group,
				estimateID:$state.params.estimateID,
				tool:'Vary',
				notes: cleanup(vary.notes),
				topGroupID: groupID,
				multiplier: vary.multiplier,
				multiplier2: vary.multiplier2,
				itemsNegative: vary.itemsNegative
			});

			vary.multiplier = 1;
			vary.secondmultiplier = 1;

			if(isValidItem(vary)) { Items.safePush(vary);}

			vary.quantity = $scope.extraBarQuantity;
			vary.length = $scope.extraBarFt;
			vary.lengthinches = $scope.extraBarIn;
			if(isValidItem(vary)) { Items.safePush(vary);}

			vary.quantity = $scope.hookBar1Quantity;
			vary.length = $scope.hookBar1LengthFT;
			vary.lengthinches = $scope.hookBar1LengthIN;
			if(isValidItem(vary)) { Items.safePush(vary); }

			vary.quantity = $scope.hookBar2Quantity;
			vary.length = $scope.hookBar2LengthFT;
			vary.lengthinches = $scope.hookBar2LengthIN;
			if(isValidItem(vary)) { Items.safePush(vary); }

			// RESET ITEMS
			// $scope.vary.quantity = null;
			// $scope.vary.length = null;
			// $scope.vary.lengthinches = null;
			// $scope.vary.width = null;
			// $scope.vary.widthinches = null;
			// $scope.vary.notes = null;
			// $scope.vary.lineType = 'Straight';
			// $scope.vary.multiplier = 1;
			// $scope.vary.multiplier2 = 1;
			// $scope.vary.difficulty = '1';
			// $scope.vary.radiusFT = null;
			// $scope.vary.radiusIN = null;
			// $scope.vary.numVerts = null;
			// $scope.vary.vertType = 'Straight';
			// $scope.vary.hooklength = null;
			// $scope.vary.hooklengthinches = null;
			// $scope.vary.diameterFT = null;
			// $scope.vary.diameterIN = null;
			// $scope.vary.lengthFt = null;
			// $scope.vary.lengthIn = null;
			// $scope.vary.width = null;
			// $scope.vary.widthinches = null;
			// $scope.vary.height = null;
			// $scope.vary.heightinches = null;
			// $scope.vary.distance1 = null;
			// $scope.vary.bendDim1='none:0';
			// $scope.vary.span = null;
			// $scope.vary.spaninches = null;
			// $scope.vary.distance2 = null;
			// $scope.vary.bendDim2='none:0';
			// $scope.vary.type='1Piece';
			// $scope.vary.spacingOptions = 'Standard';

			vary.multiplier = vary.savedMultiplier;
			vary.secondmultiplier = vary.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointVary').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	// ADD CIRCULAR ITEMS
	$scope.addCircularItems = function(circular) {
		var Items = firebase.child('Items');
		var groupID = circular.groupID;



		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(circular) {
			circular.estimateID = $state.params.estimateID;
			circular.groupID = groupID;
			circular.quantity = $scope.mainBarQuantity;
			circular.length = num(circular.stocklength);
			circular.lengthinches = num(circular.stocklengthinches);
			circular.tool = 'Circular';
			circular.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP

			circular.savedMultiplier = circular.multiplier;
			circular.savedSecondMultiplier = circular.secondmultiplier;

			// DEFINE NON REQUIRED ITEMS
			if(!circular.notes) {circular.notes='';}
			if(!circular.spacingIN) {circular.spacingIN = 0}
			if(!circular.spacingFT) {circular.spacingFT = 0}

			if(!circular.itemsNegative) {
				circular.itemsNegative = false;
			}

			itemGroupsRef.child(circular.group).set({
				groupID:circular.group,
				estimateID:$state.params.estimateID,
				tool:'Circular',
				notes: circular.notes,
				topGroupID: groupID,
				multiplier: circular.multiplier,
				multiplier2: circular.multiplier2,
				itemsNegative: circular.itemsNegative
			});

			circular.multiplier = 1;
			circular.secondmultiplier = 1;

			if(isValidItem(circular)) { Items.safePush(circular); }


			circular.quantity = $scope.extraBarQuantity;
			circular.length = $scope.extraBarFt;
			circular.lengthinches = $scope.extraBarIn;
			if(isValidItem(circular)) { Items.safePush(circular); }

			// RESET ITEMS
			// $scope.circular.quantity = null;
			// $scope.circular.length = null;
			// $scope.circular.lengthinches = null;
			// $scope.circular.width = null;
			// $scope.circular.widthinches = null;
			// $scope.circular.notes = null;
			// $scope.circular.lineType = 'Straight';
			// $scope.circular.multiplier = 1;
			// $scope.circular.multiplier2 = 1;
			// $scope.circular.difficulty = '1';
			// $scope.circular.radiusFT = null;
			// $scope.circular.radiusIN = null;
			// $scope.circular.barDirection = null;
			// $scope.circular.barDirection='2';

			circular.multiplier = circular.savedMultiplier;
			circular.secondmultiplier = circular.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointCircular').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	// ADD COLUMN ITEMS
	$scope.addColumnBars = function(column) {
		var Items = firebase.child('Items');
		var groupID = column.groupID;



		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(column) {
			column.estimateID = $state.params.estimateID;
			column.groupID = groupID;
			column.originalSize = column.size;
			column.originalGrade = column.grade;
			column.quantity = $scope.mainBarQuantity;
			column.length = num(column.stocklength);
			column.lengthinches = num(column.stocklengthinches);
			column.tool = 'Column';
			column.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			column.circularTie = cleanObject(column.circularTie);
			column.waste = 0;

			column.savedMultiplier = column.multiplier;
			column.savedSecondMultiplier = column.secondmultiplier;

			if(!column.notes) {column.notes=''}

			itemGroupsRef.child(column.group).set({
				groupID:column.group,
				estimateID:$state.params.estimateID,
				tool:'Column',
				notes: column.notes,
				topGroupID: groupID,
				multiplier: column.multiplier,
				multiplier2: column.multiplier2
			});
			column.multiplier = 1;
			column.secondmultiplier = 1;
			column.laplength = num(column.laplength);
			column.diameter = num(column.diameter);

			deepCleanObject(column, true);
			if(isValidItem(column)) { Items.safePush(column); }

			// REGULAR BARS
			if(column.type!='Circular') {
				for(i=0; i<$scope.numColumnBars.length; i++) {
					var sizeFactor = $scope.column.customBar[i].position;


					if(sizeFactor == 'Exterior Tie') {
						column.size = $scope.column.exteriorTieSize;
						column.grade = $scope.column.exteriorTieGrade;
					}
					if(sizeFactor == 'Interior Tie') {
						column.size = $scope.column.interiorTieSize;
						column.grade = $scope.column.interiorTieGrade;
					}

					if(column.size == 4.25) {column.size = 3;}
					if(column.size == 4.5) {column.size = 4;}
					if(column.size == 5.5) {column.size = 5;}
					if(column.size == 8) {column.size = 6;}
					if(column.size == 9) {column.size = 7;}
					if(column.size == 10.5) {column.size = 8;}


					column.size = (column.size).toString();
					column.grade = (column.grade).toString();
					
					column.quantity = $scope.exteriorTieQuantity[i];
					column.length = $scope.column.bar[i].totalLengthft;
					column.lengthinches = $scope.column.bar[i].totalLengthin;
					if(isValidItem(column)) { Items.safePush(column); }
				}
			}

			// CIRCULAR BARS
			if(column.type=='Circular') {
				column.quantity = $scope.exteriorTieQuantity[0];
				column.length = $scope.circularTieFT;
				column.lengthinches = $scope.circularTieIN;
				if(isValidItem(column)) { Items.safePush(column); }
			}

			// SPIRAL BARS
			if(column.spiral && column.type=='Circular') {
				column.quantity = $scope.spiralQuantity;
				column.length = $scope.spiralLengthFT;
				column.lengthinches = $scope.spiralLengthIN;
				column = cleanObject(column);
				if(isValidItem(column)) { Items.safePush(column); }
			}

			// RESET ITEMS
			// $scope.column.quantity = null;
			// $scope.column.length = null;
			// $scope.column.lengthinches = null;
			// $scope.column.width = null;
			// $scope.column.widthinches = null;
			// $scope.column.notes = null;
			// $scope.column.lineType = 'Straight';
			// $scope.column.multiplier = 1;
			// $scope.column.multiplier2 = 1;
			// $scope.column.difficulty = '1';
			// $scope.column.radiusFT = null;
			// $scope.column.radiusIN = null;
			// $scope.column.numVerts = null;
			// $scope.column.vertType = 'Straight';
			// $scope.column.hooklength = null;
			// $scope.column.hooklengthinches = null;
			// $scope.column.diameterFT = null;
			// $scope.column.diameterIN = null;
			// $scope.column.lengthFt = null;
			// $scope.column.lengthIn = null;
			// $scope.column.width = null;
			// $scope.column.widthinches = null;
			// $scope.column.height = null;
			// $scope.column.heightinches = null;
			// $scope.column.shape = 'Custom';
			// $scope.setShapeFields();
			// $scope.handleCustom();

			column.multiplier = column.savedMultiplier;
			column.secondmultiplier = column.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointColumn').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	// ADD BEAM BARS
	$scope.addBeamBars = function(beam) {
		var Items = firebase.child('Items');
		var groupID = beam.groupID;



		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			$scope.item.groupID = groupID;
			$scope.group.title = null;
		}
		if(beam) {
			beam.estimateID = $state.params.estimateID;
			beam.groupID = groupID;
			beam.originalSize = beam.size;
			beam.originalGrade = beam.grade;
			beam.quantity = $scope.mainBarQuantity;
			beam.length = num(beam.stocklength);
			beam.lengthinches = num(beam.stocklengthinches);
			beam.tool = 'Beam';
			beam.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			beam.waste=0;

			beam.savedMultiplier = beam.multiplier;
			beam.savedSecondMultiplier = beam.secondmultiplier;

			if(!beam.notes) {beam.notes=''}

			itemGroupsRef.child(beam.group).set({
				groupID:beam.group,
				estimateID:$state.params.estimateID,
				tool:'Beam',
				notes: beam.notes,
				topGroupID: groupID,
				multiplier: beam.multiplier,
				multiplier2: beam.multiplier2
			});
			beam.multiplier = 1;
			beam.secondmultiplier = 1;
			beam.laplength = num(beam.laplength);
			beam.diameter = num(beam.diameter);

			beam.topBar = cleanObject(beam.topBar);
			beam.midBar = cleanObject(beam.midBar);
			beam.bottomBar = cleanObject(beam.bottomBar);

			beam.quantity = $scope.beam.topBar.barQuantity;
			beam.length = num(beam.topBar.stocklength);
			beam.lengthinches = num(beam.topBar.stocklengthinches);
			beam.size = $scope.beam.topBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			beam.quantity = $scope.beam.topBar.barExtraQuantity;
			beam.length = num(beam.topBar.barExtraLengthFt);
			beam.lengthinches = num(beam.topBar.barExtraLengthIn);
			beam.size = $scope.beam.topBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			beam.quantity = $scope.beam.midBar.barQuantity;
			beam.length = num(beam.midBar.stocklength);
			beam.lengthinches = num(beam.midBar.stocklengthinches);
			beam.size = $scope.beam.midBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			beam.quantity = $scope.beam.midBar.barExtraQuantity;
			beam.length = num(beam.midBar.barExtraLengthFt);
			beam.lengthinches = num(beam.midBar.barExtraLengthIn);
			beam.size = $scope.beam.midBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			beam.quantity = $scope.beam.bottomBar.barQuantity;
			beam.length = num(beam.bottomBar.stocklength);
			beam.lengthinches = num(beam.bottomBar.stocklengthinches);
			beam.size = $scope.beam.bottomBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			beam.quantity = $scope.beam.bottomBar.barExtraQuantity;
			beam.length = num(beam.bottomBar.barExtraLengthFt);
			beam.lengthinches = num(beam.bottomBar.barExtraLengthIn);
			beam.size = $scope.beam.bottomBar.size;
			if(isValidItem(beam)) { Items.safePush(beam); }

			// REGULAR BARS
			if(beam.type!='Circular') {
				for(i=0; i<$scope.numColumnBars.length; i++) {
					var sizeFactor = $scope.beam.customBar[i].position;


					if(sizeFactor == 'Exterior Tie') {
						beam.size = $scope.beam.exteriorTieSize;
						beam.grade = $scope.beam.exteriorTieGrade;
					}
					if(sizeFactor == 'Interior Tie') {
						beam.size = $scope.beam.interiorTieSize;
						beam.grade = $scope.beam.interiorTieGrade;
					}

					if(beam.size == 4.25) {beam.size = 3;}
					if(beam.size == 4.5) {beam.size = 4;}
					if(beam.size == 5.5) {beam.size = 5;}
					if(beam.size == 8) {beam.size = 6;}
					if(beam.size == 9) {beam.size = 7;}
					if(beam.size == 10.5) {beam.size = 8;}


					beam.size = (beam.size).toString();
					beam.grade = (beam.grade).toString();
					
					beam.quantity = $scope.exteriorTieQuantity[i];
					beam.length = $scope.beam.bar[i].totalLengthft;
					beam.lengthinches = $scope.beam.bar[i].totalLengthin;
					if(isValidItem(beam)) { Items.safePush(beam); }
				}
			}

			// CIRCULAR BARS
			if(beam.type=='Circular') {
				beam.quantity = $scope.exteriorTieQuantity[0];
				beam.length = $scope.circularTieFT;
				beam.lengthinches = $scope.circularTieIN;
				if(isValidItem(beam)) { Items.safePush(beam); }
			}

			// RESET ITEMS
			// $scope.beam.quantity = null;
			// $scope.beam.length = null;
			// $scope.beam.lengthinches = null;
			// $scope.beam.width = null;
			// $scope.beam.widthinches = null;
			// $scope.beam.notes = null;
			// $scope.beam.lineType = 'Straight';
			// $scope.beam.multiplier = 1;
			// $scope.beam.multiplier2 = 1;
			// $scope.beam.difficulty = '1';
			// $scope.beam.radiusFT = null;
			// $scope.beam.radiusIN = null;
			// $scope.beam.numVerts = null;
			// $scope.beam.vertType = 'Straight';
			// $scope.beam.hooklength = null;
			// $scope.beam.hooklengthinches = null;
			// $scope.beam.diameterFT = null;
			// $scope.beam.diameterIN = null;
			// $scope.beam.lengthFt = null;
			// $scope.beam.lengthIn = null;
			// $scope.beam.width = null;
			// $scope.beam.widthinches = null;
			// $scope.beam.height = null;
			// $scope.beam.heightinches = null;
			// $scope.beam.shape = 'Custom';
			// $scope.beam.span = null;
			// $scope.beam.spaninches = null;
			// $scope.beam.topBar.quantity = null;
			// $scope.beam.midBar.quantity = null;
			// $scope.beam.bottomBar.quantity = null;
			// $scope.setBeamShapeFields();
			// $scope.handleBeamCustom();

			beam.multiplier = beam.savedMultiplier;
			beam.secondmultiplier = beam.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointBeam').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	// ITEMS
	$scope.item = {};
	$scope.group = {};
	$scope.addItem = function(standard) {
		var Items = firebase.child('Items');
		var groupID = standard.groupID;

		standard.savedMultiplier = standard.multiplier;
		standard.savedSecondMultiplier = standard.secondmultiplier;

		if($scope.group.title) {
			var Groups = firebase.child('Groups');
			$scope.group.estimateID = $state.params.estimateID;
			var createdGroup = Groups.push($scope.group);
			groupID = $firebaseObject(createdGroup).$id;
			standard.groupID = groupID;
			$scope.group.title = null;
		}
		if(standard) {
			standard.estimateID = $state.params.estimateID;
			standard.groupID = groupID;
			standard.tool = 'Standard';
			standard.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
			standard.length = standard.toollength;
			standard.lengthinches = standard.toollengthinches;

			if(!standard.notes) {standard.notes='';}

			itemGroupsRef.child(standard.group).set({
				groupID:standard.group,
				estimateID:$state.params.estimateID,
				tool:'Standard',
				notes:standard.notes,
				topGroupID: groupID,
				multiplier: standard.multiplier,
				multiplier2: standard.multiplier2
			});

			standard.multiplier = standard.multiplier;
			standard.secondmultiplier = standard.multiplier2;

			if(isValidItem(standard)) { Items.safePush(standard);}

			// Reset all non default items
			// $scope.standard.quantity = 1;
			// $scope.standard.toollength = null;
			// $scope.standard.toollengthinches = null;
			// $scope.standard.notes = null;
			// $scope.standard.lineType = 'Straight';
			// $scope.standard.multiplier = 1;
			// $scope.standard.multiplier2 = 1;
			// $scope.standard.difficulty = '1';
			standard.multiplier = standard.savedMultiplier;
			standard.secondmultiplier = standard.savedSecondMultiplier;
		}
		$scope.expandGroup(groupID, 'override');
		// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
		$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
		$('#startPointStandard').focus();

		$scope.flashMessage('Added Successfully', 1000);
	}

	$scope.entry = {};
	$scope.employee = {};
	$scope.addEntry = function() {
		$scope.employee.companyID = 1;
		$scope.entry.estimateID = $state.params.estimateID;

		if($scope.employee.name) {
			var newEmployee = firebase.child('Employees').push($scope.employee);
			employeeID = $firebaseObject(newEmployee).$id;
			$scope.entry.Employee = employeeID;
			$scope.employee.title = null;
		}

		firebase.child('Entries').push($scope.entry);

		$scope.entry.notes = null;
		$('#addEntryArea .groupArea').focus();
		//$scope.entry = {};
		$scope.entry.hours = null;
		$scope.entry.Employee = null;
		$scope.entry.notes = null;
		$('#entryEmployee').focus();
		$('#entryEmployee').effect('highlight', {}, 1000);
		$scope.initDefaults();
	}
	$scope.removeEntry = function(entryID) {
		var entry = firebase.child('Entries').child(entryID);
		entry.remove();
	}
	$scope.updateItemQuantity = function(itemID, estimateID) {
		var itemQuantities = firebase.child('ItemQuantities');

		$scope.hasQuantity = false;
		itemQuantities.on('value', function(snap) {
			snap.forEach(function(quantities) {
				if(quantities.val().estimateID == estimateID && quantities.val().itemID == itemID) {
					$scope.hasQuantity = true;
				} else {
					$scope.hasQuantity = false;
				}
			});
		});
		if(!$scope.hasQuantity) { // If a quantity doesn't exist fot that itemID / estimateID combination
			itemQuantities.push({
				'itemID':itemID,
				'estimateID':estimateID,
				'quantity':1
			});
		} else {

		}
	}
	$scope.employeeName = function(employeeID) {
		if(employeeID) {
			var employee = firebase.child('Employees').child(employeeID);
			var employeeName = '';
			employee.on('value',function(snap){
				employeeName = snap.val().name;
			});
			return employeeName;
		} else {
			return '';
		}
	}
	$scope.setItemOrder = function(list) {
      list.find('li').each(function(index, value) {
        var itemid = $(this).attr('groupid');
        var item = itemGroupsRef.child(itemid);
        item.update({priority: index});
      });
    }
    $scope.setGroupOrder = function(list) {
      list.find('.group').each(function(index, value) {
        var groupid = $(this).attr('groupid');
        if(groupid) {
        	var group = firebase.child('Groups').child(groupid);
        	group.update({priority: index});
        }
      });
    }
    $scope.setEstimateOrder = function(list) {
      list.find('li').each(function(index, value) {
        var estimateid = $(this).attr('estimateid');
        var estimate = firebase.child('Estimates').child(estimateid);
        estimate.update({priority: index});
      });
    }
    $scope.totalHoursSAC = function(sac) {
    	var entries = firebase.child('Entries').orderByChild('estimateID').equalTo($state.params.estimateID);
    	var hours = 0;
    	entries.on('value', function(snap) {
    		snap.forEach(function(entry) {
    			var entrySACCode = entry.val().SACCode.split('.')[0];
    			if(entrySACCode == sac && entry.val().hours) {
    				hours += parseFloat(entry.val().hours);
    			}
    		});
    	});
    	return hours;
    }
    $scope.totalHours = function(employeeID, companyID, range) {
    	var entries = firebase.child('Entries').orderByChild('Employee').equalTo(employeeID); // TODO: Index By Company
    	var totalHours = 0;
    	entries.on('value', function(snap) {
    		snap.forEach(function(entry) {
    			if(!range || $scope.isDateInRange( $scope.createDate(entry.val().date), $scope.createDate(range.start), $scope.createDate(range.end) ) ) {
	    			if(entry.val().hours && employeeID == entry.val().Employee) {
	    				totalHours += parseFloat(entry.val().hours);
	    			}
	    		}
    		});
    	});
    	return totalHours;
    }
    $scope.saveEmployeeRate = function(estimateID, employeeID, employeeRate) {
    	var employee = firebase.child('Employees').child(employeeID);
    	var rate = employee.child('Jobs').child(estimateID);
    	rate.update({
    		'rate':employeeRate
    	});
    }
    $scope.totalWeightSAC = function(sac) {
    	if($state.params.estimateID) {
    		var items = firebase.child('Items').orderByChild('estimateID').equalTo($state.params.estimateID);
    	} else {
    		var items = $scope.checkItems;
    	}
    	var weight = 0;
    	items.on('value', function(snap) {
    		snap.forEach(function(item) {
    			if(item.val().SAC == sac) {
    				weight += $scope.itemWeight(item.val());
    			}
    		});
    	});
    	return weight;
    }
    $scope.totalWeightItem = function(itemID) {
    	var items = firebase.child('Items').orderByChild('estimateID').equalTo($state.params.estimateID);
    	var weight = 0;
    	items.on('value', function(snap) {
    		snap.forEach(function(item) {
    			if(item.key() == itemID) {
    				weight += $scope.itemWeight(item.val());
    			}
    		});
    	});
    	return weight;
    }
    $scope.totalPoundsEmployee = function(employeeID, companyID, range) {
    	var entries = firebase.child('Entries').orderByChild('Employee').equalTo(employeeID); //TODO: Index By company
    	var weight = 0;
    	entries.on('value', function(snap) {
    		snap.forEach(function(entry) {
    			if(!range || $scope.isDateInRange( $scope.createDate(entry.val().date), $scope.createDate(range.start), $scope.createDate(range.end) ) ) {
	    			if(entry.val().Employee == employeeID) {
	    				var entrySACCode = entry.val().SACCode.split('.')[0];
	    				weight += $scope.totalWeightSAC(entrySACCode);
	    			}
	    		}
    		});
    	});
    	return weight;
    }
    $scope.totalHoursEmployee = function(employeeID) {
    	var entries = firebase.child('Entries'); //TODO: Index By Company
    	var hours = 0;
    	entries.on('value', function(snap) {
    		snap.forEach(function(entry) {
    			if(entry.val().Employee == employeeID && entry.val().hours) {
    				hours += parseFloat(entry.val().hours);
    			}
    		});
    	});
    	return hours;	
    }
    $scope.employeeSACCodes = function(employeeID) {
    	var entries = firebase.child('Entries').orderByChild('estimateID').equalTo($state.params.estimateID);
    	var codes = [];
    	entries.on('value', function(snap) {
    		snap.forEach(function(entry) {
    			if(entry.val().Employee == employeeID && entry.val().SACCode) {
    				var entrySACCode = entry.val().SACCode.split('.')[0];
    				var newCode = entry.val().SACCode + ' - ' + $scope.SACItem(entrySACCode).description + ' - ' + $scope.totalWeightSAC(entrySACCode).toFixed(2) + 'lbs';
    				if(!(codes.indexOf(newCode) > -1)) {
    					codes.push(newCode);
    				}
    			}
    		});
    	});
    	return codes;
    }
    $scope.totalPoundsPerHour = function(sac) {
    	return parseFloat($scope.totalWeightSAC(sac)) / parseFloat($scope.totalHoursSAC(sac));
    }
    $scope.lap = {};
    $scope.beam = {};
    $scope.beam.topBar = {};
    $scope.beam.midBar = {};
    $scope.beam.bottomBar = {};

    $scope.calculateBeamTool = function() {
    	$scope.beamBars($scope.beam.topBar);
    	$scope.beamBars($scope.beam.midBar);
    	$scope.beamBars($scope.beam.bottomBar);
    }

    $scope.beamWeight = 0;
    $scope.beamTieWeight = 0;

    $scope.beamBars = function(bar) {
    	var span = num($scope.convertToInches($scope.beam.span, $scope.beam.spaninches)); // Span in inches
    	var multiplier = num($scope.beam.multiplier);
    	var barSize = num(bar.size);
    	var barQuantity = num(bar.quantity);
    	var barStockLength = num($scope.convertToInches(bar.stocklength, bar.stocklengthinches));
    	var barDiameterOver = num($scope.convertToInches(bar.diameterOver, bar.diameterOverInches));
    	var barDiameter = num(bar.diameter);
    	var barLapLength = num(bar.laplength);
    	if(bar.hook1) {
    		var hook1 = $scope.convertToInches(bar.end1FT, bar.end1IN);
    		var hook2 = $scope.convertToInches(bar.end2FT, bar.end2IN);
    	}

    	span += hook1 + hook2;
    	bar.totalSpan = span;

    	bar.barQuantity = (span / (barStockLength - barLapLength));
    	bar.barExtraQuantity = 1;
    	bar.barExtraLength = (decimal(bar.barQuantity) * (barStockLength - barLapLength));
    	bar.barExtraLengthFt = getFeet(bar.barExtraLength);
    	bar.barExtraLengthIn = getInches(bar.barExtraLength);

    	if(bar.barExtraLengthFt < (barDiameterOver / 12)) {
    		bar.barQuantity = Math.floor(bar.barQuantity);
    		bar.barQuantity -= 1;
    		bar.barExtraLength = (span - (bar.barQuantity * (barStockLength - barLapLength)));
    		bar.barExtraLengthFt = getFeet(bar.barExtraLength);
    		bar.barExtraLengthIn = getInches(bar.barExtraLength);
    	}

    	bar.barQuantity = Math.floor(bar.barQuantity);

    	// HANDLE MULTIPLIERS
    	bar.barQuantity = bar.barQuantity * multiplier * barQuantity;
    	bar.barExtraQuantity = bar.barExtraQuantity * multiplier * barQuantity;
    	if(barStockLength > span) {
    		bar.barExtraQuantity = barQuantity;
    	}

    	// LIVE CALCULATE WEIGHTS
    	bar.barWeight = $scope.itemWeight({size:bar.size,length:bar.stocklength,lengthinches:bar.stocklengthinches,quantity:bar.barQuantity,multiplier:1,secondmultiplier:1,waste:0});
    	bar.extraBarWeight = $scope.itemWeight({size:bar.size,length:bar.barExtraLengthFt,lengthinches:bar.barExtraLengthIn,quantity:bar.barExtraQuantity,multiplier:1,secondmultiplier:1,waste:0});

    	$scope.calculateBeamBarWeight();
    	$scope.calculateBeamTieWeight();
    }

    $scope.calculateBeamBarWeight = function() {
		$scope.beamWeight = 0;
    	if($scope.beam.topBar) {
    		$scope.beamWeight += num($scope.beam.topBar.barWeight);
    		$scope.beamWeight += num($scope.beam.topBar.extraBarWeight);
    	}
    	if($scope.beam.midBar) {
    		$scope.beamWeight += num($scope.beam.midBar.barWeight);
    		$scope.beamWeight += num($scope.beam.midBar.extraBarWeight);
    	}
    	if($scope.beam.bottomBar) {
    		$scope.beamWeight += num($scope.beam.bottomBar.barWeight);
    		$scope.beamWeight += num($scope.beam.bottomBar.extraBarWeight);
    	}
    }

    $scope.calculateBeamTieWeight = function() {
    	if($scope.beam.bar) {
    		$scope.beamTieWeight = 0;
    		for(i=0; i<$scope.numColumnBars.length; i++) {
    			if($scope.beam.bar[i].barWeight > 0) {
    				$scope.beamTieWeight += $scope.beam.bar[i].barWeight;
    			}
    			if($scope.beam.bar[i].extraBarWeight > 0) {
    				$scope.beamTieWeight += $scope.beam.bar[i].extraBarWeight;
    			}
    		}
    	}
    }

    $scope.calculateColumnTieWeight = function() {
    	if($scope.column.bar) {
    		$scope.columnTieWeight = 0;
    		for(i=0; i<$scope.numColumnBars.length; i++) {
    			if($scope.column.bar[i].barWeight > 0) {
    				$scope.columnTieWeight += $scope.column.bar[i].barWeight;
    			}
    			if($scope.column.bar[i].extraBarWeight > 0) {
    				$scope.columnTieWeight += $scope.column.bar[i].extraBarWeight;
    			}
    		}
    	}
    }

    $scope.calculateLapLength = function(tool) {
    	tool.laplength = (tool.size / 8) * tool.diameter;
    }
    $scope.calculateLapDiameter = function(tool) {
    	tool.diameter = tool.laplength / (tool.size / 8 );
    }
    $scope.calculateHookSize = function() {
    	$scope.column.hookSizeTotal = (num($scope.column.exteriorTieSize) - 4) * 0.5 + 2;
    	$scope.column.hooklength = Math.floor($scope.column.hookSizeTotal);
    	$scope.column.hooklengthinches = decimal( num($scope.column.hookSizeTotal) ) * 12;
    }

    $scope.calculateTotalLapQuantity = function() {
    	var multiplier = num($scope.lap.multiplier);
    	var multiplier2 = num($scope.lap.multiplier2);
    	$scope.lap.totalLength_in = (num($scope.lap.toollength) * 12) + num($scope.lap.toollengthinches);
    	$scope.lap.stockLength_in = (num($scope.lap.stocklength) * 12) + num($scope.lap.stocklengthinches);
    	$scope.mainBarTotalQuantity = num($scope.lap.totalLength_in) / (num($scope.lap.stockLength_in) - num($scope.lap.laplength));
    	$scope.mainBarQuantity = num(Math.floor($scope.mainBarTotalQuantity));
    	$scope.extraBarQuantity = 1;
    	$scope.extraBarFtTotal = num( decimal($scope.mainBarTotalQuantity) * (num($scope.lap.stockLength_in) - num($scope.lap.laplength)) );
    	$scope.extraBarFt = getFeet($scope.extraBarFtTotal);
    	$scope.extraBarIn = getInchesExact($scope.extraBarFtTotal);


    	var diameterOver = num($scope.convertToInches($scope.lap.diameterOver, $scope.lap.diameterOverInches));

    	if($scope.extraBarFtTotal < (diameterOver)) {
    		$scope.mainBarQuantity = Math.floor($scope.mainBarQuantity);
    		$scope.mainBarQuantity -= 1;
    		$scope.extraBarLength = ($scope.lap.totalLength_in - ($scope.mainBarQuantity * ($scope.lap.stockLength_in - $scope.lap.laplength)));
    		$scope.extraBarFt = getFeet($scope.extraBarLength);
    		$scope.extraBarIn = getInches($scope.extraBarLength);
    	}

    	$scope.mainBarQuantity = multiplier * multiplier2 * (num(Math.floor($scope.mainBarTotalQuantity)));
    	$scope.extraBarQuantity = multiplier * multiplier2 * 1;

    	// CALCULATE THE WEIGHTS
    	var previewItemMain = {
    		size: $scope.lap.size,
    		length: $scope.lap.stocklength,
    		lengthinches: $scope.lap.stocklengthinches,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.mainBarQuantity,
    		waste: 0
    	};
    	$scope.previewWeightMain = $scope.itemWeight(previewItemMain);

    	var previewItemExtra = {
    		size: $scope.lap.size,
    		length: $scope.extraBarFt,
    		lengthinches: $scope.extraBarIn,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.extraBarQuantity,
    		waste: 0
    	};
    	$scope.previewWeightExtra = $scope.itemWeight(previewItemExtra);

    	$scope.totalToolWeight = $scope.previewWeightMain + $scope.previewWeightExtra;
    }

    $scope.slab = {};
    $scope.slab.group2 = {};
    $scope.calculateTotalSlabQuantity = function() {

    	tool = $scope.slab;

    	tool.totalLength_in = $scope.convertToInches(tool.toollength, tool.toollengthinches);
    	tool.stockLength_in = $scope.convertToInches(tool.stocklength, tool.stocklengthinches);
    	tool.spacingLength_in = $scope.convertToInches(tool.spacing, tool.spacinginches);
    	tool.totalWidth_in = $scope.convertToInches(tool.width, tool.widthinches);

    	var multiplier = num(tool.multiplier);
    	var multiplier2 = num(tool.multiplier2);
    	var typeMultiplier = 1;
    	if(tool.type == '2') {
    		typeMultiplier = 2;
    	}

    	if(tool.bendopt == '1Piece') {
    		var end1Distance = $scope.convertToInches(tool.end1FT, tool.end1IN);
    		var end2Distance = $scope.convertToInches(tool.end2FT, tool.end2IN);
    		tool.totalWidth_in += end1Distance + end2Distance;
    	}

    	tool.totalRows = Math.ceil(tool.totalLength_in / tool.spacingLength_in) + num(tool.spacingOptions);
    	tool.stockBarQuantity = ( num(tool.totalWidth_in) / (num(tool.stockLength_in) - num(tool.laplength)) );

    	if(tool.bendopt == '2Pieces') {
    		var end1Distance = $scope.convertToInches(tool.end1FT, tool.end1IN);
    		var end2Distance = $scope.convertToInches(tool.end2FT, tool.end2IN);
    		if(end1Distance) {
    			var hookBar1Quantity = tool.totalRows;
    			var hookBar1Length = num(tool.laplength) + end1Distance;
    		}
    		if(end2Distance) {
    			var hookBar2Quantity = tool.totalRows;
    			var hookBar2Length = num(tool.laplength) + end2Distance;
    		}

    		tool.totalWidth_in += end1Distance + end2Distance;

    		$scope.hookBar1Quantity = hookBar1Quantity * multiplier * multiplier2 * typeMultiplier;
    		$scope.hookBar1LengthFT = getFeet(hookBar1Length);
    		$scope.hookBar1LengthIN = getInchesExact(hookBar1Length);
    		$scope.hookBar2Quantity = hookBar2Quantity * multiplier * multiplier2 * typeMultiplier;
    		$scope.hookBar2LengthFT = getFeet(hookBar2Length);
    		$scope.hookBar2LengthIN = getInchesExact(hookBar2Length);
    	} else {
    		$scope.hookBar1Quantity = 0;
    		$scope.hookBar2Quantity = 0;
    	}

    	var previewHookBarItem1 = {
    		size: $scope.slab.size,
    		length: $scope.hookBar1LengthFT,
    		lengthinches: $scope.hookBar1LengthIN,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.hookBar1Quantity,
    		waste: 0
    	};
    	$scope.previewHookBar1Weight = $scope.itemWeight(previewHookBarItem1);

    	var previewHookBarItem2 = {
    		size: $scope.slab.size,
    		length: $scope.hookBar2LengthFT,
    		lengthinches: $scope.hookBar2LengthIN,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.hookBar2Quantity,
    		waste: 0
    	};
    	$scope.previewHookBar2Weight = $scope.itemWeight(previewHookBarItem2);

    	$scope.mainBarQuantity = 
    		multiplier * multiplier2 * typeMultiplier * (Math.floor( tool.stockBarQuantity )  * num(tool.totalRows));
    	$scope.extraBarQuantity = multiplier * multiplier2 * typeMultiplier * (tool.totalRows);
    	$scope.extraBarLength = num( decimal(num(tool.stockBarQuantity)) * (num(tool.stockLength_in) - num(tool.laplength)) );
    	$scope.extraBarFt = getFeet($scope.extraBarLength);
    	$scope.extraBarIn = getInchesExact($scope.extraBarLength);

    	// CALCULATE THE WEIGHTS
    	var previewItemMain = {
    		size: $scope.slab.size,
    		length: $scope.slab.stocklength,
    		lengthinches: $scope.slab.stocklengthinches,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.mainBarQuantity,
    		waste: 0
    	};
    	$scope.previewWeightMain = $scope.itemWeight(previewItemMain);

    	var previewItemExtra = {
    		size: $scope.slab.size,
    		length: $scope.extraBarFt,
    		lengthinches: $scope.extraBarIn,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.extraBarQuantity,
    		waste: 0
    	};
    	$scope.previewWeightExtra = $scope.itemWeight(previewItemExtra);

    	var diameterOver1 = $scope.convertToInches(tool.diameterOver, tool.diameterOverInches);
    	var extraBarTotalInches = $scope.convertToInches($scope.extraBarFt, 0);

    	if($scope.extraBarLength < (diameterOver1)) {
    		tool.stockBarQuantity = Math.floor(tool.stockBarQuantity);
    		tool.stockBarQuantity -= 1;
    		$scope.mainBarQuantity = 
    			multiplier * multiplier2 * typeMultiplier * ((Math.floor( tool.stockBarQuantity )  * num(tool.totalRows)) * num(tool.type));
    		$scope.extraBarLength = num(tool.totalWidth_in - (tool.stockBarQuantity * (tool.stockLength_in - tool.laplength)));
    		$scope.extraBarFt = getFeet($scope.extraBarLength);
    		$scope.extraBarIn = getInchesExact($scope.extraBarLength);

    		var previewItemMain = {
    			size: $scope.slab.size,
    			length: $scope.slab.stocklength,
    			lengthinches: $scope.slab.stocklengthinches,
    			multiplier: 1,
    			secondmultiplier: 1,
    			quantity: $scope.mainBarQuantity,
    			waste: 0
    		};
    		$scope.previewWeightMain = $scope.itemWeight(previewItemMain);
    	}

    	// Calculating Bars A long Length
    	tool2 = $scope.slab.group2;

    	tool2.stockLength_in = $scope.convertToInches(tool2.stocklength, tool2.stocklengthinches);
    	tool2.spacingLength_in = $scope.convertToInches(tool2.spacing, tool2.spacinginches);

    	if(tool.bendopt == '1Piece') {
    		var end1Distance = $scope.convertToInches(tool2.end1FT, tool2.end1IN);
    		var end2Distance = $scope.convertToInches(tool2.end2FT, tool2.end2IN);
    		tool.totalLength_in += end1Distance + end2Distance;
    	}

    	tool2.totalRows = Math.ceil(tool.totalWidth_in / tool2.spacingLength_in) + num(tool2.spacingOptions);
    	tool2.stockBarQuantity = num(tool.totalLength_in) / (num(tool2.stockLength_in) - num(tool2.laplength));

    	if(tool.bendopt == '2Pieces') {
    		var end1Distance = $scope.convertToInches(tool2.end1FT, tool2.end1IN);
    		var end2Distance = $scope.convertToInches(tool2.end2FT, tool2.end2IN);
    		if(end1Distance > 0) {
    			var hookBar3Quantity = tool2.totalRows;
    			var hookBar3Length = num(tool2.laplength) + end1Distance;
    		}
    		if(end2Distance > 0) {
    			var hookBar4Quantity = tool2.totalRows;
    			var hookBar4Length = num(tool2.laplength) + end2Distance;
    		}

    		tool.totalLength_in += end1Distance + end2Distance;

    		$scope.hookBar3Quantity = hookBar3Quantity  * multiplier * multiplier2 * typeMultiplier;
    		$scope.hookBar3LengthFT = getFeet(hookBar3Length);
    		$scope.hookBar3LengthIN = getInchesExact(hookBar3Length);
    		$scope.hookBar4Quantity = hookBar4Quantity  * multiplier * multiplier2 * typeMultiplier;
    		$scope.hookBar4LengthFT = getFeet(hookBar4Length);
    		$scope.hookBar4LengthIN = getInchesExact(hookBar4Length);
    	} else {
    		$scope.hookBar3Quantity = 0;
    		$scope.hookBar4Quantity = 0;
    	}

    	var previewHookBarItem3 = {
    		size: $scope.slab.group2.size,
    		length: $scope.hookBar3LengthFT,
    		lengthinches: $scope.hookBar3LengthIN,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.hookBar3Quantity,
    		waste: 0
    	};
    	$scope.previewHookBar3Weight = $scope.itemWeight(previewHookBarItem3);

    	var previewHookBarItem4 = {
    		size: $scope.slab.group2.size,
    		length: $scope.hookBar4LengthFT,
    		lengthinches: $scope.hookBar4LengthIN,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.hookBar4Quantity,
    		waste: 0
    	};
    	$scope.previewHookBar4Weight = $scope.itemWeight(previewHookBarItem4);

    	$scope.SecondmainBarQuantity = 
    		multiplier * multiplier2 * typeMultiplier * (Math.floor( tool2.stockBarQuantity )  * num(tool2.totalRows));
    	$scope.SecondextraBarQuantity = multiplier * multiplier2 * typeMultiplier * (tool2.totalRows);
    	$scope.SecondextraBarLength = num( decimal(num(tool2.stockBarQuantity)) * (num(tool2.stockLength_in) - num(tool2.laplength)) );
    	$scope.SecondextraBarFt = getFeet($scope.SecondextraBarLength);
    	$scope.SecondextraBarIn = getInchesExact($scope.SecondextraBarLength);

    	var diameterOver2 = $scope.convertToInches(tool2.diameterOver, tool2.diameterOverInches);
    	var second_extraBarTotalInches = $scope.convertToInches($scope.SecondextraBarFt, 0);

    	if($scope.SecondextraBarLength < (diameterOver2)) {
    		tool2.stockBarQuantity = Math.floor(tool2.stockBarQuantity);
    		tool2.stockBarQuantity -= 1;
    		$scope.SecondextraBarLength = (tool.totalLength_in - (tool2.stockBarQuantity * (tool2.stockLength_in - tool2.laplength)));
    		$scope.SecondextraBarFt = getFeet($scope.SecondextraBarLength);
    		$scope.SecondextraBarIn = getInchesExact($scope.SecondextraBarLength);
    	}

    	var previewSecondBarItem = {
    		size: $scope.slab.group2.size,
    		length: $scope.slab.group2.stocklength,
    		lengthinches: $scope.slab.group2.stocklengthinches,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.SecondmainBarQuantity,
    		waste: 0
    	};
    	$scope.previewSecondBarWeight = $scope.itemWeight(previewSecondBarItem);

    	var previewSecondExtraBarItem = {
    		size: $scope.slab.group2.size,
    		length: $scope.SecondextraBarFt,
    		lengthinches: $scope.SecondextraBarIn,
    		multiplier: 1,
    		secondmultiplier: 1,
    		quantity: $scope.SecondextraBarQuantity,
    		waste: 0
    	};
    	$scope.previewSecondBarWeightExtra = $scope.itemWeight(previewSecondExtraBarItem);

    	$scope.totalToolWeight = currencyRound($scope.previewWeightMain + $scope.previewWeightExtra + $scope.previewSecondBarWeight + $scope.previewSecondBarWeightExtra + $scope.previewHookBar1Weight + $scope.previewHookBar2Weight + $scope.previewHookBar3Weight + $scope.previewHookBar4Weight);
    }	

    $scope.mesh = {};
    $scope.calculateMesh = function() {
    	var meshLengthFT = num($scope.mesh.lengthFT);
    	var meshLengthIN = num($scope.mesh.lengthIN);
    	var meshLength = $scope.convertToInches(meshLengthFT, meshLengthIN);

		var meshWidthFT = num($scope.mesh.widthFT);
		var meshWidthIN = num($scope.mesh.widthIN);
		var meshWidth = $scope.convertToInches(meshWidthFT, meshWidthIN);   

		var meshLengthSheetFT = num($scope.mesh.lengthSheetFT);
		var meshLengthSheetIN = num($scope.mesh.lengthSheetIN);
		var meshLengthSheet = $scope.convertToInches(meshLengthSheetFT, meshLengthSheetIN);  

		var meshWidthSheetFT = num($scope.mesh.widthSheetFT);
		var meshWidthSheetIN = num($scope.mesh.widthSheetIN);
		var meshWidthSheet = $scope.convertToInches(meshWidthSheetFT, meshWidthSheetIN); 	

		var meshLapLength = num($scope.mesh.laplength);

		var meshSize = $scope.mesh.size;

		var multiplier = num($scope.mesh.multiplier);
		var multiplier2 = num($scope.mesh.multiplier2);

		var totalMultiplier = multiplier * multiplier2;

		var waste = num($scope.mesh.waste);
		var wastePercentage = (1 + (waste / 100));

		var sheetsPerManHour = num($scope.mesh.sheetsPerManHour);

		var totalSheets = Math.ceil( (wastePercentage * (meshLength * meshWidth)) / ( (meshLengthSheet - (meshLapLength * 2)) * (meshWidthSheet - (meshLapLength * 2)) ) );

		totalSheets = totalSheets * totalMultiplier;

		var meshSizeObject = findObject($scope.meshThicknesses, meshSize, 'title');
		var weightPerHundred = 0;
		if(meshSizeObject) {
			var weightPerHundred = meshSizeObject.weight;
		}

		var meshTotalWeight = weightPerHundred * ((( (meshLengthSheet / 12) * (meshWidthSheet / 12) ) * totalSheets) / 100);

		$scope.newMesh = {
			totalSheets: totalSheets,
			sheetsPerManHour: sheetsPerManHour,
			size: meshSize,
			lengthFT: meshLengthFT,
			lengthIN: meshLengthIN,
			widthFT: meshWidthFT,
			widthIN: meshWidthIN,
			lengthSheetFT: meshLengthSheetFT,
			lengthSheetIN: meshLengthSheetIN,
			widthSheetFT: meshWidthSheetFT,
			widthSheetIN: meshWidthSheetIN,
			laplength: meshLapLength,
			multiplier: multiplier,
			multiplier2: multiplier2,
			waste: waste,
			specialTool: 'mesh',
			totalWeight: meshTotalWeight,
			costPerSheet: num($scope.mesh.costPerSheet)
		};

		$scope.totalSheets = totalSheets;
		$scope.totalWeight = meshTotalWeight;

    }

    $scope.addMesh = function() {

    	var Items = firebase.child('Items');
    	var groupID = $scope.mesh.groupID;

    	if($scope.group.title) {
    		var Groups = firebase.child('Groups');
    		$scope.group.estimateID = $state.params.estimateID;
    		var createdGroup = Groups.push($scope.group);
    		groupID = $firebaseObject(createdGroup).$id;
    		$scope.newMesh.groupID = groupID;
    		$scope.group.title = null;
    	}

    	$scope.newMesh.estimateID = $state.params.estimateID;
    	$scope.newMesh.groupID = groupID;
    	$scope.newMesh.tool = 'Mesh';
    	$scope.newMesh.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP

    	if(!$scope.mesh.notes) {
    		$scope.mesh.notes = '';
    	}

    	if(!$scope.newMesh.notes) {$scope.newMesh.notes='';}

    	if(!$scope.mesh.itemsNegative) {
    		$scope.mesh.itemsNegative = false;
    	}

    	itemGroupsRef.child($scope.newMesh.group).set({
    		groupID:$scope.newMesh.group,
    		estimateID:$state.params.estimateID,
    		tool:'Mesh',
    		notes:$scope.mesh.notes,
    		topGroupID: groupID,
    		multiplier: $scope.newMesh.multiplier,
    		multiplier2: $scope.newMesh.multiplier2,
    		itemsNegative: $scope.mesh.itemsNegative
    	});

    	Items.safePush($scope.newMesh);

    	$scope.expandGroup(groupID, 'override');
    	// $('html, body').animate({scrollTop:$('#groupList').offset().top}, 1000);
    	$('html, body').animate({scrollTop:$('#addItemsArea').offset().top}, 1000);
    	$('#startPointStandard').focus();

    	$scope.flashMessage('Added Successfully', 1000);
    }

    $scope.$watch('mesh', function() {
    	$scope.calculateMesh();
    }, true);
    $scope.$watch('lap', function () { 
    	$scope.calculateTotalLapQuantity();
    }, true);
    $scope.$watch('slab', function () { 
    	$scope.calculateTotalSlabQuantity();
    }, true);
    $scope.$watch('column', function() {
    	$scope.calculateQuantities($scope.column);
    	$scope.setShape();
    }, true);

    $scope.$watch('beam', function() {
    	$scope.calculateBeamTool();
    	$scope.calculateQuantities($scope.beam);
    	$scope.setBeamShape();
    }, true);

    $scope.$watchCollection('[column.width, column.widthinches, column.tieLength, column.tieLengthInches, column.lengthIn, column.lengthFt, column.exteriorTieSize, column.interiorTieSize]', function(newValues, oldValues){
    	$scope.setShapeFields();
    });

    $scope.setCircular = function() {
		var radius = $scope.convertToInches($scope.circular.radiusFT, $scope.circular.radiusIN);
		var spacing = $scope.convertToInches($scope.circular.spacingFT, $scope.circular.spacingIN);
		var stock = $scope.convertToInches($scope.circular.stocklength, $scope.circular.stocklengthinches);
		var laplength = num($scope.circular.laplength);
		var diameter = radius * 2;
		var numBars = Math.round(diameter / spacing);
		var circularBars = [];
		var multiplier = num($scope.circular.multiplier);
		var multiplier2 = num($scope.circular.multiplier2);
		var barDirection = num($scope.circular.barDirection);
		var totalMultiplier = multiplier * multiplier2 * barDirection;

		if(isFinite(numBars)) {
			var spacingPosition = 0; // Starting Point
			if(isEven(Math.round(diameter/12))) {
				spacingPosition += spacing / 2;
			}
			var barSize = 0;
			var barNumber = 0;
			var totalLength = 0;
			for(i=0;i<(numBars/2);i++) {
				barNumber = i+1;
				if(barNumber == numBars/2) {
					// spacingPosition += (spacing / 2);
				}
				barSize = 2*(Math.sqrt( Math.pow(radius, 2) - Math.pow(spacingPosition, 2) ));
				if(!isEven(Math.round(diameter/12)) && i==0) {
					totalLength += barSize;
				} else {
					totalLength+=barSize*2;
				}
				spacingPosition += spacing;
				// console.debug('BAR:' + barNumber + '-------------------------------');
				// console.debug(getFeet(barSize) + 'ft ' + getInches(barSize) + 'in | Total Inches: ' + barSize + ' | Total Feet: ' + (barSize/12));
			}
			var averageLength = (totalLength / (numBars));
		}

		// CALCULATE EXTRA BARS BASED ON STOCK BARS
			var stockBarRawQuantity = averageLength / (stock - laplength);

			var stockBarQuantity = Math.floor(stockBarRawQuantity);
			var stockBarFT = getFeet(stock);
			var stockBarIN = getInchesExact(stock);
			var stockBarExtraLength = decimal(stockBarRawQuantity) * (stock - laplength);
			var stockBarExtraLengthFT = getFeet(stockBarExtraLength);
			var stockBarExtraLengthIN = getInchesExact(stockBarExtraLength);

		// SETUP THE PREVIEW
		$scope.mainBar = averageLength / 12;
		$scope.mainBarFT = getFeet(averageLength);
		$scope.mainBarIN = getInches(averageLength);
		$scope.extraBar = stockBarExtraLength / 12;
		$scope.extraBarFt = stockBarExtraLengthFT;
		$scope.extraBarIn = stockBarExtraLengthIN;
		if(averageLength > stock) {
			$scope.extraBarQuantity = totalMultiplier * numBars;
			$scope.mainBarQuantity = Math.floor(totalMultiplier * (numBars * stockBarQuantity));
			$scope.mainBarFT = getFeet(stock);
			$scope.mainBarIN = getInches(stock);
		} else {
			$scope.extraBarQuantity = 0;
			$scope.mainBarQuantity = numBars;
		}

		// FACTOR IN DIAMETER OVER
		var diameterOver = num($scope.convertToInches($scope.circular.diameterOver, $scope.circular.diameterOverInches));

		if(stockBarExtraLength < diameterOver) {
			$scope.mainBarQuantity = Math.floor($scope.mainBarQuantity);
			$scope.mainBarQuantity -= 1 * numBars;
			var extraBarLength = averageLength - ( (stockBarQuantity-1) * (stock - laplength));
			$scope.extraBarFt = getFeet(extraBarLength);
			$scope.extraBarIn = getInchesExact(extraBarLength);
		}
    }

    $scope.setShape = function() {
    	if($scope.column.shape == 'Exterior With Crossing T9s') {
    		// var numBars = 3;
    		// var numSegments = 6;
    		$scope.setColumnBars(3);
    		$timeout(function(event) {
    			$scope.column.bar[0].segments = 6;
    			$scope.column.bar[1].segments = 3;
    			$scope.column.bar[2].segments = 3;
    		});
    	}
    	if($scope.column.shape == 'Shape 2') {
    		var numBars = 3;
    		var numSegments = 6;
    		$scope.setColumnBars(numBars);
    		$timeout(function(event) {
    			$scope.column.bar[0].segments = 6;
    			$scope.column.bar[1].segments = 6;
    			$scope.column.bar[2].segments = 6;
    		});
    		// $scope.setColumnSegments(numSegments);
    	}
    	if($scope.column.shape == 'UBarCap') {
    		$scope.setColumnBars(2);
    		$timeout(function(event) {
    			$scope.column.bar[0].segments = 5;
    			$scope.column.bar[1].segments = 3;
    		});
    	}
    }

    $scope.setShapeFields = function(individualBar) {
    	$timeout(function(event) {
    		if($scope.column.type!='Circular') {

    		var width = $scope.convertToInches($scope.column.width, $scope.column.widthinches);
    		var length = $scope.convertToInches($scope.column.lengthFt, $scope.column.lengthIn);
    		var tieClearance = $scope.convertToInches($scope.column.tieLength, $scope.column.tieLengthInches);
    		var barSize = num($scope.column.exteriorTieSize);
    		var barSizeFt = getFeet(barSize);
    		var barSizeIn = getInches(barSize);
    		var InteriorBar135 = num($scope.column.interiorTieSize);
    		var InteriorBar135Ft = getFeet(InteriorBar135);
    		var InteriorBar135In = getInches(InteriorBar135);
    		var ExteriorBar135 = barSize;
    		var ExteriorBar135Ft = getFeet(ExteriorBar135);
    		var ExteriorBar135In = getInches(ExteriorBar135);


    		var barGrid = [];
    		barGrid[4.25] = 4;
    		barGrid[4.5] = 4.5;
    		barGrid[5.5] = 6;
    		barGrid[8] = 12;
    		barGrid[9] = 14;
    		barGrid[10.5] = 16;

    		var InteriorBar90 = barGrid[InteriorBar135];
    		var InteriorBar90Ft = getFeet(InteriorBar90);
    		var InteriorBar90In = getInches(InteriorBar90);

    		var ExteriorBar90 = barGrid[ExteriorBar135];
    		var ExteriorBar90Ft = getFeet(ExteriorBar90);
    		var ExteriorBar90In = getInches(ExteriorBar90);

    		var tieWidth = width - (tieClearance * 2);
    		var tieWidthFt = getFeet(tieWidth);
    		var tieWidthIn = getInches(tieWidth);

    		var tieLength = length - (tieClearance * 2);
    		var tieLengthFt = getFeet(tieLength);
    		var tieLengthIn = getInches(tieLength);

    		var column1B = length - (tieClearance * 2);
    		var column1BFt = getFeet(column1B);
    		var column1BIn = getInches(column1B);

    		var columnHook1 = barGrid[barSize];
    		var columnHook1Ft = getFeet(columnHook1);
    		var columnHook1In = getInchesExact(columnHook1);

    		var cBar2G = barGrid[InteriorBar135];
    		var cBar2GFt = getFeet(cBar2G);
    		var cBar2GIn = getInchesExact(cBar2G);

    		var cBar2H = column1B;
    		var cBar2HFt = getFeet(cBar2H);
    		var cBar2HIn = getInchesExact(cBar2H);

    		var cBar2L = barGrid[InteriorBar135];
    		var cBar2LFt = getFeet(cBar2L);
    		var cBar2LIn = getInchesExact(cBar2L);

    		var cBar3G = tieWidth;
    		var cBar3GFt = getFeet(cBar3G);
    		var cBar3GIn = getInchesExact(cBar3G);

    		var cBar3H = barGrid[InteriorBar135];
    		var cBar3HFt = getFeet(cBar3H);
    		var cBar3HIn = getInchesExact(cBar3H);

    		var cBar3I = barGrid[InteriorBar135];
    		var cBar3IFt = getFeet(cBar3I);
    		var cBar3IIn = getInchesExact(cBar3I);

    		var OneThirdBarSize = column1B * (1/3);
    		var OneThirdBarSizeFt = getFeet(OneThirdBarSize);
    		var OneThirdBarSizeIn = getInches(OneThirdBarSize);

    		var OneThirdWidth = tieWidth * (1/3);
    		var OneThirdWidthFt = getFeet(OneThirdWidth);
    		var OneThirdWidthIn = getInches(OneThirdWidth);

    		var bar = $scope.column.bar;
    		if($scope.column.shape == 'Exterior With Crossing T9s') {
    			$timeout(function(event) {
    				$scope.column.customBar[0].position = 'Exterior Tie';
		    		bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
		    		bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
		    		bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
		    		bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
		    		bar[0][4].ft = tieWidthFt; bar[0][4].inches = tieWidthIn;
		    		bar[0][5].ft = ExteriorBar135Ft; bar[0][5].inches = ExteriorBar135In;
		    		$scope.calculateBarLength(bar[0], 6);

		    		$scope.column.customBar[1].position = 'Interior Tie';
		    		bar[1][0].ft = InteriorBar90Ft; bar[1][0].inches = InteriorBar90In;
		    		bar[1][1].ft = tieLengthFt; bar[1][1].inches = tieLengthIn;
		    		bar[1][2].ft = InteriorBar135Ft; bar[1][2].inches = InteriorBar135In;
		    		$scope.calculateBarLength(bar[1], 3);

		    		$scope.column.customBar[2].position = 'Interior Tie';
		    		bar[2][0].ft = InteriorBar90Ft; bar[2][0].inches = InteriorBar90In;
		    		bar[2][1].ft = tieWidthFt; bar[2][1].inches = tieWidthIn;
		    		bar[2][2].ft = InteriorBar135Ft; bar[2][2].inches = InteriorBar135In;
		    		$scope.calculateBarLength(bar[2], 3);
    			});
	    	}
	    	if($scope.column.shape == 'Shape 2') {

	    		$timeout(function(event) {
	    			$scope.column.customBar[0].position = 'Exterior Tie';
	    			bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
	    			bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
	    			bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
	    			bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
	    			bar[0][4].ft = tieWidthFt; bar[0][4].inches = tieWidthIn;
	    			bar[0][5].ft = ExteriorBar135Ft; bar[0][5].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[0], 6);

	    			$scope.column.customBar[1].position = 'Interior Tie';
	    			bar[1][0].ft = InteriorBar135Ft; bar[1][0].inches = InteriorBar135In;
	    			bar[1][1].ft = OneThirdBarSizeFt; bar[1][1].inches = OneThirdBarSizeIn;
	    			bar[1][2].ft = tieWidthFt; bar[1][2].inches = tieWidthIn;
	    			bar[1][3].ft = OneThirdBarSizeFt; bar[1][3].inches = OneThirdBarSizeIn;
	    			bar[1][4].ft = tieWidthFt; bar[1][4].inches = tieWidthIn;
	    			bar[1][5].ft = InteriorBar135Ft; bar[1][5].inches = InteriorBar135In;
	    			$scope.calculateBarLength(bar[1], 6);

	    			$scope.column.customBar[2].position = 'Interior Tie';
	    			bar[2][0].ft = InteriorBar135Ft; bar[2][0].inches = InteriorBar135In;
	    			bar[2][1].ft = OneThirdWidthFt; bar[2][1].inches = OneThirdWidthIn;
	    			bar[2][2].ft = tieLengthFt; bar[2][2].inches = tieLengthIn;
	    			bar[2][3].ft = OneThirdWidthFt; bar[2][3].inches = OneThirdWidthIn;
	    			bar[2][4].ft = tieLengthFt; bar[2][4].inches = tieLengthIn;
	    			bar[2][5].ft = InteriorBar135Ft; bar[2][5].inches = InteriorBar135In;
	    			$scope.calculateBarLength(bar[2],6);
	    		});
	    	}

	    	if($scope.column.shape == 'UBarCap') {

	    		$timeout(function(event) {
	    			$scope.column.customBar[0].position = 'Exterior Tie';
	    			bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
	    			bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
	    			bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
	    			bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
	    			bar[0][4].ft = ExteriorBar135Ft; bar[0][4].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[0], 5);

	    			$scope.column.customBar[1].position = 'Exterior Tie';
	    			bar[1][0].ft = ExteriorBar135Ft; bar[1][0].inches = ExteriorBar135In;
	    			bar[1][1].ft = tieWidthFt; bar[1][1].inches = tieWidthIn;
	    			bar[1][2].ft = ExteriorBar135Ft; bar[1][2].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[1], 3);
	    		});
	    	}

	    	//CALCULATING STUFF FOR AN INDVIDUAL BAR
	    	if($scope.column.shape == 'Custom') {

	    		// RESET BAR
	    		for(i=0; i<$scope.numColumnBars.length; i++) {
	    			for(j=0; j<bar[i].length; j++) {
	    				bar[i][j].ft = 0;
	    				bar[i][j].inches = 0;
	    				bar[i][j].in = 0;
	    			}
	    		}

	    		for(i=0; i<$scope.numColumnBars.length; i++) {

	    			if($scope.column.customBar[i]) {

	    				if($scope.column.customBar[i].shape == 'LengthT9') {
	    					if($scope.column.customBar[i].position == 'Interior Tie') {
	    						bar[i][0].ft = InteriorBar90Ft; bar[i][0].inches = InteriorBar90In;
	    						bar[i][1].ft = cBar2HFt; bar[i][1].inches = cBar2HIn;
	    						bar[i][2].ft = InteriorBar135Ft; bar[i][2].inches = InteriorBar135In;
	    					}
	    					if($scope.column.customBar[i].position == 'Exterior Tie') {
	    						bar[i][0].ft = ExteriorBar90Ft; bar[i][0].inches = ExteriorBar90In;
	    						bar[i][1].ft = cBar2HFt; bar[i][1].inches = cBar2HIn;
	    						bar[i][2].ft = ExteriorBar135Ft; bar[i][2].inches = ExteriorBar135In;
	    					}
	    				}

	    				if($scope.column.customBar[i].shape == 'WidthT9') {
	    					if($scope.column.customBar[i].position == 'Interior Tie') {
		    					bar[i][0].ft = InteriorBar90Ft; bar[i][0].inches = InteriorBar90In;
	    						bar[i][1].ft = tieWidthFt; bar[i][1].inches = tieWidthIn;
		    					bar[i][2].ft = InteriorBar135Ft; bar[i][2].inches = InteriorBar135In;
	    					}
	    					if($scope.column.customBar[i].position == 'Exterior Tie') {
		    					bar[i][0].ft = ExteriorBar90Ft; bar[i][0].inches = ExteriorBar90In;
	    						bar[i][1].ft = tieWidthFt; bar[i][1].inches = tieWidthIn;
		    					bar[i][2].ft = ExteriorBar135Ft; bar[i][2].inches = ExteriorBar135In;
	    					}
	    				}

	    				if($scope.column.customBar[i].shape == 'exteriorTie') {
	    					if($scope.column.customBar[i].position == 'Interior Tie') {
		    					bar[i][0].ft = InteriorBar135Ft; bar[i][0].inches = InteriorBar135In;
	    						bar[i][1].ft = tieLengthFt; bar[i][1].inches = tieLengthIn;
	    						bar[i][2].ft = tieWidthFt; bar[i][2].inches = tieWidthIn;
	    						bar[i][3].ft = tieLengthFt; bar[i][3].inches = tieLengthIn;
	    						bar[i][4].ft = tieWidthFt; bar[i][4].inches = tieWidthIn;
		    					bar[i][5].ft = InteriorBar135Ft; bar[i][5].inches = InteriorBar135In;
	    					}
	    					if($scope.column.customBar[i].position == 'Exterior Tie') {
		    					bar[i][0].ft = ExteriorBar135Ft; bar[i][0].inches = ExteriorBar135In;
	    						bar[i][1].ft = tieLengthFt; bar[i][1].inches = tieLengthIn;
	    						bar[i][2].ft = tieWidthFt; bar[i][2].inches = tieWidthIn;
	    						bar[i][3].ft = tieLengthFt; bar[i][3].inches = tieLengthIn;
	    						bar[i][4].ft = tieWidthFt; bar[i][4].inches = tieWidthIn;
		    					bar[i][5].ft = ExteriorBar135Ft; bar[i][5].inches = ExteriorBar135In;
	    					}
	    				}

	    				bar[i].totalLength = 0;
	    				for(j=0; j<countProperties(bar); j++) {
	    					if(bar[i][j]) {
	    						bar[i].totalLength += $scope.convertToInches(bar[i][j].ft, bar[i][j].inches);
	    						bar[i].totalLengthft = Math.floor(bar[i].totalLength / 12);
	    						bar[i].totalLengthin = getInchesExact(bar[i].totalLength);
	    					}
	    				}


	    			}
	    			// $scope.calculateBarLength(bar[i]);
	    		}
	    	}
	    }
    	});
    }

    $scope.handleCustom = function() {
    	if($scope.column.shape == 'Custom') {
    		$scope.column.bar = null;
    		$scope.column.numBars = null;
    		$scope.setColumnBars(0);
    		$scope.setColumnSegments(0);
    	}
    }
    $scope.handleBeamCustom = function() {
    	if($scope.beam.shape == 'Custom') {
    		$scope.beam.bar = null;
    		$scope.beam.numBars = null;
    		$scope.setColumnBars(0);
    		$scope.setColumnSegments(0);
    	}
    }


    $scope.$watchCollection('[beam.width, beam.widthinches, beam.tieLength, beam.tieLengthInches, beam.lengthIn, beam.lengthFt, beam.exteriorTieSize, beam.interiorTieSize]', function(newValues, oldValues){
    	$scope.setBeamShapeFields();
    });

    $scope.setBeamShape = function() {
    	if($scope.beam.shape == 'Exterior With Crossing T9s') {
    		// var numBars = 3;
    		// var numSegments = 6;
    		$scope.setColumnBars(3);
    		$timeout(function(event) {
    			$scope.beam.bar[0].segments = 6;
    			$scope.beam.bar[1].segments = 3;
    			$scope.beam.bar[2].segments = 3;
    		});
    	}
    	if($scope.beam.shape == 'Shape 2') {
    		var numBars = 3;
    		var numSegments = 6;
    		$scope.setColumnBars(numBars);
    		$timeout(function(event) {
    			$scope.beam.bar[0].segments = 6;
    			$scope.beam.bar[1].segments = 6;
    			$scope.beam.bar[2].segments = 6;
    		});
    		// $scope.setColumnSegments(numSegments);
    	}
    	if($scope.beam.shape == 'UBarCap') {
    		$scope.setColumnBars(2);
    		$timeout(function(event) {
    			$scope.beam.bar[0].segments = 5;
    			$scope.beam.bar[1].segments = 3;
    		});
    	}
    }

    $scope.setBeamShapeFields = function() {
    	$timeout(function(event) {
    		if($scope.beam.type!='Circular') {

    		var width = $scope.convertToInches($scope.beam.width, $scope.beam.widthinches);
    		var length = $scope.convertToInches($scope.beam.lengthFt, $scope.beam.lengthIn);
    		var tieClearance = $scope.convertToInches($scope.beam.tieLength, $scope.beam.tieLengthInches);
    		var barSize = num($scope.beam.exteriorTieSize);
    		var barSizeFt = getFeet(barSize);
    		var barSizeIn = getInches(barSize);
    		var InteriorBar135 = num($scope.beam.interiorTieSize);
    		var InteriorBar135Ft = getFeet(InteriorBar135);
    		var InteriorBar135In = getInches(InteriorBar135);
    		var ExteriorBar135 = barSize;
    		var ExteriorBar135Ft = getFeet(ExteriorBar135);
    		var ExteriorBar135In = getInches(ExteriorBar135);


    		var barGrid = [];
    		barGrid[4.25] = 4;
    		barGrid[4.5] = 4.5;
    		barGrid[5.5] = 6;
    		barGrid[8] = 12;
    		barGrid[9] = 14;
    		barGrid[10.5] = 16;

    		var InteriorBar90 = barGrid[InteriorBar135];
    		var InteriorBar90Ft = getFeet(InteriorBar90);
    		var InteriorBar90In = getInches(InteriorBar90);

    		var ExteriorBar90 = barGrid[ExteriorBar135];
    		var ExteriorBar90Ft = getFeet(ExteriorBar90);
    		var ExteriorBar90In = getInches(ExteriorBar90);

    		var tieWidth = width - (tieClearance * 2);
    		var tieWidthFt = getFeet(tieWidth);
    		var tieWidthIn = getInches(tieWidth);

    		var tieLength = length - (tieClearance * 2);
    		var tieLengthFt = getFeet(tieLength);
    		var tieLengthIn = getInches(tieLength);

    		var column1B = length - (tieClearance * 2);
    		var column1BFt = getFeet(column1B);
    		var column1BIn = getInches(column1B);

    		var columnHook1 = barGrid[barSize];
    		var columnHook1Ft = getFeet(columnHook1);
    		var columnHook1In = getInchesExact(columnHook1);

    		var cBar2G = barGrid[InteriorBar135];
    		var cBar2GFt = getFeet(cBar2G);
    		var cBar2GIn = getInchesExact(cBar2G);

    		var cBar2H = column1B;
    		var cBar2HFt = getFeet(cBar2H);
    		var cBar2HIn = getInchesExact(cBar2H);

    		var cBar2L = barGrid[InteriorBar135];
    		var cBar2LFt = getFeet(cBar2L);
    		var cBar2LIn = getInchesExact(cBar2L);

    		var cBar3G = tieWidth;
    		var cBar3GFt = getFeet(cBar3G);
    		var cBar3GIn = getInchesExact(cBar3G);

    		var cBar3H = barGrid[InteriorBar135];
    		var cBar3HFt = getFeet(cBar3H);
    		var cBar3HIn = getInchesExact(cBar3H);

    		var cBar3I = barGrid[InteriorBar135];
    		var cBar3IFt = getFeet(cBar3I);
    		var cBar3IIn = getInchesExact(cBar3I);

    		var OneThirdBarSize = column1B * (1/3);
    		var OneThirdBarSizeFt = getFeet(OneThirdBarSize);
    		var OneThirdBarSizeIn = getInches(OneThirdBarSize);

    		var OneThirdWidth = tieWidth * (1/3);
    		var OneThirdWidthFt = getFeet(OneThirdWidth);
    		var OneThirdWidthIn = getInches(OneThirdWidth);

    		var bar = $scope.beam.bar;
    		if($scope.beam.shape == 'Exterior With Crossing T9s') {
    			$timeout(function(event) {
    				$scope.beam.customBar[0].position = 'Exterior Tie';
		    		bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
		    		bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
		    		bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
		    		bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
		    		bar[0][4].ft = tieWidthFt; bar[0][4].inches = tieWidthIn;
		    		bar[0][5].ft = ExteriorBar135Ft; bar[0][5].inches = ExteriorBar135In;
		    		$scope.calculateBarLength(bar[0], 6);

		    		$scope.beam.customBar[1].position = 'Interior Tie';
		    		bar[1][0].ft = InteriorBar90Ft; bar[1][0].inches = InteriorBar90In;
		    		bar[1][1].ft = tieLengthFt; bar[1][1].inches = tieLengthIn;
		    		bar[1][2].ft = InteriorBar135Ft; bar[1][2].inches = InteriorBar135In;
		    		$scope.calculateBarLength(bar[1], 3);

		    		$scope.beam.customBar[2].position = 'Interior Tie';
		    		bar[2][0].ft = InteriorBar90Ft; bar[2][0].inches = InteriorBar90In;
		    		bar[2][1].ft = tieWidthFt; bar[2][1].inches = tieWidthIn;
		    		bar[2][2].ft = InteriorBar135Ft; bar[2][2].inches = InteriorBar135In;
		    		$scope.calculateBarLength(bar[2], 3);
    			});
	    	}
	    	if($scope.beam.shape == 'Shape 2') {
	    		$timeout(function(event) {
	    			$scope.beam.customBar[0].position = 'Exterior Tie';
	    			bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
	    			bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
	    			bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
	    			bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
	    			bar[0][4].ft = tieWidthFt; bar[0][4].inches = tieWidthIn;
	    			bar[0][5].ft = ExteriorBar135Ft; bar[0][5].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[0], 6);

	    			$scope.beam.customBar[1].position = 'Interior Tie';
	    			bar[1][0].ft = InteriorBar135Ft; bar[1][0].inches = InteriorBar135In;
	    			bar[1][1].ft = OneThirdBarSizeFt; bar[1][1].inches = OneThirdBarSizeIn;
	    			bar[1][2].ft = tieWidthFt; bar[1][2].inches = tieWidthIn;
	    			bar[1][3].ft = OneThirdBarSizeFt; bar[1][3].inches = OneThirdBarSizeIn;
	    			bar[1][4].ft = tieWidthFt; bar[1][4].inches = tieWidthIn;
	    			bar[1][5].ft = InteriorBar135Ft; bar[1][5].inches = InteriorBar135In;
	    			$scope.calculateBarLength(bar[1], 6);

	    			$scope.beam.customBar[2].position = 'Interior Tie';
	    			bar[2][0].ft = InteriorBar135Ft; bar[2][0].inches = InteriorBar135In;
	    			bar[2][1].ft = OneThirdWidthFt; bar[2][1].inches = OneThirdWidthIn;
	    			bar[2][2].ft = tieLengthFt; bar[2][2].inches = tieLengthIn;
	    			bar[2][3].ft = OneThirdWidthFt; bar[2][3].inches = OneThirdWidthIn;
	    			bar[2][4].ft = tieLengthFt; bar[2][4].inches = tieLengthIn;
	    			bar[2][5].ft = InteriorBar135Ft; bar[2][5].inches = InteriorBar135In;
	    			$scope.calculateBarLength(bar[2], 6);
	    		});
	    	}

	    	if($scope.beam.shape == 'UBarCap') {

	    		$timeout(function(event) {
	    			$scope.beam.customBar[0].position = 'Exterior Tie';
	    			bar[0][0].ft = ExteriorBar135Ft; bar[0][0].inches = ExteriorBar135In;
	    			bar[0][1].ft = tieLengthFt; bar[0][1].inches = tieLengthIn;
	    			bar[0][2].ft = tieWidthFt; bar[0][2].inches = tieWidthIn;
	    			bar[0][3].ft = tieLengthFt; bar[0][3].inches = tieLengthIn;
	    			bar[0][4].ft = ExteriorBar135Ft; bar[0][4].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[0], 5);

	    			$scope.beam.customBar[1].position = 'Exterior Tie';
	    			bar[1][0].ft = ExteriorBar135Ft; bar[1][0].inches = ExteriorBar135In;
	    			bar[1][1].ft = tieWidthFt; bar[1][1].inches = tieWidthIn;
	    			bar[1][2].ft = ExteriorBar135Ft; bar[1][2].inches = ExteriorBar135In;
	    			$scope.calculateBarLength(bar[1], 3);
	    		});
	    	}

	    	//CALCULATING STUFF FOR AN INDVIDUAL BAR
	    	if($scope.beam.shape == 'Custom') {
	    		for(i=0; i<$scope.numColumnBars.length; i++) {

	    			if($scope.beam.customBar[i]) {

	    				if($scope.beam.customBar[i].shape == 'LengthT9') {
	    					if($scope.beam.customBar[i].position == 'Interior Tie') {
	    						bar[i][0].ft = InteriorBar90Ft; bar[i][0].inches = InteriorBar90In;
	    						bar[i][1].ft = cBar2HFt; bar[i][1].inches = cBar2HIn;
	    						bar[i][2].ft = InteriorBar135Ft; bar[i][2].inches = InteriorBar135In;
	    					}
	    					if($scope.beam.customBar[i].position == 'Exterior Tie') {
	    						bar[i][0].ft = ExteriorBar90Ft; bar[i][0].inches = ExteriorBar90In;
	    						bar[i][1].ft = cBar2HFt; bar[i][1].inches = cBar2HIn;
	    						bar[i][2].ft = ExteriorBar135Ft; bar[i][2].inches = ExteriorBar135In;
	    					}
	    				}

	    				if($scope.beam.customBar[i].shape == 'WidthT9') {
	    					if($scope.beam.customBar[i].position == 'Interior Tie') {
		    					bar[i][0].ft = InteriorBar90Ft; bar[i][0].inches = InteriorBar90In;
	    						bar[i][1].ft = tieWidthFt; bar[i][1].inches = tieWidthIn;
		    					bar[i][2].ft = InteriorBar135Ft; bar[i][2].inches = InteriorBar135In;
	    					}
	    					if($scope.beam.customBar[i].position == 'Exterior Tie') {
		    					bar[i][0].ft = ExteriorBar90Ft; bar[i][0].inches = ExteriorBar90In;
	    						bar[i][1].ft = tieWidthFt; bar[i][1].inches = tieWidthIn;
		    					bar[i][2].ft = ExteriorBar135Ft; bar[i][2].inches = ExteriorBar135In;
	    					}
	    				}

	    				if($scope.beam.customBar[i].shape == 'exteriorTie') {
	    					if($scope.beam.customBar[i].position == 'Interior Tie') {
		    					bar[i][0].ft = InteriorBar135Ft; bar[i][0].inches = InteriorBar135In;
	    						bar[i][1].ft = tieLengthFt; bar[i][1].inches = tieLengthIn;
	    						bar[i][2].ft = tieWidthFt; bar[i][2].inches = tieWidthIn;
	    						bar[i][3].ft = tieLengthFt; bar[i][3].inches = tieLengthIn;
	    						bar[i][4].ft = tieWidthFt; bar[i][4].inches = tieWidthIn;
		    					bar[i][5].ft = InteriorBar135Ft; bar[i][5].inches = InteriorBar135In;
	    					}
	    					if($scope.beam.customBar[i].position == 'Exterior Tie') {
		    					bar[i][0].ft = ExteriorBar135Ft; bar[i][0].inches = ExteriorBar135In;
	    						bar[i][1].ft = tieLengthFt; bar[i][1].inches = tieLengthIn;
	    						bar[i][2].ft = tieWidthFt; bar[i][2].inches = tieWidthIn;
	    						bar[i][3].ft = tieLengthFt; bar[i][3].inches = tieLengthIn;
	    						bar[i][4].ft = tieWidthFt; bar[i][4].inches = tieWidthIn;
		    					bar[i][5].ft = ExteriorBar135Ft; bar[i][5].inches = ExteriorBar135In;
	    					}
	    				}

	    				bar[i].totalLength = 0;
	    				for(j=0; j<countProperties(bar); j++) {
	    					if(bar[i][j]) {
	    						bar[i].totalLength += $scope.convertToInches(bar[i][j].ft, bar[i][j].inches);
	    						bar[i].totalLengthft = Math.floor(bar[i].totalLength / 12);
	    						bar[i].totalLengthin = getInchesExact(bar[i].totalLength);
	    					}
	    				}


	    			}
	    			// $scope.calculateBarLength(bar[i]);
	    		}
	    	}
	    }
    	}); // TIMEOUT FINISHED
    }

    $scope.column = {};
    $scope.column.section = {};
    $scope.column.circularTie ={};

    $scope.calculateQuantities = function(column) {

    	
    		column.height_in = (num(column.height) * 12) + num(column.heightinches);
    		// column.stockLength_in = (num(column.stocklength) * 12) + num(column.stocklengthinches);

    		var column = column;
    		var multiplier = num(column.multiplier);
    		var multiplier2 = num(column.multiplier2);
    		var totalMultiplier = multiplier * multiplier2;

    		$scope.mainBarQuantity = num(Math.floor(column.numVerts));
    		column.stocklength = $scope.convertToInches(column.height, column.heightinches);

    		if(column.vertType) {
	    		if(column.vertType.indexOf('Hook') > -1) {
	    			column.stocklength += num($scope.convertToInches(column.hooklength, column.hooklengthinches));
	    		}
	    		if(column.vertType.indexOf('Lap Length') > -1) {
	    			column.stocklength += num(column.laplength);
	    		}
	    	}

    		column.stocklengthinches = currencyRound(decimal(column.stocklength/12)*12);
    		column.stocklength = Math.floor(column.stocklength/12);

    		column.width_in = $scope.convertToInches(column.width, column.widthinches);
    		column.length_in = $scope.convertToInches(column.length, column.lengthinches);
    		column.tieClearance_in = $scope.convertToInches(column.tieLength, column.tieLengthInches);

    		$scope.exteriorTieTotal = ((2 * (num(column.width_in) - (num(column.tieClearance_in) * 2)) + (2 * (num(column.length_in) - (num(column.tieClearance_in) * 2)))) + 2*num(column.exteriorTieSize)) / 12;
    		$scope.exteriorTieFt = Math.floor($scope.exteriorTieTotal);
    		$scope.exteriorTieInches = currencyRound(decimal($scope.exteriorTieTotal) * 12);

    		if($scope.column.type=='Circular') {
    			// CIRCLE VARIABLES
    			var diameter = $scope.convertToInches($scope.column.diameterFT, $scope.column.diameterIN);
    			var tieClearance = $scope.convertToInches($scope.column.tieLength, $scope.column.tieLengthInches);
    			diameter -= tieClearance * 2;
    			var circumference = Math.PI * diameter;
    			var laplength = num($scope.column.circularTie.laplength);
    			var length_in = circumference + laplength;
    			$scope.setColumnBars(1);
    			$scope.setColumnSegments(1);

    			if(!column.spiral) {
    				$scope.circularTieFT = getFeet(length_in);
    				$scope.circularTieIN = getInches(length_in);
    			} else {
    				$scope.circularTieFT = 0;
    				$scope.circularTieIN = 0;
    			}
    		}

			$scope.exteriorTieQuantity = {};
			for(bar=0; bar<$scope.numColumnBars.length; bar++) {
				$scope.exteriorTieQuantity[bar] = 0;
				for(i=0; i<$scope.numSections.length; i++) {
					if(column.section[i]) {
						var sectionDistance = $scope.convertToInches(column.section[i].Distance, column.section[i].DistanceInches);
						var sectionSpacing = $scope.convertToInches(column.section[i].Spacing, column.section[i].SpacingInches);
						column.section[i].Quantity = Math.ceil(sectionDistance / sectionSpacing) + 1;
						if(column.section[i].QuantityOveride) {
							column.section[i].Quantity = num(column.section[i].QuantityOveride);
						}
						$scope.exteriorTieQuantity[bar] += column.section[i].Quantity;
					}
				}
				$scope.exteriorTieQuantity[bar] = $scope.exteriorTieQuantity[bar] * num(column.bar[bar].barQuantity) * totalMultiplier;

				// CALCULATE BAR SECTION WEIGHT



				if(column.customBar[bar].position == 'Exterior Tie') {
					column.bar[bar].size = column.exteriorTieSize;
				}
				if(column.customBar[bar].position == 'Interior Tie') {
					column.bar[bar].size = column.interiorTieSize;
				}


				column.bar[bar].size = $scope.sizeGrid[column.bar[bar].size];

				column.bar[bar].barWeight = $scope.itemWeight({
					size:column.bar[bar].size,
					length:column.bar[bar].totalLengthft,
					lengthinches:column.bar[bar].totalLengthin,
					quantity:$scope.exteriorTieQuantity[bar],
					multiplier:1,
					secondmultiplier:1,
					waste:0
				});

    		}

    		//Spiral Tie Quantity and Weight
    		if(column.spiral && column.type == 'Circular') {
    			var pitchFT = column.pitchFT;
    			var pitchIN = column.pitchIN;
    			var pitchLength = $scope.convertToInches(pitchFT, pitchIN);



    			var spiralLength = ((column.height_in / pitchLength) + 3) * (diameter * 3.14159);

    			$scope.spiralLengthFT = getFeet(spiralLength);
    			$scope.spiralLengthIN = getInchesExact(spiralLength);

    			$scope.spiralQuantity = 1 * totalMultiplier;

    			$scope.spiralWeight = $scope.itemWeight({
    				size: column.circularTie.size,
    				length: $scope.spiralLengthFT,
    				lengthinches: $scope.spiralLengthIN,
    				quantity: $scope.spiralQuantity,
    				multiplier:1,
    				secondmultiplier:1,
    				waste: 0
    			})

    		} else {
    			$scope.spiralQuantity = 0;
    			$scope.spiralWeight = 0;
    		}

    		//MULTIPLIERS
    		// $scope.exteriorTieQuantity = $scope.exteriorTieQuantity * multiplier;
    		$scope.mainBarQuantity = $scope.mainBarQuantity * totalMultiplier;

    		$scope.calculateColumnTieWeight();
    };

    $scope.addColumnItems = function(column) {
    	var Items = firebase.child('Items');
    	var groupID = column.groupID;


    	if($scope.group.title) {
    		var Groups = firebase.child('Groups');
    		$scope.group.estimateID = $state.params.estimateID;
    		var createdGroup = Groups.push($scope.group);
    		groupID = $firebaseObject(createdGroup).$id;
    		$scope.item.groupID = groupID;
    		$scope.group.title = null;
    	}
    	if(column) {
    		column.estimateID = $state.params.estimateID;
    		column.groupID = groupID;
    		if(!$scope.column.multiplier) {
    			$scope.column.multiplier = 1;
    		}
    		column.quantity = $scope.mainBarQuantity;
    		column.length = column.stocklength;
    		column.lengthinches = num(column.stocklengthinches);
    		column.tool = 'Column';
    		column.group = Date.now() / 1000 | 0; // ASSOCIATE THIS WITH A GROUP
    		Items.safePush(column); // Main Bars

    		column.quantity = $scope.extraBarQuantity;
    		column.length = $scope.extraBarFt;
    		Items.safePush(column); // Extra Bars

    		// Tie Bars
    		column.quantity = $scope.tieBarQuantity;
    		column.length = $scope.tieFt;
    		column.lengthinches = $scope.tieInches;
    		Items.safePush(column);
    	}
    	$scope.expandGroup(groupID, 'override');
    	$("#newQuantity").focus();
    	$('#newQuantity').effect('highlight', {}, 1000);
    	$('html, body').animate({
    	        scrollTop: $("#addItemsArea").offset().top
    	    }, 2000);
    }

    $scope.vary = {};
    $scope.$watch('vary', function () { 
    	$scope.setVary();
    }, true);
    $scope.circular = {};
    $scope.$watch('circular', function () { 
    	$scope.setCircular();
    }, true);

    $scope.setVary = function() {
    	if($scope.vary) {
    		$scope.vary.totalWeight = 0;
    		var distance1 = $scope.convertToInches($scope.vary.distance1, $scope.vary.distance1inches);
    		var distance2 = $scope.convertToInches($scope.vary.distance2, $scope.vary.distance2inches);
    		var clearance = $scope.convertToInches($scope.vary.clearance, $scope.vary.clearanceinches);
    		var stock = $scope.convertToInches($scope.vary.stock, $scope.vary.stockinches);
    		var span = $scope.convertToInches($scope.vary.span, $scope.vary.spaninches);
    		var spacing = $scope.convertToInches($scope.vary.spacing, $scope.vary.spacinginches);
    		var spacingOption = $scope.vary.spacingOptions;
    		var laplength = num($scope.vary.laplength);
    		var lapdiameter = num($scope.vary.diameter);
    		var multiplier = num($scope.vary.multiplier);
    		var multiplier2 = num($scope.vary.multiplier2);
    		var totalMultiplier = multiplier * multiplier2;

    		// STANDARD
    		var average = ( (distance1 - (clearance * 2)) + (distance2 - (clearance * 2)) ) /2;
    		$scope.vary.average = average;
    		var numRows = Math.ceil((span / spacing) + 1);
    		var bar2 = ((distance2 - distance1) / span) * spacing + distance1;
    		var barEnd = distance2 - ((distance2 - distance1) / span) * spacing;

    		if(spacingOption == 'Remove Bar At Left End') {
    			average = ( (bar2 - (clearance * 2)) + (distance2 - (clearance * 2)) ) /2;
    			numRows = Math.ceil((span / spacing));
    		}

    		if(spacingOption == 'Remove Bar At Right End') {
    			average = ( (barEnd - (clearance * 2)) + (distance1 - (clearance * 2)) ) / 2;
    			numRows = Math.ceil((span / spacing));
    		}

    		if(spacingOption == 'Remove Bar At Both Ends') {
    			average = ( (bar2 - (clearance*2)) + (barEnd - (clearance * 2)) ) / 2;
    			numRows = Math.ceil((span / spacing) - 1);
    		}

    		if($scope.vary.bendDim1 || $scope.vary.bendDim2) {
    			var bendDim1 = $scope.convertToInches($scope.vary.end1FT, $scope.vary.end1IN);
    			var bendDim2 = $scope.convertToInches($scope.vary.end2FT, $scope.vary.end2IN);
    		}

    		if($scope.vary.type != '2Pieces') {
	    		average += bendDim1 + bendDim2;
	    	}

    		// CALCULATE EXTRA BARS BASED ON STOCK BARS
    		var stockBarRawQuantity = average / (stock - laplength);
    		var stockBarQuantity = Math.floor(stockBarRawQuantity);
    		var stockBarFT = getFeet(stock);
    		var stockBarIN = getInchesExact(stock);
    		var stockBarExtraLength = decimal(stockBarRawQuantity) * (stock - laplength);
    		var stockBarExtraLengthFT = getFeet(stockBarExtraLength);
    		var stockBarExtraLengthIN = getInchesExact(stockBarExtraLength);

    		var averageFT = getFeet(average);
    		var averageIN = getInchesExact(average);

    		$scope.mainBarQuantity = totalMultiplier * (numRows * stockBarQuantity);
    		$scope.mainBarFT = stockBarFT;
    		$scope.mainBarIN = stockBarIN;
    		$scope.extraBarFt = stockBarExtraLengthFT;
    		$scope.extraBarIn = stockBarExtraLengthIN;
    		$scope.extraBarQuantity = totalMultiplier * (1 * numRows);

    		var diameterOver = num($scope.convertToInches($scope.vary.diameterOver, $scope.vary.diameterOverInches));

    		if(stockBarExtraLength < diameterOver) {
    			$scope.mainBarQuantity = Math.floor($scope.mainBarQuantity);
    			$scope.mainBarQuantity -= 1;
    			var extraBarLength = average - ( (stockBarQuantity-1) * (stock - laplength));
    			$scope.extraBarFt = getFeet(extraBarLength);
    			$scope.extraBarIn = getInchesExact(extraBarLength);
    		}

    		// CALCULATE HOOK BARS IF 2 PIECE
    		if($scope.vary.type == '2Pieces') {
    			var end1Distance = bendDim1;
    			var end2Distance = bendDim2;
    			var hookBar1Quantity = numRows;
    			var hookBar1Length = laplength + end1Distance;
    			var hookBar2Quantity = numRows;
    			var hookBar2Length = laplength + end2Distance;

    			if(end1Distance == 0) {
    				hookBar1Quantity = 0;
    			}
    			if(end2Distance == 0) {
    				hookBar2Quantity = 0;
    			}

    			$scope.hookBar1Quantity = hookBar1Quantity * totalMultiplier;
    			$scope.hookBar1LengthFT = getFeet(hookBar1Length);
    			$scope.hookBar1LengthIN = getInchesExact(hookBar1Length);
    			$scope.hookBar2Quantity = hookBar2Quantity * totalMultiplier;
    			$scope.hookBar2LengthFT = getFeet(hookBar2Length);
    			$scope.hookBar2LengthIN = getInchesExact(hookBar2Length);

    			$scope.vary.hookBar1Weight = $scope.itemWeight({size:$scope.vary.size,length:$scope.hookBar1LengthFT,lengthinches:$scope.hookBar1LengthIN,quantity:$scope.hookBar1Quantity,multiplier:1,secondmultiplier:1,waste:0});
    			$scope.vary.hookBar2Weight = $scope.itemWeight({size:$scope.vary.size,length:$scope.hookBar2LengthFT,lengthinches:$scope.hookBar2LengthIN,quantity:$scope.hookBar2Quantity,multiplier:1,secondmultiplier:1,waste:0});

    		} else {
    			$scope.hookBar1Quantity = 0;
    			$scope.hookBar2Quantity = 0;
    		}

    		// CALCULATE WEIGHTS
    		$scope.vary.mainBarWeight = $scope.itemWeight({size:$scope.vary.size,length:$scope.mainBarFT,lengthinches:$scope.mainBarIN,quantity:$scope.mainBarQuantity,multiplier:1,secondmultiplier:1,waste:0});
    		$scope.vary.extraBarWeight = $scope.itemWeight({size:$scope.vary.size,length:$scope.extraBarFt,lengthinches:$scope.extraBarIn,quantity:$scope.extraBarQuantity,multiplier:1,secondmultiplier:1,waste:0});

    		if($scope.vary.mainBarWeight < 0) {$scope.vary.mainBarWeight = 0;}
    		if($scope.vary.extraBarWeight < 0) {$scope.vary.extraBarWeight = 0;}

    		$scope.vary.totalWeight = currencyRound(num($scope.vary.mainBarWeight) + num($scope.vary.extraBarWeight) + num($scope.vary.hookBar1Weight) + num($scope.vary.hookBar2Weight));

    	}
    }

    $scope.convertToInches = function(ft, inches) {
    	return (num(ft) * 12) + num(inches);
    }

    $scope.copySlabs = function() {
    	slab1 = $scope.slab;
    	slab2 = $scope.slab.group2;

    	// spacing, spacinginches, spacingOptions, diameterOver, diameter, laplength, end1, end2, 
    	slab2.size = slab1.size;
    	slab2.stocklength = slab1.stocklength;
    	slab2.stocklengthinches = slab1.stocklengthinches;
    	slab2.spacing = slab1.spacing;
    	slab2.spacinginches = slab1.spacinginches;
    	slab2.spacingOptions = slab1.spacingOptions;
    	slab2.diameterOver = slab1.diameterOver;
    	slab2.diameter = slab1.diameter;
    	slab2.laplength = slab1.laplength;
    	slab2.end1 = slab1.end1;
    	slab2.end2 = slab1.end2;
    	slab2.grade = slab1.grade;
    }
	$scope.itemWeight = function(item) {
		//ITEM WEIGHT FORMULA
		var weight = 0;

		var sizeWeightMultiplier = 0.376
		if(item.size == 3) {
			sizeWeightMultiplier = 0.376
		}
		if(item.size == 4) {
			sizeWeightMultiplier = 0.668
		}
		if(item.size == 5) {
			sizeWeightMultiplier = 1.043
		}
		if(item.size == 6) {
			sizeWeightMultiplier = 1.502
		}
		if(item.size == 7) {
			sizeWeightMultiplier = 2.044
		}
		if(item.size == 8) {
			sizeWeightMultiplier = 2.670
		}
		if(item.size == 9) {
			sizeWeightMultiplier = 3.400
		}
		if(item.size == 10) {
			sizeWeightMultiplier = 4.303
		}
		if(item.size == 11) {
			sizeWeightMultiplier = 5.313
		}
		if(item.size == 14) {
			sizeWeightMultiplier = 7.650
		}
		if(item.size == 18) {
			sizeWeightMultiplier = 13.600
		}

		var totalLength = num(item.length) + num((item.lengthinches / 12));

		
		weight = num(item.quantity) * num(item.multiplier) * num(item.secondmultiplier) * num(sizeWeightMultiplier) * num(totalLength) * (1 + num(item.waste) / 100);



		weight = weight ? weight : 0;

		return currencyRound(weight);
	}
	$scope.itemCost = function(item, estimate) {
		var weight = $scope.itemWeight(item);
		var cost = 0;
		// var cost = parseFloat(weight * estimate.markupCost / 100);

		// ADD ADDITIONAL COST FROM BEND TYPES
		if(estimate.straightCost && item.lineType == 'Straight') {
			cost += parseFloat(num(estimate.straightCost) * weight);
		}
		if(estimate.lightCost && item.lineType == 'Light Bend') {
			cost += parseFloat(estimate.lightCost * weight);
		}
		if(estimate.heavyCost && item.lineType == 'Heavy Bend') {
			cost += parseFloat(estimate.heavyCost * weight);
		}
		if(estimate.specialCost && item.lineType == 'Special Bend') {
			cost += parseFloat(estimate.specialCost * weight);
		}

		// ADD ADDITIONAL COST FROM GRADE TYPE
		cost += parseFloat(num(estimate.gradeCost[item.grade]) * weight);

		cost = cost ? cost : 0;
		return cost;
	}

	$scope.meshLaborCost = function(item, estimate, costPerWorkingHour) {
		var cost = (item.totalSheets / item.sheetsPerManHour) * costPerWorkingHour;
		cost = cost ? cost : 0;
		return currencyRound(cost);
	}

	$scope.meshMaterialCost = function(item) {
		var cost = item.totalSheets * item.costPerSheet;
		cost = cost ? cost : 0;
		return currencyRound(cost);
	}

	$scope.laborCost = function(item, estimate, costPerWorkingHour, rate) {
		var weight = $scope.itemWeight(item);
		var sac = item.SAC;
		var difficulty=item.difficulty;

		var cost = ((weight / rate) * 8) * costPerWorkingHour;

		var originalCost = cost;
		// INCREASED COST CONSIDERATIONS
		if(estimate.weatherConsideration) {
			cost+=parseFloat((num(estimate.weatherConsideration)/100) * originalCost);
		}
		if(estimate.crawlspace) {
			cost+=parseFloat((num(estimate.crawlspace)/100) * originalCost);
		}
		if(estimate.heightAdjustments) {
			cost+=parseFloat((num(estimate.heightAdjustments)/100) * originalCost);
		}
		if(estimate.interference) {
			cost+=parseFloat((num(estimate.interference)/100) * originalCost);
		}
		if(estimate.naturalDisasters) {
			cost+=parseFloat((num(estimate.naturalDisasters)/100) * originalCost);
		}
		if(estimate.difficultSuppliers) {
			cost+=parseFloat((num(estimate.difficultSuppliers)/100) * originalCost);
		}

		cost = cost ? cost : 0;
		return currencyRound(cost);
	}

	$scope.expandGroup = function(groupID, override) {
		var user = firebase.child('Users').child($scope.userID);
		user.once('value', function(snap) {
			if(snap.val().openGroup == groupID && !override) {
				groupID = '';
			}
		});
		user.update({
			'openGroup':groupID
		}, function() {
			if(groupID && groupID != '') {
				// $('html, body').animate({
				//         scrollTop: $("#"+groupID).offset().top
				//     }, 0);
			}
		});
		
	}
	$scope.difficultyLevels = [
		{'level':'1'},
		{'level':'2'},
		{'level':'3'},
	];
	$scope.SACGroups = [
		{'name':'Footings'},
		{'name':'Slabs'},
		{'name':'Walls'},
		{'name':'Cages'},
		{'name':'Mesh'},
		{'name':'Site Work'},
		{'name':'Misc.'},
		{'name':'Columns'},
		{'name':'Beams'},
		{'name':'PT - Post Tension'},
		{'name':'F.O.B.'},
		{'name':'Tilt-Up'},
	];
	$scope.SACCodes = [
		{'code':'022', 'description':'Piling Caps', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'023', 'description':'Spread FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'024', 'description':'Mat FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'025', 'description':'CONT. FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'026', 'description':'Retaining Wall FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'027', 'description':'ShearWall FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'028', 'description':'Pier Wall FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'029', 'description':'Grade Beams', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'030', 'description':'Concrete Wall FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'031', 'description':'Tie Beams', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'034', 'description':'FTG Support Steel', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'037', 'description':'Masonry Wall FTGs', 'group':'Footings', 'one':1000, 'two':1000, 'three':1000},
		{'code':'032', 'description':'S.O.G. Rebar', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'033', 'description':'S.O.G. (DBL.Mat)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'038', 'description':'Wall Dowels', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'040', 'description':'Combined Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'043', 'description':'Sound Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'044', 'description':'Walls - DBL / Curtain', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'045', 'description':'Walls - DBL / Curtain HVY', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'046', 'description':'ShotConcrete Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'047', 'description':'ShearWalls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'050', 'description':'Columns', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'051', 'description':'Columns (Non-Frame)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'052', 'description':'Columns (Frame)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'053', 'description':'Columns (Shearwalls)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'054', 'description':'Columns (Precast)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'055', 'description':'Columns (Wrap/Rebar)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'056', 'description':'Pilasters', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'057', 'description':'Columns (Pre-Built / Yard)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'058', 'description':'Pedestals', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'039', 'description':'Column Dowels', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'060', 'description':'Combined Beams', 'group':'Beams', 'one':1000, 'two':1000, 'three':1000},
		{'code':'064', 'description':'Beams (Precast)', 'group':'Beams', 'one':1000, 'two':1000, 'three':1000},
		{'code':'065', 'description':'Beams (Post-Tension)', 'group':'Beams', 'one':1000, 'two':1000, 'three':1000},
		{'code':'068', 'description':'Beams Wrap / Rebar', 'group':'Beams', 'one':1000, 'two':1000, 'three':1000},
		{'code':'081', 'description':'Slabs (Mild)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'082', 'description':'Slabs (One-way)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'083', 'description':'Slabs (Two-way)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'084', 'description':'Slabs (Precast)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'085', 'description':'Slabs (On Metal Deck)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'086', 'description':'Slabs (Topping)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'087', 'description':'Slabs (Chord Bars)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'088', 'description':'Slabs (Post-Tensioned)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'089', 'description':'Slabs (Over Precast)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'090', 'description':'Slabs (Support Bars)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'091', 'description':'Slabs (Misc.)', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'092', 'description':'Barrier Slab', 'group':'Slabs', 'one':1000, 'two':1000, 'three':1000},
		{'code':'094', 'description':'Cross Gutters', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'107', 'description':'Column (Bridge)', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'108', 'description':'Pier Cages', 'group':'Cages', 'one':1000, 'two':1000, 'three':1000},
		{'code':'110', 'description':'Abutment Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'111', 'description':'Wing Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'112', 'description':'Pier Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'113', 'description':'Retaining Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'118', 'description':'BOT. Deck (P.T.)', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'119', 'description':'Topping Slab', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'121', 'description':'Top Deck (P.T.)', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'142', 'description':'Bent Columns', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'143', 'description':'Bent Column Flares', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'144', 'description':'Pier Columns', 'group':'Columns', 'one':1000, 'two':1000, 'three':1000},
		{'code':'211', 'description':'Wing Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'212', 'description':'Cannel Cut off Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'213', 'description':'Channel Parapet Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'215', 'description':'Shotcrete Tie Back Walls', 'group':'Walls', 'one':1000, 'two':1000, 'three':1000},
		{'code':'301', 'description':'T/U Panels (Solid)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'302', 'description':'T/U Panels (W/OPNGs)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'303', 'description':'T/U Panels (All)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'304', 'description':'T/U Columns (W/Panels)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'305', 'description':'T/U Columns (In-Place)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'306', 'description':'T/U Beams (In-Panels)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'307', 'description':'T/U Pour Strips', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'308', 'description':'T/U Panels (DBL-Solid)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'309', 'description':'T/U Panels (DBL-W/OPNGs)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'310', 'description':'T/U Panels (DBL-ALL)', 'group':'Tilt-Up', 'one':1000, 'two':1000, 'three':1000},
		{'code':'401', 'description':'Mesh S.O.G.', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'402', 'description':'Mesh S.O.M.D.', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'403', 'description':'Mesh S.O.M.D.', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'404', 'description':'Mesh S.O.M.D.', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'405', 'description':'Mesh Column Wrap', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'406', 'description':'Mesh Slab Panels', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'407', 'description':'Mesh Beam Cages', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'408', 'description':'Mesh Wall Panels', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'409', 'description':'Mesh Topping Slab', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'410', 'description':'Mesh Stair Treads', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'411', 'description':'Mesh Beam Wrapped', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'421', 'description':'Mesh Installed - Converted Jobs', 'group':'Mesh', 'one':1000, 'two':1000, 'three':1000},
		{'code':'500', 'description':'P.T. Material Buy Out', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'501', 'description':'P.T. Slab Cables', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'502', 'description':'P.T. Beam Cables', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'503', 'description':'P.T. Chord Strand', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'504', 'description':'P.T. Stress (Slabs)', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'505', 'description':'P.T. Stress (Beams)', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'506', 'description':'P.T. Cut & Burn', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'507', 'description':'P.T. Support', 'group':'PT - Post Tension', 'one':1000, 'two':1000, 'three':1000},
		{'code':'605', 'description':'Sumps', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'606', 'description':'Mechanical Pads', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'607', 'description':'Equipment Pads', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'608', 'description':'Site Work', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'609', 'description':'Light Pole', 'group':'Site Work', 'one':1000, 'two':1000, 'three':1000},
		{'code':'610', 'description':'Couplers (Rebar)', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'611', 'description':'Couplers (Form-Savers)', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'612', 'description':'Couplers (Other)', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'613', 'description':'MISC. (Other)', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'616', 'description':'Pour Watch', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'617', 'description':'Placing Aids', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'618', 'description':'Terminators', 'group':'Misc.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701', 'description':'FOB Rebar', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701A', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701B', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701C', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701D', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701E', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701F', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701G', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701H', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701I', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701J', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701K', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701L', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701M', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'701P', 'description':'FOB As Per Description', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'702', 'description':'Couplers FOB', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'703', 'description':'Form Savers', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'704', 'description':'Accessories Furnished FOB Jobsite', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'705', 'description':'FOB Masonry', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'706', 'description':'FOB Spiral Reinforcing', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'711', 'description':'FOB Grout DWLS', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'715', 'description':'FOB Mesh', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'721', 'description':'FOB Rebar - Converted Jobs', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'722', 'description':'FOB Mesh - Converted Jobs', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'723', 'description':'Premium FOB', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'890', 'description':'Hotel Allowance', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'892', 'description':'Cost of Bonds', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
		{'code':'893', 'description':'Jobsite Dumpster Fees', 'group':'F.O.B.', 'one':1000, 'two':1000, 'three':1000},
	];
	$scope.gradeOptions = [
		{'label':'A615/60', 'value':'A61560'},
		{'label':'A615/40', 'value':'A61540'},
		{'label':'A615/75', 'value':'A61575'},
		{'label':'A1035/100', 'value':'A1035100'},
		{'label':'A1035/120', 'value':'A1035120'},
		{'label':'A706/60', 'value':'A70660'},
		{'label':'A767/40', 'value':'A76740'},
		{'label':'A767/60', 'value':'A76760'},
		{'label':'A767/75', 'value':'A76775'},
		{'label':'A775/40', 'value':'A77540'},
		{'label':'A775/60', 'value':'A77560'},
		{'label':'A775/75', 'value':'A77575'},
		{'label':'A995/40', 'value':'A99540'},
		{'label':'A995/60', 'value':'A99560'},
		{'label':'A995/75', 'value':'A99575'},
		{'label':'A706/60G', 'value':'A70660G'},
		{'label':'A706/60E', 'value':'A70660E'},
		{'label':'A615/40G', 'value':'A61540G'},
		{'label':'A615/60G', 'value':'A61560G'},
		{'label':'A615/75G', 'value':'A61575G'},
		{'label':'A615/40E', 'value':'A61540E'},
		{'label':'A615/60E', 'value':'A61560E'},
		{'label':'A615/75E', 'value':'A61575E'},
	];
	$scope.endDimensions = [
		{'size':'3', 'label':'6" 90 Deg Std', 'value':'390DegStd:6'},
		{'size':'3', 'label':'4" 90 Deg Tie', 'value':'390DegTie:4'},
		{'size':'3', 'label':'4" 90 Seismic', 'value':'390Seismic:4'},
		{'size':'3', 'label':'5" 180 Deg Std', 'value':'3180DegStd:5'},
		{'size':'3', 'label':'5" 180 Deg Tie', 'value':'3180DegTie:5'},
		{'size':'3', 'label':'5" 180 Deg Seismic', 'value':'3180DegSeismic:5'},
		{'size':'3', 'label':'4" 135 Deg Tie', 'value':'3135DegTie:4'},
		{'size':'3', 'label':'5" 135 Deg Seismic', 'value':'3135DegSeismic:5'},
		{'size':'4', 'label':'8" 90 Deg Std', 'value':'490DegStd:8'},
		{'size':'4', 'label':'4.5" 90 Deg Tie', 'value':'490DegTie:4.5'},
		{'size':'4', 'label':'4.25" 90 Seismic', 'value':'490Seismic:4.25'},
		{'size':'4', 'label':'6" 180 Deg Std', 'value':'4180DegStd:6'},
		{'size':'4', 'label':'6" 180 Deg Tie', 'value':'4180DegTie:6'},
		{'size':'4', 'label':'6" 180 Deg Seismic', 'value':'4180DegSeismic:6'},
		{'size':'4', 'label':'4.5" 135 Deg Tie', 'value':'4135DegTie:4.5'},
		{'size':'4', 'label':'6.5" 135 Deg Seismic', 'value':'4135DegSeismic:6.5'},
		{'size':'5', 'label':'10" 90 Deg Std', 'value':'590DegStd:10'},
		{'size':'5', 'label':'6" 90 Deg Tie', 'value':'590DegTie:6'},
		{'size':'5', 'label':'6" 90 Seismic', 'value':'590Seismic:6'},
		{'size':'5', 'label':'7" 180 Deg Std', 'value':'5180DegStd:7'},
		{'size':'5', 'label':'7" 180 Deg Tie', 'value':'5180DegTie:7'},
		{'size':'5', 'label':'7" 180 Deg Seismic', 'value':'5180DegSeismic:7'},
		{'size':'5', 'label':'5.5" 135 Deg Tie', 'value':'5135DegTie:5.5'},
		{'size':'5', 'label':'8" 135 Deg Seismic', 'value':'5135DegSeismic:8'},
		{'size':'6', 'label':'1ft 90 Deg Std', 'value':'690DegStd:12'},
		{'size':'6', 'label':'1ft 90 Deg Tie', 'value':'690DegTie:12'},
		{'size':'6', 'label':'1ft 90 Seismic', 'value':'690Seismic:12'},
		{'size':'6', 'label':'8" 180 Deg Std', 'value':'6180DegStd:8'},
		{'size':'6', 'label':'8" 180 Deg Tie', 'value':'6180DegTie:8'},
		{'size':'6', 'label':'8" 180 Deg Seismic', 'value':'6180DegSeismic:8'},
		{'size':'6', 'label':'7.75" 135 Deg Tie', 'value':'6135DegTie:7.75'},
		{'size':'6', 'label':'10.75" 135 Deg Seismic', 'value':'6135DegSeismic:10.75'},
		{'size':'7', 'label':'1ft 2" 90 Deg Std', 'value':'790DegStd:14'},
		{'size':'7', 'label':'1ft 2" 90 Deg Tie', 'value':'790DegTie:14'},
		{'size':'7', 'label':'1ft 2" 90 Seismic', 'value':'790Seismic:14'},
		{'size':'7', 'label':'10" 180 Deg Std', 'value':'7180DegStd:10'},
		{'size':'7', 'label':'10" 180 Deg Tie', 'value':'7180DegTie:10'},
		{'size':'7', 'label':'10" 180 Deg Seismic', 'value':'7180DegSeismic:10'},
		{'size':'7', 'label':'9" 135 Deg Tie', 'value':'7135DegTie:9'},
		{'size':'7', 'label':'1ft 0.5" 135 Deg Seismic', 'value':'7135DegSeismic:12.5'},
		{'size':'8', 'label':'1ft 4" 90 Deg Std', 'value':'890DegStd:16'},
		{'size':'8', 'label':'1ft 4" 90 Deg Tie', 'value':'890DegTie:16'},
		{'size':'8', 'label':'1ft 4" 90 Seismic', 'value':'890Seismic:16'},
		{'size':'8', 'label':'11" 180 Deg Std', 'value':'8180DegStd:11'},
		{'size':'8', 'label':'11" 180 Deg Tie', 'value':'8180DegTie:11'},
		{'size':'8', 'label':'11" 180 Deg Seismic', 'value':'8180DegSeismic:11'},
		{'size':'8', 'label':'10.25" 135 Deg Tie', 'value':'8135DegTie:10.25'},
		{'size':'8', 'label':'1ft 2.25" 135 Deg Seismic', 'value':'8135DegSeismic:14.25'},
		{'size':'9', 'label':'1ft 7" 90 Deg Std', 'value':'990DegStd:19'},
		{'size':'9', 'label':'1ft 7" 90 Deg Tie', 'value':'990DegTie:19'},
		{'size':'9', 'label':'1ft 7" 90 Seismic', 'value':'990Seismic:19'},
		{'size':'9', 'label':'1ft 3" 180 Deg Std', 'value':'9180DegStd:15'},
		{'size':'9', 'label':'1ft 3" 180 Deg Tie', 'value':'9180DegTie:15'},
		{'size':'9', 'label':'1ft 3" 180 Deg Seismic', 'value':'9180DegSeismic:15'},
		{'size':'10', 'label':'1ft 10" 90 Deg Std', 'value':'1090DegStd:22'},
		{'size':'10', 'label':'1ft 10" 90 Deg Tie', 'value':'1090DegTie:22'},
		{'size':'10', 'label':'1ft 10" 90 Seismic', 'value':'1090Seismic:22'},
		{'size':'10', 'label':'1ft 5" 180 Deg Std', 'value':'10180DegStd:17'},
		{'size':'10', 'label':'1ft 5" 180 Deg Tie', 'value':'10180DegTie:17'},
		{'size':'10', 'label':'1ft 5" 180 Deg Seismic', 'value':'10180DegSeismic:17'},
		{'size':'11', 'label':'2ft 90 Deg Std', 'value':'1190DegStd:24'},
		{'size':'11', 'label':'2ft 90 Deg Tie', 'value':'1190DegTie:24'},
		{'size':'11', 'label':'2ft 90 Seismic', 'value':'1190Seismic:24'},
		{'size':'11', 'label':'1ft 7" 180 Deg Std', 'value':'11180DegStd:19'},
		{'size':'11', 'label':'1ft 7" 180 Deg Tie', 'value':'11180DegTie:19'},
		{'size':'11', 'label':'1ft 7" 180 Deg Seismic', 'value':'11180DegSeismic:19'},
		{'size':'14', 'label':'2ft 7" 90 Deg Std', 'value':'1490DegStd:31'},
		{'size':'14', 'label':'2ft 7" 90 Deg Tie', 'value':'1490DegTie:31'},
		{'size':'14', 'label':'2ft 7" 90 Seismic', 'value':'1490Seismic:31'},
		{'size':'14', 'label':'2ft 3" 180 Deg Std', 'value':'14180DegStd:27'},
		{'size':'14', 'label':'2ft 3" 180 Deg Tie', 'value':'14180DegTie:27'},
		{'size':'14', 'label':'2ft 3" 180 Deg Seismic', 'value':'14180DegSeismic:27'},
		{'size':'18', 'label':'3ft 5" 90 Deg Std', 'value':'1890DegStd:41'},
		{'size':'18', 'label':'3ft 5" 90 Deg Tie', 'value':'1890DegTie:41'},
		{'size':'18', 'label':'3ft 5" 90 Seismic', 'value':'1890Seismic:41'},
		{'size':'18', 'label':'3ft 180 Deg Std', 'value':'18180DegStd:36'},
		{'size':'18', 'label':'3ft 180 Deg Tie', 'value':'18180DegTie:36'},
		{'size':'18', 'label':'3ft 180 Deg Seismic', 'value':'18180DegSeismic:36'},
	];

	$scope.meshThicknesses = [
		{'title':'4in x 4in - W1.4 x W1.4', 'weight':'31'},
		{'title':'4in x 4in - W2.0 x W2.0', 'weight':'44'},
		{'title':'4in x 4in - W2.9 x W2.9', 'weight':'62'},
		{'title':'4in x 4in - W3.1 x W3.1', 'weight':'65'},
		{'title':'4in x 4in - W4.0 x W4.0', 'weight':'88'},
		{'title':'6in x 6in - W1.4 x W1.4', 'weight':'21'},
		{'title':'6in x 6in - W2.0 x W2.0', 'weight':'30'},
		{'title':'6in x 6in - W2.9 x W2.9', 'weight':'42'},
		{'title':'6in x 6in - W3.1 x W3.1', 'weight':'58'},
		{'title':'6in x 6in - W4.0 x W4.0', 'weight':'58'},
		{'title':'6in x 6in - W4.2 x W4.2', 'weight':'60'},
		{'title':'6in x 6in - W4.4 x W4.4', 'weight':'63'},
		{'title':'6in x 6in - W4.7 x W4.7', 'weight':'68'},
		{'title':'6in x 6in - W7.5 x W7.5', 'weight':'108'},
		{'title':'6in x 6in - W8.1 x W8.1', 'weight':'116'},
		{'title':'6in x 6in - W8.3 x W8.3', 'weight':'119'},
		{'title':'12in x 12in - W8.3 x W8.3', 'weight':'63'},
		{'title':'12in x 12in - W8.8 x W8.8', 'weight':'66'},
		{'title':'12in x 12in - W9.1 x W9.1', 'weight':'69'},
		{'title':'12in x 12in - W9.4 x W9.4', 'weight':'71'},
		{'title':'12in x 12in - W15 x W15', 'weight':'113'},
		{'title':'12in x 12in - W16 x W16', 'weight':'120'},
		{'title':'12in x 12in - W16.6 x W16.6', 'weight':'125'},
		{'title':'12in x 12in - W17.1 x W17.1', 'weight':'128'},
	];
	$scope.setHook = function(hookPreset, tool, target) {
		hookFT = 0;
		hookIN = hookPreset.split(':')[1];

		// SLAB HOOKS
		if(target == 'end1') {
			tool.end1FT = 0;
			tool.end1IN = hookIN;
		}
		if(target == 'end2') {
			tool.end2FT = 0;
			tool.end2IN = hookIN;
		}
		if(target == 'hooklength') {
			tool.hooklength = 0;
			tool.hooklengthinches = hookIN;
		}
	}
	$scope.SACItem = function(code) {
		var theItem = $scope.SACCodes.filter(function(x){ return x.code == code; });
		return theItem[0];
	}
	$scope.updateItem = function(itemID, itemDetails) {
		var item = firebase.child('Items').child(itemID);
		// itemObject.$save();
		// var item = firebase.child('Items').child(itemID);
		// delete itemDetails.$id;
		// delete itemDetails.$priority;
		// delete itemDetails.$$hashKey;
		// item.update(itemDetails);
		item.update(
			{
				'quantity': itemDetails.quantity,
				'multiplier': itemDetails.multiplier,
				'secondmultiplier': itemDetails.secondmultiplier,
				'size':itemDetails.size,
				'shape':itemDetails.shape,
				'length':itemDetails.length,
				'lengthinches':itemDetails.lengthinches,
				'grade':itemDetails.grade,
				'notes':itemDetails.notes || null
			});
	}
	$scope.removeItem = function(itemID) {
		var item = firebase.child('Items').child(itemID);
		item.remove();
	}
	$scope.changeItemGroup = function(itemid, groupid) {
	  var item = firebase.child('Item Groups').child(itemid);
	  item.update({
	    'topGroupID': groupid
	  }, function() {
	  	$timeout(function() {
		  	$scope.reinit();
	  	});
	  });
	}
	$scope.removeGroup = function(groupID) {
		var group = firebase.child('Groups').child(groupID);
		var itemsInGroup = firebase.child('Items').orderByChild('groupID').equalTo(groupID);
		itemsInGroup.once('value', function(items) {
			items.forEach(function(item) {
				item.ref().update({
					'groupID':'misc'
				});
			});
		});
		group.remove();
	}

	$scope.itemsTotalWeight = function(estimateID, groupID) {
		var items = firebase.child('Items').orderByChild('estimateID').equalTo(estimateID);
		var totalWeight = 0;
		items.once('value', function(snap) {
			snap.forEach(function(item) {
				if(item.val().groupID != 'misc' && (item.val().groupID == groupID || (item.val().groupID && groupID == 'all'))) {
					totalWeight+=$scope.itemWeight(item.val());
				}
			});
		});
		return totalWeight;
	}
	$scope.completedWeight = function(estimateID, groupID) {
		var items = firebase.child('Items').orderByChild('estimateID').equalTo(estimateID);
		var totalWeight = 0;
		items.once('value', function(snap) {
			snap.forEach(function(item) {
				if(item.val().groupID != 'misc' && (item.val().groupID == groupID || (item.val().groupID && groupID == 'all'))) {
					if(item.val().finished) {
						totalWeight+=$scope.itemWeight(item.val());
					}
				}
			});
		});
		return totalWeight;
	}
	$scope.itemsTotalCost = function(estimateID, estimate, groupID) {
		var items = firebase.child('Items').orderByChild('estimateID').equalTo(estimateID);

		var totalCost = 0;
		items.once('value', function(snap) {
			snap.forEach(function(item) {
				if(item.val().groupID != 'misc' && (item.val().groupID == groupID || (item.val().groupID && groupID == 'all'))) {
					totalCost+=$scope.itemCost(item.val(), estimate);
				}
			});
		});
		return totalCost;
	}

	$scope.newUser = {};
	$scope.registerUser = function(newUser) {

		if(!newUser.test) {
			// CREATE A STRIPE SUBSCRIPTION
			var $form = $('#payment-form');

			// Request a token from Stripe:
			Stripe.card.createToken($form, afterStripeSubmission);

			$scope.newUser = newUser;

			$scope.contentLoaded = false;
		} else {
			// Skip creating a charge and just create the user
			$scope.createNewUser();
		}
	}

	function afterStripeSubmission(status, response) {

		var newUser = $scope.newUser;

	  // Grab the form:
	  var $form = $('#payment-form');

	  if (response.error) { // Problem!

	    // Show the errors on the form:
	    $scope.error = response.error.message;
	    $scope.globalMessage(response.error.message, 1000);
	    // $form.find('.payment-errors').text(response.error.message);
	    $form.find('.submit').prop('disabled', false); // Re-enable submission

	    $scope.contentLoaded = true;

	  } else { // Token was created!

	    // Get the token ID:
	    var token = response.id;


	    if(token) {

	    	// CREATE SUBSCRIPTION IN STRIPE
	    	$http({
	    	  method  : 'POST',
	    	  url     : 'http://zen.ninja/paperlessScripts/createSubscription.php',
	    	  data    : {'token':token, 'email':$scope.newUser.email, 'plan':$scope.newUser.plan},  // pass in data as strings
	    	  headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
	    	 })
	    	  .success(function(data) {

		    	// Successfully created token
		    	$scope.createNewUser();

		    });
	    }

	  }

	}

	$scope.createNewUser = function() {
		firebase.createUser({
		  email    : $scope.newUser.email,
		  password : $scope.newUser.password
		}, function(error, userData) {
		  if (error) {
		  	$scope.globalMessage(error.message, 4000);
		  	$scope.contentLoaded = true;
		  } else {
		  	var createdCompany = firebase.child('Companies').push({name:$scope.newUser.companyName});
		  	var createdCompanyID = $firebaseObject(createdCompany).$id;
		  	var companyAssignments = firebase.child('CompanyAssignments').push({companyID:createdCompanyID, userID:userData.uid, role:'Admin'});
		    var createdUser = firebase.child('Users').push({
		    	name:$scope.newUser.name,
		    	email: $scope.newUser.email,
		    	userID: userData.uid,
		    	estimateCompanyID: createdCompanyID,
		    	companyBrowsing: createdCompanyID
		    });
		    var createdUserID = $firebaseObject(createdUser).$id;
		    var userRates = SACRatesRef.child(createdUserID).child('rates');
		    for(i=0; i<$scope.SACCodes.length; i++) {
		    	userRates.child(1).child($scope.SACCodes[i].code).set($scope.SACCodes[i].one);
		    	userRates.child(2).child($scope.SACCodes[i].code).set($scope.SACCodes[i].two);
		    	userRates.child(3).child($scope.SACCodes[i].code).set($scope.SACCodes[i].three);
		    }
		    var newEmployeeGroup = {
		    	baseRate: 35,
		    	costPerWorkingHour: 35,
		    	userID: createdUserID,
		    	name: 'Average Iron Worker'
		    };
		    employeeGroupRef.push(newEmployeeGroup);
		    $scope.user = $scope.newUser;
		    $scope.loginUser();
		  }
		});
	}

	$scope.user = {};
	$scope.loginUser = function() {
		firebase.authWithPassword({
		  email    : $scope.user.email,
		  password : $scope.user.password
		}, function(error, authData) {
		  if (error) {
		  	$scope.globalMessage(error.message + ' Reset your password or try again', 6000);
		  } else {
		  }
		});
	}
	$scope.logout = function() {
		firebase.unauth();
	}
	$scope.showEditGroup = function(groupID) {
		if($scope.editGroup == groupID) {
			$scope.editGroup = '';
		} else {
			$scope.editGroup = groupID;
		}
	}
	$scope.calculateQuantity = function() {
		var spanTotalIN = $scope.convertToInches($scope.assistant.span, $scope.assistant.spanIN);
		var spanTotalFT = parseFloat(spanTotalIN / 12);
		var spacingTotalIN = $scope.convertToInches($scope.assistant.spacing, $scope.assistant.spacingIN);
		var spacingTotalFT = parseFloat(spacingTotalIN / 12);
		$scope.standard.quantity = Math.round(1 + (spanTotalFT / spacingTotalFT));
		$('#startPointStandard').effect("highlight", {}, 1000);
	}
	$scope.calculateLength = function() {
		$scope.totalFeet = 0;
		$scope.totalInches = 0;
		for(i=0; i<$scope.assistant.bends.length; i++) {
			if($scope.assistant.bends[i].ft > 0) {
			    $scope.totalFeet += parseFloat($scope.assistant.bends[i].ft);
			}
			if($scope.assistant.bends[i].in > 0) {
			    $scope.totalInches += parseFloat($scope.assistant.bends[i].in);
			}
		}
		if($scope.totalInches) {
			$scope.totalCalculatedInches = (parseFloat($scope.totalFeet) * 12) + $scope.totalInches;
			$scope.totalFeet += Math.floor((parseFloat($scope.totalInches) / 12));
			$scope.calculatedInches = 12 * ((parseFloat($scope.totalCalculatedInches) / 12) - parseFloat($scope.totalFeet));
		}
		$scope.standard.toollength = $scope.totalFeet;
		$scope.standard.toollengthinches = Math.round(parseFloat($scope.calculatedInches)) || 0;
		$('#itemLength').effect("highlight", {}, 1000);
		$('#itemLengthInches').effect("highlight", {}, 1000);
	}

	$scope.currentDate = function() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();

		if(dd<10) {
		    dd='0'+dd
		} 

		if(mm<10) {
		    mm='0'+mm
		} 

		today = mm+'/'+dd+'/'+yyyy;
		return today;
	}
	$scope.estimateNumber = function() {
		var timestamp = new Date().getUTCMilliseconds();
		return timestamp ;
	}
	$scope.initDefaults = function() {
		// $scope.item.quantity = null;
		// $scope.item.length = null;
		// $scope.item.multiplier = 1;
		// $scope.item.secondmultiplier = 1;
		// $scope.item.size = '3';
		// $scope.item.shape = '3';
		// $scope.item.grade = '60';
		// $scope.item.lengthinches = 0;
		// $scope.item.lineType = "Strait";
		// $scope.item.partCode = "4";
		// $scope.slab.type = 1;
		$scope.entry.date = $scope.currentDate();		
	}

	$scope.assistant = {
		bends: [
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''},
			{ft:'', in: ''}
		]
	};


	$scope.groupName = function(groupID) {
		var group = firebase.child('Groups').child(groupID);
		var groupTitle = '';
		group.on('value', function(snapshot){
			groupTitle = snapshot.val().title;
		});
		return groupTitle;
	}

	$scope.hasGroupFilter = function() {
	  return function(item) {
	    return !item.groupID || item.groupID == 'misc';
	  };
	};

	$scope.reinit = function(scroll) {
		$scope.itemsLoaded = false;
		$timeout(function() {
			$scope.itemsLoaded = true;

		});
	}

	$scope.hasNoValidRates = function(estimateID, employeeID) {
		//var rates = firebase.child('Rates').orderByChild('estimateID').equalTo(estimateID);
		var hasNoValidRate = true;
		$scope.checkRates.on('value', function(snap) {
			snap.forEach(function(rate) {
				if(rate.val().employeeID == employeeID && rate.val().estimateID == estimateID) {
					hasNoValidRate = false;
				}
			});
		});
		return hasNoValidRate;
	}

	$scope.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    $scope.range = function(count){

      var ratings = []; 

      for (var i = 0; i < count; i++) { 
        ratings.push(i) 
      } 

      return ratings;
    }

    return true;
}
});

app.filter('unique', function() {
  
  var uniqueItems = [];
  function exists(item, parms) {
    return uniqueItems.some((i) => parms.every((p) => i[p] == item[p]));
  } 
  return function(arr, name, age) {
    
    if (arr) {
      uniqueItems.length = 0;
      angular.forEach(arr, function(item) {
        
        if (!exists(item, [name,age])) {
          uniqueItems.safePush(item);
        }
      });
      return uniqueItems;
    }
    return arr;
    
  }
});

app.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals);
  };
}]);

app.directive('confirmClick', function ($window) {
  var i = 0;
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$confirmClick' + i++,
          _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        var confirmMsg = attrs.confirmClick || 'Are you sure?';

        scope[fn] = function (event) {
          if($window.confirm(confirmMsg)) {
            scope.$eval(_ngClick, {$event: event});
          }
        };
      };
    }
  };
});

function num(number) {
	return parseFloat(number || 0);
}
function decimal(number) {
	return num(num(number) - num(Math.floor(number)));
}
function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}
function getFeet(totalInches) {
	return Math.floor(exactRound(parseFloat(totalInches))/12);
}
function getInches(totalInches) {
	return getInchesExact(totalInches);
	// return Math.round(decimal(exactRound(parseFloat(totalInches))/12) * 12);
}
function getInchesExact(totalInches) {
	return Math.round( (decimal(exactRound(parseFloat(totalInches))/12) * 12) * 100) / 100;
}
function exactRound(number) {
	return Math.round( parseFloat(number) * 1000) / 1000;	
}
function currencyRound(number) {
	return Math.round( parseFloat(number) * 100) / 100;	
}
function isEven(n) {
  return n == parseFloat(n)? !(n%2) : void 0;
}

Firebase.prototype.safeSet = function safeSet(val) {
  this.set(cleanObject(val));
};
Firebase.prototype.safePush = function safePush(val) {
  this.push(cleanObject(val));
};

function cleanup(value) {
	if(!value) {
		return '';
	} else {
		return value;
	}
}
function cleanObject(Object) {
	for (var prop in Object) {
	  if (Object[prop] === undefined) {
	    Object[prop] = '';
	  }
	} 
	return Object
}
function deepCleanObject(test, recurse) {
    for (var i in test) {
        if (test[i] === null) {
            delete test[i];
        } else if (recurse && typeof test[i] === 'object') {
            deepCleanObject(test[i], recurse);
        }
    }
}

function isValidItem(item) {
	if(item.quantity > 0 && (item.length > 0 || item.lengthinches > 0)) {
		return true;
	} else {
		return false;
	}
}

function goBack() {
    window.history.back();
}

function findObject(array, key, prop){
    // Optional, but fallback to key['name'] if not selected
    prop = (typeof prop === 'undefined') ? 'name' : prop;    

    for (var i=0; i < array.length; i++) {
        if (array[i][prop] === key) {
            return array[i];
        }
    }
}

// SHORTCUTS
app.directive('hotkey', function() {
  return {
    link: function(scope, element, attrs) {
      var config = scope.$eval(attrs.hotkey);
      var comboDown = false;

      angular.forEach(config, function(value, key) {
        angular.element(window).on('keydown', function(e) {


        	if(e.keyCode === Number(attrs.combo)) {
        		comboDown = true;
        	}
        	if(e.keyCode === Number(key) && comboDown) {
        		element.triggerHandler(value);
        	}


          if(!Number(attrs.combo)) {
          	if (e.keyCode === Number(key)) {
          	  element.triggerHandler(value)  
          	}
          }
        })
        angular.element(window).on('keyup', function(e) {
        	if(e.keyCode === 16) {
        		comboDown = false;
        	}
        })
      })
    }
  }
});