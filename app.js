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

// Modular Cabinet Map Configuration
const CABINET_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
let activeCabinetSection = 'A';
let activeCabinetFilter = null;

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
    { id: 'hw-1', boxNo: 'A1', category: 'Magnet', specification: 'Neodymium N35', sizeLD: '6', sizeW: '', sizeT: '3', qty: '120', remarks: 'Strong cylindrical magnets' },
    { id: 'hw-2', boxNo: 'A2', category: 'Threaded Insert', specification: 'M3 Standard', sizeLD: '4.2', sizeW: '5.8', sizeT: '4', qty: '100+', remarks: 'Brass knurled heat-set' },
    { id: 'hw-3', boxNo: 'A3', category: 'Threaded Insert', specification: 'M3 Short', sizeLD: '4.2', sizeW: '5.8', sizeT: '3', qty: '8', remarks: 'Low stock - reorder soon' },
    { id: 'hw-4', boxNo: 'B1', category: 'Limit Switch', specification: 'Endstop Switch', sizeLD: '20', sizeW: '10', sizeT: '6.5', qty: '15', remarks: 'For X/Y/Z axes' },
    { id: 'hw-5', boxNo: 'B2', category: 'NFC Card', specification: '13.56MHz RFID', sizeLD: '85.6', sizeW: '54', sizeT: '0.8', qty: '20+', remarks: 'For printer access control' },
    { id: 'hw-6', boxNo: 'C3', category: 'Screw', specification: 'M3x10 Button Head', sizeLD: '10', sizeW: '', sizeT: '3', qty: '150', remarks: 'Hex drive black alloy steel' },
    { id: 'hw-7', boxNo: 'C4', category: 'Screw', specification: 'M3x16 Socket Cap', sizeLD: '16', sizeW: '', sizeT: '3', qty: '45', remarks: 'Stainless steel A2' },
    { id: 'hw-8', boxNo: 'D12', category: 'Nut', specification: 'M3 Hex Nut', sizeLD: '5.5', sizeW: '', sizeT: '2.4', qty: '200', remarks: 'Zinc plated steel' },
    { id: 'hw-9', boxNo: 'E4', category: 'Bearing', specification: '608ZZ Ball Bearing', sizeLD: '22', sizeW: '', sizeT: '7', qty: '0', remarks: 'Out of stock - critical!' }
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

// // Storage Helpers
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

    let migrated = false;
    
    // Automatically migrate old weight-based schema to new quantity-based schema for Spools
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

    // Automatically migrate old hardware schema to the new 8-column layout
    if (hardware.length > 0) {
        let hwMigrated = false;
        hardware = hardware.map(hw => {
            if (hw.boxNo === undefined) {
                hwMigrated = true;
                // Old keys: id, name, type, size, length, head, material, location, qty, reorder
                // New keys: id, boxNo, category, specification, sizeLD, sizeW, sizeT, qty, remarks
                const boxNo = hw.location || 'A1';
                const category = hw.type || 'Screw';
                const specification = hw.size ? `${hw.size} ${hw.name || ''}`.trim() : (hw.name || 'M3');
                const sizeLD = hw.length || '';
                const sizeW = '';
                const sizeT = '';
                const qty = hw.qty !== undefined ? String(hw.qty) : '0';
                const remarks = [hw.head, hw.material].filter(Boolean).join(', ') || '';
                
                return {
                    id: hw.id,
                    boxNo,
                    category,
                    specification,
                    sizeLD,
                    sizeW,
                    sizeT,
                    qty,
                    remarks
                };
            }
            return hw;
        });
        if (hwMigrated) {
            migrated = true;
        }
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
    if (document.getElementById('spools-export-meta')) {
        document.getElementById('spools-export-meta').innerText = `${spools.length} spools in database`;
    }
    if (document.getElementById('hardware-export-meta')) {
        document.getElementById('hardware-export-meta').innerText = `${hardware.length} hardware items in database`;
    }
}

