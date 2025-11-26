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
const PAGE_SIZE = 20;   // 每次加载 20 个
const MAX_VIDEOS = 80;  // 页面上最多保留 80 个视频

let nextVideoIndex = 0;     // 下一次从 videoData 取的下标
let mainContentEl = null;   // 滚动容器
let videoObserver = null;   // IntersectionObserver
let isLoadingMore = false;  // 避免重复触发加载

// 背景音乐播放列表
const musicFiles = [
    'https://tianming332.github.io/Tian_vidos/music/bgm_01.mp3',
    'https://tianming332.github.io/Tian_vidos/music/bgm_02.mp3',
    'https://tianming332.github.io/Tian_vidos/music/bgm_03.mp3'
];
let currentTrackIndex = 0;

// 背景音乐体积控制 & 特效状态
let baseMusicVolume = 0.6;    // 0~1
let isModalOpen = false;      // 是否打开了视频模态框
let musicNoteTimer = null;    // 小音符定时器


// ================= 背景音乐逻辑 =================
function toggleMusic() {
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(err => {
            console.log('背景音乐播放失败:', err);
        });
    } else {
        audio.pause();
    }
}

function playNextTrack() {
    if (!audio || musicFiles.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    audio.src = musicFiles[currentTrackIndex];
    audio.play().catch(err => {
        console.log('自动播放下一首失败:', err);
    });
}

// 小音符特效
function spawnMusicNote() {
    const container = document.getElementById('music-note-container');
    if (!container) return;

    const note = document.createElement('span');
    note.className = 'music-note';

    const symbols = ['♪', '♫', '♬'];
    note.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const offset = -20 + Math.random() * 40; // -20% ~ +20%
    note.style.left = (50 + offset) + '%';
    note.style.fontSize = (11 + Math.random() * 5) + 'px';

    container.appendChild(note);
    setTimeout(() => {
        note.remove();
    }, 1700);
}

function startMusicNotes() {
    if (musicNoteTimer !== null) return;
    musicNoteTimer = setInterval(spawnMusicNote, 700);
}

function stopMusicNotes() {
    if (musicNoteTimer !== null) {
        clearInterval(musicNoteTimer);
        musicNoteTimer = null;
    }
}

function updateMusicUI() {
    if (!audio || !musicIcon || !musicToggleBtn) return;

    if (audio.paused) {
        musicIcon.src = 'assets/music_stop.png';
        musicToggleBtn.classList.remove('music-playing');
        musicToggleBtn.classList.remove('music-active');
        stopMusicNotes();

        localStorage.setItem('musicPlaybackTime', audio.currentTime || 0);
        localStorage.setItem('musicIsPlaying', 'false');
    } else {
        musicIcon.src = 'assets/music_play.png';
        musicToggleBtn.classList.add('music-playing');
        musicToggleBtn.classList.add('music-active');
        startMusicNotes();

        localStorage.setItem('musicIsPlaying', 'true');
    }
}

function initMusicPlayer() {
    if (!audio || !musicToggleBtn || musicFiles.length === 0) return;

    // 恢复/初始化音量
    const volumeSlider = document.getElementById('music-volume');
    const savedVol = parseFloat(localStorage.getItem('musicVolume') || 'NaN');
    if (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) {
        baseMusicVolume = savedVol;
    }

    if (volumeSlider) {
        if (isNaN(savedVol)) {
            const sliderVal = parseInt(volumeSlider.value, 10);
            if (!isNaN(sliderVal)) {
                baseMusicVolume = sliderVal / 100;
            }
        } else {
            volumeSlider.value = Math.round(baseMusicVolume * 100);
        }

        volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            const norm = isNaN(value) ? 0.6 : value / 100;
            baseMusicVolume = Math.max(0, Math.min(1, norm));
            const effectiveVolume = isModalOpen ? baseMusicVolume * 0.5 : baseMusicVolume;
            audio.volume = effectiveVolume;
            localStorage.setItem('musicVolume', String(baseMusicVolume));
        });
    }

    // 初始音量
    audio.volume = baseMusicVolume;

    // 选择第一首音乐
    currentTrackIndex = 0;
    audio.src = musicFiles[currentTrackIndex];

    // 绑定音乐控制按钮
    musicToggleBtn.addEventListener('click', toggleMusic);

    // 播放结束自动下一首
    audio.addEventListener('ended', playNextTrack);

    // 播放/暂停时更新 UI
    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    // 自动播放策略：
    // - 默认视为需要播放（包括第一次访问）
    // - 如果用户上次明确点了“停止”，则不自动播放
    const savedFlag = localStorage.getItem('musicIsPlaying');
    const shouldPlay = savedFlag === 'false' ? false : true;

    if (shouldPlay) {
        audio.play().then(() => {
            // 成功自动播放，UI 会在 play 事件中更新
        }).catch(err => {
            console.log('自动播放被浏览器阻止:', err);
            localStorage.setItem('musicIsPlaying', 'false');
            updateMusicUI();

            // 退一步：首次点击页面时再尝试播放一次
            const resume = () => {
                audio.play().catch(() => {});
                window.removeEventListener('click', resume);
            };
            window.addEventListener('click', resume, { once: true });
        });
    } else {
        updateMusicUI();
    }
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

    // 初次加载 20 个视频
    loadMoreVideos(PAGE_SIZE);

    // 按钮：一键加载更多视频
    const loadMoreBtn = document.getElementById('shuffle-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreVideos(PAGE_SIZE);
        });
    }

    // 滚动到底部自动加载更多
    if (mainContentEl) {
        mainContentEl.addEventListener('scroll', handleScroll);
    }
});


// ================= 模态框逻辑 =================
function openModal(videoSrc, title, description) {
    if (!modal || !modalVideo) return;

    // 打开模态框时，不再暂停背景音乐，而是把音量降到 50%
    isModalOpen = true;
    if (audio) {
        const effectiveVolume = baseMusicVolume * 0.5;
        audio.volume = effectiveVolume;
    }

    modalVideo.src = videoSrc;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    modal.style.display = 'flex';
    modalVideo.currentTime = 0;
    modalVideo.play().catch(err => {
        console.log('播放视频失败:', err);
    });
    body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal || !modalVideo) return;

    modal.style.display = 'none';
    modalVideo.pause();
    body.style.overflow = 'auto';

    // 恢复背景音乐音量到基础音量
    isModalOpen = false;
    if (audio) {
        audio.volume = baseMusicVolume;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'flex') {
        closeModal();
    }
});
