/**
 * A map op
 * @returns {{fillColor: string, color: string, fillOpacity: number, weight: number, radius: number, opacity: number}}
 */
const mapBubbleStyle = () => ({
  radius: 10,
  fillColor: "#deab19",
  color: "#555",
  weight: 1,
  opacity: 0.8,
  fillOpacity: 0.5
})

/**
 * JS object for the colour scheme.
 * @type {{secondary: string, success: string, warning: string, danger: string, primary: string, info: string}}
 */
const colourScheme = {
  primary: "#4e73df",
  success: "#1cc88a",
  info: "#36b9cc",
  warning: "#f6c23e",
  danger: "#e74a3b",
  secondary: "#858796",
}

const margin = {
  lineChart: 70,
  lollipopChart: 70,
}

export {
  mapBubbleStyle,
  colourScheme,
  margin
}
