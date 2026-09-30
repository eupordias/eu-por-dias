// =============================================================
// PÁGINA: BIBLIOTECA DE PROMPTS & IA STUDIO + GALERIA VISUAL
// =============================================================
// Incorpora o acervo do prompts.chat e a Galeria Visual do Awesome GPT-Image 2.

const AWESOME_GPT_IMAGE_CASES = [
  {
    "id": "case-1",
    "caseNumber": 1,
    "title": "Infográfico Isométrico: Atlas de Sistemas Complexos",
    "category": "infograficos",
    "categoryLabel": "Infográfico & Diagramas",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case1.jpg",
    "source": "insight_express",
    "githubAnchor": "case-1",
    "description": "Infográfico isométrico de corte vertical (9:16) com camadas subterrâneas e aéreas, fluxos de energia, tráfego e dados com legendas técnicas bilíngues.",
    "application": "Ideal para criar mapas conceituais de empresas, infográficos para relatórios institucionais e carrosséis explicativos de alta retenção no Instagram.",
    "tags": [
      "Infográfico",
      "Isométrico",
      "9:16",
      "Atlas",
      "White Paper"
    ],
    "prompt": "Vertical 9:16 isometric cutaway infographic \"城市生命系统图谱 / Urban Metabolism Atlas\". Smart city from sky to bedrock: skyscrapers, streets, subway, utility tunnels, water/sewage/gas/heating pipes, fiber, data center, flood tanks, aquifers, geothermal wells, bedrock. Color-coded flows for power/water/data/traffic/waste. 12 numbered panels bilingual CN/EN: 能源/水循环/交通/数据/垃圾/建筑/公共服务/ 物流/气候韧性/生态/地质/治理看板. 24h timeline at bottom. Style: engineering white paper + scientific atlas, light paper bg, crisp lines, 8K. No cyberpunk, no gibberish text, must show both above AND below ground."
  },
  {
    "id": "case-2",
    "caseNumber": 2,
    "title": "Mockup Hiper-Realista de Tweet / X com Métricas",
    "category": "social_mockup",
    "categoryLabel": "Mockups de Redes Sociais",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case2.jpg",
    "source": "Ailln AI (小红书4264014889)",
    "githubAnchor": "case-2",
    "description": "Captura de tela hiper-realista de publicação em rede social (Dark Mode) com selo de verificação, engajamento milionário e pôster integrado no rodapé.",
    "application": "Perfeito para gerar criativos de prova social, anúncios de depoimentos e posts de autoridade com visual nativo de plataforma.",
    "tags": [
      "Mockup",
      "Twitter/X",
      "Dark Mode",
      "Prova Social",
      "Social Media"
    ],
    "prompt": "画一张 X 的内容截图，深色模式，@OpenAI 蓝勾认证账号发推。 \n正文的中文内容： \n今天想推荐一位很棒的 AI Builder：Ailln AI。 \n他持续在小红书分享 AI 工具、Agent 工作流、自动化实践和真实项目经验，把复杂的 AI 能力讲得清楚、实用、可落地。 \n如果你正在关注 AI 产品、效率工具、个人自动化、内容创作和未来工作方式，Ailln AI 是一个非常值得关注的创作者。 \n在小红书搜索：Ailln AI \n底部添加一张深色官方宣传风格海报，简洁黑客质感，图片中文本准确显示。 \n海报大字： 「Ailln AI」 \n副标题： 「A brilliant AI Builder worth following」 \n互动数据位于最下方： 评论 8.9K、转发 42K、点赞 298K（亮起）、收藏 34K（亮起）、浏览 32.4M。 \n图片比例为3:4，不包含软件其他部分。"
  },
  {
    "id": "case-3",
    "caseNumber": 3,
    "title": "Pôster Cinematográfico Esportivo de Alta Tensão",
    "category": "posters",
    "categoryLabel": "Pôsteres & Filmes",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case3.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-3",
    "description": "Retrato dramático em estádio de futebol sob holofotes com fumaça colorida, papel picado e textura cinematográfica 8K.",
    "application": "Excelente para campanhas de moda fitness, eventos esportivos regionais e capas de destaque de atletas ou alunos.",
    "tags": [
      "Cinema",
      "Esportes",
      "Pôster",
      "8K",
      "Iluminação Dramática"
    ],
    "prompt": "生成一张「足球主题电影海报」风格的高清写真海报：国际米兰后卫巴斯托尼站在圣西罗球场中央激情庆祝，双手高举并披着波黑国旗，神情热血、坚定、自信，现场灯光璀璨，球场看台座无虚席，背景有蓝黑色烟雾、聚光灯、飘扬的旗帜和飞舞的纸屑，营造欧冠之夜般的史诗氛围。人物为画面核心，半身到全身构图，突出脸部细节、肌肉张力与球衣质感。整体风格写实、震撼、富有戏剧性，海报级构图，电影感光影，高对比度，超清细节，8K，专业体育摄影，极具视觉冲击力。五根手指。"
  },
  {
    "id": "case-4",
    "caseNumber": 4,
    "title": "Foto Publicitária de Produto em Live Commerce",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case4.jpg",
    "source": "小红书989137706",
    "githubAnchor": "case-4",
    "description": "Cenário de transmissão ao vivo de vendas de produto gastronômico em estúdio high-tech com chat flutuante na tela.",
    "application": "Usado para ilustrar novidades de e-commerce, lançamentos de cardápios e transmissões de vendas no TikTok Shop.",
    "tags": [
      "Produto",
      "Live Commerce",
      "Comida",
      "E-commerce",
      "Publicidade"
    ],
    "prompt": "特朗普在抖音直播间卖老干妈，手里举着「老干妈风味」新品，背景还是 SpaceX 那种科技感，左下角弹幕飘着「特斯拉车主：求上链接」。"
  },
  {
    "id": "case-5",
    "caseNumber": 5,
    "title": "Pôster Tipográfico & Diagramação Editorial",
    "category": "posters",
    "categoryLabel": "Pôsteres & Filmes",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case5.jpg",
    "source": "小红书6455654397",
    "githubAnchor": "case-5",
    "description": "Pôster de narrativa épica com hierarquia tipográfica precisa, blocos de texto diagramados e iluminação de contraste alto.",
    "application": "Para criação de cartazes de eventos, convites de palestras e capas de e-books pedagógicos.",
    "tags": [
      "Pôster",
      "Tipografia",
      "Editorial",
      "Layout",
      "Design Gráfico"
    ],
    "prompt": "根据【XXX主题】自动生成一张收藏版史诗叙事海报：画面主体是极具张力的人物与场景，周围以极其精致的杂志排版风格环绕正文、大字标题、副标题、出版信息与年份印章。中英文双语对比，文字边缘清晰锐利无伪影，古典与现代感融合，极具艺术收藏价值。"
  },
  {
    "id": "case-6",
    "caseNumber": 6,
    "title": "Ilustração Artística & Arte Conceitual",
    "category": "ilustracao",
    "categoryLabel": "Ilustração & Arte 3D",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case6.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-6",
    "description": "Ilustração estilizada de alto valor artístico com paleta de cores harmoniosa, traços autorais e atmosfera mágica.",
    "application": "Para identidades visuais de artesanato, marcas criativas e estampas personalizadas.",
    "tags": [
      "Ilustração",
      "Arte Conceitual",
      "Cores",
      "Criatividade",
      "Artesanato"
    ],
    "prompt": "An artistic illustration of a creative artisan working in a sunlit atelier, surrounded by colorful handmade crafts, natural light streaming through rustic windows, warm color palette, painterly brushwork texture, cozy and inspiring aesthetic, 8k resolution, award-winning illustration."
  },
  {
    "id": "case-7",
    "caseNumber": 7,
    "title": "Mockup de Interface Mobile & UX/UI Moderno",
    "category": "social_mockup",
    "categoryLabel": "Mockups de Redes Sociais",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case7.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-7",
    "description": "Mockup 3D em perspectiva isométrica de smartphone com tela de aplicativo moderno, cartões com bordas arredondadas e sombras suaves.",
    "application": "Apresentação de portfólios de aplicativos, landing pages e propostas comerciais para clientes de tecnologia.",
    "tags": [
      "UI/UX",
      "App Mockup",
      "Mobile",
      "Figma Style",
      "3D"
    ],
    "prompt": "A sleek 3D perspective smartphone mockup floating at a slight 45-degree angle against a clean minimalist studio background. On the screen, a beautifully designed modern mobile dashboard UI with dark glassmorphism cards, glowing accent graphs in purple and emerald, crisp typography, clean status bar, 8k render, Octane render style."
  },
  {
    "id": "case-8",
    "caseNumber": 8,
    "title": "Enciclopédia Visual & Anatomia de Produto",
    "category": "infograficos",
    "categoryLabel": "Infográfico & Diagramas",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case8.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-8",
    "description": "Diagrama enciclopédico com vista detalhada, linhas de chamada com setas e textos explicativos de componentes.",
    "application": "Para explicar a composição de cosméticos, ingredientes de receitas artesanais ou passos de serviços.",
    "tags": [
      "Enciclopédia",
      "Infográfico",
      "Educação",
      "Anatomia",
      "Diagrama"
    ],
    "prompt": "A vintage botanical and scientific encyclopedia page layout detailing the anatomy and crafting process of organic handmade skincare ingredients. Clean callout lines, numbered anatomical breakdown, Latin names, natural watercolor textures on aged ivory paper background, crisp typography, 8K."
  },
  {
    "id": "case-17",
    "caseNumber": 17,
    "title": "Dashboard de Métricas & Design de Painel Analítico",
    "category": "social_mockup",
    "categoryLabel": "Mockups de Redes Sociais",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case17.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-17",
    "description": "Interface analítica com gráficos de barras, pizza e cartões de KPI com esquema de cores profissional e contraste perfeito.",
    "application": "Ideal para relatórios de tráfego pago, apresentação de resultados de redes sociais para clientes e propostas de agência.",
    "tags": [
      "Dashboard",
      "Métricas",
      "Gráficos",
      "Analytics",
      "SaaS"
    ],
    "prompt": "High-resolution analytics dashboard UI on an ultra-wide desktop monitor display, sleek dark theme with vibrant indigo and cyan metric cards, revenue line charts, conversion funnel, audience demographic map, clean vector iconography, modern SaaS design, 8k crisp details."
  },
  {
    "id": "case-56",
    "caseNumber": 56,
    "title": "Retrato Fotográfico Editorial com Luz de Estúdio",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case56.jpg",
    "source": "Comunidade Visual IA",
    "githubAnchor": "case-56",
    "description": "Fotografia de retrato de alta resolução (85mm, f/1.8) com textura de pele real, iluminação suave de janela e olhar expressivo.",
    "application": "Criação de avatares profissionais para redes sociais, fotos de perfil de autoridade e capas de artigos.",
    "tags": [
      "Fotografia",
      "Retrato",
      "Luz Natural",
      "85mm",
      "Autoridade"
    ],
    "prompt": "Close-up editorial portrait photography of a confident young entrepreneur, natural soft window lighting from the side, genuine friendly expression, sharp focus on eyes, natural skin texture with visible fine pores, soft bokeh background of a modern creative office, shot on Hasselblad H6D-100c, 85mm f/1.8 lens, 8K photorealistic."
  },
  {
    "id": "case-310",
    "caseNumber": 310,
    "title": "Vista Explodida de Produto Gastronômico & Snack",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case310.jpg",
    "source": "Awesome GPT-Image 2",
    "githubAnchor": "case-310",
    "description": "Fotografia publicitária com camadas de hambúrguer/sobremesa/snack flutuando em gravidade zero com gotas e iluminação de estúdio gastronômico.",
    "application": "Perfeito para confeitarias, hamburguerias e restaurantes locais que desejam anúncios irresistíveis no Instagram.",
    "tags": [
      "Gastronomia",
      "Food Photo",
      "Explodida",
      "Gravidade Zero",
      "Vendas"
    ],
    "prompt": "Commercial food photography of a gourmet artisanal burger with ingredients exploding and floating in mid-air in perfect layers: toasted brioche bun, melted cheddar dripping, flame-grilled beef patty with sizzling juices, crispy bacon, fresh lettuce, tomato slice, special sauce droplets flying in zero gravity. Studio dark background with dramatic rim lighting, high-speed photography, 8K hyper-detailed."
  },
  {
    "id": "case-344",
    "caseNumber": 344,
    "title": "Campanha de Moda Streetwear & Lookbook Urbano",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case344.jpg",
    "source": "NOIR Streetwear Campaign",
    "githubAnchor": "case-344",
    "description": "Editorial de moda urbana contemporânea com iluminação contrastada, texturas de tecido ricas e poses dinâmicas de passarela.",
    "application": "Para lojas de roupas femininas, marcas de calçados e brechós de luxo criarem lookbooks de alta conversão.",
    "tags": [
      "Moda",
      "Lookbook",
      "Streetwear",
      "Editorial",
      "Tecido"
    ],
    "prompt": "High-fashion streetwear lookbook campaign photo. A stylish young model walking confidently on an urban street corner during golden hour, wearing oversized textured jacket and tailored trousers. Cinematic backlight, lens flare, detailed garment fabric texture, urban architectural background in soft focus, Vogue editorial aesthetic, shot on 35mm film, 8K resolution."
  },
  {
    "id": "case-353",
    "caseNumber": 353,
    "title": "Relatório Visual de Cosméticos & Textura de Beleza",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case353.jpg",
    "source": "Beauty Brand Visual",
    "githubAnchor": "case-353",
    "description": "Fotografia macro de batons e cosméticos com textura cremosa em corte artístico, gotas de sérum e iluminação suave de skincare.",
    "application": "Ideal para estéticas, salões de beleza e lojas de cosméticos apresentarem produtos e procedimentos.",
    "tags": [
      "Cosméticos",
      "Skincare",
      "Macro",
      "Beleza",
      "Estética"
    ],
    "prompt": "Luxury cosmetics and skincare product photography. Close-up macro shot of premium lipsticks with rich creamy texture swatches, glass dropper bottles with luminous serum droplets on smooth marble podium. Soft diffuse beauty lighting, water reflections, pastel pink and warm ivory color palette, clean high-end commercial aesthetic, 8K."
  },
  {
    "id": "case-354",
    "caseNumber": 354,
    "title": "Sistema Completo de Identidade Visual & Brandbook",
    "category": "posters",
    "categoryLabel": "Pôsteres & Filmes",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case354.jpg",
    "source": "Brand Identity Hub",
    "githubAnchor": "case-354",
    "description": "Prancha de apresentação de marca com logotipo em positivo/negativo, paleta de cores pantone, tipografia e aplicações em cartões e embalagens.",
    "application": "Para designers e social media entregarem pacotes completos de rebranding profissional para empresas locais.",
    "tags": [
      "Branding",
      "Identidade Visual",
      "Logotipo",
      "Pantone",
      "Brandbook"
    ],
    "prompt": "Professional brand identity guidelines board presentation. Clean grid layout showing minimalist geometric logo, primary and secondary color palette swatches with HEX and Pantone codes, typography specimen (Header and Body fonts), business card mockup, embossed stationery envelope, modern luxury aesthetic, crisp vector precision, 8K studio render."
  },
  {
    "id": "case-361",
    "caseNumber": 361,
    "title": "Vista Explodida Técnica 3D de Smartphone",
    "category": "ilustracao",
    "categoryLabel": "Ilustração & Arte 3D",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case361.jpg",
    "source": "Tech Exploded View",
    "githubAnchor": "case-361",
    "description": "Desmontagem técnica em 3D de hardware mostrando tela OLED, placa-mãe, lentes de câmera e bateria flutuando em ordem milimétrica.",
    "application": "Para lojas de tecnologia, assistência técnica e infográficos sobre inovação e inteligência artificial.",
    "tags": [
      "3D",
      "Hardware",
      "Vista Explodida",
      "Tecnologia",
      "Render"
    ],
    "prompt": "Precise 3D exploded view rendering of a flagship titanium smartphone: glass screen, OLED display layer, processor chip with glowing circuits, triple-lens camera module, lithium battery and aluminum chassis floating sequentially along a central axis. Clean neutral studio background, subtle ambient occlusion shadows, industrial design engineering aesthetic, 8K Octane render."
  },
  {
    "id": "case-362",
    "caseNumber": 362,
    "title": "Touchpoints de Marca & Embalagens para Cafeteria",
    "category": "produtos",
    "categoryLabel": "Fotografia de Produtos & Food",
    "image": "https://raw.githubusercontent.com/freestylefly/awesome-gpt-image-2/main/data/images/case362.jpg",
    "source": "Matcha / Coffee Brand",
    "githubAnchor": "case-362",
    "description": "Moodboard de branding com embalagens de café/chá kraft, copos descartáveis com luva de papelão, sacola e carimbo autoral.",
    "application": "Para criar identidades completas de cafeterias, confeitarias e negócios alimentícios regionais.",
    "tags": [
      "Cafeteria",
      "Embalagem",
      "Branding",
      "Mockup",
      "Kraft"
    ],
    "prompt": "Artisanal specialty coffee brand touchpoints board. Flat lay composition featuring kraft paper coffee bean bag with stamped logo, ceramic cup with latte art, takeaway cup with embossed sleeve, tote bag, business card and pastry on rustic wooden table. Warm natural morning sunlight, cozy Scandinavian aesthetic, 8K photorealistic."
  }
];

