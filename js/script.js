
// Menu reset
document.addEventListener('DOMContentLoaded', () => {

  const resetBtn = document.getElementById('reset-menu');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.menu-title .label').forEach(label => {
        const original = label.getAttribute('data-original');
        if (original) {
          label.textContent = original;
        }
      });
    });
  }
})

//Menu confirm
document.addEventListener('DOMContentLoaded', () => {
const confirmBtn = document.getElementById('confirm-menu');
if (confirmBtn) {
  confirmBtn.addEventListener('click', (e) => {
     e.preventDefault();
    const selections = {};
    const params = new URLSearchParams();

    document.querySelectorAll('.menu').forEach(menu => {
      const label = menu.querySelector('.menu-title .label');
      const original = label.getAttribute('data-original');
      const current = label.textContent;

      if (original && current && original !== current) {
        selections[original] = current;
      }
    });

    if (selections["Massif"]) params.set("location", selections["Massif"]);
    if (selections["Difficulté"]) params.set("difficulty", selections["Difficulté"]);
    if (selections["Intérêt"]) params.set("interest", selections["Intérêt"]);
    if (selections["Tag"]) params.set("tag", selections["Tag"]);

    window.location.href = `listing.html?${params.toString()}`;
     });
  }
})


//Boutons header
document.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById('home');
  const backBtn = document.getElementById('back');

  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
});

//Boutons slider
function initSlider(imageCount) {
  const slides = document.querySelector(".inner");
  const total = imageCount;
 
  let currentIndex = 0;

  const firstBtn = document.getElementById("first");
  const nextBtn = document.getElementById("next");
  const lastBtn = document.getElementById("last");

 

  if (slides && total > 0) {
    if (firstBtn) {
      firstBtn.addEventListener("click", () => {
        currentIndex = 0;
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentIndex < total - 1) {
         currentIndex++;
        }  
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      });
    }

    if (lastBtn) {
      lastBtn.addEventListener("click", () => {
        currentIndex = total - 1;
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
  
      });
    }
  }
}

//Bouton Add
document.addEventListener('DOMContentLoaded', () => {
const addBtn = document.getElementById('add-menu');
if (addBtn) {
/*/if (user && user.role === 'admin') {
  addBtn.style.display = 'inline-block';*/
  addBtn.addEventListener('click', e => {
   
    e.preventDefault();
    window.location.href = 'add.html';
 });
 /*} else {
  addBtn.style.display = 'none';
}*/
}})