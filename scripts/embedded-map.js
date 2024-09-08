// Initialize Mapbox and MapsIndoors
const stops = [];
const zoomIndicator = document.getElementById('zoom-indicator');
mapsindoors.MapsIndoors.setLanguage('en');
mapsindoors.MapsIndoors.setMapsIndoorsApiKey('02c329e6777d431a88480a09');
const accessToken = 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg';

// Create Mapbox map
const mapView = new mapsindoors.mapView.MapboxV3View({
    accessToken: accessToken,
    element: document.getElementById('map'),
    center: { lat: 30.3602078, lng: -97.7421703 },
    zoom: 15
});

// Initialize MapsIndoors
const mi = new mapsindoors.MapsIndoors({
    mapView: mapView,
    labelOptions: {
        pixelOffset: { width: 0, height: 14 }
    }
});

zoomIndicator.innerHTML = mapView.getZoom();
mapView.on('zoom_changed', () => {
    zoomIndicator.innerHTML = mapView.getZoom().toFixed(1);
});

const mapBox = mapView.getMap();

const floorSelectorDiv = document.createElement('div');
const floorSelector = new mapsindoors.FloorSelector(floorSelectorDiv, mi);
mapBox.addControl({ onAdd: function () { return floorSelectorDiv }, onRemove: function () { } });

mi.on('click', function (location) {
    console.log('Location clicked', location);
    mi.selectLocation(location);
});

const sensors = { type: 'FeatureCollection', features: [] };

// Initialize variables for rotation and dragging
let rotatingFeature = null;
let rotatingFeatureIndex = -1;
let initialMousePosition = null;
let initialRotation = 0;
let currentMode = 'drag'; // Default mode
let dragging = false; // Track if a drag is in progress
const dragButton = document.getElementById('dragButton');
const rotateButton = document.getElementById('rotateButton');

// Event listeners for buttons to toggle modes
dragButton.addEventListener('click', () => {
    currentMode = 'drag';
    dragButton.classList.add('active');
    rotateButton.classList.remove('active');
    console.log('Switched to drag mode');
});

rotateButton.addEventListener('click', () => {
    currentMode = 'rotate';
    rotateButton.classList.add('active');
    dragButton.classList.remove('active');
    console.log('Switched to rotate mode');
});

// MapsIndoors ready event
mi.on('ready', function () {
    console.log('MapsIndoors is ready!');
    //mapBox.addModel('sensor', 'https://storage.googleapis.com/mapsindoors-media/3D/Office/meetingroomtable-3d.glb');
    mapBox.addModel('sensor', 'https://media.mapsindoors.com/370381af5fef4a7da08d9a37/media/occupancy_sensor.glb');
    mapBox.addSource('models_source', { type: 'geojson', data: sensors });
    mapBox.addLayer({
        'id': 'models',
        'type': 'model',
        'source': 'models_source',
        'paint': {
            'model-rotation': ['get', 'rotation'],
            'model-scale': ['get', 'scale']
        },
        'layout': {
            'model-id': ['get', 'modelName']
        }
    });

    // On left click: Add model
    mapBox.on('click', e => {
        const newFeature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat]
            },
            properties: {
                id: Date.now(), // Unique ID for each feature
                modelName: 'sensor',
                rotation: [0, 0, 0],
                scale: 1
            }
        };
        sensors.features.push(newFeature);
        mapBox.getSource('models_source').setData(sensors);
        console.log('New feature added:', newFeature);
    });

    // On mouse down: Initiate rotation or drag based on the current mode
    mapBox.on('mousedown', e => {
        if (e.originalEvent.button === 2) { // Right-click for removal
            const features = mapBox.queryRenderedFeatures(e.point, {
                layers: ['models']
            });

            if (features.length) {
                const feature = features[0];
                sensors.features = sensors.features.filter(f => f.properties.id !== feature.properties.id);
                mapBox.getSource('models_source').setData(sensors);
                console.log('Feature removed:', feature);
            }
        } else if (e.originalEvent.button === 0) { // Left-click for rotation or drag
            const features = mapBox.queryRenderedFeatures(e.point, {
                layers: ['models']
            });

            if (features.length > 0) {
                e.preventDefault();
                if (currentMode === 'rotate') {
                    rotatingFeature = features[0];
                    rotatingFeatureIndex = sensors.features.findIndex(f => f.properties.id === rotatingFeature.properties.id);
                    initialMousePosition = e.point;
                    initialRotation = sensors.features[rotatingFeatureIndex].properties.rotation[2]; // Initial rotation angle
                    mapBox.getCanvas().style.cursor = 'grabbing';

                    console.log('Rotation started:', {
                        rotatingFeature,
                        rotatingFeatureIndex,
                        initialMousePosition
                    });

                    mapBox.on('mousemove', onRotate);
                    mapBox.once('mouseup', onRotateEnd);
                } else if (currentMode === 'drag') {
                    const dragFeature = features[0];
                    const dragFeatureIndex = sensors.features.findIndex(f => f.properties.id === dragFeature.properties.id);
                    mapBox.getCanvas().style.cursor = 'grabbing';
                    dragging = true;

                    mapBox.on('mousemove', onDrag(dragFeatureIndex));
                    mapBox.once('mouseup', onDragEnd(dragFeatureIndex));
                }
            }
        }
    });

    // Function to handle rotation on mouse move
    function onRotate(e) {
        if (rotatingFeature && rotatingFeatureIndex !== -1 && initialMousePosition) {
            const dx = e.point.x - initialMousePosition.x;
            const dy = e.point.y - initialMousePosition.y;
            const angle = initialRotation + (Math.atan2(dy, dx) * (180 / Math.PI));
            sensors.features[rotatingFeatureIndex].properties.rotation = [0, 0, angle];
            mapBox.getSource('models_source').setData(sensors);
            console.log('Rotating:', {
                angle,
                featureRotation: sensors.features[rotatingFeatureIndex].properties.rotation
            });
        }
    }

    // Function to handle end of rotation on mouse up
    function onRotateEnd() {
        mapBox.off('mousemove', onRotate);
        mapBox.getCanvas().style.cursor = '';
        console.log('Rotation ended:', {
            rotatingFeature,
            rotatingFeatureIndex
        });
        rotatingFeature = null;
        rotatingFeatureIndex = -1;
        initialMousePosition = null;
    }

    // Function to handle dragging on mouse move
    function onDrag(index) {
        return function (e) {
            if (!dragging) return;
            const lngLat = mapBox.unproject(e.point);
            sensors.features[index].geometry.coordinates = [lngLat.lng, lngLat.lat];
            mapBox.getSource('models_source').setData(sensors);
            console.log('Dragging:', {
                lngLat,
                featureIndex: index
            });
        };
    }

    // Function to handle end of dragging on mouse up
    function onDragEnd(index) {
        return function () {
            dragging = false;
            mapBox.off('mousemove', onDrag(index));
            mapBox.getCanvas().style.cursor = '';
            console.log('Drag ended');
        };
    }

    // Prevent default context menu on right-click
    mapBox.getCanvas().addEventListener('contextmenu', e => {
        e.preventDefault();
    });
});
