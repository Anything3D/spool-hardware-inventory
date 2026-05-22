// ==========================================================================
// NEXIS INVENTORY - CORE ENGINE
// ==========================================================================

// Global Application State
let spools = [];
let hardware = [];
let activeTab = 'dashboard';
let searchQuery = '';
let theme = 'dark';
let suppressAutoSync = false;
let autoSyncTimer = null;
let hasFetchedFromCloud = false;

// DOM Elements
const views = document.querySelectorAll('.app-view');
const navButtons = document.querySelectorAll('.nav-btn');
const globalSearch = document.getElementById('global-search');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const btnQuickAdd = document.getElementById('btn-quick-add');

// Cloud Sync DOM Elements
const cloudApiUrlInput = document.getElementById('cloud-api-url');
const cloudAutoSyncToggle = document.getElementById('cloud-auto-sync-toggle');
const btnCloudPull = document.getElementById('btn-cloud-pull');
const btnCloudPush = document.getElementById('btn-cloud-push');
const cloudStatusText = document.getElementById('cloud-sync-status-text');
const cloudStatusIcon = document.getElementById('cloud-sync-status-icon');

// Modals & Forms
const modalSpool = document.getElementById('modal-spool');
const modalHardware = document.getElementById('modal-hardware');
const formSpool = document.getElementById('form-spool');
const formHardware = document.getElementById('form-hardware');

// Modal Toggles & Controls
const btnAddSpool = document.getElementById('btn-add-spool');
const btnAddHardware = document.getElementById('btn-add-hardware');
const btnCloseSpoolModal = document.getElementById('btn-close-spool-modal');
const btnCloseHardwareModal = document.getElementById('btn-close-hardware-modal');
const btnCancelSpool = document.getElementById('btn-cancel-spool');
const btnCancelHardware = document.getElementById('btn-cancel-hardware');
const spoolColorPicker = document.getElementById('spool-color-picker');
const spoolHexInput = document.getElementById('spool-hex');

// Filters
const filterSpoolMaterial = document.getElementById('filter-spool-material');
const filterSpoolStatus = document.getElementById('filter-spool-status');
const filterHardwareType = document.getElementById('filter-hardware-type');
const filterHardwareSize = document.getElementById('filter-hardware-size');

// CSV Elements
const csvImportText = document.getElementById('csv-import-text');
const csvFileDropzone = document.getElementById('csv-file-dropzone');
const csvFileInput = document.getElementById('csv-file-input');
const btnRunImport = document.getElementById('btn-run-import');
const btnExportSpools = document.getElementById('btn-export-spools');
const btnExportHardware = document.getElementById('btn-export-hardware');
const btnLoadMockData = document.getElementById('btn-load-mock-data');

// Spools & Hardware list targets
const spoolsContainer = document.getElementById('spools-list-container');
const hardwareTbody = document.getElementById('hardware-list-tbody');

// Stats Targets
const dashTotalWeight = document.getElementById('dash-total-weight');
const dashSpoolsCount = document.getElementById('dash-spools-count');
const dashLowSpools = document.getElementById('dash-low-spools');
const dashTotalHardware = document.getElementById('dash-total-hardware');
const dashHardwareTypes = document.getElementById('dash-hardware-types');
const dashLowHardware = document.getElementById('dash-low-hardware');
const materialBarChart = document.getElementById('material-bar-chart');
const activityFeed = document.getElementById('activity-feed');

// Standard Premium Mock Data
const MOCK_SPOOLS = [
    { id: 'sp-1', brand: 'Prusament', material: 'PLA', color: 'Galaxy Black', hex: '#111215', qty: 3, reorder: 1, location: 'Drybox A', notes: 'Gorgeous metallic sparkle, print temp: 215C' },
    { id: 'sp-2', brand: 'Polymaker', material: 'PETG', color: 'Teal Blue', hex: '#00a3a6', qty: 2, reorder: 1, location: 'Shelf 1', notes: 'Sturdy, good bed adhesion at 80C, nozzle 240C' },
    { id: 'sp-3', brand: 'Hatchbox', material: 'PLA', color: 'Fire Red', hex: '#d01c1c', qty: 0, reorder: 1, location: 'Drybox B', notes: 'Out of stock! Flow rate 0.98. Standard everyday red' },
    { id: 'sp-4', brand: 'Polymaker', material: 'TPU', color: 'Neon Green', hex: '#39ff14', qty: 1, reorder: 1, location: 'Shelf 2', notes: '95A hardness, print slowly (25mm/s)' },
    { id: 'sp-5', brand: 'eSUN', material: 'ABS', color: 'Cool Gray', hex: '#808588', qty: 4, reorder: 2, location: 'Enclosure Drawer', notes: 'Acetone vapor smoothing works perfectly' },
    { id: 'sp-6', brand: 'MatterHackers', material: 'Nylon', color: 'Natural White', hex: '#f0f2f5', qty: 1, reorder: 1, location: 'Drybox A', notes: 'Requires drying before use. Super tough structural parts.' },
    { id: 'sp-7', brand: 'Fiberlogy', material: 'ASA', color: 'Graphite Grey', hex: '#44464a', qty: 2, reorder: 1, location: 'Shelf 1', notes: 'UV resistant, exterior parts' }
];

