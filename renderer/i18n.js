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
    'tab.clipboard': 'Clipboard',
    'tab.timers': 'Timers',
    'tab.notes': 'Notes',
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

    // Clipboard
    'clipboard.title': 'Clipboard History',
    'clipboard.empty': 'Nothing copied yet',
    'clipboard.emptyHint': 'Copy something to see it here',
    'clipboard.search': 'Search clipboard...',
    'clipboard.all': 'All',
    'clipboard.urls': 'URLs',
    'clipboard.code': 'Code',
    'clipboard.text': 'Text',
    'clipboard.images': 'Images',
    'clipboard.copied': 'Copied!',
    'clipboard.openFull': 'Open full clipboard',
    'clipboard.shortcut': 'Cmd+Shift+V',

    // Timers / Reminders
    'timers.title': 'Timers',
    'timers.reminders': 'Reminders',
    'timers.pomodoro': 'Pomodoro',
    'timers.newReminder': 'New reminder...',
    'timers.reminderPlaceholder': 'Remind me to...',
    'timers.5min': '5min',
    'timers.15min': '15min',
    'timers.30min': '30min',
    'timers.1h': '1h',
    'timers.noReminders': 'No active reminders',
    'timers.delete': 'Delete',
    'timers.snooze': 'Snooze',

    // Pomodoro
    'pomodoro.focus': 'Focus',
    'pomodoro.shortBreak': 'Short Break',
    'pomodoro.longBreak': 'Long Break',
    'pomodoro.idle': 'Ready',
    'pomodoro.start': 'Start',
    'pomodoro.pause': 'Pause',
    'pomodoro.resume': 'Resume',
    'pomodoro.reset': 'Reset',
    'pomodoro.skip': 'Skip',
    'pomodoro.cycle': 'Cycle',

    // Notes
    'notes.title': 'Notes',
    'notes.new': 'New note',
    'notes.search': 'Search notes...',
    'notes.empty': 'No notes yet',
    'notes.emptyHint': 'Create your first note',
    'notes.untitled': 'Untitled',
    'notes.back': 'Back',
    'notes.delete': 'Delete',
    'notes.titlePlaceholder': 'Note title...',
    'notes.contentPlaceholder': 'Write something...',
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
    'tab.clipboard': 'Presse-papiers',
    'tab.timers': 'Minuteurs',
    'tab.notes': 'Notes',
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

    // Clipboard
    'clipboard.title': 'Presse-papiers',
    'clipboard.empty': 'Rien copié pour le moment',
    'clipboard.emptyHint': 'Copiez quelque chose pour le voir ici',
    'clipboard.search': 'Rechercher...',
    'clipboard.all': 'Tout',
    'clipboard.urls': 'URLs',
    'clipboard.code': 'Code',
    'clipboard.text': 'Texte',
    'clipboard.images': 'Images',
    'clipboard.copied': 'Copié !',
    'clipboard.openFull': 'Ouvrir le presse-papiers',
    'clipboard.shortcut': 'Cmd+Shift+V',

    // Timers / Reminders
    'timers.title': 'Minuteurs',
    'timers.reminders': 'Rappels',
    'timers.pomodoro': 'Pomodoro',
    'timers.newReminder': 'Nouveau rappel...',
    'timers.reminderPlaceholder': 'Me rappeler de...',
    'timers.5min': '5min',
    'timers.15min': '15min',
    'timers.30min': '30min',
    'timers.1h': '1h',
    'timers.noReminders': 'Aucun rappel actif',
    'timers.delete': 'Supprimer',
    'timers.snooze': 'Reporter',

    // Pomodoro
    'pomodoro.focus': 'Concentration',
    'pomodoro.shortBreak': 'Pause courte',
    'pomodoro.longBreak': 'Longue pause',
    'pomodoro.idle': 'Prêt',
    'pomodoro.start': 'Démarrer',
    'pomodoro.pause': 'Pause',
    'pomodoro.resume': 'Reprendre',
    'pomodoro.reset': 'Réinitialiser',
    'pomodoro.skip': 'Passer',
    'pomodoro.cycle': 'Cycle',

    // Notes
    'notes.title': 'Notes',
    'notes.new': 'Nouvelle note',
    'notes.search': 'Rechercher...',
    'notes.empty': 'Aucune note',
    'notes.emptyHint': 'Créez votre première note',
    'notes.untitled': 'Sans titre',
    'notes.back': 'Retour',
    'notes.delete': 'Supprimer',
    'notes.titlePlaceholder': 'Titre de la note...',
    'notes.contentPlaceholder': 'Écrivez quelque chose...',
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
