function placePanels() {
  const savedViews = document.getElementById('saved-views-selection');
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

  // 3. Saved Views (top panel)
  if (savedViews) {
    const listContainer = savedViews.querySelector('.saved-views-list-container');
    const currentSavedBottom = uploadedBottom + uploadedHeight + GAP;
    
    // We set the position FIRST to read accurate height if needed
    savedViews.style.top = 'auto';
    savedViews.style.bottom = currentSavedBottom + 'px';

    // Check if we hit the top margin
    const savedViewsRect = savedViews.getBoundingClientRect();
    const savedViewsTop = savedViewsRect.top;
    
    if (savedViewsTop < TOP_MARGIN) {
       // We must shrink Saved Views to avoid hitting top
       if (listContainer) {
          const availableHeightForSaved = VIEWPORT_HEIGHT - currentSavedBottom - TOP_MARGIN;
          const nonListHeight = savedViews.offsetHeight - listContainer.offsetHeight;
          const newListMax = Math.max(50, availableHeightForSaved - nonListHeight);
          listContainer.style.maxHeight = newListMax + 'px';
       }
    } else {
       // Reset max-height to CSS default if we have enough room
       // BUT only if we aren't at risk of hitting the top again
       if (listContainer) {
          listContainer.style.maxHeight = '12rem'; 
       }
    }
  }
}

// Panel state management
let publicDataOpen = true; 
let uploadedDataOpen = true; 
let savedViewsOpen = true;

function updatePublicPanel() {
  const content = document.getElementById('public-data-content');
  const chevron = document.getElementById('saved-views-chevron-path'); // wait, wrong chevron? 
  // Let's fix chevrons logic to be specific
}

// Rewriting toggle logic for clarity and correctness
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

function updateSavedViewsPanel() {
  const content = document.getElementById('saved-views-content');
  const chevron = document.getElementById('saved-views-chevron-path');
  const savedViewsPanel = document.getElementById('saved-views-selection');
  
  if (!content || !savedViewsPanel) return;
  
  savedViewsPanel.style.height = '';
  savedViewsPanel.style.width = '';

  if (savedViewsOpen) {
    content.style.display = 'flex'; 
    savedViewsPanel.classList.remove('closed');
    if (chevron) chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    content.style.display = 'none';
    savedViewsPanel.classList.add('closed');
    if (chevron) chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  setTimeout(() => placePanels(), 50);
}

function togglePublicData() { publicDataOpen = !publicDataOpen; updatePublicPanel(); }
function toggleUploadedData() { uploadedDataOpen = !uploadedDataOpen; updateUploadedPanel(); }
function toggleSavedViews() { savedViewsOpen = !savedViewsOpen; updateSavedViewsPanel(); }

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

  const savedViewsHeader = document.querySelector('.saved-views-header');
  if (savedViewsHeader) {
    savedViewsHeader.addEventListener('click', () => toggleSavedViews());
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
  updateSavedViewsPanel();

  setTimeout(() => placePanels(), 100);
  initPanelToggles();
  initH3SectionToggles();

  if ('ResizeObserver' in window) {
    const uploaded = document.getElementById('uploaded-layer-selection');
    const publicPanel = document.getElementById('layer-selection');
    // DO NOT observe saved-views-selection to avoid loops
    const ro = new ResizeObserver(() => placePanels());
    if (uploaded) ro.observe(uploaded);
    if (publicPanel) ro.observe(publicPanel);
  }

  window.addEventListener('resize', placePanels);
});

window.placePanels = placePanels;
