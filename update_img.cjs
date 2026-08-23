const fs = require('fs');

// 1. Update app.js
let appjs = fs.readFileSync('app.js', 'utf8');
appjs = appjs.replace(/<img src="\$\{b\.photoUrl\}" style="width:32px; height:32px; object-fit:cover; border-radius:4px;" alt="photo">/g, 
  '<img src="${b.photoUrl}" class="bom-item-img" style="width:48px; height:48px; object-fit:cover; border-radius:4px;" alt="photo">');
appjs = appjs.replace(/<div style="width:32px; height:32px;/g, '<div style="width:48px; height:48px;');
fs.writeFileSync('app.js', appjs);

// 2. Update styles.css
const cssToAdd = `
.bom-item-img {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
    cursor: zoom-in;
    position: relative;
    z-index: 1;
}
.bom-item-img:hover {
    transform: scale(4);
    z-index: 100;
    box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    border-radius: 6px !important;
}
`;
fs.appendFileSync('styles.css', cssToAdd);
