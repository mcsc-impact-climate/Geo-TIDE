# MCSC Geospatial Trucking Industry Decarbonization Explorer (Geo-TIDE)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.14804046.svg)](https://doi.org/10.5281/zenodo.14804046)

This repo contains code to produce and interactively visualize publicly available geospatial data to support trucking fleets in navigating the transition to alternative energy carriers. The Geo-TIDE tool uses data from the "freight analysis framework" (FAF5) database and other public data sources.

## Pre-requisites
* [pixi](https://pixi.sh/latest/)

## Running the geospatial mapping tool

The code in [web](./web) contains all functionality to visualize the geojsons interactively on a web interface. To deploy a local instance of the tool:

```bash
pixi run start
```

If that executes without issue, you should be able to view the map in your browser at http://127.0.0.1:5000/transportation. It currently looks something like this:

![Interactive Web Map](./images/web_map.png)


