import {colourScheme, margin} from "./style.js"

/**
 *
 * @param name
 * @param height
 * @param width
 * @param data
 * @param xKey
 * @param yKey
 * @returns {jQuery}
 */
const buildLollipopChart = (name, height, width, data, xKey = 'value', yKey = 'reading') => {
  const chart = _createSVGContainer(height)

  // Axes
  const x = _getXAxis(data, width)
  const y = _getYAxis(height, data.map(item => item[yKey]))
  _drawAxes(chart, height, x, y)

  // Lines
  chart.selectAll(`line${name}lollipop`)
    .data(data)
    .enter()
    .append('line')
    .attr('x1', d => x(d[xKey]))
    .attr('x2', x(0))
    .attr('y1', d => y(d[yKey]))
    .attr('y2', d => y(d[yKey]))
    .attr('stroke', 'grey')

  // Circles
  chart.selectAll(`circle${name}lollipop`)
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d[xKey]))
    .attr('cy', (d) => y(d[yKey]))
    .attr('r', '4')
    .style('fill', colourScheme.primary)
    .attr('stroke', 'black')
  chart.selectAll(`circle${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('cx', d => x(d[xKey]))

  chart.selectAll(`line${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('x1', d => x(d[xKey]))

  return chart
}

/**
 * Creates the SVG that will hold the lollipop chart.
 * @param height
 * @returns {jQuery}
 * @private
 */
const _createSVGContainer = (height) => {
  d3.select('#case-breakdown').select('svg').remove()
  return d3.select("#case-breakdown")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin + ",0)")
}

/**
 * Create X axis.
 * @param data
 * @param width
 * @returns {*}
 */
const _getXAxis = (data, width) => {
  return d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {
      return d.value
    })])
    .range([0, width - margin])
}

/**
 * Create Y axis.
 * @param height
 * @param categories
 * @returns {*}
 */
const _getYAxis = (height, categories) => d3.scaleBand()
  .range([0, height - margin])
  // .domain(data.map(function(d) { return d[selector]; }))
  .domain(categories)
  .padding(1)

/**
 * Draw the axes.
 * @param chart
 * @param height
 * @param xAxisFunction
 * @param yAxisFunction
 */
const _drawAxes = (chart, height, xAxisFunction, yAxisFunction) => {
  chart.append('g')
    .attr('transform', 'translate(0, ' + (height - margin) + ')')
    .call(d3.axisBottom(xAxisFunction))
    .selectAll('text')
    .attr('transform', 'translate(-10,10)rotate(-65)')
    .style('text-anchor', 'end')
  chart.append('g')
    .call(d3.axisLeft(yAxisFunction))
}

/**
 * Delete lines and circles in the lollipop chart.
 * @param svgElement
 */
const deleteLollipopChart = (svgElement) => {
  svgElement.selectAll("line").remove()
  svgElement.selectAll("circle").remove()
}

export {
  buildLollipopChart,
  deleteLollipopChart
}
