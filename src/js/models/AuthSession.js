export class AuthSession {
  constructor() {
    this.currentRole = null;
    this.currentUser = null;
    this.accessMap = {
      parent: ["parent", "tracking", "reports", "payments"],
      driver: ["driver", "tracking"],
      admin: ["dashboard", "parent", "driver", "tracking", "reports", "routes", "admin", "payments"],
    };
  }

  login(role, user = null) {
    if (!this.accessMap[role]) {
      return false;
    }
    this.currentRole = role;
    this.currentUser = user;
    return true;
  }

  loginWithUser(user) {
    if (!user || !user.role || !this.accessMap[user.role]) {
      return false;
    }
    this.currentRole = user.role;
    this.currentUser = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return true;
  }

  logout() {
    this.currentRole = null;
    this.currentUser = null;
  }

  isLoggedIn() {
    return Boolean(this.currentRole);
  }

  allowedModules() {
    if (!this.currentRole) return [];
    return this.accessMap[this.currentRole];
  }

  snapshot() {
    return {
      currentRole: this.currentRole,
      currentUser: this.currentUser,
    };
  }

  hydrate(payload) {
    if (!payload || !payload.currentRole) {
      this.currentRole = null;
      this.currentUser = null;
      return;
    }
    this.currentRole = this.accessMap[payload.currentRole] ? payload.currentRole : null;
    this.currentUser = payload.currentUser || null;
  }
}
