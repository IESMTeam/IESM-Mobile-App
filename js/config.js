// Demo settings.
// NOTE: this passcode lives in the page code, so it only hides the screens —
// it is not real security. Fine for fake data; real logins come with the API.
export const PASSCODE = '4376';

// Roles and the tabs each one sees. Every role also gets Home and Time.
export const ROLES = [
  { key: 'warehouse', label: 'Warehouse', tabs: ['receiving', 'kitting'] },
  { key: 'field', label: 'Field / PM', tabs: ['projects', 'changeOrders'] },
  { key: 'shop', label: 'Shop', tabs: ['fabrication', 'shipping'] },
  { key: 'purchasing', label: 'Purchasing', tabs: ['purchasing'] },
];

export const TAB_LABELS = {
  home: 'Home',
  time: 'Time',
  receiving: 'Receiving',
  kitting: 'Kitting',
  projects: 'Projects',
  changeOrders: 'Change Orders',
  fabrication: 'Fabrication',
  shipping: 'Shipping',
  purchasing: 'Purchasing',
};
