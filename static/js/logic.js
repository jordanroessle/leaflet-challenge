// url to grab data from
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// load data
d3.json(earthquake_url).then(function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    
    function onEachFeature(feature, layer) {
        // bind popup with information
        layer.bindPopup("<h3>" + feature.properties.place + "</h3>")   
    }

    function addCircles(feature, latlng) {
        // initialize variables
        var depthColor;
        var depth = feature.geometry.coordinates[2]
        
        // determine color base on depth
        if(depth <= 10) {
            depthColor = "yellowgreen";
        }
        else if(depth <= 30) {
            depthColor = "yellow";
        }
        else if(depth <= 50) {
            depthColor = "gold";
        }
        else if(depth <= 70) {
            depthColor = "orange";
        }
        else {
            depthColor = "red";
        }
        
        // style for circles
        var markerOptions = {
            radius: feature.properties.mag * 5, 
            color: "black", 
            fillColor: depthColor,
            fillOpacity: 1,
            weight: 1
        }
        
        // return circle marker
        return L.circleMarker(latlng, markerOptions)
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: addCircles
    });
    
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // define layers
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // define basemap object to hold base layers
    var baseMaps = { 
        "Satellite Map": satellitemap,
        "Dark Map": darkmap,  
        "Light Map": lightmap,
        "Outdoor Map": outdoormap
    };

    var tectonicPlates = getPlates();

    // define overlay maps
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    var usaCenter = [37.09, -95.71];
    // create map, center on US
    var myMap = L.map("map", {
        center: usaCenter,
        zoom: 4, 
        layers: [satellitemap, earthquakes]
    });

    // Create layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

function getPlates() {
    var filePath = "static/data/boundaries.json"
    var tectonicPlates = 
        d3.json(filePath).then(function(data, tectonicPlates) {
            return L.geoJSON(data.features)
    });
    console.log(tectonicPlates)
    return tectonicPlates;
}






