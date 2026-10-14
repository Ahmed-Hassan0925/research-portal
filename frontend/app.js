/* ===================================================
   ResearchNexus — Frontend Application Logic
   NUCES Peshawar Research Opportunity Portal
   =================================================== */

'use strict';

// ── CONFIGURATION ──────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

// ── STATE ───────────────────────────────────────────────────────────────
let allOpportunities = [];
let filteredOpportunities = [];
let currentFilter = 'all';
let currentSearch = '';
let currentArea = '';
let currentDetailId = null;

// ── DOM REFS ────────────────────────────────────────────────────────────
const grid = document.getElementById('opportunities-grid');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const areaFilter = document.getElementById('area-filter');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const detailClose = document.getElementById('detail-close');
const detailEditBtn = document.getElementById('detail-edit-btn');
const detailDeleteBtn = document.getElementById('detail-delete-btn');
const btnNewOpportunity = document.getElementById('btn-new-opportunity');

// Stats
const statTotal = document.getElementById('stat-total-value');
const statOpen = document.getElementById('stat-open-value');
const statClosed = document.getElementById('stat-closed-value');
const statPositions = document.getElementById('stat-positions-value');

// ── PARTICLES ANIMATION ─────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '0,245,255' : '123,47,255';
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
  };

  function init() {
    resize();
    particles = Array.from({ length: 100 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

// ── TOAST ───────────────────────────────────────────────────────────────
let toastTimer;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.className = `toast ${type}`;
  toastIcon.textContent = icons[type] || 'ℹ';
  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── API HELPERS ─────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  const response = await fetch(url, config);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

// ── DATA FETCHING ────────────────────────────────────────────────────────
async function fetchOpportunities() {
  showLoading();
  try {
    const { ok, data } = await apiFetch('/opportunities');
    if (!ok) throw new Error(data.message || 'Failed to fetch opportunities');
    allOpportunities = data.data || [];
    updateStats();
    populateAreaFilter();
    applyFilters();
  } catch (err) {
    console.error(err);
    showToast(`Connection error: ${err.message}. Is the backend running on port 5000?`, 'error');
    hideLoading();
    showEmpty();
  }
}

function showLoading() {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  grid.innerHTML = '';
}
function hideLoading() { loadingState.classList.add('hidden'); }
function showEmpty() { emptyState.classList.remove('hidden'); }

// ── STATS ────────────────────────────────────────────────────────────────
function animateNumber(el, target) {
  const start = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateStats() {
  const open = allOpportunities.filter(o => o.status === 'Open');
  const closed = allOpportunities.filter(o => o.status === 'Closed');
  const positions = open.reduce((s, o) => s + (o.available_positions || 0), 0);

  animateNumber(statTotal, allOpportunities.length);
  animateNumber(statOpen, open.length);
  animateNumber(statClosed, closed.length);
  animateNumber(statPositions, positions);
}

// ── AREA FILTER POPULATION ───────────────────────────────────────────────
function populateAreaFilter() {
  const areas = [...new Set(allOpportunities.map(o => o.research_area).filter(Boolean))].sort();
  areaFilter.innerHTML = '<option value="">All Areas</option>';
  areas.forEach(area => {
    const opt = document.createElement('option');
    opt.value = area;
    opt.textContent = area;
    areaFilter.appendChild(opt);
  });
}

// ── FILTERING & SEARCH ───────────────────────────────────────────────────
function applyFilters() {
  const search = currentSearch.toLowerCase().trim();
  filteredOpportunities = allOpportunities.filter(opp => {
    const matchFilter = currentFilter === 'all' || opp.status === currentFilter;
    const matchArea = !currentArea || opp.research_area === currentArea;
    const matchSearch = !search || [
      opp.title, opp.description, opp.faculty_name,
      opp.department, opp.research_area, opp.required_skills
    ].some(f => f && f.toLowerCase().includes(search));
    return matchFilter && matchArea && matchSearch;
  });
  renderGrid();
}

// ── RENDER GRID ──────────────────────────────────────────────────────────
function renderGrid() {
  hideLoading();
  grid.innerHTML = '';

  if (filteredOpportunities.length === 0) {
    showEmpty();
    return;
  }
  emptyState.classList.add('hidden');

  filteredOpportunities.forEach((opp, idx) => {
    const card = createCard(opp, idx);
    grid.appendChild(card);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isExpired(dateStr) {
  return dateStr && new Date(dateStr) < new Date();
}

function createCard(opp, idx) {
  const card = document.createElement('div');
  card.className = 'opp-card';
  card.setAttribute('role', 'listitem');
  card.style.animationDelay = `${idx * 50}ms`;
  card.dataset.id = opp.id;

  const expired = isExpired(opp.application_deadline);
  const statusClass = opp.status === 'Open' ? 'status-open' : 'status-closed';

  card.innerHTML = `
    <div class="card-header">
      <h2 class="card-title">${escapeHtml(opp.title)}</h2>
      <span class="status-badge ${statusClass}">${opp.status}</span>
    </div>
    <div class="card-area-tag">🔬 ${escapeHtml(opp.research_area)}</div>
    <p class="card-description">${escapeHtml(opp.description)}</p>
    <div class="card-meta">
      <div class="card-meta-item">
        <span class="meta-icon">👤</span>
        <span class="meta-text">${escapeHtml(opp.faculty_name)}</span>
      </div>
      <div class="card-meta-item">
        <span class="meta-icon">🏛</span>
        <span class="meta-text">${escapeHtml(opp.department)}</span>
      </div>
    </div>
    <div class="card-footer">
      <div class="positions-badge">
        ◈ ${opp.available_positions} position${opp.available_positions !== 1 ? 's' : ''}
      </div>
      <div class="deadline-text ${expired ? 'stat-red' : ''}">
        ${expired ? '⚠ ' : '📅 '}${formatDate(opp.application_deadline)}
      </div>
    </div>
    <div class="card-actions">
      <button class="btn btn-secondary" onclick="openDetail(${opp.id}, event)" aria-label="View details for ${escapeHtml(opp.title)}">
        View Details
      </button>
      <button class="btn btn-warning" onclick="openEditModal(${opp.id}, event)" aria-label="Edit ${escapeHtml(opp.title)}">
        Edit
      </button>
      <button class="btn btn-danger" onclick="openDeleteConfirm(${opp.id}, event)" aria-label="Delete ${escapeHtml(opp.title)}">
        Delete
      </button>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (!e.target.closest('.card-actions')) openDetail(opp.id, e);
  });

  return card;
}

// ── DETAIL PANEL ─────────────────────────────────────────────────────────
function openDetail(id, e) {
  if (e) e.stopPropagation();
  const opp = allOpportunities.find(o => o.id === id);
  if (!opp) return;
  currentDetailId = id;
  renderDetailContent(opp);
  detailPanel.classList.remove('hidden');
  requestAnimationFrame(() => detailPanel.classList.add('open'));
}

function closeDetail() {
  detailPanel.classList.remove('open');
  setTimeout(() => detailPanel.classList.add('hidden'), 450);
  currentDetailId = null;
}

function renderDetailContent(opp) {
  const expired = isExpired(opp.application_deadline);
  const statusClass = opp.status === 'Open' ? 'status-open' : 'status-closed';
  const skills = opp.required_skills
    ? opp.required_skills.split(/[,;]+/).map(s => s.trim()).filter(Boolean)
    : [];

  detailContent.innerHTML = `
    <div class="detail-status-bar">
      <span class="status-badge ${statusClass}">${opp.status}</span>
      ${opp.status === 'Open'
        ? `<button class="btn btn-danger" style="font-size:0.78rem;padding:6px 14px" onclick="toggleStatus(${opp.id}, 'Closed')">Close Opportunity</button>`
        : `<button class="btn btn-secondary" style="font-size:0.78rem;padding:6px 14px" onclick="toggleStatus(${opp.id}, 'Open')">Reopen Opportunity</button>`
      }
    </div>
    <h2 class="detail-title">${escapeHtml(opp.title)}</h2>
    <div class="detail-id">ID #${opp.id} · Created ${formatDate(opp.created_at)}</div>

    <div class="detail-section">
      <div class="detail-section-title">Description</div>
      <p class="detail-text">${escapeHtml(opp.description)}</p>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Details</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Faculty</div>
          <div class="detail-item-value">${escapeHtml(opp.faculty_name)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Department</div>
          <div class="detail-item-value">${escapeHtml(opp.department)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Research Area</div>
          <div class="detail-item-value">${escapeHtml(opp.research_area)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Positions Available</div>
          <div class="detail-item-value" style="color:var(--cyan)">${opp.available_positions}</div>
        </div>
        <div class="detail-item" style="${expired ? 'border-color:rgba(255,59,107,0.3)' : ''}">
          <div class="detail-item-label">Application Deadline</div>
          <div class="detail-item-value" style="${expired ? 'color:var(--red)' : ''}">
            ${expired ? '⚠ ' : ''}${formatDate(opp.application_deadline)}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Last Updated</div>
          <div class="detail-item-value" style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(opp.updated_at)}</div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Required Skills</div>
      <div class="skills-list">
        ${skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>
  `;
}

// ── STATUS TOGGLE ─────────────────────────────────────────────────────────
async function toggleStatus(id, newStatus) {
  const opp = allOpportunities.find(o => o.id === id);
  if (!opp) return;

  try {
    const payload = { ...opp, status: newStatus, application_deadline: opp.application_deadline.split('T')[0] };
    const { ok, data } = await apiFetch(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.message);

    showToast(`Opportunity marked as ${newStatus}!`, 'success');
    await fetchOpportunities();
    if (currentDetailId === id) {
      const updated = allOpportunities.find(o => o.id === id);
      if (updated) renderDetailContent(updated);
    }
  } catch (err) {
    showToast(`Failed to update status: ${err.message}`, 'error');
  }
}

// ── MODAL HELPERS ─────────────────────────────────────────────────────────
function openModal(contentHtml) {
  modalContent.innerHTML = contentHtml;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modalOverlay.querySelector('input, textarea, select')?.focus(), 100);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContent.innerHTML = '';
  document.body.style.overflow = '';
}

// ── CREATE FORM ───────────────────────────────────────────────────────────
function openCreateModal() {
  const html = buildFormHtml('Create New Opportunity', 'Add a research opening for students to apply', null);
  openModal(html);
  document.getElementById('opp-form').addEventListener('submit', handleCreate);
}

function openEditModal(id, e) {
  if (e) e.stopPropagation();
  const opp = allOpportunities.find(o => o.id === id);
  if (!opp) return;
  const html = buildFormHtml('Edit Opportunity', `Modifying: #${id}`, opp);
  openModal(html);
  document.getElementById('opp-form').addEventListener('submit', (ev) => handleEdit(ev, id));
}

function buildFormHtml(title, subtitle, opp) {
  const v = opp ? {
    title: opp.title,
    description: opp.description,
    research_area: opp.research_area,
    faculty_name: opp.faculty_name,
    department: opp.department,
    required_skills: opp.required_skills,
    available_positions: opp.available_positions,
    application_deadline: opp.application_deadline ? opp.application_deadline.split('T')[0] : '',
    status: opp.status,
  } : {
    title: '', description: '', research_area: '', faculty_name: '',
    department: '', required_skills: '', available_positions: 1,
    application_deadline: '', status: 'Open',
  };

  return `
    <h2 class="form-title">${title}</h2>
    <p class="form-subtitle">${subtitle}</p>
    <form id="opp-form" novalidate>
      <div class="form-grid">
        <div class="form-group full-width">
          <label class="form-label" for="f-title">Title <span class="required">*</span></label>
          <input id="f-title" class="form-input" type="text" name="title" value="${escapeHtml(v.title)}" placeholder="e.g., AI-Powered Medical Diagnosis" maxlength="255" />
          <span class="form-error" id="err-title"></span>
        </div>
        <div class="form-group full-width">
          <label class="form-label" for="f-description">Description <span class="required">*</span></label>
          <textarea id="f-description" class="form-textarea" name="description" placeholder="Detailed description of the research project..." maxlength="3000">${escapeHtml(v.description)}</textarea>
          <span class="form-error" id="err-description"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-research_area">Research Area <span class="required">*</span></label>
          <input id="f-research_area" class="form-input" type="text" name="research_area" value="${escapeHtml(v.research_area)}" placeholder="e.g., Artificial Intelligence" maxlength="150" />
          <span class="form-error" id="err-research_area"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-faculty_name">Faculty Name <span class="required">*</span></label>
          <input id="f-faculty_name" class="form-input" type="text" name="faculty_name" value="${escapeHtml(v.faculty_name)}" placeholder="e.g., Dr. Ayesha Tariq" maxlength="150" />
          <span class="form-error" id="err-faculty_name"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-department">Department <span class="required">*</span></label>
          <input id="f-department" class="form-input" type="text" name="department" value="${escapeHtml(v.department)}" placeholder="e.g., Computer Science" maxlength="150" />
          <span class="form-error" id="err-department"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-available_positions">Positions <span class="required">*</span></label>
          <input id="f-available_positions" class="form-input" type="number" name="available_positions" value="${v.available_positions}" min="1" max="100" />
          <span class="form-error" id="err-available_positions"></span>
        </div>
        <div class="form-group full-width">
          <label class="form-label" for="f-required_skills">Required Skills <span class="required">*</span></label>
          <input id="f-required_skills" class="form-input" type="text" name="required_skills" value="${escapeHtml(v.required_skills)}" placeholder="e.g., Python, TensorFlow, React (comma-separated)" maxlength="500" />
          <span class="form-error" id="err-required_skills"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-application_deadline">Deadline <span class="required">*</span></label>
          <input id="f-application_deadline" class="form-input" type="date" name="application_deadline" value="${v.application_deadline}" />
          <span class="form-error" id="err-application_deadline"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="f-status">Status</label>
          <select id="f-status" class="form-select" name="status">
            <option value="Open" ${v.status === 'Open' ? 'selected' : ''}>Open</option>
            <option value="Closed" ${v.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
          <span class="form-error" id="err-status"></span>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" id="form-submit-btn" class="btn btn-primary">
          ${opp ? 'Save Changes' : 'Create Opportunity'}
        </button>
      </div>
    </form>
  `;
}

// ── VALIDATION ────────────────────────────────────────────────────────────
function validateForm(formData) {
  const errors = {};
  const fields = ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline'];

  fields.forEach(f => {
    const val = formData.get(f)?.toString().trim();
    if (!val) errors[f] = 'This field is required.';
  });

  const positions = parseInt(formData.get('available_positions'));
  if (!errors.available_positions && (isNaN(positions) || positions < 1)) {
    errors.available_positions = 'Must be at least 1.';
  }

  const deadline = formData.get('application_deadline');
  if (!errors.application_deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    errors.application_deadline = 'Please select a valid date.';
  }

  return errors;
}

function showFormErrors(errors) {
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => el.classList.remove('error'));

  Object.entries(errors).forEach(([field, msg]) => {
    const errEl = document.getElementById(`err-${field}`);
    const inputEl = document.getElementById(`f-${field}`);
    if (errEl) errEl.textContent = msg;
    if (inputEl) inputEl.classList.add('error');
  });

  // Focus first error field
  const firstError = Object.keys(errors)[0];
  document.getElementById(`f-${firstError}`)?.focus();
}

function getFormPayload(formData) {
  return {
    title: formData.get('title').trim(),
    description: formData.get('description').trim(),
    research_area: formData.get('research_area').trim(),
    faculty_name: formData.get('faculty_name').trim(),
    department: formData.get('department').trim(),
    required_skills: formData.get('required_skills').trim(),
    available_positions: parseInt(formData.get('available_positions')),
    application_deadline: formData.get('application_deadline'),
    status: formData.get('status') || 'Open',
  };
}

// ── CREATE HANDLER ────────────────────────────────────────────────────────
async function handleCreate(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const errors = validateForm(formData);

  if (Object.keys(errors).length > 0) {
    showFormErrors(errors);
    return;
  }

  const submitBtn = document.getElementById('form-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';

  try {
    const { ok, data } = await apiFetch('/opportunities', {
      method: 'POST',
      body: JSON.stringify(getFormPayload(formData)),
    });
    if (!ok) throw new Error(data.message || 'Creation failed');
    closeModal();
    showToast('Research opportunity created successfully! 🎉', 'success');
    await fetchOpportunities();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Opportunity';
  }
}

// ── EDIT HANDLER ──────────────────────────────────────────────────────────
async function handleEdit(e, id) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const errors = validateForm(formData);

  if (Object.keys(errors).length > 0) {
    showFormErrors(errors);
    return;
  }

  const submitBtn = document.getElementById('form-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const { ok, data } = await apiFetch(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(getFormPayload(formData)),
    });
    if (!ok) throw new Error(data.message || 'Update failed');
    closeModal();
    showToast('Opportunity updated successfully! ✓', 'success');
    await fetchOpportunities();
    if (currentDetailId === id) {
      const updated = allOpportunities.find(o => o.id === id);
      if (updated) renderDetailContent(updated);
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────
function openDeleteConfirm(id, e) {
  if (e) e.stopPropagation();
  const opp = allOpportunities.find(o => o.id === id);
  if (!opp) return;

  const html = `
    <div class="confirm-modal">
      <div class="confirm-icon">⚠️</div>
      <h2 class="confirm-title">Delete Opportunity</h2>
      <p class="confirm-text">
        Are you sure you want to permanently delete<br/>
        <span class="confirm-name">"${escapeHtml(opp.title)}"</span>?<br/>
        This action cannot be undone.
      </p>
      <div class="form-actions" style="justify-content:center">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-btn" onclick="handleDelete(${id})">
          Delete Permanently
        </button>
      </div>
    </div>
  `;
  openModal(html);
}

async function handleDelete(id) {
  const btn = document.getElementById('confirm-delete-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Deleting...'; }

  try {
    const { ok, data } = await apiFetch(`/opportunities/${id}`, { method: 'DELETE' });
    if (!ok) throw new Error(data.message || 'Delete failed');
    closeModal();
    if (currentDetailId === id) closeDetail();
    showToast('Opportunity deleted successfully.', 'success');
    await fetchOpportunities();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Delete Permanently'; }
  }
}

// ── UTILITY ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Debounce for search
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────
btnNewOpportunity.addEventListener('click', openCreateModal);
modalClose.addEventListener('click', closeModal);
detailClose.addEventListener('click', closeDetail);

detailEditBtn.addEventListener('click', () => {
  if (currentDetailId) openEditModal(currentDetailId);
});
detailDeleteBtn.addEventListener('click', () => {
  if (currentDetailId) openDeleteConfirm(currentDetailId);
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilters();
  });
});

// Search
searchInput.addEventListener('input', debounce((e) => {
  currentSearch = e.target.value;
  applyFilters();
}, 300));

// Area filter
areaFilter.addEventListener('change', (e) => {
  currentArea = e.target.value;
  applyFilters();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modalOverlay.classList.contains('hidden')) closeModal();
    else if (detailPanel.classList.contains('open')) closeDetail();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

// Expose functions to window for inline event handlers
window.openDetail = openDetail;
window.openEditModal = openEditModal;
window.openDeleteConfirm = openDeleteConfirm;
window.closeModal = closeModal;
window.handleDelete = handleDelete;
window.toggleStatus = toggleStatus;

// ── INIT ──────────────────────────────────────────────────────────────────
fetchOpportunities();
