(function () {
  const key = "tn12-lab-theme";
  const saved = localStorage.getItem(key);
  document.documentElement.dataset.theme = saved === "light" ? "light" : "dark";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";

  function render() {
    const light = document.documentElement.dataset.theme === "light";
    button.textContent = light ? "Dark mode" : "Light mode";
    button.setAttribute("aria-label", `Switch to ${light ? "dark" : "light"} mode`);
  }

  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(key, next);
    render();
  });

  render();
  document.addEventListener("DOMContentLoaded", () => document.body.append(button));
})();
