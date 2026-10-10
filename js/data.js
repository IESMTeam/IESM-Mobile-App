// Sample data from the IESM App design canvases. Nothing here comes from the real API.
// Job/project = number (19204). Project item = number + item code (19204-BC001).

export const ROLES = {
  warehouse: {
    label: 'Warehouse', tabs: ['recv', 'kit'],
    notes: [
      { id: 'n1', title: 'PO 24118 is late', sub: 'Boston Gear · due yesterday', kind: 'warn', to: { screen: 'job', dept: 'recv', jobId: '24118' } },
      { id: 'n2', title: 'Parts in for 19204-BC001', sub: 'Ready to kit', kind: 'info', to: { screen: 'job', dept: 'kit', jobId: '19204-BC001' } },
      { id: 'n3', title: 'PO 56582-17782 arrives today', sub: 'McMaster-Carr · 2 lines', kind: 'info', to: { screen: 'job', dept: 'recv', jobId: '56582-17782' } },
    ],
    jobs: [{ item: '19204-BC001', task: 'Kitting' }, { item: 'Dock', task: 'Receiving' }, { item: '19349-BC001', task: 'Kitting' }, { item: 'Shop', task: 'Cleanup / maintenance' }],
  },
  field: {
    label: 'Projects & field', tabs: ['proj', 'co'],
    notes: [
      { id: 'n1', title: 'CO-0013 needs a signature', sub: 'BrucePac · move the e-stop', kind: 'warn', to: { screen: 'co' } },
      { id: 'n2', title: '19204-BC001 is kitted', sub: 'Ready to build', kind: 'info', to: { screen: 'item', projNum: '19204', itemKey: '19204-BC001' } },
      { id: 'n3', title: '19349 drawings released', sub: 'BrucePac Woodburn', kind: 'info', to: { screen: 'project', projNum: '19349' } },
    ],
    jobs: [{ item: '19188-SC001', task: 'Field install' }, { item: '19188-SC001', task: 'Travel' }, { item: '19204', task: 'Project management' }, { item: 'Office', task: 'General' }],
  },
  shop: {
    label: 'Shop', tabs: ['fab', 'ship'],
    notes: [
      { id: 'n1', title: '19204-BC002 released to fab', sub: 'Frame drawings are ready', kind: 'info', to: { screen: 'job', dept: 'fab', jobId: '19204-BC002' } },
      { id: 'n2', title: '19204 ships Nov 14', sub: 'Add load photos before it leaves', kind: 'warn', to: { screen: 'job', dept: 'ship', jobId: 'S-19204' } },
    ],
    jobs: [{ item: '19204-BC002', task: 'Fabrication' }, { item: '19204-BC002', task: 'Welding' }, { item: '19204', task: 'Shipping / loading' }, { item: 'Shop', task: 'Cleanup / maintenance' }],
  },
  purchasing: {
    label: 'Purchasing', tabs: ['buy'],
    notes: [
      { id: 'n1', title: '19204-HP002 needed Oct 20', sub: '4 parts still to order', kind: 'warn', to: { screen: 'job', dept: 'buy', jobId: 'B-19204-HP002' } },
      { id: 'n2', title: 'BOM released for 19349-BC001', sub: '2 parts to order', kind: 'info', to: { screen: 'job', dept: 'buy', jobId: 'B-19349-BC001' } },
    ],
    jobs: [{ item: '19204-HP002', task: 'Purchasing' }, { item: '19349-BC001', task: 'Purchasing' }, { item: 'Office', task: 'General' }, { item: 'Dock', task: 'Receiving' }],
  },
};

// Order and icon colors for the view picker
export const ROLE_ORDER = ['warehouse', 'field', 'shop', 'purchasing'];

export const STEPS = ['Configured', 'Released', 'Generated', 'Purchased', 'Kitted', 'Built', 'Shipped'];

