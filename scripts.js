let filaments = [];
let projects = [];

// Currency Symbols
const currencySymbols = {
  "INR": "₹",
  "USD": "$",
  "EUR": "€",
  "GBP": "£",
  "JPY": "¥",
  "CAD": "C$",
  "AUD": "A$"
};

// formatCurrency();
function formatCurrency(amount, currency) {
  if (!currency) return `${parseFloat(amount).toFixed(2)}`;

  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = parseFloat(amount).toFixed(2);

  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount)}`;
  }

  return `${symbol}${formattedAmount}`;
}

// showAlert();  // Enhanced Alert System
function showAlert(message, type = 'error') {
  const alertContainer = document.getElementById('alertContainer');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  alertContainer.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000);
}

// loadData();
function loadData() {
  const savedFilaments = localStorage.getItem("filamentTracker_filaments");
  const savedProjects = localStorage.getItem("filamentTracker_projects");

  if (savedFilaments) {
    filaments = JSON.parse(savedFilaments);
  }
  if (savedProjects) {
    projects = JSON.parse(savedProjects);
  }
}

// saveData();
function saveData() {
  localStorage.setItem("filamentTracker_filaments", JSON.stringify(filaments));
  localStorage.setItem("filamentTracker_projects", JSON.stringify(projects));
}

// validateProjectForm();
function validateProjectForm() {
  const customerName = document.getElementById("customerName").value;
  const projectName = document.getElementById("projectName").value;
  const projectDate = document.getElementById("projectDate").value;

  // Show specific error messages based on missing fields
  if (!customerName) {
    showAlert("Customer name is required", "error");
    return false;
  }
  if (!projectName) {
    showAlert("Project name is required", "error");
    return false;
  }
  if (!projectDate) {
    showAlert("Project date is required", "error");
    return false;
  }

  return true;
}
// validateFilamentForm();
function validateFilamentForm() {
  const brand = document.getElementById("filamentBrand").value;
  const color = document.getElementById("filamentColor").value;
  const weight = document.getElementById("filamentWeight").value;
  const cost = document.getElementById("filamentCost").value;
  const purchaseDate = document.getElementById("purchaseDate").value;

  if (!brand || !color || !weight || !purchaseDate) {
    showAlert("Please fill in all required fields", "error");
    return false;
  }

  if (weight <= 0) {
    showAlert("Weight must be greater than 0", "error");
    return false;
  }

  if (cost < 0) {
    showAlert("Cost cannot be negative", "error");
    return false;
  }

  return true;
}

// clearProjectForm();
function clearProjectForm() {
  document.getElementById("customerName").value = "";
  document.getElementById("projectName").value = "";
  document.getElementById("projectUrl").value = "";
  document.getElementById("projectFilament").value = "";
  document.getElementById("usedWeight").value = "";
  document.getElementById("projectNotes").value = "";
}
// clearFilamentForm();
function clearFilamentForm() {
  document.getElementById("filamentBrand").value = "";
  document.getElementById("filamentColor").value = "";
  document.getElementById("filamentWeight").value = "";
  document.getElementById("filamentCost").value = "";
  document.getElementById("currencyType").value = "INR";
}

// createProject();  // This function is called when the "Create Project" button is clicked
function createProject() {
  // Validate ONLY the fields that are required in this section
  const customerName = document.getElementById("customerName").value;
  const projectName = document.getElementById("projectName").value;
  const projectDate = document.getElementById("projectDate").value;

  // Show specific error messages based on missing fields
  if (!customerName) {
    showAlert("Customer name is required", "error");
    return;
  }
  if (!projectName) {
    showAlert("Project name is required", "error");
    return;
  }
  if (!projectDate) {
    showAlert("Project date is required", "error");
    return;
  }

  const projectUrl = document.getElementById("projectUrl").value.trim();
  const projectNotes = document.getElementById("projectNotes").value.trim();

  const project = {
    id: Date.now(),
    projectName,
    customerName,
    projectUrl,
    projectDate,
    notes: projectNotes,
    filamentId: null, // Initially set to null
    usedWeight: 0, // Initially set to 0
    projectCost: 0 // Initially set to 0
  }

  projects.push(project);
  saveData();
  updateProjectDropdown();
  updateProjectTable();

  // Clear only the fields in this section
  document.getElementById("customerName").value = "";
  document.getElementById("projectName").value = "";
  document.getElementById("projectDate").value = new Date().toISOString().split("T")[0]; // Reset date
  document.getElementById("projectUrl").value = "";
  document.getElementById("projectNotes").value = "";

  showAlert("Project created successfully", "success");
}
// updateProjectWithFilament();
function updateProjectWithFilament() {
  const projectId = parseInt(document.getElementById("projectToUpdateSelect").value);
  const filamentId = parseInt(document.getElementById("projectFilament").value);
  const usedWeight = parseFloat(document.getElementById("usedWeight").value);

  // Validate project selection
  if (!projectId) {
    showAlert("Please select a project to update", "error");
    return;
  }
  // Validate filament selection and used weight
  if (!filamentId) {
    showAlert("Please select a filament", "error");
    return;
  }
  if (!usedWeight || usedWeight <= 0) {
    showAlert("Please enter the weight used (must be greater than 0)", "error");
    return;
  }

  const filament = filaments.find((f) => f.id === filamentId);
  if (!filament) {
    showAlert("Selected filament not found", "error");
    return;
  }

  if (usedWeight > filament.currentWeight) {
    showAlert("Not enough filament remaining. Available: " + filament.currentWeight + "g", "error");
    return;
  }

  // Find the specific project to update based on user selection
  const projectToUpdate = projects.find(p => p.id === projectId);
  if (!projectToUpdate) {
    showAlert("No project found to update with filament usage", "error");
    return;
  }

  // Calculate cost per gram for this project
  const costPerGram = filament.cost / filament.originalWeight;
  const projectCost = costPerGram * usedWeight;

  // Update the project with filament details
  projectToUpdate.filamentId = filamentId;
  projectToUpdate.usedWeight = usedWeight;
  projectToUpdate.projectCost = projectCost;

  // Update filament current weight
  filament.currentWeight -= usedWeight;

  saveData();
  updateProjectDropdown();
  updateFilamentDropdown();
  updateTables();

  // Clear the filament and weight fields
  document.getElementById("projectToUpdateSelect").value = "";
  document.getElementById("projectFilament").value = "";
  document.getElementById("usedWeight").value = "";

  showAlert("Project updated with filament usage successfully", "success");
}

// addProject(); and updateProject() functions
// Kept for backward compatibility
function addProject() {
  createProject();
}
function updateProject() {
  updateProjectWithFilament();
}

// addFilament();
function addFilament() {
  if (!validateFilamentForm()) { return; }

  const brand = document.getElementById("filamentBrand").value;
  const type = document.getElementById("filamentType").value;
  const color = document.getElementById("filamentColor").value;
  const weight = parseFloat(document.getElementById("filamentWeight").value);
  const cost = parseFloat(document.getElementById("filamentCost").value) || 0;
  const currency = document.getElementById("currencyType").value;
  const purchaseDate = document.getElementById("purchaseDate").value;

  if (!brand || !color || !weight || !purchaseDate) {
    alert("Please fill in all required fields");
    return;
  }

  const filament = {
    id: Date.now(),
    brand,
    type,
    color,
    originalWeight: weight,
    currentWeight: weight,
    cost,
    currency,
    purchaseDate
  };

  filaments.push(filament);
  saveData();
  updateFilamentDropdown();
  updateTables();

  // Clear form
  clearFilamentForm();
  showAlert("Filament added successfully", "success");
}
// updateFilamentDropdown();
function updateFilamentDropdown() {
  const select = document.getElementById("projectFilament");
  select.innerHTML = '<option value="">Choose filament...</option>';

  filaments.forEach((filament) => {
    if (filament.currentWeight > 0) {
      const option = document.createElement("option");
      option.value = filament.id;
      option.textContent = `${filament.brand} ${filament.type} ${filament.color} (${filament.currentWeight}g remaining)`;
      select.appendChild(option);
    }
  });
}
// updateProjectDropdown();
function updateProjectDropdown() {
  const select = document.getElementById("projectToUpdateSelect");
  select.innerHTML = '<option value="">Choose a pending project...</option>';

  // Find projects that haven't had filament assigned yet
  const pendingProjects = projects.filter(p => p.filamentId === null);

  pendingProjects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    // Display project name, customer, and date for easy identification
    option.textContent = `${project.projectName} (${project.customerName}) - ${project.projectDate}`;
    select.appendChild(option);
  });
}

// updateTables();
function updateTables() {
  updateFilamentTable();
  updateProjectTable();
}

// updateFilamentTable();
function updateFilamentTable() {
  const tbody = document.getElementById("filamentTableBody");
  tbody.innerHTML = "";

  filaments.forEach((filament) => {
    const row = document.createElement("tr");
    const usedWeight = filament.originalWeight - filament.currentWeight;
    const usagePercent = (usedWeight / filament.originalWeight) * 100;

    let status = "high";
    let statusText = "Good";
    if (usagePercent > 80) {
      status = "low";
      statusText = "Low";
    } else if (usagePercent > 50) {
      status = "medium";
      statusText = "Medium";
    }

    row.innerHTML = `
      <td>${filament.brand}</td>
      <td>${filament.type}</td>
      <td>${filament.color}</td>
      <td>${filament.originalWeight}g</td>
      <td>${filament.currentWeight}g</td>
      <td>${usedWeight.toFixed(1)}g</td>
      <td>${formatCurrency(filament.cost, filament.currency)}</td>
      <td>${filament.purchaseDate}</td>
      <td><span class="status-${status}">${statusText}</span></td>
      <td><button class="action-btn" onclick="deleteFilament(${
        filament.id
      })">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}
