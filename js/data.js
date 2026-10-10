// ============================================================
// Sample data for the demo. Same made-up world as the dashboard's
// Pipeline page (pipeline/pipeline-data.js): the same jobs, people,
// sites, stages and holds, so the app and the dashboard tell one story.
// Nothing here comes from the real API.
//   Job / project = the number (19204). Project item = number + code (19204-BC001).
// ============================================================

// ---- dates, relative to today so the demo never goes stale ----
const DAY = 86400000;
const today = new Date();
today.setHours(0, 0, 0, 0);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const dateIn = (days) => new Date(today.getTime() + days * DAY);
export const shortDate = (days) => { const d = dateIn(days); return MONTHS[d.getMonth()] + ' ' + d.getDate(); };
export const dayWord = (days) =>
  days === 0 ? 'today' : days === 1 ? 'tomorrow' : days === -1 ? 'yesterday' : days > 1 && days < 7 ? WEEKDAYS[dateIn(days).getDay()] : shortDate(days);

// ---- sites (lat/lon for the weather) ----
export const SITES = {
  nampa: { name: 'Nampa', role: 'Headquarters · Fabrication & Assembly', lat: 43.54, lon: -116.563 },
  rupert: { name: 'Rupert', role: 'Fabrication · Surface Finish & Ship', lat: 42.619, lon: -113.677 },
};

// ---- people ----
export const PEOPLE = {
  'Jarek Kisler': { initials: 'JK', job: 'Sales & QC', tone: ['#e8f0ff', '#1e40af'] },
  'Andrew Meimann': { initials: 'AM', job: 'Engineering', tone: ['#efe9ff', '#5b21b6'] },
  'Matt Smith': { initials: 'MS', job: 'Warehouse', tone: ['#e6f6ee', '#1a7a43'] },
  'Amanda Pratt': { initials: 'AP', job: 'Purchasing & Receiving', tone: ['#fff1e0', '#9a4d00'] },
  'Brandon Browser': { initials: 'BB', job: 'Shop lead', tone: ['#ffe9e7', '#b3261e'] },
  'Shane Kloer': { initials: 'SK', job: 'Project manager', tone: ['#e3f4fb', '#0b6b8f'] },
};

// ---- the workflow (owner + checklist per stage), from Pipeline ----
export const STAGES = [
  { key: 'est', label: 'Estimate', phase: 'Sales', owner: 'Jarek Kisler', checks: ['Scope and drawings reviewed', 'Hours estimated per stage', 'Material and purchased parts priced', 'Estimate approved'] },
  { key: 'bid', label: 'Bid', phase: 'Sales', owner: 'Jarek Kisler', checks: ['Quote sent to customer', 'Customer questions answered', 'Bid accepted'] },
  { key: 'po', label: 'PO', phase: 'Sales', owner: 'Shane Kloer', checks: ['Customer PO received', 'PO matches the quote', 'PO entered in FileMaker'] },
  { key: 'eng', label: 'Engineering', phase: 'Engineering', owner: 'Andrew Meimann', checks: ['Configuration saved', 'Drawings generated', 'Design review signed off', 'BOM released', 'Imported to FileMaker'] },
  { key: 'prefab', label: 'Pre-Fab', phase: 'Production', owner: 'Brandon Browser', checks: ['Material cut to length', 'Parts formed and bent', 'Holes drilled and tapped', 'Parts kitted for fabrication'] },
  { key: 'mach', label: 'Machining', phase: 'Production', owner: 'Brandon Browser', checks: ['Machined parts complete', 'Dimensions checked', 'Parts deburred and labeled'] },
  { key: 'buy', label: 'Purchasing', phase: 'Production', owner: 'Amanda Pratt', checks: ['Every line on a PO', 'Expected dates confirmed', 'Backorders followed up'] },
  { key: 'rec', label: 'Receiving', phase: 'Production', owner: 'Amanda Pratt', checks: ['Packing slips matched to POs', 'Parts inspected for damage', 'Received in FileMaker', 'Shortages reported to purchasing'] },
  { key: 'kit', label: 'Kitting', phase: 'Production', owner: 'Brandon Browser', checks: ['Kit list printed', 'Parts pulled to kits', 'Kits labeled by assembly', 'Kits staged for assembly'] },
  { key: 'fab', label: 'Fabrication', phase: 'Production', owner: 'Brandon Browser', checks: ['Fit-up complete', 'Welded', 'Ready for weld QC'] },
  { key: 'finish', label: 'Surface Finish', phase: 'Production', owner: 'Jarek Kisler', checks: ['QC: welds inspected before finish', 'Surface prepped and blasted', 'Finish applied', 'QC: finish inspected after'] },
  { key: 'asm', label: 'Assembly', phase: 'Assembly', owner: 'Brandon Browser', checks: ['Frame assembled', 'Drive mounted', 'Purchased parts installed', 'Wiring and hydraulics connected'] },
  { key: 'qc', label: 'QC', phase: 'Assembly', owner: 'Jarek Kisler', checks: ['Test run', 'Dimensions and fit checked', 'Punch list closed', 'QC signed off'] },
  { key: 'fat', label: 'FAT', phase: 'Assembly', owner: 'Jarek Kisler', checks: ['FAT scheduled with customer', 'Run for customer', 'Customer punch list closed', 'Customer signed off'] },
  { key: 'ship', label: 'Ship', phase: 'Ship', owner: 'Brandon Browser', checks: ['Crated', 'Shipping documents complete', 'On the truck'] },
  { key: 'install', label: 'Install', phase: 'Install', owner: 'Shane Kloer', checks: ['Install scheduled with customer', 'Equipment set and anchored', 'Power and utilities connected', 'Startup and run-off', 'Customer sign-off'] },
];
export const PHASES = ['Sales', 'Engineering', 'Production', 'Assembly', 'Ship', 'Install'];
export const stageOf = (key) => STAGES.find((s) => s.key === key);
export const stageIndex = (key) => STAGES.findIndex((s) => s.key === key);

