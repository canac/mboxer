document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector(".content");
  if (content) {
    // Move the message content into an isolated shadow root so that styles
    // don't affect the rest of the page
    content.attachShadow({ mode: "closed" }).innerHTML =
      content.dataset.content;
    content.classList.remove("hidden");
  }
});
