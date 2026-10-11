
const $ = (id) => document.getElementById(id);

const sections = {
  courses: {
    title: "Courses",
    table: "courses",
    fields: [
      { key: "name", label: "Course Name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "duration", label: "Duration" },
      { key: "fees", label: "Course Fees", type: "number", required: true }
    ]
  },
  students: {
    title: "Students",
    table: "students",
    fields: [
      { key: "student_id", label: "Student ID", required: true },
      { key: "full_name", label: "Full Name", required: true },
      { key: "phone", label: "Phone" },
      { key: "course_id", label: "Course Database ID", type: "number" },
      { key: "admission_date", label: "Admission Date", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["active", "inactive"],
        required: true
      }
    ]
  },
  attendance: {
    title: "Attendance",
    table: "attendance",
    fields: [
      { key: "student_id", label: "Student Database ID", type: "number", required: true },
      { key: "attendance_date", label: "Date", type: "date", required: true },
      {
        key: "status",
        label: "Attendance",
        type: "select",
        options: ["present", "absent", "leave"],
        required: true
      }
    ]
  },
  fees: {
    title: "Fees",
    table: "fees",
    fields: [
      { key: "student_id", label: "Student Database ID", type: "number", required: true },
      { key: "amount", label: "Total Amount", type: "number", required: true },
      { key: "paid_amount", label: "Paid Amount", type: "number", required: true },
      { key: "due_date", label: "Due Date", type: "date" },
      { key: "payment_date", label: "Payment Date", type: "date" },
      { key: "note", label: "Note" }
    ]
  },
  notices: {
    title: "Notices",
    table: "notices",
    fields: [
      { key: "title", label: "Notice Title", required: true },
      { key: "message", label: "Notice Message", type: "textarea", required: true }
    ]
  },
  gallery: {
    title: "Gallery",
    table: "gallery",
    fields: [
      { key: "title", label: "Photo or Video Title" },
      { key: "media_url", label: "Media URL", required: true },
      {
        key: "media_type",
        label: "Media Type",
        type: "select",
        options: ["photo", "video"],
        required: true
      }
    ]
  },
  about: {
    title: "About",
    table: "about",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "content", label: "Information", type: "textarea", required: true }
    ]
  },
  history: {
    title: "Student History",
    table: "student_history",
    fields: [
      { key: "student_id", label: "Student Database ID", type: "number", required: true },
      { key: "description", label: "History Details", type: "textarea", required: true }
    ]
  },
  feedback: {
    title: "Feedback",
    table: "feedback",
    readOnly: true,
    fields: []
  }
};

let activeSection = "courses";
let currentRows = [];
let editingId = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.className = isError ? "message-error" : "message-success";
}

async function checkAdmin() {
  const { data: sessionData, error } =
    await supabaseClient.auth.getSession();

  if (error) throw error;

  const user = sessionData.session?.user;

  if (!user) {
    showLogin();
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile || profile.role !== "admin") {
    await supabaseClient.auth.signOut();
    showLogin();
    showMessage($("loginMessage"),
      "આ accountને Admin permission નથી.", true);
    return;
  }

  $("loginSection").hidden = true;
  $("dashboardSection").hidden = false;
  $("logoutBtn").hidden = false;

  showMessage($("statusMessage"),
    "Login સફળ થયું: " + (profile.full_name || user.email));

  await loadSection(activeSection);
}

function showLogin() {
  $("loginSection").hidden = false;
  $("dashboardSection").hidden = true;
  $("logoutBtn").hidden = true;
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage($("loginMessage"), "Login થઈ રહ્યું છે...");

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value
    });

    if (error) throw error;

    await checkAdmin();
  } catch (error) {
    showMessage($("loginMessage"),
      error.message || "Login થઈ શક્યું નહીં.", true);
  }
});

$("logoutBtn").addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showMessage($("statusMessage"), error.message, true);
    return;
  }

  showLogin();
});

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", async () => {
    activeSection = button.dataset.section;
    await loadSection(activeSection);
  });
});

function renderField(field, value = "") {
  const name = escapeHTML(field.key);
  const label = escapeHTML(field.label);
  const required = field.required ? "required" : "";
  const safeValue = escapeHTML(value);

  if (field.type === "textarea") {
    return `<label>${label}
      <textarea name="${name}" ${required}>${safeValue}</textarea>
    </label>`;
  }

  if (field.type === "select") {
    const options = field.options.map((option) =>
      `<option value="${escapeHTML(option)}"
        ${String(value) === option ? "selected" : ""}>
        ${escapeHTML(option)}
      </option>`
    ).join("");

    return `<label>${label}
      <select name="${name}" ${required}>${options}</select>
    </label>`;
  }

  const type = field.type || "text";

  return `<label>${label}
    <input name="${name}" type="${type}" value="${safeValue}"
      ${required} ${type === "number" ? 'step="any" min="0"' : ""}>
  </label>`;
}

