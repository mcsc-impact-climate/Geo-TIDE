function placePanels() {
  const uploaded = document.getElementById('uploaded-layer-selection');
  const publicPanel = document.getElementById('layer-selection');
  const clearButton = document.getElementById('clear-button');
  const GAP = 10;
  
  if (!uploaded || !publicPanel || !clearButton) return;

  clearButton.style.position = 'absolute';
  clearButton.style.right = '1rem';
  clearButton.style.bottom = '2.25rem';
  
  const clearButtonRect = clearButton.getBoundingClientRect();
  const clearButtonTop = clearButtonRect.top + window.scrollY;
  
  // Position public panel above clear button
  const publicPanelHeight = publicPanel.offsetHeight;
  const publicTop = clearButtonTop - publicPanelHeight - GAP;
  publicPanel.style.top = publicTop + 'px';
  
  // Position uploaded panel above public panel
  const uploadedHeight = uploaded.offsetHeight;
  const uploadedTop = publicTop - uploadedHeight - GAP;
  uploaded.style.top = uploadedTop + 'px';
}

// Panel state management
let publicDataOpen = true; // Default open
let uploadedDataOpen = true; // Default open

function updatePublicPanel() {
  const content = document.getElementById('public-data-content');
  const chevron = document.getElementById('public-chevron-path');
  const layerSelection = document.getElementById('layer-selection');
  const header = document.querySelector('.public-data-header');
  
  if (!content || !chevron || !layerSelection || !header) return;
  
  // Reset inline styles to let CSS classes take over
  layerSelection.style.height = '';
  layerSelection.style.width = '';

  if (publicDataOpen) {
    content.style.display = ''; // Let CSS handle display (flex)
    layerSelection.classList.remove('closed');
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
    header.classList.remove('closed');
  } else {
    content.style.display = 'none';
    layerSelection.classList.add('closed');
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
    header.classList.add('closed');
  }
  
  setTimeout(() => placePanels(), 50);
}

function togglePublicData() {
  publicDataOpen = !publicDataOpen;
  updatePublicPanel();
}

function updateUploadedPanel() {
  const content = document.getElementById('uploaded-data-content');
  const chevron = document.getElementById('uploaded-chevron-path');
  const uploadedPanel = document.getElementById('uploaded-layer-selection');
  
  if (!content || !chevron || !uploadedPanel) return;
  
  // Reset inline styles
  uploadedPanel.style.height = '';
  uploadedPanel.style.width = '';

  if (uploadedDataOpen) {
    content.style.display = ''; // Let CSS handle display
    uploadedPanel.classList.remove('closed');
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    content.style.display = 'none';
    uploadedPanel.classList.add('closed');
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  setTimeout(() => placePanels(), 50);
}

function toggleUploadedData() {
  uploadedDataOpen = !uploadedDataOpen;
  updateUploadedPanel();
}

function initPanelToggles() {
  const publicHeader = document.querySelector('.public-data-header');
  if (publicHeader) {
    publicHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      togglePublicData();
    });
  }
  
  const uploadedHeader = document.querySelector('.uploaded-panel-header');
  if (uploadedHeader) {
    uploadedHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleUploadedData();
    });
  }
}

function initH3SectionToggles() {
  const showButtons = document.querySelectorAll('.show-button');
  
  showButtons.forEach(button => {
    button.addEventListener('click', function() {
      setTimeout(() => {
        setTimeout(() => placePanels(), 50);
      }, 100);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Ensure panels are initialized in the correct state
  // We start them as open, so we call update to ensure classes are removed and inline styles cleared
  updatePublicPanel();
  updateUploadedPanel();

  setTimeout(() => placePanels(), 50);
  initPanelToggles();
  initH3SectionToggles();

  // keep GAP consistent when panel heights change
  if ('ResizeObserver' in window) {
    const uploaded = document.getElementById('uploaded-layer-selection');
    const publicPanel = document.getElementById('layer-selection');

    const ro = new ResizeObserver(() => {
      // Whenever either panel’s height changes (e.g. more pillboxes),
      // recompute their positions so the GAP stays constant.
      placePanels();
    });

    if (uploaded) ro.observe(uploaded);
    if (publicPanel) ro.observe(publicPanel);
  }

  window.addEventListener('resize', placePanels);
});

window.placePanels = placePanels;
