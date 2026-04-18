// ── Frontier Brief — main.js ─────────────────────────────────
// Loads data from JSON files, renders signals + experts, updates
// timestamps and live-feed activity ticker.

const CACHE_BUST = Date.now();
const SIGNALS_URL  = `data/signals.json?v=${CACHE_BUST}`;
const EXPERTS_URL  = `data/experts.json?v=${CACHE_BUST}`;

// ── Helpers ────────────────────────────────────────────────────
function relativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays/7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}

function sourceTypeLabel(t) {
  const map = { newsletter: 'Newsletter', article: 'Article', video: 'Video', podcast: 'Podcast' };
  return map[t] || t;
}

// ── Render Signals ─────────────────────────────────────────────
function renderSignals(signals, experts) {
  const expertMap = {};
  experts.forEach(e => { expertMap[e.slug] = e; });

  const container = document.getElementById('signals-container');
  const countEl   = document.getElementById('signals-count');
  if (!container) return;

  countEl && (countEl.textContent = `${signals.length} signals`);

  // Sort reverse chronological by published date
  const sorted = [...signals].sort((a, b) => {
    const da = new Date(a.published || a.processed || 0);
    const db = new Date(b.published || b.processed || 0);
    return db - da;
  });

  container.innerHTML = sorted.map(s => {
    const expert = expertMap[s.expert_slug] || {};
    const avatarColor = expert.avatar_color || '#6366f1';
    const initials    = expert.avatar_initials || s.expert.split(' ').map(w=>w[0]).join('').slice(0,2);

    return `
    <article class="signal-card" 
      data-domains="${s.domains ? s.domains.join(' ') : ''}" 
      data-tags="${s.tags ? s.tags.join(' ') : ''}"
      onclick="window.open('${s.source_url}', '_blank')" role="link" tabindex="0">
      <div class="signal-meta">
        <div class="expert-chip">
          <div class="expert-avatar" style="background:${avatarColor}">${initials}</div>
          ${s.expert}
        </div>
        <span class="source-type">${sourceTypeLabel(s.source_type)}</span>
        <span class="signal-date">${relativeDate(s.published)}</span>
      </div>
      <h3 class="signal-title">${s.title}</h3>
      <p class="signal-lens">${s.thomas_lens}</p>
      <p class="signal-quote">${s.key_quote}</p>
      <div class="signal-tags">
        ${s.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
      </div>
    </article>`;
  }).join('');
}

// ── Render Experts ─────────────────────────────────────────────
const EXPERTS_INITIAL = 8;

function renderExperts(experts, signals, showAll = false) {
  const container = document.getElementById('experts-container');
  const countEl   = document.getElementById('experts-count');
  if (!container) return;

  countEl && (countEl.textContent = `${experts.length} experts`);

  // Count signals per expert
  const sigCounts = {};
  signals.forEach(s => {
    sigCounts[s.expert_slug] = (sigCounts[s.expert_slug] || 0) + 1;
  });

  // Sort by signal count descending
  const sorted = [...experts].sort((a, b) =>
    (sigCounts[b.slug] || 0) - (sigCounts[a.slug] || 0)
  );

  const visible   = showAll ? sorted : sorted.slice(0, EXPERTS_INITIAL);
  const remaining = sorted.length - EXPERTS_INITIAL;

  container.innerHTML = visible.map(e => {
    const count = sigCounts[e.slug] || 0;
    const countLabel = count === 1 ? '1 signal' : `${count} signals`;
    const countColor = count > 0 ? 'var(--accent)' : 'var(--text-muted)';
    return `
    <div class="expert-card" onclick="openSidebar('${e.slug}')" role="button" tabindex="0" aria-label="View ${e.name}'s signals">
      <div class="expert-card-header">
        <div class="expert-card-avatar" style="background:${e.avatar_color}">${e.avatar_initials}</div>
        <span class="expert-signal-count" style="color:${countColor}">${countLabel}</span>
      </div>
      <div class="expert-card-name">${e.name}</div>
      <div class="expert-card-title">${e.title}</div>
      <div class="expert-card-domains">
        ${e.domains.map(d => `<span class="domain-chip">${d}</span>`).join('')}
      </div>
      ${e.links && e.links.length ? `<div class="expert-card-links">${e.links.map(l => `<a href="${l.url}" target="_blank" class="expert-link">${l.label}</a>`).join('')}</div>` : ''}
    </div>`;
  }).join('');

  // Remove stale button then add fresh one if needed
  const existing = document.getElementById('experts-load-more');
  if (existing) existing.remove();

  if (!showAll && remaining > 0) {
    const btn = document.createElement('button');
    btn.id = 'experts-load-more';
    btn.className = 'load-more-btn';
    btn.textContent = `Show ${remaining} more expert${remaining > 1 ? 's' : ''}`;
    btn.addEventListener('click', () => renderExperts(experts, signals, true));
    container.after(btn);
  }
}

