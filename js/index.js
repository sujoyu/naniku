window.addEventListener('load', function() {
  Materialize.updateTextFields();
  $('select').material_select();

  var category = document.getElementById('category-field');
  category.disabled = false;
  var options = category.options;
  var searchField = document.getElementById('search-field');
  searchField.value = "";

  randomize();

  document.getElementById('search-random').addEventListener('click', function(e) {
    e.preventDefault();
    randomize();
    document.getElementById('search-submit').click();
  });

  searchField.addEventListener('keyup', function() {
    if (this.value === "" && category.disabled) {
      category.disabled = false;
      $(category).material_select();
    } else if (this.value !== "" && !category.disabled) {
      category.disabled = true;
      $(category).material_select();
    }
  });

  document.getElementById('option-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('search-submit').click();
  })

  function randomize() {
    var index = Math.floor(Math.random() * options.length);
    //for (var i = 0; i < options.length; i++) delete options[i].selected;
    options[index].selected = true;
    $(category).material_select();
  }
});

function initMap() {
  var map;
  var autocomplete;
  var latLng;
  var markers = [];
  var infowindow;
  var types = ['restaurant', 'food', 'cafe', 'bar'];

  var errorMessages = {
    ERROR: 'Google サーバーへの接続で問題が発生しました。',
    INVALID_REQUEST: 'リクエストが無効です。',
    OVER_QUERY_LIMIT: 'リクエスト割り当て数を超過しました。',
    REQUEST_DENIED: 'PlacesService を利用できません。',
    UNKNOWN_ERROR: 'リクエストを処理できませんでした。再度リクエストすると、成功する可能性があります。',
    ZERO_RESULTS: '結果は0件です。'
  }

  var checkOpenNow = document.getElementById('check-open-now');

  document.getElementById('search').addEventListener('submit', function(e) {
    e.preventDefault();
    Materialize.toast("検索開始...", 1000);

    infowindow.close();
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];
    console.log(checkOpenNow.checked);

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: latLng,
      radius: document.getElementById('radius-field').value,
      keyword: document.getElementById('search-field').value || document.getElementById('category-field').value,
      type: types,
      opennow: !!checkOpenNow.checked
    }, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(function(place) {
          var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
          });

          marker.addListener('click', function() {
            infowindow.close();
            service.getDetails({
              placeId: place.place_id
            }, function(place, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                var content = '<div><a href="' + place.url + '"><strong>' +
                  place.name + '</strong></a><br>' +
                  place.vicinity + '</div>'
                infowindow.setContent(content);
                infowindow.open(marker.getMap(), marker);
              }
            });
          });

          markers.push(marker);
        });
        Materialize.toast("検索完了", 1000);
      } else {
        var msg = errorMessages[status];
        Materialize.toast(msg, 3000);
      }
    });
  });

  navigator.geolocation.getCurrentPosition(function(position) {
    var geolocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var circle = new google.maps.Circle({
      center: geolocation,
      radius: position.coords.accuracy
    });

    map = new google.maps.Map(document.getElementById('map'), {
      center: geolocation,
      zoom: 16
    });

    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: '現在地'
    });

    // var input = document.getElementById('search-field');
    // var options = {
    //   bounds: circle.getBounds(),
    //   types: ['establishment']
    // };

    // autocomplete = new google.maps.places.Autocomplete(input, options);

    infowindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(-25, 0)
    });
    document.getElementById('search-submit').click();
  });
}