export const PROJECTS = [
  { num: '19204', customer: 'CTI Wilder', desc: 'Conveyor package', pm: 'Ronnie Sechrist', ship: 'Ships Nov 14', phase: 'Production', site: 'Nampa',
    items: [{ code: 'BC001', desc: 'Incline belt conveyor', stage: 5 }, { code: 'BC002', desc: 'Flat belt conveyor', stage: 3 }, { code: 'HP002', desc: 'Hydraulic power unit', stage: 2 }] },
  { num: '19349', customer: 'BrucePac Woodburn', desc: 'Flat belt line', pm: 'Ronnie Sechrist', ship: 'Ships Dec 5', phase: 'Engineering', site: 'Nampa',
    items: [{ code: 'BC001', desc: 'Flat belt conveyor', stage: 3 }, { code: 'BC002', desc: 'Transfer conveyor', stage: 1 }] },
  { num: '19188', customer: 'BrucePac Woodburn', desc: 'Screw conveyor', pm: 'Andrew Meimann', ship: 'Installing now', phase: 'Install', site: 'Rupert',
    items: [{ code: 'SC001', desc: 'Screw conveyor, 12 in', stage: 7 }] },
];

export const RATE = 95; // example labor rate for the demo
export const CO_ITEMS = ['19204-BC001', '19204-BC002', '19204-HP002', '19349-BC001'];

const L = (id, text, sub) => ({ id, text, sub });

