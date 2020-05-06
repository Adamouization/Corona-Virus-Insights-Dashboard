'use strict'
/*
Adapted from :
https://github.com/OpenGov/Leaflet.bubble
converted to es6 and adapted for our use case
 */

/**
 * An extended class to add bubbles on a leaflet map.
 */
L.BubbleLayer = (L.Layer ? L.Layer : L.Class).extend({
  // options: {
  //  property: REQUIRED

  //  legend : true,
  //  max_radius: 40,
  //  scale: <chroma-js color scale>,
  //  style: { radius: 10, fillColor: "#74acb8", color: "#555", weight: 1, opacity: 0.8, fillOpacity: 0.5 }
  //  tooltip: false,
  // },

  /**
   * Initialises the bubble layer with the options.
   * @param geojson the geojson object
   * @param options an object of options
   */
  initialize(geojson, options) {

    console.log('initalized: ', options, geojson)

    this._geojson = geojson

    options.max_radius = options.hasOwnProperty('max_radius') ? options.max_radius : 35
    options.legend = options.hasOwnProperty('legend') ? options.legend : true
    options.tooltip = options.hasOwnProperty('tooltip') ? options.tooltip : true
    options.scale = options.hasOwnProperty('scale') ? options.scale : false
    options.style = options.hasOwnProperty('style') ? options.style : {
      radius: 10,
      fillColor: '#74acb8',
      color: '#555',
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.5
    }

    options.onBubbleClick = options.hasOwnProperty('onBubbleClick') ? options.onBubbleClick : _ => {}

    L.setOptions(this, options)

    //TODO: throw error if invalid.
    if (!this._hasRequiredProp(this.options.property)) {
      throw 'Error: you must provide an amount property that is include in every GeoJSON feature'
    }
  },

  /**
   * A function that is executed when the bubble layer is added to the map.
   * @param map the map object
   * @returns {addTo} the augmented map
   */
  addTo(map) {
    map.addLayer(this)
    return this
  },

  /**
   * A trigger that is fired when the bubble map is added
   * @param map
   */
  onAdd(map) {

    this._map = map

    // createLayer does the work of visualizing geoJSON as bubbles
    const geoJsonLayer = this.createLayer()
    this._layer = geoJsonLayer
    map.addLayer(geoJsonLayer)

    if (this.options.tooltip) {
      this.showTooltip(geoJsonLayer)
    }

    if (this.options.legend) {
      this.showLegend(this._scale, this._max)
    }

  },

  /**
   * A function that creates a new layer
   * @param geojson the geojson object
   * @returns {*} the layer
   */
  createLayer(geojson) {

    const max = this._getMax(this._geojson)

    // Caluclate the minimum and maximum radius from the max area
    // TODO: how to handle zero and negative values
    const min_area = Math.PI * 3 * 3
    const max_area = Math.PI * this.options.max_radius * this.options.max_radius

    // Scale by the maxium value in the dataset
    const scale = d3.scaleLinear()
      .domain([0, max])
      .range([min_area, max_area])

    const normal = d3.scaleLinear()
      .domain([0, max])
      .range([0, 1])

    // Store for reference
    this._scale = scale
    this._normal = normal
    this._max = max

    // Use the selected property
    const property = this.options.property
    const style = this.options.style
    let fill_scale = false

    if (this.options.scale) {
      fill_scale = chroma.scale(this.options.scale)
    }
    const onclick = this.options.onBubbleClick
    return new L.geoJson(this._geojson, {

      onEachFeature: function (feature, layer) {
        layer.myTag =
          'bubblelayer'
      },

      pointToLayer: function (feature, latlng) {

        // TODO Check if total is a valid amount
        const total = feature.properties[property]

        // Calculate the area of the bubble based on the property total and the resulting radius
        const area = scale(total)
        style.radius = Math.sqrt(area / Math.PI)

        // If the option include a scale, use it
        if (fill_scale) {
          style.fillColor = fill_scale(normal(total))
        }
        style.color = chroma(style.fillColor).darken().hex()

        // Create the circleMarker object
        return L.circleMarker(latlng, style).on('click', onclick)
      }
    })
  },

  /**
   * A function that is executed when the layer is removed
   * @param map the map to remove the layer from
   */
  onRemove(map) {
    this._map = map
    // Handle the native remove from map function
    map.removeLayer(this._layer)

  },

  /**
   * A function to show the legend and the scales of the bubbles
   * @param scale the scale
   * @param max the maximum
   */
  showLegend (scale, max) {

    const legend = L.control({ position: 'bottomright' })
    const max_radius = this.options.max_radius
    let fill = this.options.style.fillColor
    let fill_scale = false
    const opacity = this.options.style.opacity

    const normal = d3.scaleLinear()
      .domain([0, max])
      .range([0, 1])

    if (this.options.scale) {
      fill_scale = chroma.scale(this.options.scale)
    }
    const self = this
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend')
      div.innerHTML += '<strong>' + self.options.property + '</strong><br/>'
      div.style = 'background-color: #FFF; padding: 8px; font-size: 14px; text-transform: capitalize'

      for (let i = 3; i > 0; i--) {

        const area = scale(max / i / 2)
        const radius = Math.sqrt(area / Math.PI)
        const item = L.DomUtil.create('div', 'bubble')

        // If theres a color scale, use it
        if (fill_scale) {
          fill = fill_scale(normal(max / i))
        }

        item.innerHTML = `<svg height="${max_radius * 2}" width="${max_radius * 2 - (max_radius / 2)}"><circle cx="${radius + 1}" cy="${max_radius}" r="${radius}" stroke="${chroma(fill).darken().hex()}" stroke-width="1" opacity="${opacity}" fill="${fill}" /><text font-size="11" text-anchor="middle" x="${radius}" y="${max_radius * 2}" fill="#AAA">${Number(max / i).toFixed(2)}</text></svg>`

        item.style = 'float:left; width: ' + radius + ';'
        div.appendChild(item)
      }
      return div
    }

    // Add this one (only) for now, as the Population layer is on by default
    legend.addTo(this._map)
  },

  /**
   * A function that shows the tooltip for the bubble marker
   * @param layer the bubble layer
   */
  showTooltip (layer) {
    layer.on('mouseover', (e) => {
      const props = e.layer.feature.properties
      const tip = Object.keys(props).filter(key => props.hasOwnProperty(key)).map(key => `<strong>${key}</strong>: ${props[key]}</br>`).reduce((string, current) => string + current, '')
      e.layer.bindPopup(tip)
      e.layer.openPopup()
    })

    layer.on('mouseout', (e) => { e.layer.closePopup() })
  },

  _getMax(geoJson) {
    const features = geoJson.features
    const property = this.options.property
    return Math.max(...features.map(item => item.properties[property]))
  },

  _hasRequiredProp (prop) {
    return this._geojson.features
      .filter(feature => feature.properties.hasOwnProperty(prop) !== true).length === 0
  }

})

const bubbleLayer = (latlngs, options) => new L.BubbleLayer(latlngs, options)

export {
  bubbleLayer
}
