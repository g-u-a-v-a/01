
import { Candle, StockData, SwingAnalysis, Timeframe, InstitutionalDaily, ValuationData, AnalysisReport } from '../types';
import * as Tech from '../utils/math';

// --- Static Database of Popular Taiwan Stocks with Reference Prices (Approx. 2024/2025 Levels) ---
export const TAIWAN_STOCK_LIST = [
  { code: '2330', name: '台積電', refPrice: 1040 }, 
  { code: '2317', name: '鴻海', refPrice: 205 }, 
  { code: '2454', name: '聯發科', refPrice: 1250 },
  { code: '2303', name: '聯電', refPrice: 53 }, 
  { code: '2308', name: '台達電', refPrice: 395 }, 
  { code: '2382', name: '廣達', refPrice: 280 },
  { code: '3231', name: '緯創', refPrice: 108 }, 
  { code: '6669', name: '緯穎', refPrice: 2450 }, 
  { code: '3711', name: '日月光投控', refPrice: 155 },
  { code: '3008', name: '大立光', refPrice: 2750 }, 
  { code: '3034', name: '聯詠', refPrice: 530 }, 
  { code: '2379', name: '瑞昱', refPrice: 490 },
  { code: '3037', name: '欣興', refPrice: 175 }, 
  { code: '2357', name: '華碩', refPrice: 580 }, 
  { code: '2353', name: '宏碁', refPrice: 42 },
  { code: '2603', name: '長榮', refPrice: 215 }, 
  { code: '2609', name: '陽明', refPrice: 72 }, 
  { code: '2615', name: '萬海', refPrice: 88 },
  { code: '2618', name: '長榮航', refPrice: 36 }, 
  { code: '2610', name: '華航', refPrice: 22 },
  { code: '2881', name: '富邦金', refPrice: 92 }, 
  { code: '2882', name: '國泰金', refPrice: 66 }, 
  { code: '2891', name: '中信金', refPrice: 36 },
  { code: '2886', name: '兆豐金', refPrice: 41 }, 
  { code: '2884', name: '玉山金', refPrice: 28.5 }, 
  { code: '5880', name: '合庫金', refPrice: 26.5 },
  { code: '1301', name: '台塑', refPrice: 48 }, 
  { code: '1303', name: '南亞', refPrice: 43 }, 
  { code: '1326', name: '台化', refPrice: 39 },
  { code: '6505', name: '台塑化', refPrice: 52 }, 
  { code: '2002', name: '中鋼', refPrice: 22.5 }, 
  { code: '1101', name: '台泥', refPrice: 32 },
  { code: '1102', name: '亞泥', refPrice: 45 }, 
  { code: '2207', name: '和泰車', refPrice: 680 }, 
  { code: '2912', name: '統一超', refPrice: 285 },
  { code: '1216', name: '統一', refPrice: 86 }, 
  { code: '9910', name: '豐泰', refPrice: 155 }, 
  { code: '9921', name: '巨大', refPrice: 195 },
  { code: '0050', name: '元大台灣50', refPrice: 58.5 }, 
  { code: '0056', name: '元大高股息', refPrice: 39 }, 
  { code: '00878', name: '國泰永續高股息', refPrice: 23 },
  { code: '00929', name: '復華台灣科技優息', refPrice: 19.5 }, 
  { code: '00919', name: '群益台灣精選高息', refPrice: 24 }
];

