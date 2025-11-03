import { createStyleFunction } from './styles.js';
import { selectedGradientAttributes } from './name_maps.js';

export const layerCache = {};
export let attributeBounds = {};

export function compareLayers(a, b) {
  const layer1 = layerCache[a];
  const layer2 = layerCache[b];

  if (isPolygonLayer(layer1) && !isPolygonLayer(layer2)) {
    return -1;
  } else if (!isPolygonLayer(layer1) && isPolygonLayer(layer2)) {
    return 1;
  } else if (isLineStringLayer(layer1) && !isLineStringLayer(layer2)) {
    return -1;
  } else if (!isLineStringLayer(layer1) && isLineStringLayer(layer2)) {
    return 1;
  } else if (isPointLayer(layer1) && !isPointLayer(layer2)) {
    return -1;
  } else if (!isPointLayer(layer1) && isPointLayer(layer2)) {
    return 1;
  } else {
    return 0;
  }
}

function isPolygonLayer(layer) {
  if (!layer || !layer.getSource) return false;
  const features = layer.getSource().getFeatures();
  return features.length > 0 && features[0].getGeometry().getType() === 'Polygon' || features[0].getGeometry().getType() === 'MultiPolygon';
}

function isLineStringLayer(layer) {
  if (!layer || !layer.getSource) return false;
  const features = layer.getSource().getFeatures();
  return features.length > 0 && (features[0].getGeometry().getType() === 'LineString' || features[0].getGeometry().getType() === 'MultiLineString');
}

function isPointLayer(layer) {
  if (!layer || !layer.getSource) return false;
  const features = layer.getSource().getFeatures();
  return features.length > 0 && (features[0].getGeometry().getType() === 'Point' || features[0].getGeometry().getType() === 'MultiPoint');
}

export async function loadLayer(layerName, layerUrl = null, showApplySpinner = true, STORAGE_URL, layerMap) {
  let url = layerUrl && layerUrl.startsWith('https://') 
    ? layerUrl 
    : `${STORAGE_URL}${layerMap.get(layerName)}`;

  if (layerName.startsWith('https://')) {
    url = layerName;
  }

  const spinnerOverlay = document.getElementById('map-loading-spinner');

  if (showApplySpinner && spinnerOverlay) {
    spinnerOverlay.style.display = 'flex';
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const geojsonData = await response.json();
    const features = new ol.format.GeoJSON().readFeatures(geojsonData, {
      dataProjection: 'EPSG:3857',
      featureProjection: 'EPSG:3857',
    });

    const attributeKey = layerName;
    let attributeName = '';
    if (layerName in selectedGradientAttributes) {
      attributeName = selectedGradientAttributes[attributeKey];
      const minVal = Math.min(...features.map((f) => f.get(attributeName) || Infinity));
      const maxVal = Math.max(...features.map((f) => f.get(attributeName) || -Infinity));
      attributeBounds[layerName] = { min: minVal, max: maxVal };
    }

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features,
      }),
      style: createStyleFunction(layerName),
      key: layerName,
    });

    layerCache[layerName] = vectorLayer;
    return vectorLayer;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  } finally {
    if (showApplySpinner && spinnerOverlay) {
      spinnerOverlay.style.display = 'none';
    }
  }
}

export function removeLayer(layerName, vectorLayers, map) {
  const layerIndex = vectorLayers.findIndex((layer) => layer.get('key') === layerName);

  if (layerIndex !== -1) {
    const layer = vectorLayers[layerIndex];
    map.removeLayer(layer);
    vectorLayers.splice(layerIndex, 1);
    delete layerCache[layerName];
  }
}

export async function updateLayer(layerName, attributeName) {
  if (!layerCache[layerName]) {
    throw new Error(`Layer ${layerName} not found in cache`);
  }

  const vectorLayer = layerCache[layerName];
  vectorLayer.setStyle(createStyleFunction(layerName, attributeName));

  if (layerName in selectedGradientAttributes) {
    const minVal = Math.min(
      ...vectorLayer
        .getSource()
        .getFeatures()
        .map((f) => f.get(attributeName) || Infinity)
    );
    const maxVal = Math.max(
      ...vectorLayer
        .getSource()
        .getFeatures()
        .map((f) => f.get(attributeName) || -Infinity)
    );
    attributeBounds[layerName] = { min: minVal, max: maxVal };
  }
}

export function setLayerVisibility(layerName, isVisible, vectorLayers) {
  const layer = vectorLayers.find((layer) => layer.get('key').split('.')[0] === layerName);
  if (layer) {
    layer.setVisible(isVisible);
  }
}

export function getAttributesForLayer(layerName) {
  if (!layerCache[layerName]) {
    console.error(`Layer ${layerName} not found in cache.`);
    return [];
  }

  const layer = layerCache[layerName];
  const features = layer.getSource().getFeatures();
  if (!features || features.length === 0) {
    console.warn(`No features found in layer ${layerName}.`);
    return [];
  }

  const firstFeature = features[0];
  const properties = firstFeature.getProperties();
  delete properties.geometry;
  
  return Object.keys(properties);
}