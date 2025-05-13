export const predefinedColors = ['#ff33a1', '#ffcc00', '#ffbf33', '#009e73'];

export let selectedGradientTypes = {
  'Truck Imports and Exports': 'color',
  'Grid Emission Intensity': 'color',
  'Hourly Grid Emissions': 'color',
  'Commercial Electricity Price': 'color',
  'Maximum Demand Charge (utility-level)': 'color',
  'Maximum Demand Charge (state-level)': 'color',
  'Highway Flows (SU)': 'size',
  'Highway Flows (CU)': 'size',
  'Highway Flows (Interstate)': 'size',
  'Operational Electrolyzers': 'size',
  'Installed Electrolyzers': 'size',
  'Planned Electrolyzers': 'size',
  'Hydrogen from Refineries': 'size',
  'State-Level Incentives and Regulations': 'color',
  'Savings from Pooled Charging Infrastructure': 'size',
  'Lifecycle Truck Emissions': 'color',
  'Total Cost of Truck Ownership': 'color',
  'Grid Generation and Capacity': 'color',
  'Energy Demand from Electrified Trucking': 'color',
};

export const availableGradientAttributes = {
  'Truck Imports and Exports': [
    'Tmil Tot D',
    'Tmil Imp D',
    'Tmil Exp D',
    'E Tot Den',
    'E Imp Den',
    'E Exp Den',
  ],
  'Grid Emission Intensity': ['CO2_rate'],
  'Hourly Grid Emissions': ['mean', 'std_up', 'std_down'],
  'Commercial Electricity Price': ['Cents_kWh'],
  'Maximum Demand Charge (utility-level)': ['MaxDemCh'],
  'Maximum Demand Charge (state-level)': ['Average Ma', 'Median Max', 'Max Maximu'],
  'Highway Flows (SU)': ['Tot Tons', 'Tot Trips'],
  'Highway Flows (CU)': ['Tot Tons', 'Tot Trips'],
  'Highway Flows (Interstate)': ['Tot Tons', 'Tot Trips'],
  'Operational Electrolyzers': ['Power_kW'],
  'Installed Electrolyzers': ['Power_kW'],
  'Planned Electrolyzers': ['Power_kW'],
  'Hydrogen from Refineries': ['Cap_MMSCFD'],
  'State-Level Incentives and Regulations': [
    'all',
    'Biodiesel',
    'Ethanol',
    'Electricit',
    'Hydrogen',
    'Natural Ga',
    'Propane',
    'Renewable',
  ], // 'Emissions'],
  'Savings from Pooled Charging Infrastructure': [
    'Tot Trips',
    'CPD',
    'Half_CPD',
    'Min_Charge',
    'Half_Charg',
    'Min_Ratio',
    'Half_Ratio',
    'Col_Save',
  ],
  'Lifecycle Truck Emissions': ['C_mi_tot', 'C_mi_grid'],
  'Total Cost of Truck Ownership': ['$_mi_tot', 'dies_tot', 'diff_tot', 'perc_tot'],
  'Grid Generation and Capacity': ['Ann_Gen', 'Cap_MW', 'Ann_Cap', 'Ann_Diff', 'Ann_Rat'],
  'Energy Demand from Electrified Trucking': ['An E Dem', 'Perc Gen', 'Perc Cap', 'Perc Diff'],
};

export let selectedGradientAttributes = {
  'Truck Imports and Exports': 'Tmil Tot D',
  'Grid Emission Intensity': 'CO2_rate',
  'Hourly Grid Emissions': 'mean',
  'Commercial Electricity Price': 'Cents_kWh',
  'Maximum Demand Charge (utility-level)': 'MaxDemCh',
  'Maximum Demand Charge (state-level)': 'Average Ma',
  'Highway Flows (SU)': 'Tot Tons',
  'Highway Flows (CU)': 'Tot Tons',
  'Highway Flows (Interstate)': 'Tot Tons',
  'Operational Electrolyzers': 'Power_kW',
  'Installed Electrolyzers': 'Power_kW',
  'Planned Electrolyzers': 'Power_kW',
  'Hydrogen from Refineries': 'Cap_MMSCFD',
  'State-Level Incentives and Regulations': 'all',
  'Savings from Pooled Charging Infrastructure': 'Tot Trips',
  'Lifecycle Truck Emissions': 'C_mi_tot',
  'Total Cost of Truck Ownership': '$_mi_tot',
  'Grid Generation and Capacity': 'Ann_Gen',
  'Energy Demand from Electrified Trucking': 'An E Dem',
};

