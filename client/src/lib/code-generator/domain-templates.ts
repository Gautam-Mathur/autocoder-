// Domain Templates - Comprehensive functional templates for various industries
// Each template generates a complete working application with backend, database, and frontend

export interface DomainTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  features: string[];
  models: string[];
  prompt: string;
  color: string;
}

export const domainTemplates: DomainTemplate[] = [
  // === SECURITY & IT ===
  {
    id: "vapt",
    name: "VAPT Dashboard",
    icon: "shield",
    description: "Vulnerability Assessment & Penetration Testing platform",
    category: "Security",
    features: ["Vulnerability scanning", "CVE tracking", "Risk scoring", "Remediation tracking", "Security reports"],
    models: ["Target", "Vulnerability", "Scan", "Report"],
    prompt: "Create a fully functional VAPT (Vulnerability Assessment and Penetration Testing) dashboard with database. Include target management, vulnerability tracking with severity levels (critical/high/medium/low), scanning simulation, and security reports. Login: admin/admin123",
    color: "#ef4444"
  },
  {
    id: "siem",
    name: "SIEM Platform",
    icon: "monitor",
    description: "Security Information & Event Management system",
    category: "Security",
    features: ["Real-time monitoring", "Log aggregation", "Alert management", "Threat detection", "Incident response"],
    models: ["LogSource", "Event", "Alert", "Incident", "Rule"],
    prompt: "Create a fully functional SIEM (Security Information and Event Management) dashboard with database. Include log source management, event monitoring, alert rules, threat detection with severity levels, and incident response tracking. Login: admin/admin123",
    color: "#7c3aed"
  },
  
  // === FINANCE & BANKING ===
  {
    id: "banking",
    name: "Banking System",
    icon: "landmark",
    description: "Core banking with accounts, transfers, and transactions",
    category: "Finance",
    features: ["Account management", "Fund transfers", "Transaction history", "Balance tracking", "Statement generation"],
    models: ["Account", "Transaction", "Transfer", "Beneficiary"],
    prompt: "Create a fully functional banking system with database. Include multiple account types (savings/checking/credit), fund transfers between accounts, transaction history with categories, balance tracking, and statement generation. Secure login: admin/admin123",
    color: "#10b981"
  },
  {
    id: "finance",
    name: "Finance Dashboard",
    icon: "trending-up",
    description: "Financial tracking and reporting platform",
    category: "Finance",
    features: ["Budget tracking", "Expense management", "Financial reports", "Analytics dashboard", "Forecasting"],
    models: ["Budget", "Expense", "Category", "Report"],
    prompt: "Create a fully functional finance dashboard with database. Include budget creation, expense tracking with categories, income management, financial reports with charts, and budget vs actual analysis. Login: admin/admin123",
    color: "#059669"
  },
  {
    id: "invoice",
    name: "Invoicing System",
    icon: "file-text",
    description: "Invoice generation and payment tracking",
    category: "Finance",
    features: ["Invoice creation", "Client management", "Payment tracking", "Due date reminders", "PDF generation"],
    models: ["Client", "Invoice", "InvoiceItem", "Payment"],
    prompt: "Create a fully functional invoicing system with database. Include client management, invoice creation with line items, payment tracking (paid/pending/overdue), tax calculation, and invoice status management. Login: admin/admin123",
    color: "#0891b2"
  },
  
  // === HR & WORKFORCE ===
  {
    id: "hrms",
    name: "HRMS",
    icon: "users",
    description: "Human Resource Management System",
    category: "HR",
    features: ["Employee directory", "Attendance tracking", "Leave management", "Payroll", "Performance reviews"],
    models: ["Employee", "Department", "Attendance", "Leave", "Payroll"],
    prompt: "Create a fully functional HRMS (Human Resource Management System) with database. Include employee directory with departments, attendance tracking, leave management (apply/approve/reject), payroll processing, and performance reviews. Login: admin/admin123",
    color: "#6366f1"
  },
  {
    id: "payroll",
    name: "Payroll System",
    icon: "dollar-sign",
    description: "Employee salary and payroll management",
    category: "HR",
    features: ["Salary management", "Payslip generation", "Tax calculation", "Deductions", "Payment history"],
    models: ["Employee", "Salary", "Payslip", "Deduction", "Bonus"],
    prompt: "Create a fully functional payroll system with database. Include employee salary setup, automatic payslip generation, tax calculations, deductions management, bonus tracking, and payment history. Login: admin/admin123",
    color: "#8b5cf6"
  },
  {
    id: "recruitment",
    name: "Recruitment Portal",
    icon: "briefcase",
    description: "Job posting and applicant tracking system",
    category: "HR",
    features: ["Job postings", "Applicant tracking", "Interview scheduling", "Resume management", "Hiring pipeline"],
    models: ["Job", "Applicant", "Interview", "Application"],
    prompt: "Create a fully functional recruitment portal with database. Include job posting with requirements, applicant tracking through stages (applied/screening/interview/offer/hired), interview scheduling, and hiring pipeline visualization. Login: admin/admin123",
    color: "#a855f7"
  },
  
  // === HEALTHCARE ===
  {
    id: "healthcare",
    name: "Healthcare System",
    icon: "heart-pulse",
    description: "Patient management and medical records",
    category: "Healthcare",
    features: ["Patient records", "Appointments", "Prescriptions", "Medical history", "Doctor scheduling"],
    models: ["Patient", "Appointment", "MedicalRecord", "Prescription"],
    prompt: "Create a fully functional healthcare management system with database. Include patient registration with medical history, appointment scheduling, prescription management, medical records (diagnosis/lab results), and doctor availability. Login: admin/admin123",
    color: "#0ea5e9"
  },
  {
    id: "pharmacy",
    name: "Pharmacy Management",
    icon: "pill",
    description: "Medicine inventory and prescription tracking",
    category: "Healthcare",
    features: ["Medicine inventory", "Prescription filling", "Stock alerts", "Expiry tracking", "Sales"],
    models: ["Medicine", "Prescription", "Sale", "Supplier"],
    prompt: "Create a fully functional pharmacy management system with database. Include medicine inventory with stock levels, prescription filling and tracking, expiry date monitoring, low stock alerts, supplier management, and daily sales tracking. Login: admin/admin123",
    color: "#14b8a6"
  },
  
  // === E-COMMERCE & RETAIL ===
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    icon: "shopping-cart",
    description: "Online store with products and orders",
    category: "Retail",
    features: ["Product catalog", "Shopping cart", "Order management", "Inventory", "Customer accounts"],
    models: ["Product", "Order", "OrderItem", "Customer", "Category"],
    prompt: "Create a fully functional e-commerce store with database. Include product catalog with categories, shopping cart, order processing (pending/paid/shipped/delivered), inventory management, and customer order history. Login: admin/admin123",
    color: "#f59e0b"
  },
  {
    id: "inventory",
    name: "Inventory Management",
    icon: "package",
    description: "Stock and warehouse management system",
    category: "Retail",
    features: ["Stock tracking", "Warehouse management", "Purchase orders", "Stock alerts", "Reports"],
    models: ["Product", "Warehouse", "StockMovement", "PurchaseOrder"],
    prompt: "Create a fully functional inventory management system with database. Include product stock tracking, multiple warehouse support, stock in/out movements, purchase orders, reorder level alerts, and inventory reports. Login: admin/admin123",
    color: "#f97316"
  },
  {
    id: "pos",
    name: "POS System",
    icon: "credit-card",
    description: "Point of Sale for retail stores",
    category: "Retail",
    features: ["Product lookup", "Cart management", "Payment processing", "Receipt generation", "Daily reports"],
    models: ["Product", "Sale", "SaleItem", "Payment", "Cashier"],
    prompt: "Create a fully functional Point of Sale (POS) system with database. Include product barcode/search lookup, cart management, multiple payment methods (cash/card), receipt generation, shift management, and daily sales reports. Login: admin/admin123",
    color: "#ec4899"
  },
  
  // === ENTERPRISE ===
  {
    id: "erp",
    name: "ERP System",
    icon: "building-2",
    description: "Enterprise Resource Planning dashboard",
    category: "Enterprise",
    features: ["Module dashboard", "Sales", "Purchases", "Inventory", "Finance", "HR"],
    models: ["Module", "SalesOrder", "PurchaseOrder", "Invoice"],
    prompt: "Create a fully functional ERP (Enterprise Resource Planning) dashboard with database. Include modules for sales orders, purchase orders, inventory, basic finance (invoices/payments), and HR (employees/attendance). Unified dashboard with key metrics. Login: admin/admin123",
    color: "#3b82f6"
  },
  {
    id: "crm",
    name: "CRM System",
    icon: "contact",
    description: "Customer Relationship Management",
    category: "Enterprise",
    features: ["Contact management", "Lead tracking", "Deal pipeline", "Activity log", "Email integration"],
    models: ["Contact", "Lead", "Deal", "Activity", "Company"],
    prompt: "Create a fully functional CRM (Customer Relationship Management) system with database. Include contact/company management, lead tracking with sources, deal pipeline (stages: lead/qualified/proposal/negotiation/won/lost), activity logging, and sales dashboard. Login: admin/admin123",
    color: "#2563eb"
  },
  {
    id: "project",
    name: "Project Management",
    icon: "kanban",
    description: "Task and project tracking system",
    category: "Enterprise",
    features: ["Project tracking", "Task management", "Team assignment", "Timeline", "Progress reports"],
    models: ["Project", "Task", "Team", "Milestone", "Comment"],
    prompt: "Create a fully functional project management system with database. Include project creation with timelines, task management (todo/in-progress/review/done), team member assignment, milestone tracking, and project progress reports. Login: admin/admin123",
    color: "#1d4ed8"
  },
  
  // === EDUCATION ===
  {
    id: "lms",
    name: "Learning Management",
    icon: "graduation-cap",
    description: "Online courses and student tracking",
    category: "Education",
    features: ["Course creation", "Student enrollment", "Progress tracking", "Quizzes", "Certificates"],
    models: ["Course", "Lesson", "Student", "Enrollment", "Quiz"],
    prompt: "Create a fully functional Learning Management System (LMS) with database. Include course creation with lessons, student enrollment, progress tracking, quiz creation and grading, and certificate generation on completion. Login: admin/admin123",
    color: "#f59e0b"
  },
  {
    id: "school",
    name: "School Management",
    icon: "school",
    description: "Student and class administration",
    category: "Education",
    features: ["Student records", "Class management", "Attendance", "Grades", "Timetable"],
    models: ["Student", "Class", "Subject", "Attendance", "Grade"],
    prompt: "Create a fully functional school management system with database. Include student registration, class/section management, subject assignments, attendance tracking, grade entry and report cards, and class timetable. Login: admin/admin123",
    color: "#eab308"
  },
  
  // === COMMUNICATION ===
  {
    id: "sms",
    name: "SMS Management",
    icon: "message-square",
    description: "Bulk SMS and messaging platform",
    category: "Communication",
    features: ["Contact lists", "Bulk messaging", "Templates", "Delivery reports", "Scheduling"],
    models: ["Contact", "ContactGroup", "Message", "Template", "Campaign"],
    prompt: "Create a fully functional SMS management system with database. Include contact management with groups, message templates, bulk SMS campaigns, delivery status tracking (sent/delivered/failed), scheduled messaging, and usage reports. Login: admin/admin123",
    color: "#22c55e"
  },
  {
    id: "email",
    name: "Email Campaign",
    icon: "mail",
    description: "Email marketing and newsletter system",
    category: "Communication",
    features: ["Subscriber lists", "Email templates", "Campaign management", "Analytics", "Automation"],
    models: ["Subscriber", "List", "Campaign", "Template", "EmailLog"],
    prompt: "Create a fully functional email campaign system with database. Include subscriber management with lists, email template builder, campaign creation and scheduling, open/click tracking, unsubscribe handling, and campaign analytics. Login: admin/admin123",
    color: "#16a34a"
  },
  
  // === LOGISTICS ===
  {
    id: "logistics",
    name: "Logistics Tracking",
    icon: "truck",
    description: "Shipment and delivery management",
    category: "Logistics",
    features: ["Shipment tracking", "Route management", "Driver assignment", "Delivery status", "Fleet management"],
    models: ["Shipment", "Route", "Driver", "Vehicle", "Delivery"],
    prompt: "Create a fully functional logistics tracking system with database. Include shipment creation with tracking numbers, route planning, driver/vehicle assignment, delivery status updates (picked/in-transit/delivered), and fleet management. Login: admin/admin123",
    color: "#ea580c"
  },
  {
    id: "fleet",
    name: "Fleet Management",
    icon: "car",
    description: "Vehicle and driver management system",
    category: "Logistics",
    features: ["Vehicle registry", "Driver management", "Maintenance logs", "Fuel tracking", "Trip history"],
    models: ["Vehicle", "Driver", "Maintenance", "FuelLog", "Trip"],
    prompt: "Create a fully functional fleet management system with database. Include vehicle registry with details, driver assignment, maintenance scheduling and logs, fuel consumption tracking, trip history, and vehicle availability status. Login: admin/admin123",
    color: "#dc2626"
  },
  
  // === HOSPITALITY ===
  {
    id: "hotel",
    name: "Hotel Booking",
    icon: "bed",
    description: "Room reservation and guest management",
    category: "Hospitality",
    features: ["Room inventory", "Booking management", "Guest records", "Check-in/out", "Billing"],
    models: ["Room", "RoomType", "Booking", "Guest", "Payment"],
    prompt: "Create a fully functional hotel booking system with database. Include room types and inventory, reservation management with date selection, guest registration, check-in/check-out process, room availability calendar, and billing with payment tracking. Login: admin/admin123",
    color: "#0891b2"
  },
  {
    id: "restaurant",
    name: "Restaurant POS",
    icon: "utensils",
    description: "Table and order management for restaurants",
    category: "Hospitality",
    features: ["Menu management", "Table booking", "Order taking", "Kitchen display", "Billing"],
    models: ["MenuItem", "Table", "Order", "OrderItem", "Bill"],
    prompt: "Create a fully functional restaurant POS system with database. Include menu management with categories, table layout and status, order taking with modifiers, kitchen order display, table billing with split bill option, and daily sales summary. Login: admin/admin123",
    color: "#0d9488"
  },
  
  // === SUPPORT ===
  {
    id: "helpdesk",
    name: "Help Desk",
    icon: "headphones",
    description: "Support ticket management system",
    category: "Support",
    features: ["Ticket creation", "Priority levels", "Assignment", "SLA tracking", "Knowledge base"],
    models: ["Ticket", "Category", "Agent", "Reply", "Article"],
    prompt: "Create a fully functional help desk system with database. Include ticket creation with categories, priority levels (low/medium/high/critical), agent assignment, ticket status workflow (open/in-progress/resolved/closed), SLA tracking, and basic knowledge base. Login: admin/admin123",
    color: "#8b5cf6"
  },
  {
    id: "feedback",
    name: "Feedback System",
    icon: "message-circle",
    description: "Customer feedback and survey platform",
    category: "Support",
    features: ["Feedback forms", "Surveys", "Ratings", "Analytics", "Response management"],
    models: ["Survey", "Question", "Response", "Feedback"],
    prompt: "Create a fully functional feedback system with database. Include survey creation with multiple question types (rating/text/multiple choice), feedback submission, response analytics with charts, sentiment tracking, and response management. Login: admin/admin123",
    color: "#a855f7"
  }
];

// Get templates by category
export function getTemplatesByCategory(): Record<string, DomainTemplate[]> {
  const categories: Record<string, DomainTemplate[]> = {};
  domainTemplates.forEach(template => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  });
  return categories;
}

// Get template by ID
export function getTemplateById(id: string): DomainTemplate | undefined {
  return domainTemplates.find(t => t.id === id);
}

// Get all category names
export function getCategories(): string[] {
  return Array.from(new Set(domainTemplates.map(t => t.category)));
}