// --- Specific Report Database (Real Info) ---
const STOCK_DETAILS_DB: Record<string, { highlights: string, fundamentals: string }> = {
    // === SEMICONDUCTOR ===
    '2330': {
        highlights: '【晶圓代工龍頭】全球市佔率超過60%，擁有絕對定價權。受惠於 AI 晶片需求強勁，3nm 製程產能利用率滿載，且 CoWoS 先進封裝產能持續擴充，預期未來五年營收年複合成長率 (CAGR) 維持 15-20% 高標。',
        fundamentals: '財務結構極為強健，毛利率長期維持在 53% 以上高水準。自由現金流充裕，足以支撐高額資本支出與穩定配息。'
    },
    '2303': {
        highlights: '【成熟製程霸主】專注於特殊製程技術，在 22/28nm 製程具備高競爭力。近期受惠於車用電子與工業自動化需求回溫，加上地緣政治因素推動供應鏈在地化，產能利用率維持穩健。',
        fundamentals: '透過靈活的定價策略維持獲利，現金殖利率優於同業。折舊壓力隨新廠量產逐步減輕，獲利結構改善。'
    },
    '2454': {
        highlights: '【IC設計領航者】手機晶片天璣 9400 效能對標高通，成功打入多家陸系與韓系旗艦供應鏈。積極佈局 Edge AI、WiFi 7 及車用電子 (Dimensity Auto)，非手機業務成長動能強勁。',
        fundamentals: 'IC 設計產業高獲利資優生，毛利率長期維持 45-50%。現金股利配發率高，為典型的高殖利率成長股。'
    },
    '3711': {
        highlights: '【封測龍頭】全球最大半導體封測廠，技術涵蓋 SiP 與先進封裝。受惠 AI 晶片對 Heterogeneous Integration (異質整合) 需求大增，高階測試與封裝訂單能見度高。',
        fundamentals: '營收規模龐大且多元，有效分散單一客戶風險。自動化產線比例提升，有助於優化營業利益率。'
    },
    '3034': {
        highlights: '【驅動IC大廠】OLED 驅動 IC滲透率提升，加上車用面板大尺寸化趨勢，帶動高階產品出貨。積極開發 AR/VR 顯示技術，為元宇宙商機潛在受惠者。',
        fundamentals: '零負債經營，現金部位龐大。雖面板產業有週期性，但公司透過產品組合調整，獲利波動相對同業穩定。'
    },
    '2379': {
        highlights: '【網通IC指標】受惠各國基建升級與 WiFi 7 換機潮，網路晶片需求強勁。車用乙太網路晶片打入歐美車廠供應鏈，開闢新成長曲線。',
        fundamentals: '研發實力堅強，產品迭代速度快。長年維持高配息政策，財務體質健全。'
    },

    // === AI / SERVER / PC ===
    '2317': {
        highlights: '【EMS 龍頭】近期轉型有成，獨家供應 NVIDIA GB200 AI 伺服器機櫃，預計大幅挹注營收。電動車 (Model C) 開始量產交付，且與 Apple 關係穩固，iPhone 高階機種訂單份額穩定。',
        fundamentals: '「三率三升」策略逐步發酵，毛利率有望突破 6%。雲端網路與元件產品佔比提升，有效優化產品組合，獲利結構轉佳。'
    },
    '3231': {
        highlights: '【AI 伺服器黑馬】積極轉型，出售虧損部門，專注高毛利的 AI 與車用運算。作為 NVIDIA GPU 基板 (Baseboard) 主要供應商，評價獲得市場重新定位 (Re-rating)。',
        fundamentals: '轉型後毛利率逐季跳升，獲利品質大幅改善。EPS 成長性顯著優於同業。'
    },
    '2382': {
        highlights: '【雲端伺服器首選】與 Google、Meta、Amazon 等 CSP (雲端服務供應商) 關係緊密，MGX 架構伺服器出貨動能強勁。車用電子業務亦逐步開花結果，打造雙成長引擎。',
        fundamentals: '經營風格穩健，受惠 AI 伺服器佔比提升，毛利率與營益率雙雙創下近年新高。財務體質健全。'
    },
    '6669': {
        highlights: '【純種雲端飆股】專注於超大型資料中心 (Hyperscale Data Center) 解決方案，主要客戶為微軟與 Meta。AI 專案佔比快速拉升，採用獨特 ODM Direct 商業模式，營運效率極高。',
        fundamentals: '高價股中罕見的高成長標的，ROE 長期維持在 20% 以上。雖股本小，但獲利爆發力驚人。'
    },
    '2308': {
        highlights: '【電源與綠能】全球電源供應器龍頭，AI 伺服器電源與散熱解決方案具備技術領先優勢。積極佈局電動車充電樁與儲能系統，搭上全球淨零碳排趨勢。',
        fundamentals: '品牌價值高，產品線分散且具互補性。毛利率穩定維持在 30% 左右，為穩定成長的績優白馬股。'
    },
    '3037': {
        highlights: '【載板龍頭】ABF 載板產能全球數一數二，受惠 AI 與 HPC 晶片封裝面積變大、層數變多，高階載板需求緊俏。積極擴廠以滿足未來幾年的強勁需求。',
        fundamentals: '折舊高峰期已過，隨著新產能開出與良率提升，毛利率有顯著回升空間。'
    },
    '2357': {
        highlights: '【板卡與AI PC】電競筆電與主機板市佔率穩固。積極推出 AI PC 搶市，並擁有強大的伺服器事業群，為少數具備品牌與代工雙引擎的電腦大廠。',
        fundamentals: '庫存去化已至健康水位。品牌溢價能力強，營運現金流穩定。'
    },

    // === OPTICS ===
    '3008': {
        highlights: '【光學鏡頭王者】受惠於 iPhone 導入潛望式鏡頭 (Periscope Lens) 及規格升級，加上 Android 陣營重啟鏡頭競賽，產能利用率回升。擁有龐大的專利護城河。',
        fundamentals: '毛利率極高 (約 50%)，為精密光學產業指標。公司零負債經營，現金流強勁。'
    },

    // === SHIPPING ===
    '2603': {
        highlights: '【航運巨頭】受紅海危機影響，運價指數 (SCFI) 維持高檔。擁有業界最大規模的脫硫塔船隊與新造節能船，成本控制優於同業。Ocean Alliance 聯盟運作穩定，歐美長程線具競爭力。',
        fundamentals: '帳上現金滿盈，每股淨值大幅提升。目前本益比 (PE) 相對低，且具備高殖利率題材。'
    },
    '2609': {
        highlights: '【官股航運】全球運力排名第九，隸屬 THE Alliance 聯盟。持續優化船隊結構，淘汰老舊船舶以提升燃油效率。與長榮相比，股本較小，股價波動度較高。',
        fundamentals: '財務結構改善顯著，負債比大幅降低。受惠運價上漲，獲利能力維持高檔。'
    },
    '2615': {
        highlights: '【亞洲航線王】深耕亞洲近洋航線，並靈活調度遠洋航線。受惠供應鏈移轉至東南亞，區域內貨運需求暢旺。營運彈性大，能快速應對市場變化。',
        fundamentals: '股利配發大方，深受存股族喜愛。需留意近洋航線競爭加劇風險。'
    },
    '2618': {
        highlights: '【航空獲利王】客運復甦力道強勁，票價維持高檔。貨運部分受惠於 AI 伺服器與電商空運需求，機腹載貨收益豐厚。機隊年輕化，燃油效率佳。',
        fundamentals: '獲利創歷史新高，擺脫疫情陰霾。現金流轉正，負債比逐年下降。'
    },
    '2610': {
        highlights: '【貨運強權】擁有龐大的全貨機機隊 (747F/777F)，在半導體與精密儀器運輸具備優勢。客運受惠日韓與兩岸航線增班，載客率回升。',
        fundamentals: '受油價波動影響較大，但透過燃油避險與高運價轉嫁，獲利仍具韌性。'
    },

    // === FINANCE ===
    '2881': {
        highlights: '【金控獲利王】旗下富邦人壽投資收益亮眼，且銀行端淨利差維持高檔。受惠於降息預期，債券部位評價回升。防疫保單理賠影響已完全消除，獲利重回高成長軌道。',
        fundamentals: 'ROE 長期居金控之冠。資本適足率 (BIS) 與壽險 RBC 皆高於法定標準。併購日盛金後綜效顯現。'
    },
    '2882': {
        highlights: '【壽險巨擘】國泰人壽擁有龐大投資部位，對利率敏感度高，降息循環將帶來巨額資本利得。國泰世華銀行數位金融轉型成功，手續費收入成長強勁。',
        fundamentals: '資產規模全台第一。隱含價值 (EV) 高，股價長期低於 EV，具價值重估空間。'
    },
    '2891': {
        highlights: '【消費金融龍頭】信用卡與個人信貸市佔率領先，擁有強大的零售客戶基礎。海外佈局完整，獲利來源多元化，較不受單一市場波動影響。',
        fundamentals: '營收與獲利穩定性高。配息政策穩定，為外資長期持有的核心金融股。'
    },
    '2886': {
        highlights: '【外匯龍頭】受惠台美利差擴大，換匯交易 (SWAP) 收益豐厚。美元資產部位大，為強勢美元受惠股。公股背景穩健，風險控管嚴格。',
        fundamentals: '獲利穩健，配息大方且穩定，為官股金控中的績優生。'
    },
    '2884': {
        highlights: '【數位金融先驅】以科技導向著稱，信用卡與數位帳戶深受年輕族群喜愛。ESG 評比優異，吸引永續基金資金進駐。獲利成長動能主要來自手續費與財富管理。',
        fundamentals: '資產品質極佳，逾放比長期低於同業平均。配息政策以股票股利搭配現金，有利於複利效果。'
    },
    '5880': {
        highlights: '【房貸龍頭】國內房貸與土建融市佔率高。受惠於房市剛性需求，放款餘額穩定成長。公股背景濃厚，經營策略保守穩健。',
        fundamentals: '資產品質穩健，獲利波動度低。殖利率長期優於定存，適合保守型投資人。'
    },

    // === OLD ECONOMY ===
    '1301': {
        highlights: '【塑化龍頭】產品線涵蓋 PVC、PE、PP 等大宗物資。近期雖受中國產能開出影響，但積極佈局高值化產品與半導體化學品，力求轉型。',
        fundamentals: '財務底氣深厚，轉投資收益 (台塑化、南亞科) 豐厚。目前股價處於週期性底部 (PB < 1)，具長線佈局價值。'
    },
    '2002': {
        highlights: '【鋼鐵龍頭】致力於開發高品級鋼材 (如電動車馬達電磁鋼片)，擺脫紅海競爭。受惠基礎建設與災後重建需求，鋼價有望築底回升。',
        fundamentals: '配息穩定，為中鋼特有的股東會紀念品文化增添話題。近年推動減碳製程，符合國際 ESG 規範。'
    },
    '1101': {
        highlights: '【水泥與綠能】積極轉型綠能產業，收購歐洲儲能公司 NHOA，並投入電池芯製造 (能元科技)。水泥本業透過循環經濟降低成本，維持獲利。',
        fundamentals: '轉型陣痛期已過，綠能營收佔比逐年提升。高殖利率題材仍在。'
    },
    '2207': {
        highlights: '【車市龍頭】代理 Toyota 與 Lexus 品牌，市佔率長年稱霸全台。轉投資和潤 (租賃) 與和運 (租車) 獲利貢獻顯著，形成完整的移動生態系。',
        fundamentals: '獲利能力驚人，EPS 經常超過 20 元。現金流強勁，配息大方。'
    },
    '1216': {
        highlights: '【食品巨頭】擁有統一超商 (7-11) 小金雞，通路優勢無人能敵。併購家樂福後，補足量販與超市版圖，成為全通路霸主。本業食品抗通膨能力強。',
        fundamentals: '營收規模持續創高，獲利穩定性極佳。為典型的防禦型成長股，適合做為投資組合的核心配置。'
    },
    '9921': {
        highlights: '【自行車龍頭】受惠 e-bike (電動輔助自行車) 滲透率提升，產品單價 (ASP) 提高。庫存去化接近尾聲，歐美市場需求逐步回溫。',
        fundamentals: '全球品牌知名度高。獲利受匯率影響較大，但本業競爭力強勁。'
    },

    // === ETF ===
    '0050': {
        highlights: '【市值型首選】追蹤台灣市值前 50 大公司，與台股大盤連動性極高。其中台積電佔比近 50%，為參與台股長期成長最簡單的工具。',
        fundamentals: '費用率低，流動性極佳。適合定期定額長期持有，享受市場平均報酬。'
    },
    '0056': {
        highlights: '【高股息始祖】預測未來一年現金股利殖利率最高的 50 檔股票。納入 AI 概念股後，兼具股息與資本利得潛力。',
        fundamentals: '配息穩定，填息紀錄佳。規模龐大，為存股族首選。'
    },
    '00878': {
        highlights: '【ESG高股息】追蹤 MSCI 台灣 ESG 永續高股息精選 30 指數，重視企業永續經營表現。持股產業分佈較為平均，波動度相對較低。',
        fundamentals: '季配息機制深受投資人喜愛，規模成長迅速。'
    },
    '00929': {
        highlights: '【月配息科技】專注於科技類股的高股息 ETF，採月配息機制，提供穩定的現金流。持股集中在電子產業，爆發力強。',
        fundamentals: '填息速度快，適合偏好科技股且需要每月現金流的投資人。'
    }
};

