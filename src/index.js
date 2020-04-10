import { getDatesFromTimeSeriesObject } from './utils.js'
import { createMap, populateMap } from './map.js'
import { populateLineGraph } from './line-graph.js'

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
  .then(async cases => {
    const dates = Object.keys(getDatesFromTimeSeriesObject(cases[0]))
    populateMap('#map', map, cases, dates.sort((a, b) => new Date(b) - new Date(a))[0])
  })

map.on('moveend', update)
