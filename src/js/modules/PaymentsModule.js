import { BaseModule } from "./BaseModule.js";

export class PaymentsModule extends BaseModule {
  render(root) {
    root.innerHTML = `
      <h2>Secure Payments</h2>
      <p class="soft">Parents can pay online and receive receipts</p>
      <div class="split">
        <div class="block">
          <h3>Outstanding Fees</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Due (LKR)</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${this.state.students.map((s) => `
                  <tr>
                    <td>${s.name}</td>
                    <td>${s.paymentDue.toLocaleString()}</td>
                    <td><span class="badge ${s.paymentDue === 0 ? "ok" : "warn"}">${s.paymentDue === 0 ? "paid" : "pending"}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="block">
          <h3>Mock Online Payment</h3>
          <form id="payForm">
            <div>
              <label for="payStudent">Student</label>
              <select id="payStudent">${this.state.students.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select>
            </div>
            <div>
              <label for="payMethod">Payment Method</label>
              <select id="payMethod">
                <option>Card</option>
                <option>Bank Transfer</option>
                <option>Mobile Wallet</option>
              </select>
            </div>
            <button class="btn primary" type="submit">Complete Payment</button>
          </form>
        </div>
      </div>
    `;

    root.querySelector("#payForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const studentId = root.querySelector("#payStudent").value;
      const student = this.state.completePayment(studentId);
      if (!student) return;
      this.events.push(`Payment received for ${student.name}`, "info", "payment");
      this.onChange();
    });
  }
}
