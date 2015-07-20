
/************************************ANGULAR****************************************/

var app = angular.module('momentsApp', ["ngCookies", "ngRoute"]);

var model = {

};

var saveData = {
  albumName : null,
  creationAddress : null,
  contacts : [],
  mobile_event : false
};

var contactsSelected = [];

app.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl : 'home.html',
    controller : 'mainController'
  }).when('/albums', {
    templateUrl : 'albums.html',
    controller : 'albumsController'
  }).when('/contacts', {
    templateUrl : 'contacts.html',
    controller : 'contactsController'
  }).when('/createAlbum', {
    templateUrl : 'createAlbum.html',
    controller : 'createAlbumController'
  }).when('/viewAlbum', {
    templateUrl : 'viewAlbum.html',
    controller : 'viewAlbumController'
  }).when('/momentsMap', {
    templateUrl : 'momentsMap.html',
    controller : 'momentsMapController'
  }).when('/register', {
    templateUrl : 'register.html',
    controller : 'registerController'
  }).when('/viewImage', {
    templateUrl : 'viewImage.html',
    controller : 'viewImageController'
  });
});

/* *****************************  viewImage controller ********************************* */

app.controller('viewImageController', function($scope, $location) {

  var imageView = $location.search()["url"];
  var returnPage = $location.search()["page"];
  console.log("imageView " + imageView);
  $('#viewImage > section').css("background-image", "url(" + imageView + ")");

  $scope.returnToPage = function() {
    console.log("returnPage " + returnPage);
    window.location.href = "#/" + returnPage;
  }
});
/* *****************************  register controller ********************************* */

app.controller('registerController', function($scope, $http, $cookies) {

  $scope.submitUser = function() {
    $http.post("https://shared-moments.herokuapp.com/checkRegisteredUser", {
      activeUser : $scope.userName
    }).success(function(data) {
      if (data.exists) {
        registerUser = data;
        console.log("data", data);
        $cookies.activeUser = $scope.userName;
        console.log($cookies.activeUser);
        window.location.href = "#/albums";
      } else {
        $('#userNameInput').val("");
        $('#userNameInput').attr("placeholder", "user not exist!");

      }
    });
  };

  console.log("in albumsController");
});
/* *****************************  main controller ********************************* */

app.controller('mainController', function($scope, $cookies) {

  var i = 0;

  var refreshIntervalId = setInterval(fadeDivs, 1000);

  function fadeDivs() {
    if (i < 5) {
      $('#circle > section').css('background-image', 'url(images/icons/startLogo' + i + '.png)');
      i++;
    } else {
      clearInterval(refreshIntervalId);
      window.location.href = "#/register";
    }
  }


  console.log("in mainController");

});

/* *****************************  albums controller ********************************* */

app.controller('albumsController', function($scope, $http, $location, $cookies) {
  $scope.moment = model;
  $scope.activeUser = $cookies.activeUser;

  $('body').css("background-color", "#e7ebeb");
  $http.post("https://shared-moments.herokuapp.com/getAllAlbumsPerUser", {
    activeUser : $cookies.activeUser
  }).success(function(data) {
    model.items = data;
    console.log("data", data);
  });

  $scope.albumClicked = function(albumName) {
    $cookies.currentAlbumName = albumName;
    window.location.href = "#/viewAlbum";
  };

  console.log("in albumsController");
});

/* *****************************  contacts controller ********************************* */

app.controller('contactsController', function($scope, $http, filterFilter, $cookies, $filter) {
  $scope.contacts = model;
  $scope.selected = {};
  $scope.activeUser = $cookies.activeUser;

  $('body').css("background-color", "#fff");

  $scope.$watch(function() {
    return $scope.searchText;
  }, function() {
    $scope.searchFilter = {};
    if ($scope.searchText) {
      $scope.searchFilter = $scope.searchText;
    }
  });

  $http.get("https://shared-moments.herokuapp.com/contacts").success(function(data) {
    model.items = data;
  });

  if (saveData.contacts.length > 0) {
    angular.forEach(saveData.contacts, function(contact) {
      $scope.selected[contact] = true;
    });
  }
  $scope.submitContacts = function() {
    contactsSelected = [];

    angular.forEach($scope.selected, function(value, key) {
      if (value) {
        console.log(value);
        contactsSelected.push(key);
      }
    });


    window.location.href = "#/createAlbum";

    return false;

  };

  $scope.initializeContacts = function() {
    console.log("initializeContacts");
    $scope.selected = [];
    contactsSelected = [];
  }

  console.log("in contactsController");

});

