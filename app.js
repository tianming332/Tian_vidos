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
    // ... 可在此处添加更多音乐文件
];
let currentTrackIndex = 0;


// --- 背景音乐控制逻辑 ---

/**
 * 切换音乐播放/暂停状态
 */
function toggleMusic() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

/**
 * 加载下一首音乐并播放
 */
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    audio.src = musicFiles[currentTrackIndex];
    audio.play();
}

/**
 * 更新音乐 UI 状态（图片和旋转动画）
 */
function updateMusicUI() {
    if (audio.paused) {
        // 暂停状态
        musicIcon.src = 'assets/music_stop.png';
        musicToggleBtn.classList.remove('music-playing');
        
        // 确保在暂停时保存播放进度
        localStorage.setItem('musicPlaybackTime', audio.currentTime);
        localStorage.setItem('musicIsPlaying', 'false');
    } else {
        // 播放状态
        musicIcon.src = 'assets/music_play.png';
        musicToggleBtn.classList.add('music-playing');
        
        localStorage.setItem('musicIsPlaying', 'true');
    }
}

// 初始化音乐播放器
function initMusicPlayer() {
    if (musicFiles.length === 0) return;

    // 绑定音乐控制按钮的点击事件
    musicToggleBtn.addEventListener('click', toggleMusic);

    // 绑定事件：音乐播放结束时，自动播放下一首
    audio.addEventListener('ended', playNextTrack);
    
    // 绑定事件：播放/暂停时更新 UI
    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    // 从本地存储读取状态
    const isPlaying = localStorage.getItem('musicIsPlaying') === 'true';
    const savedTime = parseFloat(localStorage.getItem('musicPlaybackTime')) || 0;
    
    // 加载第一首音乐
    audio.src = musicFiles[currentTrackIndex];

    if (isPlaying) {
        // 如果上次是播放状态，尝试恢复进度并播放 (需要用户交互才能自动播放，可能需要用户再点一下)
        audio.currentTime = savedTime;
        // 尝试播放 (浏览器可能阻止，但 UI 仍会设置为播放状态)
        audio.play().catch(e => console.log("浏览器阻止自动播放，请手动点击"));
    }
    
    // 初始 UI 设置
    updateMusicUI(); 
}


// --- 性能优化：懒加载观察者 (保持不变) ---
const videoObserver = new IntersectionObserver((entries, observer) => {
    // ... (代码保持不变) ...
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const video = entry.target; 
            const source = video.querySelector('source');
            
            if (source.src === "") {
                source.src = source.dataset.src; 
                video.load(); 
                video.play(); 
            } else if (video.paused) {
                video.play();
            }
        } else if (entry.target.tagName === 'VIDEO') {
            entry.target.pause();
        }
    });
}, { rootMargin: '0px 0px 100px 0px' });


// --- 点赞功能函数 (保持不变) ---
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

// --- 随机排序功能函数 (保持不变) ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 主要渲染逻辑 (保持不变) ---
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
        
        videoObserver.observe(videoElement);
        
        videoElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
}


// --- 初始加载和事件绑定 ---
document.addEventListener('DOMContentLoaded', function() {
    if (typeof videoData === 'undefined' || videoData.length === 0) {
        console.error("视频数据未找到或为空。请检查 data.js 文件是否正确引入。");
        return;
    }
    
    // 1. 初始渲染
    renderVideos(videoData);

    // 2. 绑定随机排版按钮事件
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', function() {
        const shuffledData = [...videoData]; 
        shuffleArray(shuffledData);
        renderVideos(shuffledData);
        
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // 3. 初始化背景音乐播放器
    initMusicPlayer();
});


// --- 模态框交互函数 (保持不变) ---
function openModal(videoSrc, title, description) {
    // 模态框打开时暂停背景音乐
    if (!audio.paused) {
        audio.pause();
    }
    
    modalVideo.src = videoSrc;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modal.style.display = 'flex';
    modalVideo.currentTime = 0; 
    modalVideo.play();
    body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    modalVideo.pause();
    body.style.overflow = 'auto';
    
    // 模态框关闭后恢复背景音乐
    if (localStorage.getItem('musicIsPlaying') === 'true') {
        audio.play().catch(e => console.log("无法自动恢复背景音乐播放"));
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});