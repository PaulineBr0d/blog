fetch('https://magicpiks.onrender.com/api/auth/check', {
  method: 'GET',
  credentials: 'include'  
})
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "login.html"; 
    }
  });