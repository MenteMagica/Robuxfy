// --- LÓGICA DE SCROLL DOS CARDS ---
function setupScroll(containerId, leftBtnId, rightBtnId) {
  const container = document.getElementById(containerId);
  const leftBtn = document.getElementById(leftBtnId);
  const rightBtn = document.getElementById(rightBtnId);
  const scrollAmount = 200;

  if (leftBtn && rightBtn && container) {
    leftBtn.addEventListener("click", () => {
      container.scrollLeft -= scrollAmount;
    });
    rightBtn.addEventListener("click", () => {
      container.scrollLeft += scrollAmount;
    });
  }
}

setupScroll("discover-grid", "btn-descubra-left", "btn-descubra-right");
setupScroll("genres-grid", "btn-genres-left", "btn-genres-right");
setupScroll("foryou-grid", "btn-foryou-left", "btn-foryou-right");
setupScroll("recent-grid", "btn-recent-left", "btn-recent-right");

// --- 1. DADOS DA PLAYLIST ---
const allPlaylists = {
  discover: [
    {
      title: "Love of My Life",
      artist: "Queen",
      cover: "../assets/images/for_home_page/3.png",
      src: "../assets/musics/Love of My Life.mp3",
    },
    {
      title: "Just the Two of Us",
      artist: "Grover Washington Jr.",
      cover: "../assets/images/for_home_page/1.png",
      src: "../assets/musics/'JUST THE TWO OF US' (GROVER WASHINGTON JNR - BILL WITHERS) cover by HSCC.mp3",
    },
    {
      title: "Let It Be",
      artist: "The Beatles",
      cover: "../assets/images/for_home_page/18.png",
      src: "../assets/musics/The Beatles - Let It Be.mp3",
    },
  ],
  rock: [
    {
      title: "Bohemian Rhapsody",
      artist: "Queen",
      cover: "../assets/images/for_home_page/Rock.png",
      src: "../assets/musics/Love of My Life.mp3",
    },
    {
      title: "Numb",
      artist: "Linkin Park",
      cover: "../assets/images/for_home_page/7.png",
      src: "../assets/musics/The Beatles - Let It Be.mp3",
    },
  ],
  pop: [
    {
      title: "Billie Jean",
      artist: "Michael Jackson",
      cover: "../assets/images/for_home_page/Pop.png",
      src: "../assets/musics/'JUST THE TWO OF US' (GROVER WASHINGTON JNR - BILL WITHERS) cover by HSCC.mp3",
    },
  ],
};

let playlist = allPlaylists["discover"] || [];
let currentSongIndex = 0;
let audio = new Audio();

// 2. SELEÇÃO DOS ELEMENTOS DO DOM
const playBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.querySelector(
  ".progress-section .time-text:first-child"
);
const totalTimeEl = document.querySelector(
  ".progress-section .time-text:last-child"
);

const trackTitle = document.querySelector(".track-title");
const artistName = document.querySelector(".artist-name");
const coverImg = document.querySelector(".cover-img");

const prevBtn = document.querySelector(".text-nav-btn.prev");
const nextBtn = document.querySelector(".text-nav-btn.next");

// --- FUNÇÃO AUXILIAR PARA COR DA BARRA ---
function updateRangeBackground(rangeInput) {
  if (!rangeInput) return;
  const value =
    ((rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min)) *
    100;
  rangeInput.style.background = `linear-gradient(to right, #ffffff ${value}%, #555555 ${value}%)`;
}

// 3. FUNÇÕES PRINCIPAIS
function loadSong(index) {
  if (!playlist || playlist.length === 0) return;
  const song = playlist[index];
  if (!song) return;

  if (trackTitle) trackTitle.innerText = song.title;
  if (artistName) artistName.innerText = song.artist;
  if (coverImg) coverImg.src = song.cover;
  audio.src = song.src;
}

function playSong() {
  if (playBtn) playBtn.classList.add("playing");
  audio.play();
}

function pauseSong() {
  if (playBtn) playBtn.classList.remove("playing");
  audio.pause();
}

if (playBtn) {
  playBtn.addEventListener("click", () => {
    if (!audioContext) {
      setupVisualizer();
    } else if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    const isPlaying = playBtn.classList.contains("playing");
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  });
}