/* *****************************  create album controller ********************************* */

app.controller('createAlbumController', function($scope, $http, $cookies) {
  var geocoder;
  $scope.moment = model;
  $scope.activeUser = $cookies.activeUser;

  $('body').css("background-color", "#fff");

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {
        $('#uploadPic').css("background-image", "url(../images/icons/pencil.png),url(" + e.target.result + ")");
        $('#uploadPic').css("background-size", "44px 44px,100% 100%");
        $('#uploadPic').css("background-position", "10px 404px,center center");
        $('#uploadPic').css("background-repeat", "no-repeat,no-repeat");
        $('#uploadPic').addClass('changed');

      }
      reader.readAsDataURL(input.files[0]);
    }
  }


  $("#uploadPic").change(function() {
    readURL(this);
  });

  $scope.initializeContacts = function() {
    console.log("initializeContacts");
    contactsSelected = [];
  }

  $scope.chooseContacts = function(albumName, contacts, creationAddress) {
    saveData.albumName = albumName;
    saveData.creationAddress = creationAddress;
    saveData.contacts = contacts;
    if ($('#mobile_event').is(":checked")) {
      saveData.mobile_event = true;
    }

    window.location.href = "#/contacts";
  }

  $scope.albumName = saveData.albumName;
  $scope.persons = contactsSelected;
  $scope.creationAddress = saveData.creationAddress;
  if (saveData.mobile_event)
    $('#mobile_event').prop('checked', true);

  saveData = {
    albumName : null,
    creationAddress : null,
    contacts : [],
    mobile_event : false
  };

  $scope.submitAlbum = function() {
    var mobile_event = false;

    $('.submitButtons > button').attr("disabled", true);
    $('.submitButtons > button').css("opacity", 0.5);

    if ($('#mobile_event').is(":checked")) {
      mobile_event = true;
    }

    $scope.persons.push($cookies.activeUser);
    // add active user to the member list

    $cookies.currentAlbumName = $scope.albumName

    var formData = new FormData();
    formData.append(document.getElementById("albumName").name, $scope.albumName);
    formData.append("creator_name", $cookies.activeUser);
    formData.append(document.getElementById("persons").name, contactsSelected);
    formData.append(document.getElementById("creationAddress").name, $scope.creationAddress);
    formData.append(document.getElementById("uploadPic").name, $('input[type=file]')[0].files[0]);
    formData.append(document.getElementById("mobile_event").name, mobile_event);

    $.ajax({
      url : "https://shared-moments.herokuapp.com/createAlbum",
      type : "POST",
      data : formData,
      processData : false, // tell jQuery not to process the data
      contentType : false // tell jQuery not to set contentType
    }).done(function(data) {
      console.log("In callback from ws");
      if (data == false) {
        console.log("please choose different album name!");
        $('.submitButtons > button').attr("disabled", false);
        $('.submitButtons > button').css("opacity", 1);
        $('#albumName').val("");
        $('#albumName').attr("placeholder", "album name already exist");
        $('#albumName').addClass('albumAlreadyExist');
      } else {
        contactsSelected = [];
        window.location.href = "#/viewAlbum"
      }
    }).fail(function(err) {
      console.log("Error: " + err);
    });

    return false;
  };

  $('#createAlbumTitle').text("create album");
  //NEED TO CHANGE THIS
  $('#AlbumCreation > h3').text("mobile event");

  $scope.currentLocation = function() {
    getLocation();
  }
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(codeLatLng);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  function codeLatLng(position) {
    console.log("Lat " + position.coords.latitude + "\n");
    console.log("Long " + position.coords.longitude + "\n");
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geocoder.geocode({
      'latLng' : latlng
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          console.log(results[1].formatted_address);
          $('#creationAddress').val(results[1].formatted_address);
          $('#creationAddress').trigger('input');
        } else {
          console.log('No results found');
        }
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
  }


  console.log("in createAlbumController");

});

/* *****************************  View album controller ********************************* */

