import { updateSelectedLayers, updateLegend } from './map.js';

const STORAGE_KEY = 'geo_tide_saved_views';
let lastLoadedState = null;
let editingId = null;

/**
 * Capture current UI state
 */
export function extractStateFromApp() {
  const state = {
    public_layers: {},
    uploaded_layers: $('#usefiles-data-ajax').val() || [],
    dropdowns: {
      'area-layer-dropdown': document.getElementById('area-layer-dropdown')?.value || 'None'
    }
  };

  // Capture all checkbox states
  document.querySelectorAll('#layer-selection input[type="checkbox"]:not(.zef-sub-layer-checkbox)')
    .forEach(cb => {
      const label = cb.nextSibling?.textContent?.trim();
      if (label) state.public_layers[label] = cb.checked;
    });

  return state;
}

/**
 * Apply state to existing UI components
 */
export async function applyStateToApp(state) {
  // 1. Area Dropdown
  const areaDropdown = document.getElementById('area-layer-dropdown');
  if (areaDropdown) {
    areaDropdown.value = state.dropdowns['area-layer-dropdown'] || 'None';
    $(areaDropdown).trigger('change');
  }

  // 2. Checkboxes
  document.querySelectorAll('#layer-selection input[type="checkbox"]:not(.zef-sub-layer-checkbox)')
    .forEach(cb => {
      const label = cb.nextSibling?.textContent?.trim();
      if (label && state.public_layers.hasOwnProperty(label)) {
        cb.checked = state.public_layers[label];
        $(cb).trigger('change');
      }
    });

  // 3. Uploaded Layers (Select2)
  const $select = $('#usefiles-data-ajax');
  if ($select.length) {
    const currentOptions = Array.from($select[0].options).map(o => o.value);
    const missing = state.uploaded_layers.filter(url => !currentOptions.includes(url));
    
    if (missing.length > 0) {
      alert("Some uploaded data layers from this view are missing and need to be re-uploaded.");
    }
    
    const available = state.uploaded_layers.filter(url => currentOptions.includes(url));
    $select.val(available).trigger('change');
  }

  // Sync map
  await updateSelectedLayers();
  updateLegend();
  lastLoadedState = state;
}

export function loadViews() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveViewsToStorage(views) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

function getLayerSummary(state) {
  let publicCount = 0;
  for (let key in state.public_layers) {
    if (state.public_layers[key]) publicCount++;
  }
  if (state.dropdowns['area-layer-dropdown'] && state.dropdowns['area-layer-dropdown'] !== 'None') {
    publicCount++;
  }
  const uploadedCount = state.uploaded_layers.length;
  const parts = [];
  if (publicCount > 0) parts.push(`${publicCount} Public Layer${publicCount !== 1 ? 's' : ''}`);
  if (uploadedCount > 0) parts.push(`${uploadedCount} Uploaded Layer${uploadedCount !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : 'No layers active';
}

export function renderViews() {
  const views = loadViews();
  const list = document.querySelector('.saved-views-list');
  if (!list) return;

  list.innerHTML = views.map(view => `
    <div class="saved-view-item" data-id="${view.id}">
      <div class="view-main">
        ${editingId === view.id ? `
          <input type="text" class="rename-input" value="${view.name}" autofocus>
        ` : `
          <div class="view-title">${view.name}</div>
          <div class="view-meta">${getLayerSummary(view.state)}</div>
        `}
      </div>
      <div class="view-actions">
        <button class="icon-btn edit-btn" title="Rename">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13.446 3.87397C13.7984 3.52168 13.9964 3.04382 13.9965 2.54553C13.9965 2.04725 13.7986 1.56934 13.4463 1.21696C13.094 0.86457 12.6162 0.666566 12.1179 0.666504C11.6196 0.666441 11.1417 0.864325 10.7893 1.21662L1.89416 10.1138C1.73941 10.2681 1.62497 10.4581 1.56091 10.667L0.680457 13.5676C0.663231 13.6252 0.66193 13.6865 0.676692 13.7448C0.691453 13.8031 0.721727 13.8564 0.764301 13.8989C0.806874 13.9414 0.86016 13.9716 0.918504 13.9862C0.976849 14.0009 1.03808 13.9995 1.09569 13.9822L3.99698 13.1024C4.20571 13.0389 4.39567 12.9252 4.55018 12.7711L13.446 3.87397Z" stroke="#020618" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="icon-btn update-btn" title="Update with current state">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.99951 7.99805C1.99951 6.40714 2.6315 4.88139 3.75644 3.75644C4.88139 2.6315 6.40714 1.99951 7.99805 1.99951C9.675 2.00582 11.2846 2.66017 12.4903 3.82573L13.9966 5.33203" stroke="#020618" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.9966 1.99951V5.33203H10.6641" stroke="#020618" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.9966 7.99805C13.9966 9.58896 13.3646 11.1147 12.2397 12.2397C11.1147 13.3646 9.58896 13.9966 7.99805 13.9966C6.32109 13.9903 4.7115 13.3359 3.50581 12.1704L1.99951 10.6641" stroke="#020618" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.33203 10.6641H1.99951V13.9966" stroke="#020618" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="icon-btn delete-btn" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.99951 3.99902H13.9966" stroke="#E7000B" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.6636 3.99902V13.3301C12.6636 13.9966 11.9971 14.6631 11.3306 14.6631H4.66553C3.99902 14.6631 3.33252 13.9966 3.33252 13.3301V3.99902" stroke="#E7000B" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5.33203 3.99902V2.66602C5.33203 1.99951 5.99854 1.33301 6.66504 1.33301H9.33105C9.99756 1.33301 10.6641 1.99951 10.6641 2.66602V3.99902" stroke="#E7000B" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.66504 7.33154V11.3306" stroke="#E7000B" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.33105 7.33154V11.3306" stroke="#E7000B" stroke-width="1.33301" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // Attach rename events if editing
  if (editingId) {
    const input = list.querySelector('.rename-input');
    if (input) {
      input.addEventListener('blur', () => handleRename(editingId, input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleRename(editingId, input.value);
        if (e.key === 'Escape') { editingId = null; renderViews(); }
      });
      input.select();
    }
  }

  // Trigger panel positioning update
  if (window.placePanels) window.placePanels();
}

export function handleSave() {
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    month: '2-digit', day: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });
  
  const newState = extractStateFromApp();
  const newView = {
    id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    name: `Saved View - ${timestamp}`,
    timestamp: now.toISOString(),
    state: newState
  };

  const views = loadViews();
  views.unshift(newView);
  saveViewsToStorage(views);
  lastLoadedState = newState;
  renderViews();
}

