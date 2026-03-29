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
}
