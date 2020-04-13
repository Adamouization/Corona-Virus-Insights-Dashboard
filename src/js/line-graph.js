import {getCasesOnDay} from "./utils.js"

const populateLineGraph = async (lineGraphDom, cases, dates) => {
  let margin = 50

  // Reverse dates to have them in chronological order.
  dates.reverse()

  // Calculate the number of new confirmed cases on a daily basis.
  let totalCasesPerDay = []
  dates.forEach(function (d) {
    totalCasesPerDay.push(getCasesOnDay(cases, d))
  })
  let dailyEvolution = []
  for (let i = 0; i < totalCasesPerDay.length - 1; i++) {
    dailyEvolution.push(Math.abs(totalCasesPerDay[i] - totalCasesPerDay[i + 1]))
  }

  // Prepare the X axis for the dates.
  // Build a new array of dates (Date objects instead of strings).
  let datesArr = d3.timeDay.range(new Date(dates[0]), new Date(dates[dates.length - 1]));
  let xScale = d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, 500 - margin])
  let xAxis = d3.axisBottom(xScale)

  // Prepare the Y axis for the number of daily cases.
  let dailyCasesExtent = d3.extent(dailyEvolution)
  let yScale = d3.scaleLinear()
    .domain(dailyCasesExtent)
    .range([520, 0])
  let yAxis = d3.axisLeft(yScale)

  // Prepare the line graph data.
  const line = d3.line()
    .x(function (d, i) {
      return xScale(datesArr[i])
    })
    .y(function (d, i) {
      return yScale(dailyEvolution[i])
    })

  // Instantiate the SVG for the line graph.
  let lineGraphInstance = d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh");

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

  // Add the line to the svg.
  lineGraphInstance.append("path")
    .datum(datesArr)
    .attr("class", "line")
    .attr("d", line)
    .attr("transform", "translate(" + margin + ",0)")  // translate by the same amount as the Y axis.
}

export {
  populateLineGraph
}
