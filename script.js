
const STORAGE_KEY = "hb_admin_demo_v1";

const $ = (id) => document.getElementById(id);

let state = {
  students: [],
  attendance: {},
  notices: []
};

// આ ફક્ત પ્રાથમિક DEMO છે; Supabase સાથે જોડાયેલું નથી.
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (
      parsed &&
      Array.isArray(parsed.students) &&
      typeof parsed.attendance === "object" &&
      parsed.attendance !== null &&
      Array.isArray(parsed.notices)
    ) {
      state = parsed;
    }
  }
} catch (error) {
  console.warn("Demo data could not be loaded.");
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    alert("ડેટા સેવ થઈ શક્યો નથી. Browser storage તપાસો.");
  }
}

function money(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function attendanceKey(studentId) {
  return todayKey() + "_" + studentId;
}

function getStatus(student) {
  return state.attendance[attendanceKey(student.id)] || "Not marked";
}

function renderDashboard() {
  const total = state.students.length;
  const present = state.students.filter(
    (s) => getStatus(s) === "Present"
  ).length;

  const collected = state.students.reduce(
    (sum, s) => sum + s.paid, 0
  );

  const pending = state.students.reduce(
    (sum, s) => sum + Math.max(0, s.fee - s.paid), 0
  );

  $("totalStudents").textContent = total;
  $("presentStudents").textContent = present;
  $("feesCollected").textContent = money(collected);
  $("feesPending").textContent = money(pending);

  $("emptyStudents").classList.toggle("hidden", total !== 0);

  $("studentTable").innerHTML = state.students.map((s) => `
    <tr>
      <td><strong>${escapeHTML(s.name)}</strong><br>
        <span class="muted">${escapeHTML(s.id)}</span></td>
      <td>${escapeHTML(s.course)}</td>
      <td>${money(s.fee)}</td>
      <td>${money(Math.max(0, s.fee - s.paid))}</td>
    </tr>
  `).join("");

  $("feesTable").innerHTML = state.students.map((s) => `
    <tr>
      <td>${escapeHTML(s.name)}</td>
      <td>${money(s.fee)}</td>
      <td>${money(s.paid)}</td>
      <td>${money(Math.max(0, s.fee - s.paid))}</td>
    </tr>
  `).join("");

  $("attendanceList").innerHTML = state.students.map((s) => {
    const status = getStatus(s);
    const presentNow = status === "Present";

    return `
      <div class="attendance-row">
        <div>
          <strong>${escapeHTML(s.name)}</strong>
          <div class="muted small">${escapeHTML(s.course)}</div>
        </div>
        <button type="button"
          class="attendance-btn ${status === "Absent" ? "absent" : ""}"
          data-attendance="${escapeHTML(s.id)}">
          ${presentNow ? "હાજર ✓" :
            status === "Absent" ? "ગેરહાજર" : "હાજરી નોંધો"}
        </button>
      </div>
    `;
  }).join("") || '<p class="muted">પહેલાં વિદ્યાર્થી ઉમેરો.</p>';

  const courses = [...new Set(
    state.students.map((s) => s.course)
  )];

  $("courseList").innerHTML = courses.map((course) => {
    const count = state.students.filter(
      (s) => s.course === course
    ).length;

    return `
      <div class="course-item">
        <strong>${escapeHTML(course)}</strong>
        <p class="muted">${count} વિદ્યાર્થી</p>
      </div>
    `;
  }).join("") || '<p class="muted">હજુ કોઈ કોર્સ નથી.</p>';

  $("noticeList").innerHTML = state.notices.map((notice) => `
    <div class="notice-item">
      <strong>${escapeHTML(notice.title)}</strong>
      <p>${escapeHTML(notice.text)}</p>
      <small class="muted">${escapeHTML(notice.date)}</small>
    </div>
  `).join("");
}

// Student form ખોલવો
$("showStudentForm").addEventListener("click", () => {
  $("studentForm").classList.remove("hidden");
  $("studentName").focus();
});

$("cancelStudent").addEventListener("click", () => {
  $("studentForm").reset();
  $("studentForm").classList.add("hidden");
});

// નવો વિદ્યાર્થી ઉમેરવો
$("studentForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("studentName").value.trim();
  const course = $("studentCourse").value.trim();
  const fee = Number($("studentFee").value);
  const paid = Number($("studentPaid").value);

  if (!name || !course) {
    alert("વિદ્યાર્થીનું નામ અને કોર્સ ભરો.");
    return;
  }

  if (
    !Number.isFinite(fee) ||
    !Number.isFinite(paid) ||
    fee < 0 ||
    paid < 0 ||
    paid > fee
  ) {
    alert("ફી સાચી ભરો. જમા ફી કુલ ફી કરતાં વધારે ન હોવી જોઈએ.");
    return;
  }

  const student = {
    id: "STU-" + Date.now().toString(36).toUpperCase(),
    name,
    course,
    fee,
    paid
  };

  state.students.push(student);
  saveState();
  renderDashboard();

  $("studentForm").reset();
  $("studentForm").classList.add("hidden");
});

// હાજરી: પ્રથમ ક્લિક હાજર, પછી ગેરહાજર,
// પછી ફરી હાજર; ગેરહાજરી નોંધવા બીજી વાર ક્લિક કરો.
$("attendanceList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-attendance]");
  if (!button) return;

  const id = button.dataset.attendance;
  const student = state.students.find((s) => s.id === id);
  if (!student) return;

  const key = attendanceKey(id);
  const current = state.attendance[key];

  state.attendance[key] =
    current === "Present" ? "Absent" : "Present";

  saveState();
  renderDashboard();
});

// Notice ઉમેરવી
$("noticeForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("noticeTitle").value.trim();
  const text = $("noticeText").value.trim();

  if (!title || !text) return;

  state.notices.unshift({
    id: Date.now().toString(),
    title,
    text,
    date: new Date().toLocaleDateString("gu-IN")
  });

  saveState();
  renderDashboard();
  $("noticeForm").reset();
});

// Sidebarમાં હાલનું પસંદ કરેલું પેજ દર્શાવવું
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });
    link.classList.add("active");
  });
});

$("year").textContent = new Date().getFullYear();
renderDashboard();
