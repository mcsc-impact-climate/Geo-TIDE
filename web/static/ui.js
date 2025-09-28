import {
  geojsonTypes,
  availableGradientAttributes,
  selectedGradientAttributes,
  legendLabels,
  truckChargingOptions,
  selectedTruckChargingOptions,
  stateSupportOptions,
  selectedStateSupportOptions,
  tcoOptions,
  selectedTcoOptions,
  emissionsOptions,
  selectedEmissionsOptions,
  gridEmissionsOptions,
  hourlyEmissionsOptions,
  selectedGridEmissionsOptions,
  faf5Options,
  selectedFaf5Options,
  zefOptions,
  selectedZefOptions,
  zefSubLayerOptions,
  selectedZefSubLayers,
  fuelLabels,
  dataInfo,
  selectedGradientTypes,
} from './name_maps.js';
import {
  updateSelectedLayers,
  updateLegend,
  updateLayer,
  data,
  removeLayer,
  loadLayer,
  toggleZefSubLayer,
  layerCache,
  getAttributesForLayer,
  updateLabels,
  updateLabels2, 
  convertDropdownIdToLabel,  
} from './map.js';
import { geojsonNames } from './main.js';
import { isPointLayer, isLineStringLayer, isPolygonLayer } from './styles.js';

// Mapping of state abbreviations to full state names
const stateNames = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};
const zoneNames = ['US-CAL-BANC', 'US-CAL-CISO', 'US-CAL-LDWP', 'US-CAL-TIDC', 'US-CAR-CPLE', 'US-CAR-CPLW', 'US-CAR-DUK', 'US-CAR-SC', 'US-CAR-SCEG', 'US-CENT-SPA', 'US-CENT-SWPP', 'US-FLA-FMPP', 'US-FLA-FPC', 'US-NW-NWMT', 'US-FLA-GVL', 'US-FLA-JEA', 'US-SW-WALC', 'US-FLA-TAL', 'US-FLA-TEC', 'US-HI-OA', 'US-MIDA-PJM', 'US-MIDW-AECI', 'US-MIDW-MISO', 'US-MIDW-LGEE', 'US-NE-ISNE', 'US-NW-BPAT', 'US-NW-CHPD', 'US-NW-DOPD', 'US-NW-GCPD', 'US-NW-GRID', 'US-SW-AZPS', 'US-NW-IPCO', 'US-NW-NEVP', 'US-FLA-FPL', 'US-NW-PACE', 'US-NW-PACW', 'US-NW-PGE', 'US-NW-PSCO', 'US-NW-PSEI', 'US-NW-TPWR', 'US-NW-WACM', 'US-NY-NYIS', 'US-SE-SOCO', 'US-SW-EPE', 'US-SW-SRP', 'US-SW-PNM', 'US-SW-TEPC', 'US-TEN-TVA', 'US-TEX-ERCO', 'US-NW-SCL']

window.lastClickWasMoreButton = false;
const areaLayerDropdown = document.getElementById('area-layer-dropdown');

function populateLayerDropdown(mapping) {
  const highwayFlowContainer = document.getElementById('highway-flow-checkboxes');
  const highwayInfraContainer = document.getElementById('highway-infra-checkboxes');
  const pointH2prodContainer = document.getElementById('point-h2prod-checkboxes');
  const pointRefuelContainer = document.getElementById('point-refuel-checkboxes');
  const pointOtherContainer = document.getElementById('point-other-checkboxes');
  // Clear existing options and checkboxes
  areaLayerDropdown.innerHTML = '';
  highwayFlowContainer.innerHTML = '';
  highwayInfraContainer.innerHTML = '';
  pointH2prodContainer.innerHTML = '';
  pointRefuelContainer.innerHTML = '';
  pointOtherContainer.innerHTML = '';

  // Make a 'None' option for area feature in case the user doesn't want one
  const option = document.createElement('option');
  option.value = 'None';
  option.textContent = 'None';
  areaLayerDropdown.appendChild(option);

  // Add options for area layers
  for (const key in mapping) {
    if (!geojsonTypes[key]) {
      continue;
    }
    if (geojsonTypes[key] === 'area') {
      const option = document.createElement('option');
      option.value = mapping[key];
      option.textContent = key;
      areaLayerDropdown.appendChild(option);
    } else if (geojsonTypes[key][0] === 'highway') {
      // Add checkboxes for highway layers
      if (geojsonTypes[key][1] === 'flow') {
        addLayerCheckbox(key, mapping[key], highwayFlowContainer);
      } else if (geojsonTypes[key][1] === 'infra') {
        addLayerCheckbox(key, mapping[key], highwayInfraContainer);
      }
    } else if (geojsonTypes[key][0] === 'point') {
      // Add checkboxes for point layers
      if (geojsonTypes[key][1] === 'refuel') {
        addLayerCheckbox(key, mapping[key], pointRefuelContainer);
      } else if (geojsonTypes[key][1] === 'h2prod') {
        addLayerCheckbox(key, mapping[key], pointH2prodContainer);
      } else if (geojsonTypes[key][1] === 'other') {
        addLayerCheckbox(key, mapping[key], pointOtherContainer);
      }
    }
  }
}
function addLayerCheckbox(key, value, container) { 
  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkbox-container'); // Add this line

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = value;
  checkbox.id = `${key}-checkbox`; // Unique ID for the checkbox
  checkboxContainer.appendChild(checkbox);

  const label = document.createElement('label');
  label.setAttribute('for', `${key}-checkbox`);
  label.textContent = key;
  label.style.color = 'var(--theme-foreground, #020618)'; 
  label.style.font = 'var(--font-family-sans, Inter)';
  label.style.fontSize = 'var(--font-size-sm, 0.875rem)';
  label.style.fontStyle = 'normal';
  label.style.fontWeight = 'var(--font-weight-normal, 400)';
  label.style.lineHeight = 'var(--font-leading-5, 1.25rem)'; 
  label.style.letterSpacing = 'var(--font-tracking-normal, 0rem)';
      
  checkboxContainer.appendChild(label);

  container.appendChild(checkboxContainer);

  // New button creation
  const detailsButton = document.createElement('button');
  detailsButton.textContent = 'More';
  detailsButton.setAttribute('data-key', key);
  detailsButton.classList.add('details-btn');
  checkboxContainer.appendChild(detailsButton);
}

function isCheckboxLayerVisible(layerName) {
  // Find the checkbox by its label (the text next to the checkbox)
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:not(.zef-sub-layer-checkbox)'
  );
  for (const checkbox of checkboxes) {
    const label = checkbox.nextSibling.textContent;
    if (label === layerName) {
      return checkbox.checked; // Return true if checked
    }
  }
  return false; // Not found or not checked
}

