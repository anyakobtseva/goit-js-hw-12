import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';
import axios from 'axios';
// Додатковий імпорт стилів
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const PIXABAY_URL = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_API_KEY;
const ligthbox = new SimpleLightbox('.gallery a');
const loadMoreBt = document.querySelector('.bt');

const config = {
  params: {
    key: API_KEY,
    image_type: 'photo',
    per_page: 40,
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    q: '',
  },
};

iziToast.settings({
  timeout: 10000,
  resetOnHover: true,
  icon: null,
  position: 'topRight',
  close: false,
  closeOnClick: true,
  closeOnEscape: true,
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const query = event.target.search.value;
  config.params.q = query;
  config.params.page = 1;
  gallery.innerHTML = '';
  loader.style.display = 'flex';

  try {
    const images = await axios.get(PIXABAY_URL, config);
    if (images.data.hits.length === 0) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please, try again!'
      );
    }
    gallery.append(...images.data.hits.map(image => createGalleryItem(image)));
    ligthbox.refresh();
    loadMoreBt.style.display = 'block';
  } catch (error) {
    iziToast.error({
      message: error.message,
    });
  } finally {
    loader.style.display = 'none';
  }
});

loadMoreBt.addEventListener('click', async () => {
  config.params.page += 1;
  const images = await axios.get(PIXABAY_URL, config);
  gallery.append(...images.data.hits.map(image => createGalleryItem(image)));
  ligthbox.refresh();
});

const createGalleryItem = image => {
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
  const ulEl = document.createElement('ul');
  ulEl.className = 'tags';

  const lis = generateTags({
    Likes: image.likes,
    Views: image.views,
    Comments: image.comments,
    Downloads: image.downloads,
  });

  linkEl.appendChild(imEl);
  ulEl.append(...lis);
  linkEl.appendChild(ulEl);
  return liEl;
};

const generateTags = obj => {
  const lis = [];
  Object.keys(obj).forEach(key => {
    const li = document.createElement('li');
    li.textContent = key;
    const p = document.createElement('p');
    p.textContent = obj[key];
    li.appendChild(p);
    lis.push(li);
  });

  return lis;
};
