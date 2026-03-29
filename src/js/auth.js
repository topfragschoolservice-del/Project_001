/**
 * Auth.js - Standalone authentication handler for login.html and register.html
 * Handles form submission and redirects to index.html on success
 */

import { AuthService } from './services/AuthService.js';
import { MockAuthApi } from './services/MockAuthApi.js';

class AuthPage {
  constructor() {
    const silentEvents = { push: () => {} };
    this.authService = new AuthService(new MockAuthApi(), silentEvents);
    this.children = [];
    this.setupEventListeners();
    this.checkIfAlreadyLoggedIn();
  }

  checkIfAlreadyLoggedIn() {
    const authData = localStorage.getItem('smart-transport-auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.email) {
          window.location.href = 'index.html';
        }
      } catch (e) {
        // Invalid auth data, continue
      }
    }
  }

  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerRole = document.getElementById('registerRole');
    const childrenSection = document.getElementById('childrenSection');
    const addChildBtn = document.getElementById('addChildBtn');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Show/hide children section based on role selection
    if (registerRole) {
      registerRole.addEventListener('change', (e) => {
        if (childrenSection) {
          const isParent = e.target.value === 'parent';
          childrenSection.style.display = isParent ? 'block' : 'none';
          if (!isParent) {
            this.children = [];
            this.renderChildren();
          }
        }
      });
    }

    // Add child button
    if (addChildBtn) {
      addChildBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addChild();
      });
    }
  }

  addChild() {
    const childName = prompt('Enter child\'s full name:');
    if (childName && childName.trim()) {
      this.children.push({
        id: Date.now(),
        name: childName.trim()
      });
      this.renderChildren();
    }
  }

  removeChild(id) {
    this.children = this.children.filter(child => child.id !== id);
    this.renderChildren();
  }

  renderChildren() {
    const container = document.getElementById('childrenContainer');
    if (!container) return;

    if (this.children.length === 0) {
      container.innerHTML = '<p class="soft" style="text-align: center; padding: 0.5rem;">No children added yet</p>';
      return;
    }

    container.innerHTML = this.children.map(child => `
      <div class="child-item">
        <span>${child.name}</span>
        <button type="button" class="remove-child-btn" data-id="${child.id}">Remove</button>
      </div>
    `).join('');

    // Add event listeners to remove buttons
    container.querySelectorAll('.remove-child-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.removeChild(parseInt(btn.dataset.id));
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();

    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!loginEmail.value || !loginPassword.value) {
      alert('Please fill in all fields');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const user = await this.authService.login(loginEmail.value, loginPassword.value);

      if (!user) {
        alert('Invalid email or password');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        return;
      }

      // Store user auth data in localStorage for Application.js to restore
      localStorage.setItem('smart-transport-auth', JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone || '',
        children: user.children || []
      }));

      // Success - redirect to home
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPhone = document.getElementById('registerPhone');
    const registerPassword = document.getElementById('registerPassword');
    const registerRole = document.getElementById('registerRole');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validation
    if (!registerName.value || !registerEmail.value || !registerPhone.value || !registerPassword.value || !registerRole.value) {
      alert('Please fill in all fields');
      return;
    }

    if (registerPassword.value.length < 6) {
      alert('Password must be at least 6 characters');
      registerPassword.focus();
      return;
    }

    // Validate phone format (basic)
    if (!registerPhone.value.match(/^[\d\s\-\+]+$/)) {
      alert('Please enter a valid phone number');
      registerPhone.focus();
      return;
    }

    // Validate children if parent
    if (registerRole.value === 'parent' && this.children.length === 0) {
      alert('Parents must add at least one child');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const user = await this.authService.register(
        registerName.value,
        registerEmail.value,
        registerPassword.value,
        registerRole.value,
        registerPhone.value,
        this.children
      );

      if (!user) {
        alert('Failed to create account. Email might already be in use.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        return;
      }

      // Store user auth data in localStorage for Application.js to restore
      localStorage.setItem('smart-transport-auth', JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone || '',
        children: user.children || []
      }));

      // Success - redirect to home
      alert('Account created successfully! You are now logged in.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }
}

// Initialize auth page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AuthPage();
});
