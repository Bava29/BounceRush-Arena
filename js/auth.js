document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.getAttribute("aria-controls"));
        if (!input) return;
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
        button.innerHTML = `<i class="fa-regular ${visible ? "fa-eye-slash" : "fa-eye"}" aria-hidden="true"></i>`;
    });
});

document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = form.querySelector(".form-message");
        const email = form.elements.email;
        if (!form.checkValidity()) {
            form.reportValidity();
            message.textContent = "Please complete the required fields with valid information.";
            return;
        }
        if (form.dataset.authForm === "register" && form.elements.password.value !== form.elements.confirmPassword.value) {
            form.elements.confirmPassword.setCustomValidity("Passwords do not match.");
            form.elements.confirmPassword.reportValidity();
            form.elements.confirmPassword.addEventListener("input", () => form.elements.confirmPassword.setCustomValidity(""), { once: true });
            message.textContent = "Your passwords do not match.";
            return;
        }
        message.textContent = form.dataset.authForm === "login"
            ? `Sign in form is ready for ${email.value}. Connect an authentication provider to continue.`
            : "Your details are valid. Connect an authentication provider to create your account.";
    });
    form.addEventListener("input", () => {
        const message = form.querySelector(".form-message");
        if (message) message.textContent = "";
    });
});

document.querySelectorAll("[data-social]").forEach((button) => {
    button.addEventListener("click", () => {
        const message = document.querySelector(".form-message");
        if (message) message.textContent = `${button.dataset.social} sign in is not connected yet.`;
    });
});

const forgotLink = document.querySelector("[data-forgot]");
if (forgotLink) forgotLink.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.querySelector('[name="email"]');
    const message = document.querySelector(".form-message");
    if (!email.value.trim()) {
        email.focus();
        message.textContent = "Enter your email address to reset your password.";
    } else if (email.checkValidity()) {
        message.textContent = `Password reset can be sent to ${email.value} once authentication is connected.`;
    } else {
        email.reportValidity();
    }
});

const termsLink = document.querySelector("[data-terms]");
if (termsLink) termsLink.addEventListener("click", (event) => event.preventDefault());
