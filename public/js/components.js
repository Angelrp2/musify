/* ============================================================
   MUSIFY — components.js
   Custom Elements (Web Components) para piezas reutilizables.
   Estándar nativo del navegador, sin librerías. Mismo enfoque
   que GitHub Primer, Google Material Web, etc.
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // <musify-masthead current="portada|estudio|coleccion|reproductor" meta="…">
  // Pinta la cabecera (logo + breadcrumb + nav). Usa Light DOM para
  // que el CSS global aplique sin tener que duplicar estilos.
  // ============================================================
  class MusifyMasthead extends HTMLElement {
    static get observedAttributes() { return ['current', 'meta']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    render() {
      const current = this.getAttribute('current') || '';
      const meta    = this.getAttribute('meta') || '';
      const isCur   = (k) => current === k ? 'aria-current="page"' : '';

      this.innerHTML = `
        <header class="masthead" role="banner">
          <div class="container masthead__row">
            <a class="wordmark" href="index.html" aria-label="Musify, inicio">
              Musify<span class="wordmark__dot" aria-hidden="true"></span>
              <span class="wordmark__sub" aria-hidden="true">Vol. 07 · 2026</span>
            </a>
            <p class="masthead__meta">${escapeHtml(meta)}</p>
            <nav class="nav" aria-label="Principal">
              <ul class="nav__links" data-nav-links>
                <li><a href="index.html"     ${isCur('portada')}>Portada</a></li>
                <li><a href="create.html"    ${isCur('estudio')}>Estudio</a></li>
                <li><a href="my-songs.html"  ${isCur('coleccion')}>Mi colección</a></li>
                <li>
                  <button class="nav__account" type="button" data-account-btn aria-label="Entrar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Entrar
                  </button>
                </li>
              </ul>
              <button class="nav__toggle" type="button" data-nav-toggle aria-label="Abrir menú" aria-expanded="false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </nav>
          </div>
        </header>
      `;
    }
  }

  // ============================================================
  // <musify-footer>
  // ============================================================
  class MusifyFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer class="colophon" role="contentinfo">
          <div class="container">
            <div class="colophon__inner">
              <div class="colophon__brand">
                Musi<em>fy</em><br>
                <span class="colophon__brand-sub">2026 — Estudio editorial digital</span>
              </div>
              <div>
                <h4>Producto</h4>
                <ul>
                  <li><a href="create.html">Estudio</a></li>
                  <li><a href="my-songs.html">Mi colección</a></li>
                  <li><a href="index.html">Inicio</a></li>
                </ul>
              </div>
              <div>
                <h4>Sobre el proyecto</h4>
                <ul>
                  <li><a href="#">Trabajo fin de grado · DAW</a></li>
                  <li><a href="#">Crédito</a></li>
                  <li><a href="#">Aviso legal</a></li>
                </ul>
              </div>
            </div>
            <div class="container colophon__legal">
              <span>© 2026 Musify · Hecho con cuidado en Madrid</span>
              <span>Edición Vol. 07</span>
            </div>
          </div>
        </footer>
      `;
    }
  }

  // Helpers
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // Registrar custom elements
  if (!customElements.get('musify-masthead')) customElements.define('musify-masthead', MusifyMasthead);
  if (!customElements.get('musify-footer'))   customElements.define('musify-footer', MusifyFooter);
})();
