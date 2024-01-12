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
let totalPages;

iziToast.settings({
  timeout: 3000,
  resetOnHover: true,
  icon: null,
  position: 'topRight',
  close: false,
  closeOnClick: true,
  closeOnEscape: true,
});

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

form.addEventListener('submit', async event => {
  event.preventDefault();
  const query = event.target.search.value;
  config.params.q = query;
  config.params.page = 1;
  gallery.innerHTML = '';
  loader.style.display = 'flex';

  await renderGallery(config);
});

loadMoreBt.addEventListener('click', async () => {
  config.params.page += 1;
  await renderGallery(config);
  const item = document.querySelector('.gallery-item');
  const { height } = item.getBoundingClientRect();
  window.scrollBy({
    top: height * 2,
    left: 0,
    behavior: 'smooth',
  });
});

const renderGallery = async config => {
  try {
    const images = (await axios.get(PIXABAY_URL, config)).data;
    if (images.hits.length === 0) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please, try again!'
      );
    }
    if (config.params.page == 1) {
      totalPages = Math.ceil(images.totalHits / config.params.per_page);
    }
    gallery.append(...images.hits.map(image => createGalleryItem(image)));
    ligthbox.refresh();
    if (config.params.page == totalPages) {
      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
    }
    loadMoreBt.style.display = 'block';
  } catch (error) {
    loadMoreBt.style.display = 'none';
    iziToast.error({
      message: error.message,
    });
  } finally {
    loader.style.display = 'none';
  }
};

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