function getSelectedLayers() {
  const selectedLayerNames = [];

  // Select all checkboxes except those created from `addSubLayerCheckbox`
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:not(.zef-sub-layer-checkbox)'
  );

  // Get selected checkboxes
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedLayerNames.push(checkbox.nextSibling.textContent); // Get the label text
    }
  });

  // Get the selected area layer from the dropdown
  for (const option of areaLayerDropdown.options) {
    if (option.selected && option.text !== 'None') {
      selectedLayerNames.push(option.text);
    }
  }

  // Get selected uploaded layers
  const userFilesLayerDropdown = document.getElementById('usefiles-data-ajax');
  const uploadedLayers = Array.from(userFilesLayerDropdown.selectedOptions).map(
    (option) => option.value
  );
  selectedLayerNames.push(...uploadedLayers);

  return selectedLayerNames;
}

const details_button = document.getElementById('area-details-button');

areaLayerDropdown.addEventListener('change', function () {
  if (this.value === 'None') {
    details_button.style.visibility = 'hidden';
  } else {
    details_button.style.visibility = 'visible';
  }
});

function getSelectedLayersValues() {
  const selectedLayerValues = new Map();
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');

  // Get selected checkboxes
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      // print(checkbox)
      selectedLayerValues.set(checkbox.nextSibling.textContent, checkbox.value); // Get the label text
    }
  });

  // Get the selected area layer from the dropdown
  for (const option of areaLayerDropdown.options) {
    if (option.selected && option.text !== 'None') {
      selectedLayerValues.set(option.text, option.value); // Push the text of the selected option
    }
  }
  return selectedLayerValues;
}

// Add event listener to the parent element of the buttons
document.getElementById('layer-selection').addEventListener('click', function (event) {
  if (event.target.classList.contains('toggle-button')) {
    const targetId = event.target.getAttribute('data-target');
    const target = document.getElementById(targetId);

    if (target.style.display === 'none') {
      target.style.display = 'block';
    } else {
      target.style.display = 'none';
    }
  }
});
let first_time = true; 
document.getElementById('layer-selection').addEventListener('click', function (event) {
  
  const button = event.target.closest('.show-button');
  
  if (button) {
    const targetId = button.getAttribute('data-target');
    const target = document.getElementById(targetId);
    const svg = button.querySelector('svg path');

    if (first_time && targetId == "point-other-checkboxes"){
      updateLabels2("default", "Savings from Pooled Charging Infrastructure", "", "", {});
      first_time = false; 
    }

    if (target.style.display === 'none') {
      target.style.display = 'block';
      svg.setAttribute('d', "M12 10L8 6L4 10");
      if (targetId == "point-other-checkboxes"){
        document.getElementById("public-2").style.display = 'block'; 
      }

    } else {
      target.style.display = 'none';
      svg.setAttribute('d', "M4 6L8 10L12 6");
      if (targetId == "point-other-checkboxes"){
        document.getElementById("public-2").style.display = 'none'; 
      }
    }
  }
  
});

let maintain = {} 
// Function to get the selected area layer's name based on its value
function getAreaLayerName(selectedValue) {
  const selectedOption = Array.from(areaLayerDropdown.options).find(
    (option) => option.value === selectedValue
  );

  return selectedOption ? selectedOption.textContent : '';
}

function getAreaLayerDetails(layerName) {
  // Fetch or compute details related to the 'layerName'.
  // Replace this with your logic to get area layer details.
  // For example, you can fetch data from an API or a database.
  return `Details about ${layerName}`;
}

async function createAttributeDropdown(key) {
  if (document.getElementById('attribute-dropdown')) return;

  let layerKey = key;

  // Map display name back to URL for uploaded layers
  if (Object.values(uploadedGeojsonNames).includes(layerKey)) {
    layerKey = Object.keys(uploadedGeojsonNames).find(
      (url) => uploadedGeojsonNames[url] === layerKey
    );
  }

  // If uploaded, resolve the actual URL from uploadedGeojsonNames
  if (uploadedGeojsonNames.hasOwnProperty(key)) {
    // Search uploadedGeojsonNames for matching display name
    for (const [url, name] of Object.entries(uploadedGeojsonNames)) {
      if (name === key) {
        layerKey = url; // Use the actual URL as the key
        break;
      }
    }
  }

  const attributeDropdownContainer = document.createElement('div');
  attributeDropdownContainer.classList.add('dropdown-container');

  const label = document.createElement('label');
  label.setAttribute('for', 'attribute-dropdown');
  label.textContent = 'Gradient Attribute: ';

  const attributeDropdown = document.createElement('select');
  attributeDropdown.id = 'attribute-dropdown';

  let attributeNames = [];
  const cachedKey = Object.keys(layerCache).find((cacheKey) =>
    cacheKey.startsWith(layerKey.split('?')[0])
  );
  if (layerKey in availableGradientAttributes) {
    // Persistent layer
    attributeNames = availableGradientAttributes[layerKey];
  } else if (cachedKey) {
    layerKey = cachedKey; // Use the cached key
    attributeNames = getAttributesForLayer(layerKey);
  } else {
    console.log(`Layer ${layerKey} not loaded. Loading now...`);
    await loadLayer(layerKey); // Load uploaded layer
    attributeNames = getAttributesForLayer(layerKey); // Fetch attributes
  }

  // Populate dropdown
  attributeNames.forEach((attributeName) => {
    const option = document.createElement('option');
    option.value = attributeName;
    option.text =
      layerKey in availableGradientAttributes
        ? legendLabels[layerKey][attributeName]
        : attributeName;
    if (selectedGradientAttributes[layerKey] === attributeName) {
      option.selected = true;
    }
    attributeDropdown.appendChild(option);
  });

  attributeDropdown.addEventListener('change', async function () {
    selectedGradientAttributes[layerKey] = attributeDropdown.value;

    // Assign gradient type based on geometry
    const layer = layerCache[layerKey];
    if (layer) {
      if (isPolygonLayer(layer)) {
        selectedGradientTypes[layerKey] = 'color';
      } else if (isLineStringLayer(layer)) {
        selectedGradientTypes[layerKey] = 'size';
      } else if (isPointLayer(layer)) {
        selectedGradientTypes[layerKey] = 'size';
      }
    }

    await updateLayer(layerKey, selectedGradientAttributes[layerKey]);
    updateLegend();
  });

  attributeDropdownContainer.appendChild(label);
  attributeDropdownContainer.appendChild(attributeDropdown);
  const modalContent = document.querySelector('.modal-content');
  modalContent.appendChild(attributeDropdownContainer);
}

