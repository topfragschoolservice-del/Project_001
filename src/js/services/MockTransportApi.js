export class MockTransportApi {
  constructor(state) {
    this.state = state;
  }

  async markAttendance(studentId, attending, returnTrip) {
    return this.state.markAttendance(studentId, attending, returnTrip);
  }

  async markPickup(studentId) {
    return this.state.markPickup(studentId, "picked");
  }

  async markDropoff(studentId) {
    return this.state.markDropoff(studentId, "dropped");
  }

  async completePayment(studentId) {
    return this.state.completePayment(studentId);
  }

  async advanceVehicle() {
    this.state.simulateProgress();
    return this.state.vehicleProgress;
  }

  async simulateDayFlow() {
    this.state.students.forEach((s) => {
      if (!s.attending) return;
      s.pickup = Math.random() > 0.12 ? "picked" : "pending";
      s.drop = s.returnTrip ? (Math.random() > 0.22 ? "dropped" : "pending") : "n/a";
    });
    return true;
  }

  async createRoute(payload) {
    return this.state.createRoute(payload);
  }

  async assignDriverToRoute(routeId, driverId) {
    return this.state.assignDriverToRoute(routeId, driverId);
  }

  async updateRoute(routeId, payload) {
    return this.state.updateRoute(routeId, payload);
  }

  async deleteRoute(routeId) {
    return this.state.deleteRoute(routeId);
  }

  async createStudent(payload) {
    return this.state.createStudent(payload);
  }

  async updateStudentRoute(studentId, route) {
    return this.state.updateStudentRoute(studentId, route);
  }

  async deleteStudent(studentId) {
    return this.state.deleteStudent(studentId);
  }

  async createDriver(payload) {
    return this.state.createDriver(payload);
  }

  async updateDriverStatus(driverId, status) {
    return this.state.updateDriverStatus(driverId, status);
  }

  async deleteDriver(driverId) {
    return this.state.deleteDriver(driverId);
  }
}
