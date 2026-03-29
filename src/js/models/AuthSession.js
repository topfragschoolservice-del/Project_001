export class AuthSession {
  constructor() {
    this.currentRole = null;
    this.accessMap = {
      parent: ["parent", "tracking", "payments"],
      driver: ["driver", "tracking"],
      admin: ["dashboard", "parent", "driver", "tracking", "admin", "payments"],
    };
  }

  login(role) {
    if (!this.accessMap[role]) {
      return false;
    }
    this.currentRole = role;
    return true;
  }

  logout() {
    this.currentRole = null;
  }

  isLoggedIn() {
    return Boolean(this.currentRole);
  }

  allowedModules() {
    if (!this.currentRole) return [];
    return this.accessMap[this.currentRole];
  }

  snapshot() {
    return { currentRole: this.currentRole };
  }

  hydrate(payload) {
    if (!payload || !payload.currentRole) {
      this.currentRole = null;
      return;
    }
    this.currentRole = this.accessMap[payload.currentRole] ? payload.currentRole : null;
  }
}