function createDropdown(
  name,
  parameter,
  dropdown_label,
  key,
  options_list,
  selected_options_list,
  filename_creation_function
) {
  const options = options_list[parameter];

  // Prevent duplicate dropdowns
  if (document.getElementById(`${name}-dropdown`)) return;

  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown-container'); // << apply new standard class

  const label = document.createElement('label');
  label.setAttribute('for', `${name}-dropdown`);
  label.textContent = dropdown_label;

  const dropdown = document.createElement('select');
  dropdown.id = `${name}-dropdown`;
  dropdown.classList.add('dropdown'); // Optional: style <select> directly if needed

  // Create and add options to the dropdown
  for (const this_option in options) {
    if (options.hasOwnProperty(this_option)) {
      const option = document.createElement('option');
      option.value = options[this_option]; // Use the key as the value
      option.text = this_option; // Use the corresponding value as the text
      if (selected_options_list[parameter] === option.value) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    }
  }

  // Add an event listener to the dropdown to handle attribute selection
  dropdown.addEventListener('change', async function () {
    const dropdownId = event.target.id;
    const selectedText = dropdown.options[dropdown.selectedIndex].text; 
    selected_options_list[parameter] = dropdown.value;
    maintain[convertDropdownIdToLabel(dropdownId)] = selectedText; 
    // Check if the layer is visible on the map
    if (key !== 'National ZEF Corridor Strategy') {
      // Skip visibility check for ZEF, which is not an actual layer
      const layerObj = layerCache[key];
      const area_attribute_list = ["Truck Imports and Exports", "Grid Emission Intensity"
        , "Hourly Grid Emissions" , "State-Level Incentives and Regulations", "Lifecycle Truck Emissions", 
        "Total Cost of Truck Ownership"
       ]; 
      const other_points_list = ["Savings from Pooled Charging Infrastructure"]; 
      if (area_attribute_list.includes(key)){
        updateLabels("m", key, selectedText, dropdownId, maintain); 
      }
      else if (other_points_list.includes(key)){
        updateLabels2("m", key, selectedText, dropdownId, maintain); 
      }
      if (!layerObj || !layerObj.getVisible()) {
        console.log("Exiting early as the layer isn't yet visible on the map");
        return;
      }    
    }

    // Proceed with reloading or updating layers
    if (key === 'National ZEF Corridor Strategy') {
      selectedZefOptions['Phase'] = selected_options_list['Phase'];

      // Remove all sublayers across all phases
      for (let phase = 1; phase <= 4; phase++) {
        ['Corridors', 'Facilities', 'Hubs'].forEach((sub) => {
          removeLayer(`ZEF Corridor Strategy Phase ${phase} ${sub}`);
        });
      }

      // Force re-load of new phase's selected sublayers
      await updateSelectedLayers();
      updateLegend();
    } else {
      // Non-ZEF layers
      await removeLayer(key);
      await loadLayer(key, `${STORAGE_URL}${filename_creation_function(selected_options_list)}`);
      await updateSelectedLayers();

      // For State-Level Incentives, update legend labels
      if (key === 'State-Level Incentives and Regulations') {
        for (const fuel_type in legendLabels[key]) {
          legendLabels[key][fuel_type] =
            convertToTitleCase(selectedStateSupportOptions['Support Target']) +
            ' ' +
            convertToTitleCase(selectedStateSupportOptions['Support Type']) +
            ' (' +
            fuelLabels[fuel_type] +
            ')';
        }
      }
    }

    await updateSelectedLayers();
    await updateLegend();
  });

  // Append the label and dropdown to the container
  dropdownContainer.appendChild(label);
  dropdownContainer.appendChild(dropdown);

  // Append the container to the modal content
  const modalContent = document.querySelector('.modal-content');
  modalContent.appendChild(dropdownContainer);
}

function convertToTitleCase(str) {
  const words = str.split('_');
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  const titleCaseString = capitalizedWords.join(' ');
  return titleCaseString;
}

function createTruckChargingFilename(selected_options_list) {
  return (
    'geojson_files/infrastructure_pooling_thought_experiment/' +
    'Truck_Stop_Parking_Along_Interstate_with_min_chargers_range_' +
    selected_options_list['Range'] +
    '_chargingtime_' +
    selected_options_list['Charging Time'] +
    '_maxwait_' +
    selected_options_list['Max Allowed Wait Time'] +
    '.geojson'
  );
}

function createStateSupportFilename(selected_options_list) {
  return (
    'geojson_files/incentives_and_regulations/' +
    selected_options_list['Support Target'] +
    '_' +
    selected_options_list['Support Type'] +
    '.geojson'
  );
}

function createStateSupportCSVFilename(selected_options_list) {
  return (
    selected_options_list['Support Target'] +
    '_' +
    selected_options_list['Support Type'] +
    '.geojson'
  );
}

function createTcoFilename(selected_options_list) {
  return (
    'geojson_files/costs_and_emissions_new/' +
    'costs_per_mile_payload' +
    selected_options_list['Average Payload'] +
    '_avVMT' +
    selected_options_list['Average VMT'] +
    '_maxChP' +
    selected_options_list['Max Charging Power'] +
    '_avRange' +
    selected_options_list['Design Range'] +
    '.geojson'
  );
}

function createEmissionsFilename(selected_options_list) {
  console.log('geojson_files/costs_and_emissions_new/state_' +
              //    selected_options_list['Visualize By'] +
                  'emissions_per_mile_payload' +
                  selected_options_list['Average Payload'] +
                  '_avVMT' +
                  selected_options_list['Average VMT'] +
                  '_avRange' +
                  selected_options_list['Design Range'] +
                  '.geojson')
  return (
    'geojson_files/costs_and_emissions_new/state_' +
//    selected_options_list['Visualize By'] +
    'emissions_per_mile_payload' +
    selected_options_list['Average Payload'] +
    '_avVMT' +
    selected_options_list['Average VMT'] +
    '_avRange' +
    selected_options_list['Design Range'] +
    '.geojson'
  );
}

function createGridEmissionsFilename(selected_options_list) {
  return (
    'geojson_files/grid_emission_intensity/' +
    selected_options_list['Visualize By'] +
    '_merged.geojson'
  );
}

function createFaf5Filename(selected_options_list) {
  return (
    'geojson_files/faf5_freight_flows/mode_truck_commodity_' +
    selected_options_list['Commodity'] +
    '_origin_all_dest_all.geojson'
  );
}

