// Main JavaScript file for general functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize storage service and sample data
  storageService.initializeSampleData();
  
  // General utility functions for all pages
  window.utils = {
    formatDate: (dateString) => new Date(dateString).toLocaleDateString(),
    formatDateTime: (dateString) => new Date(dateString).toLocaleString(),
    escapeHtml: (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };
  
  // Global event listeners
  
  // Close modal on outside click
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      });
    }
  });
  
  // Auto-hide toast notifications
  const toastElements = document.querySelectorAll('.toast');
  toastElements.forEach(toast => {
    if (toast.style.display === 'block') {
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }
  });
  
  // Form validation helpers
  window.validateForm = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: (password) => /^(?=.*\d).{8,}$/.test(password),
    required: (value) => value && value.trim().length > 0
  };
});