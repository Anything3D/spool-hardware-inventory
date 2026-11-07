// ==========================================================================
// NEXIS INDUSTRIAL OS — CORE INVENTORY & CLOUD SYNC ENGINE
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

// Modular Cabinet Map Configuration
const CABINET_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
let activeCabinetSection = 'A';
let activeCabinetFilter = null;

// DOM Elements
const views = document.querySelectorAll('.app-view');
const navButtons = document.querySelectorAll('.nav-btn');
const globalSearch = document.getElementById('global-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const btnQuickAdd = document.getElementById('btn-quick-add');
const quickAddLabel = document.getElementById('quick-add-label');
const headerSyncPill = document.getElementById('header-sync-pill');
const headerSyncDot = document.getElementById('header-sync-dot');
const headerSyncLabel = document.getElementById('header-sync-label');

// Cloud Sync DOM Elements
const cloudApiUrlInput = document.getElementById('cloud-api-url');
const cloudAutoSyncToggle = document.getElementById('cloud-auto-sync-toggle');
const btnCloudPull = document.getElementById('btn-cloud-pull');
const btnCloudPush = document.getElementById('btn-cloud-push');
const btnDashSyncNow = document.getElementById('btn-dash-sync-now');
const cloudStatusText = document.getElementById('cloud-sync-status-text');
const cloudStatusIcon = document.getElementById('cloud-sync-status-icon');

// Modals & Forms
const modalSpool = document.getElementById('modal-spool');
const modalHardware = document.getElementById('modal-hardware');
const modalThSection = document.getElementById('modal-th-section');
const modalThItem = document.getElementById('modal-th-item');
const modalProject = document.getElementById('modal-project');
const modalBomItem = document.getElementById('modal-bom-item');

const formSpool = document.getElementById('form-spool');
const formHardware = document.getElementById('form-hardware');
const formThSection = document.getElementById('form-th-section');
const formThItem = document.getElementById('form-th-item');
const formProject = document.getElementById('form-project');
const formBomItem = document.getElementById('form-bom-item');

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
const filterThSection = document.getElementById('filter-th-section');

const spoolColorPicker = document.getElementById('spool-color-picker');
const spoolHexInput = document.getElementById('spool-hex');

// Filters & Sorting
const filterSpoolMaterial = document.getElementById('filter-spool-material');
const filterSpoolStatus = document.getElementById('filter-spool-status');
const sortSpoolsSelect = document.getElementById('sort-spools');
const filterHardwareType = document.getElementById('filter-hardware-type');
const filterHardwareSize = document.getElementById('filter-hardware-size');
const filterHardwareStock = document.getElementById('filter-hardware-stock');
const filterProjectStatus = document.getElementById('filter-project-status');

// CSV Elements
const csvImportText = document.getElementById('csv-import-text');
const csvFileDropzone = document.getElementById('csv-file-dropzone');
const csvFileInput = document.getElementById('csv-file-input');
const btnRunImport = document.getElementById('btn-run-import');
const btnExportSpools = document.getElementById('btn-export-spools');
const btnExportHardware = document.getElementById('btn-export-hardware');
const btnLoadMockData = document.getElementById('btn-load-mock-data');

// Containers
const spoolsContainer = document.getElementById('spools-list-container');
const hardwareTbody = document.getElementById('hardware-list-tbody');

// Dashboard Stats Targets
const dashTotalWeight = document.getElementById('dash-total-weight');
const dashSpoolsCount = document.getElementById('dash-spools-count');
const dashLowSpools = document.getElementById('dash-low-spools');
const dashTotalHardware = document.getElementById('dash-total-hardware');
const dashHardwareTypes = document.getElementById('dash-hardware-types');
const dashLowHardware = document.getElementById('dash-low-hardware');
const dashBomSpend = document.getElementById('dash-bom-spend');
const dashProjectsCount = document.getElementById('dash-projects-count');
const dashReorderList = document.getElementById('dash-reorder-list');
const dashReorderBadge = document.getElementById('dash-reorder-badge');
const materialBarChart = document.getElementById('material-bar-chart');

// Standard Industrial Demo Data
const MOCK_SPOOLS = [
    { id: 'sp-1', brand: 'Prusament', material: 'PLA', color: 'Galaxy Black', hex: '#1e293b', qty: 3, reorder: 1, location: 'Drybox A', notes: 'Metallic sparkle finish, print temp: 215°C' },
    { id: 'sp-2', brand: 'Polymaker', material: 'PETG', color: 'Polymaker Teal', hex: '#06b6d4', qty: 2, reorder: 1, location: 'Shelf 1', notes: 'Bed 80°C, nozzle 240°C' },
    { id: 'sp-3', brand: 'eSUN', material: 'PLA+', color: 'Fire Engine Red', hex: '#dc2626', qty: 0, reorder: 1, location: 'Drybox B', notes: 'Out of stock! Flow ratio 0.98' },
    { id: 'sp-4', brand: 'Bambu Lab', material: 'PLA Matte', color: 'Grass Green', hex: '#4ade80', qty: 1, reorder: 1, location: 'AMS Slot 2', notes: 'High-speed matte profile' },
    { id: 'sp-5', brand: 'eSUN', material: 'ABS', color: 'Cool Gray', hex: '#64748b', qty: 4, reorder: 2, location: 'Enclosure Drawer', notes: 'Enclosure required, 100°C bed' }
];

const MOCK_HARDWARE = [
    { id: 'hw-1', boxNo: 'A1', category: 'Magnet', specification: 'Neodymium Round', sizeLD: '6', sizeW: '', sizeT: '3', qty: '45', minQty: 10, remarks: 'N52 cylindrical magnets' },
    { id: 'hw-2', boxNo: 'A2', category: 'Threaded Insert', specification: 'M3', sizeLD: '4.2', sizeW: '', sizeT: '4', qty: '4', minQty: 10, remarks: 'Brass knurled heat-set (Voron standard)' },
    { id: 'hw-3', boxNo: 'A3', category: 'Threaded Insert', specification: 'M3 Short', sizeLD: '3.9', sizeW: '', sizeT: '3', qty: '100+', minQty: 10, remarks: 'Brass knurled short' },
    { id: 'hw-4', boxNo: 'A4', category: 'SHCS', specification: 'M3', sizeLD: '8', sizeW: '', sizeT: '', qty: '120', minQty: 25, remarks: 'Black oxide socket head cap' },
    { id: 'hw-5', boxNo: 'A5', category: 'BHCS', specification: 'M3', sizeLD: '6', sizeW: '', sizeT: '', qty: '85', minQty: 20, remarks: 'Button head cap screw' },
    { id: 'hw-6', boxNo: 'A6', category: 'Limit Switch', specification: 'Omron D2F', sizeLD: '13', sizeW: '5.8', sizeT: '6.5', qty: '6', minQty: 10, remarks: 'Microswitch for X/Y endstops' },
    { id: 'hw-7', boxNo: 'A7', category: 'Bearing', specification: '608ZZ', sizeLD: '22', sizeW: '8', sizeT: '7', qty: '16', minQty: 4, remarks: 'Shielded radial ball bearings' }
];

const MOCK_TOOLS_AND_HARDWARE = [
    {
        id: 'th-sec-1',
        sectionName: 'Electronics',
        columns: ['Name', 'Specification', 'Qty', 'Min Qty', 'Location'],
        items: [
            { id: 'th-item-1', fields: { 'Name': 'ESP32-S3 DevKitC', 'Specification': 'Dual-Core Wi-Fi/BLE MCU', 'Qty': '6', 'Min Qty': '2', 'Location': 'ESD Bin 1' } },
            { id: 'th-item-2', fields: { 'Name': 'TMC2209 Stepper Driver', 'Specification': 'UART silent driver', 'Qty': '1', 'Min Qty': '4', 'Location': 'ESD Bin 2' } }
        ]
    },
    {
        id: 'th-sec-2',
        sectionName: 'Hardwares & Tools',
        columns: ['Name', 'Brand', 'Qty', 'Min Qty', 'Location'],
        items: [
            { id: 'th-item-3', fields: { 'Name': 'Digital Caliper 150mm', 'Brand': 'Mitutoyo', 'Qty': '2', 'Min Qty': '1', 'Location': 'Tool Pegboard' } },
            { id: 'th-item-4', fields: { 'Name': 'Threadlocker Blue 242', 'Brand': 'Loctite', 'Qty': '3', 'Min Qty': '1', 'Location': 'Chemical Shelf' } }
        ]
    }
];

const MOCK_PROJECTS = [
    {
        projectId: 'proj-1',
        projectName: 'Voron 2.4 R2 (350mm) CoreXY Build',
        description: 'High-speed enclosed industrial CoreXY 3D printer with CANbus toolhead and CNC tap.',
        status: 'In Progress',
        bomItems: [
            { id: 'bom-1', name: 'BIGTREETECH Octopus V1.1', status: 'Have it already', qty: 1, costPerUnit: 195, specification: 'STM32F446 8-Axis Control Board', link: '', photoUrl: '', description: '' },
            { id: 'bom-2', name: 'LDO Linear Rail Kit MGN12H/MGN9H', status: 'Need to purchase', qty: 1, costPerUnit: 680, specification: '350mm Stainless Steel Hiwin/LDO', link: 'https://aliexpress.com', photoUrl: '', description: '' },
            { id: 'bom-3', name: 'EBB SB2209 CAN Toolhead Board', status: 'Need to purchase', qty: 1, costPerUnit: 145, specification: 'RP2040 CANbus StealthBurner', link: 'https://aliexpress.com', photoUrl: '', description: '' }
        ]
    }
];

// ==========================================================================
// UTILITY & TOAST HELPERS
// ==========================================================================

function escapeHtml(str) {
    return String(str === undefined || str === null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
        <span class="toast-dot"></span>
        <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 260);
    }, 3200);
}

// Automatically heal shifted or legacy spool records
function normalizeSpoolRecord(sp, idx = 0) {
    if (!sp || typeof sp !== 'object') {
        return {
            id: `sp-${Date.now()}-${idx}`,
            brand: 'Generic',
            material: 'PLA',
            color: 'Black',
            hex: '#6366f1',
            qty: 1,
            reorder: 1,
            location: '',
            notes: ''
        };
    }

    // Detect shifted columns where id=Brand, brand=Material, material=Color, color=#Hex, hex=Qty
    const colorLooksLikeHex = typeof sp.color === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(sp.color.trim());
    const idLooksLikeBrand = sp.id && !String(sp.id).startsWith('sp-') && isNaN(Number(sp.id));

    if (colorLooksLikeHex && idLooksLikeBrand) {
        return {
            id: `sp-healed-${Date.now()}-${idx}`,
            brand: String(sp.id || 'Generic').trim(),
            material: String(sp.brand || 'PLA').trim(),
            color: String(sp.material || 'Standard').trim(),
            hex: sp.color.trim(),
            qty: Number.isFinite(Number(sp.hex)) ? Number(sp.hex) : 1,
            reorder: Number.isFinite(Number(sp.qty)) ? Number(sp.qty) : 1,
            location: sp.reorder && isNaN(Number(sp.reorder)) ? String(sp.reorder) : (sp.location || ''),
            notes: sp.notes || ''
        };
    }

    const rawColor = sp.color || sp.colorName || 'Standard';
    const rawHex = sp.hex || sp.colorHex || sp.hexCode || '#6366f1';
    const validHex = /^#[0-9A-Fa-f]{3,6}$/.test(String(rawHex).trim()) ? String(rawHex).trim() : '#6366f1';

    let rawQty = sp.qty;
    if (rawQty === undefined || rawQty === null || rawQty === '') {
        rawQty = sp.remaining !== undefined ? sp.remaining : (sp.quantity !== undefined ? sp.quantity : 0);
    }

    let rawReorder = sp.reorder;
    if (rawReorder === undefined || rawReorder === null || rawReorder === '') {
        rawReorder = sp.minRemaining !== undefined ? sp.minRemaining : (sp.reorderLimit !== undefined ? sp.reorderLimit : 1);
    }

    return {
        id: (sp.id && String(sp.id).trim()) ? String(sp.id).trim() : `sp-${Date.now()}-${idx}`,
        brand: String(sp.brand || 'Generic').trim(),
        material: String(sp.material || 'PLA').trim(),
        color: String(rawColor).trim(),
        hex: validHex,
        qty: Number.isFinite(Number(rawQty)) ? Math.max(0, Number(rawQty)) : 0,
        reorder: Number.isFinite(Number(rawReorder)) ? Math.max(0, Number(rawReorder)) : 1,
        location: String(sp.location || '').trim(),
        notes: String(sp.notes || '').trim()
    };
}

// ==========================================================================
// INITIALIZATION & LIFECYCLE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    suppressAutoSync = true;
    loadDatabase();

    // Sidebar Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-tab');
            switchTab(targetView);
        });
    });

    // Dashboard KPI cards quick navigation
    document.querySelectorAll('.stat-card[data-goto]').forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-goto');
            if (target) switchTab(target);
        });
    });

    if (headerSyncPill) {
        headerSyncPill.addEventListener('click', () => switchTab('sync'));
    }

    // Wire up Modals, Filters, Sync, Auth, Projects
    setupModals();
    setupFiltersAndSearch();
    setupSyncEngine();
    setupLoginHandlers();
    setupProjectHandlers();

    const hasActiveSession = checkUserSession();

    // Color picker sync
    if (spoolColorPicker && spoolHexInput) {
        spoolColorPicker.addEventListener('input', (e) => {
            spoolHexInput.value = e.target.value;
        });
        spoolHexInput.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value.trim())) {
                spoolColorPicker.value = e.target.value.trim();
            }
        });
    }

    // Global "/" shortcut to focus search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
            e.preventDefault();
            if (globalSearch) globalSearch.focus();
        }
    });

    renderAll();
    suppressAutoSync = false;

    // Startup Cloud Pull
    if (hasActiveSession) {
        const startupUrl = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
        if (startupUrl) {
            logActivity('Connecting to Google Sheets database...', 'info');
            setTimeout(() => { fetchFromCloud(true); }, 350);
        }
    }
});