function createZefFilenames(selected_options_list) {
  const phase = selected_options_list['Phase'];

  let filenames = [];
  let layerNames = [];

  if (selectedZefSubLayers['Corridors']) {
    filenames.push(
      `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Corridors.geojson`
    );
    layerNames.push(`ZEF Corridor Strategy Phase ${phase} Corridors`);
  }
  if (selectedZefSubLayers['Facilities']) {
    filenames.push(
      `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Facilities.geojson`
    );
    layerNames.push(`ZEF Corridor Strategy Phase ${phase} Facilities`);
  }
  if (selectedZefSubLayers['Hubs']) {
    filenames.push(
      `${STORAGE_URL}geojson_files/ZEF_Corridor_Strategy/ZEF_Corridor_Strategy_Phase${phase}_Hubs.geojson`
    );
    layerNames.push(`ZEF Corridor Strategy Phase ${phase} Hubs`);
  }

  return { names: layerNames, urls: filenames };
}

function createDropdownGroup(dropdowns, key, options, selectedOptions, filenameFn) {
  dropdowns.forEach(([id, param, label]) => {
    createDropdown(id, param, label, key, options, selectedOptions, filenameFn);
  });
}

function createChargingDropdowns(key) {
  createDropdownGroup(
    [
      ['range', 'Range', 'Truck Range: '],
      ['chargingTime', 'Charging Time', 'Charging Time: '],
      ['maxWaitTime', 'Max Allowed Wait Time', 'Max Allowed Wait Time: '],
    ],
    key,
    truckChargingOptions,
    selectedTruckChargingOptions,
    createTruckChargingFilename
  );
}

function createStateSupportDropdowns(key) {
  createDropdownGroup(
    [
      ['support-type', 'Support Type', 'Support type: '],
      ['support-target', 'Support Target', 'Support target: '],
    ],
    key,
    stateSupportOptions,
    selectedStateSupportOptions,
    createStateSupportFilename
  );
}

function createTcoDropdowns(key) {
  createDropdownGroup(
    [
      ['average-payload', 'Average Payload', 'Average payload: '],
      ['average-vmt', 'Average VMT', 'Average VMT: '],
      ['charging-power', 'Max Charging Power', 'Max charging power: '],
      ['average-range', 'Design Range', 'Design Range: '],
    ],
    key,
    tcoOptions,
    selectedTcoOptions,
    createTcoFilename
  );
}

function createEmissionsDropdowns(key) {
  createDropdownGroup(
    [
      ['average-payload', 'Average Payload', 'Average payload: '],
      ['average-vmt', 'Average VMT', 'Average VMT: '],
//      ['visualize-by', 'Visualize By', 'Visualize by: '],
      ['average-range', 'Design Range', 'Design Range: '],
    ],
    key,
    emissionsOptions,
    selectedEmissionsOptions,
    createEmissionsFilename
  );
}

function createGridEmissionsDropdowns(key) {
  createDropdownGroup(
    [['visualize-by', 'Visualize By', 'Visualize by: ']],
    key,
    gridEmissionsOptions,
    selectedGridEmissionsOptions,
    createGridEmissionsFilename
  );
}

function createFaf5Dropdowns(key) {
  createDropdownGroup(
    [['commodity', 'Commodity', 'Commodity: ']],
    key,
    faf5Options,
    selectedFaf5Options,
    createFaf5Filename
  );
}

function createZefDropdowns(key) {
  // Ensure the dropdowns are only created for the National ZEF Corridor Strategy layer
  if (key !== 'National ZEF Corridor Strategy') {
    return;
  }

  // Create the Phase dropdown as before
  createDropdown(
    'phase',
    'Phase',
    'Phase: ',
    key,
    zefOptions,
    selectedZefOptions,
    createZefFilenames
  );

  // Create checkboxes for Corridors/Facilities/Hubs
  createZefSubLayerCheckboxes(key);
}

function createZefSubLayerCheckboxes(key) {
  // First, check if the modal is already displaying sub-layer checkboxes
  let existingContainer = document.querySelector('.zef-sub-layers-container');

  // If the sub-layer checkboxes already exist, **do not create them again**
  if (existingContainer) {
    return;
  }

  const container = document.createElement('div');
  container.classList.add('zef-sub-layers-container');

  const label = document.createElement('label');
  label.textContent = 'Show sub-layers:';
  container.appendChild(label);

  function addSubLayerCheckbox(subName) {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.style.display = 'inline-block';
    checkboxContainer.style.marginRight = '10px';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedZefSubLayers[subName];
    checkbox.id = `zef-${subName}-checkbox`;
    checkbox.classList.add('zef-sub-layer-checkbox');

    checkbox.addEventListener('change', async () => {
      const numChecked = Object.values(selectedZefSubLayers).filter(Boolean).length;

      if (numChecked === 1 && !checkbox.checked) {
        alert('At least one of Corridors/Facilities/Hubs must remain checked.');
        checkbox.checked = true;
        return;
      }

      selectedZefSubLayers[subName] = checkbox.checked;

      // Call function from map.js to update the layers
      await toggleZefSubLayer(subName, checkbox.checked);
    });

    const cbLabel = document.createElement('label');
    cbLabel.setAttribute('for', `zef-${subName}-checkbox`);
    cbLabel.textContent = subName;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(cbLabel);
    container.appendChild(checkboxContainer);
  }

  addSubLayerCheckbox('Corridors');
  addSubLayerCheckbox('Facilities');
  addSubLayerCheckbox('Hubs');

  // Append the container ONLY when necessary
  const modalContent = document.querySelector('.modal-content');
  modalContent.appendChild(container);
}

document.body.addEventListener('mousedown', function (event) {
  if (event.target.classList.contains('details-btn') && event.target.hasAttribute('data-key')) {
    window.lastClickWasMoreButton = true;
    event.stopPropagation(); // Stop bubbling
    event.preventDefault(); // Prevent default behavior (this helps with dropdown focus)
  }
});

