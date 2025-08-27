// Ticket Service
const ticketService = {
  // Default ticket subjects
  DEFAULT_SUBJECTS: [
    'Login Issue',
    'Password Reset',
    'Account Access',
    'Technical Problem',
    'Feature Request',
    'Bug Report',
    'General Inquiry',
    'Other'
  ],

  // Generate unique ticket ID
  generateTicketId() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get existing tickets for today
    const tickets = this.getAllTickets();
    const todayTickets = tickets.filter(t => t.id.includes(dateStr));
    const nextNumber = (todayTickets.length + 1).toString().padStart(4, '0');
    
    return `TCKT-${dateStr}-${nextNumber}`;
  },

  getAllTickets() {
    return storageService.getAllTickets();
  },

  getTicketById(id) {
    return storageService.getTicketById(id);
  },

  createTicket(data) {
    const ticket = {
      id: this.generateTicketId(),
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: 'pending',
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storageService.saveTicket(ticket);
    
    // Create notification email to customer
    emailService.createEmail({
      toUserId: data.createdBy,
      fromUserId: 'user_admin',
      subject: `Ticket Received: ${ticket.id}`,
      body: `We have received your ticket "${ticket.subject}". Our team is working on it and will contact you soon.`
    });
    
    return ticket;
  },

  assignTicket(ticketId, agentId) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return;
    
    ticket.assignedTo = agentId;
    ticket.status = 'assigned';
    ticket.updatedAt = new Date().toISOString();
    
    storageService.saveTicket(ticket);
    
    // Create notification email to customer
    emailService.createEmail({
      toUserId: ticket.createdBy,
      fromUserId: 'user_admin',
      subject: `Ticket Assigned: ${ticket.id}`,
      body: `Your ticket "${ticket.subject}" has been assigned to our team and is being worked on.`
    });
  },

  updateTicketStatus(ticketId, status) {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return;
    
    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    
    storageService.saveTicket(ticket);
    
    // Create notification email to customer when resolved
    if (status === 'resolved' && oldStatus !== 'resolved') {
      emailService.createEmail({
        toUserId: ticket.createdBy,
        fromUserId: ticket.assignedTo || 'user_admin',
        subject: `Ticket Resolved: ${ticket.id}`,
        body: `Your ticket "${ticket.subject}" has been resolved. Thank you for using our support system.`
      });
    }
  },

  getTicketsForUser(userId, role) {
    return storageService.getTicketsByUserId(userId, role);
  },

  getTicketsByStatus(status) {
    return this.getAllTickets().filter(t => t.status === status);
  },

  searchTickets(query) {
    const tickets = this.getAllTickets();
    const lowercaseQuery = query.toLowerCase();
    
    return tickets.filter(ticket => 
      ticket.id.toLowerCase().includes(lowercaseQuery) ||
      ticket.subject.toLowerCase().includes(lowercaseQuery) ||
      ticket.description.toLowerCase().includes(lowercaseQuery)
    );
  }
};