// ---- 3D models (same files the dashboard uses) ----
export const MODELS = {
  BC: { file: 'models/BeltConveyor.glb', name: 'Belt conveyor' },
  SC: { file: 'models/ScrewConveyor.glb', name: 'Screw conveyor' },
  TD: { file: 'models/ToteDumpTwoStage.glb', name: 'Tote dump, two-stage' },
  TS: { file: 'models/ToteDumpSingleStage.glb', name: 'Tote dump, single-stage' },
  HP: { file: 'models/HydraulicPowerUnit.glb', name: 'Hydraulic power unit' },
  HC: { file: 'models/HydraulicCylinder.glb', name: 'Hydraulic cylinder' },
};

// ---- project items (from Pipeline). ship = days from today ----
const it = (site, project, customer, code, desc, at, extra = {}) => ({ site, project, customer, code, desc, at, key: project + '-' + code, type: extra.model || code.slice(0, 2), ...extra });
export const ITEMS = [
  // Nampa
  it('nampa', '19204', 'CTI Wilder', 'BC001', 'Incline belt conveyor', 'asm', { pct: 60, ship: 9, bay: 'Bay 2' }),
  it('nampa', '19204', 'CTI Wilder', 'BC002', 'Flat belt conveyor', 'fab', { pct: 45, ship: 9, bay: 'Bay 1' }),
  it('nampa', '19204', 'CTI Wilder', 'HP002', 'Hydraulic power unit', 'buy', { pct: 70, ship: 12, held: 'Pump on back order from Parker — was due ' + shortDate(-2) }),
  it('nampa', '19349', 'BrucePac Woodburn', 'BC001', 'Flat belt conveyor', 'eng', { pct: 50, ship: 7, held: 'Import failed on revision B — rebuild the release' }),
  it('nampa', '19290', 'CTI Wilder', 'BC001', 'Flat belt conveyor', 'eng', { pct: 35, ship: 48 }),
  it('nampa', '19290', 'CTI Wilder', 'BC003', 'Incline belt conveyor', 'eng', { pct: 10, ship: 48 }),
  it('nampa', '19312', 'BrucePac Woodburn', 'HC001', 'Hydraulic cylinder', 'asm', { pct: 85, ship: 5, bay: 'Bay 4' }),
  it('nampa', '19312', 'BrucePac Woodburn', 'TD001', 'Tote dump', 'fab', { pct: 20, ship: 16, bay: 'Bay 3', model: 'TS' }),
  // Rupert
  it('rupert', '19188', 'BrucePac Woodburn', 'SC002', 'Screw conveyor', 'finish', { pct: 50, ship: 4, bay: 'Surface finish booth' }),
  it('rupert', '19254', 'CTI Wilder', 'TD001', 'Tote dump', 'fab', { pct: 30, ship: 21, bay: 'Bay A' }),
  it('rupert', '19254', 'CTI Wilder', 'BC001', 'Discharge belt conveyor', 'buy', { pct: 40, ship: 21 }),
  it('rupert', '19160', 'BrucePac Woodburn', 'BC001', 'Incline belt conveyor', 'ship', { pct: 33, ship: 2, bay: 'Dock' }),
  it('rupert', '19160', 'BrucePac Woodburn', 'SC001', 'Screw conveyor', 'install', { pct: 40, ship: -5, bay: 'On site · Woodburn, OR' }),
  it('rupert', '19331', 'CTI Wilder', 'SC001', 'Screw conveyor', 'asm', { pct: 25, ship: 13, bay: 'Bay B' }),
];
export const itemByKey = (k) => ITEMS.find((i) => i.key === k);

