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

function initPublicDataToggle() {
  document.addEventListener('DOMContentLoaded', function () {
    const panelHeader = document.querySelector('.panel-header');
    const chevronPath = document.getElementById('public-chevron-path');
    const publicContent = document.getElementById('public-data-content');

    if (!panelHeader || !chevronPath || !publicContent) return;

    panelHeader.addEventListener('click', function () {
      const isOpen = publicContent.style.display !== 'none';
      
      publicContent.style.display = isOpen ? 'none' : 'block';
      chevronPath.setAttribute('d', 
        isOpen
          ? 'm18 12-6-6-6 6m12 6-6-6-6 6'
          : 'm6 6 6 6 6-6M6 12l6 6 6-6'
      );
      
      requestAnimationFrame(placePanels);
    });
  });
}

function initUploadedDataToggle() {
  document.addEventListener('DOMContentLoaded', function () {
    const panelHeader = document.querySelector('.uploaded-panel-header');
    const chevronPath = document.getElementById('uploaded-chevron-path');
    const uploadedContent = document.getElementById('uploaded-data-content');

    if (!panelHeader || !chevronPath || !uploadedContent) return;

    panelHeader.addEventListener('click', function () {
      const isOpen = uploadedContent.style.display !== 'none';
      
      uploadedContent.style.display = isOpen ? 'none' : 'block';
      chevronPath.setAttribute('d',
        isOpen
          ? 'm18 12-6-6-6 6m12 6-6-6-6 6'
          : 'm6 6 6 6 6-6M6 12l6 6 6-6'
      );
      
      requestAnimationFrame(placePanels);
    });
  });
}

function initSelect2() {
}

function initH3SectionToggles() {
  document.addEventListener('DOMContentLoaded', function() {
    const showButtons = document.querySelectorAll('.show-button');
    
    showButtons.forEach(button => {
      button.addEventListener('click', function() {
        setTimeout(() => {
          placePanels();
        }, 100);
      });
    });
  });
}

function initPanels() {
  document.addEventListener('DOMContentLoaded', () => {
    placePanels();
    window.addEventListener('resize', placePanels);
  });

  initPublicDataToggle();
  initUploadedDataToggle();
  initSelect2();
  initH3SectionToggles();
}

window.placePanels = placePanels;
window.initPanels = initPanels;

initPanels();