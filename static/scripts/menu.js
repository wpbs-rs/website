// The docs menu button, shown on small screens.
const menu = document.querySelector(".menu-toggle");

if (menu) {
    menu.addEventListener("click", () => {
        menu.setAttribute("aria-expanded", document.body.classList.toggle("menu-open"));
    });
}

// The header menu button, shown on small screens.
const header = document.querySelector(".site-header");
const navToggle = header.querySelector(".nav-toggle");

const setNavOpen = (open) => {
    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open);
};

navToggle.addEventListener("click", () => setNavOpen(!header.classList.contains("nav-open")));

header.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
        setNavOpen(false);
        navToggle.focus();
    }
});

// Clicks in the search dialog don't count, so closing it can return focus to
// a link in the menu.
document.addEventListener("click", (event) => {
    if (!header.contains(event.target) && !event.target.closest(".search-modal")) {
        setNavOpen(false);
    }
});
