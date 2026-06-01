/* ============================================================
   MUSIFY — settings.js
   Funcionalidad de configuración para settings.html
   ============================================================ */

(function () {
  'use strict';

  const SETTINGS_KEY = 'musify.settings';
  const TOKEN_KEY = 'musify.token';

  // ── Default settings ─────────────────────────────────────
  const DEFAULT_SETTINGS = {
    audioQuality: 'Alta (320 kbps)',
    volume: 75,
    showActivity: true,
    personalizedRecommendations: true,
    privateMode: false,
    emailNotifications: true,
    newSongsAlerts: true,
    newsletter: false,
    theme: 'Claro (por defecto)',
    language: 'Español',
  };

  // ── Load settings ────────────────────────────────────────
  function loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // ── Save settings ────────────────────────────────────────
  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // ── Apply settings to form ───────────────────────────────
  function applySettingsToForm(settings) {
    // Audio quality
    const qualitySelect = document.querySelector('.settings-item:nth-of-type(1) select');
    if (qualitySelect) {
      qualitySelect.value = settings.audioQuality;
    }

    // Volume
    const volumeInput = document.querySelector('.settings-item:nth-of-type(1) input[type="range"]');
    if (volumeInput) {
      volumeInput.value = settings.volume;
    }

    // Privacy checkboxes
    const privacyCheckboxes = document.querySelectorAll('.settings-item:nth-of-type(2) input[type="checkbox"]');
    if (privacyCheckboxes.length >= 3) {
      privacyCheckboxes[0].checked = settings.showActivity;
      privacyCheckboxes[1].checked = settings.personalizedRecommendations;
      privacyCheckboxes[2].checked = settings.privateMode;
    }

    // Notification checkboxes
    const notificationCheckboxes = document.querySelectorAll('.settings-item:nth-of-type(3) input[type="checkbox"]');
    if (notificationCheckboxes.length >= 3) {
      notificationCheckboxes[0].checked = settings.emailNotifications;
      notificationCheckboxes[1].checked = settings.newSongsAlerts;
      notificationCheckboxes[2].checked = settings.newsletter;
    }

    // Theme
    const themeSelect = document.querySelector('.settings-item:nth-of-type(4) select:nth-of-type(1)');
    if (themeSelect) {
      themeSelect.value = settings.theme;
    }

    // Language
    const languageSelect = document.querySelector('.settings-item:nth-of-type(4) select:nth-of-type(2)');
    if (languageSelect) {
      languageSelect.value = settings.language;
    }
  }

  // ── Get settings from form ───────────────────────────────
  function getSettingsFromForm() {
    const settings = { ...DEFAULT_SETTINGS };

    // Audio quality
    const qualitySelect = document.querySelector('.settings-item:nth-of-type(1) select');
    if (qualitySelect) {
      settings.audioQuality = qualitySelect.value;
    }

    // Volume
    const volumeInput = document.querySelector('.settings-item:nth-of-type(1) input[type="range"]');
    if (volumeInput) {
      settings.volume = parseInt(volumeInput.value);
    }

    // Privacy checkboxes
    const privacyCheckboxes = document.querySelectorAll('.settings-item:nth-of-type(2) input[type="checkbox"]');
    if (privacyCheckboxes.length >= 3) {
      settings.showActivity = privacyCheckboxes[0].checked;
      settings.personalizedRecommendations = privacyCheckboxes[1].checked;
      settings.privateMode = privacyCheckboxes[2].checked;
    }

    // Notification checkboxes
    const notificationCheckboxes = document.querySelectorAll('.settings-item:nth-of-type(3) input[type="checkbox"]');
    if (notificationCheckboxes.length >= 3) {
      settings.emailNotifications = notificationCheckboxes[0].checked;
      settings.newSongsAlerts = notificationCheckboxes[1].checked;
      settings.newsletter = notificationCheckboxes[2].checked;
    }

    // Theme
    const themeSelect = document.querySelector('.settings-item:nth-of-type(4) select:nth-of-type(1)');
    if (themeSelect) {
      settings.theme = themeSelect.value;
    }

    // Language
    const languageSelect = document.querySelector('.settings-item:nth-of-type(4) select:nth-of-type(2)');
    if (languageSelect) {
      settings.language = languageSelect.value;
    }

    return settings;
  }

  // ── Toast notification ───────────────────────────────────
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ── Event listeners ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      showToast('Por favor, inicia sesión para acceder a configuración', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    // Load and apply settings
    const settings = loadSettings();
    applySettingsToForm(settings);

    // Save button
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const newSettings = getSettingsFromForm();
        saveSettings(newSettings);
        showToast('Configuración guardada exitosamente', 'success');
      });
    }

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const settings = loadSettings();
        applySettingsToForm(settings);
        showToast('Cambios cancelados', 'info');
      });
    }

    // Security buttons (placeholder)
    const changePasswordBtn = document.querySelector('.btn-change-password');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        showToast('Función de cambiar contraseña próximamente', 'info');
      });
    }

    const twoFactorBtn = document.querySelector('.btn-two-factor');
    if (twoFactorBtn) {
      twoFactorBtn.addEventListener('click', () => {
        showToast('Autenticación de dos factores próximamente', 'info');
      });
    }

    // Delete account button
    const deleteBtn = document.querySelector('.btn-delete-account');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
          showToast('Función de eliminar cuenta próximamente', 'info');
        }
      });
    }
  });

})();