function renderForm(config, row = {}) {
  if (config.readOnly) return "";

  return `
    <form id="recordForm">
      <h3>${editingId ? "Edit" : "Add"} ${escapeHTML(config.title)}</h3>
      ${config.fields.map((field) =>
        renderField(field, row[field.key] ?? "")
      ).join("")}
      <button type="submit">${editingId ? "Save Changes" : "Save"}</button>
      ${editingId ? '<button type="button" id="cancelEdit">Cancel</button>' : ""}
      <p id="formMessage" role="status"></p>
    </form>
  `;
}

function renderRecords(config) {
  if (!currentRows.length) {
    return "<p>હજુ કોઈ record નથી.</p>";
  }

  return currentRows.map((row) => {
    const details = config.fields.map((field) =>
      `<p><strong>${escapeHTML(field.label)}:</strong>
        ${escapeHTML(row[field.key] ?? "-")}</p>`
    ).join("");

    const actions = config.readOnly ? "" : `
      <button type="button" data-edit="${escapeHTML(row.id)}">Edit</button>
      <button type="button" data-delete="${escapeHTML(row.id)}">Delete</button>
    `;

    return `<article class="panel">
      ${details}
      <small>Record ID: ${escapeHTML(row.id)}</small>
      ${actions}
    </article>`;
  }).join("");
}

async function loadSection(key) {
  const config = sections[key];
  if (!config) return;

  activeSection = key;
  editingId = null;

  const content = $("contentSection");
  content.innerHTML = `<h2>${escapeHTML(config.title)}</h2><p>માહિતી લોડ થઈ રહી છે...</p>`;

  try {
    const { data, error } = await supabaseClient
      .from(config.table)
      .select("*")
      .order("id", { ascending: false })
      .limit(100);

    if (error) throw error;

    currentRows = data || [];

    content.innerHTML = `
      <h2>${escapeHTML(config.title)}</h2>
      ${renderForm(config)}
      <div id="records">${renderRecords(config)}</div>
    `;

    const form = $("recordForm");

    if (form) {
      form.addEventListener("submit", saveRecord);
    }

    const cancelButton = $("cancelEdit");

    if (cancelButton) {
      cancelButton.addEventListener("click", () => loadSection(key));
    }

    content.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const row = currentRows.find(
          (item) => String(item.id) === button.dataset.edit
        );

        if (!row) return;

        editingId = row.id;
        content.innerHTML = `
          <h2>${escapeHTML(config.title)}</h2>
          ${renderForm(config, row)}
          <div id="records">${renderRecords(config)}</div>
        `;

        $("recordForm").addEventListener("submit", saveRecord);
        $("cancelEdit").addEventListener("click", () => loadSection(key));
      });
    });

    content.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!confirm("આ record ખરેખર Delete કરવો છે?")) return;

        try {
          const { error } = await supabaseClient
            .from(config.table)
            .delete()
            .eq("id", button.dataset.delete);

          if (error) throw error;

          await loadSection(key);
        } catch (error) {
          alert("Delete થઈ શક્યું નહીં: " + error.message);
        }
      });
    });
  } catch (error) {
    content.innerHTML = `
      <h2>${escapeHTML(config.title)}</h2>
      <p class="message-error">માહિતી લોડ થઈ નહીં: ${escapeHTML(error.message)}</p>
    `;
  }
}

async function saveRecord(event) {
  event.preventDefault();

  const config = sections[activeSection];
  const form = event.currentTarget;
  const formMessage = $("formMessage");
  const record = {};

  for (const field of config.fields) {
    const raw = new FormData(form).get(field.key);
    const value = typeof raw === "string" ? raw.trim() : raw;

    if (field.type === "number") {
      record[field.key] = value === "" ? null : Number(value);
    } else {
      record[field.key] = value === "" ? null : value;
    }
  }

  showMessage(formMessage, "Save થઈ રહ્યું છે...");

  try {
    let request = supabaseClient.from(config.table);

    if (editingId !== null) {
      request = request.update(record).eq("id", editingId);
    } else {
      request = request.insert(record);
    }

    const { error } = await request;

    if (error) throw error;

    editingId = null;
    await loadSection(activeSection);
    showMessage($("statusMessage"), "માહિતી સફળતાપૂર્વક Save થઈ.");
  } catch (error) {
    showMessage(formMessage, error.message, true);
  }
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") showLogin();
});

checkAdmin().catch((error) => {
  showLogin();
  showMessage($("loginMessage"),
    "શરૂઆતમાં ભૂલ: " + error.message, true);
});