export const PROJECTS = {
  19204: { customer: 'CTI Wilder', desc: 'Conveyor package', pm: 'Shane Kloer' },
  19349: { customer: 'BrucePac Woodburn', desc: 'Flat belt line', pm: 'Shane Kloer' },
  19290: { customer: 'CTI Wilder', desc: 'Packout conveyors', pm: 'Shane Kloer' },
  19312: { customer: 'BrucePac Woodburn', desc: 'Tote dump station', pm: 'Shane Kloer' },
  19188: { customer: 'BrucePac Woodburn', desc: 'Screw conveyor', pm: 'Shane Kloer' },
  19254: { customer: 'CTI Wilder', desc: 'Tote dump and discharge', pm: 'Shane Kloer' },
  19160: { customer: 'BrucePac Woodburn', desc: 'Incline and screw conveyor', pm: 'Shane Kloer' },
  19331: { customer: 'CTI Wilder', desc: 'Screw conveyor', pm: 'Shane Kloer' },
};

// ---- purchase orders (Receiving and Purchasing share these) ----
// due = days from today. got = received so far.
const L = (id, part, desc, qty, extra = {}) => ({ id, part, desc, qty, got: 0, ...extra });
export const POS = [
  { po: '24131', vendor: 'Baldor', item: '19254-BC001', site: 'rupert', due: 0, lines: [
    L('r1', 'BAL CEM3611T', 'Gearmotor, 2 HP, 1750 RPM, 145TC', 1, { bin: 'Dock 1' }),
    L('r2', 'BAL 34R4FWP', 'Motor rain cover', 1, { bin: 'Dock 1' }) ] },
  { po: '24126', vendor: 'Dodge', item: '19254-BC001', site: 'rupert', due: 1, lines: [
    L('r3', 'DOD 6.5" CD', 'Head pulley, crowned, 6.5" × 26"', 1, { bin: 'Dock 2' }),
    L('r4', 'DOD 6.5" WT', 'Tail pulley, wing, 6.5" × 26"', 1, { bin: 'Dock 2' }),
    L('r5', 'DOD P2B-SC-115', 'Pillow block bearing, 1-15/16"', 4, { bin: 'B-03' }) ] },
  { po: '24118', vendor: 'Parker', item: '19204-HP002', site: 'nampa', due: -2, backorder: true, lines: [
    L('r6', 'PAR PV016R1K1T1', 'Axial piston pump, 16 cc', 1, { bin: 'Dock 2', backorder: true }),
    L('r7', 'PAR D1VW001CN', 'Directional valve, D03', 2, { bin: 'C-07', got: 2 }),
    L('r8', 'PAR 12AT10C', 'Return filter assembly', 1, { bin: 'C-07', got: 1 }) ] },
  { po: '24140', vendor: 'McMaster-Carr', item: '19312-TD001', site: 'nampa', due: 1, lines: [
    L('r9', 'MMC 6338K412', 'Flanged sleeve bearing, 1"', 4, { bin: 'B-11' }),
    L('r10', 'MMC 7779K52', 'Limit switch, roller lever', 2, { bin: 'E-02' }),
    L('r11', 'MMC 91251A540', 'SHCS 3/8-16 × 1-1/4', 24, { bin: 'A-14' }) ] },
  { po: '24122', vendor: 'Fenner Drives', item: '19254-BC001', site: 'rupert', due: 4, lines: [
    L('r12', 'FEN 2PLY-PVC120', 'Belting, 24" × 58 ft, 2-ply PVC', 1, { bin: 'Belt rack' }),
    L('r13', 'FEN CLIPPER 1', 'Belt lacing kit', 1, { bin: 'Belt rack' }) ] },
  { po: '24109', vendor: 'Ryerson', item: 'Stock', site: 'nampa', due: -1, lines: [
    L('r14', 'RYE TS2X2X188', 'Tube 2 × 2 × 3/16, 24 ft', 12, { bin: 'Rack 4', got: 12 }),
    L('r15', 'RYE PL.375-A36', 'Plate 3/8" A36, 48 × 96', 2, { bin: 'Plate rack', got: 2 }) ] },
];

