// Fake demo data. Nothing here comes from the real API.
// Job = number (19204). Project item = number + item code (19204-BC001).

export const initialData = {
  notifications: [
    { id: 'n1', roles: ['warehouse'], title: 'PO 24-1187 arriving today', body: 'McMaster-Carr · 4 lines for 19204', time: '8:05 AM', unread: true },
    { id: 'n2', roles: ['warehouse'], title: 'Kit ready to pull', body: '19204-BC001 is released for kitting', time: '7:40 AM', unread: true },
    { id: 'n3', roles: ['field'], title: 'Change order needs signature', body: 'CO-19188-02 · Add spray bar', time: 'Yesterday', unread: true },
    { id: 'n4', roles: ['field'], title: 'Install starts Monday', body: '19188 · Snake River Foods', time: 'Yesterday', unread: false },
    { id: 'n5', roles: ['shop'], title: 'Weld due today', body: '19204-BC002 frame weld', time: '7:15 AM', unread: true },
    { id: 'n6', roles: ['shop'], title: 'Load ships Friday', body: '19188 · Load 1 of 2', time: 'Yesterday', unread: false },
    { id: 'n7', roles: ['purchasing'], title: 'BOM released', body: '19211-BC001 · 12 lines need purchasing', time: '9:12 AM', unread: true },
    { id: 'n8', roles: ['purchasing'], title: 'RFQ overdue', body: 'Motion Industries · no reply in 3 days', time: 'Yesterday', unread: true },
    { id: 'n9', roles: ['all'], title: 'Timesheet reminder', body: 'Submit last week by noon Monday', time: 'Fri', unread: false },
  ],

  jobs: [
    { number: '19188', customer: 'Snake River Foods', site: 'Twin Falls, ID', pm: 'Dana K.', status: 'Install', items: ['19188-BC001', '19188-BC002'] },
    { number: '19204', customer: 'Magic Valley Dairy', site: 'Jerome, ID', pm: 'Dana K.', status: 'Fabrication', items: ['19204-BC001', '19204-BC002'] },
    { number: '19211', customer: 'Treasure Valley Potato', site: 'Nampa, ID', pm: 'Chris M.', status: 'Purchasing', items: ['19211-BC001'] },
  ],

  timeTasks: ['Design', 'Engineering', 'Project Management', 'Programming', 'Purchasing', 'Kitting', 'Pre-fab', 'Welding', 'Assembly', 'Machining', 'Surface Finish', 'Media Blast', 'Electrical', 'Controls', 'Install'],

  timeEntries: [
    { id: 't1', item: '19204-BC002', task: 'Welding', hours: 3.5 },
  ],

  receiving: [
    {
      po: '24-1187', vendor: 'McMaster-Carr', job: '19204', due: 'Today',
      lines: [
        { id: 'r1', part: 'MMC 4484K9', desc: 'Flange bearing, 1-7/16"', qty: 4, got: 0 },
        { id: 'r2', part: 'MMC 6655K19', desc: 'Return roller, 1.9" SS', qty: 12, got: 0 },
        { id: 'r3', part: 'MMC 91251A540', desc: 'SHCS 3/8-16 x 1"', qty: 50, got: 0 },
        { id: 'r4', part: 'MMC 8702K24', desc: 'UHMW sheet, 3/8"', qty: 2, got: 0 },
      ],
    },
    {
      po: '24-1190', vendor: 'Motion Industries', job: '19204', due: 'Tomorrow',
      lines: [
        { id: 'r5', part: 'NORD SK 9012.1', desc: 'Helical bevel gearbox', qty: 1, got: 0 },
        { id: 'r6', part: 'BALDOR 2HP TEFC', desc: '2 HP motor, 1800 RPM', qty: 1, got: 0 },
      ],
    },
  ],

  kits: [
    {
      item: '19204-BC001', desc: 'Belt conveyor, 24" x 20\'', area: 'Rack B3',
      parts: [
        { id: 'k1', part: 'MMC 4484K9', desc: 'Flange bearing', qty: 4, done: false },
        { id: 'k2', part: 'MMC 6655K19', desc: 'Return roller', qty: 6, done: false },
        { id: 'k3', part: 'BELT-24-PVC', desc: 'PVC belt, 24" x 44\'', qty: 1, done: false },
        { id: 'k4', part: 'NORD SK 9012.1', desc: 'Gearbox', qty: 1, done: false },
        { id: 'k5', part: 'HW-KIT-A', desc: 'Hardware bag A', qty: 1, done: false },
      ],
    },
    {
      item: '19204-BC002', desc: 'Belt conveyor, 18" x 12\'', area: 'Rack B4',
      parts: [
        { id: 'k6', part: 'MMC 4484K9', desc: 'Flange bearing', qty: 4, done: false },
        { id: 'k7', part: 'BELT-18-PVC', desc: 'PVC belt, 18" x 28\'', qty: 1, done: false },
      ],
    },
  ],

  installChecks: {
    '19188': [
      { id: 'p1', text: 'Site walk with customer', done: true },
      { id: 'p2', text: 'Confirm floor anchors / layout', done: true },
      { id: 'p3', text: 'Set conveyors and level', done: false },
      { id: 'p4', text: 'Track belt and test run', done: false },
      { id: 'p5', text: 'Customer walkthrough and sign-off', done: false },
    ],
    '19204': [
      { id: 'p6', text: 'Pre-install site visit', done: false },
      { id: 'p7', text: 'Confirm power drops', done: false },
    ],
    '19211': [
      { id: 'p8', text: 'Kickoff meeting', done: true },
    ],
  },

  changeOrders: [
    { id: 'CO-19188-01', job: '19188', title: 'Extend BC002 by 4 ft', amount: 3850, status: 'Signed', signedBy: 'J. Alvarez' },
    { id: 'CO-19188-02', job: '19188', title: 'Add spray bar', amount: 1240, status: 'Needs signature', signedBy: null },
  ],

  fabrication: [
    {
      item: '19204-BC002', desc: 'Belt conveyor, 18" x 12\'', due: 'Today',
      ops: [
        { id: 'f1', op: 'Laser cut', done: true },
        { id: 'f2', op: 'Bending', done: true },
        { id: 'f3', op: 'Welding', done: false },
        { id: 'f4', op: 'Passivate', done: false },
        { id: 'f5', op: 'Assembly', done: false },
      ],
    },
    {
      item: '19204-BC001', desc: 'Belt conveyor, 24" x 20\'', due: 'Wed',
      ops: [
        { id: 'f6', op: 'Laser cut', done: true },
        { id: 'f7', op: 'Bending', done: false },
        { id: 'f8', op: 'Welding', done: false },
        { id: 'f9', op: 'Media blast', done: false },
        { id: 'f10', op: 'Assembly', done: false },
      ],
    },
  ],

  loads: [
    {
      id: 'L-19188-1', job: '19188', name: 'Load 1 of 2', ships: 'Friday', carrier: 'Customer pickup', shipped: false, photos: [],
      items: [
        { id: 's1', text: '19188-BC001 conveyor', done: false },
        { id: 's2', text: 'Legs and cross braces (8)', done: false },
        { id: 's3', text: 'Hardware box', done: false },
      ],
    },
    {
      id: 'L-19188-2', job: '19188', name: 'Load 2 of 2', ships: 'Next Tue', carrier: 'LTL', shipped: false, photos: [],
      items: [
        { id: 's4', text: '19188-BC002 conveyor', done: false },
        { id: 's5', text: 'Control panel', done: false },
      ],
    },
  ],

  // Purchasing states: Needs purchasing → RFQ sent → Purchased → Received → Kitted
  purchasing: [
    {
      item: '19211-BC001', job: '19211',
      lines: [
        { id: 'b1', part: 'MMC 4484K9', desc: 'Flange bearing', qty: 4, vendor: 'McMaster-Carr', state: 'Needs purchasing' },
        { id: 'b2', part: 'NORD SK 9012.1', desc: 'Gearbox', qty: 1, vendor: 'Motion Industries', state: 'RFQ sent' },
        { id: 'b3', part: 'BELT-24-PVC', desc: 'PVC belt, 24" x 44\'', qty: 1, vendor: 'Belt supplier', state: 'Needs purchasing' },
        { id: 'b4', part: 'MMC 6655K19', desc: 'Return roller', qty: 8, vendor: 'McMaster-Carr', state: 'Needs purchasing' },
      ],
    },
    {
      item: '19204-BC001', job: '19204',
      lines: [
        { id: 'b5', part: 'BALDOR 2HP TEFC', desc: '2 HP motor', qty: 1, vendor: 'Motion Industries', state: 'Purchased' },
        { id: 'b6', part: 'MMC 8702K24', desc: 'UHMW sheet, 3/8"', qty: 2, vendor: 'McMaster-Carr', state: 'Needs purchasing' },
      ],
    },
  ],
};
