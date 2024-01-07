import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';
// Додатковий імпорт стилів
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const PIXABAY_URL = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_API_KEY;
const ligthbox = new SimpleLightbox('.gallery a');

iziToast.settings({
  timeout: 10000,
  resetOnHover: true,
  icon: null,
  position: 'topRight',
  close: false,
  closeOnClick: true,
  closeOnEscape: true,
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const query = event.target.search.value;
  gallery.innerHTML = null;
  loader.style.display = 'inline-block';
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  fetch(`${PIXABAY_URL}?${searchParams}`)
    .then(response => response.json())
    .then(images => {
      if (images.hits.length == 0) {
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please, try again!',
        });
        return;
      }

      gallery.append(...images.hits.map(image => createGalleryItem(image)));
      ligthbox.refresh();
    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => (loader.style.display = 'none'));
});

function createGalleryItem(image) {
  const liEl = document.createElement('li');
  liEl.className = 'gallery-item';
  const linkEl = document.createElement('a');
  linkEl.className = 'gallery-link';
  linkEl.href = image.largeImageURL;
  liEl.appendChild(linkEl);
  const imEl = document.createElement('img');
  imEl.className = 'gallery-image';
  imEl.src = image.webformatURL;
  imEl.title = image.tags;
  imEl.dataset.source = image.largeImageURL;
  const divEl = document.createElement('div');
  divEl.className = 'tags';

  const table = generateTable({
    Likes: image.likes,
    Views: image.views,
    Comments: image.comments,
    Downloads: image.downloads,
  });

  linkEl.appendChild(imEl);
  divEl.appendChild(table);
  linkEl.appendChild(divEl);
  return liEl;
}

function generateTable(obj) {
  // creates a <table> element and a <tbody> element
  const tbl = document.createElement('table');
  const tblBody = document.createElement('tbody');

  // creates a table row
  const headerRow = document.createElement('tr');
  const valuesRow = document.createElement('tr');

  Object.keys(obj).forEach(key => {
    const cell1 = document.createElement('td');
    const cellText1 = document.createTextNode(`${key}`);
    cell1.appendChild(cellText1);
    headerRow.appendChild(cell1);
    const cell2 = document.createElement('td');
    const cellText2 = document.createTextNode(`${obj[key]}`);
    cell2.appendChild(cellText2);
    valuesRow.appendChild(cell2);
  });

  // add the row to the end of the table body
  tblBody.append(headerRow, valuesRow);

  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  document.body.appendChild(tbl);
  // sets the border attribute of tbl to '2'
  tbl.setAttribute('border', '0');

  return tbl;
}
