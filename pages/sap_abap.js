// =============================================================
// PÁGINA: ACADEMIA SAP & ABAP DEVELOPER HUB
// =============================================================
// Formação completa de Consultor & Desenvolvedor SAP S/4HANA & ABAP
// Módulos Funcionais, ABAP Moderno (7.4+ / CDS Views / RAP), Transações (T-Codes), 
// Cursos e Materiais do Acervo Drive de Pobre.

const SAP_ABAP_DATA = {
  overview: {
    title: "Academia SAP & ABAP Enterprise Hub",
    badge: "Ecossistema Enterprise",
    salaryRange: "R$ 8.000 a R$ 35.000+/mês",
    demandLevel: "Altíssima Demanda Global",
    summary: "O ERP SAP é a espinha dorsal de mais de 90% das maiores empresas do mundo (Fortune 500). Domine a arquitetura SAP S/4HANA, os módulos funcionais e a programação ABAP moderna para ingressar nas carreiras mais valorizadas e bem pagas da tecnologia."
  },
  
  // MATERIAIS REAIS DO ACERVO DRIVE DE POBRE
  driveMaterials: [
    {
      id: "sap-intro",
      title: "01 - SAP: Entendendo suas Características Gerais",
      size: "738.37 MB",
      format: "Curso em Vídeo",
      author: "Especialistas SAP",
      category: "Fundamentos & Arquitetura",
      url: "https://drivedepobre.com/tecnologia-e-programacao/fnI_K-IIIQhD",
      summary: "Visão 360º do ecossistema SAP, estrutura de mandantes, instâncias, navegação no SAP GUI e conceitos empresariais.",
      tag: "Essencial Iniciante"
    },
    {
      id: "sap-gestao",
      title: "315 - Gestão e Aplicações Corporativas SAP",
      size: "1.33 GB",
      format: "Treinamento Completo",
      author: "Formação Executiva",
      category: "Módulos & Gestão",
      url: "https://drivedepobre.com/tecnologia-e-programacao/0IbDChu5vhQ8",
      summary: "Fluxos de processos integrados de ponta a ponta (Order to Cash, Procure to Pay, Plan to Produce) e parametrização.",
      tag: "Processos Integrados"
    },
    {
      id: "sap-activate",
      title: "02 - SAP Activate: Gestão Ágil em Projetos SAP",
      size: "626.64 MB",
      format: "Metodologia & Aulas",
      author: "Projetos S/4HANA",
      category: "Metodologia Ágil",
      url: "https://drivedepobre.com/tecnologia-e-programacao/mcA9Qs-oZSOS",
      summary: "Metodologia padrão da SAP para implementação do S/4HANA: Fases Discover, Prepare, Explore, Realize, Deploy e Run.",
      tag: "Metodologia Padrão"
    },
    {
      id: "sap-overview",
      title: "02 - Overview & Arquitetura do ERP SAP",
      size: "193.85 MB",
      format: "Vídeo Aulas",
      author: "Academia ERP",
      category: "Arquitetura Técnica",
      url: "https://drivedepobre.com/tecnologia-e-programacao/ST7XUINBHvRi",
      summary: "Arquitetura 3 camadas (Apresentação, Aplicação e Banco HANA), dicionário de dados e camadas de segurança.",
      tag: "Arquitetura"
    },
    {
      id: "sap-python",
      title: "03 - Mentoria: Automação de ERPs (SAP/Totvs) com Python",
      size: "647.58 MB",
      format: "Mentoria + Scripts",
      author: "Automação Corporativa",
      category: "Integração & RPA",
      url: "https://drivedepobre.com/tecnologia-e-programacao/NPqpb-24QmFm",
      summary: "Como integrar Python com SAP GUI Scripting, RFC e APIs para automatizar tarefas repetitivas e relatórios em lote.",
      tag: "Automação Moderna"
    },
    {
      id: "sap-ebook",
      title: "E-book: ABAP — O Guia de Sobrevivência do Profissional Moderno",
      size: "1.79 MB",
      format: "Livro / PDF Digital",
      author: "Referência Técnica",
      category: "Programação ABAP",
      url: "https://drivedepobre.com/tecnologia-e-programacao/xLSt8rmCOC2j",
      summary: "Manual de referência com sintaxe moderna, boas práticas de performance, debugging avançado e dicas de carreira.",
      tag: "Leitura Obrigatória"
    }
  ],

  // MÓDULOS FUNCIONAIS PRINCIPAIS
  functionalModules: [
    {
      code: "SAP MM",
      name: "Materials Management (Materiais & Compras)",
      icon: "fa-boxes-stacked",
      color: "blue",
      desc: "Gestão de compras, cotações, estoque, inventário físico, recebimento de mercadorias e avaliação de fornecedores.",
      coreProcesses: ["Requisição & Pedido de Compra (ME21N)", "Entrada de Mercadoria (MIGO)", "Revisão de Fatura (MIRO)"],
      tcodes: ["ME21N", "MIGO", "MIRO", "MM01", "MM03", "MB52"]
    },
    {
      code: "SAP SD",
      name: "Sales and Distribution (Vendas & Faturamento)",
      icon: "fa-cart-shopping",
      color: "emerald",
      desc: "Ciclo completo de vendas: ordens de venda, expedição, remessa, precificação, faturamento (nota fiscal) e transporte.",
      coreProcesses: ["Ordem de Venda (VA01)", "Remessa & Separação (VL01N)", "Fatura / Emissão NF (VF01)"],
      tcodes: ["VA01", "VA02", "VA03", "VL01N", "VF01", "VK11"]
    },
    {
      code: "SAP FI",
      name: "Financial Accounting (Contabilidade Financeira)",
      icon: "fa-coins",
      color: "amber",
      desc: "Contabilidade geral (GL), contas a pagar (AP), contas a receber (AR), ativo fixo (AA) e demonstrativos financeiros.",
      coreProcesses: ["Lançamento Contábil (FB50)", "Contas a Pagar/Receber (F-02/F-28)", "Balanço & DRE (F.01)"],
      tcodes: ["FB50", "FB60", "FB70", "F-02", "FS00", "FBL1N", "FBL5N"]
    },
    {
      code: "SAP CO",
      name: "Controlling (Controladoria & Custos)",
      icon: "fa-chart-pie",
      color: "purple",
      desc: "Contabilidade de centros de custos, ordens internas, análise de rentabilidade (CO-PA) e custeio de produtos.",
      coreProcesses: ["Centro de Custo (KS01)", "Ordem Interna (KO01)", "Rateios & Alocações Periódicas"],
      tcodes: ["KS01", "KS02", "KO01", "KOB1", "KB11N"]
    },
    {
      code: "SAP PP",
      name: "Production Planning (Planejamento de Produção)",
      icon: "fa-industry",
      color: "rose",
      desc: "Planejamento de necessidades de materiais (MRP), ordens de produção, lista técnica de materiais (BOM) e roteiros.",
      coreProcesses: ["Execução do MRP (MD01)", "Ordem de Produção (CO01)", "Apontamento de Produção (CO11N)"],
      tcodes: ["MD01", "CO01", "CO11N", "CS01", "CR01"]
    },
    {
      code: "SAP HCM",
      name: "Human Capital Management (Recursos Humanos)",
      icon: "fa-users-gear",
      color: "indigo",
      desc: "Administração de pessoal, folha de pagamento, controle de ponto, benefícios e desenvolvimento de talentos.",
      coreProcesses: ["Infotipos de Pessoal (PA30)", "Cálculo de Folha", "Gestão de Estrutura Organizacional"],
      tcodes: ["PA30", "PA20", "PPOME", "PTMW"]
    }
  ],

  // TOP TRANSAÇÕES ESSENCIAIS (T-CODES)
  topTCodes: [
    { code: "SE38 / SE80", category: "ABAP Dev", desc: "ABAP Editor & Object Navigator (desenvolvimento de programas, classes, includes e telas)." },
    { code: "SE11", category: "ABAP Dev", desc: "ABAP Data Dictionary (criação e consulta de tabelas transparentes, estruturas, domínios e views)." },
    { code: "SE37", category: "ABAP Dev", desc: "Function Builder (desenvolvimento e teste de Function Modules e BAPIs)." },
    { code: "SE24", category: "ABAP Dev", desc: "Class Builder (programação orientada a objetos - Classes e Interfaces ABAP OO)." },
    { code: "SE16N", category: "Dados & Consulta", desc: "General Table Display (visualizador rápido de registros de tabelas do banco de dados)." },
    { code: "ST22", category: "Troubleshooting", desc: "ABAP Dump Analysis (análise detalhada de erros em tempo de execução e crashes do sistema)." },
    { code: "ST05", category: "Performance", desc: "Performance Trace (rastreamento de chamadas SQL, buffers e RFCs para otimização)." },
    { code: "SM30", category: "Customizing", desc: "Call View Maintenance (manutenção de tabelas Z e visões de parametrização)." },
    { code: "SM37", category: "Operação", desc: "Overview of Background Jobs (monitoramento e cancelamento de jobs em segundo plano)." },
    { code: "SM50 / SM66", category: "Basis & Admin", desc: "Work Process Overview (monitoramento de processos ativos na instância do servidor)." },
    { code: "SEGW", category: "OData & Fiori", desc: "SAP Gateway Service Builder (criação de serviços OData REST para consumo no SAP Fiori/UI5)." },
    { code: "SPRO", category: "Consultoria", desc: "SAP Customizing Implementation Guide (árvore oficial de parametrização de todos os módulos)." }
  ],

  // SINTAXE MODERNA ABAP 7.4+ vs ANTIGA
  abapModernSyntax: [
    {
      concept: "Declaração Inline de Variáveis",
      oldSyntax: "DATA: lv_nome TYPE string.\nlv_nome = 'Maria'.",
      newSyntax: "DATA(lv_nome) = 'Maria'.\nDATA(lv_taxa) = 0.15.",
      benefit: "Elimina blocos gigantescos de declaração no início do programa."
    },
    {
      concept: "Construção de Estruturas / Linhas (VALUE)",
      oldSyntax: "DATA: ls_item TYPE ty_item.\nls_item-id = 1.\nls_item-nome = 'Notebook'.",
      newSyntax: "DATA(ls_item) = VALUE ty_item( id = 1  nome = 'Notebook' ).",
      benefit: "Instanciação expressiva e imutável em uma única linha legível."
    },
    {
      concept: "Preenchimento de Tabelas Internas",
      oldSyntax: "DATA: lt_tab TYPE STANDARD TABLE OF ty_item.\nAPPEND ls_item1 TO lt_tab.\nAPPEND ls_item2 TO lt_tab.",
      newSyntax: "DATA(lt_tab) = VALUE ty_items(\n  ( id = 1 nome = 'Notebook' )\n  ( id = 2 nome = 'Mouse' )\n).",
      benefit: "Criação de mockups e preenchimento de tabelas em bloco elegante."
    },
    {
      concept: "Leitura Direta de Tabela com Fallback (OPTIONAL)",
      oldSyntax: "READ TABLE lt_tab INTO DATA(ls_row) WITH KEY id = 1.\nIF sy-subrc = 0.\n  lv_res = ls_row-nome.\nENDIF.",
      newSyntax: "DATA(lv_res) = VALUE #( lt_tab[ id = 1 ]-nome OPTIONAL ).",
      benefit: "Sem necessidade de checar sy-subrc manualmente para leituras seguras."
    },
    {
      concept: "Mapeamento entre Estruturas (CORRESPONDING)",
      oldSyntax: "MOVE-CORRESPONDING ls_origem TO ls_destino.",
      newSyntax: "DATA(ls_destino) = CORRESPONDING ty_destino( ls_origem ).",
      benefit: "Retorna a nova estrutura tipada com mapeamento explícito de campos."
    }
  ]
};

