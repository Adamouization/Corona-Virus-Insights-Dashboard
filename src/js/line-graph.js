import {buildDatesArr, getCasesOnDay} from "./utils.js"

const margin = 55

/**
 * Main function to build line graphs. Prepares the data and the axes before drawing the graph.
 * @param lineGraphDom
 * @param cases
 * @param recovered
 * @param deaths
 * @param dates
 */
const populateDailyEvolutionLineGraph = (lineGraphDom, cases, recovered, deaths, dates) => {
  // Reverse dates to have them in chronological order.
  dates.reverse()

  // Calculate the number of new confirmed cases on a daily basis.
  const dailyEvolutionCases = _parseDailyEvolution(_parseTotalDailyCases(cases, dates))
  const dailyEvolutionRecoveries = _parseDailyEvolution(_parseTotalDailyCases(recovered, dates))
  const dailyEvolutionDeaths = _parseDailyEvolution(_parseTotalDailyCases(deaths, dates))

  // Build a new array of dates (Date objects instead of strings).
  const datesArr = d3.timeDay.range(new Date(dates[0]), new Date(dates[dates.length - 1]));

  // Prepare the X axis for the dates.
  const xScale = d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, 500 - margin])
  const xAxis = d3.axisBottom(xScale)

  // Prepare the Y axis for the number of daily cases.
  const dailyCasesExtent = d3.extent(dailyEvolutionCases)
  const yScale = d3.scaleLinear()
    .domain(dailyCasesExtent)
    .range([520, 0])
  const yAxis = d3.axisLeft(yScale)

  // Prepare the individual d3js line graphs for each array.
  const lines = [
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionCases),
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionRecoveries),
    _createD3Line(xScale, yScale, datesArr, dailyEvolutionDeaths)
  ]

  _drawChart(lineGraphDom, xAxis, xScale, yAxis, datesArr, lines, ["Confirmed cases", "Recoveries", "Deaths"])
}

/**
 *
 * @param lineGraphDom
 * @param cases
 * @param recovered
 * @param deaths
 * @param dates
 */
const populateTotalOccurrencesLineGraph = (lineGraphDom, cases, recovered, deaths, dates) => {
  // Reverse dates to have them in chronological order.

  // Calculate the number of new confirmed cases on a daily basis.
  const totalCases = _parseTotalDailyCases(cases, dates)
  const totalRecoveries = _parseTotalDailyCases(recovered, dates)
  const totalDeaths = _parseTotalDailyCases(deaths, dates)

  // Build a new array of dates (Date objects instead of strings).
  const datesArr = buildDatesArr(dates)

  // Prepare the X axis for the dates.
  const xScale = d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, 500 - margin])
  const xAxis = d3.axisBottom(xScale)

  // Prepare the Y axis for the number of daily cases.
  const dailyCasesExtent = d3.extent(totalCases)
  const yScale = d3.scaleLinear()
    .domain(dailyCasesExtent)
    .range([520, 0])
  const yAxis = d3.axisLeft(yScale)

  // Prepare the individual d3js line graphs for each array.
  const lines = [
    _createD3Line(xScale, yScale, datesArr, totalCases),
    _createD3Line(xScale, yScale, datesArr, totalRecoveries),
    _createD3Line(xScale, yScale, datesArr, totalDeaths)
  ]

  _drawChart(lineGraphDom, xAxis, xScale, yAxis, datesArr, lines, ["Total confirmed cases", "Total recoveries", "Total deaths"])
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
 * @param lineGraphDom
 * @param xAxis
 * @param xScale
 * @param yAxis
 * @param datesArr
 * @param lines
 * @param legendLabels
 * @private
 */
const _drawChart = (lineGraphDom, xAxis, xScale, yAxis, datesArr, lines, legendLabels) => {
  const colourScheme = ["#f6c23e", "#1cc88a", "#e74a3b"]
  const lineGraphInstance = _createSVGContainer(lineGraphDom)
  _drawAxes(lineGraphInstance, xAxis, xScale, yAxis)
  _drawLines(lineGraphInstance, datesArr, lines, colourScheme)
  _drawLegend(lineGraphInstance, colourScheme, legendLabels)
}

/**
 * Creates the SVG element in which the graph will be drawn.
 * @param lineGraphDom
 * @returns {jQuery}
 * @private
 */
const _createSVGContainer = (lineGraphDom) => {
  // Instantiate the SVG for the line graph.
  return d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh")
}

/**
 * Draws the X and Y axes and formats the labels.
 * @param lineGraphInstance
 * @param xAxis
 * @param xScale
 * @param yAxis
 * @private
 */
const _drawAxes = (lineGraphInstance, xAxis, xScale, yAxis) => {
  // Add the X axis to the svg. Only add a label every 8 days. Rotate labels to fit axis.
  lineGraphInstance.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin + "," + 520 + ")")
    .call(xAxis
      .tickFormat(d3.timeFormat("%m/%d/%y"))
      .tickValues(xScale.domain()
        .filter(function (d, i) {
          return !(i % 8)
        })))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "-0.15em")
    .attr("transform", "rotate(-65)")

  // Add the Y axis to the svg.
  lineGraphInstance.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin + ",0)")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("dx", "-0.75em")
    .style("text-anchor", "end")
    .text("Confirmed cases")
}

/**
 * Draws the individual lines graphs.
 * @param lineGraphInstance
 * @param datesArr
 * @param lines
 * @param colourScheme
 * @private
 */
const _drawLines = (lineGraphInstance, datesArr, lines, colourScheme) => {
  // Draw the lines.
  for (let i = 0; i < 3; i++) {
    lineGraphInstance.append("path")
      .datum(datesArr)
      .attr("class", "line")
      .attr("d", lines[i])
      .attr("transform", "translate(" + margin + ",0)")  // translate by the same amount as the Y axis.
      .style("stroke", colourScheme[i])
  }
}

/**
 * Draws the legend to allow the colour scheme to be understood when visualised.
 * @param lineGraphInstance
 * @param colourScheme
 * @param legendLabels
 * @private
 */
const _drawLegend = (lineGraphInstance, colourScheme, legendLabels) => {
  // Add the legend.

  const legend = lineGraphInstance.append("g")
    .attr("transform", "translate(100, -180)")

  for (let i = 0; i < legendLabels.length; i++) {
    let row = legend.append("g").attr("transform", "translate(0, " + (200 + (i * 25)) + ")");
    row.append("rect")
      .attr("width", 20)
      .attr("height", 4)
      .attr("fill", colourScheme[i])
      .attr("stroke", "black")
    row.append("text")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .attr("transform", "translate(35, -2)")
      .text(legendLabels[i])
  }
}

export {
  populateDailyEvolutionLineGraph,
  populateTotalOccurrencesLineGraph
}