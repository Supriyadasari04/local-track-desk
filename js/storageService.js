// Storage Service - Centralized localStorage management
const storageService = {
  // Storage keys
  KEYS: {
    USERS: 'tms_users',
    TICKETS: 'tms_tickets',
    EMAILS: 'tms_emails',
    CURRENT_USER: 'tms_currentUserId'
  },

  // Generic storage methods
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // User management
  getAllUsers() {
    return this.getItem(this.KEYS.USERS) || [];
  },

  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  },

  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  },

  saveUser(user) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    this.setItem(this.KEYS.USERS, users);
  },

  deleteUser(userId) {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    this.setItem(this.KEYS.USERS, filteredUsers);
  },

  // Current user management
  setCurrentUser(userId) {
    this.setItem(this.KEYS.CURRENT_USER, userId);
  },

  getCurrentUser() {
    const userId = this.getItem(this.KEYS.CURRENT_USER);
    return userId ? this.getUserById(userId) : null;
  },

  clearCurrentUser() {
    this.removeItem(this.KEYS.CURRENT_USER);
  },

  // Ticket management
  getAllTickets() {
    return this.getItem(this.KEYS.TICKETS) || [];
  },

  getTicketById(id) {
    const tickets = this.getAllTickets();
    return tickets.find(ticket => ticket.id === id) || null;
  },

  saveTicket(ticket) {
    const tickets = this.getAllTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    
    if (index >= 0) {
      tickets[index] = ticket;
    } else {
      tickets.push(ticket);
    }
    
    this.setItem(this.KEYS.TICKETS, tickets);
    
    // Emit storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.KEYS.TICKETS,
      newValue: JSON.stringify(tickets)
    }));
  },

  getTicketsByUserId(userId, role) {
    const tickets = this.getAllTickets();
    
    switch (role) {
      case 'customer':
        return tickets.filter(ticket => ticket.createdBy === userId);
      case 'agent':
        return tickets.filter(ticket => ticket.assignedTo === userId);
      case 'admin':
        return tickets;
      default:
        return [];
    }
  },

  // Email management
  getAllEmails() {
    return this.getItem(this.KEYS.EMAILS) || [];
  },

  saveEmail(email) {
    const emails = this.getAllEmails();
    emails.push(email);
    this.setItem(this.KEYS.EMAILS, emails);
    
    // Emit storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: this.KEYS.EMAILS,
      newValue: JSON.stringify(emails)
    }));
  },

  getEmailsForUser(userId) {
    const emails = this.getAllEmails();
    return emails
      .filter(email => email.toUserId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Initialize with sample data
  initializeSampleData() {
    // Check if data already exists
    if (this.getAllUsers().length > 0) {
      return;
    }

    // Sample users
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
        username: 'agent1',
        password: 'agent123',
        role: 'agent',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user_agent2',
        email: 'agent2@tms.com',
        username: 'agent2',
        password: 'agent123',
        role: 'agent',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 'user_customer1',
        email: 'customer@example.com',
        username: 'customer1',
        password: 'customer123',
        role: 'customer',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];

    this.setItem(this.KEYS.USERS, sampleUsers);

    // Sample tickets
    const sampleTickets = [
      {
        id: 'TCKT-20250827-0001',
        subject: 'Login Issue',
        description: 'Cannot login to my account with correct credentials.',
        priority: 'High',
        status: 'pending',
        createdBy: 'user_customer1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'TCKT-20250827-0002',
        subject: 'Feature Request',
        description: 'Would like to have dark mode option in the application.',
        priority: 'Low',
        status: 'assigned',
        createdBy: 'user_customer1',
        assignedTo: 'user_agent1',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 21600000).toISOString()
      }
    ];

    this.setItem(this.KEYS.TICKETS, sampleTickets);

    // Sample emails
    const sampleEmails = [
      {
        id: 'email_001',
        toUserId: 'user_customer1',
        fromUserId: 'user_admin',
        subject: 'Ticket Received: TCKT-20250827-0001',
        body: 'We have received your ticket "Login Issue". Our team is working on it and will contact you soon.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: false
      },
      {
        id: 'email_002',
        toUserId: 'user_customer1',
        fromUserId: 'user_admin',
        subject: 'Ticket Assigned: TCKT-20250827-0002',
        body: 'Your ticket "Feature Request" has been assigned to our team and is being worked on.',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        isRead: false
      }
    ];

    this.setItem(this.KEYS.EMAILS, sampleEmails);
  }
};

// Initialize sample data on load
document.addEventListener('DOMContentLoaded', function() {
  storageService.initializeSampleData();
});