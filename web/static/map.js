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
  faf5Options,
  selectedFaf5Options,
  gridEmissionsOptions,
  selectedGridEmissionsOptions,
  hourlyEmissionsOptions,
  stateSupportOptions,
  selectedStateSupportOptions,
  tcoOptions,
  selectedTcoOptions,
  emissionsOptions,
  selectedEmissionsOptions,
} from './name_maps.js';
import { 
  layerCache, 
  attributeBounds, 
  loadLayer as utilLoadLayer,
  removeLayer as utilRemoveLayer,
  updateLayer as utilUpdateLayer,
  setLayerVisibility,
  getAttributesForLayer,
  compareLayers
} from './layer-utils.js';
import { BULLET_CONFIGS, createBulletAttributes, convertDropdownIdToLabel } from './bullet-config.js';
import { transformOneOptions, transformTwoOptions, transformThreeOptions } from './transform-utils.js';

var vectorLayers = [];
var map;
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

async function attachEventListeners() {
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
}



  function createExtraAttributes(s, k, c, e, p) {
      if ((k === "geojsons_simplified/faf5_freight_flows/mode_truck_commodity_all_origin_all_dest_all.geojson") || (k === "Truck Imports and Exports")){
        return createBulletAttributes("Truck Imports and Exports", s, c, e, p);
      }
      else if ((k ==="geojsons_simplified/grid_emission_intensity/eia2022_state_merged.geojson") || (k === "Grid Emission Intensity")){
        return createBulletAttributes("Grid Emission Intensity", s, c, e, p);
      }
      else if ((k === "geojsons_simplified/average_grid_emissions.geojson") || (k === "Hourly Grid Emissions")){
        return createBulletAttributes("Hourly Grid Emissions", s, c, e, p);
      }
      else if ((k === "geojsons_simplified/incentives_and_regulations/all_incentives_and_regulations.geojson") || (k === "State-Level Incentives and Regulations")) {
        return createBulletAttributes("State-Level Incentives and Regulations", s, c, e, p);
      }
      else if ((k === "geojsons_simplified/costs_and_emissions/state_emissions_per_mile_payload40000_avVMT100000.geojson") || (k === "Lifecycle Truck Emissions")) {
        return createBulletAttributes("Lifecycle Truck Emissions", s, c, e, p);
      }
      else if ((k === "geojsons_simplified/costs_and_emissions/costs_per_mile_payload40000_avVMT100000_maxChP400.geojson") || (k === "Total Cost of Truck Ownership")) {
        return createBulletAttributes("Total Cost of Truck Ownership", s, c, e, p);
    }
    else if ((k === "Savings from Pooled Charging Infrastructure")) {
      return createBulletAttributes("Savings from Pooled Charging Infrastructure", s, c, e, p);
  }
    return "&&&&&&"; 
  }
 function updateLabels(m, selectedValue, c, k, p){
    const firstsectDiv = document.getElementById("firstsect"); 
    const secsectDiv = document.getElementById("secsect");
    const thirdsectDiv = document.getElementById("thirdsect");
    const fourthsectDiv = document.getElementById("fourthsect");

    const label1Span = document.querySelector("#public .label1"); 
    const value1Span = document.querySelector("#public .value1"); 

    const label2Span = document.querySelector("#public .label2"); 
    const value2Span = document.querySelector("#public .value2"); 

    const label3Span = document.querySelector("#public .label3"); 
    const value3Span = document.querySelector("#public .value3");

    const label4Span = document.querySelector("#public .label4");
    const value4Span = document.querySelector("#public .value4");
    
 


    const extraAttributes = createExtraAttributes(m, selectedValue, c, k, p);

    const parts = extraAttributes.split("&");
    
    // Clear all spans first
    if (label1Span) label1Span.innerHTML = "";
    if (value1Span) value1Span.innerHTML = "";
    if (label2Span) label2Span.innerHTML = "";
    if (value2Span) value2Span.innerHTML = "";
    if (label3Span) label3Span.innerHTML = "";
    if (value3Span) value3Span.innerHTML = "";
    if (label4Span) label4Span.innerHTML = "";
    if (value4Span) value4Span.innerHTML = "";
    
    // Hide all sections initially and remove show-bullet class
    if (firstsectDiv) {
      firstsectDiv.classList.remove("show-bullet");
    }
    if (secsectDiv) {
      secsectDiv.classList.remove("show-bullet");
    }
    if (thirdsectDiv) {
      thirdsectDiv.classList.remove("show-bullet");
    }
    if (fourthsectDiv) {
      fourthsectDiv.classList.remove("show-bullet");
    }
    
    // Dynamically assign visible bullets to available sections
    const spans = [
      [label1Span, value1Span, firstsectDiv],
      [label2Span, value2Span, secsectDiv], 
      [label3Span, value3Span, thirdsectDiv],
      [label4Span, value4Span, fourthsectDiv]
    ];
    
    
    let visibleCount = 0;
    for (let i = 0; i < parts.length; i += 2) {
      const labelHtml = parts[i] || "";
      const valueHtml = parts[i + 1] || "";
      
      if (labelHtml && valueHtml && visibleCount < spans.length) {
        const [labelSpan, valueSpan, sectionDiv] = spans[visibleCount];
        if (labelSpan) labelSpan.innerHTML = labelHtml;
        if (valueSpan) valueSpan.innerHTML = valueHtml;
        if (sectionDiv) sectionDiv.classList.add("show-bullet");
        visibleCount++;
      }
    }
    
};


