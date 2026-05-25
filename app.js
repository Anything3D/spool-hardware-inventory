// ==========================================================================
// NEXIS INVENTORY - CORE ENGINE
// ==========================================================================

// Global Application State
let spools = [];
let hardware = [];
let projects = [];
let activeTab = 'dashboard';
let searchQuery = '';
let theme = 'dark';
let suppressAutoSync = false;
let autoSyncTimer = null;
let hasFetchedFromCloud = false;
let projectCarouselIndices = {}; // Track image carousel indexes per project card

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
const modalProject = document.getElementById('modal-project');
const formSpool = document.getElementById('form-spool');
const formHardware = document.getElementById('form-hardware');
const formProject = document.getElementById('form-project');

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
    { id: 'hw-1', boxNo: 'A1', category: 'Magnet', specification: 'Magnet', sizeLD: '6', sizeW: '', sizeT: '3', qty: '45', minQty: 10, remarks: 'Strong cylindrical magnets' },
    { id: 'hw-2', boxNo: 'A2', category: 'Threaded Insert', specification: 'M3', sizeLD: '4.2', sizeW: '', sizeT: '4', qty: '2', minQty: 10, remarks: 'Brass knurled heat-set' },
    { id: 'hw-3', boxNo: 'A3', category: 'Threaded Insert', specification: 'M3', sizeLD: '3.9', sizeW: '', sizeT: '3', qty: '100+', minQty: 10, remarks: 'Low stock - reorder soon' },
    { id: 'hw-4', boxNo: 'A4', category: 'Threaded Insert', specification: 'M3', sizeLD: '4.2', sizeW: '', sizeT: '3', qty: '100+', minQty: 10, remarks: 'Brass knurled heat-set' },
    { id: 'hw-5', boxNo: 'A5', category: 'Threaded Insert', specification: 'M3', sizeLD: '3.9', sizeW: '', sizeT: '3', qty: '100+', minQty: 10, remarks: 'Low stock - reorder soon' },
    { id: 'hw-6', boxNo: 'A6', category: 'Threaded Insert', specification: 'M3', sizeLD: '4.2', sizeW: '', sizeT: '4', qty: '100+', minQty: 10, remarks: 'Hex drive black alloy steel' },
    { id: 'hw-7', boxNo: 'A7', category: 'NFC Card', specification: 'NFC Card', sizeLD: '25', sizeW: '', sizeT: '', qty: '7', minQty: 10, remarks: 'Sticker type' },
    { id: 'hw-8', boxNo: 'A8', category: 'Limit Switch', specification: 'Limit Switch', sizeLD: '13', sizeW: '5.8', sizeT: '6.5', qty: '9', minQty: 10, remarks: 'For X/Y/Z axes' },
    { id: 'hw-9', boxNo: 'A9', category: 'Nozzle Scrubber', specification: 'Nozzle Scrubber', sizeLD: '36.5', sizeW: '8.5', sizeT: '3.9', qty: '11', minQty: 10, remarks: 'Used for A1 printers' },
    { id: 'hw-10', boxNo: 'A10', category: 'Nozzle Scrubber', specification: 'Nozzle Scrubber', sizeLD: '36.5', sizeW: '8.5', sizeT: '3.9', qty: '15', minQty: 10, remarks: 'Used for A1 printers' },
    { id: 'hw-11', boxNo: 'A11', category: 'Heat shrink tube', specification: 'Heat shrink tube', sizeLD: '', sizeW: '', sizeT: '', qty: '', minQty: 10, remarks: 'Small' },
    { id: 'hw-12', boxNo: 'A12', category: 'Heat shrink tube', specification: 'Heat shrink tube', sizeLD: '', sizeW: '', sizeT: '', qty: '10', minQty: 10, remarks: 'Small' },
    { id: 'hw-13', boxNo: 'A20', category: 'SHCS', specification: 'M6', sizeLD: '40', sizeW: '', sizeT: '', qty: '6', minQty: 10, remarks: 'Alloy steel' }
];

