// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────
export const MOCK_USER = {
  name: "Ganesh Kumar",
  role: "Devotee",
  avatarColor: "#D4720A",
};

// ─────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────
export const TRANSACTION_TABS = [
  "All Transactions",
  "Completed",
  "Pending",
  "Failed",
] as const;

export const TRANSACTION_COLUMNS = [
  { label: "TEMPLE & SEVA", w: "w-[30%]" },
  { label: "TRANSACTION ID", w: "w-[20%]" },
  { label: "DATE & TIME", w: "w-[16%]" },
  { label: "AMOUNT", w: "w-[12%]" },
  { label: "STATUS", w: "w-[12%]" },
  { label: "ACTION", w: "w-[10%]" },
];

export const MOCK_TRANSACTIONS = [
  {
    id: "1",
    templeName: "Sree Padmanabhaswamy",
    sevaName: "Annadhanam",
    templeIcon: "🛕",
    transactionId: "TXN2024031500123",
    date: "Mar 15, 2024",
    time: "10:30 AM",
    amount: 3001,
    status: "Completed" as const,
  },
  {
    id: "2",
    templeName: "Kashi Vishwanath",
    sevaName: "Archana",
    templeIcon: "✨",
    transactionId: "TXN2024030800456",
    date: "Mar 08, 2024",
    time: "08:15 AM",
    amount: 1101,
    status: "Completed" as const,
  },
  {
    id: "3",
    templeName: "Tirupati Balaji",
    sevaName: "Deepa Seva",
    templeIcon: "🔥",
    transactionId: "TXN2024030200789",
    date: "Mar 02, 2024",
    time: "06:45 PM",
    amount: 501,
    status: "Pending" as const,
  },
  {
    id: "4",
    templeName: "Meenakshi Amman",
    sevaName: "Maintenance",
    templeIcon: "🏛️",
    transactionId: "TXN2024022400111",
    date: "Feb 24, 2024",
    time: "11:20 AM",
    amount: 2501,
    status: "Completed" as const,
  },
];

// ─────────────────────────────────────────
// DONATION
// ─────────────────────────────────────────
export const PRESET_AMOUNTS = [101, 201, 301, 501, 1001];
export const DEFAULT_SELECTED_AMOUNT = 101;

export const MOCK_TEMPLE = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Sree Padmanabhaswamy Temple",
  location: "Thiruvananthapuram, Kerala",
  imageGradient: "linear-gradient(160deg, #6B2D0E 0%, #3B1208 100%)",
};

export const MOCK_SEVA = {
  name: "Annadanam",
  icon: "🍛",
  description:
    "Provide sacred food to devotees. Your contribution helps feed thousands of pilgrims daily at the temple premises.",
};

export const DEFAULT_OFFERING_DATE = "March 15, 2024";

// ─────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────
export const STAT_CARDS = [
  {
    label: "TOTAL DONATED",
    value: "₹15,250",
    icon: "heart",
  },
  {
    label: "TEMPLES VISITED",
    value: "8",
    icon: "temple",
  },
  {
    label: "SEVAS DONE",
    value: "12",
    icon: "flame",
  },
];

export const MONTHLY_DATA = [
  { month: "Oct", amount: 1800 },
  { month: "Nov", amount: 2400 },
  { month: "Dec", amount: 1600 },
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 2800 },
  { month: "Mar", amount: 3450 },
];

export const TOP_TEMPLES_DATA = [
  { name: "Sree Padmanabhaswamy", percent: 45, color: "#C8773A" },
  { name: "Tirupati Balaji", percent: 30, color: "#B85C20" },
  { name: "Kashi Vishwanath", percent: 25, color: "#C8773A" },
];

export const SEVA_DISTRIBUTION_DATA = [
  { name: "Archana", percent: 35, color: "#C8773A" },
  { name: "Annadhanam", percent: 25, color: "#E8A44A" },
  { name: "Deepa Seva", percent: 20, color: "#8B4513" },
  { name: "Other", percent: 20, color: "#C4B49A" },
];

export const ACTIVE_DEVICES = [
  {
    id: "1",
    name: "MacBook Pro (Web)",
    location: "Bangalore, India",
    lastActive: "Current Session",
    isCurrent: true,
    icon: "mobile",
  },
  {
    id: "2",
    name: "iPhone 15 Pro (App)",
    location: "Bangalore, India",
    lastActive: "Active now",
    isCurrent: false,
    icon: "mobile",
  },
  {
    id: "3",
    name: "Samsung Galaxy S23",
    location: "Mumbai, India",
    lastActive: "Last active 2 days ago",
    isCurrent: false,
    icon: "mobile",
  },
];

// ─────────────────────────────────────────
// COMMUNICATION & SUPPORT
// ─────────────────────────────────────────
export const SUPPORT_CHANNELS = [
  {
    id: "1",
    title: "Email Support",
    detail: "support@devote.app",
    buttonLabel: "Write to us",
    icon: "email",
  },
  {
    id: "2",
    title: "Phone Support",
    detail: "+91 8590869895",
    buttonLabel: "Call now",
    icon: "phone",
  },
  {
    id: "3",
    title: "Live Chat",
    detail: "Available 9 AM - 6 PM",
    buttonLabel: "Start chat",
    icon: "chat",
  },
];

export const SUPPORT_FORM_DEFAULT = {
  name: "Ganesh Kumar",
  email: "ganesh.devotee@example.com",
};
