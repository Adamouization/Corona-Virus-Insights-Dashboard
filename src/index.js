import { getDatesFromTimeSeriesObject } from './utils.js'
import { createMap, populateMap } from './map.js'

const mapboxAccessToken = 'pk.eyJ1IjoibWF0dGRyYWdvOTgiLCJhIjoiY2s4MWhia2l0MDUyZTNmb2Rqa2x1YjV0NiJ9.XmI1DncVRdyUOl_yhifSJQ'

const map = L.map('map').setView([47, 2], 5)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
  id: 'mapbox/light-v9',
  maxZoom: 6
}).addTo(map)

L.svg().addTo(map)

const update = () => {
  d3.selectAll('circle')
    .attr('cx', d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
    .attr('cy', d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
}

d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  .then(async cases => populateMap('#map', map, cases))

// const info = L.control()

// info.onAdd = _ => {
//   this._div = L.DomUtil.create('div', 'info') // create a div with a class "info"
//   this.update()
//   return this._div
// }

// // method that we will use to update the control based on feature properties passed
// info.update = (props) => {
//   this._div.innerHTML = '<h4>Number of cases</h4>' + (props
//     ? `<b> ${props.name} </b>`
//     : 'Hover over a state')
// }

// info.addTo(map)

map.on('moveend', update)

// const getColor = d => {
//   return d > 1000 ? '#800026'
//     : d > 500 ? '#BD0026'
//       : d > 200 ? '#E31A1C'
//         : d > 100 ? '#FC4E2A'
//           : d > 50 ? '#FD8D3C'
//             : d > 20 ? '#FEB24C'
//               : d > 10 ? '#FED976'
//                 : '#FFEDA0'
// }

// const style = feature => ({
//   fillColor: getColor(feature.properties.cases),
//   weight: 2,
//   opacity: 1,
//   color: 'white',
//   dashArray: '3',
//   fillOpacity: 0.7
// })

// const resetHighlight = e => {
//   window.mapGeoJson.resetStyle(e.target)
// }

// const zoomToFeature = e => {
//   window.map.fitBounds(e.target.getBounds())
// }

// /**
//  * A function to highlight a country
//  * @param {Event} e A function to highlight a state on the map
//  */
// const highlightCountry = e => {
//   const layer = e.target

//   layer.setStyle({
//     weight: 5,
//     color: '#666',
//     dashArray: '',
//     fillOpacity: 0.7
//   })

//   if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//     layer.bringToFront()
//   }
// }

// const featureHandler = (feature, layer) => {
//   layer.on({
//     mouseover: highlightCountry,
//     mouseout: resetHighlight,
//     click: zoomToFeature
//   })
// }

// const loadAndAttachMap = async () => {
//   const map = createMap(mapboxAccessToken)
//   const data = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
//   window.cases = data
//   window.dateRanges = Object.keys(data.map(object => getDatesFromTimeSeriesObject(object))[0]).sort((a, b) => new Date(b) - new Date(a))
//   window.countries = new Set(data.map(item => item['Country/Region']))
//   const mapGeoJson = await populateMap(data, style, featureHandler)
//   mapGeoJson.addTo(map)
//   return [map, mapGeoJson]
// }

// loadAndAttachMap().then((args) => {
//   const { map, mapGeoJson } = args
//   const legend = L.control({ position: 'bottomright' })

//   legend.onAdd = map => {
//     const div = L.DomUtil.create('div', 'info legend')
//     const grades = [0, 10, 20, 50, 100, 200, 500, 1000]

//     // loop through our density intervals and generate a label with a coloured square for each interval
//     for (let i = 0; i < grades.length; i++) {
//       div.innerHTML +=
//               '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
//               grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
//     }

//     return div
//   }

//   window.map = map
//   window.mapGeoJson = mapGeoJson
//   legend.addTo(map)
// })
