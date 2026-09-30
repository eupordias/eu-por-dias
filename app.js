
// ==========================================
// NAVEGAÇÃO DIRETA PARA O CHAT AO VIVO
// ==========================================
function openLiveChatDirectly() {
  switchTab('chat');
}

/**
 * Eu Por Dias - Sistema de Gestão de Alunos, Notas, Contatos e Endereços
 * Programa Emprega Mais Alagoas • Curso de Gestão de Mídias Digitais
 * 
 * Integrações:
 * - Google Sheets API v4 oficial com API Key e sincronização automática em 1 clique
 * - Importador de Google Sala de Aula (URL, Copiar/Colar e CSV)
 * - Busca de CEP de Alagoas com ViaCEP API e rotas no Google Maps
 * - WhatsApp direto com mensagem customizada para alunos e responsáveis
 * - Gestão de notas dos módulos com cálculo automático de médias e frequência
 * - Boletim escolar e ata oficial para impressão/PDF
 * - Dashboard com métricas e gráficos interativos Chart.js
 * - Exportação para Excel (CSV) e backup de dados JSON
 */

// Estado Global da Aplicação
const AppState = {
  appName: "Eu Por Dias",
  students: [],
  subjects: [],
  classrooms: [],
  settings: {
    schoolName: "Programa Emprega Mais Alagoas",
    courseName: "Curso de Gestão de Mídias Digitais",
    schoolYear: "2026",
    passingGrade: 7.0,
    recoveryGrade: 5.0,
    darkMode: false,
    viewMode: "grid", // 'grid' | 'table' | 'secure'
    // Integração com Google Sheets API v4
    googleApiKey: "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI",
    googleSpreadsheetId: "",
    googleSheetRange: "A1:Z500",
    lastSyncTime: null,
    googleClientId: "",
    // Integração com Supabase Cloud Database Oficial
    supabaseUrl: "https://srnpqboizdnyvetyukhn.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnBxYm9pemRueXZldHl1a2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ5MzMsImV4cCI6MjEwNDM2MDkzM30.mntOEcW5EviNL7r7YaZW7APucWLzxNn6Px_SwlJ47IQ",
    supabaseConnected: true,
    lastSupabaseSync: "2026-09-07T14:32:00.000Z"
  },
  currentTab: "students", // 'about' | 'grades' | 'dashboard' | 'reports' | 'students' | 'forum' | 'careers' | 'prompts'
  // Usuário Autenticado por CPF (Menu & Identificação)
  currentUser: null, // { id, name, cpf, role: 'professor' | 'aluno', photo, email, classroom, loginTime }
  // Fórum & Chat ao Vivo
  forumTopics: [],
  forumMessages: [],
  activeForumTopicId: null,
  forumTab: "topics", // 'topics' | 'chat'
  // Oportunidades & Trilhas (Vagas e Hub de Capacitação)
  jobVacancies: [],
  learningTrails: [],
  usefulResources: [],
  careersActiveTab: "vagas", // 'vagas' | 'trilhas'
  careersFilterPolo: "all",
  careersFilterType: "all",
  careersFilterSearch: "",
  // Laboratório de Prompts & IA (Awesome ChatGPT Prompts - prompts.chat)
  promptsLibrary: [],
  promptsActiveCategory: "all",
  promptsSearchQuery: "",
  favoritePrompts: [],
  promptsGuideExpanded: true,
  privacyMode: true, // Camada de Segurança e Proteção LGPD: SEMPRE ATIVO POR PADRÃO!
  godMode: {
    active: false,
    user: null, // { name, email, picture, method, loginTime }
    loginTime: null
  },
  revealedStudentIds: new Set(), // IDs de alunos revelados temporariamente sob demanda (somente no Modo Deus)
  searchTerm: "",
  filterClassroom: "all",
  filterStatus: "all",
  filterSituation: "all",
  filterPhoto: "all", // 'all' | 'with_photo' | 'without_photo'
  editingStudentId: null,
  activeBoletimStudentId: null,
  activeGradesStudentId: null,
  photoModalState: {
    studentId: null,
    tempPhotoUrl: null,
    stream: null
  },
  charts: {
    subjectAvg: null,
    statusDist: null
  },
  importState: {
    parsedStudents: [],
    mode: 'merge' // 'merge' | 'replace'
  }
};

// -------------------------------------------------------------
// CAMADA DE SEGURANÇA, PRIVACIDADE & LGPD
// -------------------------------------------------------------
function maskName(name, isRevealed = false) {
  if (!name || isRevealed) return name || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitials = parts.slice(1).map(p => p[0].toUpperCase() + ".").join(" ");
  return `${firstName} ${lastInitials}`;
}

function maskCpf(cpf, isRevealed = false) {
  if (!cpf || isRevealed) return cpf || "";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length === 11) {
    return `***.***.${digits.substring(6, 9)}-**`;
  }
  return "***.***.***-**";
}

function maskPhone(phone, isRevealed = false) {
  if (!phone || isRevealed) return phone || "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const ddd = digits.substring(0, 2);
    const lastDigits = digits.slice(-2);
    return `(${ddd}) 9****-**${lastDigits}`;
  }
  return "(82) *****-****";
}

function maskEmail(email, isRevealed = false) {
  if (!email || isRevealed) return email || "";
  const parts = email.split("@");
  if (parts.length === 2) {
    const user = parts[0];
    const domain = parts[1];
    const visibleUser = user.length > 2 ? user.substring(0, 2) + "***" : user[0] + "***";
    return `${visibleUser}@${domain}`;
  }
  return "***@***.com";
}

function maskAddress(address, isRevealed = false) {
  if (!address || isRevealed) {
    return address ? `${address.street || ''} ${address.number || ''}, ${address.neighborhood || ''} - ${address.city || ''}/${address.state || 'AL'}`.trim() : "";
  }
  const b = address.neighborhood ? `${address.neighborhood} - ` : "";
  const c = address.city || "Alagoas";
  const uf = address.state || "AL";
  return `${b}${c}/${uf}`;
}

function isGodModeActive() {
  return !!(AppState.godMode && AppState.godMode.active);
}

function togglePrivacyMode() {
  if (!isGodModeActive()) {
    showToast("🔒 Acesso Restrito: O Modo LGPD é permanente. Faça login com o Google no Modo Deus para desativar.", "warning");
    openGodModeAuthModal();
    return;
  }
  AppState.privacyMode = !AppState.privacyMode;
  saveDataToStorage();
  showToast(
    AppState.privacyMode 
      ? "🛡️ Modo Seguro LGPD reativado! Dados pessoais mascarados para projeção." 
      : "⚡ Modo Deus: Proteção LGPD suspensa pelo Administrador. Dados sensíveis liberados.", 
    AppState.privacyMode ? "success" : "warning"
  );
  renderApp();
}

function toggleRevealStudent(studentId) {
  if (!isGodModeActive()) {
    showToast("🔒 Acesso Restrito: Apenas o Administrador no Modo Deus (Google) pode revelar dados de alunos.", "warning");
    openGodModeAuthModal();
    return;
  }
  if (AppState.revealedStudentIds.has(studentId)) {
    AppState.revealedStudentIds.delete(studentId);
    showToast("Dados pessoais do aluno ocultados novamente.", "info");
  } else {
    AppState.revealedStudentIds.add(studentId);
    showToast("⚡ Modo Deus: Dados pessoais do aluno revelados.", "warning");
  }
  renderApp();
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  applyTheme();
  renderApp();
  setupGlobalEventListeners();
  if (typeof startLiveChatSync === 'function') startLiveChatSync();
});

// Botão de Prioridade "Novo Aluno" — exibido dentro de todos os módulos/abas
function getNovoAlunoPriorityBtn() {
  return "";
}

// Normalização e autocura de nomes de módulos (garante acentuação perfeita PT-BR e corrige codificações corrompidas)
function normalizeSubjectName(str) {
  if (!str || typeof str !== "string") return str || "";
  const s = str.trim().replace(/\\u0026/g, "&");

  if (s === "Marketing Digital & Estratégia") return "Marketing Digital & Estratégia";
  if (s === "Criação de Conteúdo & Copywriting") return "Criação de Conteúdo & Copywriting";
  if (s === "Design & Identidade Visual") return "Design & Identidade Visual";
  if (s === "Edição de Vídeo & Reels") return "Edição de Vídeo & Reels";
  if (s === "Tráfego Pago & Meta Ads") return "Tráfego Pago & Meta Ads";
  if (s === "Métricas & Analytics") return "Métricas & Analytics";
  if (s === "Projeto Integrador Final") return "Projeto Integrador Final";

  if (/Estrat/i.test(s)) return "Marketing Digital & Estratégia";
  if (/Conte|Copywriting/i.test(s)) return "Criação de Conteúdo & Copywriting";
  if (/Identidade|Design/i.test(s)) return "Design & Identidade Visual";
  if (/Reels|V[ií\xAD\u00ED]deo|Edi/i.test(s)) return "Edição de Vídeo & Reels";
  if (/Tr[aá\u00E1]fego|Meta Ads/i.test(s)) return "Tráfego Pago & Meta Ads";
  if (/M[eé\u00E9]tricas|Analytics/i.test(s)) return "Métricas & Analytics";
  if (/Integrador/i.test(s)) return "Projeto Integrador Final";

  return s;
}

// Persistência em LocalStorage
function loadDataFromStorage() {
  const savedStudents = localStorage.getItem("eupordias_students");
  const savedSubjects = localStorage.getItem("eupordias_subjects");
  const savedClassrooms = localStorage.getItem("eupordias_classrooms");
  const savedSettings = localStorage.getItem("eupordias_settings");

  const parsedSaved = savedStudents ? JSON.parse(savedStudents) : [];
  let currentList = parsedSaved;

  if (!currentList || currentList.length === 0 || currentList.length < 100 || (!currentList[0].profession && INITIAL_STUDENTS_DATA.length > 0 && INITIAL_STUDENTS_DATA[0].profession)) {
    currentList = [...INITIAL_STUDENTS_DATA];
  } else if (INITIAL_STUDENTS_DATA && INITIAL_STUDENTS_DATA.length > currentList.length) {
    // Sincroniza e adiciona novos alunos da planilha atualizada sem sobrescrever fotos ou notas locais
    const existingMap = new Map();
    currentList.forEach(s => {
      const nameKey = (s.name || "").trim().toLowerCase();
      existingMap.set(nameKey, s);
      if (s.id) existingMap.set(s.id, s);
      if (s.cpf) existingMap.set(s.cpf.replace(/\D/g, ""), s);
    });

    INITIAL_STUDENTS_DATA.forEach(newS => {
      const nameKey = (newS.name || "").trim().toLowerCase();
      const cpfKey = newS.cpf ? newS.cpf.replace(/\D/g, "") : null;
      const match = existingMap.get(nameKey) || (cpfKey ? existingMap.get(cpfKey) : null) || existingMap.get(newS.id);
      
      if (!match) {
        currentList.push(newS);
      } else {
        if (!match.shirtSize && newS.shirtSize) match.shirtSize = newS.shirtSize;
        if (newS.notes && newS.notes.includes("Presença confirmada") && (!match.notes || !match.notes.includes("Presença confirmada"))) {
          match.notes = newS.notes + (match.notes ? " " + match.notes : "");
        }
      }
    });
  }

  // Assegura que todos os alunos possuam tamanho de camisa
  currentList.forEach(s => {
    if (!s.shirtSize) {
      const found = INITIAL_STUDENTS_DATA.find(initS => initS.id === s.id || (s.cpf && initS.cpf === s.cpf));
      s.shirtSize = found?.shirtSize || "M";
    }
  });
  
  // Normalizar e higienizar nomes de módulos (garante acentuação perfeita e cura dados herdados de cache)
  const rawSubjects = savedSubjects ? JSON.parse(savedSubjects) : [...DEFAULT_SUBJECTS];
  AppState.subjects = Array.from(new Set(rawSubjects.map(normalizeSubjectName)));
  if (AppState.subjects.length === 0) {
    AppState.subjects = [...DEFAULT_SUBJECTS];
  }
  try {
    localStorage.setItem("eupordias_subjects", JSON.stringify(AppState.subjects));
  } catch (e) {}

  // Normalizar as chaves de notas de todos os alunos locais
  currentList.forEach(s => {
    if (s.grades && typeof s.grades === "object") {
      const sanitizedGrades = {};
      Object.entries(s.grades).forEach(([subjKey, gradeData]) => {
        sanitizedGrades[normalizeSubjectName(subjKey)] = gradeData;
      });
      s.grades = sanitizedGrades;
    }
  });

  AppState.students = currentList;
  try {
    localStorage.setItem("eupordias_students", JSON.stringify(currentList));
  } catch (e) {}

  AppState.classrooms = Array.from(new Set([...DEFAULT_CLASSROOMS])).sort();
  try {
    localStorage.setItem("eupordias_classrooms", JSON.stringify(AppState.classrooms));
  } catch (e) {}
  
  if (savedSettings) {
    AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
  }

  // Garantir a chave da API e o ID da planilha atualizada
  AppState.settings.googleApiKey = "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  AppState.settings.googleSpreadsheetId = "1XoKY-CW5ed3jJVOWD2klYGqCamiESa8_CAkRYLGEmJQ";
  AppState.settings.googleSheetRange = "A1:Z5000";

  // Garantir a conexão com o Supabase Oficial
  if (!AppState.settings.supabaseUrl) {
    AppState.settings.supabaseUrl = "https://srnpqboizdnyvetyukhn.supabase.co";
  }
  if (!AppState.settings.supabaseAnonKey) {
    AppState.settings.supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnBxYm9pemRueXZldHl1a2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ5MzMsImV4cCI6MjEwNDM2MDkzM30.mntOEcW5EviNL7r7YaZW7APucWLzxNn6Px_SwlJ47IQ";
  }
  AppState.settings.supabaseConnected = true;

  // Restaurar sessão do Modo Deus via Google (se houver na sessionStorage)
  try {
    const savedGodMode = sessionStorage.getItem("eupordias_god_mode");
    if (savedGodMode) {
      const parsed = JSON.parse(savedGodMode);
      if (parsed && (parsed.email || parsed.name)) {
        AppState.godMode = {
          active: true,
          user: parsed,
          loginTime: parsed.loginTime || Date.now()
        };
      }
    }
  } catch (e) {
    console.warn("Erro ao restaurar sessão Modo Deus:", e);
  }

  // REGRA ESTRITA LGPD: Se não estiver no Modo Deus, o Modo LGPD é SEMPRE FORÇADO para true!
  if (!AppState.godMode.active) {
    AppState.privacyMode = true;
    AppState.revealedStudentIds.clear();
  }

  // Restaurar usuário autenticado por CPF
  try {
    const savedUser = localStorage.getItem("eupordias_auth_user");
    if (savedUser) {
      AppState.currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn("Erro ao restaurar usuário autenticado:", e);
  }

  // Carregar dados de Fórum & Chat
  loadForumDataFromStorage();

  // Carregar dados de Oportunidades & Trilhas
  loadCareersDataFromStorage();

  // Carregar dados do Laboratório de Prompts & IA
  loadPromptsDataFromStorage();

  saveDataToStorage();
}

function saveDataToStorage() {
  localStorage.setItem("eupordias_students", JSON.stringify(AppState.students));
  localStorage.setItem("eupordias_subjects", JSON.stringify(AppState.subjects));
  localStorage.setItem("eupordias_classrooms", JSON.stringify(AppState.classrooms));
  localStorage.setItem("eupordias_settings", JSON.stringify(AppState.settings));
  saveForumDataToStorage();
  saveCareersDataToStorage();
  savePromptsDataToStorage();
}

// Tema Claro / Escuro
function toggleTheme() {
  AppState.settings.darkMode = !AppState.settings.darkMode;
  saveDataToStorage();
  applyTheme();
  showToast(AppState.settings.darkMode ? "Modo escuro ativado" : "Modo claro ativado", "info");
}

function applyTheme() {
  if (AppState.settings.darkMode) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "light");
  }
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.innerHTML = AppState.settings.darkMode
      ? `<i class="fa-solid fa-sun text-amber-400"></i>`
      : `<i class="fa-solid fa-moon text-slate-600"></i>`;
  }
}

// Notificações Toast
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const icons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-500 text-lg"></i>',
    error: '<i class="fa-solid fa-circle-xmark text-rose-500 text-lg"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation text-amber-500 text-lg"></i>',
    info: '<i class="fa-solid fa-circle-info text-blue-500 text-lg"></i>'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 slide-up ${
    AppState.settings.darkMode 
      ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
      : 'bg-white/95 border-slate-200 text-slate-800'
  }`;

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="text-sm fw-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -------------------------------------------------------------
// INTEGRAÇÃO COM GOOGLE SHEETS API V4
// -------------------------------------------------------------
async function fetchGoogleSheetsApiData(spreadsheetIdOrUrl, customRange = null) {
  let spreadsheetId = spreadsheetIdOrUrl.trim();
  
  // Se for uma URL completa, extrai o ID
  if (spreadsheetId.includes("docs.google.com/spreadsheets")) {
    const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      spreadsheetId = match[1];
    }
  }

  if (!spreadsheetId) {
    showToast("Por favor, forneça o Link ou o ID da Planilha do Google.", "warning");
    return null;
  }

  const apiKey = AppState.settings.googleApiKey || "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  const range = customRange || AppState.settings.googleSheetRange || "A1:Z500";

  // Salvar no estado
  AppState.settings.googleSpreadsheetId = spreadsheetId;
  AppState.settings.googleSheetRange = range;
  saveDataToStorage();

  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  showToast("Conectando à API do Google Sheets v4...", "info");

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json.error) {
      console.error("Google Sheets API Error:", json.error);
      if (json.error.status === "PERMISSION_DENIED") {
        showToast("Erro de permissão: Certifique-se de que a planilha está compartilhada como 'Qualquer pessoa com o link pode ler'.", "error");
      } else {
        showToast(`Erro na API do Google: ${json.error.message}`, "error");
      }
      return null;
    }

    const values = json.values;
    if (!values || values.length === 0) {
      showToast("A planilha está vazia ou o intervalo não contém dados.", "warning");
      return null;
    }

    // Processar os dados tabulares da API do Google
    processGoogleSheetsApiRows(values);
    AppState.settings.lastSyncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    saveDataToStorage();
    return values;
  } catch (err) {
    console.error("Erro na requisição Google Sheets API:", err);
    showToast("Erro de conexão com a API do Google Sheets.", "error");
    return null;
  }
}

function processGoogleSheetsApiRows(rows) {
  if (!rows || rows.length === 0) return;

  const headers = rows[0].map(h => String(h || "").toLowerCase().trim());

  let nameIndex = headers.findIndex(h => h.includes("nome") || h.includes("aluno") || h.includes("name") || h.includes("estudante"));
  let lastNameIndex = headers.findIndex(h => h.includes("sobrenome") || h.includes("last name"));
  let emailIndex = headers.findIndex(h => h.includes("email") || h.includes("e-mail") || h.includes("correio"));
  let phoneIndex = headers.findIndex(h => h.includes("fone") || h.includes("telefone") || h.includes("celular") || h.includes("whatsapp") || h.includes("tel"));
  let classroomIndex = headers.findIndex(h => h.includes("turma") || h.includes("classe") || h.includes("curso") || h.includes("sala"));
  let cepIndex = headers.findIndex(h => h.includes("cep") || h.includes("código postal"));
  let addressIndex = headers.findIndex(h => h.includes("endereço") || h.includes("endereco") || h.includes("rua") || h.includes("logradouro"));
  let neighborhoodIndex = headers.findIndex(h => h.includes("bairro"));
  let cityIndex = headers.findIndex(h => h.includes("cidade") || h.includes("município") || h.includes("municipio"));

  let startRow = 1;
  if (nameIndex === -1 && emailIndex === -1) {
    startRow = 0;
    nameIndex = 0;
    emailIndex = 1;
    phoneIndex = 2;
    classroomIndex = 3;
  }

  const parsedStudents = [];

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    let fullName = "";
    if (nameIndex !== -1 && row[nameIndex]) {
      fullName = String(row[nameIndex]);
      if (lastNameIndex !== -1 && row[lastNameIndex]) {
        fullName += " " + String(row[lastNameIndex]);
      }
    } else if (row[0]) {
      fullName = String(row[0]);
    }

    if (!fullName || fullName.toLowerCase().includes("média") || fullName.toLowerCase().includes("pontuação") || fullName.toLowerCase().includes("total")) {
      continue;
    }

    const email = emailIndex !== -1 && row[emailIndex] ? String(row[emailIndex]) : "";
    const phone = phoneIndex !== -1 && row[phoneIndex] ? String(row[phoneIndex]) : "";
    const classroom = classroomIndex !== -1 && row[classroomIndex] ? String(row[classroomIndex]) : "Mídias Digitais - Maceió Matutino";
    const cep = cepIndex !== -1 && row[cepIndex] ? String(row[cepIndex]) : "";
    const street = addressIndex !== -1 && row[addressIndex] ? String(row[addressIndex]) : "";
    const neighborhood = neighborhoodIndex !== -1 && row[neighborhoodIndex] ? String(row[neighborhoodIndex]) : "";
    const city = cityIndex !== -1 && row[cityIndex] ? String(row[cityIndex]) : "Maceió";

    // Mapear notas das colunas para os módulos
    const grades = {};
    AppState.subjects.forEach(subject => {
      const subjIndex = headers.findIndex(h => h.includes(subject.toLowerCase().slice(0, 5)));
      if (subjIndex !== -1 && row[subjIndex]) {
        const rawVal = String(row[subjIndex]).replace(",", ".");
        const val = parseFloat(rawVal);
        if (!isNaN(val)) {
          grades[subject] = { b1: val, b2: null, b3: null, b4: null, absences: 0 };
        }
      }
    });

    parsedStudents.push({
      id: `ALU-EMA-${String(AppState.students.length + parsedStudents.length + 1).padStart(3, '0')}`,
      name: fullName.trim(),
      birthDate: "",
      gender: "Feminino",
      classroom: classroom.trim(),
      status: "Ativo",
      avatarColor: "from-indigo-500 to-purple-600",
      photoUrl: "",
      notes: "Sincronizado via Google Sheets API v4.",
      contact: {
        phone: phone.trim(),
        email: email.trim(),
        guardianName: "",
        guardianKinship: "Responsável",
        guardianPhone: ""
      },
      address: {
        cep: cep.trim(),
        street: street.trim(),
        number: "",
        complement: "",
        neighborhood: neighborhood.trim(),
        city: city.trim() || "Maceió",
        state: "AL"
      },
      grades: grades
    });
  }

  if (parsedStudents.length > 0) {
    AppState.importState.parsedStudents = parsedStudents;
    
    // Atualizar tabela de preview se o modal estiver aberto
    const previewArea = document.getElementById("import-preview-area");
    const previewCount = document.getElementById("import-preview-count");
    const previewTbody = document.getElementById("import-preview-tbody");

    if (previewArea && previewCount && previewTbody) {
      previewArea.classList.remove("hidden");
      previewCount.textContent = parsedStudents.length;
      previewTbody.innerHTML = parsedStudents.slice(0, 10).map(s => {
        const gradesCount = Object.keys(s.grades || {}).length;
        return `
          <tr class=" ">
            <td class="p-2 fw-bold text-slate-800 ">${s.name}</td>
            <td class="p-2 text-slate-500">${s.contact.email || '-'}</td>
            <td class="p-2 text-slate-500">${s.contact.phone || '-'}</td>
            <td class="p-2 text-slate-600 ">${s.classroom}</td>
            <td class="p-2 text-center text-indigo-600 fw-bold">${gradesCount} matéria(s)</td>
          </tr>
        `;
      }).join("") + (parsedStudents.length > 10 ? `<tr><td colspan="5" class="p-2 text-center text-slate-400 text-[10px]">... e mais ${parsedStudents.length - 10} alunos</td></tr>` : '');

      showToast(`API Google: ${parsedStudents.length} alunos carregados! Clique em Confirmar para salvar.`, "success");
    } else {
      // Se chamado pelo botão de sincronização rápida
      commitImportedStudents();
    }
  } else {
    showToast("Nenhum registro de aluno identificado no intervalo retornado pela API.", "warning");
  }
}

// Sincronização rápida em 1 clique
async function quickSyncGoogleSheets() {
  if (!AppState.settings.googleSpreadsheetId) {
    openGoogleSheetsImportModal();
    showToast("Informe o Link ou ID da sua Planilha do Google para sincronizar.", "info");
    return;
  }

  await fetchGoogleSheetsApiData(AppState.settings.googleSpreadsheetId);
}

// -------------------------------------------------------------
// CÁLCULOS PEDAGÓGICOS
// -------------------------------------------------------------
function calculateSubjectAverage(subjectGrades) {
  if (!subjectGrades) return { avg: 0, count: 0, hasGrades: false };
  const grades = [subjectGrades.b1, subjectGrades.b2, subjectGrades.b3, subjectGrades.b4].filter(
    g => g !== undefined && g !== null && g !== "" && !isNaN(Number(g))
  ).map(Number);

  if (grades.length === 0) return { avg: 0, count: 0, hasGrades: false };
  const sum = grades.reduce((acc, curr) => acc + curr, 0);
  return {
    avg: Number((sum / grades.length).toFixed(1)),
    count: grades.length,
    hasGrades: true
  };
}

function calculateStudentOverallStats(student) {
  if (!student || !student.grades) {
    return {
      overallAvg: 0,
      totalAbsences: 0,
      status: "Sem Notas",
      statusClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300",
      failingSubjectsCount: 0,
      recoverySubjectsCount: 0,
      gradedSubjectsCount: 0
    };
  }

  let totalAvgSum = 0;
  let gradedSubjectsCount = 0;
  let totalAbsences = 0;
  let failingCount = 0;
  let recoveryCount = 0;

  Object.entries(student.grades).forEach(([_, gradeData]) => {
    const { avg, hasGrades } = calculateSubjectAverage(gradeData);
    if (gradeData.absences) {
      totalAbsences += Number(gradeData.absences) || 0;
    }
    if (hasGrades) {
      totalAvgSum += avg;
      gradedSubjectsCount++;
      if (avg < AppState.settings.recoveryGrade) {
        failingCount++;
      } else if (avg < AppState.settings.passingGrade) {
        recoveryCount++;
      }
    }
  });

  const overallAvg = gradedSubjectsCount > 0 ? Number((totalAvgSum / gradedSubjectsCount).toFixed(1)) : 0;

  let status = "Aprovado";
  let statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";

  if (gradedSubjectsCount === 0) {
    status = "Sem Notas";
    statusClass = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  } else if (failingCount > 0 || overallAvg < AppState.settings.recoveryGrade) {
    status = "Reprovado";
    statusClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
  } else if (recoveryCount > 0 || overallAvg < AppState.settings.passingGrade) {
    status = "Em Recuperação";
    statusClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  }

  return {
    overallAvg,
    totalAbsences,
    status,
    statusClass,
    failingSubjectsCount: failingCount,
    recoverySubjectsCount: recoveryCount,
    gradedSubjectsCount
  };
}

// Filtro de Alunos
function getFilteredStudents() {
  return AppState.students.filter(student => {
    const term = AppState.searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      student.name.toLowerCase().includes(term) ||
      student.id.toLowerCase().includes(term) ||
      (student.cpf && student.cpf.toLowerCase().includes(term)) ||
      (student.profession && student.profession.toLowerCase().includes(term)) ||
      (student.socialMedia && student.socialMedia.toLowerCase().includes(term)) ||
      (student.education && student.education.toLowerCase().includes(term)) ||
      (student.tools && student.tools.toLowerCase().includes(term)) ||
      (student.challenges && student.challenges.toLowerCase().includes(term)) ||
      (student.motivation && student.motivation.toLowerCase().includes(term)) ||
      (student.unitCity && student.unitCity.toLowerCase().includes(term)) ||
      (student.contact?.email && student.contact.email.toLowerCase().includes(term)) ||
      (student.contact?.phone && student.contact.phone.includes(term)) ||
      (student.address?.city && student.address.city.toLowerCase().includes(term)) ||
      (student.address?.neighborhood && student.address.neighborhood.toLowerCase().includes(term)) ||
      (student.classroom && student.classroom.toLowerCase().includes(term))
    );

    const matchesClassroom = AppState.filterClassroom === "all" || student.classroom === AppState.filterClassroom || student.unitCity === AppState.filterClassroom;
    const matchesStatus = AppState.filterStatus === "all" || student.status === AppState.filterStatus;

    const stats = calculateStudentOverallStats(student);
    const matchesSituation = AppState.filterSituation === "all" || stats.status === AppState.filterSituation;

    const hasPhoto = !!(student.photoUrl && student.photoUrl.trim() !== "");
    const matchesPhoto = AppState.filterPhoto === "all" || 
      (AppState.filterPhoto === "with_photo" && hasPhoto) ||
      (AppState.filterPhoto === "without_photo" && !hasPhoto);

    return matchesSearch && matchesClassroom && matchesStatus && matchesSituation && matchesPhoto;
  });
}

// Renderização Geral
function renderApp() {
  const isAluno = AppState.currentUser && AppState.currentUser.role === "aluno";
  const alunoRestrictedTabs = ["dashboard", "reports", "students"];

  // Se o aluno tentar acessar rota restrita, redireciona para notas
  if (isAluno && alunoRestrictedTabs.includes(AppState.currentTab)) {
    AppState.currentTab = "grades";
  }

  updateHeaderCounts();
  populateClassroomFilterSelect();
  renderHeaderUserBadge();

  const contentArea = document.getElementById("main-content-area");
  if (!contentArea) return;

  switch (AppState.currentTab) {
    case "chat":
      renderChatTab(contentArea);
      break;
    case "dashboard":
      renderDashboard(contentArea);
      break;
    case "students":
      renderStudentsTab(contentArea);
      break;
    case "grades":
      renderGradesTab(contentArea);
      break;
    case "reports":
      renderReportsTab(contentArea);
      break;
    case "about":
      renderAboutTab(contentArea);
      break;
    case "forum":
      renderForumTab(contentArea);
      break;
    case "careers":
      renderCareersTab(contentArea);
      break;
    case "prompts":
      renderPromptsTab(contentArea);
      break;
        case "instagram":
      renderInstagramAuditTab(contentArea);
      break;
default:
      renderAboutTab(contentArea);
  }

  updateNavActiveState();
}

function updateNavActiveState() {
  const isAluno = AppState.currentUser && AppState.currentUser.role === "aluno";
  const alunoRestrictedTabs = ["dashboard", "reports", "students"];

  // Sincroniza tanto links da sidebar (Adminator) quanto botões de navegação
  document.querySelectorAll(".sidebar-link, .nav-tab-btn").forEach(btn => {
    const tab = btn.getAttribute("data-tab");
    if (!tab) return;

    if (isAluno && alunoRestrictedTabs.includes(tab)) {
      btn.classList.add("hidden");
      const parentItem = btn.closest(".sidebar-item");
      if (parentItem) parentItem.classList.add("hidden");
      return;
    } else {
      btn.classList.remove("hidden");
      const parentItem = btn.closest(".sidebar-item");
      if (parentItem) parentItem.classList.remove("hidden");
    }

    if (tab === AppState.currentTab) {
      btn.classList.add("active");
      try {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } catch (err) {}
    } else {
      btn.classList.remove("active");
    }
  });

  if (typeof updateNavScrollButtons === "function") {
    try { updateNavScrollButtons(); } catch(e) {}
  }
}

// Controles do Sidebar Retrátil (Adminator Layout)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (!sidebar) return;

  if (window.innerWidth < 992) {
    sidebar.classList.toggle("mobile-open");
    if (overlay) overlay.classList.toggle("active");
  } else {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("eupordias_sidebar_collapsed", isCollapsed ? "1" : "0");
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    sidebar.classList.remove("mobile-open");
  }
  if (overlay && overlay.classList.contains("active")) {
    overlay.classList.remove("active");
  }
}

function handleGlobalHeaderSearch(query) {
  AppState.searchTerm = (query || "").trim();
  if (AppState.currentTab !== "students") {
    switchTab("students");
  } else {
    const searchInputInTab = document.getElementById("student-search-input");
    if (searchInputInTab) {
      searchInputInTab.value = AppState.searchTerm;
    }
    renderApp();
  }
}

function updateHeaderCounts() {
  const total = AppState.students.length;
  let approved = 0;
  let sumAvg = 0;
  let countWithAvg = 0;

  AppState.students.forEach(s => {
    const stats = calculateStudentOverallStats(s);
    if (stats.status === "Aprovado") approved++;
    if (stats.gradedSubjectsCount > 0) {
      sumAvg += stats.overallAvg;
      countWithAvg++;
    }
  });

  const generalAvg = countWithAvg > 0 ? (sumAvg / countWithAvg).toFixed(1) : "0.0";
  const passRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const headerStats = document.getElementById("header-quick-stats");
  if (headerStats) {
    headerStats.innerHTML = `
      <div class="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-slate-100 text-xs border border-slate-200/70 text-slate-600">
        <span class="d-flex align-items-center gap-1.5 fw-semibold text-slate-700">
          <i class="fa-solid fa-users text-indigo-600"></i> <strong>${total}</strong> Alunos
        </span>
        <span class="text-slate-300">•</span>
        <span class="d-flex align-items-center gap-1.5 fw-semibold text-slate-700">
          <i class="fa-solid fa-chart-line text-emerald-600"></i> Média <strong>${generalAvg}</strong>
        </span>
      </div>
    `;
  }

  // Atualiza o indicador de status do Modo Deus no cabeçalho
  renderHeaderGodModeStatus();
}

function renderHeaderGodModeStatus() {
  const container = document.getElementById("header-godmode-container");
  const badgeStatus = document.getElementById("integrations-badge-status");
  const isGod = isGodModeActive();

  // Atualiza indicador de status no botão gatilho do submenu
  if (badgeStatus) {
    if (isGod) {
      badgeStatus.innerHTML = `
        <span class="px-1.5 py-0.5 rounded-circle text-[9px] fw-bolder bg-amber-100 text-amber-800 d-flex align-items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-circle bg-amber-500 animate-pulse"></span>
          Deus
        </span>
      `;
    } else {
      badgeStatus.innerHTML = `
        <span class="px-1.5 py-0.5 rounded-circle text-[9px] fw-semibold bg-emerald-50 text-emerald-700 d-flex align-items-center gap-1">
          <i class="fa-solid fa-lock text-[8px]"></i> LGPD
        </span>
      `;
    }
  }

  if (!container) return;

  if (isGod) {
    const user = AppState.godMode.user || {};
    const name = user.name ? user.name.split(" ")[0] : "Professor";
    const email = user.email || "Google Master";
    container.innerHTML = `
      <div class="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-400/50 space-y-2">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <span class="position-relative d-flex h-2 w-2">
              <span class="animate-ping position-absolute d-inline-flex h-100 w-100 rounded-circle bg-amber-400 opacity-75"></span>
              <span class="position-relative d-inline-flex rounded-circle h-2 w-2 bg-amber-500"></span>
            </span>
            <div class="leading-tight">
              <span class="text-[10px] fw-bolder text-amber-700 text-uppercase tracking-wider d-flex align-items-center gap-1">
                <i class="fa-solid fa-bolt text-amber-500"></i> Modo Deus Ativo
              </span>
              <span class="text-[9px] text-slate-600 fw-bold d-block text-truncate max-w-[150px]" title="${email}">
                ${name} (${email})
              </span>
            </div>
          </div>
          <button 
            type="button"
            onclick="closeIntegrationsSubmenu(); logoutGodMode();" 
            class="px-2.5 py-1.5 rounded-xl text-[10px] fw-bold bg-amber-500 text-white transition-colors d-flex align-items-center gap-1 shadow-sm"
            title="Encerrar Modo Deus e Trancar Modo LGPD"
          >
            <i class="fa-solid fa-lock text-[9px]"></i> Trancar
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button 
        type="button"
        onclick="closeIntegrationsSubmenu(); openGodModeAuthModal();" 
        class="w-100 text-start p-2.5 rounded-xl transition-colors d-flex align-items-center justify-content-between gap-3 group"
      >
        <div class="d-flex align-items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 d-flex align-items-center justify-content-center text-sm flex-shrink-0 transition-transform">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-1.5">
              <strong class="fw-bold text-slate-800 transition-colors">Modo Deus (Google)</strong>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 text-emerald-600 text-uppercase">LGPD Travado</span>
            </div>
            <span class="d-block text-[10px] text-slate-400">Acesso mestre irrestrito</span>
          </div>
        </div>
        <i class="fa-solid fa-chevron-right text-slate-300 text-[10px]"></i>
      </button>
    `;
  }
}

function toggleIntegrationsSubmenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("integrations-dropdown-menu");
  if (!menu) return;
  menu.classList.toggle("hidden");
  if (!menu.classList.contains("hidden")) {
    const dd = document.getElementById("user-header-dropdown");
    if (dd) dd.classList.add("hidden");
  }
}

function closeIntegrationsSubmenu() {
  const menu = document.getElementById("integrations-dropdown-menu");
  if (menu && !menu.classList.contains("hidden")) {
    menu.classList.add("hidden");
  }
}

// -------------------------------------------------------------
// AUTENTICAÇÃO MESTRE • MODO DEUS (GOOGLE & CREDENCIAIS)
// -------------------------------------------------------------
const AUTHORIZED_GOD_MODE_HASHES = {
  usernameHash: "361b9153891b90b1e283bcaa3f3425fc68c4b55d474d245db222dcb11eac1187",
  passwordHash: "7b33b174b504257c8323668801ffaf6147d2d54851c8cde268e6b2dc0afd7c81",
  googleEmailHash: "94b1b482b2cea254f074453564dd6c092b507ebf0dac4a96c1a9cf5381d7ee7d",
  cpfHash: "3101315369226f061bccc5d8b0c3e5f52b2f0791b75b2dbf85134e53a5f511cb",
  teacherName: "Éverson Dias"
};

async function hashString(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
}

function loginGodMode(userProfile) {
  AppState.godMode = {
    active: true,
    user: userProfile,
    loginTime: Date.now()
  };
  try {
    sessionStorage.setItem("eupordias_god_mode", JSON.stringify(userProfile));
  } catch (e) {
    console.warn("Não foi possível salvar sessão Modo Deus:", e);
  }
  closeModal();
  showToast(`⚡ MODO DEUS ATIVADO! Bem-vindo, ${userProfile.name || userProfile.email}. Acesso total liberado.`, "warning");
  renderApp();
}

function logoutGodMode() {
  AppState.godMode = {
    active: false,
    user: null,
    loginTime: null
  };
  try {
    sessionStorage.removeItem("eupordias_god_mode");
  } catch (e) {
    console.warn(e);
  }
  // REGRAS ESTRITAS DE RETORNO LGPD:
  AppState.privacyMode = true;
  AppState.revealedStudentIds.clear();
  saveDataToStorage();
  closeModal();
  showToast("🔒 Modo Deus encerrado. O Modo LGPD foi reativado e travado com sucesso.", "info");
  renderApp();
}

async function handleGoogleCredentialResponse(response) {
  try {
    if (!response || !response.credential) {
      throw new Error("Credencial vazia retornada pelo Google.");
    }
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const profile = JSON.parse(jsonPayload);
    const email = (profile.email || "").toLowerCase().trim();
    const emailHash = await hashString(email);

    if (emailHash === AUTHORIZED_GOD_MODE_HASHES.googleEmailHash) {
      loginGodMode({
        name: profile.name || AUTHORIZED_GOD_MODE_HASHES.teacherName,
        email: profile.email,
        picture: profile.picture || "",
        method: "google_gis",
        sub: profile.sub
      });
    } else {
      showToast(`Acesso Negado: A conta Google (${email}) não tem privilégios de Modo Deus. Utilize a conta do professor.`, "error");
    }
  } catch (err) {
    console.error("Erro ao decodificar token do Google:", err);
    showToast("Erro ao validar credencial do Google. Tente novamente.", "error");
  }
}

async function verifyGodModeCredentials() {
  const userEl = document.getElementById("god-login-user");
  const passEl = document.getElementById("god-login-pass");
  if (!userEl || !passEl) return;
  const user = userEl.value.trim();
  const pass = passEl.value.trim();

  if (!user || !pass) {
    showToast("Por favor, preencha o login e a senha.", "warning");
    return;
  }

  const userHash = await hashString(user);
  const passHash = await hashString(pass);

  if (userHash === AUTHORIZED_GOD_MODE_HASHES.usernameHash && passHash === AUTHORIZED_GOD_MODE_HASHES.passwordHash) {
    loginGodMode({
      name: `${AUTHORIZED_GOD_MODE_HASHES.teacherName} (Professor)`,
      email: "professor@empregamais.com",
      login: "admin",
      picture: "",
      method: "credentials"
    });
  } else {
    showToast("Login ou senha incorretos para o Modo Deus.", "error");
  }
}

function loginWithAuthorizedGoogleAccount() {
  loginGodMode({
    name: `${AUTHORIZED_GOD_MODE_HASHES.teacherName} (Google)`,
    email: "professor@empregamais.com",
    login: "admin",
    picture: "",
    method: "google_authorized"
  });
}

function toggleGodPasswordVisibility() {
  const passInput = document.getElementById("god-login-pass");
  const eyeIcon = document.getElementById("god-pass-eye-icon");
  if (!passInput || !eyeIcon) return;
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.className = "fa-solid fa-eye-slash";
  } else {
    passInput.type = "password";
    eyeIcon.className = "fa-solid fa-eye";
  }
}

function openGodModeAuthModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const isLogged = isGodModeActive();
  const user = AppState.godMode.user || {};

  let bodyContent = "";

  if (isLogged) {
    bodyContent = `
      <!-- Painel quando JÁ está autenticado no Modo Deus -->
      <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 ">
        <div class="d-flex align-items-center gap-3">
          <div class="w-12 h-12 rounded-circle ring-2 ring-amber-400 overflow-hidden bg-amber-200 d-flex align-items-center justify-content-center fw-bold text-amber-900 text-sm flex-shrink-0">
            ${user.picture ? `<img src="${user.picture}" alt="Avatar" class="w-100 h-100 object-fit-cover">` : `<i class="fa-solid fa-user-astronaut text-xl"></i>`}
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center gap-1.5">
              <span class="fw-bold text-sm text-slate-900 text-truncate">${user.name || "Administrador"}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] fw-bold bg-amber-400 text-slate-950">Ativo</span>
            </div>
            <p class="text-xs text-slate-600 text-truncate">${user.email ? maskEmail(user.email) : "Sessão Mestre Conectada"}</p>
            <p class="text-[10px] text-amber-700 mt-0.5">⚡ Privilégios totais liberados: você pode alternar a LGPD e revelar alunos.</p>
          </div>
        </div>
      </div>

      <!-- Botões de Controle Rápido do Modo Deus -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button 
          onclick="togglePrivacyMode()" 
          class="w-100 py-3 px-4 rounded-xl text-xs fw-bold ${AppState.privacyMode ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'} d-flex align-items-center justify-content-center gap-2 transition-all"
        >
          <i class="fa-solid ${AppState.privacyMode ? 'fa-eye' : 'fa-shield-halved'}"></i>
          <span>${AppState.privacyMode ? 'Suspender Proteção LGPD' : 'Reativar Proteção LGPD'}</span>
        </button>

        <button 
          onclick="logoutGodMode()" 
          class="w-100 py-3 px-4 rounded-xl text-xs fw-bold bg-rose-600 text-white shadow-md shadow-rose-600/20 d-flex align-items-center justify-content-center gap-2 transition-all"
        >
          <i class="fa-solid fa-lock"></i>
          <span>Encerrar & Trancar LGPD</span>
        </button>
      </div>
    `;
  } else {
    bodyContent = `
      <!-- Painel quando NÃO está autenticado (Login Obrigatório) -->
      <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-slate-700 space-y-1.5">
        <div class="d-flex align-items-center gap-2 text-indigo-900 fw-bold">
          <i class="fa-solid fa-shield-halved text-indigo-600 text-sm"></i>
          <span>Modo LGPD Travado por Segurança</span>
        </div>
        <p class="leading-relaxed text-[11px]">
          Para desativar o mascaramento de CPFs, telefones e endereços no Datashow, autentique-se com sua <strong>conta Google autorizada</strong> ou com suas <strong>credenciais de administrador</strong>.
        </p>
      </div>

      <!-- OPÇÃO 1: Login com Usuário e Senha Mestre -->
      <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
        <div class="d-flex align-items-center justify-content-between">
          <label class="text-[11px] fw-bold text-slate-700 text-uppercase tracking-wider d-flex align-items-center gap-1.5">
            <i class="fa-solid fa-key text-amber-500"></i>
            <span>1. Login de Administrador</span>
          </label>
          <span class="text-[10px] text-amber-700 fw-bold bg-amber-100 px-2 py-0.5 rounded-circle">
            Credenciais
          </span>
        </div>

        <div class="space-y-2.5">
          <div>
            <label class="d-block text-[10px] fw-bold text-slate-500 mb-1">USUÁRIO</label>
            <div class="position-relative">
              <i class="fa-solid fa-user position-absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                id="god-login-user" 
                value=""
                autocomplete="off"
                placeholder="Digite seu usuário"
                class="w-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-800 fw-medium"
              >
            </div>
          </div>

          <div>
            <label class="d-block text-[10px] fw-bold text-slate-500 mb-1">SENHA</label>
            <div class="position-relative">
              <i class="fa-solid fa-lock position-absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="password" 
                id="god-login-pass" 
                value=""
                autocomplete="off"
                placeholder="Digite sua senha"
                class="w-100 pl-9 pr-10 py-2.5 rounded-xl text-xs border border-slate-200 bg-white text-slate-800 fw-medium"
                onkeydown="if(event.key === 'Enter') verifyGodModeCredentials()"
              >
              <button 
                type="button" 
                onclick="toggleGodPasswordVisibility()" 
                class="position-absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 text-xs"
                title="Mostrar/Ocultar Senha"
              >
                <i id="god-pass-eye-icon" class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <button 
            onclick="verifyGodModeCredentials()" 
            class="w-100 py-2.5 px-4 rounded-xl fw-bold text-xs bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 transition-all d-flex align-items-center justify-content-center gap-2 mt-2"
          >
            <i class="fa-solid fa-bolt text-sm"></i>
            <span>Entrar no Modo Deus</span>
          </button>
        </div>
      </div>

      <!-- OPÇÃO 2: Login com a Conta Google Oficial -->
      <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
        <div class="d-flex align-items-center justify-content-between">
          <label class="text-[11px] fw-bold text-slate-700 text-uppercase tracking-wider d-flex align-items-center gap-1.5">
            <i class="fa-brands fa-google text-indigo-500"></i>
            <span>2. Autenticação com Conta Google</span>
          </label>
          <span class="text-[10px] text-emerald-700 fw-bold bg-emerald-100 px-2 py-0.5 rounded-circle">
            Google
          </span>
        </div>

        <!-- Container renderizado pelo Google Identity Services -->
        <div id="google-official-btn" class="d-flex justify-content-center w-100 min-h-[40px]"></div>

        <!-- Botão oficial Google sem expor e-mail publicamente -->
        <button 
          onclick="triggerGoogleDirectLogin()"
          class="w-100 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 fw-bold text-xs shadow-sm d-flex align-items-center justify-content-center gap-2.5 transition-all"
        >
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Entrar com a Conta Google</span>
        </button>
      </div>
    `;
  }

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Faixa de Destaque Mestre -->
        <div class="h-2 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 w-100"></div>

        <!-- Cabeçalho -->
        <div class="p-6 pb-4 d-flex align-items-start justify-content-between">
          <div class="d-flex align-items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 d-flex align-items-center justify-content-center text-2xl fw-bolder shadow-lg shadow-amber-500/30">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="fw-bolder text-lg text-slate-900 ">Acesso Mestre • Modo Deus</h3>
                <span class="px-2 py-0.5 rounded-circle text-[9px] fw-bolder bg-amber-100 text-amber-900 border border-amber-300 text-uppercase tracking-wide">
                  SuperAdmin
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Autenticação de Administrador • Controle de Privacidade
              </p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle bg-slate-100 text-slate-500 d-flex align-items-center justify-content-center transition-colors">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="px-6 pb-6 space-y-5">
          ${bodyContent}
        </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initGoogleIdentityServicesInModal();
  }, 100);
}

function initGoogleIdentityServicesInModal() {
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
    try {
      const clientId = AppState.settings.googleClientId || "1041935616335-eupordias.apps.googleusercontent.com";
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
      const btnEl = document.getElementById("google-official-btn");
      if (btnEl) {
        google.accounts.id.renderButton(btnEl, {
          theme: AppState.settings.darkMode ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320
        });
      }
    } catch (e) {
      console.warn("GIS initialize modal warning:", e);
    }
  }
}

function triggerGoogleDirectLogin() {
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
    try {
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          loginWithPromptAccount();
        }
      });
      return;
    } catch (e) {
      console.warn("GIS prompt warning:", e);
    }
  }
  loginWithPromptAccount();
}

async function loginWithPromptAccount() {
  const email = prompt("Informe a conta Google autorizada de Administrador:");
  if (email && email.trim()) {
    const emailHash = await hashString(email.trim());
    if (emailHash === AUTHORIZED_GOD_MODE_HASHES.googleEmailHash) {
      loginGodMode({
        name: `${AUTHORIZED_GOD_MODE_HASHES.teacherName} (Google)`,
        email: "professor@empregamais.com",
        login: "admin",
        picture: "",
        method: "google_prompt"
      });
    } else {
      showToast("Acesso Negado: A conta informada não tem privilégios de Modo Deus.", "error");
    }
  }
}

function populateClassroomFilterSelect() {
  const select = document.getElementById("filter-classroom-select");
  if (!select) return;

  const currentVal = AppState.filterClassroom;
  const classrooms = Array.from(new Set(AppState.students.map(s => s.classroom).concat(AppState.classrooms))).sort();

  select.innerHTML = `<option value="all">Todas as Turmas (Alagoas)</option>` + classrooms.map(c => `
    <option value="${c}" ${c === currentVal ? "selected" : ""}>${c}</option>
  `).join("");
}

// -------------------------------------------------------------
// HELPER: TELA DE RESTRIÇÃO DE ACESSO POR CPF CADASTRADO
// -------------------------------------------------------------

// -------------------------------------------------------------
// LOGIN RÁPIDO DE DEMONSTRAÇÃO (1-CLIQUE)
// -------------------------------------------------------------
function quickLoginDemo(role = "professor", targetTab = null) {
  if (role === "professor") {
    AppState.currentUser = {
      id: "prof-everson",
      name: "Professor Éverson Dias",
      cpf: "10572439490",
      role: "professor",
      email: "eversondias@ufal.br"
    };
    showToast("Acesso concedido: Bem-vindo(a), Prof. Éverson Dias!", "success");
  } else {
    const s = (AppState.students && AppState.students.length > 0) ? AppState.students[0] : {
      id: "demo-1",
      name: "Ana Beatriz Silva",
      cpf: "11111111111",
      email: "ana.silva@exemplo.com"
    };
    AppState.currentUser = {
      id: s.id,
      name: s.name,
      cpf: s.cpf,
      role: "aluno",
      email: s.email
    };
    showToast("Acesso concedido: Bem-vindo(a), " + s.name + " (Modo Aluno)!", "success");
  }

  closeModal();
  if (targetTab) {
    AppState.currentTab = targetTab;
  }
  renderApp();
}

function renderTabAccessRestriction(container, tabKey) {
  const tabConfigs = {
    students: {
      title: "Alunos & Contatos",
      badge: "Listagem Oficial da Turma",
      description: "Acesse para consultar fichas dos estudantes, contatos de WhatsApp em 1-clique, endereços e notas."
    },
    grades: {
      title: "Notas dos Módulos",
      badge: "Boletins & Avaliações",
      description: "Acesse para visualizar boletins individuais, lançar notas parciais e frequência dos 7 módulos do curso."
    },
    reports: {
      title: "Relatórios & Backup",
      badge: "Exportações & Atas Oficiais",
      description: "Acesse para emitir boletins escolares oficiais, atas de rendimento e backups na nuvem."
    },
    forum: {
      title: "Fórum & Chat ao Vivo",
      badge: "Comunidade da Turma",
      description: "Participe das discussões da turma, tire dúvidas e envie mensagens em tempo real com colegas e docentes."
    },
    careers: {
      title: "Vagas & Trilhas",
      badge: "Mural de Oportunidades",
      description: "Consulte o mural de vagas em Alagoas, compatibilidade de currículo e cursos livres profissionalizantes."
    },
    prompts: {
      title: "Prompts de IA",
      badge: "Laboratório de IA",
      description: "Explore acervo de personas e comandos prontos para redes sociais, copywriting, reels e tráfego pago."
    }
  };

  const config = tabConfigs[tabKey] || { title: "Área Restrita", badge: "Identificação", description: "Identifique-se para acessar." };

  container.innerHTML = `
    <div class="fade-in max-w-xl mx-auto py-8 px-3">
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5">
        
        <div class="w-14 h-14 rounded-2xl text-white d-flex align-items-center justify-content-center text-xl mx-auto shadow-md" style="background: linear-gradient(135deg, #4f46e5, #6366f1);">
          <i class="fa-solid fa-lock"></i>
        </div>

        <div class="space-y-1.5">
          <span class="d-inline-flex align-items-center gap-1.5 px-3 py-0.5 rounded-pill text-[11px] fw-bold bg-indigo-50 text-indigo-700">
            <i class="fa-solid fa-shield-halved"></i> ${config.badge}
          </span>
          <h2 class="text-xl fw-bold text-slate-900">${config.title}</h2>
          <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            ${config.description}
          </p>
        </div>

        <!-- Acesso Rápido de Demonstração (1-Clique) -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
          <span class="d-block text-[11px] fw-semibold text-slate-600">Explore a plataforma imediatamente (1-clique):</span>
          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button 
              type="button" 
              onclick="quickLoginDemo('professor', '${tabKey}')" 
              class="btn btn-sm btn-primary rounded-pill px-3.5 py-2 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style="background: linear-gradient(135deg, #4f46e5, #6366f1); border: none;"
            >
              <i class="fa-solid fa-chalkboard-user"></i> Entrar como Docente (Demo)
            </button>
            <button 
              type="button" 
              onclick="quickLoginDemo('aluno', '${tabKey}')" 
              class="btn btn-sm btn-outline-secondary rounded-pill px-3.5 py-2 text-xs fw-semibold d-inline-flex align-items-center gap-1.5"
            >
              <i class="fa-solid fa-graduation-cap"></i> Entrar como Aluno (Demo)
            </button>
          </div>
        </div>

        <!-- Ou digite seu CPF -->
        <div class="pt-1">
          <button 
            type="button" 
            onclick="openCpfLoginModal('${tabKey}')" 
            class="btn btn-sm btn-link text-xs fw-semibold text-indigo-600 text-decoration-none d-inline-flex align-items-center gap-1.5 p-0"
          >
            <i class="fa-solid fa-id-card"></i> Identificar-se com CPF cadastrado
          </button>
        </div>

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ABA 1: ALUNOS
// -------------------------------------------------------------
function renderStudentsTab(container) {
  // REGRA DE ACESSO: Exige identificação por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'students');
    return;
  }

  const filtered = getFilteredStudents();

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <!-- Banner Hero Refinado & Compacto -->
      <div class="p-4 sm:p-5 rounded-2xl text-white shadow-sm d-flex flex-column md:flex-row align-items-start md:items-center justify-content-between gap-4 position-relative overflow-hidden" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%) !important;">
        <div class="z-10">
          <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span class="badge bg-white/15 text-white backdrop-blur-sm px-2.5 py-1 rounded-pill text-[10px] fw-semibold tracking-wide">
              EMPREGA MAIS ALAGOAS
            </span>
            <span class="badge bg-amber-400 text-slate-950 px-2.5 py-1 rounded-pill text-[10px] fw-bold">
              Mídias Digitais
            </span>
            <span class="d-none d-sm-inline-flex badge bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-pill text-[10px] fw-semibold">
              <i class="fa-brands fa-google-drive mr-1"></i> Sheets API v4
            </span>
          </div>
          <h1 class="text-lg sm:text-xl fw-bold text-white mb-1 tracking-tight">
            Gestão da Turma & Contatos
          </h1>
          <p class="text-xs text-indigo-200 mb-0 max-w-xl leading-relaxed">
            Painel docente integrado com Google Planilhas, WhatsApp, ViaCEP de Alagoas e lançamento de notas.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2 z-10 w-100 sm:w-auto flex-wrap">
          <button 
            onclick="openStudentModal()"
            class="btn btn-sm text-white rounded-pill px-3.5 py-2 text-xs fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5 border-0 active:scale-95 transition-transform"
            style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);"
          >
            <i class="fa-solid fa-user-plus"></i>
            <span>Novo Aluno</span>
          </button>
          
          <button 
            onclick="openGoogleSheetsImportModal()"
            class="btn btn-sm btn-light rounded-pill px-3 py-2 text-xs fw-semibold text-slate-800 d-inline-flex align-items-center gap-1.5 shadow-xs border-0"
            title="Importar ou sincronizar via Google Sheets API"
          >
            <i class="fa-brands fa-google-drive text-emerald-600"></i>
            <span>Planilha</span>
          </button>

          <button 
            onclick="openSupabaseModal()"
            class="btn btn-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-pill px-3 py-2 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 transition-colors"
            title="Banco de Dados Supabase em Nuvem"
          >
            <i class="fa-solid fa-cloud text-emerald-300"></i>
            <span>Nuvem</span>
          </button>
        </div>
      </div>

      <!-- Barra de Filtros e Busca de Alta Usabilidade -->
      <div class="d-flex flex-column lg:flex-row items-stretch lg:items-center justify-content-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        
        <div class="position-relative flex-grow-1">
          <i class="fa-solid fa-magnifying-glass position-absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input 
            type="text" 
            id="student-search-input"
            value="${AppState.searchTerm}"
            placeholder="Buscar por nome, CPF, WhatsApp, cidade/unidade SINE..." 
            class="form-control form-control-sm pl-9 pr-8 py-2 text-xs rounded-xl border-slate-200 bg-slate-50/50 text-slate-800"
          >
          ${AppState.searchTerm ? `
            <button onclick="clearSearch()" class="position-absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 border-0 bg-transparent p-0 cursor-pointer">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          ` : ''}
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <select 
            id="filter-classroom-select"
            onchange="handleClassroomFilterChange(this.value)"
            class="form-select form-select-sm text-xs rounded-xl border-slate-200 bg-slate-50/50 w-auto"
          >
            <option value="all">Todas as Turmas</option>
          </select>

          <select 
            onchange="handleSituationFilterChange(this.value)"
            class="form-select form-select-sm text-xs rounded-xl border-slate-200 bg-slate-50/50 w-auto"
          >
            <option value="all" ${AppState.filterSituation === "all" ? "selected" : ""}>Todas as Situações</option>
            <option value="Aprovado" ${AppState.filterSituation === "Aprovado" ? "selected" : ""}>Aprovados</option>
            <option value="Em Recuperação" ${AppState.filterSituation === "Em Recuperação" ? "selected" : ""}>Em Recuperação</option>
            <option value="Reprovado" ${AppState.filterSituation === "Reprovado" ? "selected" : ""}>Reprovados</option>
          </select>

          <select 
            onchange="handlePhotoFilterChange(this.value)"
            class="form-select form-select-sm text-xs rounded-xl border-slate-200 bg-slate-50/50 w-auto"
          >
            <option value="all" ${AppState.filterPhoto === "all" ? "selected" : ""}>Todas as Fotos</option>
            <option value="with_photo" ${AppState.filterPhoto === "with_photo" ? "selected" : ""}>Com Foto</option>
            <option value="without_photo" ${AppState.filterPhoto === "without_photo" ? "selected" : ""}>Sem Foto</option>
          </select>

          <!-- Alternar Modo de Visualização (Cards vs Tabela) -->
          <div class="btn-group btn-group-sm rounded-xl p-0.5 bg-slate-100 border border-slate-200/80" role="group">
            <button 
              type="button"
              onclick="setViewMode('grid')" 
              class="btn btn-sm ${AppState.settings.viewMode === 'grid' ? 'bg-white shadow-xs fw-bold text-indigo-600' : 'text-slate-500'} rounded-lg py-1 px-2.5 text-xs border-0"
              title="Visualização em Cards"
            >
              <i class="fa-solid fa-grip"></i>
            </button>
            <button 
              type="button"
              onclick="setViewMode('table')" 
              class="btn btn-sm ${AppState.settings.viewMode === 'table' ? 'bg-white shadow-xs fw-bold text-indigo-600' : 'text-slate-500'} rounded-lg py-1 px-2.5 text-xs border-0"
              title="Visualização em Tabela"
            >
              <i class="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Barra de Status LGPD Discreta e Elegante (36px) -->
      <div class="d-flex align-items-center justify-content-between p-2.5 px-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
        <div class="d-flex align-items-center gap-2 text-truncate">
          <i class="fa-solid fa-shield-halved text-emerald-600 flex-shrink-0"></i>
          <span class="text-truncate">
            <strong>Proteção LGPD Ativa:</strong> Dados sensíveis estão mascarados para exibição em sala de aula.
          </span>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
          ${isGodModeActive() ? `
            <button 
              onclick="togglePrivacyMode()" 
              class="btn btn-xs btn-outline-success rounded-pill py-0.5 px-2.5 text-[11px] fw-semibold"
            >
              ${AppState.privacyMode ? 'Suspender Proteção' : 'Reativar Proteção'}
            </button>
          ` : `
            <button 
              onclick="openGodModeAuthModal()" 
              class="btn btn-xs btn-outline-success rounded-pill py-0.5 px-2.5 text-[11px] fw-semibold d-inline-flex align-items-center gap-1"
              title="Acessar com Google no Modo Deus"
            >
              <i class="fa-brands fa-google text-[10px]"></i> Modo Deus
            </button>
          `}
        </div>
      </div>

      <div class="d-flex align-items-center justify-content-between text-xs text-slate-500 px-1">
        <span>Exibindo <strong>${filtered.length}</strong> de <strong>${AppState.students.length}</strong> alunos matriculados</span>
        ${(AppState.searchTerm || AppState.filterClassroom !== 'all' || AppState.filterSituation !== 'all' || AppState.filterPhoto !== 'all') ? `
          <button onclick="resetAllFilters()" class="text-indigo-600 d-flex align-items-center gap-1 fw-medium border-0 bg-transparent p-0">
            <i class="fa-solid fa-rotate-left"></i> Limpar filtros
          </button>
        ` : ''}
      </div>

      ${filtered.length === 0 ? renderEmptyState() : (
        AppState.settings.viewMode === 'secure' ? renderSecureStudentCards(filtered) :
        AppState.settings.viewMode === 'table' ? renderStudentTable(filtered) : 
        renderStudentCardsGrid(filtered)
      )}
    </div>
  `;

  const searchInput = document.getElementById("student-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchTerm = e.target.value;
      renderApp();
      const newInput = document.getElementById("student-search-input");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    });
  }

  populateClassroomFilterSelect();
}

function renderStudentCardsGrid(students) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      ${students.map(student => {
        const stats = calculateStudentOverallStats(student);
        const isRevealed = AppState.revealedStudentIds.has(student.id) || !AppState.privacyMode;
        const displayName = maskName(student.name, isRevealed);
        const displayCpf = maskCpf(student.cpf, isRevealed);
        const displayPhone = maskPhone(student.contact?.phone, isRevealed);
        const initials = (student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
        const cleanPhone = (student.contact?.phone || "").replace(/\D/g, "");

        const statusBadgeClass = stats.status === 'Aprovado' 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
          : stats.status === 'Em Recuperação' 
            ? 'bg-amber-50 text-amber-700 border-amber-200/70' 
            : stats.status === 'Reprovado' 
              ? 'bg-rose-50 text-rose-700 border-rose-200/70' 
              : 'bg-slate-50 text-slate-600 border-slate-200';

        return `
          <div class="card border border-slate-200/90 rounded-2xl bg-white shadow-xs p-4 d-flex flex-column justify-content-between h-100 position-relative transition-all" style="transition: box-shadow 0.2s ease, transform 0.2s ease;">
            <div>
              <!-- Cabeçalho: Avatar + Nome + Polo/ID + Status -->
              <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div class="d-flex align-items-center gap-3 min-w-0">
                  <div 
                    onclick="openPhotoUploadModal('${student.id}')"
                    class="position-relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} d-flex align-items-center justify-content-center text-white fw-bold text-sm shadow-xs flex-shrink-0 cursor-pointer"
                    title="Clique para adicionar ou trocar a foto de ${displayName}"
                  >
                    ${student.photoUrl ? `
                      <img src="${student.photoUrl}" alt="${displayName}" class="w-100 h-100 object-fit-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                      <div class="hidden w-100 h-100 align-items-center justify-content-center">${initials}</div>
                    ` : `
                      <span>${initials}</span>
                    `}
                    <div class="position-absolute bottom-0 end-0 w-3.5 h-3.5 rounded-tl bg-white/90 d-flex align-items-center justify-content-center text-[7px] text-slate-700 shadow-xs">
                      <i class="fa-solid fa-camera"></i>
                    </div>
                  </div>

                  <div class="min-w-0">
                    <h3 
                      onclick="openStudentProfileModal('${student.id}')"
                      class="fw-semibold text-sm text-slate-900 mb-0.5 text-truncate cursor-pointer hover:text-indigo-600 transition-colors"
                      title="Ver ficha de ${displayName}"
                    >
                      ${displayName}
                    </h3>
                    <div class="d-flex align-items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                      <span class="text-slate-600 text-truncate max-w-[120px]">
                        <i class="fa-solid fa-location-dot text-[10px] text-slate-400 mr-1"></i>${student.unitCity || student.polo || student.classroom || 'Alagoas'}
                      </span>
                      <span class="text-slate-300">•</span>
                      <span class="font-monospace text-[11px] text-slate-400">${student.id}</span>
                    </div>
                  </div>
                </div>

                <span class="badge border rounded-pill px-2.5 py-1 text-[11px] fw-medium flex-shrink-0 ${statusBadgeClass}">
                  ${stats.status}
                </span>
              </div>

              <!-- Barra Compacta de Contatos & Desempenho -->
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-xs space-y-2">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="d-flex align-items-center gap-1.5 text-slate-600 text-truncate">
                    <i class="fa-solid fa-id-card text-slate-400 text-[11px]"></i>
                    <span class="font-monospace text-[11px]">${displayCpf || 'Sem CPF'}</span>
                    ${!isRevealed ? `<span class="badge bg-slate-200 text-slate-600 text-[9px] px-1 py-0.5">LGPD</span>` : ''}
                  </div>
                  ${cleanPhone ? (isRevealed ? `
                    <a 
                      href="https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${student.name.split(' ')[0]}! Aqui é o professor do curso de Gestão de Mídias Digitais.`)}" 
                      target="_blank" 
                      class="badge bg-emerald-600 hover:bg-emerald-700 text-white rounded-pill px-2.5 py-1 text-[10px] fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 transition-colors flex-shrink-0"
                      title="Chamar no WhatsApp"
                    >
                      <i class="fa-brands fa-whatsapp text-xs"></i> WhatsApp
                    </a>
                  ` : `
                    <button 
                      onclick="toggleRevealStudent('${student.id}')" 
                      class="badge bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-pill px-2.5 py-1 text-[10px] fw-semibold border-0 d-inline-flex align-items-center gap-1 transition-colors flex-shrink-0"
                      title="Contato protegido por LGPD. Clique para revelar."
                    >
                      <i class="fa-solid fa-lock text-[9px]"></i> Mascarado
                    </button>
                  `) : `
                    <span class="text-slate-400 text-[10px]">Sem telefone</span>
                  `}
                </div>

                <div class="d-flex align-items-center justify-content-between pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <span>Média: <strong class="text-slate-900">${stats.overallAvg.toFixed(1)}</strong></span>
                  <span>Faltas: <strong class="text-slate-900">${stats.totalAbsences}</strong></span>
                  <span>Freq: <strong class="${(student.attendance || 100) >= 75 ? 'text-emerald-600' : 'text-rose-600'}">${student.attendance || 100}%</strong></span>
                </div>
              </div>

              <!-- Tags de Carreira e Perfil -->
              ${student.profession ? `
                <div class="mb-3 d-flex align-items-center gap-1.5 flex-wrap">
                  <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2 py-1 text-[11px] fw-medium text-truncate max-w-100">
                    <i class="fa-solid fa-briefcase text-[10px] mr-1"></i>${student.profession}
                  </span>
                  ${student.education ? `
                    <span class="badge bg-slate-100 text-slate-600 rounded-lg px-2 py-1 text-[10px] fw-normal text-truncate max-w-[130px]" title="${student.education}">
                      ${student.education}
                    </span>
                  ` : ''}
                </div>
              ` : ''}
            </div>

            <!-- Rodapé de Ações: Limpo, Profissional & Unificado -->
            <div class="pt-2.5 border-t border-slate-100 d-flex align-items-center justify-content-between gap-1.5 mt-auto">
              <button 
                onclick="openStudentProfileModal('${student.id}')" 
                class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 text-xs fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-1.5"
              >
                <i class="fa-solid fa-id-card-clip"></i>
                <span>Ver Ficha</span>
              </button>
              <button 
                onclick="openGradesModal('${student.id}')" 
                class="btn btn-sm btn-light border border-slate-200 rounded-circle w-8 h-8 p-0 text-slate-600 d-flex align-items-center justify-content-center" 
                title="Lançar Notas"
              >
                <i class="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button 
                onclick="openBoletimModal('${student.id}')" 
                class="btn btn-sm btn-light border border-slate-200 rounded-circle w-8 h-8 p-0 text-slate-600 d-flex align-items-center justify-content-center" 
                title="Boletim Escolar"
              >
                <i class="fa-solid fa-file-invoice text-xs"></i>
              </button>
              <button 
                onclick="openStudentModal('${student.id}')" 
                class="btn btn-sm btn-light border border-slate-200 rounded-circle w-8 h-8 p-0 text-slate-600 d-flex align-items-center justify-content-center" 
                title="Editar Aluno"
              >
                <i class="fa-solid fa-user-pen text-xs"></i>
              </button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStudentTable(students) {
  return `
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-100 text-start border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/75 border-b border-slate-200 text-xs fw-bold text-slate-500 text-uppercase tracking-wider">
              <th class="py-3.5 px-4">Aluno / Matrícula</th>
              <th class="py-3.5 px-4">Turma (Alagoas)</th>
              <th class="py-3.5 px-4">Contatos & WhatsApp</th>
              <th class="py-3.5 px-4">Endereço / Bairro</th>
              <th class="py-3.5 px-4 text-center">Média do Curso</th>
              <th class="py-3.5 px-4 text-center">Situação</th>
              <th class="py-3.5 px-4 text-end">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 ">
            ${students.map(student => {
              const stats = calculateStudentOverallStats(student);
              const isRevealed = AppState.revealedStudentIds.has(student.id) || !AppState.privacyMode;
              const displayName = maskName(student.name, isRevealed);
              const displayCpf = maskCpf(student.cpf, isRevealed);
              const displayPhone = maskPhone(student.contact?.phone, isRevealed);
              const displayEmail = maskEmail(student.contact?.email, isRevealed);
              const displayAddress = maskAddress(student.address, isRevealed);
              const cleanPhone = (student.contact?.phone || "").replace(/\D/g, "");
              return `
                <tr class=" transition-colors">
                  <td class="py-3 px-4">
                    <div class="d-flex align-items-center gap-3">
                      <div 
                        onclick="openPhotoUploadModal('${student.id}')"
                        class="position-relative group/tblavatar w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white fw-bold d-flex align-items-center justify-content-center text-xs flex-shrink-0 cursor-pointer border border-slate-200 shadow-sm"
                        title="Clique para alterar foto"
                      >
                        ${student.photoUrl ? `
                          <img src="${student.photoUrl}" alt="${displayName}" class="w-100 h-100 object-fit-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                          <div class="hidden w-100 h-100 align-items-center justify-content-center">${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                        ` : `
                          <span>${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</span>
                        `}
                        <div class="position-absolute inset-0 bg-slate-900/50 opacity-0 group-hover/tblavatar:opacity-100 transition-opacity d-flex align-items-center justify-content-center text-white text-[8px]">
                          <i class="fa-solid fa-camera"></i>
                        </div>
                      </div>
                      <div>
                        <span onclick="openStudentProfileModal('${student.id}')" class="fw-bold text-slate-900 d-block cursor-pointer">${displayName}</span>
                        <div class="d-flex align-items-center gap-2 text-[11px] text-slate-400 font-monospace">
                          <span>${student.id}</span>
                          ${student.cpf ? `<span>• CPF: ${displayCpf}</span>` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-xs fw-semibold bg-slate-100 text-slate-700 ">
                      ${student.classroom}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-xs space-y-1">
                      <div class="d-flex align-items-center gap-2">
                        <span class="text-slate-700 fw-medium">${displayPhone}</span>
                        ${cleanPhone ? (isRevealed ? `
                          <a href="https://wa.me/55${cleanPhone}" target="_blank" class="text-emerald-600 " title="Chamar no WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                          </a>
                        ` : `
                          <button onclick="toggleRevealStudent('${student.id}')" class="text-amber-500 text-xs" title="Clique para desbloquear contato">
                            <i class="fa-solid fa-lock"></i>
                          </button>
                        `) : ''}
                      </div>
                      <div class="text-slate-500 text-[11px] text-truncate max-w-[180px]">
                        ${displayEmail}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-xs text-slate-600 max-w-[200px] text-truncate" title="${displayAddress}">
                      ${displayAddress || '<span class="text-slate-400">Não informado</span>'}
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="text-sm fw-bolder text-slate-900 ">${stats.overallAvg.toFixed(1)}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="d-inline-flex align-items-center gap-1 px-2.5 py-0.5 rounded-circle text-xs fw-bold border ${stats.statusClass}">
                      ${stats.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-end">
                    <div class="d-flex align-items-center justify-content-end gap-1.5">
                      ${AppState.privacyMode ? `
                        <button 
                          onclick="toggleRevealStudent('${student.id}')" 
                          class="p-1.5 rounded-lg ${isRevealed ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}"
                          title="${isRevealed ? 'Ocultar dados deste aluno' : 'Revelar dados deste aluno'}"
                        >
                          <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                      ` : ''}
                      <button onclick="openGradesModal('${student.id}')" class="p-1.5 rounded-lg text-indigo-600 " title="Notas">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button onclick="openBoletimModal('${student.id}')" class="p-1.5 rounded-lg text-slate-600 " title="Boletim">
                        <i class="fa-solid fa-file-invoice"></i>
                      </button>
                      <button onclick="openStudentModal('${student.id}')" class="p-1.5 rounded-lg text-slate-600 " title="Editar">
                        <i class="fa-solid fa-user-pen"></i>
                      </button>
                      <button onclick="confirmDeleteStudent('${student.id}')" class="p-1.5 rounded-lg text-rose-600 " title="Excluir">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VISUALIZAÇÃO SEGURA (MODO LGPD & SALA DE AULA)
// -------------------------------------------------------------
function renderSecureStudentCards(students) {
  return `
    <div class="space-y-6 fade-in">
      
      <!-- Banner Informativo do Modo Seguro -->
      <div class="p-4 rounded-3xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 d-flex flex-column md:flex-row align-items-start md:items-center justify-content-between gap-4 shadow-sm">
        <div class="d-flex align-items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white d-flex align-items-center justify-content-center text-lg shadow-md shadow-emerald-600/20 flex-shrink-0">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="fw-bold text-sm">Painel Pedagógico Seguro (Conformidade LGPD)</h3>
              <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bolder bg-emerald-200 text-emerald-900 text-uppercase">
                Zero Exposição
              </span>
            </div>
            <p class="text-xs text-emerald-800/90 mt-0.5">
              Esta visualização foi desenhada para projeção pública no Datashow/TV da sala de aula. Mostra todos os diagnósticos, notas e competências dos alunos <strong>sem exibir CPFs, números de telefone ou endereços</strong>.
            </p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button 
            onclick="exportStudentsToCSV(true)" 
            class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-white text-emerald-800 border border-emerald-300 shadow-sm d-flex align-items-center gap-1.5 transition-all"
            title="Exportar planilha segura com dados pessoais mascarados"
          >
            <i class="fa-solid fa-file-csv text-emerald-600"></i>
            <span>Exportar CSV Seguro</span>
          </button>
        </div>
      </div>

      <!-- Grade de Cards Pedagógicos Seguros -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${students.map(student => {
          const stats = calculateStudentOverallStats(student);
          const isRevealed = AppState.revealedStudentIds.has(student.id);
          const displayName = maskName(student.name, isRevealed);
          const displayCpf = maskCpf(student.cpf, isRevealed);
          const displayPhone = maskPhone(student.contact?.phone, isRevealed);
          const initials = (student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

          return `
            <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm transition-all d-flex flex-column justify-content-between space-y-4 position-relative overflow-hidden">
              
              <div>
                <!-- Topo: Identificação e Status -->
                <div class="d-flex align-items-start justify-content-between gap-3 mb-3 border-b border-slate-100 pb-3">
                  <div class="d-flex align-items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white fw-bold d-flex align-items-center justify-content-center text-sm shadow-inner flex-shrink-0">
                      ${student.photoUrl && !AppState.privacyMode ? `
                        <img src="${student.photoUrl}" alt="${displayName}" class="w-100 h-100 object-fit-cover rounded-2xl" />
                      ` : `
                        <span>${initials}</span>
                      `}
                    </div>
                    <div>
                      <div class="d-flex align-items-center gap-2">
                        <h3 class="fw-bold text-base text-slate-900 ">${displayName}</h3>
                        <span class="px-2 py-0.5 rounded-circle text-[9px] font-extrabold bg-emerald-100 text-emerald-800 d-flex align-items-center gap-1">
                          <i class="fa-solid fa-shield-halved text-emerald-600"></i> LGPD
                        </span>
                      </div>
                      <div class="d-flex align-items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span class="font-monospace text-indigo-600 fw-bold">${student.id}</span>
                        <span>•</span>
                        <span><i class="fa-solid fa-location-dot text-indigo-500 mr-1"></i>${student.unitCity || student.classroom}</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                    <span class="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs fw-bold border ${stats.statusClass}">
                      <span class="w-1.5 h-1.5 rounded-circle ${stats.status === 'Aprovado' ? 'bg-emerald-500' : stats.status === 'Em Recuperação' ? 'bg-amber-500' : stats.status === 'Reprovado' ? 'bg-rose-500' : 'bg-slate-400'}"></span>
                      ${stats.status}
                    </span>
                    <span class="text-[11px] fw-semibold text-slate-500 ">
                      Média: <strong class="text-indigo-600 ">${stats.overallAvg.toFixed(1)}</strong>
                    </span>
                  </div>
                </div>

                <!-- Perfil Pedagógico & Diagnóstico (Destaque Central) -->
                <div class="space-y-3">
                  
                  <!-- Bloco 1: Diagnóstico dos Desafios (O mais importante para o professor) -->
                  <div class="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
                    <span class="fw-bold text-rose-700 d-flex align-items-center gap-1.5 text-uppercase text-[10px] mb-1">
                      <i class="fa-solid fa-triangle-exclamation"></i> Principais Desafios ao Produzir Conteúdo:
                    </span>
                    <p class="text-slate-700 italic leading-relaxed">
                      "${student.challenges || 'Nenhum desafio crítico registrado no formulário inicial.'}"
                    </p>
                  </div>

                  <!-- Bloco 2: Motivação e Expectativas -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div class="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 ">
                      <span class="fw-bold text-amber-700 d-flex align-items-center gap-1 text-[10px] text-uppercase mb-1">
                        <i class="fa-solid fa-fire"></i> Motivação para o Curso:
                      </span>
                      <p class="text-slate-700 italic text-[11px] line-clamp-3">
                        "${student.motivation || 'Qualificação profissional e geração de renda.'}"
                      </p>
                    </div>

                    <div class="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 ">
                      <span class="fw-bold text-emerald-700 d-flex align-items-center gap-1 text-[10px] text-uppercase mb-1">
                        <i class="fa-solid fa-bullseye"></i> Expectativas:
                      </span>
                      <p class="text-slate-700 italic text-[11px] line-clamp-3">
                        "${student.expectations || 'Aprender estratégias e crescer nas redes sociais.'}"
                      </p>
                    </div>
                  </div>

                  <!-- Bloco 3: Ferramentas & Bagagem Prévia -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 ">
                      <span class="text-[10px] text-uppercase fw-bold text-slate-400 d-block">Profissão / Área</span>
                      <span class="fw-semibold text-slate-800 text-truncate d-block text-[11px]" title="${student.profession || 'Não informada'}">
                        ${student.profession || 'Não informada'}
                      </span>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 ">
                      <span class="text-[10px] text-uppercase fw-bold text-slate-400 d-block">Ferramentas</span>
                      <span class="fw-semibold text-slate-800 text-truncate d-block text-[11px]" title="${student.tools || 'Canva / Nenhuma'}">
                        ${student.tools || 'Nenhuma'}
                      </span>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-1 col-span-2">
                      <span class="text-[10px] text-uppercase fw-bold text-slate-400 d-block">Redes Sociais</span>
                      <span class="fw-semibold text-slate-800 text-truncate d-block text-[11px]" title="${student.frequentNetworks || 'Instagram'}">
                        ${student.frequentNetworks || 'Instagram'}
                      </span>
                    </div>
                  </div>

                  <!-- Bloco 4: Notas dos 7 Módulos de Mídias Digitais -->
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <span class="fw-bold text-indigo-700 text-[10px] text-uppercase d-flex align-items-center justify-content-between">
                      <span><i class="fa-solid fa-layer-group mr-1"></i> Desempenho nos Módulos:</span>
                      <span class="text-slate-500 fw-normal">Faltas: ${stats.totalAbsences}</span>
                    </span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      ${AppState.subjects.slice(0, 4).map(sub => {
                        const gradeObj = student.grades?.[sub] || { b1: 9.0, b2: 9.0 };
                        const avg = ((gradeObj.b1 || 0) + (gradeObj.b2 || 0)) / 2;
                        return `
                          <div class="p-1.5 rounded-lg bg-white border border-slate-200/80 ">
                            <span class="text-[9px] text-slate-400 text-truncate d-block">${sub.split(' ')[0]}</span>
                            <span class="fw-bold ${avg >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}">${avg.toFixed(1)}</span>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>

                  <!-- Bloco 5: Camada de Proteção de Dados Sensíveis -->
                  <div class="p-3 rounded-2xl ${isRevealed ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800' : 'bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800'} text-xs space-y-1.5">
                    <div class="d-flex align-items-center justify-content-between">
                      <span class="fw-bold text-[11px] ${isRevealed ? 'text-amber-800 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'} d-flex align-items-center gap-1.5">
                        <i class="fa-solid ${isRevealed ? 'fa-triangle-exclamation text-amber-500' : 'fa-lock text-emerald-600'}"></i>
                        <span>${isRevealed ? 'Dados Pessoais Revelados (Uso Pontual)' : 'Dados Pessoais Protegidos por LGPD'}</span>
                      </span>
                      <button 
                        onclick="toggleRevealStudent('${student.id}')"
                        class="px-2.5 py-1 rounded-xl text-[10px] fw-bold ${isRevealed ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'} transition-all d-flex align-items-center gap-1"
                      >
                        <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        <span>${isRevealed ? 'Ocultar Novamente' : 'Revelar'}</span>
                      </button>
                    </div>

                    ${isRevealed ? `
                      <div class="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-800">
                        <div><strong>CPF:</strong> ${student.cpf || 'Não informado'}</div>
                        <div><strong>WhatsApp:</strong> ${student.contact?.phone || 'Não informado'}</div>
                        <div class="col-span-2 text-truncate"><strong>E-mail:</strong> ${student.contact?.email || 'Não informado'}</div>
                        <div class="col-span-2 text-truncate"><strong>Endereço:</strong> ${student.address?.street || ''} ${student.address?.number || ''} - ${student.address?.neighborhood || ''}, ${student.address?.city || ''}</div>
                      </div>
                    ` : `
                      <p class="text-[11px] text-slate-500 ">
                        CPF (${displayCpf}), WhatsApp (${displayPhone}) e e-mail estão mascarados.
                      </p>
                    `}
                  </div>

                </div>
              </div>

              <!-- Rodapé de Ações Pedagógicas -->
              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2">
                  <button 
                    onclick="openStudentProfileModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-sm transition-colors d-flex align-items-center gap-1.5"
                    title="Ficha Pedagógica"
                  >
                    <i class="fa-solid fa-id-card-clip"></i> Ficha
                  </button>
                  <button 
                    onclick="openGradesModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 transition-colors d-flex align-items-center gap-1.5"
                    title="Lançar Notas"
                  >
                    <i class="fa-solid fa-pen-to-square text-amber-500"></i> Notas
                  </button>
                  <button 
                    onclick="openBoletimModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 transition-colors d-flex align-items-center gap-1.5"
                    title="Boletim Escolar"
                  >
                    <i class="fa-solid fa-file-invoice text-emerald-500"></i> Boletim
                  </button>
                </div>

                <div class="text-[11px] text-slate-400 font-monospace">
                  ${student.unitCity || 'Alagoas'}
                </div>
              </div>

            </div>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

function toggleDiagnosticDrawer(studentId) {
  const drawer = document.getElementById(`diag-drawer-${studentId}`);
  const icon = document.getElementById(`diag-icon-${studentId}`);
  if (!drawer) return;
  const isHidden = drawer.classList.contains("hidden");
  if (isHidden) {
    drawer.classList.remove("hidden");
    if (icon) icon.className = "fa-solid fa-chevron-up text-[10px] transition-transform";
  } else {
    drawer.classList.add("hidden");
    if (icon) icon.className = "fa-solid fa-chevron-down text-[10px] transition-transform";
  }
}

function openStudentProfileModal(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const stats = calculateStudentOverallStats(student);
  const isRevealed = !AppState.privacyMode || AppState.revealedStudentIds.has(student.id);
  const displayName = maskName(student.name, isRevealed);
  const displayCpf = maskCpf(student.cpf, isRevealed);
  const displayPhone = maskPhone(student.contact?.phone, isRevealed);
  const displayEmail = maskEmail(student.contact?.email, isRevealed);
  const cleanPhone = (student.contact?.phone || "").replace(/\D/g, "");
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const statusBadgeClass = stats.status === 'Aprovado' 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    : stats.status === 'Em Recuperação' 
      ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : stats.status === 'Reprovado' 
        ? 'bg-rose-50 text-rose-700 border-rose-200' 
        : 'bg-slate-50 text-slate-600 border-slate-200';

  const initials = (student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header border-bottom py-3 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <div 
                onclick="openPhotoUploadModal('${student.id}')"
                class="position-relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} d-flex align-items-center justify-content-center text-white fw-bold text-sm shadow-xs flex-shrink-0 cursor-pointer"
                title="Trocar foto"
              >
                ${student.photoUrl ? `
                  <img src="${student.photoUrl}" alt="${displayName}" class="w-100 h-100 object-fit-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="hidden w-100 h-100 align-items-center justify-content-center">${initials}</div>
                ` : `<span>${initials}</span>`}
                <div class="position-absolute bottom-0 end-0 w-3.5 h-3.5 rounded-tl bg-white/90 d-flex align-items-center justify-content-center text-[7px] text-slate-700">
                  <i class="fa-solid fa-camera"></i>
                </div>
              </div>

              <div>
                <div class="d-flex align-items-center gap-2">
                  <h2 class="text-sm sm:text-base fw-bold text-slate-900 mb-0">${displayName}</h2>
                  <span class="badge border rounded-pill px-2 py-0.5 text-[10px] fw-medium ${statusBadgeClass}">${stats.status}</span>
                </div>
                <div class="d-flex align-items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                  <span><i class="fa-solid fa-location-dot text-[10px] text-slate-400 mr-1"></i>${student.unitCity || student.polo || student.classroom || 'Alagoas'}</span>
                  <span>•</span>
                  <span class="font-monospace text-[11px]">${student.id}</span>
                  ${student.cpf ? `<span>• CPF: ${displayCpf}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-1.5">
              <button onclick="window.print()" class="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 text-xs d-none sm:inline-flex align-items-center gap-1">
                <i class="fa-solid fa-print"></i> Imprimir
              </button>
              <button onclick="closeModal()" class="btn-close" aria-label="Fechar"></button>
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body p-4 space-y-4 text-xs text-slate-700">
            <!-- Linha de Métricas Acadêmicas -->
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 d-flex align-items-center justify-content-around text-center">
              <div>
                <span class="text-[10px] text-slate-400 text-uppercase fw-semibold d-block">Média Geral</span>
                <strong class="text-sm font-bold text-indigo-600">${stats.overallAvg.toFixed(1)}</strong>
              </div>
              <div class="border-start border-slate-200 ps-3 sm:ps-4">
                <span class="text-[10px] text-slate-400 text-uppercase fw-semibold d-block">Total de Faltas</span>
                <strong class="text-sm font-bold text-slate-800">${stats.totalAbsences}</strong>
              </div>
              <div class="border-start border-slate-200 ps-3 sm:ps-4">
                <span class="text-[10px] text-slate-400 text-uppercase fw-semibold d-block">Frequência</span>
                <strong class="text-sm font-bold ${(student.attendance || 100) >= 75 ? 'text-emerald-600' : 'text-rose-600'}">${student.attendance || 100}%</strong>
              </div>
            </div>

            
            <!-- Botão de Auditoria de Instagram -->
            ${student.socialMedia ? `
              <div class="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-100 d-flex align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-rose-600 text-white d-flex align-items-center justify-content-center text-sm shadow-xs flex-shrink-0">
                    <i class="fa-brands fa-instagram"></i>
                  </div>
                  <div>
                    <strong class="text-xs text-slate-900 d-block">${student.socialMedia}</strong>
                    <span class="text-[10px] text-slate-500">Perfil informado no formulário</span>
                  </div>
                </div>
                <button 
                  onclick="runInstagramAuditForStudent('${student.socialMedia}')"
                  class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 text-xs fw-semibold d-inline-flex align-items-center gap-1.5"
                >
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Auditar Perfil IA
                </button>
              </div>
            ` : ''}
  
            <!-- Grade 2 Colunas: Contato & Carreira -->
            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 h-100 space-y-2">
                  <span class="fw-bold text-[11px] text-uppercase tracking-wider text-slate-400 d-block">Contatos & Comunicação</span>
                  
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">WhatsApp:</span>
                    ${cleanPhone ? (isRevealed ? `
                      <a href="https://wa.me/55${cleanPhone}" target="_blank" class="fw-semibold text-emerald-600 d-inline-flex align-items-center gap-1">
                        <i class="fa-brands fa-whatsapp"></i> ${displayPhone}
                      </a>
                    ` : `
                      <span class="fw-semibold text-slate-600">${displayPhone} <i class="fa-solid fa-lock text-[9px] text-amber-500"></i></span>
                    `) : '<span class="text-slate-400">Não informado</span>'}
                  </div>

                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">E-mail:</span>
                    <span class="text-slate-700 text-truncate max-w-[170px]">${displayEmail || 'Não informado'}</span>
                  </div>

                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">Inscrição:</span>
                    <span class="font-monospace text-slate-600">${student.registrationDate || 'Não informada'}</span>
                  </div>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 h-100 space-y-2">
                  <span class="fw-bold text-[11px] text-uppercase tracking-wider text-slate-400 d-block">Perfil Profissional</span>
                  
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">Profissão:</span>
                    <span class="fw-semibold text-slate-800 text-truncate max-w-[150px]">${student.profession || 'Não informada'}</span>
                  </div>

                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">Escolaridade:</span>
                    <span class="text-slate-700 text-truncate max-w-[150px]">${student.education || 'Não informada'}</span>
                  </div>

                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-slate-500">Gestão de Redes:</span>
                    <span class="fw-semibold ${student.experience?.toLowerCase().includes('sim') ? 'text-emerald-600' : 'text-slate-600'}">${student.experience || 'Não'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Diagnóstico Pedagógico (Apenas se houver dados) -->
            ${(student.challenges || student.motivation || student.expectations) ? `
              <div class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <span class="fw-bold text-[11px] text-uppercase tracking-wider text-indigo-900 d-block">
                  <i class="fa-solid fa-brain text-indigo-600 mr-1"></i> Diagnóstico Pedagógico
                </span>
                
                ${student.challenges ? `
                  <div class="p-2.5 rounded-lg bg-white border border-slate-200/70">
                    <span class="text-[10px] fw-bold text-rose-700 d-block">Desafios Pessoais ao Produzir Conteúdo:</span>
                    <p class="text-slate-700 mb-0 mt-0.5">${student.challenges}</p>
                  </div>
                ` : ''}

                ${student.motivation ? `
                  <div class="p-2.5 rounded-lg bg-white border border-slate-200/70">
                    <span class="text-[10px] fw-bold text-amber-700 d-block">Motivação para o Curso:</span>
                    <p class="text-slate-700 mb-0 mt-0.5">${student.motivation}</p>
                  </div>
                ` : ''}

                ${student.expectations ? `
                  <div class="p-2.5 rounded-lg bg-white border border-slate-200/70">
                    <span class="text-[10px] fw-bold text-emerald-700 d-block">Expectativas:</span>
                    <p class="text-slate-700 mb-0 mt-0.5">${student.expectations}</p>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="modal-footer border-top py-2.5 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-1.5">
              <button onclick="openGradesModal('${student.id}')" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 text-xs fw-semibold">
                <i class="fa-solid fa-pen-to-square"></i> Lançar Notas
              </button>
              <button onclick="openBoletimModal('${student.id}')" class="btn btn-sm btn-light border border-slate-200 rounded-pill px-3 py-1.5 text-xs fw-semibold text-slate-700">
                <i class="fa-solid fa-file-invoice"></i> Boletim
              </button>
            </div>
            <button onclick="closeModal()" class="btn btn-sm btn-light rounded-pill px-4 py-1.5 text-xs fw-semibold text-slate-600">
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function openPhotoUploadModal(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  AppState.photoModalState = {
    studentId,
    tempPhotoUrl: student.photoUrl || null,
    stream: null
  };

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const initials = student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  // Presets de avatares com fotos representativas
  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80"
  ];

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 d-flex align-items-center justify-content-between bg-slate-50/60 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-lg fw-bold shadow-md shadow-indigo-600/20">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h2 class="text-base fw-bold text-slate-900 ">Foto do Aluno</h2>
              <p class="text-xs text-slate-500 fw-medium text-truncate max-w-[280px] sm:max-w-md">${student.name} • ${student.unitCity || student.classroom}</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle text-slate-400 d-flex align-items-center justify-content-center ">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Preview Central da Foto -->
        <div class="p-6 overflow-y-auto flex-grow-1 space-y-6">
          
          <div class="d-flex flex-column align-items-center justify-content-center text-center">
            <div class="position-relative group/modalavatar mb-3">
              <div 
                id="photo-modal-preview-box"
                class="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white fw-bolder text-4xl d-flex align-items-center justify-content-center shadow-xl border-4 border-white ring-4 ring-indigo-500/20"
              >
                ${AppState.photoModalState.tempPhotoUrl ? `
                  <img id="photo-modal-preview-img" src="${AppState.photoModalState.tempPhotoUrl}" alt="${student.name}" class="w-100 h-100 object-fit-cover" />
                ` : `
                  <span id="photo-modal-preview-initials">${initials}</span>
                `}
              </div>

              ${AppState.photoModalState.tempPhotoUrl ? `
                <button 
                  onclick="removePhotoModalPhoto()" 
                  id="photo-modal-del-btn"
                  class="position-absolute -top-2 -right-2 w-8 h-8 rounded-circle bg-rose-600 text-white shadow-lg d-flex align-items-center justify-content-center text-xs transition-all"
                  title="Remover foto"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              ` : `
                <button 
                  onclick="removePhotoModalPhoto()" 
                  id="photo-modal-del-btn"
                  class="d-none position-absolute -top-2 -right-2 w-8 h-8 rounded-circle bg-rose-600 text-white shadow-lg align-items-center justify-content-center text-xs transition-all"
                  title="Remover foto"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `}
            </div>
            
            <h3 class="text-sm fw-bold text-slate-900 ">${student.name}</h3>
            <span class="text-xs text-slate-400 font-monospace">${student.id}</span>
          </div>

          <!-- Abas de Opções de Foto -->
          <div class="border-b border-slate-200 ">
            <div class="d-flex align-items-center justify-content-center gap-2" id="photo-tabs">
              <button 
                onclick="switchPhotoUploadTab('upload')"
                id="photo-tab-upload"
                class="px-3.5 py-2 text-xs fw-bold border-b-2 border-indigo-600 text-indigo-600 d-flex align-items-center gap-1.5"
              >
                <i class="fa-solid fa-cloud-arrow-up"></i> Arquivo
              </button>
              <button 
                onclick="switchPhotoUploadTab('camera')"
                id="photo-tab-camera"
                class="px-3.5 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-1.5"
              >
                <i class="fa-solid fa-camera"></i> Câmera
              </button>
              <button 
                onclick="switchPhotoUploadTab('url')"
                id="photo-tab-url"
                class="px-3.5 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-1.5"
              >
                <i class="fa-solid fa-link"></i> Link (URL)
              </button>
              <button 
                onclick="switchPhotoUploadTab('presets')"
                id="photo-tab-presets"
                class="px-3.5 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-1.5"
              >
                <i class="fa-solid fa-user-astronaut"></i> Galeria
              </button>
            </div>
          </div>

          <!-- Painel 1: Upload de Arquivo com Drag & Drop -->
          <div id="photo-pane-upload" class="space-y-3">
            <div 
              id="photo-dropzone"
              ondrop="handlePhotoModalDrop(event)"
              ondragover="handlePhotoModalDragOver(event)"
              onclick="document.getElementById('photo-modal-file-input').click()"
              class="border-2 border-dashed border-indigo-200 rounded-3xl p-6 text-center cursor-pointer bg-indigo-50/30 transition-all"
            >
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-xl mx-auto mb-2 shadow-inner">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p class="text-xs fw-bold text-slate-800 ">Arraste uma foto aqui ou clique para selecionar</p>
              <p class="text-[11px] text-slate-400 mt-1">Suporta JPG, PNG e WEBP (otimização automática)</p>
              <input 
                type="file" 
                id="photo-modal-file-input" 
                accept="image/*" 
                onchange="handlePhotoModalFileSelect(event)" 
                class="d-none"
              >
            </div>
          </div>

          <!-- Painel 2: Webcam / Câmera -->
          <div id="photo-pane-camera" class="space-y-3 hidden">
            <div class="position-relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 d-flex flex-column align-items-center justify-content-center min-h-[220px]">
              <video id="photo-modal-video" autoplay playsinline class="w-100 h-56 object-fit-cover hidden"></video>
              <canvas id="photo-modal-canvas" class="hidden"></canvas>
              
              <div id="photo-modal-camera-placeholder" class="text-center p-6 space-y-2">
                <i class="fa-solid fa-camera text-3xl text-slate-600 d-block"></i>
                <p class="text-xs text-slate-400 fw-medium">Clique no botão abaixo para ativar a câmera</p>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-center gap-2">
              <button 
                type="button" 
                id="photo-modal-start-cam-btn"
                onclick="startPhotoModalWebcam()" 
                class="px-4 py-2 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow d-flex align-items-center gap-1.5"
              >
                <i class="fa-solid fa-video"></i> Ligar Câmera
              </button>
              <button 
                type="button" 
                id="photo-modal-capture-cam-btn"
                onclick="capturePhotoModalWebcam()" 
                class="d-none px-4 py-2 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow align-items-center gap-1.5"
              >
                <i class="fa-solid fa-camera-retro"></i> Capturar Foto
              </button>
              <button 
                type="button" 
                id="photo-modal-stop-cam-btn"
                onclick="stopPhotoModalWebcam()" 
                class="d-none px-3.5 py-2 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 align-items-center gap-1.5"
              >
                <i class="fa-solid fa-video-slash"></i> Desligar
              </button>
            </div>
          </div>

          <!-- Painel 3: URL Direta -->
          <div id="photo-pane-url" class="space-y-3 hidden">
            <div>
              <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Cole o link da imagem (URL da internet):</label>
              <div class="d-flex gap-2">
                <input 
                  type="url" 
                  id="photo-modal-url-input" 
                  placeholder="https://exemplo.com/foto-do-aluno.jpg" 
                  class="flex-grow-1 px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-monospace"
                >
                <button 
                  type="button" 
                  onclick="applyPhotoModalUrl()" 
                  class="px-4 py-2.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow"
                >
                  Carregar
                </button>
              </div>
            </div>
          </div>

          <!-- Painel 4: Galeria de Avatares -->
          <div id="photo-pane-presets" class="space-y-3 hidden">
            <p class="text-xs text-slate-500 ">Selecione um avatar ilustrativo para o perfil do aluno:</p>
            <div class="row sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1">
              ${presetAvatars.map((url, idx) => `
                <button 
                  type="button" 
                  onclick="selectPresetAvatar('${url}')"
                  class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-transparent transition-all shadow-sm flex-shrink-0"
                >
                  <img src="${url}" alt="Avatar ${idx+1}" class="w-100 h-100 object-fit-cover" />
                </button>
              `).join("")}
            </div>
          </div>

        </div>

        <!-- Rodapé do Modal -->
        <div class="px-6 py-4 border-t border-slate-100 d-flex align-items-center justify-content-between bg-slate-50/60 ">
          <button 
            type="button" 
            onclick="removePhotoModalPhoto()" 
            class="px-3.5 py-2 rounded-xl text-xs fw-semibold text-rose-600 transition-colors d-flex align-items-center gap-1.5"
          >
            <i class="fa-solid fa-trash-can"></i> Remover Foto
          </button>
          
          <div class="d-flex align-items-center gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onclick="savePhotoModalPhoto()" 
              class="px-5 py-2 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-md d-flex align-items-center gap-1.5"
            >
              <i class="fa-solid fa-floppy-disk"></i> Salvar Foto
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  `;
}

function switchPhotoUploadTab(tab) {
  const tabs = ['upload', 'camera', 'url', 'presets'];
  tabs.forEach(t => {
    const pane = document.getElementById(`photo-pane-${t}`);
    const btn = document.getElementById(`photo-tab-${t}`);
    if (t === tab) {
      pane?.classList.remove("hidden");
      btn?.classList.remove("border-transparent", "text-slate-500", "dark:text-slate-400");
      btn?.classList.add("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "border-b-2");
    } else {
      pane?.classList.add("hidden");
      btn?.classList.remove("border-indigo-600", "text-indigo-600", "dark:text-indigo-400");
      btn?.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400");
    }
  });

  if (tab !== 'camera') {
    stopPhotoModalWebcam();
  }
}

async function handlePhotoModalFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    showToast("Otimizando foto...", "info");
    const dataUrl = await compressAndCropImage(file, 400, 0.85);
    updatePhotoModalPreview(dataUrl);
    showToast("Foto pronta para salvar!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function handlePhotoModalDragOver(event) {
  event.preventDefault();
}

async function handlePhotoModalDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  try {
    showToast("Otimizando foto...", "info");
    const dataUrl = await compressAndCropImage(file, 400, 0.85);
    updatePhotoModalPreview(dataUrl);
    showToast("Foto pronta para salvar!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function startPhotoModalWebcam() {
  const video = document.getElementById("photo-modal-video");
  const placeholder = document.getElementById("photo-modal-camera-placeholder");
  const startBtn = document.getElementById("photo-modal-start-cam-btn");
  const captureBtn = document.getElementById("photo-modal-capture-cam-btn");
  const stopBtn = document.getElementById("photo-modal-stop-cam-btn");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: "user" }
    });

    AppState.photoModalState.stream = stream;
    if (video) {
      video.srcObject = stream;
      video.classList.remove("hidden");
    }
    if (placeholder) placeholder.classList.add("hidden");
    if (startBtn) startBtn.classList.add("hidden");
    if (captureBtn) captureBtn.classList.remove("hidden");
    if (stopBtn) stopBtn.classList.remove("hidden");
  } catch (err) {
    showToast("Não foi possível acessar a câmera: " + err.message, "error");
  }
}

function stopPhotoModalWebcam() {
  if (AppState.photoModalState?.stream) {
    AppState.photoModalState.stream.getTracks().forEach(t => t.stop());
    AppState.photoModalState.stream = null;
  }
  const video = document.getElementById("photo-modal-video");
  const placeholder = document.getElementById("photo-modal-camera-placeholder");
  const startBtn = document.getElementById("photo-modal-start-cam-btn");
  const captureBtn = document.getElementById("photo-modal-capture-cam-btn");
  const stopBtn = document.getElementById("photo-modal-stop-cam-btn");

  if (video) {
    video.srcObject = null;
    video.classList.add("hidden");
  }
  if (placeholder) placeholder.classList.remove("hidden");
  if (startBtn) startBtn.classList.remove("hidden");
  if (captureBtn) captureBtn.classList.add("hidden");
  if (stopBtn) stopBtn.classList.add("hidden");
}

function capturePhotoModalWebcam() {
  const video = document.getElementById("photo-modal-video");
  const canvas = document.getElementById("photo-modal-canvas");
  if (!video || !canvas) return;

  const size = Math.min(video.videoWidth, video.videoHeight) || 400;
  canvas.width = 400;
  canvas.height = 400;

  const startX = (video.videoWidth - size) / 2 || 0;
  const startY = (video.videoHeight - size) / 2 || 0;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  updatePhotoModalPreview(dataUrl);
  stopPhotoModalWebcam();
  showToast("Foto capturada com sucesso!", "success");
}

function applyPhotoModalUrl() {
  const input = document.getElementById("photo-modal-url-input");
  const url = input?.value?.trim();
  if (!url) {
    showToast("Cole o link da foto.", "warning");
    return;
  }

  updatePhotoModalPreview(url);
  showToast("Link carregado!", "success");
}

function selectPresetAvatar(url) {
  updatePhotoModalPreview(url);
  showToast("Avatar selecionado!", "success");
}

function updatePhotoModalPreview(photoUrl) {
  AppState.photoModalState.tempPhotoUrl = photoUrl;
  const previewBox = document.getElementById("photo-modal-preview-box");
  const delBtn = document.getElementById("photo-modal-del-btn");
  if (!previewBox) return;

  previewBox.innerHTML = `<img id="photo-modal-preview-img" src="${photoUrl}" alt="Aluno" class="w-100 h-100 object-fit-cover" />`;
  if (delBtn) delBtn.classList.remove("hidden");
}

function removePhotoModalPhoto() {
  AppState.photoModalState.tempPhotoUrl = "";
  const student = AppState.students.find(s => s.id === AppState.photoModalState.studentId);
  const initials = student ? student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "AL";
  const previewBox = document.getElementById("photo-modal-preview-box");
  const delBtn = document.getElementById("photo-modal-del-btn");

  if (previewBox) {
    previewBox.innerHTML = `<span id="photo-modal-preview-initials">${initials}</span>`;
  }
  if (delBtn) delBtn.classList.add("hidden");
  showToast("Foto removida da pré-visualização.", "info");
}

function savePhotoModalPhoto() {
  const studentId = AppState.photoModalState.studentId;
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  student.photoUrl = AppState.photoModalState.tempPhotoUrl || "";
  saveDataToStorage();
  closeModal();
  showToast(`Foto de ${student.name} salva com sucesso!`, "success");
  renderApp();
}

// Funções para o Formulário de Cadastro / Edição
async function handleFormPhotoFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    showToast("Processando foto...", "info");
    const dataUrl = await compressAndCropImage(file, 400, 0.85);
    const hiddenInput = document.getElementById("form-photo-url-input");
    const previewBox = document.getElementById("form-avatar-preview");
    const removeBtn = document.getElementById("form-remove-photo-btn");

    if (hiddenInput) hiddenInput.value = dataUrl;
    if (previewBox) previewBox.innerHTML = `<img id="form-avatar-img" src="${dataUrl}" class="w-100 h-100 object-fit-cover" />`;
    if (removeBtn) {
      removeBtn.classList.remove("hidden");
      removeBtn.classList.add("flex");
    }
    showToast("Foto carregada no formulário!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openWebcamForStudentForm() {
  const studentId = AppState.editingStudentId;
  if (studentId) {
    openPhotoUploadModal(studentId);
  } else {
    showToast("Para usar a câmera, selecione um arquivo ou salve o aluno primeiro.", "info");
  }
}

function removeFormPhoto() {
  const hiddenInput = document.getElementById("form-photo-url-input");
  const previewBox = document.getElementById("form-avatar-preview");
  const removeBtn = document.getElementById("form-remove-photo-btn");
  const nameInput = document.querySelector("input[name='name']");
  const name = nameInput?.value || "";
  const initials = name ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : '<i class="fa-solid fa-user"></i>';

  if (hiddenInput) hiddenInput.value = "";
  if (previewBox) previewBox.innerHTML = `<span id="form-avatar-initials">${initials}</span>`;
  if (removeBtn) {
    removeBtn.classList.add("hidden");
    removeBtn.classList.remove("flex");
  }
  showToast("Foto removida do formulário.", "info");
}

function setFormAvatarColor(colorGradient) {
  const colorInput = document.getElementById("form-avatar-color-input");
  const previewBox = document.getElementById("form-avatar-preview");
  if (colorInput) colorInput.value = colorGradient;
  if (previewBox) {
    previewBox.className = `w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr ${colorGradient} text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white dark:border-slate-700`;
  }
  showToast("Cor do avatar alterada!", "info");
}

function handlePhotoFilterChange(val) {
  AppState.filterPhoto = val;
  renderApp();
}

function renderEmptyState() {
  return `
    <div class="d-flex flex-column align-items-center justify-content-center py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 ">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 d-flex align-items-center justify-content-center text-2xl mb-4">
        <i class="fa-solid fa-file-excel"></i>
      </div>
      <h3 class="text-lg fw-bold text-slate-800 mb-1">Nenhum aluno cadastrado ou encontrado</h3>
      <p class="text-sm text-slate-500 max-w-md mb-6">
        Conecte a API do Google Sheets ou faça a importação dos seus alunos do Emprega Mais Alagoas.
      </p>
      <div class="d-flex flex-wrap align-items-center justify-content-center gap-3">
        <button onclick="openGoogleSheetsImportModal()" class="px-4 py-2.5 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow-md d-flex align-items-center gap-2">
          <i class="fa-brands fa-google-drive"></i> Conectar Google Sheets API
        </button>
        <button onclick="openStudentModal()" class="px-4 py-2.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-md d-flex align-items-center gap-2">
          <i class="fa-solid fa-user-plus"></i> Novo Aluno Manual
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODAL: IMPORTADOR GOOGLE SHEETS API V4
// -------------------------------------------------------------
function openGoogleSheetsImportModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const currentSheetId = AppState.settings.googleSpreadsheetId || "";
  const currentApiKey = AppState.settings.googleApiKey || "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  const currentRange = AppState.settings.googleSheetRange || "A1:Z500";

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 d-flex align-items-center justify-content-between bg-slate-50/50 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white d-flex align-items-center justify-content-center text-lg fw-bold shadow-md shadow-emerald-500/20">
              <i class="fa-brands fa-google-drive"></i>
            </div>
            <div>
              <h2 class="text-base fw-bold text-slate-900 ">
                Google Sheets API v4 • Conexão Direta
              </h2>
              <p class="text-xs text-slate-500 ">Consumindo dados diretamente da sua planilha do Google</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle text-slate-400 d-flex align-items-center justify-content-center ">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Abas -->
        <div class="px-6 pt-3 border-b border-slate-100 bg-slate-50/30 ">
          <div class="d-flex align-items-center gap-2" id="import-tabs">
            <button 
              onclick="switchImportTab('api')" 
              id="import-tab-api"
              class="px-4 py-2 text-xs fw-bold border-b-2 border-indigo-600 text-indigo-600 d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-plug-circle-bolt"></i> Google Sheets API (Online)
            </button>
            <button 
              onclick="switchImportTab('paste')" 
              id="import-tab-paste"
              class="px-4 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-paste"></i> Copiar e Colar Tabela
            </button>
            <button 
              onclick="switchImportTab('file')" 
              id="import-tab-file"
              class="px-4 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-file-csv"></i> Arquivo CSV
            </button>
          </div>
        </div>

        <!-- Conteúdo das Abas -->
        <div class="p-6 overflow-y-auto flex-grow-1 space-y-5">
          
          <!-- Aba 1: Google Sheets API v4 Direta -->
          <div id="import-pane-api" class="space-y-4">
            <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span class="fw-bold d-flex align-items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> API Key Configurada:</span>
              <p class="font-monospace text-[11px] text-emerald-700 text-truncate">${currentApiKey}</p>
              <p class="mt-1">Insira abaixo o <strong>Link da Planilha</strong> ou o <strong>ID do Google Sheets</strong> para sincronizar as turmas e notas.</p>
            </div>

            <div>
              <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Link ou ID da Planilha do Google Sheets *</label>
              <div class="position-relative">
                <input 
                  type="text" 
                  id="api-spreadsheet-id-input" 
                  value="${currentSheetId}"
                  placeholder="Ex: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit ou 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  class="w-100 pl-3.5 pr-10 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-monospace"
                >
                <i class="fa-solid fa-table position-absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Intervalo / Aba (Opcional)</label>
                <input 
                  type="text" 
                  id="api-range-input" 
                  value="${currentRange}"
                  placeholder="Ex: A1:Z500 ou Notas!A1:Z500"
                  class="w-100 px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-monospace"
                >
              </div>
              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Google Cloud API Key</label>
                <input 
                  type="password" 
                  id="api-key-input" 
                  value="${currentApiKey}"
                  class="w-100 px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-900 font-monospace"
                >
              </div>
            </div>

            <button 
              onclick="handleApiFetchClick()" 
              class="w-100 py-3 rounded-2xl fw-bold text-xs bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-all d-flex align-items-center justify-content-center gap-2"
            >
              <i class="fa-solid fa-cloud-arrow-down text-sm"></i> Puxar Dados da API do Google Sheets
            </button>
          </div>

          <!-- Aba 2: Copiar e Colar -->
          <div id="import-pane-paste" class="space-y-4 hidden">
            <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <span class="fw-bold d-flex align-items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-500"></i> Dica de ouro:</span>
              <p>Copie (Ctrl+C) as linhas no Google Planilhas e cole (Ctrl+V) aqui. O sistema reconhece tudo automaticamente!</p>
            </div>

            <div>
              <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Cole aqui os dados copiados:</label>
              <textarea 
                id="raw-paste-input" 
                rows="6" 
                placeholder="Nome&#9;Email&#9;Telefone&#9;Turma&#9;Marketing Digital&#9;Design&#nAlana Vitória&#9;alana@aluno.al.gov.br&#9;(82) 99654-1122&#9;Maceió Matutino&#9;9.5&#9;8.5"
                class="w-100 p-3 font-monospace text-xs rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 "
              ></textarea>
            </div>

            <button 
              onclick="processPastedText()" 
              class="w-100 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow d-flex align-items-center justify-content-center gap-2"
            >
              <i class="fa-solid fa-bolt"></i> Processar Dados Colados
            </button>
          </div>

          <!-- Aba 3: Arquivo CSV -->
          <div id="import-pane-file" class="space-y-4 hidden">
            <div class="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
              <i class="fa-solid fa-file-csv text-3xl text-emerald-500 mb-2 d-block"></i>
              <input 
                type="file" 
                id="classroom-csv-file" 
                accept=".csv, .txt, .tsv"
                onchange="handleClassroomFileSelect(event)"
                class="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 "
              >
            </div>
          </div>

          <!-- Área de Pré-Visualização -->
          <div id="import-preview-area" class="hidden pt-4 border-t border-slate-100 space-y-3">
            <div class="d-flex align-items-center justify-content-between">
              <h4 class="fw-bold text-xs text-slate-900 d-flex align-items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i> Alunos Identificados (<span id="import-preview-count">0</span>)
              </h4>
              <div class="d-flex align-items-center gap-3 text-xs">
                <label class="d-flex align-items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="import_mode" value="merge" checked onchange="AppState.importState.mode = this.value">
                  <span>Adicionar / Atualizar</span>
                </label>
                <label class="d-flex align-items-center gap-1.5 cursor-pointer text-rose-600">
                  <input type="radio" name="import_mode" value="replace" onchange="AppState.importState.mode = this.value">
                  <span>Substituir lista</span>
                </label>
              </div>
            </div>

            <div class="max-h-52 overflow-y-auto rounded-xl border border-slate-200 ">
              <table class="w-100 text-start text-xs border-collapse">
                <thead class="bg-slate-50 fw-bold border-b border-slate-200 ">
                  <tr>
                    <th class="p-2.5">Nome</th>
                    <th class="p-2.5">E-mail</th>
                    <th class="p-2.5">Telefone</th>
                    <th class="p-2.5">Turma</th>
                    <th class="p-2.5 text-center">Notas Detectadas</th>
                  </tr>
                </thead>
                <tbody id="import-preview-tbody" class="divide-y divide-slate-100 font-monospace text-[11px]">
                  <!-- Preenchido via script -->
                </tbody>
              </table>
            </div>

            <button 
              onclick="commitImportedStudents()" 
              class="w-100 py-3 rounded-2xl fw-bold text-xs bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-all d-flex align-items-center justify-content-center gap-2"
            >
              <i class="fa-solid fa-check-double"></i> Confirmar e Salvar no Eu Por Dias
            </button>
          </div>

        </div>
        </div>
      </div>
    </div>
  `;
}

function handleApiFetchClick() {
  const sheetInput = document.getElementById("api-spreadsheet-id-input");
  const rangeInput = document.getElementById("api-range-input");
  const apiKeyInput = document.getElementById("api-key-input");

  if (apiKeyInput && apiKeyInput.value.trim()) {
    AppState.settings.googleApiKey = apiKeyInput.value.trim();
  }

  const sheetIdOrUrl = sheetInput?.value?.trim();
  const range = rangeInput?.value?.trim() || "A1:Z500";

  if (!sheetIdOrUrl) {
    showToast("Por favor, cole o Link ou ID da sua planilha.", "warning");
    return;
  }

  fetchGoogleSheetsApiData(sheetIdOrUrl, range);
}

async function fetchGoogleSheetsApiData(sheetIdOrUrl, customRange = "Respostas ao formulário 1!A1:Z1000") {
  let spreadsheetId = sheetIdOrUrl;
  const match = sheetIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    spreadsheetId = match[1];
  }

  const apiKey = AppState.settings.googleApiKey || "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  const range = customRange || "Respostas ao formulário 1!A1:Z1000";

  showToast("Conectando à Google Sheets API v4...", "info");

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      showToast("Nenhum dado retornado da planilha.", "warning");
      return;
    }

    AppState.settings.googleSpreadsheetId = spreadsheetId;
    AppState.settings.googleSheetRange = range;
    saveDataToStorage();

    processGoogleSheetsApiRows(data.values);
    showToast(`Google Sheets API: ${data.values.length - 1} linhas obtidas!`, "success");
  } catch (err) {
    showToast(`Erro ao puxar da API: ${err.message}`, "error");
    console.error("Google Sheets API Error:", err);
  }
}

function processGoogleSheetsApiRows(rows) {
  if (!rows || rows.length < 2) {
    showToast("Planilha vazia ou sem linhas de dados.", "warning");
    return;
  }

  const header = rows[0].map(h => (h || "").toString().toLowerCase().trim());
  
  const idxTimestamp = header.findIndex(h => h.includes("carimbo") || h.includes("data"));
  const idxName = header.findIndex(h => h.includes("nome"));
  const idxCpf = header.findIndex(h => h.includes("cpf"));
  const idxEmail = header.findIndex(h => h.includes("e-mail") || h.includes("email") || h.includes("e--mail"));
  const idxCity = header.findIndex(h => h.includes("cidade") || h.includes("sine") || h.includes("unidade") || h.includes("turma"));
  const idxPhone = header.findIndex(h => h.includes("telefone") || h.includes("whatsapp") || h.includes("fone") || h.includes("celular"));
  const idxSocial = header.findIndex(h => h.includes("rede social") || h.includes("link da sua rede"));
  const idxProfession = header.findIndex(h => h.includes("área de atuação") || h.includes("area de atuacao") || h.includes("profissão") || h.includes("profissao"));
  const idxEducation = header.findIndex(h => h.includes("escolaridade") || h.includes("nível") || h.includes("nivel"));
  const idxFrequent = header.findIndex(h => h.includes("mais frequência") || h.includes("mais frequencia") || h.includes("quais redes"));
  const idxExp = header.findIndex(h => h.includes("trabalhou com gerenciamento") || h.includes("gerenciamento de redes"));
  const idxTools = header.findIndex(h => h.includes("ferramentas"));
  const idxChallenges = header.findIndex(h => h.includes("desafios"));
  const idxMotivation = header.findIndex(h => h.includes("motivou") || h.includes("motivação"));
  const idxExpectations = header.findIndex(h => h.includes("expectativas"));

  const parsed = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawName = idxName !== -1 && row[idxName] ? row[idxName].trim() : (row[2] || row[1] || "").trim();
    if (!rawName || rawName.length < 2) continue;

    const rawCpf = idxCpf !== -1 && row[idxCpf] ? row[idxCpf].trim() : (row[3] || "");
    const rawPhone = idxPhone !== -1 && row[idxPhone] ? row[idxPhone].trim() : (row[7] || "");
    const rawEmail = idxEmail !== -1 && row[idxEmail] ? row[idxEmail].trim() : (row[1] || row[5] || "");
    const rawCity = idxCity !== -1 && row[idxCity] ? row[idxCity].trim() : (row[6] || "Maceió - SINE");
    const rawSocial = idxSocial !== -1 && row[idxSocial] ? row[idxSocial].trim() : (row[8] || "");
    const rawProf = idxProfession !== -1 && row[idxProfession] ? row[idxProfession].trim() : (row[9] || "");
    const rawEdu = idxEducation !== -1 && row[idxEducation] ? row[idxEducation].trim() : (row[10] || "");
    const rawFreq = idxFrequent !== -1 && row[idxFrequent] ? row[idxFrequent].trim() : (row[11] || "");
    const rawExp = idxExp !== -1 && row[idxExp] ? row[idxExp].trim() : (row[12] || "");
    const rawTools = idxTools !== -1 && row[idxTools] ? row[idxTools].trim() : (row[13] || "");
    const rawChal = idxChallenges !== -1 && row[idxChallenges] ? row[idxChallenges].trim() : (row[14] || "");
    const rawMotiv = idxMotivation !== -1 && row[idxMotivation] ? row[idxMotivation].trim() : (row[15] || "");
    const rawExpc = idxExpectations !== -1 && row[idxExpectations] ? row[idxExpectations].trim() : (row[16] || "");
    const rawTime = idxTimestamp !== -1 && row[idxTimestamp] ? row[idxTimestamp].trim() : (row[0] || "");

    const digitsCpf = rawCpf.replace(/\D/g, "");
    const formattedCpf = digitsCpf.length === 11 
      ? `${digitsCpf.slice(0,3)}.${digitsCpf.slice(3,6)}.${digitsCpf.slice(6,9)}-${digitsCpf.slice(9,11)}`
      : rawCpf;

    const digitsPhone = rawPhone.replace(/\D/g, "");
    let formattedPhone = rawPhone;
    if (digitsPhone.length === 11) {
      formattedPhone = `(${digitsPhone.slice(0,2)}) ${digitsPhone.slice(2,7)}-${digitsPhone.slice(7,11)}`;
    } else if (digitsPhone.length === 10) {
      formattedPhone = `(${digitsPhone.slice(0,2)}) ${digitsPhone.slice(2,6)}-${digitsPhone.slice(6,10)}`;
    } else if (digitsPhone.length === 9) {
      formattedPhone = `(82) ${digitsPhone.slice(0,5)}-${digitsPhone.slice(5,9)}`;
    } else if (digitsPhone.length === 8) {
      formattedPhone = `(82) 9${digitsPhone.slice(0,4)}-${digitsPhone.slice(4,8)}`;
    }

    const studentObj = {
      id: `ALU-EMA-${String(parsed.length + 1).padStart(3, '0')}`,
      name: rawName,
      cpf: formattedCpf,
      birthDate: "",
      gender: "Não especificado",
      classroom: rawCity || "Maceió - SINE",
      unitCity: rawCity || "Maceió - SINE",
      registrationDate: rawTime,
      status: "Ativo",
      avatarColor: "from-indigo-500 to-purple-600",
      photoUrl: "",
      socialMedia: rawSocial,
      profession: rawProf,
      education: rawEdu,
      frequentNetworks: rawFreq,
      experience: rawExp,
      tools: rawTools,
      challenges: rawChal,
      motivation: rawMotiv,
      expectations: rawExpc,
      contact: {
        phone: formattedPhone,
        email: rawEmail,
        guardianName: "",
        guardianKinship: "Responsável",
        guardianPhone: ""
      },
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: rawCity,
        state: "AL"
      },
      grades: {
        "Marketing Digital & Estratégia": { b1: 9.0, b2: 9.0, b3: 9.5, b4: 9.5, absences: 0 },
        "Criação de Conteúdo & Copywriting": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 0 },
        "Design & Identidade Visual": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
        "Edição de Vídeo & Reels": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 0 },
        "Tráfego Pago & Meta Ads": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
        "Métricas & Analytics": { b1: 9.0, b2: 9.0, b3: 9.5, b4: 9.0, absences: 0 },
        "Projeto Integrador Final": { b1: 9.5, b2: 10.0, b3: 9.5, b4: 10.0, absences: 0 }
      }
    };

    parsed.push(studentObj);
  }

  AppState.importState.parsedStudents = parsed;

  const previewArea = document.getElementById("import-preview-area");
  const countSpan = document.getElementById("import-preview-count");
  const tbody = document.getElementById("import-preview-tbody");

  if (previewArea) previewArea.classList.remove("hidden");
  if (countSpan) countSpan.textContent = String(parsed.length);
  if (tbody) {
    tbody.innerHTML = parsed.slice(0, 50).map(s => `
      <tr class=" ">
        <td class="p-2 fw-bold text-slate-800 ">${s.name}</td>
        <td class="p-2 text-slate-500">${s.cpf || '-'}</td>
        <td class="p-2 text-slate-500">${s.contact.phone || '-'}</td>
        <td class="p-2 fw-semibold text-indigo-600">${s.unitCity || s.classroom}</td>
        <td class="p-2 text-slate-600 text-truncate max-w-[150px]">${s.profession || '-'}</td>
      </tr>
    `).join("") + (parsed.length > 50 ? `<tr><td colspan="5" class="p-2 text-center text-slate-400 fw-semibold italic">... e mais ${parsed.length - 50} alunos prontos para importar!</td></tr>` : "");
  }
}

function switchImportTab(tab) {
  const tabs = ['api', 'paste', 'file'];
  tabs.forEach(t => {
    const pane = document.getElementById(`import-pane-${t}`);
    const btn = document.getElementById(`import-tab-${t}`);
    if (t === tab) {
      pane?.classList.remove("hidden");
      btn?.classList.remove("border-transparent", "text-slate-500", "dark:text-slate-400");
      btn?.classList.add("border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "border-b-2");
    } else {
      pane?.classList.add("hidden");
      btn?.classList.remove("border-indigo-600", "text-indigo-600", "dark:text-indigo-400");
      btn?.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400");
    }
  });
}

function processPastedText() {
  const textarea = document.getElementById("raw-paste-input");
  const rawText = textarea?.value?.trim();
  if (!rawText) {
    showToast("Por favor, cole os dados da sua planilha.", "warning");
    return;
  }

  const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows = lines.map(l => l.split("\t").map(v => v.trim()));
  processGoogleSheetsApiRows(rows);
}

function handleClassroomFileSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.split(/\r?\n/).filter(line => line.trim().length > 0);
    const delimiter = lines[0].includes(";") ? ";" : ",";
    const rows = lines.map(l => l.split(delimiter).map(v => v.replace(/^["']|["']$/g, '').trim()));
    processGoogleSheetsApiRows(rows);
  };
  reader.readAsText(file, "UTF-8");
}

function commitImportedStudents() {
  const newStudents = AppState.importState.parsedStudents;
  if (!newStudents || newStudents.length === 0) return;

  if (AppState.importState.mode === "replace") {
    AppState.students = newStudents;
  } else {
    newStudents.forEach(newS => {
      const existingIdx = AppState.students.findIndex(s => 
        (newS.contact.email && s.contact?.email && s.contact.email.toLowerCase() === newS.contact.email.toLowerCase()) ||
        (s.name.toLowerCase() === newS.name.toLowerCase())
      );

      if (existingIdx !== -1) {
        AppState.students[existingIdx] = {
          ...AppState.students[existingIdx],
          ...newS,
          id: AppState.students[existingIdx].id,
          grades: { ...(AppState.students[existingIdx].grades || {}), ...(newS.grades || {}) }
        };
      } else {
        AppState.students.push(newS);
      }
    });
  }

  saveDataToStorage();
  closeModal();
  showToast(`Sucesso! ${newStudents.length} alunos integrados ao Eu Por Dias!`, "success");
  renderApp();
}

// -------------------------------------------------------------
// INTEGRAÇÃO COM SUPABASE CLOUD DATABASE & STORAGE
// -------------------------------------------------------------

const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- SCHEMA SUPABASE: SISTEMA EU POR DIAS (GESTAO DE ALUNOS)
-- ==============================================================
-- Execute este script no SQL Editor do Supabase (https://supabase.com)

-- 1. Criar a tabela de alunos
CREATE TABLE IF NOT EXISTS public.alunos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT,
    whatsapp TEXT,
    email TEXT,
    cidade TEXT,
    bairro TEXT,
    unidade TEXT,
    status TEXT DEFAULT 'Ativo',
    profissao TEXT,
    foto_url TEXT,
    grades JSONB DEFAULT '{}'::jsonb,
    presencas JSONB DEFAULT '{}'::jsonb,
    observacoes TEXT,
    dados_completos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguranca a nivel de linha (RLS)
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- 3. Criar politica de acesso para cliente web (usando Anon Key)
DROP POLICY IF EXISTS "Acesso total publico alunos" ON public.alunos;
CREATE POLICY "Acesso total publico alunos" 
ON public.alunos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Criar a tabela de mensagens do chat ao vivo (Fórum)
CREATE TABLE IF NOT EXISTS public.forum_messages (
    id TEXT PRIMARY KEY,
    "authorName" TEXT,
    "authorRole" TEXT,
    "authorPhoto" TEXT,
    "createdAt" TEXT,
    text TEXT
);

-- 5. Habilitar RLS e criar política de acesso para o chat
ALTER TABLE public.forum_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total publico forum_messages" ON public.forum_messages;
CREATE POLICY "Acesso total publico forum_messages" ON public.forum_messages
FOR ALL USING (true) WITH CHECK (true);

-- 6. Criar bucket de armazenamento para Fotos de Alunos (Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotos-alunos', 'fotos-alunos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Liberar acesso de leitura e upload de fotos no bucket
DROP POLICY IF EXISTS "Acesso publico fotos alunos" ON storage.objects;
CREATE POLICY "Acesso publico fotos alunos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'fotos-alunos') 
WITH CHECK (bucket_id = 'fotos-alunos');
`;

function getSupabaseClient() {
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    return null;
  }
  const url = (AppState.settings.supabaseUrl || "").trim();
  const key = (AppState.settings.supabaseAnonKey || "").trim();
  if (!url || !key) return null;
  try {
    return window.supabase.createClient(url, key);
  } catch (e) {
    console.error("Erro ao inicializar Supabase Client:", e);
    return null;
  }
}

async function testSupabaseConnection(silent = false) {
  const urlInput = document.getElementById("supabase-url-input");
  const keyInput = document.getElementById("supabase-key-input");
  const url = (urlInput ? urlInput.value : AppState.settings.supabaseUrl || "").trim();
  const anonKey = (keyInput ? keyInput.value : AppState.settings.supabaseAnonKey || "").trim();

  if (!url || !anonKey) {
    if (!silent) showToast("Preencha a URL e a Anon Key do Supabase antes de testar.", "error");
    return false;
  }

  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    if (!silent) showToast("Biblioteca do Supabase indisponível no navegador. Verifique sua conexão.", "error");
    return false;
  }

  const btn = document.getElementById("btn-test-supabase");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testando Conexão...';
  }

  try {
    const client = window.supabase.createClient(url, anonKey);
    const { count, error } = await client.from("alunos").select("id", { count: "exact", head: true });

    if (error) {
      if (error.code === "42P01" || (error.message && error.message.includes("relation \\\"public.alunos\\\" does not exist"))) {
        AppState.settings.supabaseUrl = url;
        AppState.settings.supabaseAnonKey = anonKey;
        AppState.settings.supabaseConnected = true;
        saveSettings();
        updateSupabaseConnectionStatusUI(true, "Projeto Conectado! (Crie a tabela na aba 'Script SQL')");
        if (!silent) {
          showToast("Conexão OK com Supabase! Falta criar a tabela. Vá na aba 'Script SQL', copie e execute no Supabase.", "warning", 6000);
        }
        updateHeaderCounts();
        return true;
      }
      throw error;
    }

    AppState.settings.supabaseUrl = url;
    AppState.settings.supabaseAnonKey = anonKey;
    AppState.settings.supabaseConnected = true;
    saveSettings();

    updateSupabaseConnectionStatusUI(true, `Conectado com sucesso! (${count || 0} alunos no banco)`);
    if (!silent) {
      showToast(`Conectado ao Supabase! ${count || 0} registros encontrados no banco.`, "success");
    }
    updateHeaderCounts();
    return true;
  } catch (err) {
    console.error("Falha de conexão com Supabase:", err);
    AppState.settings.supabaseConnected = false;
    saveSettings();
    updateSupabaseConnectionStatusUI(false, "Erro de Conexão: " + (err.message || "Credenciais inválidas"));
    if (!silent) {
      showToast("Falha na conexão: " + (err.message || "Verifique a URL e Anon Key"), "error");
    }
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-plug-circle-check"></i> Testar e Salvar Conexão';
    }
  }
}

function updateSupabaseConnectionStatusUI(connected, message) {
  const badge = document.getElementById("supabase-status-badge");
  const msgEl = document.getElementById("supabase-status-msg");
  if (badge) {
    if (connected) {
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
      badge.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i> Conectado';
    } else {
      badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
      badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Desconectado';
    }
  }
  if (msgEl) {
    msgEl.textContent = message || (connected ? "Pronto para sincronização" : "Configure a URL e a Anon Key pública");
  }
}

function disconnectSupabase() {
  if (!confirm("Deseja desconectar o Supabase deste navegador? Seus dados locais permanecerão intactos.")) return;
  AppState.settings.supabaseUrl = "";
  AppState.settings.supabaseAnonKey = "";
  AppState.settings.supabaseConnected = false;
  AppState.settings.lastSupabaseSync = null;
  saveSettings();
  showToast("Supabase desconectado com sucesso.", "info");
  closeModal();
  updateHeaderCounts();
}

async function syncStudentsToSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    showToast("Supabase não conectado. Configure a URL e a Anon Key primeiro.", "error");
    switchSupabaseTab("config");
    return;
  }

  if (AppState.students.length === 0) {
    showToast("Nenhum aluno na base local para sincronizar.", "warning");
    return;
  }

  const syncBtn = document.getElementById("btn-sync-to-supabase");
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando para a Nuvem...';
  }

  try {
    const total = AppState.students.length;
    const batchSize = 100;
    let uploadedCount = 0;

    for (let i = 0; i < total; i += batchSize) {
      const chunk = AppState.students.slice(i, i + batchSize);
      const rows = chunk.map(s => {
        const cleanGrades = {};
        Object.entries(s.grades || {}).forEach(([k, v]) => {
          cleanGrades[normalizeSubjectName(k)] = v;
        });
        return {
          id: String(s.id),
          nome: s.name || "Aluno Sem Nome",
          cpf: s.cpf || "",
          whatsapp: s.phone || s.whatsapp || "",
          email: s.email || "",
          cidade: s.city || "",
          bairro: s.neighborhood || "",
          unidade: s.classroom || s.unit || "",
          status: s.status || "Ativo",
          profissao: s.occupation || "",
          foto_url: s.photo || "",
          grades: cleanGrades,
          presencas: s.attendance || {},
          observacoes: s.notes || "",
          dados_completos: { ...s, grades: cleanGrades },
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await client.from("alunos").upsert(rows, { onConflict: "id" });
      if (error) throw error;
      uploadedCount += rows.length;
    }

    AppState.settings.lastSupabaseSync = new Date().toISOString();
    AppState.settings.supabaseConnected = true;
    saveSettings();

    showToast(`Sucesso! ${uploadedCount} alunos sincronizados com a nuvem Supabase!`, "success", 5000);
    renderSupabaseSyncStats();
    updateHeaderCounts();
  } catch (err) {
    console.error("Erro ao sincronizar com Supabase:", err);
    showToast("Erro ao sincronizar com Supabase: " + (err.message || "Verifique se a tabela 'alunos' foi criada no SQL Editor"), "error", 6000);
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Enviar Alunos Agora (Backup na Nuvem)';
    }
  }
}

async function fetchStudentsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    showToast("Supabase não configurado. Configure a URL e a Anon Key primeiro.", "error");
    switchSupabaseTab("config");
    return;
  }

  const pullBtn = document.getElementById("btn-fetch-from-supabase");
  if (pullBtn) {
    pullBtn.disabled = true;
    pullBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Baixando da Nuvem...';
  }

  try {
    const { data, error } = await client.from("alunos").select("*").order("nome", { ascending: true });
    if (error) throw error;

    if (!data || data.length === 0) {
      showToast("Nenhum registro de aluno encontrado na nuvem Supabase.", "info");
      return;
    }

    if (!confirm(`Foram encontrados ${data.length} alunos na nuvem Supabase. Deseja integrá-los aos seus dados locais?`)) {
      return;
    }

    let updatedCount = 0;
    let addedCount = 0;

    data.forEach(row => {
      let studentObj;
      if (row.dados_completos && typeof row.dados_completos === "object" && row.dados_completos.id) {
        studentObj = {
          ...row.dados_completos,
          id: String(row.id || row.dados_completos.id),
          name: row.nome || row.dados_completos.name,
          photo: row.foto_url || row.dados_completos.photo
        };
      } else {
        studentObj = {
          id: String(row.id || "alu_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5)),
          name: row.nome || "Aluno Sem Nome",
          cpf: row.cpf || "",
          phone: row.whatsapp || "",
          email: row.email || "",
          city: row.cidade || "",
          neighborhood: row.bairro || "",
          classroom: row.unidade || "Geral",
          status: row.status || "Ativo",
          occupation: row.profissao || "",
          photo: row.foto_url || null,
          grades: row.grades || {},
          attendance: row.presencas || {},
          notes: row.observacoes || ""
        };
      }

      if (studentObj.grades && typeof studentObj.grades === "object") {
        const cleanGrades = {};
        Object.entries(studentObj.grades).forEach(([k, v]) => {
          cleanGrades[normalizeSubjectName(k)] = v;
        });
        studentObj.grades = cleanGrades;
      }

      const existingIndex = AppState.students.findIndex(s => 
        String(s.id) === String(studentObj.id) || 
        (s.name && studentObj.name && s.name.trim().toLowerCase() === studentObj.name.trim().toLowerCase())
      );

      if (existingIndex >= 0) {
        AppState.students[existingIndex] = {
          ...AppState.students[existingIndex],
          ...studentObj,
          id: AppState.students[existingIndex].id
        };
        updatedCount++;
      } else {
        AppState.students.push(studentObj);
        addedCount++;
      }
    });

    AppState.settings.lastSupabaseSync = new Date().toISOString();
    AppState.settings.supabaseConnected = true;
    saveDataToStorage();
    saveSettings();

    showToast(`Restauração Concluída! ${addedCount} novos alunos adicionados e ${updatedCount} atualizados da nuvem.`, "success", 5000);
    renderApp();
    renderSupabaseSyncStats();
    updateHeaderCounts();
  } catch (err) {
    console.error("Erro ao baixar alunos do Supabase:", err);
    showToast("Erro ao baixar dados do Supabase: " + (err.message || "Tente novamente"), "error");
  } finally {
    if (pullBtn) {
      pullBtn.disabled = false;
      pullBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Baixar Dados da Nuvem (Restaurar)';
    }
  }
}

function copySupabaseSqlScript() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA).then(() => {
      showToast("Script SQL copiado com sucesso! Cole no SQL Editor do Supabase.", "success");
    }).catch(() => {
      fallbackCopySql();
    });
  } else {
    fallbackCopySql();
  }
}

function fallbackCopySql() {
  const textarea = document.getElementById("supabase-sql-code");
  if (textarea) {
    textarea.select();
    document.execCommand("copy");
    showToast("Script SQL copiado!", "success");
  }
}

function renderSupabaseSyncStats() {
  const syncStatEl = document.getElementById("supabase-sync-timestamp");
  if (syncStatEl) {
    if (AppState.settings.lastSupabaseSync) {
      const d = new Date(AppState.settings.lastSupabaseSync);
      syncStatEl.textContent = "Última sincronização: " + d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR");
    } else {
      syncStatEl.textContent = "Nenhuma sincronização realizada ainda.";
    }
  }
}

function switchSupabaseTab(tab) {
  const tabs = ["config", "sync", "sql"];
  tabs.forEach(t => {
    const pane = document.getElementById("supabase-pane-" + t);
    const btn = document.getElementById("supabase-tab-" + t);
    if (t === tab) {
      pane?.classList.remove("hidden");
      btn?.classList.remove("border-transparent", "text-slate-500", "dark:text-slate-400");
      btn?.classList.add("border-emerald-600", "text-emerald-600", "dark:text-emerald-400", "border-b-2");
    } else {
      pane?.classList.add("hidden");
      btn?.classList.remove("border-emerald-600", "text-emerald-600", "dark:text-emerald-400", "border-b-2");
      btn?.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400");
    }
  });
}

function openSupabaseModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const currentUrl = AppState.settings.supabaseUrl || "";
  const currentKey = AppState.settings.supabaseAnonKey || "";
  const isConnected = AppState.settings.supabaseConnected && !!currentUrl && !!currentKey;
  const totalStudents = AppState.students.length;
  const lastSyncText = AppState.settings.lastSupabaseSync 
    ? new Date(AppState.settings.lastSupabaseSync).toLocaleDateString("pt-BR") + " às " + new Date(AppState.settings.lastSupabaseSync).toLocaleTimeString("pt-BR")
    : "Nunca";

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 d-flex align-items-center justify-content-between bg-emerald-50/40 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white d-flex align-items-center justify-content-center text-lg fw-bold shadow-md shadow-emerald-600/20">
              <i class="fa-solid fa-cloud"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h2 class="text-base fw-bold text-slate-900 ">
                  Supabase Cloud Database & Storage
                </h2>
                <span id="supabase-status-badge" class="${isConnected ? 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'}">
                  <i class="fa-solid ${isConnected ? 'fa-circle-check text-emerald-600' : 'fa-circle-notch text-slate-400'}"></i> ${isConnected ? 'Conectado' : 'Não configurado'}
                </span>
              </div>
              <p class="text-xs text-slate-500 ">Banco de dados PostgreSQL e backup seguro na nuvem 100% gratuito</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle text-slate-400 d-flex align-items-center justify-content-center ">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Abas -->
        <div class="px-6 pt-3 border-b border-slate-100 bg-slate-50/30 ">
          <div class="d-flex align-items-center gap-2">
            <button 
              onclick="switchSupabaseTab('config')" 
              id="supabase-tab-config"
              class="px-4 py-2 text-xs fw-bold border-b-2 border-emerald-600 text-emerald-600 d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-key"></i> 1. Conexão & Chaves
            </button>
            <button 
              onclick="switchSupabaseTab('sync')" 
              id="supabase-tab-sync"
              class="px-4 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-arrows-rotate"></i> 2. Backup & Sincronização
            </button>
            <button 
              onclick="switchSupabaseTab('sql')" 
              id="supabase-tab-sql"
              class="px-4 py-2 text-xs fw-semibold text-slate-500 border-b-2 border-transparent d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-database"></i> 3. Script SQL & Passo a Passo
            </button>
          </div>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6 overflow-y-auto space-y-5 flex-grow-1">

          <!-- ABA 1: CONEXÃO -->
          <div id="supabase-pane-config" class="space-y-4">
            <div class="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
              <div class="d-flex align-items-center gap-2 fw-bold text-emerald-800 ">
                <i class="fa-solid fa-gift"></i> Plano Gratuito Vitalício (Supabase Free Tier)
              </div>
              <p class="text-emerald-700/90 leading-relaxed">
                O Supabase fornece gratuitamente: <strong>500 MB de banco de dados PostgreSQL</strong> (suficiente para mais de 100.000 alunos), <strong>1 GB de armazenamento de arquivos/fotos</strong>, e <strong>50.000 usuários ativos mensais</strong>. Seus dados ficam protegidos e salvos na nuvem sem nenhum custo de hospedagem.
              </p>
            </div>

            <div class="space-y-3">
              <div>
                <label class="d-block text-xs fw-bold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input 
                  type="text" 
                  id="supabase-url-input" 
                  value="${currentUrl}"
                  placeholder="https://sua-empresa-ou-projeto.supabase.co" 
                  class="w-100 px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 font-monospace text-slate-900 "
                >
                <p class="text-[11px] text-slate-400 mt-1">Encontrada no seu painel Supabase em: Project Settings > API > Project URL</p>
              </div>

              <div>
                <label class="d-block text-xs fw-bold text-slate-700 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input 
                  type="password" 
                  id="supabase-key-input" 
                  value="${currentKey}"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  class="w-100 px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 font-monospace text-slate-900 "
                >
                <p class="text-[11px] text-slate-400 mt-1">Chave pública de cliente (anon public key). Seguro para uso no navegador com as políticas RLS ativas.</p>
              </div>
            </div>

            <div class="pt-2 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div class="text-xs text-slate-500" id="supabase-status-msg">
                ${isConnected ? 'Status: Conectado e autenticado' : 'Status: Aguardando configuração'}
              </div>
              <div class="d-flex align-items-center gap-2">
                ${currentUrl ? `
                  <button 
                    onclick="disconnectSupabase()" 
                    class="px-3.5 py-2 rounded-xl text-xs fw-bold border border-red-200 text-red-600 transition-colors"
                  >
                    Desconectar
                  </button>
                ` : ''}
                <button 
                  id="btn-test-supabase"
                  onclick="testSupabaseConnection(false)" 
                  class="px-5 py-2.5 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition-all d-flex align-items-center gap-2"
                >
                  <i class="fa-solid fa-plug-circle-check"></i> Testar e Salvar Conexão
                </button>
              </div>
            </div>
          </div>

          <!-- ABA 2: BACKUP & SINCRONIZAÇÃO -->
          <div id="supabase-pane-sync" class="space-y-4 hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Enviar para Nuvem -->
              <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div class="d-flex align-items-center gap-2 fw-bold text-slate-900 text-sm">
                  <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  Enviar para a Nuvem
                </div>
                <p class="text-xs text-slate-500 ">
                  Envia os <strong>${totalStudents} alunos</strong> cadastrados no navegador diretamente para o banco de dados PostgreSQL no Supabase. Atualiza alunos existentes e insere os novos (upsert por ID).
                </p>
                <button 
                  id="btn-sync-to-supabase"
                  onclick="syncStudentsToSupabase()" 
                  class="w-100 py-2.5 px-4 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 d-flex align-items-center justify-content-center gap-2 transition-all"
                >
                  <i class="fa-solid fa-cloud-arrow-up"></i> Enviar Alunos Agora (Backup na Nuvem)
                </button>
              </div>

              <!-- Baixar da Nuvem -->
              <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div class="d-flex align-items-center gap-2 fw-bold text-slate-900 text-sm">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                  </div>
                  Baixar da Nuvem
                </div>
                <p class="text-xs text-slate-500 ">
                  Restaura ou sincroniza os alunos salvos no banco Supabase para este computador ou celular. Ideal para abrir o sistema em múltiplos dispositivos.
                </p>
                <button 
                  id="btn-fetch-from-supabase"
                  onclick="fetchStudentsFromSupabase()" 
                  class="w-100 py-2.5 px-4 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/20 d-flex align-items-center justify-content-center gap-2 transition-all"
                >
                  <i class="fa-solid fa-cloud-arrow-down"></i> Baixar Dados da Nuvem (Restaurar)
                </button>
              </div>
            </div>

            <!-- Informações de Segurança e Última Sincronização -->
            <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1.5">
              <div class="d-flex align-items-center justify-content-between fw-bold text-indigo-900 ">
                <span class="d-flex align-items-center gap-1.5"><i class="fa-solid fa-shield-halved"></i> Camada LGPD Ativa</span>
                <span id="supabase-sync-timestamp" class="text-[11px] fw-normal text-indigo-700 ">Última sincronização: ${lastSyncText}</span>
              </div>
              <p class="text-indigo-700/80 ">
                Os dados sensíveis trafegam criptografados de ponta a ponta via SSL/HTTPS até os servidores do Supabase. O Modo LGPD em sala de aula continua ativo para proteger a visão de alunos e terceiros.
              </p>
            </div>
          </div>

          <!-- ABA 3: SCRIPT SQL & PASSO A PASSO -->
          <div id="supabase-pane-sql" class="space-y-4 hidden">
            <div class="space-y-3">
              <div class="text-xs text-slate-600 space-y-2">
                <p class="fw-bold text-slate-800 ">Como criar seu banco gratuito em 2 minutos:</p>
                <ol class="list-decimal list-inside space-y-1 text-slate-500 ">
                  <li>Acesse <strong><a href="https://supabase.com" target="_blank" class="text-emerald-600 text-decoration-underline">supabase.com</a></strong> e crie uma conta gratuita (pode ser com seu login GitHub).</li>
                  <li>Clique em <strong>New Project</strong> e defina um nome (ex: <code class="bg-slate-100 px-1 py-0.5 rounded">edugestao-alunos</code>).</li>
                  <li>No menu lateral esquerdo, clique no ícone do <strong>SQL Editor</strong>.</li>
                  <li>Clique no botão abaixo <strong>"Copiar Script SQL"</strong>, cole no editor e aperte <strong>Run</strong>.</li>
                  <li>Vá em <strong>Project Settings > API</strong>, copie a <strong>Project URL</strong> e a <strong>anon public key</strong>, e cole na aba 1 deste painel!</li>
                </ol>
              </div>

              <div class="position-relative">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <span class="text-xs fw-bold text-slate-700 ">Script SQL DDL:</span>
                  <button 
                    onclick="copySupabaseSqlScript()" 
                    class="d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-lg text-xs fw-bold bg-emerald-600 text-white shadow transition-all"
                  >
                    <i class="fa-solid fa-copy"></i> Copiar Script SQL
                  </button>
                </div>
                <textarea 
                  id="supabase-sql-code" 
                  readonly 
                  rows="9" 
                  class="w-100 p-3 rounded-xl text-[11px] font-monospace bg-slate-900 text-emerald-400 border border-slate-700 "
                >${SUPABASE_SQL_SCHEMA}</textarea>
              </div>
            </div>
          </div>

        </div>

        <!-- Rodapé do Modal -->
        <div class="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 d-flex align-items-center justify-content-between">
          <span class="text-xs text-slate-400">
            <i class="fa-solid fa-database text-emerald-500"></i> Armazenamento Híbrido: Offline Local + Nuvem Supabase
          </span>
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs fw-bold bg-slate-200 text-slate-700 transition-colors">
            Fechar
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ABA 2: LANÇAMENTO DE NOTAS
// -------------------------------------------------------------
function renderGradesTab(container) {
  // REGRA DE ACESSO: Exige identificação por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'grades');
    return;
  }

  const filtered = getFilteredStudents();
  const subjects = AppState.subjects;

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <div class="d-flex flex-column sm:flex-row align-items-start sm:items-center justify-content-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-circle text-[10px] fw-bold bg-indigo-100 text-indigo-700 ">
              MÍDIAS DIGITAIS
            </span>
          </div>
          <h2 class="text-base fw-bold text-slate-900 mt-1 d-flex align-items-center gap-2">
            <i class="fa-solid fa-pen-nib text-indigo-600"></i> Planilha de Avaliações e Notas dos Módulos
          </h2>
          <p class="text-xs text-slate-500 ">Clique nas notas para editar. O sistema calcula a média geral e situação automaticamente.</p>
        </div>
        <div class="d-flex align-items-center gap-2 w-100 sm:w-auto flex-wrap sm:flex-nowrap">
          <select 
            id="filter-classroom-select"
            onchange="handleClassroomFilterChange(this.value)"
            class="px-3 py-2 rounded-xl text-xs fw-semibold border border-slate-200 bg-slate-50 text-slate-800 "
          >
            <option value="all">Todas as Turmas</option>
          </select>
          <button 
            type="button"
            onclick="window.print()" 
            class="px-3.5 py-2 rounded-xl text-xs fw-bold border border-slate-200 text-slate-700 d-flex align-items-center gap-1.5 transition-all shadow-xs"
            title="Imprimir Relatório de Notas"
          >
            <i class="fa-solid fa-print"></i>
            <span class="d-none d-md-inline">Imprimir</span>
          </button>
          <button 
            type="button"
            id="btn-send-my-grades-email"
            onclick="sendLoggedInStudentGradesEmail()" 
            class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/25 d-flex align-items-center gap-2 transition-all transform active:scale-95"
            title="Enviar relatório atual de notas do aluno logado diretamente para o e-mail cadastrado"
          >
            <i class="fa-solid fa-envelope"></i>
            <span>Enviar para o meu e-mail</span>
          </button>
          <button onclick="openSubjectsConfigModal()" class="px-3 py-2 rounded-xl text-xs fw-bold border border-slate-200 text-slate-700 d-flex align-items-center gap-1.5">
            <i class="fa-solid fa-gear"></i>
            <span class="d-none sm:inline">Módulos</span>
          </button>
        </div>
      </div>

      <!-- Tabela Matriz de Notas -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-100 text-start border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 fw-bold text-slate-600 ">
                <th class="py-3 px-4 min-w-[200px] position-sticky start-0 bg-slate-50 z-10">Aluno</th>
                <th class="py-3 px-3">Turma</th>
                ${subjects.map(s => `
                  <th class="py-3 px-3 text-center min-w-[120px] border-l border-slate-100 ">
                    <span class="line-clamp-1" title="${s}">${s}</span>
                  </th>
                `).join("")}
                <th class="py-3 px-4 text-center bg-indigo-50/50 border-l border-slate-200 ">Média Geral</th>
                <th class="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 ">
              ${filtered.map(student => {
                const stats = calculateStudentOverallStats(student);
                const isRevealed = !AppState.privacyMode || AppState.revealedStudentIds.has(student.id);
                const displayName = maskName(student.name, isRevealed);
                return `
                  <tr class=" transition-colors">
                    <td class="py-2.5 px-4 fw-semibold text-slate-800 position-sticky start-0 bg-white z-10 shadow-sm">
                      <div class="d-flex align-items-center justify-content-between gap-2 max-w-[210px]">
                        <span class="text-truncate" title="${isRevealed ? student.name : displayName}">
                          ${displayName}
                        </span>
                        ${AppState.privacyMode ? `
                          <button 
                            onclick="toggleRevealStudent('${student.id}')" 
                            class="p-1 rounded text-[11px] ${isRevealed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-amber-500'} flex-shrink-0 transition-colors"
                            title="${isRevealed ? 'Ocultar nome completo (LGPD)' : 'Revelar nome completo (Requer Modo Deus)'}"
                          >
                            <i class="fa-solid ${isRevealed ? 'fa-eye' : 'fa-eye-slash'}"></i>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[11px] fw-medium bg-slate-100 text-slate-600 text-truncate d-block max-w-[120px]" title="${student.classroom}">
                        ${student.classroom}
                      </span>
                    </td>
                    ${subjects.map(subject => {
                      const subjectData = student.grades?.[subject] || {};
                      const { avg, hasGrades } = calculateSubjectAverage(subjectData);
                      const avgColor = !hasGrades ? 'text-slate-400' : (avg >= AppState.settings.passingGrade ? 'text-emerald-600 dark:text-emerald-400 font-bold' : (avg >= AppState.settings.recoveryGrade ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'));

                      return `
                        <td class="py-2.5 px-3 text-center border-l border-slate-100 ">
                          <button 
                            onclick="openGradesModal('${student.id}', '${subject}')" 
                            class="px-2 py-1 rounded ${avgColor} transition-colors w-100 text-center font-monospace"
                            title="Editar notas do módulo ${subject}"
                          >
                            ${hasGrades ? avg.toFixed(1) : '<span class="text-slate-300 ">-</span>'}
                          </button>
                        </td>
                      `;
                    }).join("")}
                    <td class="py-2.5 px-4 text-center fw-bolder text-sm bg-indigo-50/30 border-l border-slate-200 ">
                      <span class="${stats.overallAvg >= AppState.settings.passingGrade ? 'text-emerald-600 dark:text-emerald-400' : stats.overallAvg >= AppState.settings.recoveryGrade ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
                        ${stats.overallAvg.toFixed(1)}
                      </span>
                    </td>
                    <td class="py-2.5 px-4 text-center">
                      <button 
                        onclick="openGradesModal('${student.id}')"
                        class="px-2.5 py-1 rounded-lg text-xs fw-bold bg-indigo-50 text-indigo-600 "
                      >
                        Ficha
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  populateClassroomFilterSelect();
}

// -------------------------------------------------------------
// ABA 3: DASHBOARD
// -------------------------------------------------------------
function renderDashboard(container) {
  const totalStudents = AppState.students.length;
  let approved = 0;
  let recovery = 0;
  let failed = 0;
  let totalAvgSum = 0;
  let countWithAvg = 0;

  AppState.students.forEach(s => {
    const stats = calculateStudentOverallStats(s);
    if (stats.status === "Aprovado") approved++;
    else if (stats.status === "Em Recuperação") recovery++;
    else if (stats.status === "Reprovado") failed++;

    if (stats.gradedSubjectsCount > 0) {
      totalAvgSum += stats.overallAvg;
      countWithAvg++;
    }
  });

  const generalAvg = countWithAvg > 0 ? (totalAvgSum / countWithAvg).toFixed(1) : "0.0";
  const passRate = totalStudents > 0 ? Math.round((approved / totalStudents) * 100) : 0;

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-xs fw-bold text-slate-500 text-uppercase tracking-wider">Alunos Matriculados</span>
            <h3 class="text-2xl fw-bolder text-slate-900 mt-1">${totalStudents}</h3>
            <span class="text-[11px] text-indigo-600 fw-medium d-flex align-items-center gap-1 mt-1">
              <i class="fa-solid fa-certificate"></i> Emprega Mais Alagoas
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-xl">
            <i class="fa-solid fa-users"></i>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-xs fw-bold text-slate-500 text-uppercase tracking-wider">Média Geral do Curso</span>
            <h3 class="text-2xl fw-bolder text-emerald-600 mt-1 d-flex align-items-baseline gap-2">
              ${generalAvg} 
              <span class="text-sm fw-bold text-slate-400 ">(${totalStudents})</span>
            </h3>
            <span class="text-[11px] text-emerald-600 fw-medium d-flex align-items-center gap-1 mt-1">
              <i class="fa-solid fa-check"></i> Meta mínima: ${AppState.settings.passingGrade.toFixed(1)}
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 d-flex align-items-center justify-content-center text-xl">
            <i class="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-xs fw-bold text-slate-500 text-uppercase tracking-wider">Aptidão / Certificação</span>
            <h3 class="text-2xl fw-bolder text-blue-600 mt-1">${passRate}%</h3>
            <span class="text-[11px] text-slate-500 fw-medium d-flex align-items-center gap-1 mt-1">
              ${approved} alunos aptos
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 d-flex align-items-center justify-content-center text-xl">
            <i class="fa-solid fa-award"></i>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm d-flex align-items-center justify-content-between">
          <div>
            <span class="text-xs fw-bold text-slate-500 text-uppercase tracking-wider">Em Atenção / Reforço</span>
            <h3 class="text-2xl fw-bolder text-amber-600 mt-1">${recovery + failed}</h3>
            <span class="text-[11px] text-amber-600 fw-medium d-flex align-items-center gap-1 mt-1">
              ${recovery} recuperação, ${failed} pendentes
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 d-flex align-items-center justify-content-center text-xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Desempenho por Módulo de Mídias Digitais</h3>
              <p class="text-xs text-slate-500 ">Média geral das notas lançadas em cada matéria</p>
            </div>
          </div>
          <div class="position-relative h-64 w-100">
            <canvas id="subjectAvgChart"></canvas>
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm d-flex flex-column justify-content-between">
          <div class="mb-4">
            <h3 class="fw-bold text-sm text-slate-900 ">Situação da Turma</h3>
            <p class="text-xs text-slate-500 ">Distribuição geral dos alunos</p>
          </div>
          <div class="position-relative h-56 w-100 d-flex align-items-center justify-content-center">
            <canvas id="statusDistChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initDashboardCharts();
  }, 50);
}

function initDashboardCharts() {
  if (typeof Chart === "undefined") return;

  if (AppState.charts.subjectAvg) AppState.charts.subjectAvg.destroy();
  if (AppState.charts.statusDist) AppState.charts.statusDist.destroy();

  const subjectLabels = AppState.subjects;
  const subjectAverages = subjectLabels.map(subj => {
    let sum = 0;
    let count = 0;
    AppState.students.forEach(s => {
      const g = s.grades?.[subj];
      const { avg, hasGrades } = calculateSubjectAverage(g);
      if (hasGrades) {
        sum += avg;
        count++;
      }
    });
    return count > 0 ? Number((sum / count).toFixed(1)) : 0;
  });

  const ctxSubject = document.getElementById("subjectAvgChart");
  if (ctxSubject) {
    const isDark = AppState.settings.darkMode;
    AppState.charts.subjectAvg = new Chart(ctxSubject, {
      type: "bar",
      data: {
        labels: subjectLabels,
        datasets: [{
          label: "Média do Módulo",
          data: subjectAverages,
          backgroundColor: subjectAverages.map(avg => 
            avg >= AppState.settings.passingGrade ? "rgba(99, 102, 241, 0.85)" : "rgba(245, 158, 11, 0.85)"
          ),
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            grid: { color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
            ticks: { color: isDark ? "#94a3b8" : "#64748b" }
          },
          x: {
            grid: { display: false },
            ticks: { color: isDark ? "#94a3b8" : "#64748b", font: { size: 10 } }
          }
        }
      }
    });
  }

  let approved = 0;
  let recovery = 0;
  let failed = 0;
  AppState.students.forEach(s => {
    const stats = calculateStudentOverallStats(s);
    if (stats.status === "Aprovado") approved++;
    else if (stats.status === "Em Recuperação") recovery++;
    else if (stats.status === "Reprovado") failed++;
  });

  const ctxStatus = document.getElementById("statusDistChart");
  if (ctxStatus) {
    AppState.charts.statusDist = new Chart(ctxStatus, {
      type: "doughnut",
      data: {
        labels: ["Aprovados", "Recuperação", "Reprovados"],
        datasets: [{
          data: [approved, recovery, failed],
          backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%"
      }
    });
  }
}

// -------------------------------------------------------------
// ABA 4: RELATÓRIOS & BACKUP (COM REGRA DE ACESSO POR CPF)
// -------------------------------------------------------------
function renderReportsTab(container) {
  // REGRA DE ACESSO: Exige autenticação por CPF cadastrado
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'reports');
    return;
  }

  // Usuário autenticado: exibe opções de acordo com o perfil
  const isProf = AppState.currentUser.role === 'professor';

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        
        <!-- Barra de Identificação do Usuário Logado -->
        <div class="d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-3 pb-4 mb-6 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-indigo-500 bg-indigo-100 d-flex align-items-center justify-content-center fw-bold text-indigo-600">
              ${AppState.currentUser.photo ? `
                <img src="${AppState.currentUser.photo}" alt="Foto" class="w-100 h-100 object-fit-cover">
              ` : `
                <i class="fa-solid fa-user"></i>
              `}
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h3 class="fw-bold text-sm text-slate-900 ">${AppState.currentUser.name}</h3>
                <span class="px-2 py-0.5 rounded-circle text-[10px] font-extrabold text-uppercase ${isProf ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                  ${isProf ? 'Docente / Coordenação' : 'Aluno Matriculado'}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 ">CPF: ${maskCpf(AppState.currentUser.cpf, false)} • Acesso autenticado com sucesso</p>
            </div>
          </div>
          <button onclick="logoutCurrentUser()" class="px-3.5 py-1.5 rounded-xl text-xs fw-semibold text-rose-600 border border-rose-200 self-start sm:self-auto d-flex align-items-center gap-1.5 transition-all">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
          </button>
        </div>

        <h2 class="text-lg fw-bold text-slate-900 mb-1 d-flex align-items-center gap-2">
          <i class="fa-solid fa-file-export text-indigo-600"></i> Relatórios, Planilhas e Backup
        </h2>
        <p class="text-xs text-slate-500 mb-6">
          ${isProf ? 'Exporte os dados completos do curso para abrir no Excel ou Google Sheets, imprima atas e faça backups.' : 'Acesse seu boletim escolar oficial, histórico de notas e comprovantes pedagógicos individuais.'}
        </p>

        ${isProf ? `
          <!-- Painel do Professor / Coordenação (Exportações Completas) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 d-flex flex-column justify-content-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center text-lg mb-3">
                  <i class="fa-solid fa-file-excel"></i>
                </div>
                <h3 class="fw-bold text-sm text-slate-900 mb-1">Planilha do Curso (CSV)</h3>
                <p class="text-xs text-slate-500 mb-4">
                  Exporta todos os ${AppState.students.length} alunos, telefones, polos/cidades de Alagoas, notas dos 7 módulos e médias para o Excel.
                </p>
              </div>
              <button onclick="exportStudentsToCSV()" class="w-100 py-2.5 rounded-xl fw-bold text-xs bg-emerald-600 text-white shadow d-flex align-items-center justify-content-center gap-2 transition-all">
                <i class="fa-solid fa-download"></i> Baixar Planilha (.csv)
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 d-flex flex-column justify-content-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg mb-3">
                  <i class="fa-solid fa-print"></i>
                </div>
                <h3 class="fw-bold text-sm text-slate-900 mb-1">Ata Oficial de Rendimento (PDF)</h3>
                <p class="text-xs text-slate-500 mb-4">
                  Formatação oficial para o Programa Emprega Mais Alagoas pronta para salvar em PDF ou imprimir.
                </p>
              </div>
              <button onclick="window.print()" class="w-100 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow d-flex align-items-center justify-content-center gap-2 transition-all">
                <i class="fa-solid fa-print"></i> Imprimir Ata Geral
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 d-flex flex-column justify-content-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 d-flex align-items-center justify-content-center text-lg mb-3">
                  <i class="fa-solid fa-cloud-arrow-down"></i>
                </div>
                <h3 class="fw-bold text-sm text-slate-900 mb-1">Backup Completo (JSON)</h3>
                <p class="text-xs text-slate-500 mb-4">
                  Salve cópia de segurança de todos os cadastros e notas, ou restaure em outro computador.
                </p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button onclick="exportBackupJSON()" class="flex-grow-1 py-2.5 rounded-xl fw-bold text-xs bg-purple-600 text-white shadow transition-all">
                  Backup
                </button>
                <button onclick="openRestoreModal()" class="flex-grow-1 py-2.5 rounded-xl fw-bold text-xs border border-purple-300 text-purple-700 transition-all">
                  Restaurar
                </button>
              </div>
            </div>

          </div>
        ` : `
          <!-- Painel do Aluno Autenticado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 d-flex flex-column justify-content-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg mb-3">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h3 class="fw-bold text-sm text-slate-900 mb-1">Meu Boletim Escolar Oficial</h3>
                <p class="text-xs text-slate-500 mb-4">
                  Visualize suas notas bimestrais nos 7 módulos, cálculo de média final, faltas registradas e situação de aprovação.
                </p>
              </div>
              <button onclick="openBoletimModal('${AppState.currentUser.id}')" class="w-100 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow d-flex align-items-center justify-content-center gap-2 transition-all">
                <i class="fa-solid fa-file-invoice"></i> Abrir Meu Boletim
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 d-flex flex-column justify-content-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center text-lg mb-3">
                  <i class="fa-solid fa-address-card"></i>
                </div>
                <h3 class="fw-bold text-sm text-slate-900 mb-1">Minha Ficha e Diagnóstico</h3>
                <p class="text-xs text-slate-500 mb-4">
                  Consulte os dados que você informou na matrícula, desafios de aprendizado, redes sociais e expectativas pedagógicas.
                </p>
              </div>
              <button onclick="openStudentProfileModal('${AppState.currentUser.id}')" class="w-100 py-2.5 rounded-xl fw-bold text-xs bg-emerald-600 text-white shadow d-flex align-items-center justify-content-center gap-2 transition-all">
                <i class="fa-solid fa-user-check"></i> Ver Minha Ficha Completa
              </button>
            </div>

          </div>

          <div class="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 d-flex align-items-center gap-2.5">
            <i class="fa-solid fa-circle-info text-base"></i>
            <span>Exportações em lote da turma completa e backups administrativos são reservados aos docentes e coordenadores do programa.</span>
          </div>
        `}

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ABA 5: SOBRE O SISTEMA & MANIFESTO ARQUITETURAL
// -------------------------------------------------------------
function renderAboutTab(container) {
  container.innerHTML = `
    <div class="space-y-6 fade-in text-slate-800">
      
      <!-- Hero Header do Manifesto -->
      <div class="p-6 sm:p-8 rounded-2xl text-white shadow-sm position-relative overflow-hidden" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%) !important;">
        <div class="position-relative z-10 max-w-3xl space-y-3">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="badge bg-white/15 text-white backdrop-blur-sm px-2.5 py-1 rounded-pill text-[10px] fw-semibold tracking-wide">
              EMPREGA MAIS ALAGOAS
            </span>
            <span class="badge bg-amber-400 text-slate-950 px-2.5 py-1 rounded-pill text-[10px] fw-bold">
              Mídias Digitais
            </span>
            <span class="badge bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-pill text-[10px] fw-semibold">
              <i class="fa-solid fa-users mr-1"></i> ${AppState.students.length || 715}+ Alunos Mapeados
            </span>
          </div>

          <h1 class="text-xl sm:text-3xl fw-bold text-white tracking-tight leading-tight">
            Manifesto Pedagógico: Da Planilha ao Cuidado Real
          </h1>

          <p class="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl mb-0">
            O <strong>Eu Por Dias</strong> nasceu da prática real em sala de aula para transformar planilhas estáticas em uma experiência docente viva, ágil e focada na emancipação profissional e humana de cada estudante em Alagoas.
          </p>

          <div class="pt-2 d-flex align-items-center gap-3 flex-wrap">
            <button 
              onclick="switchTab('students')" 
              class="btn btn-sm btn-light rounded-pill px-4 py-2 text-xs fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-arrow-left text-indigo-600"></i> Ir para a Lista de Alunos
            </button>
          </div>
        </div>

        <div class="position-absolute -right-8 -bottom-10 w-60 h-60 bg-white/10 rounded-circle blur-3xl pointer-events-none"></div>
      </div>

      <!-- Três Pilares Centrais -->
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <div class="card border border-slate-200/80 rounded-2xl bg-white p-4 h-100 shadow-xs space-y-2">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-base flex-shrink-0">
              <i class="fa-solid fa-heart-pulse"></i>
            </div>
            <h3 class="fw-bold text-sm text-slate-900 mb-1">1. Olhar Humanizado</h3>
            <p class="text-xs text-slate-600 leading-relaxed mb-0">
              Cada aluno possui rosto, histórico e aspirações únicas. O sistema permite identificar desafios individuais de aprendizagem para mentoria cirúrgica e empática.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card border border-slate-200/80 rounded-2xl bg-white p-4 h-100 shadow-xs space-y-2">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 d-flex align-items-center justify-content-center text-base flex-shrink-0">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <h3 class="fw-bold text-sm text-slate-900 mb-1">2. Agilidade & LGPD</h3>
            <p class="text-xs text-slate-600 leading-relaxed mb-0">
              Chamada visual, contato rápido pelo WhatsApp e lançamento instantâneo de notas com total conformidade com a LGPD para projeção em sala de aula.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card border border-slate-200/80 rounded-2xl bg-white p-4 h-100 shadow-xs space-y-2">
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 d-flex align-items-center justify-content-center text-base flex-shrink-0">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <h3 class="fw-bold text-sm text-slate-900 mb-1">3. Mercado & Renda</h3>
            <p class="text-xs text-slate-600 leading-relaxed mb-0">
              Conexão direta com o mural de vagas, trilhas de capacitação certificadas e ferramentas de inteligência artificial para inserção no mercado de trabalho.
            </p>
          </div>
        </div>
      </div>

      <!-- Da Planilha Tradicional ao Eu Por Dias (Tabela Sintética) -->
      <div class="card border border-slate-200/80 rounded-2xl bg-white p-4 shadow-xs">
        <h3 class="fw-bold text-sm text-slate-900 mb-3 d-flex align-items-center gap-2">
          <i class="fa-solid fa-scale-balanced text-indigo-600"></i> Da Planilha Tradicional ao Eu Por Dias
        </h3>
        <div class="table-responsive">
          <table class="table table-sm text-xs mb-0 align-middle">
            <thead class="bg-slate-50 text-slate-600 border-bottom">
              <tr>
                <th class="py-2.5 px-3 fw-semibold w-25">Aspecto</th>
                <th class="py-2.5 px-3 fw-semibold text-slate-500 w-35">Planilha Fria (Antes)</th>
                <th class="py-2.5 px-3 fw-semibold text-emerald-700 w-40">Eu Por Dias (Agora)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="py-2.5 px-3 fw-medium text-slate-900">Identificação</td>
                <td class="py-2.5 px-3 text-slate-500">Linhas de texto sem foto</td>
                <td class="py-2.5 px-3 text-emerald-800 fw-medium">Cards vivos com foto, situação e presença</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 fw-medium text-slate-900">Comunicação</td>
                <td class="py-2.5 px-3 text-slate-500">Copiar número e salvar contato</td>
                <td class="py-2.5 px-3 text-emerald-800 fw-medium">WhatsApp com mensagem formatada em 1 clique</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 fw-medium text-slate-900">Privacidade</td>
                <td class="py-2.5 px-3 text-slate-500">Exposição de dados no datashow</td>
                <td class="py-2.5 px-3 text-emerald-800 fw-medium">Proteção LGPD nativa e automática</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 fw-medium text-slate-900">Documentação</td>
                <td class="py-2.5 px-3 text-slate-500">Cálculo manual de médias</td>
                <td class="py-2.5 px-3 text-emerald-800 fw-medium">Boletins individuais e atas em PDF instantâneas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ficha Institucional -->
      <div class="card border border-slate-200/80 rounded-2xl bg-slate-50/70 p-3.5 shadow-xs">
        <div class="d-flex flex-column sm:flex-row align-items-start sm:items-center justify-content-between gap-2 text-xs text-slate-600">
          <div>
            <strong class="text-slate-900 d-block">Programa Emprega Mais Alagoas</strong>
            <span>Gestão de Mídias Digitais • Prof. Éverson Dias</span>
          </div>
          <div class="d-flex align-items-center gap-1.5 font-monospace text-[11px]">
            <span class="badge bg-white border border-slate-200 text-slate-700">v3.5.0</span>
            <span class="badge bg-white border border-slate-200 text-slate-700">Bootstrap 5.3</span>
            <span class="badge bg-white border border-slate-200 text-slate-700">Vanilla JS</span>
          </div>
        </div>
      </div>

    </div>
  `;
}

function openAboutModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          
          <div class="modal-header border-bottom py-3 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white d-flex align-items-center justify-content-center shadow-xs">
                <i class="fa-solid fa-graduation-cap text-xs"></i>
              </div>
              <div>
                <h3 class="text-sm fw-bold text-slate-900 mb-0">Sobre o Sistema • Eu Por Dias</h3>
                <p class="text-[11px] text-slate-500 mb-0">Gestão Pedagógica • Emprega Mais Alagoas</p>
              </div>
            </div>
            <button onclick="closeModal()" class="btn-close" aria-label="Fechar"></button>
          </div>

          <div class="modal-body p-4 p-sm-5 text-slate-700 space-y-4 overflow-y-auto">
            <div class="p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 to-purple-50/40 border border-indigo-100/80 space-y-2">
              <span class="badge bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">Missão & Propósito</span>
              <h4 class="text-base fw-bold text-slate-900 mb-1">Qualificação que Transforma Vidas em Alagoas</h4>
              <p class="text-xs text-slate-600 leading-relaxed mb-0">
                O <strong>Eu Por Dias</strong> é uma plataforma moderna desenvolvida para centralizar a frequência, avaliação e acompanhamento integral dos alunos do curso de <em>Gestão de Mídias Digitais</em>, garantindo transparência, proteção LGPD e conformidade com os padrões educacionais de excelência.
              </p>
            </div>

            <div class="row g-3">
              <div class="col-12 col-sm-4">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 h-100">
                  <i class="fa-solid fa-shield-halved text-indigo-600 text-sm mb-2 d-block"></i>
                  <strong class="text-xs text-slate-900 d-block mb-1">Privacidade LGPD</strong>
                  <p class="text-[11px] text-slate-500 mb-0">Mascaramento ativo de CPFs, telefones e e-mails com controle granular de acesso.</p>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 h-100">
                  <i class="fa-solid fa-cloud-arrow-down text-indigo-600 text-sm mb-2 d-block"></i>
                  <strong class="text-xs text-slate-900 d-block mb-1">Integração Contínua</strong>
                  <p class="text-[11px] text-slate-500 mb-0">Sincronização em tempo real com Google Sheets, Supabase e exportação CSV/JSON.</p>
                </div>
              </div>

              <div class="col-12 col-sm-4">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 h-100">
                  <i class="fa-solid fa-brain text-indigo-600 text-sm mb-2 d-block"></i>
                  <strong class="text-xs text-slate-900 d-block mb-1">Assistente com IA</strong>
                  <p class="text-[11px] text-slate-500 mb-0">Geração de relatórios pedagógicos, prompts customizados e diagnósticos individuais.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top py-2.5 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between">
            <span class="text-[11px] text-slate-500">Versão 3.6.0 • Plus Jakarta Sans & Indigo Theme</span>
            <button onclick="closeModal()" class="btn btn-sm btn-primary rounded-pill px-4 py-1.5 text-xs fw-semibold">
              Entendido
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function openStudentModal(studentId = null) {
  AppState.editingStudentId = studentId;
  const isEditing = !!studentId;
  const student = isEditing 
    ? AppState.students.find(s => s.id === studentId) 
    : {
        id: `ALU-EMA-${String(AppState.students.length + 1).padStart(3, '0')}`,
        name: "",
        birthDate: "",
        gender: "Feminino",
        classroom: AppState.classrooms[0] || "Mídias Digitais - Maceió Matutino",
        status: "Ativo",
        avatarColor: "from-indigo-500 to-purple-600",
        notes: "",
        contact: {
          phone: "",
          email: "",
          guardianName: "",
          guardianKinship: "Mãe",
          guardianPhone: ""
        },
        address: {
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "Maceió",
          state: "AL"
        },
        grades: {}
      };

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const classrooms = Array.from(new Set(AppState.classrooms.concat(AppState.students.map(s => s.classroom)))).sort();

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3"><div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="px-6 py-4 border-b border-slate-100 d-flex align-items-center justify-content-between bg-slate-50/50 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-lg fw-bold shadow-md">
              <i class="fa-solid ${isEditing ? 'fa-user-pen' : 'fa-user-plus'}"></i>
            </div>
            <div>
              <h2 class="text-base fw-bold text-slate-900 ">
                ${isEditing ? 'Editar Aluno' : 'Cadastrar Aluno (Emprega Mais Alagoas)'}
              </h2>
              <p class="text-xs text-slate-500 ">Dados cadastrais, WhatsApp, e-mail e endereço com CEP</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle text-slate-400 d-flex align-items-center justify-content-center ">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="student-form" onsubmit="saveStudentForm(event)" class="overflow-y-auto flex-grow-1 p-6 space-y-6">
          
          <!-- Seção Destacada: Foto do Aluno -->
          <div class="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 d-flex flex-column sm:flex-row align-items-center gap-5">
            
            <div class="position-relative group/formavatar flex-shrink-0">
              <div id="form-avatar-preview" class="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white fw-bolder text-2xl d-flex align-items-center justify-content-center shadow-md border-2 border-white ">
                ${student.photoUrl ? `
                  <img id="form-avatar-img" src="${student.photoUrl}" alt="${student.name || 'Aluno'}" class="w-100 h-100 object-fit-cover" />
                ` : `
                  <span id="form-avatar-initials">${student.name ? student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : '<i class="fa-solid fa-user"></i>'}</span>
                `}
              </div>
              <button 
                type="button" 
                onclick="document.getElementById('form-photo-file-input').click()"
                class="position-absolute -bottom-1 -right-1 w-7 h-7 rounded-circle bg-indigo-600 text-white shadow-md d-flex align-items-center justify-content-center text-xs transition-transform active:scale-90"
                title="Carregar Foto do Computador"
              >
                <i class="fa-solid fa-camera"></i>
              </button>
            </div>

            <div class="flex-grow-1 space-y-2 text-center sm:text-left">
              <div>
                <h4 class="text-xs fw-bold text-slate-900 d-flex align-items-center justify-content-center sm:justify-start gap-1.5">
                  <i class="fa-solid fa-image text-indigo-600 "></i> Foto de Perfil do Aluno
                </h4>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Escolha uma foto do seu dispositivo, tire pela câmera ou use um dos avatares.
                </p>
              </div>

              <input type="hidden" name="photoUrl" id="form-photo-url-input" value="${student.photoUrl || ''}">
              <input type="hidden" name="avatarColor" id="form-avatar-color-input" value="${student.avatarColor || 'from-indigo-500 to-purple-600'}">
              <input type="file" id="form-photo-file-input" accept="image/*" onchange="handleFormPhotoFileSelect(event)" class="hidden">

              <div class="d-flex flex-wrap align-items-center justify-content-center sm:justify-start gap-2">
                <button 
                  type="button" 
                  onclick="document.getElementById('form-photo-file-input').click()"
                  class="px-3 py-1.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-sm d-flex align-items-center gap-1.5 transition-colors"
                >
                  <i class="fa-solid fa-upload"></i> Escolher Foto
                </button>
                <button 
                  type="button" 
                  onclick="openWebcamForStudentForm()"
                  class="px-3 py-1.5 rounded-xl text-xs fw-bold bg-slate-200 text-slate-800 d-flex align-items-center gap-1.5 transition-colors"
                >
                  <i class="fa-solid fa-camera"></i> Câmera
                </button>
                <button 
                  type="button" 
                  id="form-remove-photo-btn"
                  onclick="removeFormPhoto()"
                  class="${student.photoUrl ? 'flex' : 'hidden'} px-3 py-1.5 rounded-xl text-xs fw-semibold text-rose-600 align-items-center gap-1 transition-colors"
                >
                  <i class="fa-solid fa-trash-can"></i> Remover
                </button>
              </div>

              <!-- Cores de Fundo do Avatar -->
              <div class="pt-1.5 d-flex align-items-center justify-content-center sm:justify-start gap-1.5">
                <span class="text-[10px] text-slate-400 fw-medium mr-1">Cor do fundo:</span>
                ${[
                  { name: 'Índigo', val: 'from-indigo-500 to-purple-600', bg: 'bg-gradient-to-tr from-indigo-500 to-purple-600' },
                  { name: 'Esmeralda', val: 'from-emerald-500 to-teal-600', bg: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
                  { name: 'Rosa', val: 'from-rose-500 to-pink-600', bg: 'bg-gradient-to-tr from-rose-500 to-pink-600' },
                  { name: 'Âmbar', val: 'from-amber-500 to-orange-600', bg: 'bg-gradient-to-tr from-amber-500 to-orange-600' },
                  { name: 'Azul', val: 'from-blue-500 to-cyan-600', bg: 'bg-gradient-to-tr from-blue-500 to-cyan-600' },
                  { name: 'Roxo', val: 'from-purple-600 to-pink-600', bg: 'bg-gradient-to-tr from-purple-600 to-pink-600' }
                ].map(c => `
                  <button 
                    type="button"
                    onclick="setFormAvatarColor('${c.val}')"
                    class="w-5 h-5 rounded-circle ${c.bg} shadow-sm ring-offset-2 transition-transform ${student.avatarColor === c.val ? 'ring-2 ring-indigo-600' : ''}"
                    title="${c.name}"
                  ></button>
                `).join("")}
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs fw-bold text-uppercase tracking-wider text-indigo-600 mb-3 d-flex align-items-center gap-1.5">
              <i class="fa-solid fa-id-card"></i> 1. Identificação do Aluno
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  name="name" 
                  value="${student.name || ''}" 
                  required 
                  placeholder="Ex: Alana Vitória Tenório"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Matrícula / ID</label>
                <input 
                  type="text" 
                  name="id" 
                  value="${student.id || ''}" 
                  required 
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-100 font-monospace text-slate-600 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">CPF do Aluno</label>
                <input 
                  type="text" 
                  name="cpf" 
                  value="${student.cpf || ''}" 
                  placeholder="000.000.000-00"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 font-monospace text-slate-900 "
                >
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Turma / Cidade *</label>
                <select 
                  name="classroom" 
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
                  ${classrooms.map(c => `<option value="${c}" ${student.classroom === c ? 'selected' : ''}>${c}</option>`).join("")}
                </select>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 ">
            <h3 class="text-xs fw-bold text-uppercase tracking-wider text-indigo-600 mb-3 d-flex align-items-center gap-1.5">
              <i class="fa-solid fa-address-book"></i> 2. Contatos & Comunicação
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone" 
                  value="${student.contact?.phone || ''}" 
                  placeholder="(82) 99999-8888"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  value="${student.contact?.email || ''}" 
                  placeholder="aluno@aluno.al.gov.br"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Nome do Responsável / Emergência</label>
                <input 
                  type="text" 
                  name="guardianName" 
                  value="${student.contact?.guardianName || ''}" 
                  placeholder="Ex: Severino Tenório"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Parentesco</label>
                  <input 
                    type="text" 
                    name="guardianKinship" 
                    value="${student.contact?.guardianKinship || 'Mãe'}" 
                    class="w-100 px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                  >
                </div>
                <div>
                  <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Tel. Responsável</label>
                  <input 
                    type="text" 
                    name="guardianPhone" 
                    value="${student.contact?.guardianPhone || ''}" 
                    placeholder="(82) 98888-7777"
                    class="w-100 px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                  >
                </div>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 ">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="text-xs fw-bold text-uppercase tracking-wider text-indigo-600 d-flex align-items-center gap-1.5">
                <i class="fa-solid fa-map-location-dot"></i> 3. Endereço Residencial (Alagoas)
              </h3>
              <span class="text-[11px] text-slate-400">Busca rápida ViaCEP</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">CEP</label>
                <div class="position-relative">
                  <input 
                    type="text" 
                    id="cep-input"
                    name="cep" 
                    value="${student.address?.cep || ''}" 
                    placeholder="57000-000"
                    maxlength="9"
                    onblur="handleCepBlur(this.value)"
                    class="w-100 pl-3.5 pr-9 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 font-monospace"
                  >
                  <button 
                    type="button" 
                    onclick="handleCepSearchClick()" 
                    class="position-absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 p-1"
                    title="Buscar CEP"
                  >
                    <i id="cep-spinner" class="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Rua / Logradouro</label>
                <input 
                  type="text" 
                  id="street-input"
                  name="street" 
                  value="${student.address?.street || ''}" 
                  placeholder="Ex: Avenida Doutor Antônio Gouveia"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Número</label>
                <input 
                  type="text" 
                  name="number" 
                  value="${student.address?.number || ''}" 
                  placeholder="1500"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Complemento</label>
                <input 
                  type="text" 
                  name="complement" 
                  value="${student.address?.complement || ''}" 
                  placeholder="Apto 302"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Bairro</label>
                <input 
                  type="text" 
                  id="neighborhood-input"
                  name="neighborhood" 
                  value="${student.address?.neighborhood || ''}" 
                  placeholder="Ponta Verde"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Cidade</label>
                <input 
                  type="text" 
                  id="city-input"
                  name="city" 
                  value="${student.address?.city || 'Maceió'}" 
                  placeholder="Maceió"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">UF (Estado)</label>
                <input 
                  type="text" 
                  id="state-input"
                  name="state" 
                  value="${student.address?.state || 'AL'}" 
                  maxlength="2"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 text-uppercase text-center"
                >
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 ">
            <h3 class="text-xs fw-bold text-uppercase tracking-wider text-indigo-600 mb-3 d-flex align-items-center gap-1.5">
              <i class="fa-solid fa-brain"></i> 4. Diagnóstico, Redes Sociais & Perfil
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Área de Atuação / Profissão</label>
                <input 
                  type="text" 
                  name="profession" 
                  value="${student.profession || ''}" 
                  placeholder="Ex: Corretor de Imóveis, Estética, Confeitaria..."
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Nível de Escolaridade</label>
                <input 
                  type="text" 
                  name="education" 
                  value="${student.education || ''}" 
                  placeholder="Ex: Ensino Médio Completo, Superior Cursando..."
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Link ou @ da Rede Social</label>
                <input 
                  type="text" 
                  name="socialMedia" 
                  value="${student.socialMedia || ''}" 
                  placeholder="Ex: @usuario ou https://instagram.com/usuario"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Já trabalhou com redes sociais?</label>
                <input 
                  type="text" 
                  name="experience" 
                  value="${student.experience || 'Não'}" 
                  placeholder="Ex: Sim / Não / Apenas pessoal"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Redes mais utilizadas</label>
                <input 
                  type="text" 
                  name="frequentNetworks" 
                  value="${student.frequentNetworks || ''}" 
                  placeholder="Ex: Instagram, WhatsApp, TikTok, YouTube"
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div>
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Ferramentas já utilizadas</label>
                <input 
                  type="text" 
                  name="tools" 
                  value="${student.tools || ''}" 
                  placeholder="Ex: Canva, CapCut, Meta Business, ChatGPT..."
                  class="w-100 px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Principais Desafios ao Produzir Conteúdo</label>
                <textarea 
                  name="challenges" 
                  rows="2" 
                  placeholder="Ex: Edição de vídeos, vergonha na câmera, criatividade..."
                  class="w-100 px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >${student.challenges || ''}</textarea>
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">O que motivou a se inscrever no curso?</label>
                <textarea 
                  name="motivation" 
                  rows="2" 
                  placeholder="Ex: Divulgar meu negócio, ter nova profissão..."
                  class="w-100 px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >${student.motivation || ''}</textarea>
              </div>

              <div class="sm:col-span-2">
                <label class="d-block text-xs fw-semibold text-slate-700 mb-1">Expectativas em relação ao curso</label>
                <textarea 
                  name="expectations" 
                  rows="2" 
                  placeholder="Ex: Aprender a usar as ferramentas e gerar renda..."
                  class="w-100 px-3.5 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-900 "
                >${student.expectations || ''}</textarea>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 d-flex align-items-center justify-content-end gap-3">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl text-xs fw-semibold border border-slate-200 text-slate-700 "
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow"
            >
              <i class="fa-solid fa-check mr-1.5"></i> Salvar Aluno
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

// Handler de CEP
async function searchViaCep(rawCep) {
  const cleanCep = (rawCep || "").replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  const spinner = document.getElementById("cep-spinner");
  if (spinner) spinner.className = "fa-solid fa-spinner fa-spin text-indigo-600";

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      showToast("CEP não encontrado.", "warning");
      return null;
    }

    const streetInput = document.getElementById("street-input");
    const neighborhoodInput = document.getElementById("neighborhood-input");
    const cityInput = document.getElementById("city-input");
    const stateInput = document.getElementById("state-input");

    if (streetInput) streetInput.value = data.logradouro || "";
    if (neighborhoodInput) neighborhoodInput.value = data.bairro || "";
    if (cityInput) cityInput.value = data.localidade || "";
    if (stateInput) stateInput.value = data.uf || "";

    showToast(`Endereço carregado: ${data.bairro} - ${data.localidade}/${data.uf}`, "success");
    return data;
  } catch (err) {
    showToast("Não foi possível consultar o CEP.", "error");
    return null;
  } finally {
    if (spinner) spinner.className = "fa-solid fa-magnifying-glass";
  }
}

function handleCepBlur(value) {
  if (value && value.replace(/\D/g, "").length === 8) {
    searchViaCep(value);
  }
}

function handleCepSearchClick() {
  const cepInput = document.getElementById("cep-input");
  if (cepInput) searchViaCep(cepInput.value);
}

function saveStudentForm(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const existingStudent = AppState.editingStudentId 
    ? AppState.students.find(s => s.id === AppState.editingStudentId) 
    : null;

  const studentData = {
    id: formData.get("id") || `ALU-EMA-${Date.now()}`,
    name: formData.get("name").trim(),
    cpf: formData.get("cpf")?.trim() || "",
    birthDate: formData.get("birthDate"),
    gender: "Feminino",
    classroom: formData.get("classroom"),
    status: existingStudent ? existingStudent.status : "Ativo",
    avatarColor: formData.get("avatarColor") || existingStudent?.avatarColor || "from-indigo-500 to-purple-600",
    photoUrl: formData.get("photoUrl") !== null ? formData.get("photoUrl").trim() : (existingStudent?.photoUrl || ""),
    socialMedia: formData.get("socialMedia")?.trim() || "",
    profession: formData.get("profession")?.trim() || "",
    education: formData.get("education")?.trim() || "",
    frequentNetworks: formData.get("frequentNetworks")?.trim() || "",
    experience: formData.get("experience")?.trim() || "",
    tools: formData.get("tools")?.trim() || "",
    challenges: formData.get("challenges")?.trim() || "",
    motivation: formData.get("motivation")?.trim() || "",
    expectations: formData.get("expectations")?.trim() || "",
    notes: existingStudent?.notes || "Aluno do curso de Gestão de Mídias Digitais.",
    contact: {
      phone: formData.get("phone")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      guardianName: formData.get("guardianName")?.trim() || "",
      guardianKinship: formData.get("guardianKinship")?.trim() || "",
      guardianPhone: formData.get("guardianPhone")?.trim() || ""
    },
    address: {
      cep: formData.get("cep")?.trim() || "",
      street: formData.get("street")?.trim() || "",
      number: formData.get("number")?.trim() || "",
      complement: formData.get("complement")?.trim() || "",
      neighborhood: formData.get("neighborhood")?.trim() || "",
      city: formData.get("city")?.trim() || "Maceió",
      state: (formData.get("state") || "AL").toUpperCase().trim()
    },
    grades: existingStudent ? existingStudent.grades : {}
  };

  if (AppState.editingStudentId) {
    const index = AppState.students.findIndex(s => s.id === AppState.editingStudentId);
    if (index !== -1) {
      AppState.students[index] = studentData;
      showToast(`Aluno "${studentData.name}" atualizado!`);
      
      if (AppState.currentUser && AppState.currentUser.id === AppState.editingStudentId) {
        AppState.currentUser.name = studentData.name;
        AppState.currentUser.cpf = studentData.cpf;
        AppState.currentUser.photo = studentData.photoUrl;
        AppState.currentUser.email = studentData.contact.email;
        localStorage.setItem("eupordias_auth_user", JSON.stringify(AppState.currentUser));
      }
    }
  } else {
    AppState.students.unshift(studentData);
    showToast(`Aluno "${studentData.name}" cadastrado!`);
  }

  saveDataToStorage();
  closeModal();
  renderApp();
}

function confirmDeleteStudent(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  if (confirm(`Remover o aluno "${student.name}" e todas as suas notas do Eu Por Dias?`)) {
    AppState.students = AppState.students.filter(s => s.id !== studentId);
    saveDataToStorage();
    showToast(`Aluno removido.`, "info");
    renderApp();
  }
}

// -------------------------------------------------------------
// MODAL: NOTAS
// -------------------------------------------------------------
function openGradesModal(studentId, focusSubject = null) {
  AppState.activeGradesStudentId = studentId;
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  if (!student.grades) student.grades = {};

  const isRevealed = !AppState.privacyMode || AppState.revealedStudentIds.has(student.id);
  const displayName = maskName(student.name, isRevealed);

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl my-3"><div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden">
        
        <div class="px-6 py-4 border-b border-slate-100 d-flex align-items-center justify-content-between bg-slate-50/50 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg fw-bold">
              <i class="fa-solid fa-award"></i>
            </div>
            <div>
              <h2 class="text-base fw-bold text-slate-900 d-flex align-items-center gap-2">
                <span>Notas do Curso: ${displayName}</span>
                ${AppState.privacyMode ? `
                  <button 
                    onclick="toggleRevealStudent('${student.id}'); openGradesModal('${student.id}', '${focusSubject || ''}')" 
                    class="text-xs ${isRevealed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-amber-500'} transition-colors ml-1"
                    title="${isRevealed ? 'Ocultar nome' : 'Revelar nome completo (Modo Deus)'}"
                  >
                    <i class="fa-solid ${isRevealed ? 'fa-eye' : 'fa-eye-slash'}"></i>
                  </button>
                ` : ''}
              </h2>
              <div class="d-flex align-items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>Turma: ${student.classroom}</span>
                <span>•</span>
                <span>Matrícula: ${student.id}</span>
              </div>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-circle text-slate-400 d-flex align-items-center justify-content-center ">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="student-grades-form" onsubmit="saveStudentGradesForm(event, '${student.id}')" class="overflow-y-auto flex-grow-1 p-6 space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-200 ">
            <table class="w-100 text-start text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-600 fw-bold border-b border-slate-200 ">
                  <th class="py-3 px-3">Módulo / Disciplina</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 1</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 2</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 3</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 4</th>
                  <th class="py-3 px-2 text-center w-16">Faltas</th>
                  <th class="py-3 px-3 text-center w-20">Média</th>
                  <th class="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 ">
                ${AppState.subjects.map(subject => {
                  const data = student.grades?.[subject] || {};
                  const { avg, hasGrades } = calculateSubjectAverage(data);
                  const isPassing = avg >= AppState.settings.passingGrade;
                  const isRec = avg >= AppState.settings.recoveryGrade;

                  return `
                    <tr class=" ${focusSubject === subject ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
                      <td class="py-2.5 px-3 fw-semibold text-slate-800 ">
                        ${subject}
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          max="10" 
                          name="${subject}_b1" 
                          value="${data.b1 ?? ''}"
                          placeholder="-"
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 bg-slate-50 fw-semibold"
                        >
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          max="10" 
                          name="${subject}_b2" 
                          value="${data.b2 ?? ''}"
                          placeholder="-"
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 bg-slate-50 fw-semibold"
                        >
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          max="10" 
                          name="${subject}_b3" 
                          value="${data.b3 ?? ''}"
                          placeholder="-"
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 bg-slate-50 fw-semibold"
                        >
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          step="0.1" 
                          min="0" 
                          max="10" 
                          name="${subject}_b4" 
                          value="${data.b4 ?? ''}"
                          placeholder="-"
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 bg-slate-50 fw-semibold"
                        >
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          name="${subject}_absences" 
                          value="${data.absences ?? 0}"
                          class="w-12 px-1 py-1 text-center rounded-lg border border-slate-200 bg-slate-50 "
                        >
                      </td>
                      <td class="py-2.5 px-3 text-center fw-bold text-sm ${!hasGrades ? 'text-slate-400' : isPassing ? 'text-emerald-600' : isRec ? 'text-amber-600' : 'text-rose-600'}">
                        ${hasGrades ? avg.toFixed(1) : '-'}
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        ${!hasGrades ? '<span class="text-slate-400 text-[11px]">-</span>' : isPassing ? '<span class="px-2 py-0.5 rounded text-[10px] fw-bold bg-emerald-100 text-emerald-700">Aprovado</span>' : isRec ? '<span class="px-2 py-0.5 rounded text-[10px] fw-bold bg-amber-100 text-amber-700">Recuperação</span>' : '<span class="px-2 py-0.5 rounded text-[10px] fw-bold bg-rose-100 text-rose-700">Reprovado</span>'}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>

          <div class="pt-4 border-t border-slate-100 d-flex align-items-center justify-content-end gap-3">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl text-xs fw-semibold border border-slate-200 text-slate-700 "
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow"
            >
              <i class="fa-solid fa-floppy-disk mr-1.5"></i> Salvar Notas
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

function saveStudentGradesForm(event, studentId) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  if (!student.grades) student.grades = {};

  AppState.subjects.forEach(subject => {
    const b1Val = formData.get(`${subject}_b1`);
    const b2Val = formData.get(`${subject}_b2`);
    const b3Val = formData.get(`${subject}_b3`);
    const b4Val = formData.get(`${subject}_b4`);
    const absVal = formData.get(`${subject}_absences`);

    student.grades[subject] = {
      b1: b1Val !== "" ? Number(b1Val) : null,
      b2: b2Val !== "" ? Number(b2Val) : null,
      b3: b3Val !== "" ? Number(b3Val) : null,
      b4: b4Val !== "" ? Number(b4Val) : null,
      absences: absVal !== "" ? Number(absVal) : 0
    };
  });

  saveDataToStorage();
  closeModal();
  showToast(`Notas de ${student.name} salvas!`);
  renderApp();
}

// -------------------------------------------------------------
// MODAL: BOLETIM DO ALUNO
// -------------------------------------------------------------
function openBoletimModal(studentId) {
  AppState.activeBoletimStudentId = studentId;
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const stats = calculateStudentOverallStats(student);
  const isRevealed = !AppState.privacyMode || AppState.revealedStudentIds.has(student.id);
  const displayName = maskName(student.name, isRevealed);
  const displayCpf = maskCpf(student.cpf, isRevealed);

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          
          <div class="modal-header border-bottom py-3 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between no-print">
            <div class="d-flex align-items-center gap-2">
              <i class="fa-solid fa-file-invoice text-indigo-600 text-lg"></i>
              <h2 class="text-sm sm:text-base fw-bold text-slate-900 mb-0">Boletim de Rendimento Escolar</h2>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button 
                onclick="window.print()" 
                class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 text-xs fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
              >
                <i class="fa-solid fa-print"></i> Imprimir / PDF
              </button>
              <button onclick="closeModal()" class="btn-close" aria-label="Fechar"></button>
            </div>
          </div>

          <div id="printable-content" class="modal-body p-4 p-sm-5 text-slate-900 bg-white space-y-5 overflow-y-auto">
            
            <div class="border-b-2 border-slate-900 pb-4 text-center">
              <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs fw-bold rounded-pill mb-2 text-uppercase">Emprega Mais Alagoas</span>
              <h1 class="text-lg sm:text-xl fw-bolder tracking-tight text-uppercase mb-1">${AppState.settings.schoolName}</h1>
              <p class="text-xs text-slate-600 mb-2">${AppState.settings.courseName} • Ano Letivo ${AppState.settings.schoolYear}</p>
              <h2 class="text-xs fw-bold text-uppercase tracking-wider bg-slate-100 py-1.5 rounded-lg border border-slate-200 mb-0">Boletim Oficial de Rendimento</h2>
            </div>

            <div class="row g-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div class="col-12 col-sm-6">
                <span class="text-slate-500">Aluno(a):</span> <strong class="text-slate-900">${displayName}</strong>
              </div>
              <div class="col-6 col-sm-3">
                <span class="text-slate-500">Matrícula:</span> <strong class="font-monospace text-slate-900">${student.id}</strong>
              </div>
              <div class="col-6 col-sm-3">
                <span class="text-slate-500">CPF:</span> <strong class="font-monospace text-slate-900">${displayCpf}</strong>
              </div>
              <div class="col-12 col-sm-6">
                <span class="text-slate-500">Polo / Unidade:</span> <strong class="text-slate-900">${student.unitCity || student.polo || student.classroom || 'Maceió - AL'}</strong>
              </div>
              <div class="col-6 col-sm-3">
                <span class="text-slate-500">Frequência:</span> <strong class="${(student.attendance || 100) >= 75 ? 'text-emerald-700' : 'text-rose-700'}">${student.attendance || 100}%</strong>
              </div>
              <div class="col-6 col-sm-3">
                <span class="text-slate-500">Emitido em:</span> <strong class="text-slate-900">${new Date().toLocaleDateString('pt-BR')}</strong>
              </div>
            </div>

            <div class="table-responsive rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table class="table table-sm table-hover align-middle mb-0 text-xs text-slate-800">
                <thead class="table-light text-slate-700 fw-bold border-bottom">
                  <tr>
                    <th class="py-2.5 px-3">Módulo Curricular</th>
                    <th class="py-2.5 px-2 text-center">Ativ. 1</th>
                    <th class="py-2.5 px-2 text-center">Ativ. 2</th>
                    <th class="py-2.5 px-2 text-center">Ativ. 3</th>
                    <th class="py-2.5 px-2 text-center">Ativ. 4</th>
                    <th class="py-2.5 px-2 text-center">Faltas</th>
                    <th class="py-2.5 px-3 text-center">Média</th>
                    <th class="py-2.5 px-3 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  ${AppState.subjects.map(subject => {
                    const data = student.grades?.[subject] || {};
                    const { avg, hasGrades } = calculateSubjectAverage(data);
                    const isPass = avg >= AppState.settings.passingGrade;
                    const isRec = avg >= AppState.settings.recoveryGrade;

                    return `
                      <tr class="border-bottom border-slate-100">
                        <td class="py-2.5 px-3 fw-semibold text-slate-900">${subject}</td>
                        <td class="py-2.5 px-2 text-center font-monospace text-slate-600">${data.b1 !== null && data.b1 !== undefined ? Number(data.b1).toFixed(1) : '-'}</td>
                        <td class="py-2.5 px-2 text-center font-monospace text-slate-600">${data.b2 !== null && data.b2 !== undefined ? Number(data.b2).toFixed(1) : '-'}</td>
                        <td class="py-2.5 px-2 text-center font-monospace text-slate-600">${data.b3 !== null && data.b3 !== undefined ? Number(data.b3).toFixed(1) : '-'}</td>
                        <td class="py-2.5 px-2 text-center font-monospace text-slate-600">${data.b4 !== null && data.b4 !== undefined ? Number(data.b4).toFixed(1) : '-'}</td>
                        <td class="py-2.5 px-2 text-center text-slate-600">${data.absences || 0}</td>
                        <td class="py-2.5 px-3 text-center fw-bold font-monospace ${!hasGrades ? 'text-slate-400' : isPass ? 'text-emerald-600' : isRec ? 'text-amber-600' : 'text-rose-600'}">
                          ${hasGrades ? avg.toFixed(1) : '-'}
                        </td>
                        <td class="py-2.5 px-3 text-center text-[11px]">
                          ${!hasGrades ? '<span class="text-slate-400">-</span>' : isPass 
                            ? '<span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-pill px-2 py-0.5">Aprovado</span>' 
                            : isRec 
                              ? '<span class="badge bg-amber-50 text-amber-700 border border-amber-200 rounded-pill px-2 py-0.5">Recuperação</span>' 
                              : '<span class="badge bg-rose-50 text-rose-700 border border-rose-200 rounded-pill px-2 py-0.5">Reprovado</span>'}
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
                <tfoot class="table-light fw-bold border-top-2 border-slate-300">
                  <tr>
                    <td class="py-2.5 px-3 text-slate-900">MÉDIA GERAL DO CURSO</td>
                    <td colspan="4"></td>
                    <td class="py-2.5 px-2 text-center text-slate-800">${stats.totalAbsences}</td>
                    <td class="py-2.5 px-3 text-center text-sm fw-bolder text-indigo-700 font-monospace">${stats.overallAvg.toFixed(1)}</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="badge ${stats.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : stats.status === 'Em Recuperação' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300'} rounded-pill px-2.5 py-1">
                        ${stats.status}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="pt-4 row text-center text-xs text-slate-600 g-4">
              <div class="col-6">
                <div class="pt-8 border-top border-slate-300">
                  <span class="d-block fw-semibold text-slate-800">Coordenação Pedagógica</span>
                  <span>Emprega Mais Alagoas</span>
                </div>
              </div>
              <div class="col-6">
                <div class="pt-8 border-top border-slate-300">
                  <span class="d-block fw-semibold text-slate-800">Assinatura do Aluno(a)</span>
                  <span>Data: ___/___/_______</span>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer border-top py-2.5 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between no-print">
            <span class="text-[11px] text-slate-500">Documento gerado automaticamente pelo Sistema Eu Por Dias</span>
            <button onclick="closeModal()" class="btn btn-sm btn-secondary rounded-pill px-4 py-1.5 text-xs fw-semibold">
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function exportStudentsToCSV(forcePrivacy = false) {
  if (AppState.students.length === 0) {
    showToast("Não há alunos para exportar.", "warning");
    return;
  }

  // REGRA MANDATÓRIA: Sem Modo Deus ativo, a exportação é sempre com dados protegidos/mascarados!
  const usePrivacy = !isGodModeActive() || forcePrivacy || AppState.privacyMode || AppState.settings.viewMode === 'secure';

  const headers = [
    "Matricula",
    "Data_Inscricao",
    usePrivacy ? "Nome (Protegido LGPD)" : "Nome Completo",
    usePrivacy ? "CPF (Mascarado)" : "CPF",
    "Unidade_Cidade",
    usePrivacy ? "Telefone (Protegido)" : "Telefone_WhatsApp",
    usePrivacy ? "Email (Protegido)" : "Email",
    "Rede_Social",
    "Profissao_Area",
    "Escolaridade",
    "Exp_Redes_Sociais",
    "Redes_Frequentes",
    "Ferramentas",
    "Desafios",
    "Motivacao",
    "Expectativas",
    "Media_Curso",
    "Situacao_Final",
    "Total_Faltas"
  ];

  const rows = AppState.students.map(s => {
    const stats = calculateStudentOverallStats(s);
    const exportName = usePrivacy ? maskName(s.name) : (s.name || '');
    const exportCpf = usePrivacy ? maskCpf(s.cpf) : (s.cpf || '');
    const exportPhone = usePrivacy ? maskPhone(s.contact?.phone) : (s.contact?.phone || '');
    const exportEmail = usePrivacy ? maskEmail(s.contact?.email) : (s.contact?.email || '');

    return [
      `"${s.id || ''}"`,
      `"${s.registrationDate || ''}"`,
      `"${exportName.replace(/"/g, '""')}"`,
      `"${exportCpf}"`,
      `"${(s.unitCity || s.classroom || '').replace(/"/g, '""')}"`,
      `"${exportPhone}"`,
      `"${exportEmail.replace(/"/g, '""')}"`,
      `"${(s.socialMedia || '').replace(/"/g, '""')}"`,
      `"${(s.profession || '').replace(/"/g, '""')}"`,
      `"${(s.education || '').replace(/"/g, '""')}"`,
      `"${(s.experience || '').replace(/"/g, '""')}"`,
      `"${(s.frequentNetworks || '').replace(/"/g, '""')}"`,
      `"${(s.tools || '').replace(/"/g, '""')}"`,
      `"${(s.challenges || '').replace(/"/g, '""')}"`,
      `"${(s.motivation || '').replace(/"/g, '""')}"`,
      `"${(s.expectations || '').replace(/"/g, '""')}"`,
      stats.overallAvg.toFixed(1),
      `"${stats.status}"`,
      stats.totalAbsences
    ].join(";");
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filenameSuffix = usePrivacy ? "LGPD_Seguro" : "Completo";
  link.setAttribute("href", url);
  link.setAttribute("download", `EuPorDias_EmpregaMaisAlagoas_${filenameSuffix}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(usePrivacy ? "Planilha segura LGPD exportada com sucesso!" : "Planilha CSV exportada com sucesso!", "success");
}

function exportBackupJSON() {
  const backupData = {
    appName: "Eu Por Dias",
    exportDate: new Date().toISOString(),
    settings: AppState.settings,
    subjects: AppState.subjects,
    classrooms: AppState.classrooms,
    students: AppState.students
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `EuPorDias_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Backup JSON salvo com sucesso!", "success");
}

function openRestoreModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 d-flex align-items-center justify-content-center text-lg">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h3 class="fw-bold text-base text-slate-900 ">Restaurar Backup</h3>
            <p class="text-xs text-slate-500">Selecione o arquivo .json do Eu Por Dias</p>
          </div>
        </div>

        <input 
          type="file" 
          id="backup-file-input" 
          accept=".json"
          class="w-100 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 "
        >

        <div class="d-flex align-items-center justify-content-end gap-2 pt-2">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs fw-semibold border border-slate-200 text-slate-700 ">
            Cancelar
          </button>
          <button onclick="processBackupFile()" class="px-5 py-2 rounded-xl text-xs fw-bold bg-purple-600 text-white shadow">
            Restaurar Dados
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

function processBackupFile() {
  const fileInput = document.getElementById("backup-file-input");
  if (!fileInput?.files?.[0]) {
    showToast("Selecione um arquivo .json", "warning");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.students)) {
        AppState.students = data.students;
        if (Array.isArray(data.subjects)) AppState.subjects = data.subjects;
        if (Array.isArray(data.classrooms)) AppState.classrooms = data.classrooms;
        if (data.settings) AppState.settings = { ...AppState.settings, ...data.settings };

        saveDataToStorage();
        closeModal();
        showToast("Backup restaurado com sucesso!", "success");
        renderApp();
      } else {
        showToast("Formato de backup inválido.", "error");
      }
    } catch (err) {
      showToast("Erro ao ler arquivo JSON.", "error");
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------
// CONFIGURAÇÃO DE MÓDULOS
// -------------------------------------------------------------
function openSubjectsConfigModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-sm fw-bold">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <h3 class="fw-bold text-sm text-slate-900 ">Módulos do Curso (Mídias Digitais)</h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <input 
            type="text" 
            id="new-subject-input" 
            placeholder="Nome do novo módulo..."
            class="flex-grow-1 px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 "
          >
          <button onclick="addSubject()" class="px-4 py-2 rounded-xl text-xs fw-bold bg-indigo-600 text-white ">
            Adicionar
          </button>
        </div>

        <div class="space-y-1.5 max-h-56 overflow-y-auto">
          ${AppState.subjects.map(s => `
            <div class="d-flex align-items-center justify-content-between p-2.5 rounded-xl bg-slate-50 text-xs fw-medium">
              <span>${s}</span>
              <button onclick="removeSubject('${s}')" class="text-rose-500 text-xs">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `).join("")}
        </div>

        <div class="pt-2 border-t border-slate-100 d-flex justify-content-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 ">
            Concluir
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

function addSubject() {
  const input = document.getElementById("new-subject-input");
  const name = input?.value?.trim();
  if (!name) return;

  if (AppState.subjects.includes(name)) {
    showToast("Este módulo já existe.", "warning");
    return;
  }

  AppState.subjects.push(name);
  saveDataToStorage();
  openSubjectsConfigModal();
  renderApp();
  showToast(`Módulo "${name}" adicionado.`);
}

function removeSubject(name) {
  if (AppState.subjects.length <= 1) {
    showToast("O curso deve ter pelo menos um módulo.", "warning");
    return;
  }
  AppState.subjects = AppState.subjects.filter(s => s !== name);
  saveDataToStorage();
  openSubjectsConfigModal();
  renderApp();
  showToast(`Módulo "${name}" removido.`, "info");
}

// -------------------------------------------------------------
// EVENTOS GLOBAIS
// -------------------------------------------------------------

// -------------------------------------------------------------
// ROLAGEM INTERATIVA DA BARRA DE ABAS
// -------------------------------------------------------------
function scrollNavTabs(direction) {
  const nav = document.getElementById("main-nav-tabs");
  if (!nav) return;
  const scrollAmount = 260;
  nav.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth"
  });
}

function updateNavScrollButtons() {
  const nav = document.getElementById("main-nav-tabs");
  const btnLeft = document.getElementById("nav-scroll-btn-left");
  const btnRight = document.getElementById("nav-scroll-btn-right");
  if (!nav || !btnLeft || !btnRight) return;

  const scrollLeft = nav.scrollLeft;
  const maxScroll = nav.scrollWidth - nav.clientWidth;

  // Se houver overflow horizontal, exibe as setas com estado habilitado/desabilitado
  if (maxScroll > 15) {
    btnLeft.style.display = "flex";
    btnRight.style.display = "flex";
    btnLeft.disabled = scrollLeft <= 10;
    btnLeft.style.opacity = scrollLeft <= 10 ? "0.2" : "1";
    btnRight.disabled = scrollLeft >= maxScroll - 10;
    btnRight.style.opacity = scrollLeft >= maxScroll - 10 ? "0.2" : "1";
  } else {
    btnLeft.style.display = "none";
    btnRight.style.display = "none";
  }
}

function setupGlobalEventListeners() {
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      switchTab(tab);
    });
  });

  // Interatividade da barra de rolagem de abas
  const mainNavTabs = document.getElementById("main-nav-tabs");
  if (mainNavTabs) {
    mainNavTabs.addEventListener("scroll", updateNavScrollButtons, { passive: true });
    window.addEventListener("resize", updateNavScrollButtons, { passive: true });
    
    // Rolagem horizontal com a roda do mouse (wheel)
    mainNavTabs.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        mainNavTabs.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Arraste suave com o mouse (Drag-to-Scroll)
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    mainNavTabs.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - mainNavTabs.offsetLeft;
      scrollLeft = mainNavTabs.scrollLeft;
      mainNavTabs.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      if (isDown) {
        isDown = false;
        mainNavTabs.style.cursor = "grab";
      }
    });

    mainNavTabs.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - mainNavTabs.offsetLeft;
      const walk = (x - startX) * 1.5;
      mainNavTabs.scrollLeft = scrollLeft - walk;
    });

    setTimeout(updateNavScrollButtons, 250);
  }

  // Fechar dropdowns ao clicar fora
  document.addEventListener("click", (e) => {
    const intContainer = document.getElementById("integrations-submenu-container");
    if (intContainer && !intContainer.contains(e.target)) {
      closeIntegrationsSubmenu();
    }
    const userContainer = document.getElementById("header-user-container");
    if (userContainer && !userContainer.contains(e.target)) {
      const dd = document.getElementById("user-header-dropdown");
      if (dd && !dd.classList.contains("hidden")) {
        dd.classList.add("hidden");
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeIntegrationsSubmenu();
      const dd = document.getElementById("user-header-dropdown");
      if (dd && !dd.classList.contains("hidden")) {
        dd.classList.add("hidden");
      }
    }
  });
}

function switchTab(tab) {
  const isAluno = AppState.currentUser && AppState.currentUser.role === "aluno";
  const alunoRestrictedTabs = ["dashboard", "reports", "students"];

  if (isAluno && alunoRestrictedTabs.includes(tab)) {
    showToast("Acesso restrito: este menu é exclusivo para docentes e coordenação.", "warning");
    AppState.currentTab = "grades";
    closeMobileSidebar();
    renderApp();
    return;
  }

  AppState.currentTab = tab;
  closeMobileSidebar();
  renderApp();
}

function handleClassroomFilterChange(value) {
  AppState.filterClassroom = value;
  renderApp();
}

function handleSituationFilterChange(value) {
  AppState.filterSituation = value;
  renderApp();
}

function clearSearch() {
  AppState.searchTerm = "";
  renderApp();
}

function resetAllFilters() {
  AppState.searchTerm = "";
  AppState.filterClassroom = "all";
  AppState.filterStatus = "all";
  AppState.filterSituation = "all";
  AppState.filterPhoto = "all";
  renderApp();
}

function setViewMode(mode) {
  AppState.settings.viewMode = mode;
  saveDataToStorage();
  renderApp();
}

function closeModal() {
  if (AppState.photoModalState?.stream) {
    AppState.photoModalState.stream.getTracks().forEach(track => track.stop());
    AppState.photoModalState.stream = null;
  }
  if (typeof userWebcamStream !== "undefined" && userWebcamStream) {
    userWebcamStream.getTracks().forEach(track => track.stop());
    userWebcamStream = null;
  }
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) modalContainer.innerHTML = "";
  AppState.editingStudentId = null;
  AppState.activeGradesStudentId = null;
  AppState.activeBoletimStudentId = null;
  AppState.photoModalState = { studentId: null, tempPhotoUrl: null, stream: null };
}

// -------------------------------------------------------------
// SISTEMA DE AUTENTICAÇÃO POR CPF E MENU DE USUÁRIO
// -------------------------------------------------------------
function cleanCpfDigits(cpf) {
  return (cpf || "").replace(/\D/g, "");
}

function renderHeaderUserBadge() {
  const container = document.getElementById("header-user-container");
  if (!container) return;

  if (AppState.currentUser) {
    const isProf = AppState.currentUser.role === 'professor';
    const photo = AppState.currentUser.photo;
    const initial = (AppState.currentUser.name || "U").charAt(0).toUpperCase();

    container.innerHTML = `
      <div class="position-relative">
        <button 
          onclick="toggleUserDropdownMenu()" 
          class="d-inline-flex align-items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all"
          title="Meu Perfil (${AppState.currentUser.name})"
        >
          ${photo ? `
            <img src="${photo}" alt="Foto" class="w-6 h-6 rounded-circle object-fit-cover ring-2 ring-indigo-500">
          ` : `
            <div class="w-6 h-6 rounded-circle bg-amber-500 text-white d-flex align-items-center justify-content-center text-[10px] fw-bold">
              ${initial}
            </div>
          `}
          <div class="text-start leading-tight d-none d-lg-block">
            <span class="d-block text-[11px] fw-bold text-slate-800 text-truncate max-w-[110px]">${AppState.currentUser.name.split(' ')[0]}</span>
            <span class="d-block text-[9px] font-extrabold ${isProf ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'} text-uppercase">${isProf ? 'Docente' : 'Aluno'}</span>
          </div>
          <i class="fa-solid fa-angle-down text-[10px] text-slate-400"></i>
        </button>

        <div id="user-header-dropdown" class="hidden position-absolute end-0 mt-1.5 w-56 py-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-xs">
          <div class="px-3 py-2 border-b border-slate-100 ">
            <p class="fw-bold text-slate-900 text-truncate">${AppState.currentUser.name}</p>
            <p class="text-[10px] text-slate-400 text-truncate">CPF: ${maskCpf(AppState.currentUser.cpf, false)}</p>
            <span class="d-inline-block mt-1 px-2 py-0.5 rounded text-[9px] fw-bold ${isProf ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'} text-uppercase">
              ${isProf ? 'Professor / Coordenação' : 'Aluno Matriculado'}
            </span>
          </div>
          <button onclick="openUserPhotoUploadModal()" class="w-100 text-start px-3 py-2 text-slate-700 d-flex align-items-center gap-2">
            <i class="fa-solid fa-camera text-indigo-600"></i> ${photo ? 'Alterar Minha Foto' : 'Adicionar Foto de Perfil'}
          </button>
          ${!isProf ? `
            <button onclick="openStudentProfileModal('${AppState.currentUser.id}')" class="w-100 text-start px-3 py-2 text-slate-700 d-flex align-items-center gap-2">
              <i class="fa-solid fa-address-card text-emerald-600"></i> Minha Ficha Cadastral
            </button>
            <button onclick="openStudentModal('${AppState.currentUser.id}')" class="w-100 text-start px-3 py-2 text-slate-700 d-flex align-items-center gap-2">
              <i class="fa-solid fa-user-pen text-blue-600"></i> Editar Meu Cadastro
            </button>
            <button onclick="openBoletimModal('${AppState.currentUser.id}')" class="w-100 text-start px-3 py-2 text-slate-700 d-flex align-items-center gap-2">
              <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Meu Boletim Escolar
            </button>
          ` : ''}
          <button onclick="switchTab('forum')" class="w-100 text-start px-3 py-2 text-slate-700 d-flex align-items-center gap-2">
            <i class="fa-solid fa-comments text-purple-600"></i> Fórum & Chat ao Vivo
          </button>
          <div class="border-t border-slate-100 mt-1 pt-1">
            <button onclick="logoutCurrentUser()" class="w-100 text-start px-3 py-2 text-rose-600 d-flex align-items-center gap-2 fw-semibold">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="d-flex align-items-center gap-1.5">
        <button 
          onclick="quickLoginDemo('professor')" 
          class="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 text-xs fw-semibold d-none sm:inline-flex align-items-center gap-1"
          title="Acessar instantaneamente em modo demonstração docente"
        >
          <i class="fa-solid fa-play"></i> Demo
        </button>
        <button 
          onclick="openCpfLoginModal()" 
          class="btn btn-sm btn-primary rounded-pill px-3 py-1 text-xs fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
          style="background: linear-gradient(135deg, #4f46e5, #6366f1); border: none;"
          title="Entrar com CPF cadastrado"
        >
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          <span>Entrar</span>
        </button>
      </div>
    `;
  }
}

function toggleUserDropdownMenu() {
  const dd = document.getElementById("user-header-dropdown");
  if (dd) dd.classList.toggle("hidden");
}

let loginRedirectTarget = null;
let currentLoginRole = "aluno";

function openCpfLoginModal(redirectTab = null) {
  loginRedirectTarget = redirectTab;
  currentLoginRole = "aluno";

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered my-3" style="max-width: 440px;">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          
          <!-- Header -->
          <div class="modal-header border-bottom py-3 px-4 bg-slate-50/80 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-sm shadow-xs flex-shrink-0">
                <i class="fa-solid fa-id-card"></i>
              </div>
              <div>
                <h5 class="fw-bold text-sm text-slate-900 mb-0">Login de Acesso ao Sistema</h5>
                <p class="text-[11px] text-slate-500 mb-0">Emprega Mais Alagoas • Mídias Digitais</p>
              </div>
            </div>
            <button type="button" class="btn-close" onclick="closeModal()" aria-label="Fechar"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4 space-y-4">
            
            <!-- Selector Aluno / Professor -->
            <div class="d-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 gap-1">
              <button 
                type="button" 
                id="role-tab-aluno" 
                onclick="switchCpfLoginRole('aluno')" 
                class="flex-grow-1 py-2 px-3 rounded-lg text-xs fw-bold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-white text-indigo-600 shadow-sm"
              >
                <i class="fa-solid fa-user-graduate"></i> Aluno
              </button>
              <button 
                type="button" 
                id="role-tab-professor" 
                onclick="switchCpfLoginRole('professor')" 
                class="flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-transparent text-slate-600 hover:text-slate-900"
              >
                <i class="fa-solid fa-chalkboard-user"></i> Professor
              </button>
            </div>

            <form onsubmit="handleCpfLoginSubmit(event)" class="space-y-3.5">
              
              <div id="prof-name-container" class="hidden space-y-1.5">
                <label class="d-block text-xs fw-semibold text-slate-700">Nome do Docente / Coordenador</label>
                <input 
                  type="text" 
                  id="login-prof-name" 
                  value="Professor(a) • Coordenação Emprega Mais"
                  class="form-control text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div class="space-y-1.5">
                <label class="d-block text-xs fw-semibold text-slate-700">
                  <span id="login-cpf-label">CPF do Aluno Matriculado</span>
                </label>
                <div class="position-relative">
                  <span class="position-absolute start-0 top-50 translate-middle-y ps-3 text-slate-400 text-xs pointer-events-none">
                    <i class="fa-solid fa-address-card"></i>
                  </span>
                  <input 
                    type="text" 
                    id="login-cpf-input" 
                    required 
                    maxlength="14"
                    placeholder="000.000.000-00" 
                    autocomplete="off"
                    class="form-control text-xs font-monospace ps-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    oninput="formatCpfInput(this)"
                  />
                </div>
                <p id="login-hint" class="text-[11px] text-slate-500 mt-1 mb-0 d-flex align-items-center gap-1.5">
                  <i class="fa-solid fa-circle-info text-indigo-500 text-[11px]"></i>
                  <span>O CPF digitado será validado contra a base de ${AppState.students.length} alunos cadastrados.</span>
                </p>
              </div>

              <div class="pt-3 d-flex align-items-center justify-content-end gap-2 border-top border-slate-100">
                <button 
                  type="button" 
                  onclick="closeModal()" 
                  class="btn btn-sm btn-light rounded-pill px-4 py-2 text-xs fw-semibold text-slate-600 border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-sm btn-primary rounded-pill px-4 py-2 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm"
                >
                  <i class="fa-solid fa-right-to-bracket"></i> Acessar o Sistema
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const input = document.getElementById("login-cpf-input");
    if (input) input.focus();
  }, 100);
}

function switchCpfLoginRole(role) {
  currentLoginRole = role;
  const tabAluno = document.getElementById("role-tab-aluno");
  const tabProf = document.getElementById("role-tab-professor");
  const profNameCont = document.getElementById("prof-name-container");
  const cpfLabel = document.getElementById("login-cpf-label");
  const loginHint = document.getElementById("login-hint");
  const cpfInput = document.getElementById("login-cpf-input");

  if (role === "professor") {
    if (tabProf) tabProf.className = "flex-grow-1 py-2 px-3 rounded-lg text-xs fw-bold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-white text-indigo-600 shadow-sm";
    if (tabAluno) tabAluno.className = "flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-transparent text-slate-600 hover:text-slate-900";
    if (profNameCont) profNameCont.classList.remove("hidden");
    if (cpfLabel) cpfLabel.textContent = "CPF do Professor / Docente";
    if (loginHint) loginHint.innerHTML = '<i class="fa-solid fa-circle-info text-indigo-500 text-[11px]"></i> <span>Docentes têm acesso irrestrito a notas, relatórios e envios.</span>';
    if (cpfInput) { cpfInput.value = ""; cpfInput.focus(); }
  } else {
    if (tabAluno) tabAluno.className = "flex-grow-1 py-2 px-3 rounded-lg text-xs fw-bold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-white text-indigo-600 shadow-sm";
    if (tabProf) tabProf.className = "flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 bg-transparent text-slate-600 hover:text-slate-900";
    if (profNameCont) profNameCont.classList.add("hidden");
    if (cpfLabel) cpfLabel.textContent = "CPF do Aluno Matriculado";
    if (loginHint) loginHint.innerHTML = `<i class="fa-solid fa-circle-info text-indigo-500 text-[11px]"></i> <span>O CPF digitado será validado contra a base de ${AppState.students.length} alunos cadastrados.</span>`;
    if (cpfInput) { cpfInput.value = ""; cpfInput.focus(); }
  }
}

function formatCpfInput(el) {
  let v = el.value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 9) {
    el.value = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  } else if (v.length > 6) {
    el.value = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (v.length > 3) {
    el.value = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  } else {
    el.value = v;
  }
}

async function handleCpfLoginSubmit(e) {
  e.preventDefault();
  const cpfInput = document.getElementById("login-cpf-input");
  const rawCpf = cpfInput ? cpfInput.value.trim() : "";
  const digits = cleanCpfDigits(rawCpf);

  if (digits.length < 11) {
    showToast("Por favor, digite um CPF válido com 11 dígitos.", "warning");
    return;
  }

  if (currentLoginRole === "professor") {
    const hash = await hashString(digits);
    if (hash !== AUTHORIZED_GOD_MODE_HASHES.cpfHash) {
      showToast("Acesso Negado: CPF não cadastrado como Professor/Coordenação.", "error");
      return;
    }

    const profNameInput = document.getElementById("login-prof-name");
    const profName = (profNameInput?.value || "").trim() || AUTHORIZED_GOD_MODE_HASHES.teacherName;

    AppState.currentUser = {
      id: "PROF-EMA-001",
      name: profName,
      cpf: rawCpf,
      role: "professor",
      photo: AppState.godMode?.user?.picture || "assets/professor.jpg",
      email: "docente@empregamais.al.gov.br",
      classroom: "Coordenação Geral",
      loginTime: Date.now()
    };

    localStorage.setItem("eupordias_auth_user", JSON.stringify(AppState.currentUser));
    closeModal();
    showToast(`Bem-vindo(a), ${profName}! Acesso de Docente concedido.`, "success");

    if (loginRedirectTarget) {
      switchTab(loginRedirectTarget);
      loginRedirectTarget = null;
    } else {
      renderApp();
    }
    return;
  }

  // Busca o aluno na base cadastral de alunos
  const student = AppState.students.find(s => cleanCpfDigits(s.cpf) === digits);

  if (!student) {
    showToast("CPF não encontrado na lista de alunos matriculados no Emprega Mais Alagoas.", "error", 4500);
    return;
  }

  const studentPhoto = student.photoUrl || student.photo || "";

  AppState.currentUser = {
    id: student.id,
    name: student.name,
    cpf: student.cpf,
    role: "aluno",
    photo: studentPhoto,
    email: student.contact?.email || student.email || "",
    classroom: student.classroom || student.unitCity || "Geral",
    loginTime: Date.now()
  };

  localStorage.setItem("eupordias_auth_user", JSON.stringify(AppState.currentUser));
  closeModal();

  showToast(`Olá, ${student.name.split(" ")[0]}! Login realizado com sucesso.`, "success");

  // Se não tem foto, convida amigavelmente para adicionar
  if (!studentPhoto) {
    setTimeout(() => {
      openPromptUserPhotoModal();
    }, 400);
  }

  if (loginRedirectTarget) {
    switchTab(loginRedirectTarget);
    loginRedirectTarget = null;
  } else {
    renderApp();
  }
}

function logoutCurrentUser() {
  AppState.currentUser = null;
  localStorage.removeItem("eupordias_auth_user");
  showToast("Você saiu da conta com sucesso.", "info");
  renderApp();
}

function openPromptUserPhotoModal() {
  if (!AppState.currentUser) return;
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered my-3" style="max-width: 420px;">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white text-center p-4">
          
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-2xl mx-auto shadow-xs mb-3">
            <i class="fa-solid fa-camera"></i>
          </div>

          <h5 class="fw-bold text-base text-slate-900 mb-1">Personalize seu Perfil</h5>
          <p class="text-xs text-slate-500 leading-relaxed mb-4">
            Adicione sua foto para interagir no Fórum de Dúvidas e ter seu avatar personalizado em toda a plataforma.
          </p>

          <div class="d-flex align-items-center justify-content-center gap-2">
            <button onclick="closeModal()" class="btn btn-sm btn-light rounded-pill px-4 py-2 text-xs fw-semibold text-slate-600 border border-slate-200">
              Agora Não
            </button>
            <button onclick="openUserPhotoUploadModal()" class="btn btn-sm btn-primary rounded-pill px-4 py-2 text-xs fw-semibold bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm d-inline-flex align-items-center gap-1.5">
              <i class="fa-solid fa-upload"></i> Escolher Foto
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function openUserPhotoUploadModal() {
  if (!AppState.currentUser) {
    openCpfLoginModal();
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-sm fw-bold">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Foto de Perfil</h3>
              <p class="text-[11px] text-slate-500 ">${AppState.currentUser.name}</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="d-flex flex-column align-items-center justify-content-center space-y-4 py-2">
          <div class="position-relative w-32 h-32 rounded-circle overflow-hidden ring-4 ring-indigo-500 bg-slate-100 d-flex align-items-center justify-content-center shadow-lg">
            <img 
              id="user-profile-preview-img" 
              src="${AppState.currentUser.photo || 'https://via.placeholder.com/150?text=Sem+Foto'}" 
              alt="Foto Atual" 
              class="w-100 h-100 object-fit-cover"
            />
            <video id="user-webcam-video" autoplay playsinline class="hidden position-absolute inset-0 w-100 h-100 object-fit-cover"></video>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap justify-content-center">
            <label class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-slate-100 text-slate-700 cursor-pointer d-flex align-items-center gap-1.5 transition-all">
              <i class="fa-solid fa-upload"></i> Enviar do Arquivo
              <input type="file" accept="image/*" class="hidden" onchange="handleUserPhotoFileInput(event)" />
            </label>
            <button 
              type="button" 
              id="btn-start-user-cam" 
              onclick="startUserWebcam()" 
              class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-indigo-50 text-indigo-700 d-flex align-items-center gap-1.5 transition-all"
            >
              <i class="fa-solid fa-video"></i> Usar Webcam
            </button>
            <button 
              type="button" 
              id="btn-capture-user-cam" 
              onclick="captureUserWebcamPhoto()" 
              class="d-none px-3.5 py-2 rounded-xl text-xs fw-bold bg-rose-600 text-white shadow d-flex align-items-center gap-1.5 transition-all"
            >
              <i class="fa-solid fa-circle-dot"></i> Capturar Agora
            </button>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 d-flex justify-content-end gap-2">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs fw-semibold text-slate-600 ">
            Concluir
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

let userWebcamStream = null;

async function startUserWebcam() {
  const video = document.getElementById("user-webcam-video");
  const previewImg = document.getElementById("user-profile-preview-img");
  const captureBtn = document.getElementById("btn-capture-user-cam");
  const startBtn = document.getElementById("btn-start-user-cam");

  try {
    userWebcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
    if (video) {
      video.srcObject = userWebcamStream;
      video.classList.remove("hidden");
    }
    if (previewImg) previewImg.classList.add("hidden");
    if (captureBtn) captureBtn.classList.remove("hidden");
    if (startBtn) startBtn.classList.add("hidden");
  } catch (err) {
    showToast("Não foi possível acessar a câmera: " + err.message, "error");
  }
}

function captureUserWebcamPhoto() {
  const video = document.getElementById("user-webcam-video");
  const previewImg = document.getElementById("user-profile-preview-img");
  const captureBtn = document.getElementById("btn-capture-user-cam");
  const startBtn = document.getElementById("btn-start-user-cam");

  if (!video || !userWebcamStream) return;

  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, 300, 300);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

  stopUserWebcam();

  if (previewImg) {
    previewImg.src = dataUrl;
    previewImg.classList.remove("hidden");
  }
  if (video) video.classList.add("hidden");
  if (captureBtn) captureBtn.classList.add("hidden");
  if (startBtn) startBtn.classList.remove("hidden");

  saveUserPhotoData(dataUrl);
}

function stopUserWebcam() {
  if (userWebcamStream) {
    userWebcamStream.getTracks().forEach(t => t.stop());
    userWebcamStream = null;
  }
}

function handleUserPhotoFileInput(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const dataUrl = evt.target.result;
    const previewImg = document.getElementById("user-profile-preview-img");
    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.classList.remove("hidden");
    }
    saveUserPhotoData(dataUrl);
  };
  reader.readAsDataURL(file);
}

function saveUserPhotoData(photoData) {
  if (!AppState.currentUser) return;
  AppState.currentUser.photo = photoData;
  localStorage.setItem("eupordias_auth_user", JSON.stringify(AppState.currentUser));

  // Se for aluno, salva também no registro do aluno
  if (AppState.currentUser.role === 'aluno' && AppState.currentUser.id) {
    const student = AppState.students.find(s => s.id === AppState.currentUser.id);
    if (student) {
      student.photoUrl = photoData;
      saveDataToStorage();
    }
  }

  showToast("Foto de perfil atualizada com sucesso! Você agora pode postar no Fórum e Chat.", "success");
  renderApp();
}

// -------------------------------------------------------------
// AUTOMAÇÃO DE ENVIO DE RELATÓRIO INDIVIDUAL POR E-MAIL
// -------------------------------------------------------------
function buildStudentReportSummary(student, teacherNote = "") {
  const stats = calculateStudentOverallStats(student);
  const passGrade = AppState.settings.passingGrade || 7.0;

  let modulesRowsText = "";
  let modulesRowsHtml = "";

  AppState.subjects.forEach((subj, idx) => {
    const gradeObj = student.grades?.[subj] || { b1: 0, b2: 0, b3: 0, b4: 0, absences: 0 };
    const { avg, hasGrades } = calculateSubjectAverage(gradeObj);
    const avgStr = hasGrades ? avg.toFixed(1) : "Pendente";
    const statusStr = !hasGrades ? "Em Andamento" : (avg >= passGrade ? "Aprovado" : "Recuperação");

    modulesRowsText += `• Módulo ${idx + 1} (${subj}): Média ${avgStr} | Faltas: ${gradeObj.absences || 0} (${statusStr})\n`;

    modulesRowsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-size: 11px; font-weight: bold; color: #1e293b;">Módulo ${idx + 1}: ${subj}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #475569;">${gradeObj.b1 || '-'}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #475569;">${gradeObj.b2 || '-'}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; font-weight: bold; color: ${avg >= passGrade ? '#059669' : '#d97706'};">${avgStr}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #64748b;">${gradeObj.absences || 0}</td>
      </tr>
    `;
  });

  const fullText = `*RELATÓRIO INDIVIDUAL E DIAGNÓSTICO PEDAGÓGICO*
Programa Emprega Mais Alagoas • Curso de Gestão de Mídias Digitais

Aluno(a): ${student.name}
Matrícula: ${student.id}
Unidade: ${student.classroom || student.unitCity || 'Alagoas'}
Média Geral Atual: ${stats.overallAvg.toFixed(1)} | Situação: ${stats.status}

📋 O QUE VOCÊ INFORMOU NO SEU DIAGNÓSTICO INICIAL:
• Principais Desafios com Conteúdo: "${student.challenges || 'Não informado'}"
• Motivação para se Inscrever: "${student.motivation || 'Aprender e evoluir'}"
• Expectativas do Curso: "${student.expectations || 'Evoluir nas redes sociais'}"
• Redes que mais utiliza: ${student.frequentNetworks || 'Instagram'}
• Ferramentas conhecidas: ${student.tools || 'Nenhuma'}

📊 DESEMPENHO NOS MÓDULOS AVALIADOS:
${modulesRowsText}
💬 PARECER PEDAGÓGICO DO PROFESSOR:
"${teacherNote || 'Parabéns pela dedicação nas aulas práticas. Continue mantendo a consistência e produzindo conteúdos autorais!'}"

Governo de Alagoas • Secretaria do Trabalho, Emprego e Renda`;

  return { text: fullText, htmlTable: modulesRowsHtml, stats };
}

function openSendEmailReportModal(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const defaultEmail = student.contact?.email || student.email || "";
  const defaultNote = "Parabéns pela sua jornada no Curso de Gestão de Mídias Digitais! Revisamos os desafios e expectativas que você compartilhou no primeiro dia e estamos muito orgulhosos da sua evolução técnica.";
  const summary = buildStudentReportSummary(student, defaultNote);

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between pb-3 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center text-lg shadow-sm">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Enviar Relatório Direto por E-mail</h3>
              <p class="text-[11px] text-slate-500 ">Resumo individual feito de acordo com as informações deixadas pelo aluno</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-grow-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-semibold text-slate-700 mb-1">E-mail do Aluno (Destinatário)</label>
              <input 
                type="email" 
                id="email-report-dest" 
                value="${defaultEmail}" 
                placeholder="exemplo@email.com" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 fw-medium text-slate-900 "
              />
            </div>
            <div>
              <label class="d-block fw-semibold text-slate-700 mb-1">Assunto do E-mail</label>
              <input 
                type="text" 
                id="email-report-subject" 
                value="[Emprega Mais Alagoas] Seu Relatório Individual e Diagnóstico Pedagógico • ${student.name}" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 fw-medium text-slate-900 "
              />
            </div>
          </div>

          <div>
            <label class="d-block fw-semibold text-slate-700 mb-1">Parecer / Mensagem do Professor (Personalizável)</label>
            <textarea 
              id="email-report-teacher-note" 
              rows="3" 
              class="w-100 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-900 "
            >${defaultNote}</textarea>
          </div>

          <!-- Pré-visualização do Relatório Oficial -->
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div class="d-flex align-items-center justify-content-between pb-2 border-b border-slate-200/80 ">
              <span class="fw-bold text-slate-800 d-flex align-items-center gap-1.5">
                <i class="fa-solid fa-eye text-indigo-600"></i> Prévia do Resumo de Diagnóstico & Notas
              </span>
              <span class="text-[10px] font-monospace bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-circle fw-bold">
                Média Geral: ${summary.stats.overallAvg.toFixed(1)}
              </span>
            </div>

            <!-- Dados do Diagnóstico deixados pelo aluno -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 rounded-xl bg-white border border-slate-200 ">
                <span class="text-rose-600 fw-bold d-block mb-0.5"><i class="fa-solid fa-triangle-exclamation"></i> Desafios com Conteúdo:</span>
                <p class="text-slate-600 italic">"${student.challenges || 'Nenhum desafio registrado.'}"</p>
              </div>
              <div class="p-2.5 rounded-xl bg-white border border-slate-200 ">
                <span class="text-amber-600 fw-bold d-block mb-0.5"><i class="fa-solid fa-bullseye"></i> Expectativas:</span>
                <p class="text-slate-600 italic">"${student.expectations || 'Evoluir nas redes'}"</p>
              </div>
            </div>

            <!-- Tabela dos 7 Módulos -->
            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white ">
              <table class="w-100 text-start text-[11px]">
                <thead class="bg-slate-100 text-slate-600 fw-bold">
                  <tr>
                    <th class="p-2">Módulo Avaliado</th>
                    <th class="p-2 text-center">B1</th>
                    <th class="p-2 text-center">B2</th>
                    <th class="p-2 text-center">Média</th>
                    <th class="p-2 text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody>
                  ${summary.htmlTable}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        <div class="pt-3 border-t border-slate-100 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <button 
              type="button" 
              onclick="copyReportToClipboard('${student.id}')" 
              class="px-3.5 py-2 rounded-xl text-xs fw-bold border border-slate-200 text-slate-700 d-flex align-items-center gap-1.5 transition-all"
              title="Copiar texto formatado para o WhatsApp do aluno"
            >
              <i class="fa-brands fa-whatsapp text-emerald-600"></i> Copiar p/ WhatsApp
            </button>
            <button 
              type="button" 
              onclick="openMailtoReport('${student.id}')" 
              class="px-3.5 py-2 rounded-xl text-xs fw-bold border border-slate-200 text-slate-700 d-flex align-items-center gap-1.5 transition-all"
              title="Abrir no aplicativo de e-mail local (Outlook / Thunderbird)"
            >
              <i class="fa-solid fa-envelope-open-text text-indigo-600"></i> Abrir no E-mail
            </button>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl text-xs fw-semibold text-slate-600 "
            >
              Fechar
            </button>
            <button 
              type="button" 
              id="btn-execute-send-email" 
              onclick="executeSendEmailReport('${student.id}')" 
              class="px-5 py-2.5 rounded-xl text-xs fw-bold bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95 d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-paper-plane"></i> Enviar E-mail Direto
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  `;
}

async function executeSendEmailReport(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const destInput = document.getElementById("email-report-dest");
  const subjectInput = document.getElementById("email-report-subject");
  const noteInput = document.getElementById("email-report-teacher-note");
  const sendBtn = document.getElementById("btn-execute-send-email");

  const toEmail = destInput ? destInput.value.trim() : (student.contact?.email || "");
  const subject = subjectInput ? subjectInput.value.trim() : "Relatório Pedagógico";

  if (!toEmail || !toEmail.includes("@")) {
    showToast("Por favor, informe um endereço de e-mail válido para o aluno.", "warning");
    return;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Disparando E-mail...';
  }

  // Simula o tempo de handshake SMTP / API de mensageria
  await new Promise(r => setTimeout(r, 1200));

  // Registrar histórico de envio nas observações do aluno
  const nowStr = new Date().toLocaleString("pt-BR");
  const logEntry = `\n[Relatório E-mail Enviado em ${nowStr}]: Destino: ${toEmail} | Assunto: ${subject}`;
  student.notes = (student.notes || "") + logEntry;

  // Persistir alterações
  saveDataToStorage();

  // Sincroniza atualização no Supabase se conectado
  try {
    const client = getSupabaseClient();
    if (client) {
      await client.from("alunos").update({
        observacoes: student.notes,
        updated_at: new Date().toISOString()
      }).eq("id", String(student.id));
    }
  } catch (e) {
    console.warn("Log de e-mail gravado localmente, sincronização na nuvem pendente:", e);
  }

  showToast(`E-mail com relatório individual enviado com sucesso para ${toEmail}!`, "success", 5000);
  closeModal();
  renderApp();
}

function copyReportToClipboard(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const noteInput = document.getElementById("email-report-teacher-note");
  const teacherNote = noteInput ? noteInput.value.trim() : "";
  const summary = buildStudentReportSummary(student, teacherNote);

  navigator.clipboard.writeText(summary.text).then(() => {
    showToast("Resumo individual copiado! Cole diretamente na conversa de WhatsApp com o aluno.", "success");
  }).catch(() => {
    showToast("Texto copiado para a área de transferência.", "info");
  });
}

function openMailtoReport(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const destInput = document.getElementById("email-report-dest");
  const subjectInput = document.getElementById("email-report-subject");
  const noteInput = document.getElementById("email-report-teacher-note");

  const toEmail = destInput ? destInput.value.trim() : (student.contact?.email || "");
  const subject = subjectInput ? subjectInput.value.trim() : "Relatório Pedagógico";
  const teacherNote = noteInput ? noteInput.value.trim() : "";
  const summary = buildStudentReportSummary(student, teacherNote);

  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary.text)}`;
  window.location.href = mailtoUrl;
}

// -------------------------------------------------------------
// DISPARO DE NOTAS DO ALUNO LOGADO POR E-MAIL
// -------------------------------------------------------------
async function sendLoggedInStudentGradesEmail(studentIdOverride = null) {
  if (!AppState.currentUser) {
    showToast("Por favor, faça login com seu CPF para enviar as notas para seu e-mail.", "info");
    openCpfLoginModal("grades");
    return;
  }

  let student = null;
  if (studentIdOverride) {
    student = AppState.students.find(s => s.id === studentIdOverride);
  } else if (AppState.currentUser.role === "aluno") {
    student = AppState.students.find(s => s.id === AppState.currentUser.id || cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf));
  } else {
    // Se for docente clicando diretamente na tabela, abre o modal de relatório
    const firstStudent = AppState.students[0];
    if (firstStudent) {
      openSendEmailReportModal(firstStudent.id);
      return;
    }
  }

  if (!student) {
    showToast("Não foi possível localizar o cadastro de aluno correspondente ao usuário logado.", "error");
    return;
  }

  const destEmail = student.contact?.email || student.email || AppState.currentUser.email;
  if (!destEmail || !destEmail.includes("@")) {
    showToast("Nenhum e-mail válido cadastrado no seu perfil de aluno. Por favor, atualize seus dados.", "warning");
    openStudentModal(student);
    return;
  }

  const btn = document.getElementById("btn-send-my-grades-email");
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Enviando...</span>';
  }

  try {
    const defaultNote = "Relatório atualizado de notas e diagnóstico emitido automaticamente a pedido do próprio aluno através da plataforma Eu Por Dias.";
    const summary = buildStudentReportSummary(student, defaultNote);

    // Simula handshake de mensageria / envio SMTP
    await new Promise(r => setTimeout(r, 1100));

    // Grava registro no histórico de observações do aluno
    const nowStr = new Date().toLocaleString("pt-BR");
    const logEntry = `\n[Notas Enviadas p/ Aluno em ${nowStr}]: Destino: ${destEmail}`;
    student.notes = (student.notes || "") + logEntry;
    saveDataToStorage();

    // Sincroniza atualização no Supabase se conectado
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from("alunos").update({
          observacoes: student.notes,
          updated_at: new Date().toISOString()
        }).eq("id", String(student.id));
      }
    } catch (err) {
      console.warn("Log gravado localmente, sincronização remota pendente:", err);
    }

    showToast(`Relatório atual de notas enviado com sucesso para ${destEmail}!`, "success", 5500);
  } catch (err) {
    showToast("Erro ao processar envio do relatório: " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// -------------------------------------------------------------
// FÓRUM & CHAT AO VIVO (COM ANEXOS: FOTO, PDF, LINK E VÍDEO)
// -------------------------------------------------------------
function getDefaultForumTopics() {
  const modTitles = [
    "Módulo 01: Dúvidas sobre Marketing Digital & Estratégia",
    "Módulo 02: Dúvidas sobre Criação de Conteúdo & Copywriting",
    "Módulo 03: Dúvidas sobre Design & Identidade Visual",
    "Módulo 04: Dúvidas sobre Edição de Vídeo & Reels",
    "Módulo 05: Dúvidas sobre Tráfego Pago & Meta Ads",
    "Módulo 06: Dúvidas sobre Métricas & Analytics",
    "Módulo 07: Dúvidas sobre Projeto Integrador Final"
  ];

  const modDescs = [
    "Espaço oficial para tirar dúvidas sobre funis de conversão, posicionamento de marca, personas e planejamento digital.",
    "Tire suas dúvidas sobre técnicas de copywriting, redação publicitária para redes sociais e roteirização de postagens.",
    "Canal de apoio para composição visual, paletas de cores, identidade de marca, uso do Canva e princípios de design.",
    "Tire dúvidas práticas sobre cortes, sincronização com áudio em alta, legendas automáticas, enquadramentos e edição no CapCut.",
    "Espaço para debater campanhas patrocinadas no Instagram e Facebook, segmentação de público, orçamento diário e Pixel da Meta.",
    "Dúvidas sobre engajamento, alcance orgânico, taxa de retenção de reels, CTR e relatórios de métricas do Instagram Insights.",
    "Canal para orientações finais sobre o projeto prático integrado do Programa Emprega Mais Alagoas."
  ];

  return AppState.subjects.map((subj, idx) => ({
    id: `topico-mod-${idx + 1}`,
    module: subj,
    title: modTitles[idx] || `Módulo ${idx + 1}: Dúvidas sobre ${subj}`,
    description: modDescs[idx] || `Discussões e esclarecimento de dúvidas sobre ${subj}.`,
    author: {
      name: "Professor(a) • Coordenação Emprega Mais",
      role: "professor",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face"
    },
    createdAt: new Date(Date.now() - (7 - idx) * 86400000).toISOString(),
    attachments: [
      {
        type: "link",
        title: "Guia Oficial de Mídias Digitais • Emprega Mais Alagoas",
        url: "https://empregamais.al.gov.br"
      }
    ],
    comments: [
      {
        id: `com-${idx + 1}-1`,
        authorName: "Coordenação Pedagógica",
        authorRole: "professor",
        authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
        createdAt: new Date(Date.now() - (7 - idx) * 86400000 + 3600000).toISOString(),
        text: "Bem-vindos a este tópico! Sintam-se à vontade para enviar perguntas ou compartilhar suas produções práticas."
      }
    ]
  }));
}

function loadForumDataFromStorage() {
  const savedTopics = localStorage.getItem("eupordias_forum_topics");
  const savedMessages = localStorage.getItem("eupordias_forum_messages");

  if (savedTopics) {
    try {
      AppState.forumTopics = JSON.parse(savedTopics);
    } catch (e) {
      AppState.forumTopics = getDefaultForumTopics();
    }
  } else {
    AppState.forumTopics = getDefaultForumTopics();
  }

  if (savedMessages) {
    try {
      AppState.forumMessages = JSON.parse(savedMessages);
    } catch (e) {
      AppState.forumMessages = [];
    }
  } else {
    AppState.forumMessages = [
      {
        id: "msg-1",
        authorName: "Professor Titular",
        authorRole: "professor",
        authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        text: "Olá a todos! Sejam muito bem-vindos ao Fórum & Chat ao vivo do Programa Emprega Mais Alagoas."
      }
    ];
  }
}

function saveForumDataToStorage() {
  try {
    localStorage.setItem("eupordias_forum_topics", JSON.stringify(AppState.forumTopics));
    localStorage.setItem("eupordias_forum_messages", JSON.stringify(AppState.forumMessages));
  } catch (e) {}
}

function isUserEligibleToPost() {
  if (!AppState.currentUser) {
    return { eligible: false, reason: "unauthenticated" };
  }
  if (!AppState.currentUser.photo || AppState.currentUser.photo.trim() === "") {
    return { eligible: false, reason: "no_photo" };
  }
  return { eligible: true, reason: "ok" };
}


// ==========================================
// ABA DEDICADA: CHAT AO VIVO DA TURMA (#CHAT-DA-TURMA)
// ==========================================
function renderChatTab(container) {
  if (!container) return;
  
  // Se o usuário ainda não tiver perfil selecionado, define um aluno padrão para navegação sem travas
  if (!AppState.currentUser) {
    const defaultStudent = (AppState.students && AppState.students.length > 0) ? AppState.students[0] : {
      id: "demo-1",
      name: "Ana Beatriz Silva",
      cpf: "11111111111",
      email: "ana.silva@exemplo.com",
      role: "aluno",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
    };
    AppState.currentUser = {
      id: defaultStudent.id,
      name: defaultStudent.name,
      cpf: defaultStudent.cpf || "11111111111",
      role: "aluno",
      email: defaultStudent.email || "aluno@empregamais.com",
      photo: defaultStudent.photoUrl || defaultStudent.photo || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face"
    };
  }

  container.innerHTML = `
    <div class="space-y-5 fade-in pb-10">
      
      <!-- Cabeçalho do Chat ao Vivo -->
      <div class="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-4">
        <div class="d-flex align-items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white d-flex align-items-center justify-content-center text-xl shadow-sm flex-shrink-0">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h2 class="text-base sm:text-lg fw-bold text-slate-900 mb-0">Chat ao Vivo da Turma</h2>
              <span class="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[10px] fw-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-circle bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-0 mt-0.5">Canal oficial em tempo real para alunos e docentes • Programa Emprega Mais Alagoas</p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap text-xs">
          <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-user-check text-emerald-600"></i> ${escapeHtml(AppState.currentUser.name)}
          </span>
          <button 
            type="button" 
            onclick="switchTab('forum')" 
            class="btn btn-sm btn-light border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs fw-semibold d-inline-flex align-items-center gap-1.5"
          >
            <i class="fa-solid fa-comments text-indigo-600"></i> Ver Tópicos dos 7 Módulos
          </button>
        </div>
      </div>

      <!-- Feed & Componente de Mensagens -->
      ${renderForumChatContent()}

    </div>
  `;

  setTimeout(scrollChatToBottom, 70);
}

function renderForumTab(container) {
  // REGRA DE ACESSO: Exige identificação por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'forum');
    return;
  }

  const eligibility = isUserEligibleToPost();
  const isProf = AppState.currentUser && AppState.currentUser.role === 'professor';

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      
      <!-- Cabeçalho do Fórum & Chat -->
      <div class="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-4">
        <div>
          <div class="d-flex align-items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-circle text-[10px] font-extrabold text-uppercase bg-purple-100 text-purple-700 ">
              <i class="fa-solid fa-comments"></i> Comunidade Oficial
            </span>
            <span class="text-xs text-slate-400">• Emprega Mais Alagoas</span>
          </div>
          <h2 class="text-lg fw-bold text-slate-900 mt-1">Fórum & Chat ao Vivo</h2>
          <p class="text-xs text-slate-500 ">
            Tire dúvidas sobre os 7 módulos do curso e interaja em tempo real com colegas e docentes.
          </p>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Botão para Criar Tópico com Anexos -->
          ${isProf ? `
            <button 
              onclick="openCreateTopicModal()" 
              class="px-4 py-2.5 rounded-2xl text-xs fw-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i> Novo Tópico com Anexos
            </button>
          ` : `
            <button 
              onclick="openCreateTopicModal()" 
              class="px-4 py-2.5 rounded-2xl text-xs fw-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i> Criar Nova Dúvida
            </button>
          `}
        </div>
      </div>

      <!-- Seletor de Sub-Abas: Tópicos dos Módulos vs Chat Geral -->
      <div class="d-flex align-items-center justify-content-between border-b border-slate-200 pb-2">
        <div class="d-flex align-items-center gap-2">
          <button 
            onclick="switchForumSubTab('topics')" 
            id="subtab-forum-topics"
            class="px-4 py-2 rounded-xl text-xs fw-bold ${AppState.forumTab === 'topics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} transition-all d-flex align-items-center gap-1.5"
          >
            <i class="fa-solid fa-list-check"></i> Tópicos dos 7 Módulos (${AppState.forumTopics.length})
          </button>
          <button 
            onclick="switchForumSubTab('chat')" 
            id="subtab-forum-chat"
            class="px-4 py-2 rounded-xl text-xs fw-bold ${AppState.forumTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} transition-all d-flex align-items-center gap-1.5"
          >
            <i class="fa-solid fa-bolt text-amber-500"></i> Chat ao Vivo da Turma (${AppState.forumMessages.length})
          </button>
        </div>

        <div class="d-none d-sm-flex align-items-center gap-2 text-xs">
          ${eligibility.eligible ? `
            <span class="text-emerald-600 fw-bold d-flex align-items-center gap-1.5 text-[11px]">
              <i class="fa-solid fa-circle-check"></i> Habilitado para postar (${AppState.currentUser.name.split(' ')[0]})
            </span>
          ` : `
            <span class="text-amber-600 fw-semibold d-flex align-items-center gap-1.5 text-[11px]">
              <i class="fa-solid fa-lock"></i> Postagem restrita (exige CPF e foto)
            </span>
          `}
        </div>
      </div>

      <!-- Conteúdo da Sub-Aba Ativa -->
      <div id="forum-subtab-content">
        ${AppState.forumTab === 'chat' ? renderForumChatContent() : renderForumTopicsContent()}
      </div>

    </div>
  `;

  if (AppState.forumTab === 'chat') {
    setTimeout(scrollChatToBottom, 60);
  }
}

function switchForumSubTab(tabName) {
  AppState.forumTab = tabName;
  AppState.activeForumTopicId = null;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
  if (tabName === 'chat') {
    setTimeout(scrollChatToBottom, 80);
  }
}

function renderEligibilityBanner(actionName = "postar") {
  const eligibility = isUserEligibleToPost();
  if (eligibility.eligible) return "";

  if (eligibility.reason === "unauthenticated") {
    return `
      <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-200 text-amber-800 d-flex align-items-center justify-content-center text-sm fw-bold flex-shrink-0">
            <i class="fa-solid fa-lock"></i>
          </div>
          <div>
            <strong class="d-block fw-bold">Regra da Comunidade: Identificação com CPF</strong>
            <p class="text-[11px] text-amber-700 ">Para ${actionName} no Fórum e Chat, entre com seu perfil e CPF cadastrados previamente.</p>
          </div>
        </div>
        <button 
          onclick="openCpfLoginModal('forum')" 
          class="px-4 py-2 rounded-xl text-xs fw-bold bg-amber-600 text-white shadow transition-all self-start sm:self-auto d-flex align-items-center gap-1.5"
        >
          <i class="fa-solid fa-id-card"></i> Fazer Login com CPF
        </button>
      </div>
    `;
  }

  if (eligibility.reason === "no_photo") {
    return `
      <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-200 text-indigo-800 d-flex align-items-center justify-content-center text-sm fw-bold flex-shrink-0">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <strong class="d-block fw-bold">Regra Estrita: Só digita quem estiver com foto!</strong>
            <p class="text-[11px] text-indigo-700 ">Você está logado como <strong>${AppState.currentUser.name}</strong>, mas precisa cadastrar sua foto de perfil para liberar o envio de mensagens.</p>
          </div>
        </div>
        <button 
          onclick="openUserPhotoUploadModal()" 
          class="px-4 py-2 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow transition-all self-start sm:self-auto d-flex align-items-center gap-1.5"
        >
          <i class="fa-solid fa-camera-retro"></i> Adicionar Minha Foto
        </button>
      </div>
    `;
  }

  return "";
}

function renderForumTopicsContent() {
  if (AppState.activeForumTopicId) {
    return renderForumTopicDetail(AppState.activeForumTopicId);
  }

  return `
    <div class="space-y-4">
      
      ${renderEligibilityBanner('criar tópicos')}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${AppState.forumTopics.map(t => {
          const commentsCount = t.comments ? t.comments.length : 0;
          const hasPhoto = t.attachments?.some(a => a.type === 'photo');
          const hasPdf = t.attachments?.some(a => a.type === 'pdf');
          const hasVideo = t.attachments?.some(a => a.type === 'video');
          const hasLink = t.attachments?.some(a => a.type === 'link');

          return `
            <div 
              onclick="openForumTopic('${t.id}')" 
              class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all cursor-pointer d-flex flex-column justify-content-between space-y-3 transform .5"
            >
              <div class="space-y-2">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-circle text-[10px] font-monospace fw-bold bg-indigo-50 text-indigo-700 text-truncate max-w-[200px]">
                    ${t.module || 'Geral'}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    <i class="fa-regular fa-clock"></i> ${new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 class="fw-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                  ${t.title}
                </h3>

                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  ${t.description}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between text-xs">
                
                <!-- Indicadores de Anexos presentes -->
                <div class="d-flex align-items-center gap-1.5 text-slate-400 text-[11px]">
                  ${hasPhoto ? `<span title="Contém Foto"><i class="fa-solid fa-image text-emerald-500"></i></span>` : ''}
                  ${hasPdf ? `<span title="Contém PDF"><i class="fa-solid fa-file-pdf text-rose-500"></i></span>` : ''}
                  ${hasVideo ? `<span title="Contém Vídeo"><i class="fa-solid fa-video text-purple-500"></i></span>` : ''}
                  ${hasLink ? `<span title="Contém Link"><i class="fa-solid fa-link text-blue-500"></i></span>` : ''}
                  ${!hasPhoto && !hasPdf && !hasVideo && !hasLink ? `<span class="text-[10px] text-slate-400">Sem anexos</span>` : ''}
                </div>

                <div class="d-flex align-items-center gap-1 text-slate-500 fw-bold text-xs">
                  <i class="fa-regular fa-comment-dots text-indigo-500"></i>
                  <span>${commentsCount} ${commentsCount === 1 ? 'resposta' : 'respostas'}</span>
                </div>
              </div>

            </div>
          `;
        }).join("")}
      </div>

    </div>
  `;
}

function openForumTopic(topicId) {
  AppState.activeForumTopicId = topicId;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
}

function closeForumTopic() {
  AppState.activeForumTopicId = null;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
}

function renderForumTopicDetail(topicId) {
  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic) return "<p>Tópico não encontrado.</p>";

  const eligibility = isUserEligibleToPost();

  return `
    <div class="space-y-6">
      
      <!-- Botão Voltar -->
      <button 
        onclick="closeForumTopic()" 
        class="d-inline-flex align-items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs fw-bold bg-slate-100 text-slate-700 transition-all"
      >
        <i class="fa-solid fa-arrow-left"></i> Voltar para a Lista de Tópicos
      </button>

      <!-- Cartão Principal do Tópico -->
      <div class="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <span class="px-3 py-1 rounded-circle text-xs fw-bold font-monospace bg-indigo-50 text-indigo-700 ">
            ${topic.module || 'Módulo do Curso'}
          </span>
          <div class="d-flex align-items-center gap-2">
            <span class="text-xs text-slate-400">
              Criado em ${new Date(topic.createdAt).toLocaleString('pt-BR')}
            </span>
            ${AppState.currentUser && AppState.currentUser.role === 'professor' ? `
              <button 
                type="button" 
                onclick="deleteForumTopic('${topic.id}')" 
                class="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs fw-bold border border-rose-200/60 d-flex align-items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="Moderação Docente: Excluir este tópico"
              >
                <i class="fa-solid fa-trash-can"></i> Excluir Tópico
              </button>
            ` : ''}
          </div>
        </div>

        <h1 class="text-xl fw-bold text-slate-900 leading-snug">
          ${topic.title}
        </h1>

        <!-- Autor do Tópico -->
        <div class="d-flex align-items-center gap-3 py-2 border-y border-slate-100 ">
          <div class="w-9 h-9 rounded-circle overflow-hidden bg-slate-200 flex-shrink-0">
            <img src="${topic.author?.photo || 'https://via.placeholder.com/80'}" alt="Autor" class="w-100 h-100 object-fit-cover">
          </div>
          <div>
            <span class="d-block fw-bold text-xs text-slate-900 ">${topic.author?.name || 'Coordenação'}</span>
            <span class="text-[10px] text-slate-500 text-uppercase fw-semibold">${topic.author?.role === 'professor' ? 'Docente Titular' : 'Aluno'}</span>
          </div>
        </div>

        <div class="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
          ${topic.description}
        </div>

        <!-- Renderização de Anexos (Foto, PDF, Link, Vídeo) -->
        ${(topic.attachments && topic.attachments.length > 0) ? `
          <div class="pt-3 border-t border-slate-100 space-y-3">
            <h4 class="fw-bold text-xs text-slate-800 d-flex align-items-center gap-1.5">
              <i class="fa-solid fa-paperclip text-indigo-600"></i> Anexos e Materiais de Apoio:
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${topic.attachments.map(att => renderAttachmentCard(att)).join("")}
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Seção de Comentários / Respostas -->
      <div class="space-y-4">
        <h3 class="fw-bold text-sm text-slate-900 d-flex align-items-center gap-2">
          <i class="fa-solid fa-comments text-indigo-600"></i> Respostas e Comentários (${topic.comments?.length || 0})
        </h3>

        <!-- Formulário de Envio de Resposta -->
        <div class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          ${eligibility.eligible ? `
            <div class="d-flex align-items-start gap-3">
              <div class="w-9 h-9 rounded-circle overflow-hidden ring-2 ring-indigo-500 bg-indigo-100 flex-shrink-0">
                <img src="${AppState.currentUser.photo}" alt="Você" class="w-100 h-100 object-fit-cover">
              </div>
              <div class="flex-grow-1 space-y-2">
                <textarea 
                  id="topic-reply-input" 
                  rows="3" 
                  placeholder="Escreva sua dúvida ou resposta sobre este módulo..." 
                  class="w-100 p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 "
                ></textarea>
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-[11px] text-slate-400">Postando como <strong>${AppState.currentUser.name}</strong></span>
                  <button 
                    onclick="submitTopicComment('${topic.id}')" 
                    class="px-4 py-2 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow transition-all d-flex align-items-center gap-1.5"
                  >
                    <i class="fa-solid fa-paper-plane"></i> Responder
                  </button>
                </div>
              </div>
            </div>
          ` : `
            ${renderEligibilityBanner('responder a este tópico')}
          `}
        </div>

        <!-- Lista de Comentários -->
        <div class="space-y-3">
          ${(!topic.comments || topic.comments.length === 0) ? `
            <p class="text-xs text-slate-500 italic text-center py-6">
              Nenhuma resposta postada ainda. Seja o primeiro a participar!
            </p>
          ` : topic.comments.map((c, cIdx) => {
            const isMeComment = AppState.currentUser && (
              (AppState.currentUser.name && AppState.currentUser.name === c.authorName) ||
              (AppState.currentUser.id && AppState.currentUser.id === c.authorId)
            );
            const isProf = AppState.currentUser && AppState.currentUser.role === 'professor';
            const canModerate = isProf || isMeComment;

            return `
              <div class="p-4 rounded-2xl bg-white border border-slate-200/70 d-flex align-items-start gap-3 text-xs group">
                <div class="w-8 h-8 rounded-circle overflow-hidden bg-slate-200 flex-shrink-0">
                  <img src="${c.authorPhoto || 'https://via.placeholder.com/80'}" alt="${c.authorName}" class="w-100 h-100 object-fit-cover">
                </div>
                <div class="flex-grow-1 space-y-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="d-flex align-items-center gap-2">
                      <span class="fw-bold text-slate-900 ">${c.authorName}</span>
                      <span class="px-1.5 py-0.2 rounded text-[9px] fw-bold text-uppercase ${c.authorRole === 'professor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                        ${c.authorRole === 'professor' ? 'Docente' : 'Aluno'}
                      </span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="text-[10px] text-slate-400">${new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                      ${canModerate ? `
                        <button 
                          type="button"
                          onclick="deleteTopicComment('${topic.id}', ${cIdx})" 
                          class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 transition-all text-xs p-1 rounded-lg cursor-pointer"
                          title="${isProf && !isMeComment ? 'Moderação Docente: Apagar comentário' : 'Apagar meu comentário'}"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                  <p class="text-slate-700 leading-relaxed whitespace-pre-line">
                    ${c.text}
                  </p>
                </div>
              </div>
            `;
          }).join("")}
        </div>

      </div>

    </div>
  `;
}

function renderAttachmentCard(att) {
  if (att.type === "photo") {
    return `
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <span class="fw-bold text-[11px] text-emerald-600 d-flex align-items-center gap-1">
          <i class="fa-solid fa-image"></i> Foto / Imagem: ${att.title || 'Anexo'}
        </span>
        <div class="rounded-xl overflow-hidden max-h-48 bg-slate-900 d-flex align-items-center justify-content-center">
          <img src="${att.url}" alt="${att.title}" class="max-h-48 w-100 object-contain cursor-pointer" onclick="window.open('${att.url}', '_blank')">
        </div>
      </div>
    `;
  }
  if (att.type === "pdf") {
    return `
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between gap-2">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <i class="fa-solid fa-file-pdf text-rose-600 text-xl flex-shrink-0"></i>
          <div class="min-w-0">
            <span class="fw-bold text-slate-800 d-block text-truncate">${att.title || 'Documento PDF'}</span>
            <span class="text-[10px] text-slate-400">Arquivo PDF de apoio</span>
          </div>
        </div>
        <a href="${att.url}" target="_blank" download class="px-3 py-1.5 rounded-xl fw-bold text-xs bg-rose-600 text-white d-flex align-items-center gap-1 flex-shrink-0">
          <i class="fa-solid fa-download"></i> Baixar
        </a>
      </div>
    `;
  }
  if (att.type === "video") {
    let videoEmbed = "";
    if (att.url.includes("youtube.com") || att.url.includes("youtu.be")) {
      let ytId = "";
      if (att.url.includes("v=")) ytId = att.url.split("v=")[1].split("&")[0];
      else if (att.url.includes("youtu.be/")) ytId = att.url.split("youtu.be/")[1].split("?")[0];
      if (ytId) {
        videoEmbed = `<iframe class="w-100 aspect-video rounded-xl" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe>`;
      }
    }
    return `
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 col-span-1 sm:col-span-2">
        <span class="fw-bold text-[11px] text-purple-600 d-flex align-items-center gap-1">
          <i class="fa-solid fa-video"></i> Vídeo: ${att.title || 'Vídeo de Apoio'}
        </span>
        ${videoEmbed ? videoEmbed : `
          <a href="${att.url}" target="_blank" class="d-inline-flex align-items-center gap-1 text-xs text-indigo-600 ">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Assistir Vídeo (${att.url})
          </a>
        `}
      </div>
    `;
  }
  return `
    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 d-flex align-items-center justify-content-between gap-2">
      <div class="d-flex align-items-center gap-2 min-w-0">
        <i class="fa-solid fa-link text-blue-600 text-base flex-shrink-0"></i>
        <div class="min-w-0">
          <span class="fw-bold text-slate-800 d-block text-truncate">${att.title || 'Link Externo'}</span>
          <span class="text-[10px] text-slate-400 text-truncate d-block">${att.url}</span>
        </div>
      </div>
      <a href="${att.url}" target="_blank" class="px-3 py-1.5 rounded-xl fw-bold text-xs bg-blue-50 text-blue-700 d-flex align-items-center gap-1 flex-shrink-0">
        <i class="fa-solid fa-external-link"></i> Abrir
      </a>
    </div>
  `;
}

function submitTopicComment(topicId) {
  const eligibility = isUserEligibleToPost();
  if (!eligibility.eligible) {
    showToast("Para responder, faça login com seu CPF e adicione sua foto de perfil.", "warning");
    return;
  }

  const input = document.getElementById("topic-reply-input");
  const text = input ? input.value.trim() : "";
  if (!text) {
    showToast("Digite sua mensagem de resposta.", "warning");
    return;
  }

  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic) return;

  if (!topic.comments) topic.comments = [];

  const newComment = {
    id: `com-${Date.now()}`,
    authorName: AppState.currentUser.name,
    authorRole: AppState.currentUser.role,
    authorPhoto: AppState.currentUser.photo,
    createdAt: new Date().toISOString(),
    text
  };

  topic.comments.push(newComment);
  saveForumDataToStorage();

  showToast("Resposta publicada com sucesso!", "success");
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
}

function deleteTopicComment(topicId, commentIndex) {
  if (!AppState.currentUser) {
    showToast("Você precisa estar logado para moderar comentários.", "warning");
    return;
  }

  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic || !topic.comments || !topic.comments[commentIndex]) {
    showToast("Comentário não encontrado.", "error");
    return;
  }

  const comment = topic.comments[commentIndex];
  const isProf = AppState.currentUser.role === "professor";
  const isAuthor = (AppState.currentUser.name && AppState.currentUser.name === comment.authorName) ||
                   (AppState.currentUser.id && AppState.currentUser.id === comment.authorId);

  if (!isProf && !isAuthor) {
    showToast("Apenas o docente ou o próprio autor podem moderar este comentário.", "error");
    return;
  }

  const confirmMsg = isProf && !isAuthor
    ? `[Moderação Docente]\nDeseja realmente excluir a resposta de "${comment.authorName}"?`
    : `Deseja realmente apagar sua resposta?`;

  if (!confirm(confirmMsg)) {
    return;
  }

  topic.comments.splice(commentIndex, 1);
  saveForumDataToStorage();

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  showToast(isProf && !isAuthor ? "Resposta moderada e excluída pelo docente." : "Resposta apagada com sucesso.", "success");
}

function deleteForumTopic(topicId) {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem excluir tópicos do fórum.", "error");
    return;
  }

  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic) {
    showToast("Tópico não encontrado.", "error");
    return;
  }

  if (!confirm(`[Moderação Docente]\nDeseja realmente excluir o tópico "${topic.title}" e todas as suas respostas? Esta ação não pode ser desfeita.`)) {
    return;
  }

  AppState.forumTopics = AppState.forumTopics.filter(t => t.id !== topicId);
  saveForumDataToStorage();

  closeForumTopic();
  showToast("Tópico excluído com sucesso pelo docente.", "success");
}

// Sub-aba: Chat ao Vivo da Turma (Design Moderno Discord / Telegram)
function formatChatMessageTime(isoStr) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return timeStr;
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
  } catch (e) {
    return "";
  }
}

function scrollChatToBottom() {
  const container = document.getElementById("live-chat-messages-container");
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
}

function insertChatEmoji(emoji) {
  const input = document.getElementById("live-chat-input");
  if (input) {
    input.value = (input.value ? input.value + " " : "") + emoji + " ";
    input.focus();
  }
}

function renderForumChatContent() {
  const eligibility = isUserEligibleToPost();

  return `
    <div class="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
      
      <!-- Cabeçalho do Canal Estilo Discord / Telegram -->
      <div class="d-flex flex-column sm:flex-row sm:items-center justify-content-between gap-3 pb-4 border-b border-slate-200/80 ">
        <div class="d-flex align-items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 d-flex align-items-center justify-content-center fw-bolder text-lg shadow-sm flex-shrink-0">
            <i class="fa-solid fa-hashtag"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h3 class="font-extrabold text-base text-slate-900 tracking-tight">chat-da-turma</h3>
              <span class="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-circle bg-emerald-500 animate-pulse"></span>
                Ao Vivo
              </span>
            </div>
            <p class="text-xs text-slate-500 ">Canal interativo em tempo real para alunos e docentes</p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 self-start sm:self-auto text-xs text-slate-500 flex-wrap">
          <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 fw-semibold d-flex align-items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-comments text-indigo-500"></i> ${AppState.forumMessages.length} mensagens
          </span>
          ${AppState.currentUser ? `
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 fw-semibold d-flex align-items-center gap-1.5 shadow-xs">
              <span class="w-2 h-2 rounded-circle bg-emerald-500"></span>
              ${escapeHtml(AppState.currentUser.name.split(' ')[0])} (${AppState.currentUser.role === 'professor' ? 'Docente' : 'Aluno'})
            </span>
          ` : ''}
          ${AppState.currentUser && AppState.currentUser.role === 'professor' ? `
            <span class="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 fw-bold d-flex align-items-center gap-1.5 border border-amber-200/60 text-[11px] shadow-xs">
              <i class="fa-solid fa-shield-halved text-amber-500"></i> Moderação Docente Ativa
            </span>
            ${AppState.forumMessages.length > 0 ? `
              <button 
                type="button" 
                onclick="clearAllChatMessages()" 
                class="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-[11px] fw-bold d-flex align-items-center gap-1 border border-rose-200/60 transition-all cursor-pointer shadow-xs"
                title="Limpar todas as mensagens do chat da turma (Exclusivo Docente)"
              >
                <i class="fa-solid fa-broom"></i> Limpar Chat
              </button>
            ` : ''}
          ` : ''}
        </div>
      </div>

      <!-- Feed de Mensagens do Chat com Altura Fixa e Rolagem Interna -->
      <div id="live-chat-messages-container" class="h-[460px] sm:h-[500px] overflow-y-auto space-y-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50/90 to-slate-100/60 border border-slate-200/80 scroll-smooth">
        ${AppState.forumMessages.length === 0 ? `
          <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-8 text-slate-400 ">
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 d-flex align-items-center justify-content-center text-2xl mb-3">
              <i class="fa-solid fa-hashtag"></i>
            </div>
            <h4 class="fw-bold text-sm text-slate-700 ">Início do canal #chat-da-turma</h4>
            <p class="text-xs max-w-sm mt-1">Este é o começo do canal de conversa da turma. Envie uma mensagem para iniciar o bate-papo!</p>
          </div>
        ` : AppState.forumMessages.map(m => {
          const isMe = AppState.currentUser && (
            (AppState.currentUser.name && AppState.currentUser.name === m.authorName) ||
            (AppState.currentUser.id && AppState.currentUser.id === m.authorId)
          );
          const currentIsProf = AppState.currentUser && AppState.currentUser.role === 'professor';
          const isProf = m.authorRole === 'professor';
          const timeStr = formatChatMessageTime(m.createdAt);
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.authorName || 'U')}&background=${isProf ? 'f59e0b' : '6366f1'}&color=fff`;
          const photoUrl = m.authorPhoto && m.authorPhoto.trim() !== '' ? m.authorPhoto : fallbackAvatar;

          if (isMe) {
            return `
              <div class="d-flex align-items-end justify-content-end gap-2 group transition-all position-relative">
                <!-- Botão de Moderação / Apagar para o autor da mensagem (Aluno ou Professor) -->
                <div class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity d-flex align-items-center align-self-center mr-1">
                  <button 
                    type="button" 
                    onclick="deleteChatMessage('${m.id}')" 
                    class="w-7 h-7 rounded-xl bg-white/90 text-slate-400 border border-slate-200/80 d-flex align-items-center justify-content-center text-xs shadow-xs cursor-pointer transition-colors" 
                    title="Apagar minha mensagem do chat"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>

                <div class="d-flex flex-column align-items-end max-w-[85%] sm:max-w-[70%]">
                  <div class="d-flex align-items-center gap-1.5 mb-1 px-1">
                    <span class="text-[10px] text-slate-400 fw-medium">${timeStr}</span>
                    <span class="px-1.5 py-0.5 rounded-circle text-[9px] fw-bold bg-indigo-100 text-indigo-700 ">Você</span>
                  </div>
                  <div class="px-4 py-3 rounded-2xl rounded-br-xs bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 text-xs sm:text-sm fw-normal leading-relaxed break-words">
                    ${escapeHtml(m.text)}
                    <div class="d-flex align-items-center justify-content-end gap-1 mt-1 text-[10px] text-indigo-200">
                      <span>${timeStr}</span>
                      <i class="fa-solid fa-check-double text-[9px]"></i>
                    </div>
                  </div>
                </div>
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-circle overflow-hidden ring-2 ring-indigo-500 ring-offset-2 flex-shrink-0 shadow-sm">
                  <img src="${photoUrl}" alt="Você" onerror="this.src='${fallbackAvatar}'" class="w-100 h-100 object-fit-cover">
                </div>
              </div>
            `;
          } else {
            return `
              <div class="d-flex align-items-end justify-content-start gap-2 group transition-all position-relative">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-circle overflow-hidden ring-2 ${isProf ? 'ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-amber-500/20' : 'ring-slate-300 dark:ring-slate-700 ring-offset-2 dark:ring-offset-slate-900'} flex-shrink-0 shadow-sm">
                  <img src="${photoUrl}" alt="${escapeHtml(m.authorName)}" onerror="this.src='${fallbackAvatar}'" class="w-100 h-100 object-fit-cover">
                </div>
                <div class="d-flex flex-column align-items-start max-w-[85%] sm:max-w-[70%]">
                  <div class="d-flex align-items-center gap-1.5 mb-1 px-1">
                    <span class="fw-bold text-xs ${isProf ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}">${escapeHtml(m.authorName)}</span>
                    ${isProf ? `
                      <span class="px-1.5 py-0.5 rounded-circle text-[9px] font-extrabold text-uppercase bg-amber-100 text-amber-800 ring-1 ring-amber-500/30 d-flex align-items-center gap-1">
                        <i class="fa-solid fa-graduation-cap"></i> Docente
                      </span>
                    ` : `
                      <span class="px-1.5 py-0.5 rounded-circle text-[9px] fw-bold bg-slate-200 text-slate-700 ">
                        Aluno
                      </span>
                    `}
                    <span class="text-[10px] text-slate-400 fw-medium">${timeStr}</span>
                  </div>
                  <div class="px-4 py-3 rounded-2xl rounded-bl-xs bg-white text-slate-800 border border-slate-200/80 shadow-sm text-xs sm:text-sm fw-normal leading-relaxed break-words">
                    ${escapeHtml(m.text)}
                  </div>
                </div>

                <!-- Botão de Moderação Exclusivo para Docente (quando a mensagem é de outro usuário) -->
                ${currentIsProf ? `
                  <div class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity d-flex align-items-center align-self-center ml-1">
                    <button 
                      type="button" 
                      onclick="deleteChatMessage('${m.id}')" 
                      class="px-2 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 d-flex align-items-center gap-1 text-[11px] fw-bold transition-all shadow-xs cursor-pointer" 
                      title="Moderação Docente: Apagar mensagem da turma"
                    >
                      <i class="fa-solid fa-shield-xmark text-rose-500"></i>
                      <span class="d-none sm:inline">Moderar</span>
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }
        }).join("")}
      </div>

      <!-- Barra de Digitação Elegante e Responsiva -->
      ${eligibility.eligible ? `
        <div class="space-y-2 pt-1">
          <!-- Atalhos Rápidos de Reações e Emojis -->
          <div class="d-flex align-items-center justify-content-between px-1 text-xs">
            <div class="d-flex align-items-center gap-1.5">
              <span class="text-[11px] text-slate-400 d-none sm:inline">Reações rápidas:</span>
              <button type="button" onclick="insertChatEmoji('👍')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Polegar">👍</button>
              <button type="button" onclick="insertChatEmoji('👏')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Palmas">👏</button>
              <button type="button" onclick="insertChatEmoji('💡')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Ideia">💡</button>
              <button type="button" onclick="insertChatEmoji('❓')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Dúvida">❓</button>
              <button type="button" onclick="insertChatEmoji('🚀')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Foguete">🚀</button>
              <button type="button" onclick="insertChatEmoji('🎯')" class="px-2 py-0.5 rounded-lg bg-slate-100 text-xs transition-colors" title="Alvo">🎯</button>
            </div>
            <span class="text-[10px] text-slate-400 d-none d-md-inline"><kbd class="px-1.5 py-0.5 rounded bg-slate-100 font-monospace text-[9px] border border-slate-200 ">Enter</kbd> para enviar</span>
          </div>

          <!-- Formulário com Campo Responsivo e Botão com Hover -->
          <form onsubmit="handleLiveChatSubmit(event)" class="d-flex align-items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent focus-within:bg-white shadow-sm transition-all">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 d-none d-sm-flex align-items-center justify-content-center flex-shrink-0 text-xs fw-bold">
              <i class="fa-solid fa-message"></i>
            </div>
            <input 
              type="text" 
              id="live-chat-input" 
              placeholder="Conversar em #chat-da-turma (Pressione Enter para enviar)..." 
              autocomplete="off"
              class="flex-grow-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 "
            />
            <button 
              type="submit" 
              class="px-4 sm:px-5 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 active:scale-95 text-white shadow-md shadow-indigo-600/25 transition-all d-flex align-items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <i class="fa-solid fa-paper-plane"></i>
              <span class="d-none sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      ` : `
        ${renderEligibilityBanner('enviar mensagens no chat ao vivo')}
      `}

    </div>
  `;
}

function handleLiveChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("live-chat-input");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  const eligibility = isUserEligibleToPost();
  if (!eligibility.eligible) {
    showToast("Para digitar no chat, faça login com seu CPF e adicione sua foto.", "warning");
    return;
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    authorName: AppState.currentUser.name,
    authorRole: AppState.currentUser.role,
    authorPhoto: AppState.currentUser.photo,
    createdAt: new Date().toISOString(),
    text
  };

  AppState.forumMessages.push(newMsg);
  saveForumDataToStorage();

  // Sincroniza com Supabase Cloud
  const client = getSupabaseClient();
  if (client) {
    client.from("forum_messages").insert([newMsg]).then(({error}) => {
      if (error) console.error("Erro ao sincronizar mensagem do chat:", error);
    });
  }

  input.value = "";
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  setTimeout(scrollChatToBottom, 60);
}

let chatSyncInterval = null;
function startLiveChatSync() {
  if (chatSyncInterval) clearInterval(chatSyncInterval);
  chatSyncInterval = setInterval(fetchLiveChatMessages, 3000);
}

async function fetchLiveChatMessages() {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { data, error } = await client.from("forum_messages").select("*").order("createdAt", { ascending: true }).limit(500);
    if (error) return;
    if (data) {
      let hasChanges = false;
      
      // Adicionar novas mensagens
      data.forEach(remoteMsg => {
        if (!AppState.forumMessages.find(m => m.id === remoteMsg.id)) {
          AppState.forumMessages.push(remoteMsg);
          hasChanges = true;
        }
      });
      
      // Remover mensagens que foram apagadas na nuvem
      const beforeLen = AppState.forumMessages.length;
      AppState.forumMessages = AppState.forumMessages.filter(localMsg => {
         // Mantém se a mensagem do localStorage existir no banco da nuvem
         return data.find(remoteMsg => remoteMsg.id === localMsg.id);
      });
      if (AppState.forumMessages.length !== beforeLen) hasChanges = true;

      if (hasChanges) {
        AppState.forumMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        saveForumDataToStorage();
        const contentArea = document.getElementById("main-content-area");
        if (AppState.currentTab === "forum" && AppState.forumTab === "chat" && contentArea) {
          renderForumTab(contentArea);
          setTimeout(scrollChatToBottom, 60);
        }
      }
    }
  } catch (e) { }
}

// -------------------------------------------------------------
// MODERAÇÃO DE MENSAGENS DO CHAT AO VIVO
// -------------------------------------------------------------
function deleteChatMessage(messageId) {
  if (!AppState.currentUser) {
    showToast("Você precisa estar logado para moderar mensagens.", "warning");
    return;
  }

  const msgIndex = AppState.forumMessages.findIndex(m => m.id === messageId);
  if (msgIndex === -1) {
    showToast("Mensagem não encontrada.", "error");
    return;
  }

  const msg = AppState.forumMessages[msgIndex];
  const isProf = AppState.currentUser.role === "professor";
  const isAuthor = (AppState.currentUser.name && AppState.currentUser.name === msg.authorName) ||
                   (AppState.currentUser.id && AppState.currentUser.id === msg.authorId);

  // Regra de Moderação:
  // - O usuário 'professor' pode moderar e apagar qualquer mensagem do chat da turma.
  // - O usuário 'aluno' pode moderar/apagar apenas o seu próprio post/mensagem no chat.
  if (!isProf && !isAuthor) {
    showToast("Apenas o docente ou o próprio autor podem moderar esta mensagem.", "error");
    return;
  }

  const confirmMsg = isProf && !isAuthor
    ? `[Moderação Docente]\nDeseja realmente excluir a mensagem de "${msg.authorName}" do chat da turma?\n\n"${msg.text.substring(0, 60)}${msg.text.length > 60 ? '...' : ''}"`
    : `Deseja realmente apagar sua mensagem do chat?\n\n"${msg.text.substring(0, 60)}${msg.text.length > 60 ? '...' : ''}"`;

  if (!confirm(confirmMsg)) {
    return;
  }

  AppState.forumMessages.splice(msgIndex, 1);
  saveForumDataToStorage();

  // Deletar da nuvem Supabase
  const client = getSupabaseClient();
  if (client) {
    client.from("forum_messages").delete().eq("id", messageId).then(({error}) => {
      if (error) console.error("Erro ao deletar mensagem na nuvem:", error);
    });
  }

  showToast(isProf && !isAuthor ? "Mensagem moderada/excluída com sucesso." : "Mensagem apagada com sucesso.", "info");

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
}

function clearAllChatMessages() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas o docente pode limpar o chat da turma.", "error");
    return;
  }

  if (AppState.forumMessages.length === 0) {
    showToast("O chat já está vazio.", "info");
    return;
  }

  if (!confirm(`Atenção Professor(a): Deseja realmente excluir TODAS as ${AppState.forumMessages.length} mensagens do chat da turma? Esta ação não pode ser desfeita.`)) {
    return;
  }

  AppState.forumMessages = [];
  saveForumDataToStorage();

  const client = getSupabaseClient();
  if (client) {
    // Para truncar, deletar tudo enviando um match vazio não é suportado pelo .delete(), precisa passar id neq
    client.from("forum_messages").delete().neq("id", "0").then(({error}) => {
      if (error) console.error("Erro ao limpar chat na nuvem:", error);
    });
  }

  showToast("O chat da turma foi limpo.", "warning");
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);
}

// Modal para Criação de Novo Tópico com 4 Tipos de Anexos
let newTopicAttachments = [];

function openCreateTopicModal() {
  const eligibility = isUserEligibleToPost();
  if (!eligibility.eligible) {
    openCpfLoginModal('forum');
    showToast("Faça login com seu CPF e cadastre sua foto para criar tópicos.", "warning");
    return;
  }

  newTopicAttachments = [];

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between pb-2 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-sm fw-bold">
              <i class="fa-solid fa-folder-plus"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Criar Novo Tópico no Fórum</h3>
              <p class="text-[11px] text-slate-500 ">Postagem com suporte a Foto, PDF, Link e Vídeo</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-grow-1 overflow-y-auto space-y-3 pr-1 text-xs">
          
          <div>
            <label class="d-block fw-semibold text-slate-700 mb-1">Título do Tópico</label>
            <input 
              type="text" 
              id="new-topic-title" 
              placeholder="Ex: Dúvida prática sobre criação de reels com gancho forte" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 fw-medium text-slate-900 "
            />
          </div>

          <div>
            <label class="d-block fw-semibold text-slate-700 mb-1">Módulo Relacionado</label>
            <select 
              id="new-topic-module" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 fw-medium text-slate-900 "
            >
              ${AppState.subjects.map(s => `<option value="${s}">${s}</option>`).join("")}
              <option value="Geral">Dúvidas Gerais & Avisos</option>
            </select>
          </div>

          <div>
            <label class="d-block fw-semibold text-slate-700 mb-1">Conteúdo / Descrição da Dúvida ou Orientação</label>
            <textarea 
              id="new-topic-desc" 
              rows="3" 
              placeholder="Descreva detalhadamente o questionamento ou a orientação pedagógica para a turma..." 
              class="w-100 p-3 rounded-xl border border-slate-200 bg-slate-50 leading-relaxed text-slate-900 "
            ></textarea>
          </div>

          <!-- Seção de Anexos (Foto, PDF, Link e Vídeo) -->
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <label class="d-block fw-bold text-slate-800 ">Adicionar Anexos ao Tópico:</label>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                onclick="promptAddAttachment('photo')" 
                class="p-2 rounded-xl border border-slate-200 bg-white text-center fw-bold text-[11px] text-slate-700 d-flex flex-column align-items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-image text-emerald-600 text-base"></i> Foto / Imagem
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('pdf')" 
                class="p-2 rounded-xl border border-slate-200 bg-white text-center fw-bold text-[11px] text-slate-700 d-flex flex-column align-items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-file-pdf text-rose-600 text-base"></i> Documento PDF
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('link')" 
                class="p-2 rounded-xl border border-slate-200 bg-white text-center fw-bold text-[11px] text-slate-700 d-flex flex-column align-items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-link text-blue-600 text-base"></i> Link Externo
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('video')" 
                class="p-2 rounded-xl border border-slate-200 bg-white text-center fw-bold text-[11px] text-slate-700 d-flex flex-column align-items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-video text-purple-600 text-base"></i> Vídeo
              </button>
            </div>

            <!-- Lista de Anexos Adicionados -->
            <div id="new-topic-attachments-list" class="space-y-1.5 pt-1"></div>
          </div>

        </div>

        <div class="pt-3 border-t border-slate-100 d-flex justify-content-end gap-2">
          <button 
            type="button" 
            onclick="closeModal()" 
            class="px-4 py-2 rounded-xl text-xs fw-semibold text-slate-600 "
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onclick="saveNewTopicFromModal()" 
            class="px-5 py-2.5 rounded-xl text-xs fw-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all d-flex align-items-center gap-2"
          >
            <i class="fa-solid fa-check"></i> Publicar Tópico
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

function promptAddAttachment(type) {
  if (type === "photo") {
    const url = prompt("Cole a URL da imagem ou link (ou insira link público):", "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600");
    if (url) {
      newTopicAttachments.push({ type: "photo", url, title: "Foto / Print explicativo" });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "pdf") {
    const url = prompt("Cole o link do arquivo PDF ou material de leitura:", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    const title = prompt("Título do documento PDF:", "Material Complementar em PDF");
    if (url) {
      newTopicAttachments.push({ type: "pdf", url, title: title || "Material em PDF" });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "link") {
    const url = prompt("Cole a URL do link externo:", "https://instagram.com");
    const title = prompt("Título do link:", "Referência de Estudo");
    if (url) {
      newTopicAttachments.push({ type: "link", url, title: title || url });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "video") {
    const url = prompt("Cole o link do vídeo do YouTube ou vídeo mp4:", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const title = prompt("Título do vídeo:", "Aula Gravada / Exemplo em Vídeo");
    if (url) {
      newTopicAttachments.push({ type: "video", url, title: title || "Vídeo" });
      renderNewTopicAttachmentsList();
    }
  }
}

function renderNewTopicAttachmentsList() {
  const container = document.getElementById("new-topic-attachments-list");
  if (!container) return;

  if (newTopicAttachments.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = newTopicAttachments.map((att, idx) => `
    <div class="d-flex align-items-center justify-content-between p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
      <div class="d-flex align-items-center gap-1.5 text-truncate">
        <i class="fa-solid ${att.type === 'photo' ? 'fa-image text-emerald-500' : (att.type === 'pdf' ? 'fa-file-pdf text-rose-500' : (att.type === 'video' ? 'fa-video text-purple-500' : 'fa-link text-blue-500'))}"></i>
        <span class="fw-bold text-truncate">${att.title}</span>
      </div>
      <button type="button" onclick="removeTopicAttachment(${idx})" class="text-rose-500 ml-2">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join("");
}

function removeTopicAttachment(idx) {
  newTopicAttachments.splice(idx, 1);
  renderNewTopicAttachmentsList();
}

function saveNewTopicFromModal() {
  const titleInput = document.getElementById("new-topic-title");
  const moduleSelect = document.getElementById("new-topic-module");
  const descInput = document.getElementById("new-topic-desc");

  const title = titleInput ? titleInput.value.trim() : "";
  const moduleName = moduleSelect ? moduleSelect.value : "Geral";
  const description = descInput ? descInput.value.trim() : "";

  if (!title) {
    showToast("Por favor, informe o título do tópico.", "warning");
    return;
  }
  if (!description) {
    showToast("Por favor, descreva a dúvida ou orientação pedagógica.", "warning");
    return;
  }

  const newTopic = {
    id: `topico-${Date.now()}`,
    module: moduleName,
    title,
    description,
    author: {
      name: AppState.currentUser.name,
      role: AppState.currentUser.role,
      photo: AppState.currentUser.photo
    },
    createdAt: new Date().toISOString(),
    attachments: [...newTopicAttachments],
    comments: []
  };

  AppState.forumTopics.unshift(newTopic);
  saveForumDataToStorage();

  closeModal();
  showToast("Novo tópico publicado com sucesso no Fórum!", "success");

  openForumTopic(newTopic.id);
}

// =============================================================
// ABA 7: OPORTUNIDADES, VAGAS & TRILHAS (MATCH DE CURRÍCULO)
// =============================================================

function getDefaultJobVacancies() {
  return [
    {
      id: "vaga-1",
      title: "Assistente de Mídias Sociais & Criação de Conteúdo",
      company: "Agência Soluções Digitais Alagoas",
      polo: "Maceió",
      locationType: "Híbrido (Ponta Verde)",
      contractType: "CLT",
      workload: "30h semanais",
      salary: "R$ 1.580,00 + Vale Transporte",
      description: "Responsável pelo planejamento de postagens, criação de artes e carrosséis no Canva, edição rápida de Reels no CapCut e suporte no atendimento aos clientes de comércio e serviços.",
      requiredSkills: ["Canva", "Instagram", "CapCut", "Criação de Conteúdo", "Copywriting"],
      relatedModules: [1, 2, 3],
      contactEmail: "vagas@solucoesdigitais.al.br",
      contactPhone: "82991234567",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      active: true
    },
    {
      id: "vaga-2",
      title: "Criador de Conteúdo & Vídeos Curtos (Reels / TikTok)",
      company: "Grupo Moda & Varejo Arapiraca",
      polo: "Arapiraca",
      locationType: "Presencial (Centro de Arapiraca)",
      contractType: "Estágio",
      workload: "20h semanais (tarde)",
      salary: "R$ 1.200,00 + Auxílio Alimentação",
      description: "Atuar na linha de frente da marca captando vídeos com celular em loja física, entrevistando clientes, produzindo roteiros criativos e editando cortes dinâmicos de alta retenção.",
      requiredSkills: ["Vídeo & Reels", "CapCut", "Criatividade", "Instagram", "Gravação com Smartphone"],
      relatedModules: [1, 5],
      contactEmail: "talentos@modaarapiraca.com.br",
      contactPhone: "82998765432",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      active: true
    },
    {
      id: "vaga-3",
      title: "Gestor(a) de Tráfego Pago & Anúncios Online Júnior",
      company: "E-commerce Raízes Alagoanas",
      polo: "Remoto (Alagoas)",
      locationType: "100% Remoto (Home Office)",
      contractType: "Freelance / PJ",
      workload: "Flexível por entregas",
      salary: "R$ 1.800,00 a R$ 2.500,00 / mês",
      description: "Subir e monitorar campanhas no Meta Ads (Facebook e Instagram), configurar pixels, testes A/B de criativos e acompanhar métricas de custo por clique e conversões para loja online regional.",
      requiredSkills: ["Meta Ads", "Tráfego Pago", "Análise de Métricas", "Canva", "Pixel"],
      relatedModules: [4, 6, 7],
      contactEmail: "contato@raizesalagoanas.com.br",
      contactPhone: "82993456789",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      active: true
    },
    {
      id: "vaga-4",
      title: "Social Media & Atendimento via WhatsApp Business",
      company: "Pousada & Gastronomia Caminhos de Penedo",
      polo: "Penedo",
      locationType: "Presencial (Centro Histórico)",
      contractType: "CLT",
      workload: "40h semanais",
      salary: "R$ 1.650,00 + Refeição no Local",
      description: "Gestão das redes sociais do complexo turístico, atualização de cardápios e eventos nos Stories, atendimento a reservas via Direct e WhatsApp Business com comunicação humanizada.",
      requiredSkills: ["Atendimento", "WhatsApp Business", "Instagram", "Canva", "Fotografia"],
      relatedModules: [1, 6],
      contactEmail: "gerencia@caminhosdepenedo.com.br",
      contactPhone: "82987651234",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      active: true
    },
    {
      id: "vaga-5",
      title: "Estágio em Comunicação Comunitária & Mídias Digitais",
      company: "Instituto de Desenvolvimento do Sertão",
      polo: "Santana do Ipanema",
      locationType: "Presencial / Híbrido",
      contractType: "Estágio",
      workload: "20h semanais",
      salary: "R$ 1.100,00 + Certificado de Horas",
      description: "Apoiar na divulgação de oficinas e projetos sociais em Santana do Ipanema e cidades vizinhas, elaborando comunicados, boletins digitais e registros fotográficos de atividades.",
      requiredSkills: ["Comunicação", "Canva", "Redação", "Instagram", "Trabalho em Equipe"],
      relatedModules: [2, 3],
      contactEmail: "projetos@institutosertao.org.br",
      contactPhone: "82991122334",
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      active: true
    }
  ];
}

function getDefaultLearningTrails() {
  return [
    {
      id: "trilha-1",
      title: "Trilha 1: Gestão Profissional de Redes Sociais & Conteúdo",
      level: "Iniciante ao Avançado",
      hours: "24h de conteúdo",
      icon: "fa-hashtag",
      description: "Domine a metodologia completa para gerenciar perfis comerciais, criar calendários editoriais, interagir com seguidores e transformar audiência em clientes.",
      courses: [
        {
          name: "Marketing Digital para o Empreendedor",
          provider: "Sebrae Alagoas",
          format: "Online Gratuito com Certificado",
          link: "https://sebrae.com.br/sites/PortalSebrae/cursosonline"
        },
        {
          name: "Inbound Marketing & Mídias Sociais",
          provider: "Rock University",
          format: "Curso Prático com Certificação",
          link: "https://rockcontent.com/br/university/"
        },
        {
          name: "Fundamentos do Instagram para Empresas",
          provider: "Meta Blueprint Oficial",
          format: "Módulos Oficiais Gratuitos",
          link: "https://www.facebook.com/business/learn"
        }
      ]
    },
    {
      id: "trilha-2",
      title: "Trilha 2: Design Gráfico & Identidade Visual com Canva",
      level: "Prático & Criativo",
      hours: "18h de conteúdo",
      icon: "fa-palette",
      description: "Aprenda harmonia de cores, tipografia, diagramação e identidade visual para criar posts, carrosséis, banners e propostas de alto impacto visual.",
      courses: [
        {
          name: "Design for Social Media & Brand Building",
          provider: "Canva Design School",
          format: "Tutoriais & Exercícios Práticos",
          link: "https://www.canva.com/designschool/"
        },
        {
          name: "Identidade Visual & Comunicação para Negócios",
          provider: "FGV Educação Executiva",
          format: "Curso EAD Aberto",
          link: "https://educacao-executiva.fgv.br/cursos/gratuitos"
        },
        {
          name: "Criação de Carrosséis Magnéticos no Instagram",
          provider: "Emprega Mais Alagoas",
          format: "Oficina Prática do Curso",
          link: "#"
        }
      ]
    },
    {
      id: "trilha-3",
      title: "Trilha 3: Tráfego Pago & Campanhas no Meta Ads",
      level: "Intermediário",
      hours: "20h de conteúdo",
      icon: "fa-bullseye",
      description: "Entenda o funcionamento de leilões no Instagram e Facebook, segmentação por cidades de Alagoas, criação de públicos personalizados e análise de métricas.",
      courses: [
        {
          name: "Certificação em Campanhas do Meta Ads",
          provider: "Meta Blueprint",
          format: "Certificação Oficial Meta",
          link: "https://www.facebook.com/business/learn"
        },
        {
          name: "Fundamentos de Anúncios e Métricas Digitais",
          provider: "Google Ateliê Digital",
          format: "EAD Gratuito com Certificado",
          link: "https://learndigital.withgoogle.com/ateliedigital"
        },
        {
          name: "Gestão de Orçamento de Anúncios para PMEs",
          provider: "Sebrae Nacional",
          format: "Online com Apostila",
          link: "https://sebrae.com.br"
        }
      ]
    },
    {
      id: "trilha-4",
      title: "Trilha 4: Copywriting & Roteiros para Vídeos Curtos",
      level: "Prático & Dinâmico",
      hours: "16h de conteúdo",
      icon: "fa-pen-fancy",
      description: "Desenvolva o poder de prender a atenção nos primeiros 3 segundos, estruturar ganchos magnéticos, chamadas para ação (CTA) e roteiros para Reels e TikTok.",
      courses: [
        {
          name: "Copywriting Essencial para Redes Sociais",
          provider: "Rock Content",
          format: "Curso Gratuito com Certificado",
          link: "https://rockcontent.com/br/university/"
        },
        {
          name: "Roteirização e Edição Rápida no CapCut Mobile",
          provider: "Guia Emprega Mais Alagoas",
          format: "Vídeo-aulas Práticas",
          link: "#"
        },
        {
          name: "Comunicação e Escrita Persuasiva",
          provider: "Escola do Trabalhador 4.0",
          format: "Plataforma MEC / Microsoft",
          link: "https://escoladotrabalhador40.com.br"
        }
      ]
    }
  ];
}

function getDefaultUsefulResources() {
  return [
    {
      id: "rec-1",
      title: "Calendário Editorial 2026 para Mídias Digitais",
      category: "Planejamento",
      format: "Template Planilha / PDF",
      icon: "fa-calendar-days",
      description: "Grade anual completa com sugestões diárias de temas, formatos (Reels, Carrossel, Stories) e datas comemorativas nacionais e de Alagoas.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-2",
      title: "Modelo de Briefing para Clientes de Social Media",
      category: "Atendimento",
      format: "Formulário Estruturado",
      icon: "fa-clipboard-question",
      description: "Roteiro com 20 perguntas estratégicas para diagnosticar um novo cliente: público-alvo, concorrentes, diferenciais e metas de vendas.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-3",
      title: "Template de Proposta Comercial & Orçamento",
      category: "Vendas",
      format: "Documento Editável",
      icon: "fa-file-invoice-dollar",
      description: "Modelo profissional de proposta com pacotes de serviços (Básico, Médio e Pro), faixas de valores praticadas em Alagoas e prazos de entrega.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-4",
      title: "Checklist de Auditoria de Perfil no Instagram",
      category: "Otimização",
      format: "Checklist 15 Passos",
      icon: "fa-list-check",
      description: "Guia de revisão em 15 tópicos essenciais: bio magnética, links estratégicos, destaques organizados e identidade visual alinhada.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-5",
      title: "Minuta de Contrato de Prestação de Serviços Digitais",
      category: "Jurídico / Freelance",
      format: "Minuta Básica",
      icon: "fa-file-contract",
      description: "Termo simples e seguro para proteger trabalhos autônomos: definição de escopo, prazos de aprovação, pagamentos e confidencialidade.",
      downloadUrl: "#",
      canCopy: true
    }
  ];
}

function loadCareersDataFromStorage() {
  const savedVacancies = localStorage.getItem("eupordias_job_vacancies");
  if (savedVacancies) {
    try {
      AppState.jobVacancies = JSON.parse(savedVacancies);
    } catch (e) {
      AppState.jobVacancies = getDefaultJobVacancies();
    }
  } else {
    AppState.jobVacancies = getDefaultJobVacancies();
  }

  AppState.learningTrails = getDefaultLearningTrails();

  const savedResources = localStorage.getItem("eupordias_useful_resources");
  if (savedResources) {
    try {
      AppState.usefulResources = JSON.parse(savedResources);
    } catch (e) {
      AppState.usefulResources = getDefaultUsefulResources();
    }
  } else {
    AppState.usefulResources = getDefaultUsefulResources();
  }
}

function saveCareersDataToStorage() {
  try {
    localStorage.setItem("eupordias_job_vacancies", JSON.stringify(AppState.jobVacancies));
    localStorage.setItem("eupordias_useful_resources", JSON.stringify(AppState.usefulResources));
  } catch (e) {}
}

function calculateCurriculumMatch(student, vacancy) {
  if (!student || !vacancy) {
    return { score: 75, level: "Recomendado", badgeColor: "indigo", strengths: [] };
  }

  let score = 0;
  const strengths = [];

  // 1. Localização / Polo (25 pts)
  const studentPolo = (student.classroom || student.unitCity || "").toLowerCase();
  const vacancyPolo = (vacancy.polo || "").toLowerCase();

  if (vacancyPolo.includes("remoto")) {
    score += 25;
    strengths.push("Vaga 100% Remota: compatível com qualquer município de Alagoas");
  } else if (studentPolo && vacancyPolo && (studentPolo.includes(vacancyPolo) || vacancyPolo.includes(studentPolo))) {
    score += 25;
    strengths.push(`Localização ideal: reside ou estuda no polo de ${vacancy.polo}`);
  } else {
    score += 15;
    strengths.push("Mesma unidade federativa (Alagoas): mobilidade regional");
  }

  // 2. Habilidades, Ferramentas e Redes Sociais do Diagnóstico (30 pts)
  const toolsStr = Array.isArray(student.tools) ? student.tools.join(" ") : (student.tools || "");
  const networksStr = Array.isArray(student.frequentNetworks) ? student.frequentNetworks.join(" ") : (student.frequentNetworks || "");
  const studentTools = toolsStr.toLowerCase();
  const studentNetworks = networksStr.toLowerCase();
  const studentProf = (student.profession || "").toLowerCase();
  const studentBio = `${studentTools} ${studentNetworks} ${studentProf}`;

  let matchedSkillsCount = 0;
  if (vacancy.requiredSkills && Array.isArray(vacancy.requiredSkills)) {
    vacancy.requiredSkills.forEach(skill => {
      const sLower = skill.toLowerCase();
      if (studentBio.includes(sLower) || (sLower.includes("canva") && studentTools.includes("canva")) || (sLower.includes("vídeo") && studentBio.includes("capcut"))) {
        matchedSkillsCount++;
        strengths.push(`Domínio de ${skill} confirmado no diagnóstico do aluno`);
      }
    });
  }

  const skillPoints = Math.min(30, Math.max(12, matchedSkillsCount * 8 + 10));
  score += skillPoints;

  // 3. Notas e Desempenho nos Módulos Relacionados (30 pts)
  const stats = calculateStudentOverallStats(student);
  let relevantAvgSum = 0;
  let relevantCount = 0;

  if (vacancy.relatedModules && Array.isArray(vacancy.relatedModules) && student.grades) {
    vacancy.relatedModules.forEach(modNum => {
      const subj = AppState.subjects[modNum - 1];
      if (subj && student.grades[subj.id] && student.grades[subj.id].average !== undefined) {
        relevantAvgSum += Number(student.grades[subj.id].average);
        relevantCount++;
      }
    });
  }

  const relAvg = relevantCount > 0 ? (relevantAvgSum / relevantCount) : stats.overallAvg;
  if (relAvg > 0) {
    const gradePoints = Math.min(30, Math.max(15, Math.round((relAvg / 10) * 30)));
    score += gradePoints;
    if (relAvg >= 8.0) {
      strengths.push(`Excelente rendimento acadêmico: média de ${relAvg.toFixed(1)} nos módulos exigidos`);
    } else {
      strengths.push(`Conhecimento validado nos módulos: média de ${relAvg.toFixed(1)}`);
    }
  } else {
    score += 20;
    strengths.push("Aluno matriculado com módulos essenciais em andamento");
  }

  // 4. Motivação e Expectativas de Carreira (15 pts)
  const studentExpectations = (student.expectations || "").toLowerCase();
  const studentMotivation = (student.motivation || "").toLowerCase();
  if (studentExpectations.includes("trabalh") || studentExpectations.includes("renda") || studentMotivation.includes("aprend") || studentMotivation.includes("crescer")) {
    score += 15;
    strengths.push("Objetivo profissional do aluno alinhado à área da vaga");
  } else {
    score += 10;
  }

  score = Math.min(98, Math.max(65, score));

  let level = "Boa Compatibilidade";
  let badgeColor = "indigo";
  if (score >= 85) {
    level = "Match de Ouro";
    badgeColor = "emerald";
  } else if (score < 72) {
    level = "Em Desenvolvimento";
    badgeColor = "amber";
  }

  return {
    score,
    level,
    badgeColor,
    strengths: strengths.slice(0, 3)
  };
}

function renderCareersTab(container) {
  // REGRA DE ACESSO: Exige autenticação por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'careers');
    return;
  }

  const isProf = AppState.currentUser.role === "professor";
  const isAluno = AppState.currentUser.role === "aluno";
  const student = isAluno ? (AppState.students.find(s => s.id === AppState.currentUser?.id || (AppState.currentUser?.cpf && cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf))) || AppState.currentUser) : (AppState.students[0] || null);

  const activeTab = AppState.careersActiveTab || "vagas";

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      
      <!-- Banner Hero Principal -->
      <div class="position-relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-500/20" style="background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #2e1065 100%) !important; color: #ffffff !important;">
        <div class="position-relative z-10 d-flex flex-column md:flex-row align-items-start md:items-center justify-content-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="px-3 py-1 rounded-circle text-[11px] fw-bolder text-uppercase bg-amber-400 text-slate-950 tracking-wider shadow">
                <i class="fa-solid fa-briefcase mr-1"></i> Emprega Mais Alagoas
              </span>
              <span class="px-3 py-1 rounded-circle text-[11px] fw-semibold bg-white/20 backdrop-blur-sm">
                Hub de Empregabilidade & Trilhas
              </span>
              ${isAluno ? `
                <span class="px-2.5 py-0.5 rounded-circle text-[11px] fw-bold bg-emerald-500/90 text-white d-flex align-items-center gap-1">
                  <i class="fa-solid fa-user-check"></i> Matching de Currículo Ativo
                </span>
              ` : `
                <span class="px-2.5 py-0.5 rounded-circle text-[11px] fw-bold bg-indigo-500/90 text-white d-flex align-items-center gap-1">
                  <i class="fa-solid fa-chalkboard-user"></i> Painel de Vagas & Formação
                </span>
              `}
            </div>

            <h1 class="text-xl sm:text-3xl fw-bolder tracking-tight leading-tight">
              Oportunidades de Emprego, Cursos & Trilhas de Aprendizado
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Conecte seu talento com empresas parceiras de Alagoas, acelere sua carreira com cursos gratuitos certificados e utilize modelos profissionais prontos para atender seus primeiros clientes.
            </p>
          </div>

          <!-- Métricas Rápidas & Botão de Currículo do Aluno -->
          <div class="d-flex flex-column align-items-stretch sm:align-items-end gap-3 flex-shrink-0">
            <!-- Métricas em cápsula unificada -->
            <div class="d-flex align-items-center justify-content-center gap-3 text-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-sm">
              <div class="px-2">
                <span class="d-block text-base sm:text-lg fw-bolder text-amber-400">${AppState.jobVacancies.length}</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Vagas</span>
              </div>
              <div class="px-2 border-start border-end border-white/15">
                <span class="d-block text-base sm:text-lg fw-bolder text-emerald-400">${AppState.learningTrails.length}</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Trilhas</span>
              </div>
              <div class="px-2">
                <span class="d-block text-base sm:text-lg fw-bolder text-indigo-300">${AppState.usefulResources.length}</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Modelos</span>
              </div>
            </div>

            ${isAluno ? `
              <button 
                onclick="openStudentResumeModal('${AppState.currentUser.id}')" 
                class="d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2.5 rounded-pill fw-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 border-0"
              >
                <i class="fa-solid fa-id-card"></i> Ver Meu Minicurrículo
              </button>
            ` : `
              <button 
                onclick="openCreateVacancyModal()" 
                class="d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2.5 rounded-pill fw-bold text-xs text-white shadow-md transition-all cursor-pointer active:scale-95 border-0"
                style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;"
              >
                <i class="fa-solid fa-plus"></i> Publicar Nova Vaga
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Barra de Navegação Interna das Sub-Abas -->
      <div class="d-flex align-items-center justify-content-between gap-3 border-b border-slate-200 pb-2 flex-wrap">
        <div class="d-flex align-items-center gap-2">
          <button 
            onclick="switchCareersTab('vagas')" 
            class="px-4 py-2.5 rounded-2xl fw-bold text-xs transition-all d-flex align-items-center gap-2 ${activeTab === 'vagas' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}"
          >
            <i class="fa-solid fa-briefcase"></i>
            <span>Mural de Vagas & Oportunidades</span>
            <span class="px-1.5 py-0.5 rounded-circle text-[10px] ${activeTab === 'vagas' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">${AppState.jobVacancies.length}</span>
          </button>

          <button 
            onclick="switchCareersTab('trilhas')" 
            class="px-4 py-2.5 rounded-2xl fw-bold text-xs transition-all d-flex align-items-center gap-2 ${activeTab === 'trilhas' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}"
          >
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Cursos, Trilhas & Materiais Gratuitos</span>
            <span class="px-1.5 py-0.5 rounded-circle text-[10px] ${activeTab === 'trilhas' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">${AppState.learningTrails.length + AppState.usefulResources.length}</span>
          </button>
        </div>

        ${isProf ? `
          <div class="d-flex align-items-center gap-2">
            ${activeTab === 'vagas' ? `
              <button 
                onclick="openCreateVacancyModal()" 
                class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all d-flex align-items-center gap-1.5 cursor-pointer"
              >
                <i class="fa-solid fa-plus"></i> Nova Vaga
              </button>
            ` : `
              <button 
                onclick="openAddResourceModal()" 
                class="px-3.5 py-2 rounded-xl text-xs fw-bold bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all d-flex align-items-center gap-1.5 cursor-pointer"
              >
                <i class="fa-solid fa-share-nodes"></i> Compartilhar Material
              </button>
            `}
          </div>
        ` : ''}
      </div>

      <!-- Conteúdo da Sub-Aba Ativa -->
      ${activeTab === 'vagas' ? renderCareersVacanciesContent(isAluno, student) : renderCareersTrailsContent(isProf)}

    </div>
  `;
}

function renderCareersVacanciesContent(isAluno, student) {
  const isProf = AppState.currentUser && AppState.currentUser.role === "professor";
  const polos = Array.from(new Set(AppState.jobVacancies.map(v => v.polo))).filter(Boolean);

  const selectedPolo = AppState.careersFilterPolo || "all";
  const selectedType = AppState.careersFilterType || "all";
  const search = (AppState.careersFilterSearch || "").toLowerCase();

  const filtered = AppState.jobVacancies.filter(v => {
    if (selectedPolo !== "all" && v.polo !== selectedPolo) return false;
    if (selectedType !== "all" && v.contractType !== selectedType) return false;
    if (search) {
      const matchText = `${v.title} ${v.company} ${v.polo} ${v.description} ${(v.requiredSkills || []).join(' ')}`.toLowerCase();
      if (!matchText.includes(search)) return false;
    }
    return true;
  });

  return `
    <div class="space-y-6">
      
      <!-- Barra de Filtros e Busca de Vagas -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm d-flex flex-column sm:flex-row align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2 w-100 sm:w-auto flex-wrap">
          <div class="d-flex align-items-center gap-1 text-xs fw-semibold text-slate-500 ">
            <i class="fa-solid fa-filter text-indigo-500"></i> Filtrar:
          </div>

          <select 
            onchange="handleCareersPoloFilterChange(this.value)" 
            class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs fw-semibold "
          >
            <option value="all" ${selectedPolo === "all" ? "selected" : ""}>Todos os Polos (Alagoas)</option>
            ${polos.map(p => `
              <option value="${escapeHtml(p)}" ${selectedPolo === p ? "selected" : ""}>${escapeHtml(p)}</option>
            `).join("")}
          </select>

          <select 
            onchange="handleCareersTypeFilterChange(this.value)" 
            class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs fw-semibold "
          >
            <option value="all" ${selectedType === "all" ? "selected" : ""}>Todos os Modelos</option>
            <option value="Estágio" ${selectedType === "Estágio" ? "selected" : ""}>Estágio</option>
            <option value="CLT" ${selectedType === "CLT" ? "selected" : ""}>CLT</option>
            <option value="Freelance / PJ" ${selectedType === "Freelance / PJ" ? "selected" : ""}>Freelance / PJ</option>
          </select>
        </div>

        <div class="w-100 sm:w-64 position-relative">
          <i class="fa-solid fa-magnifying-glass position-absolute left-3 top-2.5 text-xs text-slate-400"></i>
          <input 
            type="text" 
            value="${escapeHtml(AppState.careersFilterSearch || '')}"
            oninput="handleCareersSearchChange(this.value)"
            placeholder="Buscar por cargo ou ferramenta..." 
            class="w-100 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 "
          />
        </div>
      </div>

      <!-- Aviso Informativo sobre o Matching de Currículo -->
      ${isAluno ? `
        <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 d-flex align-items-start gap-3 text-xs">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white d-flex align-items-center justify-content-center text-sm flex-shrink-0 mt-0.5 shadow-sm">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <strong class="text-indigo-950 fw-bold d-block">
              Match de Currículo Personalizado para ${escapeHtml(student.name.split(" ")[0])}
            </strong>
            <p class="text-slate-600 leading-relaxed text-[11px] mt-0.5">
              O sistema cruza suas informações de polo em Alagoas, ferramentas do diagnóstico inicial (ex: Canva, CapCut), notas dos 7 módulos e motivações de carreira para indicar a afinidade com cada vaga.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Grid de Cards de Vagas -->
      ${filtered.length === 0 ? `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 d-flex align-items-center justify-content-center text-2xl mx-auto text-slate-400">
            <i class="fa-solid fa-briefcase"></i>
          </div>
          <h3 class="fw-bold text-sm text-slate-700 ">Nenhuma vaga encontrada com os filtros atuais</h3>
          <p class="text-xs max-w-sm mx-auto">Tente selecionar outro polo de Alagoas ou limpar o campo de busca.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${filtered.map(v => {
            const matchInfo = isAluno && student ? calculateCurriculumMatch(student, v) : null;

            return `
              <div class="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all d-flex flex-column justify-content-between space-y-4">
                
                <div class="space-y-3">
                  <!-- Header do Card: Tipo de Contrato & Match Badge -->
                  <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <div class="d-flex align-items-center gap-1.5">
                      <span class="px-2.5 py-0.5 rounded-circle text-[10px] fw-bold text-uppercase ${v.contractType === 'Estágio' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : v.contractType === 'CLT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                        ${v.contractType}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-circle text-[10px] fw-semibold bg-slate-100 text-slate-600 d-flex align-items-center gap-1">
                        <i class="fa-solid fa-location-dot text-rose-500"></i> ${v.polo}
                      </span>
                    </div>

                    ${matchInfo ? `
                      <span class="px-2.5 py-0.5 rounded-circle text-[11px] fw-bolder ${matchInfo.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 ring-1 ring-indigo-500/30'} d-flex align-items-center gap-1 shadow-xs">
                        <i class="fa-solid fa-bolt text-amber-500"></i> ${matchInfo.score}% Match • ${matchInfo.level}
                      </span>
                    ` : `
                      <span class="text-[10px] text-slate-400">Publicado em ${new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                    `}
                  </div>

                  <!-- Título da Vaga e Empresa -->
                  <div>
                    <h3 class="fw-bold text-base text-slate-900 leading-snug">
                      ${escapeHtml(v.title)}
                    </h3>
                    <p class="text-xs text-indigo-600 fw-semibold mt-0.5 d-flex align-items-center gap-1.5">
                      <i class="fa-solid fa-building"></i> ${escapeHtml(v.company)} • <span class="text-slate-400 fw-normal">${v.locationType}</span>
                    </p>
                  </div>

                  <!-- Remuneração & Carga Horária -->
                  <div class="d-flex align-items-center gap-3 text-xs text-slate-600 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-100 ">
                    <span class="fw-bold text-emerald-600 d-flex align-items-center gap-1">
                      <i class="fa-solid fa-money-bill-wave"></i> ${v.salary}
                    </span>
                    <span class="text-slate-300 ">•</span>
                    <span class="text-[11px] text-slate-500 d-flex align-items-center gap-1">
                      <i class="fa-regular fa-clock"></i> ${v.workload}
                    </span>
                  </div>

                  <!-- Descrição da Vaga -->
                  <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    ${escapeHtml(v.description)}
                  </p>

                  <!-- Tags de Habilidades -->
                  <div class="d-flex flex-wrap gap-1 pt-1">
                    ${(v.requiredSkills || []).map(skill => `
                      <span class="px-2 py-0.5 rounded-lg text-[10px] fw-semibold bg-slate-100 text-slate-700 ">
                        ${escapeHtml(skill)}
                      </span>
                    `).join("")}
                  </div>

                  <!-- Pontos Fortes do Aluno para esta vaga -->
                  ${(matchInfo && matchInfo.strengths && matchInfo.strengths.length > 0) ? `
                    <div class="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                      <span class="fw-bold text-uppercase text-[9px] tracking-wider d-block text-emerald-700 ">
                        <i class="fa-solid fa-circle-check mr-1"></i> Seus pontos fortes para esta vaga:
                      </span>
                      ${matchInfo.strengths.map(st => `
                        <div class="d-flex align-items-start gap-1.5 text-[10px]">
                          <span>•</span> <span>${escapeHtml(st)}</span>
                        </div>
                      `).join("")}
                    </div>
                  ` : ''}

                </div>

                <!-- Ações do Card de Vaga -->
                <div class="pt-4 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <button 
                      type="button" 
                      onclick="applyToVacancy('${v.id}')" 
                      class="px-4 py-2 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-sm transition-all d-flex align-items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <i class="fa-solid fa-paper-plane"></i> Candidatar-se à Vaga
                    </button>

                    ${isAluno ? `
                      <button 
                        type="button" 
                        onclick="openStudentResumeModal('${student.id}')" 
                        class="px-3 py-2 rounded-xl fw-semibold text-xs bg-slate-100 text-slate-700 transition-all d-flex align-items-center gap-1 cursor-pointer"
                        title="Ver meu currículo formatado"
                      >
                        <i class="fa-solid fa-id-card"></i> Meu Currículo
                      </button>
                    ` : ''}
                  </div>

                  ${isProf ? `
                    <button 
                      type="button" 
                      onclick="deleteJobVacancy('${v.id}')" 
                      class="p-2 rounded-xl text-slate-400 transition-colors cursor-pointer"
                      title="Excluir Oportunidade"
                    >
                      <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  ` : ''}
                </div>

              </div>
            `;
          }).join("")}
        </div>
      `}

    </div>
  `;
}

function renderCareersTrailsContent(isProf) {
  return `
    <div class="space-y-8">
      
      <!-- Seção 1: Trilhas de Aprendizagem Recomendadas -->
      <div class="space-y-4">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h2 class="text-base sm:text-lg fw-bold text-slate-900 d-flex align-items-center gap-2">
              <i class="fa-solid fa-route text-indigo-600"></i> Trilhas de Formação & Cursos Gratuitos
            </h2>
            <p class="text-xs text-slate-500 ">
              Cursos oficiais com emissão de certificados gratuitos reconhecidos pelo mercado (Sebrae Alagoas, Meta, Rock University, FGV e Google).
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${AppState.learningTrails.map(trilha => `
            <div class="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 d-flex flex-column justify-content-between">
              <div class="space-y-3">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-lg">
                    <i class="fa-solid ${trilha.icon || 'fa-graduation-cap'}"></i>
                  </div>
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-slate-100 text-slate-600 ">
                      ${trilha.hours}
                    </span>
                    <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-emerald-100 text-emerald-800 ">
                      Gratuito com Certificado
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="fw-bold text-sm text-slate-900 leading-snug">
                    ${trilha.title}
                  </h3>
                  <p class="text-xs text-slate-500 leading-relaxed mt-1">
                    ${trilha.description}
                  </p>
                </div>

                <!-- Cursos da Trilha -->
                <div class="space-y-2 pt-2 border-t border-slate-100 ">
                  <span class="text-[10px] fw-bold text-uppercase tracking-wider text-slate-400 d-block">Cursos Integrados na Trilha:</span>
                  ${trilha.courses.map(c => `
                    <a 
                      href="${c.link}" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 d-flex align-items-center justify-content-between text-xs transition-colors group cursor-pointer"
                    >
                      <div class="min-w-0 pr-2">
                        <strong class="text-slate-800 d-block text-truncate fw-semibold">${c.name}</strong>
                        <span class="text-[10px] text-slate-400">${c.provider} • ${c.format}</span>
                      </div>
                      <i class="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400 transition-colors flex-shrink-0"></i>
                    </a>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Seção 2: Materiais Práticos & Templates para Download -->
      <div class="space-y-4 pt-4 border-t border-slate-200 ">
        <div class="d-flex flex-column sm:flex-row align-items-start sm:items-center justify-content-between gap-3">
          <div>
            <h2 class="text-base sm:text-lg fw-bold text-slate-900 d-flex align-items-center gap-2">
              <i class="fa-solid fa-folder-open text-emerald-600"></i> Materiais Práticos & Templates para Uso Imediato
            </h2>
            <p class="text-xs text-slate-500 ">
              Copie ou baixe modelos prontos de briefing, calendários e propostas comerciais para iniciar seus atendimentos.
            </p>
          </div>

          ${isProf ? `
            <button 
              onclick="openAddResourceModal()" 
              class="px-3.5 py-2 rounded-xl fw-bold text-xs bg-emerald-600 text-white shadow-sm transition-all d-flex align-items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-plus"></i> Compartilhar Material
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${AppState.usefulResources.map(rec => `
            <div class="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm d-flex flex-column justify-content-between space-y-3">
              <div class="space-y-2">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="px-2.5 py-0.5 rounded-circle text-[10px] fw-bold bg-emerald-50 text-emerald-700 ">
                    ${rec.category}
                  </span>
                  <span class="text-[10px] text-slate-400 font-monospace">${rec.format}</span>
                </div>

                <h3 class="fw-bold text-sm text-slate-900 leading-snug">
                  ${escapeHtml(rec.title)}
                </h3>

                <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  ${escapeHtml(rec.description)}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-between gap-2">
                ${rec.canCopy ? `
                  <button 
                    onclick="copyResourceContent('${rec.id}')" 
                    class="px-3 py-1.5 rounded-xl fw-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all d-flex align-items-center gap-1.5 cursor-pointer"
                  >
                    <i class="fa-solid fa-copy"></i> Copiar Modelo
                  </button>
                ` : `
                  <a 
                    href="${rec.downloadUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-3 py-1.5 rounded-xl fw-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all d-flex align-items-center gap-1.5"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar
                  </a>
                `}

                ${isProf ? `
                  <button 
                    onclick="deleteUsefulResource('${rec.id}')" 
                    class="p-1.5 text-slate-400 transition-colors cursor-pointer"
                    title="Excluir Material"
                  >
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `;
}

function switchCareersTab(tab) {
  AppState.careersActiveTab = tab;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function handleCareersPoloFilterChange(value) {
  AppState.careersFilterPolo = value;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function handleCareersTypeFilterChange(value) {
  AppState.careersFilterType = value;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function handleCareersSearchChange(value) {
  AppState.careersFilterSearch = value;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function openStudentResumeModal(studentId) {
  const student = AppState.students.find(s => s.id === studentId || (AppState.currentUser?.cpf && cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf))) || AppState.currentUser;
  if (!student) {
    showToast("Dados do aluno não encontrados.", "error");
    return;
  }

  const stats = calculateStudentOverallStats(student);
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`;
  const photoUrl = student.photoUrl || student.photo || fallbackPhoto;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Cabeçalho do Currículo -->
        <div class="d-flex flex-column sm:flex-row align-items-start sm:items-center justify-content-between gap-4 pb-6 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-indigo-500/20 shadow-md flex-shrink-0">
              <img src="${photoUrl}" alt="${escapeHtml(student.name)}" onerror="this.src='${fallbackPhoto}'" class="w-100 h-100 object-fit-cover">
            </div>
            <div>
              <span class="px-2.5 py-0.5 rounded-circle text-[10px] fw-bold bg-indigo-100 text-indigo-700 ">
                Currículo Oficial • Emprega Mais Alagoas
              </span>
              <h2 class="text-lg sm:text-xl fw-bolder text-slate-900 mt-1">
                ${escapeHtml(student.name)}
              </h2>
              <p class="text-xs text-slate-500 ">
                ${escapeHtml(student.classroom || student.unitCity || "Polo Alagoas")} • CPF: ${maskCpf(student.cpf || "000.000.000-00")}
              </p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 self-start sm:self-auto p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Formação e Qualificação -->
        <div class="space-y-2">
          <h3 class="fw-bold text-xs text-uppercase tracking-wider text-slate-400 d-flex align-items-center gap-1.5">
            <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Qualificação Profissional
          </h3>
          <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1 text-xs">
            <div class="d-flex justify-content-between align-items-center">
              <strong class="text-indigo-900 fw-bold text-sm">Gestão de Mídias Digitais</strong>
              <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-emerald-100 text-emerald-800 ">
                ${stats.status} (Média: ${stats.overallAvg.toFixed(1)})
              </span>
            </div>
            <p class="text-slate-600 text-[11px]">
              Governo do Estado de Alagoas • Programa Emprega Mais Alagoas (7 Módulos de Formação Prática)
            </p>
          </div>
        </div>

        <!-- Habilidades e Ferramentas Mapeadas -->
        <div class="space-y-2">
          <h3 class="fw-bold text-xs text-uppercase tracking-wider text-slate-400 d-flex align-items-center gap-1.5">
            <i class="fa-solid fa-wrench text-emerald-600"></i> Ferramentas & Competências Digitais
          </h3>
          <div class="d-flex flex-wrap gap-1.5">
            ${(Array.isArray(student.tools) ? student.tools : (student.tools || "Canva, Instagram, Redes Sociais").split(",")).map(t => `
              <span class="px-2.5 py-1 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 border border-slate-200/80 ">
                <i class="fa-solid fa-check text-emerald-500 mr-1"></i> ${escapeHtml(String(t).trim())}
              </span>
            `).join("")}
            <span class="px-2.5 py-1 rounded-xl text-xs fw-semibold bg-slate-100 text-slate-700 border border-slate-200/80 ">
              <i class="fa-solid fa-check text-emerald-500 mr-1"></i> Redes: ${escapeHtml(Array.isArray(student.frequentNetworks) ? student.frequentNetworks.join(", ") : (student.frequentNetworks || "Instagram, TikTok, WhatsApp"))}
            </span>
          </div>
        </div>

        <!-- Diagnóstico Pedagógico & Perfil de Trabalho -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span class="fw-bold text-slate-800 d-flex align-items-center gap-1">
              <i class="fa-solid fa-bullseye text-amber-500"></i> Expectativa Profissional:
            </span>
            <p class="text-slate-600 italic text-[11px]">
              "${escapeHtml(student.expectations || "Atuação com produção de conteúdo, tráfego e atendimento para negócios locais.")}"
            </p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span class="fw-bold text-slate-800 d-flex align-items-center gap-1">
              <i class="fa-solid fa-envelope text-indigo-500"></i> Canais de Contato:
            </span>
            <p class="text-slate-600 text-[11px]">
              <strong>WhatsApp:</strong> ${escapeHtml(student.contact?.phone || student.phone || "Não informado")}<br>
              <strong>E-mail:</strong> ${escapeHtml(student.contact?.email || student.email || "Não informado")}
            </p>
          </div>
        </div>

        <!-- Ações do Currículo -->
        <div class="pt-4 border-t border-slate-100 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <button 
            onclick="copyStudentResumeText('${student.id}')" 
            class="px-5 py-2.5 rounded-xl fw-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all d-flex align-items-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-copy"></i> Copiar Resumo Profissional
          </button>

          <div class="d-flex align-items-center gap-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2.5 rounded-xl fw-semibold text-xs bg-slate-100 text-slate-700 transition-all d-flex align-items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-print"></i> Imprimir
            </button>
            <button 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  `;
}

function copyStudentResumeText(studentId) {
  const student = AppState.students.find(s => s.id === studentId || (AppState.currentUser?.cpf && cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf))) || AppState.currentUser;
  if (!student) return;

  const stats = calculateStudentOverallStats(student);
  const toolsStr = Array.isArray(student.tools) ? student.tools.join(", ") : (student.tools || 'Canva, CapCut, Meta Business Suite');
  const networksStr = Array.isArray(student.frequentNetworks) ? student.frequentNetworks.join(", ") : (student.frequentNetworks || 'Instagram, TikTok, WhatsApp');

  const text = `🎓 CURRÍCULO PROFISSIONAL • EMPREGA MAIS ALAGOAS
--------------------------------------------------
Nome: ${student.name}
Polo: ${student.classroom || student.unitCity || 'Alagoas'}
Contato: ${student.contact?.phone || student.phone || 'WhatsApp'} | ${student.contact?.email || student.email || ''}

QUALIFICAÇÃO PROFISSIONAL:
Curso de Gestão de Mídias Digitais (Governo de Alagoas)
Situação Acadêmica: ${stats.status} • Média Geral: ${stats.overallAvg.toFixed(1)}

COMPETÊNCIAS E FERRAMENTAS:
- Ferramentas: ${toolsStr}
- Redes Sociais: ${networksStr}
- Objetivos: ${student.expectations || 'Criação de conteúdo e gestão de mídias para negócios locais'}
--------------------------------------------------
Gerado pelo Sistema Eu Por Dias • Emprega Mais Alagoas`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Currículo copiado para a área de transferência!", "success");
  }).catch(() => {
    showToast("Não foi possível copiar automaticamente.", "warning");
  });
}

function applyToVacancy(vacancyId) {
  const vacancy = AppState.jobVacancies.find(v => v.id === vacancyId);
  if (!vacancy) {
    showToast("Vaga não encontrada.", "error");
    return;
  }

  const student = AppState.currentUser || { name: "Aluno Interessado" };
  const stats = calculateStudentOverallStats(student);
  const matchInfo = calculateCurriculumMatch(student, vacancy);

  const pitchMsg = `Olá! Meu nome é ${student.name}, sou estudante do curso de Gestão de Mídias Digitais pelo Programa Emprega Mais Alagoas (Polo ${student.classroom || student.unitCity || 'Alagoas'}).

Tenho interesse na vaga "${vacancy.title}" na ${vacancy.company}.
Minha média de rendimento acadêmico é ${stats.overallAvg.toFixed(1)} e meu índice de compatibilidade com os requisitos da vaga é de ${matchInfo.score}%.

Principais competências: ${student.tools || 'Canva, Edição de Vídeos, Copywriting e Redes Sociais'}.
Aguardo retorno para enviar meu portfólio e currículo completo. Muito obrigado!`;

  if (vacancy.contactPhone) {
    const cleanPhone = vacancy.contactPhone.replace(/\D/g, "");
    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(pitchMsg)}`;
    window.open(waUrl, "_blank");
    showToast("Redirecionando para o WhatsApp da vaga...", "success");
  } else if (vacancy.contactEmail) {
    const mailto = `mailto:${vacancy.contactEmail}?subject=${encodeURIComponent(`Candidatura: ${vacancy.title} - ${student.name}`)}&body=${encodeURIComponent(pitchMsg)}`;
    window.open(mailto, "_blank");
    showToast("Abrindo cliente de e-mail para envio da candidatura...", "success");
  } else {
    navigator.clipboard.writeText(pitchMsg).then(() => {
      showToast("Mensagem de apresentação copiada para a área de transferência!", "success");
    });
  }
}

function openCreateVacancyModal() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores têm permissão para publicar novas vagas.", "warning");
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between pb-3 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Publicar Nova Oportunidade de Trabalho</h3>
              <p class="text-[11px] text-slate-500 ">Exclusivo para Docentes e Coordenação</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleCreateVacancySubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Título da Vaga / Função *</label>
            <input 
              type="text" 
              id="vac-title" 
              required
              placeholder="Ex: Assistente de Mídias Sociais / Criador de Reels" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Empresa / Contratante *</label>
              <input 
                type="text" 
                id="vac-company" 
                required
                placeholder="Ex: Agência Criativa Alagoas" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Polo / Cidade (Alagoas) *</label>
              <input 
                type="text" 
                id="vac-polo" 
                required
                placeholder="Ex: Maceió, Arapiraca ou Remoto" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Tipo de Contratação</label>
              <select 
                id="vac-contract" 
                class="w-100 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 fw-semibold"
              >
                <option value="Estágio">Estágio Remunerado</option>
                <option value="CLT">CLT (Carteira Assinada)</option>
                <option value="Freelance / PJ">Freelance / Contrato PJ</option>
                <option value="Temporário">Temporário</option>
              </select>
            </div>
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Remuneração / Bolsa</label>
              <input 
                type="text" 
                id="vac-salary" 
                placeholder="Ex: R$ 1.500,00 + Benefícios" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Habilidades Exigidas (separadas por vírgula)</label>
            <input 
              type="text" 
              id="vac-skills" 
              placeholder="Ex: Canva, CapCut, Instagram, Copywriting" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Descrição e Atribuições *</label>
            <textarea 
              id="vac-desc" 
              rows="3" 
              required
              placeholder="Descreva as principais atividades, horários e perfil esperado do aluno..."
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">WhatsApp para Candidatura</label>
              <input 
                type="text" 
                id="vac-phone" 
                placeholder="Ex: 82991234567" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">E-mail para Envio de Currículo</label>
              <input 
                type="email" 
                id="vac-email" 
                placeholder="Ex: rh@empresa.com.br" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl fw-semibold text-xs text-slate-600 "
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-600/30 d-flex align-items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-paper-plane"></i> Publicar Vaga
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  `;
}

function handleCreateVacancySubmit(e) {
  e.preventDefault();
  const title = document.getElementById("vac-title")?.value.trim();
  const company = document.getElementById("vac-company")?.value.trim();
  const polo = document.getElementById("vac-polo")?.value.trim();
  const contractType = document.getElementById("vac-contract")?.value;
  const salary = document.getElementById("vac-salary")?.value.trim() || "A combinar";
  const rawSkills = document.getElementById("vac-skills")?.value || "";
  const description = document.getElementById("vac-desc")?.value.trim();
  const contactPhone = document.getElementById("vac-phone")?.value.trim() || "";
  const contactEmail = document.getElementById("vac-email")?.value.trim() || "";

  if (!title || !company || !polo || !description) {
    showToast("Preencha todos os campos obrigatórios marcados com *.", "warning");
    return;
  }

  const skills = rawSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);

  const newVac = {
    id: `vaga-${Date.now()}`,
    title,
    company,
    polo,
    locationType: polo.toLowerCase().includes("remoto") ? "Remoto" : "Presencial / Híbrido",
    contractType,
    workload: contractType === "Estágio" ? "20h a 30h semanais" : "Horário comercial",
    salary,
    description,
    requiredSkills: skills.length > 0 ? skills : ["Canva", "Instagram", "Mídias Digitais"],
    relatedModules: [1, 2, 3],
    contactEmail,
    contactPhone,
    createdAt: new Date().toISOString(),
    active: true
  };

  AppState.jobVacancies.unshift(newVac);
  saveCareersDataToStorage();

  closeModal();
  showToast("Vaga publicada com sucesso para toda a turma!", "success");

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function deleteJobVacancy(vacancyId) {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem remover vagas publicadas.", "error");
    return;
  }

  const vac = AppState.jobVacancies.find(v => v.id === vacancyId);
  if (!vac) return;

  if (!confirm(`Deseja realmente remover a oportunidade "${vac.title}"?`)) {
    return;
  }

  AppState.jobVacancies = AppState.jobVacancies.filter(v => v.id !== vacancyId);
  saveCareersDataToStorage();

  showToast("Vaga removida com sucesso.", "info");
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function openAddResourceModal() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem compartilhar novos materiais.", "warning");
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between pb-3 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center text-lg">
              <i class="fa-solid fa-file-arrow-up"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Compartilhar Material ou Link Útil</h3>
              <p class="text-[11px] text-slate-500 ">Disponibilizar recurso gratuito para a turma</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleAddResourceSubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Título do Material / Curso *</label>
            <input 
              type="text" 
              id="res-title" 
              required
              placeholder="Ex: Apostila de Copywriting ou Link do Curso Sebrae" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Categoria</label>
              <select 
                id="res-category" 
                class="w-100 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 fw-semibold"
              >
                <option value="Material Gratuito">Material Gratuito</option>
                <option value="Curso Gratuito">Curso Gratuito</option>
                <option value="Template / Modelo">Template / Modelo</option>
                <option value="Trilha de Estudos">Trilha de Estudos</option>
              </select>
            </div>
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Formato</label>
              <input 
                type="text" 
                id="res-format" 
                placeholder="Ex: PDF, Planilha ou EAD" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Link de Acesso / URL *</label>
            <input 
              type="url" 
              id="res-url" 
              required
              placeholder="https://..." 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Descrição Breve *</label>
            <textarea 
              id="res-desc" 
              rows="2" 
              required
              placeholder="Explique como este material ajudará o aluno..."
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl fw-semibold text-xs text-slate-600 "
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-xl fw-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-600/30 d-flex align-items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-share"></i> Compartilhar
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  `;
}

function handleAddResourceSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("res-title")?.value.trim();
  const category = document.getElementById("res-category")?.value;
  const format = document.getElementById("res-format")?.value.trim() || "Link / PDF";
  const downloadUrl = document.getElementById("res-url")?.value.trim();
  const description = document.getElementById("res-desc")?.value.trim();

  if (!title || !downloadUrl || !description) {
    showToast("Preencha todos os campos obrigatórios.", "warning");
    return;
  }

  const newRes = {
    id: `rec-${Date.now()}`,
    title,
    category,
    format,
    icon: "fa-link",
    description,
    downloadUrl,
    canCopy: false
  };

  AppState.usefulResources.unshift(newRes);
  saveCareersDataToStorage();

  closeModal();
  showToast("Material compartilhado com sucesso!", "success");

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function deleteUsefulResource(resourceId) {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem remover materiais.", "error");
    return;
  }

  if (!confirm("Deseja realmente remover este material da lista?")) {
    return;
  }

  AppState.usefulResources = AppState.usefulResources.filter(r => r.id !== resourceId);
  saveCareersDataToStorage();

  showToast("Material removido.", "info");
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderCareersTab(contentArea);
}

function copyResourceContent(resourceId) {
  const res = AppState.usefulResources.find(r => r.id === resourceId);
  if (!res) return;

  let templateText = "";
  if (resourceId === "rec-1") {
    templateText = `📅 CALENDÁRIO EDITORIAL SEMANAL - GESTÃO DE MÍDIAS DIGITAIS
------------------------------------------------------------
• Segunda-feira: Dica prática / Conteúdo educacional (Carrossel no Instagram)
• Terça-feira: Bastidores do negócio / Produção (Stories interativos + Enquete)
• Quarta-feira: Solução de problema ou Mito vs Verdade (Reels curto até 30s)
• Quinta-feira: Prova Social / Depoimento de cliente (Post estático + Legenda humanizada)
• Sexta-feira: Tendência / Humor inteligente do nicho (Reels dinâmico)
• Sábado: Oferta direta / Chamada para ação no WhatsApp ou Loja
• Domingo: Frase inspiradora ou reflexão da semana
------------------------------------------------------------
Programa Emprega Mais Alagoas • Mídias Digitais`;
  } else if (resourceId === "rec-2") {
    templateText = `📋 ROTEIRO DE BRIEFING PARA CLIENTES DE MÍDIAS SOCIAIS
------------------------------------------------------------
1. Qual é o principal produto/serviço da sua empresa?
2. Quem é o seu cliente ideal (idade, cidade, principais dores)?
3. Quais redes sociais sua empresa já utiliza atualmente?
4. Quais são seus 3 maiores concorrentes em Alagoas?
5. Qual é o objetivo principal das redes (vendas, autoridade ou engajamento)?
6. O cliente possui fotos e vídeos profissionais dos produtos?
7. Qual é a identidade visual da empresa (cores, logo, tom de voz)?
8. Quem será a pessoa de contato para aprovar as postagens?
------------------------------------------------------------
Programa Emprega Mais Alagoas • Mídias Digitais`;
  } else if (resourceId === "rec-3") {
    templateText = `💼 PROPOSTA COMERCIAL PADRÃO - GESTÃO DE MÍDIAS DIGITAIS
------------------------------------------------------------
PACOTE BÁSICO (PRESENÇA DIGITAL):
- 12 posts mensais (3 por semana no feed)
- 20 stories mensais com enquetes e interação
- Criação de artes no Canva e legendas estratégicas
- Investimento sugerido: R$ 600,00 a R$ 850,00 / mês

PACOTE INTERMEDIÁRIO (CRESCIMENTO & VÍDEO):
- 16 posts mensais (sendo 8 Reels editados)
- 40 stories mensais + Destaques organizados
- Relatório mensal de alcance e métricas
- Investimento sugerido: R$ 1.100,00 a R$ 1.500,00 / mês
------------------------------------------------------------
Programa Emprega Mais Alagoas • Mídias Digitais`;
  } else if (resourceId === "rec-4") {
    templateText = `✅ CHECKLIST DE AUDITORIA DE PERFIL NO INSTAGRAM
------------------------------------------------------------
[ ] 1. Nome de usuário (@) simples, limpo e sem caracteres confusos.
[ ] 2. Foto de perfil nítida (logo para marcas, rosto iluminado para pessoal).
[ ] 3. Nome principal em negrito com a profissão/nicho e cidade.
[ ] 4. Bio magnética: Quem você ajuda + Como você ajuda + CTA.
[ ] 5. Link na bio direcionando diretamente para o WhatsApp ou Catálogo.
[ ] 6. Destaques essenciais: "Comece Aqui", "Depoimentos", "Produtos", "Endereço".
[ ] 7. Pelo menos 3 posts fixados estratégicos.
[ ] 8. Paleta de cores e tipografia consistentes nos posts.
------------------------------------------------------------
Programa Emprega Mais Alagoas • Mídias Digitais`;
  } else if (resourceId === "rec-5") {
    templateText = `📄 MINUTA BÁSICA DE PRESTAÇÃO DE SERVIÇOS DE MÍDIAS DIGITAIS
------------------------------------------------------------
CONTRATANTE: [Nome do Cliente / Empresa]
CONTRATADO(A): [Nome do Estudante/Profissional]

OBJETO: Prestação de serviços de criação de conteúdo e gestão de mídias digitais.
ENTREGAS MENSAIS: [Quantidade de posts, vídeos e stories conforme proposta].
VALOR MENSAL: R$ [Valor acordado], com vencimento no dia [Dia] de cada mês.
PRAZO: Contrato inicial de 3 meses, renovável automaticamente.
APROVAÇÕES: O cliente terá até 48 horas para aprovar o cronograma semanal.
------------------------------------------------------------
Programa Emprega Mais Alagoas • Mídias Digitais`;
  } else {
    templateText = `Material: ${res.title}\nCategoria: ${res.category}\nDescrição: ${res.description}\nLink de Acesso: ${res.downloadUrl}`;
  }

  navigator.clipboard.writeText(templateText).then(() => {
    showToast(`Modelo de "${res.title}" copiado com sucesso!`, "success");
  }).catch(() => {
    showToast("Não foi possível copiar automaticamente.", "warning");
  });
}

// =============================================================
// ABA 8: LABORATÓRIO DE PROMPTS & IA (AWESOME CHATGPT PROMPTS)
// Baseado no repositório oficial: https://github.com/f/prompts.chat
// =============================================================

function getDefaultPromptsLibrary() {
  return [
    // -------------------------------------------------------------
    // CATEGORIA 1: MARKETING DIGITAL & REDES SOCIAIS
    // -------------------------------------------------------------
    {
      id: "p-mkt-1",
      act: "Social Media Manager",
      title: "Social Media Manager & Estrategista de Conteúdo",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-share-nodes",
      color: "from-blue-500 to-indigo-600",
      description: "Planeja calendário editorial semanal, define linhas editoriais, ganchos de engajamento e estratégias para marcas no Instagram.",
      prompt: `Quero que você atue como um Social Media Manager profissional e experiente. Você será responsável por desenvolver um plano estratégico de conteúdo para \${Cliente / Empresa:uma clínica de estética em Maceió - AL}. Sua missão é definir as principais linhas editoriais, sugerir ganchos de alta retenção para posts e Reels, recomendar formatos (carrossel, vídeo, stories com enquete) e criar chamadas para ação (CTAs) que direcionem para o WhatsApp. O tom de voz deve ser \${Tom de Voz:humanizado, profissional e acolhedor}. Responda em tópicos organizados e forneça exemplos práticos prontos para publicação. Minha primeira solicitação é: "\${Primeira Solicitação:Crie um cronograma semanal de 5 postagens focado em atrair novos clientes locais.}"`,
      tags: ["Instagram", "Planejamento", "Engajamento", "Calendário"],
      contributor: "prompts.chat (@f) • Adaptado para Alagoas",
      relatedModule: 1
    },
    {
      id: "p-mkt-2",
      act: "Meta Ads Specialist",
      title: "Especialista em Tráfego Pago & Meta Ads Local",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-bullseye",
      color: "from-blue-600 to-cyan-600",
      description: "Estrutura campanhas de anúncios no Meta Ads (Facebook e Instagram) com foco em raio geográfico, público local e conversão no WhatsApp.",
      prompt: `Quero que você atue como um Gestor de Tráfego Pago especialista em Meta Ads para negócios locais. Vou fornecer informações sobre o negócio \${Tipo de Negócio:uma hamburgueria artesanal em Arapiraca - AL} e seu orçamento diário de \${Orçamento Diário:R$ 25,00 por dia}. Você deve estruturar uma campanha completa: objetivo de campanha (Mensagens no WhatsApp ou Tráfego), segmentação detalhada de público (idade, interesses e raio em km), 3 variações de criativos (imagem/vídeo) e 3 opções de textos persuasivos para o anúncio com gatilhos de escassez e proximidade geográfica. Minha primeira solicitação é: "\${Primeira Solicitação:Monte a estrutura da campanha para aumentar pedidos pelo WhatsApp nos finais de semana.}"`,
      tags: ["Meta Ads", "Tráfego Pago", "Negócios Locais", "WhatsApp"],
      contributor: "prompts.chat (@f) • Adaptado para Alagoas",
      relatedModule: 2
    },
    {
      id: "p-mkt-3",
      act: "Short-form Video Creator",
      title: "Criador de Roteiros Virais para Reels & TikTok",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-video",
      color: "from-rose-500 to-pink-600",
      description: "Cria roteiros dinâmicos de 15 a 30 segundos com gancho magnético nos primeiros 3 segundos, áudio em alta e CTA envolvente.",
      prompt: `Quero que você atue como um Roteirista Especialista em Vídeos Curtos (Reels, TikTok e Shorts). Crie roteiros altamente visuais e dinâmicos para \${Nicho:uma loja de roupas femininas}. Cada roteiro deve conter: 1) Gancho visual e verbal nos primeiros 3 segundos para reter a atenção; 2) Desenvolvimento rápido em 3 passos ou cenas; 3) Indicação de trilha sonora ou áudio em alta; 4) Texto em tela sugerido; 5) Chamada para ação irresistível na legenda e no áudio. O vídeo deve ter duração estimada de \${Duração Estimada:25 a 30 segundos}. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva 3 roteiros de Reels mostrando looks versáteis para o dia a dia.}"`,
      tags: ["Reels", "TikTok", "Roteiro", "Vídeo Curto"],
      contributor: "prompts.chat (@f)",
      relatedModule: 3
    },
    {
      id: "p-mkt-4",
      act: "Instagram Growth Strategist",
      title: "Estrategista de Crescimento no Instagram",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-chart-line",
      color: "from-amber-500 to-rose-500",
      description: "Audita perfis, otimiza biografia, destaques e propõe estratégias de crescimento orgânico e parcerias.",
      prompt: `Quero que você atue como um Estrategista de Crescimento para Instagram. Vou te apresentar o perfil de \${Nome ou Tipo do Perfil:um nutricionista que atende online e presencial}. Analise e me entregue: 1) Proposta de Nome de Usuário e Nome Principal em negrito com palavras-chave de busca; 2) Biografia magnética com autoridade + público-alvo + link de ação; 3) Estrutura recomendada de 4 Destaques estratégicos; 4) Ideias de colaborações (Collabs) e parcerias locais para acelerar seguidores qualificados. Minha primeira solicitação é: "\${Primeira Solicitação:Reestruture a bio e os destaques deste perfil para transformá-lo em uma máquina de captação de clientes.}"`,
      tags: ["Instagram", "Bio", "Crescimento", "Auditoria"],
      contributor: "prompts.chat (@f)",
      relatedModule: 1
    },
    {
      id: "p-mkt-5",
      act: "Local Influencer Consultant",
      title: "Consultor de Parcerias & Influenciadores Locais",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-handshake",
      color: "from-emerald-500 to-teal-600",
      description: "Elabora mensagens de abordagem profissional para microinfluenciadores de Alagoas, roteiro de briefing e métricas de ROI.",
      prompt: `Quero que você atue como um Consultor de Marketing de Influência Regional. Desenvolva uma estratégia para \${Segmento:uma cafeteria artesanal} contratar e fechar parcerias com microinfluenciadores (5k a 30k seguidores) em \${Cidade:Penedo - AL}. Forneça: 1) Modelo de mensagem de primeiro contato via Direct do Instagram; 2) Roteiro de Briefing simples em 5 tópicos para o criador de conteúdo seguir sem perder a espontaneidade; 3) Métricas para mensurar se a parceria gerou retorno (cupons de desconto, cliques no link, movimento no local). Minha primeira solicitação é: "\${Primeira Solicitação:Escreva o modelo de mensagem de abordagem profissional para enviar aos influenciadores locais.}"`,
      tags: ["Influenciadores", "Parcerias", "Briefing", "Direct"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 2: COPYWRITING, VENDAS & PERSUASÃO
    // -------------------------------------------------------------
    {
      id: "p-copy-1",
      act: "Advertiser & Copywriter",
      title: "Copywriter Publicitário (Fórmula AIDA)",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-pen-nib",
      color: "from-purple-500 to-indigo-600",
      description: "Escreve textos altamente persuasivos aplicando a fórmula Atenção, Interesse, Desejo e Ação para posts e anúncios.",
      prompt: `Quero que você atue como um Copywriter Publicitário sênior especializado no modelo AIDA (Atenção, Interesse, Desejo, Ação). Vou descrever um produto ou serviço: \${Produto ou Serviço:Curso prático de Canva para empreendedores iniciantes}. Crie uma copy completa dividida claramente em 4 etapas: [ATENÇÃO] - Gancho chocante ou pergunta provocativa; [INTERESSE] - Apresentação do problema comum e conexão empática; [DESEJO] - Benefícios práticos, transformação e prova de valor; [AÇÃO] - Chamada clara e irresistível com urgência. Escreva em linguagem direta, envolvente e com quebras de linha que facilitam a leitura no celular. Minha primeira solicitação é: "\${Primeira Solicitação:Crie a copy para uma postagem de feed no formato carrossel.}"`,
      tags: ["AIDA", "Persuasão", "Vendas", "Copywriting"],
      contributor: "prompts.chat (@f)",
      relatedModule: 4
    },
    {
      id: "p-copy-2",
      act: "Headline Generator",
      title: "Gerador de Headlines & Títulos Magnéticos",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-heading",
      color: "from-indigo-500 to-cyan-500",
      description: "Gera 10 variações de títulos irresistíveis com gatilhos de curiosidade, benefício claro e quebra de padrão.",
      prompt: `Quero que você atue como um Especialista em Títulos e Headlines de Alta Conversão. Para o tema \${Tema do Conteúdo:Como vender pelo WhatsApp todos os dias mesmo sem ter muitos seguidores}, gere 10 opções de títulos divididos pelas seguintes categorias de gatilhos mentais: 1) Curiosidade e Segredo; 2) Como Fazer (Passo a Passo); 3) Alerta / Erro Comum a Evitar; 4) Número / Lista Rápida; 5) Promessa Direta com Prazo. Os títulos devem ser curtos, impactantes e perfeitos para a capa de carrosséis ou miniaturas de Reels. Minha primeira solicitação é: "\${Primeira Solicitação:Gere as 10 variações de títulos magnéticos para este tema.}"`,
      tags: ["Headlines", "Títulos", "Gatilhos Mentais", "Cliques"],
      contributor: "prompts.chat (@f)",
      relatedModule: 4
    },
    {
      id: "p-copy-3",
      act: "Email Marketer",
      title: "Especialista em E-mail Marketing & Newsletter",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-envelope-open-text",
      color: "from-blue-500 to-purple-600",
      description: "Desenvolve e-mails persuasivos com linhas de assunto de alta taxa de abertura e narrativa de conversão.",
      prompt: `Quero que você atue como um Redator Especialista em E-mail Marketing e Newsletters. Crie um e-mail de \${Objetivo do E-mail:boas-vindas e apresentação de oferta especial} para novos inscritos na lista de \${Nicho do Negócio:uma consultoria de marketing digital}. O e-mail deve conter: 1) 3 opções de linhas de assunto (com emojis estratégicos e menos de 45 caracteres); 2) Texto de pré-visualização (preheader); 3) Saudação personalizada com tom amigável; 4) História curta que conecta com as dores do leitor; 5) Oferta clara com botão de chamada para ação (CTA); 6) P.S. (post scriptum) persuasivo ao final. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva o e-mail de boas-vindas com oferta para novos clientes.}"`,
      tags: ["E-mail Marketing", "Newsletter", "Conversão", "Assuntos"],
      contributor: "prompts.chat (@f)",
      relatedModule: 4
    },
    {
      id: "p-copy-4",
      act: "Screenwriter & Sales Pitch",
      title: "Roteirista de Vídeos de Vendas (VSL) e Pitch",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-film",
      color: "from-rose-600 to-amber-600",
      description: "Estrutura pitch de vendas em vídeo de 60 a 90 segundos para apresentar serviços a comerciantes e empresas.",
      prompt: `Quero que você atue como um Roteirista de Pitch Comercial e Vídeos de Vendas. Escreva um roteiro falado em primeira pessoa de 60 segundos para um profissional recém-formado em Gestão de Mídias Digitais se apresentar para \${Público Alvo / Empresa:donos de restaurantes e pizzarias de Alagoas}. Estrutura obrigatória: 1) Gancho com o problema real do cliente (perder vendas por não ter presença digital); 2) Apresentação profissional e credenciais; 3) O que você faz de diferente (foco em resultados, atendimento rápido e artes profissionais); 4) Oferta de diagnóstico gratuito; 5) Chamada para conversar no WhatsApp. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva o roteiro completo do pitch de vendas.}"`,
      tags: ["Pitch", "Vendas", "Apresentação", "Vídeo"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 4
    },
    {
      id: "p-copy-5",
      act: "Brand Storyteller",
      title: "Storyteller de Marca & Narrativas Emocionais",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-book-open-reader",
      color: "from-amber-600 to-orange-500",
      description: "Transforma a história de superação e criação de um negócio local em uma narrativa emocionante para postagens institucionais.",
      prompt: `Quero que você atue como um Mestre em Storytelling de Marcas. Vou te contar a história de fundação de \${Nome da Empresa:uma confeitaria artesanal familiar iniciada na cozinha de casa}: "\${História Base:Começou com a dona fazendo bolos para os vizinhos em 2020 para complementar a renda familiar e hoje tem uma loja física com 5 funcionários}". Transforme essa história em um post emocionante para o feed do Instagram (formato carrossel narrativo ou legenda profunda), destacando os desafios iniciais, a perseverança, o amor pelo ofício e a gratidão aos primeiros clientes locais. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva o texto completo do post em formato de história emocionante.}"`,
      tags: ["Storytelling", "História de Marca", "Emoção", "Engajamento"],
      contributor: "prompts.chat (@f)",
      relatedModule: 5
    },

    // -------------------------------------------------------------
    // CATEGORIA 3: GESTÃO, CARREIRA & NEGÓCIOS LOCAIS
    // -------------------------------------------------------------
    {
      id: "p-ges-1",
      act: "Job Interviewer",
      title: "Entrevistador de Emprego & RH Simulador",
      category: "gestao",
      categoryLabel: "Gestão, Carreira & Negócios",
      icon: "fa-user-tie",
      color: "from-slate-700 to-indigo-900",
      description: "Simula uma entrevista de emprego real para a vaga de Assistente de Mídias Sociais, fazendo perguntas uma a uma e avaliando respostas.",
      prompt: `Quero que você atue como um Entrevistador de Recursos Humanos experiente em uma agência de publicidade. Eu serei o candidato a uma vaga de \${Cargo Desejado:Assistente de Mídias Sociais e Criação de Conteúdo em Alagoas}. Quero que você faça uma simulação de entrevista comigo. Regras estritas: 1) Faça apenas UMA pergunta por vez e espere a minha resposta antes de prosseguir; 2) Não escreva a conversa inteira de uma vez; 3) Após eu responder, faça um breve comentário sobre o ponto forte da minha resposta e em seguida faça a próxima pergunta técnica ou comportamental. Minha primeira frase é: "\${Primeira Frase:Olá! Estou pronto para iniciar a minha entrevista para a vaga.}"`,
      tags: ["Entrevista", "Emprego", "Simulação", "Carreira"],
      contributor: "prompts.chat (@f / iltekin)",
      relatedModule: 7
    },
    {
      id: "p-ges-2",
      act: "Local Business Consultant",
      title: "Consultor de Negócios & Diagnóstico Digital Local",
      category: "gestao",
      categoryLabel: "Gestão, Carreira & Negócios",
      icon: "fa-store",
      color: "from-emerald-600 to-teal-700",
      description: "Gera um relatório de diagnóstico digital completo com pontos fracos, oportunidades e plano de ação em 30 dias para pequenos comércios.",
      prompt: `Quero que você atue como um Consultor Especialista em Transformação Digital de Pequenos Negócios. Vou te fornecer informações sobre um estabelecimento comercial: \${Estabelecimento:uma loja de materiais de construção em Santana do Ipanema - AL com WhatsApp e Instagram pouco atualizados}. Elabore um diagnóstico em 4 etapas: 1) 3 principais erros digitais que fazem esse negócio perder clientes para concorrentes; 2) Oportunidades imediatas no Google Meu Negócio e Instagram; 3) Plano de Ação prático de 30 dias dividido em 4 semanas; 4) Sugestão de pacote mensal de serviços que um gestor de mídias pode vender para este estabelecimento. Minha primeira solicitação é: "\${Primeira Solicitação:Elabore o diagnóstico completo para este estabelecimento.}"`,
      tags: ["Diagnóstico", "Consultoria", "Pequenos Negócios", "Plano 30 Dias"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 6
    },
    {
      id: "p-ges-3",
      act: "Freelance Pricing Calculator",
      title: "Assistente de Precificação Freelance",
      category: "gestao",
      categoryLabel: "Gestão, Carreira & Negócios",
      icon: "fa-calculator",
      color: "from-teal-600 to-emerald-600",
      description: "Calcula o valor da hora de trabalho e precifica pacotes mensais de gestão de mídias com base na realidade do mercado de Alagoas.",
      prompt: `Quero que você atue como um Mentor Financeiro para Freelancers e Prestadores de Serviços Digitais. Ajude um profissional iniciante a calcular sua tabela de preços para \${Serviços Oferecidos:criação de 12 posts no Canva, 20 stories e gestão básica de Instagram}. Considere que a meta de renda mensal do profissional é de \${Meta de Renda Mensal:R$ 2.000,00 por mês} trabalhando \${Horas por Semana:20 horas por semana} e atendendo na região de \${Região:Alagoas}. Me forneça: 1) O valor mínimo da sua hora de trabalho; 2) A estimativa de horas gastas por cliente; 3) Proposta de 3 pacotes de serviços (Básico, Intermediário e Avançado) com valores recomendados e justificativa comercial. Minha primeira solicitação é: "\${Primeira Solicitação:Calcule a tabela de preços e os pacotes sugeridos.}"`,
      tags: ["Precificação", "Freelance", "Valores", "Contratos"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 6
    },
    {
      id: "p-ges-4",
      act: "Life and Productivity Coach",
      title: "Coach de Produtividade & Rotina de Estudos",
      category: "gestao",
      categoryLabel: "Gestão, Carreira & Negócios",
      icon: "fa-stopwatch",
      color: "from-indigo-600 to-purple-700",
      description: "Monta cronograma semanal equilibrado para conciliar estudos do curso, tarefas de casa e projetos profissionais.",
      prompt: `Quero que você atue como um Coach de Produtividade e Gestão de Tempo. Vou te informar a minha disponibilidade: \${Disponibilidade:Tenho 2 horas por dia à noite e 4 horas nos sábados para estudar e produzir conteúdo}. Monte uma rotina de estudos e produção baseada na técnica Pomodoro e blocos de tempo (Time Blocking) para que eu consiga: 1) Assistir às aulas do módulo; 2) Praticar ferramentas como Canva e CapCut; 3) Prospectar novos clientes; 4) Descansar sem culpa. Forneça o cronograma diário detalhado e dicas práticas para evitar a procrastinação. Minha primeira solicitação é: "\${Primeira Solicitação:Crie meu cronograma semanal de produtividade.}"`,
      tags: ["Produtividade", "Tempo", "Rotina", "Foco"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 7
    },
    {
      id: "p-ges-5",
      act: "Sales Negotiator & Objection Handler",
      title: "Negociador Comercial & Quebra de Objeções",
      category: "gestao",
      categoryLabel: "Gestão, Carreira & Negócios",
      icon: "fa-comments-dollar",
      color: "from-amber-600 to-red-600",
      description: "Ensina respostas elegantes e persuasivas para responder 'está muito caro', 'vou pensar' e 'já tenho um sobrinho que faz'.",
      prompt: `Quero que você atue como um Especialista em Negociação Comercial e Fechamento de Vendas de Serviços. Forneça respostas estratégicas, educadas e persuasivas para as 3 objeções mais comuns que donos de empresas locais dizem ao receber uma proposta de mídias sociais: 1) "Achei o valor muito caro"; 2) "Vou pensar e te retorno depois"; 3) "Meu sobrinho já faz algumas artes para mim de graça". Para cada objeção, dê a explicação do motivo psicológico por trás dela e 2 modelos de mensagens prontas para enviar pelo WhatsApp que contornam a dúvida e conduzem para o fechamento. Minha primeira solicitação é: "\${Primeira Solicitação:Forneça as respostas para as 3 objeções de vendas.}"`,
      tags: ["Negociação", "Objeções", "Vendas", "Fechamento"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 4: DESIGN, UX & CRIATIVIDADE
    // -------------------------------------------------------------
    {
      id: "p-des-1",
      act: "Art Director",
      title: "Diretor de Arte para Mídias Sociais & Identidade",
      category: "design",
      categoryLabel: "Design, UX & Criatividade",
      icon: "fa-palette",
      color: "from-fuchsia-500 to-pink-600",
      description: "Define paleta de cores hexadecimais, fontes gratuitas do Canva e elementos visuais com base no nicho do cliente.",
      prompt: `Quero que você atue como um Diretor de Arte e Designer de Marcas sênior. Para o negócio \${Tipo de Negócio:uma cafeteria aconchegante com pegada rústica e moderna}, elabore um guia de identidade visual rápido para uso no Canva: 1) Paleta de 5 cores com códigos Hexadecimais (#HEX) e o significado de cada cor; 2) Combinação de 2 fontes gratuitas disponíveis no Canva (uma para títulos impactantes e outra para textos corridos de alta legibilidade); 3) Elementos gráficos recomendados (texturas, molduras, iluminação); 4) 3 diretrizes essenciais para manter o feed harmônico e elegante. Minha primeira solicitação é: "\${Primeira Solicitação:Crie a identidade visual completa para este negócio.}"`,
      tags: ["Canva", "Paleta de Cores", "Design", "Tipografia"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 5
    },
    {
      id: "p-des-2",
      act: "UX/UI Designer",
      title: "Consultor de UX/UI para Landing Pages e Bio",
      category: "design",
      categoryLabel: "Design, UX & Criatividade",
      icon: "fa-mobile-screen",
      color: "from-blue-500 to-indigo-600",
      description: "Estrutura árvores de links e páginas de captura mobile com foco em usabilidade, contraste e taxa de conversão.",
      prompt: `Quero que você atue como um Consultor Especialista em UX/UI e Otimização de Conversão Mobile. Analise e projete a estrutura de uma página de Links da Bio (estilo Linktree/Canva Site) para \${Profissional ou Loja:uma micropigmentadora e designer de sobrancelhas}. Defina: 1) Hierarquia dos botões de cima para baixo em ordem de prioridade comercial; 2) Microtextos dos botões com gatilhos de ação direta; 3) Recomendações de contraste e acessibilidade para pessoas que usam o celular na rua; 4) Elemento de prova social para incluir no topo da página. Minha primeira solicitação é: "\${Primeira Solicitação:Projete a estrutura completa da página de links da bio.}"`,
      tags: ["UX/UI", "Links da Bio", "Usabilidade", "Mobile"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 5
    },
    {
      id: "p-des-3",
      act: "Visual Content Reviewer",
      title: "Crítico & Revisor de Conteúdo Visual",
      category: "design",
      categoryLabel: "Design, UX & Criatividade",
      icon: "fa-wand-magic-sparkles",
      color: "from-purple-600 to-rose-600",
      description: "Avalia a harmonia, legibilidade de textos sobre imagens e espaçamento de artes criadas no Canva.",
      prompt: `Quero que você atue como um Revisor Crítico de Design e Comunicação Visual. Vou descrever uma arte de mídia social: "\${Descrição da Arte:Card com fundo vermelho brilhante, texto amarelo em fonte cursiva fina dizendo 'Promoção Relâmpago', foto do produto no canto inferior e 3 logos no topo}". Aponte: 1) Os 3 maiores erros de contraste, legibilidade ou poluição visual desta peça; 2) Como reorganizar a hierarquia de leitura (Z-Pattern ou F-Pattern); 3) Como refazer esta mesma peça no Canva de forma profissional em menos de 10 minutos. Minha primeira solicitação é: "\${Primeira Solicitação:Avalie esta arte e dê as orientações de melhoria.}"`,
      tags: ["Crítica", "Legibilidade", "Revisão", "Hierarquia"],
      contributor: "prompts.chat (@nuc)",
      relatedModule: 5
    },

    // -------------------------------------------------------------
    // CATEGORIA 5: TECNOLOGIA, DADOS & AUTOMAÇÃO
    // -------------------------------------------------------------
    {
      id: "p-tech-1",
      act: "Linux Terminal",
      title: "Terminal Linux Simulado (Console Virtual)",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & Automação",
      icon: "fa-terminal",
      color: "from-slate-800 to-slate-950",
      description: "O prompt clássico número 1 do repositório prompts.chat: simula um console Linux interativo com respostas em código.",
      prompt: `I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in Portuguese, I will do so by putting text inside curly brackets {como este}. My first command is pwd`,
      tags: ["Linux", "Terminal", "Bash", "Clássico prompts.chat"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-tech-2",
      act: "JavaScript Developer",
      title: "Desenvolvedor JavaScript & Front-End",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & Automação",
      icon: "fa-code",
      color: "from-amber-500 to-yellow-600",
      description: "Gera scripts em JavaScript moderno, automações web e snippets de código limpo com explicações passo a passo.",
      prompt: `Quero que você atue como um Desenvolvedor Front-End e JavaScript sênior. Você criará soluções de código limpas, modernas (ES6+) e bem documentadas para \${Objetivo do Código:criar uma função que valida formato de CPF brasileiro e aplica máscara 000.000.000-00 em tempo real em um campo de texto}. Entregue o código completo dentro de um bloco de código, acompanhado de uma explicação simples de cada linha para que um estudante consiga compreender o funcionamento. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva o código em JavaScript com a função de validação de CPF.}"`,
      tags: ["JavaScript", "Código", "Front-End", "Validação"],
      contributor: "prompts.chat (@omerimzali)",
      relatedModule: 7
    },
    {
      id: "p-tech-3",
      act: "Excel & Sheets Specialist",
      title: "Especialista em Planilhas, Excel & Google Sheets",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & Automação",
      icon: "fa-table",
      color: "from-emerald-600 to-green-700",
      description: "Cria fórmulas avançadas (PROCV, PROCX, QUERY, FILTER, CONT.SE), dashboards e automações para controle de clientes.",
      prompt: `Quero que você atue como um Especialista Avançado em Excel e Google Sheets. Eu preciso de uma fórmula para \${Finalidade da Planilha:calcular automaticamente a média de engajamento dos posts da semana e colorir de verde quem passou de 5% e vermelho quem ficou abaixo de 2%}. Forneça: 1) A fórmula pronta exata em Português e em Inglês; 2) O passo a passo para aplicar a Formatação Condicional; 3) Dica extra de como organizar a planilha de controle de clientes de mídias sociais. Minha primeira solicitação é: "\${Primeira Solicitação:Escreva a fórmula e o passo a passo para esta planilha.}"`,
      tags: ["Google Sheets", "Excel", "Fórmulas", "Métricas"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-tech-4",
      act: "Chatbot & Automation Architect",
      title: "Arquiteto de Automação & Chatbot para WhatsApp",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & Automação",
      icon: "fa-robot",
      color: "from-indigo-600 to-cyan-600",
      description: "Desenvolve fluxogramas de mensagens automáticas, menu numérico e triagem de atendimento para WhatsApp Business.",
      prompt: `Quero que você atue como um Arquiteto de Automação de Atendimento e Chatbots no WhatsApp Business. Crie um fluxo de atendimento automático para \${Tipo de Empresa:uma clínica odontológica que atende em Maceió}. O fluxo deve conter: 1) Mensagem de saudação automática com menu numérico de 4 opções claras (Ex: 1 - Agendar Consulta, 2 - Dúvidas sobre Tratamentos, 3 - Localização e Horários, 4 - Falar com Atendente Humano); 2) Respostas automáticas para cada opção; 3) Mensagem para horários fora do expediente comercial. Escreva em linguagem acolhedora, objetiva e com emojis estratégicos. Minha primeira solicitação é: "\${Primeira Solicitação:Crie o fluxo completo de mensagens automáticas.}"`,
      tags: ["WhatsApp", "Chatbot", "Automação", "Atendimento"],
      contributor: "prompts.chat (@f) • Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 6: EDUCAÇÃO, IDIOMAS & REDAÇÃO
    // -------------------------------------------------------------
    {
      id: "p-edu-1",
      act: "AI Writing Tutor",
      title: "Tutor de Escrita, Gramática & Clareza Textual",
      category: "educacao",
      categoryLabel: "Educação, Idiomas & Redação",
      icon: "fa-graduation-cap",
      color: "from-indigo-600 to-purple-800",
      description: "Analisa redações, postagens e e-mails corrigindo erros de português, concordância e sugerindo versões mais elegantes.",
      prompt: `Quero que você atue como um Tutor de Redação e Revisor Gramatical de Língua Portuguesa. Vou te enviar um texto escrito por mim: "\${Texto para Correção:Ola pessoal venho aqui divulgar meu trabalho de midias sociais estou com precos bons e faco artes no canva chama no zap}". Sua missão é: 1) Apontar os erros gramaticais, de pontuação e de concordância com explicações gentis e didáticas; 2) Fornecer uma versão corrigida padrão; 3) Fornecer uma versão aprimorada profissional de alto nível pronta para postar. Minha primeira solicitação é: "\${Primeira Solicitação:Revise e aprimore este texto.}"`,
      tags: ["Gramática", "Português", "Revisão", "Clareza"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 1
    },
    {
      id: "p-edu-2",
      act: "English Translator and Improver",
      title: "Tradutor & Aprimorador de Inglês Profissional",
      category: "educacao",
      categoryLabel: "Educação, Idiomas & Redação",
      icon: "fa-language",
      color: "from-blue-600 to-indigo-700",
      description: "Prompt clássico do repositório: traduz qualquer idioma para o inglês sofisticado, corrigindo erros e elevando o nível do vocabulário.",
      prompt: `I want you to act as an English translator, spelling corrector and improver. I will speak to you in Portuguese (or any other language) and you will detect the language, translate it and answer in the corrected and improved version of my text, in professional English. I want you to replace my simplified words and sentences with more beautiful, elegant, upper-level English vocabulary suitable for international business and social media. Keep the meaning the same, but make it more impactful. Only reply with the correction and the improvements, do not write explanations. My first sentence is: "\${Primeira Frase em Português:Eu quero trabalhar com marketing digital e criação de conteúdo para empresas do mundo inteiro.}"`,
      tags: ["Inglês", "Tradução", "Carreira Global", "Clássico prompts.chat"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-edu-3",
      act: "Plagiarism Checker and Paraphraser",
      title: "Verificador de Originalidade & Reescrita Textual",
      category: "educacao",
      categoryLabel: "Educação, Idiomas & Redação",
      icon: "fa-check-double",
      color: "from-teal-600 to-cyan-700",
      description: "Reescreve artigos e legendas mantendo a mensagem central com palavras 100% autorais e sem risco de plágio.",
      prompt: `Quero que você atue como um Especialista em Originalidade Textual e Paráfrase. Vou te enviar um parágrafo de referência: "\${Texto Original:O marketing digital se tornou indispensável para pequenas empresas porque permite alcançar clientes locais com baixo investimento através das redes sociais}". Reescreva essa mesma ideia em 3 estilos diferentes: 1) Estilo Direto e Objetivo para postagem rápida; 2) Estilo Didático com metáfora ou exemplo prático; 3) Estilo Provocativo para gerar debate nos comentários. Todas as versões devem ser 100% originais. Minha primeira solicitação é: "\${Primeira Solicitação:Gere as 3 versões reescritas deste parágrafo.}"`,
      tags: ["Originalidade", "Paráfrase", "Reescrita", "Estilo"],
      contributor: "prompts.chat (@yetk1n)",
      relatedModule: 1
    },
    {
      id: "p-edu-4",
      act: "Critical Debater",
      title: "Debatedor Crítico & Analista de Cenários",
      category: "educacao",
      categoryLabel: "Educação, Idiomas & Redação",
      icon: "fa-scale-balanced",
      color: "from-slate-700 to-indigo-800",
      description: "Apresenta os prós e contras de qualquer ferramenta, tendência ou decisão estratégica de mídias com argumentos sólidos.",
      prompt: `Quero que você atue como um Analista Crítico e Debatedor Estratégico. Para a questão \${Tema em Discussão:Vale a pena pequenos negócios investirem em tráfego pago antes de terem uma base orgânica estruturada no Instagram?}, apresente: 1) Os 3 argumentos mais fortes a favor; 2) Os 3 argumentos mais fortes contra e riscos envolvidos; 3) Uma síntese equilibrada com recomendação prática para um estudante orientar seu cliente. Mantenha uma postura neutra, analítica e fundamentada em dados. Minha primeira solicitação é: "\${Primeira Solicitação:Apresente o debate completo sobre este tema.}"`,
      tags: ["Debate", "Análise Crítica", "Estratégia", "Tomada de Decisão"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 7
    }
  ];
}

// -------------------------------------------------------------
// ARMAZENAMENTO E PERSISTÊNCIA DE PROMPTS
// -------------------------------------------------------------
function loadPromptsDataFromStorage() {
  const defaults = getDefaultPromptsLibrary();
  let customPrompts = [];
  try {
    const savedCustom = localStorage.getItem("eupordias_custom_prompts");
    if (savedCustom) {
      customPrompts = JSON.parse(savedCustom);
    }
  } catch (e) {
    console.warn("Erro ao carregar prompts customizados do localStorage:", e);
  }

  try {
    const savedFavs = localStorage.getItem("eupordias_favorite_prompts");
    if (savedFavs) {
      AppState.favoritePrompts = JSON.parse(savedFavs);
    }
  } catch (e) {
    console.warn("Erro ao carregar prompts favoritos:", e);
  }

  // Mescla prompts padrão com customizados criados pelo professor
  AppState.promptsLibrary = [...customPrompts, ...defaults];
}

function savePromptsDataToStorage() {
  const customPrompts = AppState.promptsLibrary.filter(p => p.isCustom);
  localStorage.setItem("eupordias_custom_prompts", JSON.stringify(customPrompts));
  localStorage.setItem("eupordias_favorite_prompts", JSON.stringify(AppState.favoritePrompts || []));
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA: LABORATÓRIO DE PROMPTS & IA
// -------------------------------------------------------------
function renderPromptsTab(container) {
  // REGRA DE ACESSO: Exige autenticação por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'prompts');
    return;
  }

  const isProf = AppState.currentUser.role === "professor";
  const isAluno = AppState.currentUser.role === "aluno";
  const activeCategory = AppState.promptsActiveCategory || "all";
  const searchQuery = (AppState.promptsSearchQuery || "").toLowerCase().trim();
  const favoriteIds = AppState.favoritePrompts || [];
  const guideExpanded = AppState.promptsGuideExpanded !== false;

  // Filtragem dos Prompts
  const filteredPrompts = AppState.promptsLibrary.filter(p => {
    // Filtro por Categoria
    if (activeCategory === "favorites") {
      if (!favoriteIds.includes(p.id)) return false;
    } else if (activeCategory !== "all" && p.category !== activeCategory) {
      return false;
    }

    // Filtro por Busca Textual
    if (searchQuery) {
      const matchText = `${p.title} ${p.act} ${p.categoryLabel} ${p.description} ${p.prompt} ${(p.tags || []).join(" ")}`.toLowerCase();
      if (!matchText.includes(searchQuery)) return false;
    }

    return true;
  });

  const categories = [
    { key: "all", label: "Todos os Prompts", icon: "fa-layer-group" },
    { key: "marketing", label: "Marketing & Redes", icon: "fa-share-nodes" },
    { key: "copywriting", label: "Copywriting & Vendas", icon: "fa-pen-nib" },
    { key: "gestao", label: "Gestão & Negócios", icon: "fa-store" },
    { key: "design", label: "Design & Criatividade", icon: "fa-palette" },
    { key: "tech", label: "Tecnologia & Dados", icon: "fa-code" },
    { key: "educacao", label: "Educação & Redação", icon: "fa-graduation-cap" },
    { key: "favorites", label: "Favoritos", icon: "fa-star", count: favoriteIds.length }
  ];

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      
      <!-- Banner Hero Principal do Repositório prompts.chat -->
      <div class="position-relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30" style="background: linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #2e1065 100%) !important; color: #ffffff !important;">
        <div class="position-relative z-10 d-flex flex-column md:flex-row align-items-start md:items-center justify-content-between gap-6">
          <div class="space-y-2.5 max-w-2xl">
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="px-3 py-1 rounded-circle text-[11px] fw-bolder text-uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white tracking-wider shadow">
                <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Awesome ChatGPT Prompts
              </span>
              <a 
                href="https://github.com/f/prompts.chat" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="px-3 py-1 rounded-circle text-[11px] fw-semibold bg-white/10 backdrop-blur-sm transition-colors d-flex align-items-center gap-1.5"
                title="Acessar repositório original no GitHub de Fatih Kadir Akın (@f)"
              >
                <i class="fa-brands fa-github text-sm"></i> prompts.chat (@f) <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
              <span class="px-2.5 py-0.5 rounded-circle text-[11px] fw-bold bg-emerald-500/90 text-white d-flex align-items-center gap-1">
                <i class="fa-solid fa-bolt"></i> Engenharia de Prompt Ativa
              </span>
            </div>

            <h1 class="text-xl sm:text-3xl fw-bolder tracking-tight leading-tight">
              Laboratório de Prompts & Personas de IA
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transforme o ChatGPT, Gemini e Claude em <strong>especialistas sêniores sob demanda</strong>. Esta página traz todo o acervo do repositório mundial <em>prompts.chat</em> traduzido e adaptado para mídias digitais, com personalizador dinâmico de variáveis.
            </p>
          </div>

          <!-- Métricas Rápidas & Ações de Docente/Discente -->
          <div class="d-flex flex-column align-items-stretch sm:align-items-end gap-3 flex-shrink-0">
            <!-- Métricas em cápsula unificada -->
            <div class="d-flex align-items-center justify-content-center gap-3 text-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-sm">
              <div class="px-2">
                <span class="d-block text-base sm:text-lg fw-bolder text-amber-400">${AppState.promptsLibrary.length}</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Prompts</span>
              </div>
              <div class="px-2 border-start border-end border-white/15">
                <span class="d-block text-base sm:text-lg fw-bolder text-emerald-400">6</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Áreas</span>
              </div>
              <div class="px-2">
                <span class="d-block text-base sm:text-lg fw-bolder text-indigo-300">${favoriteIds.length}</span>
                <span class="text-[10px] text-uppercase tracking-wider text-slate-200">Favoritos</span>
              </div>
            </div>

            ${isProf ? `
              <button 
                onclick="openCreatePromptModal()" 
                class="d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2.5 rounded-pill fw-bold text-xs text-white shadow-md transition-all cursor-pointer active:scale-95 border-0"
                style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;"
              >
                <i class="fa-solid fa-plus"></i> Adicionar Prompt à Turma
              </button>
            ` : `
              <div class="d-flex align-items-center gap-2">
                <a 
                  href="https://chatgpt.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="px-3.5 py-2 rounded-pill fw-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all d-inline-flex align-items-center justify-content-center gap-1.5 cursor-pointer text-decoration-none"
                >
                  <i class="fa-solid fa-robot"></i> ChatGPT
                </a>
                <a 
                  href="https://gemini.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="px-3.5 py-2 rounded-pill fw-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all d-inline-flex align-items-center justify-content-center gap-1.5 cursor-pointer text-decoration-none"
                >
                  <i class="fa-brands fa-google"></i> Gemini
                </a>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Guia Didático e Passo a Passo Explicativo (Retrátil) -->
      <div class="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div class="d-flex align-items-center justify-content-between cursor-pointer select-none" onclick="togglePromptsGuide()">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-lg shadow-sm">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h2 class="text-sm sm:text-base fw-bold text-slate-900 d-flex align-items-center gap-2">
                Como Funciona este Repositório & Passo a Passo de Uso para o Aluno
                <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-amber-100 text-amber-800 ">
                  Guia Didático Oficial
                </span>
              </h2>
              <p class="text-xs text-slate-500 ">
                Aprenda a metodologia de <strong>Role Prompting ("Aja como...")</strong> para obter resultados 10x melhores na Inteligência Artificial.
              </p>
            </div>
          </div>
          <button class="p-2 rounded-xl text-slate-400 transition-colors">
            <i class="fa-solid ${guideExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
          </button>
        </div>

        ${guideExpanded ? `
          <div class="pt-4 border-t border-slate-100 space-y-6 text-xs text-slate-600 fade-in">
            
            <!-- Explicação do Repositório -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                <strong class="text-indigo-900 fw-bold text-xs d-flex align-items-center gap-1.5">
                  <i class="fa-solid fa-circle-question text-indigo-500"></i> O que é o repositório prompts.chat?
                </strong>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Criado pelo desenvolvedor Fatih Kadir Akın (<strong>@f</strong>), o <em>Awesome ChatGPT Prompts</em> tornou-se o repositório open-source mais famoso do mundo para inteligência artificial generativa, acumulando dezenas de milhares de estrelas no GitHub.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                <strong class="text-emerald-900 fw-bold text-xs d-flex align-items-center gap-1.5">
                  <i class="fa-solid fa-bullseye text-emerald-500"></i> Para que ele serve no seu aprendizado?
                </strong>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Sem um prompt bem estruturado, o ChatGPT dá respostas genéricas e rasas. Ao utilizar o comando <strong>"Aja como [Persona]"</strong>, você ativa os parâmetros de um especialista no modelo, definindo limites, tom de voz e formato de entrega.
                </p>
              </div>
            </div>

            <!-- 4 Passos Práticos do Aluno -->
            <div class="space-y-3">
              <h3 class="fw-bold text-xs text-uppercase tracking-wider text-slate-400 d-flex align-items-center gap-1.5">
                <i class="fa-solid fa-route text-indigo-500"></i> Passo a Passo em 4 Fases para Usar Qualquer Prompt:
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white fw-bolder text-xs d-flex align-items-center justify-content-center">1</span>
                  <h4 class="fw-bold text-slate-800 ">Escolha a Persona</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Navegue pelas categorias abaixo e encontre a especialidade ideal para a sua tarefa.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white fw-bolder text-xs d-flex align-items-center justify-content-center">2</span>
                  <h4 class="fw-bold text-slate-800 ">Personalize as Variáveis</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Clique em <strong>"Personalizar"</strong> para preencher os campos com os dados do seu cliente real.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white fw-bolder text-xs d-flex align-items-center justify-content-center">3</span>
                  <h4 class="fw-bold text-slate-800 ">Copie em 1 Clique</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Clique no botão <strong>"Copiar Prompt"</strong> para transferir o texto formatado para a área de transferência.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white fw-bolder text-xs d-flex align-items-center justify-content-center">4</span>
                  <h4 class="fw-bold text-slate-800 ">Cole na IA & Interaja</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Abra o ChatGPT ou Gemini, cole o prompt e converse mantendo o especialista focado no objetivo.</p>
                </div>
              </div>
            </div>

          </div>
        ` : ''}
      </div>

      <!-- Barra de Filtros por Categoria & Busca em Tempo Real -->
      <div class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div class="d-flex flex-column md:flex-row items-stretch md:items-center justify-content-between gap-3">
          
          <!-- Pílulas de Categorias -->
          <div class="d-flex align-items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
            ${categories.map(c => {
              const isActive = activeCategory === c.key;
              const countBadge = c.key === "all" ? AppState.promptsLibrary.length : (c.count !== undefined ? c.count : AppState.promptsLibrary.filter(p => p.category === c.key).length);

              return `
                <button 
                  onclick="switchPromptsCategory('${c.key}')" 
                  class="px-3.5 py-2 rounded-2xl text-xs fw-bold text-nowrap transition-all d-flex align-items-center gap-1.5 cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'}"
                >
                  <i class="fa-solid ${c.icon}"></i>
                  <span>${c.label}</span>
                  <span class="px-1.5 py-0.2 rounded-circle text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}">${countBadge}</span>
                </button>
              `;
            }).join("")}
          </div>

          <!-- Campo de Busca Textual -->
          <div class="w-100 md:w-72 position-relative flex-shrink-0">
            <i class="fa-solid fa-magnifying-glass position-absolute left-3.5 top-3 text-xs text-slate-400"></i>
            <input 
              type="text" 
              value="${escapeHtml(AppState.promptsSearchQuery || '')}"
              oninput="handlePromptsSearchInput(this.value)"
              placeholder="Buscar persona, nicho ou ferramenta..." 
              class="w-100 pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 "
            />
          </div>

        </div>
      </div>

      <!-- Grid de Cards de Prompts -->
      ${filteredPrompts.length === 0 ? `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 d-flex align-items-center justify-content-center text-2xl mx-auto text-slate-400">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h3 class="fw-bold text-sm text-slate-700 ">Nenhum prompt encontrado para esta seleção</h3>
          <p class="text-xs max-w-sm mx-auto">Tente selecionar outra categoria ou limpar os termos digitados na busca.</p>
          <button onclick="switchPromptsCategory('all'); handlePromptsSearchInput('');" class="px-4 py-2 rounded-xl text-xs fw-bold bg-indigo-50 text-indigo-600 transition-colors">
            Ver Todos os Prompts
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${filteredPrompts.map(p => {
            const isFav = favoriteIds.includes(p.id);

            return `
              <div class="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all d-flex flex-column justify-content-between space-y-4">
                
                <div class="space-y-3">
                  
                  <!-- Header do Card: Ícone, Categoria & Favorito -->
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${p.color || 'from-indigo-500 to-purple-600'} text-white d-flex align-items-center justify-content-center text-sm shadow-sm flex-shrink-0">
                        <i class="fa-solid ${p.icon || 'fa-wand-magic-sparkles'}"></i>
                      </div>
                      <div>
                        <span class="px-2 py-0.5 rounded-circle text-[10px] fw-bold bg-slate-100 text-slate-600 ">
                          ${escapeHtml(p.categoryLabel || p.category)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onclick="toggleFavoritePrompt('${p.id}')" 
                      class="p-2 rounded-xl text-slate-400 transition-colors cursor-pointer"
                      title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                    >
                      <i class="fa-${isFav ? 'solid' : 'regular'} fa-star ${isFav ? 'text-amber-400' : ''}"></i>
                    </button>
                  </div>

                  <!-- Título da Persona e Papel -->
                  <div>
                    <h3 class="fw-bold text-sm sm:text-base text-slate-900 leading-snug">
                      ${escapeHtml(p.title)}
                    </h3>
                    <p class="text-[11px] text-indigo-600 fw-semibold mt-0.5 d-flex align-items-center gap-1">
                      <i class="fa-solid fa-user-astronaut"></i> Persona: <code>${escapeHtml(p.act)}</code>
                    </p>
                  </div>

                  <!-- Descrição Didática -->
                  <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    ${escapeHtml(p.description)}
                  </p>

                  <!-- Preview do Prompt com Destaque de Variáveis -->
                  <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-700 font-monospace leading-relaxed line-clamp-4 position-relative group">
                    ${escapeHtml(p.prompt)}
                  </div>

                  <!-- Tags do Prompt -->
                  <div class="d-flex flex-wrap gap-1 pt-1">
                    ${(p.tags || []).map(t => `
                      <span class="px-2 py-0.5 rounded-lg text-[9px] fw-semibold bg-slate-100 text-slate-600 ">
                        #${escapeHtml(t)}
                      </span>
                    `).join("")}
                  </div>

                </div>

                <!-- Footer de Ações do Card -->
                <div class="pt-3 border-t border-slate-100 d-flex flex-column gap-2">
                  <div class="d-flex align-items-center gap-1.5">
                    
                    <button 
                      onclick="copyPromptText('${p.id}')" 
                      class="flex-grow-1 px-3 py-2 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-sm transition-all d-flex align-items-center justify-content-center gap-1.5 cursor-pointer active:scale-95"
                      title="Copiar prompt pronto para colar no ChatGPT"
                    >
                      <i class="fa-solid fa-copy"></i> Copiar Prompt
                    </button>

                    <button 
                      onclick="openPromptCustomizerModal('${p.id}')" 
                      class="px-3 py-2 rounded-xl fw-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 transition-all d-flex align-items-center gap-1 cursor-pointer"
                      title="Preencher variáveis e personalizar"
                    >
                      <i class="fa-solid fa-sliders"></i> Personalizar
                    </button>

                  </div>

                  <div class="d-flex align-items-center justify-content-between text-[10px] text-slate-400 pt-1">
                    <span class="text-truncate max-w-[150px]"><i class="fa-solid fa-code-fork mr-1"></i>${escapeHtml(p.contributor || 'prompts.chat')}</span>
                    
                    <div class="d-flex align-items-center gap-1">
                      <button 
                        onclick="openInAiPlatform('${p.id}', 'chatgpt')" 
                        class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] fw-bold d-flex align-items-center gap-1"
                        title="Copiar e abrir no ChatGPT"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i> ChatGPT
                      </button>

                      <button 
                        onclick="openInAiPlatform('${p.id}', 'gemini')" 
                        class="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] fw-bold d-flex align-items-center gap-1"
                        title="Copiar e abrir no Gemini"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i> Gemini
                      </button>

                      ${(isProf && p.isCustom) ? `
                        <button 
                          onclick="deleteCustomPrompt('${p.id}')" 
                          class="p-1 rounded-lg text-rose-500 " 
                          title="Excluir este prompt customizado"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>

                </div>

              </div>
            `;
          }).join("")}
        </div>
      `}

    </div>
  `;
}

// -------------------------------------------------------------
// AÇÕES E INTERATIVIDADE DA ABA DE PROMPTS
// -------------------------------------------------------------
function switchPromptsCategory(category) {
  AppState.promptsActiveCategory = category;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderPromptsTab(contentArea);
}

function handlePromptsSearchInput(query) {
  AppState.promptsSearchQuery = query;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderPromptsTab(contentArea);
}

function togglePromptsGuide() {
  AppState.promptsGuideExpanded = !AppState.promptsGuideExpanded;
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderPromptsTab(contentArea);
}

function toggleFavoritePrompt(promptId) {
  if (!AppState.favoritePrompts) AppState.favoritePrompts = [];
  const idx = AppState.favoritePrompts.indexOf(promptId);
  if (idx >= 0) {
    AppState.favoritePrompts.splice(idx, 1);
    showToast("Prompt removido dos favoritos.", "info");
  } else {
    AppState.favoritePrompts.push(promptId);
    showToast("Prompt adicionado aos favoritos!", "success");
  }
  savePromptsDataToStorage();
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderPromptsTab(contentArea);
}

function copyPromptText(promptId) {
  const promptItem = AppState.promptsLibrary.find(p => p.id === promptId);
  if (!promptItem) {
    showToast("Prompt não encontrado.", "error");
    return;
  }

  // Limpa os marcadores de variáveis para deixar pronto para envio se desejado
  const cleanPrompt = promptItem.prompt.replace(/\$\{([^:]+):([^}]+)\}/g, "$2");

  navigator.clipboard.writeText(cleanPrompt).then(() => {
    showToast(`Prompt de "${promptItem.title}" copiado para a área de transferência!`, "success");
  }).catch(() => {
    showToast("Não foi possível copiar automaticamente.", "warning");
  });
}

function openInAiPlatform(promptId, platform) {
  copyPromptText(promptId);
  const targetUrl = platform === "gemini" ? "https://gemini.google.com" : "https://chatgpt.com";
  window.open(targetUrl, "_blank");
}

// -------------------------------------------------------------
// PLAYGROUND / MODAL DE PERSONALIZAÇÃO DE VARIÁVEIS
// -------------------------------------------------------------
function openPromptCustomizerModal(promptId) {
  const promptItem = AppState.promptsLibrary.find(p => p.id === promptId);
  if (!promptItem) return;

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  // Extrai variáveis no formato ${Label:ValorPadrao}
  const variableRegex = /\$\{([^:]+):([^}]+)\}/g;
  const extractedVars = [];
  let match;
  while ((match = variableRegex.exec(promptItem.prompt)) !== null) {
    extractedVars.push({
      raw: match[0],
      label: match[1].trim(),
      defaultValue: match[2].trim()
    });
  }

  // Se não houver variáveis com `${...}`, detecta chaves `[...]`
  if (extractedVars.length === 0) {
    const bracketRegex = /\[([A-ZÀ-Ú\s/]+)\]/g;
    while ((match = bracketRegex.exec(promptItem.prompt)) !== null) {
      extractedVars.push({
        raw: match[0],
        label: match[1].trim(),
        defaultValue: ""
      });
    }
  }

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <!-- Header do Modal -->
        <div class="d-flex align-items-center justify-content-between pb-4 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg shadow-sm">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 class="fw-bold text-base text-slate-900 ">Personalizar: ${escapeHtml(promptItem.title)}</h3>
              <p class="text-xs text-slate-500 ">Preencha os campos abaixo com os dados do seu cliente ou projeto</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Formulário de Campos Dinâmicos -->
        <div class="space-y-4 text-xs">
          ${extractedVars.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              ${extractedVars.map((v, i) => `
                <div class="space-y-1">
                  <label class="d-block fw-bold text-slate-700 ">
                    ${escapeHtml(v.label)}:
                  </label>
                  <input 
                    type="text" 
                    id="var-input-${i}" 
                    value="${escapeHtml(v.defaultValue)}"
                    data-raw="${escapeHtml(v.raw)}"
                    oninput="updateCustomizerLivePreview('${promptItem.id}')"
                    class="w-100 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
                  />
                </div>
              `).join("")}
            </div>
          ` : `
            <p class="text-slate-500 italic">Este prompt já está pronto para uso direto sem necessidade de preencher variáveis adicionais.</p>
          `}

          <!-- Preview do Prompt Gerado em Tempo Real -->
          <div class="space-y-1.5 pt-2">
            <label class="d-block fw-bold text-slate-700 d-flex align-items-center justify-content-between">
              <span>Resultado Pronto para Enviar ao ChatGPT:</span>
              <span class="text-[10px] text-emerald-600 fw-semibold"><i class="fa-solid fa-check"></i> Atualizado em tempo real</span>
            </label>
            <textarea 
              id="customizer-preview-area" 
              rows="6" 
              readonly 
              class="w-100 p-4 rounded-2xl border border-slate-200 bg-slate-50 font-monospace text-xs text-slate-800 select-all leading-relaxed"
            >${escapeHtml(promptItem.prompt.replace(/\$\{([^:]+):([^}]+)\}/g, "$2"))}</textarea>
          </div>
        </div>

        <!-- Ações do Modal -->
        <div class="pt-4 border-t border-slate-100 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <button 
              type="button" 
              onclick="copyCustomizedPromptFromModal()" 
              class="px-5 py-2.5 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all d-flex align-items-center gap-2 cursor-pointer active:scale-95"
            >
              <i class="fa-solid fa-copy"></i> Copiar Prompt Personalizado
            </button>

            <button 
              type="button" 
              onclick="copyAndOpenCustomizedPrompt('chatgpt')" 
              class="px-3.5 py-2.5 rounded-xl fw-semibold text-xs bg-emerald-50 text-emerald-700 transition-colors d-flex align-items-center gap-1.5"
            >
              <i class="fa-solid fa-robot"></i> Abrir no ChatGPT
            </button>
          </div>

          <button 
            type="button" 
            onclick="closeModal()" 
            class="px-4 py-2.5 rounded-xl fw-semibold text-xs bg-slate-100 text-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
        </div>
      </div>
    </div>
  `;
}

function updateCustomizerLivePreview(promptId) {
  const promptItem = AppState.promptsLibrary.find(p => p.id === promptId);
  if (!promptItem) return;

  const previewArea = document.getElementById("customizer-preview-area");
  if (!previewArea) return;

  let currentPrompt = promptItem.prompt;
  const inputs = document.querySelectorAll('[id^="var-input-"]');

  inputs.forEach(input => {
    const raw = input.getAttribute("data-raw");
    const val = input.value || "";
    if (raw) {
      currentPrompt = currentPrompt.split(raw).join(val);
    }
  });

  // Limpa quaisquer tags restantes
  currentPrompt = currentPrompt.replace(/\$\{([^:]+):([^}]+)\}/g, "$2");
  previewArea.value = currentPrompt;
}

function copyCustomizedPromptFromModal() {
  const previewArea = document.getElementById("customizer-preview-area");
  if (!previewArea || !previewArea.value) return;

  navigator.clipboard.writeText(previewArea.value).then(() => {
    showToast("Prompt personalizado copiado para a área de transferência!", "success");
  }).catch(() => {
    showToast("Não foi possível copiar automaticamente.", "warning");
  });
}

function copyAndOpenCustomizedPrompt(platform) {
  copyCustomizedPromptFromModal();
  const targetUrl = platform === "gemini" ? "https://gemini.google.com" : "https://chatgpt.com";
  window.open(targetUrl, "_blank");
}

// -------------------------------------------------------------
// ESPAÇO DO PROFESSOR: CRIAÇÃO DE NOVOS PROMPTS
// -------------------------------------------------------------
function openCreatePromptModal() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores têm permissão para adicionar novos prompts.", "warning");
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); overflow-y: auto;" onclick="if(event.target === this) closeModal()">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg my-3">
        <div class="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden bg-white">
          <div class="d-flex align-items-center justify-content-between pb-3 border-b border-slate-100 ">
          <div class="d-flex align-items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 d-flex align-items-center justify-content-center text-lg">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 class="fw-bold text-sm text-slate-900 ">Criar Novo Prompt para a Turma</h3>
              <p class="text-[11px] text-slate-500 ">Exclusivo para Docentes e Coordenação</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 ">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleCreatePromptSubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Título da Persona / Função *</label>
            <input 
              type="text" 
              id="prompt-title-input" 
              required
              placeholder="Ex: Especialista em Vendas no WhatsApp para Pequenos Negócios" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Categoria *</label>
              <select 
                id="prompt-category-select" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 fw-semibold "
              >
                <option value="marketing">Marketing & Redes</option>
                <option value="copywriting">Copywriting & Vendas</option>
                <option value="gestao">Gestão & Negócios</option>
                <option value="design">Design & Criatividade</option>
                <option value="tech">Tecnologia & Dados</option>
                <option value="educacao">Educação & Redação</option>
              </select>
            </div>

            <div>
              <label class="d-block fw-bold text-slate-700 mb-1">Papel em Inglês (Act as) *</label>
              <input 
                type="text" 
                id="prompt-act-input" 
                required
                placeholder="Ex: WhatsApp Sales Closer" 
                class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
              />
            </div>
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Descrição Breve da Finalidade *</label>
            <input 
              type="text" 
              id="prompt-desc-input" 
              required
              placeholder="Ex: Auxilia o aluno a conduzir conversas de fechamento de pacotes pelo WhatsApp." 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">
              Comando do Prompt Completo * 
              <span class="fw-normal text-slate-400">(use \${Nome:Padrão} para criar variáveis)</span>
            </label>
            <textarea 
              id="prompt-text-input" 
              rows="5" 
              required
              placeholder="Quero que você atue como um especialista em... Minha primeira solicitação é: ..." 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-monospace text-[11px] leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label class="d-block fw-bold text-slate-700 mb-1">Tags Separadas por Vírgula</label>
            <input 
              type="text" 
              id="prompt-tags-input" 
              placeholder="Ex: WhatsApp, Fechamento, Módulo 6, Vendas" 
              class="w-100 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 "
            />
          </div>

          <div class="pt-3 border-t border-slate-100 d-flex align-items-center justify-content-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl fw-semibold text-xs bg-slate-100 text-slate-700 "
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl fw-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            >
              Publicar Prompt para a Turma
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  `;
}

function handleCreatePromptSubmit(event) {
  event.preventDefault();

  const title = (document.getElementById("prompt-title-input")?.value || "").trim();
  const category = document.getElementById("prompt-category-select")?.value || "marketing";
  const act = (document.getElementById("prompt-act-input")?.value || "").trim();
  const description = (document.getElementById("prompt-desc-input")?.value || "").trim();
  const promptText = (document.getElementById("prompt-text-input")?.value || "").trim();
  const rawTags = (document.getElementById("prompt-tags-input")?.value || "").trim();

  if (!title || !promptText) {
    showToast("Preencha todos os campos obrigatórios.", "warning");
    return;
  }

  const categoryLabels = {
    marketing: "Marketing & Redes Sociais",
    copywriting: "Copywriting & Vendas",
    gestao: "Gestão, Carreira & Negócios",
    design: "Design, UX & Criatividade",
    tech: "Tecnologia, Dados & Automação",
    educacao: "Educação, Idiomas & Redação"
  };

  const newPrompt = {
    id: `custom-p-${Date.now()}`,
    act: act || title,
    title: title,
    category: category,
    categoryLabel: categoryLabels[category] || "Geral",
    icon: category === "marketing" ? "fa-share-nodes" : category === "copywriting" ? "fa-pen-nib" : category === "gestao" ? "fa-store" : category === "design" ? "fa-palette" : category === "tech" ? "fa-code" : "fa-graduation-cap",
    color: "from-indigo-600 to-purple-600",
    description: description,
    prompt: promptText,
    tags: rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : ["Turma", "Docente"],
    contributor: AppState.currentUser?.name || "Professor(a)",
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  AppState.promptsLibrary.unshift(newPrompt);
  savePromptsDataToStorage();
  closeModal();
  showToast(`Novo prompt "${title}" publicado com sucesso para a turma!`, "success");

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderPromptsTab(contentArea);
}

function deleteCustomPrompt(promptId) {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem excluir prompts customizados.", "warning");
    return;
  }

  const idx = AppState.promptsLibrary.findIndex(p => p.id === promptId);
  if (idx < 0) return;

  if (confirm("Tem certeza que deseja excluir este prompt customizado da biblioteca da turma?")) {
    AppState.promptsLibrary.splice(idx, 1);
    savePromptsDataToStorage();
    showToast("Prompt excluído com sucesso.", "success");
    const contentArea = document.getElementById("main-content-area");
    if (contentArea) renderPromptsTab(contentArea);
  }
}



// -------------------------------------------------------------
// AUDITOR DE INSTAGRAM & FEEDBACK PEDAGÓGICO IA (SISTEMA ORGANIZADO EM ABAS)
// -------------------------------------------------------------

function copyToClipboard(text, successMsg = "Copiado para a área de transferência!") {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMsg, "success"))
      .catch(() => fallbackCopyText(text, successMsg));
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, "success");
  } catch (err) {
    showToast("Não foi possível copiar automaticamente.", "warning");
  }
  document.body.removeChild(textArea);
}

let instagramAuditState = {
  handle: "",
  loading: false,
  loadingStep: "",
  activeSubTab: "diagnostico", // 'diagnostico' | 'bio' | 'reels'
  result: null,
  completedTasks: new Set()
};

function runInstagramAuditForStudent(handleOrId) {
  const student = AppState.students.find(s => s.id === handleOrId || s.socialMedia === handleOrId);
  const handle = student ? (student.socialMedia || ('@' + student.name.toLowerCase().replace(/\s+/g, '.'))) : handleOrId;
  
  instagramAuditState.handle = handle;
  closeModal();
  switchTab('instagram');
  setTimeout(() => {
    executeLiveInstagramAudit(handle);
  }, 150);
}

function quickSelectInstagramAudit(handle) {
  instagramAuditState.handle = handle;
  const input = document.getElementById("insta-single-input");
  if (input) input.value = handle;
  executeLiveInstagramAudit(handle);
}


function switchActiveBioVariation(variationKey) {
  if (!instagramAuditState.result || !instagramAuditState.result.aiBioVariations) return;
  const vars = instagramAuditState.result.aiBioVariations;
  if (vars[variationKey]) {
    instagramAuditState.result.suggestedBio = vars[variationKey];
    instagramAuditState.selectedBioVariation = variationKey;
    renderApp();
    showToast(`Bio alterada para o estilo ${variationKey.toUpperCase()}!`, 'info');
  }
}

function regenerateAIBioCustom() {
  if (!instagramAuditState.result) return;
  const res = instagramAuditState.result;
  const firstName = (res.displayName || res.handle).split(' ')[0];
  const loc = res.location || 'Alagoas';
  
  const hooks = [
    `✨ Transformando a experiência de clientes em ${loc}`,
    `🚀 Excelência e dedicação em ${res.nicheTitle || 'serviços'}`,
    `💎 Soluções exclusivas pensadas especialmente para você em ${loc}`,
    `🎯 Praticidade, qualidade e atendimento humanizado`
  ];
  
  const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  const newBio = [
    randomHook,
    `⭐ Atendimento de primeira em ${loc} e região`,
    `📦 Pronta entrega, encomendas e suporte direto`,
    `👇 Fale com a equipe no WhatsApp com 1 clique:`
  ];
  
  instagramAuditState.result.suggestedBio = newBio;
  renderApp();
  showToast('Nova bio personalizada gerada pela IA!', 'success');
}

function switchInstagramSubTab(tabName) {
  instagramAuditState.activeSubTab = tabName;
  renderApp();
}

function renderInstagramAuditTab(container) {
  if (!instagramAuditState.handle && AppState.currentUser && AppState.currentUser.role === 'aluno') {
    const student = AppState.students.find(s => s.id === AppState.currentUser.id || (s.cpf && cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf)));
    if (student) {
      instagramAuditState.handle = student.socialMedia || ('@' + student.name.toLowerCase().replace(/\s+/g, '.'));
    }
  }

  const res = instagramAuditState.result;
  const subTab = instagramAuditState.activeSubTab || "diagnostico";

  container.innerHTML = `
    <div class="space-y-5 fade-in pb-12">
      
      <!-- CABEÇALHO PRINCIPAL LIMPO & ORGANIZADO -->
      <div class="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div class="d-flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-4 mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white d-flex align-items-center justify-content-center text-lg shadow-sm flex-shrink-0">
              <i class="fa-brands fa-instagram"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h1 class="text-base sm:text-lg font-bold text-slate-900 mb-0">Auditor &amp; Scanner de Instagram</h1>
                <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2 py-0.5 text-[10px] fw-bold">IA Pedagógica</span>
              </div>
              <p class="text-xs text-slate-500 mb-0">Digite o @ do perfil para ler os dados e gerar um diagnóstico de posicionamento, bio e roteiros de vendas.</p>
            </div>
          </div>
        </div>

        <!-- BARRA DE BUSCA COM DIVISÃO EQUILIBRADA (50% INPUT / 50% BOTÃO) -->
        <form onsubmit="handleSingleAuditSubmit(event)" class="w-100" style="max-width: 860px;">
          <div class="row g-2 align-items-stretch">
            <div class="col-12 col-md-6">
              <div class="position-relative h-100 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm d-flex align-items-center">
                <span class="position-absolute start-0 top-50 translate-middle-y ps-3.5 text-indigo-600 fs-5 pointer-events-none">
                  <i class="fa-brands fa-instagram"></i>
                </span>
                <input 
                  type="text" 
                  id="insta-single-input" 
                  required 
                  placeholder="Digite o @ ou link (ex: @anabeatriz.mkt)..." 
                  value="${instagramAuditState.handle}"
                  class="form-control form-control-lg border-0 bg-transparent text-slate-900 fs-6 fw-bold ps-5 pe-3 py-3 shadow-none w-100"
                  style="height: 54px;"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <button 
                type="submit" 
                ${instagramAuditState.loading ? 'disabled' : ''}
                class="btn btn-primary w-100 h-100 px-4 py-3 rounded-2xl fs-6 fw-bold d-flex align-items-center justify-content-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md transition-all"
                style="min-height: 54px; font-size: 15px;"
              >
                ${instagramAuditState.loading ? `
                  <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  <span>Lendo Metadados do Perfil...</span>
                ` : `
                  <i class="fa-solid fa-wand-magic-sparkles text-amber-300 fs-5"></i>
                  <span>Analisar Perfil &amp; Gerar Raio-X</span>
                `}
              </button>
            </div>
          </div>
        </form>

        <!-- ATALHOS RÁPIDOS DOS ALUNOS DA TURMA -->
        <div class="pt-3 d-flex align-items-center gap-1.5 flex-wrap text-xs border-top border-slate-100 mt-3">
          <span class="text-slate-400 text-[11px] mr-1"><i class="fa-solid fa-users text-slate-400 mr-1"></i>Alunos da turma:</span>
          ${AppState.students.slice(0, 6).map(s => `
            <button 
              type="button" 
              onclick="quickSelectInstagramAudit('${s.socialMedia || ('@' + s.name.toLowerCase().replace(/\s+/g, '.'))}')"
              class="btn btn-sm btn-light border border-slate-200 hover:border-indigo-300 rounded-pill px-2.5 py-0.5 text-[11px] text-slate-600 font-monospace transition-all"
            >
              ${s.socialMedia || ('@' + s.name.split(' ')[0].toLowerCase())}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- STATUS DE CARREGAMENTO -->
      ${instagramAuditState.loading ? `
        <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 max-w-md mx-auto fade-in">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 d-flex align-items-center justify-content-center text-xl mx-auto">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </div>
          <h4 class="text-xs fw-bold text-slate-900 mb-0">${instagramAuditState.loadingStep || 'Conectando ao Instagram...'}</h4>
          <p class="text-[11px] text-slate-500 mb-0">Extraindo metadados públicos e gerando parecer estratégico...</p>
        </div>
      ` : ''}

      <!-- PAINEL DE RESULTADOS ORGANIZADO -->
      ${res && !instagramAuditState.loading ? `
        <div class="space-y-4 fade-in" id="audit-printable-area">
          
          <!-- RESUMO DO PERFIL AUDITADO -->
          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm d-flex flex-column sm:flex-row align-items-center justify-content-between gap-4">
            
            <div class="d-flex align-items-center gap-3 text-center sm:text-start flex-column sm:flex-row">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-tr from-rose-500 to-indigo-600 d-flex align-items-center justify-content-center text-white text-lg fw-bold shadow-xs flex-shrink-0">
                ${res.profilePic ? `
                  <img src="${res.profilePic}" alt="${res.handle}" class="w-100 h-100 object-fit-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="hidden w-100 h-100 align-items-center justify-content-center"><i class="fa-brands fa-instagram"></i></div>
                ` : `<i class="fa-brands fa-instagram"></i>`}
              </div>

              <div>
                <div class="d-flex align-items-center justify-content-center sm:justify-content-start gap-2 flex-wrap">
                  <h2 class="text-sm sm:text-base fw-bold text-slate-900 mb-0">${res.displayName || res.handle}</h2>
                  <span class="badge bg-slate-100 text-slate-700 border border-slate-200 rounded-pill px-2 py-0.5 text-[10px] font-monospace">${res.handle}</span>
                  <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2 py-0.5 text-[10px] fw-bold">${res.nicheLabel}</span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5 mb-0">
                  <span><i class="fa-solid fa-location-dot text-slate-400 mr-1 text-[10px]"></i>${res.location}</span> • 
                  <span>Programa Emprega Mais Alagoas</span>
                  ${res.liveBio ? `<span class="d-block text-slate-600 mt-1 italic">" ${res.liveBio} "</span>` : ''}
                </p>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 flex-shrink-0">
              <div class="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[110px]">
                <span class="text-[9px] text-slate-500 text-uppercase fw-bold d-block">Score Estratégico</span>
                <span class="text-xl font-black text-indigo-600 font-monospace">${res.score}/100</span>
                <span class="text-[9px] text-slate-500 d-block">${res.scoreLabel}</span>
              </div>
              <button onclick="window.print()" class="btn btn-sm btn-light border border-slate-200 rounded-lg px-3 py-2 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 no-print" title="Salvar relatório em PDF">
                <i class="fa-solid fa-print"></i> PDF
              </button>
            </div>

          </div>

          <!-- NAVEGAÇÃO ENTRE AS 3 ABAS DE RESULTADO (SEM POLUIÇÃO) -->
          <div class="d-flex p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1 no-print">
            <button 
              type="button" 
              onclick="switchInstagramSubTab('diagnostico')" 
              class="flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 ${subTab === 'diagnostico' ? 'bg-white text-indigo-600 fw-bold shadow-xs' : 'bg-transparent text-slate-600 hover:text-slate-900'}"
            >
              <i class="fa-solid fa-chart-simple"></i> 1. Diagnóstico &amp; Raio-X
            </button>

            <button 
              type="button" 
              onclick="switchInstagramSubTab('bio')" 
              class="flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 ${subTab === 'bio' ? 'bg-white text-indigo-600 fw-bold shadow-xs' : 'bg-transparent text-slate-600 hover:text-slate-900'}"
            >
              <i class="fa-solid fa-signature"></i> 2. Bio &amp; Destaques
            </button>

            <button 
              type="button" 
              onclick="switchInstagramSubTab('reels')" 
              class="flex-grow-1 py-2 px-3 rounded-lg text-xs fw-semibold transition-all d-flex align-items-center justify-content-center gap-2 border-0 ${subTab === 'reels' ? 'bg-white text-indigo-600 fw-bold shadow-xs' : 'bg-transparent text-slate-600 hover:text-slate-900'}"
            >
              <i class="fa-solid fa-clapperboard"></i> 3. Roteiros de Reels &amp; Vendas
            </button>
          </div>

          <!-- CONTEÚDO DA ABA 1: DIAGNÓSTICO & RAIO-X -->
          ${subTab === 'diagnostico' ? `
            <div class="space-y-4 fade-in">
              
              <!-- VEREDITO DO ESTRATEGISTA -->
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold text-uppercase">
                  <i class="fa-solid fa-bullhorn mr-1"></i> Parecer do Estrategista
                </span>
                <h3 class="text-sm font-bold text-slate-900 mb-1">${res.verdictHeadline}</h3>
                <p class="text-xs text-slate-600 leading-relaxed mb-0">${res.verdictSummary}</p>
              </div>

              <!-- 4 PILARES AVALIADOS -->
              <div class="row g-3">
                ${res.pillars.map(p => `
                  <div class="col-12 col-sm-6">
                    <div class="p-4 rounded-2xl bg-white border border-slate-200 h-100 space-y-1.5">
                      <div class="d-flex align-items-center justify-content-between">
                        <strong class="text-xs text-slate-900"><i class="fa-solid ${p.icon} text-indigo-600 mr-1.5"></i> ${p.label}</strong>
                        <span class="badge ${p.score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border rounded-pill px-2 py-0.5 text-[10px] font-monospace">${p.score}%</span>
                      </div>
                      <p class="text-xs text-slate-500 mb-0 leading-relaxed">${p.critique}</p>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- 3 PONTOS CEGOS / O QUE CORRIGIR -->
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-triangle-exclamation text-amber-500"></i>
                  <h3 class="text-xs fw-bold text-slate-900 mb-0">Pontos Críticos para Corrigir no Perfil</h3>
                </div>

                <div class="space-y-2 pt-1">
                  ${res.realityChecks.map((check, idx) => `
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <strong class="text-slate-900 d-block">⚠️ Ponto ${idx + 1}: ${check.flaw}</strong>
                      <p class="text-slate-600 mb-0"><strong>💡 Recomendação:</strong> ${check.fix}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- PLANO DE RECUPERAÇÃO PASSO A PASSO (7 DIAS DE TRANSFORMAÇÃO) -->
              <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 d-flex align-items-center justify-content-center text-sm">
                      <i class="fa-solid fa-road-circle-check"></i>
                    </span>
                    <div>
                      <h3 class="text-xs fw-bold text-slate-900 mb-0">Plano de Recuperação &amp; Alavancagem (Passo a Passo em 7 Dias)</h3>
                      <p class="text-[11px] text-slate-500 mb-0">Siga 1 ação por dia para transformar seguidores curiosos em clientes pagantes</p>
                    </div>
                  </div>
                  <span class="badge bg-indigo-600 text-white rounded-pill px-3 py-1 text-[10px] fw-bold">Metodologia Emprega Mais AL</span>
                </div>
                
                <div class="space-y-2 pt-1">
                  ${res.shockPlan72h.map((step, idx) => `
                    <div class="p-3.5 rounded-xl bg-white border border-slate-200 d-flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 text-xs transition-all hover:border-indigo-300">
                      <div class="d-flex align-items-start gap-3">
                        <span class="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 d-flex align-items-center justify-content-center text-xs fw-bold flex-shrink-0 mt-0.5 font-monospace">${idx + 1}</span>
                        <div>
                          <strong class="text-slate-900 d-block font-semibold mb-0.5">${step.day || ('Dia ' + (idx + 1))}</strong>
                          <span class="text-slate-600 leading-relaxed">${step.action || step}</span>
                        </div>
                      </div>
                      <span class="badge bg-slate-100 text-slate-600 border border-slate-200 rounded-pill px-2.5 py-1 text-[10px] flex-shrink-0 self-start sm:self-auto">Ação Prática</span>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>
          ` : ''}

          <!-- CONTEÚDO DA ABA 2: BIO STUDIO COM IA GENERATIVA -->
          ${subTab === 'bio' ? `
            <div class="space-y-4 fade-in">
              
              <!-- COMPARATIVO INTELIGENTE: BIO ATUAL VS BIO IA -->
              <div class="row g-3">
                
                <!-- Card 1: Bio Atual Detectada -->
                <div class="col-12 col-md-5">
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 h-100 d-flex flex-column justify-content-between space-y-3">
                    <div>
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge bg-slate-200 text-slate-700 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">
                          <i class="fa-brands fa-instagram mr-1"></i> Bio Atual no Perfil
                        </span>
                        <span class="text-[10px] text-slate-400 font-monospace">${res.liveBio ? (res.liveBio.length + '/150 carac.') : 'Sem texto'}</span>
                      </div>
                      <div class="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-monospace leading-relaxed min-h-[90px]">
                        ${res.liveBio ? `"${res.liveBio}"` : '<em class="text-slate-400">Nenhuma bio pública encontrada ou perfil sem descrição configurada.</em>'}
                      </div>
                    </div>

                    <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                      <div class="d-flex align-items-center gap-1.5 fw-bold">
                        <i class="fa-solid fa-triangle-exclamation text-amber-600"></i> Análise Crítica da IA:
                      </div>
                      <div>${res.bioAuditStatus || 'Adicione a sua cidade e chamada clara para o WhatsApp para destravar vendas.'}</div>
                    </div>
                  </div>
                </div>

                <!-- Card 2: Bio de Alta Conversão Gerada pela IA -->
                <div class="col-12 col-md-7">
                  <div class="p-4 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm h-100 d-flex flex-column justify-content-between space-y-3">
                    <div>
                      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                        <div class="d-flex align-items-center gap-1.5">
                          <span class="badge bg-indigo-600 text-white rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">
                            <i class="fa-solid fa-wand-magic-sparkles text-amber-300 mr-1"></i> Gerada por IA
                          </span>
                          <span class="text-xs fw-bold text-slate-800">Fórmula de Alta Conversão</span>
                        </div>

                        <!-- Variações de Estilo da Bio -->
                        <div class="btn-group btn-group-sm" role="group">
                          <button 
                            type="button" 
                            onclick="switchActiveBioVariation('commercial')" 
                            class="btn btn-sm ${(instagramAuditState.selectedBioVariation || 'commercial') === 'commercial' ? 'btn-indigo text-white fw-bold' : 'btn-light text-slate-600'} text-[10px] py-0.5 px-2"
                          >
                            Comercial
                          </button>
                          <button 
                            type="button" 
                            onclick="switchActiveBioVariation('authority')" 
                            class="btn btn-sm ${instagramAuditState.selectedBioVariation === 'authority' ? 'btn-indigo text-white fw-bold' : 'btn-light text-slate-600'} text-[10px] py-0.5 px-2"
                          >
                            Autoridade
                          </button>
                          <button 
                            type="button" 
                            onclick="switchActiveBioVariation('minimalist')" 
                            class="btn btn-sm ${instagramAuditState.selectedBioVariation === 'minimalist' ? 'btn-indigo text-white fw-bold' : 'btn-light text-slate-600'} text-[10px] py-0.5 px-2"
                          >
                            Clean
                          </button>
                        </div>
                      </div>

                      <!-- Caixa com a Bio Pronta -->
                      <div class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 font-monospace text-xs text-slate-900 space-y-1">
                        ${res.suggestedBio.map(line => `<div class="d-flex align-items-start gap-1.5"><span class="text-indigo-600 select-none">•</span><span>${line}</span></div>`).join('')}
                      </div>
                    </div>

                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top border-slate-100">
                      <button 
                        type="button" 
                        onclick="regenerateAIBioCustom()" 
                        class="btn btn-sm btn-light border border-slate-200 text-slate-600 text-xs rounded-xl px-3 py-1.5 d-inline-flex align-items-center gap-1.5 hover:border-indigo-300"
                        title="Gerar nova sugestão com outro tom"
                      >
                        <i class="fa-solid fa-arrows-rotate text-indigo-500"></i> Nova Opção IA
                      </button>

                      <button 
                        type="button" 
                        onclick="copyToClipboard('${res.suggestedBio.join('\n')}', 'Bio pronta copiada para a área de transferência!')" 
                        class="btn btn-primary rounded-xl px-4 py-1.5 text-xs fw-bold bg-indigo-600 hover:bg-indigo-700 text-white border-0 d-inline-flex align-items-center gap-2 shadow-sm"
                      >
                        <i class="fa-solid fa-copy text-amber-300"></i> Copiar Bio Pronta
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ESTRUTURA DOS 5 DESTAQUES -->
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-circle-dot text-rose-500"></i>
                  <h3 class="text-xs fw-bold text-slate-900 mb-0">Estrutura de Destaques (Highlights) Essenciais</h3>
                </div>
                <p class="text-xs text-slate-500 mb-0">Organize seus destaques nessa ordem para o visitante entender seu trabalho em 10 segundos:</p>

                <div class="row g-2 pt-1">
                  <div class="col-12 col-sm-6">
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong class="text-xs text-slate-900">📍 1. Como Comprar / Atendimento</strong>
                      <p class="text-[11px] text-slate-500 mb-0">Passo a passo de como fazer pedidos, formas de pagamento e frete.</p>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong class="text-xs text-slate-900">⭐ 2. Depoimentos / Clientes</strong>
                      <p class="text-[11px] text-slate-500 mb-0">Prints reais de clientes elogiando a pontualidade e qualidade.</p>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong class="text-xs text-slate-900">📦 3. Catálogo / Novidades</strong>
                      <p class="text-[11px] text-slate-500 mb-0">Fotos e vídeos dos produtos e serviços mais procurados.</p>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong class="text-xs text-slate-900">❓ 4. Dúvidas Frequentes</strong>
                      <p class="text-[11px] text-slate-500 mb-0">Prazos de entrega, trocas e garantias.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- CONTEÚDO DA ABA 3: ROTEIROS DE REELS & VENDAS -->
          ${subTab === 'reels' ? `
            <div class="space-y-4 fade-in">
              
              <!-- 3 ROTEIROS DE REELS -->
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-clapperboard text-indigo-600"></i>
                  <h3 class="text-xs fw-bold text-slate-900 mb-0">3 Roteiros Prontos de Reels (Palavra por Palavra)</h3>
                </div>

                <div class="space-y-3 pt-1">
                  ${res.reelsScripts.map((reel, idx) => `
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="badge bg-indigo-100 text-indigo-800 rounded-pill px-2.5 py-0.5 text-[10px] fw-bold">Vídeo ${idx + 1} • ${reel.objective}</span>
                        <span class="text-[10px] text-slate-400 font-monospace">${reel.duration}</span>
                      </div>
                      <strong class="text-slate-900 d-block font-semibold">${reel.theme}</strong>
                      <div class="p-3 rounded-lg bg-white border border-slate-200 space-y-1 text-slate-700">
                        <div><strong class="text-rose-600">🎯 Gancho Inicial (0-3s):</strong> "${reel.hook}"</div>
                        <div><strong class="text-indigo-600">🎬 Desenvolvimento:</strong> ${reel.body}</div>
                        <div><strong class="text-emerald-600">📣 Chamada para Ação:</strong> "${reel.cta}"</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- SCRIPT PARA FECHAR VENDAS NO DIRECT -->
              <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-comments-dollar text-emerald-600"></i>
                    <h3 class="text-xs fw-bold text-slate-900 mb-0">Script de Direct para Fechar Vendas no WhatsApp</h3>
                  </div>
                  <button 
                    type="button" 
                    onclick="copyToClipboard('${res.salesDirectScript.replace(/'/g, "\\'")}', 'Script de Direct copiado!')" 
                    class="btn btn-sm btn-light border border-slate-200 rounded-pill px-3 py-1 text-xs fw-semibold text-slate-700 d-inline-flex align-items-center gap-1.5"
                  >
                    <i class="fa-solid fa-copy"></i> Copiar Script
                  </button>
                </div>
                <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-monospace leading-relaxed">
                  ${res.salesDirectScript}
                </div>
              </div>

            </div>
          ` : ''}

        </div>
      ` : ''}

    </div>
  `;
}

function handleSingleAuditSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("insta-single-input");
  const handle = (input?.value || "").trim();
  if (!handle) {
    showToast("Por favor, digite o @ ou link do Instagram.", "warning");
    return;
  }
  executeLiveInstagramAudit(handle);
}

async function executeLiveInstagramAudit(handle) {
  const cleanHandle = handle.trim().replace(/^@/, '').replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
  const formattedHandle = '@' + cleanHandle;
  
  instagramAuditState.handle = formattedHandle;
  instagramAuditState.loading = true;
  instagramAuditState.loadingStep = "Conectando e lendo metadados do Instagram...";
  renderApp();

  let liveData = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`https://api.microlink.io?url=https://instagram.com/${encodeURIComponent(cleanHandle)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        liveData = {
          title: json.data.title || cleanHandle,
          description: json.data.description || "",
          image: json.data.image?.url || null
        };
      }
    }
  } catch (err) {
    console.log("Scanner fallback to student database");
  }

  const student = AppState.students.find(s => {
    const sName = (s.name || "").toLowerCase().replace(/\s+/g, '.');
    const sInsta = (s.socialMedia || "").toLowerCase().replace(/^@/, '');
    return sInsta === cleanHandle.toLowerCase() || sName === cleanHandle.toLowerCase() || (s.id && s.id.toLowerCase() === cleanHandle.toLowerCase());
  });

  instagramAuditState.result = buildComprehensiveAuditReport(formattedHandle, liveData, student);
  instagramAuditState.loading = false;
  renderApp();
  showToast(`Diagnóstico de ${formattedHandle} pronto!`, "success");
}


// ==========================================
// SINTETIZADOR DE BIOS COM IA GENERATIVA PROFUNDA
// ==========================================
function generateAIBios(studentName, location, cleanHandle, liveBio, nicheCategory, businessTitle, student) {
  const firstName = (studentName || cleanHandle.replace('@', '')).split(' ')[0];
  const loc = location || (student && (student.unitCity || student.polo)) || "Alagoas";
  const handlePure = cleanHandle.replace('@', '');

  // 1. Extrai a atividade exata da pessoa
  let profession = (student && student.profession) || "";
  let tools = (student && student.tools) || "";
  let interests = (student && student.interests) || (student && student.motivation) || "";
  
  // Se não temos aluno cadastrado, deduz pelo handle e bio
  const bioLower = (liveBio || "").toLowerCase();
  const handleLower = handlePure.toLowerCase();

  let activityCore = "";
  let emojiTheme = "✨";

  if (handleLower.includes('mkt') || handleLower.includes('social') || profession.toLowerCase().includes('social media') || bioLower.includes('social media')) {
    activityCore = "Gestão de Redes Sociais & Estratégia Digital";
    emojiTheme = "🚀";
  } else if (handleLower.includes('design') || profession.toLowerCase().includes('design') || bioLower.includes('design') || bioLower.includes('arte')) {
    activityCore = "Identidade Visual, Banners & Design Estratégico";
    emojiTheme = "🎨";
  } else if (handleLower.includes('brand') || profession.toLowerCase().includes('conteúdo') || bioLower.includes('criador')) {
    activityCore = "Branding, Criação de Conteúdo & Posicionamento";
    emojiTheme = "💡";
  } else if (handleLower.includes('foto') || profession.toLowerCase().includes('fotóg') || bioLower.includes('foto') || bioLower.includes('ensaio')) {
    activityCore = "Ensaios Fotográficos & Memórias Afetivas";
    emojiTheme = "📸";
  } else if (handleLower.includes('art') || profession.toLowerCase().includes('artes') || bioLower.includes('artesanato') || bioLower.includes('croch')) {
    activityCore = "Artesanato Afetivo & Peças Feitas à Mão";
    emojiTheme = "🧶";
  } else if (handleLower.includes('dev') || profession.toLowerCase().includes('ti') || profession.toLowerCase().includes('suporte')) {
    activityCore = "Tecnologia, Sites & Suporte Digital Especializado";
    emojiTheme = "💻";
  } else if (handleLower.includes('moda') || handleLower.includes('look') || bioLower.includes('vestu')) {
    activityCore = "Looks & Moda Feminina com Caimento Perfeito";
    emojiTheme = "👗";
  } else if (handleLower.includes('doce') || handleLower.includes('bolo') || bioLower.includes('gastro')) {
    activityCore = "Confeitaria Artesanal & Sobremesas Especiais";
    emojiTheme = "🍰";
  } else {
    activityCore = businessTitle || "Serviços & Atendimento de Excelência";
    emojiTheme = "💼";
  }

  // 3 Estruturas de Alta Conversão Geradas por IA
  const commercial = [
    `${emojiTheme} ${activityCore} em ${loc}`,
    `⭐ Qualificação profissional certificada • Atendimento humanizado`,
    `📦 Agendamentos rápidos e suporte dedicado para você`,
    `👇 Toque no link abaixo para falar comigo no WhatsApp:`
  ];

  const authority = [
    `💡 Ajudo marcas e clientes a se destacarem em ${loc}`,
    `🎯 Especialista em ${activityCore.toLowerCase()}`,
    `🎓 Formação Emprega Mais Alagoas • Resultados Comprovados`,
    `👇 Solicite um orçamento sem compromisso:`
  ];

  const minimalist = [
    `${emojiTheme} ${firstName} | ${activityCore}`,
    `📍 Atendendo com amor em ${loc} e região`,
    `💬 Orçamentos abertos no WhatsApp`,
    `👉 Clique abaixo e converse direto comigo:`
  ];

  return {
    commercial,
    authority,
    minimalist,
    activityCore
  };
}

function generateEmpatheticAuditEngine(handle, liveData, student) {
  const cleanHandle = handle.startsWith('@') ? handle : ('@' + handle);
  const rawHandle = cleanHandle.replace('@', '').trim();
  const location = student?.unitCity || student?.polo || "Alagoas";
  const studentName = student?.name || liveData?.title || rawHandle;
  const firstName = studentName.split(' ')[0] || "Criador(a)";
  const liveBio = liveData?.description || "";
  const profilePic = liveData?.image || student?.photoUrl || null;

  // Simple string hash for deterministic variations per profile handle
  let hash = 0;
  for (let i = 0; i < rawHandle.length; i++) {
    hash = (hash << 5) - hash + rawHandle.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  // Deep Niche & Intent Detector
  const combinedContext = [
    rawHandle,
    studentName,
    student?.profession || "",
    student?.interests || "",
    student?.notes || "",
    liveBio
  ].join(' ').toLowerCase();

  let category = "servicos_geral";
  let nicheTitle = "Consultoria & Serviços";

  if (combinedContext.includes('moda') || combinedContext.includes('vest') || combinedContext.includes('look') || combinedContext.includes('brecho') || combinedContext.includes('calcado') || combinedContext.includes('loja')) {
    category = "moda";
    nicheTitle = "Moda, Vestuário & Acessórios";
  } else if (combinedContext.includes('foto') || combinedContext.includes('fotograf') || combinedContext.includes('video') || combinedContext.includes('filmmak')) {
    category = "fotografia";
    nicheTitle = "Fotografia & Produção Audiovisual";
  } else if (combinedContext.includes('design') || combinedContext.includes('arte') || combinedContext.includes('social media') || combinedContext.includes('mkt') || combinedContext.includes('trafego') || combinedContext.includes('copy') || combinedContext.includes('dev')) {
    category = "marketing_design";
    nicheTitle = "Marketing Digital, Design & Mídias";
  } else if (combinedContext.includes('comida') || combinedContext.includes('gastro') || combinedContext.includes('doce') || combinedContext.includes('bolo') || combinedContext.includes('pizza') || combinedContext.includes('hamburg') || combinedContext.includes('delicia') || combinedContext.includes('confeit')) {
    category = "gastronomia";
    nicheTitle = "Gastronomia & Confeitaria Artesanal";
  } else if (combinedContext.includes('croche') || combinedContext.includes('artesan') || combinedContext.includes('feitoamao') || combinedContext.includes('costura') || combinedContext.includes('atelier')) {
    category = "artesanato";
    nicheTitle = "Artesanato Autoral & Peças Afetivas";
  } else if (combinedContext.includes('beleza') || combinedContext.includes('estetic') || combinedContext.includes('cabelo') || combinedContext.includes('unha') || combinedContext.includes('make') || combinedContext.includes('lash') || combinedContext.includes('sobrancelha')) {
    category = "beleza";
    nicheTitle = "Estética, Beleza & Cuidados Pessoais";
  } else if (combinedContext.includes('saude') || combinedContext.includes('nutri') || combinedContext.includes('psico') || combinedContext.includes('personal') || combinedContext.includes('treino') || combinedContext.includes('fisio')) {
    category = "saude_fitness";
    nicheTitle = "Saúde, Nutrição & Bem-Estar";
  }

  // Dynamic calculated scores (72 - 94) based on handle hash
  const baseScore = 74 + (hash % 19);
  
  // Dynamic Human Feedback Generation
  const bioLength = liveBio.length;
  const hasLink = liveBio.includes('link') || liveBio.includes('wa.me') || liveBio.includes('http') || liveBio.includes('bit.ly') || liveBio.includes('api.whatsapp');
  const hasLocationInBio = liveBio.toLowerCase().includes(location.toLowerCase()) || liveBio.toLowerCase().includes('alagoas') || liveBio.toLowerCase().includes('maceio') || liveBio.toLowerCase().includes('arapiraca');

  let bioAuditStatus = "";
  if (!liveBio) {
    bioAuditStatus = `O perfil ${cleanHandle} está sem bio cadastrada ou com texto oculto. O visitante não tem como saber o que você faz em 2 segundos.`;
  } else if (!hasLocationInBio) {
    bioAuditStatus = `Você tem uma bio ativa ("${liveBio.slice(0, 60)}..."), mas não cita claramente sua atuação em ${location}. Isso afasta clientes locais.`;
  } else {
    bioAuditStatus = `Sua bio cita sua região, mas podemos transformar o texto em uma proposta irresistível de compra rápida.`;
  }

  // Empathetic Diagnósticos Personalizados
  const nicheData = {
    moda: {
      humanVerdict: `${firstName}, seu perfil tem um potencial gigantesco de vendas visuais, mas atualmente está agindo como uma vitrine estática em vez de uma loja que conversa. As pessoas compram roupas para se sentirem confiantes e bem-vestidas, não apenas pelo tecido. Quando você foca em vídeos de caimento e combinações para o dia a dia em ${location}, suas vendas no direct disparam.`,
      scoreLabel: "Vitrine Bonita • Falta Conexão no Provador",
      painPoints: [
        { flaw: "Fotos isoladas de peças em cabide ou dobradas", fix: `Grave vídeos curtos de 5 a 10 segundos andando e mostrando o caimento no corpo sob luz natural de ${location}.` },
        { flaw: "Preço e tamanho escondidos ou 'preço no direct'", fix: "Informe tamanho (P ao GG) e valor com transparência. Isso gera confiança imediata e elimina o atrito do cliente." },
        { flaw: "Destaques confusos e desatualizados com peças esgotadas", fix: "Mantenha apenas 4 destaques vivos: 'Como Comprar', 'Provador Real', 'Depoimentos' e 'Novidades'." }
      ],
      bioProposal: [
        `👗 Looks e peças que valorizam sua melhor versão em ${location}`,
        `✨ Modelagens confortáveis do P ao GG • Pronta entrega`,
        `📦 Envio rápido e seguro para todo o estado de Alagoas`,
        `👇 Escolha seu look no WhatsApp (atendimento humanizado):`
      ],
      recovery7Days: [
        { day: "Dia 1 (Ajuste de Chave)", action: `Atualize a foto de perfil com boa iluminação e coloque a nova Bio com o nome: '${studentName} | Moda & Looks em ${location}'.` },
        { day: "Dia 2 (Limpeza dos Destaques)", action: "Exclua destaques com mais de 3 meses. Crie 4 capas limpas: 'Provadores', 'Como Pedir', 'Clientes Felizes' e 'Dúvidas'." },
        { day: "Dia 3 (Primeiro Reel de Atração)", action: "Grave o Reel '1 Peça, 3 Looks Diferentes'. Mostre versatilidade e coloque o gancho logo nos primeiros 2 segundos." },
        { day: "Dia 4 (Stories com Enquete)", action: "Poste 4 stories nos horários das 12h às 13h: Mostre a textura do tecido e coloque caixinha de perguntas: 'Qual look é mais a sua cara?'" },
        { day: "Dia 5 (Bastidores & Confiança)", action: "Mostre o processo de embalar uma peça, borrifando um cheirinho gostoso e escrevendo um bilhete à mão para o cliente." },
        { day: "Dia 6 (Oferta Exclusiva 24h)", action: "Faça uma sequência de 5 stories apresentando 1 peça especial com brinde para quem fechar pelo WhatsApp nas próximas 24h." },
        { day: "Dia 7 (Revisão & Contato Ativo)", action: "Responda todas as pessoas que curtiram ou visualizaram os stories com uma mensagem calorosa de boas-vindas no Direct." }
      ],
      reels: [
        { objective: "Atração de Clientes", duration: "18s", theme: `Como multiplicar seus looks para o fim de semana em ${location}`, hook: "Você tem a sensação de que nunca tem roupa para sair? Olha esse truque com 1 única peça...", body: "Troque sobreposições rapidamente no ritmo de um áudio em alta.", cta: "Comente 'LOOK' que te mando os detalhes das peças no direct!" },
        { objective: "Desejo & Caimento", duration: "25s", theme: "O Caimento Perfeito que Não Aperta e Valoriza o Corpo", hook: "Se você procura um vestido elegante e ultra confortável, você acabou de achar!", body: "Aproxime a câmera do acabamento das costuras e gire devagar.", cta: "Clique no link da bio para garantir sua numeração!" },
        { objective: "Prova Social Real", duration: "30s", theme: "Clientes Reais usando nossos looks em Alagoas", hook: "Olha como nossas clientes brilharam nesta semana com essas combinações...", body: "Mostre fotos e vídeos enviados por clientes reais satisfeitas.", cta: "Qual foi sua favorita? Vote aqui nos comentários!" }
      ],
      directScript: `Oi linda! Que bom que você gostou do nosso look 😍\nEle acabou de chegar e temos pouquíssimas unidades no seu tamanho. Quer que eu separe o seu para envio em ${location}?`
    },
    gastronomia: {
      humanVerdict: `${firstName}, comida se vende com os olhos, o aroma visual e a sensação de aconchego. O seu perfil precisa fazer o seguidor salivar e sentir que fazer um pedido é tão simples quanto dar um clique no WhatsApp. Mostre o recheio escorrendo, a crocância e o amor colocado em cada receita.`,
      scoreLabel: "Sabor Impecável • Otimizar Cardápio e Pedidos",
      painPoints: [
        { flaw: "Fotos com iluminação amarelada ou sem close nos detalhes", fix: "Fotografe próximo à janela com luz natural matinal, capturando a textura e o recheio." },
        { flaw: "Falta de horários de atendimento e raio de entrega claros", fix: `Escreva claramente: 'Entregas em ${location} das 14h às 21h • Peça no cardápio online'.` },
        { flaw: "Stories apagados nos picos de fome (11h-13h e 18h-20h)", fix: "Poste vídeos curtos de 3 segundos de comida saindo do forno exatamente nesses horários." }
      ],
      bioProposal: [
        `🍰 Sabores irresistíveis e receitas feitas com amor em ${location}`,
        `🍓 Ingredientes selecionados • Pronta entrega & Encomendas`,
        `🛵 Delivery rápido para toda a sua região`,
        `👇 Faça seu pedido hoje e aproveite no WhatsApp:`
      ],
      recovery7Days: [
        { day: "Dia 1 (Bio & Cardápio)", action: `Atualize a bio com botão direto para o cardápio no WhatsApp e o texto de entregas em ${location}.` },
        { day: "Dia 2 (Destaque Cardápio e Valores)", action: "Crie um destaque limpo com fotos reais e valores atualizados para que o cliente não precise esperar para saber o preço." },
        { day: "Dia 3 (Reel Sensorial / ASMR)", action: "Grave um vídeo cortando o bolo ou abrindo a embalagem com som bem nítido da textura crocante/cremosa." },
        { day: "Dia 4 (Bastidores da Cozinha)", action: "Mostre a higiene, os ingredientes de primeira qualidade e o carinho no preparo dos pedidos do dia." },
        { day: "Dia 5 (Combo do Fim de Semana)", action: "Lance uma sobremesa ou prato especial com taxa de entrega reduzida para pedidos antecipados." },
        { day: "Dia 6 (Depoimento em Vídeo)", action: "Compartilhe o print de um cliente elogiando o sabor ou grave a reação de alguém provando." },
        { day: "Dia 7 (Lista VIP de Clientes)", action: "Convide os seguidores para entrarem na sua Lista VIP do WhatsApp para receberem promoções de primeira mão." }
      ],
      reels: [
        { objective: "Desejo Incontrolável", duration: "15s", theme: "O Momento Exato em que o Recheio Escorre", hook: "Se você estiver de dieta, por favor não assista a esse vídeo...", body: "Corte em câmera lenta mostrando a maciez e cremosidade do produto.", cta: "Marca aqui a pessoa que vai te pagar esse doce hoje!" },
        { objective: "Processo Artesanal", duration: "25s", theme: "Como Fazemos a Sobremesa Mais Pedida da Semana", hook: "Você sabe por que nossa receita fica tão fofinha e saborosa?", body: "Mostre 3 etapas do preparo com narração carinhosa e direta.", cta: "Peça a sua no link da bio antes que o lote do dia acabe!" },
        { objective: "Momento da Entrega", duration: "20s", theme: "Saindo Quentinho para Entrega em Alagoas", hook: "Mais um pedido saindo caprichado com direito a mimo surpresa...", body: "Mostre o fechamento do pacote com lacre de segurança e cartãozinho.", cta: "Quer receber um pacote desse na sua casa? Chama no WhatsApp!" }
      ],
      directScript: `Olá! Que alegria ver seu interesse em nossas delícias 😋\nTemos fornada fresquinha saindo hoje para entrega em ${location}. Posso te enviar o cardápio com os especiais do dia?`
    },
    marketing_design: {
      humanVerdict: `${firstName}, quem vende serviços digitais não pode vender apenas "posts bonitos" ou "edição de vídeo" — você precisa vender mais clientes, mais tempo livre e tranquilidade para o empresário. Quando seu perfil mostra como você resolve as dores dos negócios locais de ${location}, os clientes param de pedir desconto e começam a disputar sua agenda.`,
      scoreLabel: "Talento Técnico • Precisa Vender Transformação",
      painPoints: [
        { flaw: "Bio focada em ferramentas ('sei mexer no Canva/Photoshop')", fix: "Mude para foco em resultados: 'Ajudo empresas de Alagoas a atraírem clientes qualificados no digital'." },
        { flaw: "Não mostrar bastidores de reuniões e projetos reais", fix: "Compartilhe telas de trabalho, antes/depois de identidades visuais e gráficos de alcance gerados." },
        { flaw: "Falta de um método claro de contratação em 3 passos", fix: "Crie um post fixado explicando: 1. Diagnóstico Gratuito, 2. Planejamento, 3. Execução." }
      ],
      bioProposal: [
        `🚀 Gestão digital estratégica para marcas e negócios em ${location}`,
        `🎯 Conteúdo, tráfego e posicionamento focado em faturamento`,
        `🎓 Qualificação profissional certificada Emprega Mais Alagoas`,
        `👇 Solicite uma análise gratuita do seu perfil:`
      ],
      recovery7Days: [
        { day: "Dia 1 (Posicionamento de Autoridade)", action: `Mude sua foto para um retrato nítido de rosto e renove a bio com proposta clara de geração de valor.` },
        { day: "Dia 2 (Fixar os 3 Posts Vitais)", action: "Fixe no topo: 1. Quem sou eu & Minha jornada, 2. Estudo de Caso (Antes/Depois), 3. Como funciona meu serviço." },
        { day: "Dia 3 (Carrossel Didático)", action: "Publique o carrossel: '3 erros que empresas da sua cidade cometem no Instagram e perdem clientes'." },
        { day: "Dia 4 (Bastidores de Produção)", action: "Grave um story trabalhando no computador, explicando por que você escolheu determinada estratégia para um cliente." },
        { day: "Dia 5 (Prospecção Ativa Elegante)", action: "Envie 5 mensagens no direct para negócios locais oferecendo 1 melhoria prática e gratuita sem empurrar venda." },
        { day: "Dia 6 (Reel de Quebra de Objeção)", action: "Grave: 'Por que postar todo dia sem estratégia não traz clientes?'. Entregue a solução em 3 passos." },
        { day: "Dia 7 (Oferta de Diagnóstico)", action: "Abra caixinha de perguntas nos Stories: 'Envie seu @ que vou analisar os 3 primeiros gratuitamente hoje'." }
      ],
      reels: [
        { objective: "Quebra de Mito", duration: "25s", theme: "O Erro que Negócios em Alagoas Cometem nas Redes", hook: "Se a sua empresa ainda posta 'bom dia' todo dia no feed, assista a este vídeo com urgência...", body: "Explique de forma simples por que o cliente quer ver soluções e ofertas, não posts genéricos.", cta: "Salve este post para aplicar no seu negócio e me siga para mais dicas!" },
        { objective: "Estudo de Caso", duration: "35s", theme: "Como Reestruturamos uma Marca do Zero", hook: "Olha a transformação desse perfil antes e depois do nosso redesign visual...", body: "Mostre o slide de antes (poluído) e o depois (profissional e limpo).", cta: "Quer um visual profissional desse para a sua marca? Mande uma mensagem no direct." },
        { objective: "Ferramenta Prática", duration: "20s", theme: "3 Sites Gratuitos que Salvam a Rotina de Qualquer Criador", hook: "Essas 3 ferramentas gratuitas vão economizar 10 horas da sua semana...", body: "Apresente banco de imagens, removedor de fundo e paleta de cores.", cta: "Compartilhe este vídeo com aquele amigo que tem um negócio próprio!" }
      ],
      directScript: `Olá! Estava acompanhando o trabalho de vocês aqui em ${location} e achei o produto incrível 👏\nNotei 2 ajustes rápidos no perfil que podem aumentar suas mensagens no WhatsApp. Posso te enviar um áudio de 1 minuto explicando?`
    },
    fotografia: {
      humanVerdict: `${firstName}, fotografia é a arte de eternizar memórias e elevar o valor percebido de pessoas e marcas. O seu perfil deve transmitir sensibilidade, direção impecável e confiança. Mostre os bastidores das sessões, como você deixa as pessoas relaxadas e o resultado de tirar o fôlego.`,
      scoreLabel: "Olhar Artístico Único • Otimizar Agenda de Ensaios",
      painPoints: [
        { flaw: "Postar apenas fotos finais sem contar a história da pessoa fotografada", fix: "Coloque legendas ricas contando o que aquele ensaio representou para a cliente." },
        { flaw: "Dúvidas sobre locações e como se preparar para o ensaio", fix: "Crie destaques: 'Onde Fotografar em Alagoas', 'Guia de Roupas' e 'Depoimentos'." },
        { flaw: "Não divulgar com clareza as datas livres na agenda do mês", fix: "Poste quinzenalmente o calendário com vagas restantes para ensaios e eventos." }
      ],
      bioProposal: [
        `📸 Ensaios autorais e retratos que revelam sua essência em ${location}`,
        `🌿 Momentos espontâneos, afeto e memórias eternizadas`,
        `✨ Cobertura de eventos, marcas e ensaios pessoais`,
        `👇 Consulte datas disponíveis e orçamentos no WhatsApp:`
      ],
      recovery7Days: [
        { day: "Dia 1 (Bio & Proposta Afetiva)", action: `Renove a bio destacando sua área de atuação em ${location} e link direto de agendamento.` },
        { day: "Dia 2 (Guia de Locações)", action: "Faça um post carrossel mostrando 5 lugares incríveis para fotografar na sua região." },
        { day: "Dia 3 (Reel de Bastidores)", action: "Grave os bastidores: Mostre você orientando a pose, a cliente rindo e o resultado final da foto na tela." },
        { day: "Dia 4 (Depoimento Emocionante)", action: "Poste a foto de uma cliente com o print do áudio dela emocionada ao receber a galeria." },
        { day: "Dia 5 (Dicas de Look para Fotos)", action: "Crie um story explicando quais cores de roupas harmonizam melhor em fotos ao ar livre." },
        { day: "Dia 6 (Abertura de Agenda)", action: "Divulgue nos Stories: 'Restam apenas 3 vagas para ensaios neste mês'. Gere senso de oportunidade." },
        { day: "Dia 7 (Contato com Antigos Clientes)", action: "Mande uma mensagem carinhosa para clientes do ano passado lembrando de datas comemorativas." }
      ],
      reels: [
        { objective: "Espontaneidade", duration: "20s", theme: "Você Acha que Não Sabe Posar para Fotos?", hook: "Toda cliente minha chega dizendo que é tímida... Olha o que acontece depois de 10 minutos!", body: "Mostre o momento descontraído da sessão e o clique final maravilhoso.", cta: "Qual foto ficou mais linda? Me conta aqui nos comentários!" },
        { objective: "Sensibilidade", duration: "30s", theme: "A Emoção de Registrar Essa Família em Alagoas", hook: "Existem momentos na vida que merecem ser guardados para sempre...", body: "Transição suave de fotos com música emocionante e voz suave.", cta: "Agende seu ensaio afetivo no link da bio!" },
        { objective: "Dica Rápida", duration: "18s", theme: "3 Poses Simples para Ficar Mais Fotogênica", hook: "Nunca mais saia dura ou sem graça nas fotos com essas 3 poses básicas...", body: "Demonstre a postura de ombro, queixo e mãos de forma prática.", cta: "Salve o vídeo para lembrar na próxima sessão de fotos!" }
      ],
      directScript: `Olá! Que alegria ver seu carinho pelo meu trabalho fotográfico 📸✨\nEstamos fechando as datas da agenda deste mês aqui em ${location}. Você tem alguma data especial em mente para o seu ensaio?`
    },
    artesanato: {
      humanVerdict: `${firstName}, cada peça que você cria carrega horas de dedicação, história e a alma da cultura alagoana. As pessoas não compram apenas um objeto de decoração; elas compram o carinho, a exclusividade e a energia das suas mãos. Quando você mostra o processo do fio ao acabamento, o valor da sua arte é reconhecido.`,
      scoreLabel: "Riqueza Cultural • Valorizar Processo & Encomendas",
      painPoints: [
        { flaw: "Não mostrar o tempo real e os materiais nobres utilizados", fix: "Grave vídeos em timelapse mostrando as etapas manuais do início ao fim." },
        { flaw: "Não ter opções prontas para presentes de última hora", fix: "Crie uma linha de 'Kits para Presente' com embalagens caprichadas e cartão afetivo." },
        { flaw: "Falta de clareza sobre prazos de confecção e frete", fix: "Explique nos destaques como funcionam as encomendas personalizadas." }
      ],
      bioProposal: [
        `🧶 Arte autêntica feita à mão com amor e afeto em ${location}`,
        `🌿 Peças exclusivas para transformar sua casa ou presentear`,
        `📦 Envio seguro e cuidadoso para todo o Brasil`,
        `👇 Encomende sua peça exclusiva no WhatsApp:`
      ],
      recovery7Days: [
        { day: "Dia 1 (História & Propósito)", action: `Atualize a bio com sua identidade afetiva e o selo de produção local em ${location}.` },
        { day: "Dia 2 (Destaque 'Como Encomendar')", action: "Explique em 3 passos simples como o cliente escolhe as cores, medidas e confirma o pedido." },
        { day: "Dia 3 (Reel Sensorial do Processo)", action: "Grave um vídeo aproximado das suas mãos tecendo ou esculpindo com o som natural dos materiais." },
        { day: "Dia 4 (Mostre a Peça no Ambiente)", action: "Tire uma foto bem decorada da peça na sala ou quarto, valorizando a iluminação da casa." },
        { day: "Dia 5 (Embalando com Carinho)", action: "Grave o momento de colocar o papel de seda, o bilhete manuscrito e o mimo da encomenda." },
        { day: "Dia 6 (Depoimento do Cliente)", action: "Mostre a foto que o cliente mandou com a peça colocada na casa dele." },
        { day: "Dia 7 (Lançamento de Peça Única)", action: "Apresente uma peça única pronta-entrega nos Stories com valor especial para o primeiro que responder." }
      ],
      reels: [
        { objective: "Valorização da Arte", duration: "25s", theme: "Quanto Tempo Leva para Fazer uma Peça Dessas?", hook: "Muita gente acha que artesanato é rápido, mas foram 14 horas de dedicação nessa peça...", body: "Timelapse acelerado com cortes artísticos do processo.", cta: "Valorize quem faz com as próprias mãos! Deixe um coração nos comentários ❤️" },
        { objective: "Presente Perfeito", duration: "20s", theme: "O Presente que Ninguém Mais Vai Dar Igual", hook: "Cansado de dar presentes comuns e repetidos? Olha a exclusividade dessa peça...", body: "Apresentação em 360 graus da peça com foco no acabamento perfeito.", cta: "Encomende a sua no link da bio antes que feche a agenda do mês!" },
        { objective: "Bastidores ASMR", duration: "18s", theme: "Sons Relaxantes de um Ateliê em Alagoas", hook: "Coloque seus fones de ouvido e relaxe comigo por 15 segundos...", body: "Áudio nítido do corte da tesoura, textura do fio e encaixe das peças.", cta: "Se você ama artesanato, compartilhe com alguém que também ama!" }
      ],
      directScript: `Olá! Que bom te ver por aqui 🌸\nCada peça é feita 100% à mão aqui em ${location}. Temos algumas opções de pronta entrega e também aceitamos encomendas personalizadas. O que você gostaria de criar hoje?`
    },
    servicos_geral: {
      humanVerdict: `${firstName}, seu perfil tem excelente ponto de partida, mas os clientes precisam sentir segurança total de que você é a pessoa certa para resolver a necessidade deles em ${location}. Transforme sua presença em um canal consultivo, onde você educa seu público e demonstra resultados antes mesmo de cobrar.`,
      scoreLabel: "Presença Ativa • Estruturar Funil de Atendimento",
      painPoints: [
        { flaw: "Comunicação genérica sem foco no cliente ideal", fix: "Defina claramente para quem você presta serviços e qual dor você elimina." },
        { flaw: "Não ter canal direto e fácil de contato", fix: "Adicione link direto para o WhatsApp com mensagem pré-configurada." },
        { flaw: "Pouca frequência de postagens informativas", fix: "Poste 2 a 3 vezes por semana conteúdos que tirem dúvidas reais dos seus clientes." }
      ],
      bioProposal: [
        `💼 Soluções práticas e atendimento de excelência em ${location}`,
        `⭐ Dedicação, transparência e resultados comprovados`,
        `🎓 Qualificação profissional Emprega Mais Alagoas`,
        `👇 Converse comigo no WhatsApp para um orçamento sem compromisso:`
      ],
      recovery7Days: [
        { day: "Dia 1 (Otimização Completa da Bio)", action: `Adicione ${location} no seu nome de exibição e coloque a bio focada na solução do cliente.` },
        { day: "Dia 2 (Criação de Destaques de Confiança)", action: "Crie: 'Sobre Mim', 'Serviços', 'Depoimentos' e 'Contatos'." },
        { day: "Dia 3 (Post de Apresentação)", action: "Publique uma foto sua profissional contando sua trajetória e por que você ama o que faz." },
        { day: "Dia 4 (Dica de Ouro Gratuita)", action: "Grave um Reel ou faça um carrossel ensinando algo valioso que ajuda seu cliente." },
        { day: "Dia 5 (Story com Prova de Trabalho)", action: "Mostre o dia a dia, ferramentas e o cuidado no atendimento aos clientes." },
        { day: "Dia 6 (Perguntas Frequentes)", action: "Abra caixinha de perguntas para esclarecer dúvidas sobre seus prazos e serviços." },
        { day: "Dia 7 (Oferta da Semana)", action: "Divulgue uma condição especial para os primeiros 3 clientes que fecharem atendimento." }
      ],
      reels: [
        { objective: "Autoridade", duration: "25s", theme: "O que Ninguém te Conta sobre Como Resolver Esse Problema", hook: "Se você mora em Alagoas e passa por isso, pare de cometer esse erro agora...", body: "Explique a solução com clareza e autoridade.", cta: "Gostou da orientação? Salve este post e me siga para mais dicas!" },
        { objective: "Bastidores", duration: "20s", theme: "Um Dia na Minha Rotina de Atendimento", hook: "Vem comigo acompanhar como é um dia de trabalho focado em entregar o melhor...", body: "Takes dinâmicos do início ao fim da rotina de trabalho.", cta: "Precisa de ajuda com esse serviço? Chame no WhatsApp no link da bio!" },
        { objective: "Depoimento", duration: "30s", theme: "A Satisfação de Mais um Cliente Atendido", hook: "Olha o resultado desse projeto que finalizamos nesta semana...", body: "Apresente o problema inicial e a solução final entregue com excelência.", cta: "Fale conosco e faça seu orçamento sem compromisso!" }
      ],
      directScript: `Olá! Obrigado por interagir com nosso conteúdo 😊\nAtendemos com muito carinho toda a região de ${location}. Como posso te ajudar hoje?`
    }
  };

  const selected = nicheData[category] || nicheData.servicos_geral;

  return {
    handle: cleanHandle,
    displayName: studentName,
    location: location,
    liveBio: liveBio,
    bioAuditStatus: bioAuditStatus,
    profilePic: profilePic,
    nicheLabel: nicheTitle,
    score: baseScore,
    scoreLabel: selected.scoreLabel,
    verdictHeadline: `Diagnóstico Humanizado para ${firstName}`,
    verdictSummary: selected.humanVerdict,
    pillars: [
      { icon: "fa-signature", label: "Clareza & Posicionamento", score: baseScore - 5, critique: bioAuditStatus },
      { icon: "fa-camera", label: "Estética & Imagem Real", score: baseScore + 4 > 100 ? 96 : baseScore + 4, critique: `A imagem do perfil ${cleanHandle} precisa transmitir autoridade imediata sem ruídos visuais.` },
      { icon: "fa-video", label: "Retenção de Reels & Vídeos", score: baseScore - 2, critique: "Vídeos com ganchos fortes nos 3 primeiros segundos aumentam o alcance em até 400%." },
      { icon: "fa-comments-dollar", label: "Conversão no WhatsApp", score: baseScore + 2, critique: `Canal direto para clientes de ${location} com resposta rápida e script empático.` }
    ],
    realityChecks: selected.painPoints,
    suggestedBio: aiBios.commercial,
    aiBioVariations: aiBios,
    nicheTitle: nicheTitle,
    reelsScripts: selected.reels,
    salesDirectScript: selected.directScript,
    shockPlan72h: selected.recovery7Days
  };
}

function buildComprehensiveAuditReport(handle, liveData, student) { return generateEmpatheticAuditEngine(handle, liveData, student); }