function updateLabels2(m, selectedValue, c, k, p){
  const firstsectDiv = document.getElementById("firstsect-2"); 
  const secsectDiv = document.getElementById("secsect-2");
  const thirdsectDiv = document.getElementById("thirdsect-2");
  const fourthsectDiv = document.getElementById("fourthsect-2");
  const label1Span = document.querySelector("#public-2 .label1-2"); 
  const value1Span = document.querySelector("#public-2 .value1-2"); 

  const label2Span = document.querySelector("#public-2 .label2-2"); 
  const value2Span = document.querySelector("#public-2 .value2-2"); 

  const label3Span = document.querySelector("#public-2 .label3-2"); 
  const value3Span = document.querySelector("#public-2 .value3-2");

  const label4Span = document.querySelector("#public-2 .label4-2");
  const value4Span = document.querySelector("#public-2 .value4-2"); 


  const extraAttributes = createExtraAttributes(m, selectedValue, c, k, p);
  const parts = extraAttributes.split("&");
  
  // Clear all spans first
  if (label1Span) label1Span.innerHTML = "";
  if (value1Span) value1Span.innerHTML = "";
  if (label2Span) label2Span.innerHTML = "";
  if (value2Span) value2Span.innerHTML = "";
  if (label3Span) label3Span.innerHTML = "";
  if (value3Span) value3Span.innerHTML = "";
  if (label4Span) label4Span.innerHTML = "";
  if (value4Span) value4Span.innerHTML = "";
  
  // Hide all sections initially and remove show-bullet class
  if (firstsectDiv) {
    firstsectDiv.classList.remove("show-bullet");
  }
  if (secsectDiv) {
    secsectDiv.classList.remove("show-bullet");
  }
  if (thirdsectDiv) {
    thirdsectDiv.classList.remove("show-bullet");
  }
  if (fourthsectDiv) {
    fourthsectDiv.classList.remove("show-bullet");
  }
  
  // Dynamically assign visible bullets to available sections
  const spans = [
    [label1Span, value1Span, firstsectDiv],
    [label2Span, value2Span, secsectDiv], 
    [label3Span, value3Span, thirdsectDiv],
    [label4Span, value4Span, fourthsectDiv]
  ];
  
  let visibleCount = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const labelHtml = parts[i] || "";
    const valueHtml = parts[i + 1] || "";
    
    // Only show if both label and value have content
    if (labelHtml && valueHtml && visibleCount < spans.length) {
      const [labelSpan, valueSpan, sectionDiv] = spans[visibleCount];
      if (labelSpan) labelSpan.innerHTML = labelHtml;
      if (valueSpan) valueSpan.innerHTML = valueHtml;
      if (sectionDiv) sectionDiv.classList.add("show-bullet");
      visibleCount++;
    }
  }
};


  const transformEmissionsDict = gridEmissionsOptions["Visualize By"]; 
  const transformFafDict = faf5Options["Commodity"]; 
  const transformHourlyDict = hourlyEmissionsOptions["Hour of Day"]; 
  const transformStateTypeDict = stateSupportOptions["Support Type"]; 
  const transformStateTargetDict = stateSupportOptions["Support Target"]; 
  const transformTco1Dict = tcoOptions["Average Payload"]; 
  const transformTco2Dict = tcoOptions["Average VMT"]; 
  const transformTco3Dict = tcoOptions["Max Charging Power"]; 
  const transformE1Dict = emissionsOptions["Average Payload"]; 
  const transformE2Dict = emissionsOptions["Average VMT"]; 
  const transformE3Dict = emissionsOptions["Visualize By"]; 



  function updateSectionMargin1() {
    const container = document.querySelector('.header-container'); 
      container.style.marginTop = '1rem';
  }


  function updateSectionMargin2() {
    const container = document.querySelector('.header-container'); 
      container.style.marginTop = '3.5rem';
  }
  


  const areaDropdown = document.getElementById('area-layer-dropdown');
  if (areaDropdown) {
    areaDropdown.addEventListener('change', async () => {
      try {
        await updateSelectedLayers();
        updateLegend();

        if (areaDropdown.value == "geojsons_simplified/faf5_freight_flows/mode_truck_commodity_all_origin_all_dest_all.geojson"){
          const selected = transformOneOptions(selectedFaf5Options, transformFafDict, "Commodity")
          updateLabels("default", areaDropdown.value, "", "", selected);
          updateSectionMargin1(); 
        }

        else if (areaDropdown.value == "geojsons_simplified/grid_emission_intensity/eia2022_state_merged.geojson"){
          const selected = transformOneOptions(selectedGridEmissionsOptions, transformEmissionsDict, "Visualize By")
          updateLabels("default", areaDropdown.value, "", "", selected);
          updateSectionMargin1(); 
        }

        else if (areaDropdown.value == "geojsons_simplified/incentives_and_regulations/all_incentives_and_regulations.geojson" ){
          const selected = transformTwoOptions(selectedStateSupportOptions, transformStateTypeDict, transformStateTargetDict, "Support Type", "Support Target")
          updateLabels("default", areaDropdown.value, "", "", selected);
          updateSectionMargin1(); 
        }

        else if (areaDropdown.value == "geojsons_simplified/costs_and_emissions/costs_per_mile_payload40000_avVMT100000_maxChP400.geojson"){
          const selected = transformThreeOptions(selectedTcoOptions, transformTco1Dict, transformTco2Dict, transformTco3Dict, "Average Payload", "Average VMT", "Max Charging Power")
          updateLabels("default", areaDropdown.value, "", "", selected);
          updateSectionMargin1(); 
        }

        else if (areaDropdown.value == "geojsons_simplified/costs_and_emissions/state_emissions_per_mile_payload40000_avVMT100000.geojson"){
          const selected = transformThreeOptions(selectedEmissionsOptions, transformE1Dict, transformE2Dict, transformE3Dict, "Average Payload", "Average VMT", "Visualize By")
          updateLabels("default", areaDropdown.value, "", "", selected);
          updateSectionMargin1(); 
        }


        
        else{

          updateLabels("default", areaDropdown.value, "", "", {});
          updateSectionMargin2(); 
        }
          
        

        
       
         
        
      } catch (error) {
        console.error('Auto-update on area layer change failed:', error);
      }
    });
  }

  const uploadedLayerDropdown = $('#usefiles-data-ajax');
  if (uploadedLayerDropdown.length > 0) {
    uploadedLayerDropdown.on('select2:opening', function (e) {
      if (window.lastClickWasMoreButton) {
        e.preventDefault(); // Block dropdown from opening
        window.lastClickWasMoreButton = false; // Reset the flag
      }
    }); 

    // Use select2's specific events for handling changes
    uploadedLayerDropdown.on('select2:select', async (e) => {
      uploadedGeojsonNames[e.params.data.id] = e.params.data.text;

      try {
        await updateSelectedLayers();
        updateLegend();
      } catch (error) {
        console.error('Error loading uploaded layers:', error);
      }
    });

    uploadedLayerDropdown.on('select2:unselect', async (e) => {
      delete uploadedGeojsonNames[e.params.data.id];
      await updateSelectedLayers();
      updateLegend();
    });
  } else {
    console.error('usefiles-data-ajax not found in the DOM');
  }

