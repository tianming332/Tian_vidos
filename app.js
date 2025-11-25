// --- 模态框交互元素 ---
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const body = document.body;

// --- 新增：背景音乐控制元素 ---
const audio = document.getElementById('background-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-icon');

// 音乐文件列表 (请根据您的音乐文件路径修改)
const musicFiles = [
    'music/bgm_01.mp3',
    'music/bgm_02.mp3',
    'music/bgm_03.mp3'
];
let currentTrackIndex = 0;


// --- 背景音乐控制逻辑 (保持不变) ---
function toggleMusic() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    audio.src = musicFiles[currentTrackIndex];
    audio.play();
}

function updateMusicUI() {
    if (audio.paused) {
        musicIcon.src = 'assets/music_stop.png';
        musicToggleBtn.classList.remove('music-playing');
        localStorage.setItem('musicPlaybackTime', audio.currentTime);
        localStorage.setItem('musicIsPlaying', 'false');
    } else {
        musicIcon.src = 'assets/music_play.png';
        musicToggleBtn.classList.add('music-playing');
        localStorage.setItem('musicIsPlaying', 'true');
    }
}

function initMusicPlayer() {
    if (musicFiles.length === 0) return;

    musicToggleBtn.addEventListener('click', toggleMusic);
    audio.addEventListener('ended', playNextTrack);
    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    const isPlaying = localStorage.getItem('musicIsPlaying') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicPlaybackTime')) || 0;
    
    audio.src = musicFiles[currentTrackIndex];

    if (isPlaying) {
        audio.currentTime = savedTime;
        audio.play().catch(e => console.log("浏览器阻止自动播放，请手动点击"));
    }
    
    updateMusicUI(); 
}


// --- 性能优化：懒加载观察者 (修改：移除自动播放) ---
const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const video = entry.target; 
        if (entry.isIntersecting) {
            const source = video.querySelector('source');
            
            // 首次进入视口时，加载视频源
            if (source.src === "") {
                source.src = source.dataset.src; 
                video.load(); 
            } 
            // **核心修改：移除 video.play()，让视频在瀑布流中保持静止。**
            // **仅在用户点击打开模态框时才播放。**
        } else if (video.tagName === 'VIDEO') {
            video.pause(); // 移出视口时暂停，节省资源
        }
    });
}, { rootMargin: '0px 0px 100px 0px' });


// --- 点赞/排序功能 (保持不变) ---
function getLikes(src) {
    const likes = JSON.parse(localStorage.getItem('videoLikes')) || {};
    return likes[src] || 0;
}

function toggleLike(event, src) {
    event.stopPropagation(); 
    const likes = JSON.parse(localStorage.getItem('videoLikes')) || {};
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 主要渲染逻辑 (修改：阻止触摸事件冒泡) ---
function renderVideos(data) {
    const container = document.getElementById('masonry-container');
    
    container.querySelectorAll('video').forEach(video => {
        videoObserver.unobserve(video);
    });
    container.innerHTML = ''; 

    data.forEach((video, index) => {
        const workItem = document.createElement('div');
        workItem.classList.add('work-item');
        
        const src = video.src;
        const title = video.title.replace(/'/g, "\\'"); 
        const description = video.description.replace(/'/g, "\\'");
        
        // 绑定点击事件，用于打开模态框
        workItem.setAttribute('onclick', `if (event.target.tagName !== 'BUTTON' && !event.target.closest('.like-btn')) openModal('${src}', '${title}', '${description}')`);

        const initialLikes = getLikes(video.src);
        const randomSeed = 100 + index; 
        
        const contentHTML = `
            <div class="item-content">
                <video muted loop poster="https://picsum.photos/400/600?random=${randomSeed}">
                    <source data-src="${video.src}" type="video/mp4">
                    您的浏览器不支持视频。
                </video>
                <button class="like-btn" onclick="toggleLike(event, '${video.src}')">
                    ❤️ <span class="like-count">${initialLikes}</span>
                </button>
            </div>
        `;
        
        workItem.innerHTML = contentHTML;
        container.appendChild(workItem);
        
        const videoElement = workItem.querySelector('video');
        
        // **核心修改：阻止视频上的触摸和拖动事件冒泡**
        // 这解决了滑动或长按操作意外触发父级 workItem 的点击事件的问题。
        videoElement.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); 
        });
        videoElement.addEventListener('touchstart', (e) => {
            e.stopPropagation(); 
        });

        videoObserver.observe(videoElement);
        
        videoElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
}


// --- 初始加载和事件绑定 (保持不变) ---
document.addEventListener('DOMContentLoaded', function() {
    if (typeof videoData === 'undefined' || videoData.length === 0) {
        console.error("视频数据未找到或为空。请检查 data.js 文件是否正确引入。");
        return;
    }
    
    renderVideos(videoData);

    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', function() {
        const shuffledData = [...videoData]; 
        shuffleArray(shuffledData);
        renderVideos(shuffledData);
        
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    initMusicPlayer();
});


// --- 模态框交互函数 (保持不变) ---
function openModal(videoSrc, title, description) {
    if (!audio.paused) {
        audio.pause();
    }
    
    modalVideo.src = videoSrc;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modal.style.display = 'flex';
    modalVideo.currentTime = 0; 
    modalVideo.play(); // **模态框中的视频才播放**
    body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    modalVideo.pause();
    body.style.overflow = 'auto';
    
    if (localStorage.getItem('musicIsPlaying') === 'true') {
        audio.play().catch(e => console.log("无法自动恢复背景音乐播放"));
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});