// updateProjectTable();
function updateProjectTable() {
  const tbody = document.getElementById("projectTableBody");
  tbody.innerHTML = "";

  projects
    .slice()
    .reverse()
    .forEach((project) => {
      // Find the associated filament to get its current details
      const filament = filaments.find(f => f.id === project.filamentId);

      // Prepare display values, handling cases where filament might be deleted
      const filamentName = filament ? `${filament.brand} ${filament.type} ${filament.color}` : "Not Assigned";
      const projectCostDisplay = filament ? formatCurrency(project.projectCost, filament.currency) : formatCurrency(project.projectCost, null);

      const row = document.createElement("tr");

      // Format URL display
      const urlDisplay = project.projectUrl
        ? `<a href="${project.projectUrl}" class="url-link" target="_blank">🔗 View</a>`
        : "-";
      // Status column was missing, re-adding it.
      const statusDisplay = project.filamentId ? "Completed" : "Pending";

      row.innerHTML = `
        <td>${project.projectDate}</td>
        <td>${project.projectName}</td>
        <td>${project.customerName}</td>
        <td>${filamentName}</td>
        <td>${project.usedWeight}g</td>
        <td>${projectCostDisplay}</td>
        <td>${statusDisplay}</td>
        <td>${urlDisplay}</td>
        <td>${project.notes || "-"}</td>
        <td><button class="action-btn" onclick="deleteProject(${
          project.id
        })">Delete</button></td>
      `;
      tbody.appendChild(row);
    }
  );
}