app.controller('viewAlbumController', function($scope, $http, $location, $cookies) {
  $scope.moment = model;
  $scope.activeUser = $cookies.activeUser;
  $('body').css("background-color", "#e7ebeb");
  $http.get("https://shared-moments.herokuapp.com/viewAlbum/?album_name=" + $cookies.currentAlbumName).success(function(data) {
    model.items = data;
    console.log("data ", data);
    $('#details > nav > h3').text(data.persons.toString());
  });

  $scope.moveToViewImagePage = function(imageUrl) {
    console.log("imageUrl " + imageUrl);
    window.location.href = "#/viewImage?url=" + imageUrl + "&page=viewAlbum";
  }

  $scope.moveToMapPage = function() {
    window.location.href = "#/momentsMap";
  }

  $scope.addMoments = function() {
    console.log("addMoments click");
    $('#addMoment').css('display', 'none');
    $('#fileTypes').css('display', 'block');
  }

  $scope.uploadImage = function() {
    console.log("image ", $('#uploadPicture')[0].files);
    console.log("image ", $('#uploadPicture')[0].files[0]);
    if ($('#uploadPicture')[0].files && $('#uploadPicture')[0].files[0]) {
      $('#fileTypes > input').attr("disabled", true);
      $('#fileTypes > input + label').css("opacity", 0.5);
      getLocation("uploadPicture");

    }
  }

  $scope.uploadVideo = function() {
    console.log("video ", $('#uploadVideo')[0].files);
    console.log("video ", $('#uploadVideo')[0].files[0]);
    if ($('#uploadVideo')[0].files && $('#uploadVideo')[0].files[0]) {
      $('#fileTypes > input').attr("disabled", true);
      $('#fileTypes > input + label').css("opacity", 0.5);
      getLocation("uploadVideo");
    }
  }

  $scope.uploadText = function() {
    $(".wrapper").css("opacity", 0.6).css("background-color", "#454343");
    $("#popupTextBox").css("display", "block");
    console.log("uploadText");
  }

  $scope.popupTextBox = function() {
    $(".wrapper").css("opacity", 1).css("background-color", "#e7ebeb");
    $("#popupTextBox").css("display", "none");
    getLocation("uploadText");
  }
  function createDynamicSection(sectionType, time) {
    console.log("activeUser " + $cookies.activeUser);
    if (sectionType == "image") {
      $("<img src='images/icons/moment_line.png'><section class='post-" + sectionType + "'><article></article><article><p>" + time + "</p> <p>" + $cookies.activeUser + "</p></article></section>").insertBefore("#addMoment");
    } else if (sectionType == "video")
      $("<img src='images/icons/moment_line.png'><section class='post-" + sectionType + "'><article><video width=100% controls autoplay></video></article><article><p>" + time + "</p> <p>" + $cookies.activeUser + "</p></article></section>").insertBefore("#addMoment");
    else {
      $("<img src='images/icons/moment_line.png'><section class='post-" + sectionType + "'><article><p>" + $scope.userTextInput + " </p></article> <article><p>" + time + "</p> <p>" + $cookies.activeUser + "</p></article></section>").insertBefore("#addMoment");
      // need to create text section
    }
  };

  function readURL(input, type) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function(e) {

        if (type == "image") {
          $('#viewAlbumPage > section:nth-last-child(3) > article:nth-child(1)').css("background-image", "url(" + e.target.result + ")");
          $('#viewAlbumPage > section:nth-last-child(3) > article:nth-child(1)').css("background-size", "100% 100%");
        } else
          $('#viewAlbumPage > section:nth-last-child(3) > article > video').attr("src", e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
    $('#addMoment').css('display', 'block');
    $('#fileTypes').css('display', 'none');
  }

  function getLocation(type) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        sendToBackEnd(type, position.coords.latitude, position.coords.longitude);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  function sendToBackEnd(type, latitude, longitude) {
    var formData = new FormData();
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes();

    if (type == "uploadPicture" || type == "uploadVideo")
      formData.append($('#' + type).name, $('#' + type )[0].files[0]);
    else
      formData.append("userTextInput", $scope.userTextInput);
    formData.append("owner", $cookies.activeUser);
    formData.append("creation_time", time);
    formData.append("fileType", type);
    formData.append("album_name", model.items.album_name);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    console.log("latitude " + latitude);
    console.log("longitude " + longitude);

    $.ajax({
      url : "https://shared-moments.herokuapp.com/sendToBackEnd",
      type : "POST",
      data : formData,
      processData : false, // tell jQuery not to process the data
      contentType : false // tell jQuery not to set contentType
    }).done(function(uploadType) {
      console.log("uploadType " + uploadType.momentType);
      console.log("In callback from ws");
      if (uploadType.momentType == "video") {
        createDynamicSection("video", time);
        readURL($('#uploadVideo')[0], "video");
      } else if (uploadType.momentType == "image") {
        createDynamicSection("image", time);
        readURL($('#uploadPicture')[0], "image");
      } else if (uploadType.momentType == "text") {
        createDynamicSection("text", time);
        $scope.userTextInput = "";
        // init value of input
        console.log(uploadType.momentType);
      } else {
        console.log(uploadType.momentError);
      }
      $("html, body").animate({
        scrollTop : $(document).height()
      }, 1400);
      //set the moments buttons to enable
      $('#fileTypes > input').attr("disabled", false);
      $('#fileTypes > input + label').css("opacity", 1);
    }).fail(function(err) {
      console.log("Error: " + err);
    });
  }


  console.log("in viewAlbumController");

});

/* *****************************  moment MAP controller ********************************* */

app.controller('momentsMapController', function($scope, $http, $location, $cookies) {
  $scope.moment = model;
  var map;
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();

  $http.get("https://shared-moments.herokuapp.com/viewAlbum/?album_name=" + $cookies.currentAlbumName).success(function(data) {
    var geoAddresses = [];
    model.items = data;
    initialize();

    $('#momentMap > nav > h3').text(data.persons.toString());
    angular.forEach(data.moment_event, function(value, key) {
      var myLatlng = new google.maps.LatLng(value.moment_latitude, value.moment_longitude);
      geoAddresses.push(value.moment_latitude + "," + value.moment_longitude);

      var image = 'images/icons/' + value.moment_type + '.png';
      var marker = new google.maps.Marker({
        position : myLatlng,
        icon : image,
        title : value.moment_type
      });
      // To add the marker to the map, call setMap();
      marker.setMap(map);
      google.maps.event.addListener(marker, "click", function(event) {
        if (value.moment_type == "image")
          window.location.href = "#/viewImage?url=" + value.moment_input + "&page=momentsMap";
      });
    });
    console.log(geoAddresses);
    calcRoute(geoAddresses);
  });

  function initialize() {
    console.log("in initialize");
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers : true
    });
    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
      center : new google.maps.LatLng(31.9565287, 34.8160907),
      zoom : 15,
      mapTypeId : google.maps.MapTypeId.ROADMAP,
      panControl : true,
      zoomControl : true,
      scaleControl : true,
      streetViewControl : true,
      overviewMapControl : true,
    }
    map = new google.maps.Map(mapCanvas, mapOptions);

    $('#map-canvas').css("width", $(window).width());
    $('#map-canvas').css("height", $(window).height());
    directionsDisplay.setMap(map);
    lastCenter = map.getCenter();
    google.maps.event.trigger(mapCanvas, 'resize');
    map.setCenter(lastCenter);
  }

  function calcRoute(location) {
    console.log("location ", location[location.length - 1]);
    var start = location[0];
    var end = location[location.length - 1];
    var waypts = [];

    location.shift();
    // Removes the first element from an array and returns only that element.
    location.pop();
    // Removes the last element from an array and returns only that element.

    console.log("location agter", location);
    angular.forEach(location, function(value, key) {
      waypts.push({
        location : value,
        stopover : true
      });
    });

    var request = {
      origin : start,
      destination : end,
      waypoints : waypts,
      optimizeWaypoints : true,
      travelMode : google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }


  $scope.backToViewAlbum = function() {
    window.location.href = "#/viewAlbum";
  }

  console.log("in momentsMapController");
});

/* *****************************  angular directives ********************************* */

app.directive('backImg', function() {
  return function(scope, element, attrs) {
    attrs.$observe('backImg', function(value) {
      element.css({
        'background-image' : 'url(' + value + ')',
        'background-size' : 'cover'
      });
    });
  };
});

app.directive("ngFileSelect", function() {
  return {
    link : function($scope, el) {
      el.bind("change", function(e) {
        $scope.file = (e.srcElement || e.target).files[0];
      });
    }
  }
});

app.directive('dynamicUrl', function() {
  return {
    restrict : 'A',
    link : function postLink(scope, element, attr) {
      element.attr('src', attr.dynamicUrlSrc);
    }
  };
});

/* *****************************  Other ********************************* */

document.title = "Moments App";