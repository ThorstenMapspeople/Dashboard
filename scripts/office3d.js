

const mapViewOptions = {
    accessToken: 'pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbHF6bWhjM2wwNnZrMmpxYnNiaDIycmpwIn0.ldaIeNH9dhHyjZs2FxY4WA',
    element: document.getElementById('map'),
    zoom: 19,
    maxZoom: 22,
    mapsIndoorsTransitionLevel: 15,
    pitch: 30,
    bearing: 90,
    lightPreset: 'day',
    showMapMarkers: false
};
const mapViewInstance = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });
const mapboxInstance = mapViewInstance.getMap();

// Directions Service and Renderer Instances
const externalDirectionsProvider = new mapsindoors.directions.MapboxProvider('pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbHF6bWhjM2wwNnZrMmpxYnNiaDIycmpwIn0.ldaIeNH9dhHyjZs2FxY4WA');
const miDirectionsServiceInstance = new mapsindoors.services.DirectionsService(externalDirectionsProvider);
const directionsRendererOptions = { mapsIndoors: mapsIndoorsInstance }
const miDirectionsRendererInstance = new mapsindoors.directions.DirectionsRenderer(directionsRendererOptions);

// Floor Selector
const floorSelectorElement = document.createElement('div');
new mapsindoors.FloorSelector(floorSelectorElement, mapsIndoorsInstance);
mapboxInstance.addControl({ onAdd: function () { return floorSelectorElement }, onRemove: function () { } });

function onSearch() {
    const searchInputElement = document.querySelector('input');
    // Get list element reference
    const searchResultsElement = document.getElementById('search-results');
    
    const searchParameters = { q: searchInputElement.value };
    mapsindoors.services.LocationsService.getLocations(searchParameters).then(locations => {
        // Reset search results list
        searchResultsElement.innerHTML = null;

    // Append new search results
    locations.forEach(location => {
        const listElement = document.createElement('li');
        listElement.innerHTML = location.properties.name;

    // Add click event listener
    listElement.addEventListener("click", () => getRoute(location), false);

        searchResultsElement.appendChild(listElement);
    });

  // Filter map to only display search results
  mapsIndoorsInstance.filter(locations.map(location => location.id), false);
});
}

function getRoute(location) {
    const originLocationCoordinate = { lat: 38.897389429704695, lng: -77.03740973527613, floor: 0 }; // Oval Office, The White House (Hardcoded coordinate and floor index)
    const destinationCoordinate = { lat: location.properties.anchor.coordinates[1], lng: location.properties.anchor.coordinates[0], floor: location.properties.floor };
  
    // Route parameters
    const routeParameters = {
      origin: originLocationCoordinate,
      destination: destinationCoordinate,
      travelMode: document.getElementById('travel-modes').value.toUpperCase()
    };
  
    // Get route from directions service
    miDirectionsServiceInstance.getRoute(routeParameters).then((directionsResult) => {
      // Use directions render to display route
      miDirectionsRendererInstance.setRoute(directionsResult);
    });
  };

  function loadAndCenterVenue(venueId) {
    mapsindoors.services.VenuesService.getVenue(venueId).then(venue => {
        if (venue && venue.anchor) {
            const center = {
                lat: venue.anchor.coordinates[1],
                lng: venue.anchor.coordinates[0]
            };
            
            // Set the venue in MapsIndoors
            mapsIndoorsInstance.setVenue(venue).then(() => {
                // After setting the venue, fly to its center
                mapboxInstance.flyTo({
                    center: [center.lng, center.lat],
                    zoom: 19,  // Adjust this zoom level as needed
                    essential: true
                });
                
                // Ensure the correct floor is displayed
                if (venue.defaultFloor !== undefined) {
                    mapsIndoorsInstance.setFloor(venue.defaultFloor);
                }
            });
        }
    }).catch(error => {
        console.error('Error loading venue:', error);
    });
  }

  function fetchVenues() {
    return mapsindoors.services.VenuesService.getVenues().then(venues => {
        const venueSelector = document.getElementById('venue-selector');
        venueSelector.innerHTML = ''; // Clear existing options
        venues.forEach((venue) => {
            const option = document.createElement('option');
            option.value = venue.id;
            option.textContent = venue.name;
            venueSelector.appendChild(option);
        });
        
        // Return the ID of the first venue
        return venues.length > 0 ? venues[0].id : null;
    }).catch(error => {
        console.error('Error fetching venues:', error);
    });
}

// Modify the venue selection event listener
document.getElementById('venue-selector').addEventListener('change', (event) => {
    const venueId = event.target.value;
    if (venueId) {
        loadAndCenterVenue(venueId);
    }
});

// Initialize the map with the first available venue
mapsIndoorsInstance.on('ready', () => {
    fetchVenues().then(firstVenueId => {
        if (firstVenueId) {
            loadAndCenterVenue(firstVenueId);
            document.getElementById('venue-selector').value = firstVenueId;
        } else {
            console.error('No venues available');
        }
    });
});

mapsIndoorsInstance.on('ready', fetchVenues);