/* ============================================================
   DHARIGA MART - register.js
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    // Show / hide password (toggle buttons flagged with data-toggle-pw)
    document.querySelectorAll("[data-toggle-pw]").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.togglePw);
            const icon = btn.querySelector("i");
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            icon.classList.toggle("bi-eye");
            icon.classList.toggle("bi-eye-slash");
        });
    });

    const form = document.getElementById("registerForm");
    const alert = document.getElementById("registerAlert");

    const setFieldError = (id, errorId, message) => {
        const input = document.getElementById(id);
        const err = document.getElementById(errorId);
        input.classList.toggle("is-invalid", !!message);
        err.textContent = message || "";
    };

    const validators = {
        name: v => v.length >= 2 ? "" : "Name must be at least 2 characters.",
        phone: v => /^[6-9]\d{9}$/.test(v) ? "" : "Enter a valid 10-digit mobile number.",
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address.",
        password: v => v.length >= 6 ? "" : "Password must be at least 6 characters."
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        alert.classList.add("d-none");

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        let valid = true;

        for (const [field, validate] of Object.entries(validators)) {
            const msg = validate(document.getElementById(field).value.trim());
            setFieldError(field, field + "Error", msg);
            if (msg) valid = false;
        }

        if (!confirmPassword) {
            setFieldError("confirmPassword", "confirmError", "Please confirm your password.");
            valid = false;
        } else if (password !== confirmPassword) {
            setFieldError("confirmPassword", "confirmError", "Passwords do not match.");
            valid = false;
        } else {
            setFieldError("confirmPassword", "confirmError", "");
        }

        if (!valid) return;

        const btn = document.getElementById("registerBtn");
        btn.disabled = true;
        document.getElementById("registerSpinner").classList.remove("d-none");

        try {
            await api("/api/auth/register", "POST", {
                name, phone, email, password, confirmPassword
            });
            window.location.href = "login.html?registered=1";
        } catch (err) {
            alert.classList.remove("d-none");
            alert.classList.add("alert-danger");
            alert.textContent = err.message;
            btn.disabled = false;
            document.getElementById("registerSpinner").classList.add("d-none");
        }
    });

    // Live clear of errors on input
    ["name", "phone", "email", "password", "confirmPassword"].forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            setFieldError(id, id + "Error", "");
        });
    });
});