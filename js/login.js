document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const res = await fetch("https://mon-app-node-c73ee22982be.herokuapp.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const result = await res.json();

  if (res.ok) {
    // Redirige vers add.html ou une autre page protégée
    window.location.href = "add.html";
  } else {
    document.getElementById("loginError").textContent = result.message || "Erreur de connexion.";
  }
});
