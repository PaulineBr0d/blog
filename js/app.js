//ajout d'un fonction pour limiter le chargement des images
function optimizeCloudinaryUrl(url, options = "w_auto,dpr_auto,q_auto,f_webp") {
  if (typeof url !== "string" || !url.includes("/upload/")) return url || "";
  return url.replace("/upload/", `/upload/${options}/`);
}

//lancement de l'API pour récupérer les données
fetch('https://magicpiks.onrender.com/api/data') 
  .then(res => res.json())
  .then(data => {
    const page = document.body.getAttribute('data-page');
    if (page === 'index') {
      loadIndex(data);
     
const { locations, difficulties, interests, tags } = extractCategories(data);

  const menus = {
    'Massif': locations,
    'Difficulté': difficulties,
    'Intérêt': interests,
    'Tag': tags,
  };

      generateMenusFromData(menus);
      initMenuToggle();
    }
    if (page === 'listing') {
      loadListingFiltered(data);
    }
    if (page === 'detail') {
      loadDetail();
    }
  })
  .catch(err => {console.error('Erreur API', err);
      const index = document.querySelector('.gallery');
      const error = document.createElement('div');
      error.innerHTML = `<div class="error">Problème avec les données 😕</div>`;
      index.appendChild(error);}
);


//extraction des sous-menus
function extractCategories(data) {
  const locations = [...new Set(data.map(r => r.location))];
  const difficulties = [...new Set(data.map(r => r.difficulty))];
  const interests = [...new Set(data.map(r => r.interest))];
  const tags = [...new Set(data.flatMap(r => r.tags))];

  return { locations, difficulties, interests, tags };
}

// PAGE INDEX : Affiche les 4 dernières randos
function loadIndex(data) {
  const gallery = document.querySelector('.gallery');
  const lastFour = [...data]
    .sort((a, b) => new Date(b.date) - new Date(a.date)) //
    .slice(0, 4); 
  lastFour.forEach((rando, index)  => {
    const isSecond = index === 1;
    const bloc = document.createElement('div');
    bloc.innerHTML = `
  <details ${isSecond ? 'open' : ''} name="paysages">
    <summary><img  src="${optimizeCloudinaryUrl(rando.images[0]?.url)}"  
          alt="${rando.title}"
          loading="lazy"  
          fetchpriority="high"
          decoding="async">
    </summary>
    <div class="details-content">
      <h2><a href="detail.html?id=${rando._id}">${rando.title}</a></h2>
    </div>
  </details>`
;

gallery.appendChild(bloc.firstElementChild);
  });
}

// PAGE LISTING : Affiche les résultats filtrés
function loadListingFiltered(data) {
  const params = new URLSearchParams(window.location.search);
  const loc = params.get('location');
  const diff = params.get('difficulty');
  const int = params.get('interest');
  const tag = params.get('tag');

  
  let filtered = [...data].reverse();
  if (loc) filtered = filtered.filter(r => r.location === loc);
  if (diff) filtered = filtered.filter(r => r.difficulty === diff);
  if (int) filtered = filtered.filter(r => r.interest === int);
  if (tag) filtered = filtered.filter(r => r.tags.includes(tag));

  const containerFilter = document.querySelector('.container-filter');
 containerFilter.innerHTML = '';

  if (filtered.length === 0) {
    containerFilter.innerHTML = '<p>Aucune randonnée trouvée 😕</p>';
    return;
  }

  filtered.forEach(rando => {
    const tagsHtml = rando.tags.map(tag => `<h4 class="menu-card menu-tag tag-card"><span class="icon">${tag}</span></h4>`).join('');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="img-card">   <img src="${optimizeCloudinaryUrl(rando.images[0]?.url) || 'fallback.jpg'}" 
          alt="${rando.title}" 
          width="1200"
          height="600"
          fetchpriority="high"
          decoding="async"></div>
      <div class="card-content">
      <div class="card-title"><a href="detail.html?id=${rando._id}"><h2>${rando.title}</h2></a></div>
      <div class="description">
        <p>${rando.description}</p>
        </div>
        <span class="wrap-menu">
          <h4 class="menu-card menu-location"><span class="icon">${rando.location}</h4>
          <h4 class="menu-card menu-difficult"><span class="icon">${rando.difficulty}</h4>
          <h4 class="menu-card menu-heart"><span class="icon">${rando.interest}</h4>
          ${tagsHtml}
        </span>
      </div>`;
    containerFilter.appendChild(card);
  });
}


// PAGE DETAIL : Affiche les infos d’une rando par ID
function loadDetail() {
  const main = document.querySelector('main');
  const id = new URLSearchParams(window.location.search).get('id');

  fetch(`https://magicpiks.onrender.com/api/data/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Rando introuvable 😕');
      return res.json();
    })
    .then(rando => {
      const rawDate = new Date(rando.date);
      const day = String(rawDate.getDate()).padStart(2, '0');
      const month = String(rawDate.getMonth() + 1).padStart(2, '0');
      const year = String(rawDate.getFullYear());
      const formattedDate = `${day}/${month}/${year}`;

        const imagesHTML = rando.images
          .map(img => `<div class="img-detail"><img src="${optimizeCloudinaryUrl(img.url)}" alt="${img.public_id}"></div>`)
          .join('');

        const linkHTML = rando.url
          ? `<a href="${rando.url}" target="_blank"><i class="fa-solid fa-link"></i></a>`
          : `<i class="fa-solid fa-link-slash"></i>`;

        const highlightedDescription = highlightTagsInDescription(rando.description, rando.tags);

        const detail = document.createElement('div');
        detail.className = 'detail';
        detail.innerHTML = `
          <div class="left-card">
            <div class="content">
              <div class="sub-title">
                <h2>${rando.title}</h2>
                <span>${linkHTML}</span>
              </div>
              <div class="main-info">
                <div class="detail-menu">
                  <h4 class="menu-card menu-date"><span class="icon">${formattedDate}</span></h4>
                  <h4 class="menu-card menu-location"><span class="icon">${rando.location}</span></h4>
                  <h4 class="menu-card menu-difficult"><span class="icon">${rando.difficulty}</span></h4>
                  <h4 class="menu-card menu-heart"><span class="icon">${rando.interest}</span></h4>
                </div>  
                <div class="text">
                  <p>${highlightedDescription}</p>
                </div>
              </div>
            </div> 
          </div> 
          <div class="right-content">
            <div class="map">
              <button id="first"><i class="fas fa-backward-step"></i></button>
              <button id="prev"><i class="fas fa-chevron-left"></i></button>
              <button id="next"><i class="fas fa-chevron-right"></i></button>
              <button id="last"><i class="fas fa-forward-step"></i></button>
            </div>
            <div class="center">
              <div class="wrapper">
                <div class="inner">
                  ${imagesHTML}
                </div> 
              </div> 
            </div>
          </div> 
        `;

        const skeleton = main.querySelector('.loading-skeleton');
        if (skeleton) {
          skeleton.replaceWith(detail);
        } else {
          main.appendChild(detail);
        }

        const imageCount = detail.querySelectorAll('.img-detail').length;
        initSlider(imageCount);
      })/*;
    })*/
    .catch(err => {
      main.innerHTML = `<p class="error">Erreur lors du chargement de la randonnée 😕</p>`;
      console.error(err);
    });
}

