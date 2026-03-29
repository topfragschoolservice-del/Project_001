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
}
