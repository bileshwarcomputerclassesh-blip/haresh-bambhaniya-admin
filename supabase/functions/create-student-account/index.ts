import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function loginEmail(studentId: string) {
  const bytes = new TextEncoder().encode(studentId.trim());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `student-${encoded}@students.bileshwar.invalid`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "POST required." }, 405);

  const match = (req.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!match) return reply({ error: "Admin login required." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return reply({ error: "Supabase function secrets missing." }, 500);

  const token = match[1];
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const { data: authData, error: authError } = await caller.auth.getUser(token);
    if (authError || !authData.user) return reply({ error: "Admin session invalid. Login again." }, 401);

    const { data: profile, error: profileError } = await db
      .from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== "admin") return reply({ error: "Admin permission required." }, 403);

    const body = await req.json();
    const studentId = String(body.student_id || "").trim();
    const fullName = String(body.full_name || "").trim();
    const password = String(body.password || "");
    const phone = body.phone ? String(body.phone).trim() : null;
    const courseId = body.course_id === null || body.course_id === "" || body.course_id === undefined
      ? null : Number(body.course_id);
    const admissionDate = body.admission_date || null;
    const status = body.status === "inactive" ? "inactive" : "active";

    if (!studentId || !fullName) return reply({ error: "Student ID અને નામ જરૂરી છે." }, 400);
    if (new TextEncoder().encode(studentId).length > 40) return reply({ error: "Student ID 40 bytes સુધી રાખો." }, 400);
    if (password.length < 8) return reply({ error: "Password ઓછામાં ઓછા 8 અક્ષરનો હોવો જોઈએ." }, 400);
    if (courseId !== null && (!Number.isFinite(courseId) || courseId <= 0)) {
      return reply({ error: "Course Database ID ખોટો છે." }, 400);
    }

    const { data: rows, error: findError } = await db.from("students")
      .select("*").eq("student_id", studentId).limit(1);
    if (findError) throw findError;
    const existing = rows?.[0] || null;
    if (existing?.auth_user_id) return reply({ error: "આ Student ID નો Login Account પહેલેથી છે." }, 409);

    const { data: newAuth, error: createError } = await db.auth.admin.createUser({
      email: loginEmail(studentId),
      password,
      email_confirm: true,
      user_metadata: { student_id: studentId, full_name: fullName }
    });
    if (createError || !newAuth.user) return reply({ error: createError?.message || "Login account બનાવી શકાયું નહીં." }, 400);

    const uid = newAuth.user.id;
    let studentDbId: number | null = null;
    try {
      const studentRecord = {
        auth_user_id: uid, student_id: studentId, full_name: fullName,
        phone, course_id: courseId, admission_date: admissionDate, status
      };
      if (existing) {
        const { error } = await db.from("students").update(studentRecord).eq("id", existing.id);
        if (error) throw error;
        studentDbId = existing.id;
      } else {
        const { data, error } = await db.from("students").insert(studentRecord).select("id").single();
        if (error) throw error;
        studentDbId = data.id;
      }

      const { error: profileSaveError } = await db.from("profiles").upsert({
        id: uid, student_id: studentId, full_name: fullName, role: "student"
      }, { onConflict: "id" });
      if (profileSaveError) throw profileSaveError;

      return reply({ success: true, student_id: studentId, student_database_id: studentDbId }, 201);
    } catch (saveError) {
      if (existing) {
        await db.from("students").update({ auth_user_id: null }).eq("id", existing.id);
      } else if (studentDbId !== null) {
        await db.from("students").delete().eq("id", studentDbId);
      }
      await db.auth.admin.deleteUser(uid);
      throw saveError;
    }
  } catch (error) {
    console.error("create-student-account error", error);
    return reply({ error: error instanceof Error ? error.message : "Account creation failed." }, 500);
  }
});