const MOCK_HARDWARE = [
    { id: 'hw-1', name: 'M3x12 Button Head Screws', type: 'Screw', size: 'M3', length: '12', head: 'Button Head Hex', material: 'Stainless Steel A2', location: 'Organizer Bin A1', qty: 150, reorder: 30 },
    { id: 'hw-2', name: 'M3x8 Socket Cap Bolts', type: 'Screw', size: 'M3', length: '8', head: 'Socket Cap Hex', material: 'Alloy Steel 12.9 (Black)', location: 'Organizer Bin A2', qty: 12, reorder: 40 },
    { id: 'hw-3', name: 'M4x16 Flat Head Screws', type: 'Screw', size: 'M4', length: '16', head: 'Flat Counter-sunk', material: 'Stainless Steel A2', location: 'Organizer Bin B4', qty: 85, reorder: 25 },
    { id: 'hw-4', name: 'M3 Hex Nuts', type: 'Nut', size: 'M3', length: 'N/A', head: 'Standard Hex', material: 'Zinc Plated Steel', location: 'Organizer Bin D1', qty: 250, reorder: 50 },
    { id: 'hw-5', name: 'M3 Lock Nuts (Nyloc)', type: 'Nut', size: 'M3', length: 'N/A', head: 'Nyloc Hex', material: 'Stainless Steel A2', location: 'Organizer Bin D2', qty: 8, reorder: 25 },
    { id: 'hw-6', name: 'M3 Short Heat-Set Inserts', type: 'Insert', size: 'M3', length: '4.2', head: 'Knurled Insert', material: 'Brass', location: 'Insert Jar', qty: 95, reorder: 20 },
    { id: 'hw-7', name: 'M5 Threaded Brass Inserts', type: 'Insert', size: 'M5', length: '9.5', head: 'Knurled Insert', material: 'Brass', location: 'Insert Jar', qty: 40, reorder: 15 },
    { id: 'hw-8', name: '608ZZ Ball Bearings', type: 'Bearing', size: 'N/A', length: '8x22x7', head: 'Double Shielded', material: 'Chrome Steel', location: 'Bearing Tray', qty: 24, reorder: 8 },
    { id: 'hw-9', name: 'M4 Washers', type: 'Washer', size: 'M4', length: '0.8', head: 'Flat Washer', material: 'Stainless Steel A2', location: 'Organizer Bin E2', qty: 180, reorder: 30 }
];

// ==========================================================================
// INITIALIZATION & LIFECYCLE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Load from local storage or set defaults
    suppressAutoSync = true;
    loadDatabase();
    
    // Wire up Sidebar Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-tab');
            switchTab(targetView);
        });
    });

    // Wire up Forms & Modals
    setupModals();
    
    // Wire up Search & Filtering
    setupFiltersAndSearch();

    // Wire up Sync Actions
    setupSyncEngine();

    // Visual elements init
    spoolColorPicker.addEventListener('input', (e) => {
        spoolHexInput.value = e.target.value;
    });
    spoolHexInput.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            spoolColorPicker.value = e.target.value;
        }
    });

    // Render initially
    renderAll();
    suppressAutoSync = false;

    // Automatically trigger cloud pull on startup if a valid URL is pre-filled
    const startupUrl = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
    if (startupUrl) {
        setTimeout(() => {
            fetchFromCloud();
        }, 300);
    }
});

