import { map } from './map.js';
import { getSelectedLayers } from './ui.js';
import { layerCache } from './layer-utils.js';

export function initDownload() {
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.onclick = handleDownload;
  }
}

async function handleDownload() {
  // 1. Download GeoJSONs
  downloadActiveGeoJSONs();

  // 2. Download PDF
  await downloadMapPDF();
}

function downloadActiveGeoJSONs() {
  const selectedLayers = getSelectedLayers();
  
  selectedLayers.forEach(layerName => {
    const layer = layerCache[layerName];
    if (layer) {
      const source = layer.getSource();
      const features = source.getFeatures();
      const format = new ol.format.GeoJSON();
      const geojson = format.writeFeatures(features);
      
      const blob = new Blob([geojson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layerName.replace(/\s+/g, '_')}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}

async function downloadMapPDF() {
  const { jsPDF } = window.jspdf;
  
  map.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas');
    const size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext('2d');
    
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layers canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const transform = canvas.style.transform;
          // Get the transform parameters from the style's transform matrix
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export canvas context
          CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    
    const pdf = new jsPDF('landscape', 'pt', [size[0], size[1]]);
    pdf.addImage(
      mapCanvas.toDataURL('image/jpeg'),
      'JPEG',
      0,
      0,
      size[0],
      size[1]
    );
    pdf.save('map.pdf');
  });
  map.renderSync();
}