// ---- kits ----
const K = (id, part, desc, qty, bin, extra = {}) => ({ id, part, desc, qty, bin, ...extra });
export const KITS = [
  { item: '19204-BC002', site: 'nampa', need: 3, stage: 'Ready to pull', lines: [
    K('k1', 'BAL CEM3546T', 'Gearmotor, 1 HP', 1, 'Dock 1'),
    K('k2', 'DOD P2B-SC-115', 'Pillow block bearing, 1-15/16"', 4, 'B-03'),
    K('k3', 'MMC 6655K19', 'Return roller, 1.9" SS', 6, 'B-08'),
    K('k4', 'FEN 2PLY-PVC120', 'Belting, 18" × 28 ft', 1, 'Belt rack'),
    K('k5', 'MMC 91251A540', 'SHCS 3/8-16 × 1-1/4', 24, 'A-14'),
    K('k6', 'MMC 4484K9', 'Clamping hanger, 304 SS', 4, 'A-02') ] },
  { item: '19312-TD001', site: 'nampa', need: 6, stage: 'Short 2 parts', short: true, lines: [
    K('k7', 'MMC 6338K412', 'Flanged sleeve bearing, 1"', 4, 'B-11', { missing: 'PO 24140 · due ' + shortDate(1) }),
    K('k8', 'MMC 7779K52', 'Limit switch, roller lever', 2, 'E-02', { missing: 'PO 24140 · due ' + shortDate(1) }),
    K('k9', 'PAR 2H-1.5x12', 'Hydraulic cylinder, 1.5" × 12"', 1, 'C-02'),
    K('k10', 'MMC 91251A540', 'SHCS 3/8-16 × 1-1/4', 16, 'A-14') ] },
  { item: '19254-TD001', site: 'rupert', need: 8, stage: 'Ready to pull', lines: [
    K('k11', 'PAR 2H-2x16', 'Hydraulic cylinder, 2" × 16"', 2, 'R-C1'),
    K('k12', 'DOD F4B-SC-104', 'Flange bearing, 1-1/4"', 4, 'R-B2'),
    K('k13', 'MMC 7779K52', 'Limit switch, roller lever', 2, 'R-E1') ] },
  { item: '19331-SC001', site: 'rupert', need: 2, stage: 'Ready to pull', lines: [
    K('k14', 'BOS F726-40', 'Gear reducer, 40:1', 1, 'R-Dock'),
    K('k15', 'MAR 12H412', 'Hanger bearing, 12" screw', 2, 'R-B4'),
    K('k16', 'MAR CEMA-12-STD', 'Screw flight, 12" × 10 ft', 1, 'R-Flight rack') ] },
];

// ---- outgoing loads (Shipping) ----
export const LOADS = [
  { id: 'L-19160', job: '19160', customer: 'BrucePac Woodburn', site: 'rupert', ship: 2, carrier: 'Flatbed · Northwest Freight', items: [
    { id: 's1', text: '19160-BC001 incline belt conveyor', sub: 'Crate 1 of 2' },
    { id: 's2', text: 'Legs and cross braces', sub: 'Crate 2 of 2' },
    { id: 's3', text: 'Hardware box', sub: 'Bolts, clamps, spare bearings' },
    { id: 's4', text: 'Manuals and drawings', sub: 'Pouch on crate 1' } ] },
  { id: 'L-19188', job: '19188', customer: 'BrucePac Woodburn', site: 'rupert', ship: 4, carrier: 'LTL · Old Dominion', items: [
    { id: 's5', text: '19188-SC002 screw conveyor', sub: 'Crate 1 of 1' },
    { id: 's6', text: 'Inlet and discharge spouts', sub: 'Loose, banded' },
    { id: 's7', text: 'Hardware box', sub: 'Hanger bolts and gaskets' } ] },
  { id: 'L-19312', job: '19312', customer: 'BrucePac Woodburn', site: 'nampa', ship: 5, carrier: 'Customer pickup', items: [
    { id: 's8', text: '19312-HC001 hydraulic cylinder', sub: 'Crate 1 of 1' },
    { id: 's9', text: 'Hoses and fittings', sub: 'Bagged and tagged' } ] },
  { id: 'L-19204', job: '19204', customer: 'CTI Wilder', site: 'nampa', ship: 9, carrier: 'Flatbed · Northwest Freight', items: [
    { id: 's10', text: '19204-BC001 incline belt conveyor', sub: 'Crate 1 of 3' },
    { id: 's11', text: '19204-BC002 flat belt conveyor', sub: 'Crate 2 of 3' },
    { id: 's12', text: '19204-HP002 hydraulic power unit', sub: 'Crate 3 of 3' },
    { id: 's13', text: 'Hardware box', sub: 'Bolts, clamps, spare bearings' } ] },
];

