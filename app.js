// app.js (新版本)

// --- 模态框交互元素 ---
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modal-video');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const body = document.body;

// --- 背景音乐控制元素 ---
const audio = document.getElementById('background-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-icon');
const musicFxContainer = document.getElementById('music-fx-container'); 

// 音乐文件列表 
const musicFiles = [
    'music/bgm_01.mp3',
    'music/bgm_02.mp4', 
    'music/bgm_03.mp3'
];
let currentTrackIndex = 0;
let isLoading = false; // 加载状态标志

// --- 音乐控制逻辑 (保持与之前提供的最新版本一致) ---

const notes = ['♩', '♪', '♫']; 
function createNoteParticle() {
    if (!musicFxContainer) return;
    const noteChar = notes[Math.floor(Math.random() * notes.length)];
    const endX = (Math.random() * 40 - 20) + 'px'; 
    const endY = (Math.random() * -50 - 30) + 'px'; 
    const duration = (Math.random() * 0.5 + 1.0) + 's'; 
    const delay = (Math.random() * 0.2) + 's'; 
    const particle = document.createElement('div');
    particle.className = 'note-particle';
    particle.textContent = noteChar;
    particle.style.setProperty('--end-x', endX);
    particle.style.setProperty('--end-y', endY);
    particle.style.animation = `flyAndFade ${duration} ease-out ${delay} forwards`;
    musicFxContainer.appendChild(particle);
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

function toggleMusic() {
    if (audio.paused) {
        audio.play();
        // 播放时创建音符特效
        for(let i = 0; i < 3; i++) {
            createNoteParticle();
        }
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
    } else {
        musicIcon.src = 'assets/music_play.png';
        musicToggleBtn.classList.add('music-playing'); 
    }
}

function initMusicPlayer() {
    if (musicFiles.length === 0) return;

    musicToggleBtn.addEventListener('click', toggleMusic);
    audio.addEventListener('ended', playNextTrack);
    audio.addEventListener('play', updateMusicUI);
    audio.addEventListener('pause', updateMusicUI);

    audio.src = musicFiles[currentTrackIndex];
    
    // 尝试自动播放
    audio.play().catch(e => {
        console.log("浏览器阻止自动播放，等待用户手动交互...");
    });
    
    updateMusicUI(); 
}

// --- 视频加载和渲染逻辑 (随机加载核心) ---

/**
 * 核心函数：从 videoSources 数组中随机选择一个 JSON 文件进行加载
 */
async function fetchRandomVideos() {
    // 确保 DOM 元素存在，避免运行时错误
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    
    if (isLoading) {
        return;
    }
    
    // 1. 设置加载状态和 UI 提示
    isLoading = true;
    loadMoreTrigger.textContent = '正在努力寻找新视频...';
    loadMoreTrigger.style.cursor = 'wait';

    // 检查 data.js 中定义的 videoSources 是否存在
    if (typeof videoSources === 'undefined' || videoSources.length === 0) {
        loadMoreTrigger.textContent = '错误：视频数据源未配置。'; 
        loadMoreTrigger.style.cursor = 'pointer';
        isLoading = false; 
        return;
    }

    // 2. 随机选择一个数据源 URL
    try {
        document.getElementById('masonry-container').innerHTML = ''; // 清空瀑布流
        
        const randomIndex = Math.floor(Math.random() * videoSources.length);
        const selectedUrl = videoSources[randomIndex];
        
        const response = await fetch(selectedUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP 错误！状态: ${response.status}`);
        }
        
        const newVideoData = await response.json();
        
        if (!Array.isArray(newVideoData) || newVideoData.length === 0) {
            throw new Error("加载的数据格式不正确或为空。");
        }
        
        // **更新全局数据，以便其他函数可以访问**
        window.videoData = newVideoData; 
        
        // 3. 渲染新的视频列表
        renderVideos(window.videoData);

        // 4. 成功后重置状态
        loadMoreTrigger.textContent = '寻找更多Tian的视频 (点击或滚动到底部自动刷新)';
        loadMoreTrigger.style.cursor = 'pointer';
        isLoading = false;

    } catch (error) {
        console.error("加载视频数据失败:", error);
        document.getElementById('masonry-container').innerHTML = `<p style="text-align:center; padding-top: 50px; color: red;">加载视频列表失败。</p>`;
        
        // 5. 失败后重置状态
        loadMoreTrigger.textContent = '加载失败，点击重试';
        loadMoreTrigger.style.cursor = 'pointer';
        isLoading = false;
    }
}


// --- 性能优化：懒加载观察者 (保持不变) ---
const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const video = entry.target; 
        if (entry.isIntersecting) {
            const source = video.querySelector('source');
            if (source.src === "") {
                source.src = source.dataset.src; 
                video.load(); 
            } 
        } else if (video.tagName === 'VIDEO') {
            video.pause(); 
        }
    });
}, { rootMargin: '0px 0px 100px 0px' });

// 【滚动加载核心】：无限滚动 Intersection Observer
const loadMoreObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // 当加载触发器进入视口时，且不在加载中，则触发新的随机加载
        if (entry.isIntersecting && !isLoading) {
            fetchRandomVideos();
        }
    });
}, {
    root: document.querySelector('.main-content'), 
    rootMargin: '0px 0px 50px 0px', 
    threshold: 0.1 
});


// --- 渲染和辅助函数 (使用外部 URL) ---
function renderVideos(data) {
    const container = document.getElementById('masonry-container');
    
    // 取消观察旧视频，清空容器
    container.querySelectorAll('video').forEach(video => {
        videoObserver.unobserve(video);
    });
    container.innerHTML = ''; 

    data.forEach((video, index) => {
        const workItem = document.createElement('div');
        workItem.classList.add('work-item');
        
        // 注意：这里进行了严格的字符串转义，以确保 URL 和文本能正确传递到 onclick
        const src = video.src.replace(/'/g, "\\'"); 
        const title = video.title.replace(/'/g, "\\'"); 
        const description = video.description.replace(/'/g, "\\'");
        
        workItem.setAttribute('onclick', `if (event.target.tagName !== 'BUTTON' && !event.target.closest('.like-btn')) openModal('${src}', '${title}', '${description}')`);

        const randomSeed = 100 + index; 
        
        const contentHTML = `
            <div class="item-content">
                <video muted loop poster="https://picsum.photos/400/600?random=${randomSeed}">
                    <source data-src="${video.src}" type="video/mp4">
                    您的浏览器不支持视频。
                </video>
            </div>
        `;
        
        workItem.innerHTML = contentHTML;
        container.appendChild(workItem);
        
        const videoElement = workItem.querySelector('video');
        videoObserver.observe(videoElement);
    });
}


// --- 初始加载和事件绑定 ---
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 初始加载：首次随机加载一组视频
    fetchRandomVideos();

    // 2. 绑定随机刷新按钮事件
    const shuffleBtn = document.getElementById('shuffle-btn');
    shuffleBtn.addEventListener('click', function() {
        fetchRandomVideos();
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // 3. 绑定滚动触发器和点击事件
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
        // 绑定 Intersection Observer，实现滚动自动加载
        // 确保 .main-content 滚动容器存在
        loadMoreObserver.observe(loadMoreTrigger); 
        
        // 绑定点击事件，实现手动加载
        loadMoreTrigger.addEventListener('click', function() {
            if (!isLoading) {
                fetchRandomVideos();
                document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // 4. 初始化背景音乐播放器 (尝试自动播放)
    initMusicPlayer();

    // 绑定 ESC 关闭模态框事件
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
});

// --- 模态框交互函数 (确保模态框关闭后背景音乐恢复) ---
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
    
    // 模态框关闭后尝试恢复背景音乐
    audio.play().catch(e => console.log("")); // 尝试播放，不打断用户体验
}