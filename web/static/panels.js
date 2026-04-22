function placePanels() {
  const uploaded = document.getElementById('uploaded-layer-selection');
  const publicPanel = document.getElementById('layer-selection');
  const clearButton = document.getElementById('clear-button');
  
  if (!uploaded || !publicPanel || !clearButton) return;

  const GAP = 10;
  const TOP_MARGIN = 60; // Increased space from top
  const VIEWPORT_HEIGHT = window.innerHeight;
  
  const BASE_BOTTOM = 36; // 2.25rem
  const clearHeight = clearButton.offsetHeight;

  // 1. Public Data (bottom panel)
  const publicHeight = publicPanel.offsetHeight;
  const publicBottom = BASE_BOTTOM + clearHeight + GAP;
  publicPanel.style.top = 'auto';
  publicPanel.style.bottom = publicBottom + 'px';
  
  // 2. Uploaded Data (middle panel)
  const uploadedHeight = uploaded.offsetHeight;
  const uploadedBottom = publicBottom + publicHeight + GAP;
  uploaded.style.top = 'auto';
  uploaded.style.bottom = uploadedBottom + 'px';
}

// Panel state management
let publicDataOpen = true; 
let uploadedDataOpen = true; 

function updatePublicPanel() {
  const content = document.getElementById('public-data-content');
  const chevron = document.getElementById('public-chevron-path');
  const layerSelection = document.getElementById('layer-selection');
  
  if (!content || !layerSelection) return;
  
  layerSelection.style.height = '';
  layerSelection.style.width = '';

  if (publicDataOpen) {
    content.style.display = ''; 
    layerSelection.classList.remove('closed');
    if (chevron) chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    content.style.display = 'none';
    layerSelection.classList.add('closed');
    if (chevron) chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  setTimeout(() => placePanels(), 50);
}

function updateUploadedPanel() {
  const content = document.getElementById('uploaded-data-content');
  const chevron = document.getElementById('uploaded-chevron-path');
  const uploadedPanel = document.getElementById('uploaded-layer-selection');
  
  if (!content || !uploadedPanel) return;
  
  uploadedPanel.style.height = '';
  uploadedPanel.style.width = '';

  if (uploadedDataOpen) {
    content.style.display = ''; 
    uploadedPanel.classList.remove('closed');
    if (chevron) chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    content.style.display = 'none';
    uploadedPanel.classList.add('closed');
    if (chevron) chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  setTimeout(() => placePanels(), 50);
}

function togglePublicData() { publicDataOpen = !publicDataOpen; updatePublicPanel(); }
function toggleUploadedData() { uploadedDataOpen = !uploadedDataOpen; updateUploadedPanel(); }

function initPanelToggles() {
  const publicHeader = document.querySelector('.public-data-header');
  if (publicHeader) {
    publicHeader.addEventListener('click', (e) => {
      if (e.target.closest('.chevron-toggle') || e.target.tagName === 'H1' || e.target.classList.contains('public-data-header')) {
        togglePublicData();
      }
    });
  }
  
  const uploadedHeader = document.querySelector('.uploaded-panel-header');
  if (uploadedHeader) {
    uploadedHeader.addEventListener('click', () => toggleUploadedData());
  }
}

function initH3SectionToggles() {
  document.querySelectorAll('.show-button').forEach(button => {
    button.addEventListener('click', () => setTimeout(() => placePanels(), 150));
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updatePublicPanel();
  updateUploadedPanel();

  setTimeout(() => placePanels(), 100);
  initPanelToggles();
  initH3SectionToggles();

  if ('ResizeObserver' in window) {
    const uploaded = document.getElementById('uploaded-layer-selection');
    const publicPanel = document.getElementById('layer-selection');
    const ro = new ResizeObserver(() => placePanels());
    if (uploaded) ro.observe(uploaded);
    if (publicPanel) ro.observe(publicPanel);
  }

  window.addEventListener('resize', placePanels);
});

window.placePanels = placePanels;
