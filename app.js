const modal = document.getElementById("modal");
const modalVideo = document.getElementById("modal-video");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const mainContent = document.querySelector(".main-content");
const container = document.getElementById("masonry-container");
const loadSentinel = document.getElementById("video-load-sentinel");
const loadStatus = document.getElementById("video-load-status");
const audio = document.getElementById("background-music");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const musicIcon = document.getElementById("music-icon");

const musicFiles = ["music/bgm_01.mp3", "music/bgm_02.mp3", "music/bgm_03.mp3"];
let currentTrackIndex = 0;
let nextLibraryIndex = 0;
let loadedVideos = [];
let isLoadingLibrary = false;

function safePlay(media) {
    const promise = media.play();
    if (promise && typeof promise.catch === "function") promise.catch(() => {});
}

function toggleMusic() {
    if (audio.paused) safePlay(audio);
    else audio.pause();
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    audio.src = musicFiles[currentTrackIndex];
    safePlay(audio);
}

function updateMusicUI() {
    const isPlaying = !audio.paused;
    musicIcon.src = isPlaying ? "assets/music_play.png" : "assets/music_stop.png";
    musicToggleBtn.classList.toggle("music-playing", isPlaying);
    localStorage.setItem("musicPlaybackTime", String(audio.currentTime || 0));
    localStorage.setItem("musicIsPlaying", isPlaying ? "true" : "false");
}

function initMusicPlayer() {
    if (!musicFiles.length) return;
    musicToggleBtn.addEventListener("click", toggleMusic);
    audio.addEventListener("ended", playNextTrack);
    audio.addEventListener("play", updateMusicUI);
    audio.addEventListener("pause", updateMusicUI);
    audio.src = musicFiles[currentTrackIndex];
    audio.currentTime = Number.parseFloat(localStorage.getItem("musicPlaybackTime")) || 0;
    if (localStorage.getItem("musicIsPlaying") === "true") safePlay(audio);
    updateMusicUI();
}

const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
            const source = video.querySelector("source");
            if (!source.src) {
                source.src = source.dataset.src;
                video.load();
            }
            safePlay(video);
        } else {
            video.pause();
        }
    });
}, { root: mainContent, rootMargin: "200px 0px" });

function getLikes(src) {
    const likes = JSON.parse(localStorage.getItem("videoLikes") || "{}");
    return likes[src] || 0;
}

function toggleLike(event, src) {
    event.stopPropagation();
    const likes = JSON.parse(localStorage.getItem("videoLikes") || "{}");
    likes[src] = (likes[src] || 0) + 1;
    localStorage.setItem("videoLikes", JSON.stringify(likes));
    event.currentTarget.querySelector(".like-count").textContent = likes[src];
}

function openModal(video) {
    if (!audio.paused) audio.pause();
    modalVideo.src = video.src;
    modalTitle.textContent = video.title;
    modalDescription.textContent = video.description;
    modal.style.display = "flex";
    modalVideo.currentTime = 0;
    safePlay(modalVideo);
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.style.display = "none";
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    document.body.style.overflow = "auto";
    if (localStorage.getItem("musicIsPlaying") === "true") safePlay(audio);
}

function createVideoItem(video) {
    const workItem = document.createElement("article");
    workItem.className = "work-item";
    workItem.dataset.repository = video.repository;

    const itemContent = document.createElement("div");
    itemContent.className = "item-content";

    const videoElement = document.createElement("video");
    videoElement.muted = true;
    videoElement.loop = true;
    videoElement.preload = "none";
    videoElement.setAttribute("aria-label", video.title);
    videoElement.innerHTML = `<source data-src="${video.src}" type="video/mp4">您的浏览器不支持视频。`;
    videoElement.addEventListener("contextmenu", (event) => event.preventDefault());

    const likeButton = document.createElement("button");
    likeButton.className = "like-btn";
    likeButton.type = "button";
    likeButton.setAttribute("aria-label", `点赞：${video.title}`);
    likeButton.innerHTML = `❤️ <span class="like-count">${getLikes(video.src)}</span>`;
    likeButton.addEventListener("click", (event) => toggleLike(event, video.src));

    itemContent.append(videoElement, likeButton);
    workItem.appendChild(itemContent);
    workItem.addEventListener("click", (event) => {
        if (!event.target.closest(".like-btn")) openModal(video);
    });
    videoObserver.observe(videoElement);
    return workItem;
}

function appendVideos(videos) {
    const fragment = document.createDocumentFragment();
    videos.forEach((video) => fragment.appendChild(createVideoItem(video)));
    container.appendChild(fragment);
}

function renderLoadedVideos() {
    container.querySelectorAll("video").forEach((video) => videoObserver.unobserve(video));
    container.replaceChildren();
    appendVideos(loadedVideos);
}

function shuffleArray(array) {
    for (let index = array.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }
}

function updateLoadStatus(message) {
    loadStatus.textContent = message;
}

function loadNextLibrary() {
    if (isLoadingLibrary) return;
    if (nextLibraryIndex >= videoLibraries.length) {
        updateLoadStatus(`已加载全部 ${loadedVideos.length} 个视频 / ALL VIDEOS LOADED`);
        libraryObserver.disconnect();
        return;
    }

    isLoadingLibrary = true;
    const libraryNumber = nextLibraryIndex + 1;
    const videos = videoLibraries[nextLibraryIndex];
    const repository = VIDEO_LIBRARIES[nextLibraryIndex].repository;
    updateLoadStatus(`正在加载视频库 ${libraryNumber} · ${repository}`);

    requestAnimationFrame(() => {
        loadedVideos.push(...videos);
        appendVideos(videos);
        nextLibraryIndex += 1;
        isLoadingLibrary = false;
        updateLoadStatus(`已加载视频库 ${libraryNumber}，共 ${loadedVideos.length} 个视频`);
    });
}

const libraryObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadNextLibrary();
}, { root: mainContent, rootMargin: "800px 0px" });

document.addEventListener("DOMContentLoaded", () => {
    if (!Array.isArray(videoLibraries) || !videoLibraries.length) {
        updateLoadStatus("尚未配置可访问的视频库。 / NO VIDEO LIBRARY CONFIGURED");
        return;
    }

    document.getElementById("shuffle-btn").addEventListener("click", () => {
        shuffleArray(loadedVideos);
        renderLoadedVideos();
        mainContent.scrollTo({ top: 0, behavior: "smooth" });
    });

    initMusicPlayer();
    loadNextLibrary();
    libraryObserver.observe(loadSentinel);
});

modal.addEventListener("click", closeModal);
modal.querySelector(".modal-content").addEventListener("click", (event) => event.stopPropagation());
modal.querySelector(".close-btn").addEventListener("click", closeModal);
modalVideo.addEventListener("ended", () => { modalVideo.currentTime = 0; });
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "flex") closeModal();
});
