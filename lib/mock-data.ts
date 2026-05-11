export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  paymentTerms: string;
  gstNumber: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  isActive: boolean;
}

export interface AssetRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedByUserId?: string;
  department: string;
  assetType: string;
  quantity: number;
  estimatedCost: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Ordered' | 'Delivered' | 'Installed';
  priority: 'Low' | 'Medium' | 'High';
  approvedBy?: string;
  createdDate: string;
  approvalDate?: string;
  dueDate: string;
}

export interface PurchaseOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  vendorId: string;
  department: string;
  departmentHead: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Delivered';
  signatures: {
    departmentHead?: { name: string; date: string };
    companyHead?: { name: string; date: string };
    ceo?: { name: string; date: string };
  };
  createdDate: string;
  createdBy: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  title: string;
  vendor: string;
  department: string;
  totalAmount: number;
  status: 'Requested' | 'Ordered' | 'Delivered' | 'Installed';
  createdDate: string;
  orderDate?: string;
  deliveryDate?: string;
  installedDate?: string;
  orderedBy: string;
}

export type UserRole = 'master_admin' | 'admin' | 'hr' | 'it' | 'employee';

export interface Permission {
  manageUsers: boolean;
  manageDepartments: boolean;
  manageVendors: boolean;
  managePurchases: boolean;
  createPurchaseOrder: boolean;
  reportIssue: boolean;
  handleAssetHandover: boolean;
  approveAssetRequests: boolean;
  viewReports: boolean;
  manageAssets: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  salary?: number;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: Permission;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Desktop' | 'Laptop' | 'Server' | 'Printer' | 'Monitor' | 'Router' | 'Switch' | 'USB HDD/SSD' | 'UPS' | 'TV' | 'Network Rack' | 'Power Cable' | 'VGA Cable' | 'HDMI Cable' | 'D to HDMI Cable' | 'USB Keyboard' | 'WL Keyboard' | 'USB Mouse' | 'WL Mouse';
  serialNumber: string;
  manufacturer: string;
  model: string;
  processor?: string;
  ram?: string;
  storage?: string;
  osInstalled?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  location: string;
  owner: string;
  assignedToUserId?: string;
  ipAddress?: string;
  macAddress?: string;
  assetTag: string;
  department: string;
  cost: number;
  notes: string;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: 'CCTV' | 'Router' | 'Switch' | 'Access Point';
  ipAddress: string;
  macAddress: string;
  location: string;
  status: 'Online' | 'Offline' | 'Error';
  lastSeen: string;
  firmwareVersion: string;
  department: string;
  assignedToUserId?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  assetId: string;
  assignedTo: string;
  createdByUserId?: string;
  createdDate: string;
  dueDate: string;
  department: string;
}

export interface AssetHandover {
  id: string;
  employeeId: string;
  employeeUserId?: string;
  employeeName: string;
  employeeRole: string;
  resignationDate: string;
  department: string;
  assetIds: string[];
  assetDetails: { id: string; name: string; type: string; status: 'Pending' | 'Returned' }[];
  handoverStatus: 'Pending' | 'InProgress' | 'Approved' | 'Completed';
  itApproval?: { approvedBy: string; approvalDate: string };
  hrApproval?: { approvedBy: string; approvalDate: string };
  notes?: string;
  createdDate: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  location: string;
  assetCount: number;
  deviceCount: number;
  issueCount: number;
  employees?: string[];
}