// Switch Tab Router
function switchTab(tabId) {
    activeTab = tabId;

    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    views.forEach(view => {
        view.classList.toggle('active', view.getAttribute('id') === `view-${tabId}`);
    });

    // Update contextual Quick Add button label
    if (quickAddLabel) {
        if (tabId === 'hardware') quickAddLabel.textContent = 'Add Hardware';
        else if (tabId === 'general') quickAddLabel.textContent = 'Add Product';
        else if (tabId === 'projects') quickAddLabel.textContent = 'New Project';
        else quickAddLabel.textContent = 'Add Spool';
    }

    if (tabId === 'dashboard') {
        updateDashboardCharts();
    }
    renderSidebar();
}

// ==========================================================================
// LOCAL STORAGE & SCHEMA MIGRATION
// ==========================================================================

function loadDatabase() {
    const savedSpools = localStorage.getItem('nexis_spools');
    const savedHardware = localStorage.getItem('nexis_hardware');
    const savedGeneral = localStorage.getItem('nexis_tools_hardware');
    const savedProjects = localStorage.getItem('nexis_projects');
    const savedTheme = localStorage.getItem('nexis_theme') || 'dark';

    try {
        spools = savedSpools ? JSON.parse(savedSpools) : [];
    } catch (e) { spools = []; }

    try {
        hardware = savedHardware ? JSON.parse(savedHardware) : [];
    } catch (e) { hardware = []; }

    let parsedGeneral = [];
    try {
        parsedGeneral = savedGeneral ? JSON.parse(savedGeneral) : [];
    } catch (e) { parsedGeneral = []; }

    if (parsedGeneral.length > 0 && !parsedGeneral[0].sectionName) {
        toolsAndHardware = [{
            id: 'th-sec-legacy',
            sectionName: 'Legacy Items',
            columns: ['Name', 'Category 1', 'Storage', 'Qty', 'Min Qty'],
            items: parsedGeneral.map((oldItem, i) => ({
                id: oldItem.id || `th-item-legacy-${i}`,
                fields: {
                    'Name': oldItem.name || '',
                    'Category 1': oldItem.category1 || '',
                    'Storage': oldItem.storageType || '',
                    'Qty': String(oldItem.qty || 0),
                    'Min Qty': String(oldItem.minQty || 1)
                }
            }))
        }];
    } else {
        toolsAndHardware = parsedGeneral;
    }

    try {
        projects = savedProjects ? JSON.parse(savedProjects) : [];
    } catch (e) { projects = []; }

    theme = savedTheme;
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

    // Normalize Spools
    if (spools.length > 0) {
        spools = spools.map((sp, idx) => normalizeSpoolRecord(sp, idx));
    }

    // Normalize Hardware
    if (hardware.length > 0) {
        hardware = hardware.map((hw, idx) => ({
            id: hw.id || `hw-${Date.now()}-${idx}`,
            boxNo: String(hw.boxNo || hw.location || `A${idx + 1}`).trim().toUpperCase(),
            category: String(hw.category || hw.type || '').trim(),
            specification: String(hw.specification || hw.size || hw.name || '').trim(),
            sizeLD: hw.sizeLD !== undefined ? String(hw.sizeLD) : (hw.length || ''),
            sizeW: hw.sizeW !== undefined ? String(hw.sizeW) : '',
            sizeT: hw.sizeT !== undefined ? String(hw.sizeT) : '',
            qty: hw.qty !== undefined ? String(hw.qty).trim() : '0',
            minQty: hw.minQty !== undefined && hw.minQty !== '' ? hw.minQty : 10,
            remarks: String(hw.remarks || '').trim()
        }));
    }

    // Seed demo data only if completely empty on first run
    if (spools.length === 0 && hardware.length === 0 && toolsAndHardware.length === 0 && projects.length === 0) {
        spools = [...MOCK_SPOOLS];
        hardware = [...MOCK_HARDWARE];
        toolsAndHardware = JSON.parse(JSON.stringify(MOCK_TOOLS_AND_HARDWARE));
        projects = JSON.parse(JSON.stringify(MOCK_PROJECTS));
        saveDatabase();
    }

    populateMaterialAndSizeFilters();
}