document.body.addEventListener('click', function (event) {
  // Handle More button clicks
  if (event.target.classList.contains('details-btn') && event.target.hasAttribute('data-key')) {
    event.stopPropagation(); // Prevent dropdown toggle
    const key = event.target.getAttribute('data-key');

    // Reset the content of the modal
    resetModalContent();

    // Add a link for the user to download the geojson file
    let details_content = '';
    if (Object.values(uploadedGeojsonNames).includes(key)) {
      document.getElementById('details-content').innerHTML = '';
      document.getElementById('details-title').innerText = `${key} Details`;
      document.getElementById('details-modal').style.display = 'flex';

      createAttributeDropdown(key);
      return;
    }

    let url = `${STORAGE_URL}${geojsonNames[key]}`; // <-- Move this up here

    const dirs_with_multiple_geojsons = [
      'infrastructure_pooling_thought_experiment',
      'incentives_and_regulations',
      'grid_emission_intensity',
      'costs_and_emissions',
    ];

    let dir_has_multiple_geojsons = false;
    for (let i = 0; i < dirs_with_multiple_geojsons.length; i++) {
      if (url.includes(dirs_with_multiple_geojsons[i])) {
        dir_has_multiple_geojsons = true;
        break; // Exit the loop once a match is found
      }
    }

    if (dir_has_multiple_geojsons) {
      // Remove the geojson filename from the download url
      const lastSlashIndex = url.lastIndexOf('/');
      const base_directory = url.substring(0, lastSlashIndex);

      details_content =
        dataInfo[key] +
        '<br><br><a href=' +
        base_directory +
        '.zip>Link to download all geojson files</a> used to visualize this layer.';
    } else {
      details_content =
        dataInfo[key] +
        '<br><br><a href=' +
        url +
        '>Link to download the geojson file</a> used to visualize this layer.';
    }

    document.getElementById('details-content').innerHTML = details_content;

    document.getElementById('details-title').innerText = `${key} Details`;

    // Show the modal
    document.getElementById('details-modal').style.display = 'flex';

    // Create a dropdown menu to choose the gradient attribute
    if (uploadedGeojsonNames.hasOwnProperty(key) || key in availableGradientAttributes) {
      createAttributeDropdown(key);
    }

    // Create additional dropdown menus for the truck charging layer
    if (key === 'Savings from Pooled Charging Infrastructure') {
      createChargingDropdowns(key);
    }
    // Create a dropdown to select whether to the national zero-emission freight corridor strategy
    if (key === 'National ZEF Corridor Strategy') {
      createZefDropdowns(key);
    }
  }

  // Check if the close button of the modal was clicked
  if (event.target.classList.contains('close-btn')) {
    //|| event.target.parentElement.tagName === 'SELECT') {
    document.getElementById('details-modal').style.display = 'none';
  }
  // Also close the modal if the user clicks anywhere outside of it
  else {
    const modal = document.getElementById('details-modal');
    const modalContent = modal.querySelector('.modal-content');

    const isModalOpen = modal.style.display === 'flex';
    const clickedOutside = !modalContent.contains(event.target);

    //console.log("Outside click? ", isModalOpen && clickedOutside);

    // Prevent accidental close right after a More button click
    if (!window.lastClickWasMoreButton && isModalOpen && clickedOutside) {
      modal.style.display = 'none';
    }
  }

  // Always reset the flag at the end
  window.lastClickWasMoreButton = false;
});

document.getElementById('area-details-button').addEventListener('click', function (event) {
  event.stopPropagation(); // Prevent outside click handler from firing
  const selectedAreaLayer = areaLayerDropdown.value;
  if (selectedAreaLayer !== '') {
    // Fetch details based on the selected area layer
    const selectedAreaLayerName = getAreaLayerName(selectedAreaLayer);

    const details = getAreaLayerDetails(selectedAreaLayer);

    // Reset the content of the modal
    resetModalContent();

    // Add a link for the user to download the geojson file
    let url = `${STORAGE_URL}${geojsonNames[selectedAreaLayerName]}`;

    const dirs_with_multiple_geojsons = [
      'infrastructure_pooling_thought_experiment',
      'incentives_and_regulations',
      'grid_emission_intensity',
      'costs_and_emissions',
    ];

    let dir_has_multiple_geojsons = false;
    for (let i = 0; i < dirs_with_multiple_geojsons.length; i++) {
      if (url.includes(dirs_with_multiple_geojsons[i])) {
        dir_has_multiple_geojsons = true;
        break; // Exit the loop once a match is found
      }
    }
    let details_content = '';
    if (dir_has_multiple_geojsons) {
      // Remove the geojson filename from the download url
      const lastSlashIndex = url.lastIndexOf('/');
      const base_directory = url.substring(0, lastSlashIndex);

      details_content =
        dataInfo[selectedAreaLayerName] +
        '<br><br><a href=' +
        base_directory +
        '.zip>Link to download all geojson files</a> used to visualize this layer.';
    } else {
      details_content =
        dataInfo[selectedAreaLayerName] +
        '<br><br><a href=' +
        url +
        '>Link to download the geojson file</a> used to visualize this layer.';
    }

    document.getElementById('details-content').innerHTML = details_content;

    document.getElementById('details-title').innerText = `${selectedAreaLayerName} Details`;

    // Show the modal
    document.getElementById('details-modal').style.display = 'flex';

    // Create a dropdown menu to choose attributes for the area layer
    if (selectedAreaLayerName in availableGradientAttributes) {
      createAttributeDropdown(selectedAreaLayerName);
    }

    // Create a dropdown if needed for state-level incentives and support
    if (selectedAreaLayerName === 'State-Level Incentives and Regulations') {
      createStateSupportDropdowns(selectedAreaLayerName);
    }

    // Create a dropdown if needed for state-level TCO
    if (selectedAreaLayerName === 'Total Cost of Truck Ownership') {
      createTcoDropdowns(selectedAreaLayerName);
    }

    // Create a dropdown if needed for state-level TCO
    if (selectedAreaLayerName === 'Lifecycle Truck Emissions') {
      createEmissionsDropdowns(selectedAreaLayerName);
    }
    // Create a dropdown to select whether to view grid emission by state or balancing authority
    if (selectedAreaLayerName === 'Grid Emission Intensity') {
      createGridEmissionsDropdowns(selectedAreaLayerName);
    }
    // Create a dropdown to select whether to view truck imports and exports
    if (selectedAreaLayerName === 'Truck Imports and Exports') {
      createFaf5Dropdowns(selectedAreaLayerName);
    }
  }
});

function getAttributeNamesForFeature(layerName) {
  if (uploadedGeojsonNames.hasOwnProperty(layerName)) {
    return getAttributesForLayer(layerName); // Extract dynamically
  } else if (layerName in availableGradientAttributes) {
    return availableGradientAttributes[layerName];
  } else {
    return [];
  }
}

function updatePlotAndLegend(key) {
  updateLayer(key, selectedGradientAttributes[key]);
  updateLegend();
}

// Sample implementation of getDetails function
function getDetails(key) {
  // Fetch or compute details related to the 'key'.
  // For the simplicity of this example, returning a static text.
  //return `Details about ${key}`;
  return '';
}

function resetModalContent() {
  const modalContent = document.querySelector('.modal-content');

  // Remove all standardized dropdown containers
  const dropdowns = modalContent.querySelectorAll('.dropdown-container');
  dropdowns.forEach((el) => modalContent.removeChild(el));

  // Remove ZEF sub-layer checkboxes container if it exists
  const zefSubLayerContainer = modalContent.querySelector('.zef-sub-layers-container');
  if (zefSubLayerContainer) {
    modalContent.removeChild(zefSubLayerContainer);
  }
}