// Mock Assets
export const mockAssets: Asset[] = [
  {
    id: 'AST-001',
    name: 'Praveen Yadav Laptop',
    type: 'Laptop',
    serialNumber: 'SN-12345-001',
    manufacturer: 'Dell',
    model: 'XPS 15',
    processor: 'Intel Core i7-13700H',
    ram: '32 GB',
    storage: '512 GB SSD',
    osInstalled: 'Windows 11 Pro',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    status: 'Active',
    location: 'Office A - Desk 1',
    owner: 'John Doe',
    assignedToUserId: 'USR-003',
    ipAddress: '192.168.1.10',
    macAddress: '00:1A:2B:3C:4D:5E',
    assetTag: 'IT-2023-001',
    department: 'IT Support',
    cost: 1500,
    notes: 'Latest model with high performance',
  },
  {
    id: 'AST-002',
    name: 'Server Room Desktop',
    type: 'Desktop',
    serialNumber: 'SN-12345-002',
    manufacturer: 'HP',
    model: 'EliteDesk 800',
    processor: 'Intel Core i5-12400',
    ram: '16 GB',
    storage: '256 GB SSD',
    osInstalled: 'Windows Server 2022',
    purchaseDate: '2022-06-20',
    warrantyExpiry: '2025-06-20',
    status: 'Active',
    location: 'Server Room',
    owner: 'IT Admin',
    assignedToUserId: 'USR-001',
    ipAddress: '192.168.1.20',
    macAddress: '00:1A:2B:3C:4D:5F',
    assetTag: 'IT-2023-002',
    department: 'Infrastructure',
    cost: 1200,
    notes: 'Runs critical services',
  },
  {
    id: 'AST-003',
    name: 'Conference Room TV',
    type: 'TV',
    serialNumber: 'SN-12345-003',
    manufacturer: 'LG',
    model: '65UP550',
    purchaseDate: '2023-03-10',
    warrantyExpiry: '2025-03-10',
    status: 'Active',
    location: 'Conference Room B',
    owner: 'Shared',
    assignedToUserId: 'USR-002',
    assetTag: 'IT-2023-003',
    department: 'Operations',
    cost: 450,
    notes: '4K resolution display',
  },
  {
    id: 'AST-004',
    name: 'Network Server',
    type: 'Server',
    serialNumber: 'SN-12345-004',
    manufacturer: 'Lenovo',
    model: 'ThinkSystem SR645',
    processor: 'AMD EPYC 7313',
    ram: '128 GB',
    storage: '2 TB SSD',
    osInstalled: 'Ubuntu Server 22.04',
    purchaseDate: '2021-11-05',
    warrantyExpiry: '2024-11-05',
    status: 'Maintenance',
    location: 'Data Center',
    owner: 'Infrastructure Team',
    ipAddress: '192.168.1.50',
    macAddress: '00:1A:2B:3C:4D:60',
    assetTag: 'IT-2023-004',
    department: 'Infrastructure',
    cost: 5000,
    notes: 'Under scheduled maintenance',
  },
  {
    id: 'AST-005',
    name: 'Anand Pandey Laptop',
    type: 'Laptop',
    serialNumber: 'SN-12345-005',
    manufacturer: 'Apple',
    model: 'MacBook Pro 14"',
    processor: 'Apple M3 Max',
    ram: '36 GB',
    storage: '1 TB SSD',
    osInstalled: 'macOS Sonoma',
    purchaseDate: '2023-09-01',
    warrantyExpiry: '2026-09-01',
    status: 'Active',
    location: 'Office B - Desk 5',
    owner: 'Sarah Johnson',
    ipAddress: '192.168.1.15',
    macAddress: '00:1A:2B:3C:4D:61',
    assetTag: 'IT-2023-005',
    department: 'Design',
    cost: 2000,
    notes: 'Video editing workstation',
  },
];

// Mock Network Devices
export const mockNetworkDevices: NetworkDevice[] = [
  {
    id: 'NET-001',
    name: 'Entrance CCTV',
    type: 'CCTV',
    ipAddress: '192.168.1.100',
    macAddress: '00:2A:3B:4C:5D:6E',
    location: 'Main Entrance',
    status: 'Online',
    lastSeen: '2024-04-09T10:30:00Z',
    firmwareVersion: '3.2.1',
    department: 'Security',
  },
  {
    id: 'NET-002',
    name: 'Main Router',
    type: 'Router',
    ipAddress: '192.168.1.1',
    macAddress: '00:2A:3B:4C:5D:6F',
    location: 'Server Room',
    status: 'Online',
    lastSeen: '2024-04-09T10:35:00Z',
    firmwareVersion: '2.1.4',
    department: 'Infrastructure',
  },
  {
    id: 'NET-003',
    name: 'Core Switch',
    type: 'Switch',
    ipAddress: '192.168.1.2',
    macAddress: '00:2A:3B:4C:5D:70',
    location: 'Server Room',
    status: 'Online',
    lastSeen: '2024-04-09T10:35:00Z',
    firmwareVersion: '4.1.2',
    department: 'Infrastructure',
  },
  {
    id: 'NET-004',
    name: 'Parking CCTV',
    type: 'CCTV',
    ipAddress: '192.168.1.101',
    macAddress: '00:2A:3B:4C:5D:71',
    location: 'Parking Lot',
    status: 'Offline',
    lastSeen: '2024-04-08T15:20:00Z',
    firmwareVersion: '3.1.9',
    department: 'Security',
  },
];