// 4. LÓGICA DE CLIQUE NOS CARDS
function setupCardClicks() {
  const cards = document.querySelectorAll(".card-square, .card-rect");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const playlistKey = card.getAttribute("data-playlist");
      if (playlistKey && allPlaylists[playlistKey]) {
        playlist = allPlaylists[playlistKey];
        currentSongIndex = 0;
        loadSong(currentSongIndex);
        playSong();
        if (!audioContext) setupVisualizer();
      } else {
        console.log("Playlist não configurada.");
      }
    });
  });
}
setupCardClicks();

// 5. NAVEGAÇÃO E BOTÕES EXTRAS
const shuffleBtn = document.getElementById("shuffleBtn");
const shuffleIcon = document.getElementById("shuffleIcon");
const repeatBtn = document.getElementById("repeatBtn");
const repeatIcon = document.getElementById("repeatIcon");
const likeBtn = document.getElementById("likeBtn");
const likeIcon = document.getElementById("likeIcon");

let isShuffle = false;
let isRepeat = false;
let isLiked = false;

function nextSong() {
  if (isShuffle) {
    let randomIndex = Math.floor(Math.random() * playlist.length);
    if (randomIndex === currentSongIndex && playlist.length > 1) {
      randomIndex = (randomIndex + 1) % playlist.length;
    }
    currentSongIndex = randomIndex;
  } else {
    currentSongIndex++;
    if (currentSongIndex > playlist.length - 1) {
      currentSongIndex = 0;
    }
  }
  loadSong(currentSongIndex);
  playSong();
}

function prevSong() {
  currentSongIndex--;
  if (currentSongIndex < 0) currentSongIndex = playlist.length - 1;
  loadSong(currentSongIndex);
  playSong();
}

if (nextBtn) nextBtn.addEventListener("click", nextSong);
if (prevBtn) prevBtn.addEventListener("click", prevSong);

if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    if (isShuffle) {
      shuffleIcon.classList.add("icon-active-blue");
    } else {
      shuffleIcon.classList.remove("icon-active-blue");
    }
  });
}

if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    if (isRepeat) {
      repeatIcon.classList.add("icon-active-blue");
      audio.loop = true;
    } else {
      repeatIcon.classList.remove("icon-active-blue");
      audio.loop = false;
    }
  });
}

if (likeBtn) {
  likeBtn.addEventListener("click", () => {
    isLiked = !isLiked;
    if (isLiked) {
      likeIcon.classList.add("icon-active-blue");
    } else {
      likeIcon.classList.remove("icon-active-blue");
    }
  });
}

// 6. BARRA DE PROGRESSO E TEMPO (AGORA ULTRA SUAVE)

let isDragging = false;

// Aumenta a resolução do slider para permitir decimais (0.01, 0.02...)
// Isso é o segredo para o movimento suave.
if (progressBar) {
  progressBar.step = 0.01;
  progressBar.min = 0;
  progressBar.max = 100;
}

// Atualiza textos de tempo
audio.addEventListener("timeupdate", (e) => {
  const { duration, currentTime } = e.srcElement;
  if (currentTimeEl) currentTimeEl.innerText = formatTime(currentTime);
  if (totalTimeEl && !isNaN(duration))
    totalTimeEl.innerText = formatTime(duration);
});

// Loop de Animação (60fps)
function smoothProgressLoop() {
  requestAnimationFrame(smoothProgressLoop);

  if (!audio.paused && !isDragging && progressBar) {
    const duration = audio.duration;
    const currentTime = audio.currentTime;

    if (!isNaN(duration) && duration > 0) {
      // Agora o valor pode ser 1.543% em vez de pular de 1 para 2
      const progressPercent = (currentTime / duration) * 100;
      progressBar.value = progressPercent;
      updateRangeBackground(progressBar);
    }
  }
}
smoothProgressLoop();

