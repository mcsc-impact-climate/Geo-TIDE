function placePanels() {
  const uploaded = document.getElementById('uploaded-layer-selection');
  const publicPanel = document.getElementById('layer-selection');
  const clearButton = document.getElementById('clear-button');
  const GAP = 10;
  
  if (!uploaded || !publicPanel || !clearButton) return;

  // Set Clear Layers button to a visible position first
  clearButton.style.position = 'absolute';
  clearButton.style.right = '10px';
  clearButton.style.bottom = '1rem';
  
  const clearButtonRect = clearButton.getBoundingClientRect();
  const clearButtonTop = clearButtonRect.top + window.scrollY;
  
  const publicPanelHeight = publicPanel.offsetHeight;
  const publicTop = clearButtonTop - publicPanelHeight - GAP;
  publicPanel.style.top = publicTop + 'px';
  
  const uploadedHeight = uploaded.offsetHeight;
  const uploadedTop = publicTop - uploadedHeight - GAP;
  uploaded.style.top = uploadedTop + 'px';
}

// Panel state management
let publicDataOpen = true;
let uploadedDataOpen = true;

function togglePublicData() {
  const content = document.getElementById('public-data-content');
  const chevron = document.getElementById('public-chevron-path');
  const layerSelection = document.getElementById('layer-selection');
  const header = document.querySelector('.public-data-header');
  
  if (!content || !chevron || !layerSelection || !header) {
    console.log('Public data elements not found');
    return;
  }
  
  publicDataOpen = !publicDataOpen;
  console.log('Public data toggled:', publicDataOpen);
  
  if (publicDataOpen) {
    // Open state
    content.style.display = 'block';
    layerSelection.style.setProperty('height', '35rem', 'important');
    layerSelection.style.setProperty('width', '17.5rem', 'important');
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
    header.classList.remove('closed');
  } else {
    // Closed state
    content.style.display = 'none';
    layerSelection.style.setProperty('height', '2.75rem', 'important');
    layerSelection.style.setProperty('width', '17.5rem', 'important');
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
    header.classList.add('closed');
  }
  
  // Reposition panels
  setTimeout(() => placePanels(), 50);
}

function toggleUploadedData() {
  const content = document.getElementById('uploaded-data-content');
  const chevron = document.getElementById('uploaded-chevron-path');
  const uploadedPanel = document.getElementById('uploaded-layer-selection');
  
  if (!content || !chevron || !uploadedPanel) {
    console.log('Uploaded data elements not found');
    return;
  }
  
  uploadedDataOpen = !uploadedDataOpen;
  console.log('Uploaded data toggled:', uploadedDataOpen);
  
  if (uploadedDataOpen) {
    // Open state
    content.style.display = 'block';
    uploadedPanel.style.setProperty('height', '6.75rem', 'important');
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    // Closed state  
    content.style.display = 'none';
    uploadedPanel.style.setProperty('height', '2.75rem', 'important');
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  // Reposition panels
  setTimeout(() => placePanels(), 50);
}

function initPanelToggles() {
  // Public data toggle
  const publicHeader = document.querySelector('.public-data-header');
  if (publicHeader) {
    publicHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Public header clicked');
      togglePublicData();
    });
    console.log('Public data toggle initialized');
  } else {
    console.log('Public data header not found');
  }
  
  // Uploaded data toggle
  const uploadedHeader = document.querySelector('.uploaded-panel-header');
  if (uploadedHeader) {
    uploadedHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Uploaded header clicked');
      toggleUploadedData();
    });
    console.log('Uploaded data toggle initialized');
  } else {
    console.log('Uploaded data header not found');
  }
}

function initH3SectionToggles() {
  const showButtons = document.querySelectorAll('.show-button');
  
  showButtons.forEach(button => {
    button.addEventListener('click', function() {
      setTimeout(() => {
        placePanels();
      }, 100);
    });
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing panels');
  
  // Initial panel positioning
  placePanels();
  
  // Initialize toggle functionality
  initPanelToggles();
  
  // Initialize section toggles
  initH3SectionToggles();
  
  // Handle window resize
  window.addEventListener('resize', placePanels);
});

// Export functions to window for external access
window.placePanels = placePanels;