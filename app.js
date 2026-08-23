// ==========================================================================
// NEXIS INVENTORY - CORE ENGINE
// ==========================================================================

// Global Application State
let spools = [];
let hardware = [];
let toolsAndHardware = [];
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
const modalThSection = document.getElementById('modal-th-section');
const modalThItem = document.getElementById('modal-th-item');
const modalProject = document.getElementById('modal-project');
const formSpool = document.getElementById('form-spool');
const formHardware = document.getElementById('form-hardware');
const formThSection = document.getElementById('form-th-section');
const formThItem = document.getElementById('form-th-item');
const formProject = document.getElementById('form-project');

// Modal Toggles & Controls
const btnAddSpool = document.getElementById('btn-add-spool');
const btnAddHardware = document.getElementById('btn-add-hardware');
const btnAddThSection = document.getElementById('btn-add-th-section');
const btnAddThItem = document.getElementById('btn-add-th-item');
const btnCloseSpoolModal = document.getElementById('btn-close-spool-modal');
const btnCloseHardwareModal = document.getElementById('btn-close-hardware-modal');
const btnCloseThSectionModal = document.getElementById('btn-close-th-section-modal');
const btnCloseThItemModal = document.getElementById('btn-close-th-item-modal');
const btnCancelSpool = document.getElementById('btn-cancel-spool');
const btnCancelHardware = document.getElementById('btn-cancel-hardware');
const btnCancelThSection = document.getElementById('btn-cancel-th-section');
const btnCancelThItem = document.getElementById('btn-cancel-th-item');

// TH specific elements
const thColumnsContainer = document.getElementById('th-columns-container');
const btnAddThColumn = document.getElementById('btn-add-th-column');
const thItemSectionSelect = document.getElementById('th-item-section');
const thItemFieldsContainer = document.getElementById('th-item-fields-container');
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
const generalTbody = document.getElementById('general-list-tbody');

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