// Shows the popup when clicking on hourly emissions map
async function showHourlyGridEmissions(zoneName, properties, layerName) {
  const modal = document.getElementById('hourly-grid-emissions-modal');
  const content = document.getElementById('hourly-grid-emissions-content');

  const hourlyCsvFileName = `${zoneName}_avg_std_dist.csv`  // 24 hour chart
  const dailyCsvFileName = `${zoneName}_daily_avg_std.csv`  // over the years
  const weeklyCsvFileName = `${zoneName}_weekly_summary.csv` 
  // HTML for display
  content.innerHTML = `
  <span class="close-hourly-grid-emissions">&times;</span>
  <h1>Hourly & Weekly Grid Emissions for ${zoneName} from ---</h1>
  <div class="graph-wrapper">
    <div class="chart-container">
        <canvas id="emissionsChart"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="dailyEmissionsChart"></canvas>
    </div>
    <p style="font-size: 0.9em; color: #555; margin-top: 1em;">
    Data sources: <code>${CSV_URL_HOURLYEMISSIONS}${hourlyCsvFileName}</code> and <code>${CSV_URL_DAILYEMISSIONS}${dailyCsvFileName}</code>
    </p>

</div>

  <p>Data sources for <strong>${zoneName}</strong>:<br>
  <a href="${CSV_URL_HOURLYEMISSIONS}${hourlyCsvFileName}" target="_blank">24 Hour Grid Emissions (${hourlyCsvFileName})</a><br>
  <a href="${CSV_URL_DAILYEMISSIONS}${dailyCsvFileName}" target="_blank">Yearly Grid Emissions by Day (${dailyCsvFileName})</a><br>
  <a href="${CSV_URL_WEEKLYEMISSIONS}${weeklyCsvFileName}" target="_blank">Yearly Grid Emissions by Week (${weeklyCsvFileName})</a>

  </p>
`;
  try {
    const fileUrl = `${CSV_URL_HOURLYEMISSIONS}${hourlyCsvFileName}`;
    console.log("Fetching CSV from:", fileUrl);  // Logs the full URL

    const response = await fetch(`${CSV_URL_HOURLYEMISSIONS}${hourlyCsvFileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();

    // Parse CSV data (using PapaParse or manual processing)
    const data = Papa.parse(csvText, { header: true }).data; // Ensure PapaParse is included in project

    // Extract relevant data for the graph, daily
    const labels = data.map(row => row.datetime); // Column for time of day, called datetime in csv
    const emissions = data.map(row => parseFloat(row.mean)); // Column for mean emissions, called mean in csv
    const hourlystd = data.map(row => parseFloat(row.std));

    const hourly_upperBound = emissions.map((val, i) => val + hourlystd[i]); //values that will become shaded region
    const hourly_lowerBound = emissions.map((val, i) => val - hourlystd[i]);

    //hourly emissions
    const dailyResponse = await fetch(`${CSV_URL_DAILYEMISSIONS}${dailyCsvFileName}`);
    console.log(`${CSV_URL_DAILYEMISSIONS}${dailyCsvFileName}`)
    if (!dailyResponse.ok) throw new Error(`Failed to fetch daily CSV: ${dailyResponse.statusText}`);
    const dailyCsvText = await dailyResponse.text();
    const dailyData = Papa.parse(dailyCsvText, { header: true }).data;
    console.log(dailyData)
    const dailyLabels = dailyData.map(row => row.datetime);
    const dailyEmissions = dailyData.map(row => parseFloat(row.mean));

    // get the date range
    const firstDate = new Date(dailyData[0].datetime);
    const lastDate = new Date(dailyData[dailyData.length - 2].datetime);

    const formatDateDisplay = (date) => date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const dateRangeString = `${formatDateDisplay(firstDate)} to ${formatDateDisplay(lastDate)}`;
    const titleElement = content.querySelector('h1');
    titleElement.textContent = `Hourly & Weekly Grid Emissions for ${zoneName} from ${dateRangeString}`;
    
    // downloads and parses weekly csv file
      const weeklyPercentileResponse = await fetch(`${CSV_URL_WEEKLYEMISSIONS}${weeklyCsvFileName}`);
      if (!weeklyPercentileResponse.ok) throw new Error(`Failed to fetch weekly percentile CSV: ${weeklyPercentileResponse.statusText}`);
      const weeklyCsvText = await weeklyPercentileResponse.text();
      const weeklyParsedData = Papa.parse(weeklyCsvText, { header: true }).data;
    

    // Remove the loading indicator
    content.querySelector('p').remove();
const graphWrapper = document.querySelector(".graph-wrapper");



    // Render the hourly emissions chart
    const ctx = document.getElementById('emissionsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Emissions for ${zoneName}`,
          data: emissions,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 1,
        },
        {
          label: 'Mean + 1σ',
          data: hourly_upperBound,
          borderColor: 'rgba(181, 245, 245, 0.5)',
          borderWidth: 1,
          backgroundColor: 'rgba(181, 245, 245, 0.2)'
        },
        {
          label: 'Mean - 1σ',
          data: hourly_lowerBound,
          borderColor: 'rgba(181, 245, 245, 0.5)',
          borderWidth: 1,
          fill: '-1', // Shaded area between upper and lower bounds
          backgroundColor: 'rgba(181, 245, 245, 0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, //get the graph to fit the popup
        plugins: {
          title: {
            display: true,
            text: '24 Hour Average Grid Emissions', // Title for hourly chart
            font: { size: 18 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hour of the Day'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Emissions (gCO₂e/kWh)' //is this right units
            }
          }
        }
      }
    });
  


//Weekly over the year
// Extract data
const weekLabels = weeklyParsedData.map(row => row.week);
const weeklyMean = weeklyParsedData.map(row => parseFloat(row.mean));
//const p5 = weeklyParsedData.map(row => parseFloat(row["5%"]));  //conts for percentile
//const p95 = weeklyParsedData.map(row => parseFloat(row["95%"]));
const weeklyStd   = weeklyParsedData.map(row => {
  const v = parseFloat(row.std ?? row.STD ?? row.standard_deviation);
  return Number.isFinite(v) ? v : 0; // if missing
});

// shading on chart
const weeklyUpper = weeklyMean.map((m, i) => m + weeklyStd[i]);
const weeklyLower = weeklyMean.map((m, i) => m - weeklyStd[i]);

// Render new chart
const ctxWeeklyPercentile = document.getElementById('dailyEmissionsChart').getContext('2d');

