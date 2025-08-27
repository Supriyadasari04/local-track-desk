// Email Service - In-app notification system
const emailService = {
  createEmail(data) {
    const email = {
      id: `email_${Date.now()}`,
      toUserId: data.toUserId,
      fromUserId: data.fromUserId,
      subject: data.subject,
      body: data.body,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    storageService.saveEmail(email);
    return email;
  },

  getEmailsForUser(userId) {
    return storageService.getEmailsForUser(userId);
  },

  markAsRead(emailId) {
    const emails = storageService.getAllEmails();
    const email = emails.find(e => e.id === emailId);
    if (email) {
      email.isRead = true;
      storageService.setItem(storageService.KEYS.EMAILS, emails);
    }
  },

  getUnreadCount(userId) {
    const emails = this.getEmailsForUser(userId);
    return emails.filter(email => !email.isRead).length;
  }
};