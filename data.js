// 只登记已经上线并验证过的素材仓库。每个仓库最多加载 30 个视频。
// 新的视频库发布后，在 VIDEO_LIBRARIES 中追加它的真实仓库名和 Pages URL。
const VIDEOS_PER_LIBRARY = 30;
const VIDEO_LIBRARIES = [
    {
        repository: "Tian-Video-Assets",
        baseUrl: "https://tianming332.github.io/Tian-Video-Assets/videos/",
        count: 30
    }
];

const VIDEO_METADATA = [
    { title: "初号机雕塑合影 #01", description: "主题公园中巨大的初号机合影。" },
    { title: "新宿街头 #02", description: "新宿街头来来往往的人。" },
    { title: "新宿街头 #03", description: "新宿街头来来往往的车。" },
    { title: "港区水族馆 #04", description: "小鱼在蓝色灯光下穿梭，宁静梦幻。" },
    { title: "早春的东京塔 #05", description: "无叶的枝桠映衬着东京塔的静美。" },
    { title: "新宿街头 #06", description: "小灯笼点亮了巷子的烟火氛围。" },
    { title: "从高尾山看富士山 #07", description: "远远望着白雪覆盖的富士山。" },
    { title: "三眼外星人的头 #08", description: "在迪士尼乐园一口吃掉三眼外星人的头。" },
    { title: "秋天的高尾山 #09", description: "金黄树叶与屋檐的线条交织成温暖的秋景。" },
    { title: "四点半的小樽 #10", description: "海浪与独坐的人影构成宁静的画面。" },
    { title: "新宿的红绿灯 #11", description: "轰隆的列车声与喧闹的人群交织。" },
    { title: "厦门岛的阳光 #12", description: "透进门缝的光照亮了安静的房间。" },
    { title: "雷门前的中华街 #13", description: "名古屋乐高主题公园里，雷门前舞龙的人群。" },
    { title: "圣诞树广场夜景 #14", description: "明亮的圣诞树点亮了节日氛围。" },
    { title: "北海道之行 #15", description: "电车、列车、城市与摩天轮拼贴成独特画面。" },
    { title: "乐高浅草寺 #16", description: "名古屋乐高主题公园里的浅草寺。" },
    { title: "水族馆珊瑚微景观 #17", description: "柔软的珊瑚在蓝光下轻轻摇曳。" },
    { title: "兔子玩偶沐光 #18", description: "小兔子玩偶安静地晒着太阳。" },
    { title: "寺庙屋檐的钟与天空 #19", description: "古建筑屋檐与蓝天构成静谧画面。" },
    { title: "言叶之庭 #20", description: "新宿御苑里，一棵垂柳的倒影在水面轻轻晃动。" },
    { title: "金色芦苇 #21", description: "风吹起芦苇，带来柔和的秋意。" },
    { title: "新宿夜间大楼 #22", description: "灯光映照下的玻璃大楼格外醒目。" },
    { title: "乐高露天音乐节 #23", description: "小小模型再现热闹又生活化的街角。" },
    { title: "草地上的小乐高世界 #24", description: "迷你人物在绿草地上展开丰富的户外活动。" },
    { title: "玩偶整齐陈列墙 #25", description: "一整面墙的玩偶挂件排列成治愈画面。" },
    { title: "乐高城市广场摩托车表演 #26", description: "小人偶们在蓝色地面上忙碌而可爱。" },
    { title: "粉色章鱼玩偶 #27", description: "2024 年女子美术大学毕业展中的玩偶。" },
    { title: "深夜咖啡店外景 #28", description: "暖光从小店溢出，为夜晚增添温度。" },
    { title: "港口夕阳 #29", description: "迪士尼乐园里的欧洲风格港口景色。" },
    { title: "布偶堆的温馨角落 #30", description: "堆在一起的小布偶带来童真与治愈。" }
];

function buildVideoLibrary(library, libraryIndex) {
    const count = Math.min(Number(library.count) || VIDEOS_PER_LIBRARY, VIDEOS_PER_LIBRARY);
    return Array.from({ length: count }, (_, itemIndex) => {
        const globalIndex = libraryIndex * VIDEOS_PER_LIBRARY + itemIndex;
        const number = String(itemIndex + 1).padStart(2, "0");
        const metadata = VIDEO_METADATA[globalIndex] || {
            title: `AI视频 #${String(globalIndex + 1).padStart(2, "0")}`,
            description: "AI视频创作记录。"
        };

        return {
            src: `${library.baseUrl}vid_${number}.mp4`,
            title: metadata.title,
            description: metadata.description,
            repository: library.repository,
            libraryIndex
        };
    });
}

const videoLibraries = VIDEO_LIBRARIES.map(buildVideoLibrary);