// deleteFilament();
function deleteFilament(id) {
  if (
    confirm(
      "Are you sure you want to delete this filament?\n" +
      "This will also remove all associated projects."
    )
  ) {
    filaments = filaments.filter((f) => f.id !== id);
    projects = projects.filter((p) => p.filamentId !== id);
    saveData();
    updateFilamentDropdown();
    updateProjectDropdown();
    updateTables();
  }
}
// deleteProject();
function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    const project = projects.find((p) => p.id === id);
    if (project) {
      // Return the filament weight
      const filament = filaments.find((f) => f.id === project.filamentId);
      if (filament) {
        filament.currentWeight += project.usedWeight;
      }
    }
    projects = projects.filter((p) => p.id !== id);
    saveData();
    updateFilamentDropdown();
    updateProjectDropdown();
    updateTables();
  }
}

// downloadCSV();
function downloadCSV(filename, data) {
  try {
    const csvContent = data
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    // Trigger the download
    a.click();
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showAlert(`Downloaded ${filename} successfully`, "success");
  } catch (error) {
    console.error("Error downloading CSV:", error);
    showAlert("Failed to download CSV. Please try again.", "error");
  }
}
// downloadFilamentCSV();
function downloadFilamentCSV() {
  const headers = [
    "Brand",
    "Type",
    "Color",
    "Original Weight (g)",
    "Current Weight (g)",
    "Used Weight (g)",
    "Cost",
    "Purchase Date",
    "Status"
  ];
  const rows = filaments.map((f) => {
    const usedWeight = f.originalWeight - f.currentWeight;
    const usagePercent = (usedWeight / f.originalWeight) * 100;
    let status = "Good";
    if (usagePercent > 80) status = "Low";
    else if (usagePercent > 50) status = "Medium";

    return [
      f.brand,
      f.type,
      f.color,
      f.originalWeight,
      f.currentWeight,
      usedWeight.toFixed(1),
      f.cost.toFixed(2),
      f.purchaseDate,
      status
    ];
  });
  downloadCSV("filament_inventory.csv", [headers, ...rows]);
}
// downloadProjectCSV();
function downloadProjectCSV() {
  const headers = [
    "Date",
    "Project Name",
    "Customer",
    "Filament Used",
    "Weight Used (g)",
    "Cost",
    "URL",
    "Notes",
  ];
  const rows = projects.map((p) => {
    // Look up filament details for the CSV export
    const filament = filaments.find(f => f.id === p.filamentId);
    const filamentName = filament ? `${filament.brand} ${filament.type} ${filament.color}` : "Not Assigned";

    return [
      p.projectDate,
      p.projectName,
      p.customerName,
      filamentName,
      p.usedWeight,
      p.projectCost.toFixed(2),
      p.projectUrl || "",
      p.notes || "",
    ];
  });
  downloadCSV("project_history.csv", [headers, ...rows]);
}

