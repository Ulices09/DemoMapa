mapboxgl.accessToken = 'pk.eyJ1IjoidWxpY2VzMDkiLCJhIjoiY2o4Y2Z2MTlyMGFhNzJ4c2ZycDZ3dWw5OCJ9.kq1sP4Wv-S2ehS91swYGYg';
var map = new mapboxgl.Map({
    style: 'mapbox://styles/ulices09/cj9jc77tebmie2snz8ifk32eh',
    center: [-77.0428174, -12.0463782],
    zoom: 12,
    pitch: 45,
    bearing: -17.6,
    hash: true,
    container: 'map'
});

// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers.reverse();
    var labelLayerIdx = layers.findIndex(function (layer) {
        return layer.type !== 'symbol';
    });
    var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .6
        }
    }, labelLayerId);
});

var dataMarkers = [];

function generarGeoJson(usuarios) {
    
    var dataFeautres = [];

    for(var i = 0; i < usuarios.length; i++) {
        dataFeautres.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [usuarios[i].longitude, usuarios[i].latitude]
            },
            properties: {
              title: 'Usuario',
              description: usuarios[i].name
            }
        })
    }

    var geojson = {
        type: 'FeatureCollection',
        features: dataFeautres
    };

    return geojson;
}

function removerMarkers() {
    for(var i = 0; i < dataMarkers.length; i++) {
        dataMarkers[i].remove();
    }
}

function setMarkersToMap(geojson) {

    //Eliminamos marcadores actuales
    removerMarkers();

    // add markers to map
    geojson.features.forEach(function(marker) {
    
        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = 'marker';
    
        // make a marker for each feature and add to the map
        var mkr = new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
                    .addTo(map);

        dataMarkers.push(mkr);
    });
}

function generarMarkers() {
    $.ajax({
        url: "https://location-demo-5b317.firebaseio.com/users.json",
        type: "GET",
        success: function(result){

            var usuarios = [];
            var filtro = document.getElementById("filtroUsuario").value;
            Object.keys(result).map(function(a,i) {
              if(result[a].name.toLowerCase().includes(filtro.toLowerCase())){
                usuarios.push({name: result[a].name, longitude: result[a].longitude, latitude: result[a].latitude})
              }
            })
            
            setMarkersToMap(generarGeoJson(usuarios));
        }
    });
}

document.querySelector('#btnGenerarMarkers').addEventListener('click', generarMarkers)

/*map.on('mousemove', function (e) {
      document.getElementById('info').innerHTML = JSON.stringify(e.point) + '<br />' + JSON.stringify(e.lngLat);
  });*/