// Mock Issues
export const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Laptop Not Connecting to Network',
    description: 'John&apos;s laptop is unable to connect to the corporate WiFi',
    status: 'Open',
    priority: 'High',
    assetId: 'AST-001',
    assignedTo: 'Mike Chen',
    createdDate: '2024-04-08',
    dueDate: '2024-04-09',
    department: 'IT Support',
  },
  {
    id: 'ISS-002',
    title: 'Server Hard Drive Warning',
    description: 'Hard drive is showing SMART warnings',
    status: 'In Progress',
    priority: 'High',
    assetId: 'AST-004',
    assignedTo: 'Lisa Park',
    createdDate: '2024-04-05',
    dueDate: '2024-04-12',
    department: 'Infrastructure',
  },
  {
    id: 'ISS-003',
    title: 'Display Issue',
    description: 'Conference room TV flickering occasionally',
    status: 'Open',
    priority: 'Medium',
    assetId: 'AST-003',
    assignedTo: 'Mike Chen',
    createdDate: '2024-04-07',
    dueDate: '2024-04-11',
    department: 'Operations',
  },
  {
    id: 'ISS-004',
    title: 'Parking Camera Offline',
    description: 'Parking lot CCTV is not responding to ping',
    status: 'Open',
    priority: 'Medium',
    assetId: 'NET-004',
    assignedTo: 'David Smith',
    createdDate: '2024-04-08',
    dueDate: '2024-04-10',
    department: 'Security',
  },
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 'DEPT-001',
    name: 'IT Support',
    manager: 'Robert Williams',
    email: 'robert@company.com',
    phone: '+1-555-0101',
    location: 'Building A',
    assetCount: 1,
    deviceCount: 0,
    issueCount: 1,
  },
  {
    id: 'DEPT-002',
    name: 'Infrastructure',
    manager: 'Emma Davis',
    email: 'emma@company.com',
    phone: '+1-555-0102',
    location: 'Data Center',
    assetCount: 2,
    deviceCount: 2,
    issueCount: 1,
  },
  {
    id: 'DEPT-003',
    name: 'Design',
    manager: 'Sarah Johnson',
    email: 'sarah@company.com',
    phone: '+1-555-0103',
    location: 'Building B',
    assetCount: 1,
    deviceCount: 0,
    issueCount: 0,
  },
  {
    id: 'DEPT-004',
    name: 'Operations',
    manager: 'Mike Chen',
    email: 'mike@company.com',
    phone: '+1-555-0104',
    location: 'Building A',
    assetCount: 1,
    deviceCount: 0,
    issueCount: 1,
  },
  {
    id: 'DEPT-005',
    name: 'Security',
    manager: 'David Smith',
    email: 'david@company.com',
    phone: '+1-555-0105',
    location: 'Main Office',
    assetCount: 0,
    deviceCount: 2,
    issueCount: 1,
  },
];

// Permission defaults by role
const getRolePermissions = (role: UserRole): Permission => {
  const basePermissions: Record<UserRole, Permission> = {
    master_admin: {
      manageUsers: true,
      manageDepartments: true,
      manageVendors: true,
      managePurchases: true,
      createPurchaseOrder: true,
      reportIssue: true,
      handleAssetHandover: true,
      approveAssetRequests: true,
      viewReports: true,
      manageAssets: true,
    },
    admin: {
      manageUsers: false,
      manageDepartments: true,
      manageVendors: true,
      managePurchases: true,
      createPurchaseOrder: true,
      reportIssue: true,
      handleAssetHandover: true,
      approveAssetRequests: true,
      viewReports: true,
      manageAssets: true,
    },
    hr: {
      manageUsers: true,
      manageDepartments: false,
      manageVendors: false,
      managePurchases: false,
      createPurchaseOrder: false,
      reportIssue: true,
      handleAssetHandover: true,
      approveAssetRequests: false,
      viewReports: true,
      manageAssets: false,
    },
    it: {
      manageUsers: false,
      manageDepartments: false,
      manageVendors: false,
      managePurchases: false,
      createPurchaseOrder: false,
      reportIssue: true,
      handleAssetHandover: true,
      approveAssetRequests: true,
      viewReports: true,
      manageAssets: true,
    },
    employee: {
      manageUsers: false,
      manageDepartments: false,
      manageVendors: false,
      managePurchases: false,
      createPurchaseOrder: false,
      reportIssue: true,
      handleAssetHandover: true,
      approveAssetRequests: false,
      viewReports: false,
      manageAssets: false,
    },
  };
  return basePermissions[role];
};

