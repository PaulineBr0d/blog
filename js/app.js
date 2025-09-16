//ajout d'un fonction pour limiter le chargement des images
function optimizeCloudinaryUrl(url, options = "w_auto,dpr_auto,q_auto,f_webp") {
  if (typeof url !== "string" || !url.includes("/upload/")) return url || "";
  return url.replace("/upload/", `/upload/${options}/`);
}

//Chargement initial des données
fetch('./data.json')
  .then(res => {
    if (!res.ok) throw new Error('Fichier data.json introuvable');
    return res.json();
  })
  .then(data => {
    const page = document.body.getAttribute('data-page');
    
      if (page === 'index') {
        loadIndex(data);

         // Extraire les catégories et générer les menus
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

    }
  )
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
  gallery.classList.add('split-carousel'); 
  const lastFour = [...data]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  lastFour.forEach((rando, index) => {
    const imageUrl = optimizeCloudinaryUrl(rando.images[0]?.url, "w_1200,q_auto,f_webp");

     if (index === 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    }

    const panel = document.createElement('div');
    panel.classList.add('panel');
    if (index === 0) panel.classList.add('active');

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = rando.title || 'Rando';
      img.decoding = 'async';

      if (index === 0) {
        img.loading = 'eager';        // priorité de chargement immédiate
        img.setAttribute('fetchpriority', 'high');   // priorité fetch élevée
      } else {
        img.loading = 'lazy';         // lazy loading pour les autres images
      }
      panel.appendChild(img);
      const h2 = document.createElement('h2');
      const link = document.createElement('a');
      link.href = `detail.html?id=${rando._id}`;
      link.textContent = rando.title;
      h2.appendChild(link);
      panel.appendChild(h2);


      panel.addEventListener('click', () => {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      panel.classList.add('active');
    });
    gallery.appendChild(panel);
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
    const msg = document.createElement('p');
    msg.textContent = 'Aucune randonnée trouvée 😕';
    containerFilter.appendChild(msg);
    return;
  }

  filtered.forEach((rando, index) => {
    const imageUrl = optimizeCloudinaryUrl(rando.images[0]?.url, "w_800,q_auto,f_auto");
    const isPriority = index < 3;

    const card = document.createElement('div');
    card.className = 'card';

    // Image
    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-card';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = rando.title || 'Image rando';
    img.width = 800;
    img.height = 450;
    img.decoding = 'async';
    if (isPriority) img.fetchPriority = 'high';
    else img.loading = 'lazy';

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    // Content
    const content = document.createElement('div');
    content.className = 'card-content';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'card-title';

    const link = document.createElement('a');
    link.href = `detail.html?id=${rando._id}`;
    const h2 = document.createElement('h2');
    h2.textContent = rando.title;
    link.appendChild(h2);
    titleDiv.appendChild(link);
    content.appendChild(titleDiv);

    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    const p = document.createElement('p');
    p.textContent = rando.description;
    descDiv.appendChild(p);
    content.appendChild(descDiv);

    const wrapMenu = document.createElement('span');
    wrapMenu.className = 'wrap-menu';

    const fields = [
      { className: 'menu-location', value: rando.location },
      { className: 'menu-difficult', value: rando.difficulty },
      { className: 'menu-heart', value: rando.interest }
    ];

    fields.forEach(f => {
      const h4 = document.createElement('h4');
      h4.className = `menu-card ${f.className}`;
      const span = document.createElement('span');
      span.className = 'icon';
      span.textContent = f.value;
      h4.appendChild(span);
      wrapMenu.appendChild(h4);
    });

    // Tags
    rando.tags.forEach(tag => {
      const h4 = document.createElement('h4');
      h4.className = 'menu-card menu-tag tag-card';
      const span = document.createElement('span');
      span.className = 'icon';
      span.textContent = tag;
      h4.appendChild(span);
      wrapMenu.appendChild(h4);
    });

    content.appendChild(wrapMenu);
    card.appendChild(content);

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
      const formattedDate = rawDate.toLocaleDateString('fr-FR');

      const detail = document.createElement('div');
      detail.className = 'detail';

      // LEFT CARD
      const leftCard = document.createElement('div');
      leftCard.className = 'left-card';

      const content = document.createElement('div');
      content.className = 'content';

      const subTitle = document.createElement('div');
      subTitle.className = 'sub-title';

      const titleH2 = document.createElement('h2');
      titleH2.textContent = rando.title;

      const spanLink = document.createElement('span');
      if (rando.url) {
        const link = document.createElement('a');
        link.href = rando.url;
        link.target = '_blank';
        link.innerHTML = `<i class="fa-solid fa-link"></i>`;
        spanLink.appendChild(link);
      } else {
        spanLink.innerHTML = `<i class="fa-solid fa-link-slash"></i>`;
      }

      subTitle.appendChild(titleH2);
      subTitle.appendChild(spanLink);
      content.appendChild(subTitle);

      const mainInfo = document.createElement('div');
      mainInfo.className = 'main-info';

      const detailMenu = document.createElement('div');
      detailMenu.className = 'detail-menu';

      const fields = [
        { className: 'menu-date', value: formattedDate },
        { className: 'menu-location', value: rando.location },
        { className: 'menu-difficult', value: rando.difficulty },
        { className: 'menu-heart', value: rando.interest }
      ];

      fields.forEach(f => {
        const h4 = document.createElement('h4');
        h4.className = `menu-card ${f.className}`;
        const span = document.createElement('span');
        span.className = 'icon';
        span.textContent = f.value;
        h4.appendChild(span);
        detailMenu.appendChild(h4);
      });

      mainInfo.appendChild(detailMenu);

      const textDiv = document.createElement('div');
      textDiv.className = 'text';
      const desc = document.createElement('p');

      
      desc.innerHTML = highlightTagsInDescription(rando.description, rando.tags);
      textDiv.appendChild(desc);
      mainInfo.appendChild(textDiv);

      content.appendChild(mainInfo);
      leftCard.appendChild(content);
      detail.appendChild(leftCard);

      // RIGHT CONTENT (carousel)
      const rightContent = document.createElement('div');
      rightContent.className = 'right-content';

      const mapDiv = document.createElement('div');
      mapDiv.className = 'map';

      mapDiv.innerHTML = `
        <button id="first" aria-label="Aller au premier élément"><i class="fas fa-backward-step"></i></button>
        <button id="prev" aria-label="Élément précédent"><i class="fas fa-chevron-left"></i></button>
        <button id="next" aria-label="Élément suivant"><i class="fas fa-chevron-right"></i></button>
        <button id="last" aria-label="Aller au dernier élément"><i class="fas fa-forward-step"></i></button>
      `;

      rightContent.appendChild(mapDiv);

      const centerDiv = document.createElement('div');
      centerDiv.className = 'center';
      const wrapper = document.createElement('div');
      wrapper.className = 'wrapper';
      const inner = document.createElement('div');
      inner.className = 'inner';

      rando.images.forEach(img => {
        const imgDetail = document.createElement('div');
        imgDetail.className = 'img-detail';
        const image = document.createElement('img');
        image.src = optimizeCloudinaryUrl(img.url, "w_1200,q_auto,f_webp");
        image.alt = img.public_id;
        imgDetail.appendChild(image);
        inner.appendChild(imgDetail);
      });

      wrapper.appendChild(inner);
      centerDiv.appendChild(wrapper);
      rightContent.appendChild(centerDiv);

      detail.appendChild(rightContent);

      const skeleton = main.querySelector('.loading-skeleton');
      if (skeleton) {
        skeleton.replaceWith(detail);
      } else {
        main.appendChild(detail);
      }

      initSlider(rando.images.length);
    })
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