new Chart(ctxWeeklyPercentile, {
  type: 'line',
  data: {
    labels: weekLabels,
    datasets: [
      {
        label: 'Weekly Mean Emissions',
        data: weeklyMean,
        borderColor: 'blue',
        borderWidth: 2,
        tension: 0.3,
        fill: false
      },
      {
        label: 'Mean + 1σ',
        data: weeklyUpper,
        borderColor: 'rgba(100, 100, 255, 0)',
        backgroundColor: 'rgba(100, 100, 255, 0.2)',
        fill: '-1'
      },
      {
        label: 'Mean - 1σ',
        data: weeklyLower,
        borderColor: 'rgba(100, 100, 255, 0)',
        backgroundColor: 'rgba(100, 100, 255, 0.2)',
        fill: '-1'
      }
      /*{
        label: '5th Percentile',                        //for percentiles
        data: p5,
        borderColor: 'rgba(100, 100, 255, 0)',
        backgroundColor: 'rgba(100, 100, 255, 0.2)',
        fill: '-1'
      },
      {
        label: '95th Percentile',
        data: p95,
        borderColor: 'rgba(100, 100, 255, 0)',
        backgroundColor: 'rgba(100, 100, 255, 0.2)',
        fill: '-1'
      }*/
    ]
  },
  
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Weekly Mean & Percentile Range',
        font: { size: 18 }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Week Starting Date' },
      ticks: {
        callback: function(value, index) {
          // Only show every 2nd label (adjust number as needed)
          return index % 8 === 0 ? this.getLabelForValue(value) : '';
        }
      }


      },
      y: {
        title: { display: true, text: 'Emissions (gCO₂e/kWh)' }
      }
    }
  }
});

/*

// Function to group data by week and compute averages
function aggregateByWeek(data) {
  const weeklyData = {};
  //console.log(data);
  data.forEach(row => {
    const date = new Date(row.datetime);
    const weekStartDate = getMondayOfWeek(date); // Get the first day (Monday) of the week
    const formattedDate = formatDate(weekStartDate); // Format the date

    if (!weeklyData[formattedDate]) {
      weeklyData[formattedDate] = { sum: 0, count: 0, stdSum: 0 };
    }
    
    weeklyData[formattedDate].sum += parseFloat(row.mean);
    weeklyData[formattedDate].stdSum += parseFloat(row.std); 
    weeklyData[formattedDate].count++;
  });

  const weeklyLabels = Object.keys(weeklyData).sort((a, b) => new Date(a) - new Date(b)); // Sort weeks chronologically
  const weeklyAverages = weeklyLabels.map(key => weeklyData[key].sum / weeklyData[key].count);
  const weeklyStdDev = weeklyLabels.map(key => weeklyData[key].stdSum / weeklyData[key].count);
  //console.log(weeklyData);
  
  return { weeklyLabels, weeklyAverages, weeklyStdDev };
}

// Function to get the first day (Monday) of a given date’s week
function getMondayOfWeek(date) {
  const newDate = new Date(date);
  const day = newDate.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(newDate.setDate(diff));
}

// Function to format the date as MM/DD/YYYY
function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString(undefined, options);
}

// Aggregate daily emissions into weekly averages with formatted labels
console.log(dailyData)
const { weeklyLabels, weeklyAverages, weeklyStdDev } = aggregateByWeek(dailyData);

// Calculate upper and lower bounds for standard deviation shading
const upperBound = weeklyAverages.map((val, i) => val + weeklyStdDev[i]);
const lowerBound = weeklyAverages.map((val, i) => val - weeklyStdDev[i]);


// Render weekly emissions chart
/* const ctxWeekly = document.getElementById('dailyEmissionsChart').getContext('2d');
new Chart(ctxWeekly, {
  type: 'line',
  data: {
    labels: weeklyLabels, // First day of each week (e.g., 01/01/2025)
    datasets: [
      {
        label: `Weekly Average Emissions for ${zoneName}`,
        data: weeklyAverages,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.4, // Smooths the line
        fill: false, 
      },
      {
        label: 'Standard Deviation: Upper Bound',
        data: upperBound,
        borderColor: 'rgba(255, 99, 132, 0)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: '-1',
      },
      {
        label: 'Standard Deviation: Lower Bound',
        data: lowerBound,
        borderColor: 'rgba(255, 99, 132, 0)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: '-1',
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Weekly Grid Emissions', // Title for weekly chart
        font: { size: 18 }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Week Starting Date' } },
      y: { title: { display: true, text: 'Weekly Average Emissions (gCO₂e/kWh)' } }
    }
  }
}); */

  } catch (error) {
    content.innerHTML += `<p>Error loading data: ${error.message}</p>`;
  }
  // Display the modal
  modal.style.display = 'flex';
  // event listener for the close button
  const closeButton = modal.querySelector('.close-hourly-grid-emissions');
  closeButton.onclick = function() {
    modal.style.display = 'none';
  };
  // Close the modal if the user clicks anywhere outside of the modal content
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}


