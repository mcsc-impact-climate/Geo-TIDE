import {
  createStyleFunction,
  createHoverStyle,
  isPolygonLayer,
  isPointLayer,
  isLineStringLayer,
  assignColorToLayer,
} from './styles.js';
import {
  getSelectedLayers,
  getSelectedLayersValues,
  showStateRegulations,
  getAreaLayerName,
  createZefFilenames,
  showHourlyGridEmissions,
} from './ui.js';
import {
  legendLabels,
  selectedGradientAttributes,
  geojsonColors,
  selectedGradientTypes,
  dataInfo,
  zefOptions,
  selectedZefOptions,
  selectedZefSubLayers,
} from './name_maps.js';

var vectorLayers = [];
var map;
var attributeBounds = {}; // Object to store min and max attribute values for each geojson

// Declare the data variable in a higher scope
let data;

function initMap() {
  map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
      ...vectorLayers.filter((layer) => isPolygonLayer(layer)), // Add polygon layers first
      ...vectorLayers.filter((layer) => isLineStringLayer(layer)), // Add LineString layers next
      ...vectorLayers.filter((layer) => isPointLayer(layer)), // Add point layers last
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-98, 39]), // Centered on the US
      zoom: 4.5,
    }),
  });

  // Set the visibility of all vector layers to false initially
  vectorLayers.forEach((layer) => {
    layer.setVisible(false);
  });
  map.on('pointermove', handleMapHover);
  map.on('singleclick', handleMapClick);
  let lastFeature = null;
}

// Attach the updateSelectedLayers function to the button click event
async function attachEventListeners() {
  // Automatically update when any checkbox changes
  document.querySelectorAll('#layer-selection input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      try {
        await updateSelectedLayers();
        updateLegend();
      } catch (error) {
        console.error('Auto-update on checkbox change failed:', error);
      }
    });
  });

  // Automatically update when area layer dropdown changes
  const areaDropdown = document.getElementById('area-layer-dropdown');
  if (areaDropdown) {
    areaDropdown.addEventListener('change', async () => {
      try {
        await updateSelectedLayers();
        updateLegend();
      } catch (error) {
        console.error('Auto-update on area layer change failed:', error);
      }
    });
  }

  const uploadedLayerDropdown = $('#usefiles-data-ajax');
  //console.log(uploadedLayerDropdown); // This should not be null or undefined
  if (uploadedLayerDropdown.length > 0) {
    uploadedLayerDropdown.on('select2:opening', function (e) {
      if (window.lastClickWasMoreButton) {
        e.preventDefault(); // Block dropdown from opening
        window.lastClickWasMoreButton = false; // Reset the flag
      }
    });

    // Use select2's specific events for handling changes
    uploadedLayerDropdown.on('select2:select', async (e) => {
      console.log('Uploaded layer dropdown change detected via select2');
      uploadedGeojsonNames[e.params.data.id] = e.params.data.text;

      try {
        // Load the uploaded layers
        await updateSelectedLayers();
        updateLegend();
      } catch (error) {
        console.error('Error loading uploaded layers:', error);
      }
    });

    uploadedLayerDropdown.on('select2:unselect', async (e) => {
      console.log('Uploaded layer dropdown change detected via select2');
      delete uploadedGeojsonNames[e.params.data.id];
      await updateSelectedLayers(); // Call function to update layers based on uploaded files
      updateLegend(); // Update the legend to include uploaded layers
    });
  } else {
    console.error('usefiles-data-ajax not found in the DOM');
  }
}

let lastFeature = null;
function handleMapHover(event) {
  let featureFound = false;

  map.forEachFeatureAtPixel(event.pixel, function (feature) {
    featureFound = true;

    const selectedLayer = getAreaLayerName(document.getElementById('area-layer-dropdown').value);
    const layerName = feature.get('layerName') || selectedLayer;

    if (layerName === 'State-Level Incentives and Regulations') {
      if (lastFeature && lastFeature !== feature) {
        lastFeature.setStyle(null); // Clear previous hover
      }

      feature.setStyle(createHoverStyle(layerName, feature));
      lastFeature = feature;
    }
  });

  if (!featureFound && lastFeature) {
    lastFeature.setStyle(null); // Reset to default layer style
    lastFeature = null;
  }
}