function saveDatabase() {
    localStorage.setItem('nexis_spools', JSON.stringify(spools));
    localStorage.setItem('nexis_hardware', JSON.stringify(hardware));
    localStorage.setItem('nexis_tools_hardware', JSON.stringify(toolsAndHardware));
    localStorage.setItem('nexis_projects', JSON.stringify(projects));

    const spMeta = document.getElementById('spools-export-meta');
    if (spMeta) spMeta.innerText = `${spools.length} spools in database`;

    const hwMeta = document.getElementById('hardware-export-meta');
    if (hwMeta) hwMeta.innerText = `${hardware.length} hardware items in database`;
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
            <p class="activity-title">${escapeHtml(text)}</p>
            <p class="activity-time">${timeString}</p>
        </div>
    `;

    activityFeed.insertBefore(item, activityFeed.firstChild);
    while (activityFeed.children.length > 25) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

// Global Stock Level Evaluator
function getStockLevelInfo(qtyText, minQtyText) {
    const text = String(qtyText === undefined || qtyText === null ? '0' : qtyText).trim();
    const hasPlus = text.includes('+');
    const parsedQty = parseInt(text, 10);
    const isNumeric = !isNaN(parsedQty);

    let threshold = 10;
    if (minQtyText !== undefined && minQtyText !== null && String(minQtyText).trim() !== '') {
        const parsed = parseInt(String(minQtyText).trim(), 10);
        if (!isNaN(parsed)) threshold = parsed;
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
    }

    return {
        parsedQty: isNumeric ? parsedQty : 0,
        isNumeric,
        hasPlus,
        threshold,
        statusLabel,
        statusClass
    };
}

// ==========================================================================
// MASTER RENDERING PIPELINE
// ==========================================================================

function renderAll() {
    populateMaterialAndSizeFilters();
    renderSidebar();
    renderDashboardStats();
    renderSpools();
    renderCabinetTabs();
    renderCabinetGrid();
    renderHardware();
    renderToolsAndHardware();
    renderProjects();
    saveDatabase();

    // Update sidebar badges
    const badgeSpools = document.getElementById('nav-badge-spools');
    const badgeHw = document.getElementById('nav-badge-hardware');
    const badgeTh = document.getElementById('nav-badge-th');
    const badgeProj = document.getElementById('nav-badge-projects');

    if (badgeSpools) badgeSpools.textContent = spools.length;
    if (badgeHw) badgeHw.textContent = hardware.length;
    if (badgeTh) {
        const totalTh = toolsAndHardware.reduce((sum, s) => sum + (s.items ? s.items.length : 0), 0);
        badgeTh.textContent = totalTh;
    }
    if (badgeProj) badgeProj.textContent = projects.length;

    // Trigger auto-sync if enabled
    if (cloudAutoSyncToggle && cloudAutoSyncToggle.checked && !suppressAutoSync) {
        const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
        if (url) debounceAutoSync();
    }
}

// ==========================================================================
// 1. DASHBOARD COMMAND CENTER & REORDER QUEUE
// ==========================================================================

function renderDashboardStats() {
    // 1. Spools Total
    const totalSpoolsQty = spools.reduce((acc, sp) => acc + (parseInt(sp.qty, 10) || 0), 0);
    if (dashTotalWeight) dashTotalWeight.innerText = `${totalSpoolsQty} ${totalSpoolsQty === 1 ? 'spool' : 'spools'}`;
    if (dashSpoolsCount) dashSpoolsCount.innerText = `${spools.length} unique color/materials`;

    // 2. Low Spools
    const lowSpools = spools.filter(sp => (parseInt(sp.qty, 10) || 0) <= (parseInt(sp.reorder, 10) || 0));
    if (dashLowSpools) dashLowSpools.innerText = lowSpools.length;

    // 3. Hardware & Tools Total
    let totalHwQty = hardware.reduce((acc, hw) => acc + getStockLevelInfo(hw.qty, hw.minQty).parsedQty, 0);
    let thQtySum = 0;
    let thItemsCount = 0;

    const lowThItems = [];

    toolsAndHardware.forEach(section => {
        (section.items || []).forEach(item => {
            thItemsCount++;
            const keys = Object.keys(item.fields || {});
            const qtyKey = keys.find(k => {
                const l = k.toLowerCase();
                return (l === 'qty' || l === 'quantity' || l === 'stock' || l === 'count') && !l.includes('min');
            });
            const minQtyKey = keys.find(k => k.toLowerCase().includes('min'));
            const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('type') || k.toLowerCase().includes('item')) || keys[0];

            if (qtyKey) {
                const qVal = parseInt(item.fields[qtyKey], 10);
                if (!isNaN(qVal)) {
                    thQtySum += qVal;
                    const minVal = (minQtyKey && !isNaN(parseInt(item.fields[minQtyKey], 10))) ? parseInt(item.fields[minQtyKey], 10) : 1;
                    if (qVal <= minVal) {
                        lowThItems.push({
                            sectionId: section.id,
                            sectionName: section.sectionName,
                            itemId: item.id,
                            qtyCol: qtyKey,
                            name: item.fields[nameKey] || 'Unnamed Item',
                            qty: qVal,
                            minQty: minVal
                        });
                    }
                }
            }
        });
    });

    if (dashTotalHardware) dashTotalHardware.innerText = (totalHwQty + thQtySum).toLocaleString();
    if (dashHardwareTypes) dashHardwareTypes.innerText = `${hardware.length + thItemsCount} unique SKUs tracked`;

    // 4. Low Hardware & Tools
    const lowHwItems = hardware.filter(hw => {
        const info = getStockLevelInfo(hw.qty, hw.minQty);
        return info.statusClass === 'low' || info.statusClass === 'out';
    });

    const totalLowHwAndTh = lowHwItems.length + lowThItems.length;
    if (dashLowHardware) dashLowHardware.innerText = totalLowHwAndTh;

    // 5. Project BOM Spend
    const totalBomSpend = projects.reduce((sum, p) => {
        return sum + (p.bomItems || []).reduce((s, b) => {
            return b.status === 'Need to purchase'
                ? s + (parseFloat(b.costPerUnit) || 0) * (parseInt(b.qty, 10) || 1)
                : s;
        }, 0);
    }, 0);

    if (dashBomSpend) dashBomSpend.innerText = `AED ${totalBomSpend.toFixed(2)}`;
    if (dashProjectsCount) dashProjectsCount.innerText = `${projects.length} total projects`;

    // Render Priority Reorder Queue
    renderReorderQueue(lowSpools, lowHwItems, lowThItems);
    updateDashboardCharts();
}

function renderReorderQueue(lowSpools, lowHwItems, lowThItems) {
    if (!dashReorderList) return;

    const totalAlerts = lowSpools.length + lowHwItems.length + lowThItems.length;
    if (dashReorderBadge) {
        dashReorderBadge.textContent = `${totalAlerts} ${totalAlerts === 1 ? 'Alert' : 'Alerts'}`;
        dashReorderBadge.style.color = totalAlerts > 0 ? 'var(--warning-light)' : 'var(--success-light)';
    }

    if (totalAlerts === 0) {
        dashReorderList.innerHTML = `
            <div class="view-placeholder" style="padding: 36px 16px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <p style="color: var(--text-secondary); font-weight: 600;">All inventory stock levels are above minimum thresholds.</p>
            </div>
        `;
        return;
    }

    dashReorderList.innerHTML = '';

    // 1. Spool alerts
    lowSpools.forEach(sp => {
        const qty = parseInt(sp.qty, 10) || 0;
        const isOut = qty <= 0;
        const row = document.createElement('div');
        row.className = 'reorder-item-row';
        row.innerHTML = `
            <div class="reorder-item-left">
                <span class="reorder-type-tag">Spool</span>
                <div class="reorder-item-info">
                    <span class="reorder-item-name">${escapeHtml(sp.brand)} ${escapeHtml(sp.material)} — ${escapeHtml(sp.color)}</span>
                    <span class="reorder-item-meta">Location: ${escapeHtml(sp.location || 'N/A')} • Alert &le; ${sp.reorder}</span>
                </div>
            </div>
            <div class="reorder-item-right">
                <span class="status-pill ${isOut ? 'out' : 'low'}">
                    <span class="status-indicator"></span>
                    <span>${qty} left</span>
                </span>
                <button class="btn-text dash-restock-spool" data-id="${escapeHtml(sp.id)}" title="Quick +1 Spool">+1</button>
            </div>
        `;
        dashReorderList.appendChild(row);
    });

    // 2. Hardware alerts
    lowHwItems.forEach(hw => {
        const info = getStockLevelInfo(hw.qty, hw.minQty);
        const row = document.createElement('div');
        row.className = 'reorder-item-row';
        row.innerHTML = `
            <div class="reorder-item-left">
                <span class="reorder-type-tag hw">Bin ${escapeHtml(hw.boxNo)}</span>
                <div class="reorder-item-info">
                    <span class="reorder-item-name">${escapeHtml(hw.category)} — ${escapeHtml(hw.specification)}</span>
                    <span class="reorder-item-meta">Min Alert: ${escapeHtml(hw.minQty)} • ${escapeHtml(hw.remarks || 'Fastener Array')}</span>
                </div>
            </div>
            <div class="reorder-item-right">
                <span class="status-pill ${info.statusClass}">
                    <span class="status-indicator"></span>
                    <span>Qty: ${escapeHtml(hw.qty)}</span>
                </span>
                <button class="btn-text dash-restock-hw" data-id="${escapeHtml(hw.id)}" title="Quick +10 Units">+10</button>
            </div>
        `;
        dashReorderList.appendChild(row);
    });

    // 3. Tools & Hardware alerts
    lowThItems.forEach(th => {
        const isOut = th.qty <= 0;
        const row = document.createElement('div');
        row.className = 'reorder-item-row';
        row.innerHTML = `
            <div class="reorder-item-left">
                <span class="reorder-type-tag th">${escapeHtml(th.sectionName)}</span>
                <div class="reorder-item-info">
                    <span class="reorder-item-name">${escapeHtml(th.name)}</span>
                    <span class="reorder-item-meta">Sub-Section: ${escapeHtml(th.sectionName)} • Alert &le; ${th.minQty}</span>
                </div>
            </div>
            <div class="reorder-item-right">
                <span class="status-pill ${isOut ? 'out' : 'low'}">
                    <span class="status-indicator"></span>
                    <span>Qty: ${th.qty}</span>
                </span>
                <button class="btn-text dash-restock-th" data-sec="${escapeHtml(th.sectionId)}" data-item="${escapeHtml(th.itemId)}" data-col="${escapeHtml(th.qtyCol)}" title="Quick +1 Unit">+1</button>
            </div>
        `;
        dashReorderList.appendChild(row);
    });

    // Wire quick restock buttons
    dashReorderList.querySelectorAll('.dash-restock-spool').forEach(btn => {
        btn.addEventListener('click', () => changeSpoolQty(btn.getAttribute('data-id'), 1));
    });
    dashReorderList.querySelectorAll('.dash-restock-hw').forEach(btn => {
        btn.addEventListener('click', () => changeHardwareQty(btn.getAttribute('data-id'), 10));
    });
    dashReorderList.querySelectorAll('.dash-restock-th').forEach(btn => {
        btn.addEventListener('click', () => {
            changeThItemQty(btn.getAttribute('data-sec'), btn.getAttribute('data-item'), btn.getAttribute('data-col'), 1);
        });
    });
}

function updateDashboardCharts() {
    if (!materialBarChart) return;

    const distribution = {};
    spools.forEach(sp => {
        const mat = sp.material || 'Other';
        distribution[mat] = (distribution[mat] || 0) + (parseInt(sp.qty, 10) || 0);
    });

    if (Object.keys(distribution).length === 0) {
        materialBarChart.innerHTML = '<div class="chart-placeholder">No filament spools in database.</div>';
        return;
    }

    const maxQty = Math.max(...Object.values(distribution), 4);
    materialBarChart.innerHTML = '';

    const sortedMaterials = Object.entries(distribution).sort((a, b) => b[1] - a[1]);

    sortedMaterials.forEach(([material, qty]) => {
        const row = document.createElement('div');
        row.className = 'chart-row';
        const percentage = Math.min((qty / maxQty) * 100, 100);

        row.innerHTML = `
            <div class="chart-row-meta">
                <span class="chart-material-label">${escapeHtml(material)}</span>
                <span class="chart-weight-value">${qty} ${qty === 1 ? 'spool' : 'spools'}</span>
            </div>
            <div class="chart-bar-outer">
                <div class="chart-bar-inner" style="width: ${percentage}%;"></div>
            </div>
        `;
        materialBarChart.appendChild(row);
    });
}

// ==========================================================================
// 2. FILAMENT SPOOLS VIEW
// ==========================================================================

function renderSpools() {
    if (!spoolsContainer) return;

    const materialFilter = filterSpoolMaterial ? filterSpoolMaterial.value : 'all';
    const statusFilter = filterSpoolStatus ? filterSpoolStatus.value : 'all';
    const sortBy = sortSpoolsSelect ? sortSpoolsSelect.value : 'default';

    let filtered = spools.filter(sp => {
        const matchesSearch = searchQuery === '' ||
            (sp.brand || '').toLowerCase().includes(searchQuery) ||
            (sp.material || '').toLowerCase().includes(searchQuery) ||
            (sp.color || '').toLowerCase().includes(searchQuery) ||
            (sp.location || '').toLowerCase().includes(searchQuery) ||
            (sp.notes || '').toLowerCase().includes(searchQuery);

        const matchesMaterial = materialFilter === 'all' || sp.material === materialFilter;

        let matchesStatus = true;
        const qty = parseInt(sp.qty, 10) || 0;
        const reorder = parseInt(sp.reorder, 10) || 0;
        if (statusFilter === 'active') matchesStatus = qty > reorder;
        else if (statusFilter === 'low') matchesStatus = qty <= reorder && qty > 0;
        else if (statusFilter === 'empty') matchesStatus = qty <= 0;

        return matchesSearch && matchesMaterial && matchesStatus;
    });

    if (sortBy === 'brand') {
        filtered.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
    } else if (sortBy === 'material') {
        filtered.sort((a, b) => (a.material || '').localeCompare(b.material || ''));
    } else if (sortBy === 'qty-asc') {
        filtered.sort((a, b) => (parseInt(a.qty, 10) || 0) - (parseInt(b.qty, 10) || 0));
    } else if (sortBy === 'qty-desc') {
        filtered.sort((a, b) => (parseInt(b.qty, 10) || 0) - (parseInt(a.qty, 10) || 0));
    }

    if (filtered.length === 0) {
        spoolsContainer.innerHTML = `
            <div class="view-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p>No matching filament spools found.</p>
            </div>
        `;
        return;
    }

    spoolsContainer.innerHTML = '';

    filtered.forEach(sp => {
        const safeHex = (sp.hex && /^#[0-9A-Fa-f]{3,6}$/.test(sp.hex)) ? sp.hex : '#6366f1';
        const hexClean = safeHex.replace('#', '');
        const r = parseInt(hexClean.substring(0, 2), 16) || 0;
        const g = parseInt(hexClean.substring(2, 4), 16) || 0;
        const b = parseInt(hexClean.substring(4, 6), 16) || 0;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        const isDark = luminance < 0.22;
        const avatarBg = isDark
            ? 'linear-gradient(135deg, #334155, #1e293b)'
            : `radial-gradient(circle, ${safeHex}28, ${safeHex}08)`;
        const avatarBorder = isDark
            ? '1.5px solid rgba(255, 255, 255, 0.22)'
            : `1.5px solid ${safeHex}55`;
        const strokeColor = isDark ? '#e2e8f0' : safeHex;

        const qty = parseInt(sp.qty, 10) || 0;
        const reorder = parseInt(sp.reorder, 10) || 0;

        let statusLabel = 'In Stock';
        let statusClass = 'good';
        if (qty <= 0) {
            statusLabel = 'Out of Stock';
            statusClass = 'out';
        } else if (qty <= reorder) {
            statusLabel = 'Low Stock';
            statusClass = 'low';
        }

        const card = document.createElement('div');
        card.className = 'spool-card glass-panel';
        card.setAttribute('style', `--accent-color: ${safeHex}; --glow-color: ${safeHex}12;`);

        card.innerHTML = `
            <div class="spool-card-header">
                <div class="spool-brand-material">
                    <span class="spool-brand">${escapeHtml(sp.brand)}</span>
                    <span class="spool-material-badge">${escapeHtml(sp.material)}</span>
                </div>
                <div class="spool-header-right">
                    <span class="status-pill ${statusClass}">
                        <span class="status-indicator"></span>
                        <span>${statusLabel}</span>
                    </span>
                    <div class="spool-card-actions">
                        <button class="icon-only-btn edit-spool" data-id="${escapeHtml(sp.id)}" title="Edit spool">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="icon-only-btn delete-icon delete-spool" data-id="${escapeHtml(sp.id)}" title="Delete spool">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="spool-visual-section">
                <div class="spool-avatar-wrapper" style="background: ${avatarBg}; border: ${avatarBorder};">
                    <svg class="spool-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"></path>
                    </svg>
                </div>

                <div class="spools-details-list">
                    <div class="spool-detail-row">
                        <span>Color</span>
                        <span class="spool-detail-value">
                            <span class="spool-color-swatch-dot" style="background-color: ${safeHex};"></span>${escapeHtml(sp.color)}
                        </span>
                    </div>
                    <div class="spool-detail-row">
                        <span>Location</span>
                        <span class="spool-detail-value">${escapeHtml(sp.location || 'N/A')}</span>
                    </div>
                    <div class="spool-detail-row">
                        <span>Alert Limit</span>
                        <span class="spool-detail-value">&le; ${reorder} ${reorder === 1 ? 'unit' : 'units'}</span>
                    </div>
                </div>
            </div>

            ${sp.notes ? `<div style="font-size:11.5px; color:var(--text-secondary); margin-bottom: 12px; line-height:1.4;" title="${escapeHtml(sp.notes)}">${escapeHtml(sp.notes)}</div>` : ''}

            <div class="spool-weight-numbers">
                <div class="weight-rem">${qty} ${qty === 1 ? 'spool' : 'spools'}</div>
                <div class="spool-counter">
                    <button class="spool-counter-btn spool-dec" data-id="${escapeHtml(sp.id)}" title="Decrease quantity">&minus;</button>
                    <span class="spool-counter-val">${qty}</span>
                    <button class="spool-counter-btn spool-inc" data-id="${escapeHtml(sp.id)}" title="Increase quantity">+</button>
                </div>
            </div>
        `;

        spoolsContainer.appendChild(card);
    });

    spoolsContainer.querySelectorAll('.spool-inc').forEach(btn => {
        btn.addEventListener('click', () => changeSpoolQty(btn.getAttribute('data-id'), 1));
    });
    spoolsContainer.querySelectorAll('.spool-dec').forEach(btn => {
        btn.addEventListener('click', () => changeSpoolQty(btn.getAttribute('data-id'), -1));
    });
    spoolsContainer.querySelectorAll('.edit-spool').forEach(btn => {
        btn.addEventListener('click', () => openEditSpoolModal(btn.getAttribute('data-id')));
    });
    spoolsContainer.querySelectorAll('.delete-spool').forEach(btn => {
        btn.addEventListener('click', () => deleteSpool(btn.getAttribute('data-id')));
    });
}

// ==========================================================================
// 3. HARDWARE ARRAY & 5x4 CABINET MATRIX
// ==========================================================================

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
            activeCabinetFilter = null;
            renderCabinetTabs();
            renderCabinetGrid();
            renderHardware();
            renderSidebar();
        });
        selector.appendChild(btn);
    });
}

function renderCabinetGrid() {
    const container = document.getElementById('cabinet-grid-container');
    const filterBanner = document.getElementById('cabinet-active-filter-bar');
    const filterBannerText = document.getElementById('cabinet-active-filter-text');
    if (!container) return;

    if (filterBanner && filterBannerText) {
        if (activeCabinetFilter) {
            filterBanner.classList.remove('hidden');
            filterBannerText.textContent = `Showing items in Drawer ${activeCabinetFilter}`;
        } else {
            filterBanner.classList.add('hidden');
        }
    }

    container.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
        const boxLabel = `${activeCabinetSection}${i}`;
        const matches = hardware.filter(hw => (hw.boxNo || '').trim().toUpperCase() === boxLabel && hw.category && hw.category.trim() !== '');
        const match = matches[0];
        const isOccupied = matches.length > 0;

        const drawerDiv = document.createElement('div');

        if (isOccupied) {
            const stockInfo = getStockLevelInfo(match.qty, match.minQty);
            let stateClass = '';
            if (stockInfo.statusClass === 'out') stateClass = 'drawer-out';
            else if (stockInfo.statusClass === 'low') stateClass = 'drawer-low';

            drawerDiv.className = `cabinet-drawer drawer-occupied ${stateClass}`;
            if (activeCabinetFilter === boxLabel) {
                drawerDiv.classList.add('active-filter');
            }

            const sizes = [match.sizeLD, match.sizeW, match.sizeT].filter(s => s && s !== 'N/A');
            const sizeStr = sizes.length > 0 ? ` (${sizes.join('×')}mm)` : '';
            const displayQty = match.qty !== undefined && String(match.qty).trim() !== '' ? match.qty : '0';
            const extraCount = matches.length > 1 ? ` +${matches.length - 1}` : '';

            drawerDiv.innerHTML = `
                <div class="drawer-meta-top">
                    <span class="drawer-label">${boxLabel}${extraCount}</span>
                    <span class="drawer-qty-badge">${escapeHtml(displayQty)}</span>
                </div>
                <div class="drawer-meta-bottom">
                    <span class="drawer-category">${escapeHtml(match.category)}</span>
                    <span class="drawer-spec">${escapeHtml(match.specification)}${escapeHtml(sizeStr)}</span>
                </div>
            `;

            drawerDiv.addEventListener('click', () => {
                activeCabinetFilter = (activeCabinetFilter === boxLabel) ? null : boxLabel;
                renderCabinetGrid();
                renderHardware();
            });
        } else {
            drawerDiv.className = 'cabinet-drawer drawer-empty';
            drawerDiv.innerHTML = `
                <span class="drawer-label" style="position: absolute; top: 8px; left: 10px; font-size: 11.5px; color: var(--text-muted);">${boxLabel}</span>
                <div class="drawer-add-icon" title="Assign hardware to drawer ${boxLabel}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
            `;

            drawerDiv.addEventListener('click', () => {
                const blankMatch = hardware.find(hw => (hw.boxNo || '').trim().toUpperCase() === boxLabel);
                document.getElementById('modal-hardware-title').innerText = `Add Hardware (Drawer ${boxLabel})`;
                formHardware.reset();
                document.getElementById('hardware-id').value = blankMatch ? blankMatch.id : '';
                document.getElementById('hw-boxNo').value = boxLabel;
                document.getElementById('hw-minQty').value = '10';
                modalHardware.showModal();
            });
        }

        container.appendChild(drawerDiv);
    }
}

function renderHardware() {
    if (!hardwareTbody) return;

    const typeFilter = filterHardwareType ? filterHardwareType.value : 'all';
    const sizeFilter = filterHardwareSize ? filterHardwareSize.value : 'all';
    const stockFilter = filterHardwareStock ? filterHardwareStock.value : 'all';

    const filtered = hardware.filter(hw => {
        const matchesSearch = searchQuery === '' ||
            (hw.boxNo || '').toLowerCase().includes(searchQuery) ||
            (hw.category || '').toLowerCase().includes(searchQuery) ||
            (hw.specification || '').toLowerCase().includes(searchQuery) ||
            (hw.remarks || '').toLowerCase().includes(searchQuery);

        const matchesType = typeFilter === 'all' || hw.category === typeFilter;

        let matchesSize = true;
        if (sizeFilter !== 'all') {
            if (sizeFilter === 'other') {
                matchesSize = !['M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8'].some(s => (hw.specification || '').toUpperCase().includes(s));
            } else {
                matchesSize = (hw.specification || '').toUpperCase().includes(sizeFilter.toUpperCase());
            }
        }

        let matchesStock = true;
        if (stockFilter === 'alert') {
            const info = getStockLevelInfo(hw.qty, hw.minQty);
            matchesStock = (info.statusClass === 'low' || info.statusClass === 'out');
        }

        const matchesCabinet = !activeCabinetFilter || (hw.boxNo || '').trim().toUpperCase() === activeCabinetFilter.trim().toUpperCase();

        return matchesSearch && matchesType && matchesSize && matchesStock && matchesCabinet;
    });

    if (filtered.length === 0) {
        hardwareTbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center" style="padding: 40px; color: var(--text-muted);">
                    No matching hardware items found.
                </td>
            </tr>
        `;
        return;
    }

    hardwareTbody.innerHTML = '';

    filtered.forEach(hw => {
        const tr = document.createElement('tr');
        const stockInfo = getStockLevelInfo(hw.qty, hw.minQty);

        const sizeLDStr = hw.sizeLD && hw.sizeLD !== 'N/A' ? `${hw.sizeLD} mm` : '—';
        const sizeWStr = hw.sizeW && hw.sizeW !== 'N/A' ? `${hw.sizeW} mm` : '—';
        const sizeTStr = hw.sizeT && hw.sizeT !== 'N/A' ? `${hw.sizeT} mm` : '—';

        tr.innerHTML = `
            <td><span class="code-badge" style="color: var(--secondary-light); border-color: rgba(6,182,212,0.3);">${escapeHtml(hw.boxNo)}</span></td>
            <td style="font-weight: 600;">${escapeHtml(hw.category)}</td>
            <td><span class="code-badge">${escapeHtml(hw.specification)}</span></td>
            <td class="text-center" style="font-family: var(--font-mono); font-size: 12px;">${escapeHtml(sizeLDStr)}</td>
            <td class="text-center" style="font-family: var(--font-mono); font-size: 12px;">${escapeHtml(sizeWStr)}</td>
            <td class="text-center" style="font-family: var(--font-mono); font-size: 12px;">${escapeHtml(sizeTStr)}</td>
            <td class="text-center">
                <span class="status-pill ${stockInfo.statusClass}">
                    <span class="status-indicator"></span>
                    <span>${stockInfo.statusLabel} (${escapeHtml(hw.qty)})</span>
                </span>
            </td>
            <td class="text-center" style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">${escapeHtml(hw.minQty !== undefined && hw.minQty !== '' ? hw.minQty : '10')}</td>
            <td style="color: var(--text-secondary); font-size: 12.5px;">${escapeHtml(hw.remarks || '—')}</td>
            <td class="text-right">
                <div class="hw-actions-wrapper">
                    <div class="hw-counter">
                        <button class="hw-counter-btn hw-dec" data-id="${escapeHtml(hw.id)}" title="Decrease">&minus;</button>
                        <span class="hw-counter-val">${escapeHtml(hw.qty)}</span>
                        <button class="hw-counter-btn hw-inc" data-id="${escapeHtml(hw.id)}" title="Increase">+</button>
                    </div>
                    <button class="icon-only-btn edit-hardware" data-id="${escapeHtml(hw.id)}" title="Edit hardware">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-only-btn delete-icon delete-hardware" data-id="${escapeHtml(hw.id)}" title="Delete hardware">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;

        hardwareTbody.appendChild(tr);
    });

    hardwareTbody.querySelectorAll('.hw-inc').forEach(btn => {
        btn.addEventListener('click', () => changeHardwareQty(btn.getAttribute('data-id'), 1));
    });
    hardwareTbody.querySelectorAll('.hw-dec').forEach(btn => {
        btn.addEventListener('click', () => changeHardwareQty(btn.getAttribute('data-id'), -1));
    });
    hardwareTbody.querySelectorAll('.edit-hardware').forEach(btn => {
        btn.addEventListener('click', () => openEditHardwareModal(btn.getAttribute('data-id')));
    });
    hardwareTbody.querySelectorAll('.delete-hardware').forEach(btn => {
        btn.addEventListener('click', () => deleteHardware(btn.getAttribute('data-id')));
    });
}

// ==========================================================================
// 4. TOOLS & HARDWARES (MODULAR SUB-SECTIONS)
// ==========================================================================

function openThSectionModal(sectionId = null) {
    if (!thColumnsContainer) return;
    thColumnsContainer.innerHTML = '';

    if (sectionId) {
        const section = toolsAndHardware.find(s => s.id === sectionId);
        if (section) {
            document.getElementById('modal-th-section-title').innerText = 'Edit Sub-Section';
            document.getElementById('th-section-id').value = section.id;
            document.getElementById('th-section-name').value = section.sectionName;
            (section.columns || []).forEach(col => addThColumnInput(col, col));
        }
    } else {
        document.getElementById('modal-th-section-title').innerText = 'Create Sub-Section';
        formThSection.reset();
        document.getElementById('th-section-id').value = '';
        addThColumnInput('Name');
        addThColumnInput('Specification');
        addThColumnInput('Qty');
        addThColumnInput('Location');
    }

    modalThSection.showModal();
}

function updateThColumnIndices() {
    if (!thColumnsContainer) return;
    thColumnsContainer.querySelectorAll('.th-col-row').forEach((row, idx) => {
        const badge = row.querySelector('.th-col-index');
        if (badge) badge.textContent = `#${idx + 1}`;
    });
}

