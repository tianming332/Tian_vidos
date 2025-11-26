// ================= 模态框 & 基础元素 =================
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const body = document.body;

// 背景音乐元素
const audio = document.getElementById('background-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-icon');

// 分页 / 性能控制
const PAGE_SIZE = 10;   // 每次加载 10 个
const MAX_VIDEOS = 50;  // 页面上最多保留 50 个视频

let nextVideoIndex = 0;     // 下一次从 videoData 取的下标
let mainContentEl = null;   // 滚动容器
let videoObserver = null;   // IntersectionObserver
let isLoadingMore = false;  // 避免重复触发加载

// 背景音乐播放列表（按需要修改）
const musicFiles = [
    'music/bgm_01.mp3',
    'music/bgm_02.mp3',
    'music/bgm_03.mp3'
];
let currentTrackIndex = 0;


// ================= 背景音乐逻辑 =================
function toggleMusic() {
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
}

function playNextTrack() {
    if (!audio || musicFiles.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    audio.src = musicFiles[currentTrackIndex];
    audio.play().catch(() => {});
}

function updateMusicUI() {
    if (!audio || !musicIcon || !musicToggleBtn) return;

    if (audio.paused) {
        musicIcon.src = 'assets/music_stop.png';
        musicToggleBtn.classList.remove('music-playing');
        localStorage.setItem('musicPlaybackTime', audio.currentTime || 0);
        localStorage.setItem('musicIsPlaying', 'false');
    } else {
        musicIcon.src = 'assets/music_play.png';
        musicToggleBtn.classList.add('music-playing');
        localStorage.setItem('musicIsPlaying', 'true');
    }
}

function initMusicPlayer() {
    if (!audio || !musicToggleBtn || musicFiles.length === 0) return;

    musicToggleBtn.addEventListener('click', toggleMusic);
    audio.addEventListener('ended', playNextTrack);
    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    const isPlaying = localStorage.getItem('musicIsPlaying') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicPlaybackTime') || '0');

    currentTrackIndex = 0;
    audio.src = musicFiles[currentTrackIndex];

    if (!isNaN(savedTime) && savedTime > 0) {
        audio.currentTime = savedTime;
    }

    if (isPlaying) {
        audio.play().catch(() => {});
    }

    updateMusicUI();
}


// ================= 点赞逻辑 =================
function getLikes(src) {
    const likes = JSON.parse(localStorage.getItem('videoLikes') || '{}');
    return likes[src] || 0;
}

function toggleLike(event, src) {
    event.stopPropagation();
    const likes = JSON.parse(localStorage.getItem('videoLikes') || '{}');
    likes[src] = (likes[src] || 0) + 1;
    localStorage.setItem('videoLikes', JSON.stringify(likes));

    const likeButton = event.currentTarget;
    const likeCountSpan = likeButton.querySelector('.like-count');
    likeCountSpan.textContent = likes[src];

    likeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    likeButton.style.transform = 'scale(1.1)';
    setTimeout(() => {
        likeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        likeButton.style.transform = 'scale(1)';
    }, 150);
}


// ================= 视频播放观察（只负责播放/暂停） =================
function initVideoObserver() {
    if (!('IntersectionObserver' in window)) return;

    const rootEl = document.querySelector('.main-content') || null;
    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (!(video instanceof HTMLVideoElement)) return;

            if (entry.isIntersecting) {
                if (video.paused) {
                    video.play().catch(() => {});
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        root: rootEl,
        rootMargin: '0px 0px 200px 0px'
    });
}


// ================= 创建和追加视频卡片 =================
function createVideoCard(videoInfo) {
    const src = videoInfo.src;
    const title = (videoInfo.title || '').replace(/'/g, "\\'");
    const description = (videoInfo.description || '').replace(/'/g, "\\'");

    const workItem = document.createElement('div');
    workItem.classList.add('work-item');

    const itemContent = document.createElement('div');
    itemContent.classList.add('item-content');

    const videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.preload = 'metadata';

    const sourceEl = document.createElement('source');
    sourceEl.src = src;
    sourceEl.type = 'video/mp4';
    videoEl.appendChild(sourceEl);

    const likeBtn = document.createElement('button');
    likeBtn.classList.add('like-btn');
    const initialLikes = getLikes(src);
    likeBtn.innerHTML = `❤️ <span class="like-count">${initialLikes}</span>`;
    likeBtn.addEventListener('click', (event) => toggleLike(event, src));

    itemContent.appendChild(videoEl);
    itemContent.appendChild(likeBtn);
    workItem.appendChild(itemContent);

    workItem.addEventListener('click', (event) => {
        if (event.target.closest('.like-btn')) return;
        openModal(src, title, description);
    });

    return { workItem, videoEl };
}


// 追加一批视频到瀑布流中
function loadMoreVideos(count) {
    if (!Array.isArray(videoData) || videoData.length === 0) return;

    const container = document.getElementById('masonry-container');
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const info = videoData[nextVideoIndex];
        nextVideoIndex = (nextVideoIndex + 1) % videoData.length;

        const { workItem, videoEl } = createVideoCard(info);
        container.appendChild(workItem);

        if (videoObserver) {
            videoObserver.observe(videoEl);
        } else {
            videoEl.play().catch(() => {});
        }
    }

    // 控制 DOM 数量，避免过重
    while (container.childElementCount > MAX_VIDEOS) {
        const first = container.firstElementChild;
        if (!first) break;
        const v = first.querySelector('video');
        if (v && videoObserver) {
            videoObserver.unobserve(v);
        }
        container.removeChild(first);
    }
}


// ================= 滚动 & 按钮事件 =================
function handleScroll() {
    if (!mainContentEl) return;
    const nearBottom =
        mainContentEl.scrollTop + mainContentEl.clientHeight >=
        mainContentEl.scrollHeight - 200;

    if (!isLoadingMore && nearBottom) {
        isLoadingMore = true;
        loadMoreVideos(PAGE_SIZE);
        isLoadingMore = false;
    }
}


// ================= 页面初始化 =================
document.addEventListener('DOMContentLoaded', () => {
    if (!Array.isArray(videoData) || videoData.length === 0) {
        console.error('视频数据未找到或为空，请检查 data.js 是否正确引入。');
        return;
    }

    mainContentEl = document.querySelector('.main-content');

    initMusicPlayer();
    initVideoObserver();

    // 1. 初次加载 20 个视频
    loadMoreVideos(PAGE_SIZE);

    // 2. 按钮：一键加载更多视频
    const loadMoreBtn = document.getElementById('shuffle-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreVideos(PAGE_SIZE);
        });
    }

    // 3. 滚动到底部自动加载更多
    if (mainContentEl) {
        mainContentEl.addEventListener('scroll', handleScroll);
    }
});


// ================= 模态框逻辑 =================
function openModal(videoSrc, title, description) {
    if (!modal || !modalVideo) return;

    if (audio && !audio.paused) {
        audio.pause();
    }

    modalVideo.src = videoSrc;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    modal.style.display = 'flex';
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
    body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal || !modalVideo) return;

    modal.style.display = 'none';
    modalVideo.pause();
    body.style.overflow = 'auto';

    if (audio && localStorage.getItem('musicIsPlaying') === 'true') {
        audio.play().catch(() => {});
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'flex') {
        closeModal();
    }
});