export const legendLabels = {
  'Truck Imports and Exports': {
    'Tmil Tot D': 'Imports+Exports (ton-miles / sq mile)',
    'Tmil Imp D': 'Imports (ton-miles / sq mile)',
    'Tmil Exp D': 'Exports (ton-miles / sq mile)',
    'E Tot Den': 'Import+Export Emissions (tons CO2 / sq mile)',
    'E Imp Den': 'Import Emissions (tons CO2 / sq mile)',
    'E Exp Den': 'Export Emissions (tons CO2 / sq mile)',
  },
  'Grid Emission Intensity': { CO2_rate: 'CO2 intensity of power grid (lb/MWh)' },
  'Hourly Grid Emissions': {
    mean: 'CO2eq intensity of power grid [mean] (lb/MWh)',
    std_up: 'CO2eq intensity of power grid [mean + 1 stdev] (lb/MWh)',
    std_down: 'CO2eq intensity of power grid [mean - 1 stdev] (lb/MWh)',
  },
  'Commercial Electricity Price': { Cents_kWh: 'Electricity rate (cents/kWh)' },
  'Maximum Demand Charge (utility-level)': { MaxDemCh: 'Maximum Demand Charge by Utility ($/kW)' },
  'Maximum Demand Charge (state-level)': {
    'Average Ma': 'Average of Max Demand Charges over Utilities ($/kW)',
    'Median Max': 'Median of Max Demand Charges over Utilities ($/kW)',
    'Max Maximu': 'Maximum of Max Demand Charges over Utilities  ($/kW)',
  },
  'Highway Flows (Interstate)': {
    'Tot Tons': 'Highway Freight Flows (annual kilo-tons/link)',
    'Tot Trips': 'Highway Freight Flows (daily trips/link)',
  },
  'Highway Flows (SU)': {
    'Tot Tons': 'Single-unit Highway Freight Flows (annual kilo-tons/link)',
    'Tot Tons': 'Single-unit Highway Freight Flows (annual kilo-tons/link)',
    'Tot Trips': 'Single-unit Highway Freight Flows (daily trips/link)',
  },
  'Highway Flows (CU)': {
    'Tot Tons': 'Combined-unit Highway Freight Flows (annual kilo-tons/link)',
    'Tot Trips': 'Combined-unit Highway Freight Flows (daily trips/link)',
  },
  'Operational Electrolyzers': {
    Power_kW: 'Operational Hydrogen Electrolyzer Facility Capacity (kW)',
  },
  'Installed Electrolyzers': { Power_kW: 'Installed Hydrogen Electrolyzer Facility Capacity (kW)' },
  'Planned Electrolyzers': { Power_kW: 'Planned Hydrogen Electrolyzer Facility Capacity (kW)' },
  'Hydrogen from Refineries': {
    Cap_MMSCFD: 'Hydrogen Production Capacity from Refinery (million standard cubic feet per day)',
  },
  'State-Level Incentives and Regulations': {
    all: 'Incentives and Regulations (All Fuels)',
    Biodiesel: 'Incentives and Regulations (Biodiesel)',
    Ethanol: 'Incentives and Regulations (Ethanol)',
    Electricit: 'Incentives and Regulations (Electricity)',
    Hydrogen: 'Incentives and Regulations (Hydrogen)',
    'Natural Ga': 'Incentives and Regulations (Natural Gas)',
    Propane: 'Incentives and Regulations (Propane)',
    Renewable: 'Incentives and Regulations (Renewable Diesel)',
    //    'Emissions': 'Incentives and Regulations (Emissions)',

    'ZEF Corridor Strategy Phase 1 Hubs': 'ZEF Hubs (Phase 1)',
    'ZEF Corridor Strategy Phase 2 Hubs': 'ZEF Hubs (Phase 2)',
    'ZEF Corridor Strategy Phase 3 Hubs': 'ZEF Hubs (Phase 3)',
    'ZEF Corridor Strategy Phase 4 Hubs': 'ZEF Hubs (Phase 4)',

    'ZEF Corridor Strategy Phase 1 Corridors': 'ZEF Corridors (Phase 1)',
    'ZEF Corridor Strategy Phase 2 Corridors': 'ZEF Corridors (Phase 2)',
    'ZEF Corridor Strategy Phase 3 Corridors': 'ZEF Corridors (Phase 3)',
    'ZEF Corridor Strategy Phase 4 Corridors': 'ZEF Corridors (Phase 4)',

    'ZEF Corridor Strategy Phase 1 Facilities': 'ZEF Facilities (Phase 1)',
    'ZEF Corridor Strategy Phase 2 Facilities': 'ZEF Facilities (Phase 2)',
    'ZEF Corridor Strategy Phase 3 Facilities': 'ZEF Facilities (Phase 3)',
    'ZEF Corridor Strategy Phase 4 Facilities': 'ZEF Facilities (Phase 4)',
  },

  'Savings from Pooled Charging Infrastructure': {
    'Tot Trips': 'Trucks Passing Per Day',
    CPD: 'Truck Charges Per Day (Full Fleet)',
    Half_CPD: 'Truck Charges Per Day (Half Fleet)',
    Min_Charge: 'Min Chargers (Full Fleet)',
    Half_Charg: 'Min Chargers (Half Fleet)',
    Min_Ratio: 'Min Charger-to-truck Ratio (Full Fleet)',
    Half_Ratio: 'Min Charger-to-truck Ratio (Half Fleet)',
    Col_Save: 'Infra Savings from Pooled Investment (%)',
  },

  'Lifecycle Truck Emissions': {
    C_mi_tot: 'Total Emissions (g CO2e / mile)',
    C_mi_grid: 'Emissions from Charging (g CO2e / mile)',
    C_mi_man: 'Emissions from Battery Manufacturing (g CO2e / mile)',
  },

  'Total Cost of Truck Ownership': {
    $_mi_tot: 'EV Trucking Cost ($ / mile)',
    dies_tot: 'Diesel Trucking Cost ($ / mile)',
    diff_tot: 'EV Trucking Cost Premium ($ / mile)',
    perc_tot: 'EV Trucking Cost Premium (%)',
  },

  'Grid Generation and Capacity': {
    Ann_Gen: 'Electricity Generated in 2022 (GWh)',
    Cap_MW: 'Summer Power Generation Capacity in 2022 (GW)',
    Ann_Cap: 'Theoretical Electricity Generation Capacity in 2022 (GWh)',
    Ann_Diff:
      'Difference Between Theoretical Capacity and Actual Electricity Generation in 2022 (GWh)',
    Ann_Rat: 'Ratio Between Theoretical Capacity and Actual Electricity Generation in 2022',
  },

  'Energy Demand from Electrified Trucking': {
    'An E Dem': 'Annual Energy Demand for Fully Electrified Trucking (MWh)',
    'Perc Gen':
      'Annual Energy Demand for Fully Electrified Trucking, as % of Electricity Generated in 2022 (%)',
    'Perc Cap':
      'Annual Energy Demand for Fully Electrified Trucking, as % of Theoretical Electricity Generation Capacity in 2022 (%)',
    'Perc Diff':
      'Annual Energy Demand for Fully Electrified Trucking, as % of Theoretical Excess Electricity Generation Capacity in 2022 (%)',
  },
};