// Function to handle click events
function handleMapClick(event) {
  map.forEachFeatureAtPixel(event.pixel, function (feature) {
    const layerName = getAreaLayerName(document.getElementById('area-layer-dropdown').value); //feature.get('layerName'); //not sure if this is correct
    if (layerName == 'State-Level Incentives and Regulations') {
      if (feature) {
        const properties = feature.getProperties();
        const stateAbbreviation = properties.STUSPS || properties.state || properties.STATE;
        //console.log(layerName);
        if (stateAbbreviation) {
          showStateRegulations(stateAbbreviation, properties, layerName);
        } else {
          console.log('State abbreviation not found in feature properties');
        }
      }
    }
    else if (layerName == 'Hourly Grid Emissions') {
      if (feature) {
        const properties = feature.getProperties();
        const zoneName = properties.zoneName;
        //console.log(zoneName);
        showHourlyGridEmissions(zoneName, properties, layerName);
      }
    }
  }
);
}

// Initialize an empty layer cache
const layerCache = {};

// Function to compare two layers based on their geometry types
function compareLayers(a, b) {
  const layer1 = layerCache[a];
  const layer2 = layerCache[b];

  if (isPolygonLayer(layer1) && !isPolygonLayer(layer2)) {
    return -1; // layer1 is a polygon layer, layer2 is not
  } else if (!isPolygonLayer(layer1) && isPolygonLayer(layer2)) {
    return 1; // layer2 is a polygon layer, layer1 is not
  } else if (isLineStringLayer(layer1) && !isLineStringLayer(layer2)) {
    return -1; // layer1 is a line layer, layer2 is not
  } else if (!isLineStringLayer(layer1) && isLineStringLayer(layer2)) {
    return 1; // layer2 is a line layer, layer1 is not
  } else if (isPointLayer(layer1) && !isPointLayer(layer2)) {
    return -1; // layer1 is a point layer, layer2 is not
  } else if (!isPointLayer(layer1) && isPointLayer(layer2)) {
    return 1; // layer2 is a point layer, layer1 is not
  } else {
    return 0; // both layers have the same geometry type
  }
}

async function loadLayer(layerName, layerUrl = null, showApplySpinner = true) {
  const layerMap = getSelectedLayersValues();
  let url =
    layerUrl && layerUrl.startsWith('https://')
      ? layerUrl
      : `${STORAGE_URL}${layerMap.get(layerName)}`;

  if (layerName.startsWith('https://')) {
    url = layerName;
  }

  const spinnerOverlay = document.getElementById('map-loading-spinner');

  if (showApplySpinner && spinnerOverlay) {
    spinnerOverlay.style.display = 'flex'; // Show full-screen spinner
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
    vectorLayers.push(vectorLayer);
  } catch (error) {
    console.error('Fetch Error:', error);
    throw error;
  } finally {
    if (showApplySpinner && spinnerOverlay) {
      spinnerOverlay.style.display = 'none'; // Hide spinner after loading
    }
  }
}

function removeLayer(layerName) {
  console.log('In removeLayer'); 
  const layerIndex = vectorLayers.findIndex((layer) => layer.get('key') === layerName);

  if (layerIndex !== -1) {
    const layer = vectorLayers[layerIndex];

    // Remove from OpenLayers map
    map.removeLayer(layer);

    // Remove from vectorLayers and cache
    vectorLayers.splice(layerIndex, 1);
    delete layerCache[layerName];
  } else {
    console.warn('Layer not found in vectorLayers:', layerName);
  }
}

