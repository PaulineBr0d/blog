fetch('https://magicpiks-75022637d756.herokuapp.com/api/auth/check', {
  method: 'GET',
  credentials: 'include'  // 🔥 indispensable
})
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "login.html"; 
    }
  });