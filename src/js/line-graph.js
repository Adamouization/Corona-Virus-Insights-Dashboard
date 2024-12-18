import {buildDatesArr, getCasesOnDay} from "./utils.js"
import {colourScheme, margin} from "./style.js"

/**
 * Main function to build line graphs. Prepares the data and the axes before drawing the graph.
 * @param domElement
 * @param height
 * @param width
 * @param labelSpacing
 * @param cases
 * @param recovered
 * @param deaths
 * @param dates
 */
const populateDailyEvolutionLineGraph = (domElement, height, width, labelSpacing, cases, recovered, deaths, dates) => {
  d3.select(domElement).select('svg').remove()
  // Calculate the number of new confirmed cases on a daily basis.
  const dailyEvolutionCases = _parseDailyEvolution(_parseTotalDailyCases(cases, dates))
  const dailyEvolutionRecoveries = _parseDailyEvolution(_parseTotalDailyCases(recovered, dates))
  const dailyEvolutionDeaths = _parseDailyEvolution(_parseTotalDailyCases(deaths, dates))

  // Build a new array of dates (Date objects instead of strings).
  const datesArr = buildDatesArr(dates)

  // Prepare the X axis for the dates.
  const xScale = _getXScale(datesArr, width)
  const xAxis = d3.axisBottom(xScale)

  // Prepare the Y axis for the number of daily cases.
  const dailyCasesExtent = d3.extent(dailyEvolutionCases)
  const yScale = _getYScale(d3.extent(dailyCasesExtent), height)
  const yAxis = d3.axisLeft(yScale)

  // Prepare the individual d3js line graphs for each array.
  const lines = [
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionCases),
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionRecoveries),
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionDeaths)
  ]

  return _drawChart(domElement, height, xAxis, xScale, yAxis, datesArr, lines, ["Cases", "Recoveries", "Deaths"], labelSpacing)
}

/**
 *
 * @param domElement
 * @param height
 * @param width
 * @param labelSpacing
 * @param cases
 * @param recovered
 * @param deaths
 * @param dates
 */
const populateTotalOccurrencesLineGraph = (domElement, height, width, labelSpacing, cases, recovered, deaths, dates) => {
  d3.select(domElement).select('svg').remove()

  // Reduce number of labels on small screens.
  if (width <= 800) {
    labelSpacing = 8
  }

  // Calculate the number of new confirmed cases on a daily basis.
  const totalCases = _parseTotalDailyCases(cases, dates)
  const totalRecoveries = _parseTotalDailyCases(recovered, dates)
  const totalDeaths = _parseTotalDailyCases(deaths, dates)

  // Build a new array of dates (Date objects instead of strings).
  const datesArr = buildDatesArr(dates)

  // Prepare the X axis for the dates.
  const xScale = _getXScale(datesArr, width)
  const xAxis = d3.axisBottom(xScale)

  // Prepare the Y axis for the number of occurrences.
  const yScale = _getYScale(d3.extent(totalCases), height)
  const yAxis = d3.axisLeft(yScale)

  // Prepare the individual d3js line graphs for each array.
  const lines = [
    _createD3Line(xScale, yScale, datesArr, totalCases),
    _createD3Line(xScale, yScale, datesArr, totalRecoveries),
    _createD3Line(xScale, yScale, datesArr, totalDeaths)
  ]

  return _drawChart(domElement, height, xAxis, xScale, yAxis, datesArr, lines, ["Total cases", "Total recoveries", "Total deaths"], labelSpacing)
}

/**
 * Gathers the total number of cases after each day and stores them in a chronological Array.
 * @param data
 * @param dates
 * @returns {[]}
 * @private
 */
const _parseTotalDailyCases = (data, dates) => {
  let totalDaily = []
  dates.forEach(function (d) {
    totalDaily.push(getCasesOnDay(data, d))
  })
  return totalDaily
}

/**
 * Gathers the daily evolutions of the passed dataset (cases/recoveries/deaths) into an Array.
 * @returns {[]}
 * @param totalDaily
 */
const _parseDailyEvolution = (totalDaily) => {
  let dailyEvolution = []
  for (let i = 0; i < totalDaily.length - 1; i++) {
    dailyEvolution.push(Math.abs(totalDaily[i] - totalDaily[i + 1]))
  }
  return dailyEvolution
}

/**
 * Prepares the X Axis D3Js object.
 * @param datesArr
 * @param width
 * @returns {*}
 * @private
 */
const _getXScale = (datesArr, width) => {
  return d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, width - margin.lineChart])
}

/**
 * Prepares the Y Axis D3Js object.
 * @param data
 * @param height
 * @returns {*}
 * @private
 */