// Function to update a specific layer with a new attributeName
async function updateLayer(layerName, attributeName) {
  // Check if the layerName is cached
  if (!layerCache[layerName]) {
    // If the layer is not in the cache, load it using loadLayer
    await loadLayer(layerName);
  }

  // Update the attributeName and style for the layer
  const vectorLayer = layerCache[layerName];
  vectorLayer.setStyle(createStyleFunction(layerName, attributeName)); // Pass the new attributeName

  // Update the attributeBounds for the layer if needed
  const attributeKey = layerName;
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

function setLayerVisibility(layerName, isVisible) {
  // Find the layer by its name and update its visibility
  const layer = vectorLayers.find((layer) => layer.get('key').split('.')[0] === layerName);

  if (layer) {
    layer.setVisible(isVisible);
  }
}

// Function to update the selected layers on the map
async function updateSelectedLayers() {
  let selectedLayers = getSelectedLayers(); // Get selected layers
  const loadingPromises = [];

  let zefSubLayers = [];

  if (selectedLayers.includes('National ZEF Corridor Strategy')) {
    const phase = selectedZefOptions['Phase'] || '1';

    // Respect checkbox state for ZEF sublayers
    zefSubLayers = [];

    if (selectedZefSubLayers['Hubs']) {
      zefSubLayers.push({
        name: `ZEF Corridor Strategy Phase ${phase} Hubs`,
        url: `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Hubs.geojson`,
      });
    }

    if (selectedZefSubLayers['Corridors']) {
      zefSubLayers.push({
        name: `ZEF Corridor Strategy Phase ${phase} Corridors`,
        url: `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Corridors.geojson`,
      });
    }

    if (selectedZefSubLayers['Facilities']) {
      zefSubLayers.push({
        name: `ZEF Corridor Strategy Phase ${phase} Facilities`,
        url: `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Facilities.geojson`,
      });
    }

    // Remove "National ZEF Corridor Strategy" from selectedLayers
    selectedLayers = selectedLayers.filter((layer) => layer !== 'National ZEF Corridor Strategy');

    // Add sub-layers
    selectedLayers.push(...zefSubLayers.map((layer) => layer.name));

    // Ensure sub-layers are loaded from AWS
    for (const { name, url } of zefSubLayers) {
      if (!layerCache[name]) {
        loadingPromises.push(loadLayer(name, url));
      }
    }
  }

  // Load all other selected layers, but skip the ZEF sub-layers since they're already handled
  for (const layerName of selectedLayers) {
    if (!layerCache[layerName] && !zefSubLayers.some((subLayer) => subLayer.name === layerName)) {
      const isUploadedLayer = uploadedGeojsonNames.hasOwnProperty(layerName);
      loadingPromises.push(loadLayer(layerName, null, !isUploadedLayer));
    }
  }

  try {
    await Promise.all(loadingPromises);

    // Sort selectedLayers (now including the sub-layers)
    selectedLayers.sort(compareLayers);

    // Hide any non-selected layers
    Object.keys(layerCache).forEach((layerName) => {
      setLayerVisibility(layerName, selectedLayers.includes(layerName));
    });
  } catch (error) {
    console.error('Error loading layers:', error);
  }

  // Clear the map while keeping the base layer
  const baseLayer = map.getLayers().item(0);
  map.getLayers().clear();
  if (baseLayer) {
    map.addLayer(baseLayer);
  }

  // Add sorted layers to the map
  for (const layerName of selectedLayers) {
    if (layerCache[layerName]) {
      map.addLayer(layerCache[layerName]);
    }
  }
}

function reverseMapping(originalMap) {
  return Object.fromEntries(Object.entries(originalMap).map(([key, value]) => [value, key]));
}

function createPolygonLegendEntry(layerName, bounds, layerColor) {
  const container = document.createElement('div');
  container.className = 'legend-entry-wrapper';
  container.style.display = 'flex';
  container.style.alignItems = 'center';

  const canvas = document.createElement('canvas');
  canvas.width = 50;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');

  const useGradient = layerName in selectedGradientAttributes;

  if (useGradient && bounds) {
    const minVal =
      bounds.min < 0.01
        ? bounds.min.toExponential(1)
        : bounds.min > 100
          ? bounds.min.toExponential(1)
          : bounds.min.toFixed(1);
    const maxVal =
      bounds.max < 0.01
        ? bounds.max.toExponential(1)
        : bounds.max > 100
          ? bounds.max.toExponential(1)
          : bounds.max.toFixed(1);

    const minDiv = document.createElement('div');
    minDiv.innerText = minVal.toString();
    minDiv.style.marginRight = '5px';

    const maxDiv = document.createElement('div');
    maxDiv.innerText = maxVal.toString();
    maxDiv.style.marginLeft = '5px';

    const gradient = ctx.createLinearGradient(0, 0, 50, 0);
    gradient.addColorStop(0, 'rgb(255, 255, 255)');
    gradient.addColorStop(1, 'rgb(0, 0, 255)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 50, 10);

    container.appendChild(minDiv);
    container.appendChild(canvas);
    container.appendChild(maxDiv);
  } else {
    ctx.fillStyle = layerColor;
    ctx.fillRect(0, 0, 50, 10);
    
    container.appendChild(canvas);
  }
  container.style.justifyContent = 'flex-end';

  return container;
}

function createLineLegendEntry(layerName, bounds, layerColor) {
  const container = document.createElement('div');
  container.className = 'legend-entry-wrapper';
  container.style.display = 'flex';
  container.style.alignItems = 'center';

  const useGradient = layerName in selectedGradientAttributes;
  const isUploaded = !(layerName in geojsonColors);

    if (useGradient && bounds && isUploaded) {

      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');

      // Create a gradient from white to the assigned layerColor
      const gradient = ctx.createLinearGradient(0, 0, 50, 0);
      gradient.addColorStop(0, 'rgb(255, 255, 255)');
      gradient.addColorStop(1, layerColor);  // dynamic color
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(50, 5);
      ctx.stroke();

      const minVal =
        bounds.min < 0.01
          ? bounds.min.toExponential(1)
          : bounds.min > 100
            ? bounds.min.toExponential(1)
            : bounds.min.toFixed(1);
      const maxVal =
        bounds.max < 0.01
          ? bounds.max.toExponential(1)
          : bounds.max > 100
            ? bounds.max.toExponential(1)
            : bounds.max.toFixed(1);

      const minDiv = document.createElement('div');
      minDiv.innerText = minVal.toString();
      minDiv.style.marginRight = '5px';

      const maxDiv = document.createElement('div');
      maxDiv.innerText = maxVal.toString();
      maxDiv.style.marginLeft = '5px';

      container.appendChild(minDiv);
      container.appendChild(canvas);
      container.appendChild(maxDiv);

      return container;
    } else if (useGradient && bounds) {
    // Gradient (e.g., width) on persistent or uploaded layer

    const minVal =
      bounds.min < 0.01
        ? bounds.min.toExponential(1)
        : bounds.min > 100
        ? bounds.min.toExponential(1)
        : bounds.min.toFixed(1);
    const maxVal =
      bounds.max < 0.01
        ? bounds.max.toExponential(1)
        : bounds.max > 100
        ? bounds.max.toExponential(1)
        : bounds.max.toFixed(1);

    const minDiv = document.createElement('div');
    minDiv.innerText = minVal.toString();
    minDiv.style.marginRight = '5px';

    const maxDiv = document.createElement('div');
    maxDiv.innerText = maxVal.toString();
    maxDiv.style.marginLeft = '5px';

    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 20;
    const ctx = canvas.getContext('2d');

    for (let x = 0; x <= 50; x++) {
      const lineWidth = 1 + (x / 50) * 9;
      ctx.strokeStyle = layerColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x, 10 - lineWidth / 2);
      ctx.lineTo(x, 10 + lineWidth / 2);
      ctx.stroke();
    }

    container.appendChild(minDiv);
    container.appendChild(canvas);
    container.appendChild(maxDiv);
  } else {
    // No gradient → solid line
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = layerColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(50, 5);
    ctx.stroke();

    container.appendChild(canvas);
  }

  container.style.justifyContent = 'flex-end';


  return container;
}


function createPointLegendEntry(layerName, bounds, layerColor, gradientType) {
  const container = document.createElement('div');
  container.className = 'legend-entry-wrapper';
  container.style.display = 'flex';
  container.style.alignItems = 'center';

  const useGradient = layerName in selectedGradientAttributes;

  if (useGradient && bounds) {
    const minVal =
      bounds.min < 0.01
        ? bounds.min.toExponential(1)
        : bounds.min > 100
          ? bounds.min.toExponential(1)
          : bounds.min.toFixed(1);
    const maxVal =
      bounds.max < 0.01
        ? bounds.max.toExponential(1)
        : bounds.max > 100
          ? bounds.max.toExponential(1)
          : bounds.max.toFixed(1);

    const minDiv = document.createElement('div');
    minDiv.innerText = minVal.toString();
    minDiv.style.marginRight = '5px';

    const maxDiv = document.createElement('div');
    maxDiv.innerText = maxVal.toString();
    maxDiv.style.marginLeft = '5px';

    if (gradientType === 'size') {
      const minCanvas = document.createElement('canvas');
      minCanvas.width = 20;
      minCanvas.height = 20;
      const minCtx = minCanvas.getContext('2d');
      minCtx.fillStyle = layerColor;
      minCtx.beginPath();
      minCtx.arc(10, 10, 2, 0, Math.PI * 2);
      minCtx.fill();

      const maxCanvas = document.createElement('canvas');
      maxCanvas.width = 20;
      maxCanvas.height = 20;
      const maxCtx = maxCanvas.getContext('2d');
      maxCtx.fillStyle = layerColor;
      maxCtx.beginPath();
      maxCtx.arc(10, 10, 10, 0, Math.PI * 2);
      maxCtx.fill();

      container.appendChild(minDiv);
      container.appendChild(minCanvas);
      container.appendChild(maxCanvas);
      container.appendChild(maxDiv);
    } else if (gradientType === 'color') {
      const minCanvas = document.createElement('canvas');
      minCanvas.width = 20;
      minCanvas.height = 20;
      const minCtx = minCanvas.getContext('2d');
      minCtx.fillStyle = 'lightblue';
      minCtx.beginPath();
      minCtx.arc(10, 10, 3, 0, Math.PI * 2);
      minCtx.fill();

      const maxCanvas = document.createElement('canvas');
      maxCanvas.width = 20;
      maxCanvas.height = 20;
      const maxCtx = maxCanvas.getContext('2d');
      maxCtx.fillStyle = 'blue';
      maxCtx.beginPath();
      maxCtx.arc(10, 10, 3, 0, Math.PI * 2);
      maxCtx.fill();

      container.appendChild(minDiv);
      container.appendChild(minCanvas);
      container.appendChild(maxCanvas);
      container.appendChild(maxDiv);
    }
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = layerColor;
    ctx.beginPath();
    ctx.arc(25, 5, 3, 0, Math.PI * 2);
    ctx.fill();

    container.style.width = '100%'; 
    container.style.justifyContent = 'flex-end';
    container.style.marginRight = '0rem'; 
    container.appendChild(canvas);
  }

  return container;
}


function updateLegendWidth() {
  const legend = document.getElementById('legend');
  const legendContent = document.getElementById('legend-content');
  const hasContent = legendContent.children.length > 0;
  let isLegendOpen = window.getComputedStyle(legendContent).display !== 'none';

  
  if (isLegendOpen) {
    if (hasContent) {
      legend.style.width = '31.25rem';
    } else {
      legend.style.width = '8.3125rem';
    }
  } else {
    legend.style.width = '8.3125rem';
  }
}


function createLetterIconSVG(letter) {
  const div = document.createElement('div');
  div.innerHTML = {
    A: `
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"
           viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/>
        <path d="M14 12.833 12 7.5l-2 5.333m4 0 1 2.667m-1-2.667h-4M9 15.5l1-2.667"/>
      </svg>`,
    H: `
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"
           viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"
           xmlns="http://www.w3.org/2000/svg">
        <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M9.5 8v4m0 0v4m0-4h5m0-4v4m0 0v4'/>
      </svg>`,
    P: `
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"
           viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"
           xmlns="http://www.w3.org/2000/svg">
        <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'/>
        <path d='M9.75 12V8.5a.5.5 0 0 1 .5-.5h3a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5zm0 0v4'/>
      </svg>`
  }[letter];


  const svg = div.firstElementChild;

  svg.style.width = '1.5rem';
  svg.style.height = '1.5rem';

  return svg; 
}



let previouslyRenderedLegendKeys = new Set();

function createLegendLabel(value) {
  const label = document.createElement('div');
  label.style.fontSize = '10px';
  label.style.margin = '0 5px';
  label.style.width = '30px';
  label.style.textAlign = 'center';
  label.style.color = '#555';
  if (typeof value === 'number') {
    label.textContent =
      value < 0.01 || value > 100 ? value.toExponential(1) : value.toFixed(1);
  } else {
    label.textContent = '';
  }
  return label;
}

function updateLegend() {
  const legendContent = document.getElementById('legend-content');
  if (!legendContent) return;

  while (legendContent.firstChild) {
    legendContent.removeChild(legendContent.firstChild);
  }

  const selectedLayers = getSelectedLayers();
  const areaLayers = [],
    lineLayers = [],
    pointLayers = [];
  const newRenderedLegendKeys = new Set();

  vectorLayers.forEach((layer) => {
    const name = layer.get('key');
    const visible = layer.getVisible();
    const selected =
      selectedLayers.includes(name) ||
      (selectedLayers.includes('National ZEF Corridor Strategy') &&
        name.startsWith('ZEF Corridor Strategy Phase'));

    if (visible && selected) {
      if (isPolygonLayer(layer)) areaLayers.push(layer);
      else if (isLineStringLayer(layer)) lineLayers.push(layer);
      else if (isPointLayer(layer)) pointLayers.push(layer);
    }
  });

  let isNotFirstGroup = false;

  const renderGroup = (layers, letter) => {
    if (layers.length === 0) return;

    if (isNotFirstGroup) {
      const separator = document.createElement('div');
      separator.classList.add('separator');
      legendContent.appendChild(separator); 
    }



    const groupWrapper = document.createElement('div');
    groupWrapper.className = 'legend-group';

    layers.forEach((layer, index) => {
      const layerName = layer.get('key');
      newRenderedLegendKeys.add(layerName);
      const isNew = !previouslyRenderedLegendKeys.has(layerName);

      const layerDiv = document.createElement('div');
      layerDiv.className = 'legend-entry';
      layerDiv.style.display = 'flex';
      layerDiv.style.alignItems = 'center';
      layerDiv.style.flexDirection = 'row';

      const symbolContainer = document.createElement('div');
      symbolContainer.style.display = 'flex';
            symbolContainer.style.width = '150px';
      
      symbolContainer.style.justifyContent = 'flex-end'; 

      if (index === 0) {
          const svgIcon = createLetterIconSVG(letter);
          svgIcon.style.position = 'absolute';
          svgIcon.style.left = '12px';
          layerDiv.style.marginTop = '10px'; 
          layerDiv.appendChild(svgIcon);
      }

      const layerColor =
        layerName in geojsonColors
          ? geojsonColors[layerName] || 'yellow'
          : assignColorToLayer(layerName);
      const gradientType = selectedGradientTypes[layerName];
      const bounds = attributeBounds[layerName];

      if (isPolygonLayer(layer)) {
        symbolContainer.appendChild(createPolygonLegendEntry(layerName, bounds, layerColor));
        } else if (isLineStringLayer(layer)) {
          symbolContainer.appendChild(
          createLineLegendEntry(layerName, bounds, layerColor)
          );
        } else if (isPointLayer(layer)) {
          symbolContainer.appendChild(
          createPointLegendEntry(layerName, bounds, layerColor, gradientType)
        );
      }


    const title = document.createElement('div');
    title.classList.add('legend-text'); 

    

if (layerName in legendLabels) {
  const label = legendLabels[layerName];
  title.innerText =
    typeof label === 'string' ? label : label[selectedGradientAttributes[layerName]];
} else if (layerName in uploadedGeojsonNames) {
  title.innerText = selectedGradientAttributes[layerName]
    ? `${uploadedGeojsonNames[layerName]}: ${selectedGradientAttributes[layerName]}`
    : uploadedGeojsonNames[layerName];
} else {
  title.innerText = layerName;
}  
layerDiv.appendChild(symbolContainer);
layerDiv.appendChild(title);

if (isNew) {
  layerDiv.classList.add('legend-fadeout-start');
  groupWrapper.appendChild(layerDiv);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      layerDiv.classList.add('fadeout');
    });
  });
} else {
  groupWrapper.appendChild(layerDiv);
}
});

    legendContent.appendChild(groupWrapper);
    isNotFirstGroup = true;

};

  

  renderGroup(areaLayers, 'A');
  renderGroup(lineLayers, 'H');
  renderGroup(pointLayers, 'P');

  previouslyRenderedLegendKeys = newRenderedLegendKeys;
  updateLegendWidth();
}

