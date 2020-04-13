import {getDatesFromTimeSeriesObject} from './utils.js'
import {populateMap} from './map.js'
import {populateLineGraph} from './line-graph.js'
import {buildLollipopChart} from './lollipop.js'

const margin = {top: 10, right: 30, bottom: 40, left: 100},
  width = 460 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom

const mapboxAccessToken = 'pk.eyJ1IjoibWF0dGRyYWdvOTgiLCJhIjoiY2s4MWhia2l0MDUyZTNmb2Rqa2x1YjV0NiJ9.XmI1DncVRdyUOl_yhifSJQ'

const map = L.map('map').setView([47, 2], 5)

const caseBreakdownLollipopChart = d3.select("#case-breakdown")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
  id: 'mapbox/light-v9',
  maxZoom: 6
}).addTo(map)

L.svg().addTo(map)

const getCaseDetails = (cases, deaths, recovered, currentDate) => [
  {
    reading: 'total',
    value: cases.map(country => Number(country[currentDate])).reduce((prev, next) => prev + next)
  },
  {
    reading: 'deaths',
    value: deaths.map(country => Number(country[currentDate])).reduce((prev, next) => prev + next),
  },
  {
    reading: 'recovered',
    value: recovered.map(country => Number(country[currentDate])).reduce((prev, next) => prev + next)
  }]


const buildCharts = async () => {
  const cases = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  const recovered = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv')
  const deaths = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv')
  const dates = Object.keys(getDatesFromTimeSeriesObject(cases[0]))
  const currentDate = dates.sort((a, b) => new Date(b) - new Date(a))[0]
  await
    populateMap('#map', map, cases, currentDate)
    buildLollipopChart(caseBreakdownLollipopChart,
                'case-breakdown',
                      width,
                      height,
                      getCaseDetails(cases, deaths, recovered, currentDate))
  await populateLineGraph('#line-graph', cases, dates)
}

buildCharts().then(() => {})

map.on('moveend', () => {
  d3.selectAll('countryCircles')
    .attr('cx', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).x)
    .attr('cy', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).y)
})