// --- Helper Functions for Randomized Text Generation (For Stocks NOT in DB) ---

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomizedSectorReport = (name: string, code: string, sectorType: 'TECH' | 'FINANCE' | 'OLD' | 'GENERIC') => {
    // 1. Business Profiles
    const bizProfiles = {
        TECH: [
            `隸屬於電子科技產業鏈，專注於關鍵零組件的研發與製造，在特定利基市場擁有高市佔率。`,
            `為全球供應鏈的重要一環，主要提供高端電子產品之設計與生產服務，客戶涵蓋國際一線大廠。`,
            `深耕半導體與光電領域多年，具備垂直整合優勢，能快速響應下游客戶的客製化需求。`,
            `致力於消費性電子與網通產品的技術創新，近期積極切入車用電子與 AIoT 應用市場。`
        ],
        FINANCE: [
            `核心業務涵蓋企業金融、消費金融與財富管理，擁有綿密的實體通路與數位服務平台。`,
            `以穩健經營著稱的金融機構，深耕國內市場並積極佈局海外據點，提供全方位的金融解決方案。`,
            `主要收益來自利息淨收益與手續費收入，近年來積極推動數位轉型，優化客戶體驗與營運效率。`
        ],
        OLD: [
            `為該產業的指標性廠商，產品廣泛應用於基礎建設與民生消費，與總體經濟景氣連動性高。`,
            `擁有悠久的品牌歷史與穩固的通路優勢，在本業上具備規模經濟效益，現金流穩定。`,
            `專注於原物料加工與製造，透過製程優化與成本控管維持競爭力，並積極投入環保轉型。`
        ],
        GENERIC: [
            `在該領域深耕多年，擁有穩定的客戶基礎與技術實力，為市場中不可或缺的供應商。`,
            `營運模式成熟，產品線多元，能有效分散單一市場波動風險，維持穩健成長。`
        ]
    };

    // 2. Investment Highlights (Catalysts)
    const catalysts = {
        TECH: [
            `受惠於 AI 與高效能運算 (HPC) 趨勢，高階產品訂單能見度已達明年，營收動能強勁。`,
            `庫存去化已至健康水位，隨著終端需求回溫，產能利用率逐步提升，毛利率有望止跌回升。`,
            `新產品順利通過客戶驗證，預計下半年開始放量出貨，將成為未來兩年的主要成長引擎。`,
            `積極佈局車用市場有成，打入歐美一線車廠供應鏈，產品組合優化帶動獲利結構改善。`
        ],
        FINANCE: [
            `受惠於利差維持高檔，核心獲利能力穩健。資產品質優良，逾放比維持在低檔水準。`,
            `財富管理業務手續費收入成長顯著，加上投資收益回穩，整體獲利表現優於預期。`,
            `資本適足率強健，具備發放高股息的實力，為防禦型投資的首選標的。`
        ],
        OLD: [
            `原物料價格回穩，利差擴大帶動獲利回升。加上旺季效應加持，營運展望樂觀。`,
            `具備高殖利率題材，且股價淨值比 (PB) 處於歷史相對低檔，下檔風險有限，吸引長線資金佈局。`,
            `積極推動資產活化與多角化經營，轉投資收益逐漸顯現，為營運增添新動能。`
        ],
        GENERIC: [
            `近期營運表現穩健，公司積極管控成本與費用，獲利能力優於同業平均。`,
            `持續投入研發與市場拓展，新客戶開發有成，訂單量穩步增長。`
        ]
    };

    // 3. Fundamentals
    const fundPhrases = [
        `財務體質健全，負債比率控制得宜。自由現金流充沛，具備長期穩定配息的能力。`,
        `營收規模持續擴大，且營業利益率呈現上升趨勢，顯示本業獲利能力轉強。`,
        `資產結構紮實，流動比率與速動比率皆高於安全標準，短期償債能力無虞。`,
        `過往獲利紀錄穩定，即使面對景氣波動仍能維持獲利，展現強大的經營韌性。`,
        `ROE (股東權益報酬率) 維持在穩健水準，管理層重視股東權益，經營績效備受肯定。`
    ];

    const typeKey = sectorType as keyof typeof bizProfiles;
    
    // Assemble the text
    const profile = getRandom(bizProfiles[typeKey]);
    const highlight = getRandom(catalysts[typeKey]);
    const fundamental = getRandom(fundPhrases);

    return {
        highlights: `【業務概覽】${name} ${profile}\n\n【投資亮點】${highlight}`,
        fundamentals: fundamental
    };
};

