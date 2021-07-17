// url to grab data from
var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// load data
d3.json(earthquake_url).then(function(data) {
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        // initialize variables
        var colorFill;
        var depth = feature.geometry.coordinates[2];
        var location = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        // determine color based on depth
        if(depth <= 10) {
            colorFill = "yellowgreen";
        }
        else if(depth <= 30) {
            colorFill = "yellow";
        }
        else if(depth <= 50) {
            colorFill = "gold";
        }
        else if(depth <= 70) {
            colorFill = "orange";
        }
        else {
            colorFill = "red";
        }

        L.circle(location, { 
            fillColor: colorFill, 
            radius: feature.properties.mag*10
        })

        layer.bindPopup("<h3>" + feature.properties.place + "</h3>")
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
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

    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // define basemap object to hold base layers
    var baseMaps = { 
        "Satellite Map": satellitemap,
        "Dark Map": darkmap,  
        "Outdoor Map": outdoormap
    };

    // define overlay maps
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    var usaCenter = [37.09, -95.71];
    // create map, center on US
    var myMap = L.map("map", {
        center: usaCenter,
        zoom: 5, 
        layers: [satellitemap, earthquakes]
    });

    // Create layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}