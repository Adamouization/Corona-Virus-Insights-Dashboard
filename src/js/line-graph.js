import {getCasesOnDay} from "./utils.js"

const populateDailyEvolutionLineGraph = async (lineGraphDom, cases, recovered, deaths, dates) => {
  let margin = 50
  let colourScheme = ["#FF9F1C", "#011627", "#E71D36"]
  let legendLabels = ["Confirmed cases", "Recoveries", "Deaths"]

  // Reverse dates to have them in chronological order.
  dates.reverse()

  // Calculate the number of new confirmed cases on a daily basis.
  let totalCasesPerDay = []
  let totalRecoveriesPerDay = []
  let totalDeathsPerDay = []
  dates.forEach(function (d) {
    totalCasesPerDay.push(getCasesOnDay(cases, d))
    totalRecoveriesPerDay.push(getCasesOnDay(recovered, d))
    totalDeathsPerDay.push(getCasesOnDay(deaths, d))
  })
  let dailyEvolutionCases = []
  let dailyEvolutionRecoveries = []
  let dailyEvolutionDeaths = []
  for (let i = 0; i < totalCasesPerDay.length - 1; i++) {
    dailyEvolutionCases.push(Math.abs(totalCasesPerDay[i] - totalCasesPerDay[i + 1]))
    dailyEvolutionRecoveries.push(Math.abs(totalRecoveriesPerDay[i] - totalRecoveriesPerDay[i + 1]))
    dailyEvolutionDeaths.push(Math.abs(totalDeathsPerDay[i] - totalDeathsPerDay[i + 1]))
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
  let dailyCasesExtent = d3.extent(dailyEvolutionCases)
  let yScale = d3.scaleLinear()
    .domain(dailyCasesExtent)
    .range([520, 0])
  let yAxis = d3.axisLeft(yScale)

  // Prepare the line graph data for confirmed cases.
  const lineCases = d3.line()
    .x(function (d, i) {
      return xScale(datesArr[i])
    })
    .y(function (d, i) {
      return yScale(dailyEvolutionCases[i])
    })

  // Prepare the line graph data for recoveries.
  const lineRecoveries = d3.line()
    .x(function (d, i) {
      return xScale(datesArr[i])
    })
    .y(function (d, i) {
      return yScale(dailyEvolutionRecoveries[i])
    })

  // Prepare the line graph data for recoveries.
  const lineDeaths = d3.line()
    .x(function (d, i) {
      return xScale(datesArr[i])
    })
    .y(function (d, i) {
      return yScale(dailyEvolutionDeaths[i])
    })

  // Instantiate the SVG for the line graph.
  let lineGraphInstance = d3.select(lineGraphDom)
    .append("svg")
    .attr("width", "100vh")
    .attr("height", "100vh")

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

  // Add the confirmed cases line to the svg.
  lineGraphInstance.append("path")
    .datum(datesArr)
    .attr("class", "line")
    .attr("d", lineCases)
    .attr("transform", "translate(" + margin + ",0)")  // translate by the same amount as the Y axis.
    .style("stroke", colourScheme[0])

  // Add the confirmed cases line to the svg.
  lineGraphInstance.append("path")
    .datum(datesArr)
    .attr("class", "line")
    .attr("d", lineRecoveries)
    .attr("transform", "translate(" + margin + ",0)")  // translate by the same amount as the Y axis.
    .style("stroke", colourScheme[1])

  // Add the confirmed cases line to the svg.
  lineGraphInstance.append("path")
    .datum(datesArr)
    .attr("class", "line")
    .attr("d", lineDeaths)
    .attr("transform", "translate(" + margin + ",0)")  // translate by the same amount as the Y axis.
    .style("stroke", colourScheme[2])

  // Add a legend.
  let legend = lineGraphInstance.append("g").attr("transform", "translate(100, -180)")
  for (let i = 0; i < 3; i++) {
    let legendRow = legend.append("g").attr("transform", "translate(0, " + (200 + (i * 20)) + ")");
    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colourScheme[i])
      .attr("stroke", "black")
    legendRow.append("text")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .attr("transform", "translate(25, 0)")
      .text(legendLabels[i]);
  }

}

export {
  populateDailyEvolutionLineGraph
}
