document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO MODAL DE PERFIL (NOVO) ---
    const profileAvatarBtn = document.getElementById("profile-avatar-btn");
    const profileModal = document.getElementById("profile-modal-overlay");
    const closeProfileBtn = document.getElementById("close-profile-btn");

    function openProfileModal() {
        if (profileModal) profileModal.classList.add("active");
    }
    function closeProfileModal() {
        if (profileModal) profileModal.classList.remove("active");
    }

    if (profileAvatarBtn) profileAvatarBtn.addEventListener("click", openProfileModal);
    if (closeProfileBtn) closeProfileBtn.addEventListener("click", closeProfileModal);
    if (profileModal) {
        profileModal.addEventListener("click", (e) => {
            if (e.target === profileModal) closeProfileModal();
        });
    }

    // --- ESTADO GLOBAL DA DISCOGRAFIA (MOCK DATABASE) ---
    let discographyData = [
        { id: 1, title: "My First Hit", album: "Single", type: "single", likes: 1200, date: "Oct 24, 2024", status: "Live", cover: "../assets/images/for_home_page/1.png" },
        { id: 2, title: "Midnight Vibes", album: "Midnight EP", type: "album", likes: 854, date: "Nov 02, 2024", status: "Live", cover: "../assets/images/for_home_page/7.png" },
        { id: 3, title: "Intro", album: "Midnight EP", type: "album", likes: 400, date: "Nov 02, 2024", status: "Live", cover: "../assets/images/for_home_page/7.png" }
    ];

    // ELEMENTOS
    const openModalBtn = document.getElementById('open-upload-modal-btn');
    const uploadModal = document.getElementById('upload-modal-overlay');
    const closeModalBtn = document.getElementById('close-upload-btn');
    const cancelBtn = document.getElementById('cancel-upload-btn');
    const publishBtn = document.getElementById('publish-btn');

    // FILTROS
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'tracks';

    // TIPO
    const typeBtns = document.querySelectorAll('.type-btn');
    let selectedType = 'single';

    // CONTAINERS DO MODAL
    const singleContainer = document.getElementById('single-upload-container');
    const albumContainer = document.getElementById('album-upload-container');
    const albumTracksList = document.getElementById('album-tracks-list');

    // INPUTS
    const coverInput = document.getElementById('cover-input');
    const coverDropZone = document.getElementById('cover-drop-zone');
    const coverPreview = document.getElementById('cover-preview');
    const audioInput = document.getElementById('audio-file-input');
    const audioLabel = document.getElementById('audio-file-name');

    // TEXTOS
    const singleTitleInput = document.getElementById('track-title-input');
    const albumTitleInput = document.getElementById('album-title-input');

    // CRÉDITOS GLOBAIS
    const globalArtist = document.getElementById('artist-input');
    const globalComposer = document.getElementById('composer-input');
    const globalProducer = document.getElementById('producer-input');

    const tracksListDOM = document.getElementById('uploaded-tracks-list');

    // DADOS TEMPORÁRIOS (NO MODAL)
    let albumTracksData = [];

    // --- 1. RENDERIZAÇÃO DA TABELA PRINCIPAL (COM FILTROS) ---
    function renderDiscography(filterMode) {
        tracksListDOM.innerHTML = "";
        let displayList = [];

        if (filterMode === 'tracks') {
            // MODO TRACKS
            displayList = discographyData;
        } else {
            // MODO ALBUMS
            const albumsMap = {};

            discographyData.forEach(track => {
                const key = track.album || "Unknown Album";

                if (!albumsMap[key]) {
                    albumsMap[key] = {
                        id: 'alb-' + track.id,
                        title: key,
                        album: (track.type === 'single' ? 'Single' : 'Album'),
                        type: track.type,
                        likes: 0,
                        date: track.date,
                        status: track.status,
                        cover: track.cover,
                        trackCount: 0
                    };
                }
                albumsMap[key].likes += track.likes;
                albumsMap[key].trackCount += 1;
            });

            displayList = Object.values(albumsMap);
        }

        displayList.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'track-row';

            let col3Content = item.album;
            let titleDisplay = item.title;

            if (filterMode === 'albums' && item.type === 'album') {
                titleDisplay += ` <span style="font-size:11px; color:#777">(${item.trackCount} tracks)</span>`;
            }

            const formattedLikes = item.likes.toLocaleString();

            div.innerHTML = `
                <span class="col-1">${index + 1}</span>
                <span class="col-2">
                    <img src="${item.cover}" class="tiny-cover">
                    ${titleDisplay}
                </span>
                <span class="col-3" style="color: #bbb; font-size: 13px;">${col3Content}</span>
                <span class="col-4">${formattedLikes}</span>
                <span class="col-5">${item.date}</span>
                <span class="col-5 status-live">${item.status}</span>
                <span class="col-7">
                    <button class="delete-track-btn" onclick="deleteItem('${item.id}', '${filterMode}')">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </span>
            `;
            tracksListDOM.appendChild(div);
        });
    }

    renderDiscography('tracks');

    // --- EVENTOS DOS FILTROS ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderDiscography(currentFilter);
        });
    });

    // --- FUNÇÃO DE DELETAR (GLOBAL) ---
    window.deleteItem = (id, mode) => {
        if (confirm('Are you sure you want to delete this content?')) {
            if (mode === 'tracks') {
                discographyData = discographyData.filter(t => t.id != id);
            } else {
                alert("Deletion from Album view is restricted in this demo. Switch to Tracks view to delete specific songs.");
                return;
            }
            renderDiscography(currentFilter);
        }
    };

    // ============================================================
    // LÓGICA DO MODAL DE UPLOAD
    // ============================================================

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.getAttribute('data-type');

            if (selectedType === 'album') {
                singleContainer.style.display = 'none';
                albumContainer.style.display = 'block';
                audioLabel.innerText = "Select Audio Files (Multiple)";
                audioInput.setAttribute('multiple', '');
            } else {
                singleContainer.style.display = 'block';
                albumContainer.style.display = 'none';
                audioLabel.innerText = "Select Audio File (.mp3)";
                audioInput.removeAttribute('multiple');

                const label = document.getElementById('title-label');
                if (selectedType === 'podcast') {
                    label.innerText = "Episode Title";
                    singleTitleInput.placeholder = "e.g. Ep. 1";
                } else {
                    label.innerText = "Track Title";
                    singleTitleInput.placeholder = "e.g. Summer Vibes";
                }
            }
        });
    });

    if (audioInput) {
        audioInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (!files.length) return;

            if (selectedType === 'album') {
                files.forEach(file => {
                    const trackId = Date.now() + Math.random();
                    let currentMainCover = "../assets/images/for_home_page/1.png";
                    const imgElement = coverPreview.querySelector('img');
                    if (imgElement) currentMainCover = imgElement.src;

                    albumTracksData.push({
                        id: trackId,
                        file: file,
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        coverSrc: currentMainCover,
                        artist: "",
                        composer: "",
                        producer: "",
                        isExpanded: false
                    });
                });
                renderAlbumTracks();
                audioLabel.innerText = `${files.length} new file(s) added`;
            } else {
                const file = files[0];
                audioLabel.innerText = file.name;
                if (singleTitleInput.value === "") {
                    singleTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
                }
            }
        });
    }

    function renderAlbumTracks() {
        albumTracksList.innerHTML = "";

        if (albumTracksData.length === 0) {
            albumTracksList.innerHTML = '<p class="empty-album-msg">Select files below to add tracks...</p>';
            return;
        }

        albumTracksData.forEach((track) => {
            const container = document.createElement('div');
            container.className = 'album-track-container';
            const displayStyle = track.isExpanded ? 'grid' : 'none';
            const btnText = track.isExpanded ? 'Done' : 'Edit Credits';

            container.innerHTML = `
                <div class="album-track-header">
                    <div class="mini-track-cover-upload" onclick="triggerMiniCover(${track.id})">
                        <img src="${track.coverSrc}" class="mini-track-cover-img" id="img-${track.id}">
                    </div>
                    <div class="track-title-display">
                        <input type="text" class="track-title-edit" value="${track.title}" onchange="updateTrackData(${track.id}, 'title', this.value)">
                    </div>
                    <div class="track-actions">
                        <button class="edit-meta-btn" onclick="toggleTrackEdit(${track.id})">${btnText}</button>
                        <button class="remove-track-btn" onclick="removeAlbumTrack(${track.id})">&times;</button>
                    </div>
                </div>
                <div class="track-metadata-form" id="meta-form-${track.id}" style="display: ${displayStyle};">
                    <div class="tiny-input-group full-width">
                        <label>Specific Artist(s)</label>
                        <input type="text" class="tiny-input" placeholder="Artist Name" value="${track.artist}" onchange="updateTrackData(${track.id}, 'artist', this.value)">
                    </div>
                    <div class="tiny-input-group">
                        <label>Composer</label>
                        <input type="text" class="tiny-input" placeholder="Composer" value="${track.composer}" onchange="updateTrackData(${track.id}, 'composer', this.value)">
                    </div>
                    <div class="tiny-input-group">
                        <label>Producer</label>
                        <input type="text" class="tiny-input" placeholder="Producer" value="${track.producer}" onchange="updateTrackData(${track.id}, 'producer', this.value)">
                    </div>
                </div>
                <input type="file" id="file-${track.id}" accept="image/*" style="display:none" onchange="updateTrackCover(${track.id}, this)">
            `;
            albumTracksList.appendChild(container);
        });
    }

    window.triggerMiniCover = (id) => { document.getElementById(`file-${id}`).click(); };
    window.updateTrackCover = (id, input) => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById(`img-${id}`).src = e.target.result;
                const track = albumTracksData.find(t => t.id === id);
                if (track) track.coverSrc = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    };
    window.toggleTrackEdit = (id) => {
        const track = albumTracksData.find(t => t.id === id);
        if (track) { track.isExpanded = !track.isExpanded; renderAlbumTracks(); }
    };
    window.updateTrackData = (id, field, value) => {
        const track = albumTracksData.find(t => t.id === id);
        if (track) track[field] = value;
    };
    window.removeAlbumTrack = (id) => {
        albumTracksData = albumTracksData.filter(t => t.id !== id);
        renderAlbumTracks();
    };

    if (coverDropZone && coverInput) {
        coverDropZone.addEventListener('click', () => coverInput.click());
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    coverPreview.innerHTML = `<img src="${e.target.result}" class="cover-preview-img">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            const date = new Date();
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            let tracksToPublish = [];
            let albumNameForThisUpload = "";

            if (selectedType === 'album') {
                if (albumTracksData.length === 0) { alert("Please add at least one track."); return; }
                if (!albumTitleInput.value) { alert("Please enter album title."); return; }

                albumNameForThisUpload = albumTitleInput.value;

                tracksToPublish = albumTracksData.map(t => ({
                    id: Date.now() + Math.random(),
                    title: t.title,
                    album: albumNameForThisUpload,
                    type: 'album',
                    likes: 0,
                    date: dateString,
                    status: 'Live',
                    cover: t.coverSrc
                }));

            } else {
                if (!singleTitleInput.value) { alert("Please enter a title."); return; }

                let coverSrc = "../assets/images/for_home_page/1.png";
                const imgElement = coverPreview.querySelector('img');
                if (imgElement) coverSrc = imgElement.src;

                const albName = selectedType === 'podcast' ? 'Podcast' : 'Single';

                tracksToPublish.push({
                    id: Date.now(),
                    title: singleTitleInput.value,
                    album: albName,
                    type: selectedType,
                    likes: 0,
                    date: dateString,
                    status: 'Live',
                    cover: coverSrc
                });
            }

            discographyData = [...tracksToPublish, ...discographyData];
            renderDiscography(currentFilter);

            closeModal();
            alert("Published successfully!");
        });
    }

    function openModal() { if (uploadModal) uploadModal.classList.add('active'); }
    function closeModal() { if (uploadModal) uploadModal.classList.remove('active'); resetForm(); }

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    function resetForm() {
        singleTitleInput.value = "";
        albumTitleInput.value = "";
        coverInput.value = "";
        audioInput.value = "";
        audioLabel.innerText = "Select Audio File (.mp3)";
        coverPreview.innerHTML = `<span class="plus-icon">+</span><span class="cover-text">Insert Main Cover</span>`;
        albumTracksData = [];
        renderAlbumTracks();

        typeBtns.forEach(b => b.classList.remove('active'));
        typeBtns[0].classList.add('active');
        selectedType = 'single';
        singleContainer.style.display = 'block';
        albumContainer.style.display = 'none';
        audioInput.removeAttribute('multiple');
    }
});

// Dados Mockados (Simulando banco de dados)
const artistTracks = [
    {
        id: 1,
        title: "Neon Lights",
        album: "Night City Vibes",
        cover: "../assets/images/for_home_page/1.png",
        likes: "12,405",
        streams: "450,200",
        date: "Oct 24, 2025",
        playlists: 142,
        saveRate: "12%"
    },
    {
        id: 2,
        title: "Echoes of Silence",
        album: "Single",
        cover: "../assets/images/for_home_page/3.png",
        likes: "8,200",
        streams: "120,050",
        date: "Sep 10, 2025",
        playlists: 85,
        saveRate: "8.5%"
    },
    {
        id: 3,
        title: "Cyber Chase",
        album: "Night City Vibes",
        cover: "../assets/images/for_home_page/7.png",
        likes: "35,100",
        streams: "1,200,000",
        date: "Aug 05, 2025",
        playlists: 890,
        saveRate: "18%"
    }
];

// 1. Função para renderizar a tabela
function renderTrackList() {
    const listContainer = document.getElementById("uploaded-tracks-list");
    listContainer.innerHTML = ""; // Limpa lista atual

    artistTracks.forEach((track, index) => {
        const row = document.createElement("div");
        row.classList.add("track-row");
        // Adicionamos um cursor pointer para indicar clique
        row.style.cursor = "pointer";
        
        // Ao clicar na linha, abre as estatísticas
        row.onclick = (e) => {
            // Evita abrir se clicar no botão de deletar
            if(e.target.closest('.delete-track-btn')) return;
            openTrackStats(track);
        };

        row.innerHTML = `
            <span class="col-1">${index + 1}</span>
            <span class="col-2">
                <img src="${track.cover}" class="tiny-cover">
                ${track.title}
            </span>
            <span class="col-3">${track.album}</span>
            <span class="col-4">${track.likes}</span>
            <span class="col-5">${track.date}</span>
            <span class="col-6"><span class="status-live">Live</span></span>
            <span class="col-7">
                <button class="delete-track-btn" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </span>
        `;
        listContainer.appendChild(row);
    });
}

// 2. Lógica do Modal de Estatísticas
const statsModal = document.getElementById("track-stats-modal-overlay");
const closeStatsBtn = document.getElementById("close-track-stats-btn");

function openTrackStats(track) {
    // Preencher os dados no modal
    document.getElementById("ts-title").innerText = track.title;
    document.getElementById("ts-album").innerHTML = `${track.album} • Released <span id="ts-date">${track.date}</span>`;
    document.getElementById("ts-cover-img").src = track.cover;
    
    document.getElementById("ts-streams").innerText = track.streams;
    document.getElementById("ts-save-rate").innerText = track.saveRate;
    document.getElementById("ts-playlists").innerText = track.playlists;

    // Abrir o modal
    statsModal.classList.add("active");
}

function closeStatsModal() {
    statsModal.classList.remove("active");
}

// Event Listeners
if (closeStatsBtn) {
    closeStatsBtn.addEventListener("click", closeStatsModal);
}

if (statsModal) {
    statsModal.addEventListener("click", (e) => {
        if (e.target === statsModal) closeStatsModal();
    });
}

// Inicializar a lista ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    renderTrackList();
});