// ---- purchasing lines (what still needs buying, across jobs) ----
// State order: Needs purchasing → RFQ sent → Purchased → Received → Kitted
export const BUY_STATES = ['Needs purchasing', 'RFQ sent', 'Purchased', 'Received', 'Kitted'];
const B = (id, part, desc, qty, vendor, state, extra = {}) => ({ id, part, desc, qty, vendor, state, ...extra });
export const BUY = [
  { item: '19254-BC001', site: 'rupert', needed: 14, lines: [
    B('b1', 'BAL CEM3611T', 'Gearmotor, 2 HP', 1, 'Baldor', 'Purchased', { po: '24131' }),
    B('b2', 'DOD 6.5" CD', 'Head pulley, crowned', 1, 'Dodge', 'Purchased', { po: '24126' }),
    B('b3', 'FEN 2PLY-PVC120', 'Belting, 24" × 58 ft', 1, 'Fenner Drives', 'RFQ sent', { note: 'Sent 3 days ago · no reply' }),
    B('b4', 'MMC 6655K19', 'Return roller, 1.9" SS', 10, 'McMaster-Carr', 'Needs purchasing'),
    B('b5', 'MMC 5388K14', 'Worm-drive clamp', 8, 'McMaster-Carr', 'Needs purchasing'),
    B('b6', 'DOD P2B-SC-115', 'Pillow block bearing, 1-15/16"', 4, 'Dodge', 'Purchased', { po: '24126' }) ] },
  { item: '19204-HP002', site: 'nampa', needed: 5, lines: [
    B('b7', 'PAR PV016R1K1T1', 'Axial piston pump, 16 cc', 1, 'Parker', 'Purchased', { po: '24118', note: 'Back ordered · was due ' + shortDate(-2) }),
    B('b8', 'BAL EM3615T', 'Motor, 3 HP, 182T', 1, 'Baldor', 'Needs purchasing'),
    B('b9', 'MMC 4880K45', 'Hose fitting, 3/4" JIC', 6, 'McMaster-Carr', 'Needs purchasing') ] },
  { item: '19290-BC001', site: 'nampa', needed: 30, lines: [
    B('b10', 'BOS F726-20', 'Gear reducer, 20:1', 1, 'Boston Gear', 'Needs purchasing'),
    B('b11', 'DOD P2B-SC-107', 'Pillow block bearing, 1-7/16"', 4, 'Dodge', 'Needs purchasing'),
    B('b12', 'MMC 6655K19', 'Return roller, 1.9" SS', 8, 'McMaster-Carr', 'Needs purchasing') ] },
];

// ---- change orders ----
export const RATE = 95; // example labor rate for the demo
export const COS = [
  { id: 'CO-0014', item: '19160-SC001', desc: 'Add a 6 ft inlet spout extension to clear the new mixer platform.', hours: 8, mat: 640, status: 'pending', who: '', when: 'Today' },
  { id: 'CO-0013', item: '19188-SC002', desc: 'Change the trough finish from paint to stainless 2B.', hours: 6, mat: 1850, status: 'pending', who: '', when: shortDate(-1) },
  { id: 'CO-0012', item: '19204-BC001', desc: 'Add UHMW sideboards, chamfered, both sides of the transfer.', hours: 6, mat: 450, status: 'signed', who: 'J. Ortiz', when: shortDate(-3) },
  { id: 'CO-0011', item: '19160-BC001', desc: 'Add a belt scraper and catch pan at the head end.', hours: 4, mat: 380, status: 'signed', who: 'D. Harmon', when: shortDate(-8) },
];