if (progressBar) {
  progressBar.addEventListener("mousedown", () => (isDragging = true));
  progressBar.addEventListener("touchstart", () => (isDragging = true));

  progressBar.addEventListener("input", () => {
    const duration = audio.duration;
    if (!isNaN(duration)) {
      audio.currentTime = (progressBar.value / 100) * duration;
    }
    updateRangeBackground(progressBar);
  });

  progressBar.addEventListener("mouseup", () => (isDragging = false));
  progressBar.addEventListener("touchend", () => (isDragging = false));

  updateRangeBackground(progressBar);
}

audio.addEventListener("ended", nextSong);

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// --- CONTROLE DE VOLUME ---
const volumeBar = document.getElementById("volumeBar");
const muteBtn = document.getElementById("muteBtn");
const volumeIcon = document.getElementById("volumeIcon");
let lastVolume = 1;

if (volumeBar) {
  audio.volume = 1;
  volumeBar.value = 100;

  // Aumenta a resolução do volume também para ficar suave nas setinhas
  volumeBar.step = 0.01;

  updateRangeBackground(volumeBar);

  volumeBar.addEventListener("input", (e) => {
    const volValue = e.target.value;
    audio.volume = volValue / 100;
    updateVolumeIcon(audio.volume);
    updateRangeBackground(volumeBar);
  });
}

if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
      lastVolume = audio.volume;
      audio.volume = 0;
      volumeBar.value = 0;
    } else {
      audio.volume = lastVolume;
      volumeBar.value = lastVolume * 100;
    }
    updateVolumeIcon(audio.volume);
    updateRangeBackground(volumeBar);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    const artistModal = document.getElementById("artist-modal-overlay");
    const profileModal = document.getElementById("profile-modal-overlay");
    const settingsModal = document.getElementById("settings-modal-overlay");
    
    if (artistModal?.classList.contains("active")) {
      artistModal.classList.remove("active");
    }
    if (profileModal?.classList.contains("active")) {
      profileModal.classList.remove("active");
    }
    if (settingsModal?.classList.contains("active")) {
      settingsModal.classList.remove("active");
    }
  }
});

function updateVolumeIcon(vol) {
  if (!volumeIcon) return;
  if (vol === 0) {
    volumeIcon.style.opacity = "0.5";
  } else {
    volumeIcon.style.opacity = "1";
  }
}

// --- VISUALIZADOR DE ÁUDIO ---
const canvas = document.getElementById("audioVisualizer");
const canvasCtx = canvas ? canvas.getContext("2d") : null;
let audioContext, analyser, source;
let isVisualizerSetup = false;
let previousDataArray = [];

function setupVisualizer() {
  if (isVisualizerSetup) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  source = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  previousDataArray = new Array(bufferLength).fill(128);
  isVisualizerSetup = true;
  drawVisualizer();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.fillStyle = "#ffffff";
  canvasCtx.beginPath();

  const sliceWidth = (canvas.width * 1.0) / bufferLength;
  let x = 0;
  const centerY = canvas.height / 2;
  const smoothingFactor = 0.05;
  const waveScale = 3.0;

  const currentDrawData = [];
  for (let i = 0; i < bufferLength; i++) {
    let smoothValue =
      previousDataArray[i] +
      (dataArray[i] - previousDataArray[i]) * smoothingFactor;
    previousDataArray[i] = smoothValue;
    currentDrawData.push(smoothValue);
  }

  canvasCtx.moveTo(0, centerY);
  for (let i = 0; i < bufferLength; i++) {
    const deviation = currentDrawData[i] - 128;
    const scaledValue = 128 + deviation * waveScale;
    const v = scaledValue / 128.0;
    const y = v * centerY;
    canvasCtx.lineTo(x, y);
    x += sliceWidth;
  }

  for (let i = bufferLength - 1; i >= 0; i--) {
    const deviation = currentDrawData[i] - 128;
    const scaledValue = 128 + deviation * waveScale;
    const v = scaledValue / 128.0;
    const y = canvas.height - v * centerY;
    x -= sliceWidth;
    canvasCtx.lineTo(x, y);
  }

  canvasCtx.closePath();
  canvasCtx.fill();
}

