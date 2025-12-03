function setupScroll(containerId, leftBtnId, rightBtnId) {
  const container = document.getElementById(containerId);
  const leftBtn = document.getElementById(leftBtnId);
  const rightBtn = document.getElementById(rightBtnId);

  const scrollAmount = 200;

  if (leftBtn && rightBtn && container) {
    leftBtn.addEventListener('click', () => {
      container.scrollLeft -= scrollAmount;
    });
    rightBtn.addEventListener('click', () => {
      container.scrollLeft += scrollAmount;
    });
  }
}

setupScroll('discover-grid', 'btn-descubra-left', 'btn-descubra-right');
setupScroll('genres-grid', 'btn-genres-left', 'btn-genres-right');
setupScroll('foryou-grid', 'btn-foryou-left', 'btn-foryou-right');
setupScroll('recent-grid', 'btn-recent-left', 'btn-recent-right');

const playBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const progressBar = document.getElementById('progressBar');
const timeTexts = document.querySelectorAll('.progress-section .time-text');
const currentTime = timeTexts?.[0];

let isPlaying = false;

if (playBtn && playIcon) {
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      playIcon.src = '../assets/icons/Play.png';
      isPlaying = false;
    } else {
      playIcon.src = '../assets/icons/Pause.png';
      isPlaying = true;
    }
  });
}

if (progressBar && currentTime) {
  progressBar.addEventListener('input', function () {
    const val = Number(this.value);
    const minutes = Math.floor(val / 60);
    const seconds = val % 60;
    currentTime.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  });
}

const discoverGrid = document.getElementById('discover-grid');
const searchInput = document.getElementById('searchInput');
const homeStatus = document.getElementById('homeStatus');

function setHomeStatus(message, variant = 'info') {
  if (!homeStatus) return;
  homeStatus.textContent = message;
  homeStatus.dataset.variant = variant;
}

function createMusicCard(music) {
  const card = document.createElement('div');
  card.classList.add('card-square', 'dynamic-card');

  const image = document.createElement('img');
  image.classList.add('card-img');
  image.alt = music?.title ?? 'Music cover';
  image.src = music?.cover_image || '../assets/images/Robuxfy_Logo.png';

  const caption = document.createElement('div');
  caption.classList.add('card-caption');
  caption.innerHTML = `<strong>${music?.title ?? 'Untitled'}</strong><span>${music?.artist_name ?? ''}</span>`;

  card.appendChild(image);
  card.appendChild(caption);

  return card;
}

function renderDiscover(musics) {
  if (!discoverGrid) return;
  discoverGrid.innerHTML = '';

  musics.forEach((music) => {
    discoverGrid.appendChild(createMusicCard(music));
  });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

async function loadDiscover(query = '') {
  if (!window.apiClient) {
    setHomeStatus('API client not available.', 'error');
    return;
  }

  try {
    setHomeStatus(query ? `Searching for "${query}"...` : 'Loading recent tracks...', 'info');
    const data = query
      ? await window.apiClient.searchMusics(query)
      : await window.apiClient.fetchRecentMusics();

    const musics = data?.musics ?? [];

    if (musics.length === 0) {
      renderDiscover([]);
      setHomeStatus('No content found for your search.', 'warning');
      return;
    }

    renderDiscover(musics);
    setHomeStatus(query ? `Showing results for "${query}"` : 'Showing the latest releases', 'success');
  } catch (error) {
    console.error('Failed to load music list', error);
    setHomeStatus('Unable to load music from the server. Please try again.', 'error');
  }
}

const handleSearchInput = debounce((value) => {
  if (value.length < 2) {
    loadDiscover();
  } else {
    loadDiscover(value);
  }
}, 350);

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    handleSearchInput(event.target.value.trim());
  });
}

loadDiscover();
