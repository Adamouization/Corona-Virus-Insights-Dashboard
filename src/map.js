import { collapseByDate, getByCountry } from './utils.js'

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

/**
 * A function to populate the map.
 * @param {*} style the styling function
 */
const populateMap = async (map, mapInstance, cases) => {
  const geoData = await d3.csv('./data/countries.csv')
  const mapFeatures = geoData.map(item => ({ ...item, cases: collapseByDate(getByCountry(item.name, cases), '3/27/20') }))
  const size = d3.scaleSqrt()
    .domain([Math.min(...mapFeatures.map(item => item.cases)), Math.max(...mapFeatures.map(item => item.cases))])
    .range([0, 50])
  d3.select(map)
    .select('svg')
    .selectAll('countryCircles')
    .data(mapFeatures)
    .enter()
    .append('circle')
    .attr('cx', d => mapInstance.latLngToLayerPoint([d.latitude, d.longitude]).x)
    .attr('cy', d => mapInstance.latLngToLayerPoint([d.latitude, d.longitude]).y)
    .attr('r', d => size(d.cases))
    .style('fill', '#dc3545')
    .attr('stroke', '#dc3545')
    .attr('stroke-width', 3)
    .attr('fill-opacity', 0.4)
}

export {
  createMap,
  populateMap
}
