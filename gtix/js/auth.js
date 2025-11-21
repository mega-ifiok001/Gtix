// js/auth.js → FINAL BULLETPROOF VERSION (2025 EDITION)

const SUPABASE_URL = "https://wvkljqiblwpajbaoqviu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a2xqcWlibHdwYWpiYW9xdml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Nzc0MjEsImV4cCI6MjA3OTE1MzQyMX0.BBedIJKfYY26WMPOGqwJOn6dnxSObOGvmIDZRAV5ens";

// DO NOT wait for non-existent "supabase" global
// Just create the client immediately — supabase-js@2 exposes it as window.supabase automatically
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

console.log("Supabase client initialized from auth.js");

// ====== AUTH FUNCTIONS (exposed globally) ======
window.signInUser = async ({ email, password }) => {
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) alert("Login failed: " + error.message);
  else {
    alert("Welcome back!");
    location.href = "index.html";
  }
};

window.signUpUser = async ({ email, password, first_name = "", last_name = "" }) => {
  const { data, error } = await window.supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { first_name, last_name } }
  });

  if (error) alert("Sign up failed: " + error.message);
  else {
    alert("Account created successfully!");
    location.href = "index.html";
  }
};

window.signOutUser = async () => {
  await window.supabaseClient.auth.signOut();
  location.href = "sign_in.html";
};

// ====== NAVBAR AUTO-UPDATE (BEST PART) ======
const updateNavbar = async () => {
  const { data: { user } } = await window.supabaseClient.auth.getUser();

  const loggedOutEl = document.getElementById("auth-logged-out");
  const loggedInEl = document.getElementById("auth-logged-in");
  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");
  const avatarEls = document.querySelectorAll("#user-avatar, #user-avatar2");

  if (user) {
    if (loggedOutEl) loggedOutEl.style.display = "none";
    if (loggedInEl) loggedInEl.style.display = "block";

    const name = `${user.user_metadata?.first_name || user.email.split("@")[0]} ${user.user_metadata?.last_name || ""}`.trim();
    if (userNameEl) userNameEl.textContent = name;
    if (userEmailEl) userEmailEl.textContent = user.email;

    avatarEls.forEach(img => {
      const avatarUrl = user.user_metadata?.avatar_url;
      const letter = user.email[0].toUpperCase();

      if (avatarUrl) {
        img.src = avatarUrl;
        img.style.display = "block";
        if (img.nextElementSibling) img.nextElementSibling.style.display = "none";
      } else {
        img.style.display = "none";
        let fallback = img.nextElementSibling;
        if (!fallback || !fallback.classList.contains("avatar-fallback")) {
          fallback = document.createElement("div");
          fallback.className = "avatar-fallback";
          fallback.style.cssText = "width:40px;height:40px;border-radius:50%;background:#6366f1;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;";
          img.parentNode.appendChild(fallback);
        }
        fallback.textContent = letter;
        fallback.style.display = "flex";
      }
    });

  } else {
    if (loggedOutEl) loggedOutEl.style.display = "flex";
    if (loggedInEl) loggedInEl.style.display = "none";
  }
};

// Run immediately + on any auth change
updateNavbar();
window.supabaseClient.auth.onAuthStateChange(updateNavbar);