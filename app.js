
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

const GALLERY_BUCKET = "class-gallery";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const recoveryLink =
  window.location.hash.includes("type=recovery") ||
  new URLSearchParams(window.location.search).get("type") === "recovery";

const sections = {
  courses: {
    title: "Courses",
    table: "courses",
    fields: [
      { name: "name", label: "કોર્સનું નામ", required: true },
      { name: "image_url", label: "કોર્સનો ફોટો", type: "image" },
      { name: "description", label: "વર્ણન", type: "textarea" },
      { name: "duration", label: "Duration" },
      { name: "fees", label: "Course Fees (₹)", type: "text", inputmode: "decimal", required: true }
    ]
  },


  learning_info: {
    title: "ભણતરની માહિતી", table: "learning_info",
    fields: [
      { name: "image_url", label: "ફોટો અપલોડ", type: "image" },
      { name: "description", label: "વર્ણન", type: "textarea", required: true }
    ]
  },
  farmer_portal: {
    title: "ખેડૂત પોર્ટલ", table: "farmer_portal",
    fields: [
      { name: "image_url", label: "ફોટો અપલોડ", type: "image" },
      { name: "description", label: "વર્ણન", type: "textarea", required: true }
    ]
  },
  job_posts: {
    title: "સરકારી નોકરી ભરતી", table: "job_posts",
    fields: [
      { name: "title", label: "ભરતીનું નામ", required: true },
      { name: "image_url", label: "ફોટો અપલોડ", type: "image" },
      { name: "description", label: "વર્ણન", type: "textarea", required: true },
      { name: "link", label: "લિંક", type: "url" },
      { name: "category", label: "કેટેગરી", required: true }
    ]
  },
  info_entries: {
    title: "માહિતી", table: "info_entries",
    fields: [{ name: "description", label: "માહિતી", type: "textarea", required: true }]
  },
  site_updates: {
    title: "અપડેટ", table: "site_updates",
    fields: [
      { name: "update_date", label: "તારીખ", type: "date", required: true },
      { name: "weekday", label: "વાર", required: true },
      { name: "update_text", label: "અપડેટ લખાણ", type: "textarea", required: true }
    ]
  },
  legal_services: {
    title: "વકીલની સેવાઓ", table: "legal_services",
    fields: [{ name: "information", label: "માહિતી", type: "textarea", required: true }]
  },
  desktop_products: {
    title: "ડેસ્કટોપ વેચાણ", table: "desktop_products",
    fields: [
      { name: "image_url", label: "પ્રોડક્ટનો ફોટો", type: "image" },
      { name: "product_name", label: "પ્રોડક્ટનું નામ", required: true },
      { name: "description", label: "વર્ણન", type: "textarea", required: true },
      { name: "price", label: "કિંમત (₹)", type: "number", required: true }
    ]
  },
  desktop_orders: {
    title: "ઓર્ડર લિસ્ટ", table: "desktop_orders",
    fields: [
      { name: "customer_name", label: "ગ્રાહકનું નામ", required: true },
      { name: "phone", label: "મોબાઇલ નંબર", required: true },
      { name: "address", label: "સરનામું", type: "textarea", required: true },
      { name: "product_name", label: "ઓર્ડર કરેલી વસ્તુ", required: true },
      { name: "price", label: "કિંમત (₹)", type: "number", required: true },
      { name: "status", label: "ઓર્ડર સ્ટેટસ", type: "select", options: ["નવો", "પ્રોસેસમાં", "પૂર્ણ", "રદ"], required: true }
    ]
  },

  students: {
    title: "Students",
    table: "students",
    fields: [
      { name: "student_id", label: "Student ID", required: true },
      { name: "full_name", label: "Student Name", required: true },
      { name: "phone", label: "Phone" },
      { name: "course_id", label: "કોર્સ પસંદ કરો", type: "course-select" },
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
      {
        name: "student_id",
        label: "Student Database ID",
        type: "number",
        required: true
      },
      {
        name: "attendance_date",
        label: "Date",
        type: "date",
        required: true
      },
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
      {
        name: "student_id",
        label: "Student Database ID",
        type: "number",
        required: true
      },
      {
        name: "amount",
        label: "Total Fees",
        type: "number",
        required: true
      },
      {
        name: "paid_amount",
        label: "Paid Amount",
        type: "number",
        required: true
      },
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
      {
        name: "message",
        label: "Notice Message",
        required: true,
        type: "textarea"
      }
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
      {
        name: "content",
        label: "Content",
        required: true,
        type: "textarea"
      }
    ]
  },

  student_history: {
    title: "Student History",
    table: "student_history",
    fields: [
      {
        name: "student_id",
        label: "Student Database ID",
        type: "number",
        required: true
      },
      {
        name: "description",
        label: "Description",
        required: true,
        type: "textarea"
      }
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
  if (!element) return;

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

// LOGIN

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
    setMessage(
      loginMessage,
      error.message || "Login નિષ્ફળ થયું.",
      true
    );
  } finally {
    busy = false;
    if (button) button.disabled = false;
  }
});