let currentSapTab = "overview";
let currentTcodeFilter = "";

function switchSapTab(tab) {
  currentSapTab = tab;
  const container = document.getElementById("main-content-area");
  if (container) renderSapAbapTab(container);
}

function handleTcodeSearch(val) {
  currentTcodeFilter = val.toLowerCase().trim();
  const grid = document.getElementById("tcodes-grid");
  if (!grid) return;

  const rows = grid.querySelectorAll(".tcode-card");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (!currentTcodeFilter || text.includes(currentTcodeFilter)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function copySapCode(codeId) {
  const elem = document.getElementById(codeId);
  if (!elem) return;
  const text = elem.textContent || elem.innerText;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast("Código ABAP copiado para a área de transferência!", "success");
      } else {
        alert("Código copiado!");
      }
    });
  } else {
    prompt("Copie o código:", text);
  }
}

function renderSapAbapTab(container) {
  if (!container) return;

  let html = `
    <div class="space-y-6 pb-12 animate-fade-in">
      
      <!-- HERO HEADER SAP & ABAP -->
      <div class="rounded-3xl p-6 sm:p-8 shadow-xl" style="background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #090d16 100%) !important; color: #ffffff !important; border: 1px solid #1e293b !important; position: relative; overflow: hidden;">
        
        <!-- Glow accents -->
        <div style="position: absolute; right: -40px; bottom: -40px; width: 350px; height: 350px; background: rgba(59, 130, 246, 0.12); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
        <div style="position: absolute; left: -40px; top: -40px; width: 350px; height: 350px; background: rgba(245, 158, 11, 0.12); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>

        <div style="position: relative; z-index: 2;">
          <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div class="space-y-2 max-w-2xl">
              <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
                <span class="badge rounded-pill px-3 py-1 text-xs fw-bold tracking-wide" style="background: rgba(59, 130, 246, 0.2) !important; color: #60a5fa !important; border: 1px solid rgba(59, 130, 246, 0.5) !important;">
                  <i class="fa-solid fa-server mr-1"></i> SAP S/4HANA & ABAP CLOUD
                </span>
                <span class="badge rounded-pill px-2.5 py-1 text-xs fw-bold" style="background: rgba(245, 158, 11, 0.2) !important; color: #fbbf24 !important; border: 1px solid rgba(245, 158, 11, 0.5) !important;">
                  <i class="fa-solid fa-money-bill-trend-up mr-1"></i> SALÁRIOS: R$ 8K - R$ 35K+/MÊS
                </span>
              </div>
              
              <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight m-0" style="color: #ffffff !important;">
                Academia SAP & ABAP <span style="color: #38bdf8 !important; text-shadow: 0 0 25px rgba(56, 189, 248, 0.4);">Enterprise Hub</span>
              </h1>
              
              <p class="text-sm sm:text-base leading-relaxed m-0" style="color: #cbd5e1 !important;">
                Guia definitivo para consultores funcionais (MM, SD, FI, CO, PP) e desenvolvedores ABAP modernos. Do legado ECC ao S/4HANA, CDS Views e integrações com Python.
              </p>
            </div>

            <!-- BOTÕES DE ATALHO -->
            <div class="d-flex flex-wrap flex-lg-column gap-2.5 shrink-0">
              <button onclick="switchSapTab('materials')" 
                      class="btn fw-bold px-4 py-2.5 rounded-xl shadow-lg border-0 d-flex align-items-center justify-content-center gap-2 text-sm transition-all"
                      style="background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%) !important; color: #ffffff !important; font-weight: 800 !important;">
                <i class="fa-solid fa-folder-open"></i> Acessar Cursos do Acervo
              </button>
              <button onclick="switchSapTab('syntax')" 
                      class="btn px-4 py-2 rounded-xl text-xs fw-semibold d-flex align-items-center justify-content-center gap-2 transition-all"
                      style="background-color: rgba(255,255,255,0.08) !important; color: #f1f5f9 !important; border: 1px solid #334155 !important;">
                <i class="fa-solid fa-code" style="color: #fbbf24;"></i> Cheat Sheet ABAP 7.4+
              </button>
            </div>
          </div>

          <!-- CARDS DE MÉTRICAS DO MERCADO SAP -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5" style="border-top: 1px solid #1e293b;">
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Mercado Global</div>
              <div class="text-lg sm:text-xl font-black mt-0.5" style="color: #38bdf8 !important;">90%+ Fortune 500</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Faixa Salarial Pleno</div>
              <div class="text-lg sm:text-xl font-black mt-0.5" style="color: #34d399 !important;">R$ 12k - R$ 18k</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Carreiras no Acervo</div>
              <div class="text-lg sm:text-xl font-black mt-0.5" style="color: #fbbf24 !important;">Funcional + Dev</div>
            </div>
            <div class="p-3 rounded-2xl" style="background-color: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;">
              <div class="text-[11px] uppercase tracking-wider font-semibold" style="color: #94a3b8 !important;">Migração Obrigatória</div>
              <div class="text-lg sm:text-xl font-black mt-0.5" style="color: #f472b6 !important;">ECC → S/4HANA</div>
            </div>
          </div>

        </div>
      </div>

      <!-- NAVEGAÇÃO DE SUB-ABAS SAP -->
      <div class="d-flex align-items-center justify-content-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2 overflow-x-auto py-1">
          <button 
            onclick="switchSapTab('overview')"
            class="btn btn-sm ${currentSapTab === 'overview' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-layer-group"></i>
            <span>Módulos Funcionais</span>
          </button>

          <button 
            onclick="switchSapTab('materials')"
            class="btn btn-sm ${currentSapTab === 'materials' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-cloud-arrow-down text-amber-500"></i>
            <span>Cursos no Acervo Drive de Pobre</span>
          </button>

          <button 
            onclick="switchSapTab('syntax')"
            class="btn btn-sm ${currentSapTab === 'syntax' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-code text-blue-500"></i>
            <span>Cheat Sheet ABAP 7.4+</span>
          </button>

          <button 
            onclick="switchSapTab('tcodes')"
            class="btn btn-sm ${currentSapTab === 'tcodes' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-terminal text-emerald-500"></i>
            <span>Top T-Codes Essenciais</span>
          </button>

          <button 
            onclick="switchSapTab('career')"
            class="btn btn-sm ${currentSapTab === 'career' ? 'btn-primary bg-indigo-600 text-white shadow-sm fw-bold' : 'btn-light text-slate-600 border border-slate-200'} rounded-xl px-3.5 py-2 text-xs d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-road text-purple-500"></i>
            <span>Plano de Carreira SAP</span>
          </button>
        </div>

        <a href="https://drivedepobre.com/search?q=SAP" target="_blank" rel="noopener noreferrer" 
           class="btn btn-sm btn-outline-primary border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100 rounded-xl px-3 py-2 text-xs fw-bold d-flex align-items-center gap-1.5 shadow-xs">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Buscar 'SAP' no Drive</span>
        </a>
      </div>
  `;

  // RENDERIZAÇÃO DAS SUB-ABAS
  if (currentSapTab === "overview") {
    html += `
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 m-0">Módulos Funcionais do Ecossistema SAP</h2>
          <p class="text-xs text-slate-500 m-0">Entenda os principais módulos corporativos e as transações mais utilizadas pelas empresas.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${SAP_ABAP_DATA.functionalModules.map(mod => `
            <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all d-flex flex-column justify-content-between h-full group">
              <div>
                <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div class="w-12 h-12 rounded-2xl bg-${mod.color}-50 text-${mod.color}-600 border border-${mod.color}-200 d-flex align-items-center justify-content-center text-lg font-black shadow-xs">
                    <i class="fa-solid ${mod.icon}"></i>
                  </div>
                  <span class="badge bg-slate-900 text-white rounded-pill px-2.5 py-1 text-xs font-mono font-bold">
                    ${mod.code}
                  </span>
                </div>

                <h3 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                  ${mod.name}
                </h3>
                
                <p class="text-xs text-slate-600 leading-relaxed mb-4">
                  ${mod.desc}
                </p>

                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 mb-3">
                  <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <i class="fa-solid fa-arrow-progress mr-1"></i> Principais Processos:
                  </div>
                  ${mod.coreProcesses.map(proc => `
                    <div class="text-xs text-slate-700 d-flex align-items-center gap-1.5">
                      <i class="fa-solid fa-angle-right text-indigo-500 text-[10px]"></i>
                      <span>${proc}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between flex-wrap gap-1">
                <div class="d-flex align-items-center gap-1 flex-wrap">
                  <span class="text-[10px] text-slate-400 fw-bold">T-Codes:</span>
                  ${mod.tcodes.slice(0, 4).map(tc => `
                    <span class="badge bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[9px] px-1.5 py-0.5 rounded">${tc}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentSapTab === "materials") {
    html += `
      <div class="space-y-6">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 class="text-lg font-bold text-slate-900 m-0">Materiais e Cursos SAP no Drive de Pobre</h2>
            <p class="text-xs text-slate-500 m-0">Cursos de formação em vídeo, mentorias e e-books disponíveis para streaming e download livre.</p>
          </div>
          <span class="badge bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-pill px-3 py-1 text-xs fw-bold">
            <i class="fa-solid fa-check-circle mr-1"></i> Links Verificados
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${SAP_ABAP_DATA.driveMaterials.map(mat => `
            <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all d-flex flex-column justify-content-between h-full">
              <div>
                <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">
                    ${mat.category}
                  </span>
                  <span class="badge bg-amber-50 text-amber-800 border border-amber-200 rounded-pill px-2 py-0.5 text-[10px] fw-bold">
                    ${mat.tag}
                  </span>
                </div>

                <div class="d-flex align-items-start gap-3 mb-3">
                  <div class="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 d-flex align-items-center justify-content-center text-base shrink-0 shadow-xs">
                    <i class="fa-solid fa-server"></i>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 leading-snug mb-1">${mat.title}</h3>
                    <div class="d-flex align-items-center gap-2 text-[11px] text-slate-400">
                      <span><i class="fa-solid fa-cube mr-1"></i>${mat.format}</span>
                      <span>•</span>
                      <span><i class="fa-solid fa-hard-drive mr-1"></i>${mat.size}</span>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-slate-600 leading-relaxed mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  ${mat.summary}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2">
                <button onclick="copyDriveLink('${mat.url}', '${mat.title}')" class="btn btn-sm btn-light border border-slate-200 text-slate-600 rounded-xl px-2.5 py-1.5 text-xs">
                  <i class="fa-solid fa-share-nodes"></i>
                </button>
                <a href="${mat.url}" target="_blank" rel="noopener noreferrer" 
                   class="btn btn-sm btn-primary bg-indigo-600 hover:bg-indigo-700 text-white fw-bold rounded-xl px-3.5 py-1.5 text-xs d-flex align-items-center gap-1.5 shadow-xs">
                  <span>Acessar no Drive</span>
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentSapTab === "syntax") {
    html += `
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 m-0">Cheat Sheet: ABAP Moderno (7.40 / 7.50+ & ABAP Cloud)</h2>
          <p class="text-xs text-slate-500 m-0">Comparativo prático da sintaxe legada vs as novas expressões modernas para código limpo e performático.</p>
        </div>

        <div class="space-y-4">
          ${SAP_ABAP_DATA.abapModernSyntax.map((item, idx) => `
            <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-indigo-600 text-white rounded-circle w-6 h-6 d-flex align-items-center justify-content-center text-xs fw-bold">
                    ${idx + 1}
                  </span>
                  <h3 class="text-sm font-bold text-slate-900 m-0">${item.concept}</h3>
                </div>
                <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-pill px-2.5 py-0.5 text-[11px] fw-semibold">
                  <i class="fa-solid fa-sparkles mr-1"></i> ${item.benefit}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- SINTAXE ANTIGA -->
                <div class="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                  <div class="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> Sintaxe Antiga (Antes do 7.40):
                  </div>
                  <pre class="m-0 p-2.5 rounded-xl bg-slate-900 text-rose-300 font-monospace text-xs overflow-x-auto leading-relaxed"><code>${item.oldSyntax}</code></pre>
                </div>

                <!-- SINTAXE MODERNA -->
                <div class="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      <i class="fa-solid fa-check-circle mr-1"></i> Sintaxe Moderna (7.40+ / Clean ABAP):
                    </div>
                    <button onclick="copySapCode('abap-code-${idx}')" class="btn btn-xs btn-link text-emerald-700 p-0 text-[11px] text-decoration-none">
                      <i class="fa-solid fa-copy mr-1"></i> Copiar
                    </button>
                  </div>
                  <pre id="abap-code-${idx}" class="m-0 p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-monospace text-xs overflow-x-auto leading-relaxed"><code>${item.newSyntax}</code></pre>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentSapTab === "tcodes") {
    html += `
      <div class="space-y-5">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900 m-0">Top Transações Essenciais (T-Codes)</h2>
            <p class="text-xs text-slate-500 m-0">Os comandos mais importantes para o dia a dia de desenvolvedores e consultores.</p>
          </div>
          
          <div class="relative w-full md:w-72">
            <i class="fa-solid fa-magnifying-glass position-absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              oninput="handleTcodeSearch(this.value)" 
              placeholder="Filtrar por T-Code ou descrição..." 
              class="form-control pl-8 pr-3 py-2 text-xs rounded-xl border-slate-200"
            >
          </div>
        </div>

        <div id="tcodes-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${SAP_ABAP_DATA.topTCodes.map(tc => `
            <div class="tcode-card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-colors space-y-2">
              <div class="d-flex align-items-center justify-content-between">
                <span class="font-monospace fw-bold text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1">
                  /n${tc.code}
                </span>
                <span class="badge bg-slate-100 text-slate-600 text-[10px] rounded-pill px-2 py-0.5">
                  ${tc.category}
                </span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed m-0">
                ${tc.desc}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (currentSapTab === "career") {
    html += `
      <div class="space-y-6">
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-3 py-1 text-xs fw-bold">
              <i class="fa-solid fa-graduation-cap mr-1"></i> ROTEIRO ESTRATÉGICO
            </span>
            <h2 class="text-xl font-black text-slate-900 mt-2 mb-1">Roteiro de Carreira: De Trainee a Especialista SAP</h2>
            <p class="text-xs text-slate-500 m-0">Como construir uma carreira de alto valor e conquistar projetos no Brasil e no exterior.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="w-8 h-8 rounded-xl bg-slate-900 text-white d-flex align-items-center justify-content-center text-xs font-bold">1</div>
              <h4 class="text-sm font-bold text-slate-900">Fundamentos & Processos de Negócio</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Antes de programar, entenda como as empresas compram (MM), vendem (SD) e faturam (FI). Assista aos cursos de Fundamentos no Acervo.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-xs font-bold">2</div>
              <h4 class="text-sm font-bold text-slate-900">ABAP Moderno & CDS Views</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Domine Data Dictionary (SE11), Relatórios ALV, ABAP OO, CDS Views e o modelo RAP para S/4HANA.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white d-flex align-items-center justify-content-center text-xs font-bold">3</div>
              <h4 class="text-sm font-bold text-slate-900">Fiori, OData & Automação Python</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Crie serviços OData (SEGW) e automatize rotinas corporativas com Python Scripting para se destacar no mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  html += `
      <!-- BANNER DE INTEGRAÇÃO COM DRIVE DE POBRE -->
      <div class="p-6 rounded-3xl text-white d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 shadow-md" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important; border: 1px solid #334155 !important;">
        <div class="space-y-1">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-graduation-cap text-amber-400"></i>
            <span class="text-xs font-bold uppercase tracking-wider text-amber-300">Hub de Capacitação Enterprise</span>
          </div>
          <h3 class="text-base font-bold text-white m-0">Quer explorar mais cursos e livros SAP?</h3>
          <p class="text-xs text-slate-300 m-0 max-w-2xl">Mais de 15 GB de treinamentos de SAP, S/4HANA, Activate e automação estão disponíveis no Drive de Pobre de forma aberta.</p>
        </div>
        <a href="https://drivedepobre.com/search?q=SAP" target="_blank" rel="noopener noreferrer" 
           class="btn fw-bold px-4 py-2.5 rounded-xl text-xs d-flex align-items-center justify-content-center gap-2 shrink-0"
           style="background-color: #f59e0b !important; color: #000000 !important; font-weight: 800 !important;">
          <span>Explorar no Drive de Pobre</span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>

    </div>
  `;

  container.innerHTML = html;
}

if (typeof window !== 'undefined') {
  window.SAP_ABAP_DATA = SAP_ABAP_DATA;
  window.renderSapAbapTab = renderSapAbapTab;
  window.switchSapTab = switchSapTab;
  window.handleTcodeSearch = handleTcodeSearch;
  window.copySapCode = copySapCode;
}

console.log('[Page] SAP & ABAP Academy module loaded successfully.');
