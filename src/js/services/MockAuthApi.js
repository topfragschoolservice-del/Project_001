export class MockAuthApi {
  constructor() {
    this.storageKey = "smart-transport-auth-users";
    this.seedUsers = [
      { email: "parent@school.lk", password: "parent123", role: "parent", name: "Parent User" },
      { email: "driver@school.lk", password: "driver123", role: "driver", name: "Driver User" },
      { email: "admin@school.lk", password: "admin123", role: "admin", name: "Admin User" },
    ];
    this.users = [...this.seedUsers, ...this.loadCustomUsers()];
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

  async register({ name, email, phone, password, role }) {
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();
    const normalizedPassword = String(password || "").trim();
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedPassword || !normalizedRole) {
      return { ok: false, error: "All registration fields are required" };
    }

    if (normalizedPassword.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters" };
    }

    if (!["parent", "driver", "admin"].includes(normalizedRole)) {
      return { ok: false, error: "Invalid role selected" };
    }

    const existing = this.users.some((entry) => entry.email === normalizedEmail);
    if (existing) {
      return { ok: false, error: "Email already exists. Please login." };
    }

    const newUser = {
      email: normalizedEmail,
      phone: normalizedPhone,
      password: normalizedPassword,
      role: normalizedRole,
      name: normalizedName,
    };

    this.users.push(newUser);
    this.saveCustomUsers();

    return {
      ok: true,
      user: {
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        name: newUser.name,
      },
    };
  }

  loadCustomUsers() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((entry) => entry && entry.email && entry.password && entry.role && entry.name)
        .map((entry) => ({
          email: String(entry.email).trim().toLowerCase(),
          phone: String(entry.phone || "").trim(),
          password: String(entry.password),
          role: String(entry.role).trim().toLowerCase(),
          name: String(entry.name).trim(),
        }));
    } catch {
      return [];
    }
  }

  saveCustomUsers() {
    const seedEmails = new Set(this.seedUsers.map((entry) => entry.email));
    const customUsers = this.users.filter((entry) => !seedEmails.has(entry.email));
    localStorage.setItem(this.storageKey, JSON.stringify(customUsers));
  }
}
