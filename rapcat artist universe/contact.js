const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
contactForm.addEventListener("submit", (event) => {
event.preventDefault();
const fullName = document.getElementById("fullName").value.trim();
const email = document.getElementById("email").value.trim();
const purpose = document.getElementById("purpose").value;
const message = document.getElementById("message").value.trim();
if (!fullName || !email || !purpose || !message) {
formStatus.textContent = "Please fill in all fields before sending.";
return;
}
formStatus.textContent = `Message transmitted. Thank you, ${fullName}. Your ${purpose.toLowerCase()} request has been recorded.`;contactForm.reset();});