function addThColumnInput(val = '', origCol = '') {
    if (!thColumnsContainer) return;
    const div = document.createElement('div');
    div.className = 'th-col-row';
    const idx = thColumnsContainer.children.length + 1;

    div.innerHTML = `
        <span class="th-col-index">#${idx}</span>
        <input type="text" class="col-name-input" data-orig-col="${escapeHtml(origCol)}" placeholder="Column Heading (e.g. Name, Qty, Location)" value="${escapeHtml(val)}" required>
        <button type="button" class="btn-icon btn-delete remove-th-col-btn" title="Remove column">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    div.querySelector('.remove-th-col-btn').addEventListener('click', () => {
        div.remove();
        updateThColumnIndices();
    });

    thColumnsContainer.appendChild(div);
}

if (btnAddThColumn) {
    btnAddThColumn.addEventListener('click', () => addThColumnInput());
}

if (formThSection) {
    formThSection.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('th-section-id').value || 'th-sec-' + Date.now();
        const sectionName = document.getElementById('th-section-name').value.trim();

        const columns = [];
        const renameMap = {}; // oldCol -> newCol

        document.querySelectorAll('.col-name-input').forEach(input => {
            const val = input.value.trim();
            const orig = input.getAttribute('data-orig-col');
            if (val) {
                columns.push(val);
                if (orig && orig !== val) {
                    renameMap[orig] = val;
                }
            }
        });

        if (columns.length === 0) {
            showToast('Please add at least one column heading.', 'warning');
            return;
        }

        const idx = toolsAndHardware.findIndex(s => s.id === id);
        if (idx >= 0) {
            // Migrate renamed column keys on existing items so data is never lost
            if (Object.keys(renameMap).length > 0) {
                (toolsAndHardware[idx].items || []).forEach(item => {
                    if (!item.fields) return;
                    Object.entries(renameMap).forEach(([oldKey, newKey]) => {
                        if (item.fields[oldKey] !== undefined && item.fields[newKey] === undefined) {
                            item.fields[newKey] = item.fields[oldKey];
                            delete item.fields[oldKey];
                        }
                    });
                });
            }
            toolsAndHardware[idx].sectionName = sectionName;
            toolsAndHardware[idx].columns = columns;
            logActivity(`Updated sub-section "${sectionName}"`, 'info');
            showToast(`Updated sub-section "${sectionName}"`, 'success');
        } else {
            toolsAndHardware.push({
                id,
                sectionName,
                columns,
                items: []
            });
            logActivity(`Created sub-section "${sectionName}"`, 'success');
            showToast(`Created sub-section "${sectionName}"`, 'success');
        }

        modalThSection.close();
        formThSection.reset();
        renderAll();
    });
}

function deleteThSection(id) {
    const section = toolsAndHardware.find(s => s.id === id);
    if (!section) return;
    if (confirm(`Delete the "${section.sectionName}" sub-section and all ${section.items.length} items inside it?`)) {
        toolsAndHardware = toolsAndHardware.filter(s => s.id !== id);
        logActivity(`Deleted sub-section "${section.sectionName}"`, 'warning');
        showToast(`Deleted "${section.sectionName}"`, 'warning');
        renderAll();
    }
}

function openThItemModal(sectionId = null, itemId = null) {
    if (toolsAndHardware.length === 0) {
        showToast('Create a Sub-Section first before adding products.', 'warning');
        openThSectionModal();
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
        const item = section ? section.items.find(i => i.id === itemId) : null;
        if (section && item) {
            buildThItemFields(section.columns, item.fields || {});
        }
    } else {
        document.getElementById('modal-th-item-title').innerText = 'Add Product';
        const activeSectionId = thItemSectionSelect.value;
        const section = toolsAndHardware.find(s => s.id === activeSectionId);
        if (section) buildThItemFields(section.columns, {});
    }

    modalThItem.showModal();
}

function buildThItemFields(columns, fieldValues) {
    if (!thItemFieldsContainer) return;
    thItemFieldsContainer.innerHTML = '';

    columns.forEach(col => {
        const val = fieldValues[col] !== undefined ? fieldValues[col] : '';
        const div = document.createElement('div');
        div.className = 'form-group';
        div.style.marginBottom = '0';

        const isQty = col.toLowerCase().includes('qty') || col.toLowerCase().includes('quantity');
        const inputType = isQty ? 'number' : 'text';

        div.innerHTML = `
            <label>${escapeHtml(col)}</label>
            <input type="${inputType}" class="th-item-field-input" data-col="${escapeHtml(col)}" value="${escapeHtml(val)}" placeholder="Enter ${escapeHtml(col)}" ${isQty ? 'min="0"' : ''}>
        `;
        thItemFieldsContainer.appendChild(div);
    });
}

if (thItemSectionSelect) {
    thItemSectionSelect.addEventListener('change', (e) => {
        const section = toolsAndHardware.find(s => s.id === e.target.value);
        if (section) buildThItemFields(section.columns, {});
    });
}

if (formThItem) {
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

        // Remove from previous section if moved
        toolsAndHardware.forEach(sec => {
            if (sec.id !== sectionId) {
                const oldIdx = (sec.items || []).findIndex(i => i.id === itemId);
                if (oldIdx >= 0) sec.items.splice(oldIdx, 1);
            }
        });

        const idx = (section.items || []).findIndex(i => i.id === itemId);
        if (idx >= 0) {
            section.items[idx].fields = fields;
            logActivity(`Updated product in "${section.sectionName}"`, 'info');
            showToast(`Updated product in "${section.sectionName}"`, 'success');
        } else {
            section.items.push({ id: itemId, fields });
            logActivity(`Added product to "${section.sectionName}"`, 'success');
            showToast(`Added product to "${section.sectionName}"`, 'success');
        }

        modalThItem.close();
        formThItem.reset();
        renderAll();
    });
}

function changeThItemQty(sectionId, itemId, colName, diff) {
    const section = toolsAndHardware.find(s => s.id === sectionId);
    if (!section) return;
    const item = (section.items || []).find(i => i.id === itemId);
    if (!item || !item.fields) return;

    const currentVal = parseInt(item.fields[colName], 10) || 0;
    const nextVal = Math.max(0, currentVal + diff);
    item.fields[colName] = String(nextVal);

    logActivity(`Adjusted quantity in "${section.sectionName}" to ${nextVal}`, 'info');
    renderAll();
}

function deleteThItem(sectionId, itemId) {
    const section = toolsAndHardware.find(s => s.id === sectionId);
    if (!section) return;
    if (confirm('Delete this product from the sub-section?')) {
        section.items = section.items.filter(i => i.id !== itemId);
        logActivity(`Deleted product from "${section.sectionName}"`, 'warning');
        showToast('Product removed', 'warning');
        renderAll();
    }
}

function renderToolsAndHardware() {
    const container = document.getElementById('th-sections-container');
    if (!container) return;

    // Populate sub-section filter dropdown
    if (filterThSection) {
        const prevVal = filterThSection.value || 'all';
        filterThSection.innerHTML = '<option value="all">All Sub-Sections</option>';
        toolsAndHardware.forEach(sec => {
            const opt = document.createElement('option');
            opt.value = sec.id;
            opt.textContent = sec.sectionName;
            filterThSection.appendChild(opt);
        });
        if ([...filterThSection.options].some(o => o.value === prevVal)) {
            filterThSection.value = prevVal;
        }
    }

    const activeSecFilter = filterThSection ? filterThSection.value : 'all';

    container.innerHTML = '';

    if (toolsAndHardware.length === 0) {
        container.innerHTML = `
            <div class="glass-panel empty-state">
                <p>No Sub-Sections created yet. Click <strong>"New Sub-Section"</strong> to build custom tables for electronics, tools, or parts.</p>
            </div>
        `;
        return;
    }

    const visibleSections = toolsAndHardware.filter(sec => activeSecFilter === 'all' || sec.id === activeSecFilter);

    visibleSections.forEach(section => {
        const filteredItems = (section.items || []).filter(item => {
            if (!searchQuery) return true;
            if ((section.sectionName || '').toLowerCase().includes(searchQuery)) return true;
            return Object.values(item.fields || {}).some(v => String(v).toLowerCase().includes(searchQuery));
        });

        const sectionDiv = document.createElement('div');
        sectionDiv.id = `th-section-${section.id}`;
        sectionDiv.className = 'table-card glass-panel th-section-card';

        let thHtml = '';
        (section.columns || []).forEach(col => {
            const isQty = col.toLowerCase() === 'qty' || col.toLowerCase() === 'quantity' || col.toLowerCase() === 'stock';
            thHtml += `<th ${isQty ? 'class="text-center"' : ''}>${escapeHtml(col)}</th>`;
        });
        thHtml += `<th class="text-right" style="width: 140px;">Actions</th>`;

        let tbodyHtml = '';
        if (filteredItems.length === 0) {
            tbodyHtml = `<tr><td colspan="${(section.columns || []).length + 1}" class="text-center" style="padding: 28px; color: var(--text-muted);">No products in this sub-section.</td></tr>`;
        } else {
            filteredItems.forEach(item => {
                let tdHtml = '';
                const minColKey = (section.columns || []).find(c => c.toLowerCase().includes('min'));
                const minVal = minColKey ? item.fields[minColKey] : '1';

                (section.columns || []).forEach((col, cIdx) => {
                    const rawVal = (item.fields && item.fields[col] !== undefined && item.fields[col] !== '') ? item.fields[col] : '—';
                    const colLower = col.toLowerCase();
                    const isMainQty = (colLower === 'qty' || colLower === 'quantity' || colLower === 'stock' || colLower === 'count') && !colLower.includes('min');

                    if (isMainQty) {
                        const numQty = parseInt(rawVal, 10);
                        const stockInfo = getStockLevelInfo(isNaN(numQty) ? '0' : String(numQty), minVal);
                        tdHtml += `
                            <td class="text-center">
                                <div style="display: inline-flex; align-items: center; gap: 10px;">
                                    <span class="status-pill ${stockInfo.statusClass}">
                                        <span class="status-indicator"></span>
                                        <span>${stockInfo.statusLabel}</span>
                                    </span>
                                    <div class="hw-counter">
                                        <button type="button" class="hw-counter-btn th-qty-step" data-sec="${escapeHtml(section.id)}" data-item="${escapeHtml(item.id)}" data-col="${escapeHtml(col)}" data-diff="-1">&minus;</button>
                                        <span class="hw-counter-val">${escapeHtml(isNaN(numQty) ? '0' : numQty)}</span>
                                        <button type="button" class="hw-counter-btn th-qty-step" data-sec="${escapeHtml(section.id)}" data-item="${escapeHtml(item.id)}" data-col="${escapeHtml(col)}" data-diff="1">+</button>
                                    </div>
                                </div>
                            </td>
                        `;
                    } else if (cIdx === 0) {
                        tdHtml += `<td style="font-weight: 700; color: var(--text-primary);">${escapeHtml(rawVal)}</td>`;
                    } else {
                        tdHtml += `<td>${escapeHtml(rawVal)}</td>`;
                    }
                });

                tbodyHtml += `
                    <tr>
                        ${tdHtml}
                        <td class="text-right">
                            <div class="action-buttons">
                                <button type="button" class="btn-icon btn-edit th-edit-item-btn" data-sec="${escapeHtml(section.id)}" data-item="${escapeHtml(item.id)}" title="Edit Product">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button type="button" class="btn-icon btn-delete th-del-item-btn" data-sec="${escapeHtml(section.id)}" data-item="${escapeHtml(item.id)}" title="Delete Product">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        sectionDiv.innerHTML = `
            <div class="th-section-card-header">
                <div class="th-section-title-group">
                    <h3>${escapeHtml(section.sectionName)}</h3>
                    <span class="code-badge">${filteredItems.length} ${filteredItems.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div class="th-section-actions">
                    <button type="button" class="primary-btn btn-sm th-quick-add-btn" data-sec="${escapeHtml(section.id)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Add Item</span>
                    </button>
                    <button type="button" class="secondary-btn btn-sm th-edit-sec-btn" data-sec="${escapeHtml(section.id)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        <span>Edit Columns</span>
                    </button>
                    <button type="button" class="danger-btn btn-sm th-del-sec-btn" data-sec="${escapeHtml(section.id)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
            <div class="table-responsive">
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

    // Wire events for Tools & Hardwares
    container.querySelectorAll('.th-quick-add-btn').forEach(btn => {
        btn.addEventListener('click', () => openThItemModal(btn.getAttribute('data-sec'), null));
    });
    container.querySelectorAll('.th-edit-sec-btn').forEach(btn => {
        btn.addEventListener('click', () => openThSectionModal(btn.getAttribute('data-sec')));
    });
    container.querySelectorAll('.th-del-sec-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteThSection(btn.getAttribute('data-sec')));
    });
    container.querySelectorAll('.th-edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => openThItemModal(btn.getAttribute('data-sec'), btn.getAttribute('data-item')));
    });
    container.querySelectorAll('.th-del-item-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteThItem(btn.getAttribute('data-sec'), btn.getAttribute('data-item')));
    });
    container.querySelectorAll('.th-qty-step').forEach(btn => {
        btn.addEventListener('click', () => {
            changeThItemQty(
                btn.getAttribute('data-sec'),
                btn.getAttribute('data-item'),
                btn.getAttribute('data-col'),
                parseInt(btn.getAttribute('data-diff'), 10)
            );
        });
    });
}

// ==========================================================================
// 5. PROJECT PLANNER & BOM ENGINE
// ==========================================================================

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
            formProject.reset();
            document.getElementById('project-id').value = '';
            document.getElementById('proj-status').value = 'In Progress';
            modalProject.showModal();
        });
    }

    if (btnCloseProjectModal) btnCloseProjectModal.addEventListener('click', () => modalProject.close());
    if (btnCancelProject) btnCancelProject.addEventListener('click', () => modalProject.close());
    if (btnCloseBomModal) btnCloseBomModal.addEventListener('click', () => modalBomItem.close());
    if (btnCancelBom) btnCancelBom.addEventListener('click', () => modalBomItem.close());

    if (bomStatus) {
        bomStatus.addEventListener('change', (e) => {
            const fields = document.getElementById('bom-purchase-fields');
            if (fields) fields.style.display = (e.target.value === 'Need to purchase') ? 'flex' : 'none';
        });
    }

    // BOM local image compression (max 400px JPEG 0.6 for Google Sheets <50k cell limit)
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
                        const MAX_SIZE = 400;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                            if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                        } else {
                            if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

                        if (dataUrl.length > 45000) {
                            labelBomImg.innerText = 'Error: Image too complex for sheet cell!';
                            labelBomImg.style.color = 'var(--danger)';
                            txtBomImg.value = '';
                        } else {
                            txtBomImg.value = dataUrl;
                            labelBomImg.innerText = 'Compressed & attached: ' + file.name;
                            labelBomImg.style.color = 'var(--success-light)';
                        }
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (formProject) {
        formProject.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProjectForm();
        });
    }

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
    const status = document.getElementById('proj-status') ? document.getElementById('proj-status').value : 'In Progress';

    if (!name) return;

    if (idField) {
        const p = projects.find(proj => proj.projectId === idField);
        if (p) {
            p.projectName = name;
            p.description = desc;
            p.status = status;
        }
        showToast(`Updated project "${name}"`, 'success');
    } else {
        projects.push({
            projectId: 'proj-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            projectName: name,
            description: desc,
            status,
            bomItems: []
        });
        showToast(`Created project "${name}"`, 'success');
    }

    logActivity(`Saved project: ${name}`, 'success');
    modalProject.close();
    renderAll();
}

function openEditProjectModal(id) {
    const p = projects.find(proj => proj.projectId === id);
    if (!p) return;

    document.getElementById('modal-project-title').innerText = 'Edit Project Details';
    document.getElementById('project-id').value = p.projectId;
    document.getElementById('proj-name').value = p.projectName || '';
    document.getElementById('proj-description').value = p.description || '';
    if (document.getElementById('proj-status')) {
        document.getElementById('proj-status').value = p.status || 'In Progress';
    }

    modalProject.showModal();
}

function deleteProject(id) {
    const p = projects.find(proj => proj.projectId === id);
    if (!p) return;
    if (confirm(`Delete project "${p.projectName}" and all its BOM items?`)) {
        projects = projects.filter(proj => proj.projectId !== id);
        logActivity(`Deleted project "${p.projectName}"`, 'warning');
        showToast(`Deleted project "${p.projectName}"`, 'warning');
        renderAll();
    }
}

function openAddBomModal(projectId) {
    document.getElementById('modal-bom-item-title').innerText = 'Add BOM Item';
    formBomItem.reset();
    document.getElementById('bom-item-id').value = '';
    document.getElementById('bom-project-id').value = projectId;
    document.getElementById('bom-qty').value = '1';
    document.getElementById('bom-status').value = 'Have it already';
    document.getElementById('bom-purchase-fields').style.display = 'none';
    document.getElementById('bom-image-upload-status').innerText = 'No file attached';
    document.getElementById('bom-image-upload-status').style.color = 'var(--text-muted)';
    modalBomItem.showModal();
}

function openEditBomModal(projectId, bomId) {
    const p = projects.find(proj => proj.projectId === projectId);
    if (!p) return;
    const item = (p.bomItems || []).find(b => b.id === bomId);
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

    document.getElementById('bom-purchase-fields').style.display = (item.status === 'Need to purchase') ? 'flex' : 'none';
    document.getElementById('bom-image-upload-status').innerText = item.photoUrl ? 'Image attached' : 'No file attached';

    modalBomItem.showModal();
}

function saveBomItemForm() {
    const projId = document.getElementById('bom-project-id').value;
    const itemId = document.getElementById('bom-item-id').value;
    const p = projects.find(proj => proj.projectId === projId);
    if (!p) return;
    if (!p.bomItems) p.bomItems = [];

    const name = document.getElementById('bom-name').value.trim();
    const status = document.getElementById('bom-status').value;
    const qty = Math.max(1, parseInt(document.getElementById('bom-qty').value, 10) || 1);
    const cost = parseFloat(document.getElementById('bom-cost').value) || 0;
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
        showToast(`Updated BOM item "${name}"`, 'success');
    } else {
        p.bomItems.push({
            id: 'bom-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            name,
            status,
            qty,
            costPerUnit: cost,
            specification: spec,
            link,
            photoUrl: photo,
            description: desc
        });
        showToast(`Added "${name}" to BOM`, 'success');
    }

    logActivity(`Saved BOM item: ${name}`, 'success');
    modalBomItem.close();
    renderAll();
}

function deleteBomItem(projectId, bomId) {
    if (confirm('Remove this item from the project BOM?')) {
        const p = projects.find(proj => proj.projectId === projectId);
        if (p && p.bomItems) {
            p.bomItems = p.bomItems.filter(b => b.id !== bomId);
            showToast('Removed BOM item', 'warning');
            renderAll();
        }
    }
}

function exportProjectBomCSV(projectId) {
    const p = projects.find(proj => proj.projectId === projectId);
    if (!p || !p.bomItems || p.bomItems.length === 0) {
        showToast('No BOM items to export in this project.', 'warning');
        return;
    }

    const headers = ['Item Name', 'Status', 'Qty', 'Unit Cost (AED)', 'Total Cost (AED)', 'Specification', 'Supplier Link', 'Notes'];
    const rows = p.bomItems.map(b => {
        const qty = parseInt(b.qty, 10) || 1;
        const unit = b.status === 'Need to purchase' ? (parseFloat(b.costPerUnit) || 0) : 0;
        const total = (qty * unit).toFixed(2);
        const cells = [b.name, b.status, qty, unit.toFixed(2), total, b.specification || '', b.link || '', b.description || ''];
        return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_bom.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Exported BOM for "${p.projectName}"`, 'success');
}

