// Local Storage Service for Ticket Management System
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'agent' | 'customer';
  createdAt: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  toUserId: string;
  fromUserId: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'tms_users',
  TICKETS: 'tms_tickets',
  EMAILS: 'tms_emails',
  CURRENT_USER: 'tms_currentUserId'
} as const;

// Utility functions for safe localStorage operations
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const safeSetItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// User Management
export const getAllUsers = (): User[] => {
  return safeGetItem(STORAGE_KEYS.USERS, []);
};

export const saveUser = (user: User): void => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  safeSetItem(STORAGE_KEYS.USERS, users);
};

export const deleteUser = (userId: string): void => {
  const users = getAllUsers().filter(u => u.id !== userId);
  safeSetItem(STORAGE_KEYS.USERS, users);
};

export const getUserById = (id: string): User | null => {
  return getAllUsers().find(u => u.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  return getAllUsers().find(u => u.email === email) || null;
};

// Current User Management
export const setCurrentUser = (userId: string): void => {
  safeSetItem(STORAGE_KEYS.CURRENT_USER, userId);
};

export const getCurrentUser = (): User | null => {
  const userId = safeGetItem(STORAGE_KEYS.CURRENT_USER, null);
  return userId ? getUserById(userId) : null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Ticket Management
export const getAllTickets = (): Ticket[] => {
  return safeGetItem(STORAGE_KEYS.TICKETS, []);
};

export const saveTicket = (ticket: Ticket): void => {
  const tickets = getAllTickets();
  const existingIndex = tickets.findIndex(t => t.id === ticket.id);
  
  if (existingIndex >= 0) {
    tickets[existingIndex] = ticket;
  } else {
    tickets.push(ticket);
  }
  
  safeSetItem(STORAGE_KEYS.TICKETS, tickets);
};

export const getTicketById = (id: string): Ticket | null => {
  return getAllTickets().find(t => t.id === id) || null;
};

export const getTicketsByUserId = (userId: string, role: string): Ticket[] => {
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
export const getAllEmails = (): Email[] => {
  return safeGetItem(STORAGE_KEYS.EMAILS, []);
};

export const saveEmail = (email: Email): void => {
  const emails = getAllEmails();
  emails.push(email);
  safeSetItem(STORAGE_KEYS.EMAILS, emails);
};

export const getEmailsByUserId = (userId: string): Email[] => {
  return getAllEmails().filter(e => e.toUserId === userId);
};

export const markEmailAsRead = (emailId: string): void => {
  const emails = getAllEmails();
  const email = emails.find(e => e.id === emailId);
  if (email) {
    email.isRead = true;
    safeSetItem(STORAGE_KEYS.EMAILS, emails);
  }
};

// Initialize sample data
export const initializeSampleData = (): void => {
  if (getAllUsers().length === 0) {
    const sampleUsers: User[] = [
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