const getCasesOnDay = (cases, dateStr) => cases.map(country => Number(country[dateStr])).reduce((prev, next) => prev + next)

const populateLineGraph = async (lineGraphDom, cases, dates) => {
  let dateExtent = d3.extent(dates.reverse())

  let newDates = d3.timeDay.range(new Date(dateExtent[0]), new Date(dateExtent[1]));
  console.log(newDates)

  let xScale = d3.scaleBand()
    .domain(newDates.map(function (d) {
      return d
    }))
    .range([0, 500])
  let xAxis = d3.axisBottom(xScale)
  console.log(xScale)

  let lineGraphInstance = d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh");

  lineGraphInstance.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + 520 + ")")
    .call(xAxis.tickFormat(d3.timeFormat("%m/%d/%y"))
      .tickValues(xScale.domain()
        .filter(function( d, i ) {
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