// Each area is just a list of jobs, and each job is just a checklist.
export const DEPTS = [
  { key: 'recv', name: 'Receiving', verb: 'received', hint: 'Check off what came in on each PO.',
    jobs: [
      { id: '56582-17782', name: 'PO 56582-17782', sub: 'McMaster-Carr · for 19204-BC001', tag: 'Due today', lines: [
        L('a1', '4 × Clamping hanger, 304 SS', '4484K9 · bin A-02'),
        L('a2', '3 × Worm-drive clamp', '5388K14 · bin A-03')] },
      { id: '24118', name: 'PO 24118', sub: 'Boston Gear · for 19204-HP002', tag: '1 day late', late: true, lines: [
        L('c1', '1 × Gear reducer, 40:1', 'F726-40 · Dock 2'),
        L('c2', '2 × Pillow block bearing, 2"', 'P2B-SC-200 · bin B-03')] },
      { id: '24102', name: 'PO 24102', sub: 'Baldor · for 19349-BC001', tag: 'Due Oct 12', lines: [
        L('b1', '1 × Motor, 3 HP, 182T frame', 'EM3615T · Dock 1')] },
    ] },
  { key: 'kit', name: 'Kitting', verb: 'pulled', hint: 'Check off each part as you pull it into the kit.',
    jobs: [
      { id: '19204-BC001', name: '19204-BC001', sub: 'Incline belt conveyor · CTI Wilder', tag: 'Ready', lines: [
        L('k1', '24 × SHCS 3/8-16 × 1-1/4', '91251A540 · bin A-14'),
        L('k2', '1 × Gear reducer, 40:1', 'F726-40 · Dock 2'),
        L('k3', '2 × Pillow block bearing, 2"', 'P2B-SC-200 · bin B-03'),
        L('k4', '4 × Clamping hanger, 304 SS', '4484K9 · bin A-02')] },
      { id: '19349-BC001', name: '19349-BC001', sub: 'Flat belt conveyor · BrucePac', tag: 'Waiting on 1 part', late: true, lines: [
        L('k5', '1 × Motor, 3 HP, 182T frame', 'EM3615T · not received yet'),
        L('k6', '16 × SHCS 3/8-16 × 1-1/4', '91251A540 · bin A-14'),
        L('k7', '4 × Flanged sleeve bearing, 1"', '6338K412 · bin B-11')] },
    ] },
  { key: 'fab', name: 'Fabrication', verb: 'done', hint: 'Check off each piece when it is cut, welded and ready.',
    jobs: [
      { id: '19204-BC002', name: '19204-BC002', sub: 'Flat belt conveyor frame · CTI Wilder', tag: 'Released', lines: [
        L('f1', '2 × Side frame weldment', 'Tube 2×2×3/16 · DWG 19204-BC002-100'),
        L('f2', '6 × Cross member', 'Tube 2×2×3/16 · DWG 19204-BC002-110'),
        L('f3', '4 × Leg set', 'Tube 2×2×3/16 · DWG 19204-BC002-120'),
        L('f4', '2 × Bearing mount plate', 'Plate 3/8" A36 · DWG 19204-BC002-130')] },
      { id: '19349-BC001-F', name: '19349-BC001', sub: 'Flat belt conveyor frame · BrucePac', tag: 'Released', lines: [
        L('f5', '2 × Side frame weldment', 'DWG 19349-BC001-100'),
        L('f6', '8 × Cross member', 'DWG 19349-BC001-110')] },
    ] },
  { key: 'ship', name: 'Shipping', verb: 'loaded', photos: true, hint: 'Check off what is on the truck and add photos of the load.',
    jobs: [
      { id: 'S-19204', name: '19204 · CTI Wilder', sub: 'Ships Nov 14 · Nampa', tag: 'Nov 14', lines: [
        L('s1', 'Incline belt conveyor (BC001)', 'Crate 1 of 3'),
        L('s2', 'Flat belt conveyor (BC002)', 'Crate 2 of 3'),
        L('s3', 'Hydraulic power unit (HP002)', 'Crate 3 of 3'),
        L('s4', 'Hardware box', 'Bolts, clamps, spare bearings'),
        L('s5', 'Manuals and drawings', 'In the pouch on crate 1')] },
      { id: 'S-19349', name: '19349 · BrucePac Woodburn', sub: 'Ships Dec 5 · Nampa', tag: 'Dec 5', lines: [
        L('s6', 'Flat belt conveyor (BC001)', 'Crate 1 of 2'),
        L('s7', 'Transfer conveyor (BC002)', 'Crate 2 of 2'),
        L('s8', 'Hardware box', 'Bolts and clamps')] },
    ] },
  { key: 'buy', name: 'Purchasing', verb: 'ordered', hint: 'Check off parts once they are ordered. POs are made on the dashboard.',
    jobs: [
      { id: 'B-19204-HP002', name: '19204-HP002', sub: 'Hydraulic power unit · 4 to order', tag: 'Needed Oct 20', lines: [
        L('p1', '1 × Hydraulic pump, 10 GPM', 'Motion Industries'),
        L('p2', '1 × Reservoir, 20 gal', 'Motion Industries'),
        L('p3', '1 × Pressure relief valve', 'Motion Industries'),
        L('p4', '6 × Hose fitting, 3/4" JIC', 'McMaster-Carr')] },
      { id: 'B-19349-BC001', name: '19349-BC001', sub: 'Flat belt conveyor · 2 to order', tag: 'Needed Nov 3', lines: [
        L('p5', '1 × Belt, 24" × 42 ft', 'Belt supplier'),
        L('p6', '2 × Pulley lagging kit', 'McMaster-Carr')] },
    ] },
];

// Starting state for the things people check off / write up during the demo
export function startingData() {
  return {
    checks: { '19204-BC001': { k1: 'Andrew · 8:12 AM' }, 'S-19204': { s1: 'Ronnie · Yesterday' } },
    photos: { 'S-19204': [null] },          // null = sample placeholder tile, otherwise an image URL
    itemPhotos: { '19188-SC001': [null, null] },
    finished: {},
    cos: [
      { id: 'CO-0012', item: '19204-BC001', desc: 'Add a 10 ft section of side guard rail at the transfer point.', hours: 6, mat: 450, status: 'signed', who: 'J. Ortiz', when: 'Oct 7' },
      { id: 'CO-0013', item: '19349-BC001', desc: 'Move the e-stop to the operator side and run new conduit.', hours: 3, mat: 120, status: 'pending', who: '', when: 'Oct 8' },
    ],
  };
}
