import { getDatesFromTimeSeriesObject, getByCountry } from './utils.js'

d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv')
  .then((data) => {
    window.cases = data
    window.dateRanges = Object.keys(data[0].map(object => getDatesFromTimeSeriesObject(object))[0]).sort((a, b) => new Date(b) - new Date(a))
    window.countries = new Set(data.map(item => item['Country/Region']))
  })

const mapboxAccessToken = 'pk.eyJ1IjoibWF0dGRyYWdvOTgiLCJhIjoiY2s4MWhia2l0MDUyZTNmb2Rqa2x1YjV0NiJ9.XmI1DncVRdyUOl_yhifSJQ'

const map = L.map('map', {
  minZoom: 0,
  maxZoom: 4
})

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
  id: 'mapbox/light-v9',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map)

// const countries = new Set(window.cases.map(item => item['Country/Region']))
// L.geoJson(statesData).addTo(map)
d3.json('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
  .then(data => {
    L.geoJson(data).addTo(map)
    map.setView([37.8, -96], 2)
  })

console.log(window.cases.filter(item => item['Country/Region'].toLowerCase() === 'China'.toLowerCase())[0])
