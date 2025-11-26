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


// ====================== 新增：分页 / 懒加载相关全局变量 ======================
const BASE_VIDEO_URL = 'https://tianming332.github.io/Tian-Video-Assets/videos/'; // 新仓库地址
const PAGE_SIZE = 20;          // 每次加载 20 个
let allVideos = [];            // 统一过新地址之后的完整视频列表
let remainingVideos = [];      // 当前还没被取出的池子
let isLoadingMore = false;     // 防止重复触发加载

// ====================== 背景音乐控制逻辑 ======================

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
        audio.play().catch(e => console.log("浏览器阻止自动播放，请手动点击"));
    }
    
    // 初始 UI 设置
    updateMusicUI(); 
}


// ====================== 性能优化：懒加载观察者 ======================
const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const video = entry.target; 
            const source = video.querySelector('source');
            
            if (source.src === "") {
                // 真正开始播放时再填充 src
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


// ====================== 点赞功能 ======================
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

// ====================== 工具函数：数组洗牌 ======================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ====================== 新增：分页相关函数 ======================

/**
 * 把 data.js 里的旧地址统一替换到新的 Tian-Video-Assets/videos 下
 * 保留原有 title / description
 */
function normalizeVideoData(rawData) {
    return rawData.map(item => {
        // 取原来地址最后一个文件名（比如 vid_01.mp4）
        const filename = item.src.split('/').pop();
        return {
            ...item,
            src: BASE_VIDEO_URL + filename
        };
    });
}

/**
 * 重置池子：把所有视频打乱后放入 remainingVideos
 */
function resetVideoPool() {
    remainingVideos = [...allVideos];
    shuffleArray(remainingVideos);
}

/**
 * 取出下一批视频（PAGE_SIZE 个）
 * 如果当前池子不够/为空，则重新洗牌
 */
function getNextBatch() {
    if (remainingVideos.length === 0) {
        resetVideoPool();
    }
    const batch = remainingVideos.splice(0, PAGE_SIZE);
    return batch;
}

/**
 * 下滑到底部时调用：自动加载下一批
 */
function handleScroll() {
    const mainContent = document.querySelector('.main-content');
    const scrollPosition = mainContent.scrollTop + mainContent.clientHeight;
    const threshold = mainContent.scrollHeight - 200; // 距底部 200px 时触发

    if (!isLoadingMore && scrollPosition >= threshold) {
        isLoadingMore = true;
        const nextBatch = getNextBatch();
        // 这里是“追加模式”
        renderVideos(nextBatch, true);
        isLoadingMore = false;
    }
}


// ====================== 主要渲染逻辑 ======================

/**
 * 渲染视频
 * @param {Array} data - 要渲染的视频数据
 * @param {Boolean} append - 是否为追加模式（true=在后面继续加；false=清空后重渲染）
 */
function renderVideos(data, append = false) {
    const container = document.getElementById('masonry-container');
    
    if (!append) {
        // 清空前先取消监听
        container.querySelectorAll('video').forEach(video => {
            videoObserver.unobserve(video);
        });
        container.innerHTML = ''; 
    }

    data.forEach((video, index) => {
        const workItem = document.createElement('div');
        workItem.classList.add('work-item');
        
        const src = video.src;
        const title = video.title.replace(/'/g, "\\'"); 
        const description = video.description.replace(/'/g, "\\'");
        
        workItem.setAttribute(
            'onclick',
            `if (event.target.tagName !== 'BUTTON' && !event.target.closest('.like-btn')) openModal('${src}', '${title}', '${description}')`
        );

        const initialLikes = getLikes(src);
        const randomSeed = 100 + Math.floor(Math.random() * 10000); 
        
        const contentHTML = `
            <div class="item-content">
                <video muted loop poster="https://picsum.photos/400/600?random=${randomSeed}">
                    <!-- 懒加载：真正出现在视口时才把 data-src 填到 src -->
                    <source data-src="${src}" src="" type="video/mp4">
                    您的浏览器不支持视频。
                </video>
                <button class="like-btn" onclick="toggleLike(event, '${src}')">
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


// ====================== 初始加载和事件绑定 ======================
document.addEventListener('DOMContentLoaded', function() {
    if (typeof videoData === 'undefined' || videoData.length === 0) {
        console.error("视频数据未找到或为空。请检查 data.js 文件是否正确引入。");
        return;
    }
    
    // 0. 把 data.js 里的 src 统一换到新仓库地址
    allVideos = normalizeVideoData(videoData);

    // 1. 初始化视频池子
    resetVideoPool();

    // 2. 初次加载 20 个视频
    const firstBatch = getNextBatch();
    renderVideos(firstBatch);

    // 3. 绑定「一键刷新」按钮：换一批随机 20 个
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', function() {
        resetVideoPool();
        const batch = getNextBatch();
        renderVideos(batch, false); // 不追加，重新渲染一批
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // 4. 绑定向下滚动自动加载下一批
    const mainContent = document.querySelector('.main-content');
    mainContent.addEventListener('scroll', handleScroll);
    
    // 5. 初始化背景音乐播放器
    initMusicPlayer();
});


// ====================== 模态框交互函数 ======================
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
