# Projet Blog Photos & Randos – Frontend

## Description
Dans le cadre du début de ma formation **Concepteur Développeur d'Applications**, ce projet a été développé en **JavaScript Vanilla** (sans framework). Il s'agit du **frontend** de l’application **MagicPiks**, qui permet l’affichage dynamique de randonnées via une API REST. Les données sont récupérées depuis un backend **Node.js** déployé sur **Render**.

Design original : [Figma](https://www.figma.com/design/GC5v95K5CKXshqJNZi0CTG/projet_formation?node-id=3-1682&t=Nt0IzPanDyLM6y2a-0)

---

## Fonctionnalités

- Page d’accueil avec un galerie des **4 dernières randonnées** avec menus dynamique basé sur les données de l’API 
- Page de **listing filtré** (par lieu, difficulté, intérêt, tag)
- Page **détail** de rando avec :
  - Infos complètes
  - Galerie d’images (slider)
- Page **Login** pour l’administrateur
- Page **Add** avec un **formulaire d’ajout** de randonnée (titre, lieu, difficulté, intérêt, tags, images)

## Sources de données

Pour des raisons de performance et de limitations liées à l’hébergement (Render), l’interface front-end consomme un fichier `data.json` statique généré à partir de la base de données.


---

## Technologies utilisées

- HTML5 / CSS3
- JavaScript (Vanilla)
- Cloudinary (gestion et optimisation d’images)
- Node.js (backend – API REST)
- Render (hébergement backend)
- 