import {getCasesOnDay} from "./utils.js"

const populateLineGraph = async (lineGraphDom, cases, dates) => {
  // Reverse dates to have them in chronological order, and get the first and last date.
  dates.reverse()
  let dateExtent = d3.extent(dates)

  // Build a new array of dates (Date objects instead of strings).
  let datesArr = d3.timeDay.range(new Date(dateExtent[0]), new Date(dateExtent[1]));

  // Prepare the X axis for the dates.
  let xScale = d3.scaleBand()
    .domain(datesArr.map(function (d) {
      return d
    }))
    .range([0, 500])
  let xAxis = d3.axisBottom(xScale)

  // Instantiate the SVG for the line graph.
  let lineGraphInstance = d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh");

  // Add the X axis to the svg. Only add a label every 9 days. Rotate labels to fit axis.
  lineGraphInstance.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + 520 + ")")
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
}

export {
  populateLineGraph
}
