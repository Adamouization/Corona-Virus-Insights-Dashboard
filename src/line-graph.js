import {getCasesOnDay} from "./utils.js"

const populateLineGraph = async (lineGraphDom, cases, dates) => {
  let margin = 50

  // Reverse dates to have them in chronological order, and get the first and last date.
  dates.reverse()
  let dateExtent = d3.extent(dates)

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
  let datesArr = d3.timeDay.range(new Date(dateExtent[0]), new Date(dateExtent[1]));
  let xScale = d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, 500 - margin])
  let xAxis = d3.axisBottom(xScale)

  let dailyCasesExtent = d3.extent(dailyEvolution)
  let yScale = d3.scaleLinear()
    .domain(dailyCasesExtent)
    .range([520, 0])
  let yAxis = d3.axisLeft(yScale)

  // Instantiate the SVG for the line graph.
  let lineGraphInstance = d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh");

  // Add the X axis to the svg. Only add a label every 9 days. Rotate labels to fit axis.
  lineGraphInstance.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin + "," + 520 + ")")
    .call(xAxis.tickFormat(d3.timeFormat("%m/%d/%y"))
      .tickValues(xScale.domain()
        .filter(function (d, i) {
          return !(i % 9)
        })))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em")
    .attr("transform", "rotate(-90)")

  lineGraphInstance.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin + ",0)")
    .call(yAxis)
}

export {
  populateLineGraph
}
