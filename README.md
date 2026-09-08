# 🎓 Eu Por Dias — Gestão Pedagógica, Diagnóstico & Rendimento de Alunos
> **Plataforma desenvolvida para o curso de Gestão de Mídias Digitais do Programa Emprega Mais Alagoas**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets API](https://img.shields.io/badge/Google_Sheets_API_v4-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Status](https://img.shields.io/badge/Status-Produção_Ativa-success?style=for-the-badge)

---

## 💡 Sobre o Sistema: O que é o Eu Por Dias?

O **Eu Por Dias** é uma plataforma educacional e administrativa desenvolvida para atender às demandas práticas do professor do programa estadual **Emprega Mais Alagoas**, no curso profissionalizante de **Gestão de Mídias Digitais**.

O sistema centraliza e dá vida aos dados cadastrais, pedagógicos, contatos de emergência e rendimento acadêmico de **745 estudantes matriculados e presentes** (consolidados diretamente a partir dos formulários oficiais de Inscrição/Diagnóstico com 725 linhas e Lista de Presença em sala de aula), distribuídos por diversos polos de qualificação profissional em Alagoas (como Maceió, Penedo, Porto Calvo, Messias, Delmiro Gouveia, Batalha, Poço das Trincheiras, Arapiraca, União dos Palmares, Chã Preta, entre outros).

---

## 🏛️ Por que o Sistema foi Construído Assim? (Decisões de Engenharia & Pedagogia)

A arquitetura e o design do **Eu Por Dias** não foram escolhidos por acaso. Cada elemento visual e funcional foi desenhado para resolver desafios concretos vivenciados em sala de aula e no acompanhamento dos estudantes:

### 1. 📊 Da Planilha Estática ao Dashboard Humanizado
* **O Problema**: No início, todos os dados dos alunos estavam dispersos em planilhas do Google Sala de Aula e formulários de inscrição com mais de **648 linhas e 15 colunas**. Em sala de aula, usando um notebook simples ou celular, navegar por células densas de planilhas era extremamente lento, cansativo e impessoal.
* **A Solução**: O Eu Por Dias transforma cada linha fria de planilha em um **Card Pedagógico Vivo**, contendo foto, identificação rápida do polo SINE, matrícula, situação acadêmica e canais de contato imediato.

### 2. 🧠 Diagnóstico Pedagógico Individual (Metodologias Ativas)
* **O Problema**: No formulário de inscrição, os alunos compartilharam informações preciosas: *o que motivou a se inscrever*, *quais ferramentas já utilizavam* e, principalmente, *quais eram seus maiores desafios ao produzir conteúdo*. Numa planilha tradicional, esses relatos ficavam esquecidos na coluna 14.
* **A Solução**: Cada card de aluno possui uma **Gaveta de Diagnóstico Retrátil**. O professor consegue identificar em segundos se o aluno tem *vergonha de gravar vídeos*, *dificuldade com edição de Reels*, ou se deseja apenas *divulgar o pequeno negócio da família*. Isso viabiliza mentorias individualizadas e empáticas.

### 3. 💬 Comunicação Ativa em 1-Clique (WhatsApp & Redes)
* **O Problema**: Para cobrar faltas de alunos ou enviar feedbacks sobre tarefas práticas de mídias digitais, o professor perdia minutos copiando números de telefone e salvando contatos na agenda telefônica.
* **A Solução**: Cada card e tabela possui atalhos diretos e inteligentes para a API do **WhatsApp** (https://wa.me/55...) e links diretos para o **Instagram e TikTok** do estudante. Com apenas 1 toque, o professor entra em contato com a família ou com o próprio estudante.

### 4. ⚡ Arquitetura 100% Client-Side & Custo Zero de Servidor
* **Por que sem backend tradicional (Node/Python/Ruby/Java)?**
  1. **Disponibilidade Absoluta**: Não há servidor para cair, estourar limite de memória ou exigir reinicialização durante o horário de aula.
  2. **Velocidade Extrema**: O sistema carrega instantaneamente no navegador do professor (mesmo em polos do interior com internet oscilante ou 3G/4G limitado).
  3. **Custo Zero Vitalício**: Pode ser hospedado gratuitamente no **GitHub Pages**, Vercel, Netlify ou rodar até mesmo offline em um pendrive ou pasta local via index.html.
  4. **Integração Direta**: Utiliza a **Google Sheets API v4** para puxar diretamente as respostas das planilhas do Google Drive do professor com chave de API segura e sem intermediários.

### 5. 🔒 Camada de Segurança LGPD Permanente & Acesso Modo Deus (Google)
* Como o sistema lida com dados sensíveis de cidadãos alagoanos (CPF, telefones pessoais, e-mails, endereços e notas), foi estabelecida uma **Regra de Segurança Estrita**:
  * **Modo LGPD Sempre Ativo por Padrão**: A proteção de dados pessoais é obrigatória e inicia permanentemente travada. Em qualquer recarregamento ou dispositivo, os dados confidenciais nascem protegidos.
  * **Acesso Exclusivo Modo Deus via Google**: Apenas o docente/administrador autenticado via **Login do Google no Modo Deus** tem permissão para:
    1. Desativar globalmente a proteção LGPD;
    2. Revelar sob demanda os dados individuais de qualquer estudante;
    3. Exportar planilhas completas com números e CPFs desmascarados.
  * **Bloqueio Automático para Visitantes e Sala de Aula**: Qualquer tentativa de desmascarar dados sem o login do Modo Deus é imediatamente interceptada e bloqueada, abrindo o modal de autenticação Google.
  * **Modo Seguro Pedagógico (Datashow / TV)**: Modo de exibição específico para projeção em sala de aula, exibindo os diagnósticos (motivações, desafios, ferramentas, rendimento) e ocultando CPFs, telefones e endereços.
  * **Chave Mestre de Emergência**: Garante acesso ao professor mesmo em polos do interior sem sinal de internet ou em execução offline local.
  * **Zero Envio para Nuvem Terceira**: Os dados ficam estritamente no dispositivo do professor, com soberania total.

### 6. 📸 Gestão Visual com Fotos, Webcam e Otimização
* Permite conectar o nome ao rosto do aluno. O sistema possui um módulo completo de fotos com:
  * **Compressor de Imagens Nativo (HTML5 Canvas)**: Fotos tiradas do celular com 10MB são automaticamente recortadas em quadrado e compactadas para ~25KB, sem perda de qualidade visual.
  * **Câmera/Webcam em Tempo Real**: O professor pode tirar a foto do aluno no primeiro dia de aula diretamente pelo navegador.
  * **Galeria de Avatares Inclusivos**: Opções prontas para alunos que preferirem não ter fotos pessoais expostas.

### 7. 📑 Rigor Acadêmico & Prestação de Contas Oficial
* Matriz de notas dividida pelos **7 Módulos de Mídias Digitais** com cálculo automático de média e classificação (Aprovado, Recuperação, Reprovado).
* Emissão instantânea de **Boletim Individual do Aluno** e **Ata Geral de Rendimento** formatadas para impressão padrão folha A4 / PDF, atendendo a todos os requisitos de prestação de contas do **SINE** e do **Governo de Alagoas**.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade no Projeto |
| :--- | :--- |
| **HTML5 Semântico** | Estruturação modular, containers de impressão A4 e formulários acessíveis |
| **Vanilla JavaScript (ES6+)** | Lógica de filtragem, cálculos de notas, compactação Canvas, integração com APIs |
| **Tailwind CSS (JIT CDN)** | Design responsivo, tema claro/escuro, tipografia moderna e transições fluidas |
| **Google Sheets API v4** | Sincronização direta com a planilha do Google Drive do professor |
| **ViaCEP API** | Preenchimento automático de logradouro, bairro e cidade a partir do CEP |
| **Chart.js** | Gráficos visuais de situação acadêmica e distribuição por polos |
| **FontAwesome 6** | Ícones expressivos e contextuais |

---

## 📚 Módulos do Curso de Gestão de Mídias Digitais

1. **Módulo 1**: Fundamentos de Marketing Digital & Estratégia de Conteúdo
2. **Módulo 2**: Copywriting, Gatilhos Mentais & Criação de Textos
3. **Módulo 3**: Identidade Visual & Design Prático (Canva / Adobe Express)
4. **Módulo 4**: Produção e Edição de Vídeos Curtos (CapCut / Reels / TikTok)
5. **Módulo 5**: Tráfego Pago & Anúncios para Negócios Locais (Meta Ads)
6. **Módulo 6**: Métricas, Engajamento & Atendimento ao Cliente nas Redes
7. **Módulo 7**: Projeto Integrador Final (Campanha Real de Mídia Digital)

---

## 🌐 Link Oficial de Acesso

A plataforma está publicada e disponível para acesso em qualquer dispositivo (computador, tablet ou celular):

👉 **[https://eupordias.github.io/eu-por-dias/](https://eupordias.github.io/eu-por-dias/)**

---

## 📁 Estrutura de Arquivos do Repositório

```text
├── index.html          # Interface visual completa, CDN Supabase, navegação de abas e containers
├── app.js              # Controlador central, cliente Supabase, cálculos, modais e fotos
├── mock-data.js        # Base consolidada dos 745 alunos e matriz curricular completa
├── styles.css          # Estilos customizados de impressão A4 e animações de interface
├── build_data.ps1      # Script utilitário para conversão de dados do Google Sheets
├── sync_sheet.ps1      # Script auxiliar de teste com a Google Sheets API v4
├── .gitignore          # Regras de exclusão para arquivos temporários e logs
└── README.md           # Documentação completa, guia GitHub Pages, Supabase e manifesto
```

---

## 👨‍🏫 Autoria e Contexto Institucional

* **Sistema**: Eu Por Dias
* **Docente Responsável**: Professor do Programa Emprega Mais Alagoas
* **Área**: Gestão de Mídias Digitais
* **Público Atendido**: Alunos de qualificação profissional do Estado de Alagoas
* **Licença**: MIT / Uso Educacional Aberto