export const searchStockSuggestions = (query: string) => {
  if (!query) return [];
  const q = query.toUpperCase();
  return TAIWAN_STOCK_LIST.filter(s => s.code.includes(q) || s.name.includes(q)).slice(0, 8);
};

// --- Existing Logic ---

const generateRandomWalk = (startPrice: number, count: number, timeframe: Timeframe, targetEndPrice?: number): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  
  // Determine volatility and time step based on timeframe
  let volatility = 0.02;
  let timeStepMS = 24 * 60 * 60 * 1000; // Default 1 Day
  
  if (timeframe.includes('m')) {
    volatility = 0.005; // Lower volatility for minutes
    const minutes = parseInt(timeframe.replace('m', ''));
    timeStepMS = minutes * 60 * 1000;
  } else if (timeframe === 'W') {
    volatility = 0.05;
    timeStepMS = 7 * 24 * 60 * 60 * 1000;
  } else if (timeframe === 'M') {
    volatility = 0.10;
    timeStepMS = 30 * 24 * 60 * 60 * 1000;
  }

  // Start Date
  const now = new Date();
  const startTime = now.getTime() - (count * timeStepMS);

  // 1. Generate Raw Path
  for (let i = 0; i < count; i++) {
    const timestamp = startTime + (i * timeStepMS);
    const dateObj = new Date(timestamp);
    
    let dateStr = '';
    if (timeframe.includes('m')) {
        // MM-DD HH:mm
        const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const dd = dateObj.getDate().toString().padStart(2, '0');
        const hh = dateObj.getHours().toString().padStart(2, '0');
        const min = dateObj.getMinutes().toString().padStart(2, '0');
        dateStr = `${mm}-${dd} ${hh}:${min}`;
    } else {
        // YYYY-MM-DD
        dateStr = dateObj.toISOString().split('T')[0];
    }

    const change = currentPrice * volatility * (Math.random() - 0.5) * 2;
    
    let open = currentPrice;
    let close = currentPrice + change;
    let high = Math.max(open, close) + Math.random() * currentPrice * (volatility/2);
    let low = Math.min(open, close) - Math.random() * currentPrice * (volatility/2);
    let volume = Math.floor(1000 + Math.random() * 50000); 

    candles.push({
      date: dateStr,
      open, high, low, close, volume
    });
    currentPrice = close;
  }

  // 2. Adjust path if targetEndPrice is set (to make data look realistic to current price)
  if (targetEndPrice && candles.length > 0) {
      const finalClose = candles[candles.length - 1].close;
      const ratio = targetEndPrice / finalClose;
      
      return candles.map(c => ({
          ...c,
          open: c.open * ratio,
          high: c.high * ratio,
          low: c.low * ratio,
          close: c.close * ratio
      }));
  }

  return candles;
};

