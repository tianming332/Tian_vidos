// data.js
// 存储所有外部视频列表 JSON 文件的完整 URL。
// 请将 URL 替换为您的主仓库中 video_list_A.json 和 video_list_B.json 的实际部署地址。
const videoSources = [
    // 假设您的 GitHub Pages 域名是 tianming332.github.io/Tian_vidos
    "https://tianming332.github.io/Tian_vidos/video_list_A.json", 
    "https://tianming332.github.io/Tian_vidos/video_list_B.json",
];

// 用于存储当前加载的视频数据 (此变量由 app.js 动态填充)
let videoData = [];