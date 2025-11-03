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
let publicDataOpen = true;
let uploadedDataOpen = true;

function togglePublicData() {
  const content = document.getElementById('public-data-content');
  const chevron = document.getElementById('public-chevron-path');
  const layerSelection = document.getElementById('layer-selection');
  const header = document.querySelector('.public-data-header');
  
  if (!content || !chevron || !layerSelection || !header) return;
  
  publicDataOpen = !publicDataOpen;
  
  if (publicDataOpen) {
    content.style.display = 'block';
    layerSelection.style.height = '35rem';
    layerSelection.style.width = '19.5rem';
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
    header.classList.remove('closed');
  } else {
    content.style.display = 'none';
    layerSelection.style.height = '2.5rem';
    layerSelection.style.width = '10rem';
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
    header.classList.add('closed');
  }
  
  setTimeout(() => placePanels(), 50);
}

function toggleUploadedData() {
  const content = document.getElementById('uploaded-data-content');
  const chevron = document.getElementById('uploaded-chevron-path');
  const uploadedPanel = document.getElementById('uploaded-layer-selection');
  
  if (!content || !chevron || !uploadedPanel) return;
  
  uploadedDataOpen = !uploadedDataOpen;
  
  if (uploadedDataOpen) {
    content.style.display = 'block';
    uploadedPanel.style.height = '6.75rem';
    uploadedPanel.style.width = '19.5rem';
    chevron.setAttribute('d', 'm6 6 6 6 6-6M6 12l6 6 6-6');
  } else {
    content.style.display = 'none';
    uploadedPanel.style.height = '2.5rem';
    uploadedPanel.style.width = '11.75rem';
    chevron.setAttribute('d', 'm18 12-6-6-6 6m12 6-6-6-6 6');
  }
  
  setTimeout(() => placePanels(), 50);
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
  setTimeout(() => placePanels(), 50);
  initPanelToggles();
  initH3SectionToggles();
  window.addEventListener('resize', placePanels);
});

window.placePanels = placePanels;