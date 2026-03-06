const TRANSLATIONS = {
  en: {
    // Bubble - Type labels
    'type.action': 'Action needed',
    'type.error': 'Error',
    'type.info': 'Info',
    'type.question': 'Question',
    'type.approval': 'Approval',

    // Bubble - Buttons
    'dismiss': 'Dismiss',
    'gotIt': 'Got it!',
    'openTerminal': 'Open in terminal',
    'replyPlaceholder': 'Or type a custom reply...',

    // Approval mode
    'config.approvalMode': 'Approvals',
    'approvalMode.notify': 'Notifications only',
    'approvalMode.notify.desc': 'Show notifications, approve in terminal',
    'approvalMode.manage': 'Manage via Fleeble',
    'approvalMode.manage.desc': 'Approve or deny directly from Fleeble',

    // Menu - Tabs
    'tab.activity': 'Activity',
    'tab.themes': 'Themes',
    'tab.config': 'Config',

    // Menu - Status
    'status.ready': 'Ready',

    // Menu - Config labels
    'config.display': 'Display',
    'config.position': 'Position',
    'config.autoDismiss': 'Auto-dismiss',
    'config.notifSound': 'Notification Sound',
    'config.dnd': 'Do Not Disturb',
    'config.integrations': 'Integrations',
    'config.quickRef': 'Quick Reference',
    'config.language': 'Language',

    // Menu - DND
    'dnd.off': 'Off',
    'dnd.on': 'On',

    // Menu - Activity
    'empty.title': 'No notifications yet',
    'empty.hint': 'Waiting for AI requests...',
    'clearAll': 'Clear all',

    // Menu - Footer
    'quit': 'Quit',

    // Menu - Claude integration
    'claude.connect': 'Connect',
    'claude.connected': 'Connected',
    'claude.disconnect': 'Disconnect',
    'claude.notConnected': 'Not connected',
    'claude.settingsNotFound': 'Settings not found',
    'claude.hooksInstalled': 'Hooks installed',

    // Menu - Cursor integration
    'cursor.connect': 'Connect',
    'cursor.connected': 'Connected',
    'cursor.disconnect': 'Disconnect',
    'cursor.notConnected': 'Not connected',
    'cursor.settingsNotFound': 'Cursor not found',
    'cursor.hooksInstalled': 'Hooks installed',

    // Menu - Codex integration
    'codex.connect': 'Connect',
    'codex.connected': 'Connected',
    'codex.disconnect': 'Disconnect',
    'codex.notConnected': 'Not connected',
    'codex.settingsNotFound': 'Codex not found',
    'codex.configured': 'Configured',

    // Menu - Display labels
    'display.builtin': '(Built-in)',
    'display.external': '(External)',

    // Menu - Position
    'position.screen': 'Screen',

    // Menu - Sound preview
    'sound.preview': 'Preview',

    // Time ago
    'time.now': 'now',

    // Test notification
    'test.message': "Hey! Just checking in — everything's working great!",
  },
  fr: {
    // Bubble - Type labels
    'type.action': 'Action requise',
    'type.error': 'Erreur',
    'type.info': 'Info',
    'type.question': 'Question',
    'type.approval': 'Approbation',

    // Bubble - Buttons
    'dismiss': 'Fermer',
    'gotIt': 'Compris !',
    'openTerminal': 'Ouvrir le terminal',
    'replyPlaceholder': 'Ou tapez une réponse...',

    // Approval mode
    'config.approvalMode': 'Approbations',
    'approvalMode.notify': 'Notifications seules',
    'approvalMode.notify.desc': 'Voir les notifs, approuver dans le terminal',
    'approvalMode.manage': 'Gérer via Fleeble',
    'approvalMode.manage.desc': 'Approuver ou refuser depuis Fleeble',

    // Menu - Tabs
    'tab.activity': 'Activité',
    'tab.themes': 'Thèmes',
    'tab.config': 'Config',

    // Menu - Status
    'status.ready': 'Prêt',

    // Menu - Config labels
    'config.display': 'Écran',
    'config.position': 'Position',
    'config.autoDismiss': 'Fermeture auto',
    'config.notifSound': 'Son de notification',
    'config.dnd': 'Ne pas déranger',
    'config.integrations': 'Intégrations',
    'config.quickRef': 'Référence rapide',
    'config.language': 'Langue',

    // Menu - DND
    'dnd.off': 'Désactivé',
    'dnd.on': 'Activé',

    // Menu - Activity
    'empty.title': 'Aucune notification',
    'empty.hint': "En attente de requêtes IA...",
    'clearAll': 'Tout effacer',

    // Menu - Footer
    'quit': 'Quitter',

    // Menu - Claude integration
    'claude.connect': 'Connecter',
    'claude.connected': 'Connecté',
    'claude.disconnect': 'Déconnecter',
    'claude.notConnected': 'Non connecté',
    'claude.settingsNotFound': 'Paramètres introuvables',
    'claude.hooksInstalled': 'Hooks installés',

    // Menu - Cursor integration
    'cursor.connect': 'Connecter',
    'cursor.connected': 'Connecté',
    'cursor.disconnect': 'Déconnecter',
    'cursor.notConnected': 'Non connecté',
    'cursor.settingsNotFound': 'Cursor introuvable',
    'cursor.hooksInstalled': 'Hooks installés',

    // Menu - Codex integration
    'codex.connect': 'Connecter',
    'codex.connected': 'Connecté',
    'codex.disconnect': 'Déconnecter',
    'codex.notConnected': 'Non connecté',
    'codex.settingsNotFound': 'Codex introuvable',
    'codex.configured': 'Configuré',

    // Menu - Display labels
    'display.builtin': '(Intégré)',
    'display.external': '(Externe)',

    // Menu - Position
    'position.screen': 'Écran',

    // Menu - Sound preview
    'sound.preview': 'Aperçu',

    // Time ago
    'time.now': 'maintenant',

    // Test notification
    'test.message': "Salut ! Tout fonctionne parfaitement !",
  }
};

let _currentLang = 'en';

function t(key) {
  const dict = TRANSLATIONS[_currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

function setLanguage(lang) {
  _currentLang = (lang === 'fr') ? 'fr' : 'en';
  applyTranslations();
}

function getLanguage() {
  return _currentLang;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
