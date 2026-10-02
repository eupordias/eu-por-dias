// =============================================================
// PÁGINA: CHAT AO VIVO (Suporte com IA & Mentor Digital)
// =============================================================
// Canal direto de comunicação e tutoria em tempo real.

function openLiveChatDirectly() {
  if (typeof switchTab === 'function') {
    switchTab('chat');
  } else if (typeof window !== 'undefined' && typeof window.switchTab === 'function') {
    window.switchTab('chat');
  }
}

if (typeof window !== 'undefined') {
  window.openLiveChatDirectly = openLiveChatDirectly;
}

console.log('[Page] Live Chat module loaded.');