const MOCK_PROJECTS = [
    {
        projectId: 'proj-1',
        projectName: 'Voron 2.4 3D Printer Build',
        description: 'Building a custom high-speed Voron 2.4 CoreXY 3D printer with 350mm gantry volume.',
        status: 'In Progress',
        startDate: '2026-05-18',
        endDate: '',
        successReason: '',
        lessonsLearned: 'Proper frame squaring is critical for high print speeds. Standard alignment corner squares save hours.',
        futurePlans: 'Install active carbon exhaust air filter and build a Klicky mechanical probe.',
        tasks: [
            { id: "t-1", text: "Assemble aluminum extrusion frame and square gantry", completed: true },
            { id: "t-2", text: "Wire stepper motors, toolhead cables, and power supply", completed: true },
            { id: "t-3", text: "Install Klipper firmware and tune config parameters", completed: false },
            { id: "t-4", text: "Execute first test print and perform input shaper calibration", completed: false }
        ],
        budget: [
            { id: "b-1", item: "LDO Motor & Frame Kit", cost: 350.00 },
            { id: "b-2", item: "BIGTREETECH Octopus V1.1 MCU", cost: 65.50 },
            { id: "b-3", item: "Raspberry Pi 4B (4GB)", cost: 45.00 },
            { id: "b-4", item: "High-temperature Toolhead Wiring", cost: 18.20 }
        ],
        statusLog: [
            { date: "2026-05-18", note: "Extrusion frame kits unboxed. Spent 4 hours squaring and tightening bolts. Gantry slides perfectly!" },
            { date: "2026-05-20", note: "Mounted linear rails and completed gantry assembly. Smooth linear movement verified on all axes." },
            { date: "2026-05-24", note: "Mains wiring checked and verified. Fired up MCU and established active serial connection to Raspberry Pi." }
        ],
        imageUrls: 'https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?w=600'
    }
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

    // Wire up User Authentication Forms and Sessions
    setupLoginHandlers();
    
    // Wire up Project Planner Handlers
    setupProjectHandlers();
    
    const hasActiveSession = checkUserSession();

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

    // Automatically trigger cloud pull on startup if a valid session exists and URL is pre-filled
    if (hasActiveSession) {
        const startupUrl = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
        if (startupUrl) {
            setTimeout(() => {
                fetchFromCloud();
            }, 300);
        }
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
    const savedProjects = localStorage.getItem('nexis_projects');
    const savedTheme = localStorage.getItem('nexis_theme') || 'dark';

    spools = savedSpools ? JSON.parse(savedSpools) : [];
    hardware = savedHardware ? JSON.parse(savedHardware) : [];
    projects = savedProjects ? JSON.parse(savedProjects) : [];
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

    // Automatically migrate old hardware schema to the new 9-column layout
    if (hardware.length > 0) {
        let hwMigrated = false;
        hardware = hardware.map(hw => {
            if (hw.boxNo === undefined) {
                hwMigrated = true;
                // Old keys: id, name, type, size, length, head, material, location, qty, reorder
                // New keys: id, boxNo, category, specification, sizeLD, sizeW, sizeT, qty, minQty, remarks
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
                    minQty: 10,
                    remarks
                };
            } else if (hw.minQty === undefined) {
                hwMigrated = true;
                return {
                    ...hw,
                    minQty: 10
                };
            }
            return hw;
        });
        if (hwMigrated) {
            migrated = true;
        }
    }

    // If database is completely empty (first run), seed with mock data
    if (spools.length === 0 && hardware.length === 0 && projects.length === 0) {
        spools = [...MOCK_SPOOLS];
        hardware = [...MOCK_HARDWARE];
        projects = [...MOCK_PROJECTS];
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
    localStorage.setItem('nexis_projects', JSON.stringify(projects));
    
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
function getStockLevelInfo(qtyText, minQtyText) {
    const text = String(qtyText || '0').trim();
    const hasPlus = text.includes('+');
    const parsedQty = parseInt(text, 10);
    const isNumeric = !isNaN(parsedQty);
    
    // Parse custom minQty warning threshold (defaults to 10)
    let threshold = 10;
    if (minQtyText !== undefined && minQtyText !== null && String(minQtyText).trim() !== '') {
        const parsed = parseInt(String(minQtyText).trim(), 10);
        if (!isNaN(parsed)) {
            threshold = parsed;
        }
    }
    
    let statusLabel = 'In Stock';
    let statusClass = 'good';
    
    if (!isNumeric || parsedQty <= 0) {
        statusLabel = 'Out of Stock';
        statusClass = 'out';
    } else if (hasPlus) {
        statusLabel = 'In Stock';
        statusClass = 'good';
    } else if (parsedQty <= threshold) {
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
    renderProjects();
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
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);
        return acc + stockInfo.parsedQty;
    }, 0);
    dashTotalHardware.innerText = totalHwQty.toLocaleString();
    dashHardwareTypes.innerText = `${hardware.length} unique fastener types`;

    // 4. Low Hardware Alert (qty <= minQty or Out of Stock)
    const lowHwCount = hardware.filter(hw => {
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);
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
        const hex = (sp.hex || '#6366f1').replace('#', '');
        const r = parseInt(hex.substring(0,2), 16) || 0;
        const g = parseInt(hex.substring(2,4), 16) || 0;
        const b = parseInt(hex.substring(4,6), 16) || 0;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // If color is extremely dark (like Black), use a sleek silver-slate backing so the black gear stands out!
        const isDark = luminance < 0.25;
        const avatarBg = isDark 
            ? 'linear-gradient(135deg, #475569, #1e293b)' 
            : `radial-gradient(circle, ${sp.hex}22, ${sp.hex}05)`;
        const avatarBorder = isDark 
            ? '1.5px solid rgba(255, 255, 255, 0.15)' 
            : `1.5px solid ${sp.hex}40`;
        const avatarGlow = isDark
            ? '0 8px 20px rgba(255,255,255,0.05)'
            : `0 8px 20px ${sp.hex}18`;

        const card = document.createElement('div');
        card.className = 'spool-card glass-panel';
        card.setAttribute('style', `--accent-color: ${sp.hex}; --glow-color: ${sp.hex}0d;`);
        
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
                <!-- Premium High-Visibility Spool Avatar (Colored Gear representation) -->
                <div class="spool-avatar-wrapper" style="background: ${avatarBg}; border: ${avatarBorder}; box-shadow: ${avatarGlow};">
                    <svg class="spool-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="${sp.hex}" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"></path>
                    </svg>
                </div>

                <div class="spools-details-list">
                    <div class="spool-detail-row">
                        <span>Color:</span>
                        <span class="spool-detail-value" style="font-weight: 700;">${sp.color}</span>
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
        const isOccupied = match && match.category && match.category.trim() !== '';
        
        const drawerDiv = document.createElement('div');
        
        if (isOccupied) {
            drawerDiv.className = 'cabinet-drawer drawer-occupied';
            if (activeCabinetFilter === boxLabel) {
                drawerDiv.classList.add('active-filter');
            }
            
            let sizeStr = '';
            const sizes = [];
            if (match.sizeLD) sizes.push(match.sizeLD);
            if (match.sizeW) sizes.push(match.sizeW);
            if (match.sizeT) sizes.push(match.sizeT);
            if (sizes.length > 0) {
                sizeStr = ` (${sizes.join('×')}mm)`;
            }
            
            const displayQty = match.qty !== undefined && match.qty !== null && String(match.qty).trim() !== '' ? match.qty : '0';
            
            // Occupied drawer details
            drawerDiv.innerHTML = `
                <div class="drawer-meta-top">
                    <span class="drawer-label">${boxLabel}</span>
                    <span class="drawer-qty-badge">${displayQty}</span>
                </div>
                <div class="drawer-meta-bottom">
                    <span class="drawer-category">${match.category}</span>
                    <span class="drawer-spec">${match.specification}${sizeStr}</span>
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
            
            // Open form with box prefill. Prefill ID if a blank database row already exists.
            drawerDiv.addEventListener('click', () => {
                document.getElementById('modal-hardware-title').innerText = `Add Hardware (Box ${boxLabel})`;
                formHardware.reset();
                if (match) {
                    document.getElementById('hardware-id').value = match.id;
                } else {
                    document.getElementById('hardware-id').value = '';
                }
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
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);

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
            <td class="text-center" style="font-weight: 600; color: var(--text-secondary);">${hw.minQty !== undefined && hw.minQty !== null && hw.minQty !== '' ? hw.minQty : '10'}</td>
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

    const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);
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
    document.getElementById('hw-minQty').value = hw.minQty !== undefined && hw.minQty !== null && hw.minQty !== '' ? hw.minQty : '10';
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
        minQty: !isNaN(parseInt(document.getElementById('hw-minQty').value, 10)) ? parseInt(document.getElementById('hw-minQty').value, 10) : 10,
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
            const category = getVal(['category', 'type', 'partname', 'name']) || '';
            const specification = getVal(['specification', 'spec', 'threadsize', 'size']) || '';
            const sizeLD = getVal(['l/d', 'size (l/d)', 'length', 'l', 'd']);
            const sizeW = getVal(['w', 'size (w)', 'width']);
            const sizeT = getVal(['t', 'size (t)', 'thickness', 'thickness / height', 'height']);
            const qty = String(getVal(['qty', 'quantity', 'count']) || '0').trim();
            const minQty = String(getVal(['min qty', 'minqty', 'minimum alert quantity', 'min']) || '10').trim();
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
                minQty,
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
        headersLine = 'Box No.,Category,Specification,L/D,W,T,Qty,Min Qty,Remarks';
        keys = ['boxNo', 'category', 'specification', 'sizeLD', 'sizeW', 'sizeT', 'qty', 'minQty', 'remarks'];
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
                        category: hw.category || '',
                        specification: hw.specification || '',
                        sizeLD: hw.sizeLD !== undefined ? String(hw.sizeLD) : '',
                        sizeW: hw.sizeW !== undefined ? String(hw.sizeW) : '',
                        sizeT: hw.sizeT !== undefined ? String(hw.sizeT) : '',
                        qty: hw.qty !== undefined ? String(hw.qty).trim() : '0',
                        minQty: hw.minQty !== undefined ? String(hw.minQty).trim() : '10',
                        remarks: hw.remarks || ''
                    }));
                }
                
                if (data.projects && Array.isArray(data.projects)) {
                    projects = data.projects.map((proj, idx) => {
                        let parsedTasks = [];
                        let parsedBudget = [];
                        let parsedStatusLog = [];
                        
                        try {
                            parsedTasks = proj.tasksJson ? JSON.parse(proj.tasksJson) : [];
                            if (!Array.isArray(parsedTasks)) parsedTasks = [];
                        } catch (e) { console.error("Error parsing tasksJson", e); }
                        
                        try {
                            parsedBudget = proj.budgetJson ? JSON.parse(proj.budgetJson) : [];
                            if (!Array.isArray(parsedBudget)) parsedBudget = [];
                        } catch (e) { console.error("Error parsing budgetJson", e); }
                        
                        try {
                            parsedStatusLog = proj.statusLogJson ? JSON.parse(proj.statusLogJson) : [];
                            if (!Array.isArray(parsedStatusLog)) parsedStatusLog = [];
                        } catch (e) { console.error("Error parsing statusLogJson", e); }

                        return {
                            projectId: proj.projectId || `proj-cloud-${Date.now()}-${idx}`,
                            projectName: proj.projectName || 'Unnamed Project',
                            description: proj.description || '',
                            status: proj.status || 'In Progress',
                            startDate: proj.startDate || '',
                            endDate: proj.endDate || '',
                            successReason: proj.successReason || '',
                            lessonsLearned: proj.lessonsLearned || '',
                            futurePlans: proj.futurePlans || '',
                            tasks: parsedTasks,
                            budget: parsedBudget,
                            statusLog: parsedStatusLog,
                            imageUrls: proj.imageUrls || ''
                        };
                    });
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
                minQty: hw.minQty !== undefined && hw.minQty !== null && hw.minQty !== '' ? hw.minQty : '10',
                remarks: hw.remarks
            })),
            projects: projects.map(proj => ({
                projectId: proj.projectId,
                projectName: proj.projectName,
                description: proj.description,
                status: proj.status,
                startDate: proj.startDate,
                endDate: proj.endDate,
                successReason: proj.successReason,
                lessonsLearned: proj.lessonsLearned,
                futurePlans: proj.futurePlans,
                tasksJson: JSON.stringify(proj.tasks || []),
                budgetJson: JSON.stringify(proj.budget || []),
                statusLogJson: JSON.stringify(proj.statusLog || []),
                imageUrls: proj.imageUrls
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

// ==========================================================================
// GOOGLE SHEETS USER SESSIONS & AUTHENTICATION CONTROLLERS
// ==========================================================================

function checkUserSession() {
    const sessionText = localStorage.getItem('nexis_user_session');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.querySelector('.app-container');

    if (sessionText) {
        try {
            const session = JSON.parse(sessionText);
            const now = Date.now();
            const lifespan = 7 * 24 * 60 * 60 * 1000; // 7 days session expiration
            
            if (session.loggedIn && (now - session.timestamp < lifespan)) {
                // Active, valid session! Show inventory dashboard directly
                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
                
                // Prefill user profile footer avatar
                const nameNode = document.querySelector('.sidebar-footer .user-name');
                if (nameNode && session.username) {
                    const dispName = session.username.charAt(0).toUpperCase() + session.username.slice(1);
                    nameNode.textContent = dispName;
                    
                    const avatarNode = document.querySelector('.sidebar-footer .user-avatar');
                    if (avatarNode) {
                        avatarNode.textContent = dispName.charAt(0).toUpperCase();
                    }
                }
                return true;
            }
        } catch (e) {
            console.error("Session check failed:", e);
        }
    }
    
    // No session or expired: Display login card and keep dashboard hidden
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');
    
    // Prefill linked Google Sheets Web App URL if pre-configured
    const savedUrl = localStorage.getItem('nexis_cloud_url');
    if (savedUrl && document.getElementById('login-cloud-url')) {
        document.getElementById('login-cloud-url').value = savedUrl;
    }
    
    return false;
}

function setupLoginHandlers() {
    const loginForm = document.getElementById('form-login');
    const loginSubmitBtn = document.getElementById('btn-login-submit');
    const loginErrorAlert = document.getElementById('login-error-alert');
    const loginErrorMsg = document.getElementById('login-error-msg');
    
    if (!loginForm) return;

    // 1. Password Visibility Eye Toggle
    const btnTogglePassword = document.getElementById('btn-toggle-password');
    const passwordInput = document.getElementById('login-password');
    if (btnTogglePassword && passwordInput) {
        btnTogglePassword.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                btnTogglePassword.querySelector('svg').style.color = 'var(--primary)';
            } else {
                passwordInput.type = 'password';
                btnTogglePassword.querySelector('svg').style.color = 'var(--text-muted)';
            }
        });
    }
    
    // 2. Sliding Expander: Google Sheets link configuration
    const btnToggleLoginConfig = document.getElementById('btn-toggle-login-config');
    const loginConfigFields = document.getElementById('login-config-fields');
    if (btnToggleLoginConfig && loginConfigFields) {
        btnToggleLoginConfig.addEventListener('click', () => {
            btnToggleLoginConfig.classList.toggle('active');
            loginConfigFields.classList.toggle('hidden');
            loginConfigFields.classList.toggle('expanded');
        });
    }
    
    // 3. Real-Time Secure Sign In Request
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = passwordInput ? passwordInput.value.trim() : '';
        const customUrl = document.getElementById('login-cloud-url').value.trim();
        
        // Save user's Web App link in local storage if provided
        if (customUrl) {
            localStorage.setItem('nexis_cloud_url', customUrl);
            if (cloudApiUrlInput) {
                cloudApiUrlInput.value = customUrl;
            }
        }
        
        const url = customUrl || localStorage.getItem('nexis_cloud_url') || '';
        
        if (!url) {
            loginErrorMsg.innerText = "Sheets Database Link required. Please paste your Google Apps Script URL first.";
            loginErrorAlert.classList.remove('hidden');
            return;
        }
        
        // Transition button to loading status
        loginSubmitBtn.disabled = true;
        const originalText = loginSubmitBtn.innerHTML;
        loginSubmitBtn.innerHTML = `<span>Signing in...</span>`;
        loginErrorAlert.classList.add('hidden');
        
        try {
            // Trigger POST authentication check (case-insensitive username/password check on the sheet)
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server returned HTTP status ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Success! Set session parameters
                localStorage.setItem('nexis_user_session', JSON.stringify({
                    loggedIn: true,
                    username: username.toLowerCase(),
                    timestamp: Date.now()
                }));
                
                logActivity(`User "${username}" signed in successfully`, 'success');
                
                // Play premium sliding visual page transition animations
                const loginScreen = document.getElementById('login-screen');
                const appContainer = document.querySelector('.app-container');
                
                if (loginScreen && appContainer) {
                    loginScreen.classList.add('slide-out-left');
                    
                    setTimeout(() => {
                        loginScreen.classList.add('hidden');
                        loginScreen.classList.remove('slide-out-left');
                        
                        appContainer.classList.remove('hidden');
                        appContainer.classList.add('slide-in-right');
                        
                        // Recalculate profile labels
                        const nameNode = document.querySelector('.sidebar-footer .user-name');
                        if (nameNode) {
                            const dispName = username.charAt(0).toUpperCase() + username.slice(1);
                            nameNode.textContent = dispName;
                            
                            const avatarNode = document.querySelector('.sidebar-footer .user-avatar');
                            if (avatarNode) {
                                avatarNode.textContent = dispName.charAt(0).toUpperCase();
                            }
                        }
                        
                        // Load inventory database and execute live fetch pull
                        suppressAutoSync = true;
                        loadDatabase();
                        renderAll();
                        suppressAutoSync = false;
                        
                        fetchFromCloud(); // Pull live sheet data automatically
                        
                        setTimeout(() => {
                            appContainer.classList.remove('slide-in-right');
                        }, 500);
                    }, 500);
                }
            } else {
                throw new Error(result.message || 'Invalid username or password.');
            }
        } catch (err) {
            console.error('Authentication request failed:', err);
            loginErrorMsg.innerText = `${err.message}`;
            loginErrorAlert.classList.remove('hidden');
            
            // Restore buttons
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.innerHTML = originalText;
        }
    });

    // 4. Sidebar Footer Logout Action Button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm("Are you sure you want to sign out of the organizer?")) {
                localStorage.removeItem('nexis_user_session');
                
                const loginScreen = document.getElementById('login-screen');
                const appContainer = document.querySelector('.app-container');
                
                if (loginForm) loginForm.reset();
                if (document.getElementById('login-username')) document.getElementById('login-username').value = '';
                if (passwordInput) passwordInput.value = '';
                if (loginErrorAlert) loginErrorAlert.classList.add('hidden');
                
                // Hide dashboard and show login screen overlay
                if (appContainer) appContainer.classList.add('hidden');
                if (loginScreen) loginScreen.classList.remove('hidden');
                
                const savedUrl = localStorage.getItem('nexis_cloud_url');
                if (savedUrl && document.getElementById('login-cloud-url')) {
                    document.getElementById('login-cloud-url').value = savedUrl;
                }
                
                logActivity("User signed out from active session", "info");
            }
        });
    }
}

// ==========================================================================
// PROFESSIONAL PROJECT PLANNER & TASK TRACKER CONTROLLERS
// ==========================================================================

// Temporary arrays to hold list items inside the Project Creation Modal
let modalProjectTasks = [];
let modalProjectBudget = [];
let activeProjectId = null;
let editTaskIndex = null;
let editBudgetIndex = null;
let detailEditTaskIndex = null;
let detailEditBudgetIndex = null;

// Multi-file drag and drop / click image compression scaling engine
function processMultipleFiles(files, targetInputId, statusSpanId, appendToExisting = false, callback = null) {
    const statusSpan = statusSpanId ? document.getElementById(statusSpanId) : null;
    if (statusSpan) {
        statusSpan.innerText = `Compressing ${files.length} images...`;
        statusSpan.style.color = 'var(--warning)';
    }
    
    let filesProcessed = 0;
    const compressedUrls = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                compressedUrls.push(compressedDataUrl);
                filesProcessed++;
                
                if (filesProcessed === files.length) {
                    if (targetInputId) {
                        const inputEl = document.getElementById(targetInputId);
                        if (inputEl) {
                            const newBatch = compressedUrls.join(', ');
                            if (appendToExisting && inputEl.value.trim()) {
                                inputEl.value = inputEl.value.trim() + ', ' + newBatch;
                            } else {
                                inputEl.value = newBatch;
                            }
                            const event = new Event('input', { bubbles: true });
                            inputEl.dispatchEvent(event);
                        }
                    }
                    if (statusSpan) {
                        statusSpan.innerText = `${files.length} images compressed & attached!`;
                        statusSpan.style.color = 'var(--success)';
                    }
                    if (callback) callback(compressedUrls);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function setupProjectHandlers() {
    const btnAddProject = document.getElementById('btn-add-project');
    const btnCloseProjectModal = document.getElementById('btn-close-project-modal');
    const btnCancelProject = document.getElementById('btn-cancel-project');
    const projStatusSelect = document.getElementById('proj-status');
    const projSuccessReason = document.getElementById('proj-successReason');
    const projEndDate = document.getElementById('proj-endDate');
    
    const btnAddProjTask = document.getElementById('btn-add-proj-task');
    const btnAddProjBudget = document.getElementById('btn-add-proj-budget');
    
    const filterProjectStatus = document.getElementById('filter-project-status');

    if (!modalProject || !formProject) return;

    // 1. Open Modal (New Project Mode)
    if (btnAddProject) {
        btnAddProject.addEventListener('click', () => {
            document.getElementById('modal-project-title').innerText = 'Add New Project';
            formProject.reset();
            document.getElementById('project-id').value = '';
            
            // Set start date to today's date automatically
            document.getElementById('proj-startDate').value = new Date().toISOString().split('T')[0];
            
            // Reset modal temporary builders
            modalProjectTasks = [];
            modalProjectBudget = [];
            renderModalTasks();
            renderModalBudget();
            
            // Toggle visibility groups
            toggleProjectModalRemarks('Planning');
            modalProject.showModal();
        });
    }

    // 2. Close Modals
    if (btnCloseProjectModal) {
        btnCloseProjectModal.addEventListener('click', () => modalProject.close());
    }
    if (btnCancelProject) {
        btnCancelProject.addEventListener('click', () => modalProject.close());
    }

    // Close when clicking outside dialog frame
    modalProject.addEventListener('click', (e) => {
        const dialogDimensions = modalProject.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            modalProject.close();
        }
    });

    // 3. Stage Change: Toggle Remarks & End Date
    if (projStatusSelect) {
        projStatusSelect.addEventListener('change', (e) => {
            toggleProjectModalRemarks(e.target.value);
        });
    }

    // 4. Modal Sub-task List Builder
    if (btnAddProjTask) {
        btnAddProjTask.addEventListener('click', () => {
            const taskInput = document.getElementById('proj-task-input');
            const taskVal = taskInput.value.trim();
            if (!taskVal) return;

            modalProjectTasks.push({
                id: 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                text: taskVal,
                completed: false
            });

            taskInput.value = '';
            renderModalTasks();
        });
    }

    // 5. Modal Budget Parts Builder
    if (btnAddProjBudget) {
        btnAddProjBudget.addEventListener('click', () => {
            const itemInput = document.getElementById('proj-budget-item');
            const costInput = document.getElementById('proj-budget-cost');
            const itemVal = itemInput.value.trim();
            const costVal = parseFloat(costInput.value);

            if (!itemVal || isNaN(costVal) || costVal < 0) return;

            modalProjectBudget.push({
                id: 'b-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                item: itemVal,
                cost: costVal
            });

            itemInput.value = '';
            costInput.value = '';
            renderModalBudget();
        });
    }

    // 6. Project Modal Form Submit (Save / Overwrite)
    formProject.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProjectForm();
    });

    // 7. View Board Status Filter dropdown
    if (filterProjectStatus) {
        filterProjectStatus.addEventListener('change', () => {
            renderProjects();
        });
    }

    // 8. Workbench Details View Event Listeners & Sticky Note modal notepad handlers
    const btnProjectDetailBack = document.getElementById('btn-project-detail-back');
    if (btnProjectDetailBack) {
        btnProjectDetailBack.addEventListener('click', () => {
            activeProjectId = null;
            switchTab('projects');
        });
    }

    // Attach visual images in details workbench
    const btnUploadProjImageDetails = document.getElementById('btn-upload-proj-image-details');
    const projImageFileDetails = document.getElementById('proj-image-file-details');
    if (btnUploadProjImageDetails && projImageFileDetails) {
        btnUploadProjImageDetails.addEventListener('click', () => projImageFileDetails.click());
        projImageFileDetails.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0 && activeProjectId) {
                processMultipleFiles(e.target.files, null, null, false, (urls) => {
                    const proj = projects.find(p => p.projectId === activeProjectId);
                    if (proj) {
                        const existing = (proj.imageUrls || '').split(',').map(u => u.trim()).filter(Boolean);
                        const updated = existing.concat(urls).join(', ');
                        proj.imageUrls = updated;
                        logActivity(`Added ${urls.length} photo(s) to "${proj.projectName}" visual gallery`, 'success');
                        renderAll();
                        renderProjectDetails(activeProjectId);
                    }
                });
            }
        });
    }

    // Detail add task
    const btnDetailAddTask = document.getElementById('btn-detail-add-task');
    if (btnDetailAddTask) {
        btnDetailAddTask.addEventListener('click', () => {
            const input = document.getElementById('proj-detail-task-input');
            const val = input.value.trim();
            if (!val || !activeProjectId) return;
            const proj = projects.find(p => p.projectId === activeProjectId);
            if (proj) {
                if (!proj.tasks) proj.tasks = [];
                proj.tasks.push({
                    id: 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    text: val,
                    completed: false
                });
                input.value = '';
                logActivity(`Checklist update: Added task "${val}" directly on workbench`, 'success');
                renderAll();
                renderProjectDetails(activeProjectId);
            }
        });
    }

    // Detail add budget part
    const btnDetailAddBudget = document.getElementById('btn-detail-add-budget');
    if (btnDetailAddBudget) {
        btnDetailAddBudget.addEventListener('click', () => {
            const itemInput = document.getElementById('proj-detail-budget-item');
            const costInput = document.getElementById('proj-detail-budget-cost');
            const itemVal = itemInput.value.trim();
            const costVal = parseFloat(costInput.value);
            if (!itemVal || isNaN(costVal) || costVal < 0 || !activeProjectId) return;
            const proj = projects.find(p => p.projectId === activeProjectId);
            if (proj) {
                if (!proj.budget) proj.budget = [];
                proj.budget.push({
                    id: 'b-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    item: itemVal,
                    cost: costVal
                });
                itemInput.value = '';
                costInput.value = '';
                logActivity(`Cost update: Logged part "${itemVal}" ($${costVal.toFixed(2)}) directly on workbench`, 'success');
                renderAll();
                renderProjectDetails(activeProjectId);
            }
        });
    }

    // Detail add diary log
    const btnDetailAddLog = document.getElementById('btn-detail-add-log');
    if (btnDetailAddLog) {
        btnDetailAddLog.addEventListener('click', () => {
            const input = document.getElementById('proj-detail-log-input');
            const val = input.value.trim();
            if (!val || !activeProjectId) return;
            const proj = projects.find(p => p.projectId === activeProjectId);
            if (proj) {
                if (!proj.statusLog) proj.statusLog = [];
                proj.statusLog.push({
                    date: new Date().toISOString().split('T')[0],
                    note: val
                });
                input.value = '';
                logActivity(`Progress update: Logged timeline status diary entry directly on workbench`, 'success');
                renderAll();
                renderProjectDetails(activeProjectId);
            }
        });
    }

    // Form sticky note submit editor dialog save
    const formStickyNote = document.getElementById('form-sticky-note');
    if (formStickyNote) {
        formStickyNote.addEventListener('submit', (e) => {
            e.preventDefault();
            const pId = document.getElementById('sticky-note-project-id').value;
            const fieldType = document.getElementById('sticky-note-field-type').value;
            const textVal = document.getElementById('sticky-note-textarea').value.trim();
            
            const proj = projects.find(p => p.projectId === pId);
            if (proj && fieldType) {
                proj[fieldType] = textVal;
                
                // Automatically append a log entry for this action
                if (!proj.statusLog) proj.statusLog = [];
                const fieldLabel = fieldType === 'lessonsLearned' ? 'Lessons Learned' : 'Next Steps / Future Plans';
                proj.statusLog.push({
                    date: new Date().toISOString().split('T')[0],
                    note: `Updated ${fieldLabel} sticky note`
                });
                
                logActivity(`Sticky Note update: Revised ${fieldLabel} for "${proj.projectName}"`, 'success');
                renderAll();
                if (activeProjectId === pId) {
                    renderProjectDetails(pId);
                }
            }
            
            const modalStickyNote = document.getElementById('modal-sticky-note');
            if (modalStickyNote) modalStickyNote.close();
        });
    }

    const btnCloseStickyNoteModal = document.getElementById('btn-close-sticky-note-modal');
    if (btnCloseStickyNoteModal) {
        btnCloseStickyNoteModal.addEventListener('click', () => {
            const modalStickyNote = document.getElementById('modal-sticky-note');
            if (modalStickyNote) modalStickyNote.close();
        });
    }

    const btnCancelStickyNote = document.getElementById('btn-cancel-sticky-note');
    if (btnCancelStickyNote) {
        btnCancelStickyNote.addEventListener('click', () => {
            const modalStickyNote = document.getElementById('modal-sticky-note');
            if (modalStickyNote) modalStickyNote.close();
        });
    }

    // Modal creation local images attachment
    const btnUploadProjImage = document.getElementById('btn-upload-proj-image');
    const projImageFile = document.getElementById('proj-image-file');
    if (btnUploadProjImage && projImageFile) {
        btnUploadProjImage.addEventListener('click', () => projImageFile.click());
        projImageFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                processMultipleFiles(e.target.files, 'proj-imageUrls', 'proj-image-upload-status', true);
            }
        });
    }
}

// Toggle visibility of End Date and Closure Remarks fields based on Selected Stage
function toggleProjectModalRemarks(status) {
    const endDateGroup = document.getElementById('proj-endDate-group');
    const remarksGroup = document.getElementById('proj-remarks-group');
    const remarksTextarea = document.getElementById('proj-successReason');
    const endDateInput = document.getElementById('proj-endDate');

    if (status === 'Completed' || status === 'Cancelled') {
        if (endDateGroup) endDateGroup.classList.remove('hidden');
        if (remarksGroup) remarksGroup.classList.remove('hidden');
        if (remarksTextarea) remarksTextarea.required = true;
        
        // Auto-fill end date if empty
        if (endDateInput && !endDateInput.value) {
            endDateInput.value = new Date().toISOString().split('T')[0];
        }
    } else {
        if (endDateGroup) endDateGroup.classList.add('hidden');
        if (remarksGroup) remarksGroup.classList.add('hidden');
        if (remarksTextarea) {
            remarksTextarea.required = false;
            remarksTextarea.value = '';
        }
        if (endDateInput) endDateInput.value = '';
    }
}

// Modal Builders Render UI
function renderModalTasks() {
    const list = document.getElementById('proj-tasks-list');
    if (!list) return;
    list.innerHTML = '';
    
    modalProjectTasks.forEach((t, idx) => {
        const li = document.createElement('li');
        li.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background-color:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--border-radius-sm); font-size:12.5px; gap:8px;';
        
        if (editTaskIndex === idx) {
            li.innerHTML = `
                <input type="text" id="inline-task-edit-input" value="${t.text}" style="flex:1; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--primary); border-radius:4px; outline:none; color:var(--text-primary);">
                <div style="display:flex; gap:4px;">
                    <button type="button" class="icon-only-btn save-inline-task" style="padding:4px; height:24px; width:24px; color:var(--success);" title="Save changes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button type="button" class="icon-only-btn cancel-inline-task" style="padding:4px; height:24px; width:24px; color:var(--danger);" title="Cancel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <span style="flex:1;">${t.text}</span>
                <div style="display:flex; gap:4px; align-items:center;">
                    <button type="button" class="icon-only-btn edit-modal-task" data-index="${idx}" style="padding:4px; height:24px; width:24px; color:var(--text-secondary);" title="Edit task">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="icon-only-btn delete-icon delete-modal-task" data-index="${idx}" style="padding:4px; height:24px; width:24px;" title="Remove task">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        }
        list.appendChild(li);
    });

    if (editTaskIndex !== null) {
        const saveBtn = list.querySelector('.save-inline-task');
        const cancelBtn = list.querySelector('.cancel-inline-task');
        const input = list.querySelector('#inline-task-edit-input');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newVal = input.value.trim();
                if (newVal) {
                    modalProjectTasks[editTaskIndex].text = newVal;
                }
                editTaskIndex = null;
                renderModalTasks();
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editTaskIndex = null;
                renderModalTasks();
            });
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
            input.focus();
        }
    } else {
        list.querySelectorAll('.edit-modal-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                editTaskIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                renderModalTasks();
            });
        });
        list.querySelectorAll('.delete-modal-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                modalProjectTasks.splice(idx, 1);
                renderModalTasks();
            });
        });
    }
}

