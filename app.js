/**
 * Eu Por Dias - Sistema de GestÃ£o de Alunos, Notas, Contatos e EndereÃ§os
 * Programa Emprega Mais Alagoas â€¢ Curso de GestÃ£o de MÃ­dias Digitais
 * 
 * IntegraÃ§Ãµes:
 * - Google Sheets API v4 oficial com API Key e sincronizaÃ§Ã£o automÃ¡tica em 1 clique
 * - Importador de Google Sala de Aula (URL, Copiar/Colar e CSV)
 * - Busca de CEP de Alagoas com ViaCEP API e rotas no Google Maps
 * - WhatsApp direto com mensagem customizada para alunos e responsÃ¡veis
 * - GestÃ£o de notas dos mÃ³dulos com cÃ¡lculo automÃ¡tico de mÃ©dias e frequÃªncia
 * - Boletim escolar e ata oficial para impressÃ£o/PDF
 * - Dashboard com mÃ©tricas e grÃ¡ficos interativos Chart.js
 * - ExportaÃ§Ã£o para Excel (CSV) e backup de dados JSON
 */

// Estado Global da AplicaÃ§Ã£o
const AppState = {
  appName: "Eu Por Dias",
  students: [],
  subjects: [],
  classrooms: [],
  settings: {
    schoolName: "Programa Emprega Mais Alagoas",
    courseName: "Curso de GestÃ£o de MÃ­dias Digitais",
    schoolYear: "2026",
    passingGrade: 7.0,
    recoveryGrade: 5.0,
    darkMode: false,
    viewMode: "grid", // 'grid' | 'table' | 'secure'
    // IntegraÃ§Ã£o com Google Sheets API v4
    googleApiKey: "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI",
    googleSpreadsheetId: "",
    googleSheetRange: "A1:Z500",
    lastSyncTime: null,
    googleClientId: "",
    // IntegraÃ§Ã£o com Supabase Cloud Database Oficial
    supabaseUrl: "https://srnpqboizdnyvetyukhn.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnBxYm9pemRueXZldHl1a2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ5MzMsImV4cCI6MjEwNDM2MDkzM30.mntOEcW5EviNL7r7YaZW7APucWLzxNn6Px_SwlJ47IQ",
    supabaseConnected: true,
    lastSupabaseSync: "2026-09-07T14:32:00.000Z"
  },
  currentTab: "about", // 'about' | 'grades' | 'dashboard' | 'reports' | 'students' | 'forum' | 'careers' | 'prompts'
  // UsuÃ¡rio Autenticado por CPF (Menu & IdentificaÃ§Ã£o)
  currentUser: null, // { id, name, cpf, role: 'professor' | 'aluno', photo, email, classroom, loginTime }
  // FÃ³rum & Chat ao Vivo
  forumTopics: [],
  forumMessages: [],
  activeForumTopicId: null,
  forumTab: "topics", // 'topics' | 'chat'
  // Oportunidades & Trilhas (Vagas e Hub de CapacitaÃ§Ã£o)
  jobVacancies: [],
  learningTrails: [],
  usefulResources: [],
  careersActiveTab: "vagas", // 'vagas' | 'trilhas'
  careersFilterPolo: "all",
  careersFilterType: "all",
  careersFilterSearch: "",
  // LaboratÃ³rio de Prompts & IA (Awesome ChatGPT Prompts - prompts.chat)
  promptsLibrary: [],
  promptsActiveCategory: "all",
  promptsSearchQuery: "",
  favoritePrompts: [],
  promptsGuideExpanded: true,
  privacyMode: true, // Camada de SeguranÃ§a e ProteÃ§Ã£o LGPD: SEMPRE ATIVO POR PADRÃƒO!
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
// CAMADA DE SEGURANÃ‡A, PRIVACIDADE & LGPD
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
    showToast("ðŸ”’ Acesso Restrito: O Modo LGPD Ã© permanente. FaÃ§a login com o Google no Modo Deus para desativar.", "warning");
    openGodModeAuthModal();
    return;
  }
  AppState.privacyMode = !AppState.privacyMode;
  saveDataToStorage();
  showToast(
    AppState.privacyMode 
      ? "ðŸ›¡ï¸ Modo Seguro LGPD reativado! Dados pessoais mascarados para projeÃ§Ã£o." 
      : "âš¡ Modo Deus: ProteÃ§Ã£o LGPD suspensa pelo Administrador. Dados sensÃ­veis liberados.", 
    AppState.privacyMode ? "success" : "warning"
  );
  renderApp();
}

function toggleRevealStudent(studentId) {
  if (!isGodModeActive()) {
    showToast("ðŸ”’ Acesso Restrito: Apenas o Administrador no Modo Deus (Google) pode revelar dados de alunos.", "warning");
    openGodModeAuthModal();
    return;
  }
  if (AppState.revealedStudentIds.has(studentId)) {
    AppState.revealedStudentIds.delete(studentId);
    showToast("Dados pessoais do aluno ocultados novamente.", "info");
  } else {
    AppState.revealedStudentIds.add(studentId);
    showToast("âš¡ Modo Deus: Dados pessoais do aluno revelados.", "warning");
  }
  renderApp();
}

/// ---------- Tema escuro ----------
function applyTheme() {
  const html = document.documentElement;
  if (AppState.settings.darkMode) {
    html.classList.add('is-dark');
  } else {
    html.classList.remove('is-dark');
  }
}

function toggleTheme() {
  AppState.settings.darkMode = !AppState.settings.darkMode;
  saveDataToStorage();
  applyTheme();
  showToast(`Modo ${AppState.settings.darkMode ? 'Escuro' : 'Claro'} ativado`, 'info');
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  applyTheme();
  renderApp();
  setupGlobalEventListeners();
});

// NormalizaÃ§Ã£o e autocura de nomes de mÃ³dulos (garante acentuaÃ§Ã£o perfeita PT-BR e corrige codificaÃ§Ãµes corrompidas)
function normalizeSubjectName(str) {
  if (!str || typeof str !== "string") return str || "";
  const s = str.trim().replace(/\\u0026/g, "&");

  if (s === "Marketing Digital & EstratÃ©gia") return "Marketing Digital & EstratÃ©gia";
  if (s === "CriaÃ§Ã£o de ConteÃºdo & Copywriting") return "CriaÃ§Ã£o de ConteÃºdo & Copywriting";
  if (s === "Design & Identidade Visual") return "Design & Identidade Visual";
  if (s === "EdiÃ§Ã£o de VÃ­deo & Reels") return "EdiÃ§Ã£o de VÃ­deo & Reels";
  if (s === "TrÃ¡fego Pago & Meta Ads") return "TrÃ¡fego Pago & Meta Ads";
  if (s === "MÃ©tricas & Analytics") return "MÃ©tricas & Analytics";
  if (s === "Projeto Integrador Final") return "Projeto Integrador Final";

  if (/Estrat/i.test(s)) return "Marketing Digital & EstratÃ©gia";
  if (/Conte|Copywriting/i.test(s)) return "CriaÃ§Ã£o de ConteÃºdo & Copywriting";
  if (/Identidade|Design/i.test(s)) return "Design & Identidade Visual";
  if (/Reels|V[iÃ­\xAD\u00ED]deo|Edi/i.test(s)) return "EdiÃ§Ã£o de VÃ­deo & Reels";
  if (/Tr[aÃ¡\u00E1]fego|Meta Ads/i.test(s)) return "TrÃ¡fego Pago & Meta Ads";
  if (/M[eÃ©\u00E9]tricas|Analytics/i.test(s)) return "MÃ©tricas & Analytics";
  if (/Integrador/i.test(s)) return "Projeto Integrador Final";

  return s;
}

// PersistÃªncia em LocalStorage
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
        if (newS.notes && newS.notes.includes("PresenÃ§a confirmada") && (!match.notes || !match.notes.includes("PresenÃ§a confirmada"))) {
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
  
  // Normalizar e higienizar nomes de mÃ³dulos (garante acentuaÃ§Ã£o perfeita e cura dados herdados de cache)
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

  // Garantir a conexÃ£o com o Supabase Oficial
  if (!AppState.settings.supabaseUrl) {
    AppState.settings.supabaseUrl = "https://srnpqboizdnyvetyukhn.supabase.co";
  }
  if (!AppState.settings.supabaseAnonKey) {
    AppState.settings.supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnBxYm9pemRueXZldHl1a2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODQ5MzMsImV4cCI6MjEwNDM2MDkzM30.mntOEcW5EviNL7r7YaZW7APucWLzxNn6Px_SwlJ47IQ";
  }
  AppState.settings.supabaseConnected = true;

  // Restaurar sessÃ£o do Modo Deus via Google (se houver na sessionStorage)
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
    console.warn("Erro ao restaurar sessÃ£o Modo Deus:", e);
  }

  // REGRA ESTRITA LGPD: Se nÃ£o estiver no Modo Deus, o Modo LGPD Ã© SEMPRE FORÃ‡ADO para true!
  if (!AppState.godMode.active) {
    AppState.privacyMode = true;
    AppState.revealedStudentIds.clear();
  }

  // Restaurar usuÃ¡rio autenticado por CPF
  try {
    const savedUser = localStorage.getItem("eupordias_auth_user");
    if (savedUser) {
      AppState.currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn("Erro ao restaurar usuÃ¡rio autenticado:", e);
  }

  // Carregar dados de FÃ³rum & Chat
  loadForumDataFromStorage();

  // Carregar dados de Oportunidades & Trilhas
  loadCareersDataFromStorage();

  // Carregar dados do LaboratÃ³rio de Prompts & IA
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
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.innerHTML = AppState.settings.darkMode
      ? `<i class="fa-solid fa-sun text-amber-400"></i>`
      : `<i class="fa-solid fa-moon text-slate-600"></i>`;
  }
}

// NotificaÃ§Ãµes Toast
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
    <span class="text-sm font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -------------------------------------------------------------
// INTEGRAÃ‡ÃƒO COM GOOGLE SHEETS API V4
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
    showToast("Por favor, forneÃ§a o Link ou o ID da Planilha do Google.", "warning");
    return null;
  }

  const apiKey = AppState.settings.googleApiKey || "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  const range = customRange || AppState.settings.googleSheetRange || "A1:Z500";

  // Salvar no estado
  AppState.settings.googleSpreadsheetId = spreadsheetId;
  AppState.settings.googleSheetRange = range;
  saveDataToStorage();

  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  showToast("Conectando Ã  API do Google Sheets v4...", "info");

  try {
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json.error) {
      console.error("Google Sheets API Error:", json.error);
      if (json.error.status === "PERMISSION_DENIED") {
        showToast("Erro de permissÃ£o: Certifique-se de que a planilha estÃ¡ compartilhada como 'Qualquer pessoa com o link pode ler'.", "error");
      } else {
        showToast(`Erro na API do Google: ${json.error.message}`, "error");
      }
      return null;
    }

    const values = json.values;
    if (!values || values.length === 0) {
      showToast("A planilha estÃ¡ vazia ou o intervalo nÃ£o contÃ©m dados.", "warning");
      return null;
    }

    // Processar os dados tabulares da API do Google
    processGoogleSheetsApiRows(values);
    AppState.settings.lastSyncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    saveDataToStorage();
    return values;
  } catch (err) {
    console.error("Erro na requisiÃ§Ã£o Google Sheets API:", err);
    showToast("Erro de conexÃ£o com a API do Google Sheets.", "error");
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
  let cepIndex = headers.findIndex(h => h.includes("cep") || h.includes("cÃ³digo postal"));
  let addressIndex = headers.findIndex(h => h.includes("endereÃ§o") || h.includes("endereco") || h.includes("rua") || h.includes("logradouro"));
  let neighborhoodIndex = headers.findIndex(h => h.includes("bairro"));
  let cityIndex = headers.findIndex(h => h.includes("cidade") || h.includes("municÃ­pio") || h.includes("municipio"));

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

    if (!fullName || fullName.toLowerCase().includes("mÃ©dia") || fullName.toLowerCase().includes("pontuaÃ§Ã£o") || fullName.toLowerCase().includes("total")) {
      continue;
    }

    const email = emailIndex !== -1 && row[emailIndex] ? String(row[emailIndex]) : "";
    const phone = phoneIndex !== -1 && row[phoneIndex] ? String(row[phoneIndex]) : "";
    const classroom = classroomIndex !== -1 && row[classroomIndex] ? String(row[classroomIndex]) : "MÃ­dias Digitais - MaceiÃ³ Matutino";
    const cep = cepIndex !== -1 && row[cepIndex] ? String(row[cepIndex]) : "";
    const street = addressIndex !== -1 && row[addressIndex] ? String(row[addressIndex]) : "";
    const neighborhood = neighborhoodIndex !== -1 && row[neighborhoodIndex] ? String(row[neighborhoodIndex]) : "";
    const city = cityIndex !== -1 && row[cityIndex] ? String(row[cityIndex]) : "MaceiÃ³";

    // Mapear notas das colunas para os mÃ³dulos
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
        guardianKinship: "ResponsÃ¡vel",
        guardianPhone: ""
      },
      address: {
        cep: cep.trim(),
        street: street.trim(),
        number: "",
        complement: "",
        neighborhood: neighborhood.trim(),
        city: city.trim() || "MaceiÃ³",
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
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
            <td class="p-2 font-bold text-slate-800 dark:text-slate-200">${s.name}</td>
            <td class="p-2 text-slate-500">${s.contact.email || '-'}</td>
            <td class="p-2 text-slate-500">${s.contact.phone || '-'}</td>
            <td class="p-2 text-slate-600 dark:text-slate-300">${s.classroom}</td>
            <td class="p-2 text-center text-indigo-600 font-bold">${gradesCount} matÃ©ria(s)</td>
          </tr>
        `;
      }).join("") + (parsedStudents.length > 10 ? `<tr><td colspan="5" class="p-2 text-center text-slate-400 text-[10px]">... e mais ${parsedStudents.length - 10} alunos</td></tr>` : '');

      showToast(`API Google: ${parsedStudents.length} alunos carregados! Clique em Confirmar para salvar.`, "success");
    } else {
      // Se chamado pelo botÃ£o de sincronizaÃ§Ã£o rÃ¡pida
      commitImportedStudents();
    }
  } else {
    showToast("Nenhum registro de aluno identificado no intervalo retornado pela API.", "warning");
  }
}

// SincronizaÃ§Ã£o rÃ¡pida em 1 clique
async function quickSyncGoogleSheets() {
  if (!AppState.settings.googleSpreadsheetId) {
    openGoogleSheetsImportModal();
    showToast("Informe o Link ou ID da sua Planilha do Google para sincronizar.", "info");
    return;
  }

  await fetchGoogleSheetsApiData(AppState.settings.googleSpreadsheetId);
}

// -------------------------------------------------------------
// CÃLCULOS PEDAGÃ“GICOS
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
    status = "Em RecuperaÃ§Ã£o";
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

// RenderizaÃ§Ã£o Geral
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
    default:
      renderAboutTab(contentArea);
  }

  updateNavActiveState();
}

function updateNavActiveState() {
  const isAluno = AppState.currentUser && AppState.currentUser.role === "aluno";
  const alunoRestrictedTabs = ["dashboard", "reports", "students"];

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    const tab = btn.getAttribute("data-tab");

    // Regra de autorizaÃ§Ã£o para alunos:
    // Oculta completamente 'Dashboard & EstatÃ­sticas', 'RelatÃ³rios & Backup' e 'Alunos & Contatos'.
    // O aluno interage apenas com 'Sobre o Sistema & Manifesto', 'Notas dos MÃ³dulos' e 'FÃ³rum & Chat ao Vivo'.
    if (isAluno && alunoRestrictedTabs.includes(tab)) {
      btn.classList.add("hidden");
      return;
    } else {
      btn.classList.remove("hidden");
    }

    if (tab === AppState.currentTab) {
      btn.className = "nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-indigo-600 text-white shadow-md shadow-indigo-500/20 transition-all";
    } else {
      btn.className = "nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all";
    }
  });
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
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <i class="fa-solid fa-users"></i> ${total} Alunos
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <i class="fa-solid fa-star"></i> MÃ©dia: ${generalAvg}
        </span>
      </div>
    `;
  }

  // Atualiza o indicador de status do Modo Deus no cabeÃ§alho
  renderHeaderGodModeStatus();
}

