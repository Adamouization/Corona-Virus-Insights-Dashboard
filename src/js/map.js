import {collapseByDate, getByCountry} from './utils.js'

/**
 * A function to create a map object.
 * @param {string} mapboxAccessToken The mapbox access token
 * return the map object
 */
const createMap = mapboxAccessToken => {
  const map = L.map('map', {
    minZoom: 0,
    maxZoom: 4
  })

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(map)
  return map
}

const removeMarkers = (map, layerTag) => {
  map.eachLayer( function(layer) {
    if ( layer.myTag &&  layer.myTag === layerTag) {
      map.removeLayer(layer)
    }
  })
}

export {
  createMap,
  removeMarkers
}
