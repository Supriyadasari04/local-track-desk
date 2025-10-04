import { 
  getAllEmails, 
  saveEmail, 
  getEmailsByUserId, 
  markEmailAsRead
} from './storageService';

export const createEmail = (data) => {
  const email = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    toUserId: data.toUserId,
    fromUserId: data.fromUserId,
    subject: data.subject,
    body: data.body,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  saveEmail(email);
  
  // Emit storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'tms_emails',
    newValue: JSON.stringify(getAllEmails())
  }));
  
  return email;
};

export const getUserEmails = (userId) => {
  return getEmailsByUserId(userId).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const getUnreadCount = (userId) => {
  return getEmailsByUserId(userId).filter(e => !e.isRead).length;
};

export const markAsRead = (emailId) => {
  markEmailAsRead(emailId);
  
  // Emit storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'tms_emails',
    newValue: JSON.stringify(getAllEmails())
  }));
};