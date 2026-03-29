import { BaseModule } from "./BaseModule.js";

export class RoutesModule extends BaseModule {
  render(root) {
    const initialRoute = this.state.routes?.[0] || null;

    root.innerHTML = `
      <h2>Route Management</h2>
      <p class="soft">Create routes, assign drivers, and manage active route plans</p>

      <div class="split">
        <div class="block">
          <h3>Create New Route</h3>
          <form id="routeForm">
            <div>
              <label for="routeName">Route Name</label>
              <input id="routeName" type="text" placeholder="Route D" required />
            </div>
            <div>
              <label for="routeStart">Start Location</label>
              <input id="routeStart" type="text" placeholder="Maharagama" required />
            </div>
            <div>
              <label for="routeEnd">Destination</label>
              <input id="routeEnd" type="text" value="Greenfield School" required />
            </div>
            <div>
              <label for="routeCapacity">Capacity</label>
              <input id="routeCapacity" type="number" min="5" max="60" value="20" required />
            </div>
            <div>
              <label for="routeDriver">Assign Driver</label>
              <select id="routeDriver">
                <option value="">No driver</option>
                ${this.driverOptions()}
              </select>
            </div>
            <button type="submit" class="btn primary">Create Route</button>
          </form>

          <hr />

          <h3>Edit Existing Route</h3>
          <form id="routeEditForm">
            <div>
              <label for="editRouteId">Select Route</label>
              <select id="editRouteId">
                ${this.routeOptions()}
              </select>
            </div>
            <div>
              <label for="editRouteName">Route Name</label>
              <input id="editRouteName" type="text" value="${initialRoute ? initialRoute.name : ""}" required />
            </div>
            <div>
              <label for="editRouteStart">Start Location</label>
              <input id="editRouteStart" type="text" value="${initialRoute ? initialRoute.start : ""}" required />
            </div>
            <div>
              <label for="editRouteEnd">Destination</label>
              <input id="editRouteEnd" type="text" value="${initialRoute ? initialRoute.end : ""}" required />
            </div>
            <div>
              <label for="editRouteCapacity">Capacity</label>
              <input id="editRouteCapacity" type="number" min="5" max="60" value="${initialRoute ? initialRoute.capacity : 20}" required />
            </div>
            <div>
              <label for="editRouteDriver">Assign Driver</label>
              <select id="editRouteDriver">
                <option value="">No driver</option>
                ${this.driverOptions(initialRoute?.driverId || "")}
              </select>
            </div>
            <button type="submit" class="btn ghost" ${initialRoute ? "" : "disabled"}>Update Route</button>
          </form>
        </div>

        <div class="block">
          <h3>Active Routes</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Path</th><th>Capacity</th><th>Driver</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${this.routeRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    root.querySelector("#routeForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: root.querySelector("#routeName").value.trim(),
        start: root.querySelector("#routeStart").value.trim(),
        end: root.querySelector("#routeEnd").value.trim(),
        capacity: Number(root.querySelector("#routeCapacity").value),
        driverId: root.querySelector("#routeDriver").value || null,
      };

      if (payload.capacity < 5) {
        this.events.push("Route capacity must be at least 5", "warn", "admin");
        this.onChange();
        return;
      }

      const route = await this.transportService.createRoute(payload);
      if (!route) return;
      root.querySelector("#routeForm").reset();
      root.querySelector("#routeEnd").value = "Greenfield School";
      root.querySelector("#routeCapacity").value = 20;
      this.onChange();
    });

    const editRouteSelector = root.querySelector("#editRouteId");
    if (editRouteSelector) {
      editRouteSelector.addEventListener("change", (e) => {
        this.prefillEditForm(root, e.target.value);
      });
    }

    root.querySelector("#routeEditForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const routeId = root.querySelector("#editRouteId").value;
      if (!routeId) return;

      const payload = {
        name: root.querySelector("#editRouteName").value.trim(),
        start: root.querySelector("#editRouteStart").value.trim(),
        end: root.querySelector("#editRouteEnd").value.trim(),
        capacity: Number(root.querySelector("#editRouteCapacity").value),
        driverId: root.querySelector("#editRouteDriver").value || null,
      };

      const existingRoute = this.state.routes.find((r) => r.id === routeId);
      const assignedCount = this.studentsOnRoute(existingRoute?.name || "");
      if (payload.capacity < assignedCount) {
        this.events.push(
          `Capacity cannot be less than assigned students (${assignedCount})`,
          "warn",
          "admin",
        );
        this.onChange();
        return;
      }

      const updated = await this.transportService.updateRoute(routeId, payload);
      if (!updated) return;
      this.onChange();
    });

    root.querySelectorAll("[data-assign-driver]").forEach((select) => {
      select.addEventListener("change", async (e) => {
        const routeId = e.target.dataset.routeId;
        const driverId = e.target.value;
        if (!routeId || !driverId) return;
        await this.transportService.assignDriverToRoute(routeId, driverId);
        this.onChange();
      });
    });

    root.querySelectorAll("[data-delete-route]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const routeId = e.target.dataset.deleteRoute;
        if (!routeId) return;
        const confirmed = confirm("Delete this route? Drivers and students on this route will become unassigned.");
        if (!confirmed) return;
        await this.transportService.deleteRoute(routeId);
        this.onChange();
      });
    });
  }

  driverOptions(selectedId = "") {
    return this.state.drivers.map((d) => `
      <option value="${d.id}" ${selectedId === d.id ? "selected" : ""}>${d.name} (${d.id})</option>
    `).join("");
  }

  routeOptions(selectedId = "") {
    if (!this.state.routes || this.state.routes.length === 0) {
      return "<option value=\"\">No routes available</option>";
    }

    return this.state.routes.map((route) => `
      <option value="${route.id}" ${selectedId === route.id ? "selected" : ""}>${route.name} (${route.id})</option>
    `).join("");
  }

  prefillEditForm(root, routeId) {
    const route = this.state.routes.find((r) => r.id === routeId);
    if (!route) return;

    root.querySelector("#editRouteName").value = route.name;
    root.querySelector("#editRouteStart").value = route.start;
    root.querySelector("#editRouteEnd").value = route.end;
    root.querySelector("#editRouteCapacity").value = route.capacity;

    const driverSelect = root.querySelector("#editRouteDriver");
    driverSelect.innerHTML = `<option value="">No driver</option>${this.driverOptions(route.driverId || "")}`;
  }

  routeRows() {
    if (!this.state.routes || this.state.routes.length === 0) {
      return "<tr><td colspan=\"5\">No routes available.</td></tr>";
    }

    return this.state.routes.map((route) => {
      const driver = this.state.drivers.find((d) => d.id === route.driverId);
      const assigned = this.studentsOnRoute(route.name);
      const status = this.routeStatus(route, assigned);
      return `
        <tr>
          <td>${route.name}</td>
          <td>${route.start} -> ${route.end}</td>
          <td>${route.capacity} <small>(${assigned} students)</small></td>
          <td>
            <select data-assign-driver data-route-id="${route.id}">
              <option value="">Select</option>
              ${this.driverOptions(route.driverId || "")}
            </select>
            <small>${driver ? `Current: ${driver.name}` : "Unassigned"}</small>
          </td>
          <td>
            <span class="badge ${status.level}">${status.label}</span>
            <button class="btn warn" data-delete-route="${route.id}" type="button">Delete</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  studentsOnRoute(routeName) {
    return this.state.students.filter((student) => student.route === routeName).length;
  }

  routeStatus(route, assigned) {
    if (!route.driverId) {
      return { label: "Unassigned Driver", level: "warn" };
    }
    if (assigned > route.capacity) {
      return { label: "Over Capacity", level: "danger" };
    }
    return { label: "Active", level: "ok" };
  }
}
