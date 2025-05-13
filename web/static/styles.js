import {
  selectedGradientAttributes,
  geojsonColors,
  selectedGradientTypes,
  predefinedColors,
  dataInfo,
} from './name_maps.js';
import { attributeBounds } from './map.js';

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

function createStyleFunction(layerName, boundaryColor = 'gray', boundaryWidth = 1) {
  return function (feature) {
    return getBaseStyle(layerName, feature, boundaryColor, boundaryWidth, false);
  };
}

function createHoverStyle(layerName, feature, boundaryColor = 'white', boundaryWidth = 3) {
  const geometryType = feature.getGeometry().getType();

  // Special case for State-Level Incentives and Regulations
  if (layerName === 'State-Level Incentives and Regulations') {
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: boundaryColor,
          width: boundaryWidth,
        }),
        fill: new ol.style.Fill({
          color: 'yellow', // Light yellow fill on hover
        }),
        zIndex: 1,
      });
    }
  }

  // Fallback to normal styling
  return createStyleFunction(layerName, boundaryColor, boundaryWidth, true)(feature);
}

function getBaseStyle(layerName, feature, boundaryColor, boundaryWidth, isHover) {
  const useGradient = layerName in selectedGradientAttributes;
  let attributeName = '';
  let gradientType = '';
  let attributeValue = null;

  if (useGradient) {
    attributeName = selectedGradientAttributes[layerName];
    gradientType = selectedGradientTypes[layerName];
    attributeValue = feature.get(attributeName);
  }

  const bounds = attributeBounds[layerName];
  const geometryType = feature.getGeometry().getType();

  let layerColor =
    layerName in geojsonColors
      ? geojsonColors[layerName] || 'yellow'
      : assignColorToLayer(layerName);

  const isHubs =
    typeof layerName === 'string' &&
    layerName.startsWith('ZEF Corridor Strategy Phase') &&
    layerName.includes('Hubs');

  if (geometryType === 'Point' || geometryType === 'MultiPoint') {
    if (useGradient && bounds) {
      if (gradientType === 'size') {
        let minSize = layerName in geojsonColors ? 2 : 4;
        let maxSize = layerName in geojsonColors ? 10 : 15;
        const pointSize =
          minSize + ((maxSize - minSize) * (attributeValue - bounds.min)) / (bounds.max - bounds.min);
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: pointSize,
            fill: new ol.style.Fill({ color: layerColor }),
          }),
          zIndex: 10,
        });
      } else if (gradientType === 'color') {
        const component = Math.floor(
          (255 * (attributeValue - bounds.min)) / (bounds.max - bounds.min)
        );
        const pointColor = `rgb(0, ${component}, 255)`;
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Fill({ color: pointColor }),
          }),
          zIndex: 10,
        });
      }
    } else if (!(layerName in geojsonColors)) {
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

  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    let fillColor = layerColor;
    if (useGradient && bounds) {
      const component = Math.floor(
        255 - (255 * (attributeValue - bounds.min)) / (bounds.max - bounds.min)
      );
      fillColor = isHubs
        ? `rgba(${component}, ${component}, 255, 0.5)`
        : `rgb(${component}, ${component}, 255)`;
    } else if (isHubs) {
      fillColor = convertRgbToRgba(layerColor, 0.5);
    }

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: isHover ? boundaryColor : 'gray',
        width: isHover ? boundaryWidth : 1,
      }),
      fill: new ol.style.Fill({ color: fillColor }),
      zIndex: 1,
    });
  }

  if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
    let width = 3;
    if (useGradient && bounds) {
      width = 1 + 9 * ((attributeValue - bounds.min) / (bounds.max - bounds.min));
    }
    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: layerColor,
        width: width,
      }),
      zIndex: 5,
    });
  }

  return null;
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

export { createStyleFunction, createHoverStyle, isPolygonLayer, isPointLayer, isLineStringLayer, assignColorToLayer };