// ── Activity Ticker ─────────────────────────────────────────────
function renderTicker(signals, experts) {
  const inner = document.getElementById('activity-inner');
  if (!inner) return;

  const items = [
    ...signals.map(s => `<span class="activity-dot"></span><span class="activity-item">New signal from <strong>${s.expert}</strong> · ${relativeDate(s.processed)}</span>`),
    `<span class="activity-dot"></span><span class="activity-item">Tracking <strong>${experts.length} experts</strong> across AI, Product & UX</span>`,
    `<span class="activity-dot"></span><span class="activity-item">Feed last refreshed <strong>today</strong></span>`,
  ];
  // Duplicate for seamless loop
  const html = [...items, ...items].join('');
  inner.innerHTML = html;
}

// ── Update live timestamp ───────────────────────────────────────
function updateTimestamp() {
  const el = document.getElementById('last-updated');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      hour12: true
    });
  }
}

// ── Stats ──────────────────────────────────────────────────────
function updateStats(signals, experts) {
  const sigCount = document.getElementById('stat-signals');
  const expCount = document.getElementById('stat-experts');
  if (sigCount) sigCount.textContent = signals.length;
  if (expCount) expCount.textContent = experts.length;
}

// ── Sidebar ───────────────────────────────────────────────────
let _allSignals = [];
let _allExperts = [];

