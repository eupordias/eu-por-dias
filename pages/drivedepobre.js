// =============================================================
// PÁGINA: DRIVE DE POBRE — HUB DE ACERVO ABERTO & CURSOS LIVRES
// =============================================================
// Organização estratégica de +55 TB e +1.000.000 de arquivos educacionais
// Categorias: ENEM, Idiomas, Tecnologia, Marketing, Militares, Medicina, Livros e Banco de Questões.

const DRIVE_DE_POBRE_DATA = {
  stats: {
    totalFiles: "1.022.594+",
    totalStorage: "55 TB+",
    totalAcervos: 7,
    pricing: "100% Gratuito e Livre",
    url: "https://drivedepobre.com"
  },
  categories: [
    {
      id: "enem",
      name: "ENEM & Grandes Vestibulares",
      icon: "fa-graduation-cap",
      color: "amber",
      themeColor: "#d1500e",
      badge: "Mais Procurado",
      count: "180.000+ arquivos",
      url: "https://drivedepobre.com/enem-e-vestibulares",
      summary: "Apostilas de elite (Poliedro, Bernoulli, Anglo, Objetivo), resumos de fórmulas e provas resolvidas.",
      highlights: [
        "Apostilas completas dos sistemas Poliedro, Bernoulli, Anglo e Objetivo",
        "Resumos esquematizados de Matemática, Física, Química e Biologia",
        "Coletâneas de Redações Nota 1000 com análise de estrutura dissertativa",
        "Provas históricas comentadas do ENEM, FUVEST, UNICAMP e UERJ"
      ],
      studyTip: "Monte um ciclo de 30 questões diárias utilizando os resumos de fórmulas como consulta rápida."
    },
    {
      id: "idiomas",
      name: "Idiomas & Fluência Rápida",
      icon: "fa-language",
      color: "purple",
      themeColor: "#8248b5",
      badge: "Alta Demanda",
      count: "140.000+ arquivos",
      url: "https://drivedepobre.com/idiomas",
      summary: "Métodos completos de Inglês, Espanhol, Francês, Alemão, Italiano e Japonês com áudios e Anki.",
      highlights: [
        "Inglês do Zero à Fluência (Método 90 Dias, Mairo Vergara, Marcos Trombetta)",
        "Cursos completos de Espanhol, Francês, Alemão, Italiano, Japonês e Mandarim",
        "Decks de Flashcards para Anki (.apkg) com repetição espaçada",
        "Áudios nativos em MP3 com transcrições sincronizadas em PDF"
      ],
      studyTip: "Estude 20 minutos de áudio nativo por dia usando o player direto no navegador sem precisar baixar."
    },
    {
      id: "tecnologia",
      name: "Tecnologia, Programação & IA",
      icon: "fa-code",
      color: "blue",
      themeColor: "#2f66b5",
      badge: "Carreiras em Alta",
      count: "220.000+ arquivos",
      url: "https://drivedepobre.com/tecnologia-e-programacao",
      summary: "Full-Stack, Python, JavaScript, Ciência de Dados, Engenharia de Prompts, DevOps e Cloud.",
      highlights: [
        "Desenvolvimento Web Full-Stack: HTML5, CSS3, JavaScript, React, Next.js, Node.js",
        "Python do Zero à Automação, Machine Learning e Bancos de Dados SQL/NoSQL",
        "Engenharia de Prompts, ChatGPT, Midjourney e Automações com IA (n8n / Make)",
        "Infraestrutura, DevOps, Docker, Kubernetes, Linux e Certificações AWS"
      ],
      studyTip: "Combine estes cursos com a nossa Biblioteca de Prompts IA para construir seu portfólio prático."
    },
    {
      id: "marketing",
      name: "Marketing Digital & Negócios",
      icon: "fa-chart-line",
      color: "emerald",
      themeColor: "#16a34a",
      badge: "Monetização",
      count: "150.000+ arquivos",
      url: "https://drivedepobre.com/outros-cursos",
      summary: "Tráfego Pago (Meta/Google Ads), Copywriting, Edição de Vídeo (Premiere/After/DaVinci) e Vendas.",
      highlights: [
        "Gestão de Tráfego Pago de Alta Performance: Meta Ads, Google Ads e TikTok Ads",
        "Copywriting de Alta Conversão, Roteiros de VSL, Páginas de Captura e E-mail Marketing",
        "Edição Audiovisual Profissional: Adobe Premiere, After Effects, DaVinci Resolve e CapCut Pro",
        "Branding, Estratégias de Lançamento Digital, E-commerce e Infoprodutos"
      ],
      studyTip: "Use o nosso Auditor de Instagram IA junto com estes cursos para validar estratégias de perfil."
    },
    {
      id: "militares",
      name: "Carreiras Militares & Concursos",
      icon: "fa-shield-halved",
      color: "green",
      themeColor: "#456946",
      badge: "Concursos",
      count: "110.000+ arquivos",
      url: "https://drivedepobre.com/militares",
      summary: "Preparatórios para EsPCEx, AFA, IME, ITA, ESA, PF, PRF e Tribunais com editais verticalizados.",
      highlights: [
        "Cursos de Elite Militares: EsPCEx, AFA, IME, ITA, Colégio Naval, EPCAR, EFOMM e ESA",
        "Concursos Policiais e Federais: Polícia Federal, PRF, Carreiras Policiais (PC/PM)",
        "Editais verticalizados, cronogramas de estudo e jurisprudência comentada",
        "Simulados com gabarito comentado passo a passo para treino de tempo"
      ],
      studyTip: "Pratique provas reais com cronômetro para adquirir resistência e gestão de tempo sob pressão."
    },
    {
      id: "medicina",
      name: "Medicina & Ciências da Saúde",
      icon: "fa-stethoscope",
      color: "rose",
      themeColor: "#bd3550",
      badge: "Especializado",
      count: "95.000+ arquivos",
      url: "https://drivedepobre.com/medicina-e-saude",
      summary: "Tratados fundamentais (Abbas, Guyton, Netter), preparatórios para Residência e plantões.",
      highlights: [
        "Tratados Clássicos: Imunologia Abbas 10ª Ed, Guyton & Hall Fisiologia, Atlas Netter Anatomia",
        "Preparatórios de Residência Médica: Medcurso, SanarFlix, Hardwork Medicina e Medcel",
        "Guias de Bolso para Internato, Condutas em Emergência Médica e UTI",
        "Manuais de Farmacologia, Semiologia e Diagnóstico por Imagem"
      ],
      studyTip: "Utilize os PDFs com marcadores digitais para busca rápida durante estudos clínicos."
    },
    {
      id: "livros",
      name: "Biblioteca de E-books & Carreira",
      icon: "fa-book-open-reader",
      color: "indigo",
      themeColor: "#966d2c",
      badge: "Best-Sellers",
      count: "120.000+ livros",
      url: "https://drivedepobre.com/livros",
      summary: "Livros em EPUB e PDF sobre vendas, finanças, produtividade, inteligência emocional e liderança.",
      highlights: [
        "Best-sellers de Vendas e Negócios (100% Vendedor, Armas da Persuasão, Do Mil ao Milhão)",
        "Produtividade e Alta Performance: Hábitos Atômicos, Hiperfoco, Essencialismo, Mindset",
        "Finanças Pessoais, Investimentos, Gestão de Pessoas e Filosofia Prática",
        "Arquivos em formato EPUB leve otimizados para celular, tablet e Kindle"
      ],
      studyTip: "Mantenha uma meta de 15 a 20 páginas diárias pela manhã para desenvolver raciocínio estratégico."
    }
  ],
  featuredMaterials: [
    {
      title: "Aprenda Inglês Sozinho — Método Marcos Trombetta",
      category: "Idiomas",
      format: "RAR / Curso Completo",
      icon: "fa-file-zipper",
      iconColor: "text-purple-600",
      size: "640.77 MB",
      views: "1.890+ acessos",
      url: "https://drivedepobre.com/idiomas",
      desc: "Metodologia comprovada de imersão e aquisição de vocabulário autodidata sem depender de escolas tradicionais."
    },
    {
      title: "Todas as Fórmulas e Resumo Completo de Matemática (ENEM & Vestibulares)",
      category: "ENEM & Vestibulares",
      format: "PDF Otimizado",
      icon: "fa-file-pdf",
      iconColor: "text-rose-600",
      size: "3.24 MB",
      views: "2.450+ acessos",
      url: "https://drivedepobre.com/enem-e-vestibulares",
      desc: "Compilado definitivo com todas as fórmulas de Geometria, Álgebra, Trigonometria e Funções com exemplos."
    },
    {
      title: "Super Planilha & Comandos Prontos para Chat GPT e IA",
      category: "Tecnologia & IA",
      format: "XLSX / Planilha",
      icon: "fa-file-excel",
      iconColor: "text-emerald-600",
      size: "154 KB",
      views: "3.120+ acessos",
      url: "https://drivedepobre.com/outros-cursos",
      desc: "Frameworks e prompts estruturados para marketing, análise de dados, criação de conteúdo e estudos."
    },
    {
      title: "Imunologia Celular e Molecular — 10ª Edição (Abbas)",
      category: "Medicina",
      format: "PDF Digital",
      icon: "fa-file-pdf",
      iconColor: "text-rose-600",
      size: "100.03 MB",
      views: "1.420+ acessos",
      url: "https://drivedepobre.com/medicina-e-saude",
      desc: "A principal referência mundial em imunologia médica com ilustrações em alta resolução."
    },
    {
      title: "100% Vendedor: Motivação e Vendas para Bater a Concorrência",
      category: "Livros & E-books",
      format: "EPUB / E-book",
      icon: "fa-book",
      iconColor: "text-amber-600",
      size: "212 KB",
      views: "1.680+ acessos",
      url: "https://drivedepobre.com/livros",
      desc: "Manual indispensável de técnicas de negociação, fechamento e psicologia de vendas consultivas."
    },
    {
      title: "Mega Pack de Links & Recursos Estratégicos",
      category: "Outros Cursos",
      format: "PDF / Guia",
      icon: "fa-file-pdf",
      iconColor: "text-indigo-600",
      size: "473 KB",
      views: "2.100+ acessos",
      url: "https://drivedepobre.com/outros-cursos",
      desc: "Diretório selecionado de ferramentas gratuitas, bancos de imagens, templates e fontes de pesquisa."
    }
  ],
  studyPlans: [
    {
      id: "plan-ingles",
      name: "Fluência em Inglês em 90 Dias",
      area: "Idiomas",
      duration: "12 Semanas (45 min/dia)",
      steps: [
        { week: "Semanas 1-4", goal: "Construção de Vocabulário Base", desc: "Baixe o curso de Introdução em 'Idiomas' e adicione 15 cards diários no Anki com frases completas e áudio." },
        { week: "Semanas 5-8", goal: "Compreensão Auditiva (Listening)", desc: "Assista às videoaulas com o player online do Drive, pausando e repetindo a pronúncia nativa (Shadowing)." },
        { week: "Semanas 9-12", goal: "Produção Ativa e Pensamento", desc: "Use a nossa Biblioteca de Prompts para simular conversas em inglês com o ChatGPT e praticar escrita." }
      ]
    },
    {
      id: "plan-enem",
      name: "Sprint de Aprovação ENEM (Reta Final)",
      area: "Vestibulares",
      duration: "8 Semanas (2h/dia)",
      steps: [
        { week: "Semanas 1-2", goal: "Domínio das Fórmulas Críticas", desc: "Estude o PDF 'Todas as Fórmulas' e resolva 40 questões das matérias de maior peso na sua carreira pretendida." },
        { week: "Semanas 3-6", goal: "Redação Nota 1000 & Simulados", desc: "Analise a estrutura dos modelos de redação aprovados e faça 2 redações semanais cronometradas." },
        { week: "Semanas 7-8", goal: "Revisão e Banco de Questões", desc: "Faça simulados de anos anteriores resolvendo primeiro as questões fáceis e médias para maximizar o TRI." }
      ]
    },
    {
      id: "plan-dev",
      name: "Formação Desenvolvedor Full-Stack",
      area: "Tecnologia",
      duration: "16 Semanas (1h/dia)",
      steps: [
        { week: "Semanas 1-4", goal: "Fundamentos Web (HTML5, CSS3 & JS Moderno)", desc: "Acesse a pasta de Tecnologia, pratique criando 3 páginas responsivas e domine lógica de programação." },
        { week: "Semanas 5-10", goal: "Frontend com React / Next.js & APIs", desc: "Desenvolva componentes modulares, consumo de APIs REST e gerenciamento de estado." },
        { week: "Semanas 11-16", goal: "Backend Node.js/Python & Deploy", desc: "Construa uma API completa com banco de dados e faça deploy gratuito na nuvem para seu portfólio." }
      ]
    },
    {
      id: "plan-marketing",
      name: "Gestor de Tráfego & Lançamentos Digitais",
      area: "Marketing",
      duration: "6 Semanas (1h/dia)",
      steps: [
        { week: "Semanas 1-2", goal: "Fundamentos de Tráfego & Pixel/Tags", desc: "Aprenda estrutura de campanhas no Meta Ads e Google Ads na pasta de Outros Cursos." },
        { week: "Semanas 3-4", goal: "Copywriting & Criativos de Vídeo", desc: "Estude roteiros de alta conversão e aprenda cortes dinâmicos de vídeo com CapCut / Premiere." },
        { week: "Semanas 5-6", goal: "Otimização com Auditor de Instagram", desc: "Aplique o diagnóstico do Auditor de Instagram no perfil de clientes reais e apresente propostas de gestão." }
      ]
    }
  ]
};

