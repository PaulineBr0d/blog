fetch('https://magicpiks-75022637d756.herokuapp.com/api/auth/check', {
  method: 'GET',
  credentials: 'include'  
})
  .then(res => res.json())
  .then(data => {
    if (!data.loggedIn) {
      window.location.href = "login.html"; 
    }
  });