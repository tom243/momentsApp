var momentApp= angular.module('momentsApp',[]);

var model = {
	
};

momentApp.run(function($http){
	$http.get("https://shared-moments.herokuapp.com/getAllAlbums").success(function(data){
		console.log(data);
		model.items = data;
	});
});

momentApp.controller('momentsCtrl', function($scope){
	$scope.moment = model;
});
