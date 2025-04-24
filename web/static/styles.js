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

function createStyleFunction(layerName, boundaryColor = 'gray', boundaryWidth = 1, isHover = false) {
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
    
    const bounds = attributeBounds[layerName];

    // Assign layer color dynamically or from predefined settings
    let layerColor = layerName in geojsonColors ? geojsonColors[layerName] || 'yellow' : assignColorToLayer(layerName);

    const geometryType = feature.getGeometry().getType();

    // ---- 1) POINTS ----
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      if (useGradient && bounds) {
        if (gradientType === 'size') {
          // This is a little bit hacky - I want to make the point sizes bigger for user-uploaded data, so I'm flagging a layer as user-uploaded if it doesn't have a defined color.
          let minSize, maxSize;
          if(layerName in geojsonColors) {
              minSize = 2;
              maxSize = 10;
          }
          else {
              minSize = 4;
              maxSize = 15;
          }
          const pointSize = minSize + ((maxSize - minSize) * (attributeValue - bounds.min) / (bounds.max - bounds.min));
          return new ol.style.Style({
            image: new ol.style.Circle({
              radius: pointSize,
              fill: new ol.style.Fill({ color: layerColor }),
            }),
            zIndex: 10,
          });
        } else if (gradientType === 'color') {
          const component = Math.floor(255 * (attributeValue - bounds.min) / (bounds.max - bounds.min));
          const pointColor = `rgb(0, ${component}, 255)`; // Light blue to dark blue gradient
          return new ol.style.Style({
            image: new ol.style.Circle({
              radius: 3,
              fill: new ol.style.Fill({ color: pointColor }),
            }),
            zIndex: 10,
          });
        }
      }
      // This is a little bit hacky - I want to make the point sizes bigger for user-uploaded data, so I'm flagging a layer as user-uploaded if it doesn't have a defined color.
      else if(!(layerName in geojsonColors)) {
          return new ol.style.Style({
            image: new ol.style.Circle({
              radius: 8,
              fill: new ol.style.Fill({ color: layerColor }),
            }),
            zIndex: 10,
          });
      }
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 3,
          fill: new ol.style.Fill({ color: layerColor }),
        }),
        zIndex: 10,
      });
    }

    // ---- 2) POLYGONS ----
    else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      const isHubs = typeof layerName === "string" && layerName.startsWith("ZEF Corridor Strategy Phase") && layerName.includes("Hubs");

      if (useGradient && bounds) {
        const component = Math.floor(255 - (255 * (attributeValue - bounds.min) / (bounds.max - bounds.min)));
        let fillColor = isHubs ? `rgba(${component}, ${component}, 255, 0.5)` : `rgb(${component}, ${component}, 255)`; // White to blue gradient

        return new ol.style.Style({
          stroke: new ol.style.Stroke({ color: boundaryColor, width: boundaryWidth }),
          fill: new ol.style.Fill({ color: fillColor }),
          zIndex: 1
        });
      } else {
        let fillColor = isHubs ? convertRgbToRgba(layerColor, 0.5) : layerColor;

        return new ol.style.Style({
          stroke: new ol.style.Stroke({ color: boundaryColor, width: boundaryWidth }),
          fill: new ol.style.Fill({ color: fillColor }),
          zIndex: 1
        });
      }
    }

    // ---- 3) LINESTRINGS ----
    else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      if (useGradient && bounds) {
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

    if (attributeValue === null || attributeValue === undefined) return null;
    return null;
  };
  console.log(`Layer: ${layerName}, Use Gradient: ${useGradient}, Attribute: ${attributeName}, Bounds:`, bounds);
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
