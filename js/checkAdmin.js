fetch('/api/auth/check')
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "login.html"; 
    }
  });