// ---- the four demo views ----
// Each view signs in as one person from the dashboard's people list.
// steps = the checklist steps this view works through ([project item, stage, % already checked]).
export const VIEWS = {
  warehouse: { label: 'Warehouse', user: 'Matt Smith', site: 'nampa', tabs: ['recv', 'kit'],
    steps: [['19204-BC002', 'kit', 25], ['19312-TD001', 'kit', 0], ['19254-BC001', 'rec', 50], ['19204-HP002', 'rec', 50], ['19254-TD001', 'kit', 0], ['19331-SC001', 'kit', 75]] },
  field: { label: 'Projects & field', user: 'Shane Kloer', site: 'both', tabs: ['proj', 'co'],
    steps: [['19160-SC001', 'install', 40], ['19290-BC001', 'po', 66], ['19188-SC002', 'install', 0], ['19160-BC001', 'install', 0]] },
  shop: { label: 'Shop', user: 'Brandon Browser', site: 'nampa', tabs: ['fab', 'ship', 'models'],
    steps: [['19204-BC002', 'fab', 45], ['19204-BC001', 'asm', 60], ['19312-HC001', 'asm', 85], ['19312-TD001', 'fab', 20], ['19160-BC001', 'ship', 33], ['19254-TD001', 'fab', 30], ['19331-SC001', 'asm', 25]] },
  purchasing: { label: 'Purchasing', user: 'Amanda Pratt', site: 'both', tabs: ['buy', 'recv'],
    steps: [['19204-HP002', 'buy', 70], ['19254-BC001', 'buy', 40], ['19254-BC001', 'rec', 50], ['19204-HP002', 'rec', 50]] },
};
export const VIEW_ORDER = ['warehouse', 'field', 'shop', 'purchasing'];

// ---- what needs each person (Home → Needs attention) ----
// tone: blue | amber | red | green | grey.  to: where Open goes.
export const QUEUES = {
  warehouse: [
    { id: 'w1', icon: 'recv', title: 'PO 24131 arrives today', sub: 'Baldor · gearmotor for 19254-BC001', status: 'Due today', tone: 'blue', site: 'rupert', to: { screen: 'po', po: '24131' }, ago: '8 min ago' },
    { id: 'w2', icon: 'warn', title: 'Pump still back ordered', sub: 'PO 24118 · Parker · 19204-HP002', status: 'Late', tone: 'red', site: 'nampa', to: { screen: 'po', po: '24118' }, ago: '1 h ago' },
    { id: 'w3', icon: 'kit', title: 'Kit ready to pull', sub: '19204-BC002 · assembly needs it ' + dayWord(3), status: 'Due ' + dayWord(3), tone: 'amber', site: 'nampa', to: { screen: 'kitDetail', kit: '19204-BC002' }, ago: '2 h ago' },
    { id: 'w4', icon: 'kit', title: 'Kit short 2 parts', sub: '19312-TD001 · waiting on PO 24140', status: 'Short', tone: 'amber', site: 'nampa', to: { screen: 'kitDetail', kit: '19312-TD001' }, ago: '3 h ago' },
    { id: 'w5', icon: 'recv', title: 'PO 24126 arrives tomorrow', sub: 'Dodge · pulleys and bearings', status: 'Due ' + dayWord(1), tone: 'blue', site: 'rupert', to: { screen: 'po', po: '24126' }, ago: '5 h ago' },
  ],
  field: [
    { id: 'f1', icon: 'co', title: 'CO-0014 needs a signature', sub: 'BrucePac · inlet spout extension · 19160-SC001', status: 'Needs signature', tone: 'amber', to: { screen: 'co' }, ago: '20 min ago' },
    { id: 'f2', icon: 'wrench', title: 'Startup on site ' + dayWord(2), sub: '19160-SC001 · install checklist 2 of 5', status: 'On site', tone: 'blue', to: { screen: 'item', key: '19160-SC001' }, ago: '1 h ago' },
    { id: 'f3', icon: 'warn', title: '19349-BC001 is on hold', sub: 'Import failed on revision B', status: 'Held', tone: 'red', to: { screen: 'item', key: '19349-BC001' }, ago: '3 h ago' },
    { id: 'f4', icon: 'ship', title: '19204 ships ' + shortDate(9), sub: 'CTI Wilder · BC001 in assembly 60%', status: 'On track', tone: 'green', to: { screen: 'project', project: '19204' }, ago: 'Yesterday' },
  ],
  shop: [
    { id: 's1', icon: 'fab', title: 'Weld 19204-BC002 today', sub: 'Bay 1 · fit-up is done', status: 'Due today', tone: 'blue', site: 'nampa', to: { screen: 'item', key: '19204-BC002' }, ago: '15 min ago' },
    { id: 's2', icon: 'check', title: '19312-HC001 ready for QC soon', sub: 'Bay 4 · assembly 85%', status: 'Ships ' + dayWord(5), tone: 'amber', site: 'nampa', to: { screen: 'item', key: '19312-HC001' }, ago: '1 h ago' },
    { id: 's3', icon: 'ship', title: 'Load 19160 ships ' + dayWord(2), sub: 'Rupert dock · add load photos', status: 'Photos needed', tone: 'amber', site: 'rupert', to: { screen: 'load', load: 'L-19160' }, ago: '2 h ago' },
    { id: 's4', icon: 'cube', title: 'Tote dump in 3D', sub: '19312-TD001 · Bay 3', status: 'New', tone: 'blue', site: 'nampa', to: { screen: 'model', type: 'TS' }, ago: 'Yesterday' },
  ],
  purchasing: [
    { id: 'p1', icon: 'buy', title: '9 lines need purchasing', sub: '3 project items · first needed ' + dayWord(5), status: 'Open', tone: 'blue', to: { screen: 'buy' }, ago: '10 min ago' },
    { id: 'p2', icon: 'warn', title: 'Parker pump back ordered', sub: 'PO 24118 · 19204-HP002 · get a new date', status: 'Late', tone: 'red', to: { screen: 'po', po: '24118' }, ago: '1 h ago' },
    { id: 'p3', icon: 'mail', title: 'RFQ has no reply', sub: 'Fenner Drives · belting for 19254-BC001', status: '3 days', tone: 'amber', to: { screen: 'buy' }, ago: '4 h ago' },
    { id: 'p4', icon: 'recv', title: 'PO 24131 arrives today', sub: 'Baldor · Rupert dock', status: 'Due today', tone: 'blue', to: { screen: 'po', po: '24131' }, ago: '5 h ago' },
  ],
};

