# Breadcrumbs

Breadcrumbs is a front-end prototype for a personalized NYC travel guide. The design is based on our Figma capstone mockup and focuses on three main ideas: discovering places, planning trips with friends, and saving memories.

## Project structure

```text
breadcrumbs-site/
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── hero-background.png
    ├── phone-map.png
    ├── banter.png
    ├── highline.png
    ├── times-square.png
    ├── dumbo.png
    ├── levain.png
    ├── memory-dumbo.png
    ├── memory-coffee.png
    └── memory-skyline.png
```

## How to run it

No installation is required.

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. For a local development server, you can also use the VS Code **Live Server** extension.

## Main files

- `index.html` contains the page structure and content.
- `styles.css` contains the full desktop and mobile design.
- `script.js` contains the small interactive features, including the mobile menu and demo button.
- `assets/` contains the images used throughout the landing page.

## Responsive design

The layout changes at smaller screen sizes so the page is usable on tablets and phones. The hero becomes one column, the three feature sections stack vertically, and the navigation changes into a mobile menu.

## Backend integration

This version is front-end only. The Log In, Sign Up, search, itinerary, friend, and recommendation features can later be connected to the team's backend.

A simple next step would be to replace the current buttons with links or form submissions connected to backend routes such as:

```text
/login
/signup
/api/places
/api/itineraries
/api/users
```

Keep route names consistent with whatever backend structure the team decides to use.

## GitHub

Upload the whole `breadcrumbs-site` folder to the repository so that the HTML file and the `assets` folder stay together. If the image paths are changed, update the matching `src` values in `index.html`.
