(function() {
	var key = 'AIzaSyANSvGFSVzatzppzN0nk1S_rgKhBXpDk6M';

	var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?callback=initMap&libraries=places&signed_in=true&key=" + key;
	script.async = true;
	script.defer = true;
	document.body.appendChild(script)
})();