// Switch Tab Router
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update navigation button active styles
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Switch view containers with dynamic classes
    views.forEach(view => {
        if (view.getAttribute('id') === `view-${tabId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Custom updates per view
    if (tabId === 'dashboard') {
        updateDashboardCharts();
    }
}

// Storage Helpers
function loadDatabase() {
    const savedSpools = localStorage.getItem('nexis_spools');
    const savedHardware = localStorage.getItem('nexis_hardware');
    const savedTheme = localStorage.getItem('nexis_theme') || 'dark';

    spools = savedSpools ? JSON.parse(savedSpools) : [];
    hardware = savedHardware ? JSON.parse(savedHardware) : [];
    theme = savedTheme;

    // Apply Theme
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleIcon();

    // Load Cloud Sync settings
    const defaultCloudUrl = 'https://script.google.com/macros/s/AKfycbyv741_V2lF6bcEne1YeS3gpGVkqqF-PnR7tv0zwji0iCX5XRkpTf2wQeh2qc2O639B/exec';
    const savedCloudUrl = localStorage.getItem('nexis_cloud_url') || defaultCloudUrl;
    const savedAutoSync = localStorage.getItem('nexis_cloud_auto_sync') !== 'false';
    
    if (cloudApiUrlInput) {
        cloudApiUrlInput.value = savedCloudUrl;
        if (!localStorage.getItem('nexis_cloud_url')) {
            localStorage.setItem('nexis_cloud_url', defaultCloudUrl);
        }
        if (localStorage.getItem('nexis_cloud_auto_sync') === null) {
            localStorage.setItem('nexis_cloud_auto_sync', 'true');
        }
    }
    if (cloudAutoSyncToggle) {
        cloudAutoSyncToggle.checked = savedAutoSync;
    }

    // Automatically migrate old weight-based schema to new quantity-based schema
    let migrated = false;
    if (spools.length > 0) {
        spools = spools.map(sp => {
            if (sp.qty === undefined) {
                migrated = true;
                const rem = parseFloat(sp.remWeight) || 0;
                const tot = parseFloat(sp.totalWeight) || 1000;
                const guessedQty = rem > 0 ? Math.ceil(rem / tot) || 1 : 0;
                
                return {
                    id: sp.id,
                    brand: sp.brand || 'Generic',
                    material: sp.material || 'PLA',
                    color: sp.color || 'Default',
                    hex: sp.hex || '#6366f1',
                    qty: guessedQty,
                    reorder: rem <= 250 && rem > 0 ? guessedQty : 1,
                    location: sp.location || '',
                    notes: sp.notes || ''
                };
            }
            return sp;
        });
    }

    // If database is completely empty (first run), seed with mock data
    if (spools.length === 0 && hardware.length === 0) {
        spools = [...MOCK_SPOOLS];
        hardware = [...MOCK_HARDWARE];
        saveDatabase();
        logActivity('Initialized inventory with beautiful mock database demo data', 'info');
    } else if (migrated) {
        saveDatabase();
        logActivity('Successfully migrated local database to quantity-based spool schema', 'success');
    }

    // Update dynamic filters based on loaded data
    populateMaterialAndSizeFilters();
}

function saveDatabase() {
    localStorage.setItem('nexis_spools', JSON.stringify(spools));
    localStorage.setItem('nexis_hardware', JSON.stringify(hardware));
    
    // Update Sync metadata labels
    document.getElementById('spools-export-meta').innerText = `${spools.length} spools in database`;
    document.getElementById('hardware-export-meta').innerText = `${hardware.length} hardware items in database`;
}

function logActivity(text, type = 'info') {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;

    // Prepend new activity
    const item = document.createElement('div');
    item.className = `activity-item ${type}`;
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    item.innerHTML = `
        <div class="activity-marker"></div>
        <div class="activity-body">
            <p class="activity-title">${text}</p>
            <p class="activity-time">${timeString}</p>
        </div>
    `;
    
    if (activityFeed.children.length > 5 && activityFeed.querySelector('.chart-placeholder')) {
        activityFeed.innerHTML = ''; // Wipe placeholder
    }
    
    activityFeed.insertBefore(item, activityFeed.firstChild);
}

// ==========================================================================
// DOM RENDERING ENGINE
// ==========================================================================

function renderAll() {
    renderDashboardStats();
    renderSpools();
    renderHardware();
    saveDatabase();

    // Trigger auto-sync if active, URL is set, and not suppressed
    if (cloudAutoSyncToggle && cloudAutoSyncToggle.checked && !suppressAutoSync) {
        const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
        if (url) {
            debounceAutoSync();
        }
    }
}

function renderDashboardStats() {
    // 1. Spools Total Quantity
    const totalSpoolsQty = spools.reduce((acc, sp) => acc + (parseInt(sp.qty) || 0), 0);
    dashTotalWeight.innerText = `${totalSpoolsQty} spools`;
    dashSpoolsCount.innerText = `${spools.length} unique color/materials`;

    // 2. Low Spools Alert (qty <= reorder limit)
    const lowSpoolsCount = spools.filter(sp => (parseInt(sp.qty) || 0) <= (parseInt(sp.reorder) || 0)).length;
    dashLowSpools.innerText = lowSpoolsCount;
    const alertCard = dashLowSpools.closest('.stat-card');
    if (lowSpoolsCount > 0) {
        alertCard.classList.add('amber-glow');
        alertCard.querySelector('.stat-icon-wrapper').classList.add('warning');
    } else {
        alertCard.classList.remove('amber-glow');
    }

    // 3. Hardware Pieces Total count
    const totalHwQty = hardware.reduce((acc, hw) => acc + (parseInt(hw.qty) || 0), 0);
    dashTotalHardware.innerText = totalHwQty.toLocaleString();
    dashHardwareTypes.innerText = `${hardware.length} unique fastener types`;

    // 4. Low Hardware Alert (qty <= reorder threshold)
    const lowHwCount = hardware.filter(hw => hw.qty <= hw.reorder).length;
    dashLowHardware.innerText = lowHwCount;
    const hwAlertCard = dashLowHardware.closest('.stat-card');
    if (lowHwCount > 0) {
        hwAlertCard.classList.add('red-glow');
        hwAlertCard.querySelector('.stat-icon-wrapper').classList.add('danger');
    } else {
        hwAlertCard.classList.remove('red-glow');
    }

    updateDashboardCharts();
}

function updateDashboardCharts() {
    if (!materialBarChart) return;
    
    // Sum quantities by material type
    const distribution = {};
    spools.forEach(sp => {
        const mat = sp.material || 'Other';
        distribution[mat] = (distribution[mat] || 0) + (parseInt(sp.qty) || 0);
    });

    // Check if empty
    if (Object.keys(distribution).length === 0) {
        materialBarChart.innerHTML = '<div class="chart-placeholder">No materials available. Sync your sheet!</div>';
        return;
    }

    // Find maximum quantity to calculate percentages
    const maxQty = Math.max(...Object.values(distribution), 5);

    // Build the visual rows dynamically
    materialBarChart.innerHTML = '';
    
    // Sort materials by total quantity descending
    const sortedMaterials = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

    sortedMaterials.forEach(([material, qty]) => {
        const row = document.createElement('div');
        row.className = 'chart-row';
        
        const percentage = Math.min((qty / maxQty) * 100, 100);
        
        row.innerHTML = `
            <div class="chart-row-meta">
                <span class="chart-material-label">${material}</span>
                <span class="chart-weight-value">${qty} ${qty === 1 ? 'spool' : 'spools'}</span>
            </div>
            <div class="chart-bar-outer">
                <div class="chart-bar-inner" style="width: 0%; background: linear-gradient(to right, var(--primary), var(--secondary))"></div>
            </div>
        `;
        
        materialBarChart.appendChild(row);
        
        // Micro-timeout to animate progress bar width sliding out beautifully
        setTimeout(() => {
            row.querySelector('.chart-bar-inner').style.width = `${percentage}%`;
        }, 50);
    });
}

function renderSpools() {
    if (!spoolsContainer) return;
    
    // Get filter states
    const materialFilter = filterSpoolMaterial.value;
    const statusFilter = filterSpoolStatus.value;
    
    // Filter the items list
    const filtered = spools.filter(sp => {
        // Global search match
        const matchesSearch = searchQuery === '' || 
            sp.brand.toLowerCase().includes(searchQuery) ||
            sp.material.toLowerCase().includes(searchQuery) ||
            sp.color.toLowerCase().includes(searchQuery) ||
            sp.location.toLowerCase().includes(searchQuery);

        // Material match
        const matchesMaterial = materialFilter === 'all' || sp.material === materialFilter;

        // Status match
        let matchesStatus = true;
        const qty = parseInt(sp.qty) || 0;
        const reorder = parseInt(sp.reorder) || 0;
        if (statusFilter === 'active') {
            matchesStatus = qty > reorder;
        } else if (statusFilter === 'low') {
            matchesStatus = qty <= reorder && qty > 0;
        } else if (statusFilter === 'empty') {
            matchesStatus = qty <= 0;
        }

        return matchesSearch && matchesMaterial && matchesStatus;
    });

    if (filtered.length === 0) {
        spoolsContainer.innerHTML = `
            <div class="view-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p>No matching spools found in your inventory.</p>
            </div>
        `;
        return;
    }

    spoolsContainer.innerHTML = '';
    
    filtered.forEach(sp => {
        const card = document.createElement('div');
        card.className = 'spool-card glass-panel';
        card.setAttribute('style', `--accent-color: ${sp.hex}; --glow-color: ${sp.hex}0a;`);
        
        const qty = parseInt(sp.qty) || 0;
        const reorder = parseInt(sp.reorder) || 0;

        // Define stock levels
        let statusLabel = 'In Stock';
        let statusClass = 'good';
        if (qty <= 0) {
            statusLabel = 'Out of Stock';
            statusClass = 'out';
        } else if (qty <= reorder) {
            statusLabel = 'Low Stock';
            statusClass = 'low';
        }

        // Location / shelf string
        const locationStr = sp.location ? sp.location : 'N/A';

        card.innerHTML = `
            <div class="spool-card-actions">
                <button class="icon-only-btn edit-spool" data-id="${sp.id}" title="Edit spool details">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="icon-only-btn delete-icon delete-spool" data-id="${sp.id}" title="Delete spool">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>

            <div class="spool-card-header">
                <div class="spool-brand-material">
                    <span class="spool-brand">${sp.brand}</span>
                    <span class="spool-material-badge">${sp.material}</span>
                </div>
                <span class="status-pill ${statusClass}">
                    <span class="status-indicator"></span>
                    <span>${statusLabel}</span>
                </span>
            </div>

            <div class="spool-visual-section">
                <!-- Large vector avatar spinning slow on hover -->
                <div class="spool-avatar-wrapper" style="background: radial-gradient(circle, ${sp.hex}22, ${sp.hex}05); border: 1.5px solid ${sp.hex}30; box-shadow: 0 8px 20px ${sp.hex}18;">
                    <svg class="spool-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="${sp.hex}" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"></path>
                    </svg>
                </div>

                <div class="spool-details-list">
                    <div class="spool-detail-row">
                        <span>Color:</span>
                        <span class="spool-detail-value" style="color: ${sp.hex}; font-weight: 700;">${sp.color}</span>
                    </div>
                    <div class="spool-detail-row">
                        <span>Cabinet:</span>
                        <span class="spool-detail-value">${locationStr}</span>
                    </div>
                    <div class="spool-detail-row">
                        <span>Alert Limit:</span>
                        <span class="spool-detail-value">&le; ${reorder} units</span>
                    </div>
                </div>
            </div>

            <div class="spool-weight-numbers" style="margin-top: auto; margin-bottom: 16px; align-items: center; justify-content: space-between;">
                <div class="weight-rem" style="font-size: 22px; line-height: 1;">${qty} ${qty === 1 ? 'spool' : 'spools'}</div>
                <!-- Interactive spool quantity counters -->
                <div class="spool-counter">
                    <button class="spool-counter-btn spool-dec" data-id="${sp.id}">-</button>
                    <span class="spool-counter-val">${qty}</span>
                    <button class="spool-counter-btn spool-inc" data-id="${sp.id}">+</button>
                </div>
            </div>

            <!-- Notes Section if exists -->
            ${sp.notes ? `<div style="font-size:11.5px; color:var(--text-muted); font-style:italic; line-height:1.4; margin-bottom: 0px; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;" title="${sp.notes}">${sp.notes}</div>` : ''}
        `;
        
        spoolsContainer.appendChild(card);
    });

    // Wire up events dynamically
    document.querySelectorAll('.spool-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeSpoolQty(id, 1);
        });
    });

    document.querySelectorAll('.spool-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeSpoolQty(id, -1);
        });
    });

    document.querySelectorAll('.edit-spool').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openEditSpoolModal(id);
        });
    });

    document.querySelectorAll('.delete-spool').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteSpool(id);
        });
    });
}

function renderHardware() {
    if (!hardwareTbody) return;
    
    // Get filter states
    const typeFilter = filterHardwareType.value;
    const sizeFilter = filterHardwareSize.value;

    const filtered = hardware.filter(hw => {
        const matchesSearch = searchQuery === '' || 
            hw.name.toLowerCase().includes(searchQuery) ||
            hw.type.toLowerCase().includes(searchQuery) ||
            hw.size.toLowerCase().includes(searchQuery) ||
            hw.material.toLowerCase().includes(searchQuery) ||
            hw.location.toLowerCase().includes(searchQuery);

        const matchesType = typeFilter === 'all' || hw.type === typeFilter;
        
        let matchesSize = true;
        if (sizeFilter !== 'all') {
            if (sizeFilter === 'other') {
                matchesSize = hw.size === 'N/A' || !hw.size.startsWith('M');
            } else {
                matchesSize = hw.size === sizeFilter;
            }
        }

        return matchesSearch && matchesType && matchesSize;
    });

    if (filtered.length === 0) {
        hardwareTbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px; height:36px; margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    <p>No matching hardware items found in your bins.</p>
                </td>
            </tr>
        `;
        return;
    }

    hardwareTbody.innerHTML = '';
    
    filtered.forEach(hw => {
        const tr = document.createElement('tr');
        
        // Define stock levels
        let statusLabel = 'In Stock';
        let statusClass = 'good';
        const qty = parseInt(hw.qty) || 0;
        const limit = parseInt(hw.reorder) || 10;
        
        if (qty <= 0) {
            statusLabel = 'Out of Stock';
            statusClass = 'out';
        } else if (qty <= limit) {
            statusLabel = 'Low Stock';
            statusClass = 'low';
        }

        const sizeStr = hw.size && hw.size !== 'N/A' ? `<span class="code-badge">${hw.size}</span>` : 'N/A';
        const lenStr = hw.length && hw.length !== 'N/A' ? `${hw.length} mm` : 'N/A';

        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--text-primary);">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <span>${hw.name}</span>
                    <span style="font-size:11px; color:var(--text-muted); font-weight:400;">📍 Location: ${hw.location || 'Bin Default'}</span>
                </div>
            </td>
            <td>${hw.type}</td>
            <td>${sizeStr}</td>
            <td>${lenStr}</td>
            <td style="color: var(--text-secondary); font-size: 13px;">${hw.material || 'Steel'}</td>
            <td class="text-center">
                <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                    <span class="status-pill ${statusClass}">
                        <span class="status-indicator"></span>
                        <span>${statusLabel}</span>
                    </span>
                    <span style="font-size: 11.5px; font-weight:700;">${qty} units</span>
                </div>
            </td>
            <td class="text-right">
                <div class="hw-actions-wrapper">
                    <!-- Quantity counters -->
                    <div class="hw-counter">
                        <button class="hw-counter-btn hw-dec" data-id="${hw.id}">-</button>
                        <span class="hw-counter-val">${qty}</span>
                        <button class="hw-counter-btn hw-inc" data-id="${hw.id}">+</button>
                    </div>

                    <!-- Extra action icons -->
                    <button class="icon-only-btn edit-hardware" data-id="${hw.id}" title="Edit part">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-only-btn delete-icon delete-hardware" data-id="${hw.id}" title="Remove part">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </td>
        `;
        
        hardwareTbody.appendChild(tr);
    });

    // Wire up events dynamically
    document.querySelectorAll('.hw-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeHardwareQty(id, 10);
        });
    });

    document.querySelectorAll('.hw-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeHardwareQty(id, -10);
        });
    });

    document.querySelectorAll('.edit-hardware').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openEditHardwareModal(id);
        });
    });

    document.querySelectorAll('.delete-hardware').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteHardware(id);
        });
    });
}

// ==========================================================================
// DATA MUTATIONS & QUICK ACTIONS
// ==========================================================================

function changeSpoolQty(id, diff) {
    const spoolIndex = spools.findIndex(sp => sp.id === id);
    if (spoolIndex === -1) return;

    const spool = spools[spoolIndex];
    spool.qty = Math.max((parseInt(spool.qty) || 0) + diff, 0);

    if (spool.qty <= spool.reorder && (spool.qty - diff) > spool.reorder) {
        logActivity(`Low stock warning! Spool "${spool.brand} ${spool.color}" down to ${spool.qty} spools`, 'warning');
    } else {
        logActivity(`Updated inventory count of "${spool.brand} ${spool.color}" by ${diff > 0 ? '+' : ''}${diff} (Current: ${spool.qty})`, 'info');
    }

    renderAll();
}

function changeHardwareQty(id, diff) {
    const hwIndex = hardware.findIndex(hw => hw.id === id);
    if (hwIndex === -1) return;

    const hw = hardware[hwIndex];
    hw.qty = Math.max(hw.qty + diff, 0);

    if (hw.qty <= hw.reorder && (hw.qty - diff) > hw.reorder) {
        logActivity(`Low stock warning! "${hw.name}" down to ${hw.qty} units`, 'warning');
    } else {
        logActivity(`Updated inventory count of "${hw.name}" by ${diff > 0 ? '+' : ''}${diff}`, 'info');
    }

    renderAll();
}

function deleteSpool(id) {
    const spool = spools.find(sp => sp.id === id);
    const label = spool ? `${spool.brand} ${spool.color}` : 'Unknown Spool';
    
    if (confirm(`Are you sure you want to remove "${label}" from your inventory?`)) {
        spools = spools.filter(sp => sp.id !== id);
        logActivity(`Removed spool "${label}" from stock`, 'warning');
        renderAll();
    }
}

function deleteHardware(id) {
    const hw = hardware.find(h => h.id === id);
    const label = hw ? hw.name : 'Unknown Hardware';

    if (confirm(`Are you sure you want to delete "${label}"?`)) {
        hardware = hardware.filter(h => h.id !== id);
        logActivity(`Deleted item "${label}" from hardware list`, 'warning');
        renderAll();
    }
}

// ==========================================================================
// SEARCH & FILTERS CONTROLLERS
// ==========================================================================

function setupFiltersAndSearch() {
    // Search listener (with debounce for premium feel)
    let searchTimeout;
    globalSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderAll();
        }, 150);
    });

    // Reset filters
    filterSpoolMaterial.addEventListener('change', () => { renderSpools(); });
    filterSpoolStatus.addEventListener('change', () => { renderSpools(); });
    filterHardwareType.addEventListener('change', () => { renderHardware(); });
    filterHardwareSize.addEventListener('change', () => { renderHardware(); });
}

// ==========================================================================
// DIALOGS & MODAL CONTROLLERS
// ==========================================================================

function setupModals() {
    // Show modals
    btnAddSpool.addEventListener('click', () => {
        document.getElementById('modal-spool-title').innerText = 'Add New Filament Spool';
        formSpool.reset();
        document.getElementById('spool-id').value = '';
        spoolColorPicker.value = '#6366f1';
        spoolHexInput.value = '#6366f1';
        modalSpool.showModal();
    });

    btnAddHardware.addEventListener('click', () => {
        document.getElementById('modal-hardware-title').innerText = 'Add New Hardware Item';
        formHardware.reset();
        document.getElementById('hardware-id').value = '';
        modalHardware.showModal();
    });

    // Close on cancel / click out
    [btnCloseSpoolModal, btnCancelSpool].forEach(btn => {
        btn.addEventListener('click', () => modalSpool.close());
    });

    [btnCloseHardwareModal, btnCancelHardware].forEach(btn => {
        btn.addEventListener('click', () => modalHardware.close());
    });

    // Double check click outside modal closes it
    [modalSpool, modalHardware].forEach(modal => {
        modal.addEventListener('click', (e) => {
            const dialogDimensions = modal.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                modal.close();
            }
        });
    });

    // Submit Forms
    formSpool.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSpoolForm();
    });

    formHardware.addEventListener('submit', (e) => {
        e.preventDefault();
        saveHardwareForm();
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nexis_theme', theme);
        updateThemeToggleIcon();
        logActivity(`Switched interface to ${theme} visual theme`, 'info');
    });

    // Header Quick Add
    btnQuickAdd.addEventListener('click', () => {
        if (activeTab === 'hardware') {
            btnAddHardware.click();
        } else {
            btnAddSpool.click(); // Default or spools tab active
        }
    });
}

function updateThemeToggleIcon() {
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    if (theme === 'light') {
        sunIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`; // Moon icon
        themeToggleBtn.title = 'Switch to Dark Mode';
    } else {
        themeToggleBtn.innerHTML = `
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
        themeToggleBtn.title = 'Switch to Light Mode';
    }
}

function openEditSpoolModal(id) {
    const sp = spools.find(s => s.id === id);
    if (!sp) return;

    document.getElementById('modal-spool-title').innerText = 'Edit Spool Details';
    document.getElementById('spool-id').value = sp.id;
    document.getElementById('spool-brand').value = sp.brand;
    document.getElementById('spool-material').value = sp.material;
    document.getElementById('spool-color').value = sp.color;
    document.getElementById('spool-hex').value = sp.hex;
    spoolColorPicker.value = sp.hex || '#6366f1';
    document.getElementById('spool-qty').value = sp.qty !== undefined ? sp.qty : 1;
    document.getElementById('spool-reorder').value = sp.reorder !== undefined ? sp.reorder : 1;
    document.getElementById('spool-location').value = sp.location || '';
    document.getElementById('spool-notes').value = sp.notes || '';

    modalSpool.showModal();
}

function saveSpoolForm() {
    const id = document.getElementById('spool-id').value;
    const spoolData = {
        brand: document.getElementById('spool-brand').value.trim(),
        material: document.getElementById('spool-material').value,
        color: document.getElementById('spool-color').value.trim(),
        hex: document.getElementById('spool-hex').value.trim() || '#6366f1',
        qty: parseInt(document.getElementById('spool-qty').value) || 0,
        reorder: parseInt(document.getElementById('spool-reorder').value) || 0,
        location: document.getElementById('spool-location').value.trim(),
        notes: document.getElementById('spool-notes').value.trim()
    };

    if (id) {
        // Edit Spool
        const idx = spools.findIndex(s => s.id === id);
        if (idx !== -1) {
            spools[idx] = { id, ...spoolData };
            logActivity(`Updated details of spool "${spoolData.brand} ${spoolData.color}"`, 'info');
        }
    } else {
        // Create new Spool
        const newSpool = {
            id: 'sp-' + Date.now(),
            ...spoolData
        };
        spools.push(newSpool);
        logActivity(`Added new spool "${spoolData.brand} ${spoolData.color}" to stock`, 'success');
    }

    renderAll();
    modalSpool.close();
}

function openEditHardwareModal(id) {
    const hw = hardware.find(h => h.id === id);
    if (!hw) return;

    document.getElementById('modal-hardware-title').innerText = 'Edit Hardware Item';
    document.getElementById('hardware-id').value = hw.id;
    document.getElementById('hw-name').value = hw.name;
    document.getElementById('hw-type').value = hw.type;
    document.getElementById('hw-size').value = hw.size || 'M3';
    document.getElementById('hw-length').value = hw.length || '';
    document.getElementById('hw-head').value = hw.head || '';
    document.getElementById('hw-material').value = hw.material || '';
    document.getElementById('hw-location').value = hw.location || '';
    document.getElementById('hw-qty').value = hw.qty;
    document.getElementById('hw-reorder').value = hw.reorder;

    modalHardware.showModal();
}

function saveHardwareForm() {
    const id = document.getElementById('hardware-id').value;
    const hwData = {
        name: document.getElementById('hw-name').value.trim(),
        type: document.getElementById('hw-type').value,
        size: document.getElementById('hw-size').value,
        length: document.getElementById('hw-length').value.trim() || 'N/A',
        head: document.getElementById('hw-head').value.trim() || 'N/A',
        material: document.getElementById('hw-material').value.trim() || 'Steel',
        location: document.getElementById('hw-location').value.trim(),
        qty: parseInt(document.getElementById('hw-qty').value) || 0,
        reorder: parseInt(document.getElementById('hw-reorder').value) || 20
    };

    if (id) {
        // Edit hardware
        const idx = hardware.findIndex(h => h.id === id);
        if (idx !== -1) {
            hardware[idx] = { id, ...hwData };
            logActivity(`Updated details of hardware "${hwData.name}"`, 'info');
        }
    } else {
        // Create new hardware
        const newHw = {
            id: 'hw-' + Date.now(),
            ...hwData
        };
        hardware.push(newHw);
        logActivity(`Created new hardware part "${hwData.name}"`, 'success');
    }

    renderAll();
    modalHardware.close();
}

// ==========================================================================
// GOOGLE SHEETS CSV SYNC BRIDGE
// ==========================================================================

function setupSyncEngine() {
    // Import action trigger
    btnRunImport.addEventListener('click', () => {
        const text = csvImportText.value.trim();
        if (!text) {
            alert('Please paste a CSV string or drag a CSV file first.');
            return;
        }
        runCSVImport(text);
    });

    // Dropzone logic
    csvFileDropzone.addEventListener('click', () => {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleCSVFile(file);
    });

    csvFileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvFileDropzone.style.borderColor = 'var(--primary)';
        csvFileDropzone.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
    });

    csvFileDropzone.addEventListener('dragleave', () => {
        csvFileDropzone.style.borderColor = 'var(--border-color)';
        csvFileDropzone.style.backgroundColor = 'transparent';
    });

    csvFileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        csvFileDropzone.style.borderColor = 'var(--border-color)';
        csvFileDropzone.style.backgroundColor = 'transparent';
        
        const file = e.dataTransfer.files[0];
        if (file) handleCSVFile(file);
    });

    // Standard download triggers
    btnExportSpools.addEventListener('click', () => {
        exportCSVFile(spools, 'nexis_spools_export.csv');
    });

    btnExportHardware.addEventListener('click', () => {
        exportCSVFile(hardware, 'nexis_hardware_export.csv');
    });

    // Demo loader
    btnLoadMockData.addEventListener('click', () => {
        if (confirm('This will replace your current local database with the premium spools & hardware demo pack. Proceed?')) {
            spools = [...MOCK_SPOOLS];
            hardware = [...MOCK_HARDWARE];
            renderAll();
            logActivity('Successfully seeded database with premium inventory demo dataset!', 'success');
            alert('Seeded! Check the Dashboard, Spools, and Hardware views.');
            switchTab('dashboard');
        }
    });

    // Real-time Cloud Sync bindings
    if (cloudApiUrlInput) {
        cloudApiUrlInput.addEventListener('change', () => {
            const url = cloudApiUrlInput.value.trim();
            localStorage.setItem('nexis_cloud_url', url);
            updateCloudStatusLabel('idle');
            logActivity(`Updated Google Sheets cloud sync URL`, 'info');
        });
    }

    if (cloudAutoSyncToggle) {
        cloudAutoSyncToggle.addEventListener('change', () => {
            const checked = cloudAutoSyncToggle.checked;
            localStorage.setItem('nexis_cloud_auto_sync', checked);
            logActivity(`Real-Time Cloud Auto-Sync ${checked ? 'enabled' : 'disabled'}`, 'info');
            if (checked) {
                pushToCloud(true);
            }
        });
    }

    if (btnCloudPull) {
        btnCloudPull.addEventListener('click', () => {
            fetchFromCloud();
        });
    }

    if (btnCloudPush) {
        btnCloudPush.addEventListener('click', () => {
            pushToCloud(false);
        });
    }

    // Initial cloud connection label update
    updateCloudStatusLabel('idle');
}

function handleCSVFile(file) {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please select a valid .csv file exported from Excel or Google Sheets.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        csvImportText.value = text;
        logActivity(`CSV file "${file.name}" loaded into sync parser`, 'info');
        csvFileDropzone.querySelector('strong').innerText = file.name;
    };
    reader.readAsText(file);
}

// Core parsing logic
function runCSVImport(csvText) {
    // Detect delimiter
    const firstLine = csvText.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    // Basic CSV Line splitter (handles double quoted values containing commas)
    const splitCSVLine = (text) => {
        const matches = text.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        // Fallback for simple splitting if regex fails or is weird
        if (matches.length === 0) {
            return text.split(delimiter).map(cell => cell.replace(/^["']|["']$/g, '').trim());
        }
        return matches.map(cell => cell.replace(/^["']|["']$/g, '').trim());
    };

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        alert('Invalid CSV data. Ensure you have column headers and at least one row.');
        return;
    }

    // Capture Headers
    // Split header elements cleanly
    const rawHeaders = lines[0].split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
    
    // Check if it looks like a spool spreadsheet or a hardware spreadsheet
    const isSpoolSheet = rawHeaders.includes('material') || rawHeaders.includes('brand') || rawHeaders.includes('hexcode');
    const isHardwareSheet = rawHeaders.includes('threadsize') || rawHeaders.includes('reorder') || rawHeaders.includes('head');

    if (!isSpoolSheet && !isHardwareSheet) {
        // Fallback guess: if we find thread size or qty, it's hardware
        alert('Unrecognized columns. Please ensure you have headers like Brand, Material, Color OR ThreadSize, Quantity in your CSV.');
        return;
    }

    let importedCount = 0;
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
        // Parse data rows
        const cells = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cells.length < rawHeaders.length) continue; // Skip incomplete lines

        const item = {};
        rawHeaders.forEach((header, index) => {
            item[header] = cells[index];
        });
        parsedData.push(item);
    }

    if (isSpoolSheet) {
        // Map to standard Spools state schema
        const mappedSpools = parsedData.map((row, index) => {
            const brand = row['brand'] || row['manufacturer'] || 'Unknown Brand';
            const material = row['material'] || 'PLA';
            const color = row['color'] || 'Generic Color';
            const hex = row['hexcode'] || row['hex'] || '#6366f1';
            const qty = parseInt(row['quantity'] || row['qty'] || row['count'] || row['spools']) || 1;
            const reorder = parseInt(row['reorderlimit'] || row['reorder'] || row['alert']) || 1;
            const location = row['shelf'] || row['location'] || 'Storage Box';
            const notes = row['notes'] || row['comment'] || '';

            return {
                id: `sp-import-${Date.now()}-${index}`,
                brand, material, color, hex, qty, reorder, location, notes
            };
        });

        spools = mappedSpools;
        importedCount = mappedSpools.length;
        logActivity(`Successfully imported ${importedCount} filament spools from Google Sheets CSV`, 'success');
        alert(`Successfully imported ${importedCount} filament spools! Check the Filament Spools tab.`);
        switchTab('spools');
    } else {
        // Map to standard Hardware state schema
        const mappedHw = parsedData.map((row, index) => {
            const name = row['partname'] || row['name'] || row['title'] || 'M3 Socket Screw';
            const type = row['type'] || row['category'] || 'Screw';
            const size = row['threadsize'] || row['size'] || 'M3';
            const length = row['length'] || row['dimensions'] || 'N/A';
            const head = row['headtype'] || row['head'] || 'N/A';
            const material = row['material'] || 'Stainless Steel';
            const location = row['location'] || row['bin'] || 'Organizer Tray';
            const qty = parseInt(row['quantity'] || row['qty'] || row['count']) || 100;
            const reorder = parseInt(row['reorderlimit'] || row['reorder']) || 20;

            return {
                id: `hw-import-${Date.now()}-${index}`,
                name, type, size, length, head, material, location, qty, reorder
            };
        });

        hardware = mappedHw;
        importedCount = mappedHw.length;
        logActivity(`Successfully imported ${importedCount} hardware fasteners from CSV`, 'success');
        alert(`Successfully imported ${importedCount} hardware fasteners! Check the Hardware Stock tab.`);
        switchTab('hardware');
    }

    renderAll();
}

// Convert state objects array back into clean CSV string
function exportCSVFile(dataArray, filename) {
    if (dataArray.length === 0) {
        alert('Your inventory has 0 items to export.');
        return;
    }

    // Extract headers based on keys of first object, filtering out system ID
    const sample = dataArray[0];
    const keys = Object.keys(sample).filter(k => k !== 'id');
    
    // Header string
    // Format headers user friendly for Google Sheets
    const headersLine = keys.map(k => {
        if (k === 'hex') return 'HexCode';
        if (k === 'qty') return 'Quantity';
        if (k === 'reorder') return 'ReorderLimit';
        return k.charAt(0).toUpperCase() + k.slice(1);
    }).join(',');

    // Rows compilation
    const rows = dataArray.map(item => {
        return keys.map(k => {
            let val = item[k] === undefined || item[k] === null ? '' : item[k];
            // Escape double quotes inside text cells if necessary
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',');
    });

    const csvContent = [headersLine, ...rows].join('\n');
    
    // Browser download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logActivity(`Exported and downloaded ${filename} data sheet`, 'info');
}

// ==========================================================================
// CLOUD SYNC ENGINE - GET / POST INTEGRATION WITH GOOGLE SHEETS
// ==========================================================================

function updateCloudStatusLabel(status = 'idle', details = '') {
    if (!cloudStatusText || !cloudStatusIcon) return;
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';

    if (!url) {
        cloudStatusText.innerHTML = 'Status: <strong>Local storage mode</strong> (database disconnected)';
        cloudStatusIcon.className = 'icon-bubble purple';
        cloudStatusIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
        `;
        return;
    }

    if (status === 'syncing') {
        cloudStatusText.innerHTML = 'Status: <span class="pulse-text" style="color: var(--purple);">Syncing in progress...</span>';
        cloudStatusIcon.className = 'icon-bubble purple';
        cloudStatusIcon.innerHTML = `
            <svg class="loader" style="width:20px; height:20px; border-width:2px; margin-bottom:0; animation:rotation 1s linear infinite;" viewBox="0 0 24 24"></svg>
        `;
    } else if (status === 'success') {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        cloudStatusText.innerHTML = `Status: <strong style="color: var(--success);">Connected & Synced</strong> (Last: ${timeString})`;
        cloudStatusIcon.className = 'icon-bubble purple cloud-pulse';
        cloudStatusIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
    } else if (status === 'error') {
        cloudStatusText.innerHTML = `Status: <strong style="color: var(--danger);">Sync Error</strong> (${details || 'Check console'})`;
        cloudStatusIcon.className = 'icon-bubble purple';
        cloudStatusIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--danger);">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        cloudStatusText.innerHTML = 'Status: <strong>Ready to Sync</strong> (Cloud connected)';
        cloudStatusIcon.className = 'icon-bubble purple cloud-pulse';
        cloudStatusIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
        `;
    }
}

async function fetchFromCloud() {
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
    if (!url) {
        alert('Please enter a valid Google Apps Script Web App URL first.');
        return;
    }

    updateCloudStatusLabel('syncing');
    logActivity('Fetching inventory updates from Google Sheets...', 'info');

    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success') {
            const data = result.data;
            if (data) {
                suppressAutoSync = true;
                
                // Map retrieved data arrays back to application database schema if valid
                if (data.spools && Array.isArray(data.spools)) {
                    spools = data.spools.map((sp, idx) => ({
                        id: sp.id || `sp-cloud-${Date.now()}-${idx}`,
                        brand: sp.brand || 'Generic',
                        material: sp.material || 'PLA',
                        color: sp.color || 'Default',
                        hex: sp.hex || '#6366f1',
                        qty: Number(sp.qty) || 0,
                        reorder: Number(sp.reorder) || 0,
                        location: sp.location || '',
                        notes: sp.notes || ''
                    }));
                }
                if (data.hardware && Array.isArray(data.hardware)) {
                    hardware = data.hardware.map((hw, idx) => ({
                        id: hw.id || `hw-cloud-${Date.now()}-${idx}`,
                        name: hw.name || 'Unknown Item',
                        type: hw.type || 'Screw',
                        size: hw.size || 'M3',
                        length: hw.length || 'N/A',
                        head: hw.head || 'N/A',
                        material: hw.material || 'Stainless Steel',
                        location: hw.location || '',
                        qty: Number(hw.qty) || 0,
                        reorder: Number(hw.reorder) || 20
                    }));
                }
                
                renderAll();
                suppressAutoSync = false;
                hasFetchedFromCloud = true;
                
                updateCloudStatusLabel('success');
                logActivity('Successfully downloaded and merged live Google Sheets database!', 'success');
            } else {
                throw new Error('Data payload missing or empty.');
            }
        } else {
            throw new Error(result.message || 'Unknown server error.');
        }
    } catch (err) {
        console.error('Google Sheets Cloud pull failed:', err);
        updateCloudStatusLabel('error', err.message);
        logActivity(`Google Sheets Fetch Failed: ${err.message}`, 'danger');
        alert(`Failed to fetch from Google Sheets: ${err.message}\nEnsure your Web App URL is deployed with Executed As: "Me" and Who has access: "Anyone".`);
    }
}

async function pushToCloud(isAutoSync = false) {
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
    if (!url) {
        if (!isAutoSync) {
            alert('Please enter a valid Google Apps Script Web App URL first.');
        }
        return;
    }

    // Safety Check: Prevent overwriting the cloud database if we haven't successfully fetched first!
    if (!hasFetchedFromCloud) {
        if (isAutoSync) {
            console.warn('Auto-sync skipped: Fetch has not been performed in this session. Pull data first to avoid overwriting.');
            return;
        } else {
            const confirmPush = confirm(
                'WARNING: You have not fetched the latest data from Google Sheets in this session yet.\n\n' +
                'Pushing now will overwrite all data in your Google Sheet with your local browser data, which may erase newer spreadsheet changes.\n\n' +
                'Are you sure you want to overwrite the Google Sheet?'
            );
            if (!confirmPush) {
                updateCloudStatusLabel('error', 'Push cancelled to prevent data loss.');
                return;
            }
        }
    }

    updateCloudStatusLabel('syncing');
    if (isAutoSync) {
        logActivity('Auto-syncing changes to Google Sheets...', 'info');
    } else {
        logActivity('Pushing local inventory updates to Google Sheets...', 'info');
    }

    try {
        const payload = {
            spools: spools.map(sp => ({
                brand: sp.brand,
                material: sp.material,
                color: sp.color,
                hex: sp.hex,
                qty: Number(sp.qty) || 0,
                reorder: Number(sp.reorder) || 0,
                location: sp.location,
                notes: sp.notes
            })),
            hardware: hardware.map(hw => ({
                name: hw.name,
                type: hw.type,
                size: hw.size,
                length: hw.length,
                head: hw.head,
                material: hw.material,
                location: hw.location,
                qty: hw.qty,
                reorder: hw.reorder
            }))
        };

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success') {
            updateCloudStatusLabel('success');
            logActivity('Inventory changes successfully saved to cloud spreadsheet!', 'success');
        } else {
            throw new Error(result.message || 'Unknown server error.');
        }
    } catch (err) {
        console.error('Google Sheets Cloud push failed:', err);
        updateCloudStatusLabel('error', err.message);
        logActivity(`Google Sheets Sync Failed: ${err.message}`, 'danger');
        if (!isAutoSync) {
            alert(`Failed to push to Google Sheets: ${err.message}\nEnsure your Web App URL is deployed with Executed As: "Me" and Who has access: "Anyone".`);
        }
    }
}

function debounceAutoSync() {
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
        pushToCloud(true);
    }, 2500);
}

function populateMaterialAndSizeFilters() {
    if (!filterSpoolMaterial || !filterHardwareSize || !filterHardwareType) return;

    // 1. Spools Materials
    const currentMaterialVal = filterSpoolMaterial.value;
    const materials = new Set(['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon']);
    spools.forEach(sp => {
        if (sp.material) materials.add(sp.material);
    });
    
    filterSpoolMaterial.innerHTML = '<option value="all">All Materials</option>';
    Array.from(materials).sort().forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat;
        opt.textContent = mat;
        filterSpoolMaterial.appendChild(opt);
    });
    filterSpoolMaterial.value = currentMaterialVal;

    // 2. Hardware Sizes
    const currentSizeVal = filterHardwareSize.value;
    const sizes = new Set(['M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8']);
    hardware.forEach(hw => {
        if (hw.size && hw.size !== 'N/A' && hw.size.startsWith('M')) sizes.add(hw.size);
    });

    filterHardwareSize.innerHTML = `
        <option value="all">All Sizes</option>
        ` + Array.from(sizes).sort((a,b) => {
            const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
            const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
            return numA - numB;
        }).map(sz => '<option value="' + sz + '">' + sz + '</option>').join('') + `
        <option value="other">Other/Non-metric</option>
    `;
    filterHardwareSize.value = currentSizeVal;
}