// FORGOT PASSWORD

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
    setMessage(
      loginMessage,
      error.message || "Reset Email મોકલી શકાયો નહીં.",
      true
    );
  }
});

// RESET PASSWORD

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

    setMessage(
      resetMessage,
      "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો. હવે નવા પાસવર્ડથી Login કરો."
    );

    await supabaseClient.auth.signOut();
    document.getElementById("resetPasswordForm").reset();
    showOnly("login");
    setMessage(loginMessage, "નવો પાસવર્ડ સેટ થયો છે. હવે Login કરો.");
  } catch (error) {
    setMessage(
      resetMessage,
      error.message || "પાસવર્ડ બદલી શકાયો નહીં.",
      true
    );
  } finally {
    busy = false;
    if (button) button.disabled = false;
  }
});

// LOGOUT

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showOnly("login");
  setMessage(loginMessage, "તમે Logout થયા છો.");
});

document.querySelectorAll("[data-section]").forEach(button => {
  button.addEventListener("click", () => loadSection(button.dataset.section));
});

// CREATE FORM FIELD

function createField(field, value = "") {
  const safeValue = escapeHTML(value);
  const required = field.required ? "required" : "";
  let control = "";

  if (field.type === "image") {
    control = `<input type="hidden" name="${field.name}" value="${safeValue}">
      <input type="file" name="${field.name}_file" accept="image/*">
      ${value ? `<small>હાલનો ફોટો: <a href="${safeValue}" target="_blank" rel="noopener">જુઓ</a></small>` : ""}`;
  } else if (field.type === "textarea") {
    control = `<textarea name="${field.name}" ${required}>${safeValue}</textarea>`;
  } else if (field.type === "select") {
    control = `<select name="${field.name}" ${required}>
      <option value="">પસંદ કરો</option>
      ${field.options.map(option =>
        `<option value="${escapeHTML(option)}"
          ${String(value) === option ? "selected" : ""}>
          ${escapeHTML(option)}
        </option>`
      ).join("")}
    </select>`;
  } else {
    control = `<input name="${field.name}"
      type="${field.type || "text"}"
      ${field.inputmode ? `inputmode="${field.inputmode}"` : ""}
      value="${safeValue}" ${required}
      ${field.type === "number" ? 'step="any"' : ""}
      ${field.name === "fees" ? 'placeholder="ઉદાહરણ: 2500" autocomplete="off"' : ""}>`;
  }

  return `<label>${escapeHTML(field.label)}${field.required ? " *" : ""}</label>${control}`;
}

// LOAD SECTION