// Mock Users
export const mockUsers: UserProfile[] = [
  {
    id: 'USR-001',
    email: 'admin@company.com',
    name: 'Admin User',
    phone: '+1-555-0001',
    address: '123 Main Street, New York, NY 10001',
    salary: 120000,
    role: 'master_admin',
    department: 'IT Support',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-04-09',
    permissions: getRolePermissions('master_admin'),
  },
  {
    id: 'USR-002',
    email: 'hr@company.com',
    name: 'HR Manager',
    phone: '+1-555-0002',
    address: '456 Oak Avenue, New York, NY 10002',
    salary: 85000,
    role: 'hr',
    department: 'Operations',
    isActive: true,
    createdAt: '2024-01-05',
    lastLogin: '2024-04-08',
    permissions: getRolePermissions('hr'),
  },
  {
    id: 'USR-003',
    email: 'it-lead@company.com',
    name: 'IT Lead',
    phone: '+1-555-0003',
    address: '789 Pine Road, New York, NY 10003',
    salary: 95000,
    role: 'it',
    department: 'IT Support',
    isActive: true,
    createdAt: '2024-02-01',
    lastLogin: '2024-04-09',
    permissions: getRolePermissions('it'),
  },
  {
    id: 'USR-004',
    email: 'sarah.design@company.com',
    name: 'Sarah Design',
    phone: '+1-555-0004',
    address: '321 Elm Street, New York, NY 10004',
    salary: 75000,
    role: 'employee',
    department: 'Design',
    isActive: true,
    createdAt: '2024-02-15',
    lastLogin: '2024-04-07',
    permissions: getRolePermissions('employee'),
  },
  {
    id: 'USR-005',
    email: 'mike.ops@company.com',
    name: 'Mike Operations',
    phone: '+1-555-0005',
    address: '654 Maple Drive, New York, NY 10005',
    salary: 70000,
    role: 'employee',
    department: 'Operations',
    isActive: false,
    createdAt: '2024-03-01',
    lastLogin: '2024-03-20',
    permissions: getRolePermissions('employee'),
  },
];

// Mock Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'VEN-001',
    name: 'Dell Technologies',
    contactPerson: 'John Smith',
    email: 'sales@dell.com',
    phone: '+1-800-DELL-123',
    address: '1 Dell Way, Round Rock, TX 78682',
    website: 'www.dell.com',
    paymentTerms: 'Net 30',
    gstNumber: '36AABCD1234K1Z0',
    bankDetails: {
      accountName: 'Dell Technologies India',
      accountNumber: '1234567890123456',
      ifscCode: 'SBIN0000123',
      bankName: 'State Bank of India',
    },
    isActive: true,
  },
  {
    id: 'VEN-002',
    name: 'HP Inc',
    contactPerson: 'Sarah Johnson',
    email: 'sales@hp.com',
    phone: '+1-800-HP-INVENT',
    address: '1501 Page Mill Road, Palo Alto, CA',
    website: 'www.hp.com',
    paymentTerms: 'Net 45',
    gstNumber: '36AAHCP1234H1Z0',
    bankDetails: {
      accountName: 'HP India Sales PVT',
      accountNumber: '9876543210987654',
      ifscCode: 'ICIC0000456',
      bankName: 'ICICI Bank',
    },
    isActive: true,
  },
  {
    id: 'VEN-003',
    name: 'Cisco Systems',
    contactPerson: 'Mike Chen',
    email: 'sales@cisco.com',
    phone: '+1-408-526-4000',
    address: '170 West Tasman Drive, San Jose, CA',
    website: 'www.cisco.com',
    paymentTerms: 'Net 60',
    gstNumber: '36AACCI1234C1Z0',
    bankDetails: {
      accountName: 'Cisco Systems India',
      accountNumber: '5555666677778888',
      ifscCode: 'HDFC0000789',
      bankName: 'HDFC Bank',
    },
    isActive: true,
  },
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    poNumber: 'PO/2024/0001',
    vendor: 'Dell Technologies',
    vendorId: 'VEN-001',
    department: 'IT Support',
    departmentHead: 'Admin User',
    items: [
      {
        description: 'Dell OptiPlex 7090 Desktop',
        quantity: 5,
        unitPrice: 1200,
        totalPrice: 6000,
      },
      {
        description: 'Monitor Dell P2423DE 24"',
        quantity: 5,
        unitPrice: 300,
        totalPrice: 1500,
      },
    ],
    subtotal: 7500,
    tax: 1350,
    totalAmount: 8850,
    status: 'Approved',
    signatures: {
      departmentHead: { name: 'Admin User', date: '2024-04-05' },
      companyHead: { name: 'CEO Name', date: '2024-04-06' },
    },
    createdDate: '2024-04-04',
    createdBy: 'USR-001',
    notes: 'Urgent order for office setup',
  },
];