// ---- Team activity (Home) ----
export const ACTIVITY = [
  { who: 'Andrew Meimann', text: 'released the BOM', where: '19254-BC001', site: 'rupert', ago: '12 min ago' },
  { who: 'Brandon Browser', text: 'finished fit-up', where: '19204-BC002', site: 'nampa', ago: '40 min ago' },
  { who: 'Amanda Pratt', text: 'sent an RFQ to Fenner Drives', where: '19254-BC001', site: 'rupert', ago: '1 h ago' },
  { who: 'Jarek Kisler', text: 'signed off weld QC', where: '19188-SC002', site: 'rupert', ago: '2 h ago' },
  { who: 'Shane Kloer', text: 'scheduled startup with BrucePac', where: '19160-SC001', site: 'rupert', ago: '3 h ago' },
  { who: 'Matt Smith', text: 'received PO 24109 from Ryerson', where: 'Stock', site: 'nampa', ago: '4 h ago' },
  { who: 'Andrew Meimann', text: 'import failed on revision B', where: '19349-BC001', site: 'nampa', ago: 'Yesterday', warn: true },
  { who: 'Brandon Browser', text: 'moved the tote dump to Bay 3', where: '19312-TD001', site: 'nampa', ago: 'Yesterday' },
];

// ---- time card ----
export const TIME_TASKS = {
  warehouse: [{ item: 'Dock', task: 'Receiving' }, { item: '19204-BC002', task: 'Kitting' }, { item: '19312-TD001', task: 'Kitting' }, { item: 'Shop', task: 'Cleanup / maintenance' }],
  field: [{ item: '19160-SC001', task: 'Install' }, { item: '19160-SC001', task: 'Travel' }, { item: '19204', task: 'Project management' }, { item: 'Office', task: 'General' }],
  shop: [{ item: '19204-BC002', task: 'Fabrication' }, { item: '19312-HC001', task: 'Assembly' }, { item: '19160-BC001', task: 'Ship' }, { item: 'Shop', task: 'Cleanup / maintenance' }],
  purchasing: [{ item: '19254-BC001', task: 'Purchasing' }, { item: '19204-HP002', task: 'Purchasing' }, { item: 'Dock', task: 'Receiving' }, { item: 'Office', task: 'General' }],
};
