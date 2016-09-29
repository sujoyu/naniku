window.addEventListener('load', function() {
  Materialize.updateTextFields();
  $('select').material_select();

  var category = document.getElementById('category-field');
  category.disabled = false;
  var options = category.options;
  var searchField = document.getElementById('search-field');
  searchField.value = "";
  var searchSubmit = document.getElementById('search-submit');

  randomize();

  document.getElementById('search-random').addEventListener('click', function(e) {
    e.preventDefault();
    randomize();
    searchSubmit.click();
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
    searchSubmit.click();
  });

  $(category).on('change', function() {
    searchSubmit.click();
  });

  var radiusMeter = document.getElementById('radius-meter');
  var radiusField = document.getElementById('radius-field');
  radiusField.addEventListener('change', function(e) {
    radiusMeter.textContent = this.value;
  });
  radiusMeter.textContent = radiusField.value;

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

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: latLng,
      radius: document.getElementById('radius-field').value,
      keyword: document.getElementById('search-field').value || document.getElementById('category-field').value,
      type: types,
      openNow: !!checkOpenNow.checked
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
              var imgTag = place.photos && place.photos[0] ? '<img class="popup-image" src="' +
                place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"></img>' : '';

                var ratingStars;
                if (place.rating) {
                  var stars = Array.from({length: 5}, function(v, k) { return k }).map(function(kind) {
                    kind += 1;
                    var icon;
                    var rating = parseFloat(place.rating);
                    if (kind <= rating) icon = 'star';
                    else if (kind <= rating + 0.5) icon = 'star_half';
                    else icon = 'star_border';
                    return '<i class="material-icons orange-text">' + icon + '</i>'
                  });
                  var ratingStars = stars.join('');
                }

              var content = '<div class="info-window-contents"><a href="' + place.url + '" target="_blank">' + imgTag + '<h6>' +
                place.name + '</h6></a><br>' +
                '<span class="popup-rating">評価: ' + (ratingStars || "なし")  + '</span><br></div>';
              console.log(place);
              infowindow.setContent(content);
              infowindow.open(marker.getMap(), marker);
            } else {
              var msg = errorMessages[status];
              Materialize.toast(msg, 3000);
            }
          });
          });

          markers.push(marker);
        });
        Materialize.toast("検索完了。", 1000);
      } else {
        var msg = errorMessages[status];
        Materialize.toast(msg, 3000);
      }

      offsetCenter(latLng, 0, -100);
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

    infowindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(-25, 0)
    });
    document.getElementById('search-submit').click();
  });

  function offsetCenter(latlng, offsetx, offsety) {

    // latlng is the apparent centre-point
    // offsetx is the distance you want that point to move to the right, in pixels
    // offsety is the distance you want that point to move upwards, in pixels
    // offset can be negative
    // offsetx and offsety are both optional

    var scale = Math.pow(2, map.getZoom());

    var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
    var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0);

    var worldCoordinateNewCenter = new google.maps.Point(
        worldCoordinateCenter.x - pixelOffset.x,
        worldCoordinateCenter.y + pixelOffset.y
    );

    var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

    map.panTo(newCenter);

  }
}
