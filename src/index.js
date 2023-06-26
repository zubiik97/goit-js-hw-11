import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const KEY_API = "37581627-0cb842f2cab73287631f8d850";
const BASE_URL = "https://pixabay.com/api/";

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
let loadMoreBtn;

let currentPage = 1;
let currentSearchQuery = '';
let lightbox;


form.addEventListener('submit', async function(event) {
  event.preventDefault();

  loadMoreBtn.style.display = 'none';

  const searchQuery = form.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    form.elements.searchQuery.value = '';
    return;
  }

  currentSearchQuery = searchQuery;
  currentPage = 1;
  gallery.innerHTML = '';

  await fetchImages();
});

function initLoadMoreButton() {
  loadMoreBtn = document.querySelector('.load-more');
  loadMoreBtn.style.display = 'none';
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async function() {
      await fetchImages();
    });
  }
}

async function fetchImages() {

    const perPage = (currentPage === 1) ? 20 : 40;

    const params = new URLSearchParams({
        key: KEY_API,
        q: currentSearchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
    });

    const url = `${BASE_URL}?${params.toString()}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      loadMoreBtn.style.display = 'none';
      form.elements.searchQuery.value = '';
    } else {
        const cardsMarkup = data.hits.map(image => createCardMarkup(image)).join('');
        gallery.insertAdjacentHTML('beforeend', cardsMarkup);
        

      if (data.totalHits > currentPage * 40) {
        if (loadMoreBtn) {
          loadMoreBtn.style.display = 'block';
        }
      } else {
        if (loadMoreBtn) {
          loadMoreBtn.style.display = 'none';
          Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
      }
      currentPage++;

      if (lightbox) {
        lightbox.refresh();
      } else {
        lightbox = new SimpleLightbox('.gallery a');
      }

    
      if (currentPage === 2) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure('An error occurred while fetching the images. Please try again later.');
  }
}

function createCardMarkup(image) {
  return `
      <div class="photo-card">
        <a href="${image.largeImageURL}" data-lightbox="gallery" onclick="return false; class = "img-link"">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" class = "img-card"/>
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b> <span class="likes">${image.likes}</span></p>
          <p class="info-item"><b>Views</b> <span class="views">${image.views}</span></p>
          <p class="info-item"><b>Comments</b> <span class="comments">${image.comments}</span></p>
          <p class="info-item"><b>Downloads</b> <span class="downloads">${image.downloads}</span></p>
        </div>
      </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
  initLoadMoreButton();
});