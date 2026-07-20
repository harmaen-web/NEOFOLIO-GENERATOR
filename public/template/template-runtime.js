(() => {
  const style = document.createElement("style");
  style.textContent = `
    body.portfolio-dark { background: #0b1120 !important; color: #e5e7eb !important; }
    body.portfolio-dark main, body.portfolio-dark header, body.portfolio-dark aside, body.portfolio-dark nav,
    body.portfolio-dark section, body.portfolio-dark footer { color: inherit !important; }
    body.portfolio-dark .text-gray-900, body.portfolio-dark .text-gray-800, body.portfolio-dark .text-gray-700 { color: #e5e7eb !important; }
    body.portfolio-dark .bg-white, body.portfolio-dark [class*="bg-white/"] { background-color: rgba(15, 23, 42, .86) !important; }
    body.portfolio-recruiter *, body.portfolio-recruiter *::before, body.portfolio-recruiter *::after { animation: none !important; transition: none !important; transform: none !important; }
    [data-portfolio-section] { scroll-margin-top: 1rem; }
  `;
  document.head.appendChild(style);

  const sectionKey = (section) => section.querySelector("h2")?.textContent
    ?.trim().toLowerCase().replace(/\s+/g, "_") || "";

  function applyOrder(order = []) {
    const main = document.querySelector("main");
    if (!main || !order.length) return;
    const sections = [...main.querySelectorAll(":scope > section")];
    const byKey = new Map(sections.map((section) => [sectionKey(section), section]));
    order.forEach((key) => {
      const section = byKey.get(key);
      if (section) main.appendChild(section);
    });
  }

  function applySettings(settings = {}) {
    const root = document.documentElement;
    const body = document.body;
    root.style.fontSize = `${settings.fontSize || 16}px`;
    root.style.setProperty("--portfolio-gap", `${settings.spacing || 32}px`);
    root.style.setProperty("--portfolio-radius", `${settings.radius || 16}px`);
    body.classList.toggle("portfolio-dark", settings.theme === "dark");
    body.classList.toggle("portfolio-recruiter", Boolean(settings.recruiterMode));
    document.querySelectorAll("main").forEach((main) => { main.style.gap = "var(--portfolio-gap)"; });
    document.querySelectorAll(".rounded-2xl, .rounded-xl, .rounded-lg").forEach((element) => {
      element.style.borderRadius = "var(--portfolio-radius)";
    });
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    const message = event.data;
    if (message?.type === "APPLY_TEMPLATE_SETTINGS") {
      applySettings(message.payload?.settings);
      applyOrder(message.payload?.sectionOrder);
    }
  });
})();