// nukeAllData();
// This function will permanently delete all data and reset the application
// WARNING: This action cannot be undone!
function nukeAllData() {
  const confirmed = confirm(
    "⚠️ WARNING ⚠️\n" +
    "This will permanently delete ALL your data:\n" +
    "• All filament inventory\n" +
    "• All project history\n" +
    "• All settings\n\n" +
    "This action CANNOT be undone!\n\n" +
    "Are you absolutely sure you want to continue?"
  );

  if (confirmed) {
    const doubleConfirm = confirm(
      "Last chance!\n\n" +
      "Type 'DELETE' in the next prompt to confirm data destruction."
    );

    if (doubleConfirm) {
      const finalConfirm = prompt(
        "Type 'DELETE' (all capitals) to confirm:"
      );

      if (finalConfirm === "DELETE") {
        // Clear localStorage
        localStorage.removeItem("filamentTracker_filaments");
        localStorage.removeItem("filamentTracker_projects");

        // Reset arrays
        filaments = [];
        projects = [];

        // Update display
        updateFilamentDropdown();
        updateTables();

        showAlert("All data has been permanently deleted. Starting fresh!", 'success');
      } else {
        showAlert("Data deletion cancelled - incorrect confirmation text.", 'error');
      }
    } else {
      showAlert("Data deletion cancelled.", 'error');
    }
  }
}

// Load data from localStorage on page load
window.onload = function () {
  loadData();
  updateProjectDropdown();
  updateFilamentDropdown();
  updateTables();

  // Set today's date as default
  document.getElementById("purchaseDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("projectDate").value = new Date()
    .toISOString()
    .split("T")[0];

  // Realtime Weight Validation
  document.getElementById("usedWeight").addEventListener("input", function () {
    const filamentId = parseInt(document.getElementById("projectFilament").value);
    const usedWeight = parseFloat(this.value);

    if (filamentId && !isNaN(usedWeight)) {
      const filament = filaments.find((f) => f.id === filamentId);
      if (filament && usedWeight > filament.currentWeight) {
        showAlert(
          `Warning: Only ${filament.currentWeight}g available`, "error"
        );
      } else {
        this.style.borderColor = "#4ECDC4";
      }
    }
  });
};
