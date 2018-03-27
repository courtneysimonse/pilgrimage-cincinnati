(function () {

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
      name: "East Side Trail - East Route (10.3 mi)"
    },
    eastSideWest1: {
      name: "East Side Trail - West Route Option 1 (11 mi)"
    },
    eastSideWest2: {
      name: "East Side Trail - West Route Option 2 (14.8 mi)"
    },
    westSideSouth: {
      name: "West Side Trail - South Loop (10 mi)"
    },
    westSideNorth: {
      name: "West Side Trail - North Loop (10.4 mi)"
    },
    central: {
      name: "Central Trail (10 mi)"
    },
    north: {
      name: "North Trail (11.3 mi)"
    }
  };

  // first make sure all data are loaded using deferred requests
  var trailsData = d3.json("data/trails.geojson"),
      parishLocationsData = d3.csv("data/parish-data.csv")

  // when all data ARE loaded, call the ready function
  Promise.all([trailsData, parishLocationsData]).then(ready)


  function ready(data) {

    // Get the modal
    var modal = document.getElementById('warning');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // open the modal
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

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

        var tooltip = "<h3><b>Name:</b> " + props.name +
                      "</h3><p><b>Mass times:</b> " + props.masses + "</p>" +
                      "<p><b>Confession: </b>" + props.ConfessionTimes + "</p>" +
                      "<p><b>Phone Number: </b>" + props.phone + "</p>"

        layer.bindTooltip(tooltip, {
          className: 'tooltip'
        })
      }
    }).addTo(map)

    addUi(trailsLayer, parishesLayer);
    // show short cathedral trail as default
    updateMap(trailsLayer, parishesLayer, 'Cathedral Trail 5 mi');

  } // end drawMap


  var dropdownList = '';

  // create dropdown list HTML
  for (var layer in layerInfo) {
    dropdownList += '<option value="' + layerInfo[layer]['name'] + '">' + layerInfo[layer]['name'] + '</option>'
  }

  $("#trails").html(dropdownList)

  // selectedTrail is one chosen by dropdown
  var selectedTrail = document.getElementById('trails').value;

  // add geolocation on button click
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
        radius: 4,
        color: 'yellow',
        weight: 2,
        // fillColor: 'yellow',
        fillOpacity: 1
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



  function addUi(dataLayer, parishesLayer) {
    // create the dropdown
    var selectControl = L.control({
      position: 'bottomleft'
    });
    // when control is added
    selectControl.onAdd = function (map) {
      // get the element with id attribute of ui-controls
      var controls = L.DomUtil.get("ui-controls");

      L.DomEvent.disableClickPropagation(controls);
      L.DomEvent.disableScrollPropagation(controls);

      return controls;
    }
    // add the control to the map
    selectControl.addTo(map);

    $('select[id="trails"]')
      .change(function () {
        // code executed here when change event occurs
        selectedTrail = this.value;

        // call updateMap function
        updateMap(dataLayer, parishesLayer, selectedTrail);

      });
  } // end addUi

  function updateMap(dataLayer, parishesLayer, selectedTrail) {

    var trail = {};

    dataLayer.eachLayer(function (layer) {

      if (layer.feature.properties["name"] == selectedTrail) {
        trail = layer;

        // show trail if selected
        layer.setStyle({
          opacity: 1
        })

        // add description of trail
        $("#description").html("<div class='txt-m txt-bold trail-name cursor-pointer'>Trail: " + selectedTrail + "</div>" +
          "<div class='details'>" + layer.feature.properties["description"] + "</div>")

        var stopsText = "<div class='txt-m txt-bold'>Directions</div><ol class='txt-ol stops'>"
        var directionsText = ""

        // add stops and turn by turn directions as info
        for (var i = 0; i < layer.feature.properties.stops.features.length; i++) {
          var stopsProps = layer.feature.properties.stops.features[i].properties;

          var stopPosition = layer.feature.properties.stops.features[i].geometry.coordinates // find coordinate for stop
          stopsText += "<li class='text-li txt-underline-on-hover cursor-pointer' data-position='" + stopPosition[1] + "," + stopPosition[0] +
            "' stop=" + i + ">" + stopsProps.description + "</li>";

          for (var j = 0; j < stopsProps.directions.features.length; j++) {
            if (j == 0) {
              directionsText += "<ul class='txt-ul details'>"
            }
            var turnPosition = stopsProps.directions.features[j].geometry.coordinates // find coordinate for turn
            directionsText += "<li class='text-li txt-underline-on-hover cursor-pointer' data-position=" + turnPosition[1] + "," + turnPosition[0] + ">" +
              stopsProps.directions.features[j].properties.description + "</li>";
          }
          stopsText += directionsText + "</ul>"
          directionsText = ""
        }
        stopsText += "</ol>"
        $("#directions").html(stopsText)

      } else {
        // want to only show selected trail
        layer.setStyle({
          opacity: 0
        })
      }
    }).addTo(map);

    // toggle description text when click on trail name
    $('.trail-name').click(function() {
      $(this).next().slideToggle();
    });

    // toggle directions list when click on stop
    $('ol.stops li').click(function() {
      $(this).next('ul').slideToggle();
    });

    // flyTo selected trail area
    map.flyToBounds(trail.getBounds().pad(.1))

    // add click function to directions list
    $('li').click(function () {
      var position = ($(this).attr('data-position').split(","));
      var zoom = 14;
      map.flyTo(position, zoom); // set map view to zoom to clicked element

    });

    parishesLayer.eachLayer(function(church) {
      // highlight church icon if on selected trail
      if (trail.getBounds().pad(.05).contains(church.getLatLng())) {
        church.setIcon(L.icon({
          iconUrl: "images/church_highlight.svg",
          iconSize: [20, 20]
        }))
      } else {
        church.setIcon(L.icon({
          iconUrl: "images/church.svg",
          iconSize: [20, 20]
        }))
      }
    }).addTo(map);
  } // end updateMap

})();