async function fetchCSVData(csvFileName, CSV_URL) {
  const csvUrl = `${CSV_URL}${csvFileName}`;
  console.log(`Fetching CSV from URL: ${csvUrl}`); // Debug logging
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok for ${csvUrl}`);
    }
    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error('Fetch CSV Error:', error);
    throw error;
  }
}

function isDictionary(obj) {
  // Check if it's an object
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  // Check if it has properties (key-value pairs)
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return true;
    }
  }

  return false;
}

// Add event listener to the "Clear" button
document.getElementById('clear-button').addEventListener('click', function () {

  console.log('Clear button clicked');
  console.log('new console line'); 
  event.stopPropagation(); // Prevent outside click handler from firing

  // Show confirmation modal
  document.getElementById('clear-confirmation-modal').style.display = 'flex';
});

function clearLayerSelections() {
  // Clear selected checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Clear selected options in the area layer dropdown
  const areaLayerDropdown = document.getElementById('area-layer-dropdown');
  areaLayerDropdown.selectedIndex = 0; // Assuming the first option is "Select Area Feature"

  // Clear uploaded layers from Select2
  const uploadedSelect = $('#usefiles-data-ajax');
  if (uploadedSelect.length > 0) {
    uploadedSelect.val(null).trigger('change');
  }

  // Clear uploaded layer name tracking
  for (const key in uploadedGeojsonNames) {
    delete uploadedGeojsonNames[key];
  }

  updateSelectedLayers();
  updateLegend();
}

// Confirm clear action
document.getElementById('confirm-clear').addEventListener('click', function () {
  document.getElementById('clear-confirmation-modal').style.display = 'none';

  // Remove all vector layers from map
  const mapLayers = map.getLayers().getArray();
  mapLayers.forEach((layer) => {
    if (layer instanceof ol.layer.Vector && !layer.get('baseLayer')) {
      map.removeLayer(layer);
    }
  });

  clearLayerSelections();
});

// Cancel clear
document.getElementById('cancel-clear').addEventListener('click', function () {
  document.getElementById('clear-confirmation-modal').style.display = 'none';
});

// Close modal via X
document.getElementById('clear-modal-close').addEventListener('click', function () {
  document.getElementById('clear-confirmation-modal').style.display = 'none';
});

// Close modal if clicking outside the modal content
window.addEventListener('click', function (event) {
  const modal = document.getElementById('clear-confirmation-modal');
  const content = modal.querySelector('.modal-content');

  if (modal.style.display === 'flex' && !content.contains(event.target)) {
    modal.style.display = 'none';
  }
});

function getAttributesForLayer(layerName) {
  // Check if the layer is available in the cache
  if (!layerCache[layerName]) {
    console.error(`Layer ${layerName} not found in cache.`);
    return [];
  }

  // Get the layer object from the cache
  const layer = layerCache[layerName];

  // Get all features from the layer
  const features = layer.getSource().getFeatures();
  if (!features || features.length === 0) {
    console.warn(`No features found in layer ${layerName}.`);
    return [];
  }

  // Assuming all features have the same properties, we can extract the properties from the first feature
  const firstFeature = features[0];
  const properties = firstFeature.getProperties();

  // Remove geometry-related properties if needed (since we only want non-geometry attributes)
  delete properties.geometry; // Optionally delete the geometry attribute

  // Return the attribute names (keys of the properties object)
  return Object.keys(properties);
}

async function applyLayerOptions(layerName, gradientAttribute) {
  // This is where you apply the selected gradient or attribute to the layer
  //console.log(`Applying gradient ${gradientAttribute} to layer ${layerName}`);

  // Check if the layer is available in the cache
  if (!layerCache[layerName]) {
    console.error(`Layer ${layerName} not found in cache.`);
    return [];
  }

  // Get the layer object from the cache
  const layer = layerCache[layerName];

  selectedGradientAttributes[layerName] = gradientAttribute;
  if (isPolygonLayer(layer)) selectedGradientTypes[layerName] = 'color';
  else selectedGradientTypes[layerName] = 'size';

  // Update the layer with its new gradient attribute
  updateLayer(layerName, gradientAttribute);

  // Update the map
  await updateSelectedLayers(); // Wait for updateSelectedLayers to complete
  updateLegend(); // Now, call updateLegend after updateSelectedLayers is done
}

async function toggleZefSubLayer(subName, checked) {
  const layerName = `ZEF Corridor Strategy Phase ${selectedZefOptions['Phase']} ${subName}`;
  const layerUrl = `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${selectedZefOptions['Phase']}_${subName}.geojson`;

  // **Check if National ZEF Corridor Strategy is visible on the map**
  const parentLayerVisible = Object.keys(layerCache).some(
    (layerKey) =>
      layerKey.startsWith('ZEF Corridor Strategy Phase') && layerCache[layerKey].getVisible()
  );

  if (!parentLayerVisible) {
    console.log(
      `Skipping sub-layer toggle for ${layerName} because National ZEF Corridor Strategy is not active`
    );
    return; // Exit early if no ZEF layers are visible
  }

  // Proceed as normal
  if (checked) {
    if (!layerCache[layerName]) {
      await loadLayer(layerName, layerUrl);
    }

    if (layerCache[layerName]) {
      const layer = layerCache[layerName];

      // Ensure layer is in vectorLayers
      if (!vectorLayers.includes(layer)) {
        vectorLayers.push(layer);
      }

      // Set visibility & re-add to map
      setLayerVisibility(layerName, true);
    } else {
      console.error('Layer failed to load and is missing from cache.');
    }
  } else {
    removeLayer(layerName);
    vectorLayers = vectorLayers.filter((layer) => layer.get('key') !== layerName);
  }

  // **Re-enforce correct order of all active ZEF sub-layers**
  enforceLayerOrder(
    vectorLayers
      .map((layer) => layer.get('key')) // Get layer names
      .filter((name) => name.startsWith('ZEF Corridor Strategy Phase')) // Keep only ZEF layers
  );

  updateLegend();
}

function enforceLayerOrder(layerNames) {
  // Remove all ZEF layers from the map
  const existingLayers = map.getLayers().getArray().slice(1); // Exclude base layer
  existingLayers.forEach((layer) => {
    if (layer && layer.get('key') && layer.get('key').startsWith('ZEF Corridor Strategy Phase')) {
      map.removeLayer(layer);
    }
  });

  // **Sort layers before re-adding**
  const sortedLayerNames = layerNames.sort(compareLayers);

  // Re-add layers in the correct order
  sortedLayerNames.forEach((layerName) => {
    if (layerCache[layerName]) {
      map.addLayer(layerCache[layerName]);
    }
  });
}
export {
  initMap,
  updateSelectedLayers,
  updateLegend,
  attachEventListeners,
  updateLayer,
  attributeBounds,
  data,
  removeLayer,
  loadLayer,
  handleMapClick,
  handleMapHover,
  map,
  fetchCSVData,
  toggleZefSubLayer,
  layerCache,
  getAttributesForLayer,
};
