
const loginSection = document.getElementById("loginSection");
const resetSection = document.getElementById("resetPasswordSection");
const dashboardSection = document.getElementById("dashboardSection");
const contentSection = document.getElementById("contentSection");

const loginMessage = document.getElementById("loginMessage");
const resetMessage = document.getElementById("resetPasswordMessage");
const statusMessage = document.getElementById("statusMessage");
const logoutBtn = document.getElementById("logoutBtn");

let activeSection = "";
let editingId = null;
let busy = false;

const recoveryLink =
  window.location.hash.includes("type=recovery") ||
  new URLSearchParams(window.location.search).get("type") === "recovery";

const sections = {
  courses: {
    title: "Courses",
    table: "courses",
    fields: [
      { name: "name", label: "Course Name", required: true },
      { name: "description", label: "Description" },
      { name: "duration", label: "Duration" },
      { name: "fees", label: "Course Fees", type: "number" }
    ]
  },
  students: {
    title: "Students",
    table: "students",
    fields: [
      { name: "student_id", label: "Student ID", required: true },
      { name: "full_name", label: "Student Name", required: true },
      { name: "phone", label: "Phone" },
      { name: "course_id", label: "Course Database ID", type: "number" },
      { name: "admission_date", label: "Admission Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["active", "inactive"]
      }
    ]
  },
  attendance: {
    title: "Attendance",
    table: "attendance",
    fields: [
      { name: "student_id", label: "Student Database ID", type: "number", required: true },
      { name: "attendance_date", label: "Date", type: "date", required: true },
      {
        name: "status",
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
      { name: "student_id", label: "Student Database ID", type: "number", required: true },
      { name: "amount", label: "Total Fees", type: "number", required: true },
      { name: "paid_amount", label: "Paid Amount", type: "number", required: true },
      { name: "due_date", label: "Due Date", type: "date" },
      { name: "payment_date", label: "Payment Date", type: "date" },
      { name: "note", label: "Note" }
    ]
  },
  notices: {
    title: "Notices",
    table: "notices",
    fields: [
      { name: "title", label: "Notice Title", required: true },
      { name: "message", label: "Notice Message", required: true, type: "textarea" }
    ]
  },
  gallery: {
    title: "Gallery",
    table: "gallery",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "media_url", label: "Photo/Video URL", required: true },
      {
        name: "media_type",
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
      { name: "title", label: "Title", required: true },
      { name: "content", label: "Content", required: true, type: "textarea" }
    ]
  },
  student_history: {
    title: "Student History",
    table: "student_history",
    fields: [
      { name: "student_id", label: "Student Database ID", type: "number", required: true },
      { name: "description", label: "Description", required: true, type: "textarea" }
    ]
  },
  feedback: {
    title: "Feedback",
    table: "feedback",
    readonly: true,
    fields: []
  }
};

function showOnly(section) {
  loginSection.hidden = section !== "login";
  resetSection.hidden = section !== "reset";
  dashboardSection.hidden = section !== "dashboard";
  logoutBtn.hidden = section !== "dashboard";
}

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#b91c1c" : "#166534";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function checkAdmin() {
  const { data: { session }, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    showOnly("login");
    return;
  }

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    await supabaseClient.auth.signOut();
    showOnly("login");
    setMessage(loginMessage, "આ એકાઉન્ટને Admin પરવાનગી નથી.", true);
    return;
  }

  showOnly("dashboard");
  statusMessage.textContent = "Database સાથે કનેક્શન તપાસાઈ રહ્યું છે...";
  await loadSection(activeSection || "courses");
}

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  busy = true;

  const button = event.submitter;
  if (button) button.disabled = true;

  setMessage(loginMessage, "Login થઈ રહ્યું છે...");

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    await checkAdmin();
  } catch (error) {
    setMessage(loginMessage, error.message || "Login નિષ્ફળ થયું.", true);
  } finally {
    busy = false;
    if (button) button.disabled = false;
  }
});