let lastFeature = null;
function handleMapHover(event) {
  let featureFound = false;

  map.forEachFeatureAtPixel(event.pixel, function (feature) {
    featureFound = true;

    const selectedLayer = getAreaLayerName(document.getElementById('area-layer-dropdown').value);
    const layerName = feature.get('layerName') || selectedLayer;

    if (layerName === 'State-Level Incentives and Regulations' || layerName === 'Hourly Grid Emissions') {
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



async function loadLayer(layerName, layerUrl = null, showApplySpinner = true) {
  const layerMap = getSelectedLayersValues();
  const layer = await utilLoadLayer(layerName, layerUrl, showApplySpinner, STORAGE_URL, layerMap);
  vectorLayers.push(layer);
}

function removeLayer(layerName) {
  utilRemoveLayer(layerName, vectorLayers, map);
}

async function updateLayer(layerName, attributeName) {
  if (!layerCache[layerName]) {
    await loadLayer(layerName);
  }
  await utilUpdateLayer(layerName, attributeName);
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

  // Show/hide legend based on content
  if (hasContent) {
    legend.classList.add('has-content');
    // When content first appears, ensure legend starts in open state
    if (legend.classList.contains('closed')) {
      legend.classList.remove('closed');
      legendContent.style.display = 'flex';
      legend.style.height = 'auto';
      legend.style.minHeight = 'auto';
      legend.style.maxHeight = 'none';
      isLegendOpen = true;
    }
  } else {
    legend.classList.remove('has-content');
  }
  
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


async function applyLayerOptions(layerName, gradientAttribute) {
  if (!layerCache[layerName]) {
    console.error(`Layer ${layerName} not found in cache.`);
    return [];
  }

  const layer = layerCache[layerName];

  selectedGradientAttributes[layerName] = gradientAttribute;
  if (isPolygonLayer(layer)) selectedGradientTypes[layerName] = 'color';
  else selectedGradientTypes[layerName] = 'size';

  updateLayer(layerName, gradientAttribute);

  await updateSelectedLayers();
  updateLegend();
}

async function toggleZefSubLayer(subName, checked) {
  const layerName = `ZEF Corridor Strategy Phase ${selectedZefOptions['Phase']} ${subName}`;
  const layerUrl = `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${selectedZefOptions['Phase']}_${subName}.geojson`;

  const parentLayerVisible = Object.keys(layerCache).some(
    (layerKey) =>
      layerKey.startsWith('ZEF Corridor Strategy Phase') && layerCache[layerKey].getVisible()
  );

  if (!parentLayerVisible) {
    return;
  }

  // Proceed as normal
  if (checked) {
    if (!layerCache[layerName]) {
      await loadLayer(layerName, layerUrl);
    }

    if (layerCache[layerName]) {
      const layer = layerCache[layerName];

      if (!vectorLayers.includes(layer)) {
        vectorLayers.push(layer);
      }
      setLayerVisibility(layerName, true, vectorLayers);
    } else {
      console.error('Layer failed to load and is missing from cache.');
    }
  } else {
    removeLayer(layerName);
    vectorLayers = vectorLayers.filter((layer) => layer.get('key') !== layerName);
  }

  enforceLayerOrder(
    vectorLayers
      .map((layer) => layer.get('key'))
      .filter((name) => name.startsWith('ZEF Corridor Strategy Phase'))
  );

  updateLegend();
}

function enforceLayerOrder(layerNames) {
  const existingLayers = map.getLayers().getArray().slice(1);
  existingLayers.forEach((layer) => {
    if (layer && layer.get('key') && layer.get('key').startsWith('ZEF Corridor Strategy Phase')) {
      map.removeLayer(layer);
    }
  });

  const sortedLayerNames = layerNames.sort(compareLayers);

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
  updateLabels,
  updateLabels2, 
  convertDropdownIdToLabel,  
};

