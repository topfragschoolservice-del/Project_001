export class ReportExportService {
  static toCsv(rows) {
    return rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
  }

  static downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static buildMonthlyReportRows({ period, metrics, students, history }) {
    const rows = [
      ["Smart School Transport Monthly Report"],
      ["Period", period],
      ["Generated At", new Date().toISOString()],
      [],
      ["Summary Metrics"],
      ["Attendance Rate", `${metrics.attendanceRate}%`],
      ["Pickup On-Time", `${metrics.pickupOnTime}%`],
      ["Payment Completion", `${metrics.paymentCompletion}%`],
      [],
      ["Student Payment Snapshot"],
      ["Student ID", "Student Name", "Route", "Payment Due (LKR)", "Attending", "Return Trip"],
      ...students.map((s) => [s.id, s.name, s.route, s.paymentDue, s.attending ? "Yes" : "No", s.returnTrip ? "Yes" : "No"]),
      [],
      ["Recent History"],
      ["Timestamp", "Type", "Student", "Details"],
      ...history.map((h) => [new Date(h.createdAt).toISOString(), h.type, h.student, h.details]),
    ];

    return rows;
  }
}
