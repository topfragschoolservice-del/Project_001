export class TransportState {
  constructor() {
    this.schoolName = "Greenfield International School";
    this.date = new Date();
    this.students = [
      { id: "S-101", name: "Nethmi Perera", route: "Route A", attending: true, returnTrip: true, pickup: "pending", drop: "pending", paymentDue: 8500 },
      { id: "S-102", name: "Sahan Jayasinghe", route: "Route B", attending: true, returnTrip: false, pickup: "pending", drop: "pending", paymentDue: 8500 },
      { id: "S-103", name: "Rivinu Fernando", route: "Route A", attending: false, returnTrip: false, pickup: "n/a", drop: "n/a", paymentDue: 0 },
      { id: "S-104", name: "Amaya Wickramasinghe", route: "Route C", attending: true, returnTrip: true, pickup: "pending", drop: "pending", paymentDue: 9000 },
    ];
    this.drivers = [
      { id: "D-01", name: "Kasun Silva", route: "Route A", status: "On time" },
      { id: "D-02", name: "Niroshan Gamage", route: "Route B", status: "Delayed 5 mins" },
      { id: "D-03", name: "Sampath Nadeeka", route: "Route C", status: "On time" },
    ];
    this.vehicleProgress = 26;
    this.monthlyReport = {
      attendanceRate: 93,
      pickupOnTime: 89,
      paymentCompletion: 84,
    };
  }

  markAttendance(studentId, attending, returnTrip) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.attending = attending;
    student.returnTrip = returnTrip;
    if (!attending) {
      student.pickup = "n/a";
      student.drop = "n/a";
    }
    return student;
  }

  markPickup(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.pickup = status;
    return student;
  }

  markDropoff(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.drop = status;
    return student;
  }

  completePayment(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.paymentDue = 0;
    return student;
  }

  simulateProgress() {
    this.vehicleProgress = Math.min(100, this.vehicleProgress + Math.floor(Math.random() * 22 + 8));
    if (this.vehicleProgress >= 100) {
      this.vehicleProgress = 0;
    }
  }

  snapshot() {
    return {
      schoolName: this.schoolName,
      date: this.date.toISOString(),
      students: this.students,
      drivers: this.drivers,
      vehicleProgress: this.vehicleProgress,
      monthlyReport: this.monthlyReport,
    };
  }

  hydrate(payload) {
    if (!payload) return;
    this.schoolName = payload.schoolName || this.schoolName;
    this.date = payload.date ? new Date(payload.date) : this.date;
    this.students = Array.isArray(payload.students) ? payload.students : this.students;
    this.drivers = Array.isArray(payload.drivers) ? payload.drivers : this.drivers;
    this.vehicleProgress = typeof payload.vehicleProgress === "number" ? payload.vehicleProgress : this.vehicleProgress;
    this.monthlyReport = payload.monthlyReport || this.monthlyReport;
  }
}
