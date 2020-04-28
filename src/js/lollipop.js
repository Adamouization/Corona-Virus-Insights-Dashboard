const xAxis = (width, max) => d3.scaleLinear()
  .domain([0, max])
  .range([0, width])

const yAxis = (height, categories) => d3.scaleBand()
  .range([0, height])
  .domain(categories)
  .padding(1)

const buildAxis = (chart, height, xAxisFunction, yAxisFunction) => {
  chart.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xAxisFunction))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end')
  chart.append('g')
    .call(d3.axisLeft(yAxisFunction))
}

const buildLollipopChart = (chart, name, width, height, data, xKey = 'value', yKey = 'reading') => {
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {
      return d.value
    })])
    .range([0, width])
  const y = yAxis(height, data.map(item => item[yKey]))
  // Lines
  buildAxis(chart, height, x, y)
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
    .style('fill', '#69b3a2')
    .attr('stroke', 'black')
  chart.selectAll(`circle${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('cx', d => x(d[xKey]))

  chart.selectAll(`line${name}lollipop`)
    .transition()
    .duration(2000)
    .attr('x1', d => x(d[xKey]))
}

export {
  buildLollipopChart
}
