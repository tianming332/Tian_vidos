// 存储所有外部视频列表 JSON 文件的完整 URL。
// 请将 URL 替换为您的主仓库中 video_list_A.json 和 video_list_B.json 的实际部署地址。
// 假设您的主页仓库是 tianming332.github.io/Tian_vidos
const videoSources = [
    "https://tianming332.github.io/Tian_vidos/video_list_A.json", 
    "https://tianming332.github.io/Tian_vidos/video_list_B.json",
    // 如果未来有更多视频，直接在这里添加新的 JSON 文件的 URL
];

// 用于存储当前加载的视频数据
let videoData = [];