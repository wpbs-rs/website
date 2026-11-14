// The announcement's dismiss button. A dismissed announcement stays hidden until
// its id changes; the inline script in the page head hides it before the page
// is drawn.
const announcement = document.querySelector(".announcement");

if (announcement) {
    announcement.querySelector(".announcement-close").addEventListener("click", () => {
        document.documentElement.classList.add("announcement-hidden");
        try { localStorage.setItem("announcement-bar-hidden", announcement.dataset.id); } catch (_) {}
        // The button is gone, so focus moves to the start of the header.
        document.querySelector(".logo").focus();
    });

    // The docs sidebar sticks below the announcement and header, whose height
    // changes as the announcement wraps or is dismissed.
    const top = document.querySelector(".site-top");
    new ResizeObserver(() => {
        document.documentElement.style.setProperty("--site-top-height", `${top.offsetHeight}px`);
    }).observe(top);
}
