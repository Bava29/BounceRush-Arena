/* =========================================================
   BOUNCERUSH ARENA
   MAIN JAVASCRIPT
========================================================= */

/* =========================
   SHARED THEME AND DIRECTION
========================= */

const rootElement = document.documentElement;
const themeButtons = document.querySelectorAll(".theme-toggle");
const rtlButtons = document.querySelectorAll(".rtl-toggle");

function applyTheme(theme) {
    rootElement.classList.toggle("dark-mode", theme === "dark");
    themeButtons.forEach((button) => {
        const icon = button.querySelector("i");
        if (icon) icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
}

function applyDirection(direction) {
    rootElement.setAttribute("dir", direction);
    rtlButtons.forEach((button) => button.setAttribute("aria-pressed", direction === "rtl" ? "true" : "false"));
}

applyTheme(localStorage.getItem("bouncerush-theme") || "light");
applyDirection(localStorage.getItem("bouncerush-direction") || "ltr");

themeButtons.forEach((button) => button.addEventListener("click", () => {
    const nextTheme = rootElement.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem("bouncerush-theme", nextTheme);
    applyTheme(nextTheme);
}));

rtlButtons.forEach((button) => button.addEventListener("click", () => {
    const nextDirection = rootElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    localStorage.setItem("bouncerush-direction", nextDirection);
    applyDirection(nextDirection);
}));

/* =========================
   BOOKING FORM
========================= */

const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
    const packageCatalog = {
        single: { name: "Single Session", price: 799, detail: "One arena session · ₹799" },
        three: { name: "3-Session Pass", price: 2099, detail: "Three sessions · ₹2,099" },
        five: { name: "5-Session Pass", price: 3299, detail: "Five sessions · ₹3,299" },
        group: { name: "Group Package", price: 5499, detail: "Group session package · ₹5,499" }
    };
    const fields = ["activity", "groupSize", "date", "time", "package", "fullName", "email", "phone", "players"];
    const packageSelect = bookingForm.elements.package;
    const dateInput = bookingForm.elements.date;
    const packageInfo = document.getElementById("package-info");
    const feedback = document.getElementById("booking-feedback");
    const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
    const localToday = new Date();
    dateInput.min = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, "0")}-${String(localToday.getDate()).padStart(2, "0")}`;

    const valueFor = (name) => bookingForm.elements[name]?.value.trim() || "—";
    function updateSummary() {
        const selectedPackage = packageCatalog[packageSelect.value];
        const chosenDate = dateInput.value;
        const displayDate = chosenDate ? new Date(`${chosenDate}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
        document.querySelector('[data-summary="activity"]').textContent = valueFor("activity");
        document.querySelector('[data-summary="groupSize"]').textContent = valueFor("groupSize");
        document.querySelector('[data-summary="date"]').textContent = displayDate;
        document.querySelector('[data-summary="time"]').textContent = valueFor("time");
        document.querySelector('[data-summary="package"]').textContent = selectedPackage?.name || "—";
        document.querySelector('[data-summary="total"]').textContent = selectedPackage ? money(selectedPackage.price) : "—";
        packageInfo.textContent = selectedPackage ? selectedPackage.detail : "Select a package to see its details and price.";
    }
    function setError(name, message) {
        const input = bookingForm.elements[name];
        const target = bookingForm.querySelector(`[data-error="${name}"]`);
        if (target) target.textContent = message;
        if (input) input.classList.toggle("input-invalid", Boolean(message));
    }
    fields.forEach((name) => bookingForm.elements[name].addEventListener("input", () => {
        setError(name, "");
        feedback.textContent = "";
        updateSummary();
    }));
    bookingForm.elements.package.addEventListener("change", updateSummary);
    bookingForm.elements.activity.addEventListener("change", updateSummary);
    bookingForm.elements.groupSize.addEventListener("change", updateSummary);
    bookingForm.elements.time.addEventListener("change", updateSummary);

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        feedback.textContent = "";
        const errors = {};
        fields.forEach((name) => { if (!valueFor(name) || valueFor(name) === "—") errors[name] = "This field is required."; });
        if (valueFor("email") !== "—" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueFor("email"))) errors.email = "Enter a valid email address.";
        if (valueFor("phone") !== "—" && (valueFor("phone").replace(/\D/g, "").length < 7 || valueFor("phone").replace(/\D/g, "").length > 15)) errors.phone = "Enter a valid phone number.";
        const playerCount = Number(valueFor("players"));
        if (valueFor("players") !== "—" && (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 100)) errors.players = "Enter a whole number from 2 to 100.";
        if (valueFor("date") !== "—" && valueFor("date") < dateInput.min) errors.date = "Choose today or a future date.";
        fields.forEach((name) => setError(name, errors[name] || ""));
        const firstInvalid = fields.find((name) => errors[name]);
        if (firstInvalid) {
            bookingForm.elements[firstInvalid].focus();
            feedback.textContent = "Please review the highlighted fields.";
            return;
        }
        feedback.textContent = "Your booking details are ready. Connect a booking service to confirm availability and complete your reservation.";
    });
    updateSummary();
}