const _getYScale = (data, height) => {
  return d3.scaleLinear()
    .domain(data)
    .range([height, 0])
}

/**
 * Creates a D3JS line object to draw the array values on the graph.
 * @param xScale
 * @param yScale
 * @param datesArr
 * @param dailyEvolution
 * @returns {*}
 */
const _createD3Line = (xScale, yScale, datesArr, dailyEvolution) => {
  return d3.line()
    .x(function (d, i) {
      return xScale(datesArr[i])
    })
    .y(function (d, i) {
      return yScale(dailyEvolution[i])
    })
}

/**
 * Groups functions used to draw the graph.
 * @param domElement
 * @param height
 * @param xAxis
 * @param xScale
 * @param yAxis
 * @param datesArr
 * @param lines
 * @param legendLabels
 * @param labelSpacing
 * @private
 */
const _drawChart = (domElement, height, xAxis, xScale, yAxis, datesArr, lines, legendLabels, labelSpacing) => {
  const colours = [colourScheme.warning, colourScheme.success, colourScheme.danger]
  const lineGraphInstance = _createSVGContainer(domElement, height)
  _drawAxes(lineGraphInstance, height, xAxis, xScale, yAxis, labelSpacing)
  _drawLines(lineGraphInstance, datesArr, lines, colours)
  _drawLegend(lineGraphInstance, colours, legendLabels)
  return lineGraphInstance
}

/**
 * Creates the SVG element in which the graph will be drawn.
 * @param domElement
 * @param height
 * @returns {jQuery}
 * @private
 */
const _createSVGContainer = (domElement, height) => {
  // Instantiate the SVG for the line graph.
  return d3.select(domElement)
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.lineChart + "px")
}

/**
 * Draws the X and Y axes and formats the labels.
 * @param lineGraphInstance
 * @param height
 * @param xAxis
 * @param xScale
 * @param yAxis
 * @param labelSpacing
 * @private
 */
const _drawAxes = (lineGraphInstance, height, xAxis, xScale, yAxis, labelSpacing) => {
  // Add the X axis to the svg. Only add a label every 16 days. Rotate labels to fit axis.
  lineGraphInstance.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin.lineChart + "," + height + ")")
    .call(xAxis
      .tickFormat(d3.timeFormat("%m/%d/%y"))
      .tickValues(xScale.domain()
        .filter(function (d, i) {
          return !(i % (labelSpacing * 6))
        })))
    .selectAll("text")
    .style("text-anchor", "end")
    .style('font-size', "12px")
    .attr("dx", "-0.8em")
    .attr("dy", "-0.15em")
    .attr("transform", "rotate(-65)")

  // Add the Y axis to the svg with adjusted transform for better visibility.
  lineGraphInstance.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin.lineChart + 10) + ",0)") // Adjusted for better visibility
    .style('font-size', "12px")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("dx", "-0.75em")
    .style("text-anchor", "end")
    .text("Occurrences")
}

/**
 * Draws the individual lines graphs.
 * @param lineGraphInstance
 * @param datesArr
 * @param lines
 * @param colours
 * @private
 */
const _drawLines = (lineGraphInstance, datesArr, lines, colours) => {
  // Draw the lines.
  for (let i = 0; i < 3; i++) {
    lineGraphInstance.append("path")
      .datum(datesArr)
      .attr("class", "line")
      .attr("d", lines[i])
      .attr("transform", "translate(" + margin.lineChart + ",0)")  // translate by the same amount as the Y axis.
      .style("stroke", colours[i])
  }
}

/**
 * Draws the legend to allow the colour scheme to be understood when visualised.
 * @param lineGraphInstance
 * @param colours
 * @param legendLabels
 * @private
 */
const _drawLegend = (lineGraphInstance, colours, legendLabels) => {
  const legend = lineGraphInstance.append("g")
    .attr("transform", "translate(100, -180)")

  for (let i = 0; i < legendLabels.length; i++) {
    let row = legend.append("g").attr("transform", "translate(0, " + (200 + (i * 25)) + ")")
    row.append("rect")
      .attr("width", 20)
      .attr("height", 4)
      .attr("fill", colours[i])
      .attr("stroke", "black")
    row.append("text")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .attr("transform", "translate(35, -2)")
      .text(legendLabels[i])
  }
}

/**
 * Delete paths in a line chart.
 * @param svgElement
 */
const deleteLineChart = (svgElement) => {
  svgElement.selectAll("path").remove()
}

export {
  populateDailyEvolutionLineGraph,
  populateTotalOccurrencesLineGraph,
  deleteLineChart
}