export const fuelLabels = {
  all: 'All Fuels',
  Biodiesel: 'Biodiesel',
  Ethanol: 'Ethanol',
  Electricit: 'Electricity',
  Hydrogen: 'Hydrogen',
  'Natural Ga': 'Natural Gas',
  Propane: 'Propane',
  Renewable: 'Renewable Diesel',
  Emissions: 'Emissions',
};

export const truckChargingOptions = {
  Range: {
    '150 miles': '100.0',
    '250 miles': '200.0',
    '350 miles': '300.0',
    '450 miles': '400.0',
  },
  'Charging Time': {
    '30 minutes': '0.5',
    '1 hour': '1.0',
    '2 hours': '2.0',
    '4 hours': '4.0',
  },
  'Max Allowed Wait Time': {
    '15 minutes': '0.25',
    '30 minutes': '0.5',
    '1 hour': '1.0',
    '2 hours': '2.0',
  },
};

export let selectedTruckChargingOptions = {
  Range: '200.0',
  'Charging Time': '4.0',
  'Max Allowed Wait Time': '0.5',
};

export const stateSupportOptions = {
  'Support Type': {
    'Incentives and Regulations': 'incentives_and_regulations',
    'Incentives only': 'incentives',
    'Regulations only': 'regulations',
  },
  'Support Target': {
    'All Targets': 'all',
    //    'Emissions only': 'emissions',
    'Fuel use only': 'fuel_use',
    'Infrastructure only': 'infrastructure',
    'Vehicle purchase only': 'vehicle_purchase',
  },
};

export let selectedStateSupportOptions = {
  'Support Type': 'incentives_and_regulations',
  'Support Target': 'all',
};

export const tcoOptions = {
  'Average Payload': {
    '0 lb': '0',
    '10,000 lb': '10000',
    '20,000 lb': '20000',
    '30,000 lb': '30000',
    '40,000 lb': '40000',
    '50,000 lb': '50000',
  },
  'Average VMT': {
    '40,000 miles': '40000',
    '70,000 miles': '70000',
    '100,000 miles': '100000',
    '130,000 miles': '130000',
    '160,000 miles': '160000',
    '190,000 miles': '190000',
  },
  'Max Charging Power': {
    '100 kW': '100',
    '200 kW': '200',
    '400 kW': '400',
    '800 kW': '800',
  },
};

export let selectedTcoOptions = {
  'Average Payload': '40000',
  'Average VMT': '100000',
  'Max Charging Power': '400',
};

export const emissionsOptions = {
  'Average Payload': {
    '0 lb': '0',
    '10,000 lb': '10000',
    '20,000 lb': '20000',
    '30,000 lb': '30000',
    '40,000 lb': '40000',
    '50,000 lb': '50000',
  },
  'Average VMT': {
    '40,000 miles': '40000',
    '70,000 miles': '70000',
    '100,000 miles': '100000',
    '130,000 miles': '130000',
    '160,000 miles': '160000',
    '190,000 miles': '190000',
  },
  'Visualize By': {
    State: 'state_',
    'Balancing Authority': 'ba_',
  },
};

export let selectedEmissionsOptions = {
  'Average Payload': '40000',
  'Average VMT': '100000',
  'Visualize By': 'state_',
};

export const gridEmissionsOptions = {
  'Visualize By': {
    State: 'eia2022_state',
    'Balancing authority': 'egrid2022_subregions',
  },
};

