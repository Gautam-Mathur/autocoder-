import { GenerationLearningEngine } from '../../server/modules/generation-learning-engine.ts';

const DOMAIN_KNOWLEDGE: Record<string, {
  entities: Array<{ name: string; fields: Record<string, string>; recommended: string[] }>;
  kpis: string[];
  modules: string[];
  workflows: Array<{ entity: string; states: string[]; transitions: Array<{ from: string; to: string; action: string }> }>;
  relationships: Record<string, string[]>;
}> = {
  'ecommerce': {
    entities: [
      { name: 'Product', fields: { id: 'serial', name: 'text', description: 'text', price: 'decimal', sku: 'text', stock: 'integer', categoryId: 'integer', imageUrl: 'text', status: 'enum(active,draft,archived)', weight: 'decimal', createdAt: 'timestamp' }, recommended: ['id', 'name', 'description', 'price', 'sku', 'stock', 'categoryId', 'imageUrl', 'status'] },
      { name: 'Category', fields: { id: 'serial', name: 'text', slug: 'text', description: 'text', parentId: 'integer', imageUrl: 'text', sortOrder: 'integer' }, recommended: ['id', 'name', 'slug', 'description', 'parentId'] },
      { name: 'Order', fields: { id: 'serial', userId: 'integer', status: 'enum(pending,processing,shipped,delivered,cancelled,refunded)', total: 'decimal', subtotal: 'decimal', tax: 'decimal', shippingCost: 'decimal', shippingAddress: 'text', paymentMethod: 'text', paymentStatus: 'enum(pending,paid,failed,refunded)', trackingNumber: 'text', notes: 'text', createdAt: 'timestamp', updatedAt: 'timestamp' }, recommended: ['id', 'userId', 'status', 'total', 'subtotal', 'tax', 'shippingAddress', 'paymentStatus', 'createdAt'] },
      { name: 'OrderItem', fields: { id: 'serial', orderId: 'integer', productId: 'integer', quantity: 'integer', unitPrice: 'decimal', totalPrice: 'decimal' }, recommended: ['id', 'orderId', 'productId', 'quantity', 'unitPrice', 'totalPrice'] },
      { name: 'Customer', fields: { id: 'serial', email: 'text', firstName: 'text', lastName: 'text', phone: 'text', address: 'text', city: 'text', state: 'text', zipCode: 'text', country: 'text', createdAt: 'timestamp' }, recommended: ['id', 'email', 'firstName', 'lastName', 'phone', 'address'] },
      { name: 'Cart', fields: { id: 'serial', userId: 'integer', sessionId: 'text', status: 'enum(active,abandoned,converted)', expiresAt: 'timestamp', createdAt: 'timestamp' }, recommended: ['id', 'userId', 'sessionId', 'status'] },
      { name: 'CartItem', fields: { id: 'serial', cartId: 'integer', productId: 'integer', quantity: 'integer', addedAt: 'timestamp' }, recommended: ['id', 'cartId', 'productId', 'quantity'] },
      { name: 'Review', fields: { id: 'serial', productId: 'integer', userId: 'integer', rating: 'integer', title: 'text', comment: 'text', verified: 'boolean', createdAt: 'timestamp' }, recommended: ['id', 'productId', 'userId', 'rating', 'comment', 'verified'] },
      { name: 'Coupon', fields: { id: 'serial', code: 'text', type: 'enum(percentage,fixed)', value: 'decimal', minOrderAmount: 'decimal', maxUses: 'integer', usedCount: 'integer', expiresAt: 'timestamp', active: 'boolean' }, recommended: ['id', 'code', 'type', 'value', 'expiresAt', 'active'] },
      { name: 'Payment', fields: { id: 'serial', orderId: 'integer', amount: 'decimal', method: 'enum(credit_card,debit_card,paypal,bank_transfer)', status: 'enum(pending,completed,failed,refunded)', transactionId: 'text', createdAt: 'timestamp' }, recommended: ['id', 'orderId', 'amount', 'method', 'status', 'transactionId'] },
    ],
    kpis: ['Total Revenue', 'Orders Today', 'Average Order Value', 'Conversion Rate', 'Cart Abandonment Rate', 'Products Sold'],
    modules: ['Products', 'Orders', 'Customers', 'Analytics', 'Inventory', 'Promotions'],
    workflows: [
      { entity: 'Order', states: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], transitions: [{ from: 'pending', to: 'processing', action: 'Process' }, { from: 'processing', to: 'shipped', action: 'Ship' }, { from: 'shipped', to: 'delivered', action: 'Deliver' }, { from: 'pending', to: 'cancelled', action: 'Cancel' }, { from: 'delivered', to: 'refunded', action: 'Refund' }] },
    ],
    relationships: { Order: ['belongsTo Customer', 'hasMany OrderItem'], OrderItem: ['belongsTo Order', 'belongsTo Product'], Cart: ['belongsTo Customer', 'hasMany CartItem'], CartItem: ['belongsTo Cart', 'belongsTo Product'], Review: ['belongsTo Product', 'belongsTo Customer'], Product: ['belongsTo Category', 'hasMany Review', 'hasMany OrderItem'], Payment: ['belongsTo Order'] },
  },

  'healthcare': {
    entities: [
      { name: 'Patient', fields: { id: 'serial', firstName: 'text', lastName: 'text', dateOfBirth: 'date', gender: 'enum(male,female,other)', email: 'text', phone: 'text', address: 'text', insuranceId: 'text', bloodType: 'text', allergies: 'text', emergencyContact: 'text', emergencyPhone: 'text', createdAt: 'timestamp' }, recommended: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone', 'insuranceId'] },
      { name: 'Provider', fields: { id: 'serial', firstName: 'text', lastName: 'text', specialty: 'text', licenseNumber: 'text', email: 'text', phone: 'text', departmentId: 'integer', schedule: 'json', bio: 'text' }, recommended: ['id', 'firstName', 'lastName', 'specialty', 'licenseNumber', 'departmentId'] },
      { name: 'Appointment', fields: { id: 'serial', patientId: 'integer', providerId: 'integer', dateTime: 'timestamp', duration: 'integer', type: 'enum(consultation,follow_up,emergency,checkup)', status: 'enum(scheduled,confirmed,in_progress,completed,cancelled,no_show)', reason: 'text', notes: 'text', roomNumber: 'text' }, recommended: ['id', 'patientId', 'providerId', 'dateTime', 'duration', 'type', 'status', 'reason'] },
      { name: 'MedicalRecord', fields: { id: 'serial', patientId: 'integer', providerId: 'integer', date: 'date', diagnosis: 'text', symptoms: 'text', treatment: 'text', notes: 'text', vitals: 'json', followUpDate: 'date' }, recommended: ['id', 'patientId', 'providerId', 'date', 'diagnosis', 'symptoms', 'treatment'] },
      { name: 'Prescription', fields: { id: 'serial', patientId: 'integer', providerId: 'integer', medication: 'text', dosage: 'text', frequency: 'text', duration: 'text', refills: 'integer', status: 'enum(active,completed,cancelled)', pharmacy: 'text', prescribedDate: 'date' }, recommended: ['id', 'patientId', 'providerId', 'medication', 'dosage', 'frequency', 'status'] },
      { name: 'Department', fields: { id: 'serial', name: 'text', description: 'text', floor: 'integer', headId: 'integer', phone: 'text' }, recommended: ['id', 'name', 'description', 'floor'] },
      { name: 'Insurance', fields: { id: 'serial', patientId: 'integer', provider: 'text', policyNumber: 'text', groupNumber: 'text', coverageType: 'text', expirationDate: 'date', copay: 'decimal' }, recommended: ['id', 'patientId', 'provider', 'policyNumber', 'coverageType', 'expirationDate'] },
      { name: 'Billing', fields: { id: 'serial', patientId: 'integer', appointmentId: 'integer', amount: 'decimal', insuranceCovered: 'decimal', patientOwes: 'decimal', status: 'enum(pending,billed,paid,overdue)', dueDate: 'date', paidDate: 'date' }, recommended: ['id', 'patientId', 'amount', 'status', 'dueDate'] },
    ],
    kpis: ['Patients Today', 'Appointments Scheduled', 'Average Wait Time', 'Bed Occupancy Rate', 'Revenue This Month', 'Pending Bills'],
    modules: ['Patients', 'Appointments', 'Medical Records', 'Prescriptions', 'Billing', 'Departments'],
    workflows: [
      { entity: 'Appointment', states: ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'], transitions: [{ from: 'scheduled', to: 'confirmed', action: 'Confirm' }, { from: 'confirmed', to: 'checked_in', action: 'Check In' }, { from: 'checked_in', to: 'in_progress', action: 'Start' }, { from: 'in_progress', to: 'completed', action: 'Complete' }, { from: 'scheduled', to: 'cancelled', action: 'Cancel' }] },
    ],
    relationships: { Appointment: ['belongsTo Patient', 'belongsTo Provider'], MedicalRecord: ['belongsTo Patient', 'belongsTo Provider'], Prescription: ['belongsTo Patient', 'belongsTo Provider'], Provider: ['belongsTo Department'], Insurance: ['belongsTo Patient'], Billing: ['belongsTo Patient', 'belongsTo Appointment'] },
  },

  'crm': {
    entities: [
      { name: 'Contact', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', companyId: 'integer', title: 'text', source: 'enum(web,referral,cold_call,event,social)', status: 'enum(lead,prospect,customer,inactive)', tags: 'text', lastContactedAt: 'timestamp', createdAt: 'timestamp' }, recommended: ['id', 'firstName', 'lastName', 'email', 'phone', 'companyId', 'source', 'status'] },
      { name: 'Company', fields: { id: 'serial', name: 'text', industry: 'text', website: 'text', size: 'enum(1-10,11-50,51-200,201-500,500+)', revenue: 'decimal', address: 'text', phone: 'text', ownerId: 'integer' }, recommended: ['id', 'name', 'industry', 'website', 'size', 'ownerId'] },
      { name: 'Deal', fields: { id: 'serial', title: 'text', value: 'decimal', stage: 'enum(prospecting,qualification,proposal,negotiation,closed_won,closed_lost)', probability: 'integer', contactId: 'integer', companyId: 'integer', ownerId: 'integer', expectedCloseDate: 'date', closedDate: 'date', lostReason: 'text', createdAt: 'timestamp' }, recommended: ['id', 'title', 'value', 'stage', 'probability', 'contactId', 'companyId', 'expectedCloseDate'] },
      { name: 'Activity', fields: { id: 'serial', type: 'enum(call,email,meeting,task,note)', subject: 'text', description: 'text', contactId: 'integer', dealId: 'integer', userId: 'integer', dueDate: 'date', completed: 'boolean', outcome: 'text', duration: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'type', 'subject', 'contactId', 'dealId', 'dueDate', 'completed'] },
      { name: 'Pipeline', fields: { id: 'serial', name: 'text', stages: 'json', isDefault: 'boolean', createdAt: 'timestamp' }, recommended: ['id', 'name', 'stages', 'isDefault'] },
      { name: 'Task', fields: { id: 'serial', title: 'text', description: 'text', assigneeId: 'integer', contactId: 'integer', dealId: 'integer', dueDate: 'date', priority: 'enum(low,medium,high,urgent)', status: 'enum(todo,in_progress,done)', createdAt: 'timestamp' }, recommended: ['id', 'title', 'assigneeId', 'dueDate', 'priority', 'status'] },
    ],
    kpis: ['Pipeline Value', 'Deals Won', 'Win Rate', 'Revenue This Month', 'New Leads', 'Total Contacts', 'Average Deal Size', 'Sales Velocity'],
    modules: ['Contacts', 'Companies', 'Deals', 'Activities', 'Pipeline', 'Reports'],
    workflows: [
      { entity: 'Deal', states: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], transitions: [{ from: 'prospecting', to: 'qualification', action: 'Qualify' }, { from: 'qualification', to: 'proposal', action: 'Propose' }, { from: 'proposal', to: 'negotiation', action: 'Negotiate' }, { from: 'negotiation', to: 'closed_won', action: 'Win' }, { from: 'negotiation', to: 'closed_lost', action: 'Lose' }] },
    ],
    relationships: { Contact: ['belongsTo Company'], Deal: ['belongsTo Contact', 'belongsTo Company'], Activity: ['belongsTo Contact', 'belongsTo Deal'], Task: ['belongsTo Contact', 'belongsTo Deal'] },
  },

  'education': {
    entities: [
      { name: 'Student', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', studentId: 'text', enrollmentDate: 'date', graduationDate: 'date', gpa: 'decimal', major: 'text', status: 'enum(active,graduated,suspended,withdrawn)', phone: 'text', address: 'text', dateOfBirth: 'date' }, recommended: ['id', 'firstName', 'lastName', 'email', 'studentId', 'enrollmentDate', 'gpa', 'major', 'status'] },
      { name: 'Course', fields: { id: 'serial', code: 'text', name: 'text', description: 'text', credits: 'integer', departmentId: 'integer', instructorId: 'integer', capacity: 'integer', enrolled: 'integer', schedule: 'text', semester: 'text', status: 'enum(active,archived,cancelled)' }, recommended: ['id', 'code', 'name', 'credits', 'departmentId', 'instructorId', 'capacity', 'semester'] },
      { name: 'Enrollment', fields: { id: 'serial', studentId: 'integer', courseId: 'integer', grade: 'text', status: 'enum(enrolled,dropped,completed,failed)', enrolledAt: 'timestamp', completedAt: 'timestamp' }, recommended: ['id', 'studentId', 'courseId', 'grade', 'status', 'enrolledAt'] },
      { name: 'Instructor', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', departmentId: 'integer', title: 'text', specialization: 'text', officeHours: 'text', phone: 'text', bio: 'text' }, recommended: ['id', 'firstName', 'lastName', 'email', 'departmentId', 'title', 'specialization'] },
      { name: 'Assignment', fields: { id: 'serial', courseId: 'integer', title: 'text', description: 'text', dueDate: 'timestamp', maxPoints: 'integer', type: 'enum(homework,quiz,exam,project,lab)', weight: 'decimal', createdAt: 'timestamp' }, recommended: ['id', 'courseId', 'title', 'dueDate', 'maxPoints', 'type', 'weight'] },
      { name: 'Submission', fields: { id: 'serial', assignmentId: 'integer', studentId: 'integer', content: 'text', fileUrl: 'text', score: 'decimal', feedback: 'text', submittedAt: 'timestamp', gradedAt: 'timestamp', status: 'enum(submitted,graded,returned,late)' }, recommended: ['id', 'assignmentId', 'studentId', 'score', 'submittedAt', 'status'] },
      { name: 'Attendance', fields: { id: 'serial', studentId: 'integer', courseId: 'integer', date: 'date', status: 'enum(present,absent,late,excused)', notes: 'text' }, recommended: ['id', 'studentId', 'courseId', 'date', 'status'] },
    ],
    kpis: ['Total Students', 'Course Enrollment Rate', 'Average GPA', 'Attendance Rate', 'Graduation Rate', 'Active Courses'],
    modules: ['Students', 'Courses', 'Enrollments', 'Assignments', 'Grades', 'Attendance'],
    workflows: [
      { entity: 'Enrollment', states: ['pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'failed'], transitions: [{ from: 'pending', to: 'enrolled', action: 'Enroll' }, { from: 'enrolled', to: 'in_progress', action: 'Start' }, { from: 'in_progress', to: 'completed', action: 'Complete' }, { from: 'enrolled', to: 'dropped', action: 'Drop' }] },
    ],
    relationships: { Enrollment: ['belongsTo Student', 'belongsTo Course'], Course: ['belongsTo Instructor', 'belongsTo Department'], Assignment: ['belongsTo Course'], Submission: ['belongsTo Assignment', 'belongsTo Student'], Attendance: ['belongsTo Student', 'belongsTo Course'] },
  },

  'project-management': {
    entities: [
      { name: 'Project', fields: { id: 'serial', name: 'text', description: 'text', ownerId: 'integer', status: 'enum(planning,active,on_hold,completed,cancelled)', startDate: 'date', endDate: 'date', budget: 'decimal', priority: 'enum(low,medium,high,critical)', progress: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'name', 'description', 'ownerId', 'status', 'startDate', 'endDate', 'priority', 'progress'] },
      { name: 'Task', fields: { id: 'serial', projectId: 'integer', title: 'text', description: 'text', assigneeId: 'integer', status: 'enum(todo,in_progress,in_review,done,blocked)', priority: 'enum(low,medium,high,urgent)', dueDate: 'date', estimatedHours: 'decimal', actualHours: 'decimal', parentTaskId: 'integer', tags: 'text', createdAt: 'timestamp' }, recommended: ['id', 'projectId', 'title', 'assigneeId', 'status', 'priority', 'dueDate', 'estimatedHours'] },
      { name: 'Sprint', fields: { id: 'serial', projectId: 'integer', name: 'text', goal: 'text', startDate: 'date', endDate: 'date', status: 'enum(planning,active,completed)', velocity: 'integer' }, recommended: ['id', 'projectId', 'name', 'goal', 'startDate', 'endDate', 'status'] },
      { name: 'TeamMember', fields: { id: 'serial', userId: 'integer', projectId: 'integer', role: 'enum(owner,admin,member,viewer)', joinedAt: 'timestamp' }, recommended: ['id', 'userId', 'projectId', 'role'] },
      { name: 'Comment', fields: { id: 'serial', taskId: 'integer', userId: 'integer', content: 'text', createdAt: 'timestamp', updatedAt: 'timestamp' }, recommended: ['id', 'taskId', 'userId', 'content', 'createdAt'] },
      { name: 'TimeEntry', fields: { id: 'serial', taskId: 'integer', userId: 'integer', hours: 'decimal', description: 'text', date: 'date', billable: 'boolean' }, recommended: ['id', 'taskId', 'userId', 'hours', 'date', 'billable'] },
      { name: 'Milestone', fields: { id: 'serial', projectId: 'integer', title: 'text', description: 'text', dueDate: 'date', status: 'enum(pending,completed,overdue)', completedAt: 'timestamp' }, recommended: ['id', 'projectId', 'title', 'dueDate', 'status'] },
    ],
    kpis: ['Active Projects', 'Tasks Due Today', 'Completion Rate', 'Team Velocity', 'Overdue Tasks', 'Sprint Progress'],
    modules: ['Projects', 'Tasks', 'Sprints', 'Team', 'Time Tracking', 'Reports'],
    workflows: [
      { entity: 'Task', states: ['todo', 'in_progress', 'in_review', 'done', 'blocked'], transitions: [{ from: 'todo', to: 'in_progress', action: 'Start' }, { from: 'in_progress', to: 'in_review', action: 'Review' }, { from: 'in_review', to: 'done', action: 'Approve' }, { from: 'in_review', to: 'in_progress', action: 'Revise' }, { from: 'in_progress', to: 'blocked', action: 'Block' }] },
    ],
    relationships: { Task: ['belongsTo Project', 'belongsTo Sprint'], Sprint: ['belongsTo Project'], Comment: ['belongsTo Task'], TimeEntry: ['belongsTo Task'], Milestone: ['belongsTo Project'], TeamMember: ['belongsTo Project'] },
  },

  'real-estate': {
    entities: [
      { name: 'Property', fields: { id: 'serial', title: 'text', description: 'text', type: 'enum(house,apartment,condo,land,commercial)', status: 'enum(available,pending,sold,rented,off_market)', price: 'decimal', address: 'text', city: 'text', state: 'text', zipCode: 'text', bedrooms: 'integer', bathrooms: 'decimal', sqft: 'integer', yearBuilt: 'integer', lotSize: 'decimal', agentId: 'integer', imageUrls: 'json', features: 'text', createdAt: 'timestamp' }, recommended: ['id', 'title', 'type', 'status', 'price', 'address', 'city', 'bedrooms', 'bathrooms', 'sqft', 'agentId'] },
      { name: 'Agent', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', licenseNumber: 'text', bio: 'text', photoUrl: 'text', rating: 'decimal', listingsCount: 'integer' }, recommended: ['id', 'firstName', 'lastName', 'email', 'phone', 'licenseNumber'] },
      { name: 'Listing', fields: { id: 'serial', propertyId: 'integer', agentId: 'integer', listPrice: 'decimal', listDate: 'date', expirationDate: 'date', status: 'enum(active,pending,sold,expired,withdrawn)', mlsNumber: 'text', description: 'text', virtualTourUrl: 'text' }, recommended: ['id', 'propertyId', 'agentId', 'listPrice', 'listDate', 'status', 'mlsNumber'] },
      { name: 'Showing', fields: { id: 'serial', propertyId: 'integer', agentId: 'integer', clientId: 'integer', dateTime: 'timestamp', duration: 'integer', status: 'enum(scheduled,completed,cancelled,no_show)', feedback: 'text', interestLevel: 'enum(low,medium,high)' }, recommended: ['id', 'propertyId', 'agentId', 'clientId', 'dateTime', 'status'] },
      { name: 'Offer', fields: { id: 'serial', propertyId: 'integer', buyerId: 'integer', amount: 'decimal', status: 'enum(pending,accepted,rejected,countered,expired)', conditions: 'text', expirationDate: 'date', submittedAt: 'timestamp' }, recommended: ['id', 'propertyId', 'buyerId', 'amount', 'status', 'expirationDate'] },
      { name: 'Client', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', type: 'enum(buyer,seller,both)', budget: 'decimal', preferences: 'json', agentId: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'firstName', 'lastName', 'email', 'type', 'budget', 'agentId'] },
    ],
    kpis: ['Active Listings', 'Properties Sold', 'Average Days on Market', 'Total Sales Volume', 'New Leads', 'Pending Offers'],
    modules: ['Properties', 'Listings', 'Clients', 'Showings', 'Offers', 'Reports'],
    workflows: [
      { entity: 'Listing', states: ['draft', 'active', 'pending', 'sold', 'expired', 'withdrawn'], transitions: [{ from: 'draft', to: 'active', action: 'Publish' }, { from: 'active', to: 'pending', action: 'Accept Offer' }, { from: 'pending', to: 'sold', action: 'Close' }, { from: 'active', to: 'expired', action: 'Expire' }] },
    ],
    relationships: { Property: ['belongsTo Agent'], Listing: ['belongsTo Property', 'belongsTo Agent'], Showing: ['belongsTo Property', 'belongsTo Agent', 'belongsTo Client'], Offer: ['belongsTo Property'], Client: ['belongsTo Agent'] },
  },

  'restaurant': {
    entities: [
      { name: 'MenuItem', fields: { id: 'serial', name: 'text', description: 'text', price: 'decimal', categoryId: 'integer', imageUrl: 'text', calories: 'integer', allergens: 'text', available: 'boolean', preparationTime: 'integer', spiceLevel: 'enum(mild,medium,hot,extra_hot)' }, recommended: ['id', 'name', 'description', 'price', 'categoryId', 'available', 'calories'] },
      { name: 'MenuCategory', fields: { id: 'serial', name: 'text', description: 'text', sortOrder: 'integer', imageUrl: 'text', active: 'boolean' }, recommended: ['id', 'name', 'sortOrder', 'active'] },
      { name: 'TableOrder', fields: { id: 'serial', tableNumber: 'integer', serverId: 'integer', status: 'enum(open,preparing,served,closed,cancelled)', subtotal: 'decimal', tax: 'decimal', tip: 'decimal', total: 'decimal', guestCount: 'integer', createdAt: 'timestamp', closedAt: 'timestamp' }, recommended: ['id', 'tableNumber', 'serverId', 'status', 'total', 'guestCount', 'createdAt'] },
      { name: 'OrderDetail', fields: { id: 'serial', orderId: 'integer', menuItemId: 'integer', quantity: 'integer', price: 'decimal', specialInstructions: 'text', status: 'enum(pending,preparing,ready,served,cancelled)' }, recommended: ['id', 'orderId', 'menuItemId', 'quantity', 'price', 'status'] },
      { name: 'Reservation', fields: { id: 'serial', customerName: 'text', phone: 'text', email: 'text', date: 'date', time: 'text', partySize: 'integer', tableNumber: 'integer', status: 'enum(confirmed,seated,completed,cancelled,no_show)', specialRequests: 'text' }, recommended: ['id', 'customerName', 'phone', 'date', 'time', 'partySize', 'status'] },
      { name: 'Inventory', fields: { id: 'serial', name: 'text', category: 'text', quantity: 'decimal', unit: 'text', reorderLevel: 'decimal', cost: 'decimal', supplierId: 'integer', lastRestocked: 'date', expirationDate: 'date' }, recommended: ['id', 'name', 'quantity', 'unit', 'reorderLevel', 'cost'] },
      { name: 'Staff', fields: { id: 'serial', firstName: 'text', lastName: 'text', role: 'enum(manager,server,chef,bartender,host,busser)', email: 'text', phone: 'text', hourlyRate: 'decimal', hireDate: 'date', active: 'boolean' }, recommended: ['id', 'firstName', 'lastName', 'role', 'hourlyRate', 'active'] },
    ],
    kpis: ['Revenue Today', 'Orders This Hour', 'Table Turnover Rate', 'Average Ticket Size', 'Reservations Today', 'Items Low Stock'],
    modules: ['Menu', 'Orders', 'Reservations', 'Inventory', 'Staff', 'Reports'],
    workflows: [
      { entity: 'TableOrder', states: ['open', 'preparing', 'served', 'closed', 'cancelled'], transitions: [{ from: 'open', to: 'preparing', action: 'Send to Kitchen' }, { from: 'preparing', to: 'served', action: 'Serve' }, { from: 'served', to: 'closed', action: 'Close Check' }] },
    ],
    relationships: { MenuItem: ['belongsTo MenuCategory'], OrderDetail: ['belongsTo TableOrder', 'belongsTo MenuItem'], TableOrder: ['belongsTo Staff'] },
  },

  'fitness': {
    entities: [
      { name: 'Member', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', membershipType: 'enum(basic,premium,vip)', startDate: 'date', endDate: 'date', status: 'enum(active,expired,frozen,cancelled)', emergencyContact: 'text', dateOfBirth: 'date', goals: 'text' }, recommended: ['id', 'firstName', 'lastName', 'email', 'membershipType', 'startDate', 'status'] },
      { name: 'Workout', fields: { id: 'serial', memberId: 'integer', name: 'text', date: 'date', duration: 'integer', type: 'enum(strength,cardio,flexibility,hiit,yoga,crossfit)', caloriesBurned: 'integer', notes: 'text', trainerId: 'integer' }, recommended: ['id', 'memberId', 'name', 'date', 'duration', 'type', 'caloriesBurned'] },
      { name: 'Exercise', fields: { id: 'serial', name: 'text', category: 'text', muscleGroup: 'text', equipment: 'text', description: 'text', videoUrl: 'text', difficulty: 'enum(beginner,intermediate,advanced)' }, recommended: ['id', 'name', 'category', 'muscleGroup', 'equipment', 'difficulty'] },
      { name: 'WorkoutExercise', fields: { id: 'serial', workoutId: 'integer', exerciseId: 'integer', sets: 'integer', reps: 'integer', weight: 'decimal', duration: 'integer', restTime: 'integer', order: 'integer' }, recommended: ['id', 'workoutId', 'exerciseId', 'sets', 'reps', 'weight'] },
      { name: 'Class', fields: { id: 'serial', name: 'text', description: 'text', instructorId: 'integer', schedule: 'text', capacity: 'integer', enrolled: 'integer', duration: 'integer', level: 'enum(all,beginner,intermediate,advanced)', room: 'text' }, recommended: ['id', 'name', 'instructorId', 'schedule', 'capacity', 'duration', 'level'] },
      { name: 'MembershipPlan', fields: { id: 'serial', name: 'text', price: 'decimal', duration: 'integer', features: 'text', classAccess: 'boolean', trainerSessions: 'integer', active: 'boolean' }, recommended: ['id', 'name', 'price', 'duration', 'features', 'active'] },
    ],
    kpis: ['Active Members', 'Check-ins Today', 'Classes Today', 'Monthly Revenue', 'New Sign-ups', 'Member Retention Rate'],
    modules: ['Members', 'Workouts', 'Classes', 'Trainers', 'Membership Plans', 'Reports'],
    workflows: [
      { entity: 'Member', states: ['trial', 'active', 'frozen', 'expired', 'cancelled'], transitions: [{ from: 'trial', to: 'active', action: 'Activate' }, { from: 'active', to: 'frozen', action: 'Freeze' }, { from: 'frozen', to: 'active', action: 'Unfreeze' }, { from: 'active', to: 'expired', action: 'Expire' }] },
    ],
    relationships: { Workout: ['belongsTo Member'], WorkoutExercise: ['belongsTo Workout', 'belongsTo Exercise'], Class: ['belongsTo Instructor'] },
  },

  'finance': {
    entities: [
      { name: 'Account', fields: { id: 'serial', userId: 'integer', name: 'text', type: 'enum(checking,savings,credit,investment,loan)', balance: 'decimal', currency: 'text', institution: 'text', accountNumber: 'text', status: 'enum(active,closed,frozen)', interestRate: 'decimal', openedDate: 'date' }, recommended: ['id', 'userId', 'name', 'type', 'balance', 'currency', 'status'] },
      { name: 'Transaction', fields: { id: 'serial', accountId: 'integer', type: 'enum(deposit,withdrawal,transfer,payment,refund)', amount: 'decimal', description: 'text', categoryId: 'integer', date: 'date', status: 'enum(pending,completed,failed,reversed)', reference: 'text', merchant: 'text', balance: 'decimal' }, recommended: ['id', 'accountId', 'type', 'amount', 'description', 'categoryId', 'date', 'status'] },
      { name: 'Budget', fields: { id: 'serial', userId: 'integer', categoryId: 'integer', amount: 'decimal', spent: 'decimal', period: 'enum(weekly,monthly,yearly)', startDate: 'date', endDate: 'date' }, recommended: ['id', 'userId', 'categoryId', 'amount', 'spent', 'period'] },
      { name: 'TransactionCategory', fields: { id: 'serial', name: 'text', type: 'enum(income,expense)', icon: 'text', color: 'text', parentId: 'integer' }, recommended: ['id', 'name', 'type', 'icon', 'color'] },
      { name: 'Invoice', fields: { id: 'serial', clientId: 'integer', invoiceNumber: 'text', amount: 'decimal', tax: 'decimal', total: 'decimal', status: 'enum(draft,sent,paid,overdue,cancelled)', dueDate: 'date', paidDate: 'date', items: 'json', notes: 'text', createdAt: 'timestamp' }, recommended: ['id', 'clientId', 'invoiceNumber', 'amount', 'total', 'status', 'dueDate'] },
      { name: 'RecurringTransaction', fields: { id: 'serial', accountId: 'integer', amount: 'decimal', description: 'text', frequency: 'enum(daily,weekly,biweekly,monthly,yearly)', nextDate: 'date', categoryId: 'integer', active: 'boolean' }, recommended: ['id', 'accountId', 'amount', 'description', 'frequency', 'nextDate', 'active'] },
      { name: 'Goal', fields: { id: 'serial', userId: 'integer', name: 'text', targetAmount: 'decimal', currentAmount: 'decimal', deadline: 'date', status: 'enum(active,achieved,cancelled)', category: 'text' }, recommended: ['id', 'userId', 'name', 'targetAmount', 'currentAmount', 'deadline', 'status'] },
    ],
    kpis: ['Total Balance', 'Monthly Income', 'Monthly Expenses', 'Savings Rate', 'Budget Adherence', 'Pending Invoices'],
    modules: ['Accounts', 'Transactions', 'Budgets', 'Invoices', 'Goals', 'Reports'],
    workflows: [
      { entity: 'Invoice', states: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], transitions: [{ from: 'draft', to: 'sent', action: 'Send' }, { from: 'sent', to: 'paid', action: 'Mark Paid' }, { from: 'sent', to: 'overdue', action: 'Past Due' }, { from: 'draft', to: 'cancelled', action: 'Cancel' }] },
    ],
    relationships: { Transaction: ['belongsTo Account', 'belongsTo TransactionCategory'], Budget: ['belongsTo TransactionCategory'], Invoice: ['belongsTo Client'], RecurringTransaction: ['belongsTo Account'] },
  },

  'social-media': {
    entities: [
      { name: 'User', fields: { id: 'serial', username: 'text', email: 'text', displayName: 'text', bio: 'text', avatarUrl: 'text', coverImageUrl: 'text', location: 'text', website: 'text', verified: 'boolean', followersCount: 'integer', followingCount: 'integer', postsCount: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'username', 'email', 'displayName', 'bio', 'avatarUrl', 'verified'] },
      { name: 'Post', fields: { id: 'serial', authorId: 'integer', content: 'text', mediaUrls: 'json', type: 'enum(text,image,video,link,poll)', visibility: 'enum(public,followers,private)', likesCount: 'integer', commentsCount: 'integer', sharesCount: 'integer', hashtags: 'text', location: 'text', createdAt: 'timestamp', editedAt: 'timestamp' }, recommended: ['id', 'authorId', 'content', 'type', 'visibility', 'likesCount', 'commentsCount', 'createdAt'] },
      { name: 'Comment', fields: { id: 'serial', postId: 'integer', authorId: 'integer', content: 'text', parentId: 'integer', likesCount: 'integer', createdAt: 'timestamp', editedAt: 'timestamp' }, recommended: ['id', 'postId', 'authorId', 'content', 'parentId', 'likesCount', 'createdAt'] },
      { name: 'Like', fields: { id: 'serial', userId: 'integer', targetType: 'enum(post,comment)', targetId: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'userId', 'targetType', 'targetId'] },
      { name: 'Follow', fields: { id: 'serial', followerId: 'integer', followingId: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'followerId', 'followingId'] },
      { name: 'Message', fields: { id: 'serial', senderId: 'integer', receiverId: 'integer', content: 'text', read: 'boolean', conversationId: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'senderId', 'receiverId', 'content', 'read', 'conversationId'] },
      { name: 'Notification', fields: { id: 'serial', userId: 'integer', type: 'enum(like,comment,follow,mention,share)', actorId: 'integer', targetType: 'text', targetId: 'integer', read: 'boolean', createdAt: 'timestamp' }, recommended: ['id', 'userId', 'type', 'actorId', 'read', 'createdAt'] },
    ],
    kpis: ['Daily Active Users', 'Posts Today', 'Engagement Rate', 'New Sign-ups', 'Messages Sent', 'Content Reports'],
    modules: ['Feed', 'Profile', 'Messages', 'Notifications', 'Search', 'Settings'],
    workflows: [
      { entity: 'Post', states: ['draft', 'published', 'flagged', 'removed', 'archived'], transitions: [{ from: 'draft', to: 'published', action: 'Publish' }, { from: 'published', to: 'flagged', action: 'Report' }, { from: 'flagged', to: 'removed', action: 'Remove' }, { from: 'published', to: 'archived', action: 'Archive' }] },
    ],
    relationships: { Post: ['belongsTo User'], Comment: ['belongsTo Post', 'belongsTo User'], Like: ['belongsTo User'], Follow: ['belongsTo User'], Message: ['belongsTo User'], Notification: ['belongsTo User'] },
  },

  'hr': {
    entities: [
      { name: 'Employee', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', departmentId: 'integer', managerId: 'integer', title: 'text', hireDate: 'date', salary: 'decimal', employmentType: 'enum(full_time,part_time,contract,intern)', status: 'enum(active,on_leave,terminated)', address: 'text', dateOfBirth: 'date', emergencyContact: 'text' }, recommended: ['id', 'firstName', 'lastName', 'email', 'departmentId', 'title', 'hireDate', 'salary', 'employmentType', 'status'] },
      { name: 'Department', fields: { id: 'serial', name: 'text', description: 'text', managerId: 'integer', budget: 'decimal', headcount: 'integer', location: 'text' }, recommended: ['id', 'name', 'managerId', 'budget', 'headcount'] },
      { name: 'LeaveRequest', fields: { id: 'serial', employeeId: 'integer', type: 'enum(vacation,sick,personal,maternity,paternity,bereavement)', startDate: 'date', endDate: 'date', days: 'decimal', status: 'enum(pending,approved,rejected,cancelled)', reason: 'text', approvedBy: 'integer', approvedAt: 'timestamp' }, recommended: ['id', 'employeeId', 'type', 'startDate', 'endDate', 'days', 'status'] },
      { name: 'PerformanceReview', fields: { id: 'serial', employeeId: 'integer', reviewerId: 'integer', period: 'text', rating: 'integer', strengths: 'text', improvements: 'text', goals: 'text', status: 'enum(draft,submitted,reviewed,acknowledged)', createdAt: 'timestamp' }, recommended: ['id', 'employeeId', 'reviewerId', 'period', 'rating', 'status'] },
      { name: 'Payroll', fields: { id: 'serial', employeeId: 'integer', period: 'text', basePay: 'decimal', overtime: 'decimal', deductions: 'decimal', taxes: 'decimal', netPay: 'decimal', status: 'enum(pending,processed,paid)', paidDate: 'date' }, recommended: ['id', 'employeeId', 'period', 'basePay', 'netPay', 'status'] },
      { name: 'JobPosting', fields: { id: 'serial', title: 'text', departmentId: 'integer', description: 'text', requirements: 'text', salary_range: 'text', type: 'enum(full_time,part_time,contract)', location: 'text', status: 'enum(draft,open,closed,filled)', applicantCount: 'integer', postedAt: 'timestamp', closingDate: 'date' }, recommended: ['id', 'title', 'departmentId', 'description', 'type', 'status', 'postedAt'] },
      { name: 'Applicant', fields: { id: 'serial', jobPostingId: 'integer', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', resumeUrl: 'text', status: 'enum(applied,screening,interview,offer,hired,rejected)', appliedAt: 'timestamp', notes: 'text' }, recommended: ['id', 'jobPostingId', 'firstName', 'lastName', 'email', 'status', 'appliedAt'] },
    ],
    kpis: ['Total Employees', 'Open Positions', 'Pending Leave Requests', 'Average Rating', 'Turnover Rate', 'Time to Hire'],
    modules: ['Employees', 'Departments', 'Leave Management', 'Performance', 'Payroll', 'Recruitment'],
    workflows: [
      { entity: 'LeaveRequest', states: ['pending', 'approved', 'rejected', 'cancelled'], transitions: [{ from: 'pending', to: 'approved', action: 'Approve' }, { from: 'pending', to: 'rejected', action: 'Reject' }, { from: 'pending', to: 'cancelled', action: 'Cancel' }] },
      { entity: 'Applicant', states: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'], transitions: [{ from: 'applied', to: 'screening', action: 'Screen' }, { from: 'screening', to: 'interview', action: 'Interview' }, { from: 'interview', to: 'offer', action: 'Offer' }, { from: 'offer', to: 'hired', action: 'Hire' }, { from: 'screening', to: 'rejected', action: 'Reject' }] },
    ],
    relationships: { Employee: ['belongsTo Department'], LeaveRequest: ['belongsTo Employee'], PerformanceReview: ['belongsTo Employee'], Payroll: ['belongsTo Employee'], JobPosting: ['belongsTo Department'], Applicant: ['belongsTo JobPosting'] },
  },

  'logistics': {
    entities: [
      { name: 'Shipment', fields: { id: 'serial', trackingNumber: 'text', senderId: 'integer', receiverId: 'integer', origin: 'text', destination: 'text', weight: 'decimal', dimensions: 'text', status: 'enum(created,picked_up,in_transit,out_for_delivery,delivered,returned)', carrier: 'text', estimatedDelivery: 'date', actualDelivery: 'date', cost: 'decimal', createdAt: 'timestamp' }, recommended: ['id', 'trackingNumber', 'origin', 'destination', 'status', 'carrier', 'estimatedDelivery', 'cost'] },
      { name: 'Warehouse', fields: { id: 'serial', name: 'text', address: 'text', city: 'text', capacity: 'integer', utilization: 'integer', managerId: 'integer', phone: 'text', type: 'enum(distribution,fulfillment,cold_storage)' }, recommended: ['id', 'name', 'address', 'capacity', 'utilization', 'type'] },
      { name: 'Vehicle', fields: { id: 'serial', plateNumber: 'text', type: 'enum(van,truck,trailer,refrigerated)', capacity: 'decimal', status: 'enum(available,in_use,maintenance)', driverId: 'integer', lastMaintenance: 'date', mileage: 'integer' }, recommended: ['id', 'plateNumber', 'type', 'capacity', 'status', 'driverId'] },
      { name: 'Driver', fields: { id: 'serial', firstName: 'text', lastName: 'text', licenseNumber: 'text', phone: 'text', status: 'enum(available,on_route,off_duty)', rating: 'decimal', completedDeliveries: 'integer' }, recommended: ['id', 'firstName', 'lastName', 'licenseNumber', 'phone', 'status'] },
      { name: 'Route', fields: { id: 'serial', name: 'text', vehicleId: 'integer', driverId: 'integer', startLocation: 'text', endLocation: 'text', stops: 'json', distance: 'decimal', estimatedTime: 'integer', status: 'enum(planned,active,completed)', date: 'date' }, recommended: ['id', 'name', 'vehicleId', 'driverId', 'distance', 'status', 'date'] },
      { name: 'InventoryItem', fields: { id: 'serial', sku: 'text', name: 'text', warehouseId: 'integer', quantity: 'integer', location: 'text', weight: 'decimal', category: 'text', reorderPoint: 'integer', lastCounted: 'date' }, recommended: ['id', 'sku', 'name', 'warehouseId', 'quantity', 'location', 'reorderPoint'] },
    ],
    kpis: ['Shipments Today', 'On-Time Delivery Rate', 'Fleet Utilization', 'Warehouse Capacity', 'Average Transit Time', 'Pending Pickups'],
    modules: ['Shipments', 'Warehouses', 'Fleet', 'Routes', 'Inventory', 'Tracking'],
    workflows: [
      { entity: 'Shipment', states: ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned'], transitions: [{ from: 'created', to: 'picked_up', action: 'Pick Up' }, { from: 'picked_up', to: 'in_transit', action: 'Ship' }, { from: 'in_transit', to: 'out_for_delivery', action: 'Out for Delivery' }, { from: 'out_for_delivery', to: 'delivered', action: 'Deliver' }] },
    ],
    relationships: { Shipment: ['belongsTo Driver', 'belongsTo Vehicle'], Route: ['belongsTo Vehicle', 'belongsTo Driver'], InventoryItem: ['belongsTo Warehouse'], Vehicle: ['belongsTo Driver'] },
  },

  'booking': {
    entities: [
      { name: 'Venue', fields: { id: 'serial', name: 'text', description: 'text', address: 'text', city: 'text', capacity: 'integer', type: 'enum(hotel,conference,restaurant,event_space,coworking)', pricePerHour: 'decimal', rating: 'decimal', amenities: 'text', imageUrls: 'json', ownerId: 'integer' }, recommended: ['id', 'name', 'address', 'capacity', 'type', 'pricePerHour', 'rating'] },
      { name: 'Booking', fields: { id: 'serial', venueId: 'integer', userId: 'integer', startDate: 'timestamp', endDate: 'timestamp', guestCount: 'integer', status: 'enum(pending,confirmed,checked_in,completed,cancelled,no_show)', totalPrice: 'decimal', specialRequests: 'text', confirmationCode: 'text', createdAt: 'timestamp' }, recommended: ['id', 'venueId', 'userId', 'startDate', 'endDate', 'status', 'totalPrice', 'confirmationCode'] },
      { name: 'Room', fields: { id: 'serial', venueId: 'integer', name: 'text', type: 'enum(single,double,suite,deluxe,penthouse)', capacity: 'integer', pricePerNight: 'decimal', floor: 'integer', amenities: 'text', status: 'enum(available,occupied,maintenance,reserved)' }, recommended: ['id', 'venueId', 'name', 'type', 'capacity', 'pricePerNight', 'status'] },
      { name: 'Guest', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', phone: 'text', loyaltyPoints: 'integer', tier: 'enum(standard,silver,gold,platinum)', preferences: 'text', visits: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'firstName', 'lastName', 'email', 'phone', 'loyaltyPoints', 'tier'] },
      { name: 'Payment', fields: { id: 'serial', bookingId: 'integer', amount: 'decimal', method: 'enum(credit_card,debit_card,cash,bank_transfer)', status: 'enum(pending,completed,refunded,failed)', transactionId: 'text', paidAt: 'timestamp' }, recommended: ['id', 'bookingId', 'amount', 'method', 'status'] },
      { name: 'Review', fields: { id: 'serial', bookingId: 'integer', userId: 'integer', rating: 'integer', comment: 'text', response: 'text', createdAt: 'timestamp' }, recommended: ['id', 'bookingId', 'userId', 'rating', 'comment'] },
    ],
    kpis: ['Bookings Today', 'Occupancy Rate', 'Revenue This Month', 'Average Rating', 'Cancellation Rate', 'Upcoming Check-ins'],
    modules: ['Bookings', 'Venues', 'Rooms', 'Guests', 'Payments', 'Reviews'],
    workflows: [
      { entity: 'Booking', states: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'], transitions: [{ from: 'pending', to: 'confirmed', action: 'Confirm' }, { from: 'confirmed', to: 'checked_in', action: 'Check In' }, { from: 'checked_in', to: 'completed', action: 'Check Out' }, { from: 'pending', to: 'cancelled', action: 'Cancel' }] },
    ],
    relationships: { Booking: ['belongsTo Venue', 'belongsTo Guest'], Room: ['belongsTo Venue'], Payment: ['belongsTo Booking'], Review: ['belongsTo Booking'] },
  },

  'content-management': {
    entities: [
      { name: 'Article', fields: { id: 'serial', title: 'text', slug: 'text', content: 'text', excerpt: 'text', authorId: 'integer', categoryId: 'integer', status: 'enum(draft,review,published,archived)', featuredImage: 'text', tags: 'text', viewCount: 'integer', publishedAt: 'timestamp', createdAt: 'timestamp', updatedAt: 'timestamp', seoTitle: 'text', seoDescription: 'text' }, recommended: ['id', 'title', 'slug', 'content', 'authorId', 'categoryId', 'status', 'publishedAt'] },
      { name: 'Category', fields: { id: 'serial', name: 'text', slug: 'text', description: 'text', parentId: 'integer', imageUrl: 'text', sortOrder: 'integer' }, recommended: ['id', 'name', 'slug', 'parentId'] },
      { name: 'Author', fields: { id: 'serial', firstName: 'text', lastName: 'text', email: 'text', bio: 'text', avatarUrl: 'text', role: 'enum(admin,editor,author,contributor)', socialLinks: 'json', articlesCount: 'integer' }, recommended: ['id', 'firstName', 'lastName', 'email', 'bio', 'role'] },
      { name: 'Tag', fields: { id: 'serial', name: 'text', slug: 'text', description: 'text', count: 'integer' }, recommended: ['id', 'name', 'slug'] },
      { name: 'Media', fields: { id: 'serial', filename: 'text', url: 'text', type: 'enum(image,video,document,audio)', size: 'integer', mimeType: 'text', alt: 'text', uploadedBy: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'filename', 'url', 'type', 'size', 'uploadedBy'] },
      { name: 'Comment', fields: { id: 'serial', articleId: 'integer', authorName: 'text', authorEmail: 'text', content: 'text', status: 'enum(pending,approved,spam,deleted)', parentId: 'integer', createdAt: 'timestamp' }, recommended: ['id', 'articleId', 'authorName', 'content', 'status'] },
      { name: 'Page', fields: { id: 'serial', title: 'text', slug: 'text', content: 'text', template: 'text', status: 'enum(draft,published)', sortOrder: 'integer', parentId: 'integer', seoTitle: 'text', seoDescription: 'text' }, recommended: ['id', 'title', 'slug', 'content', 'status', 'template'] },
    ],
    kpis: ['Published Articles', 'Total Views', 'Comments Today', 'Draft Articles', 'Top Authors', 'Media Storage Used'],
    modules: ['Articles', 'Categories', 'Media Library', 'Comments', 'Pages', 'SEO'],
    workflows: [
      { entity: 'Article', states: ['draft', 'review', 'published', 'archived'], transitions: [{ from: 'draft', to: 'review', action: 'Submit for Review' }, { from: 'review', to: 'published', action: 'Publish' }, { from: 'review', to: 'draft', action: 'Request Changes' }, { from: 'published', to: 'archived', action: 'Archive' }] },
    ],
    relationships: { Article: ['belongsTo Author', 'belongsTo Category'], Comment: ['belongsTo Article'], Media: ['belongsTo Author'], Page: ['hasMany Page'] },
  },

  'inventory': {
    entities: [
      { name: 'Product', fields: { id: 'serial', sku: 'text', name: 'text', description: 'text', categoryId: 'integer', unitPrice: 'decimal', costPrice: 'decimal', quantity: 'integer', reorderLevel: 'integer', reorderQuantity: 'integer', unit: 'text', weight: 'decimal', barcode: 'text', location: 'text', supplierId: 'integer', status: 'enum(active,discontinued,out_of_stock)', lastRestocked: 'date' }, recommended: ['id', 'sku', 'name', 'categoryId', 'unitPrice', 'costPrice', 'quantity', 'reorderLevel', 'barcode'] },
      { name: 'Supplier', fields: { id: 'serial', name: 'text', contactPerson: 'text', email: 'text', phone: 'text', address: 'text', website: 'text', paymentTerms: 'text', rating: 'decimal', active: 'boolean' }, recommended: ['id', 'name', 'contactPerson', 'email', 'phone', 'paymentTerms'] },
      { name: 'PurchaseOrder', fields: { id: 'serial', supplierId: 'integer', orderNumber: 'text', status: 'enum(draft,submitted,confirmed,shipped,received,cancelled)', totalAmount: 'decimal', orderDate: 'date', expectedDelivery: 'date', receivedDate: 'date', notes: 'text' }, recommended: ['id', 'supplierId', 'orderNumber', 'status', 'totalAmount', 'orderDate', 'expectedDelivery'] },
      { name: 'PurchaseOrderItem', fields: { id: 'serial', purchaseOrderId: 'integer', productId: 'integer', quantity: 'integer', unitPrice: 'decimal', totalPrice: 'decimal', receivedQuantity: 'integer' }, recommended: ['id', 'purchaseOrderId', 'productId', 'quantity', 'unitPrice', 'receivedQuantity'] },
      { name: 'StockMovement', fields: { id: 'serial', productId: 'integer', type: 'enum(in,out,adjustment,transfer)', quantity: 'integer', reason: 'text', reference: 'text', fromLocation: 'text', toLocation: 'text', userId: 'integer', date: 'timestamp' }, recommended: ['id', 'productId', 'type', 'quantity', 'reason', 'date'] },
      { name: 'Warehouse', fields: { id: 'serial', name: 'text', address: 'text', capacity: 'integer', utilization: 'integer', managerId: 'integer', type: 'enum(main,satellite,cold_storage)' }, recommended: ['id', 'name', 'address', 'capacity', 'utilization'] },
    ],
    kpis: ['Total SKUs', 'Low Stock Items', 'Stock Value', 'Pending Orders', 'Items to Reorder', 'Inventory Turnover'],
    modules: ['Products', 'Suppliers', 'Purchase Orders', 'Stock Movements', 'Warehouses', 'Reports'],
    workflows: [
      { entity: 'PurchaseOrder', states: ['draft', 'submitted', 'confirmed', 'shipped', 'received', 'cancelled'], transitions: [{ from: 'draft', to: 'submitted', action: 'Submit' }, { from: 'submitted', to: 'confirmed', action: 'Confirm' }, { from: 'confirmed', to: 'shipped', action: 'Mark Shipped' }, { from: 'shipped', to: 'received', action: 'Receive' }] },
    ],
    relationships: { Product: ['belongsTo Category', 'belongsTo Supplier'], PurchaseOrder: ['belongsTo Supplier', 'hasMany PurchaseOrderItem'], PurchaseOrderItem: ['belongsTo PurchaseOrder', 'belongsTo Product'], StockMovement: ['belongsTo Product'] },
  },
};

async function seedDomainKnowledge() {
  const engine = new GenerationLearningEngine();
  await engine.ensureReady();
  await engine.setDatabaseAvailable(true);

  let totalEntities = 0;
  let totalDomains = 0;
  let totalWorkflows = 0;

  for (const [domainId, domain] of Object.entries(DOMAIN_KNOWLEDGE)) {
    const key = `domain-${domainId}`;
    const existing = (engine as any).patterns.get(key);

    const domainPattern: any = {
      patternType: 'domain-mapping',
      domainId,
      patternKey: key,
      patternValue: {
        entities: domain.entities.map(e => e.name),
        modules: domain.modules,
        kpis: domain.kpis,
        pageCount: domain.entities.length + 2,
        relationships: domain.relationships,
      },
      successCount: existing ? existing.successCount + 50 : 50,
      failureCount: existing ? existing.failureCount : 0,
      reliability: 1,
    };

    (engine as any).patterns.set(key, domainPattern);
    await (engine as any).persistPattern(domainPattern);
    totalDomains++;

    for (const entity of domain.entities) {
      const entityKey = `entity-${entity.name.toLowerCase()}`;
      const existingEntity = (engine as any).patterns.get(entityKey);

      const entityPattern: any = {
        patternType: 'entity-structure',
        entityType: entity.name,
        domainId,
        patternKey: entityKey,
        patternValue: {
          recommended: entity.recommended,
          fieldTypes: entity.fields,
        },
        successCount: existingEntity ? existingEntity.successCount + 50 : 50,
        failureCount: existingEntity ? existingEntity.failureCount : 0,
        reliability: 1,
      };

      (engine as any).patterns.set(entityKey, entityPattern);
      await (engine as any).persistPattern(entityPattern);
      totalEntities++;
    }

    const domainEntitiesKey = `${domainId}-domain-entities`;
    const entityDetailPattern: any = {
      patternType: 'domain-mapping',
      domainId,
      patternKey: domainEntitiesKey,
      patternValue: {
        domain: domainId,
        coreEntities: domain.entities.map(e => e.name),
        relationships: domain.relationships,
        entityFieldCounts: Object.fromEntries(domain.entities.map(e => [e.name, Object.keys(e.fields).length])),
      },
      successCount: 50,
      failureCount: 0,
      reliability: 1,
    };
    (engine as any).patterns.set(domainEntitiesKey, entityDetailPattern);
    await (engine as any).persistPattern(entityDetailPattern);

    for (const workflow of domain.workflows) {
      const wfKey = `workflow-${workflow.entity.toLowerCase()}`;
      const existingWf = (engine as any).patterns.get(wfKey);

      const wfPattern: any = {
        patternType: 'workflow-design',
        domainId,
        patternKey: wfKey,
        patternValue: {
          states: workflow.states,
          commonTransitions: workflow.transitions,
        },
        successCount: existingWf ? existingWf.successCount + 50 : 50,
        failureCount: existingWf ? existingWf.failureCount : 0,
        reliability: 1,
      };

      (engine as any).patterns.set(wfKey, wfPattern);
      await (engine as any).persistPattern(wfPattern);
      totalWorkflows++;
    }
  }

  engine.persistToFile();

  const { readFileSync } = await import('fs'); const data = JSON.parse(readFileSync('learning-data.json', 'utf8'));
  const domainPatterns = data.patterns.filter((p: any) => p.patternType === 'domain-mapping');
  const withDomainId = domainPatterns.filter((p: any) => p.domainId);
  const entityPatterns = data.patterns.filter((p: any) => p.patternType === 'entity-structure');
  const withFieldTypes = entityPatterns.filter((p: any) => p.patternValue?.fieldTypes && Object.keys(p.patternValue.fieldTypes).length > 2);

  console.log('=== SEEDING COMPLETE ===');
  console.log(`Seeded ${totalDomains} domains, ${totalEntities} entities, ${totalWorkflows} workflows`);
  console.log('');
  console.log('=== VERIFICATION ===');
  console.log(`Total patterns: ${data.patterns.length}`);
  console.log(`Domain-mapping patterns: ${domainPatterns.length} (${withDomainId.length} with domainId)`);
  console.log(`Entity-structure patterns: ${entityPatterns.length} (${withFieldTypes.length} with full fieldTypes)`);
  console.log(`Unique domains: ${new Set(withDomainId.map((p: any) => p.domainId)).size}`);

  const fieldTypeCount = new Set<string>();
  entityPatterns.forEach((p: any) => {
    if (p.patternValue?.fieldTypes) {
      Object.values(p.patternValue.fieldTypes).forEach((t: any) => fieldTypeCount.add(String(t)));
    }
  });
  console.log(`Unique field types: ${fieldTypeCount.size}`);
  console.log('Field types:', [...fieldTypeCount].sort().join(', '));
}

seedDomainKnowledge().catch(e => console.error('Error:', e));