function openSidebar(expertSlug) {
  const expert  = _allExperts.find(e => e.slug === expertSlug);
  const signals = _allSignals.filter(s => s.expert_slug === expertSlug);
  if (!expert) return;

  // Populate header
  const avatar = document.getElementById('sidebar-avatar');
  avatar.textContent = expert.avatar_initials;
  avatar.style.background = expert.avatar_color;

  document.getElementById('sidebar-name').textContent  = expert.name;
  document.getElementById('sidebar-title').textContent = expert.title;
  document.getElementById('sidebar-bio').textContent   = expert.bio_short;

  document.getElementById('sidebar-domains').innerHTML =
    expert.domains.map(d => `<span class="domain-chip">${d}</span>`).join('');

  // Links
  const linksEl = document.getElementById('sidebar-links');
  if (linksEl) {
    linksEl.innerHTML = expert.links && expert.links.length
      ? expert.links.map(l => `<a href="${l.url}" target="_blank" class="sidebar-link">${l.label} ↗</a>`).join('')
      : '';
    linksEl.style.display = expert.links && expert.links.length ? 'flex' : 'none';
  }

  // Populate signals
  const count = signals.length;
  document.getElementById('sidebar-signals-label').textContent =
    count ? `${count} signal${count > 1 ? 's' : ''}` : '';

  document.getElementById('sidebar-signals').innerHTML = count
    ? signals.map(s => `
      <div class="sidebar-signal" onclick="window.open('${s.source_url}', '_blank')" role="link" tabindex="0">
        <div class="sidebar-signal-meta">
          <span class="sidebar-signal-type">${sourceTypeLabel(s.source_type)}</span>
          <span class="sidebar-signal-date">${relativeDate(s.published)}</span>
        </div>
        <div class="sidebar-signal-title">${s.title}</div>
        <p class="sidebar-signal-lens">${s.thomas_lens}</p>
      </div>`).join('')
    : '<div class="sidebar-empty">No signals yet from this expert.</div>';

  // Open
  document.getElementById('expert-sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('expert-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Latest Post (Dynamic Home) ───────────────────────────────
async function showLatestPost() {
  try {
    const res = await fetch('data/posts.json?v=' + CACHE_BUST);
    const posts = await res.json();
    if (posts && posts.length) {
      const latest = posts[0];
      const el = document.querySelector('.latest-post');
      if (el) {
        el.innerHTML = `<span style="font-weight:600; color:var(--accent);">Latest:</span>
          <a href="posts/${latest.slug}.html" style="font-weight:600; color:var(--accent); text-decoration:underline;">${latest.title}</a>
          <span style="margin-left:0.5em; color:var(--muted); font-size:0.95em;">(${latest.date})</span>`;
        el.style.display = '';
      }
    }
  } catch {}
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  try {
    const [signalsRes, expertsRes] = await Promise.all([
      fetch(SIGNALS_URL), fetch(EXPERTS_URL)
    ]);
    const signals = await signalsRes.json();
    const experts = await expertsRes.json();

    // Store globally for sidebar
    _allSignals = signals;
    _allExperts = experts;

    renderSignals(signals, experts);
    renderExperts(experts, signals);
    renderTicker(signals, experts);
    updateStats(signals, experts);
    updateTimestamp();

    // Sidebar close listeners
    document.getElementById('sidebar-close-btn')
      .addEventListener('click', closeSidebar);
    document.getElementById('sidebar-overlay')
      .addEventListener('click', closeSidebar);
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => { init(); showLatestPost(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
  if (e.key === 'Enter' && e.target.classList.contains('signal-card')) e.target.click();
  if (e.key === 'Enter' && e.target.classList.contains('expert-card')) e.target.click();
});

// ── Theme toggle ───────────────────────────────────────────────
function initTheme() {
  const saved       = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode        = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(mode, false);
}

function applyTheme(mode, save = true) {
  const btn  = document.getElementById('theme-toggle');
  const icon = btn && btn.querySelector('.theme-icon');
  if (mode === 'light') {
    document.documentElement.classList.add('light');
    if (icon) icon.textContent = '🌙';
  } else {
    document.documentElement.classList.remove('light');
    if (icon) icon.textContent = '☀️';
  }
  if (save) localStorage.setItem('theme', mode);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light');
      applyTheme(isLight ? 'dark' : 'light');
    });
  }
});

// ── Domain Filter ──────────────────────────────────────────────
const DOMAIN_MAP = {
  'ai-product':        ['ai-product','ai × product','product-management','ai-strategy','ai-macro','product-vision','product-strategy','product-leadership','product-ops','product-discovery','cpo-level','outcome-driven'],
  'ux':                ['ux-design','ai-ux','ux × ai','design-practice','design-systems','design-strategy','inclusive-design','emerging-ux','ux-engineering','frontend','front-end'],
  'fintech':           ['fintech','payments','banking','ai × finance','financial-infrastructure','venture','industry-signal'],
  'product-leadership':['product-leadership','leadership','career','product-ops','cpo-level','ai-teams','growth'],
  'ai-capabilities':   ['ai-capabilities','technical-ai','ai-education','ai-tools','ai-practice','ai-work','ai-orgs','research'],
};

let _activeFilter = 'all';

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeFilter = btn.dataset.domain;
      applyFilter();
    });
  });
}

function applyFilter() {
  const cards = document.querySelectorAll('.signal-card');
  cards.forEach(card => {
    if (_activeFilter === 'all') {
      card.style.display = '';
      return;
    }
    const keywords = DOMAIN_MAP[_activeFilter] || [];
    const cardDomains = (card.dataset.domains || '').toLowerCase();
    const cardTags    = (card.dataset.tags || '').toLowerCase();
    const matches = keywords.some(k => cardDomains.includes(k) || cardTags.includes(k));
    card.style.display = matches ? '' : 'none';
  });

  // Update count
  const visible = document.querySelectorAll('.signal-card:not([style*="none"])').length;
  const countEl = document.getElementById('signals-count');
  if (countEl) {
    const total = _allSignals.length;
    countEl.textContent = _activeFilter === 'all'
      ? `${total} signals`
      : `${visible} of ${total} signals`;
  }
}

document.addEventListener('DOMContentLoaded', initFilters);

// ── Mobile menu ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    // Close on nav link tap
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
});