export let selectedGridEmissionsOptions = {
  'Visualize By': 'eia2022_state',
};

export const hourlyEmissionsOptions = {
  'Hour of Day': {
    '12am': '12',
    '1am': '1',
    '2am': '2',
    '3am': '3',
    '4am': '4',
    '5am': '5',
    '6am': '6',
    '7am': '7',
    '8am': '8',
    '9am': '9',
    '10am': '10',
    '11am': '11',
    '12pm': '12',
    '1pm': '13',
    '2pm': '14',
    '3pm': '15',
    '4pm': '16',
    '5pm': '17',
    '6pm': '18',
    '7pm': '19',
    '8pm': '20',
    '9pm': '21',
    '10pm': '22',
    '11pm': '23',
  },
};

export let selectedHourlyEmissionsOptions = {
  'Hour of Day': '0',
};

export const faf5Options = {
  Commodity: {
    'All Commodities': 'all',
    'Alcoholic Beverages': 'Alcoholic_beverages',
    'Animal Feed': 'Animal_feed',
    'Base Metal (articles)': 'Articles-base_metal',
    'Base Metal (primary/semi-finished)': 'Base_metals',
    'Basic Chemicals': 'Basic_chemicals',
    'Building Stone': 'Building_stone',
    'Cereal Grains': 'Cereal_grains',
    'Chemical Products': 'Chemical_prods.',
    Coal: 'Coal',
    'Crude Petroleum': 'Crude_petroleum',
    Electronics: 'Electronics',
    Fertilizers: 'Fertilizers',
    'Fuel Oils': 'Fuel_oils',
    Furniture: 'Furniture',
    Gasoline: 'Gasoline',
    Gravel: 'Gravel',
    'Live Animals/Fish': 'Live_animals_fish',
    Logs: 'Logs',
    Machinery: 'Machinery',
    'Meat/Seafood': 'Meat_seafood',
    'Metallic Ores': 'Metallic_ores',
    'Milled Grain Products': 'Milled_grain_prods.',
    'Misc Manufactured Products': 'Misc._mfg._prods.',
    'Mixed Freight': 'Mixed_freight',
    'Motorized Vehicles': 'Motorized_vehicles',
    'Natural Gas & Other Fossil Products': 'Natural_gas_and_other_fossil_products',
    'Natural sands': 'Natural_sands',
    'Newsprint Paper': 'Newsprint_paper',
    'Nonmetal Mineral Products': 'Nonmetal_min._prods.',
    'Nonmetallic Minerals': 'Nonmetallic_minerals',
    'Other Agricultural Products': 'Other_ag_prods.',
    'Other Foodstuffs': 'Other_foodstuffs',
    'Paper Articles': 'Paper_articles',
    Pharmaceuticals: 'Pharmaceuticals',
    'Plastics & Rubber': 'Plastics_rubber',
    'Precision Instruments': 'Precision_instruments',
    'Printed Products': 'Printed_prods.',
    'Textiles & Leather': 'Textiles_leather',
    'Tobacco Products': 'Tobacco_prods.',
    'Transport Equipment': 'Transport_equip.',
    'Waste Scrap': 'Waste_scrap',
    'Wood Products': 'Wood_prods.',
  },
};

export let selectedFaf5Options = {
  Commodity: 'all',
};

export const zefOptions = {
  Phase: {
    'Phase 1': '1',
    'Phase 2': '2',
    'Phase 3': '3',
    'Phase 4': '4',
  },
};

export let selectedZefOptions = {
  Phase: '1',
};

export const zefSubLayerOptions = {
  // We’ll just store booleans whether user wants them visible or not
  Corridors: true,
  Facilities: true,
  Hubs: true,
};

export let selectedZefSubLayers = {
  Corridors: true,
  Facilities: true,
  Hubs: true,
};

// Key: geojson name, Value: color to use
export const geojsonColors = {
  'Truck Imports and Exports': 'red',
  'Commercial Electricity Price': 'blue',
  'Highway Flows (SU)': 'cyan',
  'Highway Flows (Interstate)': 'black',
  'Operational Electrolyzers': 'DarkGreen',
  'Installed Electrolyzers': 'LimeGreen',
  'Planned Electrolyzers': 'GreenYellow',
  'Hydrogen from Refineries': 'grey',
  'East Coast ZEV Corridor': 'orange',
  'Midwest ZEV Corridor': 'purple',
  'Houston to LA H2 Corridor': 'green',
  'I-710 EV Corridor': 'magenta',
  'Northeast Electric Highways Study': 'cyan',
  'Bay Area EV Roadmap': 'yellow',
  'Salt Lake City Region EV Plan': 'red',
  'Direct Current Fast Chargers': 'red',
  'Hydrogen Stations': 'green',
  'LNG Stations': 'orange',
  'CNG Stations': 'purple',
  'LPG Stations': 'cyan',
  'Savings from Pooled Charging Infrastructure': 'red',
  'Principal Ports': 'purple',
  'Truck Stop Locations': 'green',

  'ZEF Corridor Strategy Phase 1 Hubs': '#ffa500', // Dark Red for Hubs
  'ZEF Corridor Strategy Phase 2 Hubs': '#ffa500',
  'ZEF Corridor Strategy Phase 3 Hubs': '#ffa500',
  'ZEF Corridor Strategy Phase 4 Hubs': '#ffa500',

  'ZEF Corridor Strategy Phase 1 Corridors': 'Purple', // Dark Blue for Corridors
  'ZEF Corridor Strategy Phase 2 Corridors': 'Purple',
  'ZEF Corridor Strategy Phase 3 Corridors': 'Purple',
  'ZEF Corridor Strategy Phase 4 Corridors': 'Purple',

  'ZEF Corridor Strategy Phase 1 Facilities': 'Green', // Dark Green for Facilities
  'ZEF Corridor Strategy Phase 2 Facilities': 'Green',
  'ZEF Corridor Strategy Phase 3 Facilities': 'Green',
  'ZEF Corridor Strategy Phase 4 Facilities': 'Green',
};

