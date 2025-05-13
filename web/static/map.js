import { createStyleFunction, isPolygonLayer, isPointLayer, isLineStringLayer, assignColorToLayer } from './styles.js';
import { getSelectedLayers, getSelectedLayersValues, showStateRegulations, getAreaLayerName, createZefFilenames } from './ui.js';
import { legendLabels, selectedGradientAttributes, geojsonColors, selectedGradientTypes, dataInfo, zefOptions, selectedZefOptions, selectedZefSubLayers} from './name_maps.js';

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
      ...vectorLayers.filter(layer => isPolygonLayer(layer)),  // Add polygon layers first
      ...vectorLayers.filter(layer => isLineStringLayer(layer)), // Add LineString layers next
      ...vectorLayers.filter(layer => isPointLayer(layer))    // Add point layers last
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
  document.querySelectorAll('#layer-selection input[type="checkbox"]').forEach(checkbox => {
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
    const areaDropdown = document.getElementById("area-layer-dropdown");
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
      
    uploadedLayerDropdown.on('select2:opening', function(e) {
        if (window.lastClickWasMoreButton) {
          e.preventDefault();               // Block dropdown from opening
          window.lastClickWasMoreButton = false;  // Reset the flag
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
      delete uploadedGeojsonNames[e.params.data.id]
      await updateSelectedLayers(); // Call function to update layers based on uploaded files
      updateLegend(); // Update the legend to include uploaded layers
    });
  } else {
    console.error('usefiles-data-ajax not found in the DOM');
  }
}

let lastFeature;

// Function to handle hover events
function handleMapHover(event) {
  let featureFound = false;
  map.forEachFeatureAtPixel(event.pixel, function(feature) {
    featureFound = true;
    //console.log(getAreaLayerName(document.getElementById("area-layer-dropdown").value));
    if (feature !== lastFeature && getAreaLayerName(document.getElementById("area-layer-dropdown").value) == 'State-Level Incentives and Regulations') {
      if (lastFeature) {
        const lastLayerName = getAreaLayerName(document.getElementById("area-layer-dropdown").value);
        lastFeature.setStyle(createStyleFunction(lastLayerName, 'gray', 1)); // Reset style on the last hovered feature
      }
      if (feature) {
        const currentLayerName = feature.get('layerName');
        //console.log('Current Layer Name:', currentLayerName); // Debugging
        feature.setStyle(createStyleFunction(currentLayerName, 'white', 3, true)); // Apply hover style to the new feature
      }
      //console.log(getAreaLayerName(document.getElementById("area-layer-dropdown").value));
      lastFeature = feature;
    }
  });
  // If no feature was found under the cursor, reset the last hovered feature, if goes off map, last hovered feature does not stay color
  if (!featureFound && lastFeature) {
    const lastLayerName = 'State-Level Incentives and Regulations'; // Adjust as needed
    lastFeature.setStyle(createStyleFunction(lastLayerName, 'gray', 1)); // Reset the last feature's style
    lastFeature = null; // Clear lastFeature to avoid retaining hover effects
  }
}


// Function to handle click events
function handleMapClick(event) {
  map.forEachFeatureAtPixel(event.pixel, function(feature) {
    const layerName = getAreaLayerName(document.getElementById("area-layer-dropdown").value) //feature.get('layerName'); //not sure if this is correct
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
  });
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
  let url = layerUrl && layerUrl.startsWith('https://')
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
      const minVal = Math.min(...features.map(f => f.get(attributeName) || Infinity));
      const maxVal = Math.max(...features.map(f => f.get(attributeName) || -Infinity));
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

  const layerIndex = vectorLayers.findIndex(layer => layer.get("key") === layerName);
  
  if (layerIndex !== -1) {
    const layer = vectorLayers[layerIndex];

    // Remove from OpenLayers map
    map.removeLayer(layer);

    // Remove from vectorLayers and cache
    vectorLayers.splice(layerIndex, 1);
    delete layerCache[layerName];
  } else {
    console.warn("Layer not found in vectorLayers:", layerName);
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
    const minVal = Math.min(...vectorLayer.getSource().getFeatures().map(f => f.get(attributeName) || Infinity));
    const maxVal = Math.max(...vectorLayer.getSource().getFeatures().map(f => f.get(attributeName) || -Infinity));
    attributeBounds[layerName] = { min: minVal, max: maxVal };
  }

}

function setLayerVisibility(layerName, isVisible) {
  // Find the layer by its name and update its visibility
  const layer = vectorLayers.find(layer => layer.get("key").split(".")[0] === layerName);

  if (layer) {
    layer.setVisible(isVisible);
  }
}

// Function to update the selected layers on the map
async function updateSelectedLayers() {
  let selectedLayers = getSelectedLayers(); // Get selected layers
  const loadingPromises = [];

  let zefSubLayers = [];

  if (selectedLayers.includes("National ZEF Corridor Strategy")) {
    const phase = selectedZefOptions["Phase"] || "1";

    // Respect checkbox state for ZEF sublayers
    zefSubLayers = [];

    if (selectedZefSubLayers["Hubs"]) {
        zefSubLayers.push({
          name: `ZEF Corridor Strategy Phase ${phase} Hubs`,
          url: `${STORAGE_URL}geojsons_simplified/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Hubs.geojson`
        });
    }

    if (selectedZefSubLayers["Corridors"]) {
        zefSubLayers.push({
          name: `ZEF Corridor Strategy Phase ${phase} Corridors`,
          url: `${STORAGE_URL}geojsons_simplified/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Corridors.geojson`
        });
    }

    if (selectedZefSubLayers["Facilities"]) {
        zefSubLayers.push({
          name: `ZEF Corridor Strategy Phase ${phase} Facilities`,
          url: `${STORAGE_URL}geojsons_simplified/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Facilities.geojson`
      });
    }

    // Remove "National ZEF Corridor Strategy" from selectedLayers
    selectedLayers = selectedLayers.filter(layer => layer !== "National ZEF Corridor Strategy");

    // Add sub-layers
    selectedLayers.push(...zefSubLayers.map(layer => layer.name));

    // Ensure sub-layers are loaded from AWS
    for (const { name, url } of zefSubLayers) {
      if (!layerCache[name]) {
        loadingPromises.push(loadLayer(name, url));
      }
    }
  }

  // Load all other selected layers, but skip the ZEF sub-layers since they're already handled
  for (const layerName of selectedLayers) {
      if (!layerCache[layerName] && !zefSubLayers.some(subLayer => subLayer.name === layerName)) {
        const isUploadedLayer = uploadedGeojsonNames.hasOwnProperty(layerName);
        loadingPromises.push(loadLayer(layerName, null, !isUploadedLayer));
      }
  }

  try {
    await Promise.all(loadingPromises);

    // Sort selectedLayers (now including the sub-layers)
    selectedLayers.sort(compareLayers);

    // Hide any non-selected layers
    Object.keys(layerCache).forEach(layerName => {
      setLayerVisibility(layerName, selectedLayers.includes(layerName));
    });

  } catch (error) {
    console.error("Error loading layers:", error);
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
  return Object.fromEntries(
    Object.entries(originalMap).map(([key, value]) => [value, key])
  );
}

function updateLegend() {
  const legendDiv = document.getElementById("legend");
  legendDiv.style.display = "flex";
  legendDiv.style.flexDirection = "column";

  // Clear existing legend entries
  while (legendDiv.firstChild) {
    legendDiv.removeChild(legendDiv.firstChild);
  }

  // Add and style Legend header
  const header = document.createElement('h3');
  header.appendChild(document.createTextNode('Legend'));
  header.style.fontWeight = "bold";
  legendDiv.appendChild(header);

  // Get the currently selected layers
  const selectedLayers = getSelectedLayers();

  // Iterate through the vectorLayers and update the legend
  vectorLayers.forEach((layer) => {
    const layerName = layer.get("key"); // Get the key property
    const isLayerVisible = layer.getVisible();

    if (isLayerVisible) {
          // Check if this layer is in the list of selected layers
          if (selectedLayers.includes(layerName) ||
              (selectedLayers.includes("National ZEF Corridor Strategy") && layerName.startsWith("ZEF Corridor Strategy Phase"))) {
              const layerDiv = document.createElement("div");
              layerDiv.style.display = "flex";
              layerDiv.style.alignItems = "center";
              
              const symbolLabelContainer = document.createElement("div");
              symbolLabelContainer.style.display = "flex";
              symbolLabelContainer.style.width = "150px";  // Setting fixed width to ensure alignment
              symbolLabelContainer.style.alignItems = "center";
              symbolLabelContainer.style.justifyContent = "center";
              
              const symbolContainer = document.createElement("div");
              symbolContainer.style.display = "flex";
              symbolContainer.style.alignItems = "center";
              symbolContainer.style.width = "120px"; // fixed width
              
              const canvas = document.createElement("canvas");
              canvas.width = 50;
              canvas.height = 10;
              const ctx = canvas.getContext("2d");
              
              const useGradient = layerName in selectedGradientAttributes;
              
              // If the layer is pre-defined, set it to its defined color, or default to yellow
              let layerColor = '';
              if (layerName in geojsonColors) {
                  layerColor = geojsonColors[layerName] || 'yellow'; // Fetch color from dictionary, or default to yellow
              }
              // Otherwise, set the color dynamically
              else {
                  layerColor = assignColorToLayer(layerName);
              }
              let attributeName = '';
              let gradientType = '';
              if (useGradient) {
                  attributeName = selectedGradientAttributes[layerName];
                  gradientType = selectedGradientTypes[layerName];
              }
              const bounds = attributeBounds[layerName];
              
              // Add legend entry only for visible layers
              if (isPolygonLayer(layer)) {
                  if (useGradient ) {
                      const minVal = bounds.min < 0.01 ? bounds.min.toExponential(1) : (bounds.min > 100 ? bounds.min.toExponential(1) : bounds.min.toFixed(1));
                      const minDiv = document.createElement("div");
                      minDiv.innerText = minVal.toString();
                      minDiv.style.marginRight = "5px";
                      symbolContainer.appendChild(minDiv);
                      symbolContainer.style.marginRight = "40px";
                      
                      const gradient = ctx.createLinearGradient(0, 0, 50, 0);
                      gradient.addColorStop(0, "rgb(255, 255, 255)"); // White for low values
                      gradient.addColorStop(1, `rgb(0, 0, 255)`); // Blue for high values
                      ctx.fillStyle = gradient;
                      ctx.fillRect(0, 0, 50, 10);
                      symbolContainer.appendChild(canvas);
                      symbolContainer.style.marginRight = "40px";
                      
                      const maxVal = bounds.max < 0.01 ? bounds.max.toExponential(1) : (bounds.max > 100 ? bounds.max.toExponential(1) : bounds.max.toFixed(1));
                      const maxDiv = document.createElement("div");
                      maxDiv.innerText = maxVal.toString();
                      maxDiv.style.marginLeft = "5px";
                      symbolContainer.appendChild(maxDiv);
                      symbolContainer.style.marginRight = "40px";
                  } else {
                      // Solid color rectangle
                      ctx.fillStyle = layerColor;
                      ctx.fillRect(0, 0, 50, 10);
                      symbolContainer.appendChild(canvas);
                      symbolContainer.style.marginRight = "40px";
                  }
              } else if (isLineStringLayer(layer)) {
                  if (useGradient && bounds) { // Check to make sure bounds are actually defined
                      const minVal = bounds.min < 0.01 ? bounds.min.toExponential(1) : (bounds.min > 100 ? bounds.min.toExponential(1) : bounds.min.toFixed(1));
                      const minDiv = document.createElement("div");
                      minDiv.innerText = minVal.toString(); // Minimum attribute value
                      minDiv.style.marginRight = "5px";
                      symbolContainer.appendChild(minDiv);
                      symbolContainer.style.marginRight = "40px";
                      
                      // New canvas for line width
                      const canvas = document.createElement("canvas");
                      canvas.width = 50;
                      canvas.height = 20; // Increased height to make space for the varying line width
                      const ctx = canvas.getContext("2d");
                      
                      // Draw a line segment that gradually increases in width from 1 to 10
                      let yPosition = 10; // vertical position for the line
                      
                      for (let x = 0; x <= 50; x++) {
                          let lineWidth = 1 + (x / 50) * 9; // lineWidth will vary between 1 and 10
                          ctx.strokeStyle = layerColor;
                          ctx.lineWidth = lineWidth;
                          
                          ctx.beginPath();
                          ctx.moveTo(x, yPosition - lineWidth / 2);
                          ctx.lineTo(x, yPosition + lineWidth / 2);
                          ctx.stroke();
                      }
                      
                      symbolContainer.appendChild(canvas);
                      symbolContainer.style.marginRight = "40px";
                      
                      // Check to make sure bounds are actually defined
                      const maxVal = bounds.max < 0.01 ? bounds.max.toExponential(1) : (bounds.max > 100 ? bounds.max.toExponential(1) : bounds.max.toFixed(1));
                      const maxDiv = document.createElement("div");
                      maxDiv.innerText = maxVal.toString(); // Maximum attribute value
                      maxDiv.style.marginLeft = "5px";
                      symbolContainer.appendChild(maxDiv);
                      symbolContainer.style.marginRight = "40px";
                  } else {
                      // New canvas for constant width line
                      const constantCanvas = document.createElement("canvas");
                      constantCanvas.width = 50;
                      constantCanvas.height = 10;  // Set height to 10 for constant line width
                      const constantCtx = constantCanvas.getContext("2d");
                      
                      constantCtx.strokeStyle = layerColor;
                      constantCtx.lineWidth = 3;
                      
                      constantCtx.beginPath();
                      constantCtx.moveTo(0, 5);
                      constantCtx.lineTo(50, 5);
                      constantCtx.stroke();
                      
                      symbolContainer.appendChild(constantCanvas);
                      symbolContainer.style.marginRight = "40px";
                  }
              } else if (isPointLayer(layer)) { // this block is for point-like geometries
                  // check if gradient should be used for points
                  if (useGradient && bounds) {
                      if (gradientType === 'size') {
                          // Minimum value and minimum point size
                          const minVal = bounds.min < 0.01 ? bounds.min.toExponential(1) : (bounds.min > 100 ? bounds.min.toExponential(1) : bounds.min.toFixed(1));
                          const minDiv = document.createElement("div");
                          minDiv.innerText = minVal.toString();
                          minDiv.style.marginRight = "5px";
                          symbolContainer.appendChild(minDiv);
                          
                          // Canvas to draw points
                          const minPointSize = 2;  // Minimum size (can set according to your needs)
                          const maxPointSize = 10; // Maximum size (can set according to your needs)
                          
                          // Create canvas for the minimum point size
                          const minPointCanvas = document.createElement("canvas");
                          minPointCanvas.width = 20;
                          minPointCanvas.height = 20;
                          const minCtx = minPointCanvas.getContext("2d");
                          
                          minCtx.fillStyle = layerColor;
                          minCtx.beginPath();
                          minCtx.arc(10, 10, minPointSize, 0, Math.PI * 2);
                          minCtx.fill();
                          symbolContainer.appendChild(minPointCanvas);
                          
                          // Create canvas for the maximum point size
                          const maxPointCanvas = document.createElement("canvas");
                          maxPointCanvas.width = 20;
                          maxPointCanvas.height = 20;
                          const maxCtx = maxPointCanvas.getContext("2d");
                          
                          maxCtx.fillStyle = layerColor;
                          maxCtx.beginPath();
                          maxCtx.arc(10, 10, maxPointSize, 0, Math.PI * 2);
                          maxCtx.fill();
                          symbolContainer.appendChild(maxPointCanvas);
                          
                          // Maximum value
                          const maxVal = bounds.max < 0.01 ? bounds.max.toExponential(1) : (bounds.max > 100 ? bounds.max.toExponential(1) : bounds.max.toFixed(1));
                          const maxDiv = document.createElement("div");
                          maxDiv.innerText = maxVal.toString();
                          maxDiv.style.marginLeft = "5px";
                          symbolContainer.appendChild(maxDiv);
                      }
                      else if (gradientType === 'color') {
                          // Minimum value and minimum point size
                          const minVal = bounds.min < 0.01 ? bounds.min.toExponential(1) : (bounds.min > 100 ? bounds.min.toExponential(1) : bounds.min.toFixed(1));
                          const minDiv = document.createElement("div");
                          minDiv.innerText = minVal.toString();
                          minDiv.style.marginRight = "5px";
                          symbolContainer.appendChild(minDiv);
                          
                          // Canvas to draw points
                          const minPointColor = 'lightblue';  // Light blue for minimum value
                          const maxPointColor = 'blue'; // Dark blue for maximum value
                          
                          // Create canvas for the minimum point size
                          const minPointCanvas = document.createElement("canvas");
                          minPointCanvas.width = 20;
                          minPointCanvas.height = 20;
                          const minCtx = minPointCanvas.getContext("2d");
                          
                          minCtx.fillStyle = minPointColor;
                          minCtx.beginPath();
                          minCtx.arc(10, 10, 3, 0, Math.PI * 2);
                          minCtx.fill();
                          symbolContainer.appendChild(minPointCanvas);
                          
                          // Create canvas for the maximum point size
                          const maxPointCanvas = document.createElement("canvas");
                          maxPointCanvas.width = 20;
                          maxPointCanvas.height = 20;
                          const maxCtx = maxPointCanvas.getContext("2d");
                          
                          maxCtx.fillStyle = maxPointColor;
                          maxCtx.beginPath();
                          maxCtx.arc(10, 10, 3, 0, Math.PI * 2);
                          maxCtx.fill();
                          symbolContainer.appendChild(maxPointCanvas);
                          
                          // Maximum value
                          const maxVal = bounds.max < 0.01 ? bounds.max.toExponential(1) : (bounds.max > 100 ? bounds.max.toExponential(1) : bounds.max.toFixed(1));
                          const maxDiv = document.createElement("div");
                          maxDiv.innerText = maxVal.toString();
                          maxDiv.style.marginLeft = "5px";
                          symbolContainer.appendChild(maxDiv);
                      }
                  } else {
                      // code for constant size points
                      ctx.fillStyle = layerColor;
                      ctx.beginPath();
                      ctx.arc(25, 5, 3, 0, Math.PI * 2);
                      ctx.fill();
                      canvas.style.marginLeft = "30px";  // Shift canvas to align the center
                      symbolContainer.appendChild(canvas);
                  }
                  
                  symbolContainer.style.marginRight = "40px";
              }
              
              layerDiv.appendChild(symbolContainer);
              
              symbolLabelContainer.appendChild(symbolContainer);  // Append symbolContainer to symbolLabelContainer
              
              // Make a title for the legend entry
              const title = document.createElement("div");
              
              // First, check if the layer is included in the pre-defined legend labels
              if (layerName in legendLabels) {
                  if (typeof legendLabels[layerName] === 'string') {
                      title.innerText = legendLabels[layerName];
                  }
                  else if (isDictionary(legendLabels[layerName])) {
                      title.innerText = legendLabels[layerName][selectedGradientAttributes[layerName]];
                  }
              }
              // Next, check if it's included the uploaded layers
              else if (layerName in uploadedGeojsonNames) {
                  // Check if a gradient attribute is selected for the layer
                  if (layerName in selectedGradientAttributes && selectedGradientAttributes[layerName]) {
                      // Set the legend label to the name of the selected gradient attribute
                      title.innerText = uploadedGeojsonNames[layerName] + ": " + selectedGradientAttributes[layerName];
                  } else {
                      // Default to the GeoJSON file name
                      title.innerText = uploadedGeojsonNames[layerName];
                  }
              }
              // Otherwise, just use the layer name directly
              else {
                  title.innerText = layerName;
              }
              title.style.marginLeft = "20px";
              
              layerDiv.appendChild(symbolLabelContainer);  // Append symbolLabelContainer to layerDiv
              layerDiv.appendChild(title);
              legendDiv.appendChild(layerDiv);
          }
      }
  });
}

async function fetchCSVData(csvFileName) {
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
document.getElementById("clear-button").addEventListener("click", function () {
  console.log("Clear button clicked");
  event.stopPropagation(); // Prevent outside click handler from firing
    
  // Show confirmation modal
  document.getElementById("clear-confirmation-modal").style.display = "flex";
});

function clearLayerSelections() {
  // Clear selected checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Clear selected option in the area layer dropdown
  const areaLayerDropdown = document.getElementById("area-layer-dropdown");
  areaLayerDropdown.selectedIndex = 0; // Assuming the first option is "Select Area Feature"
  updateSelectedLayers();
  updateLegend();
}

// Confirm clear action
document.getElementById("confirm-clear").addEventListener("click", function () {
  document.getElementById("clear-confirmation-modal").style.display = "none";

  // Remove all vector layers from map
  const mapLayers = map.getLayers().getArray();
  mapLayers.forEach(layer => {
    if (layer instanceof ol.layer.Vector && !layer.get("baseLayer")) {
      map.removeLayer(layer);
    }
  });

  clearLayerSelections();
});

// Cancel clear
document.getElementById("cancel-clear").addEventListener("click", function () {
  document.getElementById("clear-confirmation-modal").style.display = "none";
});

// Close modal via X
document.getElementById("clear-modal-close").addEventListener("click", function () {
  document.getElementById("clear-confirmation-modal").style.display = "none";
});

// Close modal if clicking outside the modal content
window.addEventListener("click", function (event) {
  const modal = document.getElementById("clear-confirmation-modal");
  const content = modal.querySelector(".modal-content");

  if (modal.style.display === "flex" && !content.contains(event.target)) {
    modal.style.display = "none";
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
    //console.log("In applyLayerOptions()")
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
    updateLayer(layerName, gradientAttribute)
    
    // Update the map
    await updateSelectedLayers(); // Wait for updateSelectedLayers to complete
    updateLegend(); // Now, call updateLegend after updateSelectedLayers is done
}

async function toggleZefSubLayer(subName, checked) {
  const layerName = `ZEF Corridor Strategy Phase ${selectedZefOptions["Phase"]} ${subName}`;
  const layerUrl = `${STORAGE_URL}geojsons_simplified/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${selectedZefOptions["Phase"]}_${subName}.geojson`;

  // **Check if National ZEF Corridor Strategy is visible on the map**
  const parentLayerVisible = Object.keys(layerCache).some(layerKey =>
    layerKey.startsWith("ZEF Corridor Strategy Phase") && layerCache[layerKey].getVisible()
  );

  if (!parentLayerVisible) {
    console.log(`Skipping sub-layer toggle for ${layerName} because National ZEF Corridor Strategy is not active`);
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
      console.error("Layer failed to load and is missing from cache.");
    }
  } else {
    removeLayer(layerName);
    vectorLayers = vectorLayers.filter(layer => layer.get("key") !== layerName);
  }

  // **Re-enforce correct order of all active ZEF sub-layers**
  enforceLayerOrder(
    vectorLayers
      .map(layer => layer.get("key")) // Get layer names
      .filter(name => name.startsWith("ZEF Corridor Strategy Phase")) // Keep only ZEF layers
  );

  updateLegend();
}


function enforceLayerOrder(layerNames) {
  // Remove all ZEF layers from the map
  const existingLayers = map.getLayers().getArray().slice(1); // Exclude base layer
  existingLayers.forEach(layer => {
    if (layer && layer.get("key") && layer.get("key").startsWith("ZEF Corridor Strategy Phase")) {
      map.removeLayer(layer);
    }
  });

  // **Sort layers before re-adding**
  const sortedLayerNames = layerNames.sort(compareLayers);

  // Re-add layers in the correct order
  sortedLayerNames.forEach(layerName => {
    if (layerCache[layerName]) {
      map.addLayer(layerCache[layerName]);
    }
  });
}


export { initMap, updateSelectedLayers, updateLegend, attachEventListeners, updateLayer, attributeBounds, data, removeLayer, loadLayer, handleMapClick, handleMapHover, map, fetchCSVData, toggleZefSubLayer, layerCache, getAttributesForLayer };
