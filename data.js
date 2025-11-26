// data.js
// 存储所有外部视频列表 JSON 文件的完整 URL。
// 请确保这里的 URL 是您的主仓库中 video_list_A.json 和 video_list_B.json 的实际部署地址。
const videoSources = [
    "https://tianming332.github.io/Tian_vidos/video_list_A.json", 
    "https://tianming332.github.io/Tian_vidos/video_list_B.json",
    // 未来如果增加，则添加 "https://tianming332.github.io/Tian_vidos/video_list_C.json", 
];

// 用于存储当前加载的视频数据 (此变量由 app.js 动态填充)
let videoData = [];