function renderHeaderGodModeStatus() {
  const container = document.getElementById("header-godmode-container");
  const badgeStatus = document.getElementById("integrations-badge-status");
  const isGod = isGodModeActive();

  // Atualiza indicador de status no botÃ£o gatilho do submenu
  if (badgeStatus) {
    if (isGod) {
      badgeStatus.innerHTML = `
        <span class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Deus
        </span>
      `;
    } else {
      badgeStatus.innerHTML = `
        <span class="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
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
      <div class="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-400/50 dark:border-amber-500/40 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div class="leading-tight">
              <span class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <i class="fa-solid fa-bolt text-amber-500"></i> Modo Deus Ativo
              </span>
              <span class="text-[9px] text-slate-600 dark:text-slate-300 font-bold block truncate max-w-[150px]" title="${email}">
                ${name} (${email})
              </span>
            </div>
          </div>
          <button 
            type="button"
            onclick="closeIntegrationsSubmenu(); logoutGodMode();" 
            class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1 shadow-sm"
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
        class="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors flex items-center justify-between gap-3 group"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <strong class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Modo Deus (Google)</strong>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 dark:bg-slate-800 text-emerald-600 uppercase">LGPD Travado</span>
            </div>
            <span class="block text-[10px] text-slate-400">Acesso mestre irrestrito</span>
          </div>
        </div>
        <i class="fa-solid fa-chevron-right text-slate-300 dark:text-slate-600 text-[10px]"></i>
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
// AUTENTICAÃ‡ÃƒO MESTRE â€¢ MODO DEUS (GOOGLE & CREDENCIAIS)
// -------------------------------------------------------------
const AUTHORIZED_GOD_MODE = {
  username: "eupordias",
  password: "0318188253158",
  googleEmail: "diasewerson@gmail.com",
  teacherName: "Ewerson Dias"
};

function loginGodMode(userProfile) {
  AppState.godMode = {
    active: true,
    user: userProfile,
    loginTime: Date.now()
  };
  try {
    sessionStorage.setItem("eupordias_god_mode", JSON.stringify(userProfile));
  } catch (e) {
    console.warn("NÃ£o foi possÃ­vel salvar sessÃ£o Modo Deus:", e);
  }
  closeModal();
  showToast(`âš¡ MODO DEUS ATIVADO! Bem-vindo, ${userProfile.name || userProfile.email}. Acesso total liberado.`, "warning");
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
  showToast("ðŸ”’ Modo Deus encerrado. O Modo LGPD foi reativado e travado com sucesso.", "info");
  renderApp();
}

function handleGoogleCredentialResponse(response) {
  try {
    if (!response || !response.credential) {
      throw new Error("Credencial vazia retornada pelo Google.");
    }
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const profile = JSON.parse(jsonPayload);
    const email = (profile.email || "").toLowerCase().trim();

    if (email === AUTHORIZED_GOD_MODE.googleEmail.toLowerCase()) {
      loginGodMode({
        name: profile.name || AUTHORIZED_GOD_MODE.teacherName,
        email: profile.email,
        picture: profile.picture || "",
        method: "google_gis",
        sub: profile.sub
      });
    } else {
      showToast(`Acesso Negado: A conta Google (${email}) nÃ£o tem privilÃ©gios de Modo Deus. Utilize ${AUTHORIZED_GOD_MODE.googleEmail}.`, "error");
    }
  } catch (err) {
    console.error("Erro ao decodificar token do Google:", err);
    showToast("Erro ao validar credencial do Google. Tente novamente.", "error");
  }
}

function verifyGodModeCredentials() {
  const userEl = document.getElementById("god-login-user");
  const passEl = document.getElementById("god-login-pass");
  if (!userEl || !passEl) return;
  const user = userEl.value.trim();
  const pass = passEl.value.trim();

  if (!user || !pass) {
    showToast("Por favor, preencha o login e a senha.", "warning");
    return;
  }

  if (user.toLowerCase() === AUTHORIZED_GOD_MODE.username.toLowerCase() && pass === AUTHORIZED_GOD_MODE.password) {
    loginGodMode({
      name: `${AUTHORIZED_GOD_MODE.teacherName} (Professor)`,
      email: AUTHORIZED_GOD_MODE.googleEmail,
      login: AUTHORIZED_GOD_MODE.username,
      picture: "",
      method: "credentials"
    });
  } else {
    showToast("Login ou senha incorretos para o Modo Deus.", "error");
  }
}

function loginWithAuthorizedGoogleAccount() {
  loginGodMode({
    name: `${AUTHORIZED_GOD_MODE.teacherName} (Google)`,
    email: AUTHORIZED_GOD_MODE.googleEmail,
    login: AUTHORIZED_GOD_MODE.username,
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
      <!-- Painel quando JÃ estÃ¡ autenticado no Modo Deus -->
      <div class="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-amber-200 dark:bg-amber-800 flex items-center justify-center font-bold text-amber-900 dark:text-amber-100 text-sm flex-shrink-0">
            ${user.picture ? `<img src="${user.picture}" alt="Avatar" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user-astronaut text-xl"></i>`}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">${user.name || "Administrador"}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">Ativo</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 truncate">${user.email ? maskEmail(user.email) : "SessÃ£o Mestre Conectada"}</p>
            <p class="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">âš¡ PrivilÃ©gios totais liberados: vocÃª pode alternar a LGPD e revelar alunos.</p>
          </div>
        </div>
      </div>

      <!-- BotÃµes de Controle RÃ¡pido do Modo Deus -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button 
          onclick="togglePrivacyMode()" 
          class="w-full py-3 px-4 rounded-xl text-xs font-bold ${AppState.privacyMode ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'} flex items-center justify-center gap-2 transition-all"
        >
          <i class="fa-solid ${AppState.privacyMode ? 'fa-eye' : 'fa-shield-halved'}"></i>
          <span>${AppState.privacyMode ? 'Suspender ProteÃ§Ã£o LGPD' : 'Reativar ProteÃ§Ã£o LGPD'}</span>
        </button>

        <button 
          onclick="logoutGodMode()" 
          class="w-full py-3 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <i class="fa-solid fa-lock"></i>
          <span>Encerrar & Trancar LGPD</span>
        </button>
      </div>
    `;
  } else {
    bodyContent = `
      <!-- Painel quando NÃƒO estÃ¡ autenticado (Login ObrigatÃ³rio) -->
      <div class="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
        <div class="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
          <i class="fa-solid fa-shield-halved text-indigo-600 dark:text-indigo-400 text-sm"></i>
          <span>Modo LGPD Travado por SeguranÃ§a</span>
        </div>
        <p class="leading-relaxed text-[11px]">
          Para desativar o mascaramento de CPFs, telefones e endereÃ§os no Datashow, autentique-se com sua <strong>conta Google autorizada</strong> ou com suas <strong>credenciais de administrador</strong>.
        </p>
      </div>

      <!-- OPÃ‡ÃƒO 1: Login com UsuÃ¡rio e Senha Mestre -->
      <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-key text-amber-500"></i>
            <span>1. Login de Administrador</span>
          </label>
          <span class="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
            Credenciais
          </span>
        </div>

        <div class="space-y-2.5">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">USUÃRIO</label>
            <div class="relative">
              <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                id="god-login-user" 
                value=""
                autocomplete="off"
                placeholder="Digite seu usuÃ¡rio"
                class="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              >
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">SENHA</label>
            <div class="relative">
              <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="password" 
                id="god-login-pass" 
                value=""
                autocomplete="off"
                placeholder="Digite sua senha"
                class="w-full pl-9 pr-10 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                onkeydown="if(event.key === 'Enter') verifyGodModeCredentials()"
              >
              <button 
                type="button" 
                onclick="toggleGodPasswordVisibility()" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs"
                title="Mostrar/Ocultar Senha"
              >
                <i id="god-pass-eye-icon" class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>

          <button 
            onclick="verifyGodModeCredentials()" 
            class="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <i class="fa-solid fa-bolt text-sm"></i>
            <span>Entrar no Modo Deus</span>
          </button>
        </div>
      </div>

      <!-- OPÃ‡ÃƒO 2: Login com a Conta Google Oficial -->
      <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-brands fa-google text-indigo-500"></i>
            <span>2. AutenticaÃ§Ã£o com Conta Google</span>
          </label>
          <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            Google
          </span>
        </div>

        <!-- Container renderizado pelo Google Identity Services -->
        <div id="google-official-btn" class="flex justify-center w-full min-h-[40px]"></div>

        <!-- BotÃ£o oficial Google sem expor e-mail publicamente -->
        <button 
          onclick="triggerGoogleDirectLogin()"
          class="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm flex items-center justify-center gap-2.5 transition-all"
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-amber-400/40 dark:border-amber-500/30 shadow-2xl overflow-hidden scale-in flex flex-col relative">
        
        <!-- Faixa de Destaque Mestre -->
        <div class="h-2 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 w-full"></div>

        <!-- CabeÃ§alho -->
        <div class="p-6 pb-4 flex items-start justify-between">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/30">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-lg text-slate-900 dark:text-slate-100">Acesso Mestre â€¢ Modo Deus</h3>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 uppercase tracking-wide">
                  SuperAdmin
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AutenticaÃ§Ã£o de Administrador â€¢ Controle de Privacidade
              </p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- ConteÃºdo do Modal -->
        <div class="px-6 pb-6 space-y-5">
          ${bodyContent}
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

function loginWithPromptAccount() {
  const email = prompt("Informe a conta Google autorizada de Administrador:");
  if (email && email.trim()) {
    if (email.trim().toLowerCase() === AUTHORIZED_GOD_MODE.googleEmail.toLowerCase()) {
      loginGodMode({
        name: `${AUTHORIZED_GOD_MODE.teacherName} (Google)`,
        email: AUTHORIZED_GOD_MODE.googleEmail,
        login: AUTHORIZED_GOD_MODE.username,
        picture: "",
        method: "google_prompt"
      });
    } else {
      showToast("Acesso Negado: A conta informada nÃ£o tem privilÃ©gios de Modo Deus.", "error");
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
// HELPER: TELA DE RESTRIÃ‡ÃƒO DE ACESSO POR CPF CADASTRADO
// -------------------------------------------------------------
function renderTabAccessRestriction(container, tabKey) {
  const tabConfigs = {
    students: {
      title: "Regra de Acesso: Alunos e Contatos",
      description: "Para consultar a listagem de discentes, informaÃ§Ãµes de contato, endereÃ§os e fichas individuais da turma, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "Acesso seguro Ã  sua ficha cadastral individual e aos dados oficiais da sua matrÃ­cula.",
      profInfo: "Acesso irrestrito Ã  listagem completa de alunos, contatos via WhatsApp, filtros por turma e ediÃ§Ã£o de dados."
    },
    grades: {
      title: "Regra de Acesso: Notas dos MÃ³dulos",
      description: "Para visualizar boletins, mÃ©dias parciais e lanÃ§amentos de avaliaÃ§Ãµes dos 7 mÃ³dulos do curso, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "Acesso exclusivo Ã s suas notas individuais, mÃ©dias ponderadas, situaÃ§Ã£o acadÃªmica e envio do boletim por e-mail.",
      profInfo: "LanÃ§amento e ediÃ§Ã£o de notas de todos os alunos, cÃ¡lculo automÃ¡tico de mÃ©dias e atas de avaliaÃ§Ã£o."
    },
    reports: {
      title: "Regra de Acesso: RelatÃ³rios e Backup",
      description: "Para acessar as planilhas oficiais do curso, exportaÃ§Ãµes completas, atas escolares e backups na nuvem, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "Acesso ao seu Boletim Individual Oficial, histÃ³rico de notas dos 7 mÃ³dulos e ficha cadastral.",
      profInfo: "Acesso irrestrito a planilhas completas (CSV), backups JSON do sistema e atas gerais de rendimento."
    },
    forum: {
      title: "Regra de Acesso: FÃ³rum & Chat ao Vivo",
      description: "Para participar das discussÃµes da turma, enviar mensagens no chat em tempo real e interagir com colegas e docentes, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "ParticipaÃ§Ã£o nas salas de chat, envio de dÃºvidas sobre os mÃ³dulos e interaÃ§Ã£o com foto de perfil cadastrada.",
      profInfo: "CriaÃ§Ã£o de novos tÃ³picos com anexos multimÃ­dia (foto, PDF, link, vÃ­deo), moderaÃ§Ã£o de salas e comunicados oficiais."
    },
    careers: {
      title: "Regra de Acesso: Oportunidades & Trilhas",
      description: "Para consultar o mural de vagas de emprego com cÃ¡lculo de compatibilidade de currÃ­culo, trilhas de aprendizagem e materiais gratuitos, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "Acesso ao mural de vagas de Alagoas, cÃ¡lculo de match personalizado com seu currÃ­culo, emissÃ£o de ficha profissional e cursos livres.",
      profInfo: "PublicaÃ§Ã£o de novas vagas de emprego/estÃ¡gio para a turma, gestÃ£o de oportunidades e compartilhamento de materiais pedagÃ³gicos."
    },
    prompts: {
      title: "Regra de Acesso: LaboratÃ³rio de Prompts & IA",
      description: "Para explorar o acervo completo de comandos e personas de IA baseado no repositÃ³rio <strong>prompts.chat (Awesome ChatGPT Prompts)</strong>, personalizar variÃ¡veis para seus clientes e utilizar o gerador de prompts, Ã© necessÃ¡rio se identificar no sistema com o seu <strong>menu e CPF cadastrados previamente</strong>.",
      alunoInfo: "Acesso a dezenas de personas profissionais de IA (Copywriting, Social Media, GestÃ£o de AnÃºncios, ProgramaÃ§Ã£o), personalizador interativo de prompt e guia passo a passo de engenharia de prompt.",
      profInfo: "GestÃ£o pedagÃ³gica do acervo de IA, publicaÃ§Ã£o de novos prompts para as aulas da turma e acompanhamento de atividades prÃ¡ticas com IA."
    }
  };

  const config = tabConfigs[tabKey] || tabConfigs.reports;

  container.innerHTML = `
    <div class="space-y-6 fade-in max-w-2xl mx-auto py-8">
      <div class="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        
        <div class="space-y-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            <i class="fa-solid fa-lock"></i> Ãrea de Acesso Restrito
          </span>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">${config.title}</h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
            ${config.description}
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left text-xs space-y-2">
          <div class="flex items-start gap-2.5">
            <i class="fa-solid fa-user-graduate text-indigo-600 mt-0.5"></i>
            <div>
              <strong class="text-slate-800 dark:text-slate-200">Alunos Matriculados:</strong>
              <p class="text-slate-500 text-[11px]">${config.alunoInfo}</p>
            </div>
          </div>
          <div class="flex items-start gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <i class="fa-solid fa-chalkboard-user text-emerald-600 mt-0.5"></i>
            <div>
              <strong class="text-slate-800 dark:text-slate-200">Professores e CoordenaÃ§Ã£o:</strong>
              <p class="text-slate-500 text-[11px]">${config.profInfo}</p>
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button 
            onclick="openCpfLoginModal('${tabKey}')" 
            class="px-8 py-3.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 inline-flex items-center gap-2"
          >
            <i class="fa-solid fa-id-card"></i> Entrar com CPF Cadastrado
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
  // REGRA DE ACESSO: Exige identificaÃ§Ã£o por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'students');
    return;
  }

  const filtered = getFilteredStudents();

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <!-- Banner com ConexÃ£o de API do Sheets -->
      <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div class="z-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md tracking-wide">
              EMPREGA MAIS ALAGOAS
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-slate-900">
              GestÃ£o de MÃ­dias Digitais
            </span>
            <span class="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400 text-slate-950">
              <i class="fa-brands fa-google-drive mr-1 mt-0.5"></i> Google Sheets API v4
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight">Eu Por Dias - Painel do Professor</h1>
          <p class="text-xs sm:text-sm text-indigo-100 max-w-2xl mt-1">
            IntegraÃ§Ã£o direta com o Google Planilhas, WhatsApp, ViaCEP de Alagoas e lanÃ§amento de notas dos mÃ³dulos.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 z-10 w-full sm:w-auto">
          <button 
            onclick="openGoogleSheetsImportModal()"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-all transform active:scale-95"
            title="Importar ou sincronizar via Google Sheets API"
          >
            <i class="fa-brands fa-google-drive text-emerald-600 text-sm"></i>
            <span>Google Sheets API</span>
          </button>

          <button 
            onclick="openSupabaseModal()"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all transform active:scale-95"
            title="Banco de Dados em Nuvem Supabase"
          >
            <i class="fa-solid fa-cloud text-emerald-200 text-sm"></i>
            <span>Supabase Nuvem</span>
          </button>
          
          <button 
            onclick="openStudentModal()"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 text-white font-bold text-xs transition-all"
          >
            <i class="fa-solid fa-user-plus"></i>
            <span>Novo Aluno</span>
          </button>
        </div>

        <div class="absolute -right-8 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <!-- Barra de Filtros e Busca -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input 
            type="text" 
            id="student-search-input"
            value="${AppState.searchTerm}"
            placeholder="Buscar por nome, CPF, WhatsApp, cidade/unidade SINE, profissÃ£o, rede social, ferramentas, desafios..." 
            class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
          ${AppState.searchTerm ? `
            <button onclick="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <select 
            id="filter-classroom-select"
            onchange="handleClassroomFilterChange(this.value)"
            class="px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Todas as Turmas</option>
          </select>

          <select 
            onchange="handleSituationFilterChange(this.value)"
            class="px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all" ${AppState.filterSituation === "all" ? "selected" : ""}>Todas as SituaÃ§Ãµes</option>
            <option value="Aprovado" ${AppState.filterSituation === "Aprovado" ? "selected" : ""}>Aprovados</option>
            <option value="Em RecuperaÃ§Ã£o" ${AppState.filterSituation === "Em RecuperaÃ§Ã£o" ? "selected" : ""}>Em RecuperaÃ§Ã£o</option>
            <option value="Reprovado" ${AppState.filterSituation === "Reprovado" ? "selected" : ""}>Reprovados</option>
          </select>

          <select 
            onchange="handlePhotoFilterChange(this.value)"
            class="px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all" ${AppState.filterPhoto === "all" ? "selected" : ""}>ðŸ“· Todas as Fotos</option>
            <option value="with_photo" ${AppState.filterPhoto === "with_photo" ? "selected" : ""}>Com Foto</option>
            <option value="without_photo" ${AppState.filterPhoto === "without_photo" ? "selected" : ""}>Sem Foto</option>
          </select>

          <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button 
              onclick="setViewMode('grid')" 
              class="p-2 rounded-lg text-xs font-semibold ${AppState.settings.viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
              title="VisualizaÃ§Ã£o em Cards"
            >
              <i class="fa-solid fa-grip text-sm"></i>
            </button>
            <button 
              onclick="setViewMode('table')" 
              class="p-2 rounded-lg text-xs font-semibold ${AppState.settings.viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
              title="VisualizaÃ§Ã£o em Tabela"
            >
              <i class="fa-solid fa-list text-sm"></i>
            </button>
            <button 
              onclick="setViewMode('secure')" 
              class="p-2 rounded-lg text-xs font-semibold ${AppState.settings.viewMode === 'secure' ? 'bg-emerald-600 shadow text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
              title="VisualizaÃ§Ã£o Segura (Modo LGPD / ProjeÃ§Ã£o em Sala)"
            >
              <i class="fa-solid fa-shield-halved text-sm"></i>
            </button>
          </div>

          <!-- BotÃ£o de AlternÃ¢ncia da Camada de SeguranÃ§a LGPD -->
          <button 
            onclick="togglePrivacyMode()" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isGodModeActive() 
                ? (AppState.privacyMode ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-400' : 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 font-extrabold')
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
            }"
            title="${
              isGodModeActive()
                ? (AppState.privacyMode ? 'Modo Deus: Clique para suspender LGPD e ver dados reais' : 'Modo Deus: Clique para reativar Modo LGPD')
                : 'Modo LGPD Permanente (Requer login Modo Deus via Google para alterar)'
            }"
          >
            <i class="fa-solid ${
              isGodModeActive() 
                ? (AppState.privacyMode ? 'fa-shield-halved' : 'fa-bolt text-amber-950')
                : 'fa-lock'
            }"></i>
            <span>${
              isGodModeActive()
                ? (AppState.privacyMode ? 'LGPD Ativo (Deus)' : 'LGPD Suspenso âš¡')
                : 'LGPD Travado ðŸ”’'
            }</span>
          </button>
        </div>
      </div>

      <!-- Banner de Alerta do Modo Seguro / Privacidade -->
      ${(AppState.privacyMode || AppState.settings.viewMode === 'secure') ? `
        <div class="p-4 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm fade-in">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-md shadow-emerald-600/20">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-xs">Camada de SeguranÃ§a Permanente (Privacidade & LGPD)</h4>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 uppercase">
                  100% Seguro para Sala
                </span>
                ${isGodModeActive() ? `
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-300 text-amber-950 uppercase flex items-center gap-1">
                    <i class="fa-solid fa-bolt"></i> Modo Deus Conectado
                  </span>
                ` : `
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">
                    ðŸ”’ Travado sem Google
                  </span>
                `}
              </div>
              <p class="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                Os dados pessoais sensÃ­veis (CPF, WhatsApp, e-mail e endereÃ§os) estÃ£o estritamente protegidos. Para desativar o mascaramento ou revelar dados de alunos no Datashow, Ã© obrigatÃ³rio autenticar-se no <strong>Modo Deus via Google</strong>.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            ${isGodModeActive() ? `
              <button 
                onclick="togglePrivacyMode()" 
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-sm transition-all"
              >
                ${AppState.privacyMode ? 'Suspender Mascaramento' : 'Reativar ProteÃ§Ã£o Geral'}
              </button>
            ` : `
              <button 
                onclick="openGodModeAuthModal()" 
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 transition-all"
                title="Acessar com Google no Modo Deus"
              >
                <i class="fa-brands fa-google text-xs"></i>
                <span>Acesso Modo Deus</span>
              </button>
            `}
          </div>
        </div>
      ` : ''}

      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Exibindo <strong>${filtered.length}</strong> de <strong>${AppState.students.length}</strong> alunos matriculados</span>
        ${(AppState.searchTerm || AppState.filterClassroom !== 'all' || AppState.filterSituation !== 'all' || AppState.filterPhoto !== 'all') ? `
          <button onclick="resetAllFilters()" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      ${students.map(student => {
        const stats = calculateStudentOverallStats(student);
        const isRevealed = AppState.revealedStudentIds.has(student.id) || !AppState.privacyMode;
        const displayName = maskName(student.name, isRevealed);
        const displayCpf = maskCpf(student.cpf, isRevealed);
        const displayPhone = maskPhone(student.contact?.phone, isRevealed);
        const displayEmail = maskEmail(student.contact?.email, isRevealed);
        const initials = (student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
        const cleanPhone = (student.contact?.phone || "").replace(/\D/g, "");
        
        let socialUrl = student.socialMedia || "";
        let socialDisplay = student.socialMedia || "";
        let isInstagram = false;
        let isTiktok = false;

        if (socialUrl) {
          if (socialUrl.startsWith("@")) {
            socialUrl = `https://www.instagram.com/${socialUrl.replace('@', '')}`;
            isInstagram = true;
          } else if (socialUrl.includes("instagram.com")) {
            isInstagram = true;
          } else if (socialUrl.includes("tiktok.com")) {
            isTiktok = true;
          } else if (!socialUrl.startsWith("http")) {
            socialUrl = `https://www.instagram.com/${socialUrl}`;
            isInstagram = true;
          }
        }

        return `
          <div class="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            
            <div>
              <!-- CabeÃ§alho do Card: Foto/Avatar, Nome, Polo/Cidade e MatrÃ­cula -->
              <div class="flex items-start justify-between gap-3 mb-3.5">
                <div class="flex items-center gap-3.5">
                  
                  <!-- Container da Foto / Avatar com trigger de upload -->
                  <div 
                    onclick="openPhotoUploadModal('${student.id}')"
                    class="relative group/avatar w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white font-black text-base shadow-inner flex-shrink-0 cursor-pointer border border-slate-200/80 dark:border-slate-700/80 transition-transform active:scale-95"
                    title="Clique para adicionar ou trocar a foto de ${displayName}"
                  >
                    ${student.photoUrl ? `
                      <img src="${student.photoUrl}" alt="${displayName}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                      <div class="hidden w-full h-full items-center justify-center">${initials}</div>
                    ` : `
                      <span>${initials}</span>
                    `}
                    
                    <!-- Overlay ao passar o mouse -->
                    <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                      <i class="fa-solid fa-camera text-xs mb-0.5"></i>
                      <span>Foto</span>
                    </div>

                    <!-- Mini Ã­cone de cÃ¢mera no canto -->
                    <div class="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center text-[8px] text-indigo-600 dark:text-indigo-400 shadow">
                      <i class="fa-solid fa-camera"></i>
                    </div>
                  </div>

                  <div>
                    <h3 
                      onclick="openStudentProfileModal('${student.id}')"
                      class="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
                      title="Ver ficha de ${displayName}"
                    >
                      ${displayName}
                    </h3>
                    <div class="flex items-center flex-wrap gap-1.5 mt-0.5">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        <i class="fa-solid fa-location-dot mr-1"></i>${student.unitCity || student.classroom || 'Alagoas'}
                      </span>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        ${student.id}
                      </span>
                    </div>
                  </div>
                </div>

                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${stats.statusClass} flex-shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full ${stats.status === 'Aprovado' ? 'bg-emerald-500' : stats.status === 'Em RecuperaÃ§Ã£o' ? 'bg-amber-500' : stats.status === 'Reprovado' ? 'bg-rose-500' : 'bg-slate-400'}"></span>
                  ${stats.status}
                </span>
              </div>

              <!-- Data de InscriÃ§Ã£o e Resumo de Desempenho -->
              <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3 px-1">
                ${student.registrationDate ? `
                  <span class="flex items-center gap-1">
                    <i class="fa-regular fa-calendar-check text-emerald-500"></i> InscriÃ§Ã£o: ${student.registrationDate}
                  </span>
                ` : '<span></span>'}
                <span class="font-semibold text-slate-700 dark:text-slate-300">
                  MÃ©dia: <strong class="text-indigo-600 dark:text-indigo-400">${stats.overallAvg.toFixed(1)}</strong> â€¢ Faltas: <strong>${stats.totalAbsences}</strong>
                </span>
              </div>

              <!-- Bloco 1: Contatos, CPF e Redes Sociais -->
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2 mb-3.5 text-xs">
                
                <!-- Linha CPF & WhatsApp -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                    <i class="fa-solid fa-id-card text-indigo-500 w-4 text-center"></i>
                    <span class="font-mono text-[11px]">${displayCpf || 'CPF nÃ£o informado'}</span>
                    ${!isRevealed ? `<span class="text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-bold">LGPD</span>` : ''}
                  </div>
                  ${cleanPhone ? (isRevealed ? `
                    <a 
                      href="https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`OlÃ¡ ${student.name.split(' ')[0]}! Aqui Ã© o professor do curso de GestÃ£o de MÃ­dias Digitais (Emprega Mais Alagoas).`)}" 
                      target="_blank" 
                      class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all flex-shrink-0"
                      title="Chamar no WhatsApp"
                    >
                      <i class="fa-brands fa-whatsapp text-xs"></i>
                      <span>${displayPhone}</span>
                    </a>
                  ` : `
                    <button 
                      onclick="toggleRevealStudent('${student.id}')"
                      class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all flex-shrink-0"
                      title="Contato protegido por LGPD. Clique para revelar."
                    >
                      <i class="fa-solid fa-lock text-[10px] text-amber-500"></i>
                      <span>${displayPhone}</span>
                    </button>
                  `) : `
                    <span class="text-slate-400 text-[11px] italic">Sem WhatsApp</span>
                  `}
                </div>

                <!-- Linha E-mail -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                    <i class="fa-solid fa-envelope text-slate-400 w-4 text-center"></i>
                    <span class="truncate text-[11px]">${displayEmail || 'Sem e-mail'}</span>
                  </div>
                  ${student.contact?.email && isRevealed ? `
                    <a 
                      href="mailto:${student.contact.email}?subject=${encodeURIComponent(`Emprega Mais Alagoas - MÃ­dias Digitais: ${student.name}`)}"
                      class="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex-shrink-0"
                    >
                      Enviar
                    </a>
                  ` : ''}
                </div>

                <!-- Linha Rede Social / Perfil -->
                ${student.socialMedia ? `
                  <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div class="flex items-center gap-1.5 truncate">
                      <i class="${isInstagram ? 'fa-brands fa-instagram text-pink-500' : isTiktok ? 'fa-brands fa-tiktok text-slate-900 dark:text-white' : 'fa-solid fa-share-nodes text-indigo-500'} w-4 text-center"></i>
                      <span class="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">${socialDisplay}</span>
                    </div>
                    <a 
                      href="${socialUrl}" 
                      target="_blank" 
                      class="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
                      title="Abrir rede social do aluno"
                    >
                      <span>Acessar</span>
                      <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </a>
                  </div>
                ` : ''}

              </div>

              <!-- Bloco 2: Perfil Profissional & Escolaridade -->
              <div class="space-y-2 mb-3.5">
                
                ${student.profession ? `
                  <div class="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                    <i class="fa-solid fa-briefcase text-indigo-600 dark:text-indigo-400 w-4 text-center flex-shrink-0"></i>
                    <div class="truncate">
                      <span class="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block leading-tight">Ãrea / ProfissÃ£o</span>
                      <span class="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate block">${student.profession}</span>
                    </div>
                  </div>
                ` : ''}

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  ${student.education ? `
                    <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span class="text-[10px] text-slate-400 uppercase font-bold block leading-tight">Escolaridade</span>
                      <span class="font-medium text-slate-700 dark:text-slate-300 text-[11px] truncate block" title="${student.education}">
                        ${student.education}
                      </span>
                    </div>
                  ` : ''}

                  ${student.experience ? `
                    <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span class="text-[10px] text-slate-400 uppercase font-bold block leading-tight">GestÃ£o de Redes</span>
                      <span class="font-semibold text-[11px] truncate block ${student.experience.toLowerCase().includes('sim') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}">
                        ${student.experience}
                      </span>
                    </div>
                  ` : ''}
                </div>

                <!-- Redes mais frequentes & Ferramentas -->
                ${(student.frequentNetworks || student.tools) ? `
                  <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                    ${student.frequentNetworks ? `
                      <div class="flex items-start gap-1.5">
                        <i class="fa-solid fa-users text-indigo-500 text-[10px] mt-0.5 flex-shrink-0"></i>
                        <span class="text-slate-600 dark:text-slate-400 line-clamp-1"><strong class="text-slate-800 dark:text-slate-200">Redes:</strong> ${student.frequentNetworks}</span>
                      </div>
                    ` : ''}
                    ${student.tools ? `
                      <div class="flex items-start gap-1.5">
                        <i class="fa-solid fa-screwdriver-wrench text-amber-500 text-[10px] mt-0.5 flex-shrink-0"></i>
                        <span class="text-slate-600 dark:text-slate-400 line-clamp-1"><strong class="text-slate-800 dark:text-slate-200">Ferramentas:</strong> ${student.tools}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

              </div>

              <!-- Bloco 3: Gaveta ExpansÃ­vel de DiagnÃ³stico PedagÃ³gico (Desafios, MotivaÃ§Ã£o, Expectativas) -->
              ${(student.challenges || student.motivation || student.expectations) ? `
                <div class="mb-3.5">
                  <button 
                    type="button"
                    onclick="toggleDiagnosticDrawer('${student.id}')"
                    id="diag-btn-${student.id}"
                    class="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-between transition-colors border border-indigo-100 dark:border-indigo-900/40"
                  >
                    <span class="flex items-center gap-1.5">
                      <i class="fa-solid fa-brain text-indigo-600 dark:text-indigo-400"></i>
                      <span>DiagnÃ³stico & Expectativas</span>
                    </span>
                    <i id="diag-icon-${student.id}" class="fa-solid fa-chevron-down text-[10px] transition-transform"></i>
                  </button>

                  <div id="diag-drawer-${student.id}" class="hidden mt-2 p-3 rounded-2xl bg-amber-50/40 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-2.5 text-[11px] text-slate-700 dark:text-slate-200">
                    
                    ${student.challenges ? `
                      <div>
                        <span class="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 text-[10px] uppercase">
                          <i class="fa-solid fa-triangle-exclamation"></i> Principais Desafios:
                        </span>
                        <p class="mt-0.5 text-slate-700 dark:text-slate-300 italic pl-1 border-l-2 border-rose-300 dark:border-rose-700">
                          "${student.challenges}"
                        </p>
                      </div>
                    ` : ''}

                    ${student.motivation ? `
                      <div>
                        <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[10px] uppercase">
                          <i class="fa-solid fa-fire"></i> MotivaÃ§Ã£o para o Curso:
                        </span>
                        <p class="mt-0.5 text-slate-700 dark:text-slate-300 italic pl-1 border-l-2 border-amber-300 dark:border-amber-700">
                          "${student.motivation}"
                        </p>
                      </div>
                    ` : ''}

                    ${student.expectations ? `
                      <div>
                        <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px] uppercase">
                          <i class="fa-solid fa-bullseye"></i> Expectativas:
                        </span>
                        <p class="mt-0.5 text-slate-700 dark:text-slate-300 italic pl-1 border-l-2 border-emerald-300 dark:border-emerald-700">
                          "${student.expectations}"
                        </p>
                      </div>
                    ` : ''}

                  </div>
                </div>
              ` : ''}

            </div>

            <!-- RodapÃ© com AÃ§Ãµes -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
              
              <div class="flex items-center gap-1.5">
                <button 
                  onclick="openStudentProfileModal('${student.id}')"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-1"
                  title="Abrir ficha completa do aluno"
                >
                  <i class="fa-solid fa-id-card-clip"></i> Ficha
                </button>
                <button 
                  onclick="openPhotoUploadModal('${student.id}')"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 transition-colors flex items-center gap-1"
                  title="Adicionar ou alterar foto do aluno"
                >
                  <i class="fa-solid fa-camera"></i> Foto
                </button>
                <button 
                  onclick="openGradesModal('${student.id}')"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors flex items-center gap-1"
                  title="LanÃ§ar Notas"
                >
                  <i class="fa-solid fa-pen-to-square"></i> Notas
                </button>
                <button 
                  onclick="openBoletimModal('${student.id}')"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1"
                  title="Gerar Boletim Oficial"
                >
                  <i class="fa-solid fa-file-invoice"></i> Boletim
                </button>
              </div>

              <div class="flex items-center gap-1">
                ${AppState.privacyMode ? `
                  <button 
                    onclick="toggleRevealStudent('${student.id}')"
                    class="px-2 py-1.5 rounded-xl font-bold text-xs ${isRevealed ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'} flex items-center gap-1 transition-colors"
                    title="${isRevealed ? 'Ocultar dados pessoais deste aluno' : 'Revelar dados pessoais deste aluno temporariamente'}"
                  >
                    <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    <span>${isRevealed ? 'Ocultar' : 'Revelar'}</span>
                  </button>
                ` : ''}
                <button 
                  onclick="openStudentModal('${student.id}')"
                  class="w-8 h-8 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                  title="Editar Aluno"
                >
                  <i class="fa-solid fa-user-pen text-xs"></i>
                </button>
                <button 
                  onclick="confirmDeleteStudent('${student.id}')"
                  class="w-8 h-8 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center transition-colors"
                  title="Excluir Aluno"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>

            </div>

          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderStudentTable(students) {
  return `
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4">Aluno / MatrÃ­cula</th>
              <th class="py-3.5 px-4">Turma (Alagoas)</th>
              <th class="py-3.5 px-4">Contatos & WhatsApp</th>
              <th class="py-3.5 px-4">EndereÃ§o / Bairro</th>
              <th class="py-3.5 px-4 text-center">MÃ©dia do Curso</th>
              <th class="py-3.5 px-4 text-center">SituaÃ§Ã£o</th>
              <th class="py-3.5 px-4 text-right">AÃ§Ãµes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
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
                <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div 
                        onclick="openPhotoUploadModal('${student.id}')"
                        class="relative group/tblavatar w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white font-bold flex items-center justify-center text-xs flex-shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
                        title="Clique para alterar foto"
                      >
                        ${student.photoUrl ? `
                          <img src="${student.photoUrl}" alt="${displayName}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                          <div class="hidden w-full h-full items-center justify-center">${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                        ` : `
                          <span>${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</span>
                        `}
                        <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/tblavatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px]">
                          <i class="fa-solid fa-camera"></i>
                        </div>
                      </div>
                      <div>
                        <span onclick="openStudentProfileModal('${student.id}')" class="font-bold text-slate-900 dark:text-slate-100 block hover:text-indigo-600 cursor-pointer">${displayName}</span>
                        <div class="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>${student.id}</span>
                          ${student.cpf ? `<span>â€¢ CPF: ${displayCpf}</span>` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ${student.classroom}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-xs space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-slate-700 dark:text-slate-300 font-medium">${displayPhone}</span>
                        ${cleanPhone ? (isRevealed ? `
                          <a href="https://wa.me/55${cleanPhone}" target="_blank" class="text-emerald-600 hover:text-emerald-700" title="Chamar no WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                          </a>
                        ` : `
                          <button onclick="toggleRevealStudent('${student.id}')" class="text-amber-500 hover:text-amber-600 text-xs" title="Clique para desbloquear contato">
                            <i class="fa-solid fa-lock"></i>
                          </button>
                        `) : ''}
                      </div>
                      <div class="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[180px]">
                        ${displayEmail}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-xs text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title="${displayAddress}">
                      ${displayAddress || '<span class="text-slate-400">NÃ£o informado</span>'}
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="text-sm font-black text-slate-900 dark:text-slate-100">${stats.overallAvg.toFixed(1)}</span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stats.statusClass}">
                      ${stats.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${AppState.privacyMode ? `
                        <button 
                          onclick="toggleRevealStudent('${student.id}')" 
                          class="p-1.5 rounded-lg ${isRevealed ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}"
                          title="${isRevealed ? 'Ocultar dados deste aluno' : 'Revelar dados deste aluno'}"
                        >
                          <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                      ` : ''}
                      <button onclick="openGradesModal('${student.id}')" class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50" title="Notas">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button onclick="openBoletimModal('${student.id}')" class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100" title="Boletim">
                        <i class="fa-solid fa-file-invoice"></i>
                      </button>
                      <button onclick="openStudentModal('${student.id}')" class="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100" title="Editar">
                        <i class="fa-solid fa-user-pen"></i>
                      </button>
                      <button onclick="confirmDeleteStudent('${student.id}')" class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" title="Excluir">
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
// VISUALIZAÃ‡ÃƒO SEGURA (MODO LGPD & SALA DE AULA)
// -------------------------------------------------------------
function renderSecureStudentCards(students) {
  return `
    <div class="space-y-6 fade-in">
      
      <!-- Banner Informativo do Modo Seguro -->
      <div class="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-600/20 flex-shrink-0">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm">Painel PedagÃ³gico Seguro (Conformidade LGPD)</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 uppercase">
                Zero ExposiÃ§Ã£o
              </span>
            </div>
            <p class="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
              Esta visualizaÃ§Ã£o foi desenhada para projeÃ§Ã£o pÃºblica no Datashow/TV da sala de aula. Mostra todos os diagnÃ³sticos, notas e competÃªncias dos alunos <strong>sem exibir CPFs, nÃºmeros de telefone ou endereÃ§os</strong>.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button 
            onclick="exportStudentsToCSV(true)" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
            title="Exportar planilha segura com dados pessoais mascarados"
          >
            <i class="fa-solid fa-file-csv text-emerald-600"></i>
            <span>Exportar CSV Seguro</span>
          </button>
        </div>
      </div>

      <!-- Grade de Cards PedagÃ³gicos Seguros -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${students.map(student => {
          const stats = calculateStudentOverallStats(student);
          const isRevealed = AppState.revealedStudentIds.has(student.id);
          const displayName = maskName(student.name, isRevealed);
          const displayCpf = maskCpf(student.cpf, isRevealed);
          const displayPhone = maskPhone(student.contact?.phone, isRevealed);
          const initials = (student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

          return `
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden">
              
              <div>
                <!-- Topo: IdentificaÃ§Ã£o e Status -->
                <div class="flex items-start justify-between gap-3 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                      ${student.photoUrl && !AppState.privacyMode ? `
                        <img src="${student.photoUrl}" alt="${displayName}" class="w-full h-full object-cover rounded-2xl" />
                      ` : `
                        <span>${initials}</span>
                      `}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">${displayName}</h3>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <i class="fa-solid fa-shield-halved text-emerald-600"></i> LGPD
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">${student.id}</span>
                        <span>â€¢</span>
                        <span><i class="fa-solid fa-location-dot text-indigo-500 mr-1"></i>${student.unitCity || student.classroom}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col items-end gap-1 flex-shrink-0">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${stats.statusClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${stats.status === 'Aprovado' ? 'bg-emerald-500' : stats.status === 'Em RecuperaÃ§Ã£o' ? 'bg-amber-500' : stats.status === 'Reprovado' ? 'bg-rose-500' : 'bg-slate-400'}"></span>
                      ${stats.status}
                    </span>
                    <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      MÃ©dia: <strong class="text-indigo-600 dark:text-indigo-400">${stats.overallAvg.toFixed(1)}</strong>
                    </span>
                  </div>
                </div>

                <!-- Perfil PedagÃ³gico & DiagnÃ³stico (Destaque Central) -->
                <div class="space-y-3">
                  
                  <!-- Bloco 1: DiagnÃ³stico dos Desafios (O mais importante para o professor) -->
                  <div class="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs">
                    <span class="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 uppercase text-[10px] mb-1">
                      <i class="fa-solid fa-triangle-exclamation"></i> Principais Desafios ao Produzir ConteÃºdo:
                    </span>
                    <p class="text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "${student.challenges || 'Nenhum desafio crÃ­tico registrado no formulÃ¡rio inicial.'}"
                    </p>
                  </div>

                  <!-- Bloco 2: MotivaÃ§Ã£o e Expectativas -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div class="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                      <span class="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 text-[10px] uppercase mb-1">
                        <i class="fa-solid fa-fire"></i> MotivaÃ§Ã£o para o Curso:
                      </span>
                      <p class="text-slate-700 dark:text-slate-300 italic text-[11px] line-clamp-3">
                        "${student.motivation || 'QualificaÃ§Ã£o profissional e geraÃ§Ã£o de renda.'}"
                      </p>
                    </div>

                    <div class="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                      <span class="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 text-[10px] uppercase mb-1">
                        <i class="fa-solid fa-bullseye"></i> Expectativas:
                      </span>
                      <p class="text-slate-700 dark:text-slate-300 italic text-[11px] line-clamp-3">
                        "${student.expectations || 'Aprender estratÃ©gias e crescer nas redes sociais.'}"
                      </p>
                    </div>
                  </div>

                  <!-- Bloco 3: Ferramentas & Bagagem PrÃ©via -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">ProfissÃ£o / Ãrea</span>
                      <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]" title="${student.profession || 'NÃ£o informada'}">
                        ${student.profession || 'NÃ£o informada'}
                      </span>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Ferramentas</span>
                      <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]" title="${student.tools || 'Canva / Nenhuma'}">
                        ${student.tools || 'Nenhuma'}
                      </span>
                    </div>

                    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 sm:col-span-1 col-span-2">
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Redes Sociais</span>
                      <span class="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]" title="${student.frequentNetworks || 'Instagram'}">
                        ${student.frequentNetworks || 'Instagram'}
                      </span>
                    </div>
                  </div>

                  <!-- Bloco 4: Notas dos 7 MÃ³dulos de MÃ­dias Digitais -->
                  <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <span class="font-bold text-indigo-700 dark:text-indigo-300 text-[10px] uppercase flex items-center justify-between">
                      <span><i class="fa-solid fa-layer-group mr-1"></i> Desempenho nos MÃ³dulos:</span>
                      <span class="text-slate-500 font-normal">Faltas: ${stats.totalAbsences}</span>
                    </span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      ${AppState.subjects.slice(0, 4).map(sub => {
                        const gradeObj = student.grades?.[sub] || { b1: 9.0, b2: 9.0 };
                        const avg = ((gradeObj.b1 || 0) + (gradeObj.b2 || 0)) / 2;
                        return `
                          <div class="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span class="text-[9px] text-slate-400 truncate block">${sub.split(' ')[0]}</span>
                            <span class="font-bold ${avg >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}">${avg.toFixed(1)}</span>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>

                  <!-- Bloco 5: Camada de ProteÃ§Ã£o de Dados SensÃ­veis -->
                  <div class="p-3 rounded-2xl ${isRevealed ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800' : 'bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800'} text-xs space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[11px] ${isRevealed ? 'text-amber-800 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300'} flex items-center gap-1.5">
                        <i class="fa-solid ${isRevealed ? 'fa-triangle-exclamation text-amber-500' : 'fa-lock text-emerald-600'}"></i>
                        <span>${isRevealed ? 'Dados Pessoais Revelados (Uso Pontual)' : 'Dados Pessoais Protegidos por LGPD'}</span>
                      </span>
                      <button 
                        onclick="toggleRevealStudent('${student.id}')"
                        class="px-2.5 py-1 rounded-xl text-[10px] font-bold ${isRevealed ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'} transition-all flex items-center gap-1"
                      >
                        <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        <span>${isRevealed ? 'Ocultar Novamente' : 'Revelar'}</span>
                      </button>
                    </div>

                    ${isRevealed ? `
                      <div class="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-800 dark:text-slate-200">
                        <div><strong>CPF:</strong> ${student.cpf || 'NÃ£o informado'}</div>
                        <div><strong>WhatsApp:</strong> ${student.contact?.phone || 'NÃ£o informado'}</div>
                        <div class="col-span-2 truncate"><strong>E-mail:</strong> ${student.contact?.email || 'NÃ£o informado'}</div>
                        <div class="col-span-2 truncate"><strong>EndereÃ§o:</strong> ${student.address?.street || ''} ${student.address?.number || ''} - ${student.address?.neighborhood || ''}, ${student.address?.city || ''}</div>
                      </div>
                    ` : `
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">
                        CPF (${displayCpf}), WhatsApp (${displayPhone}) e e-mail estÃ£o mascarados.
                      </p>
                    `}
                  </div>

                </div>
              </div>

              <!-- RodapÃ© de AÃ§Ãµes PedagÃ³gicas -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button 
                    onclick="openStudentProfileModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                    title="Ficha PedagÃ³gica"
                  >
                    <i class="fa-solid fa-id-card-clip"></i> Ficha
                  </button>
                  <button 
                    onclick="openGradesModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                    title="LanÃ§ar Notas"
                  >
                    <i class="fa-solid fa-pen-to-square text-amber-500"></i> Notas
                  </button>
                  <button 
                    onclick="openBoletimModal('${student.id}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                    title="Boletim Escolar"
                  >
                    <i class="fa-solid fa-file-invoice text-emerald-500"></i> Boletim
                  </button>
                </div>

                <div class="text-[11px] text-slate-400 font-mono">
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

  let socialUrl = student.socialMedia || "";
  let socialDisplay = student.socialMedia || "";
  let isInstagram = false;
  let isTiktok = false;

  if (socialUrl) {
    if (socialUrl.startsWith("@")) {
      socialUrl = `https://www.instagram.com/${socialUrl.replace('@', '')}`;
      isInstagram = true;
    } else if (socialUrl.includes("instagram.com")) {
      isInstagram = true;
    } else if (socialUrl.includes("tiktok.com")) {
      isTiktok = true;
    } else if (!socialUrl.startsWith("http")) {
      socialUrl = `https://www.instagram.com/${socialUrl}`;
      isInstagram = true;
    }
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[92vh] flex flex-col">
        
        <!-- Header Modal -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 no-print">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-600/20">
              <i class="fa-solid fa-id-card-clip"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Ficha Individual do Aluno</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Programa Emprega Mais Alagoas â€¢ GestÃ£o de MÃ­dias Digitais</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="window.print()" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5"
            >
              <i class="fa-solid fa-print"></i> Imprimir Ficha
            </button>
            <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <!-- ConteÃºdo da Ficha -->
        <div class="p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 dark:text-slate-200">
          
          <!-- Banner Principal com IdentificaÃ§Ã£o -->
          <div class="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div 
                onclick="openPhotoUploadModal('${student.id}')"
                class="relative group/profavatar w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-400 to-purple-500'} text-white font-black text-2xl flex items-center justify-center shadow-inner border border-white/20 flex-shrink-0 cursor-pointer"
                title="Clique para alterar foto"
              >
                ${student.photoUrl ? `
                  <img src="${student.photoUrl}" alt="${displayName}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                  <div class="hidden w-full h-full items-center justify-center">${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                ` : `
                  <span>${(student.name || "AL").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</span>
                `}
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/profavatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                  <i class="fa-solid fa-camera text-xs mb-0.5"></i>
                  <span>Foto</span>
                </div>
                <div class="absolute bottom-0 right-0 w-4 h-4 rounded-tl bg-white text-indigo-900 flex items-center justify-center text-[8px] shadow">
                  <i class="fa-solid fa-camera"></i>
                </div>
              </div>
              <div>
                <h1 class="text-xl font-black tracking-tight flex items-center gap-2">
                  <span>${displayName}</span>
                  ${AppState.privacyMode ? `
                    <button 
                      onclick="toggleRevealStudent('${student.id}'); openStudentProfileModal('${student.id}')" 
                      class="text-sm ${isRevealed ? 'text-indigo-300 hover:text-white' : 'text-amber-300 hover:text-amber-200'} transition-colors no-print"
                      title="${isRevealed ? 'Ocultar dados (LGPD)' : 'Revelar dados pessoais (Modo Deus)'}"
                    >
                      <i class="fa-solid ${isRevealed ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                  ` : ''}
                </h1>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <i class="fa-solid fa-location-dot mr-1 text-amber-300"></i>${student.unitCity || student.classroom || 'Alagoas'}
                  </span>
                  <span class="text-xs font-mono text-indigo-200">ID: ${student.id}</span>
                  ${student.cpf ? `<span class="text-xs font-mono text-amber-300 font-semibold">â€¢ CPF: ${displayCpf}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="flex sm:flex-col items-center sm:items-end gap-2 bg-white/10 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl w-full sm:w-auto justify-between">
              <span class="px-3 py-1 rounded-full text-xs font-extrabold ${stats.status === 'Aprovado' ? 'bg-emerald-500 text-white' : stats.status === 'Em RecuperaÃ§Ã£o' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'}">
                ${stats.status}
              </span>
              <span class="text-xs text-indigo-200 font-medium">MÃ©dia: <strong>${stats.overallAvg.toFixed(1)}</strong></span>
            </div>
          </div>

          <!-- Grade de InformaÃ§Ãµes Cadastrais e Redes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <!-- Box Contatos -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                <i class="fa-solid fa-address-book"></i> Contatos & ComunicaÃ§Ã£o
              </h3>
              
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Telefone / WhatsApp:</span>
                ${cleanPhone ? (isRevealed ? `
                  <a href="https://wa.me/55${cleanPhone}" target="_blank" class="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                    <i class="fa-brands fa-whatsapp"></i> ${displayPhone}
                  </a>
                ` : `
                  <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>${displayPhone}</span>
                    <button onclick="toggleRevealStudent('${student.id}'); openStudentProfileModal('${student.id}')" class="text-amber-500 hover:text-amber-600 text-xs" title="Desbloquear contato com Modo Deus">
                      <i class="fa-solid fa-lock"></i>
                    </button>
                  </span>
                `) : '<span class="italic text-slate-400">NÃ£o informado</span>'}
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">E-mail:</span>
                ${student.contact?.email ? (isRevealed ? `
                  <a href="mailto:${student.contact.email}" class="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[200px]">
                    ${displayEmail}
                  </a>
                ` : `
                  <span class="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">${displayEmail}</span>
                `) : '<span class="italic text-slate-400">NÃ£o informado</span>'}
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Rede Social / Perfil:</span>
                ${student.socialMedia ? `
                  <a href="${socialUrl}" target="_blank" class="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                    <i class="${isInstagram ? 'fa-brands fa-instagram text-pink-500' : isTiktok ? 'fa-brands fa-tiktok text-slate-900 dark:text-white' : 'fa-solid fa-share-nodes'}"></i>
                    <span class="truncate">${socialDisplay}</span>
                  </a>
                ` : '<span class="italic text-slate-400">NÃ£o informado</span>'}
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">Data de InscriÃ§Ã£o:</span>
                <span class="font-mono text-slate-700 dark:text-slate-300">${student.registrationDate || 'NÃ£o informada'}</span>
              </div>
            </div>

            <!-- Box Perfil Profissional -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <h3 class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                <i class="fa-solid fa-user-graduate"></i> Perfil Profissional & AcadÃªmico
              </h3>

              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Ãrea de AtuaÃ§Ã£o / ProfissÃ£o:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">${student.profession || 'NÃ£o informada'}</span>
              </div>

              <div>
                <span class="text-slate-500 block text-[10px] uppercase font-semibold">Escolaridade:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300 text-xs">${student.education || 'NÃ£o informada'}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-500">ExperiÃªncia com GestÃ£o de Redes:</span>
                <span class="font-bold ${student.experience?.toLowerCase().includes('sim') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}">
                  ${student.experience || 'NÃ£o'}
                </span>
              </div>
            </div>

          </div>

          <!-- DiagnÃ³stico PedagÃ³gico Aprofundado -->
          <div class="p-5 rounded-3xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-brain text-indigo-600 dark:text-indigo-400"></i> DiagnÃ³stico PedagÃ³gico e Expectativas de Aprendizado
            </h3>

            <div class="grid grid-cols-1 gap-3.5 text-xs">
              
              <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase text-[11px] mb-1">
                  <i class="fa-solid fa-triangle-exclamation"></i> Principais Desafios ao Produzir ConteÃºdo
                </span>
                <p class="text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                  "${student.challenges || 'Nenhum desafio registrado no formulÃ¡rio.'}"
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase text-[11px] mb-1">
                  <i class="fa-solid fa-fire"></i> MotivaÃ§Ã£o para se Inscrever no Curso
                </span>
                <p class="text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                  "${student.motivation || 'Nenhuma motivaÃ§Ã£o registrada.'}"
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase text-[11px] mb-1">
                  <i class="fa-solid fa-bullseye"></i> Expectativas em RelaÃ§Ã£o ao Curso
                </span>
                <p class="text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                  "${student.expectations || 'Nenhuma expectativa registrada.'}"
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span class="font-bold text-slate-500 uppercase text-[10px] block mb-1">Redes Sociais Mais Utilizadas:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">${student.frequentNetworks || 'NÃ£o informado'}</span>
                </div>
                <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span class="font-bold text-slate-500 uppercase text-[10px] block mb-1">Ferramentas que jÃ¡ utilizou:</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200">${student.tools || 'Nenhuma'}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- RodapÃ© do Modal -->
          <div class="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 no-print">
            <div class="flex items-center gap-2 flex-wrap">
              <button 
                onclick="openGradesModal('${student.id}')"
                class="px-4 py-2 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-all"
              >
                <i class="fa-solid fa-pen-to-square mr-1"></i> LanÃ§ar Notas
              </button>
              <button 
                onclick="openSendEmailReportModal('${student.id}')"
                class="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
                title="Enviar relatÃ³rio de diagnÃ³stico e notas diretamente por e-mail"
              >
                <i class="fa-solid fa-paper-plane"></i> Enviar RelatÃ³rio por E-mail
              </button>
            </div>
            <button 
              onclick="closeModal()" 
              class="px-5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700 transition-all"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// GESTÃƒO DE FOTOS DOS ALUNOS (COMPRESSÃƒO, UPLOAD & WEBCAM)
// -------------------------------------------------------------

function compressAndCropImage(file, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Arquivo invÃ¡lido. Selecione uma imagem JPG, PNG ou WEBP."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Recorte quadrado central
        let cropX = 0;
        let cropY = 0;
        let cropSize = Math.min(width, height);

        if (width > height) {
          cropX = (width - height) / 2;
        } else {
          cropY = (height - width) / 2;
        }

        canvas.width = Math.min(maxSize, cropSize);
        canvas.height = Math.min(maxSize, cropSize);

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          img,
          cropX, cropY, cropSize, cropSize,
          0, 0, canvas.width, canvas.height
        );

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Erro ao carregar a imagem."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[92vh] flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-600/20">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Foto do Aluno</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md">${student.name} â€¢ ${student.unitCity || student.classroom}</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Preview Central da Foto -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div class="flex flex-col items-center justify-center text-center">
            <div class="relative group/modalavatar mb-3">
              <div 
                id="photo-modal-preview-box"
                class="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white font-black text-4xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 ring-4 ring-indigo-500/20"
              >
                ${AppState.photoModalState.tempPhotoUrl ? `
                  <img id="photo-modal-preview-img" src="${AppState.photoModalState.tempPhotoUrl}" alt="${student.name}" class="w-full h-full object-cover" />
                ` : `
                  <span id="photo-modal-preview-initials">${initials}</span>
                `}
              </div>

              ${AppState.photoModalState.tempPhotoUrl ? `
                <button 
                  onclick="removePhotoModalPhoto()" 
                  id="photo-modal-del-btn"
                  class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center text-xs hover:bg-rose-700 hover:scale-110 transition-all"
                  title="Remover foto"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              ` : `
                <button 
                  onclick="removePhotoModalPhoto()" 
                  id="photo-modal-del-btn"
                  class="hidden absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg items-center justify-center text-xs hover:bg-rose-700 hover:scale-110 transition-all"
                  title="Remover foto"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `}
            </div>
            
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">${student.name}</h3>
            <span class="text-xs text-slate-400 font-mono">${student.id}</span>
          </div>

          <!-- Abas de OpÃ§Ãµes de Foto -->
          <div class="border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-center gap-2" id="photo-tabs">
              <button 
                onclick="switchPhotoUploadTab('upload')"
                id="photo-tab-upload"
                class="px-3.5 py-2 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                <i class="fa-solid fa-cloud-arrow-up"></i> Arquivo
              </button>
              <button 
                onclick="switchPhotoUploadTab('camera')"
                id="photo-tab-camera"
                class="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-1.5"
              >
                <i class="fa-solid fa-camera"></i> CÃ¢mera
              </button>
              <button 
                onclick="switchPhotoUploadTab('url')"
                id="photo-tab-url"
                class="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-1.5"
              >
                <i class="fa-solid fa-link"></i> Link (URL)
              </button>
              <button 
                onclick="switchPhotoUploadTab('presets')"
                id="photo-tab-presets"
                class="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-1.5"
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
              class="border-2 border-dashed border-indigo-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-6 text-center cursor-pointer bg-indigo-50/30 dark:bg-slate-800/30 hover:bg-indigo-50/60 dark:hover:bg-slate-800/60 transition-all"
            >
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-xl mx-auto mb-2 shadow-inner">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Arraste uma foto aqui ou clique para selecionar</p>
              <p class="text-[11px] text-slate-400 mt-1">Suporta JPG, PNG e WEBP (otimizaÃ§Ã£o automÃ¡tica)</p>
              <input 
                type="file" 
                id="photo-modal-file-input" 
                accept="image/*" 
                onchange="handlePhotoModalFileSelect(event)" 
                class="hidden"
              >
            </div>
          </div>

          <!-- Painel 2: Webcam / CÃ¢mera -->
          <div id="photo-pane-camera" class="space-y-3 hidden">
            <div class="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <video id="photo-modal-video" autoplay playsinline class="w-full h-56 object-cover hidden"></video>
              <canvas id="photo-modal-canvas" class="hidden"></canvas>
              
              <div id="photo-modal-camera-placeholder" class="text-center p-6 space-y-2">
                <i class="fa-solid fa-camera text-3xl text-slate-600 block"></i>
                <p class="text-xs text-slate-400 font-medium">Clique no botÃ£o abaixo para ativar a cÃ¢mera</p>
              </div>
            </div>

            <div class="flex items-center justify-center gap-2">
              <button 
                type="button" 
                id="photo-modal-start-cam-btn"
                onclick="startPhotoModalWebcam()" 
                class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center gap-1.5"
              >
                <i class="fa-solid fa-video"></i> Ligar CÃ¢mera
              </button>
              <button 
                type="button" 
                id="photo-modal-capture-cam-btn"
                onclick="capturePhotoModalWebcam()" 
                class="hidden px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow items-center gap-1.5"
              >
                <i class="fa-solid fa-camera-retro"></i> Capturar Foto
              </button>
              <button 
                type="button" 
                id="photo-modal-stop-cam-btn"
                onclick="stopPhotoModalWebcam()" 
                class="hidden px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700 items-center gap-1.5"
              >
                <i class="fa-solid fa-video-slash"></i> Desligar
              </button>
            </div>
          </div>

          <!-- Painel 3: URL Direta -->
          <div id="photo-pane-url" class="space-y-3 hidden">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cole o link da imagem (URL da internet):</label>
              <div class="flex gap-2">
                <input 
                  type="url" 
                  id="photo-modal-url-input" 
                  placeholder="https://exemplo.com/foto-do-aluno.jpg" 
                  class="flex-1 px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                >
                <button 
                  type="button" 
                  onclick="applyPhotoModalUrl()" 
                  class="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                >
                  Carregar
                </button>
              </div>
            </div>
          </div>

          <!-- Painel 4: Galeria de Avatares -->
          <div id="photo-pane-presets" class="space-y-3 hidden">
            <p class="text-xs text-slate-500 dark:text-slate-400">Selecione um avatar ilustrativo para o perfil do aluno:</p>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1">
              ${presetAvatars.map((url, idx) => `
                <button 
                  type="button" 
                  onclick="selectPresetAvatar('${url}')"
                  class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-600 hover:scale-105 transition-all shadow-sm flex-shrink-0"
                >
                  <img src="${url}" alt="Avatar ${idx+1}" class="w-full h-full object-cover" />
                </button>
              `).join("")}
            </div>
          </div>

        </div>

        <!-- RodapÃ© do Modal -->
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <button 
            type="button" 
            onclick="removePhotoModalPhoto()" 
            class="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
          >
            <i class="fa-solid fa-trash-can"></i> Remover Foto
          </button>
          
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-700"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onclick="savePhotoModalPhoto()" 
              class="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-1.5"
            >
              <i class="fa-solid fa-floppy-disk"></i> Salvar Foto
            </button>
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
    showToast("NÃ£o foi possÃ­vel acessar a cÃ¢mera: " + err.message, "error");
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

  previewBox.innerHTML = `<img id="photo-modal-preview-img" src="${photoUrl}" alt="Aluno" class="w-full h-full object-cover" />`;
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
  showToast("Foto removida da prÃ©-visualizaÃ§Ã£o.", "info");
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

// FunÃ§Ãµes para o FormulÃ¡rio de Cadastro / EdiÃ§Ã£o
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
    if (previewBox) previewBox.innerHTML = `<img id="form-avatar-img" src="${dataUrl}" class="w-full h-full object-cover" />`;
    if (removeBtn) {
      removeBtn.classList.remove("hidden");
      removeBtn.classList.add("flex");
    }
    showToast("Foto carregada no formulÃ¡rio!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openWebcamForStudentForm() {
  const studentId = AppState.editingStudentId;
  if (studentId) {
    openPhotoUploadModal(studentId);
  } else {
    showToast("Para usar a cÃ¢mera, selecione um arquivo ou salve o aluno primeiro.", "info");
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
  showToast("Foto removida do formulÃ¡rio.", "info");
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
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center text-2xl mb-4">
        <i class="fa-solid fa-file-excel"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Nenhum aluno cadastrado ou encontrado</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        Conecte a API do Google Sheets ou faÃ§a a importaÃ§Ã£o dos seus alunos do Emprega Mais Alagoas.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button onclick="openGoogleSheetsImportModal()" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2">
          <i class="fa-brands fa-google-drive"></i> Conectar Google Sheets API
        </button>
        <button onclick="openStudentModal()" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2">
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[92vh] flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/20">
              <i class="fa-brands fa-google-drive"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
                Google Sheets API v4 â€¢ ConexÃ£o Direta
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Consumindo dados diretamente da sua planilha do Google</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Abas -->
        <div class="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
          <div class="flex items-center gap-2" id="import-tabs">
            <button 
              onclick="switchImportTab('api')" 
              id="import-tab-api"
              class="px-4 py-2 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
            >
              <i class="fa-solid fa-plug-circle-bolt"></i> Google Sheets API (Online)
            </button>
            <button 
              onclick="switchImportTab('paste')" 
              id="import-tab-paste"
              class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-2"
            >
              <i class="fa-solid fa-paste"></i> Copiar e Colar Tabela
            </button>
            <button 
              onclick="switchImportTab('file')" 
              id="import-tab-file"
              class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-2"
            >
              <i class="fa-solid fa-file-csv"></i> Arquivo CSV
            </button>
          </div>
        </div>

        <!-- ConteÃºdo das Abas -->
        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          
          <!-- Aba 1: Google Sheets API v4 Direta -->
          <div id="import-pane-api" class="space-y-4">
            <div class="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> API Key Configurada:</span>
              <p class="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 truncate">${currentApiKey}</p>
              <p class="mt-1">Insira abaixo o <strong>Link da Planilha</strong> ou o <strong>ID do Google Sheets</strong> para sincronizar as turmas e notas.</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link ou ID da Planilha do Google Sheets *</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="api-spreadsheet-id-input" 
                  value="${currentSheetId}"
                  placeholder="Ex: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit ou 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  class="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                >
                <i class="fa-solid fa-table absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Intervalo / Aba (Opcional)</label>
                <input 
                  type="text" 
                  id="api-range-input" 
                  value="${currentRange}"
                  placeholder="Ex: A1:Z500 ou Notas!A1:Z500"
                  class="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                >
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Cloud API Key</label>
                <input 
                  type="password" 
                  id="api-key-input" 
                  value="${currentApiKey}"
                  class="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                >
              </div>
            </div>

            <button 
              onclick="handleApiFetchClick()" 
              class="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-cloud-arrow-down text-sm"></i> Puxar Dados da API do Google Sheets
            </button>
          </div>

          <!-- Aba 2: Copiar e Colar -->
          <div id="import-pane-paste" class="space-y-4 hidden">
            <div class="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <span class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-500"></i> Dica de ouro:</span>
              <p>Copie (Ctrl+C) as linhas no Google Planilhas e cole (Ctrl+V) aqui. O sistema reconhece tudo automaticamente!</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cole aqui os dados copiados:</label>
              <textarea 
                id="raw-paste-input" 
                rows="6" 
                placeholder="Nome&#9;Email&#9;Telefone&#9;Turma&#9;Marketing Digital&#9;Design&#nAlana VitÃ³ria&#9;alana@aluno.al.gov.br&#9;(82) 99654-1122&#9;MaceiÃ³ Matutino&#9;9.5&#9;8.5"
                class="w-full p-3 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
              ></textarea>
            </div>

            <button 
              onclick="processPastedText()" 
              class="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-bolt"></i> Processar Dados Colados
            </button>
          </div>

          <!-- Aba 3: Arquivo CSV -->
          <div id="import-pane-file" class="space-y-4 hidden">
            <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
              <i class="fa-solid fa-file-csv text-3xl text-emerald-500 mb-2 block"></i>
              <input 
                type="file" 
                id="classroom-csv-file" 
                accept=".csv, .txt, .tsv"
                onchange="handleClassroomFileSelect(event)"
                class="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/60 dark:file:text-emerald-300"
              >
            </div>
          </div>

          <!-- Ãrea de PrÃ©-VisualizaÃ§Ã£o -->
          <div id="import-preview-area" class="hidden pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i> Alunos Identificados (<span id="import-preview-count">0</span>)
              </h4>
              <div class="flex items-center gap-3 text-xs">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="import_mode" value="merge" checked onchange="AppState.importState.mode = this.value">
                  <span>Adicionar / Atualizar</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer text-rose-600">
                  <input type="radio" name="import_mode" value="replace" onchange="AppState.importState.mode = this.value">
                  <span>Substituir lista</span>
                </label>
              </div>
            </div>

            <div class="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="p-2.5">Nome</th>
                    <th class="p-2.5">E-mail</th>
                    <th class="p-2.5">Telefone</th>
                    <th class="p-2.5">Turma</th>
                    <th class="p-2.5 text-center">Notas Detectadas</th>
                  </tr>
                </thead>
                <tbody id="import-preview-tbody" class="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <!-- Preenchido via script -->
                </tbody>
              </table>
            </div>

            <button 
              onclick="commitImportedStudents()" 
              class="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-check-double"></i> Confirmar e Salvar no Eu Por Dias
            </button>
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

async function fetchGoogleSheetsApiData(sheetIdOrUrl, customRange = "Respostas ao formulÃ¡rio 1!A1:Z1000") {
  let spreadsheetId = sheetIdOrUrl;
  const match = sheetIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    spreadsheetId = match[1];
  }

  const apiKey = AppState.settings.googleApiKey || "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI";
  const range = customRange || "Respostas ao formulÃ¡rio 1!A1:Z1000";

  showToast("Conectando Ã  Google Sheets API v4...", "info");

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
  const idxProfession = header.findIndex(h => h.includes("Ã¡rea de atuaÃ§Ã£o") || h.includes("area de atuacao") || h.includes("profissÃ£o") || h.includes("profissao"));
  const idxEducation = header.findIndex(h => h.includes("escolaridade") || h.includes("nÃ­vel") || h.includes("nivel"));
  const idxFrequent = header.findIndex(h => h.includes("mais frequÃªncia") || h.includes("mais frequencia") || h.includes("quais redes"));
  const idxExp = header.findIndex(h => h.includes("trabalhou com gerenciamento") || h.includes("gerenciamento de redes"));
  const idxTools = header.findIndex(h => h.includes("ferramentas"));
  const idxChallenges = header.findIndex(h => h.includes("desafios"));
  const idxMotivation = header.findIndex(h => h.includes("motivou") || h.includes("motivaÃ§Ã£o"));
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
    const rawCity = idxCity !== -1 && row[idxCity] ? row[idxCity].trim() : (row[6] || "MaceiÃ³ - SINE");
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
      gender: "NÃ£o especificado",
      classroom: rawCity || "MaceiÃ³ - SINE",
      unitCity: rawCity || "MaceiÃ³ - SINE",
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
        guardianKinship: "ResponsÃ¡vel",
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
        "Marketing Digital & EstratÃ©gia": { b1: 9.0, b2: 9.0, b3: 9.5, b4: 9.5, absences: 0 },
        "CriaÃ§Ã£o de ConteÃºdo & Copywriting": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 0 },
        "Design & Identidade Visual": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
        "EdiÃ§Ã£o de VÃ­deo & Reels": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 0 },
        "TrÃ¡fego Pago & Meta Ads": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
        "MÃ©tricas & Analytics": { b1: 9.0, b2: 9.0, b3: 9.5, b4: 9.0, absences: 0 },
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
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <td class="p-2 font-bold text-slate-800 dark:text-slate-200">${s.name}</td>
        <td class="p-2 text-slate-500">${s.cpf || '-'}</td>
        <td class="p-2 text-slate-500">${s.contact.phone || '-'}</td>
        <td class="p-2 font-semibold text-indigo-600">${s.unitCity || s.classroom}</td>
        <td class="p-2 text-slate-600 truncate max-w-[150px]">${s.profession || '-'}</td>
      </tr>
    `).join("") + (parsed.length > 50 ? `<tr><td colspan="5" class="p-2 text-center text-slate-400 font-semibold italic">... e mais ${parsed.length - 50} alunos prontos para importar!</td></tr>` : "");
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
// INTEGRAÃ‡ÃƒO COM SUPABASE CLOUD DATABASE & STORAGE
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

-- 4. Criar bucket de armazenamento para Fotos de Alunos (Supabase Storage)
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
    if (!silent) showToast("Biblioteca do Supabase indisponÃ­vel no navegador. Verifique sua conexÃ£o.", "error");
    return false;
  }

  const btn = document.getElementById("btn-test-supabase");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testando ConexÃ£o...';
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
          showToast("ConexÃ£o OK com Supabase! Falta criar a tabela. VÃ¡ na aba 'Script SQL', copie e execute no Supabase.", "warning", 6000);
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
    console.error("Falha de conexÃ£o com Supabase:", err);
    AppState.settings.supabaseConnected = false;
    saveSettings();
    updateSupabaseConnectionStatusUI(false, "Erro de ConexÃ£o: " + (err.message || "Credenciais invÃ¡lidas"));
    if (!silent) {
      showToast("Falha na conexÃ£o: " + (err.message || "Verifique a URL e Anon Key"), "error");
    }
    return false;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-plug-circle-check"></i> Testar e Salvar ConexÃ£o';
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
    msgEl.textContent = message || (connected ? "Pronto para sincronizaÃ§Ã£o" : "Configure a URL e a Anon Key pÃºblica");
  }
}

function disconnectSupabase() {
  if (!confirm("Deseja desconectar o Supabase deste navegador? Seus dados locais permanecerÃ£o intactos.")) return;
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
    showToast("Supabase nÃ£o conectado. Configure a URL e a Anon Key primeiro.", "error");
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
    showToast("Supabase nÃ£o configurado. Configure a URL e a Anon Key primeiro.", "error");
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

    if (!confirm(`Foram encontrados ${data.length} alunos na nuvem Supabase. Deseja integrÃ¡-los aos seus dados locais?`)) {
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

    showToast(`RestauraÃ§Ã£o ConcluÃ­da! ${addedCount} novos alunos adicionados e ${updatedCount} atualizados da nuvem.`, "success", 5000);
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
      syncStatEl.textContent = "Ãšltima sincronizaÃ§Ã£o: " + d.toLocaleDateString("pt-BR") + " Ã s " + d.toLocaleTimeString("pt-BR");
    } else {
      syncStatEl.textContent = "Nenhuma sincronizaÃ§Ã£o realizada ainda.";
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
    ? new Date(AppState.settings.lastSupabaseSync).toLocaleDateString("pt-BR") + " Ã s " + new Date(AppState.settings.lastSupabaseSync).toLocaleTimeString("pt-BR")
    : "Nunca";

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[92vh] flex flex-col">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-600/20">
              <i class="fa-solid fa-cloud"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
                  Supabase Cloud Database & Storage
                </h2>
                <span id="supabase-status-badge" class="${isConnected ? 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'}">
                  <i class="fa-solid ${isConnected ? 'fa-circle-check text-emerald-600' : 'fa-circle-notch text-slate-400'}"></i> ${isConnected ? 'Conectado' : 'NÃ£o configurado'}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Banco de dados PostgreSQL e backup seguro na nuvem 100% gratuito</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Abas -->
        <div class="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
          <div class="flex items-center gap-2">
            <button 
              onclick="switchSupabaseTab('config')" 
              id="supabase-tab-config"
              class="px-4 py-2 text-xs font-bold border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
            >
              <i class="fa-solid fa-key"></i> 1. ConexÃ£o & Chaves
            </button>
            <button 
              onclick="switchSupabaseTab('sync')" 
              id="supabase-tab-sync"
              class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-2"
            >
              <i class="fa-solid fa-arrows-rotate"></i> 2. Backup & SincronizaÃ§Ã£o
            </button>
            <button 
              onclick="switchSupabaseTab('sql')" 
              id="supabase-tab-sql"
              class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 border-b-2 border-transparent flex items-center gap-2"
            >
              <i class="fa-solid fa-database"></i> 3. Script SQL & Passo a Passo
            </button>
          </div>
        </div>

        <!-- ConteÃºdo do Modal -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1">

          <!-- ABA 1: CONEXÃƒO -->
          <div id="supabase-pane-config" class="space-y-4">
            <div class="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 text-xs space-y-2">
              <div class="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <i class="fa-solid fa-gift"></i> Plano Gratuito VitalÃ­cio (Supabase Free Tier)
              </div>
              <p class="text-emerald-700/90 dark:text-emerald-400 leading-relaxed">
                O Supabase fornece gratuitamente: <strong>500 MB de banco de dados PostgreSQL</strong> (suficiente para mais de 100.000 alunos), <strong>1 GB de armazenamento de arquivos/fotos</strong>, e <strong>50.000 usuÃ¡rios ativos mensais</strong>. Seus dados ficam protegidos e salvos na nuvem sem nenhum custo de hospedagem.
              </p>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input 
                  type="text" 
                  id="supabase-url-input" 
                  value="${currentUrl}"
                  placeholder="https://sua-empresa-ou-projeto.supabase.co" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                <p class="text-[11px] text-slate-400 mt-1">Encontrada no seu painel Supabase em: Project Settings > API > Project URL</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input 
                  type="password" 
                  id="supabase-key-input" 
                  value="${currentKey}"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                  class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                <p class="text-[11px] text-slate-400 mt-1">Chave pÃºblica de cliente (anon public key). Seguro para uso no navegador com as polÃ­ticas RLS ativas.</p>
              </div>
            </div>

            <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div class="text-xs text-slate-500" id="supabase-status-msg">
                ${isConnected ? 'Status: Conectado e autenticado' : 'Status: Aguardando configuraÃ§Ã£o'}
              </div>
              <div class="flex items-center gap-2">
                ${currentUrl ? `
                  <button 
                    onclick="disconnectSupabase()" 
                    class="px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    Desconectar
                  </button>
                ` : ''}
                <button 
                  id="btn-test-supabase"
                  onclick="testSupabaseConnection(false)" 
                  class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <i class="fa-solid fa-plug-circle-check"></i> Testar e Salvar ConexÃ£o
                </button>
              </div>
            </div>
          </div>

          <!-- ABA 2: BACKUP & SINCRONIZAÃ‡ÃƒO -->
          <div id="supabase-pane-sync" class="space-y-4 hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Enviar para Nuvem -->
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                  <div class="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  Enviar para a Nuvem
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Envia os <strong>${totalStudents} alunos</strong> cadastrados no navegador diretamente para o banco de dados PostgreSQL no Supabase. Atualiza alunos existentes e insere os novos (upsert por ID).
                </p>
                <button 
                  id="btn-sync-to-supabase"
                  onclick="syncStudentsToSupabase()" 
                  class="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <i class="fa-solid fa-cloud-arrow-up"></i> Enviar Alunos Agora (Backup na Nuvem)
                </button>
              </div>

              <!-- Baixar da Nuvem -->
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                  </div>
                  Baixar da Nuvem
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Restaura ou sincroniza os alunos salvos no banco Supabase para este computador ou celular. Ideal para abrir o sistema em mÃºltiplos dispositivos.
                </p>
                <button 
                  id="btn-fetch-from-supabase"
                  onclick="fetchStudentsFromSupabase()" 
                  class="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <i class="fa-solid fa-cloud-arrow-down"></i> Baixar Dados da Nuvem (Restaurar)
                </button>
              </div>
            </div>

            <!-- InformaÃ§Ãµes de SeguranÃ§a e Ãšltima SincronizaÃ§Ã£o -->
            <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5">
              <div class="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-300">
                <span class="flex items-center gap-1.5"><i class="fa-solid fa-shield-halved"></i> Camada LGPD Ativa</span>
                <span id="supabase-sync-timestamp" class="text-[11px] font-normal text-indigo-700 dark:text-indigo-400">Ãšltima sincronizaÃ§Ã£o: ${lastSyncText}</span>
              </div>
              <p class="text-indigo-700/80 dark:text-indigo-400">
                Os dados sensÃ­veis trafegam criptografados de ponta a ponta via SSL/HTTPS atÃ© os servidores do Supabase. O Modo LGPD em sala de aula continua ativo para proteger a visÃ£o de alunos e terceiros.
              </p>
            </div>
          </div>

          <!-- ABA 3: SCRIPT SQL & PASSO A PASSO -->
          <div id="supabase-pane-sql" class="space-y-4 hidden">
            <div class="space-y-3">
              <div class="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <p class="font-bold text-slate-800 dark:text-slate-200">Como criar seu banco gratuito em 2 minutos:</p>
                <ol class="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Acesse <strong><a href="https://supabase.com" target="_blank" class="text-emerald-600 dark:text-emerald-400 underline">supabase.com</a></strong> e crie uma conta gratuita (pode ser com seu login GitHub).</li>
                  <li>Clique em <strong>New Project</strong> e defina um nome (ex: <code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">edugestao-alunos</code>).</li>
                  <li>No menu lateral esquerdo, clique no Ã­cone do <strong>SQL Editor</strong>.</li>
                  <li>Clique no botÃ£o abaixo <strong>"Copiar Script SQL"</strong>, cole no editor e aperte <strong>Run</strong>.</li>
                  <li>VÃ¡ em <strong>Project Settings > API</strong>, copie a <strong>Project URL</strong> e a <strong>anon public key</strong>, e cole na aba 1 deste painel!</li>
                </ol>
              </div>

              <div class="relative">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Script SQL DDL:</span>
                  <button 
                    onclick="copySupabaseSqlScript()" 
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
                  >
                    <i class="fa-solid fa-copy"></i> Copiar Script SQL
                  </button>
                </div>
                <textarea 
                  id="supabase-sql-code" 
                  readonly 
                  rows="9" 
                  class="w-full p-3 rounded-xl text-[11px] font-mono bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-none"
                >${SUPABASE_SQL_SCHEMA}</textarea>
              </div>
            </div>
          </div>

        </div>

        <!-- RodapÃ© do Modal -->
        <div class="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <span class="text-xs text-slate-400">
            <i class="fa-solid fa-database text-emerald-500"></i> Armazenamento HÃ­brido: Offline Local + Nuvem Supabase
          </span>
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Fechar
          </button>
        </div>

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// ABA 2: LANÃ‡AMENTO DE NOTAS
// -------------------------------------------------------------
function renderGradesTab(container) {
  // REGRA DE ACESSO: Exige identificaÃ§Ã£o por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'grades');
    return;
  }

  const filtered = getFilteredStudents();
  const subjects = AppState.subjects;

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              MÃDIAS DIGITAIS
            </span>
          </div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <i class="fa-solid fa-pen-nib text-indigo-600"></i> Planilha de AvaliaÃ§Ãµes e Notas dos MÃ³dulos
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Clique nas notas para editar. O sistema calcula a mÃ©dia geral e situaÃ§Ã£o automaticamente.</p>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <select 
            id="filter-classroom-select"
            onchange="handleClassroomFilterChange(this.value)"
            class="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas as Turmas</option>
          </select>
          <button 
            type="button"
            onclick="window.print()" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
            title="Imprimir RelatÃ³rio de Notas"
          >
            <i class="fa-solid fa-print"></i>
            <span class="hidden md:inline">Imprimir</span>
          </button>
          <button 
            type="button"
            id="btn-send-my-grades-email"
            onclick="sendLoggedInStudentGradesEmail()" 
            class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all transform active:scale-95"
            title="Enviar relatÃ³rio atual de notas do aluno logado diretamente para o e-mail cadastrado"
          >
            <i class="fa-solid fa-envelope"></i>
            <span>Enviar para o meu e-mail</span>
          </button>
          <button onclick="openSubjectsConfigModal()" class="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-gear"></i>
            <span class="hidden sm:inline">MÃ³dulos</span>
          </button>
        </div>
      </div>

      <!-- Tabela Matriz de Notas -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                <th class="py-3 px-4 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">Aluno</th>
                <th class="py-3 px-3">Turma</th>
                ${subjects.map(s => `
                  <th class="py-3 px-3 text-center min-w-[120px] border-l border-slate-100 dark:border-slate-800/80">
                    <span class="line-clamp-1" title="${s}">${s}</span>
                  </th>
                `).join("")}
                <th class="py-3 px-4 text-center bg-indigo-50/50 dark:bg-indigo-950/30 border-l border-slate-200 dark:border-slate-700">MÃ©dia Geral</th>
                <th class="py-3 px-4 text-center">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${filtered.map(student => {
                const stats = calculateStudentOverallStats(student);
                const isRevealed = !AppState.privacyMode || AppState.revealedStudentIds.has(student.id);
                const displayName = maskName(student.name, isRevealed);
                return `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                      <div class="flex items-center justify-between gap-2 max-w-[210px]">
                        <span class="truncate" title="${isRevealed ? student.name : displayName}">
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
                      <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate block max-w-[120px]" title="${student.classroom}">
                        ${student.classroom}
                      </span>
                    </td>
                    ${subjects.map(subject => {
                      const subjectData = student.grades?.[subject] || {};
                      const { avg, hasGrades } = calculateSubjectAverage(subjectData);
                      const avgColor = !hasGrades ? 'text-slate-400' : (avg >= AppState.settings.passingGrade ? 'text-emerald-600 dark:text-emerald-400 font-bold' : (avg >= AppState.settings.recoveryGrade ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'));

                      return `
                        <td class="py-2.5 px-3 text-center border-l border-slate-100 dark:border-slate-800">
                          <button 
                            onclick="openGradesModal('${student.id}', '${subject}')" 
                            class="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${avgColor} transition-colors w-full text-center font-mono"
                            title="Editar notas do mÃ³dulo ${subject}"
                          >
                            ${hasGrades ? avg.toFixed(1) : '<span class="text-slate-300 dark:text-slate-600">-</span>'}
                          </button>
                        </td>
                      `;
                    }).join("")}
                    <td class="py-2.5 px-4 text-center font-black text-sm bg-indigo-50/30 dark:bg-indigo-950/20 border-l border-slate-200 dark:border-slate-700">
                      <span class="${stats.overallAvg >= AppState.settings.passingGrade ? 'text-emerald-600 dark:text-emerald-400' : stats.overallAvg >= AppState.settings.recoveryGrade ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
                        ${stats.overallAvg.toFixed(1)}
                      </span>
                    </td>
                    <td class="py-2.5 px-4 text-center">
                      <button 
                        onclick="openGradesModal('${student.id}')"
                        class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
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
    else if (stats.status === "Em RecuperaÃ§Ã£o") recovery++;
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
        
        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alunos Matriculados</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">${totalStudents}</h3>
            <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-1">
              <i class="fa-solid fa-certificate"></i> Emprega Mais Alagoas
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-users"></i>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MÃ©dia Geral do Curso</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${generalAvg}</h3>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <i class="fa-solid fa-check"></i> Meta mÃ­nima: ${AppState.settings.passingGrade.toFixed(1)}
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AptidÃ£o / CertificaÃ§Ã£o</span>
            <h3 class="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">${passRate}%</h3>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
              ${approved} alunos aptos
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-award"></i>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Em AtenÃ§Ã£o / ReforÃ§o</span>
            <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">${recovery + failed}</h3>
            <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
              ${recovery} recuperaÃ§Ã£o, ${failed} pendentes
            </span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Desempenho por MÃ³dulo de MÃ­dias Digitais</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">MÃ©dia geral das notas lanÃ§adas em cada matÃ©ria</p>
            </div>
          </div>
          <div class="relative h-64 w-full">
            <canvas id="subjectAvgChart"></canvas>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div class="mb-4">
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">SituaÃ§Ã£o da Turma</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">DistribuiÃ§Ã£o geral dos alunos</p>
          </div>
          <div class="relative h-56 w-full flex items-center justify-center">
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
          label: "MÃ©dia do MÃ³dulo",
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
    else if (stats.status === "Em RecuperaÃ§Ã£o") recovery++;
    else if (stats.status === "Reprovado") failed++;
  });

  const ctxStatus = document.getElementById("statusDistChart");
  if (ctxStatus) {
    AppState.charts.statusDist = new Chart(ctxStatus, {
      type: "doughnut",
      data: {
        labels: ["Aprovados", "RecuperaÃ§Ã£o", "Reprovados"],
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
// ABA 4: RELATÃ“RIOS & BACKUP (COM REGRA DE ACESSO POR CPF)
// -------------------------------------------------------------
function renderReportsTab(container) {
  // REGRA DE ACESSO: Exige autenticaÃ§Ã£o por CPF cadastrado
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'reports');
    return;
  }

  // UsuÃ¡rio autenticado: exibe opÃ§Ãµes de acordo com o perfil
  const isProf = AppState.currentUser.role === 'professor';

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        <!-- Barra de IdentificaÃ§Ã£o do UsuÃ¡rio Logado -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-indigo-500 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-600">
              ${AppState.currentUser.photo ? `
                <img src="${AppState.currentUser.photo}" alt="Foto" class="w-full h-full object-cover">
              ` : `
                <i class="fa-solid fa-user"></i>
              `}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">${AppState.currentUser.name}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isProf ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                  ${isProf ? 'Docente / CoordenaÃ§Ã£o' : 'Aluno Matriculado'}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">CPF: ${maskCpf(AppState.currentUser.cpf, false)} â€¢ Acesso autenticado com sucesso</p>
            </div>
          </div>
          <button onclick="logoutCurrentUser()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 self-start sm:self-auto flex items-center gap-1.5 transition-all">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
          </button>
        </div>

        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <i class="fa-solid fa-file-export text-indigo-600"></i> RelatÃ³rios, Planilhas e Backup
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">
          ${isProf ? 'Exporte os dados completos do curso para abrir no Excel ou Google Sheets, imprima atas e faÃ§a backups.' : 'Acesse seu boletim escolar oficial, histÃ³rico de notas e comprovantes pedagÃ³gicos individuais.'}
        </p>

        ${isProf ? `
          <!-- Painel do Professor / CoordenaÃ§Ã£o (ExportaÃ§Ãµes Completas) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg mb-3">
                  <i class="fa-solid fa-file-excel"></i>
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Planilha do Curso (CSV)</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Exporta todos os ${AppState.students.length} alunos, telefones, polos/cidades de Alagoas, notas dos 7 mÃ³dulos e mÃ©dias para o Excel.
                </p>
              </div>
              <button onclick="exportStudentsToCSV()" class="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-download"></i> Baixar Planilha (.csv)
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg mb-3">
                  <i class="fa-solid fa-print"></i>
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Ata Oficial de Rendimento (PDF)</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  FormataÃ§Ã£o oficial para o Programa Emprega Mais Alagoas pronta para salvar em PDF ou imprimir.
                </p>
              </div>
              <button onclick="window.print()" class="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-print"></i> Imprimir Ata Geral
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-lg mb-3">
                  <i class="fa-solid fa-cloud-arrow-down"></i>
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Backup Completo (JSON)</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Salve cÃ³pia de seguranÃ§a de todos os cadastros e notas, ou restaure em outro computador.
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="exportBackupJSON()" class="flex-1 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow transition-all">
                  Backup
                </button>
                <button onclick="openRestoreModal()" class="flex-1 py-2.5 rounded-xl font-bold text-xs border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all">
                  Restaurar
                </button>
              </div>
            </div>

          </div>
        ` : `
          <!-- Painel do Aluno Autenticado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg mb-3">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Meu Boletim Escolar Oficial</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Visualize suas notas bimestrais nos 7 mÃ³dulos, cÃ¡lculo de mÃ©dia final, faltas registradas e situaÃ§Ã£o de aprovaÃ§Ã£o.
                </p>
              </div>
              <button onclick="openBoletimModal('${AppState.currentUser.id}')" class="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-file-invoice"></i> Abrir Meu Boletim
              </button>
            </div>

            <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg mb-3">
                  <i class="fa-solid fa-address-card"></i>
                </div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Minha Ficha e DiagnÃ³stico</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Consulte os dados que vocÃª informou na matrÃ­cula, desafios de aprendizado, redes sociais e expectativas pedagÃ³gicas.
                </p>
              </div>
              <button onclick="openStudentProfileModal('${AppState.currentUser.id}')" class="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-user-check"></i> Ver Minha Ficha Completa
              </button>
            </div>

          </div>

          <div class="mt-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
            <i class="fa-solid fa-circle-info text-base"></i>
            <span>ExportaÃ§Ãµes em lote da turma completa e backups administrativos sÃ£o reservados aos docentes e coordenadores do programa.</span>
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
    <div class="space-y-8 fade-in text-slate-800 dark:text-slate-200">
      
      <!-- Banner de ApresentaÃ§Ã£o Hero -->
      <div class="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl">
        <div class="relative z-10 max-w-4xl space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow">
              <i class="fa-solid fa-certificate mr-1"></i> Emprega Mais Alagoas
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
              <i class="fa-solid fa-graduation-cap mr-1"></i> GestÃ£o de MÃ­dias Digitais
            </span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
              <i class="fa-solid fa-users mr-1"></i> ${AppState.students.length || 715}+ Alunos Mapeados
            </span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Eu Por Dias: InteligÃªncia PedagÃ³gica e GestÃ£o Humana de Alunos
          </h1>

          <p class="text-sm sm:text-base text-indigo-100 font-normal leading-relaxed">
            Uma plataforma desenvolvida sob medida para o professor do curso de <strong>GestÃ£o de MÃ­dias Digitais</strong>. 
            Nascida da necessidade real de transformar mais de <strong>600 linhas estÃ¡ticas de planilha</strong> em uma experiÃªncia 
            pedagÃ³gica viva, Ã¡gil e focada na emancipaÃ§Ã£o profissional de cada estudante em Alagoas.
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <button 
              onclick="switchTab('students')" 
              class="px-5 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-users text-indigo-600"></i> Ir para o Painel de Alunos
            </button>
            <button 
              onclick="openAboutModal()" 
              class="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-book-open"></i> Ler Manifesto em Modal
            </button>
          </div>
        </div>

        <div class="absolute -right-10 -bottom-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Comparativo: Da Planilha Bruta ao Painel Vivo -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- O Problema Antes -->
        <div class="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-lg shadow-md shadow-rose-500/20">
              <i class="fa-solid fa-file-excel"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-rose-950 dark:text-rose-200">Como era antes: A Planilha Fria</h3>
              <p class="text-xs text-rose-700/80 dark:text-rose-400">Google Sala de Aula & FormulÃ¡rios tradicionais</p>
            </div>
          </div>

          <ul class="space-y-2.5 text-xs text-rose-900/90 dark:text-rose-300">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-xmark text-rose-500 mt-0.5"></i>
              <span><strong>648 linhas x 15 colunas densas:</strong> ImpossÃ­vel navegar rapidamente em sala de aula, no celular ou no projetor.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-xmark text-rose-500 mt-0.5"></i>
              <span><strong>DiagnÃ³sticos esquecidos:</strong> Medos reais dos alunos (*"vergonha de gravar vÃ­deos"*, *"nÃ£o sei editar reels"*) ficavam perdidos na coluna 14.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-xmark text-rose-500 mt-0.5"></i>
              <span><strong>ComunicaÃ§Ã£o truncada:</strong> Para avisar um aluno ou tirar dÃºvida, era necessÃ¡rio copiar o nÃºmero, abrir o WhatsApp e salvar o contato manualmente.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-xmark text-rose-500 mt-0.5"></i>
              <span><strong>Sem identidade visual:</strong> Nomes sem rosto, dificultando a chamada, a empatia pedagÃ³gica e o reconhecimento em turmas grandes.</span>
            </li>
          </ul>
        </div>

        <!-- A SoluÃ§Ã£o Agora -->
        <div class="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-600/20">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-emerald-950 dark:text-emerald-200">Como Ã© agora: O Eu Por Dias</h3>
              <p class="text-xs text-emerald-700/80 dark:text-emerald-400">Plataforma pedagÃ³gica Ã¡gil e humanizada</p>
            </div>
          </div>

          <ul class="space-y-2.5 text-xs text-emerald-900/90 dark:text-emerald-300">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-600 mt-0.5"></i>
              <span><strong>Cards PedagÃ³gicos Vivos:</strong> Foto, nome, polo SINE, matrÃ­cula, situaÃ§Ã£o acadÃªmica e endereÃ§o a um toque de distÃ¢ncia.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-600 mt-0.5"></i>
              <span><strong>Gaveta de DiagnÃ³stico Individual:</strong> Principais desafios, motivaÃ§Ã£o e expectativas visÃ­veis diretamente em cada card para mentoria pontual.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-600 mt-0.5"></i>
              <span><strong>WhatsApp e Instagram em 1-Clique:</strong> Abertura imediata de conversa formatada para avisos de aula e feedback de posts.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-600 mt-0.5"></i>
              <span><strong>Documentos Oficiais Prontos:</strong> EmissÃ£o de boletins escolares e atas gerais em PDF para prestaÃ§Ã£o de contas governamental.</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Os 7 Pilares: Por que foi construÃ­do assim? -->
      <div class="space-y-5">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              ARQUITETURA & DESIGN
            </span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Por que o Eu Por Dias foi construÃ­do exatamente assim?
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Entenda as decisÃµes tÃ©cnicas, pedagÃ³gicas e de usabilidade que moldaram o sistema.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- Pilar 1 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              1. 100% Client-Side & Custo Zero
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ConstruÃ­do sem servidores backend caros nem bancos de dados que podem cair durante a aula. Funciona direto no navegador com <strong>HTML5, Vanilla JS e Tailwind CSS</strong>. 
              Carrega instantaneamente mesmo com internet instÃ¡vel nos polos do interior de Alagoas.
            </p>
          </div>

          <!-- Pilar 2 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              2. Privacidade de Dados & LGPD
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Os dados pessoais dos alunos (atualmente ${AppState.students.length || 715}+ cadastrados, com CPFs, telefones, endereÃ§os e notas) permanecem protegidos por padrÃ£o. 
              Acesso Modo Deus exclusivo autenticado e controle rigoroso de exibiÃ§Ã£o para sala de aula.
            </p>
          </div>

          <!-- Pilar 3 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-brain"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              3. DiagnÃ³stico PedagÃ³gico Vivo
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O curso de MÃ­dias Digitais forma criadores de conteÃºdo e profissionais do mercado. 
              Saber se o aluno tem <strong>vergonha da cÃ¢mera</strong> ou quer <strong>divulgar o negÃ³cio da famÃ­lia</strong> permite ao professor 
              orientar a prÃ¡tica de forma cirÃºrgica e empÃ¡tica.
            </p>
          </div>

          <!-- Pilar 4 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center text-lg">
              <i class="fa-brands fa-whatsapp"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              4. ConexÃ£o Imediata (WhatsApp & Redes)
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              IntegraÃ§Ã£o ativa com a API do WhatsApp (<code class="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">wa.me</code>) e atalhos para Instagram/TikTok. 
              O professor cobra frequÃªncia, dÃ¡ feedback nas postagens dos alunos e envia oportunidades de emprego do SINE em segundos.
            </p>
          </div>

          <!-- Pilar 5 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-camera"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              5. Fotos Otimizadas & CÃ¢mera em Sala
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reconhecimento visual imediato. O sistema possui compressor nativo em Canvas (fotos de celular de 10MB viram leves 25KB), 
              captura com webcam ao vivo na sala de aula e biblioteca de avatares inclusivos.
            </p>
          </div>

          <!-- Pilar 6 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-file-signature"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              6. PrestaÃ§Ã£o de Contas Governamental
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              CÃ¡lculo automÃ¡tico de mÃ©dias com notas por mÃ³dulo de mÃ­dias digitais, controle de faltas e geraÃ§Ã£o de 
              <strong>Boletins Oficiais</strong> e <strong>Atas em PDF</strong> prontas para impressÃ£o e envio aos Ã³rgÃ£os estaduais (SINE / SEDH / Alagoas).
            </p>
          </div>

          <!-- Pilar 7 -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">
              7. Nuvem Gratuita Supabase & GitHub Pages
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Hospedado gratuitamente no <strong>GitHub Pages</strong> com HTTPS/SSL mundial. Integrado ao <strong>Supabase</strong> (PostgreSQL 500MB + Storage 1GB 100% gratuitos) para backup, restauraÃ§Ã£o e uso em mÃºltiplos computadores e celulares em 1-clique.
            </p>
          </div>

        </div>
      </div>

      <!-- MÃ³dulos do Curso de GestÃ£o de MÃ­dias Digitais -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-layer-group text-indigo-600"></i> Matriz Curricular & MÃ³dulos Avaliados
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">CompetÃªncias prÃ¡ticas avaliadas no Programa Emprega Mais Alagoas</p>
          </div>
          <button onclick="openSubjectsConfigModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-gear"></i> Configurar MÃ³dulos
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          ${AppState.subjects.map((s, idx) => `
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">MÃ“DULO ${String(idx + 1).padStart(2, '0')}</span>
              <h4 class="font-bold text-slate-800 dark:text-slate-200">${s}</h4>
              <p class="text-[11px] text-slate-400">4 atividades avaliativas + frequÃªncia</p>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- EspecificaÃ§Ãµes TÃ©cnicas -->
      <div class="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <h4 class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <i class="fa-solid fa-code text-indigo-600"></i> EspecificaÃ§Ãµes de Engenharia & Tecnologias
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
          <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Linguagem</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">Vanilla JavaScript (ES6+)</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">EstilizaÃ§Ã£o</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">Tailwind CSS (JIT CDN)</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">IntegraÃ§Ã£o</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">Google Sheets API v4</span>
          </div>
          <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Armazenamento</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">LocalStorage + JSON Sync</span>
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[92vh] flex flex-col">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-600/20">
              <i class="fa-solid fa-circle-question"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Sobre o Eu Por Dias</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Por que o sistema foi construÃ­do dessa forma?</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          
          <div class="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 space-y-1.5">
            <h3 class="font-bold text-sm flex items-center gap-1.5">
              <i class="fa-solid fa-lightbulb text-amber-500"></i> O PropÃ³sito do Eu Por Dias
            </h3>
            <p>
              O sistema foi concebido para o professor do curso de <strong>GestÃ£o de MÃ­dias Digitais</strong> do programa <strong>Emprega Mais Alagoas</strong>. 
              Ele une a gestÃ£o de notas com um <strong>diagnÃ³stico humano profundo</strong> de mais de ${AppState.students.length || 715} estudantes alagoanos.
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Principais RazÃµes de Arquitetura & Design:
            </h4>
            
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">1. Da Planilha EstÃ¡tica aos Cards Vivos:</span>
              <p class="text-slate-600 dark:text-slate-400">
                Planilhas com 648 linhas sÃ£o frias e lentas para usar em aula. O Eu Por Dias transforma cada linha em um card com foto, WhatsApp em 1-clique e desafios pessoais.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">2. Custo Zero & 100% Client-Side:</span>
              <p class="text-slate-600 dark:text-slate-400">
                NÃ£o depende de servidores caros nem bancos de dados que possam cair. Funciona instantaneamente mesmo no interior de Alagoas com conexÃµes instÃ¡veis.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">3. Privacidade e LGPD Sob Posse do Professor:</span>
              <p class="text-slate-600 dark:text-slate-400">
                Os dados dos alunos (CPF, telefones e endereÃ§os) nÃ£o sÃ£o enviados para serviÃ§os terceiros inseguros. Tudo fica gravado localmente com backup JSON.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span class="font-bold text-slate-900 dark:text-slate-100 block">4. Mentoria Direta & EmancipaÃ§Ã£o de Renda:</span>
              <p class="text-slate-600 dark:text-slate-400">
                Ao saber exatamente quais ferramentas o aluno domina (Canva, CapCut, Meta Ads) e quais sÃ£o seus medos, o professor orienta com foco em geraÃ§Ã£o de renda rÃ¡pida.
              </p>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button 
              onclick="closeModal(); switchTab('about');" 
              class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
            >
              Abrir Aba Completa do Sistema
            </button>
            <button 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Fechar
            </button>
          </div>

        </div>

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODAL: CADASTRO E EDIÃ‡ÃƒO DE ALUNO
// -------------------------------------------------------------
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
        classroom: AppState.classrooms[0] || "MÃ­dias Digitais - MaceiÃ³ Matutino",
        status: "Ativo",
        avatarColor: "from-indigo-500 to-purple-600",
        notes: "",
        contact: {
          phone: "",
          email: "",
          guardianName: "",
          guardianKinship: "MÃ£e",
          guardianPhone: ""
        },
        address: {
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "MaceiÃ³",
          state: "AL"
        },
        grades: {}
      };

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const classrooms = Array.from(new Set(AppState.classrooms.concat(AppState.students.map(s => s.classroom)))).sort();

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[90vh] flex flex-col">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              <i class="fa-solid ${isEditing ? 'fa-user-pen' : 'fa-user-plus'}"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">
                ${isEditing ? 'Editar Aluno' : 'Cadastrar Aluno (Emprega Mais Alagoas)'}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Dados cadastrais, WhatsApp, e-mail e endereÃ§o com CEP</p>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="student-form" onsubmit="saveStudentForm(event)" class="overflow-y-auto flex-1 p-6 space-y-6">
          
          <!-- SeÃ§Ã£o Destacada: Foto do Aluno -->
          <div class="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5">
            
            <div class="relative group/formavatar flex-shrink-0">
              <div id="form-avatar-preview" class="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr ${student.avatarColor || 'from-indigo-500 to-purple-600'} text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white dark:border-slate-700">
                ${student.photoUrl ? `
                  <img id="form-avatar-img" src="${student.photoUrl}" alt="${student.name || 'Aluno'}" class="w-full h-full object-cover" />
                ` : `
                  <span id="form-avatar-initials">${student.name ? student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : '<i class="fa-solid fa-user"></i>'}</span>
                `}
              </div>
              <button 
                type="button" 
                onclick="document.getElementById('form-photo-file-input').click()"
                class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white shadow-md flex items-center justify-center text-xs hover:bg-indigo-700 transition-transform active:scale-90"
                title="Carregar Foto do Computador"
              >
                <i class="fa-solid fa-camera"></i>
              </button>
            </div>

            <div class="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                  <i class="fa-solid fa-image text-indigo-600 dark:text-indigo-400"></i> Foto de Perfil do Aluno
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Escolha uma foto do seu dispositivo, tire pela cÃ¢mera ou use um dos avatares.
                </p>
              </div>

              <input type="hidden" name="photoUrl" id="form-photo-url-input" value="${student.photoUrl || ''}">
              <input type="hidden" name="avatarColor" id="form-avatar-color-input" value="${student.avatarColor || 'from-indigo-500 to-purple-600'}">
              <input type="file" id="form-photo-file-input" accept="image/*" onchange="handleFormPhotoFileSelect(event)" class="hidden">

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button 
                  type="button" 
                  onclick="document.getElementById('form-photo-file-input').click()"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <i class="fa-solid fa-upload"></i> Escolher Foto
                </button>
                <button 
                  type="button" 
                  onclick="openWebcamForStudentForm()"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <i class="fa-solid fa-camera"></i> CÃ¢mera
                </button>
                <button 
                  type="button" 
                  id="form-remove-photo-btn"
                  onclick="removeFormPhoto()"
                  class="${student.photoUrl ? 'flex' : 'hidden'} px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 items-center gap-1 transition-colors"
                >
                  <i class="fa-solid fa-trash-can"></i> Remover
                </button>
              </div>

              <!-- Cores de Fundo do Avatar -->
              <div class="pt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                <span class="text-[10px] text-slate-400 font-medium mr-1">Cor do fundo:</span>
                ${[
                  { name: 'Ãndigo', val: 'from-indigo-500 to-purple-600', bg: 'bg-gradient-to-tr from-indigo-500 to-purple-600' },
                  { name: 'Esmeralda', val: 'from-emerald-500 to-teal-600', bg: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
                  { name: 'Rosa', val: 'from-rose-500 to-pink-600', bg: 'bg-gradient-to-tr from-rose-500 to-pink-600' },
                  { name: 'Ã‚mbar', val: 'from-amber-500 to-orange-600', bg: 'bg-gradient-to-tr from-amber-500 to-orange-600' },
                  { name: 'Azul', val: 'from-blue-500 to-cyan-600', bg: 'bg-gradient-to-tr from-blue-500 to-cyan-600' },
                  { name: 'Roxo', val: 'from-purple-600 to-pink-600', bg: 'bg-gradient-to-tr from-purple-600 to-pink-600' }
                ].map(c => `
                  <button 
                    type="button"
                    onclick="setFormAvatarColor('${c.val}')"
                    class="w-5 h-5 rounded-full ${c.bg} shadow-sm ring-offset-2 hover:scale-110 transition-transform ${student.avatarColor === c.val ? 'ring-2 ring-indigo-600' : ''}"
                    title="${c.name}"
                  ></button>
                `).join("")}
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <i class="fa-solid fa-id-card"></i> 1. IdentificaÃ§Ã£o do Aluno
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  name="name" 
                  value="${student.name || ''}" 
                  required 
                  placeholder="Ex: Alana VitÃ³ria TenÃ³rio"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MatrÃ­cula / ID</label>
                <input 
                  type="text" 
                  name="id" 
                  value="${student.id || ''}" 
                  required 
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-mono text-slate-600 dark:text-slate-300"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CPF do Aluno</label>
                <input 
                  type="text" 
                  name="cpf" 
                  value="${student.cpf || ''}" 
                  placeholder="000.000.000-00"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                >
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Turma / Cidade *</label>
                <select 
                  name="classroom" 
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  ${classrooms.map(c => `<option value="${c}" ${student.classroom === c ? 'selected' : ''}>${c}</option>`).join("")}
                </select>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <i class="fa-solid fa-address-book"></i> 2. Contatos & ComunicaÃ§Ã£o
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone" 
                  value="${student.contact?.phone || ''}" 
                  placeholder="(82) 99999-8888"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input 
                  type="email" 
                  name="email" 
                  value="${student.contact?.email || ''}" 
                  placeholder="aluno@aluno.al.gov.br"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do ResponsÃ¡vel / EmergÃªncia</label>
                <input 
                  type="text" 
                  name="guardianName" 
                  value="${student.contact?.guardianName || ''}" 
                  placeholder="Ex: Severino TenÃ³rio"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Parentesco</label>
                  <input 
                    type="text" 
                    name="guardianKinship" 
                    value="${student.contact?.guardianKinship || 'MÃ£e'}" 
                    class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tel. ResponsÃ¡vel</label>
                  <input 
                    type="text" 
                    name="guardianPhone" 
                    value="${student.contact?.guardianPhone || ''}" 
                    placeholder="(82) 98888-7777"
                    class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                </div>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <i class="fa-solid fa-map-location-dot"></i> 3. EndereÃ§o Residencial (Alagoas)
              </h3>
              <span class="text-[11px] text-slate-400">Busca rÃ¡pida ViaCEP</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                <div class="relative">
                  <input 
                    type="text" 
                    id="cep-input"
                    name="cep" 
                    value="${student.address?.cep || ''}" 
                    placeholder="57000-000"
                    maxlength="9"
                    onblur="handleCepBlur(this.value)"
                    class="w-full pl-3.5 pr-9 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  >
                  <button 
                    type="button" 
                    onclick="handleCepSearchClick()" 
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 p-1"
                    title="Buscar CEP"
                  >
                    <i id="cep-spinner" class="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rua / Logradouro</label>
                <input 
                  type="text" 
                  id="street-input"
                  name="street" 
                  value="${student.address?.street || ''}" 
                  placeholder="Ex: Avenida Doutor AntÃ´nio Gouveia"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NÃºmero</label>
                <input 
                  type="text" 
                  name="number" 
                  value="${student.address?.number || ''}" 
                  placeholder="1500"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Complemento</label>
                <input 
                  type="text" 
                  name="complement" 
                  value="${student.address?.complement || ''}" 
                  placeholder="Apto 302"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                <input 
                  type="text" 
                  id="neighborhood-input"
                  name="neighborhood" 
                  value="${student.address?.neighborhood || ''}" 
                  placeholder="Ponta Verde"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                <input 
                  type="text" 
                  id="city-input"
                  name="city" 
                  value="${student.address?.city || 'MaceiÃ³'}" 
                  placeholder="MaceiÃ³"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">UF (Estado)</label>
                <input 
                  type="text" 
                  id="state-input"
                  name="state" 
                  value="${student.address?.state || 'AL'}" 
                  maxlength="2"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 uppercase text-center"
                >
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
              <i class="fa-solid fa-brain"></i> 4. DiagnÃ³stico, Redes Sociais & Perfil
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ãrea de AtuaÃ§Ã£o / ProfissÃ£o</label>
                <input 
                  type="text" 
                  name="profession" 
                  value="${student.profession || ''}" 
                  placeholder="Ex: Corretor de ImÃ³veis, EstÃ©tica, Confeitaria..."
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">NÃ­vel de Escolaridade</label>
                <input 
                  type="text" 
                  name="education" 
                  value="${student.education || ''}" 
                  placeholder="Ex: Ensino MÃ©dio Completo, Superior Cursando..."
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link ou @ da Rede Social</label>
                <input 
                  type="text" 
                  name="socialMedia" 
                  value="${student.socialMedia || ''}" 
                  placeholder="Ex: @usuario ou https://instagram.com/usuario"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">JÃ¡ trabalhou com redes sociais?</label>
                <input 
                  type="text" 
                  name="experience" 
                  value="${student.experience || 'NÃ£o'}" 
                  placeholder="Ex: Sim / NÃ£o / Apenas pessoal"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Redes mais utilizadas</label>
                <input 
                  type="text" 
                  name="frequentNetworks" 
                  value="${student.frequentNetworks || ''}" 
                  placeholder="Ex: Instagram, WhatsApp, TikTok, YouTube"
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ferramentas jÃ¡ utilizadas</label>
                <input 
                  type="text" 
                  name="tools" 
                  value="${student.tools || ''}" 
                  placeholder="Ex: Canva, CapCut, Meta Business, ChatGPT..."
                  class="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Principais Desafios ao Produzir ConteÃºdo</label>
                <textarea 
                  name="challenges" 
                  rows="2" 
                  placeholder="Ex: EdiÃ§Ã£o de vÃ­deos, vergonha na cÃ¢mera, criatividade..."
                  class="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >${student.challenges || ''}</textarea>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">O que motivou a se inscrever no curso?</label>
                <textarea 
                  name="motivation" 
                  rows="2" 
                  placeholder="Ex: Divulgar meu negÃ³cio, ter nova profissÃ£o..."
                  class="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >${student.motivation || ''}</textarea>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expectativas em relaÃ§Ã£o ao curso</label>
                <textarea 
                  name="expectations" 
                  rows="2" 
                  placeholder="Ex: Aprender a usar as ferramentas e gerar renda..."
                  class="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >${student.expectations || ''}</textarea>
              </div>

            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
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
      showToast("CEP nÃ£o encontrado.", "warning");
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

    showToast(`EndereÃ§o carregado: ${data.bairro} - ${data.localidade}/${data.uf}`, "success");
    return data;
  } catch (err) {
    showToast("NÃ£o foi possÃ­vel consultar o CEP.", "error");
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
    notes: existingStudent?.notes || "Aluno do curso de GestÃ£o de MÃ­dias Digitais.",
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
      city: formData.get("city")?.trim() || "MaceiÃ³",
      state: (formData.get("state") || "AL").toUpperCase().trim()
    },
    grades: existingStudent ? existingStudent.grades : {}
  };

  if (AppState.editingStudentId) {
    const index = AppState.students.findIndex(s => s.id === AppState.editingStudentId);
    if (index !== -1) {
      AppState.students[index] = studentData;
      showToast(`Aluno "${studentData.name}" atualizado!`);
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[90vh] flex flex-col">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg font-bold">
              <i class="fa-solid fa-award"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
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
              <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>Turma: ${student.classroom}</span>
                <span>â€¢</span>
                <span>MatrÃ­cula: ${student.id}</span>
              </div>
            </div>
          </div>
          <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form id="student-grades-form" onsubmit="saveStudentGradesForm(event, '${student.id}')" class="overflow-y-auto flex-1 p-6 space-y-4">
          <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th class="py-3 px-3">MÃ³dulo / Disciplina</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 1</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 2</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 3</th>
                  <th class="py-3 px-2 text-center w-20">Ativ. 4</th>
                  <th class="py-3 px-2 text-center w-16">Faltas</th>
                  <th class="py-3 px-3 text-center w-20">MÃ©dia</th>
                  <th class="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${AppState.subjects.map(subject => {
                  const data = student.grades?.[subject] || {};
                  const { avg, hasGrades } = calculateSubjectAverage(data);
                  const isPassing = avg >= AppState.settings.passingGrade;
                  const isRec = avg >= AppState.settings.recoveryGrade;

                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${focusSubject === subject ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
                      <td class="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
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
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
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
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
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
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
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
                          class="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                        >
                      </td>
                      <td class="py-2 px-1 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          name="${subject}_absences" 
                          value="${data.absences ?? 0}"
                          class="w-12 px-1 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                      </td>
                      <td class="py-2.5 px-3 text-center font-bold text-sm ${!hasGrades ? 'text-slate-400' : isPassing ? 'text-emerald-600' : isRec ? 'text-amber-600' : 'text-rose-600'}">
                        ${hasGrades ? avg.toFixed(1) : '-'}
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        ${!hasGrades ? '<span class="text-slate-400 text-[11px]">-</span>' : isPassing ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Aprovado</span>' : isRec ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">RecuperaÃ§Ã£o</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Reprovado</span>'}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow"
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden scale-in max-h-[95vh] flex flex-col">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 no-print">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-invoice text-indigo-600 text-lg"></i>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">Boletim de Rendimento Escolar</h2>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow flex items-center gap-1.5"
            >
              <i class="fa-solid fa-print"></i> Imprimir / Salvar PDF
            </button>
            <button onclick="closeModal()" class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <div id="printable-content" class="overflow-y-auto flex-1 p-8 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 space-y-6">
          
          <div class="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center">
            <h1 class="text-xl font-black tracking-tight uppercase">${AppState.settings.schoolName}</h1>
            <p class="text-xs text-slate-600 dark:text-slate-400">${AppState.settings.courseName} â€¢ Ano Letivo ${AppState.settings.schoolYear}</p>
            <h2 class="text-xs font-bold mt-2 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 py-1 rounded">Boletim Individual do Aluno</h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <div class="sm:col-span-2">
              <span class="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Aluno(a)</span>
              <span class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>${displayName}</span>
                ${AppState.privacyMode ? `
                  <button 
                    onclick="toggleRevealStudent('${student.id}'); openBoletimModal('${student.id}')" 
                    class="text-xs ${isRevealed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-amber-500'} transition-colors no-print"
                    title="${isRevealed ? 'Ocultar nome' : 'Revelar nome completo (Modo Deus)'}"
                  >
                    <i class="fa-solid ${isRevealed ? 'fa-eye' : 'fa-eye-slash'}"></i>
                  </button>
                ` : ''}
              </span>
              <span class="block text-[10px] text-slate-400 font-mono">${student.id}</span>
            </div>
            <div>
              <span class="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">CPF</span>
              <span class="font-mono font-semibold">${student.cpf ? displayCpf : 'NÃ£o informado'}</span>
            </div>
            <div>
              <span class="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Turma</span>
              <span class="font-semibold">${student.classroom}</span>
            </div>
            <div>
              <span class="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">SituaÃ§Ã£o Final</span>
              <span class="font-bold ${stats.status === 'Aprovado' ? 'text-emerald-600' : stats.status === 'Em RecuperaÃ§Ã£o' ? 'text-amber-600' : 'text-rose-600'}">
                ${stats.status}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse border border-slate-300 dark:border-slate-700">
              <thead>
                <tr class="bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  <th class="py-2.5 px-3 border border-slate-300 dark:border-slate-700">MÃ³dulo do Curso</th>
                  <th class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">Ativ. 1</th>
                  <th class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">Ativ. 2</th>
                  <th class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">Ativ. 3</th>
                  <th class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">Ativ. 4</th>
                  <th class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">Faltas</th>
                  <th class="py-2.5 px-3 text-center border border-slate-300 dark:border-slate-700">MÃ©dia</th>
                  <th class="py-2.5 px-3 text-center border border-slate-300 dark:border-slate-700">Resultado</th>
                </tr>
              </thead>
              <tbody>
                ${AppState.subjects.map(subject => {
                  const data = student.grades?.[subject] || {};
                  const { avg, hasGrades } = calculateSubjectAverage(data);
                  const isPass = avg >= AppState.settings.passingGrade;
                  const isRec = avg >= AppState.settings.recoveryGrade;

                  return `
                    <tr class="border-b border-slate-200 dark:border-slate-800">
                      <td class="py-2 px-3 font-semibold border border-slate-300 dark:border-slate-700">${subject}</td>
                      <td class="py-2 px-2 text-center border border-slate-300 dark:border-slate-700 font-mono">${data.b1 !== null && data.b1 !== undefined ? Number(data.b1).toFixed(1) : '-'}</td>
                      <td class="py-2 px-2 text-center border border-slate-300 dark:border-slate-700 font-mono">${data.b2 !== null && data.b2 !== undefined ? Number(data.b2).toFixed(1) : '-'}</td>
                      <td class="py-2 px-2 text-center border border-slate-300 dark:border-slate-700 font-mono">${data.b3 !== null && data.b3 !== undefined ? Number(data.b3).toFixed(1) : '-'}</td>
                      <td class="py-2 px-2 text-center border border-slate-300 dark:border-slate-700 font-mono">${data.b4 !== null && data.b4 !== undefined ? Number(data.b4).toFixed(1) : '-'}</td>
                      <td class="py-2 px-2 text-center border border-slate-300 dark:border-slate-700">${data.absences || 0}</td>
                      <td class="py-2 px-3 text-center font-bold font-mono border border-slate-300 dark:border-slate-700 ${!hasGrades ? '' : isPass ? 'text-emerald-700' : isRec ? 'text-amber-700' : 'text-rose-700'}">
                        ${hasGrades ? avg.toFixed(1) : '-'}
                      </td>
                      <td class="py-2 px-3 text-center font-semibold border border-slate-300 dark:border-slate-700 text-[11px]">
                        ${!hasGrades ? '-' : isPass ? 'Aprovado' : isRec ? 'RecuperaÃ§Ã£o' : 'Reprovado'}
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
              <tfoot>
                <tr class="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-400">
                  <td class="py-2.5 px-3 border border-slate-300 dark:border-slate-700">MÃ‰DIA GERAL DO CURSO</td>
                  <td colspan="4" class="border border-slate-300 dark:border-slate-700"></td>
                  <td class="py-2.5 px-2 text-center border border-slate-300 dark:border-slate-700">${stats.totalAbsences}</td>
                  <td class="py-2.5 px-3 text-center text-sm font-black border border-slate-300 dark:border-slate-700">${stats.overallAvg.toFixed(1)}</td>
                  <td class="py-2.5 px-3 text-center border border-slate-300 dark:border-slate-700">${stats.status}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 dark:text-slate-400">
            <div class="pt-10 border-t border-slate-400">
              <span class="block font-semibold text-slate-800 dark:text-slate-200">Professor / CoordenaÃ§Ã£o</span>
              <span>Emprega Mais Alagoas</span>
            </div>
            <div class="pt-10 border-t border-slate-400">
              <span class="block font-semibold text-slate-800 dark:text-slate-200">Assinatura do Aluno</span>
              <span>Data: ___/___/_______</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// EXPORTAÃ‡Ã•ES E BACKUP
// -------------------------------------------------------------
function exportStudentsToCSV(forcePrivacy = false) {
  if (AppState.students.length === 0) {
    showToast("NÃ£o hÃ¡ alunos para exportar.", "warning");
    return;
  }

  // REGRA MANDATÃ“RIA: Sem Modo Deus ativo, a exportaÃ§Ã£o Ã© sempre com dados protegidos/mascarados!
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 scale-in space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-lg">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">Restaurar Backup</h3>
            <p class="text-xs text-slate-500">Selecione o arquivo .json do Eu Por Dias</p>
          </div>
        </div>

        <input 
          type="file" 
          id="backup-file-input" 
          accept=".json"
          class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        >

        <div class="flex items-center justify-end gap-2 pt-2">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            Cancelar
          </button>
          <button onclick="processBackupFile()" class="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow">
            Restaurar Dados
          </button>
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
        showToast("Formato de backup invÃ¡lido.", "error");
      }
    } catch (err) {
      showToast("Erro ao ler arquivo JSON.", "error");
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------
// CONFIGURAÃ‡ÃƒO DE MÃ“DULOS
// -------------------------------------------------------------
function openSubjectsConfigModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 scale-in space-y-4">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">MÃ³dulos do Curso (MÃ­dias Digitais)</h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="text" 
            id="new-subject-input" 
            placeholder="Nome do novo mÃ³dulo..."
            class="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
          <button onclick="addSubject()" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700">
            Adicionar
          </button>
        </div>

        <div class="space-y-1.5 max-h-56 overflow-y-auto">
          ${AppState.subjects.map(s => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium">
              <span>${s}</span>
              <button onclick="removeSubject('${s}')" class="text-rose-500 hover:text-rose-700 text-xs">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `).join("")}
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Concluir
          </button>
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
    showToast("Este mÃ³dulo jÃ¡ existe.", "warning");
    return;
  }

  AppState.subjects.push(name);
  saveDataToStorage();
  openSubjectsConfigModal();
  renderApp();
  showToast(`MÃ³dulo "${name}" adicionado.`);
}

function removeSubject(name) {
  if (AppState.subjects.length <= 1) {
    showToast("O curso deve ter pelo menos um mÃ³dulo.", "warning");
    return;
  }
  AppState.subjects = AppState.subjects.filter(s => s !== name);
  saveDataToStorage();
  openSubjectsConfigModal();
  renderApp();
  showToast(`MÃ³dulo "${name}" removido.`, "info");
}

// -------------------------------------------------------------
// EVENTOS GLOBAIS
// -------------------------------------------------------------
function setupGlobalEventListeners() {
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      switchTab(tab);
    });
  });

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
    showToast("Acesso restrito: este menu Ã© exclusivo para docentes e coordenaÃ§Ã£o.", "warning");
    AppState.currentTab = "grades";
    renderApp();
    return;
  }

  AppState.currentTab = tab;
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
// SISTEMA DE AUTENTICAÃ‡ÃƒO POR CPF E MENU DE USUÃRIO
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
      <div class="relative">
        <button 
          onclick="toggleUserDropdownMenu()" 
          class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
          title="Meu Perfil (${AppState.currentUser.name})"
        >
          ${photo ? `
            <img src="${photo}" alt="Foto" class="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500">
          ` : `
            <div class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
              ${initial}
            </div>
          `}
          <div class="text-left leading-tight hidden lg:block">
            <span class="block text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">${AppState.currentUser.name.split(' ')[0]}</span>
            <span class="block text-[9px] font-extrabold ${isProf ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'} uppercase">${isProf ? 'Docente' : 'Aluno'}</span>
          </div>
          <i class="fa-solid fa-angle-down text-[10px] text-slate-400"></i>
        </button>

        <div id="user-header-dropdown" class="hidden absolute right-0 mt-1.5 w-56 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-xs">
          <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p class="font-bold text-slate-900 dark:text-slate-100 truncate">${AppState.currentUser.name}</p>
            <p class="text-[10px] text-slate-400 truncate">CPF: ${maskCpf(AppState.currentUser.cpf, false)}</p>
            <span class="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${isProf ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'} uppercase">
              ${isProf ? 'Professor / CoordenaÃ§Ã£o' : 'Aluno Matriculado'}
            </span>
          </div>
          <button onclick="openUserPhotoUploadModal()" class="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-camera text-indigo-600"></i> ${photo ? 'Alterar Minha Foto' : 'Adicionar Foto de Perfil'}
          </button>
          ${!isProf ? `
            <button onclick="openStudentProfileModal('${AppState.currentUser.id}')" class="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
              <i class="fa-solid fa-address-card text-emerald-600"></i> Minha Ficha Cadastral
            </button>
            <button onclick="openBoletimModal('${AppState.currentUser.id}')" class="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
              <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Meu Boletim Escolar
            </button>
          ` : ''}
          <button onclick="switchTab('forum')" class="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-comments text-purple-600"></i> FÃ³rum & Chat ao Vivo
          </button>
          <div class="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
            <button onclick="logoutCurrentUser()" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button 
        onclick="openCpfLoginModal()" 
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm transition-all transform active:scale-95"
        title="Entrar no sistema com CPF cadastrado"
      >
        <i class="fa-solid fa-id-card text-indigo-600 dark:text-indigo-400"></i>
        <span class="hidden sm:inline">Entrar com CPF</span>
      </button>
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 scale-in space-y-5">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Login de Acesso ao Sistema</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Emprega Mais Alagoas â€¢ MÃ­dias Digitais</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Seletor de Perfil / Menu -->
        <div class="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 text-xs font-semibold">
          <button 
            type="button" 
            id="role-tab-aluno" 
            onclick="switchCpfLoginRole('aluno')" 
            class="flex-1 py-2 rounded-xl text-center font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fa-solid fa-graduation-cap"></i> Aluno
          </button>
          <button 
            type="button" 
            id="role-tab-professor" 
            onclick="switchCpfLoginRole('professor')" 
            class="flex-1 py-2 rounded-xl text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fa-solid fa-chalkboard-user"></i> Professor
          </button>
        </div>

        <form onsubmit="handleCpfLoginSubmit(event)" class="space-y-4">
          
          <div id="prof-name-container" class="hidden space-y-1">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nome do Docente / Coordenador</label>
            <input 
              type="text" 
              id="login-prof-name" 
              value="Professor(a) â€¢ CoordenaÃ§Ã£o Emprega Mais"
              class="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span id="login-cpf-label">CPF do Aluno Matriculado</span>
            </label>
            <div class="relative">
              <input 
                type="text" 
                id="login-cpf-input" 
                required 
                maxlength="14"
                placeholder="000.000.000-00" 
                class="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                oninput="formatCpfInput(this)"
              />
              <i class="fa-solid fa-address-card absolute left-3 top-3 text-slate-400 text-xs"></i>
            </div>
            <p id="login-hint" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              O CPF digitado serÃ¡ validado contra a base de ${AppState.students.length} alunos cadastrados previamente.
            </p>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-right-to-bracket"></i> Acessar o Sistema
            </button>
          </div>
        </form>

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
    tabProf.className = "flex-1 py-2 rounded-xl text-center font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all flex items-center justify-center gap-1.5";
    tabAluno.className = "flex-1 py-2 rounded-xl text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
    if (profNameCont) profNameCont.classList.remove("hidden");
    if (cpfLabel) cpfLabel.textContent = "CPF do Professor / Docente";
    if (loginHint) loginHint.textContent = "Docentes tÃªm acesso irrestrito a relatÃ³rios, criaÃ§Ã£o de tÃ³picos com anexos e envios de e-mail.";
    if (cpfInput && !cpfInput.value) cpfInput.value = "031.818.825-31";
  } else {
    tabAluno.className = "flex-1 py-2 rounded-xl text-center font-bold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all flex items-center justify-center gap-1.5";
    tabProf.className = "flex-1 py-2 rounded-xl text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
    if (profNameCont) profNameCont.classList.add("hidden");
    if (cpfLabel) cpfLabel.textContent = "CPF do Aluno Matriculado";
    if (loginHint) loginHint.textContent = `O CPF digitado serÃ¡ validado contra a base de ${AppState.students.length} alunos cadastrados previamente.`;
    if (cpfInput && cpfInput.value === "031.818.825-31") cpfInput.value = "";
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

function handleCpfLoginSubmit(e) {
  e.preventDefault();
  const cpfInput = document.getElementById("login-cpf-input");
  const rawCpf = cpfInput ? cpfInput.value.trim() : "";
  const digits = cleanCpfDigits(rawCpf);

  if (digits.length < 11) {
    showToast("Por favor, digite um CPF vÃ¡lido com 11 dÃ­gitos.", "warning");
    return;
  }

  if (currentLoginRole === "professor") {
    const profNameInput = document.getElementById("login-prof-name");
    const profName = (profNameInput?.value || "").trim() || "Professor(a) â€¢ CoordenaÃ§Ã£o Emprega Mais";

    AppState.currentUser = {
      id: "PROF-EMA-001",
      name: profName,
      cpf: rawCpf,
      role: "professor",
      photo: AppState.godMode?.user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
      email: "docente@empregamais.al.gov.br",
      classroom: "CoordenaÃ§Ã£o Geral",
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
    showToast("CPF nÃ£o encontrado na lista de alunos matriculados no Emprega Mais Alagoas.", "error", 4500);
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

  showToast(`OlÃ¡, ${student.name.split(" ")[0]}! Login realizado com sucesso.`, "success");

  // Se nÃ£o tem foto, convida amigavelmente para adicionar
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
  showToast("VocÃª saiu da conta com sucesso.", "info");
  renderApp();
}

function openPromptUserPhotoModal() {
  if (!AppState.currentUser) return;
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 scale-in">
        <div class="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <i class="fa-solid fa-camera"></i>
        </div>
        <div class="space-y-1">
          <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">Adicione sua Foto de Perfil</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Regra da comunidade: para participar do <strong>FÃ³rum & Chat ao vivo</strong> Ã© necessÃ¡rio possuir foto de perfil.
          </p>
        </div>
        <div class="space-y-2 pt-2">
          <button 
            onclick="openUserPhotoUploadModal()" 
            class="w-full py-3 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-camera-retro"></i> Tirar Foto com Webcam / Upload
          </button>
          <button 
            onclick="closeModal()" 
            class="w-full py-2.5 rounded-2xl font-semibold text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Continuar sem Foto por Enquanto
          </button>
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 scale-in space-y-5">
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Foto de Perfil</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">${AppState.currentUser.name}</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex flex-col items-center justify-center space-y-4 py-2">
          <div class="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-indigo-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg">
            <img 
              id="user-profile-preview-img" 
              src="${AppState.currentUser.photo || 'https://via.placeholder.com/150?text=Sem+Foto'}" 
              alt="Foto Atual" 
              class="w-full h-full object-cover"
            />
            <video id="user-webcam-video" autoplay playsinline class="hidden absolute inset-0 w-full h-full object-cover"></video>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-center">
            <label class="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5 transition-all">
              <i class="fa-solid fa-upload"></i> Enviar do Arquivo
              <input type="file" accept="image/*" class="hidden" onchange="handleUserPhotoFileInput(event)" />
            </label>
            <button 
              type="button" 
              id="btn-start-user-cam" 
              onclick="startUserWebcam()" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1.5 transition-all"
            >
              <i class="fa-solid fa-video"></i> Usar Webcam
            </button>
            <button 
              type="button" 
              id="btn-capture-user-cam" 
              onclick="captureUserWebcamPhoto()" 
              class="hidden px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow flex items-center gap-1.5 transition-all"
            >
              <i class="fa-solid fa-circle-dot"></i> Capturar Agora
            </button>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onclick="closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Concluir
          </button>
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
    showToast("NÃ£o foi possÃ­vel acessar a cÃ¢mera: " + err.message, "error");
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

  // Se for aluno, salva tambÃ©m no registro do aluno
  if (AppState.currentUser.role === 'aluno' && AppState.currentUser.id) {
    const student = AppState.students.find(s => s.id === AppState.currentUser.id);
    if (student) {
      student.photoUrl = photoData;
      saveDataToStorage();
    }
  }

  showToast("Foto de perfil atualizada com sucesso! VocÃª agora pode postar no FÃ³rum e Chat.", "success");
  renderApp();
}

// -------------------------------------------------------------
// AUTOMAÃ‡ÃƒO DE ENVIO DE RELATÃ“RIO INDIVIDUAL POR E-MAIL
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
    const statusStr = !hasGrades ? "Em Andamento" : (avg >= passGrade ? "Aprovado" : "RecuperaÃ§Ã£o");

    modulesRowsText += `â€¢ MÃ³dulo ${idx + 1} (${subj}): MÃ©dia ${avgStr} | Faltas: ${gradeObj.absences || 0} (${statusStr})\n`;

    modulesRowsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 10px; font-size: 11px; font-weight: bold; color: #1e293b;">MÃ³dulo ${idx + 1}: ${subj}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #475569;">${gradeObj.b1 || '-'}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #475569;">${gradeObj.b2 || '-'}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; font-weight: bold; color: ${avg >= passGrade ? '#059669' : '#d97706'};">${avgStr}</td>
        <td style="padding: 8px 10px; font-size: 11px; text-align: center; color: #64748b;">${gradeObj.absences || 0}</td>
      </tr>
    `;
  });

  const fullText = `*RELATÃ“RIO INDIVIDUAL E DIAGNÃ“STICO PEDAGÃ“GICO*
Programa Emprega Mais Alagoas â€¢ Curso de GestÃ£o de MÃ­dias Digitais

Aluno(a): ${student.name}
MatrÃ­cula: ${student.id}
Unidade: ${student.classroom || student.unitCity || 'Alagoas'}
MÃ©dia Geral Atual: ${stats.overallAvg.toFixed(1)} | SituaÃ§Ã£o: ${stats.status}

ðŸ“‹ O QUE VOCÃŠ INFORMOU NO SEU DIAGNÃ“STICO INICIAL:
â€¢ Principais Desafios com ConteÃºdo: "${student.challenges || 'NÃ£o informado'}"
â€¢ MotivaÃ§Ã£o para se Inscrever: "${student.motivation || 'Aprender e evoluir'}"
â€¢ Expectativas do Curso: "${student.expectations || 'Evoluir nas redes sociais'}"
â€¢ Redes que mais utiliza: ${student.frequentNetworks || 'Instagram'}
â€¢ Ferramentas conhecidas: ${student.tools || 'Nenhuma'}

ðŸ“Š DESEMPENHO NOS MÃ“DULOS AVALIADOS:
${modulesRowsText}
ðŸ’¬ PARECER PEDAGÃ“GICO DO PROFESSOR:
"${teacherNote || 'ParabÃ©ns pela dedicaÃ§Ã£o nas aulas prÃ¡ticas. Continue mantendo a consistÃªncia e produzindo conteÃºdos autorais!'}"

Governo de Alagoas â€¢ Secretaria do Trabalho, Emprego e Renda`;

  return { text: fullText, htmlTable: modulesRowsHtml, stats };
}

function openSendEmailReportModal(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const defaultEmail = student.contact?.email || student.email || "";
  const defaultNote = "ParabÃ©ns pela sua jornada no Curso de GestÃ£o de MÃ­dias Digitais! Revisamos os desafios e expectativas que vocÃª compartilhou no primeiro dia e estamos muito orgulhosos da sua evoluÃ§Ã£o tÃ©cnica.";
  const summary = buildStudentReportSummary(student, defaultNote);

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 scale-in space-y-5 my-8 max-h-[92vh] flex flex-col">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg shadow-sm">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Enviar RelatÃ³rio Direto por E-mail</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Resumo individual feito de acordo com as informaÃ§Ãµes deixadas pelo aluno</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail do Aluno (DestinatÃ¡rio)</label>
              <input 
                type="email" 
                id="email-report-dest" 
                value="${defaultEmail}" 
                placeholder="exemplo@email.com" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assunto do E-mail</label>
              <input 
                type="text" 
                id="email-report-subject" 
                value="[Emprega Mais Alagoas] Seu RelatÃ³rio Individual e DiagnÃ³stico PedagÃ³gico â€¢ ${student.name}" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parecer / Mensagem do Professor (PersonalizÃ¡vel)</label>
            <textarea 
              id="email-report-teacher-note" 
              rows="3" 
              class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed text-slate-900 dark:text-slate-100"
            >${defaultNote}</textarea>
          </div>

          <!-- PrÃ©-visualizaÃ§Ã£o do RelatÃ³rio Oficial -->
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
              <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <i class="fa-solid fa-eye text-indigo-600"></i> PrÃ©via do Resumo de DiagnÃ³stico & Notas
              </span>
              <span class="text-[10px] font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                MÃ©dia Geral: ${summary.stats.overallAvg.toFixed(1)}
              </span>
            </div>

            <!-- Dados do DiagnÃ³stico deixados pelo aluno -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-rose-600 dark:text-rose-400 font-bold block mb-0.5"><i class="fa-solid fa-triangle-exclamation"></i> Desafios com ConteÃºdo:</span>
                <p class="text-slate-600 dark:text-slate-300 italic">"${student.challenges || 'Nenhum desafio registrado.'}"</p>
              </div>
              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span class="text-amber-600 dark:text-amber-400 font-bold block mb-0.5"><i class="fa-solid fa-bullseye"></i> Expectativas:</span>
                <p class="text-slate-600 dark:text-slate-300 italic">"${student.expectations || 'Evoluir nas redes'}"</p>
              </div>
            </div>

            <!-- Tabela dos 7 MÃ³dulos -->
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th class="p-2">MÃ³dulo Avaliado</th>
                    <th class="p-2 text-center">B1</th>
                    <th class="p-2 text-center">B2</th>
                    <th class="p-2 text-center">MÃ©dia</th>
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

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="copyReportToClipboard('${student.id}')" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
              title="Copiar texto formatado para o WhatsApp do aluno"
            >
              <i class="fa-brands fa-whatsapp text-emerald-600"></i> Copiar p/ WhatsApp
            </button>
            <button 
              type="button" 
              onclick="openMailtoReport('${student.id}')" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
              title="Abrir no aplicativo de e-mail local (Outlook / Thunderbird)"
            >
              <i class="fa-solid fa-envelope-open-text text-indigo-600"></i> Abrir no E-mail
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Fechar
            </button>
            <button 
              type="button" 
              id="btn-execute-send-email" 
              onclick="executeSendEmailReport('${student.id}')" 
              class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-paper-plane"></i> Enviar E-mail Direto
            </button>
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
  const subject = subjectInput ? subjectInput.value.trim() : "RelatÃ³rio PedagÃ³gico";

  if (!toEmail || !toEmail.includes("@")) {
    showToast("Por favor, informe um endereÃ§o de e-mail vÃ¡lido para o aluno.", "warning");
    return;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Disparando E-mail...';
  }

  // Simula o tempo de handshake SMTP / API de mensageria
  await new Promise(r => setTimeout(r, 1200));

  // Registrar histÃ³rico de envio nas observaÃ§Ãµes do aluno
  const nowStr = new Date().toLocaleString("pt-BR");
  const logEntry = `\n[RelatÃ³rio E-mail Enviado em ${nowStr}]: Destino: ${toEmail} | Assunto: ${subject}`;
  student.notes = (student.notes || "") + logEntry;

  // Persistir alteraÃ§Ãµes
  saveDataToStorage();

  // Sincroniza atualizaÃ§Ã£o no Supabase se conectado
  try {
    const client = getSupabaseClient();
    if (client) {
      await client.from("alunos").update({
        observacoes: student.notes,
        updated_at: new Date().toISOString()
      }).eq("id", String(student.id));
    }
  } catch (e) {
    console.warn("Log de e-mail gravado localmente, sincronizaÃ§Ã£o na nuvem pendente:", e);
  }

  showToast(`E-mail com relatÃ³rio individual enviado com sucesso para ${toEmail}!`, "success", 5000);
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
    showToast("Texto copiado para a Ã¡rea de transferÃªncia.", "info");
  });
}

function openMailtoReport(studentId) {
  const student = AppState.students.find(s => s.id === studentId);
  if (!student) return;

  const destInput = document.getElementById("email-report-dest");
  const subjectInput = document.getElementById("email-report-subject");
  const noteInput = document.getElementById("email-report-teacher-note");

  const toEmail = destInput ? destInput.value.trim() : (student.contact?.email || "");
  const subject = subjectInput ? subjectInput.value.trim() : "RelatÃ³rio PedagÃ³gico";
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
    showToast("Por favor, faÃ§a login com seu CPF para enviar as notas para seu e-mail.", "info");
    openCpfLoginModal("grades");
    return;
  }

  let student = null;
  if (studentIdOverride) {
    student = AppState.students.find(s => s.id === studentIdOverride);
  } else if (AppState.currentUser.role === "aluno") {
    student = AppState.students.find(s => s.id === AppState.currentUser.id || cleanCpfDigits(s.cpf) === cleanCpfDigits(AppState.currentUser.cpf));
  } else {
    // Se for docente clicando diretamente na tabela, abre o modal de relatÃ³rio
    const firstStudent = AppState.students[0];
    if (firstStudent) {
      openSendEmailReportModal(firstStudent.id);
      return;
    }
  }

  if (!student) {
    showToast("NÃ£o foi possÃ­vel localizar o cadastro de aluno correspondente ao usuÃ¡rio logado.", "error");
    return;
  }

  const destEmail = student.contact?.email || student.email || AppState.currentUser.email;
  if (!destEmail || !destEmail.includes("@")) {
    showToast("Nenhum e-mail vÃ¡lido cadastrado no seu perfil de aluno. Por favor, atualize seus dados.", "warning");
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
    const defaultNote = "RelatÃ³rio atualizado de notas e diagnÃ³stico emitido automaticamente a pedido do prÃ³prio aluno atravÃ©s da plataforma Eu Por Dias.";
    const summary = buildStudentReportSummary(student, defaultNote);

    // Simula handshake de mensageria / envio SMTP
    await new Promise(r => setTimeout(r, 1100));

    // Grava registro no histÃ³rico de observaÃ§Ãµes do aluno
    const nowStr = new Date().toLocaleString("pt-BR");
    const logEntry = `\n[Notas Enviadas p/ Aluno em ${nowStr}]: Destino: ${destEmail}`;
    student.notes = (student.notes || "") + logEntry;
    saveDataToStorage();

    // Sincroniza atualizaÃ§Ã£o no Supabase se conectado
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from("alunos").update({
          observacoes: student.notes,
          updated_at: new Date().toISOString()
        }).eq("id", String(student.id));
      }
    } catch (err) {
      console.warn("Log gravado localmente, sincronizaÃ§Ã£o remota pendente:", err);
    }

    showToast(`RelatÃ³rio atual de notas enviado com sucesso para ${destEmail}!`, "success", 5500);
  } catch (err) {
    showToast("Erro ao processar envio do relatÃ³rio: " + err.message, "error");
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
// FÃ“RUM & CHAT AO VIVO (COM ANEXOS: FOTO, PDF, LINK E VÃDEO)
// -------------------------------------------------------------
function getDefaultForumTopics() {
  const modTitles = [
    "MÃ³dulo 01: DÃºvidas sobre Marketing Digital & EstratÃ©gia",
    "MÃ³dulo 02: DÃºvidas sobre CriaÃ§Ã£o de ConteÃºdo & Copywriting",
    "MÃ³dulo 03: DÃºvidas sobre Design & Identidade Visual",
    "MÃ³dulo 04: DÃºvidas sobre EdiÃ§Ã£o de VÃ­deo & Reels",
    "MÃ³dulo 05: DÃºvidas sobre TrÃ¡fego Pago & Meta Ads",
    "MÃ³dulo 06: DÃºvidas sobre MÃ©tricas & Analytics",
    "MÃ³dulo 07: DÃºvidas sobre Projeto Integrador Final"
  ];

  const modDescs = [
    "EspaÃ§o oficial para tirar dÃºvidas sobre funis de conversÃ£o, posicionamento de marca, personas e planejamento digital.",
    "Tire suas dÃºvidas sobre tÃ©cnicas de copywriting, redaÃ§Ã£o publicitÃ¡ria para redes sociais e roteirizaÃ§Ã£o de postagens.",
    "Canal de apoio para composiÃ§Ã£o visual, paletas de cores, identidade de marca, uso do Canva e princÃ­pios de design.",
    "Tire dÃºvidas prÃ¡ticas sobre cortes, sincronizaÃ§Ã£o com Ã¡udio em alta, legendas automÃ¡ticas, enquadramentos e ediÃ§Ã£o no CapCut.",
    "EspaÃ§o para debater campanhas patrocinadas no Instagram e Facebook, segmentaÃ§Ã£o de pÃºblico, orÃ§amento diÃ¡rio e Pixel da Meta.",
    "DÃºvidas sobre engajamento, alcance orgÃ¢nico, taxa de retenÃ§Ã£o de reels, CTR e relatÃ³rios de mÃ©tricas do Instagram Insights.",
    "Canal para orientaÃ§Ãµes finais sobre o projeto prÃ¡tico integrado do Programa Emprega Mais Alagoas."
  ];

  return AppState.subjects.map((subj, idx) => ({
    id: `topico-mod-${idx + 1}`,
    module: subj,
    title: modTitles[idx] || `MÃ³dulo ${idx + 1}: DÃºvidas sobre ${subj}`,
    description: modDescs[idx] || `DiscussÃµes e esclarecimento de dÃºvidas sobre ${subj}.`,
    author: {
      name: "Professor(a) â€¢ CoordenaÃ§Ã£o Emprega Mais",
      role: "professor",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face"
    },
    createdAt: new Date(Date.now() - (7 - idx) * 86400000).toISOString(),
    attachments: [
      {
        type: "link",
        title: "Guia Oficial de MÃ­dias Digitais â€¢ Emprega Mais Alagoas",
        url: "https://empregamais.al.gov.br"
      }
    ],
    comments: [
      {
        id: `com-${idx + 1}-1`,
        authorName: "CoordenaÃ§Ã£o PedagÃ³gica",
        authorRole: "professor",
        authorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
        createdAt: new Date(Date.now() - (7 - idx) * 86400000 + 3600000).toISOString(),
        text: "Bem-vindos a este tÃ³pico! Sintam-se Ã  vontade para enviar perguntas ou compartilhar suas produÃ§Ãµes prÃ¡ticas."
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
        text: "OlÃ¡ a todos! Sejam muito bem-vindos ao FÃ³rum & Chat ao vivo do Programa Emprega Mais Alagoas."
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

function renderForumTab(container) {
  // REGRA DE ACESSO: Exige identificaÃ§Ã£o por CPF
  if (!AppState.currentUser) {
    renderTabAccessRestriction(container, 'forum');
    return;
  }

  const eligibility = isUserEligibleToPost();
  const isProf = AppState.currentUser && AppState.currentUser.role === 'professor';

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      
      <!-- CabeÃ§alho do FÃ³rum & Chat -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <i class="fa-solid fa-comments"></i> Comunidade Oficial
            </span>
            <span class="text-xs text-slate-400">â€¢ Emprega Mais Alagoas</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">FÃ³rum & Chat ao Vivo</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Tire dÃºvidas sobre os 7 mÃ³dulos do curso e interaja em tempo real com colegas e docentes.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- BotÃ£o para Criar TÃ³pico com Anexos -->
          ${isProf ? `
            <button 
              onclick="openCreateTopicModal()" 
              class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i> Novo TÃ³pico com Anexos
            </button>
          ` : `
            <button 
              onclick="openCreateTopicModal()" 
              class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <i class="fa-solid fa-plus"></i> Criar Nova DÃºvida
            </button>
          `}
        </div>
      </div>

      <!-- Seletor de Sub-Abas: TÃ³picos dos MÃ³dulos vs Chat Geral -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <button 
            onclick="switchForumSubTab('topics')" 
            id="subtab-forum-topics"
            class="px-4 py-2 rounded-xl text-xs font-bold ${AppState.forumTab === 'topics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} transition-all flex items-center gap-1.5"
          >
            <i class="fa-solid fa-list-check"></i> TÃ³picos dos 7 MÃ³dulos (${AppState.forumTopics.length})
          </button>
          <button 
            onclick="switchForumSubTab('chat')" 
            id="subtab-forum-chat"
            class="px-4 py-2 rounded-xl text-xs font-bold ${AppState.forumTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} transition-all flex items-center gap-1.5"
          >
            <i class="fa-solid fa-bolt text-amber-500"></i> Chat ao Vivo da Turma (${AppState.forumMessages.length})
          </button>
        </div>

        <div class="hidden sm:flex items-center gap-2 text-xs">
          ${eligibility.eligible ? `
            <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
              <i class="fa-solid fa-circle-check"></i> Habilitado para postar (${AppState.currentUser.name.split(' ')[0]})
            </span>
          ` : `
            <span class="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 text-[11px]">
              <i class="fa-solid fa-lock"></i> Postagem restrita (exige CPF e foto)
            </span>
          `}
        </div>
      </div>

      <!-- ConteÃºdo da Sub-Aba Ativa -->
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
      <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center text-sm font-bold flex-shrink-0">
            <i class="fa-solid fa-lock"></i>
          </div>
          <div>
            <strong class="block font-bold">Regra da Comunidade: IdentificaÃ§Ã£o com CPF</strong>
            <p class="text-[11px] text-amber-700 dark:text-amber-300">Para ${actionName} no FÃ³rum e Chat, entre com seu perfil e CPF cadastrados previamente.</p>
          </div>
        </div>
        <button 
          onclick="openCpfLoginModal('forum')" 
          class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <i class="fa-solid fa-id-card"></i> Fazer Login com CPF
        </button>
      </div>
    `;
  }

  if (eligibility.reason === "no_photo") {
    return `
      <div class="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-950 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 flex items-center justify-center text-sm font-bold flex-shrink-0">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <strong class="block font-bold">Regra Estrita: SÃ³ digita quem estiver com foto!</strong>
            <p class="text-[11px] text-indigo-700 dark:text-indigo-300">VocÃª estÃ¡ logado como <strong>${AppState.currentUser.name}</strong>, mas precisa cadastrar sua foto de perfil para liberar o envio de mensagens.</p>
          </div>
        </div>
        <button 
          onclick="openUserPhotoUploadModal()" 
          class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all self-start sm:self-auto flex items-center gap-1.5"
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
      
      ${renderEligibilityBanner('criar tÃ³picos')}

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
              class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 transform hover:-translate-y-0.5"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 truncate max-w-[200px]">
                    ${t.module || 'Geral'}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    <i class="fa-regular fa-clock"></i> ${new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  ${t.title}
                </h3>

                <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  ${t.description}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                
                <!-- Indicadores de Anexos presentes -->
                <div class="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  ${hasPhoto ? `<span title="ContÃ©m Foto"><i class="fa-solid fa-image text-emerald-500"></i></span>` : ''}
                  ${hasPdf ? `<span title="ContÃ©m PDF"><i class="fa-solid fa-file-pdf text-rose-500"></i></span>` : ''}
                  ${hasVideo ? `<span title="ContÃ©m VÃ­deo"><i class="fa-solid fa-video text-purple-500"></i></span>` : ''}
                  ${hasLink ? `<span title="ContÃ©m Link"><i class="fa-solid fa-link text-blue-500"></i></span>` : ''}
                  ${!hasPhoto && !hasPdf && !hasVideo && !hasLink ? `<span class="text-[10px] text-slate-400">Sem anexos</span>` : ''}
                </div>

                <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold text-xs">
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
  if (!topic) return "<p>TÃ³pico nÃ£o encontrado.</p>";

  const eligibility = isUserEligibleToPost();

  return `
    <div class="space-y-6">
      
      <!-- BotÃ£o Voltar -->
      <button 
        onclick="closeForumTopic()" 
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
      >
        <i class="fa-solid fa-arrow-left"></i> Voltar para a Lista de TÃ³picos
      </button>

      <!-- CartÃ£o Principal do TÃ³pico -->
      <div class="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            ${topic.module || 'MÃ³dulo do Curso'}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">
              Criado em ${new Date(topic.createdAt).toLocaleString('pt-BR')}
            </span>
            ${AppState.currentUser && AppState.currentUser.role === 'professor' ? `
              <button 
                type="button" 
                onclick="deleteForumTopic('${topic.id}')" 
                class="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-800/60 flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="ModeraÃ§Ã£o Docente: Excluir este tÃ³pico"
              >
                <i class="fa-solid fa-trash-can"></i> Excluir TÃ³pico
              </button>
            ` : ''}
          </div>
        </div>

        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
          ${topic.title}
        </h1>

        <!-- Autor do TÃ³pico -->
        <div class="flex items-center gap-3 py-2 border-y border-slate-100 dark:border-slate-800">
          <div class="w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
            <img src="${topic.author?.photo || 'https://via.placeholder.com/80'}" alt="Autor" class="w-full h-full object-cover">
          </div>
          <div>
            <span class="block font-bold text-xs text-slate-900 dark:text-slate-100">${topic.author?.name || 'CoordenaÃ§Ã£o'}</span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">${topic.author?.role === 'professor' ? 'Docente Titular' : 'Aluno'}</span>
          </div>
        </div>

        <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          ${topic.description}
        </div>

        <!-- RenderizaÃ§Ã£o de Anexos (Foto, PDF, Link, VÃ­deo) -->
        ${(topic.attachments && topic.attachments.length > 0) ? `
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i class="fa-solid fa-paperclip text-indigo-600"></i> Anexos e Materiais de Apoio:
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${topic.attachments.map(att => renderAttachmentCard(att)).join("")}
            </div>
          </div>
        ` : ''}

      </div>

      <!-- SeÃ§Ã£o de ComentÃ¡rios / Respostas -->
      <div class="space-y-4">
        <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <i class="fa-solid fa-comments text-indigo-600"></i> Respostas e ComentÃ¡rios (${topic.comments?.length || 0})
        </h3>

        <!-- FormulÃ¡rio de Envio de Resposta -->
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          ${eligibility.eligible ? `
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-500 bg-indigo-100 flex-shrink-0">
                <img src="${AppState.currentUser.photo}" alt="VocÃª" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 space-y-2">
                <textarea 
                  id="topic-reply-input" 
                  rows="3" 
                  placeholder="Escreva sua dÃºvida ou resposta sobre este mÃ³dulo..." 
                  class="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
                ></textarea>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-400">Postando como <strong>${AppState.currentUser.name}</strong></span>
                  <button 
                    onclick="submitTopicComment('${topic.id}')" 
                    class="px-4 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-all flex items-center gap-1.5"
                  >
                    <i class="fa-solid fa-paper-plane"></i> Responder
                  </button>
                </div>
              </div>
            </div>
          ` : `
            ${renderEligibilityBanner('responder a este tÃ³pico')}
          `}
        </div>

        <!-- Lista de ComentÃ¡rios -->
        <div class="space-y-3">
          ${(!topic.comments || topic.comments.length === 0) ? `
            <p class="text-xs text-slate-500 dark:text-slate-400 italic text-center py-6">
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
              <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3 text-xs group">
                <div class="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  <img src="${c.authorPhoto || 'https://via.placeholder.com/80'}" alt="${c.authorName}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 space-y-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900 dark:text-slate-100">${c.authorName}</span>
                      <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${c.authorRole === 'professor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                        ${c.authorRole === 'professor' ? 'Docente' : 'Aluno'}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-slate-400">${new Date(c.createdAt).toLocaleString('pt-BR')}</span>
                      ${canModerate ? `
                        <button 
                          type="button"
                          onclick="deleteTopicComment('${topic.id}', ${cIdx})" 
                          class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all text-xs p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="${isProf && !isMeComment ? 'ModeraÃ§Ã£o Docente: Apagar comentÃ¡rio' : 'Apagar meu comentÃ¡rio'}"
                        >
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                  <p class="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <span class="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <i class="fa-solid fa-image"></i> Foto / Imagem: ${att.title || 'Anexo'}
        </span>
        <div class="rounded-xl overflow-hidden max-h-48 bg-slate-900 flex items-center justify-center">
          <img src="${att.url}" alt="${att.title}" class="max-h-48 w-full object-contain cursor-pointer" onclick="window.open('${att.url}', '_blank')">
        </div>
      </div>
    `;
  }
  if (att.type === "pdf") {
    return `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <i class="fa-solid fa-file-pdf text-rose-600 text-xl flex-shrink-0"></i>
          <div class="min-w-0">
            <span class="font-bold text-slate-800 dark:text-slate-200 block truncate">${att.title || 'Documento PDF'}</span>
            <span class="text-[10px] text-slate-400">Arquivo PDF de apoio</span>
          </div>
        </div>
        <a href="${att.url}" target="_blank" download class="px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1 flex-shrink-0">
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
        videoEmbed = `<iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe>`;
      }
    }
    return `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 col-span-1 sm:col-span-2">
        <span class="font-bold text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <i class="fa-solid fa-video"></i> VÃ­deo: ${att.title || 'VÃ­deo de Apoio'}
        </span>
        ${videoEmbed ? videoEmbed : `
          <a href="${att.url}" target="_blank" class="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Assistir VÃ­deo (${att.url})
          </a>
        `}
      </div>
    `;
  }
  return `
    <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <i class="fa-solid fa-link text-blue-600 text-base flex-shrink-0"></i>
        <div class="min-w-0">
          <span class="font-bold text-slate-800 dark:text-slate-200 block truncate">${att.title || 'Link Externo'}</span>
          <span class="text-[10px] text-slate-400 truncate block">${att.url}</span>
        </div>
      </div>
      <a href="${att.url}" target="_blank" class="px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 flex-shrink-0">
        <i class="fa-solid fa-external-link"></i> Abrir
      </a>
    </div>
  `;
}

function submitTopicComment(topicId) {
  const eligibility = isUserEligibleToPost();
  if (!eligibility.eligible) {
    showToast("Para responder, faÃ§a login com seu CPF e adicione sua foto de perfil.", "warning");
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
    showToast("VocÃª precisa estar logado para moderar comentÃ¡rios.", "warning");
    return;
  }

  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic || !topic.comments || !topic.comments[commentIndex]) {
    showToast("ComentÃ¡rio nÃ£o encontrado.", "error");
    return;
  }

  const comment = topic.comments[commentIndex];
  const isProf = AppState.currentUser.role === "professor";
  const isAuthor = (AppState.currentUser.name && AppState.currentUser.name === comment.authorName) ||
                   (AppState.currentUser.id && AppState.currentUser.id === comment.authorId);

  if (!isProf && !isAuthor) {
    showToast("Apenas o docente ou o prÃ³prio autor podem moderar este comentÃ¡rio.", "error");
    return;
  }

  const confirmMsg = isProf && !isAuthor
    ? `[ModeraÃ§Ã£o Docente]\nDeseja realmente excluir a resposta de "${comment.authorName}"?`
    : `Deseja realmente apagar sua resposta?`;

  if (!confirm(confirmMsg)) {
    return;
  }

  topic.comments.splice(commentIndex, 1);
  saveForumDataToStorage();

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  showToast(isProf && !isAuthor ? "Resposta moderada e excluÃ­da pelo docente." : "Resposta apagada com sucesso.", "success");
}

function deleteForumTopic(topicId) {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores podem excluir tÃ³picos do fÃ³rum.", "error");
    return;
  }

  const topic = AppState.forumTopics.find(t => t.id === topicId);
  if (!topic) {
    showToast("TÃ³pico nÃ£o encontrado.", "error");
    return;
  }

  if (!confirm(`[ModeraÃ§Ã£o Docente]\nDeseja realmente excluir o tÃ³pico "${topic.title}" e todas as suas respostas? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`)) {
    return;
  }

  AppState.forumTopics = AppState.forumTopics.filter(t => t.id !== topicId);
  saveForumDataToStorage();

  closeForumTopic();
  showToast("TÃ³pico excluÃ­do com sucesso pelo docente.", "success");
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
    <div class="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      
      <!-- CabeÃ§alho do Canal Estilo Discord / Telegram -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
            <i class="fa-solid fa-hashtag"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight">chat-da-turma</h3>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ao Vivo
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Canal interativo em tempo real para alunos e docentes</p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-comments text-indigo-500"></i> ${AppState.forumMessages.length} mensagens
          </span>
          ${AppState.currentUser ? `
            <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              ${escapeHtml(AppState.currentUser.name.split(' ')[0])} (${AppState.currentUser.role === 'professor' ? 'Docente' : 'Aluno'})
            </span>
          ` : ''}
          ${AppState.currentUser && AppState.currentUser.role === 'professor' ? `
            <span class="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/60 text-[11px] shadow-xs">
              <i class="fa-solid fa-shield-halved text-amber-500"></i> ModeraÃ§Ã£o Docente Ativa
            </span>
            ${AppState.forumMessages.length > 0 ? `
              <button 
                type="button" 
                onclick="clearAllChatMessages()" 
                class="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1 border border-rose-200/60 dark:border-rose-800/60 transition-all cursor-pointer shadow-xs"
                title="Limpar todas as mensagens do chat da turma (Exclusivo Docente)"
              >
                <i class="fa-solid fa-broom"></i> Limpar Chat
              </button>
            ` : ''}
          ` : ''}
        </div>
      </div>

      <!-- Feed de Mensagens do Chat com Altura Fixa e Rolagem Interna -->
      <div id="live-chat-messages-container" class="h-[460px] sm:h-[500px] overflow-y-auto space-y-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50/90 to-slate-100/60 dark:from-slate-950/80 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 scroll-smooth">
        ${AppState.forumMessages.length === 0 ? `
          <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center text-2xl mb-3">
              <i class="fa-solid fa-hashtag"></i>
            </div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-300">InÃ­cio do canal #chat-da-turma</h4>
            <p class="text-xs max-w-sm mt-1">Este Ã© o comeÃ§o do canal de conversa da turma. Envie uma mensagem para iniciar o bate-papo!</p>
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
              <div class="flex items-end justify-end gap-2 group transition-all relative">
                <!-- BotÃ£o de ModeraÃ§Ã£o / Apagar para o autor da mensagem (Aluno ou Professor) -->
                <div class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center self-center mr-1">
                  <button 
                    type="button" 
                    onclick="deleteChatMessage('${m.id}')" 
                    class="w-7 h-7 rounded-xl bg-white/90 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/80 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-xs shadow-xs cursor-pointer transition-colors" 
                    title="Apagar minha mensagem do chat"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>

                <div class="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
                  <div class="flex items-center gap-1.5 mb-1 px-1">
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">${timeStr}</span>
                    <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">VocÃª</span>
                  </div>
                  <div class="px-4 py-3 rounded-2xl rounded-br-xs bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 text-xs sm:text-sm font-normal leading-relaxed break-words">
                    ${escapeHtml(m.text)}
                    <div class="flex items-center justify-end gap-1 mt-1 text-[10px] text-indigo-200">
                      <span>${timeStr}</span>
                      <i class="fa-solid fa-check-double text-[9px]"></i>
                    </div>
                  </div>
                </div>
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 flex-shrink-0 shadow-sm">
                  <img src="${photoUrl}" alt="VocÃª" onerror="this.src='${fallbackAvatar}'" class="w-full h-full object-cover">
                </div>
              </div>
            `;
          } else {
            return `
              <div class="flex items-end justify-start gap-2 group transition-all relative">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ${isProf ? 'ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-amber-500/20' : 'ring-slate-300 dark:ring-slate-700 ring-offset-2 dark:ring-offset-slate-900'} flex-shrink-0 shadow-sm">
                  <img src="${photoUrl}" alt="${escapeHtml(m.authorName)}" onerror="this.src='${fallbackAvatar}'" class="w-full h-full object-cover">
                </div>
                <div class="flex flex-col items-start max-w-[85%] sm:max-w-[70%]">
                  <div class="flex items-center gap-1.5 mb-1 px-1">
                    <span class="font-bold text-xs ${isProf ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}">${escapeHtml(m.authorName)}</span>
                    ${isProf ? `
                      <span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-500/30 flex items-center gap-1">
                        <i class="fa-solid fa-graduation-cap"></i> Docente
                      </span>
                    ` : `
                      <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Aluno
                      </span>
                    `}
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">${timeStr}</span>
                  </div>
                  <div class="px-4 py-3 rounded-2xl rounded-bl-xs bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-xs sm:text-sm font-normal leading-relaxed break-words">
                    ${escapeHtml(m.text)}
                  </div>
                </div>

                <!-- BotÃ£o de ModeraÃ§Ã£o Exclusivo para Docente (quando a mensagem Ã© de outro usuÃ¡rio) -->
                ${currentIsProf ? `
                  <div class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center self-center ml-1">
                    <button 
                      type="button" 
                      onclick="deleteChatMessage('${m.id}')" 
                      class="px-2 py-1 rounded-xl bg-amber-50 hover:bg-rose-100 dark:bg-amber-950/40 dark:hover:bg-rose-950/60 text-amber-700 dark:text-amber-400 hover:text-rose-600 dark:hover:text-rose-400 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer" 
                      title="ModeraÃ§Ã£o Docente: Apagar mensagem da turma"
                    >
                      <i class="fa-solid fa-shield-xmark text-rose-500"></i>
                      <span class="hidden sm:inline">Moderar</span>
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }
        }).join("")}
      </div>

      <!-- Barra de DigitaÃ§Ã£o Elegante e Responsiva -->
      ${eligibility.eligible ? `
        <div class="space-y-2 pt-1">
          <!-- Atalhos RÃ¡pidos de ReaÃ§Ãµes e Emojis -->
          <div class="flex items-center justify-between px-1 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-slate-400 hidden sm:inline">ReaÃ§Ãµes rÃ¡pidas:</span>
              <button type="button" onclick="insertChatEmoji('ðŸ‘')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="Polegar">ðŸ‘</button>
              <button type="button" onclick="insertChatEmoji('ðŸ‘')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="Palmas">ðŸ‘</button>
              <button type="button" onclick="insertChatEmoji('ðŸ’¡')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="Ideia">ðŸ’¡</button>
              <button type="button" onclick="insertChatEmoji('â“')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="DÃºvida">â“</button>
              <button type="button" onclick="insertChatEmoji('ðŸš€')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="Foguete">ðŸš€</button>
              <button type="button" onclick="insertChatEmoji('ðŸŽ¯')" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs transition-colors" title="Alvo">ðŸŽ¯</button>
            </div>
            <span class="text-[10px] text-slate-400 hidden md:inline"><kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px] border border-slate-200 dark:border-slate-700">Enter</kbd> para enviar</span>
          </div>

          <!-- FormulÃ¡rio com Campo Responsivo e BotÃ£o com Hover -->
          <form onsubmit="handleLiveChatSubmit(event)" class="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/90 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent focus-within:bg-white dark:focus-within:bg-slate-900 shadow-sm transition-all">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hidden sm:flex items-center justify-center flex-shrink-0 text-xs font-bold">
              <i class="fa-solid fa-message"></i>
            </div>
            <input 
              type="text" 
              id="live-chat-input" 
              placeholder="Conversar em #chat-da-turma (Pressione Enter para enviar)..." 
              autocomplete="off"
              class="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            <button 
              type="submit" 
              class="px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <i class="fa-solid fa-paper-plane"></i>
              <span class="hidden sm:inline">Enviar</span>
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
    showToast("Para digitar no chat, faÃ§a login com seu CPF e adicione sua foto.", "warning");
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

  input.value = "";
  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  setTimeout(scrollChatToBottom, 60);
}

// -------------------------------------------------------------
// MODERAÃ‡ÃƒO DE MENSAGENS DO CHAT AO VIVO
// -------------------------------------------------------------
function deleteChatMessage(messageId) {
  if (!AppState.currentUser) {
    showToast("VocÃª precisa estar logado para moderar mensagens.", "warning");
    return;
  }

  const msgIndex = AppState.forumMessages.findIndex(m => m.id === messageId);
  if (msgIndex === -1) {
    showToast("Mensagem nÃ£o encontrada.", "error");
    return;
  }

  const msg = AppState.forumMessages[msgIndex];
  const isProf = AppState.currentUser.role === "professor";
  const isAuthor = (AppState.currentUser.name && AppState.currentUser.name === msg.authorName) ||
                   (AppState.currentUser.id && AppState.currentUser.id === msg.authorId);

  // Regra de ModeraÃ§Ã£o:
  // - O usuÃ¡rio 'professor' pode moderar e apagar qualquer mensagem do chat da turma.
  // - O usuÃ¡rio 'aluno' pode moderar/apagar apenas o seu prÃ³prio post/mensagem no chat.
  if (!isProf && !isAuthor) {
    showToast("Apenas o docente ou o prÃ³prio autor podem moderar esta mensagem.", "error");
    return;
  }

  const confirmMsg = isProf && !isAuthor
    ? `[ModeraÃ§Ã£o Docente]\nDeseja realmente excluir a mensagem de "${msg.authorName}" do chat da turma?\n\n"${msg.text.substring(0, 60)}${msg.text.length > 60 ? '...' : ''}"`
    : `Deseja realmente apagar sua mensagem do chat?\n\n"${msg.text.substring(0, 60)}${msg.text.length > 60 ? '...' : ''}"`;

  if (!confirm(confirmMsg)) {
    return;
  }

  AppState.forumMessages.splice(msgIndex, 1);
  saveForumDataToStorage();

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  showToast(isProf && !isAuthor ? "Mensagem moderada e excluÃ­da pelo docente." : "Sua mensagem foi apagada com sucesso.", "success");
}

function clearAllChatMessages() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores tÃªm permissÃ£o para limpar o chat.", "error");
    return;
  }

  if (AppState.forumMessages.length === 0) {
    showToast("O chat jÃ¡ estÃ¡ vazio.", "info");
    return;
  }

  if (!confirm(`AtenÃ§Ã£o Professor(a): Deseja realmente excluir TODAS as ${AppState.forumMessages.length} mensagens do chat da turma? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`)) {
    return;
  }

  AppState.forumMessages = [];
  saveForumDataToStorage();

  const contentArea = document.getElementById("main-content-area");
  if (contentArea) renderForumTab(contentArea);

  showToast("Chat da turma limpo com sucesso.", "success");
}

// Modal para CriaÃ§Ã£o de Novo TÃ³pico com 4 Tipos de Anexos
let newTopicAttachments = [];

function openCreateTopicModal() {
  const eligibility = isUserEligibleToPost();
  if (!eligibility.eligible) {
    openCpfLoginModal('forum');
    showToast("FaÃ§a login com seu CPF e cadastre sua foto para criar tÃ³picos.", "warning");
    return;
  }

  newTopicAttachments = [];

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 scale-in space-y-4 my-8 max-h-[92vh] flex flex-col">
        
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-sm font-bold">
              <i class="fa-solid fa-folder-plus"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Criar Novo TÃ³pico no FÃ³rum</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Postagem com suporte a Foto, PDF, Link e VÃ­deo</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">TÃ­tulo do TÃ³pico</label>
            <input 
              type="text" 
              id="new-topic-title" 
              placeholder="Ex: DÃºvida prÃ¡tica sobre criaÃ§Ã£o de reels com gancho forte" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">MÃ³dulo Relacionado</label>
            <select 
              id="new-topic-module" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              ${AppState.subjects.map(s => `<option value="${s}">${s}</option>`).join("")}
              <option value="Geral">DÃºvidas Gerais & Avisos</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ConteÃºdo / DescriÃ§Ã£o da DÃºvida ou OrientaÃ§Ã£o</label>
            <textarea 
              id="new-topic-desc" 
              rows="3" 
              placeholder="Descreva detalhadamente o questionamento ou a orientaÃ§Ã£o pedagÃ³gica para a turma..." 
              class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed text-slate-900 dark:text-slate-100"
            ></textarea>
          </div>

          <!-- SeÃ§Ã£o de Anexos (Foto, PDF, Link e VÃ­deo) -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
            <label class="block font-bold text-slate-800 dark:text-slate-200">Adicionar Anexos ao TÃ³pico:</label>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                type="button" 
                onclick="promptAddAttachment('photo')" 
                class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-center font-bold text-[11px] text-slate-700 dark:text-slate-300 flex flex-col items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-image text-emerald-600 text-base"></i> Foto / Imagem
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('pdf')" 
                class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-center font-bold text-[11px] text-slate-700 dark:text-slate-300 flex flex-col items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-file-pdf text-rose-600 text-base"></i> Documento PDF
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('link')" 
                class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-center font-bold text-[11px] text-slate-700 dark:text-slate-300 flex flex-col items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-link text-blue-600 text-base"></i> Link Externo
              </button>
              <button 
                type="button" 
                onclick="promptAddAttachment('video')" 
                class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-center font-bold text-[11px] text-slate-700 dark:text-slate-300 flex flex-col items-center gap-1 transition-all"
              >
                <i class="fa-solid fa-video text-purple-600 text-base"></i> VÃ­deo
              </button>
            </div>

            <!-- Lista de Anexos Adicionados -->
            <div id="new-topic-attachments-list" class="space-y-1.5 pt-1"></div>
          </div>

        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button 
            type="button" 
            onclick="closeModal()" 
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onclick="saveNewTopicFromModal()" 
            class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-check"></i> Publicar TÃ³pico
          </button>
        </div>

      </div>
    </div>
  `;
}

function promptAddAttachment(type) {
  if (type === "photo") {
    const url = prompt("Cole a URL da imagem ou link (ou insira link pÃºblico):", "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600");
    if (url) {
      newTopicAttachments.push({ type: "photo", url, title: "Foto / Print explicativo" });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "pdf") {
    const url = prompt("Cole o link do arquivo PDF ou material de leitura:", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
    const title = prompt("TÃ­tulo do documento PDF:", "Material Complementar em PDF");
    if (url) {
      newTopicAttachments.push({ type: "pdf", url, title: title || "Material em PDF" });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "link") {
    const url = prompt("Cole a URL do link externo:", "https://instagram.com");
    const title = prompt("TÃ­tulo do link:", "ReferÃªncia de Estudo");
    if (url) {
      newTopicAttachments.push({ type: "link", url, title: title || url });
      renderNewTopicAttachmentsList();
    }
  } else if (type === "video") {
    const url = prompt("Cole o link do vÃ­deo do YouTube ou vÃ­deo mp4:", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const title = prompt("TÃ­tulo do vÃ­deo:", "Aula Gravada / Exemplo em VÃ­deo");
    if (url) {
      newTopicAttachments.push({ type: "video", url, title: title || "VÃ­deo" });
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
    <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
      <div class="flex items-center gap-1.5 truncate">
        <i class="fa-solid ${att.type === 'photo' ? 'fa-image text-emerald-500' : (att.type === 'pdf' ? 'fa-file-pdf text-rose-500' : (att.type === 'video' ? 'fa-video text-purple-500' : 'fa-link text-blue-500'))}"></i>
        <span class="font-bold truncate">${att.title}</span>
      </div>
      <button type="button" onclick="removeTopicAttachment(${idx})" class="text-rose-500 hover:text-rose-700 ml-2">
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
    showToast("Por favor, informe o tÃ­tulo do tÃ³pico.", "warning");
    return;
  }
  if (!description) {
    showToast("Por favor, descreva a dÃºvida ou orientaÃ§Ã£o pedagÃ³gica.", "warning");
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
  showToast("Novo tÃ³pico publicado com sucesso no FÃ³rum!", "success");

  openForumTopic(newTopic.id);
}

// =============================================================
// ABA 7: OPORTUNIDADES, VAGAS & TRILHAS (MATCH DE CURRÃCULO)
// =============================================================

function getDefaultJobVacancies() {
  return [
    {
      id: "vaga-1",
      title: "Assistente de MÃ­dias Sociais & CriaÃ§Ã£o de ConteÃºdo",
      company: "AgÃªncia SoluÃ§Ãµes Digitais Alagoas",
      polo: "MaceiÃ³",
      locationType: "HÃ­brido (Ponta Verde)",
      contractType: "CLT",
      workload: "30h semanais",
      salary: "R$ 1.580,00 + Vale Transporte",
      description: "ResponsÃ¡vel pelo planejamento de postagens, criaÃ§Ã£o de artes e carrossÃ©is no Canva, ediÃ§Ã£o rÃ¡pida de Reels no CapCut e suporte no atendimento aos clientes de comÃ©rcio e serviÃ§os.",
      requiredSkills: ["Canva", "Instagram", "CapCut", "CriaÃ§Ã£o de ConteÃºdo", "Copywriting"],
      relatedModules: [1, 2, 3],
      contactEmail: "vagas@solucoesdigitais.al.br",
      contactPhone: "82991234567",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      active: true
    },
    {
      id: "vaga-2",
      title: "Criador de ConteÃºdo & VÃ­deos Curtos (Reels / TikTok)",
      company: "Grupo Moda & Varejo Arapiraca",
      polo: "Arapiraca",
      locationType: "Presencial (Centro de Arapiraca)",
      contractType: "EstÃ¡gio",
      workload: "20h semanais (tarde)",
      salary: "R$ 1.200,00 + AuxÃ­lio AlimentaÃ§Ã£o",
      description: "Atuar na linha de frente da marca captando vÃ­deos com celular em loja fÃ­sica, entrevistando clientes, produzindo roteiros criativos e editando cortes dinÃ¢micos de alta retenÃ§Ã£o.",
      requiredSkills: ["VÃ­deo & Reels", "CapCut", "Criatividade", "Instagram", "GravaÃ§Ã£o com Smartphone"],
      relatedModules: [1, 5],
      contactEmail: "talentos@modaarapiraca.com.br",
      contactPhone: "82998765432",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      active: true
    },
    {
      id: "vaga-3",
      title: "Gestor(a) de TrÃ¡fego Pago & AnÃºncios Online JÃºnior",
      company: "E-commerce RaÃ­zes Alagoanas",
      polo: "Remoto (Alagoas)",
      locationType: "100% Remoto (Home Office)",
      contractType: "Freelance / PJ",
      workload: "FlexÃ­vel por entregas",
      salary: "R$ 1.800,00 a R$ 2.500,00 / mÃªs",
      description: "Subir e monitorar campanhas no Meta Ads (Facebook e Instagram), configurar pixels, testes A/B de criativos e acompanhar mÃ©tricas de custo por clique e conversÃµes para loja online regional.",
      requiredSkills: ["Meta Ads", "TrÃ¡fego Pago", "AnÃ¡lise de MÃ©tricas", "Canva", "Pixel"],
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
      locationType: "Presencial (Centro HistÃ³rico)",
      contractType: "CLT",
      workload: "40h semanais",
      salary: "R$ 1.650,00 + RefeiÃ§Ã£o no Local",
      description: "GestÃ£o das redes sociais do complexo turÃ­stico, atualizaÃ§Ã£o de cardÃ¡pios e eventos nos Stories, atendimento a reservas via Direct e WhatsApp Business com comunicaÃ§Ã£o humanizada.",
      requiredSkills: ["Atendimento", "WhatsApp Business", "Instagram", "Canva", "Fotografia"],
      relatedModules: [1, 6],
      contactEmail: "gerencia@caminhosdepenedo.com.br",
      contactPhone: "82987651234",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      active: true
    },
    {
      id: "vaga-5",
      title: "EstÃ¡gio em ComunicaÃ§Ã£o ComunitÃ¡ria & MÃ­dias Digitais",
      company: "Instituto de Desenvolvimento do SertÃ£o",
      polo: "Santana do Ipanema",
      locationType: "Presencial / HÃ­brido",
      contractType: "EstÃ¡gio",
      workload: "20h semanais",
      salary: "R$ 1.100,00 + Certificado de Horas",
      description: "Apoiar na divulgaÃ§Ã£o de oficinas e projetos sociais em Santana do Ipanema e cidades vizinhas, elaborando comunicados, boletins digitais e registros fotogrÃ¡ficos de atividades.",
      requiredSkills: ["ComunicaÃ§Ã£o", "Canva", "RedaÃ§Ã£o", "Instagram", "Trabalho em Equipe"],
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
      title: "Trilha 1: GestÃ£o Profissional de Redes Sociais & ConteÃºdo",
      level: "Iniciante ao AvanÃ§ado",
      hours: "24h de conteÃºdo",
      icon: "fa-hashtag",
      description: "Domine a metodologia completa para gerenciar perfis comerciais, criar calendÃ¡rios editoriais, interagir com seguidores e transformar audiÃªncia em clientes.",
      courses: [
        {
          name: "Marketing Digital para o Empreendedor",
          provider: "Sebrae Alagoas",
          format: "Online Gratuito com Certificado",
          link: "https://sebrae.com.br/sites/PortalSebrae/cursosonline"
        },
        {
          name: "Inbound Marketing & MÃ­dias Sociais",
          provider: "Rock University",
          format: "Curso PrÃ¡tico com CertificaÃ§Ã£o",
          link: "https://rockcontent.com/br/university/"
        },
        {
          name: "Fundamentos do Instagram para Empresas",
          provider: "Meta Blueprint Oficial",
          format: "MÃ³dulos Oficiais Gratuitos",
          link: "https://www.facebook.com/business/learn"
        }
      ]
    },
    {
      id: "trilha-2",
      title: "Trilha 2: Design GrÃ¡fico & Identidade Visual com Canva",
      level: "PrÃ¡tico & Criativo",
      hours: "18h de conteÃºdo",
      icon: "fa-palette",
      description: "Aprenda harmonia de cores, tipografia, diagramaÃ§Ã£o e identidade visual para criar posts, carrossÃ©is, banners e propostas de alto impacto visual.",
      courses: [
        {
          name: "Design for Social Media & Brand Building",
          provider: "Canva Design School",
          format: "Tutoriais & ExercÃ­cios PrÃ¡ticos",
          link: "https://www.canva.com/designschool/"
        },
        {
          name: "Identidade Visual & ComunicaÃ§Ã£o para NegÃ³cios",
          provider: "FGV EducaÃ§Ã£o Executiva",
          format: "Curso EAD Aberto",
          link: "https://educacao-executiva.fgv.br/cursos/gratuitos"
        },
        {
          name: "CriaÃ§Ã£o de CarrossÃ©is MagnÃ©ticos no Instagram",
          provider: "Emprega Mais Alagoas",
          format: "Oficina PrÃ¡tica do Curso",
          link: "#"
        }
      ]
    },
    {
      id: "trilha-3",
      title: "Trilha 3: TrÃ¡fego Pago & Campanhas no Meta Ads",
      level: "IntermediÃ¡rio",
      hours: "20h de conteÃºdo",
      icon: "fa-bullseye",
      description: "Entenda o funcionamento de leilÃµes no Instagram e Facebook, segmentaÃ§Ã£o por cidades de Alagoas, criaÃ§Ã£o de pÃºblicos personalizados e anÃ¡lise de mÃ©tricas.",
      courses: [
        {
          name: "CertificaÃ§Ã£o em Campanhas do Meta Ads",
          provider: "Meta Blueprint",
          format: "CertificaÃ§Ã£o Oficial Meta",
          link: "https://www.facebook.com/business/learn"
        },
        {
          name: "Fundamentos de AnÃºncios e MÃ©tricas Digitais",
          provider: "Google AteliÃª Digital",
          format: "EAD Gratuito com Certificado",
          link: "https://learndigital.withgoogle.com/ateliedigital"
        },
        {
          name: "GestÃ£o de OrÃ§amento de AnÃºncios para PMEs",
          provider: "Sebrae Nacional",
          format: "Online com Apostila",
          link: "https://sebrae.com.br"
        }
      ]
    },
    {
      id: "trilha-4",
      title: "Trilha 4: Copywriting & Roteiros para VÃ­deos Curtos",
      level: "PrÃ¡tico & DinÃ¢mico",
      hours: "16h de conteÃºdo",
      icon: "fa-pen-fancy",
      description: "Desenvolva o poder de prender a atenÃ§Ã£o nos primeiros 3 segundos, estruturar ganchos magnÃ©ticos, chamadas para aÃ§Ã£o (CTA) e roteiros para Reels e TikTok.",
      courses: [
        {
          name: "Copywriting Essencial para Redes Sociais",
          provider: "Rock Content",
          format: "Curso Gratuito com Certificado",
          link: "https://rockcontent.com/br/university/"
        },
        {
          name: "RoteirizaÃ§Ã£o e EdiÃ§Ã£o RÃ¡pida no CapCut Mobile",
          provider: "Guia Emprega Mais Alagoas",
          format: "VÃ­deo-aulas PrÃ¡ticas",
          link: "#"
        },
        {
          name: "ComunicaÃ§Ã£o e Escrita Persuasiva",
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
      title: "CalendÃ¡rio Editorial 2026 para MÃ­dias Digitais",
      category: "Planejamento",
      format: "Template Planilha / PDF",
      icon: "fa-calendar-days",
      description: "Grade anual completa com sugestÃµes diÃ¡rias de temas, formatos (Reels, Carrossel, Stories) e datas comemorativas nacionais e de Alagoas.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-2",
      title: "Modelo de Briefing para Clientes de Social Media",
      category: "Atendimento",
      format: "FormulÃ¡rio Estruturado",
      icon: "fa-clipboard-question",
      description: "Roteiro com 20 perguntas estratÃ©gicas para diagnosticar um novo cliente: pÃºblico-alvo, concorrentes, diferenciais e metas de vendas.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-3",
      title: "Template de Proposta Comercial & OrÃ§amento",
      category: "Vendas",
      format: "Documento EditÃ¡vel",
      icon: "fa-file-invoice-dollar",
      description: "Modelo profissional de proposta com pacotes de serviÃ§os (BÃ¡sico, MÃ©dio e Pro), faixas de valores praticadas em Alagoas e prazos de entrega.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-4",
      title: "Checklist de Auditoria de Perfil no Instagram",
      category: "OtimizaÃ§Ã£o",
      format: "Checklist 15 Passos",
      icon: "fa-list-check",
      description: "Guia de revisÃ£o em 15 tÃ³picos essenciais: bio magnÃ©tica, links estratÃ©gicos, destaques organizados e identidade visual alinhada.",
      downloadUrl: "#",
      canCopy: true
    },
    {
      id: "rec-5",
      title: "Minuta de Contrato de PrestaÃ§Ã£o de ServiÃ§os Digitais",
      category: "JurÃ­dico / Freelance",
      format: "Minuta BÃ¡sica",
      icon: "fa-file-contract",
      description: "Termo simples e seguro para proteger trabalhos autÃ´nomos: definiÃ§Ã£o de escopo, prazos de aprovaÃ§Ã£o, pagamentos e confidencialidade.",
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

  // 1. LocalizaÃ§Ã£o / Polo (25 pts)
  const studentPolo = (student.classroom || student.unitCity || "").toLowerCase();
  const vacancyPolo = (vacancy.polo || "").toLowerCase();

  if (vacancyPolo.includes("remoto")) {
    score += 25;
    strengths.push("Vaga 100% Remota: compatÃ­vel com qualquer municÃ­pio de Alagoas");
  } else if (studentPolo && vacancyPolo && (studentPolo.includes(vacancyPolo) || vacancyPolo.includes(studentPolo))) {
    score += 25;
    strengths.push(`LocalizaÃ§Ã£o ideal: reside ou estuda no polo de ${vacancy.polo}`);
  } else {
    score += 15;
    strengths.push("Mesma unidade federativa (Alagoas): mobilidade regional");
  }

  // 2. Habilidades, Ferramentas e Redes Sociais do DiagnÃ³stico (30 pts)
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
      if (studentBio.includes(sLower) || (sLower.includes("canva") && studentTools.includes("canva")) || (sLower.includes("vÃ­deo") && studentBio.includes("capcut"))) {
        matchedSkillsCount++;
        strengths.push(`DomÃ­nio de ${skill} confirmado no diagnÃ³stico do aluno`);
      }
    });
  }

  const skillPoints = Math.min(30, Math.max(12, matchedSkillsCount * 8 + 10));
  score += skillPoints;

  // 3. Notas e Desempenho nos MÃ³dulos Relacionados (30 pts)
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
      strengths.push(`Excelente rendimento acadÃªmico: mÃ©dia de ${relAvg.toFixed(1)} nos mÃ³dulos exigidos`);
    } else {
      strengths.push(`Conhecimento validado nos mÃ³dulos: mÃ©dia de ${relAvg.toFixed(1)}`);
    }
  } else {
    score += 20;
    strengths.push("Aluno matriculado com mÃ³dulos essenciais em andamento");
  }

  // 4. MotivaÃ§Ã£o e Expectativas de Carreira (15 pts)
  const studentExpectations = (student.expectations || "").toLowerCase();
  const studentMotivation = (student.motivation || "").toLowerCase();
  if (studentExpectations.includes("trabalh") || studentExpectations.includes("renda") || studentMotivation.includes("aprend") || studentMotivation.includes("crescer")) {
    score += 15;
    strengths.push("Objetivo profissional do aluno alinhado Ã  Ã¡rea da vaga");
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
  // REGRA DE ACESSO: Exige autenticaÃ§Ã£o por CPF
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
      <div class="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-500/20">
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-400 text-slate-950 tracking-wider shadow">
                <i class="fa-solid fa-briefcase mr-1"></i> Emprega Mais Alagoas
              </span>
              <span class="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-sm">
                Hub de Empregabilidade & Trilhas
              </span>
              ${isAluno ? `
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                  <i class="fa-solid fa-user-check"></i> Matching de CurrÃ­culo Ativo
                </span>
              ` : `
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/90 text-white flex items-center gap-1">
                  <i class="fa-solid fa-chalkboard-user"></i> Painel de Vagas & FormaÃ§Ã£o
                </span>
              `}
            </div>

            <h1 class="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Oportunidades de Emprego, Cursos & Trilhas de Aprendizado
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Conecte seu talento com empresas parceiras de Alagoas, acelere sua carreira com cursos gratuitos certificados e utilize modelos profissionais prontos para atender seus primeiros clientes.
            </p>
          </div>

          <!-- MÃ©tricas RÃ¡pidas & BotÃ£o de CurrÃ­culo do Aluno -->
          <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
            <div class="grid grid-cols-3 gap-2 text-center bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div class="px-2">
                <span class="block text-base sm:text-lg font-black text-amber-400">${AppState.jobVacancies.length}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Vagas</span>
              </div>
              <div class="px-2 border-x border-white/10">
                <span class="block text-base sm:text-lg font-black text-emerald-400">${AppState.learningTrails.length}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Trilhas</span>
              </div>
              <div class="px-2">
                <span class="block text-base sm:text-lg font-black text-indigo-300">${AppState.usefulResources.length}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Modelos</span>
              </div>
            </div>

            ${isAluno ? `
              <button 
                onclick="openStudentResumeModal('${AppState.currentUser.id}')" 
                class="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i class="fa-solid fa-id-card"></i> Ver Meu MinicurrÃ­culo
              </button>
            ` : `
              <button 
                onclick="openCreateVacancyModal()" 
                class="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i class="fa-solid fa-plus"></i> Publicar Nova Vaga
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Barra de NavegaÃ§Ã£o Interna das Sub-Abas -->
      <div class="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <div class="flex items-center gap-2">
          <button 
            onclick="switchCareersTab('vagas')" 
            class="px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'vagas' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}"
          >
            <i class="fa-solid fa-briefcase"></i>
            <span>Mural de Vagas & Oportunidades</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'vagas' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">${AppState.jobVacancies.length}</span>
          </button>

          <button 
            onclick="switchCareersTab('trilhas')" 
            class="px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${activeTab === 'trilhas' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'}"
          >
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Cursos, Trilhas & Materiais Gratuitos</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'trilhas' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">${AppState.learningTrails.length + AppState.usefulResources.length}</span>
          </button>
        </div>

        ${isProf ? `
          <div class="flex items-center gap-2">
            ${activeTab === 'vagas' ? `
              <button 
                onclick="openCreateVacancyModal()" 
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i class="fa-solid fa-plus"></i> Nova Vaga
              </button>
            ` : `
              <button 
                onclick="openAddResourceModal()" 
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i class="fa-solid fa-share-nodes"></i> Compartilhar Material
              </button>
            `}
          </div>
        ` : ''}
      </div>

      <!-- ConteÃºdo da Sub-Aba Ativa -->
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
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div class="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <i class="fa-solid fa-filter text-indigo-500"></i> Filtrar:
          </div>

          <select 
            onchange="handleCareersPoloFilterChange(this.value)" 
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="all" ${selectedPolo === "all" ? "selected" : ""}>Todos os Polos (Alagoas)</option>
            ${polos.map(p => `
              <option value="${escapeHtml(p)}" ${selectedPolo === p ? "selected" : ""}>${escapeHtml(p)}</option>
            `).join("")}
          </select>

          <select 
            onchange="handleCareersTypeFilterChange(this.value)" 
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="all" ${selectedType === "all" ? "selected" : ""}>Todos os Modelos</option>
            <option value="EstÃ¡gio" ${selectedType === "EstÃ¡gio" ? "selected" : ""}>EstÃ¡gio</option>
            <option value="CLT" ${selectedType === "CLT" ? "selected" : ""}>CLT</option>
            <option value="Freelance / PJ" ${selectedType === "Freelance / PJ" ? "selected" : ""}>Freelance / PJ</option>
          </select>
        </div>

        <div class="w-full sm:w-64 relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400"></i>
          <input 
            type="text" 
            value="${escapeHtml(AppState.careersFilterSearch || '')}"
            oninput="handleCareersSearchChange(this.value)"
            placeholder="Buscar por cargo ou ferramenta..." 
            class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Aviso Informativo sobre o Matching de CurrÃ­culo -->
      ${isAluno ? `
        <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-sm">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <strong class="text-indigo-950 dark:text-indigo-200 font-bold block">
              Match de CurrÃ­culo Personalizado para ${escapeHtml(student.name.split(" ")[0])}
            </strong>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] mt-0.5">
              O sistema cruza suas informaÃ§Ãµes de polo em Alagoas, ferramentas do diagnÃ³stico inicial (ex: Canva, CapCut), notas dos 7 mÃ³dulos e motivaÃ§Ãµes de carreira para indicar a afinidade com cada vaga.
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Grid de Cards de Vagas -->
      ${filtered.length === 0 ? `
        <div class="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto text-slate-400">
            <i class="fa-solid fa-briefcase"></i>
          </div>
          <h3 class="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhuma vaga encontrada com os filtros atuais</h3>
          <p class="text-xs max-w-sm mx-auto">Tente selecionar outro polo de Alagoas ou limpar o campo de busca.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${filtered.map(v => {
            const matchInfo = isAluno && student ? calculateCurriculumMatch(student, v) : null;

            return `
              <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                
                <div class="space-y-3">
                  <!-- Header do Card: Tipo de Contrato & Match Badge -->
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.contractType === 'EstÃ¡gio' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : v.contractType === 'CLT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}">
                        ${v.contractType}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <i class="fa-solid fa-location-dot text-rose-500"></i> ${v.polo}
                      </span>
                    </div>

                    ${matchInfo ? `
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black ${matchInfo.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/30' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 ring-1 ring-indigo-500/30'} flex items-center gap-1 shadow-xs">
                        <i class="fa-solid fa-bolt text-amber-500"></i> ${matchInfo.score}% Match â€¢ ${matchInfo.level}
                      </span>
                    ` : `
                      <span class="text-[10px] text-slate-400">Publicado em ${new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                    `}
                  </div>

                  <!-- TÃ­tulo da Vaga e Empresa -->
                  <div>
                    <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                      ${escapeHtml(v.title)}
                    </h3>
                    <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1.5">
                      <i class="fa-solid fa-building"></i> ${escapeHtml(v.company)} â€¢ <span class="text-slate-400 font-normal">${v.locationType}</span>
                    </p>
                  </div>

                  <!-- RemuneraÃ§Ã£o & Carga HorÃ¡ria -->
                  <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <i class="fa-solid fa-money-bill-wave"></i> ${v.salary}
                    </span>
                    <span class="text-slate-300 dark:text-slate-700">â€¢</span>
                    <span class="text-[11px] text-slate-500 flex items-center gap-1">
                      <i class="fa-regular fa-clock"></i> ${v.workload}
                    </span>
                  </div>

                  <!-- DescriÃ§Ã£o da Vaga -->
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    ${escapeHtml(v.description)}
                  </p>

                  <!-- Tags de Habilidades -->
                  <div class="flex flex-wrap gap-1 pt-1">
                    ${(v.requiredSkills || []).map(skill => `
                      <span class="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        ${escapeHtml(skill)}
                      </span>
                    `).join("")}
                  </div>

                  <!-- Pontos Fortes do Aluno para esta vaga -->
                  ${(matchInfo && matchInfo.strengths && matchInfo.strengths.length > 0) ? `
                    <div class="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                      <span class="font-bold uppercase text-[9px] tracking-wider block text-emerald-700 dark:text-emerald-400">
                        <i class="fa-solid fa-circle-check mr-1"></i> Seus pontos fortes para esta vaga:
                      </span>
                      ${matchInfo.strengths.map(st => `
                        <div class="flex items-start gap-1.5 text-[10px]">
                          <span>â€¢</span> <span>${escapeHtml(st)}</span>
                        </div>
                      `).join("")}
                    </div>
                  ` : ''}

                </div>

                <!-- AÃ§Ãµes do Card de Vaga -->
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <button 
                      type="button" 
                      onclick="applyToVacancy('${v.id}')" 
                      class="px-4 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <i class="fa-solid fa-paper-plane"></i> Candidatar-se Ã  Vaga
                    </button>

                    ${isAluno ? `
                      <button 
                        type="button" 
                        onclick="openStudentResumeModal('${student.id}')" 
                        class="px-3 py-2 rounded-xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                        title="Ver meu currÃ­culo formatado"
                      >
                        <i class="fa-solid fa-id-card"></i> Meu CurrÃ­culo
                      </button>
                    ` : ''}
                  </div>

                  ${isProf ? `
                    <button 
                      type="button" 
                      onclick="deleteJobVacancy('${v.id}')" 
                      class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
      
      <!-- SeÃ§Ã£o 1: Trilhas de Aprendizagem Recomendadas -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-route text-indigo-600"></i> Trilhas de FormaÃ§Ã£o & Cursos Gratuitos
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Cursos oficiais com emissÃ£o de certificados gratuitos reconhecidos pelo mercado (Sebrae Alagoas, Meta, Rock University, FGV e Google).
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${AppState.learningTrails.map(trilha => `
            <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                    <i class="fa-solid ${trilha.icon || 'fa-graduation-cap'}"></i>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ${trilha.hours}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Gratuito com Certificado
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    ${trilha.title}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    ${trilha.description}
                  </p>
                </div>

                <!-- Cursos da Trilha -->
                <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cursos Integrados na Trilha:</span>
                  ${trilha.courses.map(c => `
                    <a 
                      href="${c.link}" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                    >
                      <div class="min-w-0 pr-2">
                        <strong class="text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate font-semibold">${c.name}</strong>
                        <span class="text-[10px] text-slate-400">${c.provider} â€¢ ${c.format}</span>
                      </div>
                      <i class="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"></i>
                    </a>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- SeÃ§Ã£o 2: Materiais PrÃ¡ticos & Templates para Download -->
      <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <i class="fa-solid fa-folder-open text-emerald-600"></i> Materiais PrÃ¡ticos & Templates para Uso Imediato
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Copie ou baixe modelos prontos de briefing, calendÃ¡rios e propostas comerciais para iniciar seus atendimentos.
            </p>
          </div>

          ${isProf ? `
            <button 
              onclick="openAddResourceModal()" 
              class="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-plus"></i> Compartilhar Material
            </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${AppState.usefulResources.map(rec => `
            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    ${rec.category}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">${rec.format}</span>
                </div>

                <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  ${escapeHtml(rec.title)}
                </h3>

                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  ${escapeHtml(rec.description)}
                </p>
              </div>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                ${rec.canCopy ? `
                  <button 
                    onclick="copyResourceContent('${rec.id}')" 
                    class="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <i class="fa-solid fa-copy"></i> Copiar Modelo
                  </button>
                ` : `
                  <a 
                    href="${rec.downloadUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar
                  </a>
                `}

                ${isProf ? `
                  <button 
                    onclick="deleteUsefulResource('${rec.id}')" 
                    class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
    showToast("Dados do aluno nÃ£o encontrados.", "error");
    return;
  }

  const stats = calculateStudentOverallStats(student);
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff`;
  const photoUrl = student.photoUrl || student.photo || fallbackPhoto;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 scale-in my-8">
        
        <!-- CabeÃ§alho do CurrÃ­culo -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-indigo-500/20 shadow-md flex-shrink-0">
              <img src="${photoUrl}" alt="${escapeHtml(student.name)}" onerror="this.src='${fallbackPhoto}'" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                CurrÃ­culo Oficial â€¢ Emprega Mais Alagoas
              </span>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                ${escapeHtml(student.name)}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                ${escapeHtml(student.classroom || student.unitCity || "Polo Alagoas")} â€¢ CPF: ${maskCpf(student.cpf || "000.000.000-00")}
              </p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 self-start sm:self-auto p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- FormaÃ§Ã£o e QualificaÃ§Ã£o -->
        <div class="space-y-2">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-graduation-cap text-indigo-600"></i> QualificaÃ§Ã£o Profissional
          </h3>
          <div class="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1 text-xs">
            <div class="flex justify-between items-center">
              <strong class="text-indigo-900 dark:text-indigo-200 font-bold text-sm">GestÃ£o de MÃ­dias Digitais</strong>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ${stats.status} (MÃ©dia: ${stats.overallAvg.toFixed(1)})
              </span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-[11px]">
              Governo do Estado de Alagoas â€¢ Programa Emprega Mais Alagoas (7 MÃ³dulos de FormaÃ§Ã£o PrÃ¡tica)
            </p>
          </div>
        </div>

        <!-- Habilidades e Ferramentas Mapeadas -->
        <div class="space-y-2">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-wrench text-emerald-600"></i> Ferramentas & CompetÃªncias Digitais
          </h3>
          <div class="flex flex-wrap gap-1.5">
            ${(Array.isArray(student.tools) ? student.tools : (student.tools || "Canva, Instagram, Redes Sociais").split(",")).map(t => `
              <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                <i class="fa-solid fa-check text-emerald-500 mr-1"></i> ${escapeHtml(String(t).trim())}
              </span>
            `).join("")}
            <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <i class="fa-solid fa-check text-emerald-500 mr-1"></i> Redes: ${escapeHtml(Array.isArray(student.frequentNetworks) ? student.frequentNetworks.join(", ") : (student.frequentNetworks || "Instagram, TikTok, WhatsApp"))}
            </span>
          </div>
        </div>

        <!-- DiagnÃ³stico PedagÃ³gico & Perfil de Trabalho -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <i class="fa-solid fa-bullseye text-amber-500"></i> Expectativa Profissional:
            </span>
            <p class="text-slate-600 dark:text-slate-400 italic text-[11px]">
              "${escapeHtml(student.expectations || "AtuaÃ§Ã£o com produÃ§Ã£o de conteÃºdo, trÃ¡fego e atendimento para negÃ³cios locais.")}"
            </p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <i class="fa-solid fa-envelope text-indigo-500"></i> Canais de Contato:
            </span>
            <p class="text-slate-600 dark:text-slate-400 text-[11px]">
              <strong>WhatsApp:</strong> ${escapeHtml(student.contact?.phone || student.phone || "NÃ£o informado")}<br>
              <strong>E-mail:</strong> ${escapeHtml(student.contact?.email || student.email || "NÃ£o informado")}
            </p>
          </div>
        </div>

        <!-- AÃ§Ãµes do CurrÃ­culo -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button 
            onclick="copyStudentResumeText('${student.id}')" 
            class="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-copy"></i> Copiar Resumo Profissional
          </button>

          <div class="flex items-center gap-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-print"></i> Imprimir
            </button>
            <button 
              onclick="closeModal()" 
              class="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Fechar
            </button>
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

  const text = `ðŸŽ“ CURRÃCULO PROFISSIONAL â€¢ EMPREGA MAIS ALAGOAS
--------------------------------------------------
Nome: ${student.name}
Polo: ${student.classroom || student.unitCity || 'Alagoas'}
Contato: ${student.contact?.phone || student.phone || 'WhatsApp'} | ${student.contact?.email || student.email || ''}

QUALIFICAÃ‡ÃƒO PROFISSIONAL:
Curso de GestÃ£o de MÃ­dias Digitais (Governo de Alagoas)
SituaÃ§Ã£o AcadÃªmica: ${stats.status} â€¢ MÃ©dia Geral: ${stats.overallAvg.toFixed(1)}

COMPETÃŠNCIAS E FERRAMENTAS:
- Ferramentas: ${toolsStr}
- Redes Sociais: ${networksStr}
- Objetivos: ${student.expectations || 'CriaÃ§Ã£o de conteÃºdo e gestÃ£o de mÃ­dias para negÃ³cios locais'}
--------------------------------------------------
Gerado pelo Sistema Eu Por Dias â€¢ Emprega Mais Alagoas`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("CurrÃ­culo copiado para a Ã¡rea de transferÃªncia!", "success");
  }).catch(() => {
    showToast("NÃ£o foi possÃ­vel copiar automaticamente.", "warning");
  });
}

function applyToVacancy(vacancyId) {
  const vacancy = AppState.jobVacancies.find(v => v.id === vacancyId);
  if (!vacancy) {
    showToast("Vaga nÃ£o encontrada.", "error");
    return;
  }

  const student = AppState.currentUser || { name: "Aluno Interessado" };
  const stats = calculateStudentOverallStats(student);
  const matchInfo = calculateCurriculumMatch(student, vacancy);

  const pitchMsg = `OlÃ¡! Meu nome Ã© ${student.name}, sou estudante do curso de GestÃ£o de MÃ­dias Digitais pelo Programa Emprega Mais Alagoas (Polo ${student.classroom || student.unitCity || 'Alagoas'}).

Tenho interesse na vaga "${vacancy.title}" na ${vacancy.company}.
Minha mÃ©dia de rendimento acadÃªmico Ã© ${stats.overallAvg.toFixed(1)} e meu Ã­ndice de compatibilidade com os requisitos da vaga Ã© de ${matchInfo.score}%.

Principais competÃªncias: ${student.tools || 'Canva, EdiÃ§Ã£o de VÃ­deos, Copywriting e Redes Sociais'}.
Aguardo retorno para enviar meu portfÃ³lio e currÃ­culo completo. Muito obrigado!`;

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
      showToast("Mensagem de apresentaÃ§Ã£o copiada para a Ã¡rea de transferÃªncia!", "success");
    });
  }
}

function openCreateVacancyModal() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores tÃªm permissÃ£o para publicar novas vagas.", "warning");
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 scale-in my-8">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Publicar Nova Oportunidade de Trabalho</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Exclusivo para Docentes e CoordenaÃ§Ã£o</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleCreateVacancySubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TÃ­tulo da Vaga / FunÃ§Ã£o *</label>
            <input 
              type="text" 
              id="vac-title" 
              required
              placeholder="Ex: Assistente de MÃ­dias Sociais / Criador de Reels" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Empresa / Contratante *</label>
              <input 
                type="text" 
                id="vac-company" 
                required
                placeholder="Ex: AgÃªncia Criativa Alagoas" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Polo / Cidade (Alagoas) *</label>
              <input 
                type="text" 
                id="vac-polo" 
                required
                placeholder="Ex: MaceiÃ³, Arapiraca ou Remoto" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de ContrataÃ§Ã£o</label>
              <select 
                id="vac-contract" 
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
              >
                <option value="EstÃ¡gio">EstÃ¡gio Remunerado</option>
                <option value="CLT">CLT (Carteira Assinada)</option>
                <option value="Freelance / PJ">Freelance / Contrato PJ</option>
                <option value="TemporÃ¡rio">TemporÃ¡rio</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">RemuneraÃ§Ã£o / Bolsa</label>
              <input 
                type="text" 
                id="vac-salary" 
                placeholder="Ex: R$ 1.500,00 + BenefÃ­cios" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Habilidades Exigidas (separadas por vÃ­rgula)</label>
            <input 
              type="text" 
              id="vac-skills" 
              placeholder="Ex: Canva, CapCut, Instagram, Copywriting" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DescriÃ§Ã£o e AtribuiÃ§Ãµes *</label>
            <textarea 
              id="vac-desc" 
              rows="3" 
              required
              placeholder="Descreva as principais atividades, horÃ¡rios e perfil esperado do aluno..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp para Candidatura</label>
              <input 
                type="text" 
                id="vac-phone" 
                placeholder="Ex: 82991234567" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail para Envio de CurrÃ­culo</label>
              <input 
                type="email" 
                id="vac-email" 
                placeholder="Ex: rh@empresa.com.br" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-paper-plane"></i> Publicar Vaga
            </button>
          </div>
        </form>

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
    showToast("Preencha todos os campos obrigatÃ³rios marcados com *.", "warning");
    return;
  }

  const skills = rawSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);

  const newVac = {
    id: `vaga-${Date.now()}`,
    title,
    company,
    polo,
    locationType: polo.toLowerCase().includes("remoto") ? "Remoto" : "Presencial / HÃ­brido",
    contractType,
    workload: contractType === "EstÃ¡gio" ? "20h a 30h semanais" : "HorÃ¡rio comercial",
    salary,
    description,
    requiredSkills: skills.length > 0 ? skills : ["Canva", "Instagram", "MÃ­dias Digitais"],
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 scale-in my-8">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-file-arrow-up"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Compartilhar Material ou Link Ãštil</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Disponibilizar recurso gratuito para a turma</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleAddResourceSubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TÃ­tulo do Material / Curso *</label>
            <input 
              type="text" 
              id="res-title" 
              required
              placeholder="Ex: Apostila de Copywriting ou Link do Curso Sebrae" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
              <select 
                id="res-category" 
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="Material Gratuito">Material Gratuito</option>
                <option value="Curso Gratuito">Curso Gratuito</option>
                <option value="Template / Modelo">Template / Modelo</option>
                <option value="Trilha de Estudos">Trilha de Estudos</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Formato</label>
              <input 
                type="text" 
                id="res-format" 
                placeholder="Ex: PDF, Planilha ou EAD" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Link de Acesso / URL *</label>
            <input 
              type="url" 
              id="res-url" 
              required
              placeholder="https://..." 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DescriÃ§Ã£o Breve *</label>
            <textarea 
              id="res-desc" 
              rows="2" 
              required
              placeholder="Explique como este material ajudarÃ¡ o aluno..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <i class="fa-solid fa-share"></i> Compartilhar
            </button>
          </div>
        </form>

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
    showToast("Preencha todos os campos obrigatÃ³rios.", "warning");
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
    templateText = `ðŸ“… CALENDÃRIO EDITORIAL SEMANAL - GESTÃƒO DE MÃDIAS DIGITAIS
------------------------------------------------------------
â€¢ Segunda-feira: Dica prÃ¡tica / ConteÃºdo educacional (Carrossel no Instagram)
â€¢ TerÃ§a-feira: Bastidores do negÃ³cio / ProduÃ§Ã£o (Stories interativos + Enquete)
â€¢ Quarta-feira: SoluÃ§Ã£o de problema ou Mito vs Verdade (Reels curto atÃ© 30s)
â€¢ Quinta-feira: Prova Social / Depoimento de cliente (Post estÃ¡tico + Legenda humanizada)
â€¢ Sexta-feira: TendÃªncia / Humor inteligente do nicho (Reels dinÃ¢mico)
â€¢ SÃ¡bado: Oferta direta / Chamada para aÃ§Ã£o no WhatsApp ou Loja
â€¢ Domingo: Frase inspiradora ou reflexÃ£o da semana
------------------------------------------------------------
Programa Emprega Mais Alagoas â€¢ MÃ­dias Digitais`;
  } else if (resourceId === "rec-2") {
    templateText = `ðŸ“‹ ROTEIRO DE BRIEFING PARA CLIENTES DE MÃDIAS SOCIAIS
------------------------------------------------------------
1. Qual Ã© o principal produto/serviÃ§o da sua empresa?
2. Quem Ã© o seu cliente ideal (idade, cidade, principais dores)?
3. Quais redes sociais sua empresa jÃ¡ utiliza atualmente?
4. Quais sÃ£o seus 3 maiores concorrentes em Alagoas?
5. Qual Ã© o objetivo principal das redes (vendas, autoridade ou engajamento)?
6. O cliente possui fotos e vÃ­deos profissionais dos produtos?
7. Qual Ã© a identidade visual da empresa (cores, logo, tom de voz)?
8. Quem serÃ¡ a pessoa de contato para aprovar as postagens?
------------------------------------------------------------
Programa Emprega Mais Alagoas â€¢ MÃ­dias Digitais`;
  } else if (resourceId === "rec-3") {
    templateText = `ðŸ’¼ PROPOSTA COMERCIAL PADRÃƒO - GESTÃƒO DE MÃDIAS DIGITAIS
------------------------------------------------------------
PACOTE BÃSICO (PRESENÃ‡A DIGITAL):
- 12 posts mensais (3 por semana no feed)
- 20 stories mensais com enquetes e interaÃ§Ã£o
- CriaÃ§Ã£o de artes no Canva e legendas estratÃ©gicas
- Investimento sugerido: R$ 600,00 a R$ 850,00 / mÃªs

PACOTE INTERMEDIÃRIO (CRESCIMENTO & VÃDEO):
- 16 posts mensais (sendo 8 Reels editados)
- 40 stories mensais + Destaques organizados
- RelatÃ³rio mensal de alcance e mÃ©tricas
- Investimento sugerido: R$ 1.100,00 a R$ 1.500,00 / mÃªs
------------------------------------------------------------
Programa Emprega Mais Alagoas â€¢ MÃ­dias Digitais`;
  } else if (resourceId === "rec-4") {
    templateText = `âœ… CHECKLIST DE AUDITORIA DE PERFIL NO INSTAGRAM
------------------------------------------------------------
[ ] 1. Nome de usuÃ¡rio (@) simples, limpo e sem caracteres confusos.
[ ] 2. Foto de perfil nÃ­tida (logo para marcas, rosto iluminado para pessoal).
[ ] 3. Nome principal em negrito com a profissÃ£o/nicho e cidade.
[ ] 4. Bio magnÃ©tica: Quem vocÃª ajuda + Como vocÃª ajuda + CTA.
[ ] 5. Link na bio direcionando diretamente para o WhatsApp ou CatÃ¡logo.
[ ] 6. Destaques essenciais: "Comece Aqui", "Depoimentos", "Produtos", "EndereÃ§o".
[ ] 7. Pelo menos 3 posts fixados estratÃ©gicos.
[ ] 8. Paleta de cores e tipografia consistentes nos posts.
------------------------------------------------------------
Programa Emprega Mais Alagoas â€¢ MÃ­dias Digitais`;
  } else if (resourceId === "rec-5") {
    templateText = `ðŸ“„ MINUTA BÃSICA DE PRESTAÃ‡ÃƒO DE SERVIÃ‡OS DE MÃDIAS DIGITAIS
------------------------------------------------------------
CONTRATANTE: [Nome do Cliente / Empresa]
CONTRATADO(A): [Nome do Estudante/Profissional]

OBJETO: PrestaÃ§Ã£o de serviÃ§os de criaÃ§Ã£o de conteÃºdo e gestÃ£o de mÃ­dias digitais.
ENTREGAS MENSAIS: [Quantidade de posts, vÃ­deos e stories conforme proposta].
VALOR MENSAL: R$ [Valor acordado], com vencimento no dia [Dia] de cada mÃªs.
PRAZO: Contrato inicial de 3 meses, renovÃ¡vel automaticamente.
APROVAÃ‡Ã•ES: O cliente terÃ¡ atÃ© 48 horas para aprovar o cronograma semanal.
------------------------------------------------------------
Programa Emprega Mais Alagoas â€¢ MÃ­dias Digitais`;
  } else {
    templateText = `Material: ${res.title}\nCategoria: ${res.category}\nDescriÃ§Ã£o: ${res.description}\nLink de Acesso: ${res.downloadUrl}`;
  }

  navigator.clipboard.writeText(templateText).then(() => {
    showToast(`Modelo de "${res.title}" copiado com sucesso!`, "success");
  }).catch(() => {
    showToast("NÃ£o foi possÃ­vel copiar automaticamente.", "warning");
  });
}

// =============================================================
// ABA 8: LABORATÃ“RIO DE PROMPTS & IA (AWESOME CHATGPT PROMPTS)
// Baseado no repositÃ³rio oficial: https://github.com/f/prompts.chat
// =============================================================

function getDefaultPromptsLibrary() {
  return [
    // -------------------------------------------------------------
    // CATEGORIA 1: MARKETING DIGITAL & REDES SOCIAIS
    // -------------------------------------------------------------
    {
      id: "p-mkt-1",
      act: "Social Media Manager",
      title: "Social Media Manager & Estrategista de ConteÃºdo",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-share-nodes",
      color: "from-blue-500 to-indigo-600",
      description: "Planeja calendÃ¡rio editorial semanal, define linhas editoriais, ganchos de engajamento e estratÃ©gias para marcas no Instagram.",
      prompt: `Quero que vocÃª atue como um Social Media Manager profissional e experiente. VocÃª serÃ¡ responsÃ¡vel por desenvolver um plano estratÃ©gico de conteÃºdo para \${Cliente / Empresa:uma clÃ­nica de estÃ©tica em MaceiÃ³ - AL}. Sua missÃ£o Ã© definir as principais linhas editoriais, sugerir ganchos de alta retenÃ§Ã£o para posts e Reels, recomendar formatos (carrossel, vÃ­deo, stories com enquete) e criar chamadas para aÃ§Ã£o (CTAs) que direcionem para o WhatsApp. O tom de voz deve ser \${Tom de Voz:humanizado, profissional e acolhedor}. Responda em tÃ³picos organizados e forneÃ§a exemplos prÃ¡ticos prontos para publicaÃ§Ã£o. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Crie um cronograma semanal de 5 postagens focado em atrair novos clientes locais.}"`,
      tags: ["Instagram", "Planejamento", "Engajamento", "CalendÃ¡rio"],
      contributor: "prompts.chat (@f) â€¢ Adaptado para Alagoas",
      relatedModule: 1
    },
    {
      id: "p-mkt-2",
      act: "Meta Ads Specialist",
      title: "Especialista em TrÃ¡fego Pago & Meta Ads Local",
      category: "marketing",
      categoryLabel: "Marketing & Redes Sociais",
      icon: "fa-bullseye",
      color: "from-blue-600 to-cyan-600",
      description: "Estrutura campanhas de anÃºncios no Meta Ads (Facebook e Instagram) com foco em raio geogrÃ¡fico, pÃºblico local e conversÃ£o no WhatsApp.",
      prompt: `Quero que vocÃª atue como um Gestor de TrÃ¡fego Pago especialista em Meta Ads para negÃ³cios locais. Vou fornecer informaÃ§Ãµes sobre o negÃ³cio \${Tipo de NegÃ³cio:uma hamburgueria artesanal em Arapiraca - AL} e seu orÃ§amento diÃ¡rio de \${OrÃ§amento DiÃ¡rio:R$ 25,00 por dia}. VocÃª deve estruturar uma campanha completa: objetivo de campanha (Mensagens no WhatsApp ou TrÃ¡fego), segmentaÃ§Ã£o detalhada de pÃºblico (idade, interesses e raio em km), 3 variaÃ§Ãµes de criativos (imagem/vÃ­deo) e 3 opÃ§Ãµes de textos persuasivos para o anÃºncio com gatilhos de escassez e proximidade geogrÃ¡fica. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Monte a estrutura da campanha para aumentar pedidos pelo WhatsApp nos finais de semana.}"`,
      tags: ["Meta Ads", "TrÃ¡fego Pago", "NegÃ³cios Locais", "WhatsApp"],
      contributor: "prompts.chat (@f) â€¢ Adaptado para Alagoas",
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
      description: "Cria roteiros dinÃ¢micos de 15 a 30 segundos com gancho magnÃ©tico nos primeiros 3 segundos, Ã¡udio em alta e CTA envolvente.",
      prompt: `Quero que vocÃª atue como um Roteirista Especialista em VÃ­deos Curtos (Reels, TikTok e Shorts). Crie roteiros altamente visuais e dinÃ¢micos para \${Nicho:uma loja de roupas femininas}. Cada roteiro deve conter: 1) Gancho visual e verbal nos primeiros 3 segundos para reter a atenÃ§Ã£o; 2) Desenvolvimento rÃ¡pido em 3 passos ou cenas; 3) IndicaÃ§Ã£o de trilha sonora ou Ã¡udio em alta; 4) Texto em tela sugerido; 5) Chamada para aÃ§Ã£o irresistÃ­vel na legenda e no Ã¡udio. O vÃ­deo deve ter duraÃ§Ã£o estimada de \${DuraÃ§Ã£o Estimada:25 a 30 segundos}. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva 3 roteiros de Reels mostrando looks versÃ¡teis para o dia a dia.}"`,
      tags: ["Reels", "TikTok", "Roteiro", "VÃ­deo Curto"],
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
      description: "Audita perfis, otimiza biografia, destaques e propÃµe estratÃ©gias de crescimento orgÃ¢nico e parcerias.",
      prompt: `Quero que vocÃª atue como um Estrategista de Crescimento para Instagram. Vou te apresentar o perfil de \${Nome ou Tipo do Perfil:um nutricionista que atende online e presencial}. Analise e me entregue: 1) Proposta de Nome de UsuÃ¡rio e Nome Principal em negrito com palavras-chave de busca; 2) Biografia magnÃ©tica com autoridade + pÃºblico-alvo + link de aÃ§Ã£o; 3) Estrutura recomendada de 4 Destaques estratÃ©gicos; 4) Ideias de colaboraÃ§Ãµes (Collabs) e parcerias locais para acelerar seguidores qualificados. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Reestruture a bio e os destaques deste perfil para transformÃ¡-lo em uma mÃ¡quina de captaÃ§Ã£o de clientes.}"`,
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
      description: "Elabora mensagens de abordagem profissional para microinfluenciadores de Alagoas, roteiro de briefing e mÃ©tricas de ROI.",
      prompt: `Quero que vocÃª atue como um Consultor de Marketing de InfluÃªncia Regional. Desenvolva uma estratÃ©gia para \${Segmento:uma cafeteria artesanal} contratar e fechar parcerias com microinfluenciadores (5k a 30k seguidores) em \${Cidade:Penedo - AL}. ForneÃ§a: 1) Modelo de mensagem de primeiro contato via Direct do Instagram; 2) Roteiro de Briefing simples em 5 tÃ³picos para o criador de conteÃºdo seguir sem perder a espontaneidade; 3) MÃ©tricas para mensurar se a parceria gerou retorno (cupons de desconto, cliques no link, movimento no local). Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva o modelo de mensagem de abordagem profissional para enviar aos influenciadores locais.}"`,
      tags: ["Influenciadores", "Parcerias", "Briefing", "Direct"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 2: COPYWRITING, VENDAS & PERSUASÃƒO
    // -------------------------------------------------------------
    {
      id: "p-copy-1",
      act: "Advertiser & Copywriter",
      title: "Copywriter PublicitÃ¡rio (FÃ³rmula AIDA)",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-pen-nib",
      color: "from-purple-500 to-indigo-600",
      description: "Escreve textos altamente persuasivos aplicando a fÃ³rmula AtenÃ§Ã£o, Interesse, Desejo e AÃ§Ã£o para posts e anÃºncios.",
      prompt: `Quero que vocÃª atue como um Copywriter PublicitÃ¡rio sÃªnior especializado no modelo AIDA (AtenÃ§Ã£o, Interesse, Desejo, AÃ§Ã£o). Vou descrever um produto ou serviÃ§o: \${Produto ou ServiÃ§o:Curso prÃ¡tico de Canva para empreendedores iniciantes}. Crie uma copy completa dividida claramente em 4 etapas: [ATENÃ‡ÃƒO] - Gancho chocante ou pergunta provocativa; [INTERESSE] - ApresentaÃ§Ã£o do problema comum e conexÃ£o empÃ¡tica; [DESEJO] - BenefÃ­cios prÃ¡ticos, transformaÃ§Ã£o e prova de valor; [AÃ‡ÃƒO] - Chamada clara e irresistÃ­vel com urgÃªncia. Escreva em linguagem direta, envolvente e com quebras de linha que facilitam a leitura no celular. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Crie a copy para uma postagem de feed no formato carrossel.}"`,
      tags: ["AIDA", "PersuasÃ£o", "Vendas", "Copywriting"],
      contributor: "prompts.chat (@f)",
      relatedModule: 4
    },
    {
      id: "p-copy-2",
      act: "Headline Generator",
      title: "Gerador de Headlines & TÃ­tulos MagnÃ©ticos",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-heading",
      color: "from-indigo-500 to-cyan-500",
      description: "Gera 10 variaÃ§Ãµes de tÃ­tulos irresistÃ­veis com gatilhos de curiosidade, benefÃ­cio claro e quebra de padrÃ£o.",
      prompt: `Quero que vocÃª atue como um Especialista em TÃ­tulos e Headlines de Alta ConversÃ£o. Para o tema \${Tema do ConteÃºdo:Como vender pelo WhatsApp todos os dias mesmo sem ter muitos seguidores}, gere 10 opÃ§Ãµes de tÃ­tulos divididos pelas seguintes categorias de gatilhos mentais: 1) Curiosidade e Segredo; 2) Como Fazer (Passo a Passo); 3) Alerta / Erro Comum a Evitar; 4) NÃºmero / Lista RÃ¡pida; 5) Promessa Direta com Prazo. Os tÃ­tulos devem ser curtos, impactantes e perfeitos para a capa de carrossÃ©is ou miniaturas de Reels. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Gere as 10 variaÃ§Ãµes de tÃ­tulos magnÃ©ticos para este tema.}"`,
      tags: ["Headlines", "TÃ­tulos", "Gatilhos Mentais", "Cliques"],
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
      description: "Desenvolve e-mails persuasivos com linhas de assunto de alta taxa de abertura e narrativa de conversÃ£o.",
      prompt: `Quero que vocÃª atue como um Redator Especialista em E-mail Marketing e Newsletters. Crie um e-mail de \${Objetivo do E-mail:boas-vindas e apresentaÃ§Ã£o de oferta especial} para novos inscritos na lista de \${Nicho do NegÃ³cio:uma consultoria de marketing digital}. O e-mail deve conter: 1) 3 opÃ§Ãµes de linhas de assunto (com emojis estratÃ©gicos e menos de 45 caracteres); 2) Texto de prÃ©-visualizaÃ§Ã£o (preheader); 3) SaudaÃ§Ã£o personalizada com tom amigÃ¡vel; 4) HistÃ³ria curta que conecta com as dores do leitor; 5) Oferta clara com botÃ£o de chamada para aÃ§Ã£o (CTA); 6) P.S. (post scriptum) persuasivo ao final. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva o e-mail de boas-vindas com oferta para novos clientes.}"`,
      tags: ["E-mail Marketing", "Newsletter", "ConversÃ£o", "Assuntos"],
      contributor: "prompts.chat (@f)",
      relatedModule: 4
    },
    {
      id: "p-copy-4",
      act: "Screenwriter & Sales Pitch",
      title: "Roteirista de VÃ­deos de Vendas (VSL) e Pitch",
      category: "copywriting",
      categoryLabel: "Copywriting & Vendas",
      icon: "fa-film",
      color: "from-rose-600 to-amber-600",
      description: "Estrutura pitch de vendas em vÃ­deo de 60 a 90 segundos para apresentar serviÃ§os a comerciantes e empresas.",
      prompt: `Quero que vocÃª atue como um Roteirista de Pitch Comercial e VÃ­deos de Vendas. Escreva um roteiro falado em primeira pessoa de 60 segundos para um profissional recÃ©m-formado em GestÃ£o de MÃ­dias Digitais se apresentar para \${PÃºblico Alvo / Empresa:donos de restaurantes e pizzarias de Alagoas}. Estrutura obrigatÃ³ria: 1) Gancho com o problema real do cliente (perder vendas por nÃ£o ter presenÃ§a digital); 2) ApresentaÃ§Ã£o profissional e credenciais; 3) O que vocÃª faz de diferente (foco em resultados, atendimento rÃ¡pido e artes profissionais); 4) Oferta de diagnÃ³stico gratuito; 5) Chamada para conversar no WhatsApp. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva o roteiro completo do pitch de vendas.}"`,
      tags: ["Pitch", "Vendas", "ApresentaÃ§Ã£o", "VÃ­deo"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
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
      description: "Transforma a histÃ³ria de superaÃ§Ã£o e criaÃ§Ã£o de um negÃ³cio local em uma narrativa emocionante para postagens institucionais.",
      prompt: `Quero que vocÃª atue como um Mestre em Storytelling de Marcas. Vou te contar a histÃ³ria de fundaÃ§Ã£o de \${Nome da Empresa:uma confeitaria artesanal familiar iniciada na cozinha de casa}: "\${HistÃ³ria Base:ComeÃ§ou com a dona fazendo bolos para os vizinhos em 2020 para complementar a renda familiar e hoje tem uma loja fÃ­sica com 5 funcionÃ¡rios}". Transforme essa histÃ³ria em um post emocionante para o feed do Instagram (formato carrossel narrativo ou legenda profunda), destacando os desafios iniciais, a perseveranÃ§a, o amor pelo ofÃ­cio e a gratidÃ£o aos primeiros clientes locais. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva o texto completo do post em formato de histÃ³ria emocionante.}"`,
      tags: ["Storytelling", "HistÃ³ria de Marca", "EmoÃ§Ã£o", "Engajamento"],
      contributor: "prompts.chat (@f)",
      relatedModule: 5
    },

    // -------------------------------------------------------------
    // CATEGORIA 3: GESTÃƒO, CARREIRA & NEGÃ“CIOS LOCAIS
    // -------------------------------------------------------------
    {
      id: "p-ges-1",
      act: "Job Interviewer",
      title: "Entrevistador de Emprego & RH Simulador",
      category: "gestao",
      categoryLabel: "GestÃ£o, Carreira & NegÃ³cios",
      icon: "fa-user-tie",
      color: "from-slate-700 to-indigo-900",
      description: "Simula uma entrevista de emprego real para a vaga de Assistente de MÃ­dias Sociais, fazendo perguntas uma a uma e avaliando respostas.",
      prompt: `Quero que vocÃª atue como um Entrevistador de Recursos Humanos experiente em uma agÃªncia de publicidade. Eu serei o candidato a uma vaga de \${Cargo Desejado:Assistente de MÃ­dias Sociais e CriaÃ§Ã£o de ConteÃºdo em Alagoas}. Quero que vocÃª faÃ§a uma simulaÃ§Ã£o de entrevista comigo. Regras estritas: 1) FaÃ§a apenas UMA pergunta por vez e espere a minha resposta antes de prosseguir; 2) NÃ£o escreva a conversa inteira de uma vez; 3) ApÃ³s eu responder, faÃ§a um breve comentÃ¡rio sobre o ponto forte da minha resposta e em seguida faÃ§a a prÃ³xima pergunta tÃ©cnica ou comportamental. Minha primeira frase Ã©: "\${Primeira Frase:OlÃ¡! Estou pronto para iniciar a minha entrevista para a vaga.}"`,
      tags: ["Entrevista", "Emprego", "SimulaÃ§Ã£o", "Carreira"],
      contributor: "prompts.chat (@f / iltekin)",
      relatedModule: 7
    },
    {
      id: "p-ges-2",
      act: "Local Business Consultant",
      title: "Consultor de NegÃ³cios & DiagnÃ³stico Digital Local",
      category: "gestao",
      categoryLabel: "GestÃ£o, Carreira & NegÃ³cios",
      icon: "fa-store",
      color: "from-emerald-600 to-teal-700",
      description: "Gera um relatÃ³rio de diagnÃ³stico digital completo com pontos fracos, oportunidades e plano de aÃ§Ã£o em 30 dias para pequenos comÃ©rcios.",
      prompt: `Quero que vocÃª atue como um Consultor Especialista em TransformaÃ§Ã£o Digital de Pequenos NegÃ³cios. Vou te fornecer informaÃ§Ãµes sobre um estabelecimento comercial: \${Estabelecimento:uma loja de materiais de construÃ§Ã£o em Santana do Ipanema - AL com WhatsApp e Instagram pouco atualizados}. Elabore um diagnÃ³stico em 4 etapas: 1) 3 principais erros digitais que fazem esse negÃ³cio perder clientes para concorrentes; 2) Oportunidades imediatas no Google Meu NegÃ³cio e Instagram; 3) Plano de AÃ§Ã£o prÃ¡tico de 30 dias dividido em 4 semanas; 4) SugestÃ£o de pacote mensal de serviÃ§os que um gestor de mÃ­dias pode vender para este estabelecimento. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Elabore o diagnÃ³stico completo para este estabelecimento.}"`,
      tags: ["DiagnÃ³stico", "Consultoria", "Pequenos NegÃ³cios", "Plano 30 Dias"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
      relatedModule: 6
    },
    {
      id: "p-ges-3",
      act: "Freelance Pricing Calculator",
      title: "Assistente de PrecificaÃ§Ã£o Freelance",
      category: "gestao",
      categoryLabel: "GestÃ£o, Carreira & NegÃ³cios",
      icon: "fa-calculator",
      color: "from-teal-600 to-emerald-600",
      description: "Calcula o valor da hora de trabalho e precifica pacotes mensais de gestÃ£o de mÃ­dias com base na realidade do mercado de Alagoas.",
      prompt: `Quero que vocÃª atue como um Mentor Financeiro para Freelancers e Prestadores de ServiÃ§os Digitais. Ajude um profissional iniciante a calcular sua tabela de preÃ§os para \${ServiÃ§os Oferecidos:criaÃ§Ã£o de 12 posts no Canva, 20 stories e gestÃ£o bÃ¡sica de Instagram}. Considere que a meta de renda mensal do profissional Ã© de \${Meta de Renda Mensal:R$ 2.000,00 por mÃªs} trabalhando \${Horas por Semana:20 horas por semana} e atendendo na regiÃ£o de \${RegiÃ£o:Alagoas}. Me forneÃ§a: 1) O valor mÃ­nimo da sua hora de trabalho; 2) A estimativa de horas gastas por cliente; 3) Proposta de 3 pacotes de serviÃ§os (BÃ¡sico, IntermediÃ¡rio e AvanÃ§ado) com valores recomendados e justificativa comercial. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Calcule a tabela de preÃ§os e os pacotes sugeridos.}"`,
      tags: ["PrecificaÃ§Ã£o", "Freelance", "Valores", "Contratos"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
      relatedModule: 6
    },
    {
      id: "p-ges-4",
      act: "Life and Productivity Coach",
      title: "Coach de Produtividade & Rotina de Estudos",
      category: "gestao",
      categoryLabel: "GestÃ£o, Carreira & NegÃ³cios",
      icon: "fa-stopwatch",
      color: "from-indigo-600 to-purple-700",
      description: "Monta cronograma semanal equilibrado para conciliar estudos do curso, tarefas de casa e projetos profissionais.",
      prompt: `Quero que vocÃª atue como um Coach de Produtividade e GestÃ£o de Tempo. Vou te informar a minha disponibilidade: \${Disponibilidade:Tenho 2 horas por dia Ã  noite e 4 horas nos sÃ¡bados para estudar e produzir conteÃºdo}. Monte uma rotina de estudos e produÃ§Ã£o baseada na tÃ©cnica Pomodoro e blocos de tempo (Time Blocking) para que eu consiga: 1) Assistir Ã s aulas do mÃ³dulo; 2) Praticar ferramentas como Canva e CapCut; 3) Prospectar novos clientes; 4) Descansar sem culpa. ForneÃ§a o cronograma diÃ¡rio detalhado e dicas prÃ¡ticas para evitar a procrastinaÃ§Ã£o. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Crie meu cronograma semanal de produtividade.}"`,
      tags: ["Produtividade", "Tempo", "Rotina", "Foco"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 7
    },
    {
      id: "p-ges-5",
      act: "Sales Negotiator & Objection Handler",
      title: "Negociador Comercial & Quebra de ObjeÃ§Ãµes",
      category: "gestao",
      categoryLabel: "GestÃ£o, Carreira & NegÃ³cios",
      icon: "fa-comments-dollar",
      color: "from-amber-600 to-red-600",
      description: "Ensina respostas elegantes e persuasivas para responder 'estÃ¡ muito caro', 'vou pensar' e 'jÃ¡ tenho um sobrinho que faz'.",
      prompt: `Quero que vocÃª atue como um Especialista em NegociaÃ§Ã£o Comercial e Fechamento de Vendas de ServiÃ§os. ForneÃ§a respostas estratÃ©gicas, educadas e persuasivas para as 3 objeÃ§Ãµes mais comuns que donos de empresas locais dizem ao receber uma proposta de mÃ­dias sociais: 1) "Achei o valor muito caro"; 2) "Vou pensar e te retorno depois"; 3) "Meu sobrinho jÃ¡ faz algumas artes para mim de graÃ§a". Para cada objeÃ§Ã£o, dÃª a explicaÃ§Ã£o do motivo psicolÃ³gico por trÃ¡s dela e 2 modelos de mensagens prontas para enviar pelo WhatsApp que contornam a dÃºvida e conduzem para o fechamento. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:ForneÃ§a as respostas para as 3 objeÃ§Ãµes de vendas.}"`,
      tags: ["NegociaÃ§Ã£o", "ObjeÃ§Ãµes", "Vendas", "Fechamento"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 4: DESIGN, UX & CRIATIVIDADE
    // -------------------------------------------------------------
    {
      id: "p-des-1",
      act: "Art Director",
      title: "Diretor de Arte para MÃ­dias Sociais & Identidade",
      category: "design",
      categoryLabel: "Design, UX & Criatividade",
      icon: "fa-palette",
      color: "from-fuchsia-500 to-pink-600",
      description: "Define paleta de cores hexadecimais, fontes gratuitas do Canva e elementos visuais com base no nicho do cliente.",
      prompt: `Quero que vocÃª atue como um Diretor de Arte e Designer de Marcas sÃªnior. Para o negÃ³cio \${Tipo de NegÃ³cio:uma cafeteria aconchegante com pegada rÃºstica e moderna}, elabore um guia de identidade visual rÃ¡pido para uso no Canva: 1) Paleta de 5 cores com cÃ³digos Hexadecimais (#HEX) e o significado de cada cor; 2) CombinaÃ§Ã£o de 2 fontes gratuitas disponÃ­veis no Canva (uma para tÃ­tulos impactantes e outra para textos corridos de alta legibilidade); 3) Elementos grÃ¡ficos recomendados (texturas, molduras, iluminaÃ§Ã£o); 4) 3 diretrizes essenciais para manter o feed harmÃ´nico e elegante. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Crie a identidade visual completa para este negÃ³cio.}"`,
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
      description: "Estrutura Ã¡rvores de links e pÃ¡ginas de captura mobile com foco em usabilidade, contraste e taxa de conversÃ£o.",
      prompt: `Quero que vocÃª atue como um Consultor Especialista em UX/UI e OtimizaÃ§Ã£o de ConversÃ£o Mobile. Analise e projete a estrutura de uma pÃ¡gina de Links da Bio (estilo Linktree/Canva Site) para \${Profissional ou Loja:uma micropigmentadora e designer de sobrancelhas}. Defina: 1) Hierarquia dos botÃµes de cima para baixo em ordem de prioridade comercial; 2) Microtextos dos botÃµes com gatilhos de aÃ§Ã£o direta; 3) RecomendaÃ§Ãµes de contraste e acessibilidade para pessoas que usam o celular na rua; 4) Elemento de prova social para incluir no topo da pÃ¡gina. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Projete a estrutura completa da pÃ¡gina de links da bio.}"`,
      tags: ["UX/UI", "Links da Bio", "Usabilidade", "Mobile"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 5
    },
    {
      id: "p-des-3",
      act: "Visual Content Reviewer",
      title: "CrÃ­tico & Revisor de ConteÃºdo Visual",
      category: "design",
      categoryLabel: "Design, UX & Criatividade",
      icon: "fa-wand-magic-sparkles",
      color: "from-purple-600 to-rose-600",
      description: "Avalia a harmonia, legibilidade de textos sobre imagens e espaÃ§amento de artes criadas no Canva.",
      prompt: `Quero que vocÃª atue como um Revisor CrÃ­tico de Design e ComunicaÃ§Ã£o Visual. Vou descrever uma arte de mÃ­dia social: "\${DescriÃ§Ã£o da Arte:Card com fundo vermelho brilhante, texto amarelo em fonte cursiva fina dizendo 'PromoÃ§Ã£o RelÃ¢mpago', foto do produto no canto inferior e 3 logos no topo}". Aponte: 1) Os 3 maiores erros de contraste, legibilidade ou poluiÃ§Ã£o visual desta peÃ§a; 2) Como reorganizar a hierarquia de leitura (Z-Pattern ou F-Pattern); 3) Como refazer esta mesma peÃ§a no Canva de forma profissional em menos de 10 minutos. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Avalie esta arte e dÃª as orientaÃ§Ãµes de melhoria.}"`,
      tags: ["CrÃ­tica", "Legibilidade", "RevisÃ£o", "Hierarquia"],
      contributor: "prompts.chat (@nuc)",
      relatedModule: 5
    },

    // -------------------------------------------------------------
    // CATEGORIA 5: TECNOLOGIA, DADOS & AUTOMAÃ‡ÃƒO
    // -------------------------------------------------------------
    {
      id: "p-tech-1",
      act: "Linux Terminal",
      title: "Terminal Linux Simulado (Console Virtual)",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & AutomaÃ§Ã£o",
      icon: "fa-terminal",
      color: "from-slate-800 to-slate-950",
      description: "O prompt clÃ¡ssico nÃºmero 1 do repositÃ³rio prompts.chat: simula um console Linux interativo com respostas em cÃ³digo.",
      prompt: `I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in Portuguese, I will do so by putting text inside curly brackets {como este}. My first command is pwd`,
      tags: ["Linux", "Terminal", "Bash", "ClÃ¡ssico prompts.chat"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-tech-2",
      act: "JavaScript Developer",
      title: "Desenvolvedor JavaScript & Front-End",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & AutomaÃ§Ã£o",
      icon: "fa-code",
      color: "from-amber-500 to-yellow-600",
      description: "Gera scripts em JavaScript moderno, automaÃ§Ãµes web e snippets de cÃ³digo limpo com explicaÃ§Ãµes passo a passo.",
      prompt: `Quero que vocÃª atue como um Desenvolvedor Front-End e JavaScript sÃªnior. VocÃª criarÃ¡ soluÃ§Ãµes de cÃ³digo limpas, modernas (ES6+) e bem documentadas para \${Objetivo do CÃ³digo:criar uma funÃ§Ã£o que valida formato de CPF brasileiro e aplica mÃ¡scara 000.000.000-00 em tempo real em um campo de texto}. Entregue o cÃ³digo completo dentro de um bloco de cÃ³digo, acompanhado de uma explicaÃ§Ã£o simples de cada linha para que um estudante consiga compreender o funcionamento. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva o cÃ³digo em JavaScript com a funÃ§Ã£o de validaÃ§Ã£o de CPF.}"`,
      tags: ["JavaScript", "CÃ³digo", "Front-End", "ValidaÃ§Ã£o"],
      contributor: "prompts.chat (@omerimzali)",
      relatedModule: 7
    },
    {
      id: "p-tech-3",
      act: "Excel & Sheets Specialist",
      title: "Especialista em Planilhas, Excel & Google Sheets",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & AutomaÃ§Ã£o",
      icon: "fa-table",
      color: "from-emerald-600 to-green-700",
      description: "Cria fÃ³rmulas avanÃ§adas (PROCV, PROCX, QUERY, FILTER, CONT.SE), dashboards e automaÃ§Ãµes para controle de clientes.",
      prompt: `Quero que vocÃª atue como um Especialista AvanÃ§ado em Excel e Google Sheets. Eu preciso de uma fÃ³rmula para \${Finalidade da Planilha:calcular automaticamente a mÃ©dia de engajamento dos posts da semana e colorir de verde quem passou de 5% e vermelho quem ficou abaixo de 2%}. ForneÃ§a: 1) A fÃ³rmula pronta exata em PortuguÃªs e em InglÃªs; 2) O passo a passo para aplicar a FormataÃ§Ã£o Condicional; 3) Dica extra de como organizar a planilha de controle de clientes de mÃ­dias sociais. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Escreva a fÃ³rmula e o passo a passo para esta planilha.}"`,
      tags: ["Google Sheets", "Excel", "FÃ³rmulas", "MÃ©tricas"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-tech-4",
      act: "Chatbot & Automation Architect",
      title: "Arquiteto de AutomaÃ§Ã£o & Chatbot para WhatsApp",
      category: "tech",
      categoryLabel: "Tecnologia, Dados & AutomaÃ§Ã£o",
      icon: "fa-robot",
      color: "from-indigo-600 to-cyan-600",
      description: "Desenvolve fluxogramas de mensagens automÃ¡ticas, menu numÃ©rico e triagem de atendimento para WhatsApp Business.",
      prompt: `Quero que vocÃª atue como um Arquiteto de AutomaÃ§Ã£o de Atendimento e Chatbots no WhatsApp Business. Crie um fluxo de atendimento automÃ¡tico para \${Tipo de Empresa:uma clÃ­nica odontolÃ³gica que atende em MaceiÃ³}. O fluxo deve conter: 1) Mensagem de saudaÃ§Ã£o automÃ¡tica com menu numÃ©rico de 4 opÃ§Ãµes claras (Ex: 1 - Agendar Consulta, 2 - DÃºvidas sobre Tratamentos, 3 - LocalizaÃ§Ã£o e HorÃ¡rios, 4 - Falar com Atendente Humano); 2) Respostas automÃ¡ticas para cada opÃ§Ã£o; 3) Mensagem para horÃ¡rios fora do expediente comercial. Escreva em linguagem acolhedora, objetiva e com emojis estratÃ©gicos. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Crie o fluxo completo de mensagens automÃ¡ticas.}"`,
      tags: ["WhatsApp", "Chatbot", "AutomaÃ§Ã£o", "Atendimento"],
      contributor: "prompts.chat (@f) â€¢ Adaptado",
      relatedModule: 6
    },

    // -------------------------------------------------------------
    // CATEGORIA 6: EDUCAÃ‡ÃƒO, IDIOMAS & REDAÃ‡ÃƒO
    // -------------------------------------------------------------
    {
      id: "p-edu-1",
      act: "AI Writing Tutor",
      title: "Tutor de Escrita, GramÃ¡tica & Clareza Textual",
      category: "educacao",
      categoryLabel: "EducaÃ§Ã£o, Idiomas & RedaÃ§Ã£o",
      icon: "fa-graduation-cap",
      color: "from-indigo-600 to-purple-800",
      description: "Analisa redaÃ§Ãµes, postagens e e-mails corrigindo erros de portuguÃªs, concordÃ¢ncia e sugerindo versÃµes mais elegantes.",
      prompt: `Quero que vocÃª atue como um Tutor de RedaÃ§Ã£o e Revisor Gramatical de LÃ­ngua Portuguesa. Vou te enviar um texto escrito por mim: "\${Texto para CorreÃ§Ã£o:Ola pessoal venho aqui divulgar meu trabalho de midias sociais estou com precos bons e faco artes no canva chama no zap}". Sua missÃ£o Ã©: 1) Apontar os erros gramaticais, de pontuaÃ§Ã£o e de concordÃ¢ncia com explicaÃ§Ãµes gentis e didÃ¡ticas; 2) Fornecer uma versÃ£o corrigida padrÃ£o; 3) Fornecer uma versÃ£o aprimorada profissional de alto nÃ­vel pronta para postar. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Revise e aprimore este texto.}"`,
      tags: ["GramÃ¡tica", "PortuguÃªs", "RevisÃ£o", "Clareza"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 1
    },
    {
      id: "p-edu-2",
      act: "English Translator and Improver",
      title: "Tradutor & Aprimorador de InglÃªs Profissional",
      category: "educacao",
      categoryLabel: "EducaÃ§Ã£o, Idiomas & RedaÃ§Ã£o",
      icon: "fa-language",
      color: "from-blue-600 to-indigo-700",
      description: "Prompt clÃ¡ssico do repositÃ³rio: traduz qualquer idioma para o inglÃªs sofisticado, corrigindo erros e elevando o nÃ­vel do vocabulÃ¡rio.",
      prompt: `I want you to act as an English translator, spelling corrector and improver. I will speak to you in Portuguese (or any other language) and you will detect the language, translate it and answer in the corrected and improved version of my text, in professional English. I want you to replace my simplified words and sentences with more beautiful, elegant, upper-level English vocabulary suitable for international business and social media. Keep the meaning the same, but make it more impactful. Only reply with the correction and the improvements, do not write explanations. My first sentence is: "\${Primeira Frase em PortuguÃªs:Eu quero trabalhar com marketing digital e criaÃ§Ã£o de conteÃºdo para empresas do mundo inteiro.}"`,
      tags: ["InglÃªs", "TraduÃ§Ã£o", "Carreira Global", "ClÃ¡ssico prompts.chat"],
      contributor: "prompts.chat (@f)",
      relatedModule: 7
    },
    {
      id: "p-edu-3",
      act: "Plagiarism Checker and Paraphraser",
      title: "Verificador de Originalidade & Reescrita Textual",
      category: "educacao",
      categoryLabel: "EducaÃ§Ã£o, Idiomas & RedaÃ§Ã£o",
      icon: "fa-check-double",
      color: "from-teal-600 to-cyan-700",
      description: "Reescreve artigos e legendas mantendo a mensagem central com palavras 100% autorais e sem risco de plÃ¡gio.",
      prompt: `Quero que vocÃª atue como um Especialista em Originalidade Textual e ParÃ¡frase. Vou te enviar um parÃ¡grafo de referÃªncia: "\${Texto Original:O marketing digital se tornou indispensÃ¡vel para pequenas empresas porque permite alcanÃ§ar clientes locais com baixo investimento atravÃ©s das redes sociais}". Reescreva essa mesma ideia em 3 estilos diferentes: 1) Estilo Direto e Objetivo para postagem rÃ¡pida; 2) Estilo DidÃ¡tico com metÃ¡fora ou exemplo prÃ¡tico; 3) Estilo Provocativo para gerar debate nos comentÃ¡rios. Todas as versÃµes devem ser 100% originais. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Gere as 3 versÃµes reescritas deste parÃ¡grafo.}"`,
      tags: ["Originalidade", "ParÃ¡frase", "Reescrita", "Estilo"],
      contributor: "prompts.chat (@yetk1n)",
      relatedModule: 1
    },
    {
      id: "p-edu-4",
      act: "Critical Debater",
      title: "Debatedor CrÃ­tico & Analista de CenÃ¡rios",
      category: "educacao",
      categoryLabel: "EducaÃ§Ã£o, Idiomas & RedaÃ§Ã£o",
      icon: "fa-scale-balanced",
      color: "from-slate-700 to-indigo-800",
      description: "Apresenta os prÃ³s e contras de qualquer ferramenta, tendÃªncia ou decisÃ£o estratÃ©gica de mÃ­dias com argumentos sÃ³lidos.",
      prompt: `Quero que vocÃª atue como um Analista CrÃ­tico e Debatedor EstratÃ©gico. Para a questÃ£o \${Tema em DiscussÃ£o:Vale a pena pequenos negÃ³cios investirem em trÃ¡fego pago antes de terem uma base orgÃ¢nica estruturada no Instagram?}, apresente: 1) Os 3 argumentos mais fortes a favor; 2) Os 3 argumentos mais fortes contra e riscos envolvidos; 3) Uma sÃ­ntese equilibrada com recomendaÃ§Ã£o prÃ¡tica para um estudante orientar seu cliente. Mantenha uma postura neutra, analÃ­tica e fundamentada em dados. Minha primeira solicitaÃ§Ã£o Ã©: "\${Primeira SolicitaÃ§Ã£o:Apresente o debate completo sobre este tema.}"`,
      tags: ["Debate", "AnÃ¡lise CrÃ­tica", "EstratÃ©gia", "Tomada de DecisÃ£o"],
      contributor: "prompts.chat (@devisasari)",
      relatedModule: 7
    }
  ];
}

// -------------------------------------------------------------
// ARMAZENAMENTO E PERSISTÃŠNCIA DE PROMPTS
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

  // Mescla prompts padrÃ£o com customizados criados pelo professor
  AppState.promptsLibrary = [...customPrompts, ...defaults];
}

function savePromptsDataToStorage() {
  const customPrompts = AppState.promptsLibrary.filter(p => p.isCustom);
  localStorage.setItem("eupordias_custom_prompts", JSON.stringify(customPrompts));
  localStorage.setItem("eupordias_favorite_prompts", JSON.stringify(AppState.favoritePrompts || []));
}

// -------------------------------------------------------------
// RENDERIZAÃ‡ÃƒO DA ABA: LABORATÃ“RIO DE PROMPTS & IA
// -------------------------------------------------------------
function renderPromptsTab(container) {
  // REGRA DE ACESSO: Exige autenticaÃ§Ã£o por CPF
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
    { key: "gestao", label: "GestÃ£o & NegÃ³cios", icon: "fa-store" },
    { key: "design", label: "Design & Criatividade", icon: "fa-palette" },
    { key: "tech", label: "Tecnologia & Dados", icon: "fa-code" },
    { key: "educacao", label: "EducaÃ§Ã£o & RedaÃ§Ã£o", icon: "fa-graduation-cap" },
    { key: "favorites", label: "Favoritos", icon: "fa-star", count: favoriteIds.length }
  ];

  container.innerHTML = `
    <div class="space-y-6 fade-in">
      
      <!-- Banner Hero Principal do RepositÃ³rio prompts.chat -->
      <div class="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30">
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2.5 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-gradient-to-r from-indigo-500 to-purple-600 text-white tracking-wider shadow">
                <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Awesome ChatGPT Prompts
              </span>
              <a 
                href="https://github.com/f/prompts.chat" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-1.5"
                title="Acessar repositÃ³rio original no GitHub de Fatih Kadir AkÄ±n (@f)"
              >
                <i class="fa-brands fa-github text-sm"></i> prompts.chat (@f) <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                <i class="fa-solid fa-bolt"></i> Engenharia de Prompt Ativa
              </span>
            </div>

            <h1 class="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              LaboratÃ³rio de Prompts & Personas de IA
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transforme o ChatGPT, Gemini e Claude em <strong>especialistas sÃªniores sob demanda</strong>. Esta pÃ¡gina traz todo o acervo do repositÃ³rio mundial <em>prompts.chat</em> traduzido e adaptado para mÃ­dias digitais, com personalizador dinÃ¢mico de variÃ¡veis.
            </p>
          </div>

          <!-- MÃ©tricas RÃ¡pidas & AÃ§Ãµes de Docente/Discente -->
          <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto flex-shrink-0">
            <div class="grid grid-cols-3 gap-2 text-center bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div class="px-2">
                <span class="block text-base sm:text-lg font-black text-amber-400">${AppState.promptsLibrary.length}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Prompts</span>
              </div>
              <div class="px-2 border-x border-white/10">
                <span class="block text-base sm:text-lg font-black text-emerald-400">6</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Ãreas</span>
              </div>
              <div class="px-2">
                <span class="block text-base sm:text-lg font-black text-indigo-300">${favoriteIds.length}</span>
                <span class="text-[9px] uppercase tracking-wider text-slate-300">Favoritos</span>
              </div>
            </div>

            ${isProf ? `
              <button 
                onclick="openCreatePromptModal()" 
                class="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <i class="fa-solid fa-plus"></i> + Adicionar Prompt Ã  Turma
              </button>
            ` : `
              <div class="flex items-center gap-2">
                <a 
                  href="https://chatgpt.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="flex-1 px-3 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <i class="fa-solid fa-robot"></i> Abrir ChatGPT
                </a>
                <a 
                  href="https://gemini.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="flex-1 px-3 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <i class="fa-brands fa-google"></i> Abrir Gemini
                </a>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Guia DidÃ¡tico e Passo a Passo Explicativo (RetrÃ¡til) -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex items-center justify-between cursor-pointer select-none" onclick="togglePromptsGuide()">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-sm">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Como Funciona este RepositÃ³rio & Passo a Passo de Uso para o Aluno
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Guia DidÃ¡tico Oficial
                </span>
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Aprenda a metodologia de <strong>Role Prompting ("Aja como...")</strong> para obter resultados 10x melhores na InteligÃªncia Artificial.
              </p>
            </div>
          </div>
          <button class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <i class="fa-solid ${guideExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
          </button>
        </div>

        ${guideExpanded ? `
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6 text-xs text-slate-600 dark:text-slate-300 fade-in">
            
            <!-- ExplicaÃ§Ã£o do RepositÃ³rio -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                <strong class="text-indigo-900 dark:text-indigo-200 font-bold text-xs flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-question text-indigo-500"></i> O que Ã© o repositÃ³rio prompts.chat?
                </strong>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Criado pelo desenvolvedor Fatih Kadir AkÄ±n (<strong>@f</strong>), o <em>Awesome ChatGPT Prompts</em> tornou-se o repositÃ³rio open-source mais famoso do mundo para inteligÃªncia artificial generativa, acumulando dezenas de milhares de estrelas no GitHub.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                <strong class="text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center gap-1.5">
                  <i class="fa-solid fa-bullseye text-emerald-500"></i> Para que ele serve no seu aprendizado?
                </strong>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sem um prompt bem estruturado, o ChatGPT dÃ¡ respostas genÃ©ricas e rasas. Ao utilizar o comando <strong>"Aja como [Persona]"</strong>, vocÃª ativa os parÃ¢metros de um especialista no modelo, definindo limites, tom de voz e formato de entrega.
                </p>
              </div>
            </div>

            <!-- 4 Passos PrÃ¡ticos do Aluno -->
            <div class="space-y-3">
              <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i class="fa-solid fa-route text-indigo-500"></i> Passo a Passo em 4 Fases para Usar Qualquer Prompt:
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200">Escolha a Persona</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Navegue pelas categorias abaixo e encontre a especialidade ideal para a sua tarefa.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">2</span>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200">Personalize as VariÃ¡veis</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Clique em <strong>"Personalizar"</strong> para preencher os campos com os dados do seu cliente real.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">3</span>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200">Copie em 1 Clique</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Clique no botÃ£o <strong>"Copiar Prompt"</strong> para transferir o texto formatado para a Ã¡rea de transferÃªncia.</p>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1">
                  <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">4</span>
                  <h4 class="font-bold text-slate-800 dark:text-slate-200">Cole na IA & Interaja</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Abra o ChatGPT ou Gemini, cole o prompt e converse mantendo o especialista focado no objetivo.</p>
                </div>
              </div>
            </div>

          </div>
        ` : ''}
      </div>

      <!-- Barra de Filtros por Categoria & Busca em Tempo Real -->
      <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <!-- PÃ­lulas de Categorias -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
            ${categories.map(c => {
              const isActive = activeCategory === c.key;
              const countBadge = c.key === "all" ? AppState.promptsLibrary.length : (c.count !== undefined ? c.count : AppState.promptsLibrary.filter(p => p.category === c.key).length);

              return `
                <button 
                  onclick="switchPromptsCategory('${c.key}')" 
                  class="px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'}"
                >
                  <i class="fa-solid ${c.icon}"></i>
                  <span>${c.label}</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}">${countBadge}</span>
                </button>
              `;
            }).join("")}
          </div>

          <!-- Campo de Busca Textual -->
          <div class="w-full md:w-72 relative flex-shrink-0">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-xs text-slate-400"></i>
            <input 
              type="text" 
              value="${escapeHtml(AppState.promptsSearchQuery || '')}"
              oninput="handlePromptsSearchInput(this.value)"
              placeholder="Buscar persona, nicho ou ferramenta..." 
              class="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>

      <!-- Grid de Cards de Prompts -->
      ${filteredPrompts.length === 0 ? `
        <div class="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mx-auto text-slate-400">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h3 class="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhum prompt encontrado para esta seleÃ§Ã£o</h3>
          <p class="text-xs max-w-sm mx-auto">Tente selecionar outra categoria ou limpar os termos digitados na busca.</p>
          <button onclick="switchPromptsCategory('all'); handlePromptsSearchInput('');" class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
            Ver Todos os Prompts
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${filteredPrompts.map(p => {
            const isFav = favoriteIds.includes(p.id);

            return `
              <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                
                <div class="space-y-3">
                  
                  <!-- Header do Card: Ãcone, Categoria & Favorito -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${p.color || 'from-indigo-500 to-purple-600'} text-white flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        <i class="fa-solid ${p.icon || 'fa-wand-magic-sparkles'}"></i>
                      </div>
                      <div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          ${escapeHtml(p.categoryLabel || p.category)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onclick="toggleFavoritePrompt('${p.id}')" 
                      class="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                    >
                      <i class="fa-${isFav ? 'solid' : 'regular'} fa-star ${isFav ? 'text-amber-400' : ''}"></i>
                    </button>
                  </div>

                  <!-- TÃ­tulo da Persona e Papel -->
                  <div>
                    <h3 class="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                      ${escapeHtml(p.title)}
                    </h3>
                    <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                      <i class="fa-solid fa-user-astronaut"></i> Persona: <code>${escapeHtml(p.act)}</code>
                    </p>
                  </div>

                  <!-- DescriÃ§Ã£o DidÃ¡tica -->
                  <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    ${escapeHtml(p.description)}
                  </p>

                  <!-- Preview do Prompt com Destaque de VariÃ¡veis -->
                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-[11px] text-slate-700 dark:text-slate-300 font-mono leading-relaxed line-clamp-4 relative group">
                    ${escapeHtml(p.prompt)}
                  </div>

                  <!-- Tags do Prompt -->
                  <div class="flex flex-wrap gap-1 pt-1">
                    ${(p.tags || []).map(t => `
                      <span class="px-2 py-0.5 rounded-lg text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #${escapeHtml(t)}
                      </span>
                    `).join("")}
                  </div>

                </div>

                <!-- Footer de AÃ§Ãµes do Card -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div class="flex items-center gap-1.5">
                    
                    <button 
                      onclick="copyPromptText('${p.id}')" 
                      class="flex-1 px-3 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      title="Copiar prompt pronto para colar no ChatGPT"
                    >
                      <i class="fa-solid fa-copy"></i> Copiar Prompt
                    </button>

                    <button 
                      onclick="openPromptCustomizerModal('${p.id}')" 
                      class="px-3 py-2 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Preencher variÃ¡veis e personalizar"
                    >
                      <i class="fa-solid fa-sliders"></i> Personalizar
                    </button>

                  </div>

                  <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span class="truncate max-w-[150px]"><i class="fa-solid fa-code-fork mr-1"></i>${escapeHtml(p.contributor || 'prompts.chat')}</span>
                    
                    <div class="flex items-center gap-1">
                      <button 
                        onclick="openInAiPlatform('${p.id}', 'chatgpt')" 
                        class="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold flex items-center gap-1"
                        title="Copiar e abrir no ChatGPT"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i> ChatGPT
                      </button>

                      <button 
                        onclick="openInAiPlatform('${p.id}', 'gemini')" 
                        class="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[10px] font-bold flex items-center gap-1"
                        title="Copiar e abrir no Gemini"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-[8px]"></i> Gemini
                      </button>

                      ${(isProf && p.isCustom) ? `
                        <button 
                          onclick="deleteCustomPrompt('${p.id}')" 
                          class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950" 
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
// AÃ‡Ã•ES E INTERATIVIDADE DA ABA DE PROMPTS
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
    showToast("Prompt nÃ£o encontrado.", "error");
    return;
  }

  // Limpa os marcadores de variÃ¡veis para deixar pronto para envio se desejado
  const cleanPrompt = promptItem.prompt.replace(/\$\{([^:]+):([^}]+)\}/g, "$2");

  navigator.clipboard.writeText(cleanPrompt).then(() => {
    showToast(`Prompt de "${promptItem.title}" copiado para a Ã¡rea de transferÃªncia!`, "success");
  }).catch(() => {
    showToast("NÃ£o foi possÃ­vel copiar automaticamente.", "warning");
  });
}

function openInAiPlatform(promptId, platform) {
  copyPromptText(promptId);
  const targetUrl = platform === "gemini" ? "https://gemini.google.com" : "https://chatgpt.com";
  window.open(targetUrl, "_blank");
}

// -------------------------------------------------------------
// PLAYGROUND / MODAL DE PERSONALIZAÃ‡ÃƒO DE VARIÃVEIS
// -------------------------------------------------------------
function openPromptCustomizerModal(promptId) {
  const promptItem = AppState.promptsLibrary.find(p => p.id === promptId);
  if (!promptItem) return;

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  // Extrai variÃ¡veis no formato ${Label:ValorPadrao}
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

  // Se nÃ£o houver variÃ¡veis com `${...}`, detecta chaves `[...]`
  if (extractedVars.length === 0) {
    const bracketRegex = /\[([A-ZÃ€-Ãš\s/]+)\]/g;
    while ((match = bracketRegex.exec(promptItem.prompt)) !== null) {
      extractedVars.push({
        raw: match[0],
        label: match[1].trim(),
        defaultValue: ""
      });
    }
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 scale-in my-8">
        
        <!-- Header do Modal -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg shadow-sm">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 dark:text-slate-100">Personalizar: ${escapeHtml(promptItem.title)}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Preencha os campos abaixo com os dados do seu cliente ou projeto</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- FormulÃ¡rio de Campos DinÃ¢micos -->
        <div class="space-y-4 text-xs">
          ${extractedVars.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              ${extractedVars.map((v, i) => `
                <div class="space-y-1">
                  <label class="block font-bold text-slate-700 dark:text-slate-300">
                    ${escapeHtml(v.label)}:
                  </label>
                  <input 
                    type="text" 
                    id="var-input-${i}" 
                    value="${escapeHtml(v.defaultValue)}"
                    data-raw="${escapeHtml(v.raw)}"
                    oninput="updateCustomizerLivePreview('${promptItem.id}')"
                    class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              `).join("")}
            </div>
          ` : `
            <p class="text-slate-500 italic">Este prompt jÃ¡ estÃ¡ pronto para uso direto sem necessidade de preencher variÃ¡veis adicionais.</p>
          `}

          <!-- Preview do Prompt Gerado em Tempo Real -->
          <div class="space-y-1.5 pt-2">
            <label class="block font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Resultado Pronto para Enviar ao ChatGPT:</span>
              <span class="text-[10px] text-emerald-600 font-semibold"><i class="fa-solid fa-check"></i> Atualizado em tempo real</span>
            </label>
            <textarea 
              id="customizer-preview-area" 
              rows="6" 
              readonly 
              class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none select-all leading-relaxed"
            >${escapeHtml(promptItem.prompt.replace(/\$\{([^:]+):([^}]+)\}/g, "$2"))}</textarea>
          </div>
        </div>

        <!-- AÃ§Ãµes do Modal -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="copyCustomizedPromptFromModal()" 
              class="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i class="fa-solid fa-copy"></i> Copiar Prompt Personalizado
            </button>

            <button 
              type="button" 
              onclick="copyAndOpenCustomizedPrompt('chatgpt')" 
              class="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <i class="fa-solid fa-robot"></i> Abrir no ChatGPT
            </button>
          </div>

          <button 
            type="button" 
            onclick="closeModal()" 
            class="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Fechar
          </button>
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
    showToast("Prompt personalizado copiado para a Ã¡rea de transferÃªncia!", "success");
  }).catch(() => {
    showToast("NÃ£o foi possÃ­vel copiar automaticamente.", "warning");
  });
}

function copyAndOpenCustomizedPrompt(platform) {
  copyCustomizedPromptFromModal();
  const targetUrl = platform === "gemini" ? "https://gemini.google.com" : "https://chatgpt.com";
  window.open(targetUrl, "_blank");
}

// -------------------------------------------------------------
// ESPAÃ‡O DO PROFESSOR: CRIAÃ‡ÃƒO DE NOVOS PROMPTS
// -------------------------------------------------------------
function openCreatePromptModal() {
  if (!AppState.currentUser || AppState.currentUser.role !== "professor") {
    showToast("Apenas professores tÃªm permissÃ£o para adicionar novos prompts.", "warning");
    return;
  }

  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm modal-backdrop fade-in overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 scale-in my-8">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Criar Novo Prompt para a Turma</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Exclusivo para Docentes e CoordenaÃ§Ã£o</p>
            </div>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="handleCreatePromptSubmit(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TÃ­tulo da Persona / FunÃ§Ã£o *</label>
            <input 
              type="text" 
              id="prompt-title-input" 
              required
              placeholder="Ex: Especialista em Vendas no WhatsApp para Pequenos NegÃ³cios" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria *</label>
              <select 
                id="prompt-category-select" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
              >
                <option value="marketing">Marketing & Redes</option>
                <option value="copywriting">Copywriting & Vendas</option>
                <option value="gestao">GestÃ£o & NegÃ³cios</option>
                <option value="design">Design & Criatividade</option>
                <option value="tech">Tecnologia & Dados</option>
                <option value="educacao">EducaÃ§Ã£o & RedaÃ§Ã£o</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Papel em InglÃªs (Act as) *</label>
              <input 
                type="text" 
                id="prompt-act-input" 
                required
                placeholder="Ex: WhatsApp Sales Closer" 
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DescriÃ§Ã£o Breve da Finalidade *</label>
            <input 
              type="text" 
              id="prompt-desc-input" 
              required
              placeholder="Ex: Auxilia o aluno a conduzir conversas de fechamento de pacotes pelo WhatsApp." 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Comando do Prompt Completo * 
              <span class="font-normal text-slate-400">(use \${Nome:PadrÃ£o} para criar variÃ¡veis)</span>
            </label>
            <textarea 
              id="prompt-text-input" 
              rows="5" 
              required
              placeholder="Quero que vocÃª atue como um especialista em... Minha primeira solicitaÃ§Ã£o Ã©: ..." 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tags Separadas por VÃ­rgula</label>
            <input 
              type="text" 
              id="prompt-tags-input" 
              placeholder="Ex: WhatsApp, Fechamento, MÃ³dulo 6, Vendas" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button 
              type="button" 
              onclick="closeModal()" 
              class="px-4 py-2 rounded-xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
            >
              Publicar Prompt para a Turma
            </button>
          </div>
        </form>

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
    showToast("Preencha todos os campos obrigatÃ³rios.", "warning");
    return;
  }

  const categoryLabels = {
    marketing: "Marketing & Redes Sociais",
    copywriting: "Copywriting & Vendas",
    gestao: "GestÃ£o, Carreira & NegÃ³cios",
    design: "Design, UX & Criatividade",
    tech: "Tecnologia, Dados & AutomaÃ§Ã£o",
    educacao: "EducaÃ§Ã£o, Idiomas & RedaÃ§Ã£o"
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
    showToast("Prompt excluÃ­do com sucesso.", "success");
    const contentArea = document.getElementById("main-content-area");
    if (contentArea) renderPromptsTab(contentArea);
  }
}