const enrichData = (candles: Candle[]): Candle[] => {
  const ma5 = Tech.calculateSMA(candles, 5);
  const ma10 = Tech.calculateSMA(candles, 10);
  const ma20 = Tech.calculateSMA(candles, 20);
  const ma60 = Tech.calculateSMA(candles, 60);
  const ma120 = Tech.calculateSMA(candles, 120);
  const ma240 = Tech.calculateSMA(candles, 240);
  const rsi6 = Tech.calculateRSI(candles, 6);
  const rsi14 = Tech.calculateRSI(candles, 14);
  const psy12 = Tech.calculatePSY(candles, 12);
  const psy24 = Tech.calculatePSY(candles, 24);
  const bb = Tech.calculateBollinger(candles, 20, 2);
  const macd = Tech.calculateMACD(candles);
  const kd = Tech.calculateKD(candles, 9);
  const atr = Tech.calculateATR(candles, 14);
  const mom = Tech.calculateMomentum(candles, 10);

  return candles.map((c, i) => ({
    ...c,
    ma5: ma5[i],
    ma10: ma10[i],
    ma20: ma20[i],
    ma60: ma60[i],
    ma120: ma120[i],
    ma240: ma240[i],
    upperBand: bb.upper[i],
    lowerBand: bb.lower[i],
    middleBand: bb.sma[i],
    rsi6: rsi6[i],
    rsi14: rsi14[i],
    psy12: psy12[i],
    psy24: psy24[i],
    macd: macd.macdLine[i],
    signal: macd.signalLine[i],
    hist: macd.hist[i],
    k: kd.k[i],
    d: kd.d[i],
    atr: atr[i],
    momentum: mom[i]
  }));
};

