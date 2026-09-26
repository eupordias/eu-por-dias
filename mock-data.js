// Dados de Demonstração Anonimizados • Emprega Mais Alagoas
// Alunos fictícios para teste e visualização rica do sistema (sem dados reais ou sensíveis)

const INITIAL_STUDENTS_DATA = [
  {
    id: "demo-1",
    name: "Ana Beatriz Silva",
    cpf: "11111111111",
    email: "ana.silva@exemplo.com",
    phone: "82991112233",
    birthDate: "2003-05-14",
    polo: "Maceió",
    classroom: "Maceió - Turma A",
    status: "Aprovado",
    attendance: 95,
    address: { street: "Av. Fernandes Lima", number: "100", neighborhood: "Farol", city: "Maceió", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 9.0, b2: 8.5, b3: 9.0, b4: 9.5, absences: 1 },
      "Criação de Conteúdo & Copywriting": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
      "Design & Identidade Visual": { b1: 9.5, b2: 9.0, b3: 9.5, b4: 10.0, absences: 0 },
      "Edição de Vídeo & Reels": { b1: 8.0, b2: 8.5, b3: 9.0, b4: 8.5, absences: 2 },
      "Tráfego Pago & Meta Ads": { b1: 8.5, b2: 8.0, b3: 8.5, b4: 9.0, absences: 1 },
      "Métricas & Analytics": { b1: 9.0, b2: 9.5, b3: 8.5, b4: 9.0, absences: 0 },
      "Projeto Integrador Final": { b1: 9.5, b2: 9.5, b3: 10.0, b4: 9.5, absences: 0 }
    }
  },
  {
    id: "demo-2",
    name: "Carlos Eduardo Santos",
    cpf: "22222222222",
    email: "carlos.santos@exemplo.com",
    phone: "82992223344",
    birthDate: "2001-08-22",
    polo: "Arapiraca",
    classroom: "Arapiraca - Turma B",
    status: "Aprovado",
    attendance: 90,
    address: { street: "Rua Estudante José de Oliveira", number: "45", neighborhood: "Centro", city: "Arapiraca", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 7.5, b2: 8.0, b3: 7.5, b4: 8.0, absences: 2 },
      "Criação de Conteúdo & Copywriting": { b1: 8.0, b2: 8.5, b3: 8.0, b4: 8.5, absences: 1 },
      "Design & Identidade Visual": { b1: 7.0, b2: 7.5, b3: 8.0, b4: 7.5, absences: 2 },
      "Edição de Vídeo & Reels": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 1 },
      "Tráfego Pago & Meta Ads": { b1: 7.5, b2: 7.0, b3: 8.0, b4: 7.5, absences: 2 },
      "Métricas & Analytics": { b1: 7.0, b2: 7.5, b3: 7.0, b4: 8.0, absences: 1 },
      "Projeto Integrador Final": { b1: 8.0, b2: 8.5, b3: 8.0, b4: 8.5, absences: 1 }
    }
  },
  {
    id: "demo-3",
    name: "Mariana Costa Oliveira",
    cpf: "33333333333",
    email: "mariana.costa@exemplo.com",
    phone: "82993334455",
    birthDate: "2004-02-10",
    polo: "Maceió",
    classroom: "Maceió - Turma A",
    status: "Aprovado",
    attendance: 98,
    address: { street: "Rua Jangadeiros Alagoanos", number: "320", neighborhood: "Pajuçara", city: "Maceió", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 9.5, b2: 10.0, b3: 9.5, b4: 10.0, absences: 0 },
      "Criação de Conteúdo & Copywriting": { b1: 10.0, b2: 9.5, b3: 10.0, b4: 9.5, absences: 0 },
      "Design & Identidade Visual": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 1 },
      "Edição de Vídeo & Reels": { b1: 9.5, b2: 9.0, b3: 9.5, b4: 10.0, absences: 0 },
      "Tráfego Pago & Meta Ads": { b1: 9.0, b2: 9.5, b3: 9.0, b4: 9.5, absences: 0 },
      "Métricas & Analytics": { b1: 9.5, b2: 9.0, b3: 9.5, b4: 10.0, absences: 0 },
      "Projeto Integrador Final": { b1: 10.0, b2: 10.0, b3: 9.5, b4: 10.0, absences: 0 }
    }
  },
  {
    id: "demo-4",
    name: "Lucas Rafael Ferreira",
    cpf: "44444444444",
    email: "lucas.ferreira@exemplo.com",
    phone: "82994445566",
    birthDate: "2002-11-30",
    polo: "Penedo",
    classroom: "Penedo - Turma C",
    status: "Em Recuperação",
    attendance: 78,
    address: { street: "Av. Floriano Peixoto", number: "12", neighborhood: "Centro Histórico", city: "Penedo", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 6.0, b2: 6.5, b3: 6.0, b4: 6.5, absences: 4 },
      "Criação de Conteúdo & Copywriting": { b1: 6.5, b2: 6.0, b3: 6.5, b4: 6.0, absences: 3 },
      "Design & Identidade Visual": { b1: 7.0, b2: 6.5, b3: 6.5, b4: 7.0, absences: 3 },
      "Edição de Vídeo & Reels": { b1: 5.5, b2: 6.0, b3: 6.0, b4: 6.5, absences: 5 },
      "Tráfego Pago & Meta Ads": { b1: 5.0, b2: 6.0, b3: 5.5, b4: 6.0, absences: 4 },
      "Métricas & Analytics": { b1: 6.0, b2: 5.5, b3: 6.0, b4: 6.0, absences: 4 },
      "Projeto Integrador Final": { b1: 6.5, b2: 6.0, b3: 6.5, b4: 6.5, absences: 3 }
    }
  },
  {
    id: "demo-5",
    name: "Juliana Mendes Lima",
    cpf: "55555555555",
    email: "juliana.lima@exemplo.com",
    phone: "82995556677",
    birthDate: "2000-07-19",
    polo: "Palmeira dos Índios",
    classroom: "Palmeira - Turma A",
    status: "Aprovado",
    attendance: 92,
    address: { street: "Rua Quinze de Novembro", number: "88", neighborhood: "São Cristóvão", city: "Palmeira dos Índios", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 8.0, b2: 8.5, b3: 8.5, b4: 9.0, absences: 1 },
      "Criação de Conteúdo & Copywriting": { b1: 9.0, b2: 8.5, b3: 9.0, b4: 8.5, absences: 1 },
      "Design & Identidade Visual": { b1: 8.5, b2: 9.0, b3: 8.5, b4: 9.0, absences: 0 },
      "Edição de Vídeo & Reels": { b1: 7.5, b2: 8.0, b3: 8.0, b4: 8.5, absences: 2 },
      "Tráfego Pago & Meta Ads": { b1: 8.5, b2: 8.0, b3: 8.5, b4: 9.0, absences: 1 },
      "Métricas & Analytics": { b1: 8.0, b2: 8.5, b3: 8.0, b4: 8.5, absences: 1 },
      "Projeto Integrador Final": { b1: 9.0, b2: 8.5, b3: 9.0, b4: 9.5, absences: 0 }
    }
  },
  {
    id: "demo-6",
    name: "Rodrigo Vasconcelos Melo",
    cpf: "66666666666",
    email: "rodrigo.melo@exemplo.com",
    phone: "82996667788",
    birthDate: "2003-09-05",
    polo: "Maceió",
    classroom: "Maceió - Turma B",
    status: "Aprovado",
    attendance: 88,
    address: { street: "Rua do Sol", number: "210", neighborhood: "Centro", city: "Maceió", state: "AL" },
    grades: {
      "Marketing Digital & Estratégia": { b1: 7.5, b2: 8.0, b3: 7.5, b4: 8.0, absences: 2 },
      "Criação de Conteúdo & Copywriting": { b1: 8.0, b2: 7.5, b3: 8.0, b4: 8.0, absences: 2 },
      "Design & Identidade Visual": { b1: 7.5, b2: 8.0, b3: 7.5, b4: 8.0, absences: 2 },
      "Edição de Vídeo & Reels": { b1: 8.0, b2: 8.5, b3: 8.0, b4: 8.5, absences: 1 },
      "Tráfego Pago & Meta Ads": { b1: 7.0, b2: 7.5, b3: 7.5, b4: 8.0, absences: 3 },
      "Métricas & Analytics": { b1: 7.5, b2: 8.0, b3: 7.5, b4: 7.5, absences: 2 },
      "Projeto Integrador Final": { b1: 8.0, b2: 8.0, b3: 8.5, b4: 8.5, absences: 1 }
    }
  }
];

const DEFAULT_SUBJECTS = [
  "Marketing Digital & Estratégia",
  "Criação de Conteúdo & Copywriting",
  "Design & Identidade Visual",
  "Edição de Vídeo & Reels",
  "Tráfego Pago & Meta Ads",
  "Métricas & Analytics",
  "Projeto Integrador Final"
];

const DEFAULT_CLASSROOMS = [
  "Maceió - Turma A",
  "Maceió - Turma B",
  "Arapiraca - Turma B",
  "Penedo - Turma C",
  "Palmeira - Turma A"
];