async function showStateRegulations(stateAbbreviation, properties, layerName) {
  const modal = document.getElementById('regulations-modal');
  const content = document.getElementById('regulations-content');
  const selectedFuelType = selectedGradientAttributes['State-Level Incentives and Regulations'];

  const stateName = stateNames[stateAbbreviation] || stateAbbreviation;
  content.querySelector('h1').innerText = `Regulations and Incentives for ${stateName}`;
  content.querySelector('p').innerText = 'Click on targets to view more information.';
  let detailsHtml = '';
  /*   for (const key in properties) {
    if (properties.hasOwnProperty(key) && key !== 'geometry') {
      detailsHtml += `<p><strong>${key}</strong>: ${properties[key]}</p>`;
    }
  } */

  // Determine which CSV file(s) to fetch based on the selected layers
  const selectedLayerCombinations = getSelectedLayerCombinations(); // Adjust this function as necessary
  const csvFileNames = selectedLayerCombinations.map((layerCombo) => `${layerCombo}.csv`);

  const groupedData = {};

  // Fetch and display additional data from the corresponding CSV file(s)
  for (const csvFileName of csvFileNames) {
    try {
      const response = await fetch(`${CSV_URL_STATEREGULATIONS}${csvFileName}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const csvText = await response.text();
      const csvData = Papa.parse(csvText, { header: true }).data;

      // Extract support type and support target from the file name
      const [supportTarget, supportType1] = csvFileName
        .replace('.csv', '')
        .match(/^(.*)_(.*)$/)
        .slice(1);
      const supportType = supportType1.charAt(0).toUpperCase() + supportType1.slice(1);

      // Add support type and support target as columns to each row
      csvData.forEach((row) => {
        row.SupportType = supportType;
        row.SupportTarget = supportTarget;
      });

      // Filter the CSV data for the relevant state and fuel type
      let stateData =
        selectedFuelType === 'all'
          ? csvData.filter((row) => row.State === stateName)
          : csvData.filter(
              (row) =>
                row.State === stateName &&
                row.Types.split(', ').some((fuel) =>
                  fuel.toLowerCase().startsWith(selectedFuelType.toLowerCase())
                )
            );

      // Group data by Support Type and Support Target
      stateData.forEach((row) => {
        const supportType = selectedStateSupportOptions['Support Type'] || 'Unknown';
        const supportTarget = selectedStateSupportOptions['Support Target'] || 'Unknown';
        const fuels = row.Types ? row.Types.split(', ') : ['Unknown'];

        const normalizedSupportType =
          supportType === 'incentives_and_regulations'
            ? ['Incentives', 'Regulations']
            : [supportType.charAt(0).toUpperCase() + supportType.slice(1)];
        const targets =
          supportTarget === 'all'
            ? ['fuel_use', 'infrastructure', 'vehicle_purchase']
            : [supportTarget];
        const fuelType =
          selectedFuelType === 'all'
            ? ['fuel_use', 'infrastructure', 'vehicle_purchase']
            : [supportTarget];
        normalizedSupportType.forEach((type) => {
          if (!groupedData[type]) {
            groupedData[type] = {};
          }
          targets.forEach((target) => {
            if (!groupedData[type][target]) {
              groupedData[type][target] = {};
            }
            fuels.forEach((fuel) => {
              if (!groupedData[type][target][fuel]) {
                groupedData[type][target][fuel] = [];
              }
              //console.log(row)
              //groupedData[type][target][fuel].push(row);
              //console.log(type, target, fuel);
              //console.log(row.SupportType, row.SupportTarget, row.Types)
              if ((type == row.SupportType) & (target == row.SupportTarget))
                groupedData[row.SupportType][row.SupportTarget][fuel].push(row);
            });
          });
          //groupedData[row.SupportType][row.SupportTarget][fuel].push(row);
        });
      });
    } catch (error) {
      detailsHtml += `<p>Error loading additional data from ${csvFileName}: ${error.message}</p>`;
    }
  }

  // Generate HTML content based on the grouped data
  for (const supportType in groupedData) {
    if (Object.keys(groupedData[supportType]).length > 0) {
      let typeContent = ''; // Temporary variable to store the content for this support type
      for (const supportTarget in groupedData[supportType]) {
        let targetContent = ''; // Temporary variable to store the content for this support target
        for (const fuel in groupedData[supportType][supportTarget]) {
          if (
            groupedData[supportType][supportTarget][fuel].length > 0 &&
            (selectedFuelType === 'all' ||
              fuel.toLowerCase().startsWith(selectedFuelType.toLowerCase()))
          ) {
            let fuelContent = `<h4>${fuel}</h4><div class="fuel-content">`;
            groupedData[supportType][supportTarget][fuel].forEach((row) => {
              const nameHtml = row.Types.split(', ').length > 1 ? `<i>${row.Name}</i>` : row.Name;
              fuelContent += `<p>${nameHtml}: <a href="${row.Source}" target="_blank">${row.Source}</a></p>`;
            });
            fuelContent += `</div>`;
            targetContent += fuelContent;
          }
        }
        if (targetContent) {
          // Add the support target header and content if there are valid entries
          const supportTarget1 = supportTarget
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
          typeContent += `<h3 class="collapsible">Target: ${supportTarget1}</h3><div class="content">${targetContent}</div>`;
        }
      }
      if (typeContent) {
        // Add the support type header and content if there are valid entries
        detailsHtml += `<h2><ins>${supportType}</ins></h2>${typeContent}<div style="margin-bottom: 15px;"></div>`;
      }
    }
  }

  // Set the inner HTML
  content.innerHTML = `
  <span class="close-regulations">&times;</span>
  <h1>Regulations and Incentives for ${stateName}</h1>
  <p>Click on targets to view more information.</p>
  ${detailsHtml}
  <p><em>Italicized regulations and incentives benefit multiple fuel types and appear multiple times.</em></p>
`;
  modal.style.display = 'flex';

  const closeButton = modal.querySelector('.close-regulations');
  closeButton.onclick = function () {
    modal.style.display = 'none';
  };

  // Add collapsible functionality to only h3 elements
  document.querySelectorAll('h3.collapsible').forEach((header) => {
    header.addEventListener('click', function () {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (content.style.display === 'block') {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }
    });
  });
}

function getSelectedLayerCombinations() {
  const supportType = selectedStateSupportOptions['Support Type'];
  const supportTarget = selectedStateSupportOptions['Support Target'];

  //console.log(selectedStateSupportOptions)

  const combinations = [];

  // Define your logic to map selected layers to CSV file names
  // For example:
  if (supportType == 'incentives') {
    if (supportTarget == 'fuel_use') {
      combinations.push('fuel_use_incentives');
    } else if (supportTarget == 'infrastructure') {
      combinations.push('infrastructure_incentives');
    } else if (supportTarget == 'vehicle_purchase') {
      combinations.push('vehicle_purchase_incentives');
    } else if (supportTarget == 'all') {
      combinations.push('fuel_use_incentives');
      combinations.push('infrastructure_incentives');
      combinations.push('vehicle_purchase_incentives');
    }
  } else if (supportType == 'regulations') {
    if (supportTarget == 'fuel_use') {
      combinations.push('fuel_use_regulations');
    } else if (supportTarget == 'infrastructure') {
      combinations.push('infrastructure_regulations');
    } else if (supportTarget == 'vehicle_purchase') {
      combinations.push('vehicle_purchase_regulations');
    } else if (supportTarget == 'all') {
      combinations.push('fuel_use_regulations');
      combinations.push('infrastructure_regulations');
      combinations.push('vehicle_purchase_regulations');
    }
  } else if (supportType == 'incentives_and_regulations') {
    if (supportTarget == 'fuel_use') {
      combinations.push('fuel_use_regulations');
      combinations.push('fuel_use_incentives');
    } else if (supportTarget == 'infrastructure') {
      combinations.push('infrastructure_regulations');
      combinations.push('infrastructure_incentives');
    } else if (supportTarget == 'vehicle_purchase') {
      combinations.push('vehicle_purchase_regulations');
      combinations.push('vehicle_purchase_incentives');
    } else if (supportTarget == 'all') {
      combinations.push('fuel_use_regulations');
      combinations.push('fuel_use_incentives');
      combinations.push('infrastructure_regulations');
      combinations.push('infrastructure_incentives');
      combinations.push('vehicle_purchase_regulations');
      combinations.push('vehicle_purchase_incentives');
    }
  }
  //(combinations[0])
  return combinations;
}

export {
  populateLayerDropdown,
  getSelectedLayers,
  getSelectedLayersValues,
  showStateRegulations,
  getAreaLayerName,
  showHourlyGridEmissions,
  createZefFilenames,
};
