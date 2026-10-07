document.querySelectorAll("[data-lamp-control]").forEach((control) => {
  const scope = control.closest("[data-lamp-preview]");
  if (!scope) return;

  const buttons = control.querySelectorAll("button");
  const images = scope.querySelectorAll("[data-lamp-state]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = button.dataset.state;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      images.forEach((image) => {
        image.classList.toggle("active", image.dataset.lampState === state);
      });
    });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".fade-up").forEach((element) => observer.observe(element));
