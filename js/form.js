function slugify(text) {
  return text.toString().normalize("NFD") // Enlève les accents
    .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, '') // Supprime les caractères non alphanumériques sauf tiret
    .replace(/\-\-+/g, '-'); // Réduit les tirets doubles
}

let cloudName = '';
let uploadPreset = '';

async function fetchCloudinaryConfig() {
  const res = await fetch('/api/config/cloudinary');
  if (res.ok) {
    const data = await res.json();
    cloudName = data.cloudName;
    uploadPreset = data.uploadPreset;
  } else {
    throw new Error("Impossible de récupérer la config Cloudinary");
  }
}

async function uploadImageToCloudinary(file, folder) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
   return { url: data.secure_url, public_id: data.public_id };
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 3;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await fetchCloudinaryConfig();
  } catch (e) {
    console.error("Erreur lors de la récupération de la config Cloudinary:", e);
    return;
  }

  const errorMessage = document.getElementById('errorMessage');
  const loadingMessage = document.getElementById('loadingMessage');
  const imagePreview = document.getElementById('imagePreview');
  const form = document.getElementById('randoForm');
  const imageInput = document.getElementById('imageUpload');

  if (!imageInput || !form || !errorMessage || !loadingMessage || !imagePreview) {
    console.error("Un ou plusieurs éléments du formulaire sont manquants dans le DOM.");
    return;
  }

  imageInput.addEventListener('change', function () {
    imagePreview.innerHTML = "";
    errorMessage.textContent = "";

    const files = this.files;

    if (files.length > MAX_FILES) {
      errorMessage.textContent = `Maximum ${MAX_FILES} images autorisées.`;
      this.value = "";
      return;
    }

    for (const file of files) {
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > MAX_FILE_SIZE_MB) {
        errorMessage.textContent = `L'image "${file.name}" dépasse la taille de ${MAX_FILE_SIZE_MB} Mo.`;
        this.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "150px";
        img.style.margin = "5px";
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    errorMessage.textContent = "";
    loadingMessage.textContent = "Envoi en cours...";

    const title = document.getElementById('title').value.trim();
    const date = new Date(document.getElementById('date').value).toISOString();
    const location = document.getElementById('location').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    const interest = document.getElementById('interest').value;
    const tags = document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t !== "");
    const description = document.getElementById('description').value.trim();
    const url = document.getElementById('url').value.trim();
    const slug = slugify(title);

    const files = imageInput.files;

    if (files.length > MAX_FILES) {
      errorMessage.textContent = `Tu ne peux pas envoyer plus de ${MAX_FILES} images.`;
      loadingMessage.textContent = "";
      return;
    }

    const images = [];

    try {
      const uploadPromises = Array.from(files).map(file => {
        const sizeMB = file.size / 1024 / 1024;
        if (sizeMB > MAX_FILE_SIZE_MB) {
          throw new Error(`"${file.name}" dépasse ${MAX_FILE_SIZE_MB} Mo`);
        }
        return uploadImageToCloudinary(file, `blog/${slug}`);
      });

    const uploadedUrls = await Promise.all(uploadPromises);

    images.push(...uploadedUrls);
    } catch (uploadError) {
      errorMessage.textContent = uploadError.message;
      loadingMessage.textContent = "";
      return;
    }

    const rando = {
      _id: slug,
      title,
      date,
      location,
      difficulty,
      interest,
      tags,
      description,
      url,
      images
    };

    try {
      const res = await fetch("http://localhost:3000/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rando)
      });

      if (res.ok) {
        alert("Randonnée ajoutée !");
        form.reset();
        imagePreview.innerHTML = "";
      } else {
        const err = await res.json();
        errorMessage.textContent = "Erreur API : " + err.message;
      }
    } catch (e) {
      console.error("Erreur réseau :", e);
      errorMessage.textContent = "Erreur réseau lors de l'envoi.";
    }

    loadingMessage.textContent = "";
  });
});