/* =========================
   MOBILE MENU
========================= */

const menuToggle = document.getElementById("menu-toggle");
const mainNavigation = document.getElementById("main-navigation");

if (menuToggle && mainNavigation) {

    menuToggle.addEventListener("click", () => {

        const isOpen = mainNavigation.classList.toggle("active");

        menuToggle.classList.toggle("active", isOpen);

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        document.body.classList.toggle("menu-open", isOpen);

    });


    /* Close Menu When Navigation Link Is Clicked */

    const navigationLinks = mainNavigation.querySelectorAll(
        ".nav-link:not(.dropdown-link), .mobile-login, .mobile-book"
    );

    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mainNavigation.classList.remove("active");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            document.body.classList.remove("menu-open");

        });

    });

}


/* =========================
   MOBILE HOME DROPDOWN
========================= */

const dropdownLink = document.querySelector(".dropdown-link");
const dropdownParent = document.querySelector(".has-dropdown");

if (dropdownLink && dropdownParent) {

    dropdownLink.addEventListener("click", (event) => {

        if (window.innerWidth <= 1199) {

            event.preventDefault();

            dropdownParent.classList.toggle("dropdown-open");

        }

    });

}


/* =========================
   CLOSE MENU ON RESIZE
========================= */

window.addEventListener("resize", () => {

    if (window.innerWidth > 1024) {

        if (mainNavigation) {
            mainNavigation.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        if (dropdownParent) {
            dropdownParent.classList.remove("dropdown-open");
        }

        document.body.classList.remove("menu-open");
    }

});


/* =========================================================
   SCROLL TO TOP
========================================================= */

const scrollTopBtn = document.getElementById("scroll-top-btn");

if (scrollTopBtn) {

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add("show");
        } else {
            scrollTopBtn.classList.remove("show");
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

}

document.querySelectorAll(".home2-faq-question").forEach((question) => {

    question.addEventListener("click", () => {

        const currentItem = question.closest(".home2-faq-item");
        const isActive = currentItem.classList.contains("active");

        document.querySelectorAll(".home2-faq-item").forEach((item) => {
            item.classList.remove("active");

            const icon = item.querySelector(".home2-faq-question i");

            if (icon) {
                icon.classList.remove("fa-minus");
                icon.classList.add("fa-plus");
            }

            const button = item.querySelector(".home2-faq-question");

            if (button) {
                button.setAttribute("aria-expanded", "false");
            }
        });

        if (!isActive) {

            currentItem.classList.add("active");

            const icon = currentItem.querySelector(
                ".home2-faq-question i"
            );

            if (icon) {
                icon.classList.remove("fa-plus");
                icon.classList.add("fa-minus");
            }

            question.setAttribute("aria-expanded", "true");
        }

    });

});

/* =========================================
   ACTIVITIES FAQ ACCORDION
========================================= */

const activitiesFaqItems = document.querySelectorAll(
    ".activities-faq-item"
);

activitiesFaqItems.forEach((item) => {

    const question = item.querySelector(
        ".activities-faq-question"
    );

    const answer = item.querySelector(
        ".activities-faq-answer"
    );

    if (!question || !answer) return;

    if (item.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px";
    }

    question.addEventListener("click", () => {

        activitiesFaqItems.forEach((otherItem) => {

            if (otherItem !== item) {

                otherItem.classList.remove("active");

                const otherAnswer =
                    otherItem.querySelector(
                        ".activities-faq-answer"
                    );

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            }

        });


        const isActive = item.classList.contains("active");

        if (isActive) {

            item.classList.remove("active");
            answer.style.maxHeight = null;

        } else {

            item.classList.add("active");
            answer.style.maxHeight =
                answer.scrollHeight + "px";

        }

    });

});

/* =========================================
   GROUP EXPERIENCE BUILDER
========================================= */

const groupActivityChoices = document.querySelectorAll(
    ".group-builder-choice"
);

const groupDurationChoices = document.querySelectorAll(
    ".group-duration-option"
);

const groupPlayerMinus = document.getElementById(
    "group-player-minus"
);

const groupPlayerPlus = document.getElementById(
    "group-player-plus"
);

const groupPlayerValue = document.getElementById(
    "group-player-value"
);

const groupSummaryActivity = document.getElementById(
    "group-summary-activity"
);

const groupSummaryPlayers = document.getElementById(
    "group-summary-players"
);

const groupSummaryDuration = document.getElementById(
    "group-summary-duration"
);

const groupSummaryAddons = document.getElementById(
    "group-summary-addons"
);

const groupSummaryPrice = document.getElementById(
    "group-summary-price"
);

let groupPlayers = 10;
let selectedActivity = "Bubble Football";
let selectedDuration = "45 Minutes";


/* ---------- Activity Selection ---------- */

groupActivityChoices.forEach((choice) => {

    choice.addEventListener("click", () => {

        groupActivityChoices.forEach((item) => {
            item.classList.remove("active");
        });

        choice.classList.add("active");

        selectedActivity =
            choice.dataset.activity || "Bubble Football";

        updateGroupSummary();

    });

});


/* ---------- Duration Selection ---------- */

groupDurationChoices.forEach((choice) => {

    choice.addEventListener("click", () => {

        groupDurationChoices.forEach((item) => {
            item.classList.remove("active");
        });

        choice.classList.add("active");

        selectedDuration =
            choice.dataset.duration || "45 Minutes";

        updateGroupSummary();

    });

});


/* ---------- Player Counter ---------- */

if (groupPlayerPlus) {

    groupPlayerPlus.addEventListener("click", () => {

        if (groupPlayers < 30) {
            groupPlayers++;
            updateGroupSummary();
        }

    });

}


if (groupPlayerMinus) {

    groupPlayerMinus.addEventListener("click", () => {

        if (groupPlayers > 4) {
            groupPlayers--;
            updateGroupSummary();
        }

    });

}


/* ---------- Add-ons ---------- */

const groupAddonInputs = document.querySelectorAll(
    ".group-addon input"
);

groupAddonInputs.forEach((input) => {

    input.addEventListener("change", () => {
        updateGroupSummary();
    });

});


/* ---------- Update Summary ---------- */

function updateGroupSummary() {

    if (groupPlayerValue) {
        groupPlayerValue.textContent = groupPlayers;
    }

    if (groupSummaryActivity) {
        groupSummaryActivity.textContent =
            selectedActivity;
    }

    if (groupSummaryPlayers) {
        groupSummaryPlayers.textContent =
            groupPlayers;
    }

    if (groupSummaryDuration) {
        groupSummaryDuration.textContent =
            selectedDuration;
    }


    const selectedAddons = [];

    groupAddonInputs.forEach((input) => {

        if (input.checked) {
            selectedAddons.push(input.value);
        }

    });


    if (groupSummaryAddons) {

        groupSummaryAddons.textContent =
            selectedAddons.length
                ? selectedAddons.join(", ")
                : "None";

    }


    /* ---------- Demo Price Calculation ---------- */

    let basePrice = 899;

    if (selectedActivity === "Zorbing") {
        basePrice = 799;
    }

    if (selectedActivity === "Both Activities") {
        basePrice = 1299;
    }

    if (selectedDuration === "60 Minutes") {
        basePrice += 200;
    }

    if (selectedDuration === "90 Minutes") {
        basePrice += 450;
    }

    if (groupPlayers > 10) {
        basePrice +=
            Math.ceil((groupPlayers - 10) / 5) * 250;
    }

    if (selectedAddons.includes("Photography")) {
        basePrice += 300;
    }

    if (selectedAddons.includes("Refreshments")) {
        basePrice += 250;
    }


    if (groupSummaryPrice) {

        groupSummaryPrice.textContent =
            "₹" + basePrice.toLocaleString("en-IN");

    }

}


/* Initial State */
updateGroupSummary();