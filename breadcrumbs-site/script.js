const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");
const demoButton = document.getElementById("demoButton");

menuButton.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", isOpen);
});

demoButton.addEventListener("click", () => {
  document.getElementById("features").scrollIntoView({ behavior: "smooth" });
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});
