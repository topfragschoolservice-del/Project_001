export class AuthService {
  constructor(authApi, events) {
    this.authApi = authApi;
    this.events = events;
  }

  async login(email, password) {
    const user = await this.authApi.authenticate(email, password);
    if (!user) {
      this.events.push("Invalid email or password", "warn", "auth");
      return null;
    }

    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    this.events.push(`${user.name} signed in as ${roleLabel}`, "info", "auth");
    return user;
  }

  async logout(userName, role) {
    if (!userName || !role) return;
    this.events.push(`${userName} signed out`, "info", "auth");
  }

  async register(name, email, phone, password, role) {
    const result = await this.authApi.register({ name, email, phone, password, role });
    if (!result?.ok) {
      this.events.push(result?.error || "Registration failed", "warn", "auth");
      return null;
    }

    const roleLabel = result.user.role.charAt(0).toUpperCase() + result.user.role.slice(1);
    this.events.push(`${result.user.name} created a ${roleLabel} account`, "info", "auth");
    return result.user;
  }
}
