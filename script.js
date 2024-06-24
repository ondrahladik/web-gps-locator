let map, marker;

        window.onload = function() {
            getLocation();
        };

        function getLocation() {
            document.getElementById("error-message").innerHTML = "";
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(showPosition, showError, {timeout: 10000});
            } else {
                document.getElementById("error-message").innerHTML = "Geolokace není podporována tímto prohlížečem.";
            }
        }

        function showPosition(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const altitude = position.coords.altitude;
            const latitudeDMS = convertToDMS(latitude, 'lat');
            const longitudeDMS = convertToDMS(longitude, 'lon');
            
            document.getElementById("latitude").innerHTML = "Latitude: " + latitudeDMS;
            document.getElementById("longitude").innerHTML = "Longitude: " + longitudeDMS;
            document.getElementById("altitude").innerHTML = "Altitude: " + (altitude !== null ? altitude.toFixed(2) + " m" : "N/A");

            const locator = calculateLocator(latitude, longitude);
            document.getElementById("locator").innerHTML = "Gridsquare: " + locator;

            if (!map) {
                initializeMap(latitude, longitude);
            } else {
                updateMap(latitude, longitude);
            }
        }

        function convertToDMS(deg, type) {
            const absolute = Math.abs(deg);
            const degrees = Math.floor(absolute);
            const minutesNotTruncated = (absolute - degrees) * 60;
            const minutes = Math.floor(minutesNotTruncated);
            const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

            let direction = '';
            if (type === 'lat') {
                direction = deg >= 0 ? 'N' : 'S';
            } else if (type === 'lon') {
                direction = deg >= 0 ? 'E' : 'W';
            }

            return degrees + "° " + minutes + "' " + seconds + "\" " + direction;
        }

        function showError(error) {
            let errorMessage = "";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "The user declined the geolocation request.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "No location information available.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    errorMessage = "An unknown error has occurred.";
                    break;
            }
            document.getElementById("error-message").innerHTML = errorMessage;
        }

        function calculateLocator(lat, lon) {
            const A = "A".charCodeAt(0);

            lat += 90.0;
            lon += 180.0;

            const fieldLat = Math.floor(lat / 10);
            const fieldLon = Math.floor(lon / 20);
            const squareLat = Math.floor(lat % 10);
            const squareLon = Math.floor(lon % 20 / 2);
            const subSquareLat = Math.floor((lat % 1) * 24);
            const subSquareLon = Math.floor(((lon % 2) / 2) * 24);

            const locator = String.fromCharCode(A + fieldLon) +
                            String.fromCharCode(A + fieldLat) +
                            squareLon.toString() +
                            squareLat.toString() +
                            String.fromCharCode(A + subSquareLon) +
                            String.fromCharCode(A + subSquareLat);

            return locator;
        }

        function initializeMap(latitude, longitude) {
            const mapDiv = document.getElementById("map");
            map = L.map(mapDiv, {
                zoomControl: false,
                dragging: false,
                zoom: 13,
                scrollWheelZoom: false, // disables scrolling with the mouse wheel
                touchZoom: false // disable touch zoom on mobile devices
            }).setView([latitude, longitude]);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
            map.attributionControl.remove(); // Deleting an attribute
            map.doubleClickZoom.disable(); // Disable double-click zoom
            marker = L.marker([latitude, longitude], {icon: redIcon}).addTo(map).bindPopup('Your current location');
        }

        function updateMap(latitude, longitude) {
            map.setView([latitude, longitude], 13);
            marker.setLatLng([latitude, longitude]).bindPopup('Your current location');
        }

     