document.getElementById("forgotPasswordBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    setMessage(loginMessage, "પહેલાં Email Address દાખલ કરો.", true);
    return;
  }

  setMessage(loginMessage, "Reset Email મોકલાઈ રહ્યો છે...");

  try {
    const redirectTo = window.location.origin + window.location.pathname;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) throw error;

    setMessage(
      loginMessage,
      "જો આ Email નોંધાયેલો છે, તો Password Reset માટે ઈમેલ તપાસો."
    );
  } catch (error) {
    setMessage(loginMessage, error.message || "Reset Email મોકલી શકાયો નહીં.", true);
  }
});

document.getElementById("resetPasswordForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  busy = true;

  const button = event.submitter;
  if (button) button.disabled = true;

  try {
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
      throw new Error("પાસવર્ડ ઓછામાં ઓછા 8 અક્ષરનો હોવો જોઈએ.");
    }

    if (password !== confirmPassword) {
      throw new Error("બંને પાસવર્ડ સરખા નથી.");
    }

    const { data: { session }, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      throw new Error(
        "Reset session મળ્યું નથી. નવા Password Reset Email ની લિંક ખોલો."
      );
    }

    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) throw error;

    setMessage(resetMessage, "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો. હવે નવા પાસવર્ડથી Login કરો.");

    await supabaseClient.auth.signOut();
    document.getElementById("resetPasswordForm").reset();
    showOnly("login");
    setMessage(loginMessage, "નવો પાસવર્ડ સેટ થયો છે. હવે Login કરો.");
  } catch (error) {
    setMessage(resetMessage, error.message || "પાસવર્ડ બદલી શકાયો નહીં.", true);
  } finally {
    busy = false;
    if (button) button.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showOnly("login");
  setMessage(loginMessage, "તમે Logout થયા છો.");
});

document.querySelectorAll("[data-section]").forEach(button => {
  button.addEventListener("click", () => loadSection(button.dataset.section));
});

function createField(field, value = "") {
  const safeValue = escapeHTML(value);
  const required = field.required ? "required" : "";
  let control = "";

  if (field.type === "textarea") {
    control = `<textarea name="${field.name}" ${required}>${safeValue}</textarea>`;
  } else if (field.type === "select") {
    control = `<select name="${field.name}" ${required}>
      <option value="">પસંદ કરો</option>
      ${field.options.map(option =>
        `<option value="${escapeHTML(option)}" ${String(value) === option ? "selected" : ""}>${escapeHTML(option)}</option>`
      ).join("")}
    </select>`;
  } else {
    control = `<input name="${field.name}" type="${field.type || "text"}"
      value="${safeValue}" ${required}
      ${field.type === "number" ? 'step="any"' : ""}>`;
  }

  return `<label>${escapeHTML(field.label)}${field.required ? " *" : ""}</label>${control}`;
}