function renderProjects() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;

    const statusFilter = filterProjectStatus ? filterProjectStatus.value : 'all';

    // Overview KPIs
    const totalProjectsCount = projects.length;
    const activeProjectsCount = projects.filter(p => (p.status || 'In Progress') === 'In Progress').length;
    let totalBuyItemsCount = 0;

    const totalSpendVal = projects.reduce((sum, p) => {
        return sum + (p.bomItems || []).reduce((s, b) => {
            if (b.status === 'Need to purchase') {
                totalBuyItemsCount++;
                return s + (parseFloat(b.costPerUnit) || 0) * (parseInt(b.qty, 10) || 1);
            }
            return s;
        }, 0);
    }, 0);

    const projStatTotalNode = document.getElementById('proj-stat-total');
    const projStatSpendNode = document.getElementById('proj-stat-spend');
    const projStatActiveNode = document.getElementById('proj-stat-active');
    const projStatBuyCountNode = document.getElementById('proj-stat-buy-count');

    if (projStatTotalNode) projStatTotalNode.innerText = totalProjectsCount;
    if (projStatSpendNode) projStatSpendNode.innerText = `AED ${totalSpendVal.toFixed(2)}`;
    if (projStatActiveNode) projStatActiveNode.innerText = activeProjectsCount;
    if (projStatBuyCountNode) projStatBuyCountNode.innerText = `${totalBuyItemsCount} ${totalBuyItemsCount === 1 ? 'item' : 'items'} to purchase`;

    const filtered = projects.filter(p => {
        const pStatus = p.status || 'In Progress';
        const matchesSearch = searchQuery === '' ||
            (p.projectName || '').toLowerCase().includes(searchQuery) ||
            (p.description || '').toLowerCase().includes(searchQuery) ||
            (p.bomItems || []).some(b =>
                (b.name || '').toLowerCase().includes(searchQuery) ||
                (b.specification || '').toLowerCase().includes(searchQuery)
            );
        const matchesStatus = statusFilter === 'all' || pStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="glass-panel view-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p>No matching projects found. Click <strong>"New Project"</strong> to create a build plan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    filtered.forEach(p => {
        const pStatus = p.status || 'In Progress';
        let statusColor = 'var(--secondary-light)';
        let statusGlow = 'rgba(6, 182, 212, 0.05)';

        if (pStatus === 'Planning') {
            statusColor = 'var(--purple-light)';
            statusGlow = 'rgba(168, 85, 247, 0.05)';
        } else if (pStatus === 'Completed') {
            statusColor = 'var(--success-light)';
            statusGlow = 'rgba(16, 185, 129, 0.05)';
        } else if (pStatus === 'Cancelled') {
            statusColor = 'var(--danger-light)';
            statusGlow = 'rgba(239, 68, 68, 0.05)';
        }

        const bomItems = p.bomItems || [];
        const needToBuy = bomItems.filter(b => b.status === 'Need to purchase');
        const haveIt = bomItems.filter(b => b.status === 'Have it already');

        let totalNeedToBuyCost = 0;

        const renderBomRow = (b) => {
            const qty = parseInt(b.qty, 10) || 1;
            let rowCostHTML = '';
            if (b.status === 'Need to purchase') {
                const cost = parseFloat(b.costPerUnit) || 0;
                const rowTotal = qty * cost;
                totalNeedToBuyCost += rowTotal;
                rowCostHTML = `
                    <td class="text-right" style="font-family: var(--font-mono);">AED ${cost.toFixed(2)}</td>
                    <td class="text-right" style="font-family: var(--font-mono); color: var(--secondary-light); font-weight: 700;">AED ${rowTotal.toFixed(2)}</td>
                `;
            }

            const imgHtml = b.photoUrl
                ? `<img src="${escapeHtml(b.photoUrl)}" class="bom-item-img" alt="${escapeHtml(b.name)}">`
                : `<div class="bom-img-placeholder"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>`;

            const linkHtml = b.link
                ? `<a href="${escapeHtml(b.link)}" target="_blank" rel="noopener noreferrer" class="btn-text" style="padding: 4px 8px; font-size: 11px; text-decoration: none;" title="Open Supplier Link">Link ↗</a>`
                : `<span style="color: var(--text-muted); font-size: 12px;">—</span>`;

            return `
                <tr>
                    <td style="width: 58px;">${imgHtml}</td>
                    <td>
                        <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(b.name)}</div>
                        ${b.specification ? `<div style="font-size: 11.5px; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 2px;">${escapeHtml(b.specification)}</div>` : ''}
                        ${b.description ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${escapeHtml(b.description)}</div>` : ''}
                    </td>
                    <td class="text-center"><span class="code-badge">${qty}</span></td>
                    ${rowCostHTML}
                    <td class="text-center">${linkHtml}</td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button type="button" class="icon-only-btn toggle-bom-status" data-project="${escapeHtml(p.projectId)}" data-bom="${escapeHtml(b.id)}" style="color: var(--primary-light);" title="Move to ${b.status === 'Need to purchase' ? 'Have it already' : 'Need to purchase'}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path></svg>
                            </button>
                            <button type="button" class="icon-only-btn edit-bom-item" data-project="${escapeHtml(p.projectId)}" data-bom="${escapeHtml(b.id)}" title="Edit BOM Item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button type="button" class="icon-only-btn delete-bom-item delete-icon" data-project="${escapeHtml(p.projectId)}" data-bom="${escapeHtml(b.id)}" title="Delete BOM Item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        };

        const needToBuyRows = needToBuy.map(renderBomRow).join('');
        const haveItRows = haveIt.map(renderBomRow).join('');

        const card = document.createElement('div');
        card.className = 'project-card glass-panel';
        card.setAttribute('style', `--status-color: ${statusColor}; --status-glow: ${statusGlow};`);

        card.innerHTML = `
            <div class="project-card-top">
                <div class="project-title-area">
                    <h3>
                        <span>${escapeHtml(p.projectName)}</span>
                        <span class="status-pill" style="background: ${statusColor}18; color: ${statusColor}; border: 1px solid ${statusColor}40;">${escapeHtml(pStatus)}</span>
                    </h3>
                    ${p.description ? `<p class="project-desc-text">${escapeHtml(p.description)}</p>` : ''}
                </div>
                <div class="project-top-actions">
                    <button type="button" class="secondary-btn btn-sm export-project-bom" data-id="${escapeHtml(p.projectId)}" title="Export BOM to CSV">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Export CSV</span>
                    </button>
                    <button type="button" class="icon-only-btn edit-project" data-id="${escapeHtml(p.projectId)}" title="Edit Project">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button type="button" class="icon-only-btn delete-project delete-icon" data-id="${escapeHtml(p.projectId)}" title="Delete Project">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>

            <div class="bom-section">
                <div class="bom-section-header">
                    <div class="bom-section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        <span>Bill of Materials (${bomItems.length} ${bomItems.length === 1 ? 'item' : 'items'})</span>
                    </div>
                    <button type="button" class="primary-btn btn-sm add-bom-item" data-project="${escapeHtml(p.projectId)}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>Add BOM Item</span>
                    </button>
                </div>

                <div class="bom-tables-grid">
                    <!-- NEED TO PURCHASE TABLE -->
                    <div class="bom-table-container">
                        <div class="bom-subtable-heading" style="color: var(--warning-light);">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                Need to Purchase (${needToBuy.length})
                            </span>
                            <span style="font-family: var(--font-mono); color: var(--secondary-light);">Subtotal: AED ${totalNeedToBuyCost.toFixed(2)}</span>
                        </div>
                        ${needToBuy.length > 0 ? `
                        <table class="bom-table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Part / Specification</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Unit Price</th>
                                    <th class="text-right">Total</th>
                                    <th class="text-center">Supplier</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>${needToBuyRows}</tbody>
                        </table>
                        ` : `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12.5px;">No items currently needed for purchase.</div>`}
                    </div>

                    <!-- HAVE IT ALREADY TABLE -->
                    <div class="bom-table-container">
                        <div class="bom-subtable-heading" style="color: var(--success-light);">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Have It Already (${haveIt.length})
                            </span>
                            <span style="font-family: var(--font-mono); color: var(--text-muted);">In Workshop Stock</span>
                        </div>
                        ${haveIt.length > 0 ? `
                        <table class="bom-table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Part / Specification</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-center">Reference</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>${haveItRows}</tbody>
                        </table>
                        ` : `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12.5px;">No owned items listed yet.</div>`}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Wire Project Card Events
    container.querySelectorAll('.add-bom-item').forEach(btn => {
        btn.addEventListener('click', () => openAddBomModal(btn.getAttribute('data-project')));
    });
    container.querySelectorAll('.export-project-bom').forEach(btn => {
        btn.addEventListener('click', () => exportProjectBomCSV(btn.getAttribute('data-id')));
    });
    container.querySelectorAll('.toggle-bom-status').forEach(btn => {
        btn.addEventListener('click', () => {
            const projId = btn.getAttribute('data-project');
            const bomId = btn.getAttribute('data-bom');
            const p = projects.find(proj => proj.projectId === projId);
            if (p && p.bomItems) {
                const item = p.bomItems.find(b => b.id === bomId);
                if (item) {
                    item.status = item.status === 'Need to purchase' ? 'Have it already' : 'Need to purchase';
                    logActivity(`Moved "${item.name}" to "${item.status}"`, 'info');
                    showToast(`Moved "${item.name}" to ${item.status}`, 'info');
                    renderAll();
                }
            }
        });
    });
    container.querySelectorAll('.edit-bom-item').forEach(btn => {
        btn.addEventListener('click', () => openEditBomModal(btn.getAttribute('data-project'), btn.getAttribute('data-bom')));
    });
    container.querySelectorAll('.delete-bom-item').forEach(btn => {
        btn.addEventListener('click', () => deleteBomItem(btn.getAttribute('data-project'), btn.getAttribute('data-bom')));
    });
    container.querySelectorAll('.edit-project').forEach(btn => {
        btn.addEventListener('click', () => openEditProjectModal(btn.getAttribute('data-id')));
    });
    container.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', () => deleteProject(btn.getAttribute('data-id')));
    });
}

