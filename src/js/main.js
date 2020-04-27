import {getDatesFromTimeSeriesObject} from './utils.js'
import {populateDailyEvolutionLineGraph} from './line-graph.js'
import {buildLollipopChart} from './lollipop.js'
import {bubbleLayer} from './bubble.js'
import {createMap} from './map.js'
import {mapBubbleStyle} from './style.js'

const margin = {top: 10, right: 30, bottom: 40, left: 100},
  width = 460 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom

const mapboxAccessToken = 'pk.eyJ1IjoibWF0dGRyYWdvOTgiLCJhIjoiY2s4MWhia2l0MDUyZTNmb2Rqa2x1YjV0NiJ9.XmI1DncVRdyUOl_yhifSJQ'

const map = createMap(mapboxAccessToken).setView([47, 2], 5)

/**
 * A function to construct a mapping to a geojson object from the case timeseries
 * @param cases the cases
 * @param date the date
 * @returns {{features: Uint8Array | BigInt64Array | {geometry: {coordinates: [number, number, number], type: string}, type: string, properties: {cases, name}}[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array, type: string}}
 */
const getGeoJsonFromCases = (cases, recoveries, deaths, date) => ({
  type: "FeatureCollection",
  features: cases.map(reading => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(reading['Long']), Number(reading['Lat']), 0]
    },
    properties: {
      'Country': reading['Country/Region'],
      'State': reading['Province/State'],
      cases: Number(reading[date])
    },
  }))
})

/**
 * Inits a new d3 lollipop chart
 */
const caseBreakdownLollipopChart = d3.select("#case-breakdown")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

/**
 * A function to get a breakdown of case details for a given day
 * @param cases the cases time series
 * @param deaths the death time series
 * @param recovered the recovered time series
 * @param currentDate the current date
 * @returns {[{reading: string, value: bigint}, {reading: string, value: bigint}, {reading: string, value: bigint}]}
 */
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

/**
 * An function to build the charts
 * @returns {Promise<void>}
 */
const buildCharts = async () => {
  const cases = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  const recovered = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv')
  const deaths = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv')
  const dates = Object.keys(getDatesFromTimeSeriesObject(cases[0]))
  const currentDate = dates.sort((a, b) => new Date(b) - new Date(a))[0]
  // await populateMap('#map', map, cases, currentDate)
  const geoJSON = getGeoJsonFromCases(cases, recovered, deaths, currentDate)
  bubbleLayer(geoJSON, { property: 'cases', legend: true, tooltip: true, style: mapBubbleStyle()}).addTo(map)
  buildLollipopChart(caseBreakdownLollipopChart, 'case-breakdown', width, height, getCaseDetails(cases, deaths, recovered, currentDate))
  populateDailyEvolutionLineGraph('#line-graph-daily-evolution', cases, recovered, deaths, dates)
  populateDailyEvolutionLineGraph('#line-graph-total', cases, recovered, deaths, dates)
}

// Build the charts
buildCharts().then(() => {})

// Update on move
map.on('moveend', () => {
  d3.selectAll('.mapCircle')
    .attr('cx', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).x)
    .attr('cy', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).y)
})