const MOCK_TOOLS_AND_HARDWARE = [
    {
        id: 'th-sec-1',
        sectionName: 'Measuring Tools',
        columns: ['Name', 'Brand', 'Accuracy', 'Qty', 'Location'],
        items: [
            { id: 'th-item-1', fields: { 'Name': 'Digital Caliper 150mm', 'Brand': 'Mitutoyo', 'Accuracy': '0.01mm', 'Qty': '2', 'Location': 'Desk' } }
        ]
    },
    {
        id: 'th-sec-2',
        sectionName: 'Adhesives',
        columns: ['Type', 'Brand', 'Cure Time', 'Qty', 'Bin'],
        items: [
            { id: 'th-item-2', fields: { 'Type': 'Super Glue', 'Brand': 'Loctite', 'Cure Time': '10s', 'Qty': '5', 'Bin': 'A1' } },
            { id: 'th-item-3', fields: { 'Type': 'Kapton Tape 20mm', 'Brand': 'Generic', 'Cure Time': 'N/A', 'Qty': '2', 'Bin': 'A2' } }
        ]
    }
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
    const savedGeneral = localStorage.getItem('nexis_tools_hardware');
    const savedProjects = localStorage.getItem('nexis_projects');
    const savedTheme = localStorage.getItem('nexis_theme') || 'dark';

    spools = savedSpools ? JSON.parse(savedSpools) : [];
    hardware = savedHardware ? JSON.parse(savedHardware) : [];
    const parsedGeneral = savedGeneral ? JSON.parse(savedGeneral) : [];
    
    // Schema Migration: Check if array has the old flat structure (missing sectionName/items)
    if (parsedGeneral.length > 0 && !parsedGeneral[0].sectionName) {
        // We have legacy flat items. Group them into a "Legacy Imported" section
        const legacySection = {
            id: 'th-sec-legacy',
            sectionName: 'Legacy Items',
            columns: ['Name', 'Category 1', 'Storage', 'Qty', 'Min Qty'],
            items: parsedGeneral.map(oldItem => ({
                id: oldItem.id || `th-item-legacy-${Math.random()}`,
                fields: {
                    'Name': oldItem.name || '',
                    'Category 1': oldItem.category1 || '',
                    'Storage': oldItem.storageType || '',
                    'Qty': (oldItem.qty || 0).toString(),
                    'Min Qty': (oldItem.minQty || 1).toString()
                }
            }))
        };
        toolsAndHardware = [legacySection];
    } else {
        toolsAndHardware = parsedGeneral;
    }
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
    localStorage.setItem('nexis_tools_hardware', JSON.stringify(toolsAndHardware));
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
    renderSidebar();
    renderDashboardStats();
    renderSpools();
    renderCabinetTabs();
    renderCabinetGrid();
    renderHardware();
    renderToolsAndHardware();
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

    // 3. Hardware & General Pieces Total count
    let totalHwQty = hardware.reduce((acc, hw) => {
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);
        return acc + stockInfo.parsedQty;
    }, 0);
    let thQtySum = 0;
    let thItemsCount = 0;
    toolsAndHardware.forEach(section => {
        thItemsCount += section.items.length;
        section.items.forEach(item => {
            const qtyKey = Object.keys(item.fields).find(k => k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'));
            if (qtyKey && !isNaN(parseInt(item.fields[qtyKey], 10))) {
                thQtySum += parseInt(item.fields[qtyKey], 10);
            }
        });
    });
    
    totalHwQty += thQtySum;
    
    dashTotalHardware.innerText = totalHwQty.toLocaleString();
    dashHardwareTypes.innerText = `${hardware.length + thItemsCount} unique items`;

    // 4. Low Hardware & General Alert (qty <= minQty or Out of Stock)
    let lowHwCount = hardware.filter(hw => {
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);
        return stockInfo.statusClass === 'low' || stockInfo.statusClass === 'out';
    }).length;
    let lowThCount = 0;
    toolsAndHardware.forEach(section => {
        section.items.forEach(item => {
            const qtyKey = Object.keys(item.fields).find(k => k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'));
            const minQtyKey = Object.keys(item.fields).find(k => k.toLowerCase().includes('min') && (k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity')));
            
            if (qtyKey) {
                const qtyVal = parseInt(item.fields[qtyKey], 10);
                if (!isNaN(qtyVal)) {
                    let minVal = 1; // default minimum
                    if (minQtyKey && !isNaN(parseInt(item.fields[minQtyKey], 10))) {
                        minVal = parseInt(item.fields[minQtyKey], 10);
                    }
                    if (qtyVal <= minVal) {
                        lowThCount++;
                    }
                }
            }
        });
    });
    lowHwCount += lowThCount;
    
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
// TOOLS & HARDWARE LOGIC
// ==========================================================================

// --- Section Logic ---
function openThSectionModal(sectionId = null) {
    thColumnsContainer.innerHTML = '';
    
    if (sectionId) {
        const section = toolsAndHardware.find(s => s.id === sectionId);
        if (section) {
            document.getElementById('modal-th-section-title').innerText = 'Edit Sub-Section';
            document.getElementById('th-section-id').value = section.id;
            document.getElementById('th-section-name').value = section.sectionName;
            section.columns.forEach(col => addThColumnInput(col));
        }
    } else {
        document.getElementById('modal-th-section-title').innerText = 'Create Sub-Section';
        formThSection.reset();
        document.getElementById('th-section-id').value = '';
        addThColumnInput('Name');
        addThColumnInput('Description');
        addThColumnInput('Qty');
    }
    
    modalThSection.showModal();
}

function addThColumnInput(val = '') {
    const div = document.createElement('div');
    div.className = 'form-row th-col-row';
    div.style.marginBottom = '8px';
    div.innerHTML = `
        <div class="form-group" style="flex: 1; margin: 0;">
            <input type="text" class="modal-input col-name-input" placeholder="Column Name (e.g. Qty)" value="${val}" required>
        </div>
        <button type="button" class="btn-icon btn-delete" onclick="this.parentElement.remove()" style="margin-top: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    thColumnsContainer.appendChild(div);
}

if (btnAddThColumn) btnAddThColumn.addEventListener('click', () => addThColumnInput());

formThSection.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('th-section-id').value || 'th-sec-' + Date.now();
    const sectionName = document.getElementById('th-section-name').value.trim();
    
    const columns = [];
    document.querySelectorAll('.col-name-input').forEach(input => {
        const val = input.value.trim();
        if (val) columns.push(val);
    });
    
    if (columns.length === 0) {
        alert("Please add at least one column heading.");
        return;
    }
    
    const idx = toolsAndHardware.findIndex(s => s.id === id);
    if (idx >= 0) {
        toolsAndHardware[idx].sectionName = sectionName;
        toolsAndHardware[idx].columns = columns;
        logActivity(`Updated sub-section "${sectionName}"`);
    } else {
        toolsAndHardware.push({
            id: id,
            sectionName: sectionName,
            columns: columns,
            items: []
        });
        logActivity(`Created sub-section "${sectionName}"`, 'success');
    }
    
    modalThSection.close();
    formThSection.reset();
    renderAll();
});

function deleteThSection(id) {
    const section = toolsAndHardware.find(s => s.id === id);
    if (!section) return;
    if (confirm(`Are you sure you want to delete the "${section.sectionName}" sub-section? All items inside it will also be deleted!`)) {
        toolsAndHardware = toolsAndHardware.filter(s => s.id !== id);
        logActivity(`Deleted sub-section "${section.sectionName}"`, 'warning');
        renderAll();
    }
}

// --- Item Logic ---
function openThItemModal(sectionId = null, itemId = null) {
    if (toolsAndHardware.length === 0) {
        alert("Please create a Sub-Section first.");
        return;
    }

    thItemSectionSelect.innerHTML = '';
    toolsAndHardware.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec.id;
        opt.textContent = sec.sectionName;
        if (sec.id === sectionId) opt.selected = true;
        thItemSectionSelect.appendChild(opt);
    });

    document.getElementById('th-item-id').value = itemId || '';
    
    if (itemId && sectionId) {
        document.getElementById('modal-th-item-title').innerText = 'Edit Product';
        const section = toolsAndHardware.find(s => s.id === sectionId);
        const item = section.items.find(i => i.id === itemId);
        buildThItemFields(section.columns, item.fields);
    } else {
        document.getElementById('modal-th-item-title').innerText = 'Add Product';
        const activeSectionId = thItemSectionSelect.value;
        const section = toolsAndHardware.find(s => s.id === activeSectionId);
        buildThItemFields(section.columns, {});
    }

    modalThItem.showModal();
}

function buildThItemFields(columns, fieldValues) {
    thItemFieldsContainer.innerHTML = '';
    columns.forEach(col => {
        const val = fieldValues[col] || '';
        const div = document.createElement('div');
        div.className = 'form-group';
        div.style.marginBottom = '12px';
        
        let inputType = 'text';
        if (col.toLowerCase().includes('qty') || col.toLowerCase().includes('quantity')) {
            inputType = 'number';
        }
        
        div.innerHTML = `
            <label>${col}</label>
            <input type="${inputType}" class="modal-input th-item-field-input" data-col="${col}" value="${val}" ${inputType === 'number' ? 'min="0"' : ''}>
        `;
        thItemFieldsContainer.appendChild(div);
    });
}

if (thItemSectionSelect) {
    thItemSectionSelect.addEventListener('change', (e) => {
        const sectionId = e.target.value;
        const section = toolsAndHardware.find(s => s.id === sectionId);
        buildThItemFields(section.columns, {});
    });
}

formThItem.addEventListener('submit', (e) => {
    e.preventDefault();
    const itemId = document.getElementById('th-item-id').value || 'th-item-' + Date.now();
    const sectionId = thItemSectionSelect.value;
    
    const fields = {};
    document.querySelectorAll('.th-item-field-input').forEach(input => {
        const col = input.getAttribute('data-col');
        fields[col] = input.value.trim();
    });
    
    const section = toolsAndHardware.find(s => s.id === sectionId);
    if (!section) return;

    // Check if moving from another section
    let movedFromOtherSection = false;
    if (itemId) {
        toolsAndHardware.forEach(sec => {
            if (sec.id !== sectionId) {
                const idx = sec.items.findIndex(i => i.id === itemId);
                if (idx >= 0) {
                    sec.items.splice(idx, 1);
                    movedFromOtherSection = true;
                }
            }
        });
    }

    const idx = section.items.findIndex(i => i.id === itemId);
    if (idx >= 0) {
        section.items[idx].fields = fields;
        logActivity(`Updated product in "${section.sectionName}"`);
    } else {
        section.items.push({ id: itemId, fields: fields });
        logActivity(`Added product to "${section.sectionName}"`, 'success');
    }

    modalThItem.close();
    formThItem.reset();
    renderAll();
});

function deleteThItem(sectionId, itemId) {
    const section = toolsAndHardware.find(s => s.id === sectionId);
    if (!section) return;
    if (confirm(`Are you sure you want to delete this product?`)) {
        section.items = section.items.filter(i => i.id !== itemId);
        logActivity(`Deleted product from "${section.sectionName}"`, 'warning');
        renderAll();
    }
}

// Modal Toggle Event Listeners
if (btnAddThSection) btnAddThSection.addEventListener('click', () => openThSectionModal());
if (btnAddThItem) btnAddThItem.addEventListener('click', () => openThItemModal());
if (btnCloseThSectionModal) btnCloseThSectionModal.addEventListener('click', () => modalThSection.close());
if (btnCancelThSection) btnCancelThSection.addEventListener('click', () => modalThSection.close());
if (btnCloseThItemModal) btnCloseThItemModal.addEventListener('click', () => modalThItem.close());
if (btnCancelThItem) btnCancelThItem.addEventListener('click', () => modalThItem.close());
;

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
    
    const filterGeneral = document.getElementById('filter-general-category');
    if (filterGeneral) {
        filterGeneral.addEventListener('change', () => { renderToolsAndHardware(); });
    }
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
                
                if (data.toolsAndHardware && Array.isArray(data.toolsAndHardware)) {
                    toolsAndHardware = data.toolsAndHardware.map((section, idx) => {
                        return {
                            id: section.id || `th-sec-${Date.now()}-${idx}`,
                            sectionName: section.sectionName || 'Unnamed Section',
                            columns: Array.isArray(section.columns) ? section.columns : [],
                            items: Array.isArray(section.items) ? section.items.map(item => ({
                                id: item.id || `th-item-${Date.now()}-${Math.random()}`,
                                fields: item.fields || {}
                            })) : []
                        };
                    });
                }
                
                if (data.projects && Array.isArray(data.projects)) {
                    projects = data.projects.map((proj, idx) => {
                        let parsedBomItems = [];
                        
                        // Map items from the new flat bomItems array
                        if (data.bomItems && Array.isArray(data.bomItems)) {
                            parsedBomItems = data.bomItems.filter(b => b.projectId === proj.projectId);
                        }
                        
                        return {
                            projectId: proj.projectId || `proj-cloud-${Date.now()}-${idx}`,
                            projectName: proj.projectName || 'Unnamed Project',
                            description: proj.description || '',
                            bomItems: parsedBomItems
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
        let allBomItems = [];
        projects.forEach(proj => {
            if (proj.bomItems && Array.isArray(proj.bomItems)) {
                proj.bomItems.forEach(b => {
                    allBomItems.push({
                        projectId: proj.projectId,
                        ...b
                    });
                });
            }
        });

        const payload = {
            spools: spools.map(s => ({
                id: s.id,
                brand: s.brand,
                material: s.material,
                colorName: s.colorName,
                colorHex: s.colorHex,
                type: s.type,
                weight: s.weight,
                remaining: s.remaining,
                minRemaining: s.minRemaining !== undefined && s.minRemaining !== null && s.minRemaining !== '' ? s.minRemaining : '100',
                price: s.price,
                location: s.location,
                notes: s.notes
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
            toolsAndHardware: toolsAndHardware.map(section => ({
                id: section.id,
                sectionName: section.sectionName,
                columns: section.columns,
                items: section.items
            })),
            projects: projects.map(proj => ({
                projectId: proj.projectId,
                projectName: proj.projectName,
                description: proj.description
            })),
            bomItems: allBomItems
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
    
    const btnCloseBomModal = document.getElementById('btn-close-bom-item-modal');
    const btnCancelBom = document.getElementById('btn-cancel-bom-item');
    const bomStatus = document.getElementById('bom-status');

    if (btnAddProject) {
        btnAddProject.addEventListener('click', () => {
            document.getElementById('modal-project-title').innerText = 'Add New Project';
            document.getElementById('form-project').reset();
            document.getElementById('project-id').value = '';
            document.getElementById('modal-project').showModal();
        });
    }

    if (btnCloseProjectModal) btnCloseProjectModal.addEventListener('click', () => document.getElementById('modal-project').close());
    if (btnCancelProject) btnCancelProject.addEventListener('click', () => document.getElementById('modal-project').close());

    if (btnCloseBomModal) btnCloseBomModal.addEventListener('click', () => document.getElementById('modal-bom-item').close());
    if (btnCancelBom) btnCancelBom.addEventListener('click', () => document.getElementById('modal-bom-item').close());

    // Show/hide purchase fields based on BOM status
    if (bomStatus) {
        bomStatus.addEventListener('change', (e) => {
            const fields = document.getElementById('bom-purchase-fields');
            if (e.target.value === 'Need to purchase') {
                fields.style.display = 'flex';
            } else {
                fields.style.display = 'none';
            }
        });
    }

    // Photo upload logic for BOM items
    const btnUploadBomImg = document.getElementById('btn-upload-bom-image');
    const inputBomImg = document.getElementById('bom-image-file');
    const labelBomImg = document.getElementById('bom-image-upload-status');
    const txtBomImg = document.getElementById('bom-photoUrl');

    if (btnUploadBomImg && inputBomImg) {
        btnUploadBomImg.addEventListener('click', () => inputBomImg.click());
        inputBomImg.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400; // Small size for Google Sheets 50k char limit
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        // Convert to heavily compressed JPEG to avoid 50k char cell limit
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
                        
                        if (dataUrl.length > 45000) {
                            labelBomImg.innerText = 'Error: Image still too large!';
                            labelBomImg.style.color = '#ef4444'; // Red
                            txtBomImg.value = '';
                        } else {
                            txtBomImg.value = dataUrl;
                            labelBomImg.innerText = 'Attached (Compressed): ' + file.name;
                            labelBomImg.style.color = 'var(--success)';
                        }
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form Submits
    const formProject = document.getElementById('form-project');
    if (formProject) {
        formProject.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProjectForm();
        });
    }

    const formBomItem = document.getElementById('form-bom-item');
    if (formBomItem) {
        formBomItem.addEventListener('submit', (e) => {
            e.preventDefault();
            saveBomItemForm();
        });
    }
}

function saveProjectForm() {
    const idField = document.getElementById('project-id').value;
    const name = document.getElementById('proj-name').value.trim();
    const desc = document.getElementById('proj-description') ? document.getElementById('proj-description').value.trim() : '';
    const status = document.getElementById('proj-status') ? document.getElementById('proj-status').value : 'Planning';
    const startDate = document.getElementById('proj-startDate') ? document.getElementById('proj-startDate').value : '';

    if (!name) return;

    if (idField) {
        const p = projects.find(proj => proj.projectId === idField);
        if (p) {
            p.projectName = name;
            p.description = desc;
            p.status = status;
            p.startDate = startDate;
        }
    } else {
        projects.push({
            projectId: 'proj-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            projectName: name,
            description: desc,
            status: status,
            startDate: startDate,
            bomItems: []
        });
    }
    
    logActivity(`Saved project: ${name}`, 'success');
    document.getElementById('modal-project').close();
    renderAll();
}

function deleteProject(id) {
    if (confirm('CAUTION: Are you sure you want to delete this project and its entire BOM?')) {
        projects = projects.filter(p => p.projectId !== id);
        logActivity('Deleted project', 'warning');
        renderAll();
    }
}

function openAddBomModal(projectId) {
    document.getElementById('modal-bom-item-title').innerText = 'Add BOM Item';
    document.getElementById('form-bom-item').reset();
    document.getElementById('bom-item-id').value = '';
    document.getElementById('bom-project-id').value = projectId;
    
    document.getElementById('bom-purchase-fields').style.display = 'none';
    document.getElementById('bom-image-upload-status').innerText = 'No file attached';
    document.getElementById('bom-image-upload-status').style.color = 'var(--text-muted)';
    
    document.getElementById('modal-bom-item').showModal();
}

function openEditBomModal(projectId, bomId) {
    const p = projects.find(proj => proj.projectId === projectId);
    if (!p) return;
    const item = p.bomItems.find(b => b.id === bomId);
    if (!item) return;

    document.getElementById('modal-bom-item-title').innerText = 'Edit BOM Item';
    document.getElementById('bom-item-id').value = item.id;
    document.getElementById('bom-project-id').value = projectId;
    
    document.getElementById('bom-name').value = item.name || '';
    document.getElementById('bom-status').value = item.status || 'Have it already';
    document.getElementById('bom-qty').value = item.qty || 1;
    document.getElementById('bom-cost').value = item.costPerUnit || '';
    document.getElementById('bom-specification').value = item.specification || '';
    document.getElementById('bom-link').value = item.link || '';
    document.getElementById('bom-photoUrl').value = item.photoUrl || '';
    document.getElementById('bom-description').value = item.description || '';

    const fields = document.getElementById('bom-purchase-fields');
    fields.style.display = (item.status === 'Need to purchase') ? 'flex' : 'none';

    document.getElementById('bom-image-upload-status').innerText = item.photoUrl ? 'URL/Data provided' : 'No file attached';

    document.getElementById('modal-bom-item').showModal();
}

function saveBomItemForm() {
    const projId = document.getElementById('bom-project-id').value;
    const itemId = document.getElementById('bom-item-id').value;
    
    const p = projects.find(proj => proj.projectId === projId);
    if (!p) return;

    if (!p.bomItems) p.bomItems = [];

    const name = document.getElementById('bom-name').value.trim();
    const status = document.getElementById('bom-status').value;
    const qty = parseInt(document.getElementById('bom-qty').value) || 1;
    const cost = parseFloat(document.getElementById('bom-cost').value) || 0.00;
    const spec = document.getElementById('bom-specification').value.trim();
    const link = document.getElementById('bom-link').value.trim();
    const photo = document.getElementById('bom-photoUrl').value.trim();
    const desc = document.getElementById('bom-description').value.trim();

    if (!name) return;

    if (itemId) {
        const item = p.bomItems.find(b => b.id === itemId);
        if (item) {
            item.name = name;
            item.status = status;
            item.qty = qty;
            item.costPerUnit = cost;
            item.specification = spec;
            item.link = link;
            item.photoUrl = photo;
            item.description = desc;
        }
    } else {
        p.bomItems.push({
            id: 'bom-' + Date.now() + '-' + Math.floor(Math.random()*1000),
            name: name,
            status: status,
            qty: qty,
            costPerUnit: cost,
            specification: spec,
            link: link,
            photoUrl: photo,
            description: desc
        });
    }

    logActivity(`Saved BOM item: ${name}`, 'success');
    document.getElementById('modal-bom-item').close();
    renderAll();
}

function deleteBomItem(projectId, bomId) {
    if (confirm('Remove this item from the BOM?')) {
        const p = projects.find(proj => proj.projectId === projectId);
        if (p) {
            p.bomItems = p.bomItems.filter(b => b.id !== bomId);
            renderAll();
        }
    }
}

// Workbench Details View Event Listeners & Sticky Note modal notepad handlers
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

function openEditProjectModal(id) {
    const p = projects.find(proj => proj.projectId === id);
    if (!p) return;

    document.getElementById('modal-project-title').innerText = 'Edit Project Details';
    document.getElementById('project-id').value = p.projectId;
    
    const nameEl = document.getElementById('proj-name');
    const descEl = document.getElementById('proj-description');
    const statusEl = document.getElementById('proj-status');
    const startDateEl = document.getElementById('proj-startDate');

    if(nameEl) nameEl.value = p.projectName || '';
    if(descEl) descEl.value = p.description || '';
    if(statusEl) statusEl.value = p.status || 'Planning';
    if(startDateEl) startDateEl.value = p.startDate || '';

    const modal = document.getElementById('modal-project');
    if(modal) modal.showModal();
}

// TOOLS & HARDWARE RENDERING
function renderToolsAndHardware() {
    const container = document.getElementById('th-sections-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (toolsAndHardware.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted); background: var(--surface-1); border-radius: 8px;">No Sub-Sections created yet. Click "New Sub-Section" to get started.</div>`;
        return;
    }
    
    toolsAndHardware.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.id = `th-section-${section.id}`;
        sectionDiv.className = 'table-card glass-panel th-section-card';
        sectionDiv.style.marginBottom = '32px';
        sectionDiv.style.scrollMarginTop = '100px'; // For smooth scrolling offset
        
        
        let thHtml = '';
        section.columns.forEach(col => {
            thHtml += `<th>${col}</th>`;
        });
        thHtml += `<th class="text-right" style="width: 120px;">Actions</th>`;
        
        let tbodyHtml = '';
        if (section.items.length === 0) {
            tbodyHtml = `<tr><td colspan="${section.columns.length + 1}" class="empty-state">No products in this section</td></tr>`;
        } else {
            section.items.forEach(item => {
                let tdHtml = '';
                section.columns.forEach(col => {
                    // Quick check to bold Qty columns
                    const isQty = col.toLowerCase().includes('qty') || col.toLowerCase().includes('quantity');
                    tdHtml += `<td ${isQty ? 'style="font-weight:600; color: var(--primary-light);"' : ''}>${item.fields[col] || '-'}</td>`;
                });
                
                tbodyHtml += `
                    <tr>
                        ${tdHtml}
                        <td class="text-right">
                            <div class="action-buttons">
                                <button class="btn-icon btn-edit" onclick="openThItemModal('${section.id}', '${item.id}')" title="Edit Product">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button class="btn-icon btn-delete" onclick="deleteThItem('${section.id}', '${item.id}')" title="Delete Product">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
        
        sectionDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 20px 24px 0;">
                <h3 style="margin: 0; font-family: var(--font-heading); color: var(--text-primary); font-size: 1.3rem; font-weight: 600;">${section.sectionName}</h3>
                <div>
                    <button class="primary-btn btn-sm" onclick="openThSectionModal('${section.id}')" style="margin-right: 8px; background: transparent; border: 1px solid var(--border-color); color: var(--text-primary);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Section
                    </button>
                    <button class="primary-btn btn-sm" onclick="deleteThSection('${section.id}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: middle;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete
                    </button>
                </div>
            </div>
            <div class="table-responsive" style="padding: 0 24px 24px;">
                <table class="premium-table">
                    <thead>
                        <tr>${thHtml}</tr>
                    </thead>
                    <tbody>
                        ${tbodyHtml}
                    </tbody>
                </table>
            </div>
        `;
        
        container.appendChild(sectionDiv);
    });
}

// CORE PROJECT RENDERING BOARD
function renderProjects() {
    const container = document.getElementById('projects-list-container');
    const filterStatusSelect = document.getElementById('filter-project-status');
    if (!container) return;

    const statusFilter = filterStatusSelect ? filterStatusSelect.value : 'all';

    // 1. Calculate General Dashboard Overview Stats across all projects
    const totalProjectsCount = projects.length;
    const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
    
    // We will recalculate total spend based on BOM "Need to purchase" items
    const totalSpendVal = projects.reduce((sum, p) => {
        const projSpend = (p.bomItems || []).reduce((s, b) => {
            if (b.status === 'Need to purchase') {
                return s + (parseFloat(b.costPerUnit) || 0) * (parseInt(b.qty) || 1);
            }
            return s;
        }, 0);
        return sum + projSpend;
    }, 0);

    // Apply to Stats cards
    const projStatTotalNode = document.getElementById('proj-stat-total');
    const projStatSpendNode = document.getElementById('proj-stat-spend');
    const projStatActiveNode = document.getElementById('proj-stat-active');
    
    if (projStatTotalNode) projStatTotalNode.innerText = totalProjectsCount;
    if (projStatSpendNode) projStatSpendNode.innerText = `AED ${totalSpendVal.toFixed(2)}`;
    if (projStatActiveNode) projStatActiveNode.innerText = activeProjectsCount;

    // 2. Filter Projects
    const filtered = projects.filter(p => {
        const matchesSearch = searchQuery === '' || 
            p.projectName.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery) ||
            (p.bomItems || []).some(b => b.name && b.name.toLowerCase().includes(searchQuery));

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
        let statusColor = 'var(--primary)';
        let statusGlow = 'rgba(99, 102, 241, 0.04)';
        let statusShadowGlow = 'rgba(99, 102, 241, 0.12)';

        if (p.status === 'Planning') {
            statusColor = 'var(--purple)';
            statusGlow = 'rgba(168, 85, 247, 0.04)';
            statusShadowGlow = 'rgba(168, 85, 247, 0.12)';
        } else if (p.status === 'In Progress') {
            statusColor = 'var(--secondary)';
            statusGlow = 'rgba(6, 182, 212, 0.04)';
            statusShadowGlow = 'rgba(6, 182, 212, 0.12)';
        } else if (p.status === 'Completed') {
            statusColor = 'var(--success)';
            statusGlow = 'rgba(16, 185, 129, 0.04)';
            statusShadowGlow = 'rgba(16, 185, 129, 0.12)';
        } else if (p.status === 'Cancelled') {
            statusColor = 'var(--danger)';
            statusGlow = 'rgba(239, 68, 68, 0.04)';
            statusShadowGlow = 'rgba(239, 68, 68, 0.12)';
        }

        const bomItems = p.bomItems || [];
        const needToBuy = bomItems.filter(b => b.status === 'Need to purchase');
        const haveIt = bomItems.filter(b => b.status === 'Have it already');

        let totalNeedToBuyCost = 0;

        const renderBomRow = (b) => {
            let rowCostHTML = '';
            if (b.status === 'Need to purchase') {
                const qty = parseInt(b.qty) || 1;
                const cost = parseFloat(b.costPerUnit) || 0;
                const rowTotal = qty * cost;
                totalNeedToBuyCost += rowTotal;
                rowCostHTML = `
                    <td class="text-right">AED ${cost.toFixed(2)}</td>
                    <td class="text-right" style="color:var(--secondary); font-weight:bold;">AED ${rowTotal.toFixed(2)}</td>
                `;
            }

            const imgHtml = b.photoUrl ? `<img src="${b.photoUrl}" class="bom-item-img" style="width:48px; height:48px; object-fit:cover; border-radius:4px;" alt="photo">` : `<div style="width:48px; height:48px; background:var(--bg-surface); border-radius:4px; display:flex; align-items:center; justify-content:center;"><svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text-muted)" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>`;
            const linkHtml = b.link ? `<a href="${b.link}" target="_blank" style="color:var(--primary);"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` : '';

            return `
                <tr>
                    <td style="width:40px;">${imgHtml}</td>
                    <td>
                        <div style="font-weight:600; color:var(--text-primary);">${b.name}</div>
                        <div style="font-size:11px; color:var(--text-muted);">${b.specification || ''}</div>
                    </td>
                    <td style="text-align:center;">${b.qty}</td>
                    ${rowCostHTML}
                    <td style="text-align:center;">${linkHtml}</td>
                    <td style="text-align:right;">
                        <button class="icon-only-btn toggle-bom-status" data-project="${p.projectId}" data-bom="${b.id}" style="color:var(--primary); margin-right:4px;" title="Move to ${b.status === 'Need to purchase' ? 'Have it already' : 'Need to purchase'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path></svg>
                        </button>
                        <button class="icon-only-btn edit-bom-item" data-project="${p.projectId}" data-bom="${b.id}" style="color:var(--text-secondary); margin-right:4px;" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-only-btn delete-bom-item delete-icon" data-project="${p.projectId}" data-bom="${b.id}" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        };

        const needToBuyRows = needToBuy.map(renderBomRow).join('');
        const haveItRows = haveIt.map(renderBomRow).join('');

        const card = document.createElement('div');
        card.className = 'project-card glass-panel';
        card.setAttribute('style', `--status-color: ${statusColor}; --status-glow: ${statusGlow}; --status-shadow-glow: ${statusShadowGlow}; padding: 24px;`);
        
        card.innerHTML = `
            <div class="project-card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
                <div class="project-card-title-row" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h3 style="margin:0 0 8px 0; font-size:18px; color:var(--text-primary);">${p.projectName}</h3>
                        <div class="project-progress-meta" style="margin-bottom:8px;">
                            <span class="status-pill" style="background:${statusColor}20; color:${statusColor}; border:1px solid ${statusColor}40;">${p.status}</span>
                        </div>
                        <div class="project-description" style="color:var(--text-secondary); font-size:13.5px;">${p.description}</div>
                    </div>
                    <div class="project-card-actions" style="display:flex; gap:8px;">
                        <button class="icon-only-btn edit-project" data-id="${p.projectId}" style="background:var(--bg-surface-elevated); padding:8px; border-radius:6px; border:1px solid var(--border-color);" title="Edit Project">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-only-btn delete-project delete-icon" data-id="${p.projectId}" style="background:var(--bg-surface-elevated); padding:8px; border-radius:6px; border:1px solid var(--border-color);" title="Delete Project">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px; height:16px; color:var(--danger);"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="bom-section">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                    <h4 style="margin:0; font-size:16px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        Bill of Materials (BOM)
                    </h4>
                    <button class="btn btn-primary add-bom-item" data-project="${p.projectId}" style="padding:6px 12px; font-size:12.5px;">+ Add Item</button>
                </div>
                
                ${needToBuy.length > 0 ? `
                <div class="bom-table-container" style="margin-bottom:24px;">
                    <h5 style="margin:0 0 12px 0; font-size:13.5px; color:var(--warning); display:flex; align-items:center; gap:6px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Need to Purchase
                    </h5>
                    <table class="bom-table w-full">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Item</th>
                                <th style="text-align:center;">Qty</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Total</th>
                                <th style="text-align:center;">Link</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${needToBuyRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align:right; font-weight:600; font-size:13px; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:12px;">Estimated Spend:</td>
                                <td colspan="3" style="text-align:left; font-weight:800; font-size:15px; color:var(--secondary); border-top:1px solid var(--border-color); padding-top:12px; padding-left:12px;">AED ${totalNeedToBuyCost.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                ` : `<div style="margin-bottom:24px; padding:16px; border:1px dashed var(--border-color); border-radius:8px; text-align:center; color:var(--text-muted); font-size:13px;">No items in the 'Need to Purchase' list.</div>`}

                ${haveIt.length > 0 ? `
                <div class="bom-table-container">
                    <h5 style="margin:0 0 12px 0; font-size:13.5px; color:var(--success); display:flex; align-items:center; gap:6px;">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Have it already
                    </h5>
                    <table class="bom-table w-full">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Item</th>
                                <th style="text-align:center;">Qty</th>
                                <th style="text-align:center;">Link</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${haveItRows}
                        </tbody>
                    </table>
                </div>
                ` : ``}
            </div>
        `;

        container.appendChild(card);
    });

    // WIRING INTERACTION EVENT LISTENERS ON RENDERED CARDS

    document.querySelectorAll('.add-bom-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            openAddBomModal(projId);
        });
    });

    document.querySelectorAll('.toggle-bom-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const bomId = btn.getAttribute('data-bom');
            const p = projects.find(proj => proj.projectId === projId);
            if (p) {
                const item = p.bomItems.find(b => b.id === bomId);
                if (item) {
                    item.status = item.status === 'Need to purchase' ? 'Have it already' : 'Need to purchase';
                    logActivity(`BOM Item "${item.name}" status updated to ${item.status}`, 'info');
                    renderAll();
                }
            }
        });
    });

    document.querySelectorAll('.edit-bom-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const bomId = btn.getAttribute('data-bom');
            openEditBomModal(projId, bomId);
        });
    });

    document.querySelectorAll('.delete-bom-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projId = btn.getAttribute('data-project');
            const bomId = btn.getAttribute('data-bom');
            deleteBomItem(projId, bomId);
        });
    });

    document.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            openEditProjectModal(id);
        });
    });

    document.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            deleteProject(id);
        });
    });
}
function renderSidebar() {
    const hwSubMenu = document.getElementById('sidebar-hardware-sub');
    const thSubMenu = document.getElementById('sidebar-th-sub');
    if (!hwSubMenu || !thSubMenu) return;

    // Hardware Sub-menu
    hwSubMenu.innerHTML = '';
    const uniqueBoxes = [...new Set(hardware.map(h => (h.boxNo || '').charAt(0).toUpperCase()).filter(c => c >= 'A' && c <= 'Z'))].sort();
    
    uniqueBoxes.forEach(sec => {
        const btn = document.createElement('button');
        btn.className = `sub-nav-btn ${activeTab === 'hardware' && activeCabinetSection === sec ? 'active' : ''}`;
        btn.innerHTML = `<span class="sub-nav-dot"></span><span>Section ${sec}</span>`;
        btn.onclick = (e) => {
            e.stopPropagation();
            switchTab('hardware');
            activeCabinetSection = sec;
            activeCabinetFilter = null;
            renderCabinetTabs();
            renderCabinetGrid();
            renderHardware();
            renderSidebar();
        };
        hwSubMenu.appendChild(btn);
    });

    // Tools & Hardwares Sub-menu
    thSubMenu.innerHTML = '';
    toolsAndHardware.forEach(sec => {
        const btn = document.createElement('button');
        btn.className = 'sub-nav-btn';
        btn.innerHTML = `<span class="sub-nav-dot"></span><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sec.sectionName}</span>`;
        btn.onclick = (e) => {
            e.stopPropagation();
            switchTab('general');
            setTimeout(() => {
                const el = document.getElementById(`th-section-${sec.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); // slight delay to allow tab display to update
        };
        thSubMenu.appendChild(btn);
    });
}



