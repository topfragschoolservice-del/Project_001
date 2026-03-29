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
    this.routes = [
      { id: "R-101", name: "Route A", start: "Malabe", end: "Greenfield School", capacity: 18, driverId: "D-01" },
      { id: "R-102", name: "Route B", start: "Kaduwela", end: "Greenfield School", capacity: 20, driverId: "D-02" },
      { id: "R-103", name: "Route C", start: "Battaramulla", end: "Greenfield School", capacity: 16, driverId: "D-03" },
    ];
    this.vehicleProgress = 26;
    this.monthlyReport = {
      attendanceRate: 93,
      pickupOnTime: 89,
      paymentCompletion: 84,
    };
    this.history = [];
  }

  logHistory(type, student, details) {
    this.history.unshift({
      id: crypto.randomUUID(),
      type,
      student,
      details,
      createdAt: new Date().toISOString(),
    });
    this.history = this.history.slice(0, 160);
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
    this.logHistory(
      "attendance",
      student.name,
      `Attend: ${attending ? "Yes" : "No"}, Return: ${returnTrip ? "Yes" : "No"}`,
    );
    return student;
  }

  markPickup(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.pickup = status;
    this.logHistory("pickup", student.name, `Pickup status changed to ${status}`);
    return student;
  }

  markDropoff(studentId, status) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.drop = status;
    this.logHistory("dropoff", student.name, `Drop-off status changed to ${status}`);
    return student;
  }

  completePayment(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.paymentDue = 0;
    this.logHistory("payment", student.name, "Transport fee marked as paid");
    return student;
  }

  simulateProgress() {
    this.vehicleProgress = Math.min(100, this.vehicleProgress + Math.floor(Math.random() * 22 + 8));
    if (this.vehicleProgress >= 100) {
      this.vehicleProgress = 0;
    }
  }

  createRoute({ name, start, end, capacity, driverId }) {
    const route = {
      id: `R-${Math.floor(100 + Math.random() * 900)}`,
      name,
      start,
      end,
      capacity,
      driverId: driverId || null,
    };
    this.routes.push(route);

    if (driverId) {
      const driver = this.drivers.find((d) => d.id === driverId);
      if (driver) driver.route = name;
    }

    return route;
  }

  assignDriverToRoute(routeId, driverId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return null;

    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;

    route.driverId = driverId;
    route.name = route.name || `Route ${routeId}`;
    driver.route = route.name;
    return route;
  }

  updateRoute(routeId, { name, start, end, capacity, driverId }) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return null;

    const previousName = route.name;

    route.name = name;
    route.start = start;
    route.end = end;
    route.capacity = capacity;

    if (driverId) {
      route.driverId = driverId;
    }

    if (previousName !== route.name) {
      this.students.forEach((s) => {
        if (s.route === previousName) {
          s.route = route.name;
        }
      });

      this.drivers.forEach((d) => {
        if (d.route === previousName) {
          d.route = route.name;
        }
      });
    }

    const assignedDriver = this.drivers.find((d) => d.id === route.driverId);
    if (assignedDriver) {
      assignedDriver.route = route.name;
    }

    return route;
  }

  deleteRoute(routeId) {
    const index = this.routes.findIndex((r) => r.id === routeId);
    if (index === -1) return null;

    const [route] = this.routes.splice(index, 1);

    this.drivers.forEach((d) => {
      if (d.route === route.name) {
        d.route = "Unassigned";
      }
    });

    this.students.forEach((s) => {
      if (s.route === route.name) {
        s.route = "Unassigned";
      }
    });

    return route;
  }

  createStudent({ name, route, paymentDue }) {
    const nextNum = this.students.length + 101;
    const student = {
      id: `S-${nextNum}`,
      name,
      route,
      attending: true,
      returnTrip: true,
      pickup: "pending",
      drop: "pending",
      paymentDue,
    };
    this.students.push(student);
    return student;
  }

  updateStudentRoute(studentId, route) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return null;
    student.route = route;
    return student;
  }

  deleteStudent(studentId) {
    const idx = this.students.findIndex((s) => s.id === studentId);
    if (idx === -1) return null;
    const [student] = this.students.splice(idx, 1);
    return student;
  }

  createDriver({ name, status }) {
    const nextNum = this.drivers.length + 1;
    const id = `D-${String(nextNum).padStart(2, "0")}`;
    const driver = {
      id,
      name,
      route: "Unassigned",
      status,
    };
    this.drivers.push(driver);
    return driver;
  }

  updateDriverStatus(driverId, status) {
    const driver = this.drivers.find((d) => d.id === driverId);
    if (!driver) return null;
    driver.status = status;
    return driver;
  }

  deleteDriver(driverId) {
    const idx = this.drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return null;

    const [driver] = this.drivers.splice(idx, 1);
    this.routes.forEach((r) => {
      if (r.driverId === driverId) {
        r.driverId = null;
      }
    });
    return driver;
  }

  snapshot() {
    return {
      schoolName: this.schoolName,
      date: this.date.toISOString(),
      students: this.students,
      drivers: this.drivers,
      routes: this.routes,
      vehicleProgress: this.vehicleProgress,
      monthlyReport: this.monthlyReport,
      history: this.history,
    };
  }

  hydrate(payload) {
    if (!payload) return;
    this.schoolName = payload.schoolName || this.schoolName;
    this.date = payload.date ? new Date(payload.date) : this.date;
    this.students = Array.isArray(payload.students) ? payload.students : this.students;
    this.drivers = Array.isArray(payload.drivers) ? payload.drivers : this.drivers;
    this.routes = Array.isArray(payload.routes) ? payload.routes : this.routes;
    this.vehicleProgress = typeof payload.vehicleProgress === "number" ? payload.vehicleProgress : this.vehicleProgress;
    this.monthlyReport = payload.monthlyReport || this.monthlyReport;
    this.history = Array.isArray(payload.history) ? payload.history : this.history;
  }
}
