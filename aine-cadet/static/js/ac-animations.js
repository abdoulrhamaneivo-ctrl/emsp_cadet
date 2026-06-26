/**
 * ac-animations.js — Animations & interactions JavaScript premium EMSPCONNECT
 * Counter animé, role picker, intersection observer, photo preview
 */

(function () {
  'use strict';

  /* ─── Utilitaires ─── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ══════════════════════════════════════════════════════
     1. COUNTER ANIMÉ — stat cards
  ══════════════════════════════════════════════════════ */
  function animateCounter(el) {
    var raw = el.dataset.target || el.textContent.trim();
    // Gérer les formats : "0/5", "0,00", "0"
    var isRatio = raw.indexOf('/') !== -1;
    var isDecimal = raw.indexOf(',') !== -1 || raw.indexOf('.') !== -1;
    var target, suffix, prefix, denom;

    if (isRatio) {
      var parts = raw.split('/');
      target = parseFloat(parts[0]) || 0;
      denom  = parts[1];
      suffix = '/' + denom;
    } else if (isDecimal) {
      target = parseFloat(raw.replace(',', '.')) || 0;
      suffix = '';
    } else {
      target = parseInt(raw) || 0;
      suffix = '';
    }

    var start = 0;
    var duration = 900;
    var startTime = null;

    function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var val = ease(progress) * target;

      if (isDecimal) {
        el.textContent = val.toFixed(2).replace('.', ',') + suffix;
      } else if (isRatio) {
        el.textContent = Math.round(val) + suffix;
      } else {
        el.textContent = Math.round(val) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Valeur finale exacte
        if (isDecimal) {
          el.textContent = target.toFixed(2).replace('.', ',');
        } else {
          el.textContent = raw;
        }
      }
    }

    requestAnimationFrame(step);
  }

  /* Déclencher les counters via IntersectionObserver */
  function initCounters() {
    var items = qsa('[data-ac-counter]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function(el) { animateCounter(el); });
      return;
    }

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    items.forEach(function(el) { io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════
     2. APPARITION AU SCROLL — éléments [data-ac-reveal]
  ══════════════════════════════════════════════════════ */
  function initReveal() {
    var items = qsa('[data-ac-reveal]');
    if (!items.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('ac-anim-fade-up');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function(el) { io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════
     3. ROLE PICKER — Inscription
  ══════════════════════════════════════════════════════ */
  function initRolePicker() {
    var picker = qs('.ac-role-picker');
    if (!picker) return;

    var cards = qsa('.ac-role-card', picker);
    var inputs = qsa('input[type="radio"]', picker);

    cards.forEach(function(card) {
      var radio = card.querySelector('input[type="radio"]');
      if (!radio) return;

      card.addEventListener('click', function() {
        // Désélectionner tous
        cards.forEach(function(c) { c.classList.remove('is-selected'); });
        inputs.forEach(function(r) { r.checked = false; });

        // Sélectionner celui-ci
        card.classList.add('is-selected');
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));

        // Mise à jour du label visible
        updateRoleLabel(radio.value);
      });

      // Si déjà coché au chargement
      if (radio.checked) {
        card.classList.add('is-selected');
        updateRoleLabel(radio.value);
      }
    });

    function updateRoleLabel(val) {
      var label = qs('[data-role-display]');
      if (!label) return;
      var names = { 'filleul': 'Cadet', 'parrain': 'Ainé' };
      label.textContent = names[val] || val;
    }
  }

  /* ══════════════════════════════════════════════════════
     4. PHOTO PREVIEW — Profil
  ══════════════════════════════════════════════════════ */
  function initPhotoPreview() {
    var inputs = qsa('input[type="file"][accept*="image"]');
    inputs.forEach(function(input) {
      input.addEventListener('change', function() {
        var file = input.files && input.files[0];
        if (!file) return;

        var targetId = input.dataset.previewTarget || 'ac-photo-preview-img';
        var preview = qs('#' + targetId) || qs('.ac-photo-preview');
        if (!preview) return;

        var reader = new FileReader();
        reader.onload = function(e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
          preview.style.animation = 'ac-scale-in 0.35s ease both';
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     5. CHAT — Textarea auto-resize & Ctrl+Enter send
  ══════════════════════════════════════════════════════ */
  function initChatCompose() {
    var textarea = qs('.ac-chat-compose__input');
    if (!textarea) return;

    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        var form = this.closest('form');
        if (form) form.submit();
      }
    });

    // Scroll automatique vers le bas
    var messages = qs('.ac-chat-messages');
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  /* ══════════════════════════════════════════════════════
     6. ÉTOILES FIABILITÉ — Rendu animé
  ══════════════════════════════════════════════════════ */
  function initStarRatings() {
    qsa('[data-star-rating]').forEach(function(el) {
      var score = parseFloat(el.dataset.starRating) || 0;
      var max   = parseInt(el.dataset.starMax) || 5;
      var html  = '';
      for (var i = 1; i <= max; i++) {
        var filled = i <= Math.round(score) ? ' is-filled' : '';
        html += '<span class="ac-star' + filled + '" aria-hidden="true" style="animation-delay:' + (i * 0.08) + 's">★</span>';
      }
      el.innerHTML = html;
    });
  }

  /* ══════════════════════════════════════════════════════
     7. BADGE NOTIFICATION — Tabs messagerie
  ══════════════════════════════════════════════════════ */
  function initTabBadges() {
    // Ajouter le badge non-lus sur l'onglet messagerie si présent
    var tabMessages = qs('[data-ac-tab="messages"]');
    var unread = qs('[data-unread-count]');
    if (tabMessages && unread) {
      var count = parseInt(unread.dataset.unreadCount) || 0;
      if (count > 0) {
        var badge = document.createElement('span');
        badge.className = 'ac-tag ac-tag--warning';
        badge.style.marginLeft = '0.4rem';
        badge.style.padding = '0.1rem 0.45rem';
        badge.style.fontSize = '0.7rem';
        badge.textContent = count;
        tabMessages.appendChild(badge);
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     8. CONFIRM SUPPRESSION — Formulaires danger
  ══════════════════════════════════════════════════════ */
  function initDangerConfirm() {
    qsa('[data-confirm]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (!window.confirm(el.dataset.confirm || 'Confirmer cette action ?')) {
          e.preventDefault();
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     9. TOOLTIPS SIMPLES
  ══════════════════════════════════════════════════════ */
  function initTooltips() {
    qsa('[title]').forEach(function(el) {
      if (el.title && !el.dataset.tooltip) {
        el.dataset.tooltip = el.title;
        // title géré nativement, ok
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     10. FILTRES ANNUAIRE — Submit auto
  ══════════════════════════════════════════════════════ */
  function initAutoFilter() {
    var form = qs('[data-ac-autofilter]');
    if (!form) return;
    qsa('select', form).forEach(function(sel) {
      sel.addEventListener('change', function() {
        form.submit();
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    initCounters();
    initReveal();
    initRolePicker();
    initPhotoPreview();
    initChatCompose();
    initStarRatings();
    initTabBadges();
    initDangerConfirm();
    initTooltips();
    initAutoFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