let currentDriveTab = "overview";
let currentDriveFilter = "all";
let currentDriveSearch = "";

function switchDriveTab(tab) {
  currentDriveTab = tab;
  const container = document.getElementById("main-content-area");
  if (container) renderDriveDePobreTab(container);
}

function setDriveCategoryFilter(catId) {
  currentDriveFilter = catId;
  const container = document.getElementById("main-content-area");
  if (container) renderDriveDePobreTab(container);
}

function handleDriveSearchInput(val) {
  currentDriveSearch = val.toLowerCase().trim();
  const grid = document.getElementById("drive-categories-grid");
  const featGrid = document.getElementById("drive-featured-grid");
  
  if (grid) {
    const cards = grid.querySelectorAll(".drive-category-card");
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!currentDriveSearch || text.includes(currentDriveSearch)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (featGrid) {
    const featCards = featGrid.querySelectorAll(".drive-featured-card");
    featCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!currentDriveSearch || text.includes(currentDriveSearch)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }
}

function copyDriveLink(url, title) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') {
        showToast("Link de '" + title + "' copiado para a área de transferência!", "success");
      } else {
        alert("Link copiado com sucesso!");
      }
    }).catch(() => {
      prompt("Copie o link abaixo:", url);
    });
  } else {
    prompt("Copie o link abaixo:", url);
  }
}