// --- ATALHOS DE TECLADO ---
let lastSpacePressTime = 0;

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  switch (e.code) {
    case "Space":
      e.preventDefault();
      const currentTime = Date.now();
      if (currentTime - lastSpacePressTime < 300) {
        nextSong();
      } else {
        if (playBtn) playBtn.click();
      }
      lastSpacePressTime = currentTime;
      break;

    case "ArrowRight":
      if (audio.volume < 1) {
        audio.volume = Math.min(1, audio.volume + 0.05);
        if (volumeBar) {
          volumeBar.value = audio.volume * 100;
          updateRangeBackground(volumeBar);
        }
        updateVolumeIcon(audio.volume);
      }
      break;

    case "ArrowLeft":
      if (audio.volume > 0) {
        audio.volume = Math.max(0, audio.volume - 0.05);
        if (volumeBar) {
          volumeBar.value = audio.volume * 100;
          updateRangeBackground(volumeBar);
        }
        updateVolumeIcon(audio.volume);
      }
      break;

    case "KeyM":
      if (muteBtn) muteBtn.click();
      break;
    case "KeyS":
      if (shuffleBtn) shuffleBtn.click();
      break;
    case "KeyR":
      if (repeatBtn) repeatBtn.click();
      break;
    case "KeyL":
      if (likeBtn) likeBtn.click();
      break;
  }
});

// Inicialização
loadSong(currentSongIndex);

// Modais e Sidebars
document.addEventListener("DOMContentLoaded", () => {
  const myDisksLink = document.getElementById("my-disks-link");
  const uploadBtn = document.getElementById("upload-btn");
  const artistModal = document.getElementById("artist-modal-overlay");
  const closeArtistBtn = document.getElementById("close-modal-btn");

  function openArtistModal(e) {
    e.preventDefault();
    if (artistModal) artistModal.classList.add("active");
  }
  function closeArtistModal() {
    if (artistModal) artistModal.classList.remove("active");
  }
  if (myDisksLink) myDisksLink.addEventListener("click", openArtistModal);
  if (uploadBtn) uploadBtn.addEventListener("click", openArtistModal);
  if (closeArtistBtn)
    closeArtistBtn.addEventListener("click", closeArtistModal);
  if (artistModal) {
    artistModal.addEventListener("click", (e) => {
      if (e.target === artistModal) closeArtistModal();
    });
  }

  const profileAvatarBtn = document.getElementById("profile-avatar-btn");
  const profileModal = document.getElementById("profile-modal-overlay");
  const closeProfileBtn = document.getElementById("close-profile-btn");

  function openProfileModal() {
    if (profileModal) profileModal.classList.add("active");
  }
  function closeProfileModal() {
    if (profileModal) profileModal.classList.remove("active");
  }
  if (profileAvatarBtn)
    profileAvatarBtn.addEventListener("click", openProfileModal);
  if (closeProfileBtn)
    closeProfileBtn.addEventListener("click", closeProfileModal);
  if (profileModal) {
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) closeProfileModal();
    });
  }

  const friendsBtn = document.getElementById("friends-toggle-btn");
  const friendsSidebar = document.getElementById("friends-sidebar");
  if (friendsBtn && friendsSidebar) {
    friendsBtn.addEventListener("click", () => {
      friendsSidebar.classList.toggle("open");
      friendsBtn.classList.toggle("active");
    });
  }

  const notifBtn = document.getElementById("notifications-btn");
  const notifCard = document.getElementById("notifications-card");
  if (notifBtn && notifCard) {
    notifBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      notifCard.classList.toggle("active");
    });
    document.addEventListener("click", (event) => {
      if (
        !notifCard.contains(event.target) &&
        !notifBtn.contains(event.target)
      ) {
        notifCard.classList.remove("active");
      }
    });
  }

  // 5. MODAL DE SETTINGS (ATALHOS)
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal-overlay");
  const closeSettingsBtn = document.getElementById("close-settings-btn");

  function openSettingsModal() {
    if (settingsModal) settingsModal.classList.add("active");
  }
  function closeSettingsModal() {
    if (settingsModal) settingsModal.classList.remove("active");
  }

  if (settingsBtn) settingsBtn.addEventListener("click", openSettingsModal);
  if (closeSettingsBtn)
    closeSettingsBtn.addEventListener("click", closeSettingsModal);

  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      // Fecha se clicar fora do card
      if (e.target === settingsModal) closeSettingsModal();
    });
  }
});