// Key: geojson name, Value: either 'area' (indicating it's an area feature) or [feature type: category], where each feature type can be divided into several categories
export const geojsonTypes = {
  'Truck Imports and Exports': 'area',
  'Grid Emission Intensity': 'area',
  'Hourly Grid Emissions': 'area',
  'Commercial Electricity Price': 'area',
  'Maximum Demand Charge (utility-level)': 'area',
  'Maximum Demand Charge (state-level)': 'area',
  'State-Level Incentives and Regulations': 'area',
  'Highway Flows (Interstate)': ['highway', 'flow'],
  'Highway Flows (SU)': ['highway', 'flow'],
  'Highway Flows (CU)': ['highway', 'flow'],
  'Operational Electrolyzers': ['point', 'h2prod'],
  'Installed Electrolyzers': ['point', 'h2prod'],
  'Planned Electrolyzers': ['point', 'h2prod'],
  'Hydrogen from Refineries': ['point', 'h2prod'],
  'Direct Current Fast Chargers': ['point', 'refuel'],
  'Hydrogen Stations': ['point', 'refuel'],
  'LNG Stations': ['point', 'refuel'],
  'CNG Stations': ['point', 'refuel'],
  'LPG Stations': ['point', 'refuel'],
  'East Coast ZEV Corridor': ['highway', 'infra'],
  'Midwest ZEV Corridor': ['highway', 'infra'],
  'Houston to LA H2 Corridor': ['highway', 'infra'],
  'I-710 EV Corridor': ['highway', 'infra'],
  'Northeast Electric Highways Study': 'area',
  'Bay Area EV Roadmap': 'area',
  'Salt Lake City Region EV Plan': 'area',
  'Truck Stop Locations': ['point', 'other'],
  //'DOE Corridors': ['point', 'other'],
  'Principal Ports': ['point', 'other'],
  'Savings from Pooled Charging Infrastructure': ['point', 'other'],
  'Lifecycle Truck Emissions': 'area',
  'Total Cost of Truck Ownership': 'area',
  'Grid Generation and Capacity': 'area',
  'Energy Demand from Electrified Trucking': 'area',
  'National ZEF Corridor Strategy': ['highway', 'infra'],
};

