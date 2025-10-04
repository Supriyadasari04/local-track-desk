import { 
  getUserByEmail, 
  saveUser, 
  setCurrentUser, 
  clearCurrentUser, 
  getCurrentUser
} from './storageService';

// Validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 8 characters, at least 1 digit
  const passwordRegex = /^(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateSignup = (data) => {
  const errors = [];
  
  if (!data.email) errors.push('Email is required');
  else if (!validateEmail(data.email)) errors.push('Invalid email format');
  
  if (!data.username) errors.push('Username is required');
  else if (data.username.length < 2) errors.push('Username must be at least 2 characters');
  
  if (!data.password) errors.push('Password is required');
  else if (!validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters with at least 1 digit');
  }
  
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  if (!data.role) errors.push('Role is required');
  
  // Check if email already exists
  if (data.email && getUserByEmail(data.email)) {
    errors.push('Email already exists');
  }
  
  return errors;
};

export const signup = (data) => {
  const errors = validateSignup(data);
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  const newUser = {
    id: `user_${Date.now()}`,
    email: data.email,
    username: data.username,
    password: data.password, // Note: In production, this should be hashed
    role: data.role,
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  saveUser(newUser);
  setCurrentUser(newUser.id);
  
  return { success: true, user: newUser };
};

export const login = (data) => {
  if (!data.email || !data.password) {
    return { success: false, error: 'Email and password are required' };
  }
  
  const user = getUserByEmail(data.email);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.password !== data.password) {
    return { success: false, error: 'Invalid password' };
  }
  
  if (!user.isActive) {
    return { success: false, error: 'Account is deactivated' };
  }
  
  setCurrentUser(user.id);
  return { success: true, user };
};

export const logout = () => {
  clearCurrentUser();
};

export const getLoggedInUser = () => {
  return getCurrentUser();
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};