export function handleLoad(id) {
  const views = loadViews();
  const view = views.find(v => v.id === id);
  if (!view) return;

  const currentState = extractStateFromApp();
  const hasChanges = lastLoadedState && JSON.stringify(currentState) !== JSON.stringify(lastLoadedState);

  if (hasChanges) {
    showModal(
      "Unsaved Changes",
      "You have unsaved changes to your current view. Loading a new view will overwrite them. Proceed?", 
      () => applyStateToApp(view.state)
    );
  } else {
    applyStateToApp(view.state);
  }
}

export function handleUpdate(id) {
  const views = loadViews();
  const index = views.findIndex(v => v.id === id);
  if (index === -1) return;

  const newState = extractStateFromApp();
  views[index].state = newState;
  views[index].timestamp = new Date().toISOString();
  
  saveViewsToStorage(views);
  lastLoadedState = newState;
  renderViews();

  const item = document.querySelector(`.saved-view-item[data-id="${id}"]`);
  item?.classList.add('flash-success');
  setTimeout(() => item?.classList.remove('flash-success'), 1000);
}

export function handleDelete(id) {
  const views = loadViews();
  const view = views.find(v => v.id === id);
  if (!view) return;

  showModal(
    "Delete View",
    `Are you sure you want to delete "${view.name}"? This action cannot be undone.`, 
    () => {
      const updated = views.filter(v => v.id !== id);
      saveViewsToStorage(updated);
      renderViews();
    },
    true
  );
}

export function handleRename(id, newName) {
  if (!newName.trim()) { editingId = null; renderViews(); return; }
  const views = loadViews();
  const view = views.find(v => v.id === id);
  if (view) {
    view.name = newName.trim();
    saveViewsToStorage(views);
  }
  editingId = null;
  renderViews();
}

function showModal(title, text, onConfirm, isDestructive = false) {
  const modal = document.getElementById('saved-views-modal');
  const titleEl = modal.querySelector('.modal-title');
  const textEl = modal.querySelector('.modal-text');
  const confirmBtn = modal.querySelector('.confirm-btn');
  const cancelBtns = modal.querySelectorAll('.cancel-btn');

  if (!modal || !textEl || !confirmBtn) return;

  if (titleEl) titleEl.textContent = title;
  textEl.textContent = text;
  
  if (isDestructive) {
    confirmBtn.style.background = 'var(--theme-destructive, #E7000B)';
  } else {
    confirmBtn.style.background = 'var(--Foreground-Blue, #155DFC)';
  }

  modal.style.display = 'flex';

  const cleanup = () => {
    modal.style.display = 'none';
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtns.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
  };

  modal.querySelector('.confirm-btn').onclick = () => { onConfirm(); cleanup(); };
  modal.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.onclick = cleanup;
  });
}

// Initialization
export function initSavedViews() {
  renderViews();
  
  const saveBtn = document.querySelector('.save-view-btn');
  if (saveBtn) saveBtn.onclick = handleSave;
  
  const list = document.querySelector('.saved-views-list');
  if (list) {
    list.onclick = (e) => {
      const item = e.target.closest('.saved-view-item');
      if (!item) return;
      const id = item.dataset.id;

      if (e.target.closest('.edit-btn')) {
        editingId = id;
        renderViews();
      } else if (e.target.closest('.update-btn')) {
        handleUpdate(id);
      } else if (e.target.closest('.delete-btn')) {
        handleDelete(id);
      } else if (e.target.closest('.view-main')) {
        handleLoad(id);
      }
    };
  }
}
