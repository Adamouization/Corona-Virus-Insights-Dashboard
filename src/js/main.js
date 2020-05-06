import {getCasesOnDay, getCurrentDate, getDates, numberWithCommas, getDatesFromTimeSeriesObject} from './utils.js'
import {deleteLineChart, populateDailyEvolutionLineGraph, populateTotalOccurrencesLineGraph} from './line-graph.js'
import {buildLollipopChart, deleteLollipopChart} from './lollipop.js'
import {bubbleLayer} from './bubble.js'
import {createMap, removeMarkers} from './map.js'
import {mapBubbleStyle} from './style.js'

window.graphData = {}
window.filters = {
  country: ''
}
const lineChartDailyDivId = "line-graph-daily-evolution"
const lineChartTotalDivId = "line-graph-total"
const lollipopChartDivId = "case-breakdown"

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
      Population: isoPopulation.filter(country => country['Province_State'] === reading['Province/State'])
        .filter(country => country['Country_Region'] === reading['Country/Region'])[0]['Population']
    },
  }))
})

/**
 *
 * @param geoJson
 * @returns {{features: {properties: {"Mortality Rate": number, "Infections per 1000": number}}[], type: string}}
 */
const standardiseGeoJson = geoJson => ({
  type: "FeatureCollection",
  features: geoJson.features.map(feature => ({
    ...feature,
    properties: {
      ...feature.properties,
      'Infections per 1000': (feature.properties.cases / feature.properties.Population * 1000).toPrecision(3) + "‰",
      'Mortality Rate': (feature.properties.deaths / feature.properties.cases * 100).toPrecision(3) + "%"
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
const getCaseDetails = (cases, recovered, deaths, currentDate) => [
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
 *
 * @param name
 * @param cases
 * @param recovered
 * @param deaths
 */
const applyCountryFilter = (name, cases, recovered, deaths) => {
  // Filtered data.
  const filter = reading => reading['Country/Region'] === name
  const filteredCases = cases.filter(filter)
  const filteredRecoveries = recovered.filter(filter)
  const filteredDeaths = deaths.filter(filter)

  // Redraw charts.
  buildLollipopChart(lollipopChartDivId, 212, document.getElementById(lollipopChartDivId).offsetWidth - 35, getCaseDetails(filteredCases, filteredRecoveries, filteredDeaths, getCurrentDate(cases)))
  populateDailyEvolutionLineGraph('#' + lineChartDailyDivId, 210, document.getElementById(lineChartDailyDivId).offsetWidth, 8, filteredCases, filteredRecoveries, filteredDeaths, getDates(cases))
  populateTotalOccurrencesLineGraph('#' + lineChartTotalDivId, 300, document.getElementById(lineChartTotalDivId).offsetWidth, 2, filteredCases, filteredRecoveries, filteredDeaths, getDates(cases))
}

/**
 * A function to create the breadcrumbs for the country filter
 * @param name the country name
 * @param onclick the on click function
 * @param crumb_class the crumb class
 * @param filterParent the filter parent document
 */
const createFilterBreadCrumb = (name, onclick, crumb_class='country-filter-crumb', filterParent = 'filter-container') => {
  const template = document.createElement('div')
  template.innerHTML = `<button class="btn btn-secondary ${crumb_class}">
                            <span class="txt">${name}</span>
                            <span class="round"><i class="fas text-gray-300 fa-times"></i></span>
                        </button>`
  template.firstChild.childNodes[3].firstChild.addEventListener('click', onclick)
  document.getElementById(filterParent).appendChild(template)
}

/**
 *
 * @param e
 */
const onBubble = e => {
  const {properties} = e.sourceTarget.feature
  const {cases, recovered, deaths} = window.graphData
  applyCountryFilter(properties['Name'], cases, recovered, deaths)
  document.querySelectorAll('button.country-filter-crumb').forEach(crumb => crumb.remove())
  createFilterBreadCrumb(properties['Name'], e => {
    e.currentTarget.parentNode.parentNode.remove()
    buildCharts(window.graphData).then(() => {
    })
  })
}

/**
 * Populates the 4 cards at the top of the dashboard.
 * @param data
 */
function populateCards(data) {
  const currentDate = getDates(data.cases)[getDates(data.cases).length - 1]
  const previousDate = getDates(data.cases)[getDates(data.cases).length - 2]

  // Update the cards
  document.getElementById('card-date').innerHTML = currentDate
  document.getElementById('card-total-confirmed-cases').innerHTML = numberWithCommas(getCasesOnDay(data.cases, currentDate))
  document.getElementById('card-confirmed-cases-today').innerHTML = numberWithCommas(Math.abs(getCasesOnDay(data.cases, currentDate) - getCasesOnDay(data.cases, previousDate)))
}

/**
 * An function to build the charts
 * @returns {Promise<object>}
 */
const buildCharts = async (data, date = undefined) => {
  const {latLongIso, cases, recovered, deaths} = data
  const currentDate = date || getCurrentDate(cases)
  const geoJSON = standardiseGeoJson(getGeoJsonFromCases(cases, recovered, deaths, latLongIso, currentDate))
  removeMarkers(map, 'bubblelayer')
  bubbleLayer(geoJSON, {
    property: 'cases',
    onBubbleClick: onBubble,
    legend: true,
    tooltip: true,
    style: mapBubbleStyle()
  }).addTo(map)

  // Build charts
  const lollipopChart = buildLollipopChart(lollipopChartDivId, 212, document.getElementById(lollipopChartDivId).offsetWidth - 35, getCaseDetails(cases, recovered, deaths, currentDate))
  const svgLineChartDaily = populateDailyEvolutionLineGraph('#' + lineChartDailyDivId, 210, document.getElementById(lineChartDailyDivId).offsetWidth, 8, cases, recovered, deaths, getDates(cases))
  const svgLineChartTotal = populateTotalOccurrencesLineGraph('#' + lineChartTotalDivId, 300, document.getElementById(lineChartTotalDivId).offsetWidth, 2, cases, recovered, deaths, getDates(cases))
  return {
    latLongIso,
    cases,
    recovered,
    deaths,
    svgLineChartDaily,
    svgLineChartTotal,
    lollipopChart,
    currentDate,
  }
}

/**
 * A function to asynchronously load the data
 * @returns {Promise<{recovered: *, cases: *, latLongIso: *, currentDate, deaths: *}>}
 */
const loadData = async () => {
  const dataSources = await Promise.all([
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv'),
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'),
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'),
    d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv')
  ])
  const currentDate = Object.keys(getDatesFromTimeSeriesObject(dataSources[1])).sort((a, b) => new Date(b) - new Date(a))[0]
  return {
    latLongIso: dataSources[0],
    cases: dataSources[1],
    recovered: dataSources[2],
    deaths: dataSources[3],
    currentDate,
  }
}

loadData().then(data => {
  window.graphData = data
  buildCharts(window.graphData).then((data) => {
    window.graphData = data

    // Populate the 4 cards at the top with the latest data.
    populateCards(data)

    // Search bar
    document.getElementById('search-button').addEventListener('click', e => {
      const query = document.getElementById('search-query').value.toLowerCase()
      const {latLongIso} = data
      const countriesFiltered = latLongIso
        .filter(country => country['Country_Region'].toLowerCase() === query
          || country['Province_State'].toLowerCase() === query)
      if (countriesFiltered.length === 0 || query === '') {
        document.getElementById('search-query').classList.add('is-invalid')
        document.getElementById('validation-msg').innerHTML = 'That country or state does not exist.'
      } else {
        document.getElementById('search-query').classList.remove('is-invalid')
        map.panTo(new L.LatLng(countriesFiltered[0]['Lat'], countriesFiltered[0]['Long_']), {
          animate: true,
          duration: 0.75
        })
      }
    })

    // Update chart sizes on window resize.
    window.onresize = function (event) {
      // Erase existing lines
      deleteLineChart(window.graphData.svgLineChartTotal)
      deleteLollipopChart(window.graphData.lollipopChart)
      deleteLineChart(window.graphData.svgLineChartDaily)

      // Redraw charts
      const lollipopChartDivId = "case-breakdown"
      const lineChartDailyDivId = "line-graph-daily-evolution"
      const lineChartTotalDivId = "line-graph-total"
      const svgLineChartDaily = populateDailyEvolutionLineGraph('#' + lineChartDailyDivId, 210, document.getElementById(lineChartDailyDivId).offsetWidth, 8, window.graphData.cases, window.graphData.recovered, window.graphData.deaths, getDates(window.graphData.cases))
      const lollipopChart = buildLollipopChart(lollipopChartDivId, 212, document.getElementById(lollipopChartDivId).offsetWidth - 35, getCaseDetails(window.graphData.cases, window.graphData.recovered, window.graphData.deaths, getCurrentDate(window.graphData.cases)))
      const svgLineChartTotal = populateTotalOccurrencesLineGraph('#' + lineChartTotalDivId, 300, document.getElementById(lineChartTotalDivId).offsetWidth, 2, window.graphData.cases, window.graphData.recovered, window.graphData.deaths, getDates(window.graphData.cases))

      // Save the new SVG charts for future resizing
      window.graphData.svgLineChartDaily = svgLineChartDaily
      window.graphData.lollipopChart = lollipopChart
      window.graphData.svgLineChartTotal = svgLineChartTotal
    }
  })
})

// Update on move
map.on('moveend', () => {
  d3.selectAll('.mapCircle')
    .attr('cx', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).x)
    .attr('cy', d => map.latLngToLayerPoint([d['Lat'], d['Long']]).y)
})
