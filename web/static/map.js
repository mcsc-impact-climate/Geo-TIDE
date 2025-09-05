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

import {
  faf5Options,
  selectedFaf5Options,
  gridEmissionsOptions, 
  selectedGridEmissionsOptions, 
  hourlyEmissionsOptions, 
  selectedHourlyEmissionsOptions, 
  stateSupportOptions, 
  selectedStateSupportOptions,
  tcoOptions, 
  selectedTcoOptions, 
  emissionsOptions, 
  selectedEmissionsOptions, 
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
}
 function convertDropdownIdToLabel(dropdownId) {
    let label = dropdownId.replace('-dropdown', '');
  
    label = label.replace(/-/g, ' ');
  
    label = label.toLowerCase();
  
    return label;
  }

  function createExtraAttributes(s, k, c, e, p) {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5" fill="none"style="width: 0.27344rem; height: 0.27344rem; flex-shrink: 0; margin-right: 4px;">
    <path d="M2.5 4.13C2.1 4.13 1.73 4.03 1.4 3.84C1.07 3.64 0.8 3.37 0.6 3.04C0.41 2.71 0.31 2.34 0.31 1.94C0.31 1.54 0.41 1.17 0.6 0.84C0.8 0.51 1.07 0.25 1.4 0.05C1.73 -0.14 2.1 -0.24 2.5 -0.24C2.9 -0.24 3.27 -0.14 3.6 0.05C3.93 0.25 4.19 0.51 4.39 0.84C4.59 1.17 4.69 1.54 4.69 1.94C4.69 2.34 4.59 2.71 4.39 3.04C4.19 3.37 3.93 3.64 3.6 3.84C3.27 4.03 2.9 4.13 2.5 4.13Z" fill="#62748E"/>
 </svg>
`.trim();
      if ((k === "geojsons_simplified/faf5_freight_flows/mode_truck_commodity_all_origin_all_dest_all.geojson") || (k === "Truck Imports and Exports")){
        const label1HTML = `<span>${svgIcon}Commodity: </span>`;
        let value1HTML = p["Commodity"]
        if (s != "default") {
        value1HTML = c; 
        }
        return `${label1HTML}&${value1HTML}&&&&`;
      }


      else if ((k ==="geojsons_simplified/grid_emission_intensity/eia2022_state_merged.geojson") || (k === "Grid Emission Intensity")){

        const label1HTML = `<span>${svgIcon}Visualize by: </span>`;

        let value1HTML = p["Visualize By"]; 

        if (s != "default") {
          value1HTML = c; 
          }
        return `${label1HTML}&${value1HTML}&&&&`;
      }

      else if ((
        k ===
        "geojsons_simplified/daily_grid_emission_profiles/daily_grid_emission_profile_hour0.geojson"
      )  || (k === "Hourly Grid Emissions")){
  
        const label1HTML = `<span>${svgIcon}Hour of day: </span>`;
        let value1HTML = p["Hour of Day"]; 

        if (s != "default") {
          value1HTML = c; 
          }
  
        return `${label1HTML}&${value1HTML}&&&&`;
      }

      else if ((
        k ===
        "geojsons_simplified/incentives_and_regulations/all_incentives_and_regulations.geojson"
      ) || (k === "State-Level Incentives and Regulations")) {
  
        const label1HTML = `<span>${svgIcon}Support type: </span>`;
        const label1Text = "support type"
        let value1HTML = p["Support Type"]; 
        if (value1HTML == null) {
          value1HTML = "Incentives and Regulations"; 
        }
        if (label1Text in p){
          value1HTML = p[label1Text]; 
        }
        const label2HTML = `<span>${svgIcon}Support target: </span>`; 
        let value2HTML = p["Support Target"]; 
        if (value2HTML == null) {
          value2HTML = "All Targets"; 
        }
        const label2Text = "support target"

        if (label2Text in p){
          value2HTML = p[label2Text]; 
        }

        
  
        if (s != "default") {

          if (convertDropdownIdToLabel(e) === label1Text){
            value1HTML = c; 
          }
          else if (convertDropdownIdToLabel(e)=== label2Text){
            value2HTML = c; 
          }
          }
        return `${label1HTML}&${value1HTML}&${label2HTML}&${value2HTML}&&`;
      }

      else if ((
        k === "geojsons_simplified/costs_and_emissions/state_emissions_per_mile_payload40000_avVMT100000.geojson"
       
      ) || (k === "Lifecycle Truck Emissions")) {

       


  
        const label1HTML = `<span>${svgIcon}Average payload: </span>`;
        const label1Text = "average payload"; 
        

         let value1HTML = p["Average Payload"]
        if (value1HTML == null){
          value1HTML = "40,000 lb";
        }

        if (label1Text in p){
          value1HTML = p[label1Text]; 
        }



        const label2HTML = `<span>${svgIcon}Average VMT: </span>`; 
        const label2Text = "average vmt"; 
        let value2HTML = p["Average VMT"]
        if (value2HTML == null){
          value2HTML = "100,000 miles";
        }

        if (label2Text in p){
          value2HTML = p[label2Text]; 
        }

        const label3HTML = `<span>${svgIcon}Visualize by: </span>`; 
        const label3Text = "visualize by"; 

        let value3HTML = p["Visualize By"]
        if (value3HTML == null){
          value3HTML = "State";
        } 

        if (label3Text in p){
          value3HTML = p[label3Text]; 
        }

        if (s != "default") {
          if (convertDropdownIdToLabel(e) === label1Text){
            value1HTML = c; 
          }
          else if (convertDropdownIdToLabel(e)=== label2Text){
            value2HTML = c; 
          }
          else if (convertDropdownIdToLabel(e)=== label3Text){
            value3HTML = c; 
          }
          }
  
        return `${label1HTML}&${value1HTML}&${label2HTML}&${value2HTML}&${label3HTML}&${value3HTML}`;
      }

      else if ((
        k === "geojsons_simplified/costs_and_emissions/costs_per_mile_payload40000_avVMT100000_maxChP400.geojson"
       
      ) || (k === "Total Cost of Truck Ownership")) {
  
        const label1HTML = `<span>${svgIcon}Average payload: </span>`;
        const label1Text = "average payload"; 
        let value1HTML = p["Average Payload"]
        if (value1HTML == null){
          value1HTML = "40,000 lb";
        }
        if (label1Text in p){
          value1HTML = p[label1Text]; 
        }

        const label2HTML = `<span>${svgIcon}Average VMT: </span>`; 
        const label2Text = "average vmt"; 

        let value2HTML = p["Average VMT"]
        if (value2HTML == null){
          value2HTML = "100,000 miles";
        }

        if (label2Text in p){
          value2HTML = p[label2Text]; 
        }


        const label3HTML = `<span>${svgIcon}Max charging power: </span>`; 
        const label3Text = "charging power"; 
        let value3HTML = p["Max Charging Power"];
        if (value3HTML == null){
          value3HTML =   "400 kW"; 
        }
        
        if (label3Text in p){
          value3HTML = p[label3Text]; 
        }

        if (s != "default") {
          if (convertDropdownIdToLabel(e) === label1Text){
            value1HTML = c; 
          }
          else if (convertDropdownIdToLabel(e)=== label2Text){
            value2HTML = c; 
          }
          else if (convertDropdownIdToLabel(e)=== label3Text){
            value3HTML = c; 
          }
          }
        return `${label1HTML}&${value1HTML}&${label2HTML}&${value2HTML}&${label3HTML}&${value3HTML}`;
    }

    else if ((
      k === "Savings from Pooled Charging Infrastructure")) {

      const label1HTML = `<span>${svgIcon}Truck Range: </span>`;
      const label1Text = "range"; 
      let value1HTML = "250 miles";
      
      if (label1Text in p){
        value1HTML = p[label1Text]; 
      }

      const label2HTML = `<span>${svgIcon}Charging Time: </span>`; 
      const label2Text = "chargingtime"; 

      let value2HTML = "4 hours";
      

      if (label2Text in p){
        value2HTML = p[label2Text]; 
      }


      const label3HTML = `<span>${svgIcon}Max allowed wait time: </span>`; 
      const label3Text = "maxwaittime"; 
      let value3HTML =  "30 minutes"; 
      
      
      if (label3Text in p){
        value3HTML = p[label3Text]; 
      }

      if (s != "default") {
        if (convertDropdownIdToLabel(e) === label1Text){
          value1HTML = c; 
        }
        else if (convertDropdownIdToLabel(e)=== label2Text){
          value2HTML = c; 
        }
        else if (convertDropdownIdToLabel(e)=== label3Text){
          value3HTML = c; 
        }
        }
      return `${label1HTML}&${value1HTML}&${label2HTML}&${value2HTML}&${label3HTML}&${value3HTML}`;
  }


    return "&&&&&&"; 
  }
 function updateLabels(m, selectedValue, c, k, p){
    const firstsectDiv = document.getElementById("firstsect"); 
    const secsectDiv = document.getElementById("secsect");
    const thirdsectDiv = document.getElementById("thirdsect"); 

    const label1Span = document.querySelector("#public .label1"); 
    const value1Span = document.querySelector("#public .value1"); 

    const label2Span = document.querySelector("#public .label2"); 
    const value2Span = document.querySelector("#public .value2"); 

    const label3Span = document.querySelector("#public .label3"); 
    const value3Span = document.querySelector("#public .value3"); 


    const extraAttributes = createExtraAttributes(m, selectedValue, c, k, p);

    const parts = extraAttributes.split("&");
    const label1html = parts[0] || "";
    const value1html = parts[1] || "";
    const label2html = parts[2]|| "";
    const value2html = parts[3] || "";
    const label3html = parts[4]|| "";
    const value3html = parts[5]|| "";

    label1Span.innerHTML = label1html; 
    value1Span.innerHTML = value1html;
    label2Span.innerHTML = label2html; 
    value2Span.innerHTML = value2html;
    label3Span.innerHTML = label3html; 
    value3Span.innerHTML = value3html;

if (firstsectDiv) {
  firstsectDiv.style.display = (label1html || value1html) ? "block" : "none";
}

if (secsectDiv) {
  secsectDiv.style.display = (label2html || value2html) ? "block" : "none";
}

if (thirdsectDiv) {
  thirdsectDiv.style.display = (label3html || value3html) ? "block" : "none";
}
};


function updateLabels2(m, selectedValue, c, k, p){
  const firstsectDiv = document.getElementById("firstsect-2"); 
  const secsectDiv = document.getElementById("secsect-2");
  const thirdsectDiv = document.getElementById("thirdsect-2"); 
  const label1Span = document.querySelector("#public-2 .label1-2"); 
  const value1Span = document.querySelector("#public-2 .value1-2"); 

  const label2Span = document.querySelector("#public-2 .label2-2"); 
  const value2Span = document.querySelector("#public-2 .value2-2"); 

  const label3Span = document.querySelector("#public-2 .label3-2"); 
  const value3Span = document.querySelector("#public-2 .value3-2"); 


  const extraAttributes = createExtraAttributes(m, selectedValue, c, k, p);
  const parts = extraAttributes.split("&");
  const label1html = parts[0] || "";
  const value1html = parts[1] || "";
  const label2html = parts[2]|| "";
  const value2html = parts[3] || "";
  const label3html = parts[4]|| "";
  const value3html = parts[5]|| "";


  label1Span.innerHTML = label1html; 
  value1Span.innerHTML = value1html;
  label2Span.innerHTML = label2html; 
  value2Span.innerHTML = value2html;
  label3Span.innerHTML = label3html; 
  value3Span.innerHTML = value3html;

if (firstsectDiv) {
firstsectDiv.style.display = (label1html || value1html) ? "block" : "none";
}

if (secsectDiv) {
secsectDiv.style.display = (label2html || value2html) ? "block" : "none";
}

if (thirdsectDiv) {
thirdsectDiv.style.display = (label3html || value3html) ? "block" : "none";
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


  function transformOneOptions(opt, transform, key){
    const reversed = Object.fromEntries(
      Object.entries(transform).map(([key, value]) => [value, key])
    );
    const newOpt = { ...opt };

  newOpt[key] = reversed[newOpt[key]];

  return newOpt;

  }



  function transformTwoOptions(opt, transform1, transform2, key1, key2){
    const reversed1 = Object.fromEntries(
      Object.entries(transform1).map(([key, value]) => [value, key])
    );

    const reversed2 = Object.fromEntries(
      Object.entries(transform2).map(([key, value]) => [value, key])
    );

    const newOpt = { ...opt };

    newOpt[key1] = reversed1[newOpt[key1]];
    newOpt[key2] = reversed2[newOpt[key2]]; 

  return newOpt;

  }

  function transformThreeOptions(opt, transform1, transform2, transform3, key1, key2, key3){
    const reversed1 = Object.fromEntries(
      Object.entries(transform1).map(([key, value]) => [value, key])
    );

    const reversed2 = Object.fromEntries(
      Object.entries(transform2).map(([key, value]) => [value, key])
    );

    const reversed3 = Object.fromEntries(
      Object.entries(transform3).map(([key, value]) => [value, key])
    );

    const newOpt = { ...opt };

    newOpt[key1] = reversed1[newOpt[key1]];
    newOpt[key2] = reversed2[newOpt[key2]]; 
    newOpt[key3] = reversed3[newOpt[key3]]; 

  return newOpt;

  }

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

        else if (areaDropdown.value == "geojsons_simplified/daily_grid_emission_profiles/daily_grid_emission_profile_hour0.geojson" ){
          const selected = transformOneOptions(selectedHourlyEmissionsOptions, transformHourlyDict, "Hour of Day")
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
  updateLabels,
  updateLabels2, 
  convertDropdownIdToLabel,  
};

