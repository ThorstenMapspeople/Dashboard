// main.js

const miMapElement = document.querySelector('mi-map-googlemaps');
const miSearchElement = document.querySelector('mi-search');
const miListElement = document.querySelector('mi-list');

let miDirectionsServiceInstance;
let miDirectionsRendererInstance;

miMapElement.addEventListener('mapsIndoorsReady', () => {
  miMapElement.getMapInstance().then((mapInstance) => {
    mapInstance.setCenter({ lat: 38.8974905, lng: -77.0362723 }); // The White House
  });
  miMapElement.getDirectionsServiceInstance()
    .then((directionsServiceInstance) => miDirectionsServiceInstance = directionsServiceInstance);

    miMapElement.getDirectionsRendererInstance()
    .then((directionsRendererInstance) => miDirectionsRendererInstance = directionsRendererInstance);
})

miSearchElement.addEventListener('results', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;
  
  // Append new search results
  event.detail.forEach(location => {
    const miListItemElement = document.createElement('mi-list-item-location');
    miListItemElement.location = location;

    // Add click event listener
miListItemElement.addEventListener("click", () => getRoute(location), false);

miListElement.appendChild(miListItemElement);
});

  // Get the MapsIndoors instance
miMapElement.getMapsIndoorsInstance().then((mapsIndoorsInstance) => {
    // Filter map to only display search results
    mapsIndoorsInstance.filter(event.detail.map(location => location.id), false);
  });

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
}
});