const calculateSwingAnalysis = (last: Candle, techScore: number): SwingAnalysis => {
  const atr = last.atr || (last.close * 0.02);
  const volatility = atr * 1.5;
  
  const supportLevel = last.ma20 || last.close * 0.95;
  const entryPrice = last.close > supportLevel ? supportLevel * 1.01 : last.close;
  const targetPrice = entryPrice + (volatility * 3);
  const stopLossPrice = supportLevel * 0.96;

  let sentiment: SwingAnalysis['mainForceSentiment'] = 'Neutral';
  let strategyText = '';

  if (techScore > 75) {
    sentiment = 'Strong Buy';
    strategyText = '主力籌碼集中，均線多頭，適合順勢操作，目標價看高。';
  } else if (techScore > 55) {
    sentiment = 'Buy';
    strategyText = '底部逐漸墊高，主力低接意願強，可沿支撐佈局。';
  } else if (techScore < 30) {
    sentiment = 'Sell';
    strategyText = '主力調節明顯，上方套牢賣壓重，建議反彈減碼。';
  } else {
    sentiment = 'Neutral';
    strategyText = '主力觀望中，箱型區間震盪，建議區間操作。';
  }

  return {
    mainForceSentiment: sentiment,
    mainForceScore: techScore + (Math.random() * 10 - 5),
    entryPrice: parseFloat(entryPrice.toFixed(2)),
    targetPrice: parseFloat(targetPrice.toFixed(2)),
    stopLossPrice: parseFloat(stopLossPrice.toFixed(2)),
    strategyText
  };
};

const generateInstitutionalData = (count: number, trend: 'up' | 'down' | 'neutral'): InstitutionalDaily[] => {
  const result: InstitutionalDaily[] = [];
  const now = new Date();
  
  for(let i=0; i<count; i++) {
     const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
     const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');
     
     // Base random
     let base = 500; 
     if (trend === 'up') base = 2000;
     if (trend === 'down') base = -2000;

     const foreign = Math.floor(Math.random() * 5000 + base - 2500);
     const trust = Math.floor(Math.random() * 2000 + (base/2) - 1000);
     const dealer = Math.floor(Math.random() * 1000 + (base/4) - 500);
     
     result.push({
        date: dateStr,
        foreign,
        trust,
        dealer,
        total: foreign + trust + dealer
     });
  }
  return result;
};