// ==========================================================================
// DATA MUTATIONS (SPOOLS & HARDWARE)
// ==========================================================================

function changeSpoolQty(id, diff) {
    const spool = spools.find(sp => sp.id === id);
    if (!spool) return;

    spool.qty = Math.max((parseInt(spool.qty, 10) || 0) + diff, 0);
    logActivity(`Updated "${spool.brand} ${spool.color}" count to ${spool.qty}`, 'info');
    renderAll();
}

function changeHardwareQty(id, diff) {
    const hw = hardware.find(h => h.id === id);
    if (!hw) return;

    const qtyStr = String(hw.qty || '0').trim();
    const hasPlus = qtyStr.includes('+');
    let currentQty = parseInt(qtyStr, 10);
    if (isNaN(currentQty)) currentQty = 0;

    const newQtyVal = Math.max(currentQty + diff, 0);
    hw.qty = (hasPlus && newQtyVal > 0) ? `${newQtyVal}+` : String(newQtyVal);

    logActivity(`Updated "${hw.category} (${hw.boxNo})" count to ${hw.qty}`, 'info');
    renderAll();
}

function deleteSpool(id) {
    const spool = spools.find(sp => sp.id === id);
    const label = spool ? `${spool.brand} ${spool.color}` : 'Spool';
    if (confirm(`Remove "${label}" from your filament inventory?`)) {
        spools = spools.filter(sp => sp.id !== id);
        logActivity(`Removed spool "${label}"`, 'warning');
        showToast(`Removed "${label}"`, 'warning');
        renderAll();
    }
}

function deleteHardware(id) {
    const hw = hardware.find(h => h.id === id);
    const label = hw ? `${hw.category} (${hw.boxNo})` : 'Hardware';
    if (confirm(`Delete "${label}" from your cabinet array?`)) {
        hardware = hardware.filter(h => h.id !== id);
        logActivity(`Deleted "${label}"`, 'warning');
        showToast(`Deleted "${label}"`, 'warning');
        renderAll();
    }
}

// ==========================================================================
// SEARCH, FILTERS & MODAL CONTROLLERS
// ==========================================================================

function setupFiltersAndSearch() {
    let searchTimeout;
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const val = e.target.value;
            if (btnClearSearch) {
                btnClearSearch.classList.toggle('hidden', val.length === 0);
            }
            searchTimeout = setTimeout(() => {
                searchQuery = val.toLowerCase().trim();
                renderAll();
            }, 120);
        });
    }

    if (btnClearSearch && globalSearch) {
        btnClearSearch.addEventListener('click', () => {
            globalSearch.value = '';
            searchQuery = '';
            btnClearSearch.classList.add('hidden');
            renderAll();
        });
    }

    const btnClearCabinetFilter = document.getElementById('btn-clear-cabinet-filter');
    if (btnClearCabinetFilter) {
        btnClearCabinetFilter.addEventListener('click', () => {
            activeCabinetFilter = null;
            renderCabinetGrid();
            renderHardware();
        });
    }

    if (filterSpoolMaterial) filterSpoolMaterial.addEventListener('change', renderSpools);
    if (filterSpoolStatus) filterSpoolStatus.addEventListener('change', renderSpools);
    if (sortSpoolsSelect) sortSpoolsSelect.addEventListener('change', renderSpools);
    if (filterHardwareType) filterHardwareType.addEventListener('change', renderHardware);
    if (filterHardwareSize) filterHardwareSize.addEventListener('change', renderHardware);
    if (filterHardwareStock) filterHardwareStock.addEventListener('change', renderHardware);
    if (filterThSection) filterThSection.addEventListener('change', renderToolsAndHardware);
    if (filterProjectStatus) filterProjectStatus.addEventListener('change', renderProjects);
}

function setupModals() {
    if (btnAddSpool) {
        btnAddSpool.addEventListener('click', () => {
            document.getElementById('modal-spool-title').innerText = 'Add New Filament Spool';
            formSpool.reset();
            document.getElementById('spool-id').value = '';
            spoolColorPicker.value = '#6366f1';
            spoolHexInput.value = '#6366f1';
            modalSpool.showModal();
        });
    }

    if (btnAddHardware) {
        btnAddHardware.addEventListener('click', () => {
            document.getElementById('modal-hardware-title').innerText = 'Add New Hardware Item';
            formHardware.reset();
            document.getElementById('hardware-id').value = '';
            document.getElementById('hw-minQty').value = '10';
            modalHardware.showModal();
        });
    }

    if (btnAddThSection) btnAddThSection.addEventListener('click', () => openThSectionModal());
    if (btnAddThItem) btnAddThItem.addEventListener('click', () => openThItemModal());

    if (btnCloseSpoolModal) btnCloseSpoolModal.addEventListener('click', () => modalSpool.close());
    if (btnCancelSpool) btnCancelSpool.addEventListener('click', () => modalSpool.close());
    if (btnCloseHardwareModal) btnCloseHardwareModal.addEventListener('click', () => modalHardware.close());
    if (btnCancelHardware) btnCancelHardware.addEventListener('click', () => modalHardware.close());
    if (btnCloseThSectionModal) btnCloseThSectionModal.addEventListener('click', () => modalThSection.close());
    if (btnCancelThSection) btnCancelThSection.addEventListener('click', () => modalThSection.close());
    if (btnCloseThItemModal) btnCloseThItemModal.addEventListener('click', () => modalThItem.close());
    if (btnCancelThItem) btnCancelThItem.addEventListener('click', () => modalThItem.close());

    // Close any dialog on backdrop click
    [modalSpool, modalHardware, modalThSection, modalThItem, modalProject, modalBomItem].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
    });

    if (formSpool) {
        formSpool.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSpoolForm();
        });
    }

    if (formHardware) {
        formHardware.addEventListener('submit', (e) => {
            e.preventDefault();
            saveHardwareForm();
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            theme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('nexis_theme', theme);
            updateThemeToggleIcon();
            showToast(`Switched to ${theme} mode`, 'info');
        });
    }

    // Contextual Quick Add button in Top Header
    if (btnQuickAdd) {
        btnQuickAdd.addEventListener('click', () => {
            if (activeTab === 'hardware') btnAddHardware.click();
            else if (activeTab === 'general') openThItemModal();
            else if (activeTab === 'projects') document.getElementById('btn-add-project').click();
            else btnAddSpool.click();
        });
    }
}

