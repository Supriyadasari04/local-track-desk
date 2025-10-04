import { 
  getAllTickets, 
  saveTicket, 
  getTicketById, 
  getTicketsByUserId
} from './storageService';
export { getAllTickets } from './storageService';
import { createEmail } from './emailService';

// Default ticket subjects
export const DEFAULT_SUBJECTS = [
  'Login Issue',
  'Password Reset',
  'Account Access',
  'Technical Problem',
  'Feature Request',
  'Bug Report',
  'General Inquiry',
  'Other'
];

// Generate unique ticket ID
export const generateTicketId = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get existing tickets for today
  const tickets = getAllTickets();
  const todayTickets = tickets.filter(t => t.id.includes(dateStr));
  const nextNumber = (todayTickets.length + 1).toString().padStart(4, '0');
  
  return `TCKT-${dateStr}-${nextNumber}`;
};

export const createTicket = (data) => {
  const ticket = {
    id: generateTicketId(),
    subject: data.subject,
    description: data.description,
    priority: data.priority,
    status: 'pending',
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveTicket(ticket);
  
  // Create notification email to customer
  createEmail({
    toUserId: data.createdBy,
    fromUserId: 'user_admin',
    subject: `Ticket Received: ${ticket.id}`,
    body: `We have received your ticket "${ticket.subject}". Our team is working on it and will contact you soon.`
  });
  
  return ticket;
};

export const assignTicket = (ticketId, agentId) => {
  const ticket = getTicketById(ticketId);
  if (!ticket) return;
  
  ticket.assignedTo = agentId;
  ticket.status = 'assigned';
  ticket.updatedAt = new Date().toISOString();
  
  saveTicket(ticket);
  
  // Create notification email to customer
  createEmail({
    toUserId: ticket.createdBy,
    fromUserId: 'user_admin',
    subject: `Ticket Assigned: ${ticket.id}`,
    body: `Your ticket "${ticket.subject}" has been assigned to our team and is being worked on.`
  });
};

export const updateTicketStatus = (ticketId, status) => {
  const ticket = getTicketById(ticketId);
  if (!ticket) return;
  
  const oldStatus = ticket.status;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  
  saveTicket(ticket);
  
  // Create notification email to customer when resolved
  if (status === 'resolved' && oldStatus !== 'resolved') {
    createEmail({
      toUserId: ticket.createdBy,
      fromUserId: ticket.assignedTo || 'user_admin',
      subject: `Ticket Resolved: ${ticket.id}`,
      body: `Your ticket "${ticket.subject}" has been resolved. Thank you for using our support system.`
    });
  }
  
  // Emit storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'tms_tickets',
    newValue: JSON.stringify(getAllTickets())
  }));
};

export const getTicketsForUser = (userId, role) => {
  return getTicketsByUserId(userId, role);
};

export const getTicketsByStatus = (status) => {
  return getAllTickets().filter(t => t.status === status);
};

export const searchTickets = (query) => {
  const tickets = getAllTickets();
  const lowercaseQuery = query.toLowerCase();
  
  return tickets.filter(ticket => 
    ticket.id.toLowerCase().includes(lowercaseQuery) ||
    ticket.subject.toLowerCase().includes(lowercaseQuery) ||
    ticket.description.toLowerCase().includes(lowercaseQuery)
  );
};