export const dataInfo = {
  'Truck Imports and Exports':
    "Freight flow data from the FWHA's <a href='https://ops.fhwa.dot.gov/freight/freight_analysis/faf/'>Freight Analysis Framework</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/e3bcc5d26e5e42709e2bacd6fc37ab43_0/downloads/data?format=shp&spatialRefId=3857&where=1%3D1'>link to download shapefile used for FAF5 region boundaries</a>). Emissions attributes are evaluated by incorporating data from the <a href='https://rosap.ntl.bts.gov/view/dot/42632/dot_42632_DS2.zip'>2002 Vehicle Inventory and Use Survey</a> and the <a href='https://greet.anl.gov/'>GREET lifecycle emissions tool</a> maintained by Argonne National Lab.",
  'Grid Emission Intensity':
    "Emission intensity data is obtained from the <a href='https://www.epa.gov/egrid/download-data'>eGRID database</a> (<a href='https://www.epa.gov/system/files/documents/2023-01/eGRID2021_data.xlsx'>link to download</a>). eGRID subregion boundaries are obtained from <a href='https://hub.arcgis.com/datasets/fedmaps::subregions-of-the-emissions-generation-resource-integrated-database-egrid/'>this ArcGIS Hub page</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/23e16f24702948ac9e2032bfa0526a8f_1/downloads/data?format=shp&spatialRefId=4326&where=1%3D1'>link to download</a>)",
  'Hourly Grid Emissions':
    "Hourly emission intensity data is obtained from <a href='https://www.electricitymaps.com/data-portal/united-states-of-america'>ElectricityMaps</a>, and post-processed to evaluate average emission intensity &plusmn; 1 standard deviation for each hour of the day in 2022. ISO boundaries are obtained from the <a href='https://github.com/electricitymaps/electricitymaps-contrib/tree/master'>ElectricityMaps GitHub repository</a> (<a href='https://raw.githubusercontent.com/electricitymaps/electricitymaps-contrib/master/web/geo/world.geojson'>link to download</a>).<br><br><b>Original Data Source Attribution:</b> Electricity Maps (2024). United States of America 2022-23 Hourly Carbon Intensity Data (Version January 17, 2024). Electricity Maps Data Portal. https://www.electricitymaps.com/data-portal.",
  'Commercial Electricity Price':
    "Data is obtained from the <a href='https://www.eia.gov/electricity/data.php'>EIA's Electricity database</a> (<a href='https://www.eia.gov/electricity/data/state/sales_annual_a.xlsx'>link to download</a>).",
  'Maximum Demand Charge (state-level)':
    "The maximum historical demand charge in each utility region is evaluated using historical demand charge data compiled by the National Renewable Energy Lab (NREL) in <a href='https://data.nrel.gov/submissions/74'>this NREL Data Catalog</a> (<a href='https://data.nrel.gov/system/files/74/Demand%20charge%20rate%20data.xlsm'>link to download</a>).<br><br><b>Original Data Source Attribution:</b> McLaren, Joyce, Pieter Gagnon, Daniel Zimny-Schmitt, Michael DeMinco, and Eric Wilson. 2017. 'Maximum demand charge rates for commercial and industrial electricity tariffs in the United States.' NREL Data Catalog. Golden, CO: National Renewable Energy Laboratory. Last updated: July 24, 2024. DOI: 10.7799/1392982.<br><br><b>Original Data Source Credit:</b> <ul><li>The National Renewable Energy Laboratory (NREL)</li><li>U.S. Department of Energy (DOE)</li><li>Alliance for Sustainable Energy, LLC ('Alliance')</li></ul>",
  'Maximum Demand Charge (utility-level)':
    "Maximum historical demand charges for each state are evaluated using historical demand charge data compiled by the National Renewable Energy Lab (NREL) in <a href='https://data.nrel.gov/submissions/74'>this NREL Data Catalog</a> (<a href='https://data.nrel.gov/system/files/74/Demand%20charge%20rate%20data.xlsm'>link to download</a>). <br><br><b>Original Data Source Attribution:</b> McLaren, Joyce, Pieter Gagnon, Daniel Zimny-Schmitt, Michael DeMinco, and Eric Wilson. 2017. 'Maximum demand charge rates for commercial and industrial electricity tariffs in the United States.' NREL Data Catalog. Golden, CO: National Renewable Energy Laboratory. Last updated: July 24, 2024. DOI: 10.7799/1392982.<br><br><b>Original Data Source Credit:</b> <ul><li>The National Renewable Energy Laboratory (NREL)</li><li>U.S. Department of Energy (DOE)</li><li>Alliance for Sustainable Energy, LLC ('Alliance')</li></ul>",
  'State-Level Incentives and Regulations':
    "This data was collected by manually combing through the DOE AFDC's <a href='https://afdc.energy.gov/laws/state'>State Laws and Incentives Database</a> and collecting relevant information about laws and incentives that could be relevant for heavy duty trucking.",
  'Highway Flows (Interstate)':
    "This layer was obtained by combining the <a href='https://geodata.bts.gov/datasets/usdot::freight-analysis-framework-faf5-network-links'>FAF5 network links</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/cbfd7a1457d749ae865f9212c978c645_0/downloads/data?format=shp&spatialRefId=3857&where=1%3D1'>link to download</a>) with the 2022 FAF5 Highway Network Assignments from the <a href='https://ops.fhwa.dot.gov/freight/freight_analysis/faf/'>FAF5 website</a> (<a href='https://ops.fhwa.dot.gov/freight/freight_analysis/faf/faf_highway_assignment_results/FAF5_2022_HighwayAssignmentResults_04_07_2022.zip'>link to download</a>), and selecting for links on the interstate system.",
  'Operational Electrolyzers':
    "Data on operational electrolyzers was extracted from a <a href='https://www.hydrogen.energy.gov/docs/hydrogenprogramlibraries/pdfs/23003-electrolyzer-installations-united-states.pdf?Status=Master'>DOE Hydrogen program record</a> entitled 'Electrolyzer Installations in the United States' and dated June 2, 2023.",
  'Installed Electrolyzers':
    "Data on installed electrolyzers was extracted from a <a href='https://www.hydrogen.energy.gov/docs/hydrogenprogramlibraries/pdfs/23003-electrolyzer-installations-united-states.pdf?Status=Master'>DOE Hydrogen program record</a> entitled 'Electrolyzer Installations in the United States' and dated June 2, 2023.",
  'Planned Electrolyzers':
    "Data on planned electrolyzers was extracted from a <a href='https://www.hydrogen.energy.gov/docs/hydrogenprogramlibraries/pdfs/23003-electrolyzer-installations-united-states.pdf?Status=Master'>DOE Hydrogen program record</a> entitled 'Electrolyzer Installations in the United States' and dated June 2, 2023.",
  'Hydrogen from Refineries':
    "Locations and production rates of hydrogen from refineries are obtained from the following two complementary datasets on the <a href='https://h2tools.org'>Hydrogen Tools Portal</a>:<br> 1) <a href='https://h2tools.org/hyarc/hydrogen-data/captive-purpose-refinery-hydrogen-production-capacities-individual-us'>Captive, On-Purpose, Refinery Hydrogen Production Capacities at Individual U.S. Refineries<a> (<a href='https://h2tools.org/file/9338/download?token=0IWTving'>link to download</a>), and <br>2) <a href='https://h2tools.org/hyarc/hydrogen-data/merchant-hydrogen-plant-capacities-north-america'>Merchant Hydrogen Plant Capacities in North America</a> (<a href='https://h2tools.org/file/196/download?token=BNg4dM46'>link to download</a>)",
  'Direct Current Fast Chargers':
    "Locations of Direct Current Fast Chargers with at least 4 ports and an output of at least 150 kW. Includes passenger vehicle charging stations. Obtained from the DOE AFDC's <a href='https://afdc.energy.gov/corridors'>Station Data for Alternative Fuel Corridors</a>",
  'Hydrogen Stations':
    "Locations of retail hydrogen fueling stations. Includes passenger vehicle refueling stations. Obtained from the DOE AFDC's <a href='https://afdc.energy.gov/corridors'>Station Data for Alternative Fuel Corridors</a>",
  'LNG Stations':
    "Locations of liquified natural gas (LNG) fueling stations. Includes passenger vehicle refueling stations. Obtained from the DOE AFDC's <a href='https://afdc.energy.gov/corridors'>Station Data for Alternative Fuel Corridors</a>",
  'CNG Stations':
    "Locations of fast-fill compressed natural gas (CNG) fueling stations. Includes passenger vehicle refueling stations. Obtained from the DOE AFDC's <a href='https://afdc.energy.gov/corridors'>Station Data for Alternative Fuel Corridors</a>",
  'LPG Stations':
    "Locations of primary liquified petroleum gas (LPG) fueling stations. Includes passenger vehicle refueling stations. Obtained from the DOE AFDC's <a href='https://afdc.energy.gov/corridors'>Station Data for Alternative Fuel Corridors</a>",
  'East Coast ZEV Corridor':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will launch an intensive strategic planning effort to spur the deployment of commercial medium- and heavy-duty (MHD) zero-emission vehicle (ZEV) infrastructure through the development of an East Coast Commercial ZEV Corridor along the I-95 freight corridor from Georgia to New Jersey.",
  'Midwest ZEV Corridor':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will develop an extensive two-phase MD-HD EV Charging and H2 Fueling Plan for the Midwest I-80 corridor serving Indiana, Illinois, and Ohio, to support 30% of the MD-HD fleet using ZEV technologies by 2035.",
  'Houston to LA H2 Corridor':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will develop a flexible and scalable blueprint plan for an investment-ready hydrogen fueling and heavy-duty freight truck network from Houston to LA (H2LA) along I-10, including the Texas Triangle region, and in the process develop methodology for future corridor plans across the country. ",
  'I-710 EV Corridor':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will create a plan for innovative infrastructure solutions at industrial facilities and commercial zones along critical freight arteries feeding into Southern California’s I-710 freeway. The project will explore how private sector fleets can establish an integrated network that leverages existing industrial and commercial real estate assets while providing greatest benefit to municipalities and communities.",
  'Northeast Electric Highways Study':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will forecast electric charging demand at traffic stops on freight corridors across Maine, Massachusetts, New Hampshire, Vermont, Rhode Island, Connecticut, New York, Pennsylvania, and New Jersey to help inform a blueprint for future large-scale, least-cost deployment of commercial EV charging and serve as an exemplar for other regions.",
  'Bay Area EV Roadmap':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will create a roadmap for charging infrastructure to support the full electrification of three key trucking market segments – drayage, regional haul, and long-haul – in the Bay Area of California. ",
  'Salt Lake City Region EV Plan':
    "Shows the highway corridor targeted for one of 7 heavy duty vehicle infrastructure projects funded by the Biden-Harris administration (<a href='https://www.energy.gov/articles/biden-harris-administration-announces-funding-zero-emission-medium-and-heavy-duty-vehicle'>link to announcement</a> from Feb. 15, 2023). <br>This project will develop a community, state and industry supported action plan that will improve air quality in the underserved communities most impacted by high-density medium- and heavy-duty traffic in the greater Salt Lake City region. ",
  'Truck Stop Locations':
    "Locations of truck stops parking facilities in the U.S. Obtained from the DOT Bureau of Transportation Statistics's <a href='https://geodata.bts.gov/datasets/usdot::truck-stop-parking'>Truck Stop Parking database</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/0849b1bd4a5e4b4e831877b7c25d6062_0/downloads/data?format=shp&spatialRefId=3857&where=1%3D1'>link to download</a>)",
  //'DOE corridors': "Locations of truck stops parking facilities in the U.S. Obtained from the DOT Bureau of Transportation Statistics's <a href='https://geodata.bts.gov/datasets/usdot::truck-stop-parking'>Truck Stop Parking database</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/0849b1bd4a5e4b4e831877b7c25d6062_0/downloads/data?format=shp&spatialRefId=3857&where=1%3D1'>link to download</a>)",
  'Principal Ports':
    "Locations of principal ports in the US. Obtained from <a href='https://geodata.bts.gov/datasets/usdot::principal-ports/'>USDOT BTS</a> (<a href='https://opendata.arcgis.com/api/v3/datasets/e3b6065cce144be8a13a59e03c4195fe_1/downloads/data?format=shp&spatialRefId=4326&where=1%3D1'>link to download</a>).",
  'Savings from Pooled Charging Infrastructure':
    "These layers are used to visualize an analysis <a href='https://dspace.mit.edu/handle/1721.1/153617'>presented in this publication</a> of theoretical savings from pooled investment in charging infrastructure at selected U.S. truck stops. The analysis integrates truck stop locations in the U.S. (see 'Truck Stop Locations' layer for details), along with highway freight flow data from the Freight Analysis Framework - see 'Highway Flows (Interstate)' layer for details.",
  'Lifecycle Truck Emissions':
    "Estimated lifecycle emissions per mile for the Tesla Semi due to charging and battery manufacturing. Charging emissions are based on the CO2e emission intensity of the grid balancing authority region. Emissions are calculated using the model developed by <a href='https://chemrxiv.org/engage/chemrxiv/article-details/656e4691cf8b3c3cd7c96810'>Sader et al.</a>, calibrated to <a href='https://runonless.com/run-on-less-electric-depot-reports/'>NACFE Run on Less data</a> for the Tesla Semi from the 2023 PepsiCo Semi pilot.<br><br><a href='https://github.com/mcsc-impact-climate/Green_Trucking_Analysis'>Link to Git repo with code used to produce these layers</a>",
  'Total Cost of Truck Ownership':
    "Estimated lifecycle total cost of ownership per mile for the Tesla Semi due to truck purchase, charging, labor, maintenance, insurance and other operating costs. Charging costs are evaluated using state-level commercial electricity price and demand charge. Costs are calculated using the model developed by <a href='https://chemrxiv.org/engage/chemrxiv/article-details/656e4691cf8b3c3cd7c96810'>Sader et al.</a>, calibrated to <a href='https://runonless.com/run-on-less-electric-depot-reports/'>NACFE Run on Less data</a> for the Tesla Semi from the 2023 PepsiCo Semi pilot.<br><br><a href='https://github.com/mcsc-impact-climate/Green_Trucking_Analysis'>Link to Git repo with code used to produce these layers</a>",
  'Grid Generation and Capacity':
    "Grid electricity generation and net summer power capacity by state for 2022, along with estimated theoretical maximum generation capacity and its difference and ratio relative to the actual grid electricity generation. Theoretical maximum electricity generation capacity is obtained under the assumption that the grid operates at its net summer power capacity year-round. <br><br>Data is obtained from the EIA's <a href='https://www.eia.gov/electricity/data/state/'>state-level electricity database</a>.<br><a href='https://www.eia.gov/electricity/data/state/annual_generation_state.xls'>Link to download annual generation data</a><br><a href='https://www.eia.gov/electricity/data/state/existcapacity_annual.xlsx'>Link to download net summer power capacity data</a>",
  'Energy Demand from Electrified Trucking':
    "Total energy demand from electrified trucking (in MWh), assuming all 2022 trucking operations in the state are electrified. This is evaluated using the FAF5 highway flows (see Highway Flows layer for details), along with payload-based energy economy calibrated to the Tesla Semi (code and details for Tesla Semi calibration can be found in the following GitHub repos <a href='https://github.com/mcsc-impact-climate/PepsiCo_NACFE_Analysis'>Repo 1</a>, <a href='https://github.com/mcsc-impact-climate/Green_Trucking_Analysis'>Repo 2</a>).<br><br>To assess the capacity of the grid to support electrified trucking, you can also change the gradient attribute to show the energy demand from electrified trucking as a percent of one of the following measures of grid capacity (see 'Grid Generation and Capacity' layer for details): <ul><li>Total electricity generated in the state in 2022</li><li>Total theoretical generating capacity of the state in 2022 (MWh), assuming the grid ran at its peak summer capacity year-round </li><li>Theoretical excess generating capacity (MWh). This is quantified as the difference between the total theoretical generating capacity and the actual electricity generated in 2022.</li></ul>",
  'National ZEF Corridor Strategy':
    "This layer visualizes the National Zero-Emission Freight Corridor Strategy, a framework developed by the U.S. Joint Office of Energy and Transportation to support the coordinated deployment of medium- and heavy-duty zero-emission vehicle (ZEV) infrastructure along critical freight corridors. The strategy, outlined in the publication <a href='https://driveelectric.gov/files/zef-corridor-strategy.pdf'>National Zero-Emission Freight Corridor Strategy</a>, identifies priority corridors and infrastructure investment needs to accelerate the transition to zero-emission medium- and heavy-duty vehicles. <br><br>For more details, refer to the official report: <a href='https://driveelectric.gov/files/zef-corridor-strategy.pdf'>National Zero-Emission Freight Corridor Strategy</a> (Joint Office of Energy and Transportation, 2024).",
};
