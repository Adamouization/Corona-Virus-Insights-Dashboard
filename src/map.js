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
 * @param map the map id
 * @param mapInstance the map instance
 * @param cases the cases
 * @param date the date to filter by
 */
const populateMap = async (map, mapInstance, cases, date) => {
  const size = d3.scaleSqrt()
    .domain([Math.min(...cases.map(item => item[date])), Math.max(...cases.map(item => item[date]))])
    .range([0, 50])
  d3.select(map)
    .select('svg')
    .selectAll('countryCircles')
    .data(cases)
    .enter()
    .append('circle')
    .attr('cx', d => mapInstance.latLngToLayerPoint([d['Lat'], d['Long']]).x)
    .attr('cy', d => mapInstance.latLngToLayerPoint([d['Lat'], d['Long']]).y)
    .attr('r', d => size(d[date]))
    .style('fill', '#dc3545')
    .attr('stroke', '#dc3545')
    .attr('stroke-width', 3)
    .attr('fill-opacity', 0.4)
}

export {
  createMap,
  populateMap
}