function renderModalBudget() {
    const list = document.getElementById('proj-budget-list');
    if (!list) return;
    list.innerHTML = '';
    
    modalProjectBudget.forEach((b, idx) => {
        const li = document.createElement('li');
        li.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background-color:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--border-radius-sm); font-size:12.5px; gap:8px;';
        
        if (editBudgetIndex === idx) {
            li.innerHTML = `
                <div style="display:flex; flex:1; gap:8px;">
                    <input type="text" id="inline-budget-edit-item" value="${b.item}" style="flex:2; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--secondary); border-radius:4px; outline:none; color:var(--text-primary);">
                    <input type="number" min="0" step="0.01" id="inline-budget-edit-cost" value="${b.cost}" style="flex:1; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--secondary); border-radius:4px; outline:none; color:var(--text-primary); max-width:80px;">
                </div>
                <div style="display:flex; gap:4px;">
                    <button type="button" class="icon-only-btn save-inline-budget" style="padding:4px; height:24px; width:24px; color:var(--success);" title="Save changes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button type="button" class="icon-only-btn cancel-inline-budget" style="padding:4px; height:24px; width:24px; color:var(--danger);" title="Cancel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <span style="font-weight:600; flex:1;">${b.item}</span>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="color:var(--secondary); font-weight:700;">$${b.cost.toFixed(2)}</span>
                    <button type="button" class="icon-only-btn edit-modal-budget" data-index="${idx}" style="padding:4px; height:24px; width:24px; color:var(--text-secondary);" title="Edit part">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="icon-only-btn delete-icon delete-modal-budget" data-index="${idx}" style="padding:4px; height:24px; width:24px;" title="Remove item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        }
        list.appendChild(li);
    });

    if (editBudgetIndex !== null) {
        const saveBtn = list.querySelector('.save-inline-budget');
        const cancelBtn = list.querySelector('.cancel-inline-budget');
        const itemInput = list.querySelector('#inline-budget-edit-item');
        const costInput = list.querySelector('#inline-budget-edit-cost');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newItemVal = itemInput.value.trim();
                const newCostVal = parseFloat(costInput.value);
                if (newItemVal && !isNaN(newCostVal) && newCostVal >= 0) {
                    modalProjectBudget[editBudgetIndex].item = newItemVal;
                    modalProjectBudget[editBudgetIndex].cost = newCostVal;
                }
                editBudgetIndex = null;
                renderModalBudget();
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editBudgetIndex = null;
                renderModalBudget();
            });
        }
        if (itemInput) {
            itemInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
            costInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
            itemInput.focus();
        }
    } else {
        list.querySelectorAll('.edit-modal-budget').forEach(btn => {
            btn.addEventListener('click', (e) => {
                editBudgetIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                renderModalBudget();
            });
        });
        list.querySelectorAll('.delete-modal-budget').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                modalProjectBudget.splice(idx, 1);
                renderModalBudget();
            });
        });
    }
}

// Save Project Form Action
function saveProjectForm() {
    const id = document.getElementById('project-id').value;
    const name = document.getElementById('proj-name').value.trim();
    const status = document.getElementById('proj-status').value;
    const startDate = document.getElementById('proj-startDate').value;
    const endDate = document.getElementById('proj-endDate').value;
    const imageUrls = document.getElementById('proj-imageUrls').value.trim();
    const description = document.getElementById('proj-description').value.trim();
    const lessonsLearned = document.getElementById('proj-lessonsLearned').value.trim();
    const futurePlans = document.getElementById('proj-futurePlans').value.trim();
    const successReason = document.getElementById('proj-successReason').value.trim();

    if (!name || !startDate || !description) return;

    if (id) {
        // Edit Mode: overwrite details
        const idx = projects.findIndex(p => p.projectId === id);
        if (idx !== -1) {
            const existingLog = projects[idx].statusLog || [];
            projects[idx] = {
                projectId: id,
                projectName: name,
                description,
                status,
                startDate,
                endDate: (status === 'Completed' || status === 'Cancelled') ? (endDate || new Date().toISOString().split('T')[0]) : '',
                successReason,
                lessonsLearned,
                futurePlans,
                tasks: modalProjectTasks,
                budget: modalProjectBudget,
                statusLog: existingLog,
                imageUrls
            };
            logActivity(`Updated project details of "${name}"`, 'info');
        }
    } else {
        // Create Mode: add new project with default creation log
        const newProj = {
            projectId: 'proj-' + Date.now(),
            projectName: name,
            description,
            status,
            startDate,
            endDate: (status === 'Completed' || status === 'Cancelled') ? (endDate || new Date().toISOString().split('T')[0]) : '',
            successReason,
            lessonsLearned,
            futurePlans,
            tasks: modalProjectTasks,
            budget: modalProjectBudget,
            statusLog: [
                {
                    date: new Date().toISOString().split('T')[0],
                    note: `Project created at stage: ${status}`
                }
            ],
            imageUrls
        };
        projects.push(newProj);
        logActivity(`Successfully started new project build: "${name}"`, 'success');
    }

    renderAll();
    modalProject.close();
}

function openEditProjectModal(id) {
    const p = projects.find(proj => proj.projectId === id);
    if (!p) return;

    document.getElementById('modal-project-title').innerText = 'Edit Project Details';
    document.getElementById('project-id').value = p.projectId;
    document.getElementById('proj-name').value = p.projectName;
    document.getElementById('proj-status').value = p.status;
    document.getElementById('proj-startDate').value = p.startDate;
    document.getElementById('proj-endDate').value = p.endDate || '';
    document.getElementById('proj-imageUrls').value = p.imageUrls || '';
    document.getElementById('proj-description').value = p.description;
    document.getElementById('proj-lessonsLearned').value = p.lessonsLearned || '';
    document.getElementById('proj-futurePlans').value = p.futurePlans || '';
    document.getElementById('proj-successReason').value = p.successReason || '';

    // Copy arrays to modal variables
    modalProjectTasks = JSON.parse(JSON.stringify(p.tasks || []));
    modalProjectBudget = JSON.parse(JSON.stringify(p.budget || []));
    
    renderModalTasks();
    renderModalBudget();
    
    toggleProjectModalRemarks(p.status);
    modalProject.showModal();
}

function deleteProject(id) {
    const p = projects.find(proj => proj.projectId === id);
    const label = p ? p.projectName : 'Unknown Project';

    if (confirm(`CAUTION: Are you absolutely sure you want to delete the project "${label}"?\nThis will erase all checklists, parts cost, and journals.`)) {
        projects = projects.filter(proj => proj.projectId !== id);
        logActivity(`Deleted project "${label}" from plan`, 'warning');
        renderAll();
    }
}

// CORE PROJECT RENDERING BOARD
function renderProjects() {
    const container = document.getElementById('projects-list-container');
    const filterStatusSelect = document.getElementById('filter-project-status');
    if (!container) return;

    const statusFilter = filterStatusSelect ? filterStatusSelect.value : 'all';

    // 1. Calculate General Dashboard Overview Stats across all projects
    const totalProjectsCount = projects.length;
    const totalSpendVal = projects.reduce((sum, p) => {
        const projSpend = (p.budget || []).reduce((s, b) => s + (parseFloat(b.cost) || 0), 0);
        return sum + projSpend;
    }, 0);
    const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
    const totalLogsCount = projects.reduce((sum, p) => sum + (p.statusLog || []).length, 0);

    // Apply to Stats cards
    const projStatTotalNode = document.getElementById('proj-stat-total');
    const projStatSpendNode = document.getElementById('proj-stat-spend');
    const projStatActiveNode = document.getElementById('proj-stat-active');
    const projStatLogsNode = document.getElementById('proj-stat-logs');

    if (projStatTotalNode) projStatTotalNode.innerText = totalProjectsCount;
    if (projStatSpendNode) projStatSpendNode.innerText = `$${totalSpendVal.toFixed(2)}`;
    if (projStatActiveNode) projStatActiveNode.innerText = activeProjectsCount;
    if (projStatLogsNode) projStatLogsNode.innerText = totalLogsCount;

    // 2. Filter Projects
    const filtered = projects.filter(p => {
        // Global search match
        const matchesSearch = searchQuery === '' || 
            p.projectName.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery) ||
            (p.lessonsLearned || '').toLowerCase().includes(searchQuery) ||
            (p.futurePlans || '').toLowerCase().includes(searchQuery) ||
            (p.tasks || []).some(t => t.text.toLowerCase().includes(searchQuery));

        // Stage matches
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="view-placeholder" style="grid-column: 1 / -1; padding: 60px 20px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px; height:48px; margin-bottom:12px; color:var(--text-muted);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p>No matching projects found in your planner board.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    filtered.forEach(p => {
        // Determine status-specific variables for visual aesthetics
        let statusColor = 'var(--primary)';
        let statusGlow = 'rgba(99, 102, 241, 0.04)';
        let statusShadowGlow = 'rgba(99, 102, 241, 0.12)';
        let statusClass = 'good';

        if (p.status === 'Planning') {
            statusColor = 'var(--purple)';
            statusGlow = 'rgba(168, 85, 247, 0.04)';
            statusShadowGlow = 'rgba(168, 85, 247, 0.12)';
            statusClass = 'low';
        } else if (p.status === 'In Progress') {
            statusColor = 'var(--secondary)';
            statusGlow = 'rgba(6, 182, 212, 0.04)';
            statusShadowGlow = 'rgba(6, 182, 212, 0.12)';
            statusClass = 'good';
        } else if (p.status === 'On Hold') {
            statusColor = 'var(--warning)';
            statusGlow = 'rgba(245, 158, 11, 0.04)';
            statusShadowGlow = 'rgba(245, 158, 11, 0.12)';
            statusClass = 'low';
        } else if (p.status === 'Completed') {
            statusColor = 'var(--success)';
            statusGlow = 'rgba(16, 185, 129, 0.04)';
            statusShadowGlow = 'rgba(16, 185, 129, 0.12)';
            statusClass = 'good';
        } else if (p.status === 'Cancelled') {
            statusColor = 'var(--danger)';
            statusGlow = 'rgba(239, 68, 68, 0.04)';
            statusShadowGlow = 'rgba(239, 68, 68, 0.12)';
            statusClass = 'out';
        }

        // Parse images array
        const imagesList = (p.imageUrls || '').split(',').map(url => url.trim()).filter(Boolean);

        // Sub-tasks counts and progress percentage
        const taskList = p.tasks || [];
        const totalTasks = taskList.length;
        const completedTasks = taskList.filter(t => t.completed).length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Sum Budget Spent
        const budgetList = p.budget || [];
        const projectSpend = budgetList.reduce((sum, b) => sum + (parseFloat(b.cost) || 0), 0);

        // Calculate active timelines: "Days Open" age logic
        let daysOpenLabel = '';
        if (p.startDate) {
            const startMs = Date.parse(p.startDate);
            if (!isNaN(startMs)) {
                if (p.status === 'Completed' || p.status === 'Cancelled') {
                    const endMs = p.endDate ? Date.parse(p.endDate) : Date.now();
                    const durationDays = Math.max(Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24)), 1);
                    daysOpenLabel = `Duration: ${durationDays} ${durationDays === 1 ? 'day' : 'days'}`;
                } else {
                    const openDays = Math.max(Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)), 0);
                    daysOpenLabel = `Active: ${openDays} ${openDays === 1 ? 'day' : 'days'} open`;
                }
            }
        }

        const card = document.createElement('div');
        card.className = 'project-card glass-panel';
        card.setAttribute('style', `--status-color: ${statusColor}; --status-glow: ${statusGlow}; --status-shadow-glow: ${statusShadowGlow};`);
        
        // Carousel index tracking
        if (projectCarouselIndices[p.projectId] === undefined) {
            projectCarouselIndices[p.projectId] = 0;
        }

        // 1. Build Card Header & Image block
        let imageMarkup = '';
        if (imagesList.length > 0) {
            const activeIndex = projectCarouselIndices[p.projectId];
            
            let dotsMarkup = '';
            if (imagesList.length > 1) {
                dotsMarkup = `<div class="project-carousel-dots">` + 
                    imagesList.map((_, i) => `<span class="project-carousel-dot ${i === activeIndex ? 'active' : ''}" data-project="${p.projectId}" data-slide="${i}"></span>`).join('') +
                    `</div>`;
            }

            let controlsMarkup = '';
            if (imagesList.length > 1) {
                controlsMarkup = `
                    <button type="button" class="project-carousel-btn prev project-carousel-nav" data-project="${p.projectId}" data-dir="-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button type="button" class="project-carousel-btn next project-carousel-nav" data-project="${p.projectId}" data-dir="1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                `;
            }

            imageMarkup = `
                <div class="project-carousel-wrapper">
                    ${controlsMarkup}
                    <div class="project-carousel-track" style="transform: translateX(-${activeIndex * 100}%);">
                        ${imagesList.map(url => `
                            <div class="project-carousel-slide">
                                <img src="${url}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%232e2942%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-family=%22Plus Jakarta Sans%22 font-size=%2212%22>Failed to load image</text></svg>';" alt="Build photo">
                            </div>
                        `).join('')}
                    </div>
                    ${dotsMarkup}
                </div>
            `;
        } else {
            imageMarkup = `
                <div class="project-carousel-wrapper">
                    <div class="project-no-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        <span>No build photos attached</span>
                    </div>
                </div>
            `;
        }

        // 2. Checklist Items list markup
        let checklistMarkup = '';
        if (totalTasks > 0) {
            checklistMarkup = `
                <ul class="project-card-checklist">
                    ${taskList.map(t => `
                        <li class="project-card-task-item" data-project="${p.projectId}" data-task="${t.id}">
                            <input type="checkbox" ${t.completed ? 'checked' : ''} class="project-card-task-checkbox">
                            <span class="project-card-task-text ${t.completed ? 'completed' : ''}">${t.text}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            checklistMarkup = `<p style="font-size:12px; color:var(--text-muted); font-style:italic;">No checklist items added. Edit project to build your checklist.</p>`;
        }

        // 3. Budget parts list micro-table
        let budgetMarkup = '';
        if (budgetList.length > 0) {
            budgetMarkup = `
                <table class="project-card-budget-table">
                    <thead>
                        <tr>
                            <th>Part / Material</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${budgetList.map(b => `
                            <tr>
                                <td style="font-weight:600;">${b.item}</td>
                                <td class="text-right" style="color:var(--text-primary); font-weight:700;">$${b.cost.toFixed(2)}</td>
                                <td class="text-right">
                                    <button type="button" class="icon-only-btn delete-icon delete-card-budget-item" data-project="${p.projectId}" data-item="${b.id}" style="padding:2px; display:inline-flex;" title="Delete purchase">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            budgetMarkup = `<p style="font-size:12px; color:var(--text-muted); font-style:italic; margin-bottom:12px;">No logged parts. Use inputs below to add a purchase.</p>`;
        }

        // 4. Daily Diaries logs lists vertical trail
        let logsMarkup = '';
        const logsList = p.statusLog || [];
        if (logsList.length > 0) {
            logsMarkup = `
                <div class="project-card-timeline">
                    ${logsList.map(log => `
                        <div class="project-card-timeline-item">
                            <div class="project-card-timeline-bullet"></div>
                            <div class="project-card-timeline-date">${log.date}</div>
                            <div class="project-card-timeline-note">${log.note}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            logsMarkup = `<p style="font-size:12px; color:var(--text-muted); font-style:italic; margin-bottom:12px;">No logged diary journals. Add progress entries below.</p>`;
        }

        // 5. Lessons Learned / Future Plans
        let notesDrawerMarkup = '';
        if (p.lessonsLearned || p.futurePlans) {
            notesDrawerMarkup = `
                <div class="project-drawer" data-drawer="notes">
                    <button class="project-drawer-trigger">
                        <span>💡 Reference & Lessons Learned</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="project-drawer-content" style="display:flex; flex-direction:column; gap:12px;">
                        ${p.lessonsLearned ? `<div><h5 style="font-size:11px; text-transform:uppercase; color:var(--purple); font-weight:700;">Lessons Learned:</h5><p style="font-size:12px; font-style:italic; margin-top:2px; line-height:1.4; color:var(--text-secondary);">${p.lessonsLearned}</p></div>` : ''}
                        ${p.futurePlans ? `<div><h5 style="font-size:11px; text-transform:uppercase; color:var(--secondary); font-weight:700;">Future Plans:</h5><p style="font-size:12px; margin-top:2px; line-height:1.4; color:var(--text-secondary);">${p.futurePlans}</p></div>` : ''}
                    </div>
                </div>
            `;
        }

        // 6. Closure Remarks
        let closureRemarksMarkup = '';
        if ((p.status === 'Completed' || p.status === 'Cancelled') && p.successReason) {
            closureRemarksMarkup = `
                <div class="project-closure-remarks ${p.status === 'Cancelled' ? 'cancelled' : ''}">
                    <div class="project-closure-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px; height:14px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>${p.status === 'Completed' ? 'Closure Success Note' : 'Cancellation Reason'}</span>
                    </div>
                    <div class="project-closure-text">"${p.successReason}"</div>
                </div>
            `;
        }

        // Assemble full card HTML body
        card.innerHTML = `
            <div class="project-card-actions">
                <button class="icon-only-btn edit-project" data-id="${p.projectId}" title="Edit project">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="icon-only-btn delete-icon delete-project" data-id="${p.projectId}" title="Delete project">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>

            <div class="project-card-header">
                <div class="project-brand-material">
                    <span class="project-date-badge">${p.startDate} ${p.endDate ? `&rarr; ${p.endDate}` : ''}</span>
                    <span class="project-card-title">${p.projectName}</span>
                </div>
                <div class="project-status-row">
                    <span class="status-pill ${statusClass}">
                        <span class="status-indicator"></span>
                        <span>${p.status}</span>
                    </span>
                    <span style="font-size:11px; font-weight:700; color:var(--text-muted);">${daysOpenLabel}</span>
                </div>
            </div>

            ${imageMarkup}

            <div class="project-progress-container">
                <div class="project-progress-meta">
                    <span class="project-progress-label">Task Progress</span>
                    <span class="project-progress-percent">${progressPercent}%</span>
                </div>
                <div class="project-progress-outer">
                    <div class="project-progress-inner" style="width: ${progressPercent}%;"></div>
                </div>
            </div>

            <div class="project-details-grid">
                <div class="project-description">"${p.description}"</div>
                
                <div class="project-info-row">
                    <span class="project-info-label">Total Spend:</span>
                    <span class="project-info-val" style="color:var(--secondary); font-size:14px;">$${projectSpend.toFixed(2)}</span>
                </div>
                <div class="project-info-row">
                    <span class="project-info-label">Tasks Checked:</span>
                    <span class="project-info-val">${completedTasks} / ${totalTasks} completed</span>
                </div>
            </div>

            <!-- Expandable Drawers (Checklist, Budget, Diary status) -->
            <div class="project-card-expanders">
                <!-- 1. Tasks Checklist Drawer -->
                <div class="project-drawer" data-drawer="tasks">
                    <button class="project-drawer-trigger">
                        <span>📝 Interactive Task Checklist (${completedTasks}/${totalTasks})</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="project-drawer-content">
                        ${checklistMarkup}
                    </div>
                </div>

                <!-- 2. Budget cost ledger Drawer -->
                <div class="project-drawer" data-drawer="budget">
                    <button class="project-drawer-trigger">
                        <span>💲 Parts & Budget Tracker (Spent: $${projectSpend.toFixed(2)})</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="project-drawer-content">
                        ${budgetMarkup}
                        
                        <!-- Quick purchase adding row directly on Card! -->
                        <div class="card-drawer-input-row" style="margin-top:12px; border-top:1px solid rgba(255,255,255,0.04); padding-top:12px;">
                            <input type="text" placeholder="Add part bought..." class="card-budget-item-input" style="flex:2;">
                            <input type="number" min="0" step="0.01" placeholder="$ Price" class="card-budget-cost-input" style="flex:1;">
                            <button type="button" class="card-drawer-add-btn add-card-budget-item" data-project="${p.projectId}" title="Add purchase to ledger">+</button>
                        </div>
                    </div>
                </div>

                <!-- 3. Daily Status timeline diary Drawer -->
                <div class="project-drawer" data-drawer="timeline">
                    <button class="project-drawer-trigger">
                        <span>📅 Daily Status Diary (${logsList.length} logs)</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="project-drawer-content">
                        ${logsMarkup}

                        <!-- Quick log adding row directly on Card! -->
                        <div class="card-drawer-input-row" style="margin-top:12px; border-top:1px solid rgba(255,255,255,0.04); padding-top:12px;">
                            <input type="text" placeholder="Log today's progress..." class="card-timeline-note-input" style="flex:1;">
                            <button type="button" class="card-drawer-add-btn add-card-timeline-item" data-project="${p.projectId}" title="Add entry to diary">Add Log</button>
                        </div>
                    </div>
                </div>

                <!-- 4. Lessons learned Drawer -->
                ${notesDrawerMarkup}
            </div>

            ${closureRemarksMarkup}
        `;

        card.addEventListener('click', (e) => {
            // Ignore clicking on action buttons, checkboxes, inputs, drawers or carousel buttons
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea') || e.target.closest('.project-carousel-dot') || e.target.closest('.project-drawer') || e.target.closest('.project-card-actions')) {
                return;
            }
            activeProjectId = p.projectId;
            switchTab('project-details');
            renderProjectDetails(p.projectId);
        });

        container.appendChild(card);
    });

    // WIRING INTERACTION EVENT LISTENERS ON RENDERED CARDS

    // 1. Drawer expand toggles
    document.querySelectorAll('.project-drawer-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const drawer = e.currentTarget.closest('.project-drawer');
            drawer.classList.toggle('active');
        });
    });

    // 2. Sub-tasks checklist checkboxes interactive toggle
    document.querySelectorAll('.project-card-task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent double triggers if clicked exactly on checkbox input
            if (e.target.type === 'checkbox') return;
            
            const checkbox = item.querySelector('.project-card-task-checkbox');
            checkbox.checked = !checkbox.checked;
            toggleCardTaskCompleted(item.getAttribute('data-project'), item.getAttribute('data-task'), checkbox.checked);
        });
    });

    document.querySelectorAll('.project-card-task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const item = e.target.closest('.project-card-task-item');
            toggleCardTaskCompleted(item.getAttribute('data-project'), item.getAttribute('data-task'), e.target.checked);
        });
    });

    // 3. Delete purchase directly from card ledger drawer
    document.querySelectorAll('.delete-card-budget-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const itemId = btn.getAttribute('data-item');
            deleteCardBudgetItem(projId, itemId);
        });
    });

    // 4. Quick add purchase directly from card drawer
    document.querySelectorAll('.add-card-budget-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const container = btn.closest('.card-drawer-input-row');
            const itemInput = container.querySelector('.card-budget-item-input');
            const costInput = container.querySelector('.card-budget-cost-input');

            const itemVal = itemInput.value.trim();
            const costVal = parseFloat(costInput.value);

            if (!itemVal || isNaN(costVal) || costVal < 0) return;

            addCardBudgetItem(projId, itemVal, costVal);
        });
    });

    // 5. Quick diary log entry directly from card drawer
    document.querySelectorAll('.add-card-timeline-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const container = btn.closest('.card-drawer-input-row');
            const noteInput = container.querySelector('.card-timeline-note-input');
            const noteVal = noteInput.value.trim();

            if (!noteVal) return;

            addCardTimelineItem(projId, noteVal);
        });
    });

    // 6. Image carousel arrow navigation button triggers
    document.querySelectorAll('.project-carousel-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const projId = btn.getAttribute('data-project');
            const direction = parseInt(btn.getAttribute('data-dir'));
            navigateCarousel(projId, direction);
        });
    });

    // 7. Image carousel dots click indicators
    document.querySelectorAll('.project-carousel-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const projId = dot.getAttribute('data-project');
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            jumpToCarouselSlide(projId, slideIndex);
        });
    });

    // 8. Open edit project details modal dialog pre-fills
    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openEditProjectModal(id);
        });
    });

    // 9. Delete project build plan
    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            deleteProject(id);
        });
    });
}

// INLINE PROJECT INTERACTION TRANSITIONS

// 1. Checklist checkboxes checked/unchecked immediately updates databases
function toggleCardTaskCompleted(projId, taskId, isCompleted) {
    const projIdx = projects.findIndex(p => p.projectId === projId);
    if (projIdx === -1) return;

    const taskIdx = projects[projIdx].tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;

    projects[projIdx].tasks[taskIdx].completed = isCompleted;

    const taskText = projects[projIdx].tasks[taskIdx].text;
    logActivity(`Checklist update: "${taskText}" marked ${isCompleted ? 'completed' : 'active'} on build card`, 'info');
    
    // Quick recalculations & storage saving
    renderAll();
}

// 2. Budget cost entries inline additions and deletions immediately recalculates Spent stats
function addCardBudgetItem(projId, item, cost) {
    const projIdx = projects.findIndex(p => p.projectId === projId);
    if (projIdx === -1) return;

    projects[projIdx].budget.push({
        id: 'b-' + Date.now(),
        item: item,
        cost: cost
    });

    logActivity(`Cost update: Logged purchase "${item}" ($${cost.toFixed(2)}) directly on card`, 'info');
    
    // Quick recalculations & storage saving
    renderAll();
}

function deleteCardBudgetItem(projId, itemId) {
    const projIdx = projects.findIndex(p => p.projectId === projId);
    if (projIdx === -1) return;

    const item = projects[projIdx].budget.find(b => b.id === itemId);
    const itemName = item ? item.item : 'item';
    const itemCost = item ? item.cost : 0;

    projects[projIdx].budget = projects[projIdx].budget.filter(b => b.id !== itemId);

    logActivity(`Cost update: Removed logged purchase "${itemName}" ($${itemCost.toFixed(2)}) from card`, 'warning');
    
    // Quick recalculations & storage saving
    renderAll();
}

// 3. Chronological diary notes logged directly from card drawer
function addCardTimelineItem(projId, note) {
    const projIdx = projects.findIndex(p => p.projectId === projId);
    if (projIdx === -1) return;

    if (!projects[projIdx].statusLog) {
        projects[projIdx].statusLog = [];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    projects[projIdx].statusLog.push({
        date: todayStr,
        note: note
    });

    logActivity(`Progress update: Logged timeline status diary entry directly on card`, 'success');
    
    // Quick recalculations & storage saving
    renderAll();
}

// 4. Image Carousel Track Transitions sliding calculations
function navigateCarousel(projId, direction) {
    const proj = projects.find(p => p.projectId === projId);
    if (!proj) return;

    const imagesList = (proj.imageUrls || '').split(',').map(url => url.trim()).filter(Boolean);
    if (imagesList.length <= 1) return;

    let activeIndex = projectCarouselIndices[projId] || 0;
    activeIndex = (activeIndex + direction + imagesList.length) % imagesList.length;
    projectCarouselIndices[projId] = activeIndex;

    // Shift Carousel track slider
    const gridBoard = document.getElementById('projects-list-container');
    if (!gridBoard) return;
    
    // Find the specific card
    const cardNode = Array.from(gridBoard.querySelectorAll('.project-card')).find(c => {
        const editBtn = c.querySelector('.edit-project');
        return editBtn && editBtn.getAttribute('data-id') === projId;
    });

    if (cardNode) {
        const track = cardNode.querySelector('.project-carousel-track');
        if (track) {
            track.style.transform = `translateX(-${activeIndex * 100}%)`;
        }

        // Toggle dots active classes
        const dots = cardNode.querySelectorAll('.project-carousel-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

function jumpToCarouselSlide(projId, slideIndex) {
    const proj = projects.find(p => p.projectId === projId);
    if (!proj) return;

    const imagesList = (proj.imageUrls || '').split(',').map(url => url.trim()).filter(Boolean);
    if (slideIndex < 0 || slideIndex >= imagesList.length) return;

    projectCarouselIndices[projId] = slideIndex;

    // Shift Carousel track slider
    const gridBoard = document.getElementById('projects-list-container');
    if (!gridBoard) return;
    
    // Find the specific card
    const cardNode = Array.from(gridBoard.querySelectorAll('.project-card')).find(c => {
        const editBtn = c.querySelector('.edit-project');
        return editBtn && editBtn.getAttribute('data-id') === projId;
    });

    if (cardNode) {
        const track = cardNode.querySelector('.project-carousel-track');
        if (track) {
            track.style.transform = `translateX(-${slideIndex * 100}%)`;
        }

        // Toggle dots active classes
        const dots = cardNode.querySelectorAll('.project-carousel-dot');
        dots.forEach((dot, idx) => {
            if (idx === slideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}



function openStickyNoteEditor(projectId, fieldType) {
    const proj = projects.find(p => p.projectId === projectId);
    if (!proj) return;
    
    const modalStickyNote = document.getElementById('modal-sticky-note');
    const titleEl = document.getElementById('modal-sticky-note-title');
    const projEl = document.getElementById('modal-sticky-note-project');
    const textareaEl = document.getElementById('sticky-note-textarea');
    
    document.getElementById('sticky-note-project-id').value = projectId;
    document.getElementById('sticky-note-field-type').value = fieldType;
    
    if (titleEl) {
        titleEl.innerText = fieldType === 'lessonsLearned' ? 'Lessons Learned (Future Reference)' : 'Next Steps & Future Plans';
    }
    if (projEl) {
        projEl.innerText = proj.projectName;
    }
    if (textareaEl) {
        textareaEl.value = proj[fieldType] || '';
    }
    
    if (modalStickyNote) {
        if (fieldType === 'lessonsLearned') {
            modalStickyNote.setAttribute('data-note-style', 'yellow');
        } else {
            modalStickyNote.setAttribute('data-note-style', 'teal');
        }
        modalStickyNote.showModal();
    }
}

function renderProjectDetails(projectId) {
    const p = projects.find(proj => proj.projectId === projectId);
    if (!p) return;

    const nameEl = document.getElementById('proj-detail-name');
    const descEl = document.getElementById('proj-detail-desc');
    const statusPill = document.getElementById('proj-detail-status-pill');
    const statusText = document.getElementById('proj-detail-status');
    const durationEl = document.getElementById('proj-detail-duration');

    if (nameEl) nameEl.innerText = p.projectName;
    if (descEl) descEl.innerText = p.description || 'No description provided';
    if (statusText) statusText.innerText = p.status;

    if (statusPill) {
        statusPill.className = 'status-pill';
        if (p.status === 'Planning') statusPill.classList.add('low');
        else if (p.status === 'In Progress') statusPill.classList.add('good');
        else if (p.status === 'On Hold') statusPill.classList.add('low');
        else if (p.status === 'Completed') statusPill.classList.add('good');
        else if (p.status === 'Cancelled') statusPill.classList.add('out');
    }

    if (durationEl && p.startDate) {
        const startMs = Date.parse(p.startDate);
        if (!isNaN(startMs)) {
            if (p.status === 'Completed' || p.status === 'Cancelled') {
                const endMs = p.endDate ? Date.parse(p.endDate) : Date.now();
                const durationDays = Math.max(Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24)), 1);
                durationEl.innerText = `Duration: ${durationDays} ${durationDays === 1 ? 'day' : 'days'}`;
            } else {
                const openDays = Math.max(Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)), 0);
                durationEl.innerText = `Active: ${openDays} ${openDays === 1 ? 'day' : 'days'} open`;
            }
        }
    }

    const carouselTarget = document.getElementById('proj-detail-carousel-target');
    if (carouselTarget) {
        const imagesList = (p.imageUrls || '').split(',').map(url => url.trim()).filter(Boolean);
        if (imagesList.length > 0) {
            if (projectCarouselIndices[projectId] === undefined) {
                projectCarouselIndices[projectId] = 0;
            }
            let activeIdx = projectCarouselIndices[projectId];
            if (activeIdx >= imagesList.length) {
                activeIdx = 0;
                projectCarouselIndices[projectId] = 0;
            }

            let controlsMarkup = '';
            if (imagesList.length > 1) {
                controlsMarkup = `
                    <button type="button" class="project-carousel-btn prev detail-carousel-nav" data-dir="-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button type="button" class="project-carousel-btn next detail-carousel-nav" data-dir="1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                `;
            }

            let dotsMarkup = '';
            if (imagesList.length > 1) {
                dotsMarkup = `<div class="project-carousel-dots">` + 
                    imagesList.map((_, i) => `<span class="project-carousel-dot detail-carousel-dot ${i === activeIdx ? 'active' : ''}" data-slide="${i}"></span>`).join('') +
                    `</div>`;
            }

            carouselTarget.innerHTML = `
                <div class="project-carousel-wrapper" style="height: 320px; border-radius: 8px; overflow: hidden; position: relative;">
                    ${controlsMarkup}
                    <div class="project-carousel-track" style="transform: translateX(-${activeIdx * 100}%); display: flex; height: 100%; transition: transform 0.4s ease;">
                        ${imagesList.map(url => `
                            <div class="project-carousel-slide" style="flex: 0 0 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--bg-surface-elevated);">
                                <img src="${url}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%232e2942%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-family=%22Plus Jakarta Sans%22 font-size=%2212%22>Failed to load image</text></svg>';" alt="Build photo">
                            </div>
                        `).join('')}
                    </div>
                    ${dotsMarkup}
                </div>
            `;

            carouselTarget.querySelectorAll('.detail-carousel-nav').forEach(btn => {
                btn.addEventListener('click', () => {
                    const direction = parseInt(btn.getAttribute('data-dir'));
                    let newIdx = (projectCarouselIndices[projectId] + direction + imagesList.length) % imagesList.length;
                    projectCarouselIndices[projectId] = newIdx;
                    renderProjectDetails(projectId);
                });
            });

            carouselTarget.querySelectorAll('.detail-carousel-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    projectCarouselIndices[projectId] = parseInt(dot.getAttribute('data-slide'));
                    renderProjectDetails(projectId);
                });
            });
        } else {
            carouselTarget.innerHTML = `
                <div class="project-no-image" style="height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1.5px dashed var(--border-color); border-radius: 8px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 32px; height: 32px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span style="font-size: 13px;">No build photos attached. Upload files below.</span>
                </div>
            `;
        }
    }

    const tasksContainer = document.getElementById('proj-detail-tasks-list-container');
    if (tasksContainer) {
        tasksContainer.innerHTML = '';
        const taskList = p.tasks || [];
        const total = taskList.length;
        const completed = taskList.filter(t => t.completed).length;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        const progressPercentEl = document.getElementById('proj-detail-progress-percent');
        const progressInnerEl = document.getElementById('proj-detail-progress-inner');
        if (progressPercentEl) progressPercentEl.innerText = `${progressPercent}% Completed`;
        if (progressInnerEl) progressInnerEl.style.width = `${progressPercent}%`;

        if (taskList.length === 0) {
            tasksContainer.innerHTML = `<li style="font-size:12.5px; color:var(--text-muted); font-style:italic; padding: 10px 0;">No tasks currently in checklist.</li>`;
        } else {
            taskList.forEach((t, idx) => {
                const li = document.createElement('li');
                li.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background-color:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--border-radius-sm); font-size:13px; gap:8px;';
                
                if (detailEditTaskIndex === idx) {
                    li.innerHTML = `
                        <input type="text" id="detail-inline-task-edit-input" value="${t.text}" style="flex:1; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--primary); border-radius:4px; outline:none; color:var(--text-primary);">
                        <div style="display:flex; gap:4px;">
                            <button type="button" class="icon-only-btn save-detail-inline-task" style="padding:4px; height:24px; width:24px; color:var(--success);" title="Save changes">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            <button type="button" class="icon-only-btn cancel-detail-inline-task" style="padding:4px; height:24px; width:24px; color:var(--danger);" title="Cancel">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    `;
                } else {
                    li.innerHTML = `
                        <div style="display:flex; align-items:center; gap:10px; flex:1; cursor:pointer;" class="detail-task-item-click">
                            <input type="checkbox" ${t.completed ? 'checked' : ''} class="detail-task-checkbox" style="cursor:pointer;">
                            <span class="detail-task-text ${t.completed ? 'completed' : ''}" style="color: var(--text-primary); font-size: 13.5px; font-weight: 500;">${t.text}</span>
                        </div>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <button type="button" class="icon-only-btn edit-detail-task" data-index="${idx}" style="padding:4px; height:24px; width:24px; color:var(--text-secondary);" title="Edit task title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button type="button" class="icon-only-btn delete-icon delete-detail-task" data-index="${idx}" style="padding:4px; height:24px; width:24px;" title="Delete task">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    `;
                }
                tasksContainer.appendChild(li);
            });

            if (detailEditTaskIndex !== null) {
                const saveBtn = tasksContainer.querySelector('.save-detail-inline-task');
                const cancelBtn = tasksContainer.querySelector('.cancel-detail-inline-task');
                const input = tasksContainer.querySelector('#detail-inline-task-edit-input');
                
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        const newVal = input.value.trim();
                        if (newVal) {
                            p.tasks[detailEditTaskIndex].text = newVal;
                            logActivity(`Checklist update: Edited task description`, 'info');
                            renderAll();
                        }
                        detailEditTaskIndex = null;
                        renderProjectDetails(projectId);
                    });
                }
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        detailEditTaskIndex = null;
                        renderProjectDetails(projectId);
                    });
                }
                if (input) {
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            saveBtn.click();
                        } else if (e.key === 'Escape') {
                            cancelBtn.click();
                        }
                    });
                    input.focus();
                }
            } else {
                tasksContainer.querySelectorAll('.detail-task-item-click').forEach((item, idx) => {
                    item.addEventListener('click', (e) => {
                        if (e.target.type === 'checkbox') return;
                        const box = item.querySelector('.detail-task-checkbox');
                        box.checked = !box.checked;
                        p.tasks[idx].completed = box.checked;
                        logActivity(`Checklist update: Marked task "${p.tasks[idx].text}" ${box.checked ? 'completed' : 'active'}`, 'info');
                        renderAll();
                        renderProjectDetails(projectId);
                    });
                });
                tasksContainer.querySelectorAll('.detail-task-checkbox').forEach((checkbox, idx) => {
                    checkbox.addEventListener('change', (e) => {
                        p.tasks[idx].completed = e.target.checked;
                        logActivity(`Checklist update: Marked task "${p.tasks[idx].text}" ${e.target.checked ? 'completed' : 'active'}`, 'info');
                        renderAll();
                        renderProjectDetails(projectId);
                    });
                });
                tasksContainer.querySelectorAll('.edit-detail-task').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        detailEditTaskIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                        renderProjectDetails(projectId);
                    });
                });
                tasksContainer.querySelectorAll('.delete-detail-task').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                        const deletedText = p.tasks[idx].text;
                        p.tasks.splice(idx, 1);
                        logActivity(`Checklist update: Deleted task "${deletedText}"`, 'warning');
                        renderAll();
                        renderProjectDetails(projectId);
                    });
                });
            }
        }
    }

    const budgetTbody = document.getElementById('proj-detail-budget-tbody');
    if (budgetTbody) {
        budgetTbody.innerHTML = '';
        const budgetList = p.budget || [];
        const totalSpend = budgetList.reduce((sum, b) => sum + (parseFloat(b.cost) || 0), 0);
        
        const spendBadge = document.getElementById('proj-detail-spend-badge');
        if (spendBadge) spendBadge.innerText = `$${totalSpend.toFixed(2)}`;

        if (budgetList.length === 0) {
            budgetTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted); font-style:italic;">No custom project parts bought yet.</td></tr>`;
        } else {
            budgetList.forEach((b, idx) => {
                const tr = document.createElement('tr');
                if (detailEditBudgetIndex === idx) {
                    tr.innerHTML = `
                        <td style="padding: 8px 4px;">
                            <input type="text" id="detail-inline-budget-edit-item" value="${b.item}" style="width:100%; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--secondary); border-radius:4px; outline:none; color:var(--text-primary);">
                        </td>
                        <td style="padding: 8px 4px; text-align:right;">
                            <input type="number" min="0" step="0.01" id="detail-inline-budget-edit-cost" value="${b.cost}" style="width:70px; padding:4px 8px; font-size:12.5px; background:var(--bg-surface); border:1px solid var(--secondary); border-radius:4px; outline:none; color:var(--text-primary); text-align:right;">
                        </td>
                        <td style="padding: 8px 4px; text-align:right;">
                            <div style="display:flex; gap:4px; justify-content:flex-end;">
                                <button type="button" class="icon-only-btn save-detail-inline-budget" style="padding:4px; height:24px; width:24px; color:var(--success);" title="Save changes">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px; height:12px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <button type="button" class="icon-only-btn cancel-detail-inline-budget" style="padding:4px; height:24px; width:24px; color:var(--danger);" title="Cancel">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </td>
                    `;
                } else {
                    tr.innerHTML = `
                        <td style="padding: 10px 4px; font-weight: 600; color: var(--text-primary); font-size: 13px;">${b.item}</td>
                        <td class="text-right" style="padding: 10px 4px; font-weight: 700; color: var(--secondary); font-size: 13.5px;">$${b.cost.toFixed(2)}</td>
                        <td class="text-right" style="padding: 10px 4px;">
                            <div style="display:flex; gap:4px; justify-content:flex-end; align-items:center;">
                                <button type="button" class="icon-only-btn edit-detail-budget" data-index="${idx}" style="padding:4px; height:24px; width:24px; color:var(--text-secondary);" title="Edit part details">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button type="button" class="icon-only-btn delete-icon delete-detail-budget" data-index="${idx}" style="padding:4px; height:24px; width:24px;" title="Delete purchase">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </td>
                    `;
                }
                budgetTbody.appendChild(tr);
            });

            if (detailEditBudgetIndex !== null) {
                const saveBtn = budgetTbody.querySelector('.save-detail-inline-budget');
                const cancelBtn = budgetTbody.querySelector('.cancel-detail-inline-budget');
                const itemInput = budgetTbody.querySelector('#detail-inline-budget-edit-item');
                const costInput = budgetTbody.querySelector('#detail-inline-budget-edit-cost');
                
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        const newItemVal = itemInput.value.trim();
                        const newCostVal = parseFloat(costInput.value);
                        if (newItemVal && !isNaN(newCostVal) && newCostVal >= 0) {
                            p.budget[detailEditBudgetIndex].item = newItemVal;
                            p.budget[detailEditBudgetIndex].cost = newCostVal;
                            logActivity(`Cost update: Edited purchased part details`, 'info');
                            renderAll();
                        }
                        detailEditBudgetIndex = null;
                        renderProjectDetails(projectId);
                    });
                }
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        detailEditBudgetIndex = null;
                        renderProjectDetails(projectId);
                    });
                }
                if (itemInput) {
                    itemInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            saveBtn.click();
                        } else if (e.key === 'Escape') {
                            cancelBtn.click();
                        }
                    });
                    costInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            saveBtn.click();
                        } else if (e.key === 'Escape') {
                            cancelBtn.click();
                        }
                    });
                    itemInput.focus();
                }
            } else {
                budgetTbody.querySelectorAll('.edit-detail-budget').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        detailEditBudgetIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                        renderProjectDetails(projectId);
                    });
                });
                budgetTbody.querySelectorAll('.delete-detail-budget').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                        const deletedItem = p.budget[idx].item;
                        const deletedCost = p.budget[idx].cost;
                        p.budget.splice(idx, 1);
                        logActivity(`Cost update: Deleted part "${deletedItem}" ($${deletedCost.toFixed(2)})`, 'warning');
                        renderAll();
                        renderProjectDetails(projectId);
                    });
                });
            }
        }
    }

    const timelineContainer = document.getElementById('proj-detail-logs-timeline-container');
    if (timelineContainer) {
        timelineContainer.innerHTML = '';
        const logsList = p.statusLog || [];
        if (logsList.length === 0) {
            timelineContainer.innerHTML = `<p style="font-size:12.5px; color:var(--text-muted); font-style:italic; padding: 10px 0;">No chronological status diary logs recorded yet.</p>`;
        } else {
            const sortedLogs = [...logsList].reverse();
            sortedLogs.forEach(log => {
                const item = document.createElement('div');
                item.className = 'project-card-timeline-item';
                item.style.cssText = 'position:relative; padding-left:24px; margin-bottom:16px;';
                item.innerHTML = `
                    <div class="project-card-timeline-bullet" style="position:absolute; left:0; top:4px; width:10px; height:10px; border-radius:50%; background-color:var(--primary); border:2px solid var(--bg-surface);"></div>
                    <div class="project-card-timeline-date" style="font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px;">${log.date}</div>
                    <div class="project-card-timeline-note" style="font-size:13px; color:var(--text-secondary); margin-top:4px; line-height:1.4; white-space:pre-wrap;">${log.note}</div>
                `;
                timelineContainer.appendChild(item);
            });
        }
    }

    const pinboard = document.getElementById('project-detail-pinboard');
    if (pinboard) {
        pinboard.innerHTML = `
            <div class="sticky-note lessons-learned-note" id="sticky-lessons-learned" style="cursor: pointer;">
                <div class="sticky-note-tape"></div>
                <div class="sticky-note-pin"></div>
                <div class="sticky-note-header">Lessons Learned</div>
                <div class="sticky-note-body">${p.lessonsLearned ? p.lessonsLearned.replace(/\n/g, '<br>') : '<em>No lessons learned logged yet. Click here to add tips or warnings for your future projects!</em>'}</div>
            </div>
            <div class="sticky-note future-plans-note" id="sticky-future-plans" style="cursor: pointer;">
                <div class="sticky-note-tape"></div>
                <div class="sticky-note-pin"></div>
                <div class="sticky-note-header">Next Steps / Plans</div>
                <div class="sticky-note-body">${p.futurePlans ? p.futurePlans.replace(/\n/g, '<br>') : '<em>No future plans logged yet. Click here to map out upgrades or next steps!</em>'}</div>
            </div>
        `;
        
        document.getElementById('sticky-lessons-learned').addEventListener('click', () => {
            openStickyNoteEditor(projectId, 'lessonsLearned');
        });
        document.getElementById('sticky-future-plans').addEventListener('click', () => {
            openStickyNoteEditor(projectId, 'futurePlans');
        });
    }
}