let visualGalleryState = {
  activeView: 'personas', // 'personas' | 'visual_gallery' | 'builder'
  activeCategory: 'all',
  searchQuery: '',
  selectedCase: null
};

function switchPromptsSubTab(tabName) {
  visualGalleryState.activeView = tabName;
  const container = document.getElementById('main-content-area');
  if (container && AppState.currentTab === 'prompts') {
    renderPromptsTab(container);
  }
}

function filterVisualGalleryCategory(categoryKey) {
  visualGalleryState.activeCategory = categoryKey;
  const container = document.getElementById('main-content-area');
  if (container && AppState.currentTab === 'prompts') {
    renderPromptsTab(container);
  }
}

function handleVisualGallerySearch(e) {
  visualGalleryState.searchQuery = (e.target.value || '').trim();
  const container = document.getElementById('main-content-area');
  if (container && AppState.currentTab === 'prompts') {
    renderPromptsTab(container);
  }
}

function openCustomizeVisualPromptModal(caseId) {
  const item = AWESOME_GPT_IMAGE_CASES.find(c => c.id === caseId);
  if (!item) return;

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(5px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          
          <div class="modal-header border-bottom py-3 px-4 bg-slate-900 text-white d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-sm shadow-sm">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </span>
              <div>
                <h2 class="text-sm sm:text-base fw-bold text-white mb-0">Personalizador de Prompt Visual IA</h2>
                <span class="text-[11px] text-indigo-300">Awesome GPT-Image • Case #${item.caseNumber}</span>
              </div>
            </div>
            <button onclick="closeModal()" class="btn-close btn-close-white" aria-label="Fechar"></button>
          </div>

          <div class="modal-body p-4 p-sm-5 text-slate-900 bg-white space-y-4 overflow-y-auto">
            
            <div class="d-flex flex-column sm:flex-row align-items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                <img src="${item.image}" alt="${item.title}" class="w-100 h-100 object-fit-cover" onerror="this.src='assets/professor.jpg'" />
              </div>
              <div class="space-y-1">
                <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">${item.categoryLabel}</span>
                <h3 class="text-sm font-bold text-slate-900 mb-0">${item.title}</h3>
                <p class="text-xs text-slate-600 mb-0 leading-relaxed">${item.description}</p>
                <div class="text-[11px] text-emerald-700 fw-semibold pt-1">
                  <i class="fa-solid fa-lightbulb text-amber-500 mr-1"></i> ${item.application}
                </div>
              </div>
            </div>

            <!-- Editor de Variáveis -->
            <div class="space-y-3">
              <h4 class="text-xs fw-bold text-slate-900 text-uppercase tracking-wider mb-1">Substitua as variáveis para o seu cliente / negócio:</h4>
              
              <div class="row g-2">
                <div class="col-12 col-sm-6">
                  <label class="form-label text-xs fw-semibold text-slate-700 mb-1">Seu Produto / Objeto:</label>
                  <input type="text" id="custom-vis-subject" class="form-control form-control-sm rounded-xl text-xs" placeholder="Ex: Bolo de Chocolate Vulcão, Vestido de Linho..." oninput="updateCustomVisualPrompt('${item.id}')" />
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label text-xs fw-semibold text-slate-700 mb-1">Nome da Marca ou Loja:</label>
                  <input type="text" id="custom-vis-brand" class="form-control form-control-sm rounded-xl text-xs" placeholder="Ex: Doçuras da Ana, Ateliê Alagoas..." oninput="updateCustomVisualPrompt('${item.id}')" />
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label text-xs fw-semibold text-slate-700 mb-1">Cidade / Região:</label>
                  <input type="text" id="custom-vis-location" class="form-control form-control-sm rounded-xl text-xs" value="Maceió, Alagoas" oninput="updateCustomVisualPrompt('${item.id}')" />
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label text-xs fw-semibold text-slate-700 mb-1">Estilo de Iluminação:</label>
                  <select id="custom-vis-lighting" class="form-select form-select-sm rounded-xl text-xs" onchange="updateCustomVisualPrompt('${item.id}')">
                    <option value="Natural soft window lighting">Luz Natural de Janela (Suave)</option>
                    <option value="Dramatic commercial studio lighting with rim light">Estúdio Comercial Dramático</option>
                    <option value="Golden hour warm sunset sunlight">Golden Hour (Entardecer Dourado)</option>
                    <option value="Sleek cyberpunk neon accents">Neon Cyberpunk High-Tech</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Caixa com o Prompt Adaptado -->
            <div class="space-y-1.5">
              <div class="d-flex align-items-center justify-content-between">
                <label class="text-xs fw-bold text-indigo-900">Prompt Gerado Pronto para Usar (GPT-4o / Midjourney / DALL-E 3):</label>
                <span class="text-[10px] text-slate-500 font-monospace">Pronto para copiar</span>
              </div>
              <textarea id="custom-vis-output" readonly rows="6" class="form-control text-xs font-monospace bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-700 shadow-inner leading-relaxed">${item.prompt}</textarea>
            </div>

          </div>

          <div class="modal-footer border-top py-2.5 px-4 bg-slate-50 d-flex align-items-center justify-content-between">
            <a href="https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/gallery-part-1.md#${item.githubAnchor}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-light border border-slate-200 rounded-xl text-xs text-slate-600 d-inline-flex align-items-center gap-1.5">
              <i class="fa-brands fa-github"></i> Ver no GitHub
            </a>
            <div class="d-flex align-items-center gap-2">
              <button onclick="closeModal()" class="btn btn-sm btn-light border border-slate-200 rounded-xl px-3 py-1.5 text-xs">Fechar</button>
              <button onclick="copyToClipboard(document.getElementById('custom-vis-output').value, 'Prompt visual copiado com sucesso!')" class="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl px-4 py-1.5 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm">
                <i class="fa-solid fa-copy text-amber-300"></i> Copiar Prompt
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function updateCustomVisualPrompt(caseId) {
  const item = AWESOME_GPT_IMAGE_CASES.find(c => c.id === caseId);
  if (!item) return;

  const subject = (document.getElementById('custom-vis-subject')?.value || '').trim();
  const brand = (document.getElementById('custom-vis-brand')?.value || '').trim();
  const location = (document.getElementById('custom-vis-location')?.value || '').trim();
  const lighting = document.getElementById('custom-vis-lighting')?.value || 'Natural soft window lighting';

  let customPrompt = item.prompt;

  if (subject || brand) {
    customPrompt = `[Customized for ${brand || 'Brand'} - ${location || 'Alagoas'}]
Subject: ${subject || 'Product/Creative Topic'}
Lighting: ${lighting}
Original Base Prompt:
${item.prompt}`;
  }

  const outputEl = document.getElementById('custom-vis-output');
  if (outputEl) outputEl.value = customPrompt;
}

function buildPromptFrom6Dimensions() {
  const subject = document.getElementById('p6-subject')?.value || 'Handmade artisanal sweet dessert';
  const style = document.getElementById('p6-style')?.value || 'Commercial Food Photography 8K';
  const composition = document.getElementById('p6-comp')?.value || 'Vertical 9:16 Close-up with ingredients in mid-air';
  const lighting = document.getElementById('p6-light')?.value || 'Warm golden hour natural backlight';
  const colors = document.getElementById('p6-color')?.value || 'Warm chocolate browns and creamy ivory';
  const params = document.getElementById('p6-params')?.value || '8K resolution, octane render, photorealistic, no text blur';

  const masterPrompt = `${style}. ${subject}. ${composition}. ${lighting}. Color palette: ${colors}. Specifications: ${params}.`;
  
  const target = document.getElementById('p6-master-output');
  if (target) {
    target.value = masterPrompt;
    showToast('Prompt Mestre montado com a fórmula de 6 dimensões!', 'success');
  }
}

console.log('[Page] Prompts module with Awesome GPT-Image 2 loaded successfully.');