function updateThemeToggleIcon() {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
        themeToggleBtn.innerHTML = `<svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        themeToggleBtn.title = 'Switch to Dark Mode';
    } else {
        themeToggleBtn.innerHTML = `
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
        themeToggleBtn.title = 'Switch to Light Mode';
    }
}

function openEditSpoolModal(id) {
    const sp = spools.find(s => s.id === id);
    if (!sp) return;

    const safeHex = (sp.hex && /^#[0-9A-Fa-f]{3,6}$/.test(sp.hex)) ? sp.hex : '#6366f1';
    const safeColor = (sp.color && sp.color !== 'Default' && !sp.color.startsWith('#')) ? sp.color : (sp.color || '');

    document.getElementById('modal-spool-title').innerText = 'Edit Spool Details';
    document.getElementById('spool-id').value = sp.id;
    document.getElementById('spool-brand').value = sp.brand || '';
    document.getElementById('spool-material').value = sp.material || '';
    document.getElementById('spool-color').value = safeColor;
    document.getElementById('spool-hex').value = safeHex;
    spoolColorPicker.value = safeHex;
    document.getElementById('spool-qty').value = Number.isFinite(Number(sp.qty)) ? Number(sp.qty) : 0;
    document.getElementById('spool-reorder').value = Number.isFinite(Number(sp.reorder)) ? Number(sp.reorder) : 1;
    document.getElementById('spool-location').value = sp.location || '';
    document.getElementById('spool-notes').value = sp.notes || '';

    modalSpool.showModal();
}

function saveSpoolForm() {
    const id = document.getElementById('spool-id').value;
    const spoolData = {
        brand: document.getElementById('spool-brand').value.trim(),
        material: document.getElementById('spool-material').value.trim() || 'PLA',
        color: document.getElementById('spool-color').value.trim(),
        hex: document.getElementById('spool-hex').value.trim() || '#6366f1',
        qty: parseInt(document.getElementById('spool-qty').value, 10) || 0,
        reorder: parseInt(document.getElementById('spool-reorder').value, 10) || 0,
        location: document.getElementById('spool-location').value.trim(),
        notes: document.getElementById('spool-notes').value.trim()
    };

    if (id) {
        const idx = spools.findIndex(s => s.id === id);
        if (idx !== -1) {
            spools[idx] = { id, ...spoolData };
            logActivity(`Updated spool "${spoolData.brand} ${spoolData.color}"`, 'info');
            showToast(`Updated "${spoolData.brand} ${spoolData.color}"`, 'success');
        }
    } else {
        spools.push({ id: 'sp-' + Date.now(), ...spoolData });
        logActivity(`Added spool "${spoolData.brand} ${spoolData.color}"`, 'success');
        showToast(`Added "${spoolData.brand} ${spoolData.color}"`, 'success');
    }

    modalSpool.close();
    renderAll();
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
    document.getElementById('hw-minQty').value = hw.minQty !== undefined && hw.minQty !== '' ? hw.minQty : '10';
    document.getElementById('hw-remarks').value = hw.remarks || '';

    modalHardware.showModal();
}

function saveHardwareForm() {
    const id = document.getElementById('hardware-id').value;
    const hwData = {
        boxNo: document.getElementById('hw-boxNo').value.trim().toUpperCase(),
        category: document.getElementById('hw-category').value.trim(),
        specification: document.getElementById('hw-specification').value.trim(),
        sizeLD: document.getElementById('hw-sizeLD').value.trim(),
        sizeW: document.getElementById('hw-sizeW').value.trim(),
        sizeT: document.getElementById('hw-sizeT').value.trim(),
        qty: document.getElementById('hw-qty').value.trim() || '0',
        minQty: !isNaN(parseInt(document.getElementById('hw-minQty').value, 10)) ? parseInt(document.getElementById('hw-minQty').value, 10) : 10,
        remarks: document.getElementById('hw-remarks').value.trim()
    };

    if (id) {
        const idx = hardware.findIndex(h => h.id === id);
        if (idx !== -1) {
            hardware[idx] = { id, ...hwData };
            logActivity(`Updated hardware "${hwData.category} (${hwData.boxNo})"`, 'info');
            showToast(`Updated "${hwData.category} (${hwData.boxNo})"`, 'success');
        }
    } else {
        hardware.push({ id: 'hw-' + Date.now(), ...hwData });
        logActivity(`Added hardware "${hwData.category} (${hwData.boxNo})"`, 'success');
        showToast(`Added "${hwData.category} (${hwData.boxNo})"`, 'success');
    }

    modalHardware.close();
    renderAll();
}

// ==========================================================================
// GOOGLE SHEETS CLOUD SYNC & CSV IMPORT/EXPORT
// ==========================================================================

function setupSyncEngine() {
    if (btnRunImport) {
        btnRunImport.addEventListener('click', () => {
            const text = csvImportText.value.trim();
            if (!text) {
                showToast('Please paste CSV content or drop a CSV file first.', 'warning');
                return;
            }
            runCSVImport(text);
        });
    }

    if (csvFileDropzone && csvFileInput) {
        csvFileDropzone.addEventListener('click', () => csvFileInput.click());
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleCSVFile(file);
        });
        csvFileDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            csvFileDropzone.style.borderColor = 'var(--primary)';
        });
        csvFileDropzone.addEventListener('dragleave', () => {
            csvFileDropzone.style.borderColor = 'var(--border-strong)';
        });
        csvFileDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            csvFileDropzone.style.borderColor = 'var(--border-strong)';
            const file = e.dataTransfer.files[0];
            if (file) handleCSVFile(file);
        });
    }

    if (btnExportSpools) {
        btnExportSpools.addEventListener('click', () => exportCSVFile(spools, 'nexis_spools_export.csv'));
    }
    if (btnExportHardware) {
        btnExportHardware.addEventListener('click', () => exportCSVFile(hardware, 'nexis_hardware_export.csv'));
    }

    if (btnLoadMockData) {
        btnLoadMockData.addEventListener('click', () => {
            if (confirm('Replace local data with the industrial demo pack?')) {
                spools = [...MOCK_SPOOLS];
                hardware = [...MOCK_HARDWARE];
                toolsAndHardware = JSON.parse(JSON.stringify(MOCK_TOOLS_AND_HARDWARE));
                projects = JSON.parse(JSON.stringify(MOCK_PROJECTS));
                renderAll();
                showToast('Loaded industrial demo dataset!', 'success');
                switchTab('dashboard');
            }
        });
    }

    if (cloudApiUrlInput) {
        cloudApiUrlInput.addEventListener('change', () => {
            const url = cloudApiUrlInput.value.trim();
            localStorage.setItem('nexis_cloud_url', url);
            updateCloudStatusLabel('idle');
            showToast('Updated Google Sheets Web App URL', 'info');
        });
    }

    if (cloudAutoSyncToggle) {
        cloudAutoSyncToggle.addEventListener('change', () => {
            const checked = cloudAutoSyncToggle.checked;
            localStorage.setItem('nexis_cloud_auto_sync', checked);
            showToast(`Real-Time Auto-Sync ${checked ? 'Enabled' : 'Disabled'}`, 'info');
            if (checked) pushToCloud(true);
        });
    }

    if (btnCloudPull) btnCloudPull.addEventListener('click', () => fetchFromCloud(false));
    if (btnDashSyncNow) btnDashSyncNow.addEventListener('click', () => fetchFromCloud(false));
    if (btnCloudPush) btnCloudPush.addEventListener('click', () => pushToCloud(false));

    updateCloudStatusLabel('idle');
}

function handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        csvImportText.value = e.target.result;
        const strong = csvFileDropzone.querySelector('strong');
        if (strong) strong.innerText = file.name;
        showToast(`Loaded "${file.name}"`, 'info');
    };
    reader.readAsText(file);
}

function runCSVImport(csvText) {
    const firstLine = csvText.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const splitCSVLine = (text) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === delimiter && !inQuotes) {
                result.push(cur.trim());
                cur = '';
            } else cur += char;
        }
        result.push(cur.trim());
        return result.map(cell => cell.replace(/^["']|["']$/g, '').trim());
    };

    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
        showToast('Invalid CSV: header and at least 1 row required.', 'danger');
        return;
    }

    const rawHeaders = splitCSVLine(lines[0]).map(h => h.toLowerCase());
    const isSpoolSheet = rawHeaders.includes('brand') || rawHeaders.includes('material') || rawHeaders.includes('hexcode');

    if (isSpoolSheet) {
        const parsedSpools = [];
        for (let i = 1; i < lines.length; i++) {
            const cells = splitCSVLine(lines[i]);
            if (cells.length < 2) continue;
            const row = {};
            rawHeaders.forEach((h, idx) => { row[h] = cells[idx]; });
            parsedSpools.push(normalizeSpoolRecord({
                id: row['id'] || `sp-csv-${Date.now()}-${i}`,
                brand: row['brand'] || row['manufacturer'] || 'Generic',
                material: row['material'] || 'PLA',
                color: row['color'] || 'Standard',
                hex: row['hexcode'] || row['hex'] || '#6366f1',
                qty: parseInt(row['quantity'] || row['qty'] || '1', 10),
                reorder: parseInt(row['reorderlimit'] || row['reorder'] || '1', 10),
                location: row['location'] || row['shelf'] || '',
                notes: row['notes'] || ''
            }, i));
        }
        spools = parsedSpools;
        showToast(`Imported ${parsedSpools.length} filament spools!`, 'success');
        switchTab('spools');
    } else {
        const parsedHardware = [];
        for (let i = 1; i < lines.length; i++) {
            const cells = splitCSVLine(lines[i]);
            if (cells.length < 2) continue;
            const row = {};
            rawHeaders.forEach((h, idx) => { row[h] = cells[idx]; });
            parsedHardware.push({
                id: `hw-csv-${Date.now()}-${i}`,
                boxNo: (row['box no.'] || row['boxno'] || row['box'] || `A${i}`).toUpperCase(),
                category: row['category'] || row['type'] || '',
                specification: row['specification'] || row['spec'] || '',
                sizeLD: row['l/d'] || row['size (l/d)'] || '',
                sizeW: row['w'] || row['size (w)'] || '',
                sizeT: row['t'] || row['size (t)'] || '',
                qty: String(row['qty'] || row['quantity'] || '0').trim(),
                minQty: String(row['min qty'] || row['minqty'] || '10').trim(),
                remarks: row['remarks'] || row['notes'] || ''
            });
        }
        hardware = parsedHardware;
        showToast(`Imported ${parsedHardware.length} hardware items!`, 'success');
        switchTab('hardware');
    }

    renderAll();
}

