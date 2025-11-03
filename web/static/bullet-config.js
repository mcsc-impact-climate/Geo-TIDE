import { 
  selectedEmissionsOptions, 
  selectedTcoOptions, 
  selectedFaf5Options,
  selectedGridEmissionsOptions,
  selectedStateSupportOptions 
} from './name_maps.js';

export const BULLET_CONFIGS = {
  "Lifecycle Truck Emissions": {
    parameters: [
      {
        labelText: "average payload",
        labelHTML: "Average payload: ",
        dataKey: "Average Payload", 
        defaultValue: "40,000 lb",
        selectedOptionsRef: selectedEmissionsOptions
      },
      {
        labelText: "average vmt",
        labelHTML: "Average VMT: ",
        dataKey: "Average VMT",
        defaultValue: "100,000 miles", 
        selectedOptionsRef: selectedEmissionsOptions
      },
      {
        labelText: "average range",
        labelHTML: "Design Range: ",
        dataKey: "Design Range",
        defaultValue: "400 miles",
        selectedOptionsRef: selectedEmissionsOptions
      }
    ]
  },
  
  "Total Cost of Truck Ownership": {
    parameters: [
      {
        labelText: "average payload",
        labelHTML: "Average payload: ",
        dataKey: "Average Payload",
        defaultValue: "40,000 lb",
        selectedOptionsRef: selectedTcoOptions
      },
      {
        labelText: "average vmt", 
        labelHTML: "Average VMT: ",
        dataKey: "Average VMT",
        defaultValue: "100,000 miles",
        selectedOptionsRef: selectedTcoOptions
      },
      {
        labelText: "charging power",
        labelHTML: "Max charging power: ",
        dataKey: "Max Charging Power",
        defaultValue: "400 kW",
        selectedOptionsRef: selectedTcoOptions
      },
      {
        labelText: "average range",
        labelHTML: "Design Range: ",
        dataKey: "Design Range",
        defaultValue: "400 miles",
        selectedOptionsRef: selectedTcoOptions
      }
    ]
  },
  
  "Savings from Pooled Charging Infrastructure": {
    parameters: [
      {
        labelText: "range",
        labelHTML: "Truck Range: ",
        dataKey: "Truck Range",
        defaultValue: "250 miles",
        selectedOptionsRef: null
      },
      {
        labelText: "chargingtime",
        labelHTML: "Charging Time: ",
        dataKey: "Charging Time", 
        defaultValue: "4 hours",
        selectedOptionsRef: null
      },
      {
        labelText: "maxwaittime",
        labelHTML: "Max allowed wait time: ",
        dataKey: "Max Wait Time",
        defaultValue: "30 minutes",
        selectedOptionsRef: null
      }
    ]
  },
  
  "Truck Imports and Exports": {
    parameters: [
      {
        labelText: "commodity",
        labelHTML: "Commodity: ",
        dataKey: "Commodity",
        defaultValue: "All Commodities",
        selectedOptionsRef: selectedFaf5Options
      }
    ]
  },
  
  "Grid Emission Intensity": {
    parameters: [
      {
        labelText: "visualize by",
        labelHTML: "Visualize by: ",
        dataKey: "Visualize By",
        defaultValue: "State",
        selectedOptionsRef: selectedGridEmissionsOptions
      }
    ]
  },
  
  "Hourly Grid Emissions": {
    parameters: [
      {
        labelText: "hour of day",
        labelHTML: "Hour of day: ",
        dataKey: "Hour of Day",
        defaultValue: "12 PM",
        selectedOptionsRef: null
      }
    ]
  },
  
  "State-Level Incentives and Regulations": {
    parameters: [
      {
        labelText: "support type",
        labelHTML: "Support type: ",
        dataKey: "Support Type",
        defaultValue: "Incentives and Regulations",
        selectedOptionsRef: selectedStateSupportOptions
      },
      {
        labelText: "support target",
        labelHTML: "Support target: ",
        dataKey: "Support Target",
        defaultValue: "All Targets",
        selectedOptionsRef: selectedStateSupportOptions
      }
    ]
  }
};

export function convertDropdownIdToLabel(dropdownId) {
  let label = dropdownId.replace('-dropdown', '');
  label = label.replace(/-/g, ' ');
  label = label.toLowerCase();
  return label;
}

export function createBulletAttributes(layerKey, s, c, e, p) {
  const config = BULLET_CONFIGS[layerKey];
  if (!config) return "&&&&&&";
  
  const testData = { ...p };
  
  const bullets = config.parameters.map(param => {
    let value = testData[param.dataKey] || param.defaultValue;
    
    if (s !== "default" && convertDropdownIdToLabel(e) === param.labelText) {
      value = c;
    }
    
    if (param.labelText in testData) {
      value = testData[param.labelText];
    }
    
    const shouldShow = (value !== param.defaultValue);
    
    return {
      labelHTML: `<span>${param.labelHTML}</span>`,
      value: value,
      shouldShow: shouldShow
    };
  });
  
  let visibleBullets = bullets.filter(bullet => bullet.shouldShow);
  let resultParts = [];
  
  visibleBullets.forEach(bullet => {
    resultParts.push(bullet.labelHTML);
    resultParts.push(bullet.value);
  });
  
  return resultParts.join("&");
}