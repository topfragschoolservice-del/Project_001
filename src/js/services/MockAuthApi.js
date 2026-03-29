export class MockAuthApi {
  constructor() {
    this.users = [
      { email: "parent@school.lk", password: "parent123", role: "parent", name: "Parent User" },
      { email: "driver@school.lk", password: "driver123", role: "driver", name: "Driver User" },
      { email: "admin@school.lk", password: "admin123", role: "admin", name: "Admin User" },
    ];
  }

  async authenticate(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = this.users.find((entry) => entry.email === normalizedEmail && entry.password === password);
    if (!user) return null;

    return {
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