function exportCSVFile(dataArray, filename) {
    if (!dataArray || dataArray.length === 0) {
        showToast('No items to export.', 'warning');
        return;
    }

    const isSpool = dataArray === spools;
    const headersLine = isSpool
        ? 'ID,Brand,Material,Color,HexCode,Quantity,ReorderLimit,Location,Notes'
        : 'Box No.,Category,Specification,L/D,W,T,Qty,Min Qty,Remarks';
    const keys = isSpool
        ? ['id', 'brand', 'material', 'color', 'hex', 'qty', 'reorder', 'location', 'notes']
        : ['boxNo', 'category', 'specification', 'sizeLD', 'sizeW', 'sizeT', 'qty', 'minQty', 'remarks'];

    const rows = dataArray.map(item => keys.map(k => {
        let val = item[k] === undefined || item[k] === null ? '' : String(item[k]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    }).join(','));

    const csvContent = [headersLine, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}`, 'success');
}

function updateCloudStatusLabel(status = 'idle', details = '') {
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';

    if (headerSyncDot && headerSyncLabel) {
        headerSyncDot.className = 'sync-dot';
        if (!url) {
            headerSyncLabel.textContent = 'Local Only';
        } else if (status === 'syncing') {
            headerSyncDot.classList.add('syncing');
            headerSyncLabel.textContent = 'Syncing...';
        } else if (status === 'success') {
            headerSyncDot.classList.add('synced');
            headerSyncLabel.textContent = 'Cloud Synced';
        } else if (status === 'error') {
            headerSyncDot.classList.add('error');
            headerSyncLabel.textContent = 'Sync Error';
        } else {
            headerSyncDot.classList.add('synced');
            headerSyncLabel.textContent = 'Cloud Ready';
        }
    }

    if (!cloudStatusText || !cloudStatusIcon) return;

    if (!url) {
        cloudStatusText.innerHTML = 'Status: <strong>Local storage mode</strong> (database disconnected)';
        return;
    }

    if (status === 'syncing') {
        cloudStatusText.innerHTML = 'Status: <strong style="color: var(--warning-light);">Synchronizing with Google Sheets...</strong>';
    } else if (status === 'success') {
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        cloudStatusText.innerHTML = `Status: <strong style="color: var(--success-light);">Connected & Synced</strong> (Last: ${timeString})`;
    } else if (status === 'error') {
        cloudStatusText.innerHTML = `Status: <strong style="color: var(--danger-light);">Sync Error</strong> (${escapeHtml(details || 'Check connection')})`;
    } else {
        cloudStatusText.innerHTML = 'Status: <strong>Ready to Sync</strong> (Cloud connected)';
    }
}

async function fetchFromCloud(isSilentStartup = false) {
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
    if (!url) {
        if (!isSilentStartup) showToast('Please enter a valid Google Apps Script URL first.', 'warning');
        return;
    }

    updateCloudStatusLabel('syncing');
    logActivity('Fetching latest inventory from Google Sheets...', 'info');

    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (result.status === 'success' && result.data) {
            const data = result.data;
            suppressAutoSync = true;

            if (data.spools && Array.isArray(data.spools)) {
                spools = data.spools.map((sp, idx) => normalizeSpoolRecord(sp, idx));
            }

            if (data.hardware && Array.isArray(data.hardware)) {
                hardware = data.hardware.map((hw, idx) => ({
                    id: hw.id || `hw-cloud-${Date.now()}-${idx}`,
                    boxNo: String(hw.boxNo || `A${idx + 1}`).trim().toUpperCase(),
                    category: String(hw.category || '').trim(),
                    specification: String(hw.specification || '').trim(),
                    sizeLD: hw.sizeLD !== undefined ? String(hw.sizeLD) : '',
                    sizeW: hw.sizeW !== undefined ? String(hw.sizeW) : '',
                    sizeT: hw.sizeT !== undefined ? String(hw.sizeT) : '',
                    qty: hw.qty !== undefined ? String(hw.qty).trim() : '0',
                    minQty: hw.minQty !== undefined && String(hw.minQty).trim() !== '' ? String(hw.minQty).trim() : '10',
                    remarks: String(hw.remarks || '').trim()
                }));
            }

            if (data.toolsAndHardware && Array.isArray(data.toolsAndHardware)) {
                toolsAndHardware = data.toolsAndHardware.map((section, idx) => ({
                    id: section.id || `th-sec-${Date.now()}-${idx}`,
                    sectionName: section.sectionName || 'Unnamed Section',
                    columns: Array.isArray(section.columns) ? section.columns : [],
                    items: Array.isArray(section.items) ? section.items.map(item => ({
                        id: item.id || `th-item-${Date.now()}-${Math.random()}`,
                        fields: item.fields || {}
                    })) : []
                }));
            }

            if (data.projects && Array.isArray(data.projects)) {
                const prevProjects = [...projects];
                projects = data.projects.map((proj, idx) => {
                    let parsedBomItems = [];
                    if (data.bomItems && Array.isArray(data.bomItems)) {
                        parsedBomItems = data.bomItems.filter(b => b.projectId === proj.projectId);
                    } else if (proj.bomItemsJson) {
                        try { parsedBomItems = JSON.parse(proj.bomItemsJson); } catch (e) { parsedBomItems = []; }
                    }
                    const existingLocal = prevProjects.find(lp => lp.projectId === proj.projectId);
                    return {
                        projectId: proj.projectId || `proj-cloud-${Date.now()}-${idx}`,
                        projectName: proj.projectName || 'Unnamed Project',
                        description: proj.description || '',
                        status: proj.status || (existingLocal ? existingLocal.status : 'In Progress'),
                        bomItems: parsedBomItems
                    };
                });
            }

            renderAll();
            suppressAutoSync = false;
            hasFetchedFromCloud = true;

            updateCloudStatusLabel('success');
            logActivity('Synced live database from Google Sheets', 'success');
            if (!isSilentStartup) showToast('Synced latest data from Google Sheets!', 'success');
        } else {
            throw new Error(result.message || 'Invalid response payload');
        }
    } catch (err) {
        console.error('Google Sheets Cloud pull failed:', err);
        suppressAutoSync = false;
        updateCloudStatusLabel('error', err.message);
        logActivity(`Cloud Fetch Failed: ${err.message}`, 'danger');
        if (!isSilentStartup) showToast(`Cloud fetch failed: ${err.message}`, 'danger');
    }
}

async function pushToCloud(isAutoSync = false) {
    const url = cloudApiUrlInput ? cloudApiUrlInput.value.trim() : '';
    if (!url) {
        if (!isAutoSync) showToast('Please enter a valid Google Apps Script URL first.', 'warning');
        return;
    }

    if (!hasFetchedFromCloud) {
        if (isAutoSync) return;
        const confirmPush = confirm(
            'You have not fetched from Google Sheets in this session yet.\n\n' +
            'Pushing now will overwrite the Google Sheet with your current browser data. Continue?'
        );
        if (!confirmPush) return;
    }

    updateCloudStatusLabel('syncing');

    try {
        const allBomItems = [];
        projects.forEach(proj => {
            (proj.bomItems || []).forEach(b => {
                allBomItems.push({
                    projectId: proj.projectId,
                    ...b
                });
            });
        });

        // Dual-field spool mapping so both old and new Google Apps Script versions work seamlessly
        const payload = {
            spools: spools.map(s => ({
                id: s.id,
                brand: s.brand,
                material: s.material,
                color: s.color,
                colorName: s.color,
                hex: s.hex,
                colorHex: s.hex,
                qty: Number(s.qty) || 0,
                remaining: Number(s.qty) || 0,
                reorder: Number(s.reorder) || 0,
                minRemaining: Number(s.reorder) || 0,
                location: s.location || '',
                notes: s.notes || ''
            })),
            hardware: hardware.map(hw => ({
                boxNo: hw.boxNo,
                category: hw.category,
                specification: hw.specification,
                sizeLD: hw.sizeLD,
                sizeW: hw.sizeW,
                sizeT: hw.sizeT,
                qty: hw.qty,
                minQty: hw.minQty !== undefined && hw.minQty !== '' ? hw.minQty : '10',
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
                description: proj.description,
                status: proj.status || 'In Progress'
            })),
            bomItems: allBomItems
        };

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (result.status === 'success') {
            hasFetchedFromCloud = true;
            updateCloudStatusLabel('success');
            logActivity('Changes saved to Google Sheets', 'success');
            if (!isAutoSync) showToast('Pushed inventory to Google Sheets!', 'success');
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (err) {
        console.error('Google Sheets Cloud push failed:', err);
        updateCloudStatusLabel('error', err.message);
        logActivity(`Cloud Push Failed: ${err.message}`, 'danger');
        if (!isAutoSync) showToast(`Cloud push failed: ${err.message}`, 'danger');
    }
}

function debounceAutoSync() {
    if (autoSyncTimer) clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
        pushToCloud(true);
    }, 2200);
}

function populateMaterialAndSizeFilters() {
    if (!filterSpoolMaterial || !filterHardwareSize || !filterHardwareType) return;

    // 1. Spools Materials
    const currentMaterialVal = filterSpoolMaterial.value || 'all';
    const materials = new Set(['PLA', 'PLA+', 'PLA Pro', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon']);
    spools.forEach(sp => { if (sp.material) materials.add(sp.material); });

    filterSpoolMaterial.innerHTML = '<option value="all">All Materials</option>';
    Array.from(materials).sort().forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat;
        opt.textContent = mat;
        filterSpoolMaterial.appendChild(opt);
    });
    if ([...filterSpoolMaterial.options].some(o => o.value === currentMaterialVal)) {
        filterSpoolMaterial.value = currentMaterialVal;
    }

    // 2. Hardware Categories
    const currentTypeVal = filterHardwareType.value || 'all';
    const categories = new Set(['Screw', 'SHCS', 'BHCS', 'Nut', 'Bearing', 'Washer', 'Magnet', 'Threaded Insert', 'Limit Switch', 'NFC Card']);
    hardware.forEach(hw => { if (hw.category) categories.add(hw.category); });

    filterHardwareType.innerHTML = '<option value="all">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterHardwareType.appendChild(opt);
    });
    if ([...filterHardwareType.options].some(o => o.value === currentTypeVal)) {
        filterHardwareType.value = currentTypeVal;
    }

    // 3. Hardware Sizes
    const currentSizeVal = filterHardwareSize.value || 'all';
    const sizes = new Set(['M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8']);
    hardware.forEach(hw => {
        const match = String(hw.specification || '').match(/M\d+(?:\.\d+)?/i);
        if (match) sizes.add(match[0].toUpperCase());
    });

    filterHardwareSize.innerHTML = '<option value="all">All Specs</option>' +
        Array.from(sizes).sort((a, b) => (parseFloat(a.slice(1)) || 0) - (parseFloat(b.slice(1)) || 0))
            .map(sz => `<option value="${escapeHtml(sz)}">${escapeHtml(sz)}</option>`).join('') +
        '<option value="other">Other/Non-metric</option>';

    if ([...filterHardwareSize.options].some(o => o.value === currentSizeVal)) {
        filterHardwareSize.value = currentSizeVal;
    }
}

// ==========================================================================
// AUTHENTICATION & SESSIONS
// ==========================================================================

function checkUserSession() {
    const sessionText = localStorage.getItem('nexis_user_session');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.querySelector('.app-container');

    if (sessionText) {
        try {
            const session = JSON.parse(sessionText);
            const lifespan = 7 * 24 * 60 * 60 * 1000;
            if (session.loggedIn && (Date.now() - session.timestamp < lifespan)) {
                if (loginScreen) loginScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');

                const nameNode = document.querySelector('.sidebar-footer .user-name');
                const avatarNode = document.querySelector('.sidebar-footer .user-avatar');
                if (nameNode && session.username) {
                    const dispName = session.username.charAt(0).toUpperCase() + session.username.slice(1);
                    nameNode.textContent = dispName;
                    if (avatarNode) avatarNode.textContent = dispName.charAt(0).toUpperCase();
                }
                return true;
            }
        } catch (e) {
            console.error('Session parse error:', e);
        }
    }

    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appContainer) appContainer.classList.add('hidden');

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
    const btnTogglePassword = document.getElementById('btn-toggle-password');
    const passwordInput = document.getElementById('login-password');

    if (!loginForm) return;

    if (btnTogglePassword && passwordInput) {
        btnTogglePassword.addEventListener('click', () => {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = passwordInput ? passwordInput.value.trim() : '';
        const customUrl = document.getElementById('login-cloud-url').value.trim();

        if (customUrl) {
            localStorage.setItem('nexis_cloud_url', customUrl);
            if (cloudApiUrlInput) cloudApiUrlInput.value = customUrl;
        }

        const url = customUrl || localStorage.getItem('nexis_cloud_url') || '';
        loginSubmitBtn.disabled = true;
        const originalText = loginSubmitBtn.innerHTML;
        loginSubmitBtn.innerHTML = '<span>Authenticating...</span>';
        loginErrorAlert.classList.add('hidden');

        try {
            let authenticated = false;

            // Built-in fallback for admin/admin123 or live GAS verification
            if (url) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        mode: 'cors',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({ action: 'login', username, password })
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.status === 'success') authenticated = true;
                    }
                } catch (netErr) {
                    if (username.toLowerCase() === 'admin' && password === 'admin123') {
                        authenticated = true;
                    } else {
                        throw netErr;
                    }
                }
            } else if (username.toLowerCase() === 'admin' && password === 'admin123') {
                authenticated = true;
            }

            if (authenticated) {
                localStorage.setItem('nexis_user_session', JSON.stringify({
                    loggedIn: true,
                    username: username.toLowerCase(),
                    timestamp: Date.now()
                }));

                document.getElementById('login-screen').classList.add('hidden');
                document.querySelector('.app-container').classList.remove('hidden');

                const dispName = username.charAt(0).toUpperCase() + username.slice(1);
                const nameNode = document.querySelector('.sidebar-footer .user-name');
                const avatarNode = document.querySelector('.sidebar-footer .user-avatar');
                if (nameNode) nameNode.textContent = dispName;
                if (avatarNode) avatarNode.textContent = dispName.charAt(0).toUpperCase();

                suppressAutoSync = true;
                loadDatabase();
                renderAll();
                suppressAutoSync = false;

                if (url) fetchFromCloud(true);
                showToast(`Welcome back, ${dispName}!`, 'success');
            } else {
                throw new Error('Invalid username or password.');
            }
        } catch (err) {
            loginErrorMsg.innerText = err.message || 'Authentication failed';
            loginErrorAlert.classList.remove('hidden');
        } finally {
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.innerHTML = originalText;
        }
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('Sign out of Nexis Industrial OS?')) {
                localStorage.removeItem('nexis_user_session');
                document.querySelector('.app-container').classList.add('hidden');
                document.getElementById('login-screen').classList.remove('hidden');
                loginForm.reset();
            }
        });
    }
}

// ==========================================================================
// SIDEBAR SUB-MENUS
// ==========================================================================

function renderSidebar() {
    const hwSubMenu = document.getElementById('sidebar-hardware-sub');
    const thSubMenu = document.getElementById('sidebar-th-sub');
    if (!hwSubMenu || !thSubMenu) return;

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

    thSubMenu.innerHTML = '';
    toolsAndHardware.forEach(sec => {
        const btn = document.createElement('button');
        btn.className = 'sub-nav-btn';
        btn.innerHTML = `<span class="sub-nav-dot"></span><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(sec.sectionName)}</span>`;
        btn.onclick = (e) => {
            e.stopPropagation();
            switchTab('general');
            if (filterThSection) {
                filterThSection.value = 'all';
                renderToolsAndHardware();
            }
            setTimeout(() => {
                const el = document.getElementById(`th-section-${sec.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        };
        thSubMenu.appendChild(btn);
    });
}