const calculateValuation = (price: number): ValuationData => {
   // Randomize EPS based on price roughly (PE ~10-30)
   const eps = parseFloat((price / (15 + Math.random() * 10)).toFixed(2));
   const pe = parseFloat((price / eps).toFixed(2));
   const yieldRate = parseFloat(((Math.random() * 4) + 1).toFixed(2)); // 1% - 5%

   return {
      eps,
      pe,
      yield: yieldRate,
      levels: [
         { name: '大特價', multiple: 12, price: parseFloat((eps * 12).toFixed(1)), color: 'text-twGreen' },
         { name: '便宜價', multiple: 15, price: parseFloat((eps * 15).toFixed(1)), color: 'text-twGreen' },
         { name: '合理價', multiple: 20, price: parseFloat((eps * 20).toFixed(1)), color: 'text-yellow-400' },
         { name: '昂貴價', multiple: 25, price: parseFloat((eps * 25).toFixed(1)), color: 'text-twRed' },
         { name: '瘋狂價', multiple: 28, price: parseFloat((eps * 28).toFixed(1)), color: 'text-twRed' },
      ]
   };
};

const generateDetailedReport = (name: string, code: string, price: number, swing: SwingAnalysis): AnalysisReport => {
    // 1. Try to get specific data from database
    const cleanCode = code.replace('.TW', '');
    let specificInfo = STOCK_DETAILS_DB[cleanCode];

    // 2. Fallback logic: Generate randomized unique report if not in DB
    if (!specificInfo) {
        let sectorType: 'TECH' | 'FINANCE' | 'OLD' | 'GENERIC' = 'GENERIC';
        if (code.startsWith('28') || code.startsWith('58')) sectorType = 'FINANCE';
        else if (code.startsWith('26') || code.startsWith('13') || code.startsWith('20') || code.startsWith('11')) sectorType = 'OLD';
        else if (code.startsWith('23') || code.startsWith('24') || code.startsWith('3') || code.startsWith('6')) sectorType = 'TECH';
        
        specificInfo = generateRandomizedSectorReport(name, code, sectorType);
    }

    return {
       highlights: specificInfo.highlights,
       fundamentals: specificInfo.fundamentals,
       // Dynamic Technical Analysis (Still generated by algo as it changes daily)
       techAnalysis: `觀察 ${name} 近期的股價走勢，目前處於 ${swing.mainForceSentiment === 'Strong Buy' ? '強勢多頭' : '整理'} 階段。均線排列顯示 ${swing.mainForceSentiment === 'Sell' ? '短期壓力較大，需留意回檔風險' : '下方支撐強勁，多頭架構未變'}。RSI 與 KD 指標顯示${swing.mainForceScore > 70 ? '動能強勁' : '目前處於區間震盪'}。`,
       chipsAnalysis: `籌碼面分析顯示，近期${name}${swing.mainForceScore > 60 ? '獲法人資金青睞，外資與投信同步站在買方' : '法人態度觀望，呈現土洋對作或調節態勢'}。${swing.mainForceScore > 60 ? '大戶持股比例增加，籌碼趨於集中。' : '須留意融資餘額變化，觀察散戶指標是否過熱。'}`,
       bullStrategy: `對於看好 ${name} 長期發展的投資者，建議在股價拉回至月線或 ${swing.stopLossPrice} 元支撐附近時觀察量縮止穩訊號，採分批佈局策略。若能帶量突破 ${swing.targetPrice} 元，則可視為波段攻擊訊號。`,
       bearStrategy: `短線操作者需嚴守紀律，留意 ${swing.stopLossPrice} 元關鍵支撐。若跌破且三日內未能站回，顯示趨勢轉弱，建議執行停損或減碼。在法人未明顯回補前，避免過度追高。`,
       keySupport: swing.stopLossPrice,
       keyResistance: swing.targetPrice
    };
};