function openExternalDriveSearch() {
  const input = document.getElementById("drive-global-search-input");
  const query = (input && input.value.trim()) || currentDriveSearch || "";
  const targetUrl = query ? "https://drivedepobre.com/search?q=" + encodeURIComponent(query) : "https://drivedepobre.com";
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function renderDriveDePobreTab(container) {
  if (!container) return;

  const filteredCategories = currentDriveFilter === "all" 
    ? DRIVE_DE_POBRE_DATA.categories 
    : DRIVE_DE_POBRE_DATA.categories.filter(c => c.id === currentDriveFilter);

  let html = `
    <div class="space-y-6 pb-12 animate-fade-in">
      
      
      <!-- HERO HEADER COM CORES SÓLIDAS DE ALTO CONTRASTE (SEM TRANSPARÊNCIA INDESEJADA) -->
      <div class="rounded-3xl p-6 sm:p-8 shadow-xl" style="background: linear-gradient(135deg, #090d16 0%, #171d2d 50%, #0c1222 100%) !important; color: #ffffff !important; border: 1px solid #1e293b !important; position: relative; overflow: hidden;">
        
        <!-- Decorative Glow Accents -->
        <div style="position: absolute; right: -40px; bottom: -40px; width: 320px; height: 320px; background: rgba(245, 158, 11, 0.08); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>
        <div style="position: absolute; left: -40px; top: -40px; width: 320px; height: 320px; background: rgba(99, 102, 241, 0.12); border-radius: 50%; filter: blur(50px); pointer-events: none;"></div>

        <div style="position: relative; z-index: 2;">
          <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div class="space-y-2 max-w-2xl">
              <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
                <span style="background: rgba(245, 158, 11, 0.2) !important; color: #fbbf24 !important; border: 1px solid rgba(245, 158, 11, 0.5) !important;" class="rounded-pill px-3 py-1 text-xs fw-bold tracking-wide">
                  <i class="fa-solid fa-cloud-arrow-down mr-1"></i> ACERVO LIVRE BRASIL
                </span>
                <span style="background: rgba(16, 185, 129, 0.2) !important; color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.5) !important;" class="rounded-pill px-2.5 py-1 text-xs fw-bold">
                  <i class="fa-solid fa-bolt mr-1"></i> SEM PAYWALL • SEM CADASTRO
                </span>
              </div>
              
              <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight m-0" style="color: #ffffff !important;">
                Central Drive de Pobre <span style="color: #fbbf24 !important; text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);">55 TB+</span>
              </h1>
              
              <p class="text-sm sm:text-base leading-relaxed m-0" style="color: #cbd5e1 !important;">
                Organização estratégica e curadoria do maior acervo aberto de cursos, apostilas de cursinhos de elite, métodos de idiomas, livros e materiais de estudo do Brasil.
              </p>
            </div>

            <!-- BOTÕES DE AÇÃO RÁPIDA -->
            <div class="d-flex flex-wrap flex-lg-column gap-2.5 shrink-0">
              <a href="https://drivedepobre.com" target="_blank" rel="noopener noreferrer" 
                 class="btn fw-bold px-4 py-2.5 rounded-xl shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 text-sm transition-all"
                 style="background-color: #f59e0b !important; color: #000000 !important; font-weight: 800 !important;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar drivedepobre.com
              </a>
              <button onclick="switchDriveTab('plans')" 
                      class="btn px-4 py-2 rounded-xl text-xs fw-semibold d-flex align-items-center justify-content-center gap-2 transition-all"
                      style="background-color: rgba(255,255,255,0.08) !important; color: #f1f5f9 !important; border: 1px solid #334155 !important;">
                <i class="fa-solid fa-route" style="color: #fbbf24;"></i> Planos de Estudo Guiados
              </button>
            </div>
          </div>

          <!-- STATS BADGES COM CONTRASTE GARANTIDO -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5" style="border-top: 1px solid #1e293b;">
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Arquivos no Acervo</div>
              <div class="text-xl sm:text-2xl font-black mt-0.5" style="color: #fbbf24 !important;">${DRIVE_DE_POBRE_DATA.stats.totalFiles}</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Armazenamento</div>
              <div class="text-xl sm:text-2xl font-black mt-0.5" style="color: #818cf8 !important;">${DRIVE_DE_POBRE_DATA.stats.totalStorage}</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Trilhas Temáticas</div>
              <div class="text-xl sm:text-2xl font-black mt-0.5" style="color: #34d399 !important;">7 Acervos</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Acesso Aberto</div>
              <div class="text-xl sm:text-2xl font-black mt-0.5" style="color: #f472b6 !important;">100% Grátis</div>
            </div>
          </div>

          <!-- BARRA DE PESQUISA INTEGRADA CORRIGIDA (SEM SOBREPOSIÇÃO) -->
          <div class="mt-6">
            <div style="position: relative; display: flex; align-items: center; width: 100%;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1.1rem; color: #94a3b8; font-size: 0.95rem; pointer-events: none; z-index: 2;"></i>
              <input 
                type="text" 
                id="drive-global-search-input"
                oninput="handleDriveSearchInput(this.value)"
                placeholder="Pesquise por curso, professor, apostila ou tecnologia (ex: Poliedro, Inglês, Python, SAP, Abbas)..." 
                class="form-control"
                style="padding-left: 2.85rem !important; padding-right: 9.5rem !important; height: 50px !important; background-color: #0b101c !important; color: #ffffff !important; border: 1px solid #334155 !important; border-radius: 1rem !important; font-size: 0.875rem !important; width: 100% !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4) !important;"
                value="${currentDriveSearch}"
              >
              <button 
                onclick="openExternalDriveSearch()" 
                class="btn btn-sm fw-bold transition-all d-flex align-items-center gap-1.5"
                style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%); height: 38px; padding: 0 14px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important; color: #000000 !important; border: none !important; border-radius: 0.75rem !important; font-size: 0.75rem !important; font-weight: 800 !important; z-index: 3;"
                title="Buscar direto no servidor oficial do Drive de Pobre"
              >
                <span>Buscar no Drive</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
            
            <div class="d-flex align-items-center gap-1.5 mt-2.5 flex-wrap text-xs" style="color: #94a3b8;">
              <span class="fw-semibold" style="color: #e2e8f0;">Sugestões rápidas:</span>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='Poliedro'; handleDriveSearchInput('Poliedro');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #cbd5e1; border: 1px solid #334155;">Poliedro</button>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='Inglês 90 Dias'; handleDriveSearchInput('Inglês 90 Dias');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #cbd5e1; border: 1px solid #334155;">Inglês 90 Dias</button>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='Python'; handleDriveSearchInput('Python');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #cbd5e1; border: 1px solid #334155;">Python Fullstack</button>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='SAP'; handleDriveSearchInput('SAP');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #fbbf24; border: 1px solid #d97706;">SAP / ABAP</button>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='Abbas Imunologia'; handleDriveSearchInput('Abbas Imunologia');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #cbd5e1; border: 1px solid #334155;">Abbas Imunologia</button>
              <button type="button" onclick="document.getElementById('drive-global-search-input').value='Copywriting'; handleDriveSearchInput('Copywriting');" class="badge rounded-pill px-2.5 py-1 cursor-pointer" style="background-color: #1e293b; color: #cbd5e1; border: 1px solid #334155;">Copywriting</button>
            </div>
          </div>

        </div>
      </div>


      <!-- NAVEGAÇÃO DE SUB-ABAS -->
      <div class="d-flex align-items-center justify-content-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2 overflow-x-auto py-1">
          <button 
            onclick="switchDriveTab('overview')"
            class="btn btn-sm ${currentDriveTab === 'overview' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-shapes"></i>
            <span>7 Grandes Acervos</span>
          </button>

          <button 
            onclick="switchDriveTab('featured')"
            class="btn btn-sm ${currentDriveTab === 'featured' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-fire text-amber-500"></i>
            <span>Top Destaques da Semana</span>
          </button>

          <button 
            onclick="switchDriveTab('plans')"
            class="btn btn-sm ${currentDriveTab === 'plans' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-map-location-dot text-emerald-500"></i>
            <span>Planos de Estudo Guiados</span>
          </button>

          <button 
            onclick="switchDriveTab('guide')"
            class="btn btn-sm ${currentDriveTab === 'guide' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-graduation-cap text-indigo-500"></i>
            <span>Guia de Maestria & Metodologia</span>
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <a href="https://drivedepobre.com/questoes" target="_blank" rel="noopener noreferrer" 
             class="btn btn-sm btn-outline-warning text-amber-700 border-amber-300 bg-amber-50/70 hover:bg-amber-100 rounded-xl px-3 py-2 text-xs fw-bold d-flex align-items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-circle-question"></i>
            <span>Banco de Questões</span>
          </a>
        </div>
      </div>
  `;

  // RENDERIZAÇÃO DA SUB-ABA ATIVA
  if (currentDriveTab === "overview") {
    html += `
      <!-- FILTROS POR CATEGORIA -->
      <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-2">
        <span class="text-xs text-slate-500 fw-bold uppercase tracking-wider mr-1">Filtrar:</span>
        <button onclick="setDriveCategoryFilter('all')" class="badge ${currentDriveFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} border border-slate-200 rounded-pill px-3 py-1.5 text-xs fw-semibold transition-all">Todos (7)</button>
        ${DRIVE_DE_POBRE_DATA.categories.map(cat => `
          <button onclick="setDriveCategoryFilter('${cat.id}')" class="badge ${currentDriveFilter === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} border border-slate-200 rounded-pill px-3 py-1.5 text-xs fw-semibold transition-all">
            <i class="fa-solid ${cat.icon} mr-1"></i> ${cat.name}
          </button>
        `).join('')}
      </div>

      <!-- GRID DE ACERVOS ORGANIZADOS -->
      <div id="drive-categories-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${filteredCategories.map(cat => `
          <div class="drive-category-card bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all d-flex flex-column justify-content-between h-full group">
            
            <div>
              <!-- HEADER DO CARD -->
              <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div class="w-12 h-12 rounded-2xl d-flex align-items-center justify-content-center text-white text-lg shadow-sm" style="background-color: ${cat.themeColor}">
                  <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="d-flex flex-column align-items-end">
                  <span class="badge bg-${cat.color}-50 text-${cat.color}-700 border border-${cat.color}-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">
                    ${cat.badge}
                  </span>
                  <span class="text-[11px] text-slate-400 mt-1">${cat.count}</span>
                </div>
              </div>

              <!-- TÍTULO E DESCRIÇÃO -->
              <h3 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                ${cat.name}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">
                ${cat.summary}
              </p>

              <!-- DESTAQUES PRINCIPAIS -->
              <div class="space-y-1.5 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  <i class="fa-solid fa-list-check text-indigo-500 mr-1"></i> O que você encontra:
                </div>
                ${cat.highlights.map(h => `
                  <div class="text-[11px] text-slate-600 d-flex align-items-start gap-1.5 leading-snug">
                    <i class="fa-solid fa-check text-emerald-500 mt-0.5 text-[10px] shrink-0"></i>
                    <span>${h}</span>
                  </div>
                `).join('')}
              </div>

              <!-- DICA DE ESTUDO -->
              <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed mb-4">
                <i class="fa-solid fa-lightbulb text-amber-600 mr-1"></i>
                <strong>Dica Estratégica:</strong> ${cat.studyTip}
              </div>
            </div>

            <!-- FOOTER DE AÇÃO -->
            <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2 mt-auto">
              <button onclick="copyDriveLink('${cat.url}', '${cat.name}')" 
                      class="btn btn-sm btn-light border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl px-2.5 py-1.5 text-xs d-flex align-items-center gap-1"
                      title="Copiar link da seção">
                <i class="fa-solid fa-copy"></i>
                <span>Copiar Link</span>
              </button>

              <a href="${cat.url}" target="_blank" rel="noopener noreferrer" 
                 class="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3.5 py-1.5 text-xs fw-bold d-flex align-items-center gap-1.5 shadow-xs">
                <span>Abrir Acervo</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

          </div>
        `).join('')}
      </div>
    `;
  } else if (currentDriveTab === "featured") {
    html += `
      <div class="space-y-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 class="text-lg font-bold text-slate-900 m-0">Top Materiais & Cursos em Alta</h2>
            <p class="text-xs text-slate-500 m-0">Os conteúdos com maior índice de downloads e visualizações pelos estudantes.</p>
          </div>
          <span class="badge bg-amber-100 text-amber-800 border border-amber-200 rounded-pill px-3 py-1 text-xs fw-bold">
            <i class="fa-solid fa-fire mr-1"></i> Atualizado Semanalmente
          </span>
        </div>

        <div id="drive-featured-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${DRIVE_DE_POBRE_DATA.featuredMaterials.map(item => `
            <div class="drive-featured-card bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all d-flex flex-column justify-content-between h-full">
              <div>
                <div class="d-flex align-items-center justify-content-between gap-2 mb-2.5">
                  <span class="badge bg-slate-100 text-slate-700 border border-slate-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">
                    ${item.category}
                  </span>
                  <span class="text-[11px] text-amber-600 fw-bold">
                    <i class="fa-solid fa-eye mr-1"></i>${item.views}
                  </span>
                </div>

                <div class="d-flex align-items-start gap-3 mb-3">
                  <div class="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 d-flex align-items-center justify-content-center ${item.iconColor} text-base shrink-0">
                    <i class="fa-solid ${item.icon}"></i>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 leading-snug mb-1">${item.title}</h3>
                    <div class="d-flex align-items-center gap-2 text-[11px] text-slate-400">
                      <span><i class="fa-solid fa-cube mr-1"></i>${item.format}</span>
                      <span>•</span>
                      <span><i class="fa-solid fa-hard-drive mr-1"></i>${item.size}</span>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-slate-600 leading-relaxed mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  ${item.desc}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2">
                <button onclick="copyDriveLink('${item.url}', '${item.title}')" class="btn btn-sm btn-light border border-slate-200 text-slate-600 rounded-xl px-2.5 py-1.5 text-xs">
                  <i class="fa-solid fa-share-nodes"></i>
                </button>
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-warning bg-amber-500 hover:bg-amber-400 text-slate-950 fw-bold rounded-xl px-3.5 py-1.5 text-xs d-flex align-items-center gap-1.5">
                  <span>Acessar Material</span>
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentDriveTab === "plans") {
    html += `
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 m-0">Planos de Estudo Guiados com o Acervo</h2>
          <p class="text-xs text-slate-500 m-0">Roteiros estruturados para você transformar o volume de arquivos em aprovação e resultados reais sem sobrecarga mental.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          ${DRIVE_DE_POBRE_DATA.studyPlans.map(plan => `
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div class="d-flex align-items-start justify-content-between gap-3 mb-4">
                <div>
                  <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold uppercase">
                    ${plan.area}
                  </span>
                  <h3 class="text-base font-bold text-slate-900 mt-1 mb-0.5">${plan.name}</h3>
                  <span class="text-xs text-slate-500"><i class="fa-solid fa-clock text-amber-500 mr-1"></i> Dedicação sugerida: <strong>${plan.duration}</strong></span>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-sm font-black shadow-xs">
                  <i class="fa-solid fa-route"></i>
                </div>
              </div>

              <!-- ETAPAS DO PLANO -->
              <div class="space-y-3">
                ${plan.steps.map((step, idx) => `
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 d-flex align-items-start gap-3">
                    <span class="badge bg-indigo-600 text-white rounded-circle w-6 h-6 d-flex align-items-center justify-content-center text-[10px] fw-bold shrink-0 mt-0.5">
                      ${idx + 1}
                    </span>
                    <div class="space-y-1">
                      <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="text-xs font-bold text-slate-900">${step.goal}</span>
                        <span class="badge bg-slate-200 text-slate-700 rounded-pill px-2 py-0.5 text-[9px] fw-semibold">${step.week}</span>
                      </div>
                      <p class="text-xs text-slate-600 m-0 leading-relaxed">${step.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentDriveTab === "guide") {
    html += `
      <div class="space-y-6">
        <!-- GUIA DE METODOLOGIA -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-pill px-3 py-1 text-xs fw-bold">
              <i class="fa-solid fa-brain mr-1"></i> CIÊNCIA DA APRENDIZAGEM
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-2 mb-1">Como Estudar Mais em Menos Tempo (Sem Acumular Pastas)</h2>
            <p class="text-xs text-slate-500 m-0">Evite a armadilha de 'acumular arquivos'. O que gera aprovação e contratação é retenção ativa e execução.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-sm font-bold">1</div>
              <h4 class="text-sm font-bold text-slate-900">Método Feynman</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Após assistir uma aula ou ler um capítulo de PDF, explique o conceito em voz alta ou em uma folha em branco como se estivesse ensinando uma criança de 10 anos.</p>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white d-flex align-items-center justify-content-center text-sm font-bold">2</div>
              <h4 class="text-sm font-bold text-slate-900">Blocos de Pomodoro (50/10)</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Estude focado sem celular por 50 minutos e descanse 10. O cérebro consolida a memória de longo prazo durante as pausas difusas.</p>
            </div>

            <div class="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <div class="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 d-flex align-items-center justify-content-center text-sm font-bold">3</div>
              <h4 class="text-sm font-bold text-slate-900">Repetição Espaçada (Anki)</h4>
              <p class="text-xs text-slate-600 leading-relaxed">Utilize os baralhos de flashcards disponíveis na seção de Idiomas e ENEM para combater a curva do esquecimento de Ebbinghaus.</p>
            </div>
          </div>

          <!-- DICAS DE NAVEGAÇÃO NO DRIVE DE POBRE -->
          <div class="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
            <h4 class="text-sm font-bold text-white d-flex align-items-center gap-2">
              <i class="fa-solid fa-circle-info text-amber-400"></i> Dicas Técnicas para Uso do Drive de Pobre:
            </h4>
            <ul class="text-xs text-slate-300 space-y-2 mb-0 pl-4">
              <li><strong>Player Nativo no Navegador:</strong> A maioria das videoaulas (.mp4) e áudios (.mp3) rodam direto no navegador com controles de velocidade sem precisar de download.</li>
              <li><strong>Leitura de E-books (.epub):</strong> Recomendamos o uso de leitores como <em>Calibre</em> (PC), <em>ReadEra</em> (Android) ou <em>Apple Books</em> (iOS) para sincronizar marcações de texto.</li>
              <li><strong>Download de Arquivos Grandes:</strong> Utilize um gerenciador de downloads para evitar perda de pacotes em conexões instáveis.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  html += `
      <!-- BANNER DE MANIFESTO EDUCACIONAL -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 text-white d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 shadow-md">
        <div class="space-y-1">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-scale-balanced text-amber-400"></i>
            <span class="text-xs text-amber-300 font-bold uppercase tracking-wider">Democratização do Acesso ao Conhecimento</span>
          </div>
          <h3 class="text-base font-bold text-white m-0">Compromisso com a Educação Livre</h3>
          <p class="text-xs text-slate-300 m-0 max-w-2xl">O conhecimento de alto nível não deve ser privilégio de quem pode pagar mensalidades abusivas. Aproveite este acervo com seriedade, disciplina e propósito.</p>
        </div>
        <a href="https://drivedepobre.com" target="_blank" rel="noopener noreferrer" class="btn btn-warning bg-amber-500 hover:bg-amber-400 text-slate-950 fw-bold px-4 py-2.5 rounded-xl text-xs d-flex align-items-center justify-content-center gap-2 shrink-0">
          <span>Visitar drivedepobre.com</span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>

    </div>
  `;

  container.innerHTML = html;
}

if (typeof window !== 'undefined') {
  window.DRIVE_DE_POBRE_DATA = DRIVE_DE_POBRE_DATA;
  window.renderDriveDePobreTab = renderDriveDePobreTab;
  window.switchDriveTab = switchDriveTab;
  window.setDriveCategoryFilter = setDriveCategoryFilter;
  window.handleDriveSearchInput = handleDriveSearchInput;
  window.copyDriveLink = copyDriveLink;
  window.openExternalDriveSearch = openExternalDriveSearch;
}

console.log('[Page] Drive de Pobre module loaded successfully.');
