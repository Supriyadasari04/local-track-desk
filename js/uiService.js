// UI Service - Common UI functionality
const uiService = {
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Clear existing classes
    toast.className = 'toast';
    
    // Add type class
    if (type) {
      toast.classList.add(type);
    }
    
    toastMessage.textContent = message;
    toast.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  },

  hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.style.display = 'none';
    }
  },

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  },

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
  },

  createElement(tag, className = '', textContent = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  },

  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  },

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};