const analyzeStock = (candles: Candle[], code: string, name: string): StockData => {
  const enriched = enrichData(candles);
  const last = enriched[enriched.length - 1];
  const prev = enriched[enriched.length - 2];
  
  const tags: string[] = [];
  let techScore = 50;

  if (last.ma20 && last.ma60 && last.ma120) {
    if (last.close > last.ma20 && last.ma20 > last.ma60 && last.ma60 > last.ma120) {
      tags.push('多頭排列');
      techScore += 20;
    } else if (last.close < last.ma20 && last.ma20 < last.ma60) {
      techScore -= 10;
    }
  }

  if (last.rsi14) {
    if (last.rsi14 > 50 && last.rsi14 < 70) {
      techScore += 10;
      tags.push('動能健康');
    } else if (last.rsi14 > 75) {
      tags.push('RSI過熱');
      techScore -= 5; 
    } else if (last.rsi14 < 30) {
      tags.push('超賣');
      techScore += 5; 
    }
  }

  if (last.hist && prev.hist) {
    if (last.hist > 0 && last.hist > prev.hist) {
      tags.push('MACD增強');
      techScore += 5;
    }
  }

  if (last.psy12) {
    if (last.psy12 > 75) tags.push('PSY過熱');
    if (last.psy12 < 25) tags.push('PSY極度恐慌');
  }

  if (last.upperBand && last.lowerBand && last.middleBand) {
    const width = (last.upperBand - last.lowerBand) / last.middleBand;
    if (width < 0.10) {
      tags.push('布林壓縮');
      techScore += 5;
    }
    if (last.close > last.upperBand) {
      tags.push('突破上軌');
      techScore += 10;
    }
  }

  const aiSummary = `
    ${tags.includes('多頭排列') ? '均線呈現完美多頭排列，長期趨勢向上。' : '均線糾結或空頭，趨勢尚不明朗。'}
    ${last.rsi14 && last.rsi14 > 70 ? '短線RSI過熱，須留意乖離過大修正。' : 'RSI位於健康區間。'}
    ${last.psy12 && last.psy12 > 75 ? '心理線顯示市場情緒極度樂觀，追價風險高。' : ''}
    ${last.close > (last.ma20 || 0) ? '股價站穩月線之上，支撐強勁。' : '股價跌破月線，整理時間恐拉長。'}
  `.trim();

  let aiRecommendation: 'BUY' | 'NEUTRAL' | 'SELL' = 'NEUTRAL';
  let aiAction = '觀望，等待更明確訊號。';
  let finalTechScore = Math.min(100, Math.max(0, techScore));

  if (finalTechScore >= 75) {
    aiRecommendation = 'BUY';
    aiAction = '趨勢強勁，可逢回分批佈局，沿5日線操作。';
  } else if (finalTechScore <= 40) {
    aiRecommendation = 'SELL';
    aiAction = '空頭趨勢明顯，建議減碼或反彈調節。';
  } else {
    aiAction = '區間震盪，低買高賣或等待突破。';
  }

  const change = last.close - prev.close;
  const changePercent = (change / prev.close) * 100;
  const swing = calculateSwingAnalysis(last, finalTechScore);
  const institutional = generateInstitutionalData(5, aiRecommendation === 'BUY' ? 'up' : aiRecommendation === 'SELL' ? 'down' : 'neutral');
  const valuation = calculateValuation(last.close);
  const report = generateDetailedReport(name, code, last.close, swing);

  return {
    code,
    name,
    price: parseFloat(last.close.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    data: enriched,
    tags,
    techScore: finalTechScore,
    fundScore: Math.floor(Math.random() * 40) + 40,
    totalScore: 0, 
    aiSummary,
    aiRecommendation,
    aiAction,
    swing,
    institutional,
    valuation,
    report
  };
};

// Create a specific stock on demand (Fixes the "Always TSMC" issue)
export const createMockStock = (code: string, name?: string): StockData => {
  // Try to find real name from database if not provided
  let finalName = name || '個股';
  const dbMatch = TAIWAN_STOCK_LIST.find(s => s.code === code || code.includes(s.code));
  let refPrice = undefined;

  if (dbMatch) {
    finalName = dbMatch.name;
    refPrice = dbMatch.refPrice;
    // Ensure code format
    if (!code.includes('.TW')) code = `${dbMatch.code}.TW`;
  } else {
    if (!code.includes('.TW')) code = `${code}.TW`;
  }

  const startPrice = refPrice || (50 + Math.random() * 500);
  // Pass refPrice as targetEndPrice to calibrate the curve
  const candles = generateRandomWalk(startPrice, 200, 'D', refPrice);
  const stock = analyzeStock(candles, code, finalName);
  stock.totalScore = stock.techScore + (stock.fundScore * 0.5);
  return stock;
};

// Only used for the initial list
export const getMockStocks = (count: number): StockData[] => {
  const stocks: StockData[] = [];
  // Pick random from TAIWAN_STOCK_LIST
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(Math.random() * TAIWAN_STOCK_LIST.length);
    while(usedIndices.has(idx) && usedIndices.size < TAIWAN_STOCK_LIST.length) {
        idx = (idx + 1) % TAIWAN_STOCK_LIST.length;
    }
    usedIndices.add(idx);
    const item = TAIWAN_STOCK_LIST[idx];
    
    stocks.push(createMockStock(item.code, item.name));
  }
  return stocks.sort((a, b) => b.totalScore - a.totalScore);
};

// Helper to get data for specific timeframe (Simulation)
export const getMockDataForTimeframe = (code: string, name: string, timeframe: Timeframe): StockData => {
    // Try to find reference price
    const cleanCode = code.replace('.TW', '');
    const dbMatch = TAIWAN_STOCK_LIST.find(s => s.code === cleanCode);
    let refPrice = dbMatch?.refPrice;

    const startPrice = refPrice || (100 + Math.random() * 900);
    const count = timeframe.includes('m') ? 300 : 200;
    
    // Calibrate curve
    const candles = generateRandomWalk(startPrice, count, timeframe, refPrice);
    return analyzeStock(candles, code, name);
};
