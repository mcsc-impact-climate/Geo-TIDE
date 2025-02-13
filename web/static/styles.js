import { selectedGradientAttributes, geojsonColors, selectedGradientTypes, predefinedColors, dataInfo } from './name_maps.js';
import { attributeBounds } from './map.js'

let colorIndex = 0; // Tracks which color to assign next
const layerColors = {}; // To store assigned colors for each layer

// Function to assign colors to layers
function assignColorToLayer(layerName) {
  if (!(layerName in layerColors)) {
    // If all predefined colors are used, generate a new color dynamically
    if (colorIndex >= predefinedColors.length) {
      const newColor = generateDistinctColor(); // Use a custom function or fallback to generate a color
      predefinedColors.push(newColor); // Add the newly generated color to predefined colors
    }
    layerColors[layerName] = predefinedColors[colorIndex];
    colorIndex++;
  }
  return layerColors[layerName];
}

// Function to generate distinct color dynamically (optional)
function generateDistinctColor() {
  const hue = Math.random() * 360;
  return `hsl(${hue}, 100%, 50%)`;
}

function createStyleFunction(layerName, boundaryColor='gray', boundaryWidth=1, isHover = false) {
  console.log("In createStyleFunction for layer", layerName)
  return function(feature) {
    const attributeKey = layerName;
    const useGradient = layerName in selectedGradientAttributes;
    let attributeName = '';
    let gradientType = '';
    let attributeValue = '';
    if (useGradient) {
      attributeName = selectedGradientAttributes[layerName];
      gradientType = selectedGradientTypes[layerName];
      attributeValue = feature.get(attributeName);
    }
    const bounds = attributeBounds[layerName]; // Get the bounds for this specific geojson
    
    // If the layer is pre-defined, set it to its defined color, or default to yellow
    let layerColor = '';
    if (layerName in geojsonColors) {
      layerColor = geojsonColors[layerName] || 'yellow'; // Fetch color from dictionary, or default
    } else {
      // Otherwise, set the color dynamically
      layerColor = assignColorToLayer(layerName);
    }

    const geometryType = feature.getGeometry().getType();
    
    // ---- 1) POINTS ----
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      if (useGradient && bounds) {
        if (gradientType === 'size') {
          const minSize = 2; // Minimum point size
          const maxSize = 10; // Maximum point size
          const pointSize = minSize + ((maxSize - minSize) *
            (attributeValue - bounds.min) / (bounds.max - bounds.min));
          return new ol.style.Style({
            image: new ol.style.Circle({
              radius: pointSize,
              fill: new ol.style.Fill({
                color: layerColor,
              }),
            }),
            zIndex: 10,
          });
        } else if (gradientType === 'color') {
          const component = Math.floor(255 *
            (attributeValue - bounds.min) / (bounds.max - bounds.min));
          const pointColor = `rgb(${component}, 0, ${255 - component})`;

          return new ol.style.Style({
            image: new ol.style.Circle({
              radius: 3,
              fill: new ol.style.Fill({
                color: pointColor,
              }),
            }),
            zIndex: 10,
          });
        }
      }
      // Default point style if no gradient or bounds are available
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 3,
          fill: new ol.style.Fill({
            color: layerColor,
          }),
        }),
        zIndex: 10,
      });
    }

    // ---- 2) POLYGONS ----
    else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      // Check if this is a "_Hubs" layer so that we can do alpha=0.5
      const isHubs = layerName.includes('_Hubs');

      if (useGradient && bounds) {
        // We'll apply a simple red/white gradient to the polygon, but for Hubs,
        // also add alpha=0.5 to the fill color
        const component = Math.floor(
          255 - (255 * (attributeValue - bounds.min) / (bounds.max - bounds.min))
        );
        // "rgb(255, component, component)" => default
        // But for Hubs, do "rgba(255, component, component, 0.5)"
        let fillColor = isHubs
          ? `rgba(255, ${component}, ${component}, 0.5)`
          : `rgb(255, ${component}, ${component})`;

        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: boundaryColor,
            width: boundaryWidth,
          }),
          fill: new ol.style.Fill({
            color: fillColor,
          }),
          zIndex: 1
        });
      } else {
        // No gradient → just a solid color. For Hubs, add alpha=0.5
        let fillColor = isHubs
          ? convertRgbToRgba(layerColor, 0.5)
          : layerColor;

        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: boundaryColor,
            width: boundaryWidth,
          }),
          fill: new ol.style.Fill({
            color: fillColor,
          }),
          zIndex: 1
        });
      }
    }

    // ---- 3) LINESTRINGS ----
    else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      if (useGradient && bounds) {
        // Vary stroke width between 1 and 10
        const normalizedWidth = 1 + 9 * ((attributeValue - bounds.min) / (bounds.max - bounds.min));
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerColor,
            width: normalizedWidth,
          }),
          zIndex: 5
        });
      } else {
        return new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: layerColor,
            width: 3,
          }),
          zIndex: 5
        });
      }
    }

    // If attributeValue is null or undefined, skip styling
    if (attributeValue === null || attributeValue === undefined) {
      return null;
    }

    // For any other geometry type, use no special styling
    return null;
  };
}

/**
 * Helper that, given a color like "rgb(255, 0, 0)" or "#ff0000",
 * returns an "rgba(r, g, b, alpha)" string for partial transparency.
 */
function convertRgbToRgba(rgbStr, alpha) {
  // If user gave something like "#RRGGBB"
  if (rgbStr.startsWith('#') && rgbStr.length === 7) {
    const r = parseInt(rgbStr.slice(1, 3), 16);
    const g = parseInt(rgbStr.slice(3, 5), 16);
    const b = parseInt(rgbStr.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // If it's "rgb(r,g,b)" we can do a quick parse
  if (rgbStr.startsWith('rgb(')) {
    // e.g. rgb(255, 100, 50)
    const nums = rgbStr.match(/\d+/g);
    const [r, g, b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Otherwise just return something default
  return `rgba(255, 255, 255, ${alpha})`;
}

function isPolygonLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;

  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'Polygon' || geometryType === 'MultiPolygon';
}

function isPointLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;

  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'Point' || geometryType === 'MultiPoint';
}

function isLineStringLayer(layer) {
  const source = layer.getSource();
  let features = source.getFeatures();
  if (features.length === 0) return false;

  const geometryType = features[0].getGeometry().getType();
  return geometryType === 'LineString' || geometryType === 'MultiLineString';
}

export {
  createStyleFunction,
  isPolygonLayer,
  isPointLayer,
  isLineStringLayer,
  assignColorToLayer
};
