export class TransportService {
  constructor(api, events) {
    this.api = api;
    this.events = events;
  }

  async markAttendance(studentId, attending, returnTrip) {
    const student = await this.api.markAttendance(studentId, attending, returnTrip);
    if (!student) return null;
    this.events.push(`${student.name} attendance updated by parent`, attending ? "info" : "warn", "attendance");
    return student;
  }

  async markStudentMovement(studentId, moveType) {
    const student = moveType === "pickup"
      ? await this.api.markPickup(studentId)
      : await this.api.markDropoff(studentId);
    if (!student) return null;

    const category = moveType === "pickup" ? "pickup" : "dropoff";
    this.events.push(`${student.name} ${moveType === "pickup" ? "picked up" : "dropped off"}`, "info", category);
    return student;
  }

  async completePayment(studentId) {
    const student = await this.api.completePayment(studentId);
    if (!student) return null;
    this.events.push(`Payment received for ${student.name}`, "info", "payment");
    return student;
  }

  async advanceVehicleProgress() {
    const progress = await this.api.advanceVehicle();
    this.events.push(`Vehicle progress updated to ${progress}%`, "info", "tracking");
    return progress;
  }

  async sendDelayAlert() {
    this.events.push("Delay alert sent to affected parents", "warn", "admin");
    return true;
  }

  async generateDailySummary() {
    this.events.push("Daily transport report generated", "info", "admin");
    return true;
  }

  async simulateSchoolDay() {
    await this.api.simulateDayFlow();
    this.events.push("Simulation executed for pickup and drop-off flow", "info", "system");
    return true;
  }

  async createRoute(payload) {
    const route = await this.api.createRoute(payload);
    if (!route) return null;
    this.events.push(`Route created: ${route.name}`, "info", "admin");
    return route;
  }

  async assignDriverToRoute(routeId, driverId) {
    const route = await this.api.assignDriverToRoute(routeId, driverId);
    if (!route) return null;
    this.events.push(`Driver assigned to ${route.name}`, "info", "admin");
    return route;
  }

  async updateRoute(routeId, payload) {
    const route = await this.api.updateRoute(routeId, payload);
    if (!route) return null;
    this.events.push(`Route updated: ${route.name}`, "info", "admin");
    return route;
  }

  async deleteRoute(routeId) {
    const route = await this.api.deleteRoute(routeId);
    if (!route) return null;
    this.events.push(`Route removed: ${route.name}`, "warn", "admin");
    return route;
  }

  async createStudent(payload) {
    const student = await this.api.createStudent(payload);
    if (!student) return null;
    this.events.push(`Student added: ${student.name}`, "info", "admin");
    return student;
  }

  async updateStudentRoute(studentId, route) {
    const student = await this.api.updateStudentRoute(studentId, route);
    if (!student) return null;
    this.events.push(`Student route updated: ${student.name} -> ${route}`, "info", "admin");
    return student;
  }

  async deleteStudent(studentId) {
    const student = await this.api.deleteStudent(studentId);
    if (!student) return null;
    this.events.push(`Student removed: ${student.name}`, "warn", "admin");
    return student;
  }

  async createDriver(payload) {
    const driver = await this.api.createDriver(payload);
    if (!driver) return null;
    this.events.push(`Driver added: ${driver.name}`, "info", "admin");
    return driver;
  }

  async updateDriverStatus(driverId, status) {
    const driver = await this.api.updateDriverStatus(driverId, status);
    if (!driver) return null;
    this.events.push(`Driver status updated: ${driver.name} -> ${status}`, "info", "admin");
    return driver;
  }

  async deleteDriver(driverId) {
    const driver = await this.api.deleteDriver(driverId);
    if (!driver) return null;
    this.events.push(`Driver removed: ${driver.name}`, "warn", "admin");
    return driver;
  }
}