// FILTRES : Redirection selon sous-menu(s) sélectionné(s)
function initFilters() {
  document.querySelectorAll('.menu-dropdown li').forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.closest('.menu');
      const category = parent.querySelector('.label')?.dataset.original;
      const value = item.textContent.trim();

      const params = new URLSearchParams();

      if (category === 'Massif') params.set('location', value);
      else if (category === 'Difficulté') params.set('difficulty', value);
      else if (category === 'Intérêt') params.set('interest', value);
      else if (category === 'Tag') params.set('tag', value);

      window.location.href = `/listing.html?${params.toString()}`;
    });
  });
}


//création du menu déroulant
function generateMenusFromData(data) {
   
  const menuContainer = document.getElementById('menu-container');
  menuContainer.innerHTML = ''; 

  const classes = {
    'Massif': 'menu-location',
    'Difficulté': 'menu-difficult',
    'Intérêt': 'menu-heart',
    'Tag': 'menu-tag'
  };

   Object.entries(data).forEach(([label, values]) => {
 
    const menu = document.createElement('div');
    menu.classList.add('menu');

    const title = document.createElement('h4');
    title.classList.add('menu-title', classes[label]);

    const icon = document.createElement('span');
    icon.classList.add('icon');

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('label');
    labelSpan.dataset.original = label;
    labelSpan.textContent = label;
   
    title.appendChild(icon);
    title.appendChild(labelSpan);

    const dropdown = document.createElement('ul');
    dropdown.classList.add('menu-dropdown');

      values.sort().forEach((val) => {
      const li = document.createElement('li');
      li.textContent = val;
      dropdown.appendChild(li);
    });

    menu.appendChild(title);
    menu.appendChild(dropdown);
    menuContainer.appendChild(menu)
  });
  initMenuListeners(); 

}

//ouverture du menu déroulant
function initMenuToggle() {
  document.querySelectorAll('.menu-title').forEach((title) => {
    title.addEventListener('click', () => {
      const parent = title.closest('.menu');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });
}

//sélection et affichage d'une option dans le menu déroulant 
function initMenuListeners() {
  document.querySelectorAll('.menu-dropdown li').forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.closest('.menu');
      const label = parent.querySelector('.label');
      if (label) label.textContent = item.textContent;
        parent.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.menu').forEach(menu => {
      if (!menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  });
}

//Style des tags de la page détail
function highlightTagsInDescription(description, tags) {
  let highlighted = description;

  tags.forEach(tag => {
    
    let escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    escapedTag = escapedTag.replace(/\\\(s\\\)/g, 's?');

    const useWordBoundaries = /^[a-zA-Z0-9]+s?\??$/.test(tag.replace(/\(s\)/, 's')); 

    const pattern = useWordBoundaries
      ? `\\b(${escapedTag})\\b`
      : `(${escapedTag})`;

    const regex = new RegExp(pattern, 'gi');

    highlighted = highlighted.replace(regex, `<span class="highlight-tag">$1</span>`);
  });

  return highlighted;
}