async function loadSection(key) {
  if (!sections[key]) return;

  activeSection = key;
  editingId = null;

  const config = sections[key];

  contentSection.innerHTML =
    `<h2>${escapeHTML(config.title)}</h2><p>લોડ થઈ રહ્યું છે...</p>`;

  const { data, error } = await supabaseClient
    .from(config.table)
    .select("*")
    .limit(100);

  if (error) {
    contentSection.innerHTML =
      `<h2>${escapeHTML(config.title)}</h2>
       <p>ડેટા લોડ કરવામાં સમસ્યા: ${escapeHTML(error.message)}</p>`;

    statusMessage.textContent = "Database error";
    return;
  }

  statusMessage.textContent = "Database સાથે જોડાણ સફળ છે.";

  // GALLERY માટે અલગ Upload UI
  if (key === "gallery") {
    renderGallery(data || []);
    return;
  }

  let html = `<h2>${escapeHTML(config.title)}</h2>`;

  if (!config.readonly) {
    html += `<button type="button" id="addRecordBtn">+ નવો રેકોર્ડ ઉમેરો</button>`;
    html += `<div id="recordFormContainer"></div>`;
  }

  if (!data || data.length === 0) {
    html += "<p>હાલ કોઈ રેકોર્ડ નથી.</p>";
  } else {
    html += '<div style="overflow-x:auto"><table><thead><tr>';

    const keys = Object.keys(data[0]).filter(
      name => name !== "created_at" && name !== "updated_at"
    );

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

  if (addButton) {
    addButton.addEventListener("click", () => renderForm(key));
  }

  contentSection.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
      const row = data.find(
        item => String(item.id) === button.dataset.edit
      );

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

// GALLERY DISPLAY AND UPLOAD FORM

function renderGallery(data) {
  contentSection.innerHTML = `
    <h2>Gallery</h2>

    <div style="
      border:1px solid #d8dee8;
      border-radius:12px;
      padding:16px;
      margin:16px 0;
      background:#fff;
    ">
      <h3>ફોટા અને વીડિયો અપલોડ કરો</h3>

      <form id="galleryUploadForm">
        <label for="galleryTitle">Title (વૈકલ્પિક)</label>
        <input
          id="galleryTitle"
          name="galleryTitle"
          type="text"
          placeholder="ઉદાહરણ: Computer Lab"
        >

        <label for="galleryFiles" style="display:block;margin-top:14px">
          મોબાઇલમાંથી ફોટા અથવા વીડિયો પસંદ કરો
        </label>

        <input
          id="galleryFiles"
          name="galleryFiles"
          type="file"
          accept="image/*,video/*"
          multiple
          required
          style="display:block;width:100%;margin:12px 0"
        >

        <p style="font-size:13px;color:#64748b">
          એક સાથે ઘણી ફાઇલો પસંદ કરી શકો છો. દરેક ફાઇલ વધુમાં વધુ 50 MB.
        </p>

        <button type="submit" id="galleryUploadBtn">
          Upload Files
        </button>

        <p id="galleryUploadMessage" role="status" aria-live="polite"></p>
      </form>
    </div>

    <h3>અપલોડ થયેલી ફાઇલો</h3>

    <div id="galleryItems" style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:16px;
    ">
      ${data.length === 0
        ? "<p>હજુ કોઈ ફોટો કે વીડિયો અપલોડ થયો નથી.</p>"
        : data.map(row => `
          <article style="
            border:1px solid #d8dee8;
            border-radius:10px;
            padding:10px;
            min-width:0;
            background:#fff;
          ">
            <div
              data-preview="${escapeHTML(row.id)}"
              style="
                min-height:100px;
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
                background:#f1f5f9;
                border-radius:8px;
              "
            >ફાઇલ લોડ થઈ રહી છે...</div>

            <p style="overflow-wrap:anywhere;font-weight:600">
              ${escapeHTML(row.title || "Untitled")}
            </p>

            <p style="font-size:13px;color:#64748b">
              ${escapeHTML(row.media_type || "")}
            </p>

            <button
              type="button"
              data-gallery-edit="${escapeHTML(row.id)}"
            >Edit</button>

            <button
              type="button"
              data-gallery-delete="${escapeHTML(row.id)}"
            >Delete</button>
          </article>
        `).join("")
      }
    </div>

    <div id="recordFormContainer"></div>
  `;

  // Private bucket માટે signed URL બનાવો.
  data.forEach(async row => {
    const previewContainer = Array.from(
      contentSection.querySelectorAll("[data-preview]")
    ).find(element => element.dataset.preview === String(row.id));

    if (!previewContainer) return;

    try {
      let mediaUrl = row.media_url;

      if (!mediaUrl) {
        previewContainer.textContent = "ફાઇલનો URL ઉપલબ્ધ નથી.";
        return;
      }

      // જૂના external URLs ને પણ સપોર્ટ કરો.
      if (!/^https?:\/\//i.test(mediaUrl)) {
        const { data: signedData, error } =
          await supabaseClient.storage
            .from(GALLERY_BUCKET)
            .createSignedUrl(mediaUrl, 3600);

        if (error) throw error;

        mediaUrl = signedData.signedUrl;
      }

      // Section બદલાઈ ગયું હોય તો કંઈ ન કરો.
      if (!previewContainer.isConnected) return;

      if (row.media_type === "video") {
        previewContainer.innerHTML = `
          <video
            controls
            playsinline
            preload="metadata"
            style="width:100%;max-height:220px;object-fit:contain"
          ></video>
        `;

        previewContainer.querySelector("video").src = mediaUrl;
      } else {
        previewContainer.innerHTML = `
          <img
            alt="${escapeHTML(row.title || "Gallery photo")}"
            style="width:100%;max-height:220px;object-fit:contain"
          >
        `;

        previewContainer.querySelector("img").src = mediaUrl;
      }
    } catch (error) {
      if (previewContainer.isConnected) {
        previewContainer.textContent =
          "Preview ઉપલબ્ધ નથી: " + error.message;
      }
    }
  });

  // MULTIPLE FILE UPLOAD
  document.getElementById("galleryUploadForm")
    .addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const input = document.getElementById("galleryFiles");
      const titleInput = document.getElementById("galleryTitle");
      const message = document.getElementById("galleryUploadMessage");
      const uploadButton = document.getElementById("galleryUploadBtn");

      const files = Array.from(input.files || []);
      const titlePrefix = titleInput.value.trim();

      if (files.length === 0) {
        setMessage(message, "પહેલાં ફાઇલો પસંદ કરો.", true);
        return;
      }

      // Upload પહેલાં તમામ ફાઇલો તપાસો.
      for (const file of files) {
        if (!file.type.startsWith("image/") &&
            !file.type.startsWith("video/")) {
          setMessage(
            message,
            `${file.name}: આ ફોટો અથવા વીડિયો ફાઇલ નથી.`,
            true
          );
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          setMessage(
            message,
            `${file.name}: ફાઇલ 50 MB કરતાં મોટી છે.`,
            true
          );
          return;
        }
      }

      uploadButton.disabled = true;
      input.disabled = true;
      setMessage(message, "ફાઇલો અપલોડ થઈ રહી છે...");

      let successCount = 0;
      let failedCount = 0;
      const errors = [];

      try {
        const {
          data: { user },
          error: userError
        } = await supabaseClient.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          throw new Error("ફરીથી Admin Login કરો.");
        }

        for (const file of files) {
          let storagePath = null;

          try {
            setMessage(
              message,
              `અપલોડ થઈ રહ્યું છે: ${successCount + failedCount + 1}/${files.length} — ${file.name}`
            );

            const safeFileName = file.name.replace(/[^\w.\-]+/g, "_");
            const uniqueName =
              `${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

            storagePath = `${user.id}/${uniqueName}`;

            const { error: uploadError } = await supabaseClient.storage
              .from(GALLERY_BUCKET)
              .upload(storagePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
              });

            if (uploadError) throw uploadError;

            const mediaType = file.type.startsWith("video/")
              ? "video"
              : "photo";

            const title = titlePrefix
              ? `${titlePrefix} - ${file.name}`
              : file.name;

            const { error: insertError } = await supabaseClient
              .from("gallery")
              .insert({
                title,
                media_url: storagePath,
                media_type: mediaType
              });

            if (insertError) {
              // Database insert નિષ્ફળ જાય તો orphan file દૂર કરવાનો પ્રયાસ.
              await supabaseClient.storage
                .from(GALLERY_BUCKET)
                .remove([storagePath]);

              throw insertError;
            }

            successCount++;
          } catch (error) {
            failedCount++;
            errors.push(`${file.name}: ${error.message}`);
          }
        }

        if (successCount > 0) {
          alert(
            `${successCount} ફાઇલ સફળતાપૂર્વક અપલોડ થઈ.` +
            (failedCount > 0
              ? ` ${failedCount} ફાઇલ અપલોડ ન થઈ.`
              : "")
          );

          await loadSection("gallery");
        } else {
          setMessage(
            message,
            "અપલોડ નિષ્ફળ થયું: " + errors.join(" | "),
            true
          );
        }

        if (failedCount > 0) {
          console.error("Gallery upload errors:", errors);
          statusMessage.textContent =
            `${successCount} સફળ, ${failedCount} નિષ્ફળ.`;
        }
      } catch (error) {
        setMessage(
          message,
          error.message || "અપલોડ કરવામાં સમસ્યા આવી.",
          true
        );
      } finally {
        uploadButton.disabled = false;
        input.disabled = false;
      }
    });

  // EDIT GALLERY RECORD
  contentSection.querySelectorAll("[data-gallery-edit]").forEach(button => {
    button.addEventListener("click", () => {
      const row = data.find(
        item => String(item.id) === button.dataset.galleryEdit
      );

      if (row) renderForm("gallery", row);
    });
  });

  // DELETE GALLERY RECORD AND ITS PRIVATE STORAGE FILE
  contentSection.querySelectorAll("[data-gallery-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const row = data.find(
        item => String(item.id) === button.dataset.galleryDelete
      );

      if (!row) return;

      if (!confirm("શું આ Gallery ફાઇલ કાયમ માટે ડિલીટ કરવી છે?")) {
        return;
      }

      button.disabled = true;

      try {
        const mediaUrl = row.media_url;

        // માત્ર Storage path હોય ત્યારે જ Bucket માંથી ફાઇલ દૂર કરો.
        if (mediaUrl && !/^https?:\/\//i.test(mediaUrl)) {
          const { error: storageError } = await supabaseClient.storage
            .from(GALLERY_BUCKET)
            .remove([mediaUrl]);

          if (storageError) throw storageError;
        }

        const { error: deleteError } = await supabaseClient
          .from("gallery")
          .delete()
          .eq("id", row.id);

        if (deleteError) throw deleteError;

        await loadSection("gallery");
      } catch (error) {
        alert("ડિલીટ કરવામાં સમસ્યા: " + error.message);
        button.disabled = false;
      }
    });
  });
}

// ADD / EDIT FORM FOR OTHER SECTIONS AND GALLERY METADATA

async function renderForm(key, row = null) {
  const config = sections[key];
  editingId = row ? row.id : null;

  const container = document.getElementById("recordFormContainer");
  if (!container) return;

  let courseOptions = [];
  let attendanceStudents = [];
  let feesStudents = [];
  if (key === "students") {
    const { data: courses, error: coursesError } = await supabaseClient
      .from("courses")
      .select("id, name, duration, fees")
      .order("name", { ascending: true });

    if (coursesError) {
      container.innerHTML = `<p>કોર્સ લોડ થઈ શક્યા નથી: ${escapeHTML(coursesError.message)}</p>`;
      return;
    }
    courseOptions = courses || [];
  }

  if (key === "attendance" || key === "fees") {
    const { data: students, error: studentsError } = await supabaseClient
      .from("students")
      .select("id, student_id, full_name, status")
      .order("full_name", { ascending: true });
    if (studentsError) {
      container.innerHTML = "<p>વિદ્યાર્થીઓ લોડ થઈ શક્યા નથી: " + escapeHTML(studentsError.message) + "</p>";
      return;
    }
    const activeStudents = (students || []).filter(student => student.status !== "inactive");
    attendanceStudents = activeStudents;
    feesStudents = activeStudents;
  }

  container.innerHTML = `
    <form id="recordForm">
      <h3>${row ? "રેકોર્ડ Edit કરો" : "નવો રેકોર્ડ ઉમેરો"}</h3>

      ${config.fields.map(field => {
        const value = row ? row[field.name] ?? "" : (key === "courses" && field.name === "fees" ? "0" : "");
        if (key === "students" && field.name === "course_id") {
          return `<label>${escapeHTML(field.label)} *</label>
            <select name="course_id" required>
              <option value="">કોર્સ પસંદ કરો</option>
              ${courseOptions.map(course => `<option value="${course.id}" ${String(value) === String(course.id) ? "selected" : ""}>${escapeHTML(course.name)} (ID: ${course.id})${course.duration ? " — " + escapeHTML(course.duration) : ""}</option>`).join("")}
            </select>
            ${courseOptions.length === 0 ? '<small>પહેલાં Courses વિભાગમાં કોર્સ ઉમેરો.</small>' : ""}
          `;
        }
        if ((key === "attendance" || key === "fees") && field.name === "student_id") {
          const studentOptions = key === "fees" ? feesStudents : attendanceStudents;
          const options = studentOptions.map(student => {
            const studentCode = student.student_id ? "Student ID: " + escapeHTML(student.student_id) : "Student ID નથી";
            return '<option value="' + escapeHTML(student.id) + '"' +
              (String(value) === String(student.id) ? " selected" : "") + ">" +
              escapeHTML(student.full_name || "નામ નથી") + " — " + studentCode +
              " — Database ID: " + escapeHTML(student.id) + "</option>";
          }).join("");
          return '<label>' + escapeHTML(field.label) + ' *</label>' +
            '<select name="student_id" required><option value="">વિદ્યાર્થી પસંદ કરો</option>' +
            options + '</select>' +
            '<small>પસંદ કરેલા વિદ્યાર્થીની Database ID ' + (key === "fees" ? 'fees' : 'attendance') + ' માં સેવ થશે.</small>' +
            (studentOptions.length === 0 ? '<small>હાલ કોઈ Active વિદ્યાર્થી નથી. Students વિભાગમાં જઈ વિદ્યાર્થી ઉમેરો અથવા Status તપાસો.</small>' : "");
        }
        return createField(field, value);
      }).join("")}

      ${key === "students" && !row ? `
        <label>Student Login Password *</label>
        <input name="student_password" type="password" minlength="8" autocomplete="new-password" required>
        <small>વિદ્યાર્થી આ Password વડે APK માં Login કરશે. ઓછામાં ઓછા 8 અક્ષર.</small>
      ` : ""}

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
        record[field.name] = field.type === "number" && key === "courses" && field.name === "fees" ? 0 : null;
      } else if (field.type === "number" || (key === "courses" && field.name === "fees")) {
        const numericValue = Number(String(raw).trim());
        if (!Number.isFinite(numericValue)) throw new Error(field.label + " માટે સાચી સંખ્યા દાખલ કરો.");
        if (key === "courses" && field.name === "fees" && numericValue < 0) throw new Error("Course Fee 0 અથવા તેનાથી વધુ હોવી જોઈએ.");
        record[field.name] = numericValue;
      } else {
        record[field.name] = raw;
      }
    });

    const studentPassword = key === "students" && editingId === null
      ? String(formData.get("student_password") || "")
      : "";

    const saveButton = form.querySelector('[type="submit"]');
    saveButton.disabled = true;

    try {
      for (const field of config.fields.filter(item => item.type === "image")) {
        const file = formData.get(field.name + "_file");
        if (file && file.size > 0) {
          if (!file.type.startsWith("image/")) throw new Error("ફક્ત ફોટો ફાઇલ અપલોડ કરો.");
          if (file.size > 10 * 1024 * 1024) throw new Error("ફોટો 10 MB કરતાં નાનો હોવો જોઈએ.");
          const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
          if (userError || !user) throw new Error("Admin Login ફરી કરો.");
          const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^\\w.\\-]+/g, "_")}`;
          const { error: uploadError } = await supabaseClient.storage.from("public-content").upload(path, file, { upsert: false, contentType: file.type });
          if (uploadError) throw uploadError;
          record[field.name] = supabaseClient.storage.from("public-content").getPublicUrl(path).data.publicUrl;
        }
      }

      if (key === "students" && editingId === null) {
        const { data: { session }, error: sessionError } =
          await supabaseClient.auth.getSession();
        if (sessionError || !session) {
          throw new Error("Admin Login સમાપ્ત થયું છે. ફરી Login કરો.");
        }

        const { error } = await supabaseClient.functions.invoke(
          "create-student-account",
          {
            body: {
              student_id: String(record.student_id || "").trim(),
              full_name: String(record.full_name || "").trim(),
              phone: record.phone,
              course_id: record.course_id,
              admission_date: record.admission_date,
              status: record.status || "active",
              password: studentPassword
            }
          }
        );
        if (error) throw error;
      } else {
        let result;

        if (editingId !== null) {
          result = await supabaseClient
            .from(config.table)
            .update(record)
            .eq("id", editingId);
        } else if (key === "courses") {
          // કોર્સ સેવ થયા પછી Supabase દ્વારા બનાવેલી સાચી ID મેળવો.
          result = await supabaseClient
            .from(config.table)
            .insert(record)
            .select("id")
            .single();
        } else {
          result = await supabaseClient
            .from(config.table)
            .insert(record);
        }

        if (result.error) throw result.error;

        if (key === "students" && editingId !== null && row?.auth_user_id) {
          const { error: profileError } = await supabaseClient
            .from("profiles")
            .update({
              student_id: String(record.student_id || "").trim(),
              full_name: String(record.full_name || "").trim()
            })
            .eq("id", row.auth_user_id);
          if (profileError) {
            throw new Error("વિદ્યાર્થીની માહિતી સેવ થઈ, પરંતુ Login Profile અપડેટ ન થયું: " + profileError.message);
          }
        }
      }

      if (key === "courses" && editingId === null) {
        const savedCourseId = result.data?.id;
        await loadSection(key);
        if (savedCourseId !== undefined && savedCourseId !== null) {
          alert("કોર્સ સફળતાપૂર્વક સેવ થયો. Course Database ID: " + savedCourseId);
        }
      } else {
        setMessage(message, "સેવ થઈ ગયું.");
        await loadSection(key);
      }
    } catch (error) {
      setMessage(
        message,
        error.message || "સેવ કરવામાં સમસ્યા આવી.",
        true
      );

      saveButton.disabled = false;
    }
  });
}

// AUTH STATE CHANGES

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

// START APP

async function startApp() {
  const { data: { session }, error } =
    await supabaseClient.auth.getSession();

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
