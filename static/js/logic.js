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
        else if (depth <= 90) {
            depthColor = "orangered";
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

    // define earthquakes for map
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: addCircles
    });
    
    // define techtonic plates for map
    var plateFile = "static/data/boundaries.json"
    d3.json(plateFile).then(function(data) {
            tectonicPlates = L.geoJSON(data.features, {
                style: {color:"purple"}
            })
            // create the map
            createMap(earthquakes, tectonicPlates);
    });
}

function createMap(earthquakes, tectonicPlates) {
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
        layers: [satellitemap, earthquakes, tectonicPlates]
    });

    // create layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // add legend
    var info = L.control({
        position: "bottomright"
    });

    info.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        return div;
    }

    info.addTo(myMap);

    document.querySelector(".legend").innerHTML = [
        "<div class='box yellowgreen'></div><div class='text'>-10-10</div>",
        "<div class='box yellow'></div><div class='text'>10-30</div>",
        "<div class='box gold'></div><div class='text'>30-50</div>",
        "<div class='box orange'></div><div class='text'>50-70</div>",
        "<div class='box orangered'></div><div class='text'>70-90</div>",
        "<div class='box red'></div><div class='text'>90+</div>"
      ].join("");
}






