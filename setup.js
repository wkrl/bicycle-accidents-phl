// Map based on crash data for the years 2007-2017 from the Pennsylvania Department of Transportation
// cityofphiladelphia.github.io/carto-api-explorer/#crash_data_collision_crash_2007_2017

function setup() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoia3d4cmwiLCJhIjoiY2pzZXJsNGdtMHY2bzQ0dDBjYmszNDVreiJ9.eIx7nzD5Mer3gcshBucfLw';
  let data = getData();
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kwxrl/cjzhaivva0zu31coig12g572c',
    center: [-75.163, 39.952],
    bearing: 8.8,
    zoom: 14.50
  });

  map.on('load', function() {
    if (data) {
      map.addSource('crashes', {
        type: 'geojson',
        data: data
      });
      map.getSource('crashes').setData(data);
    }

      map.addLayer({
        "id": "crashes",
        "type": "symbol",
        "source": "crashes",
        "layout": {
          "icon-image": "bicycle-15",
          "icon-allow-overlap": true,
          "text-field": "{title}",
            "text-font": ["Roboto Bold", "Arial Unicode MS Bold"],
            "text-size": 18,
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        },
        "paint": {
          "text-color": "#000",
          "text-halo-color": "#fff",
          "text-halo-width": 2,
          "icon-color": "#000",
          "icon-halo-color": "#fff",
          "icon-halo-width": 2,
        }
      });
  });

  map.on('click', 'crashes', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
    });

  map.on('mouseenter', 'crashes', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'crashes', function () {
    map.getCanvas().style.cursor = '';
  });
};

function getData() {
  let obj = {
    "type": "FeatureCollection",
    "features": []
  };

  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const call = "https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20crash_data_collision_crash_2007_2017%20WHERE%20crash_year%20=%202017%20AND%20bicycle_count>%200";

  fetch(call).then(response => response.json())
    .then(data => {
      data.rows.forEach(crash => {
        obj.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [parseFloat(crash.dec_long), parseFloat(crash.dec_lat)]
          },
          "properties": {
            "title": "",
            "icon": "bicycle",
            "month": `${months[crash.crash_month]}`,
            "description": `${crash.fatal_count > 0 ? "Fatal accident" : "Accident"} in ${months[crash.day_of_week]} with ${crash.injury_count} injured.`
          }
        })
      })
    })
  return obj;
}
