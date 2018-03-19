(function () {

  // L.mapbox.accessToken = 'pk.eyJ1IjoiY291cnRuZXlzaW1vbnNlIiwiYSI6ImNqZGozNng0NjFqZWIyd28xdDJ2MXduNTcifQ.PoSFtqfsq1di1IDXzlN4PA';

  // map options
  var options = {
    zoomSnap: .1,
    center: [39.15, -84.5], // cincinnati downtown
    zoom: 11,
    minZoom: 6,
    zoomControl: false,
    attributionControl: false
    // maxZoom: 15
  }

  // create map
  var map = L.map('map', options);

  // request tiles and add to map
  var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  	subdomains: 'abcd',
  	maxZoom: 19
  }).addTo(map);

  // trail names for UI dropdown
  var layerInfo = {
    cathedralShort: {
      name: "Cathedral Trail 5 mi"
    },
    cathedralLong: {
      name: "Cathedral Trail 11.4 mi"
    },
    eastSideEast: {
      name: "East Side Trail - East Route"
    },
    westSideSouth: {
      name: "West Side Trail - South Loop"
    },
    westSideNorth: {
      name: "West Side Trail - North Loop"
    },
    central: {
      name: "Central Trail"
    },
    north: {
      name: "North Trail"
    },
    eastSideWest1: {
      name: "East Side Trail - West Route Option 1"
    },
    eastSideWest2: {
      name: "East Side Trail - West Route Option 2"
    }
  };

  // first make sure all data are loaded using deferred requests
  var trailsData = d3.json("data/trails.geojson"),
      parishLocationsData = d3.csv("data/parish-data.csv")

  // when all data ARE loaded, call the ready function
  Promise.all([trailsData, parishLocationsData]).then(ready)


  function ready(data) {

    // all data are in GeoJSON now and ready
    // separate out the data sets and parse CSV to GeoJSON
    drawMap(data[0], parseCSV(data[1]));

  }

  function parseCSV(data) {

    // build geojson structure
    var geojson = {};

    geojson.type = "FeatureCollection";
    geojson.features = [];

    // loop through data and create features
    data.forEach(function (datum) {
      var feature = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": []
        }
      }
      // add all data as props
      feature.properties = datum;
      // add coordinate info
      feature.geometry.coordinates = [+datum.Longitude, +datum.Latitude]

      // push each feature to geojson
      geojson.features.push(feature)
    })
    // return complete geojson
    return geojson
  }

  function drawMap(trailsData, parishLocationsData) {

    var trailsLayer = L.geoJson(trailsData, {
      // style trail lines
      style: function (feature) {
        return {
          color: 'red',
          weight: 2
        };
      }
    }).addTo(map);

    // icon for churches
    var churchIcon = L.icon({
      iconUrl: "images/church.svg",
      iconSize: [20, 20]
    })

    var parishesLayer = L.geoJson(parishLocationsData, {
      pointToLayer: function(feature, ll) {
        return L.marker(ll, {
          icon: churchIcon,
        })
      },
      onEachFeature: function(feature, layer) {
        var props = feature.properties;

        var tooltip = "<h3><b>name:</b> " + props.name +
                      "</h3><p><b>Mass times:</b> " + props.masses + "</p>" +
                      "<p><b>Confession: </b>" + props.ConfessionTimes + "</p>" +
                      "<p><b>Phone Number: </b>" + props.phone + "</p>"

        layer.bindTooltip(tooltip, {
          className: 'tooltip'
        })
      }
    }).addTo(map)

    addUi(trailsLayer);
    // show short cathedral trail as default
    updateMap(trailsLayer, parishesLayer, 'Cathedral Trail 5 mi');

  } // end drawMap


  var dropdownList = '';

  // create dropdown list HTML
  for (var layer in layerInfo) {
    dropdownList += '<option value="' + layerInfo[layer]['name'] + '">' + layerInfo[layer]['name'] + '</option>'
  }
  // console.log(dropdownList);
  $("#trails").html(dropdownList)

  // selectedTrail is one chosen by dropdown
  var selectedTrail = document.getElementById('trails').value;
  // console.log(selectedTrail);

  // geolocation example from Mapbox
  var geolocate = document.getElementById('geolocate');

  var myLayer = L.featureGroup().addTo(map);

  // find user's location through browser
  if (!navigator.geolocation) {
    geolocate.innerHTML = 'Geolocation is not available';
  } else {
    geolocate.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      map.locate();
    };
  }

  // zoom and center the map on position and add marker
  map.on('locationfound', function (e) {
    if (map.getBounds().contains(e.latlng)) {
      locationMarker = new L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 6
      }).addTo(myLayer);
    } else {
      geolocate.innerHTML = 'Position outside current view'
    }

  });

  // If the user chooses not to allow their location
  // to be shared, display an error message.
  map.on('locationerror', function () {
    geolocate.innerHTML = 'Position could not be found';
  });



  function addUi(dataLayer) {
    // create the dropdown
    var selectControl = L.control({
      position: 'bottomleft'
    });
    // when control is added
    selectControl.onAdd = function (map) {
      // get the element with id attribute of ui-controls
      return L.DomUtil.get("ui-controls");
    }
    // add the control to the map
    selectControl.addTo(map);

    $('select[id="trails"]')
      .change(function () {
        // code executed here when change event occurs
        selectedTrail = this.value;
        console.log(selectedTrail);
        // call updateMap function
        updateMap(dataLayer, selectedTrail);

      });
  } // end addUi

  function updateMap(dataLayer, parishesLayer, selectedTrail) {
    console.log(dataLayer);
    console.log(parishesLayer);

    parishesLayer.eachLayer(function(layer) {
      // highlight church icon if on selected trail - not sure how to do this?
      console.log(layer.getLatLng());
      if (true) {
        layer.setIcon(L.icon({
          iconUrl: "images/church_highlight.svg",
          iconSize: [20, 20]
        }))
      }
    }).addTo(map);

    dataLayer.eachLayer(function (layer) {
      // console.log(layer);
      if (layer.feature.properties["name"] == selectedTrail) {
        // console.log(layer);
        // console.log(layer.feature.properties.stops);
        // add description of trail
        $("#description").html("<div class='txt-m txt-bold'>Trail: " + selectedTrail + "</div>" +
          layer.feature.properties["description"])

        var stopsText = "<div class='txt-m txt-bold'>Directions</div><ol class='txt-ol'>"
        var directionsText = ""

        // console.log(layer.feature.properties.stops.features.length-1);

        // add stops and turn by turn directions as info
        for (var i = 0; i < layer.feature.properties.stops.features.length; i++) {
          var stopsProps = layer.feature.properties.stops.features[i].properties;
          // console.log(stopsProps.description);
          // console.log(layer.feature.properties.stops.features[i].geometry.coordinates);
          var stopPosition = layer.feature.properties.stops.features[i].geometry.coordinates // find coordinate for stop
          stopsText += "<li class='text-li txt-underline-on-hover' data-position='" + stopPosition[1] + "," + stopPosition[0] +
            "' stop=" + i + ">" + stopsProps.description + "</li>";

          for (var j = 0; j < stopsProps.directions.features.length; j++) {
            // console.log(stopsProps.directions.features[j].properties.description);
            if (j == 0) {
              directionsText += "<ul class='txt-ul'>"
            }
            var turnPosition = stopsProps.directions.features[j].geometry.coordinates // find coordinate for turn
            // console.log(turnPosition);
            directionsText += "<li class='text-li txt-underline-on-hover' data-position=" + turnPosition[1] + "," + turnPosition[0] + ">" +
              stopsProps.directions.features[j].properties.description + "</li>";
          }
          stopsText += directionsText + "</ul>"
          directionsText = ""
        }
        stopsText += "</ol>"
        $("#directions").html(stopsText)
        return layer;
      } else {
        // want to only show selected trail - not sure how to do this
        // layer.remove();
      }
    }).addTo(map);

    // add click function to directions list
    $('li').click(function () {
      var position = ($(this).attr('data-position').split(","));
      // console.log($(this).attr('data-position').split(","));
      var zoom = 14;
      map.flyTo(position, zoom); // set map view to zoom to clicked element

    });
  } // end updateMap

})();
