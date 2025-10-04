// Local Storage Service for Ticket Management System

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'tms_users',
  TICKETS: 'tms_tickets',
  EMAILS: 'tms_emails',
  CURRENT_USER: 'tms_currentUserId'
};

// Utility functions for safe localStorage operations
const safeGetItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// User Management
export const getAllUsers = () => {
  return safeGetItem(STORAGE_KEYS.USERS, []);
};

export const saveUser = (user) => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  safeSetItem(STORAGE_KEYS.USERS, users);
};

export const deleteUser = (userId) => {
  const users = getAllUsers().filter(u => u.id !== userId);
  safeSetItem(STORAGE_KEYS.USERS, users);
};

export const getUserById = (id) => {
  return getAllUsers().find(u => u.id === id) || null;
};

export const getUserByEmail = (email) => {
  return getAllUsers().find(u => u.email === email) || null;
};

// Current User Management
export const setCurrentUser = (userId) => {
  safeSetItem(STORAGE_KEYS.CURRENT_USER, userId);
};

export const getCurrentUser = () => {
  const userId = safeGetItem(STORAGE_KEYS.CURRENT_USER, null);
  return userId ? getUserById(userId) : null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Ticket Management
export const getAllTickets = () => {
  return safeGetItem(STORAGE_KEYS.TICKETS, []);
};

export const saveTicket = (ticket) => {
  const tickets = getAllTickets();
  const existingIndex = tickets.findIndex(t => t.id === ticket.id);
  
  if (existingIndex >= 0) {
    tickets[existingIndex] = ticket;
  } else {
    tickets.push(ticket);
  }
  
  safeSetItem(STORAGE_KEYS.TICKETS, tickets);
};

export const getTicketById = (id) => {
  return getAllTickets().find(t => t.id === id) || null;
};

export const getTicketsByUserId = (userId, role) => {
  const tickets = getAllTickets();
  
  switch (role) {
    case 'customer':
      return tickets.filter(t => t.createdBy === userId);
    case 'agent':
      return tickets.filter(t => t.assignedTo === userId);
    case 'admin':
      return tickets;
    default:
      return [];
  }
};

// Email Management
export const getAllEmails = () => {
  return safeGetItem(STORAGE_KEYS.EMAILS, []);
};

export const saveEmail = (email) => {
  const emails = getAllEmails();
  emails.push(email);
  safeSetItem(STORAGE_KEYS.EMAILS, emails);
};

export const getEmailsByUserId = (userId) => {
  return getAllEmails().filter(e => e.toUserId === userId);
};

export const markEmailAsRead = (emailId) => {
  const emails = getAllEmails();
  const email = emails.find(e => e.id === emailId);
  if (email) {
    email.isRead = true;
    safeSetItem(STORAGE_KEYS.EMAILS, emails);
  }
};

// Initialize sample data
export const initializeSampleData = () => {
  if (getAllUsers().length === 0) {
    const sampleUsers = [
      {
        id: 'user_admin',
        email: 'admin@tms.com',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user_agent1',
        email: 'agent1@tms.com',
        username: 'Agent Smith',
        password: 'agent123',
        role: 'agent',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user_customer1',
        email: 'customer@example.com',
        username: 'John Doe',
        password: 'customer123',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
    
    safeSetItem(STORAGE_KEYS.USERS, sampleUsers);
  }
};