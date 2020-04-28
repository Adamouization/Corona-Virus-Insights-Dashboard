import {getDatesFromTimeSeriesObject} from './utils.js'
import {populateDailyEvolutionLineGraph, populateTotalOccurrencesLineGraph} from './line-graph.js'
import {buildLollipopChart} from './lollipop.js'
import {bubbleLayer} from './bubble.js'
import {createMap} from './map.js'
import {mapBubbleStyle} from './style.js'

window.graphData = {}

const margin = {top: 10, right: 30, bottom: 40, left: 100},
  width = 460 - margin.left - margin.right,
  height = 240 - margin.top - margin.bottom


const mapboxAccessToken = 'pk.eyJ1IjoibWF0dGRyYWdvOTgiLCJhIjoiY2s4MWhia2l0MDUyZTNmb2Rqa2x1YjV0NiJ9.XmI1DncVRdyUOl_yhifSJQ'
const map = createMap(mapboxAccessToken).setView([47, 2], 5)

/**
 * A function to construct a mapping to a geojson object from the case timeseries
 * @param cases the cases
 * @param recoveries a list of objects of countries and their recoveries
 * @param deaths a list of objects of countries and their deaths
 * @param isoPopulation a list of object of all the countries + state listed in the data set along with their population and lat longitude
 * @param date the date
 * @returns {{features: Uint8Array | BigInt64Array | {geometry: {coordinates: [number, number, number], type: string}, type: string, properties: {cases, name}}[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array, type: string}}
 */
const getGeoJsonFromCases = (cases, recoveries, deaths, isoPopulation, date) => ({
  type: "FeatureCollection",
  features: cases.map(reading => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Number(reading['Long']), Number(reading['Lat']), 0]
    },
    properties: {
      'Name': reading['Province/State'] || reading['Country/Region'],
      cases: Number(reading[date]),
      recovered: _.get(recoveries.filter(recovery => recovery['Province/State'] === reading['Province/State'])
        .filter(recovery => recovery['Country/Region'] === reading['Country/Region']), ['0', date], 0),
      deaths: _.get(deaths.filter(death => death['Province/State'] === reading['Province/State'])
        .filter(death => death['Country/Region'] === reading['Country/Region']), ['0', date], 0),
      population: isoPopulation.filter(country => country['Province_State'] === reading['Province/State'])
        .filter(country => country['Country_Region'] === reading['Country/Region'])[0]['Population']
    },
  }))
})

const standardiseGeoJson = geoJson => ({
  type: "FeatureCollection",
  features: geoJson.features.map(feature => ({...feature,
    properties: {
    ...feature.properties,
      'Infections per 1000': feature.properties.cases / feature.properties.population * 1000,
      'Mortality Rate': feature.properties.deaths / feature.properties.cases
  }
  }))
})

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

const onBubble = e => {
  const { properties } = e.sourceTarget.feature
  const {cases, recovered, deaths} = window.graphData
  const filter = reading => reading['Country/Region'] === properties['Name']
  populateDailyEvolutionLineGraph('#line-graph-daily-evolution', 210, 600, 8,
    cases.filter(filter), recovered.filter(filter), deaths.filter(filter),
    Object.keys(getDatesFromTimeSeriesObject(cases[0])))
  populateTotalOccurrencesLineGraph('#line-graph-total', 300, 1600, 2,
    cases.filter(filter), recovered.filter(filter), deaths.filter(filter),
    Object.keys(getDatesFromTimeSeriesObject(cases[0])))

}
/**
 * An function to build the charts
 * @returns {Promise<object>}
 */
const buildCharts = async () => {
  const latLongIso = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv')
  const cases = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
  const recovered = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv')
  const deaths = await d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv')
  const currentDate = Object.keys(getDatesFromTimeSeriesObject(cases[0])).sort((a, b) => new Date(b) - new Date(a))[0]
  // await populateMap('#map', map, cases, currentDate)
  const geoJSON = standardiseGeoJson(getGeoJsonFromCases(cases, recovered, deaths, latLongIso, currentDate))
  bubbleLayer(geoJSON, { property: 'cases', onBubbleClick: onBubble, legend: true, tooltip: true, style: mapBubbleStyle()}).addTo(map)
  buildLollipopChart('case-breakdown', 215, 600, getCaseDetails(cases, deaths, recovered, currentDate))
  const dates = Object.keys(getDatesFromTimeSeriesObject(cases[0]))
  populateDailyEvolutionLineGraph('#line-graph-daily-evolution', 210, 600, 8, cases, recovered, deaths, dates)
  populateTotalOccurrencesLineGraph('#line-graph-total', 300, 1600, 2, cases, recovered, deaths, dates)
  return {
    latLongIso,
    cases,
    recovered,
    deaths
  }
}

// Build the charts
buildCharts().then((data) => {
  window.graphData = data
  document.getElementById('search-button').addEventListener('click', e => {
    const query = document.getElementById('search-query').value.toLowerCase()
    const { latLongIso } = data
    const countriesFiltered = latLongIso
      .filter(country => country['Country_Region'].toLowerCase() === query
        || country['Province_State'].toLowerCase() === query)
    if (countriesFiltered.length === 0 || query === '') {
      document.getElementById('search-query').classList.add('is-invalid')
      document.getElementById('validation-msg').innerHTML = 'That country or state does not exist.'
    } else {
      document.getElementById('search-query').classList.remove('is-invalid')
      map.panTo(new L.LatLng(countriesFiltered[0]['Lat'], countriesFiltered[0]['Long_']), {animate: true, duration: 0.75})
    }
  })
})

// Update on move
map.on('moveend', () => {
  d3.selectAll('.mapCircle')
    .attr('cx', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).x)
    .attr('cy', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).y)
})