// Mock Asset Handovers
export const mockAssetHandovers: AssetHandover[] = [
  {
    id: 'HO-001',
    employeeId: 'USR-005',
    employeeName: 'Mike Operations',
    employeeRole: 'Employee',
    resignationDate: '2024-04-15',
    department: 'Operations',
    assetIds: ['AST-001', 'AST-003'],
    assetDetails: [
      { id: 'AST-001', name: 'HP Laptop', type: 'Laptop', status: 'Returned' },
      { id: 'AST-003', name: 'Network Switch', type: 'Switch', status: 'Pending' },
    ],
    handoverStatus: 'InProgress',
    itApproval: { approvedBy: 'IT Lead', approvalDate: '2024-04-10' },
    createdDate: '2024-04-08',
    notes: 'Employee leaving company',
  },
];

// Mock Asset Requests
export const mockAssetRequests: AssetRequest[] = [
  {
    id: 'REQ-001',
    title: 'New Laptops for Design Team',
    description: 'Need 5 high-performance laptops for design team',
    requestedBy: 'Sarah Johnson',
    department: 'Design',
    assetType: 'Laptop',
    quantity: 5,
    estimatedCost: 10000,
    status: 'Approved',
    priority: 'High',
    approvedBy: 'Admin User',
    createdDate: '2024-04-01',
    approvalDate: '2024-04-02',
    dueDate: '2024-04-15',
  },
  {
    id: 'REQ-002',
    title: 'Network Switch Replacement',
    description: 'Replace aging network switch in office B',
    requestedBy: 'Mike Chen',
    department: 'Infrastructure',
    assetType: 'Network Switch',
    quantity: 1,
    estimatedCost: 2500,
    status: 'Pending',
    priority: 'Medium',
    createdDate: '2024-04-08',
    dueDate: '2024-04-22',
  },
];

// Mock Purchases
export const mockPurchases: Purchase[] = [
  {
    id: 'PUR-001',
    title: 'Laptop Purchase - Design Team',
    vendor: 'Dell Technologies',
    department: 'Design',
    totalAmount: 10000,
    status: 'Delivered',
    createdDate: '2024-04-02',
    orderDate: '2024-04-03',
    deliveryDate: '2024-04-10',
    installedDate: '2024-04-12',
    orderedBy: 'Admin User',
  },
  {
    id: 'PUR-002',
    title: 'Network Equipment',
    vendor: 'Cisco Systems',
    department: 'Infrastructure',
    totalAmount: 5000,
    status: 'Ordered',
    createdDate: '2024-04-05',
    orderDate: '2024-04-06',
    orderedBy: 'Department Manager',
  },
];

// Dashboard Statistics
export function getDashboardStats() {
  return {
    totalAssets: mockAssets.length,
    activeAssets: mockAssets.filter(a => a.status === 'Active').length,
    assetsNeedingMaintenance: mockAssets.filter(a => a.status === 'Maintenance').length,
    totalNetworkDevices: mockNetworkDevices.length,
    onlineDevices: mockNetworkDevices.filter(d => d.status === 'Online').length,
    openIssues: mockIssues.filter(i => i.status === 'Open').length,
    inProgressIssues: mockIssues.filter(i => i.status === 'In Progress').length,
    resolvedIssues: mockIssues.filter(i => i.status === 'Resolved').length,
    totalDepartments: mockDepartments.length,
    totalCompanies: mockDepartments.length,
  };
}

// Asset distribution by type
export function getAssetDistribution() {
  const distribution: Record<string, number> = {};
  mockAssets.forEach(asset => {
    distribution[asset.type] = (distribution[asset.type] || 0) + 1;
  });
  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
  }));
}

// Recent issues
export function getRecentIssues() {
  return mockIssues
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);
}
