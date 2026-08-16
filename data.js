// 视频只从固定的 GitHub Pages 素材库读取；主体仓库不再依赖本地 videos 文件夹。
const VIDEO_ASSET_BASE = "https://tianming332.github.io/Tian-Video-Assets/";
const videoFile = number => VIDEO_ASSET_BASE + "vid_" + String(number).padStart(2, "0") + ".mp4";

const videoData = [
    { src: videoFile(1), title: "初号机雕塑合影 #01", description: "主题公园中巨大的初号机合影。" },
    { src: videoFile(2), title: "新宿街头 #02", description: "新宿街头来来往往的人。" },
    { src: videoFile(3), title: "新宿街头 #03", description: "新宿街头来来往往的车。" },
    { src: videoFile(4), title: "港区水族馆 #04", description: "小鱼在蓝色灯光下穿梭，宁静梦幻。" },
    { src: videoFile(5), title: "早春的东京塔 #05", description: "无叶的枝桠映衬着东京塔的静美。" },
    { src: videoFile(6), title: "新宿街头 #06", description: "小灯笼点亮了巷子烟火氛围。" },
    { src: videoFile(7), title: "从高尾山看富士山 #07", description: "远远望着白雪覆盖的富士山。" },
    { src: videoFile(8), title: "三眼外星人的头 #08", description: "在迪士尼乐园一口吃掉三眼外星人的头😰。" },
    { src: videoFile(9), title: "秋天的高尾山 #09", description: "金黄树叶与屋檐的线条交织成温暖的秋景。" },
    { src: videoFile(10), title: "4点半的小樽 #10", description: "海浪与独坐的人影构成宁静的画面。" },
    { src: videoFile(11), title: "新宿的红绿灯 #11", description: "轰隆隆的列车声和嘈杂的人群。" },
    { src: videoFile(12), title: "厦门岛的阳光 #12", description: "透进门缝的光照亮了安静的房间。" },
    { src: videoFile(13), title: "雷门前的中华街 #13", description: "名古屋乐高主题公园里雷门前舞着龙的中国人。" },
    { src: videoFile(14), title: "圣诞树广场夜景 #14", description: "迪士尼乐园明亮的圣诞树点亮了节日氛围。" },
    { src: videoFile(15), title: "北海道之行 #15", description: "电车、列车与城市摩天轮画面拼贴成独特视觉。" },
    { src: videoFile(16), title: "乐高浅草寺 #16", description: "名古屋乐高主题公园里的浅草寺。" },
    { src: videoFile(17), title: "水族馆珊瑚微景观 #17", description: "柔软的珊瑚在蓝光下轻轻摇曳。" },
    { src: videoFile(18), title: "兔子玩偶沐光 #18", description: "小兔子玩偶晒太阳。" },
    { src: videoFile(19), title: "寺庙屋檐的钟与天空 #19", description: "古建筑屋檐在蓝天之下，钟声环绕，格外静谧。" },
    { src: videoFile(20), title: "言叶之庭 #20", description: "新宿御苑里一棵垂树的倒影在平静的水面上轻轻晃动。" },
    { src: videoFile(21), title: "金色芦苇 #21", description: "风吹起芦苇，带来柔和的秋意。" },
    { src: videoFile(22), title: "新宿夜间大楼 #22", description: "灯光映照下的玻璃大楼格外醒目。" },
    { src: videoFile(23), title: "乐高露天音乐节 #23", description: "小小模型再现了热闹又生活化的街角。" },
    { src: videoFile(24), title: "草地上的小乐高世界 #24", description: "迷你人物在绿草地上展开丰富的户外活动。" },
    { src: videoFile(25), title: "玩偶整齐陈列墙 #25", description: "一整面墙的玩偶挂件排列成治愈画面。" },
    { src: videoFile(26), title: "乐高城市广场摩托车表演 #26", description: "小人偶们在蓝色地面上忙碌而可爱。" },
    { src: videoFile(27), title: "粉色章鱼玩偶 #27", description: "24女子美毕业展中的玩偶。" },
    { src: videoFile(28), title: "深夜咖啡店外景 #28", description: "暖光从小店溢出，给夜晚增添一丝温度。" },
    { src: videoFile(29), title: "港口夕阳 #29", description: "迪士尼乐园唯美的欧洲景色。" },
    { src: videoFile(30), title: "布偶堆的温馨角落 #30", description: "堆在一起的小布偶带来满满的童真和治愈。" },
    { src: videoFile(31), title: "影像记录 #31", description: "视频素材库中的影像记录。" },
    { src: videoFile(32), title: "影像记录 #32", description: "视频素材库中的影像记录。" },
    { src: videoFile(33), title: "影像记录 #33", description: "视频素材库中的影像记录。" }
];