function logActivity(text, type = 'info') {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;

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

// Global Quantity Parser Helper
function getStockLevelInfo(qtyText) {
    const text = String(qtyText || '0').trim();
    const hasPlus = text.includes('+');
    const parsedQty = parseInt(text, 10);
    const isNumeric = !isNaN(parsedQty);
    
    let statusLabel = 'In Stock';
    let statusClass = 'good';
    
    if (!isNumeric || parsedQty <= 0) {
        statusLabel = 'Out of Stock';
        statusClass = 'out';
    } else if (hasPlus) {
        statusLabel = 'In Stock';
        statusClass = 'good';
    } else if (parsedQty <= 10) {
        statusLabel = 'Low Stock';
        statusClass = 'low';
    } else {
        statusLabel = 'In Stock';
        statusClass = 'good';
    }
    
    return {
        parsedQty: isNumeric ? parsedQty : 0,
        isNumeric,
        hasPlus,
        statusLabel,
        statusClass
    };
}

// ==========================================================================
// DOM RENDERING ENGINE
// ==========================================================================

function renderAll() {
    renderDashboardStats();
    renderSpools();
    renderCabinetTabs();
    renderCabinetGrid();
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
    const totalHwQty = hardware.reduce((acc, hw) => {
        const stockInfo = getStockLevelInfo(hw.qty);
        return acc + stockInfo.parsedQty;
    }, 0);
    dashTotalHardware.innerText = totalHwQty.toLocaleString();
    dashHardwareTypes.innerText = `${hardware.length} unique fastener types`;

    // 4. Low Hardware Alert (qty <= 10 or Out of Stock)
    const lowHwCount = hardware.filter(hw => {
        const stockInfo = getStockLevelInfo(hw.qty);
        return stockInfo.statusClass === 'low' || stockInfo.statusClass === 'out';
    }).length;
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
                <div class="spool-avatar-wrapper" style="background: radial-gradient(circle, ${sp.hex}22, ${sp.hex}05); border: 1.5px solid ${sp.hex}30; box-shadow: 0 8px 20px ${sp.hex}18;">
                    <svg class="spool-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="${sp.hex}" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"></path>
                    </svg>
                </div>

                <div class="spools-details-list">
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
                <div class="spool-counter">
                    <button class="spool-counter-btn spool-dec" data-id="${sp.id}">-</button>
                    <span class="spool-counter-val">${qty}</span>
                    <button class="spool-counter-btn spool-inc" data-id="${sp.id}">+</button>
                </div>
            </div>

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

// Render dynamic horizontal selection tabs for cabinets
function renderCabinetTabs() {
    const selector = document.getElementById('cabinet-section-selector');
    if (!selector) return;
    
    selector.innerHTML = '';
    CABINET_SECTIONS.forEach(sec => {
        const btn = document.createElement('button');
        btn.className = `cabinet-tab-btn ${activeCabinetSection === sec ? 'active' : ''}`;
        btn.textContent = `Section ${sec}`;
        btn.addEventListener('click', () => {
            activeCabinetSection = sec;
            activeCabinetFilter = null; // Clear click boundary on switcher tap
            renderCabinetTabs();
            renderCabinetGrid();
            renderHardware();
        });
        selector.appendChild(btn);
    });
}

// Render the responsive 5x4 bin grid layout
function renderCabinetGrid() {
    const container = document.getElementById('cabinet-grid-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= 20; i++) {
        const boxLabel = `${activeCabinetSection}${i}`;
        const match = hardware.find(hw => hw.boxNo.trim().toUpperCase() === boxLabel);
        
        const drawerDiv = document.createElement('div');
        
        if (match) {
            const stockInfo = getStockLevelInfo(match.qty);
            drawerDiv.className = `cabinet-drawer drawer-${stockInfo.statusClass}`;
            if (activeCabinetFilter === boxLabel) {
                drawerDiv.classList.add('active-filter');
            }
            
            // Occupied drawer details
            drawerDiv.innerHTML = `
                <div class="drawer-meta-top">
                    <span class="drawer-label">${boxLabel}</span>
                    <span class="drawer-qty-badge">${match.qty}</span>
                </div>
                <div class="drawer-meta-bottom">
                    <span class="drawer-category">${match.category}</span>
                    <span class="drawer-spec">${match.specification} ${match.sizeLD ? match.sizeLD + 'mm' : ''}</span>
                </div>
            `;
            
            // Drawer click filters table
            drawerDiv.addEventListener('click', () => {
                if (activeCabinetFilter === boxLabel) {
                    activeCabinetFilter = null;
                } else {
                    activeCabinetFilter = boxLabel;
                }
                renderCabinetGrid();
                renderHardware();
            });
        } else {
            // Empty drawer container
            drawerDiv.className = 'cabinet-drawer drawer-empty';
            drawerDiv.innerHTML = `
                <span class="drawer-label" style="position: absolute; top: 12px; left: 12px;">${boxLabel}</span>
                <div class="drawer-add-icon" title="Add item to drawer ${boxLabel}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
            `;
            
            // Open form with box prefill
            drawerDiv.addEventListener('click', () => {
                document.getElementById('modal-hardware-title').innerText = `Add Hardware (Box ${boxLabel})`;
                formHardware.reset();
                document.getElementById('hardware-id').value = '';
                document.getElementById('hw-boxNo').value = boxLabel;
                modalHardware.showModal();
            });
        }
        
        container.appendChild(drawerDiv);
    }
}

function renderHardware() {
    if (!hardwareTbody) return;
    
    // Get filter states
    const typeFilter = filterHardwareType.value;
    const sizeFilter = filterHardwareSize.value;

    const filtered = hardware.filter(hw => {
        const matchesSearch = searchQuery === '' || 
            hw.boxNo.toLowerCase().includes(searchQuery) ||
            hw.category.toLowerCase().includes(searchQuery) ||
            hw.specification.toLowerCase().includes(searchQuery) ||
            hw.remarks.toLowerCase().includes(searchQuery);

        const matchesType = typeFilter === 'all' || hw.category === typeFilter;
        
        let matchesSize = true;
        if (sizeFilter !== 'all') {
            if (sizeFilter === 'other') {
                matchesSize = !['M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8'].some(s => hw.specification.toUpperCase().includes(s));
            } else {
                matchesSize = hw.specification.toUpperCase().includes(sizeFilter.toUpperCase());
            }
        }

        const matchesCabinet = !activeCabinetFilter || hw.boxNo.trim().toUpperCase() === activeCabinetFilter.trim().toUpperCase();

        return matchesSearch && matchesType && matchesSize && matchesCabinet;
    });

    if (filtered.length === 0) {
        hardwareTbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 40px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px; height:36px; margin-bottom:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    <p>No matching hardware items found in your cabinet bins.</p>
                </td>
            </tr>
        `;
        return;
    }

    hardwareTbody.innerHTML = '';
    
    filtered.forEach(hw => {
        const tr = document.createElement('tr');
        const stockInfo = getStockLevelInfo(hw.qty);

        const sizeLDStr = hw.sizeLD && hw.sizeLD !== 'N/A' && hw.sizeLD !== '' ? `${hw.sizeLD} mm` : 'N/A';
        const sizeWStr = hw.sizeW && hw.sizeW !== 'N/A' && hw.sizeW !== '' ? `${hw.sizeW} mm` : 'N/A';
        const sizeTStr = hw.sizeT && hw.sizeT !== 'N/A' && hw.sizeT !== '' ? `${hw.sizeT} mm` : 'N/A';

        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--text-primary);">${hw.boxNo}</td>
            <td>${hw.category}</td>
            <td><span class="code-badge">${hw.specification}</span></td>
            <td class="text-center">${sizeLDStr}</td>
            <td class="text-center">${sizeWStr}</td>
            <td class="text-center">${sizeTStr}</td>
            <td class="text-center">
                <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                    <span class="status-pill ${stockInfo.statusClass}">
                        <span class="status-indicator"></span>
                        <span>${stockInfo.statusLabel}</span>
                    </span>
                    <span style="font-size: 11.5px; font-weight:700;">${hw.qty}</span>
                </div>
            </td>
            <td style="color: var(--text-secondary); font-size: 13px;">${hw.remarks || 'N/A'}</td>
            <td class="text-right">
                <div class="hw-actions-wrapper">
                    <div class="hw-counter">
                        <button class="hw-counter-btn hw-dec" data-id="${hw.id}">-</button>
                        <span class="hw-counter-val">${hw.qty}</span>
                        <button class="hw-counter-btn hw-inc" data-id="${hw.id}">+</button>
                    </div>

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

    // Wire up events dynamically (steps of 1)
    document.querySelectorAll('.hw-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeHardwareQty(id, 1);
        });
    });

    document.querySelectorAll('.hw-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            changeHardwareQty(id, -1);
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
    const qtyStr = String(hw.qty || '0').trim();
    const hasPlus = qtyStr.includes('+');
    let currentQty = parseInt(qtyStr, 10);
    if (isNaN(currentQty)) currentQty = 0;
    
    let newQtyVal = Math.max(currentQty + diff, 0);
    let newQtyStr = String(newQtyVal);
    if (hasPlus && newQtyVal > 0) {
        newQtyStr = newQtyVal + '+';
    }
    
    hw.qty = newQtyStr;

    const stockInfo = getStockLevelInfo(hw.qty);
    if (stockInfo.statusClass === 'low' && diff < 0) {
        logActivity(`Low stock warning! "${hw.category} - ${hw.specification}" down to ${hw.qty} units`, 'warning');
    } else {
        logActivity(`Updated count of "${hw.category} - ${hw.specification}" by ${diff > 0 ? '+' : ''}${diff} (Current: ${hw.qty})`, 'info');
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
    const label = hw ? `${hw.category} (${hw.boxNo})` : 'Unknown Hardware';

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
    let searchTimeout;
    globalSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderAll();
        }, 150);
    });

    filterSpoolMaterial.addEventListener('change', () => { renderSpools(); });
    filterSpoolStatus.addEventListener('change', () => { renderSpools(); });
    filterHardwareType.addEventListener('change', () => { renderHardware(); });
    filterHardwareSize.addEventListener('change', () => { renderHardware(); });
}

// ==========================================================================
// DIALOGS & MODAL CONTROLLERS
// ==========================================================================

function setupModals() {
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

    [btnCloseSpoolModal, btnCancelSpool].forEach(btn => {
        btn.addEventListener('click', () => modalSpool.close());
    });

    [btnCloseHardwareModal, btnCancelHardware].forEach(btn => {
        btn.addEventListener('click', () => modalHardware.close());
    });

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

    formSpool.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSpoolForm();
    });

    formHardware.addEventListener('submit', (e) => {
        e.preventDefault();
        saveHardwareForm();
    });

    themeToggleBtn.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nexis_theme', theme);
        updateThemeToggleIcon();
        logActivity(`Switched interface to ${theme} visual theme`, 'info');
    });

    btnQuickAdd.addEventListener('click', () => {
        if (activeTab === 'hardware') {
            btnAddHardware.click();
        } else {
            btnAddSpool.click();
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
        const idx = spools.findIndex(s => s.id === id);
        if (idx !== -1) {
            spools[idx] = { id, ...spoolData };
            logActivity(`Updated details of spool "${spoolData.brand} ${spoolData.color}"`, 'info');
        }
    } else {
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
    document.getElementById('hw-boxNo').value = hw.boxNo || '';
    document.getElementById('hw-category').value = hw.category || '';
    document.getElementById('hw-specification').value = hw.specification || '';
    document.getElementById('hw-sizeLD').value = hw.sizeLD || '';
    document.getElementById('hw-sizeW').value = hw.sizeW || '';
    document.getElementById('hw-sizeT').value = hw.sizeT || '';
    document.getElementById('hw-qty').value = hw.qty || '0';
    document.getElementById('hw-remarks').value = hw.remarks || '';

    modalHardware.showModal();
}

function saveHardwareForm() {
    const id = document.getElementById('hardware-id').value;
    const hwData = {
        boxNo: document.getElementById('hw-boxNo').value.trim().toUpperCase(),
        category: document.getElementById('hw-category').value.trim(),
        specification: document.getElementById('hw-specification').value.trim(),
        sizeLD: document.getElementById('hw-sizeLD').value.trim() || '',
        sizeW: document.getElementById('hw-sizeW').value.trim() || '',
        sizeT: document.getElementById('hw-sizeT').value.trim() || '',
        qty: document.getElementById('hw-qty').value.trim() || '0',
        remarks: document.getElementById('hw-remarks').value.trim() || ''
    };

    if (id) {
        const idx = hardware.findIndex(h => h.id === id);
        if (idx !== -1) {
            hardware[idx] = { id, ...hwData };
            logActivity(`Updated details of hardware "${hwData.category} (${hwData.boxNo})"`, 'info');
        }
    } else {
        const newHw = {
            id: 'hw-' + Date.now(),
            ...hwData
        };
        hardware.push(newHw);
        logActivity(`Created new hardware part "${hwData.category} (${hwData.boxNo})"`, 'success');
    }

    renderAll();
    modalHardware.close();
}

// ==========================================================================
// GOOGLE SHEETS CSV SYNC BRIDGE
// ==========================================================================

function setupSyncEngine() {
    btnRunImport.addEventListener('click', () => {
        const text = csvImportText.value.trim();
        if (!text) {
            alert('Please paste a CSV string or drag a CSV file first.');
            return;
        }
        runCSVImport(text);
    });

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

    btnExportSpools.addEventListener('click', () => {
        exportCSVFile(spools, 'nexis_spools_export.csv');
    });

    btnExportHardware.addEventListener('click', () => {
        exportCSVFile(hardware, 'nexis_hardware_export.csv');
    });

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

function runCSVImport(csvText) {
    const firstLine = csvText.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const splitCSVLine = (text) => {
        let result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else {
                cur += char;
            }
        }
        result.push(cur.trim());
        return result.map(cell => cell.replace(/^["']|["']$/g, '').trim());
    };

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        alert('Invalid CSV data. Ensure you have column headers and at least one row.');
        return;
    }

    const rawHeaders = splitCSVLine(lines[0]).map(h => h.toLowerCase());
    
    // Guess based on keys
    const isSpoolSheet = rawHeaders.includes('brand') || rawHeaders.includes('material') || rawHeaders.includes('hexcode') || rawHeaders.includes('reorderlimit');
    let importedCount = 0;

    if (isSpoolSheet) {
        const parsedSpools = [];
        for (let i = 1; i < lines.length; i++) {
            const cells = splitCSVLine(lines[i]);
            if (cells.length < rawHeaders.length) continue;

            const row = {};
            rawHeaders.forEach((header, index) => {
                row[header] = cells[index];
            });

            const brand = row['brand'] || row['manufacturer'] || 'Unknown Brand';
            const material = row['material'] || 'PLA';
            const color = row['color'] || 'Generic Color';
            const hex = row['hexcode'] || row['hex'] || '#6366f1';
            const qty = parseInt(row['quantity'] || row['qty'] || row['count'] || row['spools']) || 1;
            const reorder = parseInt(row['reorderlimit'] || row['reorder'] || row['alert']) || 1;
            const location = row['location'] || row['shelf'] || 'Storage Box';
            const notes = row['notes'] || row['comment'] || '';

            parsedSpools.push({
                id: `sp-import-${Date.now()}-${i}`,
                brand, material, color, hex, qty, reorder, location, notes
            });
        }

        spools = parsedSpools;
        importedCount = parsedSpools.length;
        logActivity(`Successfully imported ${importedCount} filament spools from CSV`, 'success');
        alert(`Successfully imported ${importedCount} filament spools!`);
        switchTab('spools');
    } else {
        const parsedHardware = [];
        for (let i = 1; i < lines.length; i++) {
            const cells = splitCSVLine(lines[i]);
            if (cells.length < rawHeaders.length) continue;

            const row = {};
            rawHeaders.forEach((header, index) => {
                row[header] = cells[index];
            });

            const getVal = (aliases) => {
                for (const alias of aliases) {
                    if (row[alias] !== undefined) return row[alias];
                }
                return '';
            };

            const boxNo = getVal(['box no.', 'boxno', 'drawer', 'location', 'box']).toUpperCase();
            const category = getVal(['category', 'type', 'partname', 'name']) || 'Screw';
            const specification = getVal(['specification', 'spec', 'threadsize', 'size']) || 'M3';
            const sizeLD = getVal(['l/d', 'size (l/d)', 'length', 'l', 'd']);
            const sizeW = getVal(['w', 'size (w)', 'width']);
            const sizeT = getVal(['t', 'size (t)', 'thickness', 'thickness / height', 'height']);
            const qty = String(getVal(['qty', 'quantity', 'count']) || '0').trim();
            const remarks = getVal(['remarks', 'notes', 'comment', 'headtype', 'head', 'material']);

            parsedHardware.push({
                id: `hw-import-${Date.now()}-${i}`,
                boxNo,
                category,
                specification,
                sizeLD,
                sizeW,
                sizeT,
                qty,
                remarks
            });
        }

        hardware = parsedHardware;
        importedCount = parsedHardware.length;
        logActivity(`Successfully imported ${importedCount} hardware fasteners from CSV`, 'success');
        alert(`Successfully imported ${importedCount} hardware fasteners!`);
        switchTab('hardware');
    }

    renderAll();
}

function exportCSVFile(dataArray, filename) {
    if (dataArray.length === 0) {
        alert('Your inventory has 0 items to export.');
        return;
    }

    const isSpool = dataArray === spools;
    let headersLine = '';
    let keys = [];
    
    if (isSpool) {
        headersLine = 'Brand,Material,Color,HexCode,Quantity,ReorderLimit,Location,Notes';
        keys = ['brand', 'material', 'color', 'hex', 'qty', 'reorder', 'location', 'notes'];
    } else {
        headersLine = 'Box No.,Category,Specification,L/D,W,T,Qty,Remarks';
        keys = ['boxNo', 'category', 'specification', 'sizeLD', 'sizeW', 'sizeT', 'qty', 'remarks'];
    }

    const rows = dataArray.map(item => {
        return keys.map(k => {
            let val = item[k] === undefined || item[k] === null ? '' : item[k];
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',');
    });

    const csvContent = [headersLine, ...rows].join('\n');
    
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
                
                if (data.spools && Array.isArray(data.spools)) {
                    spools = data.spools.map((sp, idx) => ({
                        id: sp.id || `sp-cloud-${Date.now()}-${idx}`,
                        brand: sp.brand || 'Generic',
                        material: sp.material || 'PLA',
                        color: sp.color || 'Default',
                        hex: sp.hex || '#6366f1',
                        qty: sp.qty !== undefined ? sp.qty : 0,
                        reorder: Number(sp.reorder) || 0,
                        location: sp.location || '',
                        notes: sp.notes || ''
                    }));
                }
                if (data.hardware && Array.isArray(data.hardware)) {
                    hardware = data.hardware.map((hw, idx) => ({
                        id: hw.id || `hw-cloud-${Date.now()}-${idx}`,
                        boxNo: hw.boxNo || `A${idx+1}`,
                        category: hw.category || 'Screw',
                        specification: hw.specification || 'M3',
                        sizeLD: hw.sizeLD !== undefined ? String(hw.sizeLD) : '',
                        sizeW: hw.sizeW !== undefined ? String(hw.sizeW) : '',
                        sizeT: hw.sizeT !== undefined ? String(hw.sizeT) : '',
                        qty: hw.qty !== undefined ? String(hw.qty).trim() : '0',
                        remarks: hw.remarks || ''
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
                boxNo: hw.boxNo,
                category: hw.category,
                specification: hw.specification,
                sizeLD: hw.sizeLD,
                sizeW: hw.sizeW,
                sizeT: hw.sizeT,
                qty: hw.qty,
                remarks: hw.remarks
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

    // 2. Hardware Categories
    const currentTypeVal = filterHardwareType.value;
    const categories = new Set(['Screw', 'Nut', 'Bearing', 'Washer', 'Magnet', 'Threaded Insert', 'Limit Switch', 'NFC Card']);
    hardware.forEach(hw => {
        if (hw.category) categories.add(hw.category);
    });
    
    filterHardwareType.innerHTML = '<option value="all">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterHardwareType.appendChild(opt);
    });
    filterHardwareType.value = currentTypeVal;

    // 3. Hardware Sizes / Specs
    const currentSizeVal = filterHardwareSize.value;
    const sizes = new Set(['M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8']);
    hardware.forEach(hw => {
        const spec = String(hw.specification || '');
        const match = spec.match(/M\d+(?:\.\d+)?/i);
        if (match) {
            sizes.add(match[0].toUpperCase());
        }
    });

    filterHardwareSize.innerHTML = `
        <option value="all">All Specs</option>
        ` + Array.from(sizes).sort((a,b) => {
            const numA = parseFloat(a.replace(/[^\d.]/g, '')) || 0;
            const numB = parseFloat(b.replace(/[^\d.]/g, '')) || 0;
            return numA - numB;
        }).map(sz => '<option value="' + sz + '">' + sz + '</option>').join('') + `
        <option value="other">Other/Non-metric</option>
    `;
    filterHardwareSize.value = currentSizeVal;
}

