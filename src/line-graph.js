const getCasesOnDay = (cases, dateStr) => cases.map(country => Number(country['4/9/20'])).reduce((prev, next) => prev + next)

const populateLineGraph = async (cases) => {

}

export {
    populateLineGraph
}