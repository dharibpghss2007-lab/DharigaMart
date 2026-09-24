/* ============================================================
   DHARIGA MART - login.js
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const alert = document.getElementById("loginAlert");
    const form = document.getElementById("loginForm");

    function showAlert(message, type) {
        alert.classList.remove("d-none");
        alert.classList.toggle("alert-success", type === "success");
        alert.classList.toggle("alert-danger", type === "error");
        alert.textContent = message;
    }

    if (params.get("registered")) {
        showAlert("Account created successfully! Please login to continue.", "success");
    }
    if (params.get("expired")) {
        showAlert("Your session has expired. Please login again.", "error");
    }

    // Already logged in? go to home
    if (isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Show / hide password
    const toggleBtn = document.getElementById("togglePassword");
    toggleBtn.addEventListener("click", () => {
        const input = document.getElementById("password");
        const icon = document.getElementById("toggleIcon");
        const isHidden = input.type === "password";
        input.type = isHidden ? "text" : "password";
        icon.classList.toggle("bi-eye");
        icon.classList.toggle("bi-eye-slash");
    });

    // Validation helpers
    const setFieldError = (id, errorId, message) => {
        const input = document.getElementById(id);
        const err = document.getElementById(errorId);
        input.classList.toggle("is-invalid", !!message);
        err.textContent = message || "";
    };

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    }
    function validatePassword(pw) {
        return pw.length >= 6;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alert.classList.add("d-none");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        let valid = true;
        if (!email || !validateEmail(email)) {
            setFieldError("email", "emailError", "Please enter a valid email address.");
            valid = false;
        } else {
            setFieldError("email", "emailError", "");
        }
        if (!password) {
            setFieldError("password", "passwordError", "Password is required.");
            valid = false;
        } else if (!validatePassword(password)) {
            setFieldError("password", "passwordError", "Password must be at least 6 characters.");
            valid = false;
        } else {
            setFieldError("password", "passwordError", "");
        }
        if (!valid) return;

        const btn = document.getElementById("loginBtn");
        btn.disabled = true;
        document.getElementById("loginSpinner").classList.remove("d-none");

        try {
            const data = await api("/api/auth/login", "POST", { email, password });
            setAuth(data.token, data.user);
            window.location.href = "index.html";
        } catch (err) {
            showAlert(err.message, "error");
            btn.disabled = false;
            document.getElementById("loginSpinner").classList.add("d-none");
        }
    });

    // Forgot password modal
    const forgotForm = document.getElementById("forgotForm");
    forgotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value.trim();
        const err = document.getElementById("forgotEmailError");
        if (!validateEmail(email)) {
            document.getElementById("forgotEmail").classList.add("is-invalid");
            err.textContent = "Please enter a valid email address.";
            return;
        }
        document.getElementById("forgotEmail").classList.remove("is-invalid");
        err.textContent = "";

        const modal = bootstrap.Modal.getInstance(document.getElementById("forgotModal"));
        modal.hide();
        showAlert("Password reset link sent to " + email + " (demo: check your inbox).", "success");
    });
});