async function loadSection(key) {
  if (!sections[key]) return;

  activeSection = key;
  editingId = null;

  const config = sections[key];
  contentSection.innerHTML = `<h2>${escapeHTML(config.title)}</h2><p>લોડ થઈ રહ્યું છે...</p>`;

  const { data, error } = await supabaseClient
    .from(config.table)
    .select("*")
    .limit(100);

  if (error) {
    contentSection.innerHTML =
      `<h2>${escapeHTML(config.title)}</h2><p>ડેટા લોડ કરવામાં સમસ્યા: ${escapeHTML(error.message)}</p>`;
    statusMessage.textContent = "Database error";
    return;
  }

  statusMessage.textContent = "Database સાથે જોડાણ સફળ છે.";

  let html = `<h2>${escapeHTML(config.title)}</h2>`;

  if (!config.readonly) {
    html += `<button type="button" id="addRecordBtn">+ નવો રેકોર્ડ ઉમેરો</button>`;
    html += `<div id="recordFormContainer"></div>`;
  }

  if (!data || data.length === 0) {
    html += "<p>હાલ કોઈ રેકોર્ડ નથી.</p>";
  } else {
    html += '<div style="overflow-x:auto"><table><thead><tr>';

    const keys = Object.keys(data[0]).filter(name => name !== "created_at" && name !== "updated_at");
    keys.forEach(name => {
      html += `<th>${escapeHTML(name)}</th>`;
    });

    if (!config.readonly) html += "<th>Action</th>";

    html += "</tr></thead><tbody>";

    data.forEach(row => {
      html += "<tr>";
      keys.forEach(name => {
        html += `<td>${escapeHTML(row[name])}</td>`;
      });

      if (!config.readonly) {
        html += `<td>
          <button type="button" data-edit="${escapeHTML(row.id)}">Edit</button>
          <button type="button" data-delete="${escapeHTML(row.id)}">Delete</button>
        </td>`;
      }

      html += "</tr>";
    });

    html += "</tbody></table></div>";
  }

  contentSection.innerHTML = html;

  const addButton = document.getElementById("addRecordBtn");
  if (addButton) addButton.addEventListener("click", () => renderForm(key));

  contentSection.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
      const row = data.find(item => String(item.id) === button.dataset.edit);
      if (row) renderForm(key, row);
    });
  });

  contentSection.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("શું આ રેકોર્ડ ડિલીટ કરવો છે?")) return;

      const { error } = await supabaseClient
        .from(config.table)
        .delete()
        .eq("id", button.dataset.delete);

      if (error) {
        alert("ડિલીટ કરવામાં સમસ્યા: " + error.message);
        return;
      }

      await loadSection(key);
    });
  });
}

function renderForm(key, row = null) {
  const config = sections[key];
  editingId = row ? row.id : null;

  const container = document.getElementById("recordFormContainer");
  if (!container) return;

  container.innerHTML = `
    <form id="recordForm">
      <h3>${row ? "રેકોર્ડ Edit કરો" : "નવો રેકોર્ડ ઉમેરો"}</h3>
      ${config.fields.map(field => createField(field, row ? row[field.name] ?? "" : "")).join("")}
      <button type="submit">Save</button>
      <button type="button" id="cancelFormBtn">Cancel</button>
      <p id="formMessage" role="status"></p>
    </form>
  `;

  document.getElementById("cancelFormBtn").addEventListener("click", () => {
    container.innerHTML = "";
    editingId = null;
  });

  document.getElementById("recordForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("formMessage");
    const formData = new FormData(form);
    const record = {};

    config.fields.forEach(field => {
      const raw = formData.get(field.name);
      if (raw === "" || raw === null) {
        record[field.name] = null;
      } else if (field.type === "number") {
        record[field.name] = Number(raw);
      } else {
        record[field.name] = raw;
      }
    });

    const saveButton = form.querySelector('[type="submit"]');
    saveButton.disabled = true;

    try {
      let result;

      if (editingId !== null) {
        result = await supabaseClient
          .from(config.table)
          .update(record)
          .eq("id", editingId);
      } else {
        result = await supabaseClient
          .from(config.table)
          .insert(record);
      }

      if (result.error) throw result.error;

      setMessage(message, "સેવ થઈ ગયું.");
      await loadSection(key);
    } catch (error) {
      setMessage(message, error.message || "સેવ કરવામાં સમસ્યા આવી.", true);
      saveButton.disabled = false;
    }
  });
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY" || (recoveryLink && session)) {
    showOnly("reset");
    setMessage(resetMessage, "નવો પાસવર્ડ દાખલ કરો.");
    return;
  }

  if (event === "SIGNED_IN" && session) {
    checkAdmin();
  }

  if (event === "SIGNED_OUT") {
    showOnly("login");
  }
});

async function startApp() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    if (recoveryLink) {
      showOnly("reset");
      setMessage(
        resetMessage,
        "Reset session મળ્યું નથી. નવો Reset Email મોકલી તેની લિંક ખોલો.",
        true
      );
    } else {
      showOnly("login");
    }
    return;
  }

  if (recoveryLink) {
    showOnly("reset");
    setMessage(resetMessage, "નવો પાસવર્ડ દાખલ કરો.");
    return;
  }

  await checkAdmin();
}

startApp();
