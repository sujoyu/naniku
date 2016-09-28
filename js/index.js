window.addEventListener('load', function() {
  Materialize.updateTextFields();
});

function initMap() {
  var map;
  var autocomplete;
  var latLng;
  var markers = [];
  var infowindow;
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

    var defaultBounds = new google.maps.LatLngBounds(latLng);

    var input = document.getElementById('search-field');
    var options = {
      location: latLng,
      radius: '500',
      types: ['restaurant', 'food', 'cafe']
    };

    autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.setBounds(circle.getBounds());

    infowindow = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(-25, 0)
    });
  });

  var checkOpenNow = document.getElementById('check-open-now');

  document.getElementById('search').addEventListener('submit', function(e) {
    e.preventDefault();

    infowindow.close();
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: latLng,
      radius: document.getElementById('radius-field').value,
      keyword: document.getElementById('search-field').value,
      type: ['restaurant', 'food', 'cafe'],
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
      }
    });
  });
}
