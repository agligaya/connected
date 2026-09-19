const API_URL = `${window.location.origin}/api`;
let SCHOOL_YEAR = '2025-2026';
let CURRENT_QUARTER = 'Q1';
let UNLOCKED_QUARTERS = ['Q1'];
let lastAccountsData = [];
let lastStudentsData = [];
let currentAccountRoleFilter = 'all';
let currentAccountStatusFilter = 'active';
let currentAccountSearch = '';
let currentAccountSort = 'az'; // az | recent
let accountSortMenuApi = null;

function normalizeQuarterClient(value) {
  const q = String(value || 'Q1').toUpperCase();
  return ['Q1', 'Q2', 'Q3', 'Q4'].includes(q) ? q : 'Q1';
}

/** Fill a <select> with unlocked quarters only (future quarters stay inaccessible). */
function fillUnlockedQuarterSelect(selectEl, preferred) {
  if (!selectEl) return null;
  const unlocked = (UNLOCKED_QUARTERS || ['Q1']).map(normalizeQuarterClient);
  const list = unlocked.length ? unlocked : [normalizeQuarterClient(CURRENT_QUARTER || 'Q1')];
  const want = normalizeQuarterClient(preferred || teacherCurrentQuarter || CURRENT_QUARTER || list[list.length - 1]);
  const selected = list.includes(want) ? want : list[list.length - 1];
  selectEl.innerHTML = list.map((q) =>
    `<option value="${q}">${q}${q === normalizeQuarterClient(CURRENT_QUARTER) ? ' (current)' : ''}</option>`
  ).join('');
  selectEl.value = selected;
  return selected;
}

function refreshUnlockedQuarterSelects() {
  fillUnlockedQuarterSelect(document.getElementById('qb-exam-quarter'));
  fillUnlockedQuarterSelect(document.getElementById('qb-create-quarter'));
  fillUnlockedQuarterSelect(document.getElementById('ai-approve-quarter'));
}

function applyQuarterUnlockUI() {
  const unlocked = new Set((UNLOCKED_QUARTERS || ['Q1']).map(normalizeQuarterClient));
  document.querySelectorAll('#teacher-quarter-list [data-quarter]').forEach(chip => {
    const q = normalizeQuarterClient(chip.dataset.quarter);
    const isUnlocked = unlocked.has(q);
    chip.hidden = !isUnlocked;
    if (!isUnlocked) chip.classList.remove('active');
  });

  if (!unlocked.has(normalizeQuarterClient(teacherCurrentQuarter))) {
    teacherCurrentQuarter = CURRENT_QUARTER || 'Q1';
  }

  document.querySelectorAll('#teacher-quarter-list [data-quarter]').forEach(chip => {
    chip.classList.toggle('active', normalizeQuarterClient(chip.dataset.quarter) === normalizeQuarterClient(teacherCurrentQuarter));
  });

  const note = document.getElementById('progress-quarter-note');
  if (note) {
    note.textContent = '';
    note.hidden = true;
  }

  const help = document.getElementById('admin-quarter-help');
  if (help) {
    help.textContent = CURRENT_QUARTER === 'Q4'
      ? 'All quarters are unlocked for Progress records.'
      : `Teachers can record Progress through ${CURRENT_QUARTER}.`;
  }

  const select = document.getElementById('admin-current-quarter');
  if (select) select.value = CURRENT_QUARTER;

  refreshUnlockedQuarterSelects();
}

async function loadAppConfig() {
  try {
    const res = await fetch(`${API_URL}/config`);
    const data = await res.json();
    if (data.schoolYear) {
      SCHOOL_YEAR = data.schoolYear;
      const yearEl = document.getElementById('teacher-school-year-label');
      if (yearEl) yearEl.textContent = SCHOOL_YEAR;
    }
    CURRENT_QUARTER = normalizeQuarterClient(data.currentQuarter || 'Q1');
    UNLOCKED_QUARTERS = Array.isArray(data.unlockedQuarters) && data.unlockedQuarters.length
      ? data.unlockedQuarters.map(normalizeQuarterClient)
      : ['Q1'];
    if (typeof teacherCurrentQuarter !== 'undefined') {
      if (!UNLOCKED_QUARTERS.includes(normalizeQuarterClient(teacherCurrentQuarter))) {
        teacherCurrentQuarter = CURRENT_QUARTER;
      }
    }
    applyQuarterUnlockUI();
  } catch (err) {
    console.error('Load config error:', err);
  }
}

function getAuthToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function getAuthUser() {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function authUserStore() {
  if (localStorage.getItem('token')) return localStorage;
  if (sessionStorage.getItem('token')) return sessionStorage;
  return localStorage;
}

function saveAuth(token, user, persist) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  const store = persist ? localStorage : sessionStorage;
  store.setItem('token', token);
  store.setItem('user', JSON.stringify(user));

  if (persist) localStorage.setItem('rememberMe', '1');
  else localStorage.setItem('rememberMe', '0');
}

function persistAuthUser(user) {
  authUserStore().setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

function applyLoggedInUser(user) {
  if (!user) return;

  if (!user.first_name && !user.last_name && user.name) {
    const parts = String(user.name).split(' ');
    user.first_name = parts[0] || '';
    user.last_name = parts.slice(1).join(' ') || '';
  }

  const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = displayName;
  });
  document.querySelectorAll('[data-user-initial]').forEach(el => {
    el.textContent = initial;
    el.style.display = 'flex';
  });

  document.querySelectorAll('[data-topbar-avatar]').forEach(avatarImg => {
    const initialSpan = avatarImg.nextElementSibling;
    if (user.avatar_url) {
      avatarImg.src = user.avatar_url + '?t=' + Date.now();
      avatarImg.style.display = 'block';
      if (initialSpan) initialSpan.style.display = 'none';
    } else {
      avatarImg.removeAttribute('src');
      avatarImg.src = '';
      avatarImg.style.display = 'none';
      if (initialSpan) initialSpan.style.display = 'flex';
    }
  });

  const firstInput = document.getElementById('admin-profile-first');
  const lastInput = document.getElementById('admin-profile-last');
  const emailInput = document.getElementById('admin-profile-email');
  if (firstInput) firstInput.value = user.first_name || '';
  if (lastInput) lastInput.value = user.last_name || '';
  if (emailInput) emailInput.value = user.email || '';
}

function clearUserAvatars() {
  document.querySelectorAll('[data-topbar-avatar]').forEach(avatarImg => {
    avatarImg.removeAttribute('src');
    avatarImg.src = '';
    avatarImg.style.display = 'none';
    const initialSpan = avatarImg.nextElementSibling;
    if (initialSpan) {
      initialSpan.textContent = '?';
      initialSpan.style.display = 'flex';
    }
  });
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = 'User';
  });
}

function enterPortal(user) {
  applyLoggedInUser(user);
  if (user.role === 'admin') switchView('admin');
  else if (user.role === 'teacher') switchView('teacher');
  else if (user.role === 'parent') switchView('parent');
  maybeForcePasswordChange(user);
}

// ========== VIEW ROUTER ==========
function switchView(viewName) {
  document.querySelectorAll('.app-view').forEach(view => {
    view.hidden = view.dataset.view !== viewName;
  });
  document.body.setAttribute('data-view', viewName);
}

// ========== LOGIN ==========
document.getElementById('login-signin-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember')?.checked !== false;
  const msgEl = document.getElementById('login-message');

  if (!email || !password) {
    msgEl.textContent = 'Please enter email and password';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    const existingUser = getAuthUser() || {};
    const mergedUser = { ...existingUser };

    if (data.user) {
      Object.keys(data.user).forEach(key => {
        if (data.user[key] !== undefined && data.user[key] !== null) {
          mergedUser[key] = data.user[key];
        }
      });
    }

    if (!mergedUser.name && (mergedUser.first_name || mergedUser.last_name)) {
      mergedUser.name = `${mergedUser.first_name || ''} ${mergedUser.last_name || ''}`.trim();
    }
    if (!mergedUser.first_name && !mergedUser.last_name && mergedUser.name) {
      const parts = mergedUser.name.split(' ');
      mergedUser.first_name = parts[0] || '';
      mergedUser.last_name = parts.slice(1).join(' ') || '';
    }

    saveAuth(data.token, mergedUser, remember);
    enterPortal(mergedUser);
    loadUserProfile();

  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.style.color = '#b71c1c';
  }
});

document.getElementById('login-password')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-signin-btn')?.click();
});
document.getElementById('login-email')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-signin-btn')?.click();
});

// ========== LOGOUT ==========
document.querySelectorAll('[data-action="logout"]').forEach(btn => {
  btn.addEventListener('click', () => {
    clearAuth();
    clearUserAvatars();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    const rememberEl = document.getElementById('login-remember');
    if (rememberEl) rememberEl.checked = true;
    switchView('login');
  });
});

// ========== PASSWORD TOGGLE ==========
function resetPasswordFieldVisibility(inputId) {
  const input = document.getElementById(inputId);
  const btn = document.querySelector(`[data-password-toggle="${inputId}"]`);
  if (!input) return;
  input.type = 'password';
  if (btn) {
    btn.textContent = '👁';
    btn.setAttribute('aria-label', btn.dataset.showLabel || 'Show password');
  }
}

function resetChangePasswordFields() {
  ['cp-current', 'cp-new', 'cp-confirm'].forEach(resetPasswordFieldVisibility);
}

document.getElementById('toggle-password')?.addEventListener('click', (e) => {
  const input = document.getElementById('login-password');
  input.type = input.type === 'password' ? 'text' : 'password';
  e.currentTarget.textContent = input.type === 'password' ? '👁' : '🙈';
  e.currentTarget.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
});

document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const inputId = btn.getAttribute('data-password-toggle');
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
    btn.setAttribute(
      'aria-label',
      input.type === 'password'
        ? (btn.dataset.showLabel || 'Show password')
        : (btn.dataset.hideLabel || 'Hide password')
    );
  });
});

const forgotModal = document.getElementById('forgot-password-modal');
document.getElementById('forgot-password-btn')?.addEventListener('click', () => {
  forgotModal?.removeAttribute('hidden');
});
document.getElementById('forgot-password-close')?.addEventListener('click', () => {
  forgotModal?.setAttribute('hidden', '');
});
forgotModal?.addEventListener('click', (e) => {
  if (e.target.id === 'forgot-password-modal') forgotModal.setAttribute('hidden', '');
});

// ========== ON LOAD: Restore previous session ==========
window.addEventListener('DOMContentLoaded', async () => {
  await loadAppConfig();

  const rememberEl = document.getElementById('login-remember');
  if (rememberEl) {
    rememberEl.checked = localStorage.getItem('rememberMe') !== '0';
  }

  const token = getAuthToken();
  const user = getAuthUser();
  if (!token || !user?.role) return;

  enterPortal(user);

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      clearAuth();
      switchView('login');
      return;
    }
    await loadUserProfile();
  } catch (err) {
    console.error('Session restore error:', err);
  }
});

// ========== ADMIN SETTINGS DROPDOWN ==========
const adminAvatarBtn = document.getElementById('admin-avatar-btn');
const adminSettingsDropdown = document.getElementById('admin-settings-dropdown');

if (adminAvatarBtn && adminSettingsDropdown) {
  adminAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = adminSettingsDropdown.hasAttribute('hidden');
    if (isHidden) {
      adminSettingsDropdown.removeAttribute('hidden');
    } else {
      adminSettingsDropdown.setAttribute('hidden', '');
    }
  });

  document.addEventListener('click', (e) => {
    if (!adminSettingsDropdown.contains(e.target) && e.target !== adminAvatarBtn) {
      adminSettingsDropdown.setAttribute('hidden', '');
    }
  });
}

const teacherAvatarBtn = document.getElementById('teacher-avatar-btn');
const teacherSettingsDropdown = document.getElementById('teacher-settings-dropdown');
if (teacherAvatarBtn && teacherSettingsDropdown) {
  teacherAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = teacherSettingsDropdown.hasAttribute('hidden');
    if (isHidden) teacherSettingsDropdown.removeAttribute('hidden');
    else teacherSettingsDropdown.setAttribute('hidden', '');
  });
  document.addEventListener('click', (e) => {
    if (!teacherSettingsDropdown.contains(e.target) && e.target !== teacherAvatarBtn) {
      teacherSettingsDropdown.setAttribute('hidden', '');
    }
  });
}

const parentAvatarBtn = document.getElementById('parent-avatar-btn');
const parentSettingsDropdown = document.getElementById('parent-settings-dropdown');
if (parentAvatarBtn && parentSettingsDropdown) {
  parentAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = parentSettingsDropdown.hasAttribute('hidden');
    if (isHidden) parentSettingsDropdown.removeAttribute('hidden');
    else parentSettingsDropdown.setAttribute('hidden', '');
  });
  document.addEventListener('click', (e) => {
    if (!parentSettingsDropdown.contains(e.target) && e.target !== parentAvatarBtn) {
      parentSettingsDropdown.setAttribute('hidden', '');
    }
  });
}

// ========== HELPERS ==========
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function loadUserProfile() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;

    const fresh = await res.json();
    if (!fresh || !fresh.id) return;

    const stored = getAuthUser() || {};
    const merged = { ...stored, ...fresh };
    if (fresh.name && (!stored.name || stored.name !== fresh.name)) {
      merged.name = fresh.name;
    }
    persistAuthUser(merged);
    applyLoggedInUser(merged);
    maybeForcePasswordChange(merged);
  } catch (err) {
    console.error('loadUserProfile error:', err);
  }
}


// ========== ADMIN ACCOUNTS ==========
const roleSelect = document.getElementById('admin-account-role');
const teacherFields = document.getElementById('teacher-fields');
const parentFields = document.getElementById('parent-fields');

function toggleRoleFields() {
  const role = roleSelect?.value;
  if (!teacherFields) return;

  if (role === 'teacher') {
    teacherFields.style.display = 'block';
    parentFields.style.display = 'none';
    // Reset checkboxes when switching to teacher
    document.getElementById('teacher-role-class-adviser').checked = false;
    document.getElementById('teacher-role-subject-teacher').checked = false;
    toggleClassAdviserFields();
    toggleSubjectTeacherFields();
  } else if (role === 'parent') {
    teacherFields.style.display = 'none';
    document.getElementById('class-adviser-fields').style.display = 'none';
    document.getElementById('subject-teacher-fields').style.display = 'none';
    parentFields.style.display = 'grid';
  } else {
    teacherFields.style.display = 'none';
    document.getElementById('class-adviser-fields').style.display = 'none';
    document.getElementById('subject-teacher-fields').style.display = 'none';
    parentFields.style.display = 'none';
  }
}

window.toggleClassAdviserFields = function() {
  const checked = document.getElementById('teacher-role-class-adviser')?.checked;
  const caFields = document.getElementById('class-adviser-fields');
  if (caFields) caFields.style.display = checked ? 'grid' : 'none';
  if (checked) loadClassAdviserSections();
};

window.toggleSubjectTeacherFields = function() {
  const checked = document.getElementById('teacher-role-subject-teacher')?.checked;
  const stFields = document.getElementById('subject-teacher-fields');
  const container = document.getElementById('subject-assignments-container');
  if (stFields) stFields.style.display = checked ? 'block' : 'none';
  if (checked && container && container.children.length === 0) {
    addSubjectAssignment();
  }
};

window.loadClassAdviserSections = async function() {
  const gradeSelect = document.getElementById('class-adviser-grade');
  const sectionSelect = document.getElementById('class-adviser-section');
  const newInput = document.getElementById('class-adviser-new-section');
  if (!gradeSelect || !sectionSelect) return;

  // Reset
  sectionSelect.style.display = 'block';
  if (newInput) { newInput.style.display = 'none'; newInput.value = ''; }

  const grade = gradeSelect.value;
  if (!grade) {
    sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
    sectionSelect.disabled = true;
    loadClassAdviserSubjects();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${grade}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    let html = '<option value="">-- Select Section --</option>';
    if (sections.length > 0) {
      html += sections.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    html += '<option value="__NEW__">— Add New Section —</option>';

    sectionSelect.innerHTML = html;
    sectionSelect.disabled = false;
  } catch (err) {
    console.error('Load sections error:', err);
    sectionSelect.innerHTML = '<option value="">Failed to load</option><option value="__NEW__">— Add New Section —</option>';
    sectionSelect.disabled = false;
  }
  loadClassAdviserSubjects();
};

// Load subject checkboxes for Class Adviser (Grades 4-6 only)
window.loadClassAdviserSubjects = async function() {
  const gradeSelect = document.getElementById('class-adviser-grade');
  const wrap = document.getElementById('class-adviser-subjects-wrap');
  const list = document.getElementById('class-adviser-subjects-list');
  if (!gradeSelect || !wrap || !list) return;

  const grade = gradeSelect.value;
  const isUpperGrade = ['4', '5', '6'].includes(grade);
  const isLowerGrade = ['1', '2', '3'].includes(grade);
  const autoNote = document.getElementById('class-adviser-auto-note');
  if (autoNote) autoNote.style.display = isLowerGrade ? 'block' : 'none';

  if (!isUpperGrade) {
    wrap.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  wrap.style.display = 'block';
  list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">Loading subjects...</span>';

  try {
    const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();
    if (!res.ok) throw new Error(subjects.error);

    const applicable = subjects.filter(s => {
      if (!s.applicable_grades) return false;
      const ag = String(s.applicable_grades).trim();
      const g = parseInt(grade, 10);
      const rangeMatch = ag.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        return g >= start && g <= end;
      }
      if (ag.includes(',')) {
        return ag.split(',').map(x => parseInt(x.trim(), 10)).includes(g);
      }
      return parseInt(ag, 10) === g;
    });

    if (!applicable.length) {
      list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">No subjects found for this grade.</span>';
      return;
    }

    list.innerHTML = applicable.map(s => `
      <label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-maroon);cursor:pointer;font-size:0.9rem;width:100%;box-sizing:border-box;">
        <input type="checkbox" class="ca-subject-checkbox" value="${s.id}" style="width:18px;height:18px;cursor:pointer;flex-shrink:0;">
        <span style="font-size:0.76rem;color:var(--text-muted);font-weight:400;">${s.name || s.subject_name || s.NAME || 'Unnamed'}</span>
      </label>
    `).join('');

  } catch (err) {
    console.error('Load class adviser subjects error:', err);
    list.innerHTML = '<span style="color:#b71c1c;font-size:0.8rem;">Failed to load subjects.</span>';
  }
};

// Hybrid section handler: toggles between dropdown and text input
window.handleSectionSelect = function(selectEl, inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + '-error');
  if (!input) return;

  if (selectEl.value === '__NEW__') {
    selectEl.style.display = 'none';
    input.style.display = 'block';
    input.focus();
    if (errorEl) errorEl.style.display = 'none';
  } else {
    input.style.display = 'none';
    input.value = '';
    if (errorEl) errorEl.style.display = 'none';
  }
};

// Validate section name: not empty, no duplicates, valid chars, max length
window.validateSectionName = function(name, existingSections, errorElId) {
  const errorEl = document.getElementById(errorElId);
  const normalized = name.trim().toUpperCase();

  if (!normalized) {
    if (errorEl) { errorEl.textContent = 'Section name is required'; errorEl.style.display = 'block'; }
    return null;
  }
  if (normalized.length > 10) {
    if (errorEl) { errorEl.textContent = 'Section name too long (max 10 characters)'; errorEl.style.display = 'block'; }
    return null;
  }
  if (!/^[A-Z0-9-]+$/.test(normalized)) {
    if (errorEl) { errorEl.textContent = 'Only letters, numbers, and hyphens allowed'; errorEl.style.display = 'block'; }
    return null;
  }
  if (existingSections && existingSections.includes(normalized)) {
    if (errorEl) { errorEl.textContent = `Section '${normalized}' already exists for this grade`; errorEl.style.display = 'block'; }
    return null;
  }
  if (errorEl) errorEl.style.display = 'none';
  return normalized;
};

let subjectCounter = 0;

window.addSubjectAssignment = async function() {
  subjectCounter++;
  const container = document.getElementById('subject-assignments-container');
  if (!container) return;

  const rowId = `subject-row-${subjectCounter}`;

  // Load subjects for dropdown
  let subjectOptions = '<option value="">-- Select Subject --</option>';
  try {
    const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();
    if (res.ok && Array.isArray(subjects)) {
      subjectOptions += subjects.map(s => 
        `<option value="${s.id}">${s.subject_name || s.name || 'Unnamed'}</option>`
      ).join('');
    }
  } catch (err) {
    console.error('Load subjects error:', err);
  }

  const row = document.createElement('div');
  row.id = rowId;
  row.className = 'form-row';
  row.style.cssText = 'align-items:end;gap:10px;margin-bottom:8px;padding:10px;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;';
  row.innerHTML = `
    <div class="field-small" style="flex:1.5;">
      <label>Subject</label>
      <select class="subject-id-select" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
        ${subjectOptions}
      </select>
    </div>
    <div class="field-small" style="flex:1;">
      <label>Grade Level</label>
      <select class="subject-grade-select" onchange="loadSubjectSections(this)" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
        <option value="">-- Select --</option>
        <option value="4">Grade 4</option>
        <option value="5">Grade 5</option>
        <option value="6">Grade 6</option>
      </select>
    </div>
    <div class="field-small" style="flex:1;">
      <label>Section</label>
      <div class="subject-section-wrap">
        <select class="subject-section-select" disabled onchange="handleSubjectSectionSelect(this, '${rowId}')" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
          <option value="">-- Select Grade First --</option>
        </select>
      </div>
      <input type="text" class="subject-new-section" placeholder="e.g., A, Bonifacio" style="display:none;width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;margin-top:4px;" maxlength="10">
      <small class="subject-section-error" style="color:#b71c1c;font-size:0.75rem;display:none;"></small>
    </div>
    <button type="button" class="chip-ghost" onclick="removeSubjectAssignment('${rowId}')" style="color:#b71c1c;border-color:#b71c1c;height:fit-content;padding:6px 10px;">Remove</button>
  `;
  container.appendChild(row);
}

window.removeSubjectAssignment = function(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
};

window.loadSubjectSections = async function(gradeSelect) {
  const row = gradeSelect.closest('.form-row');
  const sectionSelect = row.querySelector('.subject-section-select');
  const newInput = row.querySelector('.subject-new-section');
  const grade = gradeSelect.value;

  // Reset
  sectionSelect.style.display = 'block';
  if (newInput) { newInput.style.display = 'none'; newInput.value = ''; }

  if (!grade) {
    sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
    sectionSelect.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${grade}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    let html = '<option value="">-- Select Section --</option>';
    if (sections.length > 0) {
      html += sections.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    html += '<option value="__NEW__">— Add New Section —</option>';

    sectionSelect.innerHTML = html;
    sectionSelect.disabled = false;
  } catch (err) {
    console.error('Load sections error:', err);
    sectionSelect.innerHTML = '<option value="">Failed to load</option><option value="__NEW__">— Add New Section —</option>';
    sectionSelect.disabled = false;
  }
};

// Handle subject section select change
window.handleSubjectSectionSelect = function(selectEl, rowId) {
  const row = document.getElementById(rowId);
  const input = row.querySelector('.subject-new-section');
  const errorEl = row.querySelector('.subject-section-error');
  if (!input) return;

  if (selectEl.value === '__NEW__') {
    selectEl.style.display = 'none';
    input.style.display = 'block';
    input.focus();
    if (errorEl) errorEl.style.display = 'none';
  } else {
    input.style.display = 'none';
    input.value = '';
    if (errorEl) errorEl.style.display = 'none';
  }
};

roleSelect?.addEventListener('change', toggleRoleFields);
toggleRoleFields();


// loadTeacherSubjectsDropdown removed — subjects now loaded per-row in addSubjectAssignment()

// Create account form submit
document.getElementById('admin-account-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    first_name: document.getElementById('admin-account-first').value.trim(),
    last_name: document.getElementById('admin-account-last').value.trim(),
    email: document.getElementById('admin-account-email').value.trim(),
    phone: document.getElementById('admin-account-phone').value.trim(),
    password: document.getElementById('admin-account-password').value,
    role: roleSelect.value
  };

  // Email validation based on role
  if (payload.role === 'teacher') {
    if (!payload.email.endsWith('@usant.edu.ph')) {
      alert('Teachers must use a school email ending with @usant.edu.ph');
      return;
    }
  } else if (payload.role === 'parent') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      alert('Please enter a valid email address for the parent');
      return;
    }
    payload.address = document.getElementById('admin-account-address')?.value.trim() || null;
    payload.emergency_contact = document.getElementById('admin-account-emergency')?.value.trim() || null;
  }

  if (payload.role === 'teacher') {
    const isClassAdviser = document.getElementById('teacher-role-class-adviser')?.checked;
    const isSubjectTeacher = document.getElementById('teacher-role-subject-teacher')?.checked;

    if (!isClassAdviser && !isSubjectTeacher) {
      alert('Please select at least one teaching role (Class Adviser or Subject Teacher)');
      return;
    }

    payload.is_class_adviser = isClassAdviser;
    payload.is_subject_teacher = isSubjectTeacher;

    if (isClassAdviser) {
      payload.class_adviser_grade = document.getElementById('class-adviser-grade')?.value;
      const caSectionSelect = document.getElementById('class-adviser-section');
      const caSectionNew = document.getElementById('class-adviser-new-section');

      // Get section from either dropdown or text input
      if (caSectionSelect?.value === '__NEW__') {
        payload.class_adviser_section = validateSectionName(
          caSectionNew?.value || '',
          null,
          'class-adviser-section-error'
        );
      } else {
        payload.class_adviser_section = caSectionSelect?.value || null;
      }

      // Collect selected subjects for Grades 4-6
      const isUpperGrade = ['4', '5', '6'].includes(String(payload.class_adviser_grade));
      if (isUpperGrade) {
        const checkedSubjects = Array.from(document.querySelectorAll('#class-adviser-subjects-list .ca-subject-checkbox:checked')).map(cb => parseInt(cb.value, 10));
        if (checkedSubjects.length > 0) {
          payload.class_adviser_subjects = checkedSubjects;
        }
      }

      if (!payload.class_adviser_grade || !payload.class_adviser_section) {
        if (!payload.class_adviser_section) {
          // validateSectionName already showed error, or section is empty
          const errorEl = document.getElementById('class-adviser-section-error');
          if (errorEl && errorEl.style.display !== 'block') {
            errorEl.textContent = 'Section is required';
            errorEl.style.display = 'block';
          }
        }
        return;
      }
    }

    if (isSubjectTeacher) {
      const rows = document.querySelectorAll('#subject-assignments-container > .form-row');
      const assignments = [];
      for (const row of rows) {
        const subjectId = row.querySelector('.subject-id-select')?.value;
        const grade = row.querySelector('.subject-grade-select')?.value;
        const sectionSelect = row.querySelector('.subject-section-select');
        const sectionNew = row.querySelector('.subject-new-section');
        const errorEl = row.querySelector('.subject-section-error');

        let section = null;
        if (sectionSelect?.value === '__NEW__') {
          section = validateSectionName(sectionNew?.value || '', null, errorEl?.id);
        } else {
          section = sectionSelect?.value || null;
        }

        if (subjectId && grade && section) {
          assignments.push({ subject_id: parseInt(subjectId), grade_level: parseInt(grade), section });
        }
      }
      if (assignments.length === 0) {
        alert('Subject Teacher must have at least one Grades 4–6 subject assignment');
        return;
      }
      payload.subject_assignments = assignments;
    }
  }

  try {
    const res = await fetch(`${API_URL}/admin/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account');

    alert('Account created successfully');
    e.target.reset();
    document.getElementById('subject-assignments-container').innerHTML = '';
    subjectCounter = 0;
    // Reset hybrid section fields
    const caNewSection = document.getElementById('class-adviser-new-section');
    const caSectionSelect = document.getElementById('class-adviser-section');
    if (caNewSection) { caNewSection.style.display = 'none'; caNewSection.value = ''; }
    if (caSectionSelect) { caSectionSelect.style.display = 'block'; caSectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>'; caSectionSelect.disabled = true; }
    const caError = document.getElementById('class-adviser-section-error');
    if (caError) caError.style.display = 'none';
    toggleRoleFields();
    closeAdminModal('add-account-modal', { reset: false });
    await refreshSchoolData({ accounts: true, teachers: true, parents: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

// ========== ADMIN: STUDENT ENROLLMENT ==========
document.getElementById('admin-student-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const lrnVal = document.getElementById('student-lrn').value.trim();
  if (lrnVal && lrnVal.length !== 12) {
    alert('LRN must be exactly 12 digits');
    return;
  }

  const payload = {
    lrn: lrnVal || null,
    first_name: document.getElementById('student-first').value.trim(),
    middle_name: document.getElementById('student-middle').value.trim() || null,
    last_name: document.getElementById('student-last').value.trim(),
    grade_level: document.getElementById('student-grade').value,
    section: document.getElementById('student-section').value,
    date_of_birth: document.getElementById('student-dob').value,
    dob: document.getElementById('student-dob').value || null,
    gender: document.getElementById('student-gender').value,
    parent_id: document.getElementById('student-parent').value || null,
    homeroom_teacher_id: document.getElementById('student-homeroom').value || null
  };

  try {
    const res = await fetch(`${API_URL}/admin/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to enroll student');

    alert('Student enrolled successfully');
    e.target.reset();
    document.getElementById('student-section').innerHTML = '<option value="">-- Select Grade First --</option>';
    document.getElementById('student-section').disabled = true;
    closeAdminModal('add-student-modal', { reset: false });
    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

// Load accounts table
async function loadAccountsTable() {
  const tbody = document.querySelector('#admin-accounts-table tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/admin/accounts`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // FIX #3: Hide system admin from the list
    lastAccountsData = Array.isArray(data) ? data.filter(u => u.role !== 'admin') : [];
    applyAccountFilters();

  } catch (err) {
    console.error('Load accounts error:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">Failed to load accounts</td></tr>`;
  }
}

function applyAccountFilters() {
  const tbody = document.querySelector('#admin-accounts-table tbody');
  if (!tbody) return;

  // Highlight active role filter buttons
  document.querySelectorAll('[data-account-filter]').forEach(btn => {
    btn.classList.toggle('primary', btn.dataset.accountFilter === currentAccountRoleFilter);
  });

  // Highlight active status filter buttons
  document.querySelectorAll('[data-account-status]').forEach(btn => {
    btn.classList.toggle('primary', btn.dataset.accountStatus === currentAccountStatusFilter);
  });

  let filtered = lastAccountsData;

  // Apply role filter
  if (currentAccountRoleFilter !== 'all') {
    filtered = filtered.filter(u => u.role === currentAccountRoleFilter);
  }

  // Apply status filter
  if (currentAccountStatusFilter !== 'all') {
    filtered = filtered.filter(u => u.status === currentAccountStatusFilter);
  }

  // Apply search (name or email)
  const q = String(currentAccountSearch || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((u) => {
      const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }

  // Sort
  filtered = [...filtered];
  if (currentAccountSort === 'recent') {
    filtered.sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      if (tb !== ta) return tb - ta;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  } else {
    filtered.sort((a, b) => {
      const ln = String(a.last_name || '').localeCompare(String(b.last_name || ''), undefined, { sensitivity: 'base' });
      if (ln !== 0) return ln;
      return String(a.first_name || '').localeCompare(String(b.first_name || ''), undefined, { sensitivity: 'base' });
    });
  }

  if (!filtered.length) {
    const statusLabel = currentAccountStatusFilter === 'active' ? 'active ' : currentAccountStatusFilter === 'inactive' ? 'inactive ' : '';
    const roleLabel = currentAccountRoleFilter === 'all' ? 'accounts' : currentAccountRoleFilter + 's';
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">No ${statusLabel}${roleLabel} found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => `
    <tr style="${u.status === 'inactive' ? 'opacity:0.6;background:#f9f9f9;' : ''}">
      <td>${u.role === 'teacher' 
        ? `<span class="clickable-name" onclick="openTeacherDetailModal(${u.id})" style="cursor:pointer;color:var(--maroon);text-decoration:underline;font-weight:600;">${u.first_name} ${u.last_name}</span>`
        : u.role === 'parent'
        ? `<span class="clickable-name" onclick="openParentDetailModal(${u.id})" style="cursor:pointer;color:var(--maroon);text-decoration:underline;font-weight:600;">${u.first_name} ${u.last_name}</span>`
        : `${u.first_name} ${u.last_name}`}</td>
      <td>${u.email}</td>
      <td>${formatActivityRole(u.role)}</td>
      <td>
        ${u.role === 'teacher' 
          ? (u.teaching_mode === 'class_adviser' || (u.teaching_mode === 'homeroom')
              ? `Class Adviser — Grade ${u.homeroom_grade || '?'}-${u.homeroom_section || '?'}` 
              : u.teaching_mode === 'subject_teacher' || u.teaching_mode === 'subject'
              ? 'Subject Teacher'
              : u.teaching_mode === 'both'
              ? `Both — Grade ${u.homeroom_grade || '?'}-${u.homeroom_section || '?'} + Subjects`
              : (u.homeroom_grade && u.homeroom_section)
              ? `Class Adviser — Grade ${u.homeroom_grade}-${u.homeroom_section}`
              : (u.assignments && u.assignments.some(a => a.subject_id !== null))
              ? 'Subject Teacher'
              : 'Teacher — No assignments set')
          : (u.emergency_contact
              ? `Emergency: ${u.emergency_contact}`
              : u.phone
              ? `Phone: ${u.phone}`
              : u.address
              ? u.address
              : '-')}
      </td>
      <td>${statusBadgeHtml(u.status)}</td>
    </tr>
  `).join('');
}


// FIX #5: Add confirmation before deactivating/activating
let editSubjectCounter = 0;
let currentEditTeacherId = null;

// ========== EDIT TEACHER ASSIGNMENTS MODAL ==========
window.openEditTeacherModal = async function(teacherId) {
  currentEditTeacherId = teacherId;
  const modal = document.getElementById('edit-teacher-modal');
  const nameEl = document.getElementById('edit-teacher-name');
  const form = document.getElementById('edit-teacher-form');

  // Reset form
  form.reset();
  document.getElementById('edit-subject-assignments-container').innerHTML = '';
  editSubjectCounter = 0;
  document.getElementById('edit-class-adviser-fields').style.display = 'none';
  document.getElementById('edit-subject-teacher-fields').style.display = 'none';
  document.getElementById('edit-class-adviser-new-section').style.display = 'none';
  document.getElementById('edit-class-adviser-section-error').style.display = 'none';

  try {
    const res = await fetch(`${API_URL}/admin/accounts/${teacherId}`, { headers: getAuthHeaders() });
    const teacher = await res.json();
    if (!res.ok) throw new Error(teacher.error);

    nameEl.textContent = `Editing: ${teacher.first_name} ${teacher.last_name} (${teacher.email})`;
    document.getElementById('edit-teacher-id').value = teacherId;

    // Determine roles from teaching_mode
    const mode = teacher.teaching_mode;
    const isCA = mode === 'class_adviser' || mode === 'both' || mode === 'homeroom';
    const isST = mode === 'subject_teacher' || mode === 'both' || mode === 'subject';

    document.getElementById('edit-role-class-adviser').checked = isCA;
    document.getElementById('edit-role-subject-teacher').checked = isST;

    // Populate Class Adviser fields
    if (isCA) {
      document.getElementById('edit-class-adviser-fields').style.display = 'grid';
      if (teacher.homeroom_grade) {
        document.getElementById('edit-class-adviser-grade').value = teacher.homeroom_grade;
        await loadEditClassAdviserSections();
        // Set section after sections load
        setTimeout(() => {
          const sectionSelect = document.getElementById('edit-class-adviser-section');
          if (sectionSelect && teacher.homeroom_section) {
            const exists = Array.from(sectionSelect.options).some(o => o.value === teacher.homeroom_section);
            if (exists) {
              sectionSelect.value = teacher.homeroom_section;
            } else {
              sectionSelect.value = '__NEW__';
              handleSectionSelect(sectionSelect, 'edit-class-adviser-new-section');
              document.getElementById('edit-class-adviser-new-section').value = teacher.homeroom_section;
            }
          }
        }, 100);
        // Pre-select Class Adviser subjects for Grades 4-6
        if (['4','5','6'].includes(String(teacher.homeroom_grade))) {
          const caSubjectIds = (teacher.assignments || [])
            .filter(a => a.subject_id !== null && String(a.grade_level) === String(teacher.homeroom_grade) && a.section === teacher.homeroom_section)
            .map(a => a.subject_id);
          setTimeout(() => loadEditClassAdviserSubjects(caSubjectIds), 150);
        }
      }
    }

    // Populate Subject Teacher fields
    if (isST && teacher.assignments) {
      document.getElementById('edit-subject-teacher-fields').style.display = 'block';
      // Filter out class adviser assignments (subject_id IS NULL)
      const subjectAssignments = teacher.assignments.filter(a => a.subject_id !== null);
      for (const assignment of subjectAssignments) {
        await addEditSubjectAssignment(assignment);
      }
      if (subjectAssignments.length === 0) {
        await addEditSubjectAssignment();
      }
    }

    modal.removeAttribute('hidden');

  } catch (err) {
    alert('Failed to load teacher data: ' + err.message);
  }
};

window.toggleEditClassAdviser = function() {
  const checked = document.getElementById('edit-role-class-adviser')?.checked;
  const caFields = document.getElementById('edit-class-adviser-fields');
  if (caFields) {
    caFields.style.display = checked ? 'grid' : 'none';
    if (checked) loadEditClassAdviserSections();
  }
};

window.toggleEditSubjectTeacher = function() {
  const checked = document.getElementById('edit-role-subject-teacher')?.checked;
  const stFields = document.getElementById('edit-subject-teacher-fields');
  const container = document.getElementById('edit-subject-assignments-container');
  if (stFields) stFields.style.display = checked ? 'block' : 'none';
  if (checked && container && container.children.length === 0) {
    addEditSubjectAssignment();
  }
};

window.loadEditClassAdviserSections = async function() {
  const gradeSelect = document.getElementById('edit-class-adviser-grade');
  const sectionSelect = document.getElementById('edit-class-adviser-section');
  const newInput = document.getElementById('edit-class-adviser-new-section');
  if (!gradeSelect || !sectionSelect) return;

  sectionSelect.style.display = 'block';
  if (newInput) { newInput.style.display = 'none'; newInput.value = ''; }

  const grade = gradeSelect.value;
  if (!grade) {
    sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
    sectionSelect.disabled = true;
    loadEditClassAdviserSubjects();
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${grade}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    let html = '<option value="">-- Select Section --</option>';
    if (sections.length > 0) {
      html += sections.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    html += '<option value="__NEW__">— Add New Section —</option>';

    sectionSelect.innerHTML = html;
    sectionSelect.disabled = false;
  } catch (err) {
    console.error('Load sections error:', err);
    sectionSelect.innerHTML = '<option value="">Failed to load</option><option value="__NEW__">— Add New Section —</option>';
    sectionSelect.disabled = false;
  }
  loadEditClassAdviserSubjects();
};

// Load subject checkboxes for Edit Class Adviser (Grades 4-6 only)
window.loadEditClassAdviserSubjects = async function(preselectedIds = []) {
  const gradeSelect = document.getElementById('edit-class-adviser-grade');
  const wrap = document.getElementById('edit-class-adviser-subjects-wrap');
  const list = document.getElementById('edit-class-adviser-subjects-list');
  if (!gradeSelect || !wrap || !list) return;

  const grade = gradeSelect.value;
  const isUpperGrade = ['4', '5', '6'].includes(grade);
  const isLowerGrade = ['1', '2', '3'].includes(grade);
  const autoNote = document.getElementById('edit-class-adviser-auto-note');
  if (autoNote) autoNote.style.display = isLowerGrade ? 'block' : 'none';

  if (!isUpperGrade) {
    wrap.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  wrap.style.display = 'block';
  list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">Loading subjects...</span>';

  try {
    const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();
    if (!res.ok) throw new Error(subjects.error);

    const applicable = subjects.filter(s => {
      if (!s.applicable_grades) return false;
      const ag = String(s.applicable_grades).trim();
      const g = parseInt(grade, 10);
      const rangeMatch = ag.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        return g >= start && g <= end;
      }
      if (ag.includes(',')) {
        return ag.split(',').map(x => parseInt(x.trim(), 10)).includes(g);
      }
      return parseInt(ag, 10) === g;
    });

    if (!applicable.length) {
      list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">No subjects found for this grade.</span>';
      return;
    }

    list.innerHTML = applicable.map(s => `
      <label style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-maroon);cursor:pointer;font-size:0.9rem;width:100%;box-sizing:border-box;">
        <input type="checkbox" class="edit-ca-subject-checkbox" value="${s.id}" ${preselectedIds.includes(s.id) ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;flex-shrink:0;">
        <span style="font-size:0.76rem;color:var(--text-muted);font-weight:400;">${s.name || s.subject_name || s.NAME || 'Unnamed'}</span>
      </label>
    `).join('');

  } catch (err) {
    console.error('Load edit class adviser subjects error:', err);
    list.innerHTML = '<span style="color:#b71c1c;font-size:0.8rem;">Failed to load subjects.</span>';
  }
};

window.addEditSubjectAssignment = async function(existing = null) {
  editSubjectCounter++;
  const container = document.getElementById('edit-subject-assignments-container');
  if (!container) return;

  const rowId = `edit-subject-row-${editSubjectCounter}`;

  // Load subjects for dropdown
  let subjectOptions = '<option value="">-- Select Subject --</option>';
  try {
    const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();
    if (res.ok && Array.isArray(subjects)) {
      subjectOptions += subjects.map(s => 
        `<option value="${s.id}" ${existing && existing.subject_id == s.id ? 'selected' : ''}>${s.subject_name || s.name || 'Unnamed'}</option>`
      ).join('');
    }
  } catch (err) {
    console.error('Load subjects error:', err);
  }

  const row = document.createElement('div');
  row.id = rowId;
  row.className = 'form-row';
  row.style.cssText = 'align-items:end;gap:10px;margin-bottom:8px;padding:10px;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;';
  row.innerHTML = `
    <div class="field-small" style="flex:1.5;">
      <label>Subject</label>
      <select class="subject-id-select" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
        ${subjectOptions}
      </select>
    </div>
    <div class="field-small" style="flex:1;">
      <label>Grade Level</label>
      <select class="subject-grade-select" onchange="loadSubjectSections(this)" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
        <option value="">-- Select --</option>
        <option value="4" ${existing && existing.grade_level == 4 ? 'selected' : ''}>Grade 4</option>
        <option value="5" ${existing && existing.grade_level == 5 ? 'selected' : ''}>Grade 5</option>
        <option value="6" ${existing && existing.grade_level == 6 ? 'selected' : ''}>Grade 6</option>
      </select>
    </div>
    <div class="field-small" style="flex:1;">
      <label>Section</label>
      <div class="subject-section-wrap">
        <select class="subject-section-select" disabled onchange="handleSubjectSectionSelect(this, '${rowId}')" style="width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;">
          <option value="">-- Select Grade First --</option>
        </select>
      </div>
      <input type="text" class="subject-new-section" placeholder="e.g., A, Bonifacio" style="display:none;width:100%;padding:6px;font-size:0.85rem;border:1px solid var(--border-maroon);border-radius:6px;margin-top:4px;" maxlength="10">
      <small class="subject-section-error" style="color:#b71c1c;font-size:0.75rem;display:none;"></small>
    </div>
    <button type="button" class="chip-ghost" onclick="removeSubjectAssignment('${rowId}')" style="color:#b71c1c;border-color:#b71c1c;height:fit-content;padding:6px 10px;">Remove</button>
  `;
  container.appendChild(row);

  // If existing data, load sections and set value
  if (existing && existing.grade_level) {
    const gradeSelect = row.querySelector('.subject-grade-select');
    setTimeout(async () => {
      await loadSubjectSections(gradeSelect);
      const sectionSelect = row.querySelector('.subject-section-select');
      if (sectionSelect && existing.section) {
        const exists = Array.from(sectionSelect.options).some(o => o.value === existing.section);
        if (exists) {
          sectionSelect.value = existing.section;
        } else {
          sectionSelect.value = '__NEW__';
          handleSubjectSectionSelect(sectionSelect, rowId);
          row.querySelector('.subject-new-section').value = existing.section;
        }
      }
    }, 100);
  }
};

// Modal close handlers
document.getElementById('edit-teacher-cancel')?.addEventListener('click', () => {
  document.getElementById('edit-teacher-modal')?.setAttribute('hidden', '');
});

// Close modal on overlay click
document.getElementById('edit-teacher-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'edit-teacher-modal') {
    document.getElementById('edit-teacher-modal').setAttribute('hidden', '');
  }
});

// Edit teacher form submit
document.getElementById('edit-teacher-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const teacherId = document.getElementById('edit-teacher-id').value;
  const isClassAdviser = document.getElementById('edit-role-class-adviser')?.checked;
  const isSubjectTeacher = document.getElementById('edit-role-subject-teacher')?.checked;

  if (!isClassAdviser && !isSubjectTeacher) {
    alert('Please select at least one teaching role');
    return;
  }

  const payload = {
    is_class_adviser: isClassAdviser,
    is_subject_teacher: isSubjectTeacher
  };

  if (isClassAdviser) {
    payload.class_adviser_grade = document.getElementById('edit-class-adviser-grade')?.value;
    const caSectionSelect = document.getElementById('edit-class-adviser-section');
    const caSectionNew = document.getElementById('edit-class-adviser-new-section');

    if (caSectionSelect?.value === '__NEW__') {
      payload.class_adviser_section = validateSectionName(
        caSectionNew?.value || '',
        null,
        'edit-class-adviser-section-error'
      );
    } else {
      payload.class_adviser_section = caSectionSelect?.value || null;
    }

    // Collect selected subjects for Grades 4-6
    const isUpperGrade = ['4', '5', '6'].includes(String(payload.class_adviser_grade));
    if (isUpperGrade) {
      const checkedSubjects = Array.from(document.querySelectorAll('#edit-class-adviser-subjects-list .edit-ca-subject-checkbox:checked')).map(cb => parseInt(cb.value, 10));
      if (checkedSubjects.length > 0) {
        payload.class_adviser_subjects = checkedSubjects;
      }
    }

    if (!payload.class_adviser_grade || !payload.class_adviser_section) {
      const errorEl = document.getElementById('edit-class-adviser-section-error');
      if (errorEl && errorEl.style.display !== 'block') {
        errorEl.textContent = 'Section is required';
        errorEl.style.display = 'block';
      }
      return;
    }
  }

  if (isSubjectTeacher) {
    const rows = document.querySelectorAll('#edit-subject-assignments-container > .form-row');
    const assignments = [];
    for (const row of rows) {
      const subjectId = row.querySelector('.subject-id-select')?.value;
      const grade = row.querySelector('.subject-grade-select')?.value;
      const sectionSelect = row.querySelector('.subject-section-select');
      const sectionNew = row.querySelector('.subject-new-section');
      const errorEl = row.querySelector('.subject-section-error');

      let section = null;
      if (sectionSelect?.value === '__NEW__') {
        section = validateSectionName(sectionNew?.value || '', null, errorEl?.id);
      } else {
        section = sectionSelect?.value || null;
      }

      if (subjectId && grade && section) {
        assignments.push({ subject_id: parseInt(subjectId), grade_level: parseInt(grade), section });
      }
    }
    if (assignments.length === 0) {
      alert('Subject Teacher must have at least one Grades 4–6 subject assignment');
      return;
    }
    payload.subject_assignments = assignments;
  }

  try {
    const res = await fetch(`${API_URL}/admin/accounts/${teacherId}/assignments`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update assignments');

    alert('Assignments updated successfully');
    document.getElementById('edit-teacher-modal').setAttribute('hidden', '');
    await refreshSchoolData({ accounts: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

function generateTempPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  (window.crypto || window.msCrypto).getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function fillTempPasswordInput(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return '';
  const pw = generateTempPassword();
  el.value = pw;
  return pw;
}

window.resetAccountPassword = async function(id) {
  const user = lastAccountsData.find(u => u.id === id);
  const label = user ? `${user.first_name} ${user.last_name}` : 'this account';
  const modal = document.getElementById('reset-password-modal');
  const subtitle = document.getElementById('reset-password-subtitle');
  const errEl = document.getElementById('reset-password-error');
  document.getElementById('reset-password-user-id').value = id;
  fillTempPasswordInput('reset-password-temp');
  if (subtitle) subtitle.textContent = `Set a temporary password for ${label}. They must change it after they sign in.`;
  if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
  modal?.removeAttribute('hidden');
};

window.toggleAccountStatus = async function(id, newStatus) {
  const action = newStatus === 'inactive' ? 'deactivate' : 'activate';
  const confirmMsg = newStatus === 'inactive' 
    ? 'Deactivate this account? The user will no longer be able to log in.'
    : 'Activate this account? The user will be able to log in again.';

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`${API_URL}/admin/accounts/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshSchoolData({ accounts: true, teachers: true, parents: true, overview: true });
    if (currentDetailAccountId === id) {
      currentDetailAccountStatus = newStatus;
      updateDetailStatusActionLabel(newStatus);
      if (currentDetailAccountRole === 'teacher') openTeacherDetailModal(id);
      else if (currentDetailAccountRole === 'parent') openParentDetailModal(id);
    }
  } catch (err) {
    alert(err.message);
  }
};

// ========== ADMIN: STUDENTS ==========
async function loadDropdowns() {
  const parentSelect = document.getElementById('student-parent');
  if (!parentSelect) return;

  try {
    const parentsRes = await fetch(`${API_URL}/admin/parents`, { headers: getAuthHeaders() });
    const parents = await parentsRes.json();

    parentSelect.innerHTML = '<option value="">-- Select Parent --</option>' +
      parents.map(p => `<option value="${p.id}">${p.last_name}, ${p.first_name} (${p.email})</option>`).join('');

  } catch (err) {
    console.error('Load dropdowns error:', err);
  }
}

const gradeSelect = document.getElementById('student-grade');
const sectionSelect = document.getElementById('student-section');

async function loadSectionsForGrade(grade) {
  if (!sectionSelect) return;

  if (!grade) {
    sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
    sectionSelect.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${encodeURIComponent(grade)}`, { headers: getAuthHeaders() });
    const sections = await res.json();

    if (!res.ok) throw new Error(sections.error);

    if (!sections.length) {
      sectionSelect.innerHTML = '<option value="">No sections available (assign a teacher first)</option>';
      sectionSelect.disabled = true;
      return;
    }

    // FIX: Add placeholder so change event always fires on user selection
    let html = '<option value="">-- Select Section --</option>';
    html += sections.map(sec => `<option value="${sec}">${sec}</option>`).join('');
    sectionSelect.innerHTML = html;
    sectionSelect.disabled = false;

    // Auto-load class adviser if only one section exists
    if (sections.length === 1) {
      sectionSelect.value = sections[0];
      loadClassAdviserForStudent();
    }

  } catch (err) {
    console.error('Load sections error:', err);
    sectionSelect.innerHTML = '<option value="">Failed to load sections</option>';
    sectionSelect.disabled = true;
  }
}

function setSelectDisplayState(displayBox, displayText, { text, state = 'placeholder' } = {}) {
  if (displayText && text != null) displayText.textContent = text;
  if (displayText) displayText.style.color = '';
  if (!displayBox) return;
  displayBox.classList.remove('is-placeholder', 'is-filled', 'is-error');
  displayBox.classList.add(
    state === 'filled' ? 'is-filled' : state === 'error' ? 'is-error' : 'is-placeholder'
  );
  displayBox.style.borderColor = '';
}

gradeSelect?.addEventListener('change', (e) => {
  loadSectionsForGrade(e.target.value);
  // Reset class adviser when grade changes
  setSelectDisplayState(
    document.getElementById('student-class-adviser-display'),
    document.getElementById('student-class-adviser-text'),
    { text: '-- Auto Select --', state: 'placeholder' }
  );
  const hiddenInput = document.getElementById('student-homeroom');
  if (hiddenInput) hiddenInput.value = '';
});

sectionSelect?.addEventListener('change', () => {
  loadClassAdviserForStudent();
});

// Auto-load sections if grade is pre-selected (e.g., after hard refresh)
if (gradeSelect?.value) {
  loadSectionsForGrade(gradeSelect.value);
}

async function loadClassAdviserForStudent() {
  const grade = document.getElementById('student-grade')?.value;
  const section = document.getElementById('student-section')?.value;
  const displayText = document.getElementById('student-class-adviser-text');
  const displayBox = document.getElementById('student-class-adviser-display');
  const hiddenInput = document.getElementById('student-homeroom');
  const errorEl = document.getElementById('student-class-adviser-error');

  if (!grade || !section) {
    setSelectDisplayState(displayBox, displayText, {
      text: '-- Auto Select --',
      state: 'placeholder'
    });
    if (hiddenInput) hiddenInput.value = '';
    return;
  }

  setSelectDisplayState(displayBox, displayText, { text: 'Loading...', state: 'placeholder' });

  const url = `${API_URL}/admin/class-adviser?grade_level=${encodeURIComponent(grade)}&section=${encodeURIComponent(section)}`;

  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    const contentType = res.headers.get('content-type') || '';

    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error('[Class Adviser] Non-JSON response:', text.substring(0, 300));
      throw new Error(`Server returned ${res.status} (not JSON)`);
    }

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (data.teacher) {
      setSelectDisplayState(displayBox, displayText, {
        text: `${data.teacher.last_name}, ${data.teacher.first_name}`,
        state: 'filled'
      });
      if (hiddenInput) hiddenInput.value = data.teacher.id;
      if (errorEl) errorEl.style.display = 'none';
    } else {
      setSelectDisplayState(displayBox, displayText, {
        text: data.message || 'No class adviser assigned',
        state: 'error'
      });
      if (hiddenInput) hiddenInput.value = '';
      if (errorEl) {
        errorEl.textContent = data.message || 'No class adviser assigned';
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Load class adviser error:', err);
    setSelectDisplayState(displayBox, displayText, {
      text: err.message || 'Failed to load',
      state: 'error'
    });
    if (hiddenInput) hiddenInput.value = '';
  }
}

// Helper to render a single student row from cached data (no API call)
function renderStudentRow(student) {
  const checked = selectedStudentIds.has(Number(student.id)) ? 'checked' : '';
  const statusAction = student.status === 'inactive'
    ? `<button type="button" class="row-menu-item" data-action="reenroll-student" data-student-id="${student.id}">Re-enroll</button>`
    : `<button type="button" class="row-menu-item" data-action="unenroll-student" data-student-id="${student.id}">Unenroll</button>`;
  return `
    <td class="col-check">
      <input type="checkbox" class="admin-student-check" data-student-id="${student.id}" ${checked} aria-label="Select student" />
    </td>
    <td class="att-lrn-cell">${escapeHtml(student.lrn || '-')}</td>
    <td class="att-name-cell">${formatStudentNameStacked(student)}</td>
    <td>Grade ${escapeHtml(String(student.grade_level))}</td>
    <td>${escapeHtml(student.section)}</td>
    <td>${student.parent_last ? escapeHtml(student.parent_last + ', ' + student.parent_first) : '<span style="color:#b71c1c">Unlinked</span>'}</td>
    <td>${statusBadgeHtml(student.status)}</td>
    <td class="row-actions">
      <div class="row-menu-wrap">
        <button type="button" class="icon-btn row-menu-toggle" title="More actions" aria-label="More actions" aria-expanded="false">⋮</button>
        <div class="row-menu" hidden>
          <button type="button" class="row-menu-item" data-action="edit-student" data-student-id="${student.id}">Edit</button>
          ${statusAction}
          <button type="button" class="row-menu-item row-menu-item--danger" data-action="delete-student" data-student-id="${student.id}">Delete</button>
        </div>
      </div>
    </td>
  `;
}

const selectedStudentIds = new Set();
const selectedSubjectIds = new Set();

let currentStudentFilter = '';
let currentStudentGradeFilter = '';
let currentStudentSectionFilter = '';
let studentGradeMenuApi = null;
let studentSectionMenuApi = null;

const STUDENT_GRADE_FILTER_OPTS = [
  { value: '', label: 'All grades' },
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' }
];

async function loadStudentFilterSections(grade) {
  if (!studentSectionMenuApi) return;

  if (!grade) {
    currentStudentSectionFilter = '';
    studentSectionMenuApi.setOptions([{ value: '', label: 'All sections' }]);
    studentSectionMenuApi.setDisabled(true);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${encodeURIComponent(grade)}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    if (!sections.length) {
      currentStudentSectionFilter = '';
      studentSectionMenuApi.setOptions([{ value: '', label: 'No sections yet' }]);
      studentSectionMenuApi.setDisabled(true);
      return;
    }

    if (currentStudentSectionFilter && !sections.includes(currentStudentSectionFilter)) {
      currentStudentSectionFilter = '';
    }
    studentSectionMenuApi.setOptions([
      { value: '', label: 'All sections' },
      ...sections.map((sec) => ({ value: sec, label: sec }))
    ]);
    studentSectionMenuApi.setDisabled(false);
  } catch (err) {
    console.error('Load student filter sections error:', err);
    currentStudentSectionFilter = '';
    studentSectionMenuApi.setOptions([{ value: '', label: 'Failed to load' }]);
    studentSectionMenuApi.setDisabled(true);
  }
}

function getFilteredStudents() {
  let filtered = lastStudentsData;

  if (currentStudentGradeFilter) {
    filtered = filtered.filter((s) => String(s.grade_level) === String(currentStudentGradeFilter));
  }
  if (currentStudentSectionFilter) {
    filtered = filtered.filter(
      (s) => String(s.section || '').toUpperCase() === String(currentStudentSectionFilter).toUpperCase()
    );
  }
  if (currentStudentFilter) {
    const search = currentStudentFilter.toLowerCase();
    filtered = filtered.filter((s) => {
      const name = `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.toLowerCase();
      return (
        name.includes(search) ||
        (s.lrn && s.lrn.includes(search)) ||
        String(s.section || '').toLowerCase().includes(search)
      );
    });
  }

  return filtered;
}

function clearStudentFilters() {
  currentStudentFilter = '';
  currentStudentGradeFilter = '';
  currentStudentSectionFilter = '';

  const search = document.getElementById('admin-student-search');
  if (search) search.value = '';
  studentGradeMenuApi?.sync();
  loadStudentFilterSections('');
  filterStudentsTable();
}

function updateStudentsBulkBar() {
  const bar = document.getElementById('admin-students-bulk-bar');
  const countEl = document.getElementById('admin-students-bulk-count');
  const selectAll = document.getElementById('admin-students-select-all');
  const n = selectedStudentIds.size;
  if (countEl) countEl.textContent = `${n} selected`;
  if (bar) {
    bar.hidden = n === 0;
    if (n === 0) bar.setAttribute('hidden', '');
    else bar.removeAttribute('hidden');
  }
  const checks = [...document.querySelectorAll('#admin-students-table .admin-student-check')];
  if (selectAll) {
    const anyChecked = checks.some((c) => c.checked);
    const allChecked = checks.length > 0 && checks.every((c) => c.checked);
    // Clear indeterminate first so the checked mark can render reliably
    selectAll.indeterminate = false;
    selectAll.checked = allChecked;
    selectAll.indeterminate = anyChecked && !allChecked;
  }
}

function filterStudentsTable() {
  const tbody = document.querySelector('#admin-students-table tbody');
  if (!tbody) return;

  if (!lastStudentsData.length) {
    selectedStudentIds.clear();
    updateStudentsBulkBar();
    tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">No students enrolled</td></tr>';
    return;
  }

  const filtered = getFilteredStudents();

  if (!filtered.length) {
    selectedStudentIds.clear();
    updateStudentsBulkBar();
    const parts = [];
    if (currentStudentGradeFilter) parts.push(`Grade ${currentStudentGradeFilter}`);
    if (currentStudentSectionFilter) parts.push(`Section ${currentStudentSectionFilter}`);
    if (currentStudentFilter) parts.push(`"${currentStudentFilter}"`);
    const label = parts.length ? parts.join(', ') : 'your filters';
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">No students match ${label}</td></tr>`;
    return;
  }

  const sorted = [...filtered].sort(compareStudentsByName);
  const visibleIds = new Set(sorted.map((s) => Number(s.id)));
  [...selectedStudentIds].forEach((id) => {
    if (!visibleIds.has(id)) selectedStudentIds.delete(id);
  });

  tbody.innerHTML = sorted.map(s => `
    <tr data-student-id="${s.id}" style="${s.status === 'inactive' ? 'opacity:0.6;background:#f9f9f9;' : ''}">
      ${renderStudentRow(s)}
    </tr>
  `).join('');
  updateStudentsBulkBar();
}

async function loadStudentsTable() {
  const tbody = document.querySelector('#admin-students-table tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/admin/students`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    lastStudentsData = data;
    filterStudentsTable();

  } catch (err) {
    console.error('Load students error:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">Failed to load students</td></tr>`;
  }
}


// Fixed-position row menus so they never expand .dash-body scroll height
function closeAllRowMenus() {
  document.querySelectorAll('.row-menu').forEach((menu) => {
    menu.setAttribute('hidden', '');
    menu.classList.remove('row-menu--up', 'row-menu--fixed');
    menu.style.top = '';
    menu.style.left = '';
    menu.style.right = '';
    menu.style.bottom = '';
    menu.style.position = '';
    menu.style.zIndex = '';
  });
  document.querySelectorAll('.row-menu-toggle').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function positionFixedRowMenu(toggle, menu) {
  menu.classList.add('row-menu--fixed');
  menu.style.position = 'fixed';
  menu.style.right = 'auto';
  menu.style.bottom = 'auto';
  menu.style.zIndex = '5000';

  const btnRect = toggle.getBoundingClientRect();
  const menuWidth = Math.max(menu.offsetWidth || 0, 148);
  const menuHeight = Math.max(menu.offsetHeight || 0, 40);
  let top = btnRect.bottom + 4;
  let left = btnRect.right - menuWidth;

  if (top + menuHeight > window.innerHeight - 8) {
    top = Math.max(8, btnRect.top - menuHeight - 4);
  }
  if (left < 8) left = 8;
  if (left + menuWidth > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - menuWidth - 8);
  }

  menu.style.top = `${Math.round(top)}px`;
  menu.style.left = `${Math.round(left)}px`;
}

function toggleRowMenu(toggle, scopeSelector) {
  const wrap = toggle.closest('.row-menu-wrap');
  const menu = wrap?.querySelector('.row-menu');
  if (!menu) return;

  const wasOpen = !menu.hasAttribute('hidden');
  document.querySelectorAll(`${scopeSelector} .row-menu`).forEach((m) => {
    if (m === menu) return;
    m.setAttribute('hidden', '');
    m.classList.remove('row-menu--up', 'row-menu--fixed');
    m.style.top = '';
    m.style.left = '';
    m.style.right = '';
    m.style.bottom = '';
    m.style.position = '';
    m.style.zIndex = '';
  });
  document.querySelectorAll(`${scopeSelector} .row-menu-toggle`).forEach((btn) => {
    if (btn !== toggle) btn.setAttribute('aria-expanded', 'false');
  });

  if (wasOpen) {
    menu.setAttribute('hidden', '');
    menu.classList.remove('row-menu--up', 'row-menu--fixed');
    menu.style.top = '';
    menu.style.left = '';
    menu.style.right = '';
    menu.style.bottom = '';
    menu.style.position = '';
    menu.style.zIndex = '';
    toggle.setAttribute('aria-expanded', 'false');
    return;
  }

  document.getElementById('admin-students-export-panel')?.setAttribute('hidden', '');
  document.getElementById('admin-students-export-btn')?.setAttribute('aria-expanded', 'false');
  menu.removeAttribute('hidden');
  positionFixedRowMenu(toggle, menu);
  requestAnimationFrame(() => positionFixedRowMenu(toggle, menu));
  toggle.setAttribute('aria-expanded', 'true');
}

// Event delegation for student table action buttons (Edit/Unenroll/Re-enroll/Delete)
(function setupStudentTableDelegation() {
  const tbody = document.querySelector('#admin-students-table tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const toggle = e.target.closest('.row-menu-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      toggleRowMenu(toggle, '#admin-students-table');
      return;
    }

    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const studentId = parseInt(btn.dataset.studentId, 10);
    if (!studentId || isNaN(studentId)) return;

    e.preventDefault();
    e.stopPropagation();
    closeAllRowMenus();

    switch (action) {
      case 'edit-student': startEditStudent(studentId); break;
      case 'unenroll-student': unenrollStudent(studentId); break;
      case 'reenroll-student': reenrollStudent(studentId); break;
      case 'delete-student': deleteStudent(studentId); break;
    }
  });

  tbody.addEventListener('change', (e) => {
    const check = e.target.closest('.admin-student-check');
    if (!check) return;
    const id = Number(check.dataset.studentId);
    if (!id) return;
    if (check.checked) selectedStudentIds.add(id);
    else selectedStudentIds.delete(id);
    updateStudentsBulkBar();
  });
})();

document.addEventListener('click', (e) => {
  if (!e.target.closest('.row-menu-wrap') && !e.target.closest('.row-menu')) {
    closeAllRowMenus();
  }
});

document.querySelector('.dash-body')?.addEventListener('scroll', () => {
  closeAllRowMenus();
  if (typeof closeStudentsExportMenu === 'function') closeStudentsExportMenu();
}, { passive: true });

window.addEventListener('resize', () => {
  closeAllRowMenus();
  if (typeof closeStudentsExportMenu === 'function') closeStudentsExportMenu();
});

(function wireStudentsSelectAll() {
  const selectAll = document.getElementById('admin-students-select-all');
  if (!selectAll) return;
  let wasIndeterminate = false;

  const captureState = () => {
    wasIndeterminate = !!selectAll.indeterminate;
  };
  selectAll.addEventListener('pointerdown', captureState);
  selectAll.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') captureState();
  });

  selectAll.addEventListener('click', () => {
    const checks = [...document.querySelectorAll('#admin-students-table .admin-student-check')];
    // After browser toggle:
    // - was minus → force clear (don't keep checked/select-all)
    // - was empty → now checked → select all rows
    // - was all checked → now empty → clear all rows
    const shouldSelectAll = !wasIndeterminate && selectAll.checked;

    checks.forEach((cb) => {
      cb.checked = shouldSelectAll;
      const id = Number(cb.dataset.studentId);
      if (!id) return;
      if (shouldSelectAll) selectedStudentIds.add(id);
      else selectedStudentIds.delete(id);
    });
    if (!shouldSelectAll) selectedStudentIds.clear();

    selectAll.indeterminate = false;
    selectAll.checked = shouldSelectAll;
    wasIndeterminate = false;
    updateStudentsBulkBar();
  });
})();

document.getElementById('admin-students-bulk-unenroll')?.addEventListener('click', async () => {
  const ids = [...selectedStudentIds];
  if (!ids.length) return;
  if (!confirm(`Unenroll ${ids.length} selected student(s)? They will be marked inactive.`)) return;
  try {
    for (const id of ids) {
      const student = lastStudentsData.find((s) => Number(s.id) === Number(id));
      if (!student || student.status === 'inactive') continue;
      const res = await fetch(`${API_URL}/admin/students/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'inactive' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to unenroll student #${id}`);
      student.status = 'inactive';
    }
    selectedStudentIds.clear();
    showToast('Selected students unenrolled.');
    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('admin-students-bulk-delete')?.addEventListener('click', async () => {
  const ids = [...selectedStudentIds];
  if (!ids.length) return;
  if (!confirm(`Permanently delete ${ids.length} selected student(s)? This cannot be undone.`)) return;
  try {
    for (const id of ids) {
      const res = await fetch(`${API_URL}/admin/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to delete student #${id}`);
    }
    selectedStudentIds.clear();
    showToast('Selected students deleted.');
    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

function getStudentsExportRows() {
  return getFilteredStudents().slice().sort(compareStudentsByName);
}

function exportStudentsExcel() {
  const rows = getStudentsExportRows();
  if (!rows.length) {
    showToast('No students to export for the current filters.', 'error');
    return;
  }
  const header = ['LRN', 'Last Name', 'First Name', 'Middle Name', 'Grade', 'Section', 'Parent', 'Status'];
  const lines = [header.join(',')];
  const esc = (v) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  rows.forEach((s) => {
    const parent = s.parent_last ? `${s.parent_last}, ${s.parent_first}` : '';
    lines.push([
      s.lrn || '',
      s.last_name || '',
      s.first_name || '',
      s.middle_name || '',
      s.grade_level || '',
      s.section || '',
      parent,
      s.status || ''
    ].map(esc).join(','));
  });
  // UTF-8 BOM so Excel opens special characters correctly
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `students-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${rows.length} student(s) to Excel.`);
}

/** Shared hidden-iframe print (no new tab). Used by Parent / Admin / Teacher PDF exports. */
function printHtmlInHiddenFrame(fullHtml) {
  document.getElementById('connected-print-frame')?.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'connected-print-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = 'Print report';
  // Keep in layout but invisible — display:none can block printing in some browsers
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      try { iframe.remove(); } catch { /* ignore */ }
    }, 500);
  };

  const runPrint = () => {
    const win = iframe.contentWindow;
    if (!win) {
      showToast('Unable to open print dialog.', 'error');
      cleanup();
      return;
    }
    const after = () => {
      win.removeEventListener('afterprint', after);
      cleanup();
    };
    win.addEventListener('afterprint', after);
    setTimeout(cleanup, 120000);
    try {
      win.focus();
      win.print();
    } catch (err) {
      showToast('Unable to open print dialog.', 'error');
      cleanup();
    }
  };

  iframe.onload = () => {
    requestAnimationFrame(() => setTimeout(runPrint, 50));
  };

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    showToast('Unable to prepare print report.', 'error');
    cleanup();
    return false;
  }
  doc.open();
  doc.write(fullHtml);
  doc.close();
  return true;
}

/** Wrap body content in a clean print document (blank title = no name in browser header). */
function openPrintHtmlDocument(title, bodyHtml) {
  const docTitle = title == null || title === '' ? '\u00A0' : String(title);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(docTitle)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #222; padding: 24px; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      h2 { font-size: 14px; margin: 20px 0 8px; color: #5c1010; }
      p { margin: 0 0 12px; color: #555; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f5ebe8; }
      .meta { margin: 0 0 16px; color: #555; font-size: 12px; }
      .kpi-row td { font-weight: 600; }
      @media print {
        body { padding: 0; }
        @page { margin: 12mm; }
      }
    </style>
  </head><body>
    ${bodyHtml}
  </body></html>`;
  return printHtmlInHiddenFrame(html);
}

/** Print a full HTML document (e.g. server-built attendance sheet) via hidden iframe. */
function openPrintFullDocument(fullHtml) {
  let html = String(fullHtml || '');
  // Blank title so browser print chrome doesn't show the report name
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>\u00A0</title>');
  // Remove auto-print scripts — we trigger print once from the iframe helper
  html = html.replace(/<script\b[^>]*>[\s\S]*?window\.print[\s\S]*?<\/script>/gi, '');
  return printHtmlInHiddenFrame(html);
}

function exportStudentsPdf() {
  const rows = getStudentsExportRows();
  if (!rows.length) {
    showToast('No students to export for the current filters.', 'error');
    return;
  }
  const stamp = new Date().toLocaleString();
  const bodyRows = rows.map((s) => {
    const parent = s.parent_last ? `${s.parent_last}, ${s.parent_first}` : 'Unlinked';
    const name = [s.last_name, s.first_name, s.middle_name].filter(Boolean).join(', ');
    return `<tr>
      <td>${escapeHtml(s.lrn || '')}</td>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(String(s.grade_level ?? ''))}</td>
      <td>${escapeHtml(s.section || '')}</td>
      <td>${escapeHtml(parent)}</td>
      <td>${escapeHtml(s.status || '')}</td>
    </tr>`;
  }).join('');

  openPrintHtmlDocument('', `
    <h1>Student List</h1>
    <p>Exported ${rows.length} student(s) · ${escapeHtml(stamp)}</p>
    <table>
      <thead><tr><th>LRN</th><th>Name</th><th>Grade</th><th>Section</th><th>Parent</th><th>Status</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`);
}

/** Shared Export-style dropdown (`.download-menu`) used across portals. */
function closeDownloadMenu(panel, btn) {
  if (panel) {
    panel.setAttribute('hidden', '');
    panel.hidden = true;
    panel.classList.remove('download-menu-panel--fixed');
    panel.style.top = '';
    panel.style.left = '';
    panel.style.right = '';
    panel.style.position = '';
    panel.style.zIndex = '';
  }
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function closeAllDownloadMenus(exceptPanel = null) {
  document.querySelectorAll('.download-menu-panel').forEach((panel) => {
    if (exceptPanel && panel === exceptPanel) return;
    if (!isDownloadMenuOpen(panel)) return;
    const menu = panel.closest('.download-menu');
    const btn = menu?.querySelector('[aria-haspopup="true"]') || null;
    closeDownloadMenu(panel, btn);
  });
}

function positionFixedExportPanel(btn, panel) {
  panel.classList.add('download-menu-panel--fixed');
  panel.style.position = 'fixed';
  panel.style.right = 'auto';
  panel.style.zIndex = '5000';
  const btnRect = btn.getBoundingClientRect();
  const width = Math.max(panel.offsetWidth || 0, 140);
  const height = Math.max(panel.offsetHeight || 0, 40);
  let top = btnRect.bottom + 6;
  let left = btnRect.right - width;
  if (top + height > window.innerHeight - 8) top = Math.max(8, btnRect.top - height - 6);
  if (left < 8) left = 8;
  if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
  panel.style.top = `${Math.round(top)}px`;
  panel.style.left = `${Math.round(left)}px`;
}

function isDownloadMenuOpen(panel) {
  if (!panel) return false;
  return !(panel.hasAttribute('hidden') || panel.hidden === true);
}

function toggleDownloadMenu(btn, panel) {
  if (!btn || !panel) return;
  if (isDownloadMenuOpen(panel)) {
    closeDownloadMenu(panel, btn);
    return;
  }
  closeAllRowMenus();
  closeAllDownloadMenus();
  panel.removeAttribute('hidden');
  panel.hidden = false;
  positionFixedExportPanel(btn, panel);
  requestAnimationFrame(() => positionFixedExportPanel(btn, panel));
  btn.setAttribute('aria-expanded', 'true');
}

/**
 * Chip/filter dropdown matching Admin Export.
 * options: [{ value, label }], getValue/setValue for current selection.
 */
function wireDownloadSelectMenu({
  menuId,
  btnId,
  panelId,
  options = [],
  getValue,
  setValue,
  onPick,
  emptyLabel = 'No options',
  disabled = false,
  formatButtonLabel = null
} = {}) {
  const menu = document.getElementById(menuId);
  const btn = document.getElementById(btnId);
  const panel = document.getElementById(panelId);
  if (!menu || !btn || !panel) return null;

  let currentOptions = Array.isArray(options) ? options : [];

  function setDisabled(next) {
    btn.disabled = !!next;
    if (next) closeDownloadMenu(panel, btn);
  }

  function sync() {
    const val = typeof getValue === 'function' ? getValue() : '';
    const opt = currentOptions.find((o) => String(o.value) === String(val)) || currentOptions[0];
    let label;
    if (typeof formatButtonLabel === 'function') {
      label = formatButtonLabel(opt, val) || emptyLabel;
    } else {
      label = opt ? opt.label : emptyLabel;
    }
    btn.textContent = String(label).includes('▾') ? String(label) : `${label} ▾`;
    if (!currentOptions.length) {
      panel.innerHTML = `<button type="button" class="download-menu-item" disabled>${escapeHtml(emptyLabel)}</button>`;
      return;
    }
    panel.innerHTML = currentOptions.map((o) => {
      const active = String(o.value) === String(val) ? ' download-menu-item--active' : '';
      return `<button type="button" class="download-menu-item${active}" data-value="${escapeHtml(String(o.value))}">${escapeHtml(o.label)}</button>`;
    }).join('');
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (btn.disabled) return;
    sync();
    toggleDownloadMenu(btn, panel);
  });

  panel.addEventListener('click', (e) => {
    const item = e.target.closest('.download-menu-item');
    if (!item || !panel.contains(item) || item.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const next = item.dataset.value ?? '';
    if (typeof setValue === 'function') setValue(next);
    closeDownloadMenu(panel, btn);
    sync();
    if (typeof onPick === 'function') onPick(next);
  });

  setDisabled(disabled);
  sync();
  return {
    sync,
    setOptions(next) {
      currentOptions = Array.isArray(next) ? next : [];
      sync();
    },
    setDisabled
  };
}

function closeStudentsExportMenu() {
  closeDownloadMenu(
    document.getElementById('admin-students-export-panel'),
    document.getElementById('admin-students-export-btn')
  );
}

document.getElementById('admin-students-export-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleDownloadMenu(
    document.getElementById('admin-students-export-btn'),
    document.getElementById('admin-students-export-panel')
  );
});

document.getElementById('admin-students-export-excel')?.addEventListener('click', () => {
  closeStudentsExportMenu();
  exportStudentsExcel();
});
document.getElementById('admin-students-export-pdf')?.addEventListener('click', () => {
  closeStudentsExportMenu();
  exportStudentsPdf();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.download-menu')) return;
  closeAllDownloadMenus();
});

window.startEditStudent = function(id) {
  const student = lastStudentsData.find(s => Number(s.id) === Number(id));
  if (!student) return;

  const modal = document.getElementById('edit-student-modal');
  const errEl = document.getElementById('edit-student-error');
  const subtitle = document.getElementById('edit-student-subtitle');
  document.getElementById('edit-student-id').value = String(student.id);
  document.getElementById('edit-student-lrn').value = student.lrn || '';
  document.getElementById('edit-student-last').value = student.last_name || '';
  document.getElementById('edit-student-first').value = student.first_name || '';
  document.getElementById('edit-student-middle').value = student.middle_name || '';

  const classText = document.getElementById('edit-student-class-text');
  if (classText) {
    classText.textContent = `Grade ${student.grade_level || '—'} · ${student.section || '—'}`;
  }
  const parentText = document.getElementById('edit-student-parent-text');
  if (parentText) {
    parentText.textContent = student.parent_last
      ? `${student.parent_last}, ${student.parent_first || ''}`.trim()
      : 'Unlinked';
  }
  if (subtitle) {
    subtitle.textContent = `Editing ${student.last_name || ''}, ${student.first_name || ''}`;
  }
  if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
  modal?.removeAttribute('hidden');
  document.getElementById('edit-student-last')?.focus();
};

function closeEditStudentModal() {
  const modal = document.getElementById('edit-student-modal');
  modal?.setAttribute('hidden', '');
  document.getElementById('edit-student-form')?.reset();
  document.getElementById('edit-student-id').value = '';
  const errEl = document.getElementById('edit-student-error');
  if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
}

document.getElementById('edit-student-cancel')?.addEventListener('click', () => closeEditStudentModal());
document.getElementById('edit-student-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'edit-student-modal') closeEditStudentModal();
});

document.getElementById('edit-student-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('edit-student-id').value);
  const errEl = document.getElementById('edit-student-error');
  if (!id) return;

  const payload = {
    lrn: document.getElementById('edit-student-lrn')?.value.trim() || null,
    last_name: document.getElementById('edit-student-last')?.value.trim(),
    first_name: document.getElementById('edit-student-first')?.value.trim(),
    middle_name: document.getElementById('edit-student-middle')?.value.trim() || null
  };

  if (!payload.last_name || !payload.first_name) {
    if (errEl) { errEl.hidden = false; errEl.textContent = 'First and last name are required.'; }
    return;
  }
  if (payload.lrn && payload.lrn.length !== 12) {
    if (errEl) { errEl.hidden = false; errEl.textContent = 'LRN must be exactly 12 digits.'; }
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned an unexpected response. The update endpoint may not exist.');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update student');

    closeEditStudentModal();
    showToast('Student updated.');
    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    if (errEl) { errEl.hidden = false; errEl.textContent = err.message; }
    else alert(err.message);
  }
});

window.unenrollStudent = async function(id) {
  if (!confirm('Unenroll this student? They will be marked as inactive but their records will be preserved.')) return;
  try {
    const res = await fetch(`${API_URL}/admin/students/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: 'inactive' })
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Server response (not JSON):', text.substring(0, 200));
      throw new Error('Server error: The unenroll endpoint is not set up yet. Please add PATCH /api/admin/students/:id/status to your backend.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Update cached data locally for instant feedback
    const student = lastStudentsData.find(s => s.id === id);
    if (student) student.status = 'inactive';

    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
};

window.reenrollStudent = function(id) {
  openReenrollModal(id);
};

// ========== RE-ENROLL MODAL ==========
window.openReenrollModal = async function(id) {
  const student = lastStudentsData.find(s => Number(s.id) === Number(id));
  if (!student) return;

  const modal = document.getElementById('reenroll-student-modal');
  if (!modal) return;

  const formatDobForInput = (dob) => {
    if (!dob) return '';
    const s = String(dob);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '';
  };

  // Pre-fill form
  document.getElementById('reenroll-student-id').value = student.id;
  document.getElementById('reenroll-lrn').value = student.lrn || '';
  document.getElementById('reenroll-first').value = student.first_name || '';
  document.getElementById('reenroll-middle').value = student.middle_name || '';
  document.getElementById('reenroll-last').value = student.last_name || '';
  document.getElementById('reenroll-grade').value = String(student.grade_level || '1');
  document.getElementById('reenroll-gender').value = student.gender || 'M';
  document.getElementById('reenroll-dob').value = formatDobForInput(student.dob);
  document.getElementById('reenroll-homeroom').value = '';

  // Reset class adviser display
  setSelectDisplayState(
    document.getElementById('reenroll-class-adviser-display'),
    document.getElementById('reenroll-class-adviser-text'),
    { text: '-- Auto Select --', state: 'placeholder' }
  );

  // Load sections for current grade
  await loadReenrollSections(student.grade_level);

  // Set section if it exists in dropdown
  const sectionSelect = document.getElementById('reenroll-section');
  if (student.section && sectionSelect) {
    const exists = Array.from(sectionSelect.options).some(o => o.value === student.section);
    if (exists) sectionSelect.value = student.section;
  }

  // Load parents dropdown
  await loadReenrollParents(student.parent_id);

  // Load class adviser if grade + section are set
  await loadReenrollClassAdviser();

  modal.removeAttribute('hidden');
};

async function loadReenrollSections(grade) {
  const sectionSelect = document.getElementById('reenroll-section');
  if (!sectionSelect) return;

  if (!grade) {
    sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
    sectionSelect.disabled = true;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${encodeURIComponent(grade)}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    if (!sections.length) {
      sectionSelect.innerHTML = '<option value="">No sections available</option>';
      sectionSelect.disabled = true;
      return;
    }

    // FIX: Add placeholder
    let html = '<option value="">-- Select Section --</option>';
    html += sections.map(sec => `<option value="${sec}">${sec}</option>`).join('');
    sectionSelect.innerHTML = html;
    sectionSelect.disabled = false;

    if (sections.length === 1) {
      sectionSelect.value = sections[0];
      loadReenrollClassAdviser();
    }

  } catch (err) {
    console.error('Load reenroll sections error:', err);
    sectionSelect.innerHTML = '<option value="">Failed to load</option>';
    sectionSelect.disabled = true;
  }
}

async function loadReenrollParents(selectedParentId) {
  const parentSelect = document.getElementById('reenroll-parent');
  if (!parentSelect) return;

  try {
    const res = await fetch(`${API_URL}/admin/parents`, { headers: getAuthHeaders() });
    const parents = await res.json();
    if (!res.ok) throw new Error(parents.error);

    parentSelect.innerHTML = '<option value="">-- Select Parent --</option>' +
      parents.map(p => `<option value="${p.id}" ${selectedParentId == p.id ? 'selected' : ''}>${p.last_name}, ${p.first_name} (${p.email})</option>`).join('');
  } catch (err) {
    console.error('Load reenroll parents error:', err);
    parentSelect.innerHTML = '<option value="">Failed to load</option>';
  }
}

async function loadReenrollClassAdviser() {
  const grade = document.getElementById('reenroll-grade')?.value;
  const section = document.getElementById('reenroll-section')?.value;
  const displayText = document.getElementById('reenroll-class-adviser-text');
  const displayBox = document.getElementById('reenroll-class-adviser-display');
  const hiddenInput = document.getElementById('reenroll-homeroom');
  const errorEl = document.getElementById('reenroll-class-adviser-error');

  if (!grade || !section) {
    setSelectDisplayState(displayBox, displayText, {
      text: '-- Auto Select --',
      state: 'placeholder'
    });
    if (hiddenInput) hiddenInput.value = '';
    return;
  }

  setSelectDisplayState(displayBox, displayText, { text: 'Loading...', state: 'placeholder' });

  try {
    const res = await fetch(`${API_URL}/admin/class-adviser?grade_level=${encodeURIComponent(grade)}&section=${encodeURIComponent(section)}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.teacher) {
      setSelectDisplayState(displayBox, displayText, {
        text: `${data.teacher.last_name}, ${data.teacher.first_name}`,
        state: 'filled'
      });
      if (hiddenInput) hiddenInput.value = data.teacher.id;
      if (errorEl) errorEl.style.display = 'none';
    } else {
      setSelectDisplayState(displayBox, displayText, {
        text: data.message || 'No class adviser assigned',
        state: 'error'
      });
      if (hiddenInput) hiddenInput.value = '';
      if (errorEl) {
        errorEl.textContent = data.message || 'No class adviser assigned';
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Load reenroll class adviser error:', err);
    setSelectDisplayState(displayBox, displayText, {
      text: 'Failed to load',
      state: 'error'
    });
    if (hiddenInput) hiddenInput.value = '';
  }
}

// Re-enroll modal event listeners
document.getElementById('reenroll-grade')?.addEventListener('change', async (e) => {
  await loadReenrollSections(e.target.value);
  setSelectDisplayState(
    document.getElementById('reenroll-class-adviser-display'),
    document.getElementById('reenroll-class-adviser-text'),
    { text: '-- Auto Select --', state: 'placeholder' }
  );
  const hiddenInput = document.getElementById('reenroll-homeroom');
  if (hiddenInput) hiddenInput.value = '';
});

document.getElementById('reenroll-section')?.addEventListener('change', () => {
  loadReenrollClassAdviser();
});

document.getElementById('reenroll-cancel')?.addEventListener('click', () => {
  document.getElementById('reenroll-student-modal')?.setAttribute('hidden', '');
});

document.getElementById('reenroll-student-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'reenroll-student-modal') {
    document.getElementById('reenroll-student-modal').setAttribute('hidden', '');
  }
});

document.getElementById('reenroll-student-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('reenroll-student-id').value;
  const lrnVal = document.getElementById('reenroll-lrn').value.trim();
  const sectionVal = document.getElementById('reenroll-section').value;
  if (lrnVal && lrnVal.length !== 12) {
    alert('LRN must be exactly 12 digits');
    return;
  }
  if (!sectionVal) {
    alert('Please select a section');
    return;
  }

  const payload = {
    lrn: lrnVal || null,
    first_name: document.getElementById('reenroll-first').value.trim(),
    middle_name: document.getElementById('reenroll-middle').value.trim() || null,
    last_name: document.getElementById('reenroll-last').value.trim(),
    grade_level: document.getElementById('reenroll-grade').value,
    section: sectionVal,
    gender: document.getElementById('reenroll-gender').value,
    parent_id: document.getElementById('reenroll-parent').value || null,
    homeroom_teacher_id: document.getElementById('reenroll-homeroom').value || null,
    dob: document.getElementById('reenroll-dob').value || null,
    status: 'active'
  };

  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error('Server returned HTML instead of JSON. The update endpoint may not support all these fields yet.');
    }

    if (!res.ok) throw new Error(data.error || 'Failed to re-enroll student');

    alert('Student re-enrolled successfully');
    document.getElementById('reenroll-student-modal').setAttribute('hidden', '');
    await refreshSchoolData({ students: true, teachers: true });
  } catch (err) {
    alert(err.message);
  }
});

// FIX #5: Add confirmation before permanent delete
window.deleteStudent = async function(id) {
  if (!confirm('Permanently delete this student? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
};

function formatActivityRole(role) {
  if (!role) return '';
  const labels = { admin: 'Admin', teacher: 'Teacher', parent: 'Parent' };
  return labels[String(role).toLowerCase()] || role;
}

function refreshAdminOverview() {
  const adminView = document.getElementById('view-admin');
  if (!adminView || adminView.hidden) return;
  const activeTab = document.querySelector('[data-admin-tab].active')?.dataset.adminTab;
  if (activeTab === 'overview' || !activeTab) {
    loadOverviewStats();
    loadActivityLog();
  }
}

function statusBadgeHtml(status) {
  const normalized = String(status || 'active').toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `<span class="badge status-badge status-badge--${normalized}">${label}</span>`;
}

function openAdminModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  if (modalId === 'add-account-modal') {
    resetAdminModalForm(modalId);
    fillTempPasswordInput('admin-account-password');
  }
  modal.removeAttribute('hidden');
}

function resetAdminModalForm(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const form = modal.querySelector('form');
  form?.reset();

  if (modalId === 'add-account-modal') {
    const container = document.getElementById('subject-assignments-container');
    if (container) container.innerHTML = '';
    subjectCounter = 0;
    const caNewSection = document.getElementById('class-adviser-new-section');
    const caSectionSelect = document.getElementById('class-adviser-section');
    if (caNewSection) { caNewSection.style.display = 'none'; caNewSection.value = ''; }
    if (caSectionSelect) {
      caSectionSelect.style.display = 'block';
      caSectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
      caSectionSelect.disabled = true;
    }
    const caError = document.getElementById('class-adviser-section-error');
    if (caError) caError.style.display = 'none';
    fillTempPasswordInput('admin-account-password');
    if (typeof toggleRoleFields === 'function') toggleRoleFields();
  }

  if (modalId === 'add-student-modal') {
    const sectionSelect = document.getElementById('student-section');
    if (sectionSelect) {
      sectionSelect.innerHTML = '<option value="">-- Select Grade First --</option>';
      sectionSelect.disabled = true;
    }
    const displayText = document.getElementById('student-class-adviser-text');
    const hiddenInput = document.getElementById('student-homeroom');
    setSelectDisplayState(
      document.getElementById('student-class-adviser-display'),
      displayText,
      { text: '-- Auto Select --', state: 'placeholder' }
    );
    if (hiddenInput) hiddenInput.value = '';
  }

  if (modalId === 'compose-announcement-modal') {
    const msgEl = document.getElementById('admin-announcement-message');
    if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
    if (typeof updateAnnouncementScopeFields === 'function') updateAnnouncementScopeFields();
  }
}

function closeAdminModal(modalId, { reset = true } = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.setAttribute('hidden', '');
  if (reset) resetAdminModalForm(modalId);
}

function wireAdminModal(modalId, openBtnId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  document.getElementById(openBtnId)?.addEventListener('click', () => openAdminModal(modalId));

  modal.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeAdminModal(modalId));

  modal.addEventListener('click', (e) => {
    if (e.target.id === modalId) closeAdminModal(modalId);
  });
}

function wireSimpleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    modal.setAttribute('hidden', '');
    modal.querySelector('form')?.reset();
  });

  modal.addEventListener('click', (e) => {
    if (e.target.id === modalId) {
      modal.setAttribute('hidden', '');
      modal.querySelector('form')?.reset();
    }
  });
}

/** Refresh shared lists/caches across admin and teacher portals after data changes. */
async function refreshSchoolData(scopes = {}) {
  const all = scopes.all === true || !Object.keys(scopes).length;
  const want = (key) => all || scopes[key] === true;
  const jobs = [];

  if (want('overview') || want('accounts') || want('students') || want('parents') || want('announcements')) {
    jobs.push(loadOverviewStats());
  }
  if (want('overview') || want('accounts') || want('students') || want('subjects') || want('announcements')) {
    jobs.push(loadActivityLog());
  }

  if (want('accounts')) {
    jobs.push(loadAccountsTable());
  }

  if (want('students') || want('parents')) {
    jobs.push(loadDropdowns());
  }

  if (want('students')) {
    jobs.push(loadStudentsTable());
    const grade = document.getElementById('student-grade')?.value;
    if (grade) jobs.push(loadSectionsForGrade(grade));
  }

  if (want('subjects')) {
    jobs.push(loadSubjectsTable());
    jobs.push(refreshAdminSubjectPickers());
  }

  if (want('accounts') || want('teachers')) {
    const grade = document.getElementById('student-grade')?.value;
    if (grade) jobs.push(loadSectionsForGrade(grade));
  }

  if (want('teachers') || want('accounts') || want('subjects')) {
    jobs.push(refreshTeacherClassesPreserveSelection());
  }
  if (want('students')) {
    jobs.push(refreshTeacherRosterIfActive());
  }
  if (want('subjects')) {
    teacherSubjectsLoaded = false;
    jobs.push(loadTeacherSubjects(true));
    jobs.push(refreshTeacherRosterIfActive());
  }
  if (want('students') || want('subjects')) {
    const panel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    if (panel === 'progress') jobs.push(loadProgressList());
    if (panel === 'quiz-bank') jobs.push(loadQuestionBank());
  }
  if (want('announcements')) {
    jobs.push(loadTeacherInbox());
    jobs.push(loadAdminAnnouncements());
  }

  await Promise.allSettled(jobs);
}

async function refreshTeacherClassesPreserveSelection() {
  const prev = teacherCurrentClass
    ? {
        grade: teacherCurrentClass.grade,
        section: teacherCurrentClass.section,
        subjectName: teacherCurrentClass.subjectName,
        subjectId: teacherCurrentClass.subjectId
      }
    : null;

  try {
    const res = await fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() });
    const classes = await res.json();
    if (!res.ok) throw new Error(classes.error);

    teacherAssignedClasses = Array.isArray(classes) ? classes : [];
    fillTeacherNoticeClasses();

    const listEl = document.getElementById('teacher-class-list');
    if (!listEl) return;

    if (!classes.length) {
      listEl.innerHTML = '<div class="class-nav-empty">No classes assigned</div>';
      return;
    }

    renderTeacherClassNav(classes);

    if (prev) {
      const still = classes.find(
        (c) => String(c.grade_level) === String(prev.grade) && String(c.section) === String(prev.section)
      );
      if (still) {
        await selectTeacherClassContext({
          grade: prev.grade,
          section: prev.section,
          subjectName: prev.subjectName,
          subjectId: prev.subjectId,
          goToPanel: null,
          expandGroup: true
        });
        return;
      }
    }

    const first = classes[0];
    if (first) {
      await selectTeacherClassContext({
        grade: first.grade_level,
        section: first.section,
        subjectName: null,
        subjectId: null,
        goToPanel: null
      });
    }
  } catch (err) {
    console.error('Refresh teacher classes error:', err);
  }
}

async function refreshTeacherRosterIfActive() {
  if (!teacherCurrentClass?.grade || !teacherCurrentClass?.section) return;

  const panel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
  const { grade, section } = teacherCurrentClass;
  const subjectMode = isSubjectAttendanceGrade(grade);
  const canLoadRoster = !subjectMode || !!teacherCurrentClass.subjectId;

  // Always refresh roster + stats when a usable class context exists (even if panel is hidden),
  // so admin enrolls show up as soon as the teacher opens Classroom / Attendance Sheet.
  if (canLoadRoster) {
    await loadRoster(grade, section);
    loadClassStats(grade, section);
    if (panel === 'classroom') refreshClassroomAttendanceStatus();
  }

  if (panel === 'attendance-sheet' || canLoadRoster) {
    // Refresh sheet data whenever we have a valid subject/class context
    if (!subjectMode || teacherCurrentClass.subjectId) {
      await loadAttendanceSheet();
    }
  }
}

async function refreshAdminSubjectPickers() {
  const caWrap = document.getElementById('class-adviser-subjects-wrap');
  if (caWrap && caWrap.style.display !== 'none' && typeof loadClassAdviserSubjects === 'function') {
    await loadClassAdviserSubjects();
  }

  const editCaWrap = document.getElementById('edit-class-adviser-subjects-wrap');
  if (editCaWrap && !editCaWrap.hidden && typeof loadEditClassAdviserSubjects === 'function') {
    const gradeSelect = document.getElementById('edit-class-adviser-grade');
    const preselected = Array.from(document.querySelectorAll('#edit-class-adviser-subjects-list .edit-ca-subject-checkbox:checked'))
      .map((cb) => parseInt(cb.value, 10))
      .filter((n) => Number.isFinite(n));
    if (gradeSelect?.value) {
      await loadEditClassAdviserSubjects(preselected);
    }
  }

  document.querySelectorAll('.subject-id-select').forEach(async (sel) => {
    const prev = sel.value;
    try {
      const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
      const subjects = await res.json();
      if (!res.ok || !Array.isArray(subjects)) return;
      sel.innerHTML = '<option value="">-- Select Subject --</option>' +
        subjects.map((s) => `<option value="${s.id}">${s.subject_name || s.name || 'Unnamed'}</option>`).join('');
      if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
    } catch (_) { /* ignore */ }
  });
}

async function loadActivityLog() {
  const tbody = document.getElementById('admin-activity-log');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/admin/activity-log`, { headers: getAuthHeaders() });
    const logs = await res.json();
    if (!res.ok) throw new Error(logs.error);

    const recent = Array.isArray(logs) ? logs.slice(0, 5) : [];

    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty-cell">No recent activity</td></tr>';
      return;
    }

    tbody.innerHTML = recent.map(log => {
      const roleLabel = formatActivityRole(log.user_role);
      const roleHtml = roleLabel ? `<span class="log-role">${roleLabel}</span>` : '';
      const detail = log.details
        ? ` <span style="color:var(--text-muted);font-size:0.78rem;">· ${log.details}</span>`
        : '';
      return `
      <tr>
        <td>
          <span class="log-user">${log.user_name || 'System'}</span>
          ${roleHtml}
        </td>
        <td><span class="log-action">${log.action}</span>${log.target_name ? ` — <em>${log.target_name}</em>` : ''}${detail}</td>
        <td class="log-time">${new Date(log.created_at).toLocaleString()}</td>
      </tr>
    `;
    }).join('');
  } catch (err) {
    console.error('Load activity log error:', err);
    tbody.innerHTML = '<tr><td colspan="3" class="empty-cell">Failed to load activity</td></tr>';
  }
}

async function loadOverviewStats() {
  const teachersEl = document.getElementById('admin-kpi-teachers');
  const parentsEl = document.getElementById('admin-kpi-parents');
  const studentsEl = document.getElementById('admin-kpi-students');

  if (teachersEl) teachersEl.textContent = '...';
  if (parentsEl) parentsEl.textContent = '...';
  if (studentsEl) studentsEl.textContent = '...';

  try {
    const [accountsRes, studentsRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/admin/accounts`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/admin/students`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/admin/settings`, { headers: getAuthHeaders() })
    ]);

    const accounts = await accountsRes.json();
    const students = await studentsRes.json();
    const settings = settingsRes.ok ? await settingsRes.json() : null;

    if (!accountsRes.ok) throw new Error(accounts.error || 'Failed to load accounts');
    if (!studentsRes.ok) throw new Error(students.error || 'Failed to load students');

    const teachers = Array.isArray(accounts) ? accounts.filter(u => u.role === 'teacher' && u.status === 'active').length : 0;
    const parents = Array.isArray(accounts) ? accounts.filter(u => u.role === 'parent' && u.status === 'active').length : 0;
    const studentCount = Array.isArray(students) ? students.length : 0;

    if (teachersEl) teachersEl.textContent = teachers;
    if (parentsEl) parentsEl.textContent = parents;
    if (studentsEl) studentsEl.textContent = studentCount;

    if (settings?.currentQuarter) {
      CURRENT_QUARTER = normalizeQuarterClient(settings.currentQuarter);
      UNLOCKED_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(CURRENT_QUARTER) + 1);
      applyQuarterUnlockUI();
    }

  } catch (err) {
    console.error('Load overview stats error:', err);
    if (teachersEl) teachersEl.textContent = '--';
    if (parentsEl) parentsEl.textContent = '--';
    if (studentsEl) studentsEl.textContent = '--';
  }
}

window.resolveConcern = async function(id) {
  if (!confirm('Mark this concern as resolved?')) return;
  try {
    const role = getAuthUser()?.role;
    const url = role === 'teacher'
      ? `${API_URL}/teacher/concerns/${id}/resolve`
      : `${API_URL}/admin/concerns/${id}/resolve`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Concern marked as resolved.');
    if (role === 'teacher') {
      teacherExpandedConcernId = null;
      loadTeacherInbox(teacherInboxFilter || 'unresolved');
    } else if (role === 'admin') {
      adminExpandedConcernId = null;
      loadAdminInbox(adminInboxFilter || 'unresolved');
    } else if (role === 'parent') {
      parentExpandedConcernId = null;
      parentInboxFilter = 'resolved';
      renderParentInbox();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.replyToConcern = async function(id, btn) {
  const box = document.getElementById(`concern-reply-${id}`);
  const nearBox = btn && btn.closest ? btn.closest('li')?.querySelector('.concern-reply-input') : null;
  const sendBox = nearBox || box;
  const sendMessage = sendBox ? sendBox.value.trim() : '';
  if (!sendMessage) {
    showToast('Write a reply first.', 'error');
    return;
  }
  try {
    const role = getAuthUser()?.role;
    let url;
    if (role === 'parent') url = `${API_URL}/parent/concerns/${id}/reply`;
    else if (role === 'teacher') url = `${API_URL}/teacher/concerns/${id}/reply`;
    else url = `${API_URL}/admin/concerns/${id}/reply`;

    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: sendMessage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(role === 'parent' ? 'Reply sent to the teacher.' : 'Reply sent to the parent.');
    if (role === 'parent') {
      parentExpandedConcernId = Number(id);
      parentInboxFilter = 'unresolved';
      renderParentInbox();
    } else if (role === 'teacher') {
      teacherExpandedConcernId = Number(id);
      loadTeacherInbox(teacherInboxFilter || 'unresolved');
    } else if (role === 'admin') {
      adminExpandedConcernId = Number(id);
      loadAdminInbox(adminInboxFilter || 'unresolved');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};


let adminInboxFilter = 'unresolved';
let adminExpandedConcernId = null;
let adminInboxSearchQuery = '';
let adminAnnouncementSearchQuery = '';
let adminInboxCache = { concerns: [], announcements: [] };
let adminExpandedAnnouncementId = null;

async function loadAdminAnnouncements() {
  const listEl = document.getElementById('admin-announcement-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${API_URL}/admin/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    adminInboxCache.announcements = Array.isArray(data.announcements) ? data.announcements : [];
    if (Array.isArray(data.concerns)) adminInboxCache.concerns = data.concerns;
    paintAdminAnnouncementsList();
    wireInboxSearch({
      inputId: 'admin-announcement-search',
      clearId: 'admin-announcement-search-clear',
      getValue: () => adminAnnouncementSearchQuery,
      setValue: (v) => { adminAnnouncementSearchQuery = v; },
      onChange: () => paintAdminAnnouncementsList()
    });
  } catch (err) {
    console.error('Load announcements error:', err);
    listEl.innerHTML = '<li class="empty-state"><p>Failed to load announcements</p></li>';
  }
}

function paintAdminAnnouncementsList() {
  const listEl = document.getElementById('admin-announcement-list');
  if (!listEl) return;
  let announcements = [...(adminInboxCache.announcements || [])];
  announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  announcements = announcements.filter((a) => matchesInboxSearch(a, adminAnnouncementSearchQuery));

  if (!announcements.length) {
    listEl.innerHTML = `<li class="empty-state"><p>${String(adminAnnouncementSearchQuery || '').trim() ? 'No matches' : 'No announcements sent yet'}</p></li>`;
    return;
  }

  listEl.innerHTML = announcements.map((a) => {
    const isEdited = a.updated_at && new Date(a.updated_at).getTime() > new Date(a.created_at).getTime() + 1000;
    const editedBit = isEdited ? ` · Edited ${new Date(a.updated_at).toLocaleString()}` : '';
    return renderMailAnnouncementRow(a, {
      expandedId: adminExpandedAnnouncementId,
      toggleFn: 'toggleAdminAnnouncement',
      badgeLabel: 'Announcement',
      badgeColor: 'var(--maroon)',
      metaLine: `${escapeHtml(announcementMeta(a))}${editedBit}`,
      actionsHtml: `
        <button type="button" class="chip-ghost" onclick="startEditAnnouncement(${a.id})">Edit</button>
        <button type="button" class="chip-ghost" style="color:#b71c1c;border-color:#b71c1c;" onclick="deleteAnnouncement(${a.id})">Delete</button>`
    });
  }).join('');
}

window.toggleAdminAnnouncement = function(id) {
  const announcementId = Number(id);
  if (!announcementId) return;
  adminExpandedAnnouncementId = Number(adminExpandedAnnouncementId) === announcementId ? null : announcementId;
  paintAdminAnnouncementsList();
};

async function loadAdminInbox(filter = adminInboxFilter || 'unresolved') {
  const listEl = document.getElementById('admin-inbox-list');
  if (!listEl) return;
  adminInboxFilter = filter || 'unresolved';

  document.querySelectorAll('[data-admin-inbox-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.adminInboxFilter === adminInboxFilter);
  });

  try {
    const res = await fetch(`${API_URL}/admin/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    adminInboxCache = {
      concerns: Array.isArray(data.concerns) ? data.concerns : [],
      announcements: Array.isArray(data.announcements) ? data.announcements : adminInboxCache.announcements
    };
    if (adminExpandedConcernId) {
      const still = adminInboxCache.concerns.some((c) => Number(c.id) === Number(adminExpandedConcernId));
      if (!still) adminExpandedConcernId = null;
    }
    paintAdminInboxList();
    wireInboxSearch({
      inputId: 'admin-inbox-search',
      clearId: 'admin-inbox-search-clear',
      getValue: () => adminInboxSearchQuery,
      setValue: (v) => { adminInboxSearchQuery = v; },
      onChange: () => paintAdminInboxList()
    });
  } catch (err) {
    console.error('Load admin inbox error:', err);
    listEl.innerHTML = '<li class="empty-state"><p>Failed to load inbox</p></li>';
  }
}

function paintAdminInboxList() {
  const listEl = document.getElementById('admin-inbox-list');
  if (!listEl) return;
  const filter = adminInboxFilter || 'unresolved';
  document.querySelectorAll('[data-admin-inbox-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.adminInboxFilter === filter);
  });

  const concerns = adminInboxCache.concerns || [];
  setInboxFilterCounts(
    document.querySelectorAll('[data-admin-inbox-filter]'),
    {
      unresolved: concerns.filter((c) => concernIsOpen(c)).length
      // resolved: no count
    },
    'data-admin-inbox-filter'
  );

  let items = concerns.filter((c) =>
    filter === 'resolved' ? !concernIsOpen(c) : concernIsOpen(c)
  );
  items.sort((a, b) => concernActivityTime(b) - concernActivityTime(a));
  items = items.filter((c) => matchesInboxSearch(c, adminInboxSearchQuery));

  if (!items.length) {
    const emptyLabel = String(adminInboxSearchQuery || '').trim()
      ? 'matches'
      : filter === 'resolved' ? 'resolved concerns' : 'unresolved concerns';
    listEl.innerHTML = `<li class="empty-state"><p>No ${emptyLabel}</p></li>`;
    return;
  }

  listEl.innerHTML = items.map((item) => {
    const studentBit = item.student_name
      ? `${escapeHtml(item.student_name)} (Grade ${item.grade_level || '?'}-${escapeHtml(item.section || '?')})`
      : 'N/A';
    const teacherBit = item.teacher_name ? ` · Teacher: ${escapeHtml(item.teacher_name)}` : '';
    return renderMailConcernRow(item, {
      expandedId: adminExpandedConcernId,
      toggleFn: 'toggleAdminConcern',
      badgeLabel: item.parent_name || 'Parent',
      metaLine: `Student: ${studentBit}${teacherBit}`,
      canReply: true
    });
  }).join('');
}

window.toggleAdminConcern = async function(id) {
  const concernId = Number(id);
  if (!concernId) return;
  if (Number(adminExpandedConcernId) === concernId) {
    adminExpandedConcernId = null;
    paintAdminInboxList();
    return;
  }
  adminExpandedConcernId = concernId;
  await markConcernReadForRole(concernId);
  const cached = adminInboxCache.concerns.find((c) => Number(c.id) === concernId);
  if (cached) {
    cached.is_read = 1;
    cached.read_at = new Date().toISOString();
  }
  paintAdminInboxList();
};

function isUnread(item) {
  return item.is_read === 0 || item.is_read === false || !item.is_read;
}

function announcementAudienceLabel(item) {
  return String(item.audience || 'everyone') === 'teachers' ? 'Teachers only' : 'Parents & teachers';
}

function priorityCardClass(item) {
  const priority = String(item?.priority || 'normal').toLowerCase();
  if (priority === 'high') return 'priority-card-high';
  if (priority === 'low') return 'priority-card-low';
  return 'priority-card-normal';
}

function priorityBadgeHtml(item) {
  const priority = String(item.priority || 'normal').toLowerCase();
  const priorityClass = priority === 'high' ? 'priority-high' : (priority === 'low' ? 'priority-low' : 'priority-normal');
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  return `<span class="badge ${priorityClass}">${priorityLabel}</span>`;
}

function teachingModeDisplay(mode, label) {
  if (label) return label;
  const m = String(mode || '').toLowerCase();
  if (m === 'both') return 'Class Adviser & Subject Teacher';
  if (m === 'class_adviser' || m === 'homeroom') return 'Class Adviser';
  if (m === 'subject_teacher' || m === 'subject') return 'Subject Teacher';
  return 'Not set';
}

function announcementMeta(item) {
  const parts = [
    `Audience: ${announcementAudienceLabel(item)}`,
    `Scope: ${item.scope || 'school_wide'}`
  ];
  if (item.target_grade) parts.push('Grade ' + item.target_grade);
  if (item.target_section) parts.push('Section ' + item.target_section);
  return parts.join(' | ');
}

function concernSubject(item) {
  return item.subject || item.SUBJECT || 'N/A';
}

function concernStatus(item) {
  return String(item.status || item.STATUS || 'open').toLowerCase();
}

function concernIsOpen(item) {
  const status = concernStatus(item);
  return status !== 'resolved' && status !== 'closed';
}

function roleLabel(role) {
  if (role === 'parent') return 'Parent';
  if (role === 'teacher') return 'Teacher';
  if (role === 'admin') return 'Admin';
  return role || 'User';
}

function concernThreadHtml(item, canReply) {
  const open = concernIsOpen(item);
  let replies = Array.isArray(item.replies) ? item.replies : [];
  if (!replies.length && item.teacher_reply) {
    replies = [{
      sender_name: 'Teacher',
      sender_role: 'teacher',
      message: item.teacher_reply,
      created_at: item.replied_at
    }];
  }

  const original = `
    <div class="concern-reply concern-reply--parent">
      <div class="concern-reply-meta">
        <strong>Parent</strong>
        ${item.parent_name ? ` · ${escapeHtml(item.parent_name)}` : ''}
        ${item.created_at ? ` <span style="color:var(--text-muted);font-size:0.75rem;">(${new Date(item.created_at).toLocaleString()})</span>` : ''}
      </div>
      <div class="concern-reply-body">${escapeHtml(item.message || '')}</div>
    </div>`;

  const followUps = replies.length
    ? replies.map(r => `
        <div class="concern-reply concern-reply--${r.sender_role || 'user'}">
          <div class="concern-reply-meta">
            <strong>${roleLabel(r.sender_role)}</strong>
            ${r.sender_name ? ` · ${escapeHtml(r.sender_name)}` : ''}
            ${r.created_at ? ` <span style="color:var(--text-muted);font-size:0.75rem;">(${new Date(r.created_at).toLocaleString()})</span>` : ''}
          </div>
          <div class="concern-reply-body">${escapeHtml(r.message || '')}</div>
        </div>`).join('')
    : '';

  const thread = `<div class="concern-thread">${original}${followUps}</div>`;

  const replyForm = canReply && open
    ? `<textarea id="concern-reply-${item.id}" rows="2" class="concern-reply-input" placeholder="Write a follow-up message..."></textarea>`
    : '';

  const actions = canReply
    ? `<div class="inbox-item-actions" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
         ${open ? `<button type="button" class="chip-ghost primary" onclick="replyToConcern(${item.id}, this)">Send Reply</button>` : ''}
         ${canReply && getAuthUser()?.role !== 'parent' && open
           ? `<button type="button" class="chip-ghost" onclick="resolveConcern(${item.id})">Mark Resolved</button>`
           : ''}
         ${!open ? '<span class="page-subheading" style="margin:0;">Replies closed</span>' : ''}
       </div>`
    : (!open ? '<p class="page-subheading" style="margin-top:8px;">Replies closed</p>' : '');

  return thread + replyForm + actions;
}

function concernReplyHtml(item, canReply) {
  return concernThreadHtml(item, canReply);
}

function concernPreviewText(item) {
  const text = String(item.message || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'No message';
  return text.length > 110 ? `${text.slice(0, 110)}…` : text;
}

function concernActivityTime(item) {
  return new Date(item.last_activity || item.created_at || 0).getTime() || 0;
}

function isConcernUnread(item) {
  // Resolved/closed = already handled → always show as read/neutral
  if (!concernIsOpen(item)) return false;
  return !(item.is_read === 1 || item.is_read === true);
}

function inboxSearchHaystack(item) {
  const parts = [
    item.subject,
    item.SUBJECT,
    item.title,
    item.message,
    item.body,
    item.parent_name,
    item.teacher_name,
    item.student_name,
    item.sender_name,
    item.admin_name,
    item.grade_level,
    item.section
  ];
  if (Array.isArray(item.replies)) {
    item.replies.forEach((r) => {
      parts.push(r.message, r.sender_name, r.sender_role);
    });
  }
  return parts.filter((p) => p != null && String(p).trim() !== '').join(' ').toLowerCase();
}

function matchesInboxSearch(item, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  return inboxSearchHaystack(item).includes(q);
}

function syncInboxSearchClearBtn(inputEl, clearBtn) {
  if (!clearBtn || !inputEl) return;
  const has = !!String(inputEl.value || '').trim();
  clearBtn.hidden = !has;
  if (has) clearBtn.removeAttribute('hidden');
  else clearBtn.setAttribute('hidden', '');
}

function wireInboxSearch({ inputId, clearId, getValue, setValue, onChange }) {
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearId);
  if (!input || input.dataset.searchWired === '1') return;
  input.dataset.searchWired = '1';
  if (typeof getValue === 'function') input.value = getValue() || '';
  syncInboxSearchClearBtn(input, clearBtn);
  input.addEventListener('input', () => {
    const val = input.value || '';
    if (typeof setValue === 'function') setValue(val);
    syncInboxSearchClearBtn(input, clearBtn);
    onChange?.(val);
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    if (typeof setValue === 'function') setValue('');
    syncInboxSearchClearBtn(input, clearBtn);
    onChange?.('');
    input.focus();
  });
}

async function markConcernReadForRole(id) {
  const role = getAuthUser()?.role;
  const base = role === 'parent' ? 'parent' : role === 'admin' ? 'admin' : 'teacher';
  try {
    await fetch(`${API_URL}/${base}/concerns/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('Mark concern read error:', err);
  }
}

function renderMailConcernRow(item, {
  expandedId = null,
  toggleFn = 'toggleTeacherConcern',
  metaLine = '',
  canReply = true,
  badgeLabel = null
} = {}) {
  const unread = isConcernUnread(item);
  const expanded = Number(expandedId) === Number(item.id);
  const when = new Date(item.last_activity || item.created_at).toLocaleString();
  const role = getAuthUser()?.role;
  const label = badgeLabel != null && String(badgeLabel).trim() !== ''
    ? String(badgeLabel).trim()
    : (role === 'parent'
      ? (item.teacher_name || 'Teacher')
      : (item.parent_name || 'Parent'));

  return `
    <li class="inbox-item inbox-item--concern ${unread ? 'inbox-item--unread' : 'inbox-item--read'} ${expanded ? 'is-expanded' : ''}" data-concern-id="${item.id}">
      <button type="button" class="inbox-item-summary" onclick="${toggleFn}(${item.id})" aria-expanded="${expanded ? 'true' : 'false'}">
        <div class="inbox-item-summary-top">
          <span class="badge" style="background:var(--maroon);color:#fff;">${escapeHtml(label)}</span>
          ${unread ? '<span class="inbox-unread-dot" title="Unread"></span>' : ''}
          <span class="inbox-item-time">${when}</span>
          <span class="inbox-item-chev" aria-hidden="true">${expanded ? '▾' : '▸'}</span>
        </div>
        <div class="inbox-item-summary-title">${escapeHtml(concernSubject(item))}</div>
        <div class="inbox-item-summary-meta">${metaLine}</div>
        ${expanded ? '' : `<p class="inbox-item-preview">${escapeHtml(concernPreviewText(item))}</p>`}
      </button>
      ${expanded ? `<div class="inbox-item-detail">${concernThreadHtml(item, canReply)}</div>` : ''}
    </li>`;
}

function announcementPreviewText(item) {
  const text = String(item.body || item.message || '').replace(/\s+/g, ' ').trim();
  if (!text) return 'No message';
  return text.length > 110 ? `${text.slice(0, 110)}…` : text;
}

function renderMailAnnouncementRow(item, {
  expandedId = null,
  expanded = null,
  toggleFn = 'toggleTeacherAnnouncement',
  onToggle = null,
  badgeLabel = null,
  badgeColor = 'var(--maroon)',
  metaLine = '',
  actionsHtml = '',
  showTypeBadge = true
} = {}) {
  const unread = isUnread(item);
  const isExpanded = expanded != null
    ? !!expanded
    : Number(expandedId) === Number(item.id);
  const when = new Date(item.created_at || item.last_activity || 0).toLocaleString();
  const toggleAttr = onToggle || `${toggleFn}(${item.id})`;
  const typeBadge = showTypeBadge && badgeLabel
    ? `<span class="badge" style="background:${badgeColor};color:#fff;">${escapeHtml(badgeLabel)}</span>`
    : '';

  return `
    <li class="inbox-item inbox-item--announcement ${priorityCardClass(item)} ${unread ? 'inbox-item--unread' : 'inbox-item--read'} ${isExpanded ? 'is-expanded' : ''}" data-announcement-id="${item.id}">
      <button type="button" class="inbox-item-summary" onclick="${toggleAttr}" aria-expanded="${isExpanded ? 'true' : 'false'}">
        <div class="inbox-item-summary-top">
          ${typeBadge}
          ${priorityBadgeHtml(item)}
          ${unread ? '<span class="inbox-unread-dot" title="Unread"></span>' : ''}
          <span class="inbox-item-time">${when}</span>
          <span class="inbox-item-chev" aria-hidden="true">${isExpanded ? '▾' : '▸'}</span>
        </div>
        <div class="inbox-item-summary-title">${escapeHtml(item.title || item.subject || 'Announcement')}</div>
        <div class="inbox-item-summary-meta">${metaLine}</div>
        ${isExpanded ? '' : `<p class="inbox-item-preview">${escapeHtml(announcementPreviewText(item))}</p>`}
      </button>
      ${isExpanded ? `
        <div class="inbox-item-detail">
          <p style="margin:0;color:var(--text-dark);font-size:0.85rem;white-space:pre-wrap;">${escapeHtml(item.body || item.message || '')}</p>
          <div class="inbox-item-actions" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            ${actionsHtml}
          </div>
        </div>` : ''}
    </li>`;
}

function renderTeacherConcernRow(item) {
  const studentBit = item.student_name
    ? `${escapeHtml(item.student_name)} (Grade ${item.grade_level || '?'}-${escapeHtml(item.section || '?')})`
    : 'N/A';
  return renderMailConcernRow(item, {
    expandedId: teacherExpandedConcernId,
    toggleFn: 'toggleTeacherConcern',
    badgeLabel: item.parent_name || 'Parent',
    metaLine: `Student: ${studentBit}`,
    canReply: true
  });
}

function renderTeacherAnnouncementRow(item) {
  const unread = isUnread(item);
  return renderMailAnnouncementRow(item, {
    expandedId: teacherExpandedAnnouncementId,
    toggleFn: 'toggleTeacherAnnouncement',
    showTypeBadge: false,
    metaLine: `From: ${escapeHtml(item.sender_name || 'Admin')} | ${escapeHtml(announcementMeta(item))}`,
    actionsHtml: `<button type="button" class="chip-ghost announcement-read-btn ${unread ? 'primary' : ''}" onclick="toggleAnnouncementRead(${item.id}, ${!unread})">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>`
  });
}

let teacherInboxFilter = 'unresolved';
let teacherExpandedConcernId = null;
let teacherExpandedAnnouncementId = null;
let teacherInboxSearchQuery = '';
let teacherInboxCache = { announcements: [], concerns: [] };

async function markTeacherConcernRead(id) {
  await markConcernReadForRole(id);
}

window.toggleTeacherConcern = async function(id) {
  const concernId = Number(id);
  if (!concernId) return;
  if (Number(teacherExpandedConcernId) === concernId) {
    teacherExpandedConcernId = null;
    paintTeacherInboxList();
    return;
  }
  teacherExpandedConcernId = concernId;
  teacherExpandedAnnouncementId = null;
  await markTeacherConcernRead(concernId);
  const cached = teacherInboxCache.concerns.find((c) => Number(c.id) === concernId);
  if (cached) {
    cached.is_read = 1;
    cached.read_at = new Date().toISOString();
  }
  paintTeacherInboxList();
  updateTeacherInboxBadge();
};

window.toggleTeacherAnnouncement = async function(id) {
  const announcementId = Number(id);
  if (!announcementId) return;
  if (Number(teacherExpandedAnnouncementId) === announcementId) {
    teacherExpandedAnnouncementId = null;
    paintTeacherInboxList();
    return;
  }
  teacherExpandedAnnouncementId = announcementId;
  teacherExpandedConcernId = null;

  const cached = teacherInboxCache.announcements.find((a) => Number(a.id) === announcementId);
  if (cached && isUnread(cached)) {
    try {
      await fetch(`${API_URL}/admin/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      cached.is_read = 1;
    } catch (err) {
      console.error('Mark announcement read error:', err);
    }
  }
  paintTeacherInboxList();
  updateTeacherInboxBadge();
};

function setInboxDotBadge(badgeEl, count, label = 'unread messages') {
  if (!badgeEl) return;
  const n = Number(count) || 0;
  badgeEl.textContent = '';
  badgeEl.classList.add('inbox-badge--dot');
  badgeEl.hidden = n === 0;
  if (n > 0) {
    badgeEl.setAttribute('aria-label', `${n} ${label}`);
    badgeEl.removeAttribute('aria-hidden');
  } else {
    badgeEl.removeAttribute('aria-label');
    badgeEl.setAttribute('aria-hidden', 'true');
  }
}

function setInboxFilterCounts(buttons, countsByKey, dataAttr) {
  if (!buttons?.forEach) return;
  buttons.forEach((btn) => {
    const key = btn.getAttribute(dataAttr);
    if (!key) return;
    const hasCount = Object.prototype.hasOwnProperty.call(countsByKey, key);
    const n = Number(countsByKey[key]) || 0;
    let badge = btn.querySelector('.inbox-filter-count');
    if (!hasCount || n <= 0) {
      if (badge) badge.hidden = true;
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'inbox-filter-count';
      badge.setAttribute('aria-hidden', 'true');
      btn.appendChild(badge);
    }
    badge.textContent = String(n);
    badge.hidden = false;
  });
}

function updateTeacherInboxBadge() {
  const badgeEl = document.getElementById('teacher-inbox-badge');
  const unreadAnnouncements = (teacherInboxCache.announcements || []).filter((a) => isUnread(a)).length;
  const openConcerns = (teacherInboxCache.concerns || []).filter((c) => concernIsOpen(c)).length;
  // Dot = still has unresolved work OR unread admin notices
  setInboxDotBadge(badgeEl, openConcerns + unreadAnnouncements, 'inbox items needing attention');
}

function updateTeacherInboxFilterCounts() {
  const concerns = teacherInboxCache.concerns || [];
  const announcements = teacherInboxCache.announcements || [];
  setInboxFilterCounts(
    document.querySelectorAll('#teacher-panel-inbox [data-inbox-filter]'),
    {
      unresolved: concerns.filter((c) => concernIsOpen(c)).length,
      // resolved: no count
      admin: announcements.filter((a) => isUnread(a)).length
    },
    'data-inbox-filter'
  );
}

function paintTeacherInboxList() {
  const listEl = document.getElementById('teacher-inbox-list');
  if (!listEl) return;
  const filter = teacherInboxFilter || 'unresolved';
  const q = teacherInboxSearchQuery;

  document.querySelectorAll('#teacher-panel-inbox [data-inbox-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.inboxFilter === filter);
  });
  updateTeacherInboxFilterCounts();

  let items = [];
  if (filter === 'admin') {
    items = (teacherInboxCache.announcements || []).map((a) => ({ ...a, type: 'admin' }));
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (filter === 'resolved') {
    items = (teacherInboxCache.concerns || [])
      .filter((c) => !concernIsOpen(c))
      .map((c) => ({ ...c, type: 'parent' }));
    items.sort((a, b) => concernActivityTime(b) - concernActivityTime(a));
  } else {
    items = (teacherInboxCache.concerns || [])
      .filter((c) => concernIsOpen(c))
      .map((c) => ({ ...c, type: 'parent' }));
    items.sort((a, b) => concernActivityTime(b) - concernActivityTime(a));
  }

  items = items.filter((item) => matchesInboxSearch(item, q));

  const unreadAdmin = (teacherInboxCache.announcements || []).filter((a) => isUnread(a)).length;
  const markAllBtn = filter === 'admin' && unreadAdmin > 0 && !String(q || '').trim()
    ? `<div style="margin-bottom:10px;"><button class="chip-ghost primary" onclick="markAllAnnouncementsRead()">Mark All as Read (${unreadAdmin})</button></div>`
    : '';

  if (!items.length) {
    const emptyLabel = String(q || '').trim()
      ? 'matches'
      : filter === 'admin'
        ? 'admin announcements'
        : filter === 'resolved'
          ? 'resolved concerns'
          : 'unresolved concerns';
    listEl.innerHTML = markAllBtn + `<li class="empty-state"><p>No ${emptyLabel}</p></li>`;
    return;
  }

  listEl.innerHTML = markAllBtn + items.map((item) => (
    item.type === 'admin' ? renderTeacherAnnouncementRow(item) : renderTeacherConcernRow(item)
  )).join('');
}

async function loadTeacherInbox(filter = teacherInboxFilter || 'unresolved') {
  const listEl = document.getElementById('teacher-inbox-list');
  if (!listEl) return;

  teacherInboxFilter = filter || 'unresolved';
  if (teacherInboxFilter === 'all' || teacherInboxFilter === 'parent') {
    teacherInboxFilter = 'unresolved';
  }

  document.querySelectorAll('[data-inbox-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.inboxFilter === teacherInboxFilter);
  });

  try {
    const res = await fetch(`${API_URL}/teacher/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    teacherInboxCache = {
      announcements: Array.isArray(data.announcements) ? data.announcements : [],
      concerns: Array.isArray(data.concerns) ? data.concerns : []
    };

    // Keep expanded only if still present
    if (teacherExpandedConcernId) {
      const stillThere = teacherInboxCache.concerns.some(
        (c) => Number(c.id) === Number(teacherExpandedConcernId)
      );
      if (!stillThere) teacherExpandedConcernId = null;
    }

    updateTeacherInboxBadge();
    paintTeacherInboxList();
    wireInboxSearch({
      inputId: 'teacher-inbox-search',
      clearId: 'teacher-inbox-search-clear',
      getValue: () => teacherInboxSearchQuery,
      setValue: (v) => { teacherInboxSearchQuery = v; },
      onChange: () => paintTeacherInboxList()
    });
  } catch (err) {
    console.error('Load teacher inbox error:', err);
    listEl.innerHTML = '<li class="empty-state"><p>Failed to load inbox</p></li>';
    const badgeEl = document.getElementById('teacher-inbox-badge');
    if (badgeEl) badgeEl.hidden = true;
  }
}

async function refreshParentInboxBadge() {
  try {
    const [inboxRes, concernsRes] = await Promise.all([
      fetch(`${API_URL}/parent/inbox`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/parent/concerns`, { headers: getAuthHeaders() })
    ]);
    const data = await inboxRes.json();
    const concerns = await concernsRes.json();
    if (!inboxRes.ok) throw new Error(data.error);
    const announcements = data.announcements || [];
    const notices = data.messages || [];
    const concernRows = Array.isArray(concerns) ? concerns : [];
    const unreadCount = announcements.filter((a) => isUnread(a)).length
      + notices.filter((m) => m.is_read === 0 || m.is_read === false).length
      + concernRows.filter((c) => concernIsOpen(c) && isConcernUnread(c)).length;
    const badgeEl = document.getElementById('parent-inbox-badge');
    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.hidden = unreadCount === 0;
    }
  } catch (err) {
    console.error('Refresh parent badge error:', err);
  }
}

async function toggleAnnouncementRead(id, currentReadState) {
  try {
    const method = currentReadState ? 'DELETE' : 'POST';
    const res = await fetch(`${API_URL}/admin/announcements/${id}/read`, {
      method,
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to update');

    // Refresh the currently visible list
    const activeAdminTab = document.querySelector('[data-admin-tab].active')?.dataset.adminTab;
    if (activeAdminTab === 'announcements') loadAdminAnnouncements();

    const activeTeacherPanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    if (activeTeacherPanel === 'inbox') loadTeacherInbox();

    const activeParentTab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab;
    if (activeParentTab === 'inbox') renderParentInbox();

    // Always refresh inbox badge counts
    loadTeacherInbox();
    refreshParentInboxBadge();
  } catch (err) {
    console.error('Toggle read error:', err);
  }
}

window.toggleParentMessageRead = async function(id, currentlyUnread) {
  try {
    const res = await fetch(`${API_URL}/parent/messages/${id}/read`, {
      method: currentlyUnread ? 'POST' : 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    renderParentInbox();
    refreshParentInboxBadge();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#1b5e20' : '#b71c1c';
  const icon = type === 'success' ? '✓' : '✕';

  toast.style.cssText = `
    background: ${bgColor};
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 280px;
    pointer-events: auto;
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  `;

  toast.innerHTML = `<span style="font-size:1.1rem;line-height:1;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

async function markAllAnnouncementsRead() {
  // Scope to the currently visible list only
  let container = null;

  const activeAdminTab = document.querySelector('[data-admin-tab].active')?.dataset.adminTab;
  if (activeAdminTab === 'announcements') container = document.getElementById('admin-announcement-list');

  const activeTeacherPanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
  if (activeTeacherPanel === 'inbox') container = document.getElementById('teacher-inbox-list');

  const activeParentTab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab;
  if (activeParentTab === 'inbox') {
    container = document.querySelector('#parent-content .inbox-list');
  }

  const unreadBtns = container
    ? container.querySelectorAll('.announcement-read-btn[data-unread="true"]')
    : [];

  const ids = Array.from(unreadBtns).map(btn => parseInt(btn.dataset.id));
  if (ids.length === 0) return;

  if (!confirm(`Mark all ${ids.length} announcement${ids.length > 1 ? 's' : ''} as read?`)) return;

  try {
    const res = await fetch(`${API_URL}/admin/announcements/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ announcement_ids: ids })
    });
    if (!res.ok) throw new Error('Failed');

    // Refresh the currently visible list
    if (activeAdminTab === 'announcements') loadAdminAnnouncements();
    if (activeTeacherPanel === 'inbox') loadTeacherInbox();
    if (activeParentTab === 'inbox') renderParentInbox();

    // Always refresh inbox badge counts
    loadTeacherInbox();
  } catch (err) {
    console.error('Mark all read error:', err);
  }
}

// ========== ADMIN TAB SWITCHING (single source of truth) ==========
function scrollPortalMain(viewId) {
  const view = document.getElementById(viewId);
  const main = view?.querySelector('.dash-main') || view?.querySelector('.admin-main');
  if (main) main.scrollTop = 0;
}

const ADMIN_ADD_MODAL_IDS = [
  'add-account-modal',
  'add-student-modal',
  'add-subject-modal',
  'compose-announcement-modal'
];

function closeAllAdminAddModals() {
  ADMIN_ADD_MODAL_IDS.forEach((id) => {
    const modal = document.getElementById(id);
    if (modal && !modal.hasAttribute('hidden')) closeAdminModal(id);
  });
}

function resetAdminTabState(tabId) {
  if (tabId === 'students') {
    clearStudentFilters();
  }
  if (tabId === 'accounts') {
    currentAccountRoleFilter = 'all';
    currentAccountStatusFilter = 'active';
    currentAccountSearch = '';
    currentAccountSort = 'az';
    const searchInput = document.getElementById('admin-account-search');
    if (searchInput) searchInput.value = '';
    accountSortMenuApi?.sync?.();
    applyAccountFilters();
  }
}

function resetTeacherPanelState(panelId) {
  if (panelId === 'progress') {
    showProgressCreateForm(false);
    const editor = document.getElementById('progress-editor');
    if (editor) {
      editor.hidden = true;
      editor.setAttribute('hidden', '');
    }
    setProgressListChromeVisible(true);
    const listWrap = document.getElementById('progress-list-wrap');
    if (listWrap) {
      listWrap.hidden = false;
      listWrap.removeAttribute('hidden');
    }
    const progressSearch = document.getElementById('progress-search-input');
    if (progressSearch) progressSearch.value = '';
    progressTypeFilter = 'all';
    document.querySelectorAll('[data-progress-type]').forEach((btn) => {
      btn.classList.toggle('active', (btn.dataset.progressType || 'all') === 'all');
    });
  }

  if (panelId === 'quiz-bank') {
    questionBankCurrentSetId = null;
    questionBankCurrentSet = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    showQuizBankListView();
    if (typeof updateQuizBankSelectionMeta === 'function') updateQuizBankSelectionMeta();
  }

  if (panelId === 'inbox') {
    document.querySelectorAll('[data-inbox-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.inboxFilter === 'unresolved');
    });
  }
}

function resetParentTabState(tabId) {
  if (tabId === 'inbox') parentInboxFilter = 'unresolved';
  if (tabId === 'attendance') {
    parentAttendanceStatus = 'all';
    // keep month preference across visits
  }
}

const adminTabHistory = [];
let isNavigatingBack = false;

const adminBackBtn = document.getElementById('admin-back-btn');

function updateBackButton() {
  if (adminBackBtn) {
    adminBackBtn.style.display = adminTabHistory.length > 0 ? 'inline-flex' : 'none';
  }
}

if (adminBackBtn) {
  adminBackBtn.addEventListener('click', () => {
    if (adminTabHistory.length > 0) {
      isNavigatingBack = true;
      const prevTab = adminTabHistory.pop();
      document.querySelector(`[data-admin-tab="${prevTab}"]`)?.click();
    }
  });
}

document.querySelectorAll('[data-admin-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentTab = document.querySelector('[data-admin-tab].active')?.dataset.adminTab;
    const tabId = btn.dataset.adminTab;

    // Record history
    if (!isNavigatingBack && currentTab && currentTab !== tabId) {
      resetAdminTabState(currentTab);
      adminTabHistory.push(currentTab);
      updateBackButton();
    }
    isNavigatingBack = false;

    closeAllAdminAddModals();

    document.querySelectorAll('[data-admin-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.hidden = tab.id !== `admin-tab-${tabId}`;
    });

    if (tabId === 'overview') { loadOverviewStats(); loadActivityLog(); }
    if (tabId === 'accounts') { 
      loadAccountsTable(); 
    }
    if (tabId === 'students') { loadDropdowns(); loadStudentsTable(); }
    if (tabId === 'subjects') loadSubjectsTable();
    if (tabId === 'inbox') loadAdminInbox('unresolved');
    if (tabId === 'announcements') loadAdminAnnouncements();
    scrollPortalMain('view-admin');
    closeMobileNav();
  });
});

// Filter buttons inside Accounts tab
document.querySelectorAll('[data-account-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentAccountRoleFilter = btn.dataset.accountFilter;
    applyAccountFilters();
  });
});

document.querySelectorAll('[data-account-status]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentAccountStatusFilter = btn.dataset.accountStatus;
    applyAccountFilters();
  });
});

document.getElementById('admin-account-search')?.addEventListener('input', (e) => {
  currentAccountSearch = e.target.value || '';
  applyAccountFilters();
});

accountSortMenuApi = wireDownloadSelectMenu({
  menuId: 'admin-account-sort-menu',
  btnId: 'admin-account-sort-btn',
  panelId: 'admin-account-sort-panel',
  options: [
    { value: 'az', label: 'A–Z' },
    { value: 'recent', label: 'Recent' }
  ],
  getValue: () => currentAccountSort,
  setValue: (v) => { currentAccountSort = v === 'recent' ? 'recent' : 'az'; },
  onPick: () => applyAccountFilters(),
  formatButtonLabel: (opt) => (opt?.label || 'A–Z')
});

// Overview / Quick Action links that jump to other tabs
document.querySelectorAll('[data-admin-tab-click]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabId = link.dataset.adminTabClick;
    const roleFilter = link.dataset.roleFilter;
    const openModal = link.dataset.openModal;
    document.querySelector(`[data-admin-tab="${tabId}"]`)?.click();

    if (roleFilter) {
      currentAccountRoleFilter = roleFilter;
      currentAccountStatusFilter = 'active';
      setTimeout(() => applyAccountFilters(), 50);
    }

    if (openModal) {
      setTimeout(() => {
        openAdminModal(openModal);
        if (openModal === 'add-student-modal') loadDropdowns();
      }, 80);
    }
  });
});

wireAdminModal('add-account-modal', 'open-add-account-modal');
wireAdminModal('add-student-modal', 'open-add-student-modal');
wireAdminModal('add-subject-modal', 'open-add-subject-modal');
wireAdminModal('compose-announcement-modal', 'open-compose-announcement-modal');
wireSimpleModal('teacher-add-student-modal');
wireSimpleModal('progress-create-modal');
wireSimpleModal('teacher-notice-modal');
wireSimpleModal('upload-material-modal');
wireSimpleModal('ai-generate-count-modal');
wireSimpleModal('qb-exam-modal');
wireSimpleModal('parent-concern-modal');
wireSimpleModal('progress-makeup-modal');

document.getElementById('parent-concern-form')?.addEventListener('submit', submitParentConcern);
document.getElementById('concern-student')?.addEventListener('change', (e) => {
  const studentId = e.target.value;
  const selected = (parentAllChildren || []).find((c) => String(c.id) === String(studentId));
  if (selected) parentCurrentChild = selected;
  loadContactTeachers(studentId);
});

document.getElementById('open-upload-material-modal')?.addEventListener('click', async () => {
  await ensureTeacherAssignedClasses();
  await loadTeacherSubjects(true);
  fillLessonPlanGradeOptions();
  fillTeacherSubjectSelects();
  const msg = document.getElementById('lp-message');
  if (msg) msg.textContent = '';
  const form = document.getElementById('upload-material-form');
  form?.reset();
  fillLessonPlanGradeOptions();
  fillTeacherSubjectSelects();
  const modal = document.getElementById('upload-material-modal');
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
  }
});

document.getElementById('open-teacher-notice-modal')?.addEventListener('click', async () => {
  await ensureTeacherAssignedClasses();
  fillTeacherNoticeClasses();
  const msgEl = document.getElementById('teacher-notice-msg');
  if (msgEl) msgEl.textContent = '';
  const modal = document.getElementById('teacher-notice-modal');
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
  }
});

document.getElementById('open-add-student-modal')?.addEventListener('click', () => loadDropdowns());
document.getElementById('open-compose-announcement-modal')?.addEventListener('click', () => updateAnnouncementScopeFields());


let parentInboxFilter = 'unresolved';
let parentInboxSearchQuery = '';
let parentExpandedInboxKey = null;
let parentExpandedConcernId = null;
let parentInboxCache = { announcements: [], messages: [], concerns: [] };

function paintParentInboxList() {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  const announcements = parentInboxCache.announcements || [];
  const notices = parentInboxCache.messages || [];
  const concerns = parentInboxCache.concerns || [];
  const isAdminAnnouncement = (a) => String(a.sender_role || 'admin') !== 'teacher';
  const filter = parentInboxFilter || 'unresolved';
  const q = parentInboxSearchQuery;

  const unreadAnn = announcements.filter((a) => isUnread(a)).length;
  const unreadMsg = notices.filter((m) => m.is_read === 0 || m.is_read === false).length;
  const openConcerns = concerns.filter((c) => concernIsOpen(c)).length;
  // Dot = unresolved concerns OR unread admin/teacher items
  const badgeCount = openConcerns + unreadAnn + unreadMsg;

  document.querySelectorAll('[data-parent-inbox-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.parentInboxFilter === filter);
  });

  setInboxFilterCounts(
    document.querySelectorAll('[data-parent-inbox-filter]'),
    {
      unresolved: concerns.filter((c) => concernIsOpen(c)).length,
      // resolved: no count
      admin: announcements.filter((a) => isAdminAnnouncement(a) && isUnread(a)).length,
      teacher:
        notices.filter((m) => m.is_read === 0 || m.is_read === false).length +
        announcements.filter((a) => !isAdminAnnouncement(a) && isUnread(a)).length
    },
    'data-parent-inbox-filter'
  );

  let html = '';
  let emptyLabel = 'messages';

  if (filter === 'unresolved' || filter === 'resolved') {
    let items = concerns.filter((c) =>
      filter === 'resolved' ? !concernIsOpen(c) : concernIsOpen(c)
    );
    items.sort((a, b) => concernActivityTime(b) - concernActivityTime(a));
    items = items.filter((c) => matchesInboxSearch(c, q));
    emptyLabel = String(q || '').trim()
      ? 'matches'
      : filter === 'resolved' ? 'resolved concerns' : 'unresolved concerns';
    html = items.map((c) => renderMailConcernRow(c, {
      expandedId: parentExpandedConcernId,
      toggleFn: 'toggleParentConcern',
      badgeLabel: c.teacher_name || 'Teacher',
      metaLine: `Student: ${escapeHtml(c.student_name || 'N/A')}`,
      canReply: true
    })).join('');
  } else if (filter === 'admin') {
    let shownAnn = announcements.filter(isAdminAnnouncement);
    shownAnn = shownAnn.filter((a) => matchesInboxSearch(a, q));
    shownAnn.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    emptyLabel = String(q || '').trim() ? 'matches' : 'admin announcements';
    html = shownAnn.map((a) => {
      const key = `ann-${a.id}`;
      const unread = isUnread(a);
      return renderMailAnnouncementRow(a, {
        expanded: parentExpandedInboxKey === key,
        onToggle: `toggleParentInboxItem('${key}')`,
        showTypeBadge: false,
        metaLine: `From: ${escapeHtml(a.sender_name || 'Admin')} | ${escapeHtml(announcementMeta(a))}`,
        actionsHtml: `<button type="button" class="chip-ghost announcement-read-btn ${unread ? 'primary' : ''}" onclick="toggleAnnouncementRead(${a.id}, ${!unread})">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>`
      });
    }).join('');
  } else {
    // teacher notices + teacher-sent announcements (newest first, interleaved)
    let shownAnn = announcements.filter((a) => !isAdminAnnouncement(a));
    let shownNotices = [...notices];
    shownAnn = shownAnn.filter((a) => matchesInboxSearch(a, q));
    shownNotices = shownNotices.filter((m) => matchesInboxSearch({
      ...m,
      title: m.subject,
      body: m.message
    }, q));
    emptyLabel = String(q || '').trim() ? 'matches' : 'teacher notices';

    const merged = [
      ...shownNotices.map((m) => ({
        kind: 'msg',
        t: new Date(m.created_at || 0).getTime() || 0,
        m
      })),
      ...shownAnn.map((a) => ({
        kind: 'ann',
        t: new Date(a.created_at || 0).getTime() || 0,
        a
      }))
    ].sort((x, y) => y.t - x.t);

    html = merged.map((row) => {
      if (row.kind === 'msg') {
        const m = row.m;
        const key = `msg-${m.id}`;
        const unread = m.is_read === 0 || m.is_read === false;
        const item = { ...m, title: m.subject, body: m.message, is_read: unread ? 0 : 1 };
        return renderMailAnnouncementRow(item, {
          expanded: parentExpandedInboxKey === key,
          onToggle: `toggleParentInboxItem('${key}')`,
          badgeLabel: 'Teacher notice',
          badgeColor: 'var(--orange)',
          metaLine: `From: ${escapeHtml(m.sender_name || 'Teacher')}${m.student_name ? ` · Student: ${escapeHtml(m.student_name)}` : ''}`,
          actionsHtml: `<button type="button" class="chip-ghost ${unread ? 'primary' : ''}" onclick="toggleParentMessageRead(${m.id}, ${unread})">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>`
        });
      }
      const a = row.a;
      const key = `ann-${a.id}`;
      const unread = isUnread(a);
      return renderMailAnnouncementRow(a, {
        expanded: parentExpandedInboxKey === key,
        onToggle: `toggleParentInboxItem('${key}')`,
        badgeLabel: 'Class notice',
        badgeColor: 'var(--orange)',
        metaLine: `From: ${escapeHtml(a.sender_name || 'Teacher')} | ${escapeHtml(announcementMeta(a))}`,
        actionsHtml: `<button type="button" class="chip-ghost announcement-read-btn ${unread ? 'primary' : ''}" onclick="toggleAnnouncementRead(${a.id}, ${!unread})">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>`
      });
    }).join('');
  }

  const markAllBtn = filter === 'admin' && unreadAnn > 0 && !String(q || '').trim()
    ? `<div style="margin-bottom:10px;"><button class="chip-ghost primary" onclick="markAllAnnouncementsRead()">Mark All Announcements Read (${unreadAnn})</button></div>`
    : '';

  const listHost = contentEl.querySelector('#parent-inbox-list');
  const markAllHost = contentEl.querySelector('#parent-inbox-markall');
  if (markAllHost) markAllHost.innerHTML = markAllBtn;
  if (listHost) {
    listHost.innerHTML = html || `<li class="empty-state"><p>No ${emptyLabel}</p></li>`;
  }

  const badgeEl = document.getElementById('parent-inbox-badge');
  setInboxDotBadge(badgeEl, badgeCount, 'inbox items needing attention');
}

async function renderParentInbox() {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  if (parentInboxFilter === 'all' || parentInboxFilter === 'contact') {
    parentInboxFilter = 'unresolved';
  }

  try {
    const [inboxRes, concernsRes] = await Promise.all([
      fetch(`${API_URL}/parent/inbox`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/parent/concerns`, { headers: getAuthHeaders() })
    ]);
    const inboxData = await inboxRes.json();
    const concernsData = await concernsRes.json();
    if (!inboxRes.ok) throw new Error(inboxData.error);
    if (!concernsRes.ok) throw new Error(concernsData.error);

    parentInboxCache = {
      announcements: Array.isArray(inboxData.announcements) ? inboxData.announcements : [],
      messages: Array.isArray(inboxData.messages) ? inboxData.messages : [],
      concerns: Array.isArray(concernsData) ? concernsData : []
    };
    parentConcernsCache = parentInboxCache.concerns;

    if (parentExpandedConcernId) {
      const still = parentInboxCache.concerns.some((c) => Number(c.id) === Number(parentExpandedConcernId));
      if (!still) parentExpandedConcernId = null;
    }

    const filter = parentInboxFilter || 'unresolved';
    contentEl.innerHTML = `
      <div class="parent-main">
        <div class="chart-card">
          <div class="teacher-header-row">
            <div>
              <h3 class="page-heading font-heading" style="font-size:1.15rem;margin:0;">Inbox</h3>
              <p class="page-subheading" style="margin:4px 0 0;">Concerns, teacher notices, and school announcements.</p>
            </div>
            <button type="button" class="btn-toolbar btn-toolbar--solid" id="open-parent-concern-modal">+ Send Concern</button>
          </div>
          <div class="inbox-filters">
            <button type="button" class="${filter === 'unresolved' ? 'active' : ''}" data-parent-inbox-filter="unresolved">Unresolved</button>
            <button type="button" class="${filter === 'resolved' ? 'active' : ''}" data-parent-inbox-filter="resolved">Resolved</button>
            <button type="button" class="${filter === 'admin' ? 'active' : ''}" data-parent-inbox-filter="admin">Admin</button>
            <button type="button" class="${filter === 'teacher' ? 'active' : ''}" data-parent-inbox-filter="teacher">Teacher</button>
          </div>
          <div class="inbox-search-bar">
            <input type="search" id="parent-inbox-search" class="inbox-search-input" placeholder="Search messages…" value="${escapeHtml(parentInboxSearchQuery)}" autocomplete="off" />
            <button type="button" class="inbox-search-clear" id="parent-inbox-search-clear" title="Clear search" ${String(parentInboxSearchQuery || '').trim() ? '' : 'hidden'}>×</button>
          </div>
          <div id="parent-inbox-markall"></div>
          <ul id="parent-inbox-list" class="inbox-list" style="list-style:none;padding:0;margin:0;"></ul>
        </div>
      </div>
    `;

    contentEl.querySelectorAll('[data-parent-inbox-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        parentInboxFilter = btn.dataset.parentInboxFilter;
        parentExpandedInboxKey = null;
        parentExpandedConcernId = null;
        paintParentInboxList();
      });
    });

    document.getElementById('open-parent-concern-modal')?.addEventListener('click', () => openParentConcernModal());

    const searchInput = document.getElementById('parent-inbox-search');
    if (searchInput) searchInput.dataset.searchWired = '';
    wireInboxSearch({
      inputId: 'parent-inbox-search',
      clearId: 'parent-inbox-search-clear',
      getValue: () => parentInboxSearchQuery,
      setValue: (v) => { parentInboxSearchQuery = v; },
      onChange: () => paintParentInboxList()
    });

    paintParentInboxList();
  } catch (err) {
    console.error('Load parent inbox error:', err);
    contentEl.innerHTML = `<div class="parent-main"><div class="chart-card"><p style="color:#b71c1c;">Failed to load inbox</p></div></div>`;
  }
}

window.toggleParentInboxItem = async function(key) {
  if (!key) return;
  if (parentExpandedInboxKey === key) {
    parentExpandedInboxKey = null;
  } else {
    parentExpandedInboxKey = key;
    parentExpandedConcernId = null;
    if (String(key).startsWith('msg-')) {
      const id = Number(String(key).slice(4));
      if (id) {
        try {
          await fetch(`${API_URL}/parent/messages/${id}/read`, {
            method: 'POST',
            headers: getAuthHeaders()
          });
          const msg = parentInboxCache.messages.find((m) => Number(m.id) === id);
          if (msg) msg.is_read = 1;
        } catch (_) { /* ignore */ }
      }
    } else if (String(key).startsWith('ann-')) {
      const id = Number(String(key).slice(4));
      if (id) {
        try {
          await fetch(`${API_URL}/admin/announcements/${id}/read`, {
            method: 'POST',
            headers: getAuthHeaders()
          });
          const ann = parentInboxCache.announcements.find((a) => Number(a.id) === id);
          if (ann) ann.is_read = 1;
        } catch (_) { /* ignore */ }
      }
    }
  }
  paintParentInboxList();
};

// ========== TEACHER PANEL SWITCHING ==========
const teacherTabHistory = [];
let isTeacherNavigatingBack = false;
const teacherBackBtn = document.getElementById('teacher-back-btn');
const TEACHER_PANEL_TITLES = {
  classroom: 'Teacher Portal',
  'attendance-sheet': 'Attendance Sheet',
  progress: 'Records',
  'lesson-plans': 'Materials',
  'quiz-bank': 'Classwork',
  inbox: 'Inbox'
};

function updateTeacherBackButton() {
  if (teacherBackBtn) {
    teacherBackBtn.style.display = teacherTabHistory.length > 0 ? 'inline-flex' : 'none';
  }
}

function applyTeacherPanel(panelId) {
  document.querySelectorAll('[data-teacher-panel]').forEach(b => {
    b.classList.toggle('active', b.dataset.teacherPanel === panelId);
  });

  document.querySelectorAll('.teacher-panel').forEach(panel => {
    panel.hidden = panel.id !== `teacher-panel-${panelId}`;
  });

  const classroomSidebar = document.getElementById('teacher-sidebar-classroom');
  // Keep school year + My Classes visible on all teacher panels
  classroomSidebar?.classList.remove('is-hidden');

  const titleEl = document.getElementById('teacher-topbar-title');
  if (titleEl) titleEl.textContent = TEACHER_PANEL_TITLES[panelId] || 'Teacher Portal';

  if (panelId === 'inbox') {
    loadTeacherInbox('unresolved');
    fillTeacherNoticeClasses();
  }
  if (panelId === 'lesson-plans') {
    loadTeacherSubjects();
    ensureTeacherAssignedClasses().then(() => fillLessonPlanGradeOptions());
    loadLessonPlans();
    loadAiRecommendations();
    loadAiStatusHint();
  }
  if (panelId === 'quiz-bank') {
    Promise.all([ensureTeacherAssignedClasses(), loadTeacherSubjects()]).then(() => {
      fillQuizBankGradeFilter();
      fillQuizBankSubjectFilter();
      loadQuestionBank();
    });
  }
  if (panelId === 'attendance-sheet') {
    if (!attendanceSheetWeekStart) {
      attendanceSheetWeekStart = weekStartMondayClient(localISODate());
    }
    loadAttendanceSheet();
  }
  if (panelId === 'classroom') {
    if (teacherCurrentClass?.grade && teacherCurrentClass?.section) {
      syncClassroomAttendanceChrome();
      Promise.all([
        loadClassStats(teacherCurrentClass.grade, teacherCurrentClass.section),
        loadRoster(teacherCurrentClass.grade, teacherCurrentClass.section)
      ]);
    }
  }
  if (panelId === 'progress') {
    applyQuarterUnlockUI();
    loadTeacherSubjects();
    loadProgressList();
    const progressMeta = document.getElementById('progress-class-meta');
    if (progressMeta && teacherCurrentClass) {
      progressMeta.textContent = progressSubjectFilter
        ? `Grade ${teacherCurrentClass.grade} – ${teacherCurrentClass.section} · ${progressSubjectFilter} · ${teacherCurrentQuarter}`
        : `Grade ${teacherCurrentClass.grade} – ${teacherCurrentClass.section} · ${teacherCurrentQuarter} · Quizzes, activities, and exams for this class.`;
    }
  }
}

if (teacherBackBtn) {
  teacherBackBtn.addEventListener('click', () => {
    if (teacherTabHistory.length > 0) {
      isTeacherNavigatingBack = true;
      const prevPanel = teacherTabHistory.pop();
      applyTeacherPanel(prevPanel);
        updateTeacherBackButton();
      isTeacherNavigatingBack = false;
    }
  });
}

document.querySelectorAll('[data-teacher-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentPanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    const panelId = btn.dataset.teacherPanel;

    if (!isTeacherNavigatingBack && currentPanel && currentPanel !== panelId) {
      resetTeacherPanelState(currentPanel);
      teacherTabHistory.push(currentPanel);
      updateTeacherBackButton();
    }
    isTeacherNavigatingBack = false;

    applyTeacherPanel(panelId);
    scrollPortalMain('view-teacher');
    closeMobileNav();
  });
});

function closeMobileNav(frame) {
  const frames = frame
    ? [frame]
    : document.querySelectorAll('.dash-frame.is-mobile-nav-open');
  frames.forEach((f) => {
    f.classList.remove('is-mobile-nav-open');
    const backdrop = f.querySelector('[data-mobile-backdrop]');
    if (backdrop) backdrop.hidden = true;
  });
}

function openMobileNav(frame) {
  if (!frame) return;
  frame.classList.add('is-mobile-nav-open');
  const backdrop = frame.querySelector('[data-mobile-backdrop]');
  if (backdrop) backdrop.hidden = false;
}

document.querySelectorAll('.mobile-nav-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const portal = btn.dataset.mobileNav;
    const frame = document.querySelector(`.dash-frame[data-portal="${portal}"]`)
      || btn.closest('.dash-frame');
    if (!frame) return;
    if (frame.classList.contains('is-mobile-nav-open')) closeMobileNav(frame);
    else openMobileNav(frame);
  });
});

document.querySelectorAll('[data-mobile-backdrop]').forEach((el) => {
  el.addEventListener('click', () => {
    closeMobileNav(el.closest('.dash-frame'));
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMobileNav();
});

(function syncConnectedLayoutMode() {
  const mq = window.matchMedia('(max-width: 900px)');
  const apply = () => {
    const mobile = mq.matches;
    document.documentElement.classList.toggle('layout-mobile', mobile);
    document.documentElement.classList.toggle('layout-desktop', !mobile);
    document.body?.classList.toggle('layout-mobile', mobile);
    document.body?.classList.toggle('layout-desktop', !mobile);
  };
  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply);
  else if (mq.addListener) mq.addListener(apply);
})();

// Teacher inbox filter buttons
document.querySelectorAll('[data-inbox-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    teacherExpandedConcernId = null;
    teacherExpandedAnnouncementId = null;
    loadTeacherInbox(btn.dataset.inboxFilter);
  });
});

document.querySelectorAll('[data-admin-inbox-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    adminExpandedConcernId = null;
    loadAdminInbox(btn.dataset.adminInboxFilter);
  });
});

document.getElementById('teacher-inbox-list')?.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('[data-action="toggle-concern"]');
  if (!toggleBtn) return;
  e.preventDefault();
  toggleTeacherConcern(toggleBtn.dataset.concernId);
});

// ========== TEACHER CLASSROOM ==========
let teacherCurrentClass = null;
let teacherAssignedClasses = [];
let rosterData = [];
let attendanceSheetData = [];
let attendanceSheetWeekStart = '';
let attendanceCurrentSession = 'AM';

function isSubjectAttendanceGrade(grade) {
  return Number(grade) >= 4;
}

function weekStartMondayClient(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + offset);
  return dt.toISOString().slice(0, 10);
}

function addDaysISOClient(isoDate, days) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function formatAttendanceShortDate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return String(isoDate || '');
  const yy = String(y).slice(-2);
  return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${yy}`;
}

function formatWeekLabel(weekStart, weekEnd) {
  const end = weekEnd || addDaysISOClient(weekStart, 4);
  return `${formatAttendanceShortDate(weekStart)} – ${formatAttendanceShortDate(end)}`;
}

function attendanceQueryParams() {
  const params = new URLSearchParams();
  if (!teacherCurrentClass) return params;
  if (isSubjectAttendanceGrade(teacherCurrentClass.grade) && teacherCurrentClass.subjectId) {
    params.set('subject_id', String(teacherCurrentClass.subjectId));
  } else {
    params.set('session', attendanceCurrentSession || 'AM');
  }
  return params;
}

function syncClassroomAttendanceChrome() {
  const bar = document.getElementById('attendance-session-bar');
  const hint = document.getElementById('classroom-roster-hint');
  const sessionHint = document.getElementById('attendance-session-hint');
  if (!teacherCurrentClass) {
    if (bar) bar.hidden = true;
    return;
  }
  const subjectMode = isSubjectAttendanceGrade(teacherCurrentClass.grade);
  if (subjectMode) {
    if (bar) bar.hidden = true;
    if (hint) {
      hint.textContent = teacherCurrentClass.subjectName
        ? `Grades 4–6: mark attendance for ${teacherCurrentClass.subjectName} before class starts (P / A / L / E).`
        : 'Grades 4–6: open a subject from My Classes to take attendance before class starts.';
    }
  } else {
    if (bar) bar.hidden = false;
    document.querySelectorAll('.session-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.session === attendanceCurrentSession);
    });
    if (hint) {
      hint.textContent = `Click P, A, L, or E to save ${attendanceCurrentSession === 'PM' ? 'afternoon' : 'morning'} attendance. Mark every student before enabling a quiz.`;
    }
    if (sessionHint) {
      sessionHint.textContent = 'Grades 1–3: class-wide morning and afternoon attendance.';
    }
  }
}

let teacherSubjectsLoaded = false;
let teacherSubjectsCache = [];
let teacherCurrentQuarter = 'Q1';
let progressAssessments = [];
let progressEditorMax = 100;
let progressTypeFilter = 'all';
let progressSubjectFilter = null; // subject name string or null for all

function typeLabel(type) {
  if (type === 'quiz') return 'Quiz';
  if (type === 'activity') return 'Activity';
  if (type === 'exam') return 'Exam';
  return type || 'Record';
}

function bankItemTypeLabelClient(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'mcq') return 'Multiple choice';
  if (t === 'identification') return 'Identification';
  if (t === 'enumeration') return 'Enumeration';
  if (t === 'short_answer') return 'Short answer';
  if (t === 'activity_prompt') return 'Activity';
  return type ? String(type) : 'Multiple choice';
}

const BANK_TYPE_ORDER = ['mcq', 'identification', 'enumeration', 'short_answer', 'activity_prompt'];

function groupBankItemsByType(items) {
  const map = new Map();
  for (const item of items || []) {
    const key = String(item.item_type || 'mcq');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  const ordered = [];
  for (const key of BANK_TYPE_ORDER) {
    if (map.has(key)) {
      ordered.push({ item_type: key, label: bankItemTypeLabelClient(key), items: map.get(key) });
      map.delete(key);
    }
  }
  for (const [key, list] of map.entries()) {
    ordered.push({ item_type: key, label: bankItemTypeLabelClient(key), items: list });
  }
  return ordered;
}

function collectSectionTotalsFromWrap(wrapEl) {
  const out = {};
  if (!wrapEl) return out;
  wrapEl.querySelectorAll('input[data-section-type]').forEach((input) => {
    const key = input.dataset.sectionType;
    const n = Number(input.value);
    if (key && Number.isFinite(n) && n >= 0) out[key] = n;
  });
  return out;
}

function sumSectionTotals(sectionTotals) {
  return Object.values(sectionTotals || {}).reduce((s, n) => s + (Number(n) || 0), 0);
}

function renderScoreSections(wrapId, items, { syncMaxInputId = null, resetValues = true } = {}) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return {};
  const groups = groupBankItemsByType(items);
  if (!groups.length) {
    wrap.hidden = true;
    wrap.innerHTML = '';
    return {};
  }
  wrap.hidden = false;
  const prev = resetValues ? {} : collectSectionTotalsFromWrap(wrap);
  wrap.innerHTML = groups.map((g) => {
    const defaultPts = g.items.reduce((s, it) => s + (Number(it.points) || 1), 0);
    const val = prev[g.item_type] != null ? prev[g.item_type] : Math.round(defaultPts * 100) / 100;
    return `
      <div class="qb-score-section-row">
        <span>${escapeHtml(g.label)} · ${g.items.length} item(s)</span>
        <label>
          <span>Part total</span>
          <input type="number" min="0" max="9999" step="0.5" data-section-type="${escapeHtml(g.item_type)}" value="${val}" />
        </label>
      </div>`;
  }).join('');

  const syncMax = () => {
    const totals = collectSectionTotalsFromWrap(wrap);
    const sum = Math.round(sumSectionTotals(totals) * 100) / 100;
    if (syncMaxInputId) {
      const maxInput = document.getElementById(syncMaxInputId);
      if (maxInput) maxInput.value = String(Math.max(1, sum || 1));
    }
  };

  wrap.querySelectorAll('input[data-section-type]').forEach((input) => {
    input.addEventListener('input', syncMax);
    input.addEventListener('change', syncMax);
  });
  syncMax();
  return collectSectionTotalsFromWrap(wrap);
}

function normalizeClassSubjects(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    if (s && typeof s === 'object') {
      return { id: s.id, name: s.name || s.subject_name || '' };
    }
    return { id: null, name: String(s || '') };
  }).filter(s => s.name);
}

function goToTeacherPanel(panelId) {
  const currentPanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
  if (currentPanel && currentPanel !== panelId) {
    teacherTabHistory.push(currentPanel);
    updateTeacherBackButton();
  }
  applyTeacherPanel(panelId);
}

function renderTeacherClassNav(classes) {
  const listEl = document.getElementById('teacher-class-list');
  if (!listEl) return;

  listEl.innerHTML = classes.map((c, i) => {
    const subjects = normalizeClassSubjects(c.subjects);
    const subjectsHtml = subjects.length
      ? subjects.map(s => `
          <button type="button" class="class-nav-subject"
            data-grade="${c.grade_level}"
            data-section="${c.section}"
            data-subject-id="${s.id || ''}"
            data-subject-name="${String(s.name).replace(/"/g, '&quot;')}">
            ${s.name}
          </button>`).join('')
      : `<span class="class-nav-subject" style="cursor:default;opacity:0.65;">${c.is_class_adviser ? 'Class adviser' : 'No subjects listed'}</span>`;

    return `
      <div class="class-nav-group ${i === 0 ? 'is-expanded' : ''}" data-grade="${c.grade_level}" data-section="${c.section}">
        <button type="button" class="class-nav-item ${i === 0 ? 'active' : ''}"
          data-grade="${c.grade_level}"
          data-section="${c.section}"
          data-action="select-class">
          <span class="pill-icon">🏫</span>
          <span class="pill-class-main">Grade ${c.grade_level} – ${c.section}</span>
          <span class="class-nav-expand" aria-hidden="true">›</span>
        </button>
        <div class="class-nav-subjects">${subjectsHtml}</div>
      </div>`;
  }).join('');
}

async function loadTeacherClasses() {
  const listEl = document.getElementById('teacher-class-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() });
    const classes = await res.json();
    if (!res.ok) throw new Error(classes.error);

    if (!classes.length) {
      teacherAssignedClasses = [];
      fillTeacherNoticeClasses();
      listEl.innerHTML = '<div class="class-nav-empty">No classes assigned</div>';
      return;
    }

    teacherAssignedClasses = classes;
    fillTeacherNoticeClasses();
    renderTeacherClassNav(classes);

    const first = classes[0];
    if (first) {
      await selectTeacherClassContext({
        grade: first.grade_level,
        section: first.section,
        subjectName: null,
        subjectId: null,
        goToPanel: null
      });
    }
  } catch (err) {
    console.error('Load classes error:', err);
    listEl.innerHTML = '<div class="class-nav-empty">Failed to load classes</div>';
  }
}

const myClassesTrigger = document.getElementById('my-classes-trigger');
const myClassesFlyout = document.getElementById('my-classes-flyout');
const myClassesPanel = document.getElementById('teacher-class-list');
if (myClassesTrigger && myClassesFlyout) {
  myClassesTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = myClassesFlyout.classList.toggle('is-open');
    myClassesTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  myClassesPanel?.addEventListener('click', async (e) => {
    const subjectBtn = e.target.closest('.class-nav-subject[data-subject-name]');
    const classBtn = e.target.closest('.class-nav-item[data-action="select-class"]');
    if (!subjectBtn && !classBtn) return;
    e.preventDefault();
    e.stopPropagation();

    // My Classes is a context picker — stay on the current tab
    if (subjectBtn) {
      await selectTeacherClassContext({
        grade: subjectBtn.dataset.grade,
        section: subjectBtn.dataset.section,
        subjectName: subjectBtn.dataset.subjectName || null,
        subjectId: subjectBtn.dataset.subjectId || null,
        goToPanel: null,
        expandGroup: true
      });
      return;
    }

    if (classBtn) {
      await selectTeacherClassContext({
        grade: classBtn.dataset.grade,
        section: classBtn.dataset.section,
        subjectName: null,
        subjectId: null,
        goToPanel: null,
        expandGroup: true
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!myClassesFlyout.contains(e.target)) {
      myClassesFlyout.classList.remove('is-open');
      myClassesTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

async function selectTeacherClassContext({
  grade,
  section,
  subjectName = null,
  subjectId = null,
  goToPanel = null,
  expandGroup = false
}) {
  if (!grade || !section) return;

  const classInfo = (teacherAssignedClasses || []).find(
    c => String(c.grade_level) === String(grade) && String(c.section) === String(section)
  );
  const subjects = normalizeClassSubjects(classInfo?.subjects);

  teacherCurrentClass = {
    grade,
    section,
    subjects,
    subjectName: subjectName || null,
    subjectId: subjectId || null
  };
  progressSubjectFilter = subjectName || null;
  if (teacherSubjectsCache.length) fillTeacherSubjectSelects();

  document.querySelectorAll('#teacher-class-list .class-nav-group').forEach(g => {
    const match = String(g.dataset.grade) === String(grade) && String(g.dataset.section) === String(section);
    if (expandGroup) g.classList.toggle('is-expanded', match);
  });

  document.querySelectorAll('#teacher-class-list .class-nav-item').forEach(btn => {
    const match = String(btn.dataset.grade) === String(grade) && String(btn.dataset.section) === String(section);
    btn.classList.toggle('active', match);
  });

  document.querySelectorAll('#teacher-class-list .class-nav-subject').forEach(btn => {
    const matchClass = String(btn.dataset.grade) === String(grade) && String(btn.dataset.section) === String(section);
    const matchSub = subjectName && btn.dataset.subjectName === subjectName;
    btn.classList.toggle('active', !!(matchClass && matchSub));
  });

  const titleEl = document.getElementById('teacher-class-title');
  const metaEl = document.getElementById('teacher-session-meta');
  const dateEl = document.getElementById('teacher-session-date');
  const modeBadge = document.getElementById('teacher-mode-badge');

  if (titleEl) {
    titleEl.textContent = subjectName
      ? `Grade ${grade} – ${section} · ${subjectName}`
      : `Grade ${grade} – ${section}`;
  }
  if (metaEl) metaEl.style.display = 'flex';
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (modeBadge) modeBadge.textContent = subjectName || (classInfo?.is_class_adviser ? 'Class Adviser' : 'Class');

  const classroomSearch = document.getElementById('classroom-search-input');
  if (classroomSearch) classroomSearch.value = '';
  const sheetSearch = document.getElementById('attendance-sheet-search-input');
  if (sheetSearch) sheetSearch.value = '';

  const progressMeta = document.getElementById('progress-class-meta');
  if (progressMeta) {
    progressMeta.textContent = subjectName
      ? `Grade ${grade} – ${section} · ${subjectName} · ${teacherCurrentQuarter}`
      : `Grade ${grade} – ${section} · ${teacherCurrentQuarter} · Quizzes, activities, and exams for this class.`;
  }

  if (goToPanel === 'classroom') {
    document.getElementById('my-classes-flyout')?.classList.remove('is-open');
    document.getElementById('my-classes-trigger')?.setAttribute('aria-expanded', 'false');
    goToTeacherPanel('classroom');
    syncClassroomAttendanceChrome();
    await Promise.all([loadClassStats(grade, section), loadRoster(grade, section)]);
  } else if (goToPanel === 'progress') {
    document.getElementById('my-classes-flyout')?.classList.remove('is-open');
    document.getElementById('my-classes-trigger')?.setAttribute('aria-expanded', 'false');
    goToTeacherPanel('progress');
  } else if (goToPanel === 'attendance-sheet') {
    document.getElementById('my-classes-flyout')?.classList.remove('is-open');
    document.getElementById('my-classes-trigger')?.setAttribute('aria-expanded', 'false');
    goToTeacherPanel('attendance-sheet');
  } else {
    // Stay on current tab; refresh panels that depend on class/subject context
    document.getElementById('my-classes-flyout')?.classList.remove('is-open');
    document.getElementById('my-classes-trigger')?.setAttribute('aria-expanded', 'false');
    const activePanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    syncClassroomAttendanceChrome();
    if (activePanel === 'classroom' || !activePanel) {
      await Promise.all([loadClassStats(grade, section), loadRoster(grade, section)]);
    }
    if (activePanel === 'progress') loadProgressList();
    if (activePanel === 'attendance-sheet') loadAttendanceSheet();
    if (activePanel === 'quiz-bank') {
      fillQuizBankGradeFilter();
      fillQuizBankSubjectFilter();
      loadQuestionBank();
    }
    if (activePanel === 'lesson-plans') {
      fillLessonPlanGradeOptions();
      loadLessonPlans();
    }
  }
}

window.selectTeacherClass = async function(el) {
  if (!el) return;
  await selectTeacherClassContext({
    grade: el.dataset.grade,
    section: el.dataset.section,
    subjectName: null,
    goToPanel: null,
    expandGroup: true
  });
};

function updateClassStatDisplay(stats, grade, section) {
  const total = Number(stats.total) || 0;
  const present = Number(stats.present) || 0;
  const absent = Number(stats.absent) || 0;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    const totalEl = document.getElementById('stat-total-students');
  if (totalEl) totalEl.textContent = total;

    const infoEl = document.getElementById('stat-class-info');
    if (infoEl) infoEl.textContent = `Grade ${grade}-${section}`;

  const presentEl = document.getElementById('stat-present-today');
  if (presentEl) presentEl.textContent = present;

  const pctEl = document.getElementById('stat-present-pct');
  if (pctEl) pctEl.textContent = `${pct}%`;

  const absentEl = document.getElementById('stat-absent-count');
  if (absentEl) absentEl.textContent = absent;
}

async function loadClassStats(grade, section) {
  try {
    const qs = attendanceQueryParams().toString();
    const res = await fetch(
      `${API_URL}/teacher/stats/${encodeURIComponent(grade)}/${encodeURIComponent(String(section).trim())}${qs ? `?${qs}` : ''}`,
      { headers: getAuthHeaders() }
    );
    const stats = await res.json();
    if (!res.ok) throw new Error(stats.error);
    updateClassStatDisplay(stats, grade, section);
  } catch (err) {
    console.error('Load stats error:', err);
  }
}

function attendanceActionButtons(studentId, status) {
  const current = String(status || '').toLowerCase();
  const presentActive = current === 'present' ? ' is-att-active att-present' : '';
  const absentActive = current === 'absent' ? ' is-att-active att-absent' : '';
  const lateActive = current === 'late' ? ' is-att-active att-late' : '';
  const excusedActive = current === 'excused' ? ' is-att-active att-excused' : '';
  return `
    <div class="att-actions" data-student-id="${studentId}" style="display:flex;gap:6px;flex-wrap:wrap;">
      <button type="button" class="chip-ghost att-btn att-present${presentActive}" onclick="markAttendance(${studentId}, 'Present')" title="Present">P</button>
      <button type="button" class="chip-ghost att-btn att-absent${absentActive}" onclick="markAttendance(${studentId}, 'Absent')" title="Absent">A</button>
      <button type="button" class="chip-ghost att-btn att-late${lateActive}" onclick="markAttendance(${studentId}, 'Late')" title="Late">L</button>
      <button type="button" class="chip-ghost att-btn att-excused${excusedActive}" onclick="markAttendance(${studentId}, 'Excused')" title="Excused (sick / excuse letter)">E</button>
    </div>`;
}

function syncAttendanceActionButtons(studentId, status) {
  const wrap = document.querySelector(`.att-actions[data-student-id="${studentId}"]`);
  if (!wrap) return;
  const current = String(status || '').toLowerCase();
  wrap.querySelectorAll('.att-btn').forEach(btn => {
    btn.classList.remove('is-att-active', 'primary');
  });
  const map = { present: '.att-present', absent: '.att-absent', late: '.att-late', excused: '.att-excused' };
  const sel = map[current];
  if (sel) wrap.querySelector(sel)?.classList.add('is-att-active');
}

function renderRoster(students) {
  const tbody = document.querySelector('#teacher-roster-table tbody');
  if (!tbody) return;

  if (!students.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No students in this class</td></tr>';
      return;
    }

  const sorted = [...students].sort((a, b) => {
    const ga = a.gender === 'M' ? 0 : a.gender === 'F' ? 1 : 2;
    const gb = b.gender === 'M' ? 0 : b.gender === 'F' ? 1 : 2;
    if (ga !== gb) return ga - gb;
    return compareStudentsByName(a, b);
  });

  tbody.innerHTML = sorted.map(s => `
      <tr data-student-id="${s.id}">
        <td class="att-lrn-cell">${escapeHtml(s.lrn || '-')}</td>
        <td class="att-name-cell"><strong>${formatStudentNameStacked(s)}</strong></td>
        <td>${escapeHtml(s.gender || '-')}</td>
        <td>
          <span class="badge ${s.attendance_status ? s.attendance_status.toLowerCase() : 'unrecorded'}" 
                id="att-status-${s.id}">
            ${s.attendance_status || 'Not recorded'}
          </span>
        </td>
        <td>
          ${attendanceActionButtons(s.id, s.attendance_status)}
        </td>
      </tr>
    `).join('');
}

function filterRoster() {
  const query = (document.getElementById('classroom-search-input')?.value || '').trim().toLowerCase();
  if (!query) {
    renderRoster(rosterData);
    return;
  }
  const filtered = rosterData.filter(s => {
    const name = `${s.last_name || ''} ${s.first_name || ''}`.toLowerCase();
    const lrn = String(s.lrn || '').toLowerCase();
    return name.includes(query) || lrn.includes(query);
  });
  renderRoster(filtered);
}

async function refreshClassroomAttendanceStatus() {
  const el = document.getElementById('classroom-attendance-status');
  if (!el || !teacherCurrentClass) return;
  if (isSubjectAttendanceGrade(teacherCurrentClass.grade) && !teacherCurrentClass.subjectId) {
    el.style.display = 'none';
    el.textContent = '';
    return;
  }
  try {
    const qs = attendanceQueryParams().toString();
    const res = await fetch(
      `${API_URL}/teacher/attendance/${encodeURIComponent(teacherCurrentClass.grade)}/${encodeURIComponent(String(teacherCurrentClass.section).trim())}/completion${qs ? `?${qs}` : ''}`,
      { headers: getAuthHeaders() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (data.complete) {
      el.style.display = 'block';
      el.style.color = '#1b5e20';
      el.textContent = `Attendance complete for today (${data.total} students). You can enable a shared link in Records.`;
    } else {
      const n = Array.isArray(data.unmarked) ? data.unmarked.length : 0;
      el.style.display = 'block';
      el.style.color = '#b71c1c';
      el.textContent = n
        ? `${n} student(s) still unmarked — finish attendance before enabling a quiz.`
        : 'Mark attendance for every student before enabling a quiz.';
    }
  } catch (_) {
    el.style.display = 'none';
    el.textContent = '';
  }
}

async function loadRoster(grade, section) {
  const tbody = document.querySelector('#teacher-roster-table tbody');
  if (!tbody) return;
  syncClassroomAttendanceChrome();

  if (isSubjectAttendanceGrade(grade) && !teacherCurrentClass?.subjectId) {
    rosterData = [];
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">Select a subject from My Classes to take attendance.</td></tr>';
    return;
  }

  try {
    const qs = attendanceQueryParams().toString();
    const res = await fetch(
      `${API_URL}/teacher/roster/${encodeURIComponent(grade)}/${encodeURIComponent(String(section).trim())}${qs ? `?${qs}` : ''}`,
      { headers: getAuthHeaders() }
    );
    rosterData = await res.json();
    if (!res.ok) throw new Error(rosterData.error || 'Failed to load roster');
    filterRoster();
    refreshClassroomAttendanceStatus();
  } catch (err) {
    console.error('Load roster error:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">${err.message || 'Failed to load roster'}</td></tr>`;
  }
}

window.markAttendance = async function(studentId, status, opts = {}) {
  try {
    const silent = !!opts.silent;
    const fromRoster = rosterData.find(s => s.id === studentId);
    const prevRaw = fromRoster?.attendance_status || '';
    const prevNorm = String(prevRaw || '').toLowerCase();
    const nextNorm = String(status || '').toLowerCase();

    if (prevNorm && prevNorm === nextNorm) return;

    if (!silent && prevNorm && prevNorm !== nextNorm) {
      const label = prevRaw || prevNorm;
      if (!confirm(`Change ${label} → ${status} for this student?`)) return;
    }

    if (!teacherCurrentClass) {
      showToast('Select a class first.', 'error');
      return;
    }

    const subjectMode = isSubjectAttendanceGrade(teacherCurrentClass.grade);
    if (subjectMode && !teacherCurrentClass.subjectId) {
      showToast('Select a subject to mark attendance.', 'error');
      return;
    }

    const payload = {
      student_id: studentId,
      status,
      date: localISODate()
    };
    if (subjectMode) {
      payload.subject_id = teacherCurrentClass.subjectId;
      payload.session = 'AM';
    } else {
      payload.session = attendanceCurrentSession || 'AM';
    }

    const res = await fetch(`${API_URL}/teacher/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Failed to save');

    if (fromRoster) fromRoster.attendance_status = status;

    const badge = document.getElementById(`att-status-${studentId}`);
    if (badge) {
      badge.textContent = status;
      badge.className = `badge ${status.toLowerCase()}`;
    }
    syncAttendanceActionButtons(studentId, status);

    loadClassStats(teacherCurrentClass.grade, teacherCurrentClass.section);
    refreshClassroomAttendanceStatus();

    const activePanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    if (activePanel === 'attendance-sheet') loadAttendanceSheet();

    if (!silent) showToast(`Saved: ${status}${subjectMode ? '' : ` (${payload.session})`}`);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('open-attendance-sheet-btn')?.addEventListener('click', () => {
  goToTeacherPanel('attendance-sheet');
});

const notifyBtn = document.getElementById('notify-all-btn');
if (notifyBtn) {
  notifyBtn.addEventListener('click', () => {
    if (!teacherCurrentClass) {
      showToast('Select a class first.', 'error');
      return;
    }
    const subtitle = document.getElementById('attendance-update-subtitle');
    if (subtitle) {
      const sess = isSubjectAttendanceGrade(teacherCurrentClass.grade)
        ? (teacherCurrentClass.subjectName || 'subject')
        : (attendanceCurrentSession === 'PM' ? 'afternoon' : 'morning');
      subtitle.textContent = `Notify linked parents about today's ${sess} attendance for Grade ${teacherCurrentClass.grade}-${teacherCurrentClass.section}. One notice per child.`;
    }
    const modal = document.getElementById('attendance-update-modal');
    updateAttendancePreview();
    modal?.removeAttribute('hidden');
  });
}

function attendanceStatusesForScope(scope) {
  if (scope === 'absent') return ['Absent'];
  if (scope === 'all') return ['Present', 'Late', 'Absent'];
  return ['Late', 'Absent'];
}

function updateAttendancePreview() {
  const preview = document.getElementById('attendance-update-preview');
  if (!preview) return;
  const scope = document.getElementById('attendance-update-scope')?.value || 'late_absent';
  const statuses = attendanceStatusesForScope(scope);
  const matches = rosterData.filter(s => statuses.includes(s.attendance_status));
  preview.textContent = matches.length
    ? `${matches.length} student${matches.length === 1 ? '' : 's'} match this filter today. Notices go only to linked parents.`
    : 'No students match this filter for today yet. Mark attendance first.';
}

document.getElementById('attendance-update-scope')?.addEventListener('change', updateAttendancePreview);
document.getElementById('attendance-update-cancel')?.addEventListener('click', () => {
  document.getElementById('attendance-update-modal')?.setAttribute('hidden', '');
});
document.getElementById('attendance-update-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'attendance-update-modal') e.currentTarget.setAttribute('hidden', '');
});
document.getElementById('attendance-update-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!teacherCurrentClass) return;
  const scope = document.getElementById('attendance-update-scope')?.value || 'late_absent';
  const statuses = attendanceStatusesForScope(scope);
  const matches = rosterData.filter(s => statuses.includes(s.attendance_status));
  if (!matches.length) {
    showToast('No students match this filter for today.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/teacher/notify-attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        grade: teacherCurrentClass.grade,
        section: teacherCurrentClass.section,
        statuses,
        session: attendanceCurrentSession || 'AM',
        subject_id: isSubjectAttendanceGrade(teacherCurrentClass.grade)
          ? teacherCurrentClass.subjectId
          : null
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('attendance-update-modal')?.setAttribute('hidden', '');
    const smsBit = [
      data.smsQueued != null ? `${data.smsQueued} SMS queued` : null,
      data.smsSentNow ? `${data.smsSentNow} processed` : null,
      data.smsSkippedNoPhone ? `${data.smsSkippedNoPhone} missing phone` : null
    ].filter(Boolean).join(' · ');
    showToast(
      data.message ||
        (smsBit
          ? `Parents notified (${smsBit}).`
          : 'Parents notified in-app.')
    );
  } catch (err) {
    showToast(err.message, 'error');
  }
});

function fillTeacherNoticeClasses() {
  const sel = document.getElementById('teacher-notice-class');
  if (!sel) return;
  const unique = [];
  const seen = new Set();
  (teacherAssignedClasses || []).forEach(c => {
    const key = `${c.grade_level}-${c.section}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push({ grade: c.grade_level, section: c.section });
  });
  const preferred = teacherCurrentClass
    ? `${teacherCurrentClass.grade}-${teacherCurrentClass.section}`
    : sel.value;
  sel.innerHTML = '<option value="">Select a class</option>' + unique.map(c =>
    `<option value="${c.grade}-${c.section}">Grade ${c.grade} – ${c.section}</option>`
  ).join('');
  if (preferred && unique.some(c => `${c.grade}-${c.section}` === preferred)) {
    sel.value = preferred;
  }
}

document.getElementById('teacher-announcement-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('teacher-notice-msg');
  const classVal = document.getElementById('teacher-notice-class')?.value || '';
  const [grade, ...sectionParts] = classVal.split('-');
  const section = sectionParts.join('-');
  const title = document.getElementById('teacher-notice-title')?.value.trim();
  const body = document.getElementById('teacher-notice-body')?.value.trim();
  if (!grade || !section || !title || !body) {
    if (msgEl) { msgEl.textContent = 'Class, title, and message are required.'; msgEl.style.color = '#b71c1c'; }
    else showToast('Class, title, and message are required.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/teacher/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, body, grade, section })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Failed to send notice');
    e.target.reset();
    fillTeacherNoticeClasses();
    if (msgEl) { msgEl.textContent = ''; }
    const modal = document.getElementById('teacher-notice-modal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('hidden', '');
    }
    showToast(data.message || 'Class notice sent to parents.');
  } catch (err) {
    if (msgEl) { msgEl.textContent = err.message; msgEl.style.color = '#b71c1c'; }
    else showToast(err.message, 'error');
  }
});

document.getElementById('classroom-search-input')?.addEventListener('input', () => filterRoster());
document.getElementById('attendance-sheet-search-input')?.addEventListener('input', () => filterAttendanceSheet());

document.getElementById('progress-search-input')?.addEventListener('input', () => {
  filterProgressList();
});

document.querySelectorAll('[data-progress-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    progressTypeFilter = btn.dataset.progressType || 'all';
    document.querySelectorAll('[data-progress-type]').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
    filterProgressList();
  });
});

document.getElementById('attendance-save-all')?.addEventListener('click', async () => {
  const unmarked = rosterData.filter(s => !s.attendance_status);
  if (!unmarked.length) {
    showToast('All students already have attendance recorded.');
    return;
  }
  if (!confirm(`Mark ${unmarked.length} unrecorded student${unmarked.length > 1 ? 's' : ''} as Present?`)) return;
  for (const student of unmarked) {
    await window.markAttendance(student.id, 'Present', { silent: true });
  }
  showToast('Marked remaining students as Present.');
});

/** Calendar date in Asia/Manila (matches server attendance / quiz gates). */
function localISODate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

function statusToLetter(status) {
  const st = String(status || '').toLowerCase();
  if (st === 'present') return 'P';
  if (st === 'absent') return 'A';
  if (st === 'late') return 'L';
  if (st === 'excused') return 'E';
  return '';
}

function letterClass(letter) {
  if (letter === 'P') return 'att-mark att-mark-p';
  if (letter === 'A') return 'att-mark att-mark-a';
  if (letter === 'L') return 'att-mark att-mark-l';
  if (letter === 'E') return 'att-mark att-mark-e';
  return 'att-mark att-mark-empty';
}

function updateAttendanceSheetSummary(sheet) {
  const box = document.getElementById('attendance-sheet-summary');
  if (!box || !sheet) return;
  box.hidden = false;
  const totalEl = document.getElementById('att-sheet-total');
  const rangeEl = document.getElementById('att-sheet-week-range');
  if (totalEl) totalEl.textContent = (sheet.students || []).length;
  if (rangeEl) rangeEl.textContent = formatWeekLabel(sheet.weekStart, sheet.weekEnd);
  const weekLabel = document.getElementById('attendance-week-label');
  if (weekLabel) weekLabel.textContent = formatWeekLabel(sheet.weekStart, sheet.weekEnd);
}

function renderAttendanceSheet(students, sheetMeta) {
  const table = document.getElementById('teacher-attendance-sheet-table');
  if (!table) return;
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  if (!thead || !tbody) return;

  const mode = sheetMeta?.mode || 'class';
  const dates = sheetMeta?.dates || [];
  const hint = document.getElementById('attendance-sheet-hint');
  if (hint) {
    hint.textContent = mode === 'subject'
      ? `Weekly ${sheetMeta.subject_name || 'subject'} attendance (Grades 4–6). Marks are saved from Classroom before each subject starts.`
      : 'Weekly class attendance with Morning (AM) and Afternoon (PM). Marks are saved from Classroom. Sheet renews each Monday–Friday week.';
  }

  if (!dates.length) {
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td class="empty-cell">No week selected</td></tr>';
    const oldCol = table.querySelector('colgroup');
    if (oldCol) oldCol.remove();
    return;
  }

  const markCols = mode === 'subject' ? dates.length : dates.length * 2;
  let colgroup = table.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    table.insertBefore(colgroup, thead);
  }
  colgroup.innerHTML =
    '<col class="att-col-lrn">' +
    '<col class="att-col-name">' +
    Array.from({ length: markCols }, () => '<col class="att-col-mark">').join('');

  const dateHeadsTop = dates.map((d) => {
    const label = formatAttendanceShortDate(d);
    if (mode === 'subject') return `<th rowspan="2">${label}</th>`;
    return `<th colspan="2">${label}</th>`;
  }).join('');

  const dateHeadsSub = mode === 'subject'
    ? ''
    : `<tr class="att-session-row">${dates.map(() => '<th>AM</th><th>PM</th>').join('')}</tr>`;

  thead.innerHTML = `
    <tr>
      <th rowspan="${mode === 'subject' ? 1 : 2}">LRN</th>
      <th rowspan="${mode === 'subject' ? 1 : 2}">Student Name</th>
      ${dateHeadsTop}
    </tr>
    ${dateHeadsSub}`;

  if (!students.length) {
    const cols = 2 + markCols;
    tbody.innerHTML = `<tr><td colspan="${cols}" class="empty-cell">No students in this class</td></tr>`;
    return;
  }

  const boys = students.filter((s) => s.gender === 'M').sort(compareStudentsByName);
  const girls = students.filter((s) => s.gender === 'F').sort(compareStudentsByName);
  const other = students.filter((s) => s.gender !== 'M' && s.gender !== 'F').sort(compareStudentsByName);
  const colSpan = 2 + markCols;

  const renderRows = (list, groupLabel) => {
    if (!list.length) return '';
    const groupRow = `<tr class="att-group-row"><td colspan="${colSpan}">${groupLabel}</td></tr>`;
    const rows = list.map((s) => {
      const cells = dates.map((d) => {
        const mark = s.marks?.[d] || {};
        if (mode === 'subject') {
          const letter = statusToLetter(mark.status);
          return `<td class="${letterClass(letter)}">${letter}</td>`;
        }
        const am = statusToLetter(mark.AM);
        const pm = statusToLetter(mark.PM);
        return `<td class="${letterClass(am)}">${am}</td><td class="${letterClass(pm)}">${pm}</td>`;
      }).join('');
      return `<tr data-student-id="${s.id}">
        <td class="att-lrn-cell">${escapeHtml(s.lrn || '-')}</td>
        <td class="att-name-cell"><strong>${formatStudentNameStacked(s)}</strong></td>
        ${cells}
      </tr>`;
    }).join('');
    return groupRow + rows;
  };

  tbody.innerHTML =
    renderRows(boys, 'Boys') +
    renderRows(girls, 'Girls') +
    renderRows(other, 'Other');
}

function filterAttendanceSheet() {
  const query = (document.getElementById('attendance-sheet-search-input')?.value || '').trim().toLowerCase();
  const meta = attendanceSheetData?._meta;
  const students = attendanceSheetData?.students || [];
  if (!query) {
    renderAttendanceSheet(students, meta);
    return;
  }
  const filtered = students.filter((s) => {
    const name = `${s.last_name || ''} ${s.first_name || ''}`.toLowerCase();
    const lrn = String(s.lrn || '').toLowerCase();
    return name.includes(query) || lrn.includes(query);
  });
  renderAttendanceSheet(filtered, meta);
}

async function loadAttendanceSheet() {
  const tbody = document.querySelector('#teacher-attendance-sheet-table tbody');
  const thead = document.querySelector('#teacher-attendance-sheet-table thead');
  const meta = document.getElementById('attendance-sheet-meta');
  const summaryBox = document.getElementById('attendance-sheet-summary');

  if (!attendanceSheetWeekStart) {
    attendanceSheetWeekStart = weekStartMondayClient(localISODate());
  }

  if (!teacherCurrentClass) {
    if (meta) meta.textContent = 'Select a class from My Classes to browse attendance.';
    if (summaryBox) summaryBox.hidden = true;
    if (thead) thead.innerHTML = '';
    if (tbody) tbody.innerHTML = '<tr><td class="empty-cell">Select a class first</td></tr>';
    attendanceSheetData = { students: [], _meta: null };
    return;
  }

  const { grade, section } = teacherCurrentClass;
  const subjectMode = isSubjectAttendanceGrade(grade);

  if (subjectMode && !teacherCurrentClass.subjectId) {
    if (meta) meta.textContent = `Grade ${grade} – ${section}: select a subject to view the weekly sheet.`;
    if (summaryBox) summaryBox.hidden = true;
    if (thead) thead.innerHTML = '';
    if (tbody) {
      tbody.innerHTML = '<tr><td class="empty-cell">Grades 4–6 take attendance per subject. Open a subject from My Classes.</td></tr>';
    }
    return;
  }

  if (meta) {
    meta.textContent = subjectMode
      ? `Grade ${grade} – ${section} · ${teacherCurrentClass.subjectName || 'Subject'}`
      : `Grade ${grade} – ${section}`;
  }
  if (tbody) tbody.innerHTML = '<tr><td class="empty-cell">Loading…</td></tr>';

  try {
    const sectionEnc = encodeURIComponent(String(section).trim());
    const params = new URLSearchParams({ week: attendanceSheetWeekStart });
    if (subjectMode && teacherCurrentClass.subjectId) {
      params.set('subject_id', String(teacherCurrentClass.subjectId));
    }
    const res = await fetch(
      `${API_URL}/teacher/attendance/${encodeURIComponent(grade)}/${sectionEnc}/week?${params}`,
      { headers: getAuthHeaders() }
    );
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Server returned a non-JSON response. Restart the API server and try again.');
    }
    if (!res.ok) throw new Error(data.error || data.details || `Request failed (${res.status})`);

    attendanceSheetWeekStart = data.weekStart || attendanceSheetWeekStart;
    attendanceSheetData = { students: data.students || [], _meta: data };
    updateAttendanceSheetSummary(data);
    filterAttendanceSheet();
  } catch (err) {
    console.error('Load attendance sheet error:', err);
    if (summaryBox) summaryBox.hidden = true;
    if (thead) thead.innerHTML = '';
    if (tbody) {
      tbody.innerHTML = `<tr><td class="empty-cell">${err.message || 'Failed to load attendance sheet'}</td></tr>`;
    }
  }
}

async function exportAttendanceSheet(format) {
  if (!teacherCurrentClass) {
    showToast('Select a class first.', 'error');
    return;
  }
  const { grade, section } = teacherCurrentClass;
  if (isSubjectAttendanceGrade(grade) && !teacherCurrentClass.subjectId) {
    showToast('Select a subject first.', 'error');
    return;
  }
  if (!attendanceSheetWeekStart) {
    attendanceSheetWeekStart = weekStartMondayClient(localISODate());
  }

  const sectionEnc = encodeURIComponent(String(section).trim());
  const params = new URLSearchParams({
    week: attendanceSheetWeekStart,
    format: format === 'pdf' ? 'pdf' : 'xlsx'
  });
  if (teacherCurrentClass.subjectId && isSubjectAttendanceGrade(grade)) {
    params.set('subject_id', String(teacherCurrentClass.subjectId));
  }

  const url = `${API_URL}/teacher/attendance/${encodeURIComponent(grade)}/${sectionEnc}/week/export?${params}`;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  try {
    const res = await fetch(url, {
      headers: {
        ...getAuthHeaders(),
        Authorization: getAuthHeaders().Authorization || (token ? `Bearer ${token}` : '')
      }
    });
    if (!res.ok) {
      let errMsg = 'Export failed';
      try {
        const j = await res.json();
        errMsg = j.error || errMsg;
      } catch (_) { /* */ }
      throw new Error(errMsg);
    }

    if (format === 'pdf') {
      const html = await res.text();
      openPrintFullDocument(html);
      return;
    }

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_G${grade}-${section}_${attendanceSheetWeekStart}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    showToast('Excel file downloaded.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('attendance-week-prev')?.addEventListener('click', () => {
  if (!attendanceSheetWeekStart) attendanceSheetWeekStart = weekStartMondayClient(localISODate());
  attendanceSheetWeekStart = addDaysISOClient(attendanceSheetWeekStart, -7);
  loadAttendanceSheet();
});

document.getElementById('attendance-week-next')?.addEventListener('click', () => {
  if (!attendanceSheetWeekStart) attendanceSheetWeekStart = weekStartMondayClient(localISODate());
  attendanceSheetWeekStart = addDaysISOClient(attendanceSheetWeekStart, 7);
  loadAttendanceSheet();
});

document.getElementById('attendance-export-excel')?.addEventListener('click', () => {
  closeAttendanceDownloadMenu();
  exportAttendanceSheet('xlsx');
});
document.getElementById('attendance-export-pdf')?.addEventListener('click', () => {
  closeAttendanceDownloadMenu();
  exportAttendanceSheet('pdf');
});

function closeAttendanceDownloadMenu() {
  closeDownloadMenu(
    document.getElementById('attendance-download-panel'),
    document.getElementById('attendance-download-btn')
  );
}

document.getElementById('attendance-download-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleDownloadMenu(
    document.getElementById('attendance-download-btn'),
    document.getElementById('attendance-download-panel')
  );
});

document.querySelectorAll('.session-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    attendanceCurrentSession = chip.dataset.session === 'PM' ? 'PM' : 'AM';
    document.querySelectorAll('.session-chip').forEach((c) => {
      c.classList.toggle('active', c.dataset.session === attendanceCurrentSession);
    });
    if (teacherCurrentClass) {
      Promise.all([
        loadClassStats(teacherCurrentClass.grade, teacherCurrentClass.section),
        loadRoster(teacherCurrentClass.grade, teacherCurrentClass.section)
      ]);
    }
  });
});

document.getElementById('view-ai-insights-btn')?.addEventListener('click', () => {
  document.querySelector('[data-teacher-panel="progress"]')?.click();
});

document.querySelectorAll('#teacher-quarter-list [data-quarter]').forEach(chip => {
  chip.addEventListener('click', () => {
    const q = normalizeQuarterClient(chip.dataset.quarter);
    if (!(UNLOCKED_QUARTERS || []).includes(q)) {
      showToast(`${q} is still locked. Ask the admin to unlock it.`, 'error');
      return;
    }
    document.querySelectorAll('#teacher-quarter-list [data-quarter]').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    teacherCurrentQuarter = q;
    const activePanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    if (activePanel === 'progress') loadProgressList();
    if (teacherCurrentClass) {
      const progressMeta = document.getElementById('progress-class-meta');
      if (progressMeta) {
        progressMeta.textContent = `Grade ${teacherCurrentClass.grade}-${teacherCurrentClass.section} · ${teacherCurrentQuarter} · Quizzes, activities, and exams for this class.`;
      }
    }
  });
});

document.getElementById('admin-save-quarter-btn')?.addEventListener('click', async () => {
  const select = document.getElementById('admin-current-quarter');
  const msgEl = document.getElementById('admin-quarter-msg');
  const quarter = normalizeQuarterClient(select?.value || 'Q1');
  try {
    const res = await fetch(`${API_URL}/admin/settings/current-quarter`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_quarter: quarter })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save quarter');
    CURRENT_QUARTER = normalizeQuarterClient(data.currentQuarter || quarter);
    UNLOCKED_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(CURRENT_QUARTER) + 1);
    applyQuarterUnlockUI();
    if (msgEl) { msgEl.textContent = data.message || `Current quarter set to ${CURRENT_QUARTER}`; msgEl.style.color = '#1b5e20'; }
    showToast(data.message || `Current quarter set to ${CURRENT_QUARTER}`);
    refreshAdminOverview();
  } catch (err) {
    if (msgEl) { msgEl.textContent = err.message; msgEl.style.color = '#b71c1c'; }
    showToast(err.message, 'error');
  }
});

function showProgressCreateForm(show) {
  const modal = document.getElementById('progress-create-modal');
  const listWrap = document.getElementById('progress-list-wrap');
  const editor = document.getElementById('progress-editor');
  if (!modal) return;

  if (show) {
    if (!teacherCurrentClass) {
      showToast('Select a class from My Classes first.', 'error');
      return;
    }
    if (editor) editor.hidden = true;
    if (listWrap) listWrap.hidden = false;
    const msg = document.getElementById('progress-create-msg');
    if (msg) msg.textContent = '';
    const titleEl = document.getElementById('progress-title');
    const maxEl = document.getElementById('progress-max');
    const typeEl = document.getElementById('progress-type');
    if (titleEl) titleEl.value = '';
    if (maxEl) maxEl.value = '100';
    if (typeEl) typeEl.value = 'quiz';
    modal.hidden = false;
    loadTeacherSubjects(true).then(() => {
      fillTeacherSubjectSelects();
      const progressSelect = document.getElementById('progress-subject');
      if (!progressSelect) return;
      if (teacherCurrentClass?.subjectId) {
        progressSelect.value = String(teacherCurrentClass.subjectId);
      } else if (progressSubjectFilter) {
        const opt = Array.from(progressSelect.options).find(
          (o) => o.textContent.trim().toLowerCase() === String(progressSubjectFilter).toLowerCase()
        );
        if (opt) progressSelect.value = opt.value;
      }
    });
  } else {
    modal.hidden = true;
  }
}

function renderProgressCards(records) {
  const listEl = document.getElementById('progress-list');
  if (!listEl) return;

  if (!records.length) {
    listEl.innerHTML = '<p class="empty-state">No progress records yet. For a live ConnectED link, create from Classwork. Use + New Record for manual scores only.</p>';
    return;
  }

  listEl.innerHTML = records.map(r => {
    const shareActive = Number(r.share_enabled) === 1 && r.share_token;
    const hasQuestions = Number(r.question_count) > 0;
    return `
    <article class="lesson-plan-card">
      <div class="progress-card-top">
        <div class="progress-card-top-left">
          <span class="badge type-${r.type}">${typeLabel(r.type)}</span>
          <h4 style="margin:0;">${escapeHtml(r.title)}</h4>
          ${shareActive ? '<span class="ai-status-badge ai-status-approved">LINK ON</span>' : ''}
          ${!shareActive && !hasQuestions ? '<span class="page-subheading">Manual / no live link</span>' : ''}
        </div>
        ${shareActive
          ? `<button type="button" class="chip-ghost progress-card-copy-link" onclick="copySharedQuizLink('${escapeHtml(r.share_token)}')">Copy Link</button>`
          : ''}
      </div>
      <p>${escapeHtml(r.subject_name || 'No subject')} · Total score ${r.max_score} · ${r.scored_count || 0} scored · ${new Date(r.created_at).toLocaleDateString()}${
        shareActive && r.quiz_attendance_date
          ? ` · ${String(r.quiz_attendance_date).slice(0, 10)}${r.quiz_attendance_session && Number(r.grade_level) < 4 ? ' ' + r.quiz_attendance_session : ''}`
          : ''
      }</p>
      <div class="lesson-plan-card-actions">
        <button type="button" class="chip-ghost primary" onclick="openProgressEditor(${r.id}, 'view')">View Scores</button>
        ${shareActive
          ? `<button type="button" class="chip-ghost chip-danger" onclick="revokeSharedQuizLink(${r.id})">Turn Off Link</button>`
          : hasQuestions
            ? `<button type="button" class="chip-ghost" onclick="assignSharedQuizLink(${r.id})">Enable Link</button>`
            : ''}
        ${r.quiz_link
          ? `<button type="button" class="chip-ghost" onclick="copyExternalQuizLink(${r.id})">Copy Online Link</button>
             <a class="chip-ghost" href="${escapeHtml(r.quiz_link)}" target="_blank" rel="noopener">Open Online Link</a>`
          : ''}
        <button type="button" class="chip-ghost chip-danger" onclick="deleteProgressRecord(${r.id})">Delete</button>
      </div>
    </article>`;
  }).join('');
}

function filterProgressList() {
  const query = (document.getElementById('progress-search-input')?.value || '').trim().toLowerCase();
  let filtered = progressAssessments;

  if (progressTypeFilter && progressTypeFilter !== 'all') {
    filtered = filtered.filter(r => String(r.type).toLowerCase() === progressTypeFilter);
  }

  if (progressSubjectFilter) {
    const want = String(progressSubjectFilter).toLowerCase();
    filtered = filtered.filter(r => String(r.subject_name || '').toLowerCase() === want);
  }

  if (query) {
    filtered = filtered.filter(r => {
      const hay = `${r.title} ${r.subject_name || ''} ${r.type}`.toLowerCase();
      return hay.includes(query);
    });
  }

  if (!filtered.length) {
    const listEl = document.getElementById('progress-list');
    if (listEl) {
      const typePart = progressTypeFilter !== 'all' ? typeLabel(progressTypeFilter).toLowerCase() + ' ' : '';
      const subPart = progressSubjectFilter ? `${progressSubjectFilter} ` : '';
      listEl.innerHTML = `<p class="empty-state">No ${subPart}${typePart}records match${query ? ' your search' : ' for this class'}.</p>`;
    }
    return;
  }

  renderProgressCards(filtered);
}

async function loadProgressList() {
  const listEl = document.getElementById('progress-list');
  if (!listEl) return;

  showProgressCreateForm(false);
  const editor = document.getElementById('progress-editor');
  if (editor) {
    editor.hidden = true;
    editor.setAttribute('hidden', '');
  }
  setProgressListChromeVisible(true);
  const listWrap = document.getElementById('progress-list-wrap');
  if (listWrap) {
    listWrap.hidden = false;
    listWrap.removeAttribute('hidden');
  }

  if (!teacherCurrentClass) {
    listEl.innerHTML = '<p class="empty-state">Select a class from the sidebar first.</p>';
    return;
  }

  try {
    const params = new URLSearchParams({
      grade: teacherCurrentClass.grade,
      section: teacherCurrentClass.section,
      quarter: teacherCurrentQuarter
    });
    const res = await fetch(`${API_URL}/teacher/assessments?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    progressAssessments = Array.isArray(data) ? data : [];
    filterProgressList();
  } catch (err) {
    console.error('Load progress error:', err);
    listEl.innerHTML = '<p class="empty-state">Failed to load progress records.</p>';
  }
}

function setProgressListChromeVisible(show) {
  const chrome = document.getElementById('progress-list-chrome');
  if (!chrome) return;
  chrome.hidden = !show;
  if (show) chrome.removeAttribute('hidden');
  else chrome.setAttribute('hidden', '');
}

window.openProgressEditor = async function(id, mode = 'view') {
  const editor = document.getElementById('progress-editor');
  showProgressCreateForm(false);
  setProgressListChromeVisible(false);
  if (editor) {
    editor.hidden = false;
    editor.removeAttribute('hidden');
  }

  const normalizedMode = mode === 'edit' || mode === 'link' ? mode : 'view';
  if (editor) editor.dataset.mode = normalizedMode;

  try {
    const subjectMode = teacherCurrentClass && isSubjectAttendanceGrade(teacherCurrentClass.grade);
    const sessionQ = subjectMode ? '' : `?session=${encodeURIComponent(attendanceCurrentSession || 'AM')}`;
    const res = await fetch(`${API_URL}/teacher/assessments/${id}${sessionQ}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const a = data.assessment;
    progressEditorMax = Number(a.max_score) || 100;
    if (editor) editor.dataset.assessmentId = String(a.id);
    window._progressEditorAssessment = a;
    window._progressEditorStudents = data.students || [];
    window._progressEditorMakeupCandidates = data.makeup_candidates || [];

    const questions = Array.isArray(data.questions) ? data.questions : [];
    window._progressEditorQuestions = questions;
    const hasQuestions = questions.length > 0;
    if (editor) editor.dataset.hasQuestions = hasQuestions ? '1' : '0';

    // Manual New Record (no questions): scores only — no Shared link / online enable
    let effectiveMode = normalizedMode;
    if (!hasQuestions && effectiveMode === 'link') {
      effectiveMode = 'edit';
      if (editor) editor.dataset.mode = effectiveMode;
    }

    const titleEl = document.getElementById('progress-editor-title');
    const metaEl = document.getElementById('progress-editor-meta');
    if (titleEl) titleEl.textContent = a.title;
    if (metaEl) {
      const modeLabel = effectiveMode === 'edit'
        ? ' · Editing scores'
        : effectiveMode === 'link'
          ? ' · Shared link'
          : ' · Viewing';
      metaEl.textContent = `${typeLabel(a.type)} · ${a.subject_name || 'No subject'} · Total score ${progressEditorMax}${modeLabel}`;
    }

    setProgressEditorMode(effectiveMode, hasQuestions);

    const printPaperBtn = document.getElementById('progress-print-paper');
    const printKeyBtn = document.getElementById('progress-print-key');
    if (printPaperBtn) {
      printPaperBtn.hidden = !hasQuestions;
      if (hasQuestions) printPaperBtn.removeAttribute('hidden');
      else printPaperBtn.setAttribute('hidden', '');
    }
    if (printKeyBtn) {
      printKeyBtn.hidden = !hasQuestions;
      if (hasQuestions) printKeyBtn.removeAttribute('hidden');
      else printKeyBtn.setAttribute('hidden', '');
    }

    const linkInput = document.getElementById('progress-editor-quiz-link');
    const linkOpen = document.getElementById('progress-quiz-link-open');
    if (linkInput) {
      linkInput.value = a.quiz_link || '';
      linkInput.readOnly = effectiveMode !== 'link';
    }
    if (linkOpen) {
      if (a.quiz_link) {
        linkOpen.href = a.quiz_link;
        linkOpen.hidden = false;
      } else {
        linkOpen.removeAttribute('href');
        linkOpen.hidden = true;
      }
    }

    const qWrap = document.getElementById('progress-attached-questions');
    const qList = document.getElementById('progress-questions-list');
    const qCount = document.getElementById('progress-questions-count');
    updateProgressShareUi(a, data.attendance_meta, questions.length);
    if (qWrap && qList) {
      if (effectiveMode === 'link' && questions.length) {
        qWrap.hidden = false;
        qWrap.removeAttribute('hidden');
        if (qCount) qCount.textContent = `(${questions.length})`;
        qList.innerHTML = questions.map((q, idx) => {
          const type = String(q.item_type || 'mcq').toLowerCase();
          const pts = Number(q.points) || 1;
          const typeLabelText = bankItemTypeLabel(type);
          const choices = Array.isArray(q.choices) && q.choices.length
            ? `<ul class="progress-choice-list">${q.choices.map((c, i) =>
                `<li><strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(c)}</li>`
              ).join('')}</ul>`
            : '';
          const answer = q.answer
            ? `<div class="progress-q-answer"><strong>Correct:</strong> ${escapeHtml(String(q.answer))}</div>`
            : '';
          return `<li class="progress-q-item">
            <span class="progress-q-num">${idx + 1}.</span>
            <div class="progress-q-body">
              <div class="progress-q-meta">
                <span class="progress-q-type">${escapeHtml(typeLabelText)}</span>
                <span class="progress-q-pts">${pts} pt${pts === 1 ? '' : 's'}</span>
              </div>
              <div class="progress-q-text">${escapeHtml(q.question || '')}</div>
              ${choices}
              ${answer}
            </div>
          </li>`;
        }).join('');
      } else {
        qWrap.hidden = true;
        qWrap.setAttribute('hidden', '');
        qList.innerHTML = '';
        if (qCount) qCount.textContent = '';
      }
    }

    if (effectiveMode !== 'link') {
      renderProgressScoresTable(effectiveMode, a, data.students || []);
    }
  } catch (err) {
    showToast(err.message, 'error');
    loadProgressList();
  }
};

function renderProgressScoresTable(mode, assessment, students) {
  const theadRow = document.getElementById('progress-scores-thead-row');
  const tbody = document.querySelector('#progress-scores-table tbody');
  const table = document.getElementById('progress-scores-table');
  const makeupAllBtn = document.getElementById('progress-makeup-all');
  if (!tbody) return;

  const sortedStudents = [...(students || [])].sort(compareStudentsByAttendanceOrder);
  const shareOn = assessment && Number(assessment.share_enabled) === 1;
  const editMode = mode === 'edit';
  if (table) table.classList.toggle('progress-scores-table--edit', editMode);

  if (theadRow) {
    theadRow.innerHTML = editMode
      ? '<th>Student</th><th>Score</th><th>%</th><th>Attendance</th><th>Access</th>'
      : '<th>Student</th><th>Score</th><th>%</th>';
  }

  let makeupEligible = 0;
  tbody.innerHTML = sortedStudents.map((s) => {
    const score = s.score === null || s.score === undefined ? '' : s.score;
    const pct = score === '' ? '—' : `${Math.round((Number(score) / progressEditorMax) * 100)}%`;
    const nameCell = `<td class="att-name-cell"><strong>${formatStudentNameStacked(s)}</strong></td>`;

    if (editMode) {
      const st = String(s.attendance_status || '');
      const letter = statusToLetter(st);
      const attHtml = letter
        ? `<span class="${letterClass(letter)}" title="${escapeHtml(st)}">${letter}</span>`
        : '<span class="att-mark att-mark-empty" title="Not recorded">—</span>';

      let accessHtml = '<span class="progress-access-none">—</span>';
      if (s.submitted) {
        accessHtml = '<span class="progress-access-submitted">Submitted</span>';
      } else if (shareOn && (st === 'Absent' || st === 'Excused')) {
        if (s.makeup) {
          accessHtml = `<button type="button" class="chip-ghost" onclick="revokeMakeupForStudent(${s.id})">Unallow</button>`;
        } else {
          makeupEligible += 1;
          accessHtml = `<button type="button" class="chip-ghost primary" onclick="grantMakeupForStudent(${s.id})">Allow Access</button>`;
        }
      }

      return `
        <tr data-student-id="${s.id}">
          ${nameCell}
          <td>
            <input type="number" class="progress-score-input" min="0" max="${progressEditorMax}" step="0.01"
                   value="${score}" data-student-id="${s.id}" style="width:90px;" />
          </td>
          <td class="progress-pct-cell">${pct}</td>
          <td class="progress-att-cell">${attHtml}</td>
          <td class="progress-access-cell">${accessHtml}</td>
        </tr>`;
    }

    return `
      <tr data-student-id="${s.id}">
        ${nameCell}
        <td>${score === '' ? '—' : escapeHtml(String(score))}</td>
        <td>${pct}</td>
      </tr>`;
  }).join('');

  if (makeupAllBtn) {
    const showAll = editMode && shareOn && makeupEligible > 0;
    makeupAllBtn.hidden = !showAll;
    if (showAll) makeupAllBtn.removeAttribute('hidden');
    else makeupAllBtn.setAttribute('hidden', '');
  }

  if (editMode) {
    tbody.querySelectorAll('.progress-score-input').forEach((input) => {
      input.addEventListener('input', () => {
        const cell = input.closest('tr')?.querySelector('.progress-pct-cell');
        if (!cell) return;
        if (input.value === '') { cell.textContent = '—'; return; }
        const n = Number(input.value);
        cell.textContent = Number.isNaN(n) ? '—' : `${Math.round((n / progressEditorMax) * 100)}%`;
      });
    });
  }
}

function setProgressEditorMode(mode, hasQuestions = true) {
  const normalized = mode === 'edit' || mode === 'link' ? mode : 'view';
  const saveBtn = document.getElementById('progress-scores-save');
  const editBtn = document.getElementById('progress-mode-edit');
  const linkBtn = document.getElementById('progress-mode-link');
  const linkSave = document.getElementById('progress-quiz-link-save');
  const scoresSection = document.querySelector('#progress-editor .progress-scores-only');
  const allowLink = !!hasQuestions;

  if (saveBtn) saveBtn.hidden = normalized !== 'edit';
  if (linkSave) linkSave.hidden = normalized !== 'link';

  if (editBtn) {
    editBtn.hidden = normalized === 'edit';
    if (normalized === 'edit') editBtn.setAttribute('hidden', '');
    else editBtn.removeAttribute('hidden');
  }
  // Shared link only for Classwork-created quizzes (questions attached)
  if (linkBtn) {
    const showLinkBtn = allowLink && normalized !== 'link';
    linkBtn.hidden = !showLinkBtn;
    if (showLinkBtn) linkBtn.removeAttribute('hidden');
    else linkBtn.setAttribute('hidden', '');
  }

  document.querySelectorAll('#progress-editor .progress-link-only').forEach((el) => {
    const show = allowLink && normalized === 'link';
    el.hidden = !show;
    if (show) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  });

  if (scoresSection) {
    const showScores = !allowLink || normalized !== 'link';
    scoresSection.hidden = !showScores;
    if (showScores) scoresSection.removeAttribute('hidden');
    else scoresSection.setAttribute('hidden', '');
  }
}

function assessmentPaperItemHtml(q, index, { includeAnswers = false } = {}) {
  const type = String(q.item_type || 'mcq').toLowerCase();
  const pts = Number(q.points) || 1;
  const typeLabelText = bankItemTypeLabel(type);
  let body = `<div class="q-text">${escapeHtml(q.question || '')}</div>`;

  if (type === 'mcq' && Array.isArray(q.choices) && q.choices.length) {
    body += `<ol class="choices" type="A">${q.choices.map((c) =>
      `<li>${escapeHtml(c)}</li>`
    ).join('')}</ol>`;
  } else if (type === 'activity_prompt') {
    body += '<div class="write-lines"><em>Performance / activity space — use attached rubric or teacher instructions.</em></div>';
  } else {
    body += '<div class="write-lines">_______________________________________________</div>';
    body += '<div class="write-lines">_______________________________________________</div>';
  }

  let answerBlock = '';
  if (includeAnswers && q.answer) {
    answerBlock = `<div class="answer-key"><strong>Answer:</strong> ${escapeHtml(String(q.answer))}</div>`;
  }

  return `
    <div class="q-block">
      <div class="q-head"><strong>${index + 1}.</strong> <span class="q-type">${escapeHtml(typeLabelText)}</span> <span class="q-pts">(${pts} pt${pts === 1 ? '' : 's'})</span></div>
      ${body}
      ${answerBlock}
    </div>`;
}

function exportAssessmentPaperPdf({ includeAnswers = false } = {}) {
  const a = window._progressEditorAssessment;
  const questions = Array.isArray(window._progressEditorQuestions) ? window._progressEditorQuestions : [];
  if (!a || !questions.length) {
    showToast('No attached questions to print.', 'error');
    return;
  }

  const maxScore = Number(a.max_score) || questions.reduce((s, q) => s + (Number(q.points) || 1), 0);
  const heading = includeAnswers
    ? `${escapeHtml(a.title || 'Assessment')} — ANSWER KEY (Teacher only)`
    : escapeHtml(a.title || 'Assessment');
  const meta = [
    typeLabel(a.type),
    a.subject_name || null,
    a.grade_level != null ? `Grade ${a.grade_level}${a.section ? `-${a.section}` : ''}` : null,
    a.quarter || null,
    `${questions.length} item(s)`,
    `Total score ${Math.round(maxScore * 100) / 100}`
  ].filter(Boolean).join(' · ');

  const nameBlock = includeAnswers
    ? ''
    : `<div class="name-row"><span>Name: _______________________________</span><span>Score: ______ / ${Math.round(maxScore * 100) / 100}</span></div>`;

  const groups = groupBankItemsByType(questions);
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  let qIndex = 0;
  const bodyParts = groups.map((g, gi) => {
    const partPts = g.items.reduce((s, q) => s + (Number(q.points) || 1), 0);
    const partLabel = roman[gi] || String(gi + 1);
    const sectionHead = `<h2 class="section-head">${partLabel}. ${escapeHtml(g.label)} <span class="q-pts">(${Math.round(partPts * 100) / 100} pts)</span></h2>`;
    const itemsHtml = g.items.map((q) => {
      const html = assessmentPaperItemHtml(q, qIndex, { includeAnswers });
      qIndex += 1;
      return html;
    }).join('');
    return `${sectionHead}${itemsHtml}`;
  });

  const bodyHtml = `
    <h1>${heading}</h1>
    <p class="meta">${escapeHtml(meta)}</p>
    ${nameBlock}
    ${includeAnswers ? '<p class="meta"><strong>Do not distribute to students.</strong></p>' : ''}
    ${bodyParts.join('')}
  `;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${includeAnswers ? 'Answer Key' : '\u00A0'}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #222; padding: 20px; font-size: 12px; line-height: 1.45; }
      h1 { font-size: 16px; margin: 0 0 6px; color: #3d0a0a; }
      h2.section-head { font-size: 13px; margin: 18px 0 10px; color: #3d0a0a; page-break-after: avoid; }
      .meta { margin: 0 0 14px; color: #555; font-size: 11px; }
      .name-row { display: flex; justify-content: space-between; gap: 16px; margin: 0 0 18px; font-size: 12px; }
      .q-block { margin: 0 0 16px; page-break-inside: avoid; }
      .q-head { margin-bottom: 4px; }
      .q-type { color: #7a3b12; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
      .q-pts { color: #666; font-size: 11px; }
      .q-text { margin: 0 0 6px; white-space: pre-wrap; }
      ol.choices { margin: 4px 0 0 1.2em; padding: 0; }
      ol.choices li { margin: 2px 0; }
      .write-lines { margin: 6px 0 0; color: #888; }
      .answer-key { margin-top: 6px; padding: 6px 8px; background: #fff6e8; border-left: 3px solid #c47a12; }
      @media print {
        body { padding: 0; }
        @page { margin: 12mm; }
      }
    </style>
  </head><body>${bodyHtml}</body></html>`;

  printHtmlInHiddenFrame(html);
  showToast(includeAnswers ? 'Opening answer key print dialog…' : 'Opening exam paper print dialog (Save as PDF).');
}

document.getElementById('progress-print-paper')?.addEventListener('click', () => {
  exportAssessmentPaperPdf({ includeAnswers: false });
});

document.getElementById('progress-print-key')?.addEventListener('click', () => {
  exportAssessmentPaperPdf({ includeAnswers: true });
});

document.getElementById('progress-mode-edit')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) openProgressEditor(id, 'edit');
});

document.getElementById('progress-mode-link')?.addEventListener('click', () => {
  const editor = document.getElementById('progress-editor');
  const id = editor?.dataset.assessmentId;
  if (!id) return;
  if (editor?.dataset.hasQuestions !== '1') {
    showToast('Live shared link is only for records created from Classwork.', 'error');
    return;
  }
  openProgressEditor(id, 'link');
});

window.deleteProgressRecord = async function(id) {
  if (!confirm('Delete this progress record and its scores?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Progress record deleted.');
    loadProgressList();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('progress-new-btn')?.addEventListener('click', () => {
  showProgressCreateForm(true);
});

document.getElementById('progress-create-cancel')?.addEventListener('click', () => {
  showProgressCreateForm(false);
});

document.getElementById('progress-editor-back')?.addEventListener('click', () => {
  loadProgressList();
});

document.getElementById('progress-create-save')?.addEventListener('click', async () => {
  const msg = document.getElementById('progress-create-msg');
  if (!teacherCurrentClass) {
    if (msg) msg.textContent = 'Select a class first.';
    return;
  }
  const title = document.getElementById('progress-title')?.value.trim();
  const type = document.getElementById('progress-type')?.value;
  const subjectId = document.getElementById('progress-subject')?.value;
  const maxScore = document.getElementById('progress-max')?.value;
  if (!title) {
    if (msg) msg.textContent = 'Please enter a title.';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/teacher/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title,
        type,
        subject_id: subjectId || null,
        grade_level: teacherCurrentClass.grade,
        section: teacherCurrentClass.section,
        max_score: maxScore,
        quarter: teacherCurrentQuarter
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('progress-title').value = '';
    showToast('Record created. Enter scores below.');
    showProgressCreateForm(false);
    await loadProgressList();
    if (data.id) openProgressEditor(data.id, 'edit');
  } catch (err) {
    if (msg) msg.textContent = err.message;
    showToast(err.message, 'error');
  }
});

document.getElementById('progress-quiz-link-save')?.addEventListener('click', async () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  const quizLink = document.getElementById('progress-editor-quiz-link')?.value.trim() || '';
  if (!id) return;
  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quiz_link: quizLink || null })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const linkOpen = document.getElementById('progress-quiz-link-open');
    if (linkOpen) {
      if (data.quiz_link) {
        linkOpen.href = data.quiz_link;
        linkOpen.hidden = false;
      } else {
        linkOpen.removeAttribute('href');
        linkOpen.hidden = true;
      }
    }
    showToast(data.quiz_link ? 'Online link saved.' : 'Online link cleared.');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

function sharedQuizAbsoluteUrl(token) {
  return `${window.location.origin}/quiz/${token}`;
}

/** Format a Date or SQL datetime as datetime-local value (Asia/Manila wall clock). */
function toDatetimeLocalValue(value) {
  if (value == null || value === '') return '';
  let y; let m; let d; let hh; let mm;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const cleaned = value.replace('T', ' ').slice(0, 16);
    const [datePart, timePart = '00:00'] = cleaned.split(' ');
    [y, m, d] = datePart.split('-');
    [hh, mm] = timePart.split(':');
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function formatSharePreviewLocal(localValue) {
  if (!localValue) return '';
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return localValue.replace('T', ' ');
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function estimateLiveClosesLocal() {
  const mins = Number(document.getElementById('progress-share-live-duration')?.value);
  if (!Number.isFinite(mins) || mins < 5) return '';
  return toDatetimeLocalValue(new Date(Date.now() + mins * 60 * 1000));
}

function syncProgressShareWindowModeUi() {
  const livePreview = document.getElementById('progress-share-live-preview');
  const liveEst = estimateLiveClosesLocal();
  if (livePreview) {
    livePreview.textContent = liveEst
      ? `Link closes at: ${formatSharePreviewLocal(liveEst)}`
      : 'Enter minutes open to see when the link closes.';
  }
}

function fillProgressShareWindowDefaults(_assessment) {
  const liveDuration = document.getElementById('progress-share-live-duration');
  if (liveDuration && !liveDuration.value) liveDuration.value = '60';
  syncProgressShareWindowModeUi();
}

function collectProgressShareWindowBody() {
  const mins = Number(document.getElementById('progress-share-live-duration')?.value);
  if (!Number.isFinite(mins) || mins < 5) {
    throw new Error('Link must stay open at least 5 minutes.');
  }
  return { live_duration_minutes: mins };
}

function isMakeupDeadlineStillOpen(assessment) {
  const raw = assessment?.quiz_makeup_closes_at;
  if (!raw) return false;
  const local = toDatetimeLocalValue(raw);
  if (!local) return false;
  const end = new Date(local);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() > Date.now();
}

function updateProgressShareUi(assessment, attendanceMeta, questionCount = 0) {
  const urlInput = document.getElementById('progress-share-url');
  const assignBtn = document.getElementById('progress-share-assign');
  const saveWindowsBtn = document.getElementById('progress-share-save-windows');
  const copyBtn = document.getElementById('progress-share-copy');
  const revokeBtn = document.getElementById('progress-share-revoke');
  const openBtn = document.getElementById('progress-share-open');
  const noteEl = document.getElementById('progress-share-attendance-note');
  const active = assessment && Number(assessment.share_enabled) === 1 && assessment.share_token;
  const hasQuestions = Number(questionCount) > 0;
  fillProgressShareWindowDefaults(assessment);
  if (urlInput) {
    urlInput.value = active ? sharedQuizAbsoluteUrl(assessment.share_token) : '';
  }
  if (assignBtn) {
    assignBtn.hidden = !!active;
    assignBtn.disabled = !active && !hasQuestions;
    assignBtn.title = !hasQuestions && !active
      ? 'Create this record from Classwork with selected items first'
      : '';
  }
  if (saveWindowsBtn) saveWindowsBtn.hidden = !active;
  if (copyBtn) copyBtn.hidden = !active;
  if (revokeBtn) revokeBtn.hidden = !active;
  if (openBtn) {
    if (active) {
      openBtn.href = sharedQuizAbsoluteUrl(assessment.share_token);
      openBtn.hidden = false;
    } else {
      openBtn.removeAttribute('href');
      openBtn.hidden = true;
    }
  }
  if (noteEl) {
    const gateLabel = (meta) => {
      if (!meta?.date) return '';
      const sess = meta.session && Number(assessment?.grade_level) < 4
        ? ` · ${meta.session}`
        : '';
      return `${meta.date}${sess}`;
    };
    const windowNote = (() => {
      if (!assessment?.quiz_closes_at && !assessment?.quiz_makeup_closes_at) return '';
      const live = assessment.quiz_closes_at
        ? `Link until ${toDatetimeLocalValue(assessment.quiz_closes_at).replace('T', ' ')}`
        : '';
      const makeup = assessment.quiz_makeup_closes_at
        ? `Make-up until ${toDatetimeLocalValue(assessment.quiz_makeup_closes_at).replace('T', ' ')}`
        : '';
      return [live, makeup].filter(Boolean).join(' · ');
    })();
    if (!hasQuestions && !active) {
      noteEl.textContent = 'No questions attached. Create a Progress Record from Classwork (select items → Next), then Enable Link here. + New Record is for manual scores only.';
      noteEl.style.color = '#b71c1c';
    } else if (active) {
      const gate = gateLabel(attendanceMeta);
      const base = gate
        ? `Link uses attendance ${gate}. Students enter LRN first. Present/Late can submit; Absent/Excused need Allow Access in Edit Scores.`
        : 'Students enter LRN first. Present and Late can submit. Grant make-up in Edit Scores for Absent or Excused.';
      noteEl.textContent = windowNote ? `${base} ${windowNote}.` : base;
      noteEl.style.color = 'var(--text-muted)';
    } else if (attendanceMeta) {
      const gate = gateLabel(attendanceMeta);
      if (attendanceMeta.complete) {
        noteEl.textContent = gate
          ? `Attendance complete for ${gate}. Set Minutes Open, then Enable Link.`
          : 'Attendance is complete for today. Set Minutes Open, then Enable Link.';
        noteEl.style.color = '#1b5e20';
      } else {
        const n = attendanceMeta.unmarked_count ?? (attendanceMeta.unmarked?.length || 0);
        noteEl.textContent = gate
          ? `Mark every student for ${gate} in Classroom before enabling (${n} unmarked). Switch AM/PM to match the class session.`
          : `Mark attendance for every student in Classroom before enabling the link (${n} unmarked).`;
        noteEl.style.color = '#b71c1c';
      }
    } else {
      noteEl.textContent = 'Mark complete attendance in Classroom before enabling a shared link.';
      noteEl.style.color = 'var(--text-muted)';
    }
  }
}

function updateProgressMakeupUi(_assessment, _makeupCandidates) {
  // Make-up controls live on the scores table in Edit scores mode.
}

async function grantMakeupForStudent(studentId) {
  await grantMakeupQuiz('selected', [Number(studentId)]);
}

async function revokeMakeupForStudent(studentId) {
  await grantMakeupQuiz('unallow', [Number(studentId)]);
}

let _pendingMakeupGrant = null;

function syncMakeupModalPreview() {
  const hours = Number(document.getElementById('progress-makeup-hours')?.value);
  const preview = document.getElementById('progress-makeup-preview');
  if (!preview) return;
  if (!Number.isFinite(hours) || hours < 1) {
    preview.textContent = 'Enter hours to see when make-up access closes.';
    return;
  }
  const closes = toDatetimeLocalValue(new Date(Date.now() + hours * 60 * 60 * 1000));
  preview.textContent = `Make-up closes at: ${formatSharePreviewLocal(closes)}`;
}

function openMakeupGrantModal(mode, studentIds = null) {
  _pendingMakeupGrant = { mode, studentIds };
  const modal = document.getElementById('progress-makeup-modal');
  const note = document.getElementById('progress-makeup-modal-note');
  const msg = document.getElementById('progress-makeup-modal-msg');
  const hoursInput = document.getElementById('progress-makeup-hours');
  const confirmBtn = document.getElementById('progress-makeup-confirm');
  if (msg) { msg.hidden = true; msg.textContent = ''; }
  if (hoursInput) hoursInput.value = '48';
  if (note) {
    note.textContent = mode === 'all'
      ? 'Set how long make-up access stays open for all absent/excused students who have not submitted.'
      : 'Set how long make-up access stays open for this student.';
  }
  if (confirmBtn) confirmBtn.textContent = mode === 'all' ? 'Allow All' : 'Allow Access';
  syncMakeupModalPreview();
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
  }
}

function closeMakeupGrantModal() {
  const modal = document.getElementById('progress-makeup-modal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
  }
  _pendingMakeupGrant = null;
}

async function grantMakeupQuiz(mode, studentIds = null) {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (!id) return;

  if (mode === 'unallow' || mode === 'revoke') {
    const ids = Array.isArray(studentIds)
      ? studentIds.map(Number).filter((n) => Number.isFinite(n) && n > 0)
      : [];
    if (!ids.length) {
      showToast('Select at least one student to unallow.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/teacher/assessments/${id}/makeup-quiz`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode, student_ids: ids })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || 'Access removed.');
      openProgressEditor(id, 'edit');
    } catch (err) {
      showToast(err.message, 'error');
    }
    return;
  }

  const assessment = window._progressEditorAssessment;
  if (isMakeupDeadlineStillOpen(assessment)) {
    const until = formatSharePreviewLocal(toDatetimeLocalValue(assessment.quiz_makeup_closes_at));
    const ok = confirm(
      mode === 'all'
        ? `Make-up is open until ${until}. Allow all eligible absent/excused students?`
        : `Make-up is open until ${until}. Allow this student?`
    );
    if (!ok) return;
    await submitMakeupGrant({ mode, studentIds, reuseDeadline: true });
    return;
  }

  openMakeupGrantModal(mode, studentIds);
}

async function submitMakeupGrant({ mode, studentIds = null, reuseDeadline = false, makeupHours = null } = {}) {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (!id) return;
  const body = { mode };
  if (mode === 'selected') {
    const ids = Array.isArray(studentIds)
      ? studentIds.map(Number).filter((n) => Number.isFinite(n) && n > 0)
      : [];
    if (!ids.length) {
      showToast('Select at least one student for make-up.', 'error');
      return;
    }
    body.student_ids = ids;
  }
  if (!reuseDeadline) {
    const hours = Number(makeupHours);
    if (!Number.isFinite(hours) || hours < 1) {
      throw new Error('Make-up must be at least 1 hour.');
    }
    body.makeup_duration_minutes = Math.round(hours * 60);
  }
  const res = await fetch(`${API_URL}/teacher/assessments/${id}/makeup-quiz`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  showToast(data.message || 'Make-up access granted.');
  closeMakeupGrantModal();
  openProgressEditor(id, 'edit');
}

window.grantMakeupForStudent = grantMakeupForStudent;
window.revokeMakeupForStudent = revokeMakeupForStudent;

window.grantMakeupQuiz = grantMakeupQuiz;

window.copySharedQuizLink = async function(token) {
  const url = sharedQuizAbsoluteUrl(token);
  try {
    await navigator.clipboard.writeText(url);
    showToast('Shared link copied.');
  } catch {
    prompt('Copy this link:', url);
  }
};

window.copyExternalQuizLink = async function(id) {
  const record = (progressAssessments || []).find((r) => Number(r.id) === Number(id));
  const url = record?.quiz_link;
  if (!url) {
    showToast('No online link on this record.', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Online link copied.');
  } catch {
    prompt('Copy this online link:', url);
  }
};

window.assignSharedQuizLink = async function(id) {
  try {
    const subjectMode = teacherCurrentClass && isSubjectAttendanceGrade(teacherCurrentClass.grade);
    const windowBody = collectProgressShareWindowBody();
    const body = subjectMode
      ? { ...windowBody }
      : { session: attendanceCurrentSession || 'AM', ...windowBody };
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/assign-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const sess = data.attendance_session ? ` · ${data.attendance_session}` : '';
    const day = data.attendance_date ? ` (${data.attendance_date}${sess})` : '';
    showToast((data.message || 'Shared link ready.') + day);
    if (data.share_token) {
      await copySharedQuizLink(data.share_token);
    }
    const editor = document.getElementById('progress-editor');
    if (editor && !editor.hidden && editor.dataset.assessmentId === String(id)) {
      openProgressEditor(id, 'link');
    } else {
      loadProgressList();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.saveSharedQuizWindows = async function(id) {
  try {
    const body = collectProgressShareWindowBody();
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/quiz-windows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save windows');
    showToast(data.message || 'Deadlines updated.');
    openProgressEditor(id, 'link');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.revokeSharedQuizLink = async function(id) {
  if (!confirm('Turn off the shared link? Students will no longer be able to open it.')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/revoke-link`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(data.message || 'Link turned off.');
    const editor = document.getElementById('progress-editor');
    if (editor && !editor.hidden && editor.dataset.assessmentId === String(id)) {
      openProgressEditor(id, 'link');
    } else {
      loadProgressList();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('progress-share-assign')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) assignSharedQuizLink(id);
});

document.getElementById('progress-share-save-windows')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) saveSharedQuizWindows(id);
});

['progress-share-live-duration']
  .forEach((id) => {
    document.getElementById(id)?.addEventListener('input', syncProgressShareWindowModeUi);
    document.getElementById(id)?.addEventListener('change', syncProgressShareWindowModeUi);
  });

document.getElementById('progress-makeup-hours')?.addEventListener('input', syncMakeupModalPreview);
document.getElementById('progress-makeup-hours')?.addEventListener('change', syncMakeupModalPreview);

document.getElementById('progress-makeup-confirm')?.addEventListener('click', async () => {
  const pending = _pendingMakeupGrant;
  const msg = document.getElementById('progress-makeup-modal-msg');
  if (!pending) return;
  try {
    const hours = Number(document.getElementById('progress-makeup-hours')?.value);
    await submitMakeupGrant({
      mode: pending.mode,
      studentIds: pending.studentIds,
      reuseDeadline: false,
      makeupHours: hours
    });
  } catch (err) {
    if (msg) { msg.hidden = false; msg.textContent = err.message; }
    else showToast(err.message, 'error');
  }
});

document.getElementById('progress-share-copy')?.addEventListener('click', async () => {
  const url = document.getElementById('progress-share-url')?.value;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Shared link copied.');
  } catch {
    prompt('Copy this link:', url);
  }
});

document.getElementById('progress-share-revoke')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) revokeSharedQuizLink(id);
});

document.getElementById('progress-makeup-all')?.addEventListener('click', () => grantMakeupQuiz('all'));

document.getElementById('progress-scores-save')?.addEventListener('click', async () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  const inputs = document.querySelectorAll('.progress-score-input');

  if (!id) {
    showToast('Could not determine which record to save.', 'error');
    return;
  }

  const scores = Array.from(inputs).map(input => ({
    student_id: Number(input.dataset.studentId),
    score: input.value === '' ? '' : Number(input.value)
  }));

  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/scores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scores })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Scores saved. Parents can see them in Progress Tracking.');
    loadProgressList();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function loadTeacherSubjects(forceReload = false) {
  try {
    const res = await fetch(`${API_URL}/teacher/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();
    if (!res.ok) throw new Error(subjects.error);

    teacherSubjectsCache = Array.isArray(subjects) ? subjects : [];
    fillTeacherSubjectSelects();
    teacherSubjectsLoaded = true;
  } catch (err) {
    console.error('Load teacher subjects error:', err);
  }
}

/** Assigned subjects only; optionally limited to a grade. */
function getAssignedSubjectsForGrade(grade) {
  const list = Array.isArray(teacherSubjectsCache) ? teacherSubjectsCache : [];
  const g = Number(grade);
  if (!g) return list.slice();
  return list.filter((s) => {
    const grades = Array.isArray(s.grade_levels) ? s.grade_levels.map(Number) : [];
    // Older payloads without grade_levels: keep visible (should be rare after API update)
    if (!grades.length) return true;
    return grades.includes(g);
  });
}

function subjectSelectOptionsHtml(subjects, { emptyLabel = '-- Select --', includeEmpty = true } = {}) {
  const opts = (subjects || []).map(
    (s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`
  ).join('');
  return (includeEmpty ? `<option value="">${escapeHtml(emptyLabel)}</option>` : '') + opts;
}

function fillTeacherSubjectSelects() {
  const lpGrade = document.getElementById('lp-grade')?.value;
  const progressGrade = teacherCurrentClass?.grade;
  const lpSubjects = getAssignedSubjectsForGrade(lpGrade);
  const progressSubjects = getAssignedSubjectsForGrade(progressGrade);

  const lpSelect = document.getElementById('lp-subject');
  const progressSelect = document.getElementById('progress-subject');

  if (lpSelect) {
    const prev = lpSelect.value;
    lpSelect.innerHTML = subjectSelectOptionsHtml(lpSubjects);
    if (prev && [...lpSelect.options].some((o) => o.value === prev)) lpSelect.value = prev;
  }

  if (progressSelect) {
    const prev = progressSelect.value;
    progressSelect.innerHTML = subjectSelectOptionsHtml(progressSubjects, {
      emptyLabel: '-- Select Subject --'
    });
    if (teacherCurrentClass?.subjectId &&
      [...progressSelect.options].some((o) => o.value === String(teacherCurrentClass.subjectId))) {
      progressSelect.value = String(teacherCurrentClass.subjectId);
    } else if (progressSubjectFilter) {
      const opt = Array.from(progressSelect.options).find(
        (o) => o.textContent.trim().toLowerCase() === String(progressSubjectFilter).toLowerCase()
      );
      if (opt) progressSelect.value = opt.value;
      else if (prev && [...progressSelect.options].some((o) => o.value === prev)) progressSelect.value = prev;
    } else if (prev && [...progressSelect.options].some((o) => o.value === prev)) {
      progressSelect.value = prev;
    }
  }

  fillQuizBankSubjectFilter();
  fillAddQuizSubjectOptions();
}

async function loadLessonPlans() {
  const listEl = document.getElementById('lesson-plans-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${API_URL}/teacher/lesson-plans`, { headers: getAuthHeaders() });
    const plans = await res.json();
    if (!res.ok) throw new Error(plans.error);

    if (!plans.length) {
      listEl.innerHTML = '<p class="empty-state">No materials uploaded yet. Click + Upload Material to add one.</p>';
      return;
    }

    listEl.innerHTML = plans.map(p => `
      <article class="lesson-plan-card">
        <h4>${escapeHtml(p.title)}</h4>
        <p>Grade ${p.grade_level}${p.subject_name ? ' · ' + escapeHtml(p.subject_name) : ''} · ${new Date(p.created_at).toLocaleDateString()}</p>
        ${p.objectives ? `<p style="margin-top:8px;color:var(--text-dark);">${escapeHtml(p.objectives)}</p>` : ''}
        <div class="lesson-plan-card-actions">
          ${p.file_path ? `<a class="chip-ghost primary" href="${p.file_path}" target="_blank" rel="noopener">Open File</a>` : ''}
          <button type="button" class="chip-ghost primary" onclick="generateAiForLesson(${p.id})">Generate AI</button>
          <button type="button" class="chip-ghost" onclick="deleteLessonPlan(${p.id})">Delete</button>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Load materials error:', err);
    listEl.innerHTML = '<p class="empty-state">Failed to load materials.</p>';
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Alphabetical by last name, then first name (case-insensitive). */
function compareStudentsByName(a, b) {
  const ln = String(a?.last_name || '').localeCompare(String(b?.last_name || ''), undefined, { sensitivity: 'base' });
  if (ln !== 0) return ln;
  return String(a?.first_name || '').localeCompare(String(b?.first_name || ''), undefined, { sensitivity: 'base' });
}

/** Same as Classroom: boys A–Z, then girls A–Z. */
function compareStudentsByAttendanceOrder(a, b) {
  const ga = a?.gender === 'M' ? 0 : a?.gender === 'F' ? 1 : 2;
  const gb = b?.gender === 'M' ? 0 : b?.gender === 'F' ? 1 : 2;
  if (ga !== gb) return ga - gb;
  return compareStudentsByName(a, b);
}

/**
 * Last name on first line, first (+ middle) on second — wraps on mobile without cutting.
 */
function formatStudentNameStacked(s, { escape = true } = {}) {
  const enc = (v) => (escape ? escapeHtml(v) : String(v ?? ''));
  const last = enc(s?.last_name || '') || '—';
  const firstParts = [s?.first_name, s?.middle_name].filter(Boolean).map(enc);
  const first = firstParts.join(' ') || '—';
  return `<span class="student-name-stack"><span class="student-name-last">${last}</span><span class="student-name-first">${first}</span></span>`;
}

async function loadAiStatusHint() {
  const hint = document.getElementById('ai-mode-hint');
  if (!hint) return;
  try {
    const res = await fetch(`${API_URL}/teacher/ai/status`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (data.mode === 'ollama') {
      hint.textContent = `AI: Ollama (local)${data.model ? ` · ${data.model}` : ''}`;
    } else if (data.mode === 'openai') {
      hint.textContent = `AI: OpenAI (live)${data.model ? ` · ${data.model}` : ''}`;
    } else {
      hint.textContent = 'AI: mock (set Ollama or OPENAI_API_KEY for live)';
    }
  } catch {
    hint.textContent = '';
  }
}

/** After Generate/Regenerate, keep that draft card open once. */
let aiDraftExpandId = null;

function formatAiItemsPreview(part, type) {
  if (!part) return '<p class="empty-state">No content.</p>';
  if (type === 'activity') {
    return `<p>${escapeHtml(part.description || '')}</p>`;
  }
  const items = Array.isArray(part.items) ? part.items : [];
  if (!items.length) return `<p>${escapeHtml(part.notes || '')}</p>`;
  return `<ol class="ai-draft-items">${items.slice(0, 8).map((it) => {
    const t = String(it.type || it.item_type || (Array.isArray(it.choices) && it.choices.length ? 'mcq' : 'identification')).toLowerCase();
    const label = t === 'mcq' ? 'MCQ'
      : t === 'identification' ? 'ID'
      : t === 'enumeration' ? 'Enum'
      : t === 'short_answer' ? 'SA'
      : 'Q';
    return `<li><span class="page-subheading">[${label}]</span> ${escapeHtml(it.question || '')}</li>`;
  }).join('')}</ol>`;
}

async function loadAiRecommendations() {
  const listEl = document.getElementById('ai-recommendations-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${API_URL}/teacher/ai/recommendations`, { headers: getAuthHeaders() });
    const rows = await res.json();
    if (!res.ok) throw new Error(rows.error);

    if (!rows.length) {
      listEl.innerHTML = '<p class="empty-state">No AI drafts yet.</p>';
      return;
    }

    const expandId = aiDraftExpandId != null ? Number(aiDraftExpandId) : null;
    aiDraftExpandId = null;

    listEl.innerHTML = rows.map((r) => {
      const c = r.content || {};
      const statusClass = r.status === 'pending' ? 'ai-status-pending'
        : r.status === 'approved' ? 'ai-status-approved' : 'ai-status-rejected';
      const isOpen = expandId != null && Number(r.id) === expandId;
      const meta = `Grade ${r.grade_level}${r.subject_name ? ' · ' + escapeHtml(r.subject_name) : ''} · ${new Date(r.created_at).toLocaleDateString()}`;
      return `
      <article class="lesson-plan-card ai-rec-card" data-rec-id="${r.id}" data-grade="${r.grade_level}">
        <details class="ai-rec-fold"${isOpen ? ' open' : ''}>
          <summary>
            <div class="ai-rec-fold-summary">
              <div>
                <h4><span class="ai-rec-fold-chevron" aria-hidden="true">▸</span>${escapeHtml(r.lesson_title || 'Lesson')}</h4>
                <p class="ai-rec-fold-meta">${meta}</p>
              </div>
              <span class="ai-status-badge ${statusClass}">${escapeHtml(r.status)} · ${escapeHtml(r.provider)}</span>
            </div>
          </summary>
          <div class="ai-rec-fold-body">
            <details class="ai-draft-details" open>
              <summary>Quiz — ${escapeHtml(c.quiz?.title || 'Quiz')}</summary>
              ${formatAiItemsPreview(c.quiz, 'quiz')}
            </details>
            <details class="ai-draft-details">
              <summary>Activity — ${escapeHtml(c.activity?.title || 'Activity')}</summary>
              ${formatAiItemsPreview(c.activity, 'activity')}
            </details>
            <div class="lesson-plan-card-actions">
              ${r.status === 'pending' ? `
                <button type="button" class="chip-ghost primary" onclick="openAiApproveModal(${r.id})">Approve</button>
                <button type="button" class="chip-ghost" onclick="saveAiDraftToBank(${r.id})">Save to Classwork</button>
                <button type="button" class="chip-ghost" onclick="regenerateAiRecommendation(${r.id})">Regenerate</button>
              ` : r.assessment_id ? `<span class="page-subheading">Linked #${r.assessment_id}</span>` : ''}
              <button type="button" class="chip-ghost" onclick="deleteAiRecommendation(${r.id})">Delete</button>
            </div>
          </div>
        </details>
      </article>`;
    }).join('');

    if (expandId != null) {
      const opened = listEl.querySelector(`.ai-rec-card[data-rec-id="${expandId}"]`);
      if (opened) {
        opened.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  } catch (err) {
    console.error('Load AI recommendations error:', err);
    listEl.innerHTML = '<p class="empty-state">Failed to load AI drafts.</p>';
  }
}

window.generateAiForLesson = async function(lessonPlanId) {
  openAiGenerateOptionsModal({ mode: 'generate', lessonPlanId });
};

function resetAiGenerateTypeChecks() {
  document.querySelectorAll('input[name="ai-quiz-type"]').forEach((el) => {
    el.checked = true;
  });
}

function openAiGenerateOptionsModal({ mode = 'generate', lessonPlanId = null, recommendationId = null } = {}) {
  const modal = document.getElementById('ai-generate-count-modal');
  const idInput = document.getElementById('ai-generate-lesson-id');
  const modeInput = document.getElementById('ai-generate-mode');
  const recInput = document.getElementById('ai-generate-rec-id');
  const titleEl = document.getElementById('ai-generate-modal-title');
  const goBtn = document.getElementById('ai-generate-count-go');
  if (idInput) idInput.value = lessonPlanId != null ? String(lessonPlanId) : '';
  if (modeInput) modeInput.value = mode === 'regenerate' ? 'regenerate' : 'generate';
  if (recInput) recInput.value = recommendationId != null ? String(recommendationId) : '';
  if (titleEl) titleEl.textContent = mode === 'regenerate' ? 'Regenerate AI Draft' : 'Generate AI Draft';
  if (goBtn) goBtn.textContent = mode === 'regenerate' ? 'Regenerate' : 'Generate';
  const custom = document.getElementById('ai-generate-count-custom');
  if (custom) custom.value = '';
  document.querySelectorAll('.ai-count-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.count === '10');
  });
  resetAiGenerateTypeChecks();
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
  }
}

function showAiGeneratingModal(title = 'Generating AI Draft…') {
  const modal = document.getElementById('ai-generating-modal');
  const titleEl = document.getElementById('ai-generating-title');
  if (titleEl) titleEl.textContent = title;
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
  }
}

function hideAiGeneratingModal() {
  const modal = document.getElementById('ai-generating-modal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
  }
}

function getSelectedAiGenerateTypes() {
  return [...document.querySelectorAll('input[name="ai-quiz-type"]:checked')]
    .map((el) => el.value)
    .filter((v) => ['mcq', 'identification', 'enumeration'].includes(v));
}

async function runAiGenerateWithCount(lessonPlanId, quizItemCount, quizItemTypes) {
  showAiGeneratingModal('Generating AI Draft…');
  try {
    const res = await fetch(`${API_URL}/teacher/lesson-plans/${lessonPlanId}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quiz_item_count: quizItemCount,
        quiz_item_types: quizItemTypes
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Generation failed');
    showToast(data.message || 'AI draft created.');
    aiDraftExpandId = data.id;
    await loadAiRecommendations();
    const draftsHeading = document.querySelector('#teacher-panel-lesson-plans .admin-section-title');
    if (draftsHeading) draftsHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideAiGeneratingModal();
  }
}

async function runAiRegenerateWithOptions(recommendationId, quizItemCount, quizItemTypes) {
  showAiGeneratingModal('Regenerating AI Draft…');
  try {
    const res = await fetch(`${API_URL}/teacher/ai/recommendations/${recommendationId}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quiz_item_count: quizItemCount,
        quiz_item_types: quizItemTypes
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Regenerate failed');
    showToast(data.message || 'Draft regenerated.');
    aiDraftExpandId = recommendationId;
    await loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideAiGeneratingModal();
  }
}

function getSelectedAiGenerateCount() {
  const custom = document.getElementById('ai-generate-count-custom');
  const customVal = custom?.value ? Number(custom.value) : NaN;
  if (Number.isFinite(customVal) && customVal >= 5 && customVal <= 50) return Math.round(customVal);
  const active = document.querySelector('.ai-count-chip.active');
  const n = Number(active?.dataset.count);
  return Number.isFinite(n) ? n : 10;
}

document.querySelectorAll('.ai-count-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.ai-count-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const custom = document.getElementById('ai-generate-count-custom');
    if (custom) custom.value = '';
  });
});

document.getElementById('ai-generate-count-custom')?.addEventListener('input', () => {
  document.querySelectorAll('.ai-count-chip').forEach((c) => c.classList.remove('active'));
});

document.getElementById('ai-generate-count-go')?.addEventListener('click', async () => {
  const mode = document.getElementById('ai-generate-mode')?.value || 'generate';
  const lessonId = Number(document.getElementById('ai-generate-lesson-id')?.value);
  const recId = Number(document.getElementById('ai-generate-rec-id')?.value);
  const count = getSelectedAiGenerateCount();
  const types = getSelectedAiGenerateTypes();
  const modal = document.getElementById('ai-generate-count-modal');
  if (!types.length) {
    showToast('Select at least one question type.', 'error');
    return;
  }
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
  }
  if (mode === 'regenerate') {
    if (!recId) return;
    await runAiRegenerateWithOptions(recId, count, types);
    return;
  }
  if (!lessonId) return;
  await runAiGenerateWithCount(lessonId, count, types);
});

document.getElementById('ai-generate-count-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('ai-generate-count-modal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
  }
});

window.regenerateAiRecommendation = async function(id) {
  if (!confirm('Replace this draft with a new AI generation?')) return;
  openAiGenerateOptionsModal({ mode: 'regenerate', recommendationId: id });
};

window.rejectAiRecommendation = async function(id) {
  if (!confirm('Reject this AI draft?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/ai/recommendations/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Draft rejected.');
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteAiRecommendation = async function(id) {
  if (!confirm('Delete this AI draft?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/ai/recommendations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Draft deleted.');
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.saveAiDraftToBank = async function(id) {
  try {
    showToast('Saving to Classwork…');
    const res = await fetch(`${API_URL}/teacher/question-bank/from-ai/${id}`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: ['quiz', 'activity'] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Save failed');
    showToast(data.message || 'Saved to Classwork.');
    questionBankCurrentSetId = null;
    questionBankCurrentSet = null;
    if (typeof loadQuestionBank === 'function') {
      await loadQuestionBank();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.openAiApproveModal = async function(id) {
  const modal = document.getElementById('ai-approve-modal');
  const idInput = document.getElementById('ai-approve-id');
  const classSel = document.getElementById('ai-approve-class');
  if (!modal || !idInput || !classSel) return;

  idInput.value = String(id);
  const linkInput = document.getElementById('ai-approve-quiz-link');
  if (linkInput) linkInput.value = '';

  await ensureTeacherAssignedClasses();

  // Prefer grade from the draft card if available
  let draftGrade = null;
  const card = document.querySelector(`.ai-rec-card[data-rec-id="${id}"]`);
  if (card?.dataset?.grade) draftGrade = Number(card.dataset.grade);
  if (!draftGrade && card) {
    const gradeMatch = (card.textContent || '').match(/Grade\s+(\d+)/i);
    if (gradeMatch) draftGrade = Number(gradeMatch[1]);
  }
  const gradeInput = document.getElementById('ai-approve-grade');
  if (gradeInput) gradeInput.value = draftGrade ? String(draftGrade) : '';

  const pairs = getTeacherAssignedClassPairs().filter((p) =>
    draftGrade ? Number(p.grade_level) === Number(draftGrade) : true
  );
  classSel.innerHTML = pairs.length
    ? '<option value="">-- Select your class --</option>' +
      pairs.map((p) =>
        `<option value="${p.grade_level}|${escapeHtml(p.section)}">Grade ${p.grade_level} – ${escapeHtml(p.section)}</option>`
      ).join('')
    : '<option value="">No assigned class for this grade</option>';

  fillUnlockedQuarterSelect(document.getElementById('ai-approve-quarter'), teacherCurrentQuarter);

  modal.hidden = false;
};

document.getElementById('ai-approve-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('ai-approve-modal');
  if (modal) modal.hidden = true;
});

document.getElementById('ai-approve-confirm')?.addEventListener('click', async () => {
  const id = document.getElementById('ai-approve-id')?.value;
  const type = document.getElementById('ai-approve-type')?.value;
  const classVal = document.getElementById('ai-approve-class')?.value || '';
  const quarter = document.getElementById('ai-approve-quarter')?.value || 'Q1';
  const quizLink = document.getElementById('ai-approve-quiz-link')?.value.trim() || '';

  if (!id) return;
  const [gradePart, ...sectionParts] = classVal.split('|');
  const section = sectionParts.join('|').trim();
  if (!gradePart || !section) {
    showToast('Select one of your assigned classes.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/teacher/ai/recommendations/${id}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, section, quarter, quiz_link: quizLink || null })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('ai-approve-modal').hidden = true;
    showToast(data.message || 'Approved.');
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('progress-copy-questions')?.addEventListener('click', async () => {
  const questions = window._progressEditorQuestions || [];
  if (!questions.length) {
    showToast('No attached questions.', 'error');
    return;
  }
  const text = questions.map((q, i) => {
    const type = bankItemTypeLabel(q.item_type || 'mcq');
    const pts = Number(q.points) || 1;
    let block = `${i + 1}. [${type} · ${pts} pt${pts === 1 ? '' : 's'}] ${q.question || ''}`;
    if (Array.isArray(q.choices) && q.choices.length) {
      block += '\n' + q.choices.map((c, j) => `   ${String.fromCharCode(65 + j)}. ${c}`).join('\n');
    }
    if (q.answer) block += `\n   Correct: ${q.answer}`;
    return block;
  }).join('\n\n');
  try {
    await navigator.clipboard.writeText(text);
    showToast('Questions copied.');
  } catch {
    showToast('Could not copy to clipboard.', 'error');
  }
});

// ========== QUIZ BANK ==========
let questionBankSets = [];
let questionBankItems = [];
let questionBankCategories = [];
let questionBankCurrentSetId = null;
let questionBankCurrentSet = null;
let questionBankCurrentCategory = null; // 'quizzes' | 'activity' | null
const questionBankSelected = new Set();
let qbFilterGrade = '';
let qbFilterSubjectId = '';
let qbGradeMenuApi = null;
let qbSubjectMenuApi = null;

async function ensureTeacherAssignedClasses(force = false) {
  if (!force && teacherAssignedClasses.length) return teacherAssignedClasses;
  try {
    const res = await fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() });
    const classes = await res.json();
    if (res.ok) teacherAssignedClasses = Array.isArray(classes) ? classes : [];
  } catch { /* ignore */ }
  return teacherAssignedClasses;
}

function getTeacherAssignedClassPairs() {
  const map = new Map();
  (teacherAssignedClasses || []).forEach((c) => {
    const grade = Number(c.grade_level);
    const section = String(c.section || '').trim();
    if (!grade || !section) return;
    const key = `${grade}|${section.toUpperCase()}`;
    if (!map.has(key)) map.set(key, { grade_level: grade, section });
  });
  return [...map.values()].sort((a, b) =>
    a.grade_level - b.grade_level || a.section.localeCompare(b.section)
  );
}

function getTeacherAssignedGrades() {
  return [...new Set(getTeacherAssignedClassPairs().map((p) => p.grade_level))];
}

function fillQuizBankGradeFilter() {
  const grades = getTeacherAssignedGrades();
  if (qbFilterGrade && !grades.some((g) => String(g) === String(qbFilterGrade))) {
    qbFilterGrade = '';
  }
  qbGradeMenuApi?.setOptions([
    { value: '', label: 'All my grades' },
    ...grades.map((g) => ({ value: String(g), label: `Grade ${g}` }))
  ]);
}

function fillLessonPlanGradeOptions() {
  const sel = document.getElementById('lp-grade');
  if (!sel) return;
  const grades = getTeacherAssignedGrades();
  if (!grades.length) {
    sel.innerHTML = '<option value="">No assigned grades</option>';
    return;
  }
  const current = sel.value;
  sel.innerHTML = grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('');
  if (current && grades.some((g) => String(g) === String(current))) sel.value = current;
  else sel.value = String(grades[0]);
  fillTeacherSubjectSelects();
}

document.getElementById('lp-grade')?.addEventListener('change', () => {
  fillTeacherSubjectSelects();
});

function fillQuizBankSubjectFilter() {
  const subjects = getAssignedSubjectsForGrade(qbFilterGrade);
  if (qbFilterSubjectId && !subjects.some((s) => String(s.id) === String(qbFilterSubjectId))) {
    qbFilterSubjectId = '';
  }
  qbSubjectMenuApi?.setOptions([
    { value: '', label: 'All subjects' },
    ...subjects.map((s) => ({ value: String(s.id), label: s.name }))
  ]);
}

function fillAddQuizSubjectOptions() {
  const subjectSel = document.getElementById('qb-add-subject');
  if (!subjectSel) return;
  const prev = subjectSel.value;
  const grade = document.getElementById('qb-add-grade')?.value;
  const subjects = getAssignedSubjectsForGrade(grade);
  subjectSel.innerHTML = subjectSelectOptionsHtml(subjects, {
    emptyLabel: subjects.length ? '-- Select Subject --' : 'No assigned subject for this grade'
  });
  if (!subjects.length) {
    subjectSel.removeAttribute('required');
  } else {
    subjectSel.setAttribute('required', 'required');
  }
  if (teacherCurrentClass?.subjectId &&
    String(teacherCurrentClass.grade) === String(grade) &&
    [...subjectSel.options].some((o) => o.value === String(teacherCurrentClass.subjectId))) {
    subjectSel.value = String(teacherCurrentClass.subjectId);
  } else if (prev && [...subjectSel.options].some((o) => o.value === prev)) {
    subjectSel.value = prev;
  }
}

function bankItemTypeLabel(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'mcq') return 'Multiple choice';
  if (t === 'identification') return 'Identification';
  if (t === 'enumeration') return 'Enumeration';
  if (t === 'short_answer') return 'Short answer';
  if (t === 'activity_prompt') return 'Activity';
  return type ? String(type) : 'Multiple choice';
}

function syncQuizBankLandingChrome() {
  const onLanding = !questionBankCurrentSetId;
  const addQuizBtn = document.getElementById('qb-add-quiz-btn');
  const createExamBtn = document.getElementById('qb-create-exam-btn');
  const filterToolbar = document.getElementById('qb-filter-toolbar');
  if (addQuizBtn) {
    addQuizBtn.hidden = !onLanding;
    if (onLanding) addQuizBtn.removeAttribute('hidden');
    else addQuizBtn.setAttribute('hidden', '');
  }
  if (createExamBtn) {
    createExamBtn.hidden = !onLanding;
    if (onLanding) createExamBtn.removeAttribute('hidden');
    else createExamBtn.setAttribute('hidden', '');
  }
  if (filterToolbar) {
    filterToolbar.hidden = !onLanding;
    if (onLanding) filterToolbar.removeAttribute('hidden');
    else filterToolbar.setAttribute('hidden', '');
  }
}

function updateQuizBankSelectionMeta() {
  const meta = document.getElementById('qb-selection-meta');
  const titleEl = document.getElementById('qb-page-title');
  const headerBtn = document.getElementById('qb-create-progress-btn');
  const nextBar = document.getElementById('qb-next-step-bar');
  const nextBtn = document.getElementById('qb-create-progress-next');
  const nextMeta = document.getElementById('qb-next-step-meta');
  const n = questionBankSelected.size;
  const pickingItems = !!questionBankCurrentCategory;

  if (titleEl) {
    if (questionBankCurrentCategory) {
      titleEl.textContent = questionBankCurrentCategory === 'activity' ? 'Activity' : 'Quizzes';
    } else if (questionBankCurrentSetId) {
      titleEl.textContent = questionBankCurrentSet?.title || 'Quiz set';
    } else {
      titleEl.textContent = 'Classwork';
    }
  }
  if (meta) {
    if (questionBankCurrentCategory) {
      meta.textContent = n ? `${n} selected` : 'Select items to create a Progress record';
    } else if (questionBankCurrentSetId) {
      meta.textContent = 'Open Quizzes or Activity';
    } else {
      meta.textContent = 'Open a set to pick items, or Create Exam to compose a period exam';
    }
  }

  // Create stays off the landing header; bottom next-step appears when items are selected
  if (headerBtn) {
    headerBtn.hidden = true;
    headerBtn.disabled = true;
  }
  if (nextBar) {
    const showNext = pickingItems && n > 0;
    nextBar.hidden = !showNext;
    if (showNext) nextBar.removeAttribute('hidden');
    else nextBar.setAttribute('hidden', '');
  }
  if (nextBtn) nextBtn.disabled = n === 0;
  if (nextMeta) {
    nextMeta.textContent = n
      ? `${n} item(s) selected — create a Progress record next`
      : 'Select items to continue';
  }
  syncQuizBankLandingChrome();
}

function showQuizBankListView() {
  const listEl = document.getElementById('qb-list');
  const detailEl = document.getElementById('qb-set-detail');
  if (listEl) {
    listEl.hidden = false;
    listEl.removeAttribute('hidden');
  }
  if (detailEl) {
    detailEl.hidden = true;
    detailEl.setAttribute('hidden', '');
  }
  syncQuizBankLandingChrome();
}

function showQuizBankDetailView() {
  const listEl = document.getElementById('qb-list');
  const detailEl = document.getElementById('qb-set-detail');
  if (listEl) {
    listEl.hidden = true;
    listEl.setAttribute('hidden', '');
    listEl.innerHTML = '';
  }
  if (detailEl) {
    detailEl.hidden = false;
    detailEl.removeAttribute('hidden');
  }
  syncQuizBankLandingChrome();
}

function renderQuizBankSets() {
  const listEl = document.getElementById('qb-list');
  if (!listEl) return;
  questionBankCurrentSetId = null;
  questionBankCurrentSet = null;
  questionBankCurrentCategory = null;
  questionBankCategories = [];
  showQuizBankListView();

  if (!questionBankSets.length) {
    listEl.innerHTML = '<p class="empty-state">No classwork sets yet. Click + Add Classwork or save an AI draft.</p>';
    updateQuizBankSelectionMeta();
    return;
  }

  listEl.innerHTML = questionBankSets.map((set) => `
    <article class="lesson-plan-card qb-set-card" data-set-id="${set.id}" role="button" tabindex="0">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <h3 class="page-heading font-heading" style="font-size:1.05rem;margin:0;">${escapeHtml(set.title || 'Quiz set')}</h3>
          <p class="page-subheading" style="margin:6px 0 0;">
            Grade ${set.grade_level}${set.subject_name ? ' · ' + escapeHtml(set.subject_name) : ''}
            · ${Number(set.item_count) || 0} item(s)
            ${set.source === 'ai' ? ' · AI' : ''}
          </p>
        </div>
        <span class="chip-ghost" style="pointer-events:none;">Open →</span>
      </div>
    </article>
  `).join('');

  listEl.querySelectorAll('.qb-set-card').forEach((card) => {
    const open = () => openQuizBankSet(Number(card.dataset.setId));
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
  updateQuizBankSelectionMeta();
}

function syncQuizBankCheckboxes() {
  document.querySelectorAll('#qb-set-groups .qb-select').forEach((cb) => {
    cb.checked = questionBankSelected.has(Number(cb.dataset.id));
  });
  updateQuizBankSelectionMeta();
}

function currentCategoryItemIds() {
  const cat = questionBankCategories.find((c) => c.category === questionBankCurrentCategory);
  if (!cat) return [];
  return (cat.groups || []).flatMap((g) => (g.items || []).map((i) => i.id));
}

function selectAllQuizBankItems() {
  currentCategoryItemIds().forEach((id) => questionBankSelected.add(id));
  syncQuizBankCheckboxes();
}

function clearQuizBankSelection() {
  questionBankSelected.clear();
  syncQuizBankCheckboxes();
}

function setQuizBankBulkBarVisible(visible) {
  const bar = document.getElementById('qb-bulk-bar');
  const del = document.getElementById('qb-set-delete');
  const addBtn = document.getElementById('qb-add-question-btn');
  if (bar) {
    bar.hidden = !visible;
    if (visible) bar.removeAttribute('hidden');
    else bar.setAttribute('hidden', '');
  }
  if (del) {
    // Delete set only on folder level (not inside Quizzes/Activity)
    del.hidden = !!visible;
    if (visible) del.setAttribute('hidden', '');
    else del.removeAttribute('hidden');
  }
  if (addBtn) {
    // Add question only inside Quizzes/Activity questions view
    addBtn.hidden = !visible;
    if (visible) addBtn.removeAttribute('hidden');
    else addBtn.setAttribute('hidden', '');
  }
}

function syncQuizBankChoicesVisibility() {
  const type = document.getElementById('qb-edit-type')?.value || 'mcq';
  const wrap = document.getElementById('qb-edit-choices-wrap');
  if (wrap) {
    const show = type === 'mcq';
    wrap.hidden = !show;
    if (show) wrap.removeAttribute('hidden');
    else wrap.setAttribute('hidden', '');
  }
}

const QB_QUIZ_TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple choice' },
  { value: 'identification', label: 'Identification' },
  { value: 'enumeration', label: 'Enumeration' },
  { value: 'short_answer', label: 'Short answer' }
];

const QB_ACTIVITY_TYPE_OPTIONS = [
  { value: 'activity_prompt', label: 'Activity' }
];

/** Quizzes folder = quiz types only; Activity folder = activity only. */
function fillQuizBankTypeOptions(preferredValue, categoryOverride = null) {
  const typeSel = document.getElementById('qb-edit-type');
  if (!typeSel) return null;
  const cat = categoryOverride != null ? categoryOverride : questionBankCurrentCategory;
  const inActivity = cat === 'activity';
  const options = inActivity ? QB_ACTIVITY_TYPE_OPTIONS : QB_QUIZ_TYPE_OPTIONS;
  typeSel.innerHTML = options
    .map((o) => `<option value="${o.value}">${o.label}</option>`)
    .join('');
  let type = preferredValue;
  if (type === 'quizzes') type = 'mcq';
  if (!options.some((o) => o.value === type)) {
    type = inActivity ? 'activity_prompt' : 'mcq';
  }
  typeSel.value = type;
  return type;
}

window.openQuizBankAdd = function(preferredType) {
  if (!questionBankCurrentSetId || !questionBankCurrentSet) {
    showToast('Open a Classwork set first.', 'error');
    return;
  }
  const modal = document.getElementById('qb-edit-modal');
  if (!modal) return;
  const titleEl = document.getElementById('qb-edit-modal-title');
  if (titleEl) titleEl.textContent = questionBankCurrentCategory === 'activity' ? 'Add Activity' : 'Add Question';
  const subEl = document.getElementById('qb-edit-modal-subtitle');
  if (subEl) {
    subEl.textContent = questionBankCurrentCategory === 'activity'
      ? 'Add an activity prompt to this classwork set.'
      : 'Add a quiz question to this classwork set.';
  }
  document.getElementById('qb-edit-id').value = '';
  document.getElementById('qb-edit-question').value = '';
  document.getElementById('qb-edit-choices').value = '';
  document.getElementById('qb-edit-answer').value = '';
  document.getElementById('qb-edit-points').value = '1';
  const preferred = preferredType || (questionBankCurrentCategory === 'activity' ? 'activity_prompt' : 'mcq');
  fillQuizBankTypeOptions(preferred);
  const gradeSel = document.getElementById('qb-edit-grade');
  const grades = getTeacherAssignedGrades();
  const setGrade = Number(questionBankCurrentSet.grade_level);
  if (gradeSel) {
    gradeSel.innerHTML = grades.length
      ? grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('')
      : '<option value="">No assigned grades</option>';
    if (grades.includes(setGrade)) gradeSel.value = String(setGrade);
    else if (grades[0]) gradeSel.value = String(grades[0]);
    gradeSel.disabled = true;
  }
  syncQuizBankChoicesVisibility();
  modal.hidden = false;
  modal.removeAttribute('hidden');
};

window.openQuizBankEdit = function(id) {
  const item = questionBankItems.find((i) => i.id === id);
  const modal = document.getElementById('qb-edit-modal');
  if (!item || !modal) return;
  const isActivity = String(item.item_type || '') === 'activity_prompt'
    || questionBankCurrentCategory === 'activity';
  const titleEl = document.getElementById('qb-edit-modal-title');
  if (titleEl) titleEl.textContent = isActivity ? 'Edit Activity' : 'Edit Question';
  const subEl = document.getElementById('qb-edit-modal-subtitle');
  if (subEl) subEl.textContent = isActivity ? 'Update this activity prompt.' : 'Update this quiz question.';
  document.getElementById('qb-edit-id').value = String(item.id);
  document.getElementById('qb-edit-question').value = item.question || '';
  document.getElementById('qb-edit-choices').value = Array.isArray(item.choices) ? item.choices.join('\n') : '';
  document.getElementById('qb-edit-answer').value = item.answer || '';
  document.getElementById('qb-edit-points').value = String(Number(item.points) || 1);
  // Prefer folder category; fall back to item type when editing
  const editCat = questionBankCurrentCategory
    || (isActivity ? 'activity' : 'quizzes');
  fillQuizBankTypeOptions(item.item_type || (isActivity ? 'activity_prompt' : 'mcq'), editCat);
  const gradeSel = document.getElementById('qb-edit-grade');
  const grades = getTeacherAssignedGrades();
  if (gradeSel) {
    gradeSel.disabled = false;
    gradeSel.innerHTML = grades.length
      ? grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('')
      : '<option value="">No assigned grades</option>';
    if (grades.includes(Number(item.grade_level))) gradeSel.value = String(item.grade_level);
    else if (grades[0]) gradeSel.value = String(grades[0]);
  }
  syncQuizBankChoicesVisibility();
  modal.hidden = false;
  modal.removeAttribute('hidden');
};


function renderQuizBankCategoryFolders() {
  showQuizBankDetailView();
  questionBankCurrentCategory = null;
  setQuizBankBulkBarVisible(false);

  const titleEl = document.getElementById('qb-set-title');
  const metaEl = document.getElementById('qb-set-meta');
  const groupsEl = document.getElementById('qb-set-groups');
  const backBtn = document.getElementById('qb-set-back');
  const set = questionBankCurrentSet || {};

  if (titleEl) titleEl.textContent = set.title || 'Quiz set';
  if (metaEl) {
    metaEl.textContent = `Grade ${set.grade_level}${set.subject_name ? ' · ' + set.subject_name : ''} · ${questionBankItems.length} item(s)`;
  }
  if (backBtn) backBtn.textContent = '← Classwork';
  if (!groupsEl) return;

  groupsEl.innerHTML = questionBankCategories.map((cat) => `
    <article class="lesson-plan-card qb-category-card" data-category="${escapeHtml(cat.category)}" role="button" tabindex="0">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
        <div>
          <h3 class="page-heading font-heading" style="font-size:1.05rem;margin:0;">${escapeHtml(cat.label)}</h3>
          <p class="page-subheading" style="margin:6px 0 0;">${Number(cat.item_count) || 0} item(s)</p>
        </div>
        <span class="chip-ghost" style="pointer-events:none;">Open →</span>
      </div>
    </article>
  `).join('');

  if (!questionBankItems.length) {
    groupsEl.insertAdjacentHTML('beforeend', `
      <p class="page-subheading" style="margin:12px 0 0;">
        No questions yet. Open <strong>Quizzes</strong> or <strong>Activity</strong> to add items, or generate an AI draft in <strong>Materials</strong> and use <strong>Save to Classwork</strong>.
      </p>`);
  }

  groupsEl.querySelectorAll('.qb-category-card').forEach((card) => {
    const open = () => openQuizBankCategory(card.dataset.category);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
  updateQuizBankSelectionMeta();
}

function renderQuizBankItemRow(item) {
  const checked = questionBankSelected.has(item.id) ? 'checked' : '';
  const choices = Array.isArray(item.choices) && item.choices.length
    ? `<p class="page-subheading">${item.choices.map((c, i) =>
        `${String.fromCharCode(65 + i)}. ${escapeHtml(c)}`
      ).join(' · ')}</p>`
    : '';
  const ans = item.answer ? `<p class="page-subheading">Answer: ${escapeHtml(item.answer)}</p>` : '';
  return `
    <div class="qb-set-item" data-qb-id="${item.id}">
      <input type="checkbox" class="qb-select" data-id="${item.id}" ${checked} />
      <div style="flex:1;">
        <p style="margin:0;color:var(--text-dark);">${escapeHtml(item.question)}</p>
        ${choices}${ans}
        <p class="page-subheading" style="margin:4px 0 0;">${Number(item.points) || 1} pts</p>
        <div class="lesson-plan-card-actions">
          <button type="button" class="chip-ghost" onclick="openQuizBankEdit(${item.id})">Edit</button>
          <button type="button" class="chip-ghost" onclick="copyQuizBankItem(${item.id})">Copy</button>
          <button type="button" class="chip-ghost" onclick="deleteQuizBankItem(${item.id})">Remove</button>
        </div>
      </div>
    </div>`;
}

function renderQuizBankCategoryDetail(categoryKey) {
  showQuizBankDetailView();
  questionBankCurrentCategory = categoryKey;
  setQuizBankBulkBarVisible(true);

  const cat = questionBankCategories.find((c) => c.category === categoryKey);
  const titleEl = document.getElementById('qb-set-title');
  const metaEl = document.getElementById('qb-set-meta');
  const groupsEl = document.getElementById('qb-set-groups');
  const backBtn = document.getElementById('qb-set-back');
  const set = questionBankCurrentSet || {};

  if (titleEl) titleEl.textContent = cat?.label || (categoryKey === 'activity' ? 'Activity' : 'Quizzes');
  if (metaEl) {
    metaEl.textContent = `${set.title || 'Set'} · ${Number(cat?.item_count) || 0} item(s)`;
  }
  if (backBtn) {
    const setTitle = (set.title || '').trim();
    backBtn.textContent = setTitle ? `← ${setTitle}` : '← Back to set';
  }
  if (!groupsEl) return;

  const groups = cat?.groups || [];
  if (!groups.length) {
    groupsEl.innerHTML = `
      <p class="empty-state" style="margin-bottom:12px;">No items in this folder yet. Use <strong>+ Add Question</strong> above to create one.</p>`;
    updateQuizBankSelectionMeta();
    return;
  }

  if (categoryKey === 'activity') {
    const items = groups.flatMap((g) => g.items || []);
    groupsEl.innerHTML = `
      <div class="qb-type-section-body" style="padding:8px 4px;">
        ${items.map((item) => renderQuizBankItemRow(item)).join('')}
      </div>`;
  } else {
    groupsEl.innerHTML = groups.map((group) => {
      return `
        <details class="qb-type-section" open>
          <summary>
            <span>${escapeHtml(group.label || bankItemTypeLabel(group.item_type))}</span>
            <span class="page-subheading">${group.items.length}</span>
          </summary>
          <div class="qb-type-section-body">${group.items.map((item) => renderQuizBankItemRow(item)).join('')}</div>
        </details>`;
    }).join('');
  }

  groupsEl.querySelectorAll('.qb-select').forEach((cb) => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      if (cb.checked) questionBankSelected.add(id);
      else questionBankSelected.delete(id);
      updateQuizBankSelectionMeta();
    });
  });
  updateQuizBankSelectionMeta();
}

function openQuizBankCategory(categoryKey) {
  if (!categoryKey) return;
  const allowed = new Set(
    (questionBankCategories.find((c) => c.category === categoryKey)?.groups || [])
      .flatMap((g) => (g.items || []).map((i) => i.id))
  );
  [...questionBankSelected].forEach((id) => {
    if (!allowed.has(id)) questionBankSelected.delete(id);
  });
  renderQuizBankCategoryDetail(categoryKey);
}

function buildCategoriesClientSide(items) {
  const quizItems = items.filter((i) => i.item_type !== 'activity_prompt');
  const activityItems = items.filter((i) => i.item_type === 'activity_prompt');
  const byType = (list) => {
    const map = new Map();
    list.forEach((item) => {
      const key = item.item_type || 'mcq';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return [...map.entries()].map(([item_type, groupItems]) => ({
      item_type,
      label: bankItemTypeLabel(item_type),
      items: groupItems
    }));
  };
  // Always show both folders so teachers can open + add without a set-home CTA
  return [
    { category: 'quizzes', label: 'Quizzes', item_count: quizItems.length, groups: byType(quizItems) },
    { category: 'activity', label: 'Activity', item_count: activityItems.length, groups: byType(activityItems) }
  ];
}

function ensureQuizBankFolders(categories, items) {
  const built = buildCategoriesClientSide(items || []);
  if (!Array.isArray(categories) || !categories.length) return built;
  const byKey = new Map(categories.map((c) => [c.category, c]));
  return built.map((fallback) => {
    const existing = byKey.get(fallback.category);
    if (!existing) return fallback;
    return {
      ...fallback,
      ...existing,
      label: existing.label || fallback.label,
      item_count: Number(existing.item_count) || fallback.item_count,
      groups: Array.isArray(existing.groups) ? existing.groups : fallback.groups
    };
  });
}

async function loadQuestionBank() {
  const listEl = document.getElementById('qb-list');
  if (!listEl) return;
  fillQuizBankGradeFilter();
  fillQuizBankSubjectFilter();

  if (questionBankCurrentSetId) {
    await openQuizBankSet(questionBankCurrentSetId, { keepCategory: questionBankCurrentCategory });
    return;
  }

  const params = new URLSearchParams();
  const grade = qbFilterGrade;
  const subjectId = qbFilterSubjectId;
  if (grade) params.set('grade', grade);
  if (subjectId) params.set('subject_id', subjectId);

  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/sets?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    questionBankSets = Array.isArray(data) ? data : [];
    questionBankItems = [];
    questionBankCategories = [];
    questionBankCurrentSet = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    renderQuizBankSets();
  } catch (err) {
    console.error('Load quiz sets error:', err);
    listEl.innerHTML = `<p class="empty-state">Failed to load Classwork.${err?.message ? ` (${escapeHtml(err.message)})` : ''}</p>`;
  }
}

async function openQuizBankSet(setId, opts = {}) {
  if (!setId) return;
  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/sets/${setId}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    questionBankCurrentSetId = setId;
    questionBankCurrentSet = data.set || null;
    questionBankItems = Array.isArray(data.items) ? data.items : [];
    questionBankCategories = ensureQuizBankFolders(
      Array.isArray(data.categories) ? data.categories : [],
      questionBankItems
    );
    const valid = new Set(questionBankItems.map((i) => i.id));
    [...questionBankSelected].forEach((id) => {
      if (!valid.has(id)) questionBankSelected.delete(id);
    });
    if (opts.keepCategory && questionBankCategories.some((c) => c.category === opts.keepCategory)) {
      renderQuizBankCategoryDetail(opts.keepCategory);
    } else {
      questionBankCurrentCategory = null;
      renderQuizBankCategoryFolders();
    }
  } catch (err) {
    showToast(err.message || 'Could not open set.', 'error');
    questionBankCurrentSetId = null;
    questionBankCurrentSet = null;
    questionBankCurrentCategory = null;
    loadQuestionBank();
  }
}





window.copyQuizBankItem = async function(id) {
  const item = questionBankItems.find((i) => i.id === id);
  if (!item) return;
  let text = item.question || '';
  if (Array.isArray(item.choices) && item.choices.length) {
    text += '\n' + item.choices.map((c, j) => `${String.fromCharCode(65 + j)}. ${c}`).join('\n');
  }
  if (item.answer) text += `\nAnswer: ${item.answer}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied.');
  } catch {
    showToast('Could not copy.', 'error');
  }
};

window.deleteQuizBankItem = async function(id) {
  if (!confirm('Remove this item from Classwork?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    questionBankSelected.delete(id);
    showToast('Removed.');
    if (questionBankCurrentSetId) {
      await openQuizBankSet(questionBankCurrentSetId, { keepCategory: questionBankCurrentCategory });
    } else loadQuestionBank();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

qbGradeMenuApi = wireDownloadSelectMenu({
  menuId: 'qb-filter-grade-menu',
  btnId: 'qb-filter-grade-btn',
  panelId: 'qb-filter-grade-panel',
  options: [{ value: '', label: 'All my grades' }],
  getValue: () => qbFilterGrade,
  setValue: (v) => { qbFilterGrade = v || ''; },
  onPick: () => {
    questionBankCurrentSetId = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    fillQuizBankSubjectFilter();
    loadQuestionBank();
  }
});

qbSubjectMenuApi = wireDownloadSelectMenu({
  menuId: 'qb-filter-subject-menu',
  btnId: 'qb-filter-subject-btn',
  panelId: 'qb-filter-subject-panel',
  options: [{ value: '', label: 'All subjects' }],
  getValue: () => qbFilterSubjectId,
  setValue: (v) => { qbFilterSubjectId = v || ''; },
  onPick: () => {
    questionBankCurrentSetId = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    loadQuestionBank();
  }
});

document.getElementById('qb-set-back')?.addEventListener('click', () => {
  if (questionBankCurrentCategory) {
    questionBankSelected.clear();
    renderQuizBankCategoryFolders();
    return;
  }
  questionBankCurrentSetId = null;
  questionBankCurrentSet = null;
  questionBankCurrentCategory = null;
  questionBankSelected.clear();
  loadQuestionBank();
});

document.getElementById('qb-select-all')?.addEventListener('click', () => selectAllQuizBankItems());
document.getElementById('qb-clear-selection')?.addEventListener('click', () => clearQuizBankSelection());

document.getElementById('qb-set-delete')?.addEventListener('click', async () => {
  if (!questionBankCurrentSetId) return;
  if (!confirm('Delete this entire quiz set and its items?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/sets/${questionBankCurrentSetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    questionBankCurrentSetId = null;
    questionBankCurrentSet = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    showToast('Set removed.');
    loadQuestionBank();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('qb-edit-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('qb-edit-modal');
  if (modal) modal.hidden = true;
});

document.getElementById('qb-edit-type')?.addEventListener('change', () => syncQuizBankChoicesVisibility());

document.getElementById('qb-add-question-btn')?.addEventListener('click', () => {
  openQuizBankAdd(questionBankCurrentCategory === 'activity' ? 'activity_prompt' : 'mcq');
});
document.getElementById('qb-add-question-btn-bulk')?.addEventListener('click', () => {
  openQuizBankAdd(questionBankCurrentCategory === 'activity' ? 'activity_prompt' : 'mcq');
});

document.getElementById('qb-edit-save')?.addEventListener('click', async () => {
  const id = document.getElementById('qb-edit-id')?.value;
  const question = document.getElementById('qb-edit-question')?.value?.trim();
  const choicesRaw = document.getElementById('qb-edit-choices')?.value || '';
  const choices = choicesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
  const answer = document.getElementById('qb-edit-answer')?.value?.trim() || null;
  const points = document.getElementById('qb-edit-points')?.value;
  const grade_level = document.getElementById('qb-edit-grade')?.value;
  const item_type = document.getElementById('qb-edit-type')?.value || 'mcq';
  if (!question) {
    showToast('Enter a question.', 'error');
    return;
  }
  if (!grade_level) {
    showToast('Select an assigned grade.', 'error');
    return;
  }
  if (item_type === 'mcq' && choices.length < 2) {
    showToast('Multiple choice needs at least 2 choices (one per line).', 'error');
    return;
  }

  const payload = {
    question,
    choices: item_type === 'mcq' ? choices : null,
    answer,
    points,
    grade_level: Number(grade_level),
    item_type,
    subject_id: questionBankCurrentSet?.subject_id || null,
    quiz_set_id: questionBankCurrentSetId || null,
    lesson_title: questionBankCurrentSet?.title || null
  };

  try {
    const isNew = !id;
    const res = await fetch(
      isNew ? `${API_URL}/teacher/question-bank` : `${API_URL}/teacher/question-bank/${id}`,
      {
        method: isNew ? 'POST' : 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('qb-edit-modal').hidden = true;
    showToast(isNew ? 'Question added.' : 'Question updated.');
    if (questionBankCurrentSetId) {
      const keepCat = questionBankCurrentCategory
        || (item_type === 'activity_prompt' ? 'activity' : 'quizzes');
      await openQuizBankSet(questionBankCurrentSetId, { keepCategory: keepCat });
    } else loadQuestionBank();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function openCreateProgressFromBank() {
  const modal = document.getElementById('qb-create-modal');
  if (!modal || !questionBankSelected.size) return;

  await ensureTeacherAssignedClasses();

  const selectedItems = questionBankItems.filter((i) => questionBankSelected.has(i.id));
  const gradesInSelection = [...new Set(selectedItems.map((i) => Number(i.grade_level)))];
  if (gradesInSelection.length > 1) {
    showToast('Select items from one grade only, then create a Progress record.', 'error');
    return;
  }
  const targetGrade = gradesInSelection[0];

  const classSel = document.getElementById('qb-create-class');
  const pairs = getTeacherAssignedClassPairs().filter((p) =>
    targetGrade ? Number(p.grade_level) === Number(targetGrade) : true
  );
  if (classSel) {
    classSel.innerHTML = pairs.length
      ? '<option value="">-- Select your class --</option>' +
        pairs.map((p) =>
          `<option value="${p.grade_level}|${escapeHtml(p.section)}">Grade ${p.grade_level} – ${escapeHtml(p.section)}</option>`
        ).join('')
      : '<option value="">No assigned class for this grade</option>';
    if (teacherCurrentClass && pairs.some((p) =>
      Number(p.grade_level) === Number(teacherCurrentClass.grade) &&
      String(p.section).toUpperCase() === String(teacherCurrentClass.section).toUpperCase()
    )) {
      classSel.value = `${teacherCurrentClass.grade}|${teacherCurrentClass.section}`;
    }
  }

  const countEl = document.getElementById('qb-create-count');
  if (countEl) {
    countEl.textContent = `${questionBankSelected.size} item(s) selected · Grade ${targetGrade || '?'}`;
  }

  renderScoreSections('qb-create-sections', selectedItems, { syncMaxInputId: 'qb-create-max', resetValues: true });

  const titleEl = document.getElementById('qb-create-title');
  if (titleEl) {
    const set = questionBankCurrentSet || questionBankSets.find((s) => s.id === questionBankCurrentSetId);
    const lesson = selectedItems.find((i) => i.lesson_title)?.lesson_title;
    if (questionBankCurrentCategory === 'activity') {
      titleEl.value = lesson ? `Activity — ${lesson}` : (set?.title ? `Activity — ${set.title}` : 'Activity from Classwork');
    } else {
      titleEl.value = (set && set.title) || (lesson ? `Quiz — ${lesson}` : 'Quiz from Classwork');
    }
  }

  const typeSel = document.getElementById('qb-create-type');
  if (typeSel) {
    typeSel.value = questionBankCurrentCategory === 'activity' ? 'activity' : 'quiz';
  }

  const qtrSel = document.getElementById('qb-create-quarter');
  fillUnlockedQuarterSelect(qtrSel, teacherCurrentQuarter);

  modal.hidden = false;
}

document.getElementById('qb-create-progress-btn')?.addEventListener('click', () => openCreateProgressFromBank());
document.getElementById('qb-create-progress-next')?.addEventListener('click', () => openCreateProgressFromBank());

async function openAddQuizModal() {
  const modal = document.getElementById('qb-add-quiz-modal');
  if (!modal) return;
  await ensureTeacherAssignedClasses();
  await loadTeacherSubjects(true);

  const gradeSel = document.getElementById('qb-add-grade');
  const grades = getTeacherAssignedGrades();
  if (gradeSel) {
    gradeSel.innerHTML = grades.length
      ? '<option value="">Select grade</option>' + grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('')
      : '<option value="">No assigned grades</option>';
    if (teacherCurrentClass?.grade && grades.includes(Number(teacherCurrentClass.grade))) {
      gradeSel.value = String(teacherCurrentClass.grade);
    } else if (grades[0]) {
      gradeSel.value = String(grades[0]);
    }
  }
  fillAddQuizSubjectOptions();
  const titleInput = document.getElementById('qb-add-title');
  if (titleInput) titleInput.value = '';
  titleInput?.setAttribute('placeholder', 'e.g., Fractions Week 2');
  modal.hidden = false;
}

document.getElementById('qb-add-quiz-btn')?.addEventListener('click', () => openAddQuizModal());

/** Selected Classwork set ids / Material (lesson plan) ids in the Create Exam modal */
let examComposerSelectedSets = new Set();
let examComposerSelectedMaterials = new Set();
let examComposerSetsCache = [];
let examComposerMaterialsCache = [];
let examComposerItemsCache = [];
let examComposerSource = 'classwork';

function parseExamClassValue(val) {
  const [gradePart, ...sectionParts] = String(val || '').split('|');
  return {
    grade_level: Number(gradePart) || 0,
    section: sectionParts.join('|').trim()
  };
}

function setExamComposerSource(source) {
  examComposerSource = source === 'materials' ? 'materials' : 'classwork';
  document.querySelectorAll('#qb-exam-source-tabs [data-exam-source]').forEach((btn) => {
    btn.classList.toggle('primary', btn.dataset.examSource === examComposerSource);
  });
  const cw = document.getElementById('qb-exam-source-classwork');
  const mat = document.getElementById('qb-exam-source-materials');
  if (cw) cw.hidden = examComposerSource !== 'classwork';
  if (mat) mat.hidden = examComposerSource !== 'materials';
}

function fillExamSubjectOptions(grade) {
  const subjectSel = document.getElementById('qb-exam-subject');
  if (!subjectSel) return;
  const prev = subjectSel.value;
  const subjects = getAssignedSubjectsForGrade(grade);
  subjectSel.innerHTML =
    '<option value="">All subjects</option>' +
    subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  if (prev && [...subjectSel.options].some((o) => o.value === prev)) {
    subjectSel.value = prev;
  } else if (
    teacherCurrentClass?.subjectId &&
    String(teacherCurrentClass.grade) === String(grade) &&
    [...subjectSel.options].some((o) => o.value === String(teacherCurrentClass.subjectId))
  ) {
    subjectSel.value = String(teacherCurrentClass.subjectId);
  }
}

async function loadExamComposerSets() {
  const listEl = document.getElementById('qb-exam-sets-list');
  const emptyEl = document.getElementById('qb-exam-sets-empty');
  if (!listEl) return;

  const { grade_level } = parseExamClassValue(document.getElementById('qb-exam-class')?.value);
  const subjectId = document.getElementById('qb-exam-subject')?.value || '';

  if (!grade_level) {
    examComposerSetsCache = [];
    examComposerSelectedSets.clear();
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = 'Select a class to load Classwork sets.';
    }
    await refreshExamComposerItems();
    return;
  }

  const params = new URLSearchParams({ grade: String(grade_level) });
  if (subjectId) params.set('subject_id', subjectId);

  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/sets?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load sets');
    examComposerSetsCache = Array.isArray(data) ? data.filter((s) => Number(s.item_count) > 0) : [];
    const valid = new Set(examComposerSetsCache.map((s) => s.id));
    [...examComposerSelectedSets].forEach((id) => {
      if (!valid.has(id)) examComposerSelectedSets.delete(id);
    });

    if (!examComposerSetsCache.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = 'No Classwork sets with items for this class/subject yet. Upload materials, generate AI drafts, or add Classwork first.';
      }
    } else {
      if (emptyEl) emptyEl.hidden = true;
      listEl.innerHTML = examComposerSetsCache.map((s) => {
        const checked = examComposerSelectedSets.has(s.id) ? 'checked' : '';
        const subj = s.subject_name ? escapeHtml(s.subject_name) : 'No subject';
        const count = Number(s.item_count) || 0;
        const name = escapeHtml(s.title || 'Untitled set');
        return `
          <label class="qb-exam-set-row">
            <input type="checkbox" data-exam-set-id="${s.id}" ${checked} />
            <span>${name} · ${subj} · ${count} item(s)</span>
          </label>`;
      }).join('');
      listEl.querySelectorAll('input[data-exam-set-id]').forEach((input) => {
        input.addEventListener('change', () => {
          const id = Number(input.dataset.examSetId);
          if (input.checked) examComposerSelectedSets.add(id);
          else examComposerSelectedSets.delete(id);
          refreshExamComposerItems();
        });
      });
    }
    await refreshExamComposerItems();
  } catch (err) {
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = err.message || 'Failed to load Classwork sets.';
    }
    updateExamComposerPreview();
  }
}

async function loadExamComposerMaterials() {
  const listEl = document.getElementById('qb-exam-materials-list');
  const emptyEl = document.getElementById('qb-exam-materials-empty');
  if (!listEl) return;

  const { grade_level } = parseExamClassValue(document.getElementById('qb-exam-class')?.value);
  const subjectId = document.getElementById('qb-exam-subject')?.value || '';

  if (!grade_level) {
    examComposerMaterialsCache = [];
    examComposerSelectedMaterials.clear();
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = 'Select a class to load Materials.';
    }
    await refreshExamComposerItems();
    return;
  }

  try {
    const params = new URLSearchParams({ grade: String(grade_level) });
    if (subjectId) params.set('subject_id', subjectId);
    const [plansRes, setsRes] = await Promise.all([
      fetch(`${API_URL}/teacher/lesson-plans`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/teacher/question-bank/sets?${params}`, { headers: getAuthHeaders() })
    ]);
    const plansData = await plansRes.json();
    const setsData = await setsRes.json();
    if (!plansRes.ok) throw new Error(plansData.error || 'Failed to load materials');
    if (!setsRes.ok) throw new Error(setsData.error || 'Failed to load Classwork sets');

    const sets = Array.isArray(setsData) ? setsData : [];
    const countByLesson = new Map();
    sets.forEach((s) => {
      const lp = Number(s.lesson_plan_id);
      if (!lp) return;
      const prev = countByLesson.get(lp) || { item_count: 0, set_ids: [] };
      prev.item_count += Number(s.item_count) || 0;
      prev.set_ids.push(s.id);
      countByLesson.set(lp, prev);
    });

    const plans = Array.isArray(plansData) ? plansData : [];
    examComposerMaterialsCache = plans
      .filter((p) => Number(p.grade_level) === Number(grade_level))
      .filter((p) => !subjectId || String(p.subject_id) === String(subjectId))
      .map((p) => {
        const meta = countByLesson.get(Number(p.id)) || { item_count: 0, set_ids: [] };
        return {
          id: Number(p.id),
          title: p.title || 'Untitled material',
          subject_name: p.subject_name || '',
          item_count: meta.item_count,
          set_ids: meta.set_ids
        };
      })
      .filter((p) => p.item_count > 0);

    const valid = new Set(examComposerMaterialsCache.map((m) => m.id));
    [...examComposerSelectedMaterials].forEach((id) => {
      if (!valid.has(id)) examComposerSelectedMaterials.delete(id);
    });

    if (!examComposerMaterialsCache.length) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = 'No materials with Classwork items for this class/subject yet. Upload a material, generate drafts, and save to Classwork first.';
      }
    } else {
      if (emptyEl) emptyEl.hidden = true;
      listEl.innerHTML = examComposerMaterialsCache.map((m) => {
        const checked = examComposerSelectedMaterials.has(m.id) ? 'checked' : '';
        const subj = m.subject_name ? escapeHtml(m.subject_name) : 'No subject';
        const name = escapeHtml(m.title);
        return `
          <label class="qb-exam-set-row">
            <input type="checkbox" data-exam-material-id="${m.id}" ${checked} />
            <span>${name} · ${subj} · ${m.item_count} item(s)</span>
          </label>`;
      }).join('');
      listEl.querySelectorAll('input[data-exam-material-id]').forEach((input) => {
        input.addEventListener('change', () => {
          const id = Number(input.dataset.examMaterialId);
          if (input.checked) examComposerSelectedMaterials.add(id);
          else examComposerSelectedMaterials.delete(id);
          refreshExamComposerItems();
        });
      });
    }
    await refreshExamComposerItems();
  } catch (err) {
    listEl.innerHTML = '';
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = err.message || 'Failed to load materials.';
    }
    updateExamComposerPreview();
  }
}

async function refreshExamComposerItems() {
  examComposerItemsCache = [];
  const setIds = new Set([...examComposerSelectedSets]);
  examComposerMaterialsCache.forEach((m) => {
    if (!examComposerSelectedMaterials.has(m.id)) return;
    (m.set_ids || []).forEach((sid) => setIds.add(sid));
  });
  const ids = [...setIds];
  if (!ids.length) {
    updateExamComposerPreview();
    return;
  }

  try {
    const results = await Promise.all(
      ids.map(async (setId) => {
        const res = await fetch(`${API_URL}/teacher/question-bank/sets/${setId}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load set items');
        return Array.isArray(data.items) ? data.items : [];
      })
    );
    const seen = new Set();
    examComposerItemsCache = [];
    results.flat().forEach((item) => {
      if (!item?.id || seen.has(item.id)) return;
      seen.add(item.id);
      examComposerItemsCache.push(item);
    });
  } catch (err) {
    showToast(err.message || 'Could not load exam items.', 'error');
    examComposerItemsCache = [];
  }
  updateExamComposerPreview();
}

function getExamComposerFilteredItems() {
  // Activities live under Classwork; only include when a Classwork set is selected + checkbox on.
  const includeActivity = !!document.getElementById('qb-exam-include-activity')?.checked
    && examComposerSelectedSets.size > 0;
  return examComposerItemsCache.filter((it) => {
    if (String(it.item_type) === 'activity_prompt') return includeActivity;
    return true;
  });
}

function updateExamComposerPreview() {
  const preview = document.getElementById('qb-exam-preview');
  const confirmBtn = document.getElementById('qb-exam-confirm');
  const maxWrap = document.getElementById('qb-exam-max-wrap');
  const items = getExamComposerFilteredItems();
  const quizCount = items.filter((i) => String(i.item_type) !== 'activity_prompt').length;
  const activityCount = items.filter((i) => String(i.item_type) === 'activity_prompt').length;
  const hasSource = examComposerSelectedSets.size > 0 || examComposerSelectedMaterials.size > 0;

  if (items.length) {
    renderScoreSections('qb-exam-sections', items, { syncMaxInputId: 'qb-exam-max', resetValues: true });
    if (maxWrap) maxWrap.hidden = false;
  } else {
    const sec = document.getElementById('qb-exam-sections');
    if (sec) {
      sec.hidden = true;
      sec.innerHTML = '';
    }
    if (maxWrap) maxWrap.hidden = true;
  }

  const maxVal = Number(document.getElementById('qb-exam-max')?.value) || 0;

  if (preview) {
    if (!hasSource) {
      preview.textContent = 'Select a classwork set or material.';
    } else if (!items.length) {
      preview.textContent = examComposerSelectedSets.size
        ? 'Selected sources have no matching items (try including Activities).'
        : 'Selected sources have no matching quiz items.';
    } else {
      const parts = [`${items.length} item(s)`];
      if (quizCount) parts.push(`${quizCount} quiz`);
      if (activityCount) parts.push(`${activityCount} activities`);
      if (maxVal) parts.push(`Total ${maxVal}`);
      preview.textContent = `${parts.join(' · ')} — set part totals above; editable later in Records.`;
    }
  }
  if (confirmBtn) confirmBtn.disabled = items.length === 0;
}

async function openCreateExamModal() {
  const modal = document.getElementById('qb-exam-modal');
  if (!modal) return;

  await ensureTeacherAssignedClasses();
  await loadTeacherSubjects(true);

  examComposerSelectedSets.clear();
  examComposerSelectedMaterials.clear();
  examComposerSetsCache = [];
  examComposerMaterialsCache = [];
  examComposerItemsCache = [];
  setExamComposerSource('classwork');

  const pairs = getTeacherAssignedClassPairs();
  const classSel = document.getElementById('qb-exam-class');
  if (classSel) {
    classSel.innerHTML = pairs.length
      ? '<option value="">-- Select your class --</option>' +
        pairs.map((p) =>
          `<option value="${p.grade_level}|${escapeHtml(p.section)}">Grade ${p.grade_level} – ${escapeHtml(p.section)}</option>`
        ).join('')
      : '<option value="">No assigned classes</option>';
    if (teacherCurrentClass && pairs.some((p) =>
      Number(p.grade_level) === Number(teacherCurrentClass.grade) &&
      String(p.section).toUpperCase() === String(teacherCurrentClass.section).toUpperCase()
    )) {
      classSel.value = `${teacherCurrentClass.grade}|${teacherCurrentClass.section}`;
    }
  }

  const qtrSel = document.getElementById('qb-exam-quarter');
  const selectedQ = fillUnlockedQuarterSelect(qtrSel, teacherCurrentQuarter || CURRENT_QUARTER);

  const { grade_level } = parseExamClassValue(classSel?.value);
  fillExamSubjectOptions(grade_level);

  const titleEl = document.getElementById('qb-exam-title');
  if (titleEl) {
    const q = selectedQ || teacherCurrentQuarter || 'Q1';
    titleEl.value = `${q} Periodical Exam`;
  }

  const includeAct = document.getElementById('qb-exam-include-activity');
  if (includeAct) includeAct.checked = false;

  modal.hidden = false;
  await Promise.all([loadExamComposerSets(), loadExamComposerMaterials()]);
}

document.getElementById('qb-create-exam-btn')?.addEventListener('click', () => openCreateExamModal());

document.getElementById('qb-exam-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('qb-exam-modal');
  if (modal) modal.hidden = true;
});

document.getElementById('qb-exam-source-tabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-exam-source]');
  if (!btn) return;
  setExamComposerSource(btn.dataset.examSource);
});

document.getElementById('qb-exam-class')?.addEventListener('change', () => {
  const { grade_level } = parseExamClassValue(document.getElementById('qb-exam-class')?.value);
  fillExamSubjectOptions(grade_level);
  examComposerSelectedSets.clear();
  examComposerSelectedMaterials.clear();
  loadExamComposerSets();
  loadExamComposerMaterials();
});

document.getElementById('qb-exam-subject')?.addEventListener('change', () => {
  examComposerSelectedSets.clear();
  examComposerSelectedMaterials.clear();
  loadExamComposerSets();
  loadExamComposerMaterials();
});

document.getElementById('qb-exam-quarter')?.addEventListener('change', () => {
  const titleEl = document.getElementById('qb-exam-title');
  const q = document.getElementById('qb-exam-quarter')?.value;
  if (titleEl && q && (!titleEl.value || /Periodical Exam$/i.test(titleEl.value))) {
    titleEl.value = `${q} Periodical Exam`;
  }
});

document.getElementById('qb-exam-include-activity')?.addEventListener('change', () => {
  updateExamComposerPreview();
});
document.getElementById('qb-exam-confirm')?.addEventListener('click', async () => {
  const title = document.getElementById('qb-exam-title')?.value?.trim();
  const { grade_level, section } = parseExamClassValue(document.getElementById('qb-exam-class')?.value);
  const quarter = normalizeQuarterClient(document.getElementById('qb-exam-quarter')?.value || CURRENT_QUARTER || 'Q1');
  const subjectRaw = document.getElementById('qb-exam-subject')?.value;
  const items = getExamComposerFilteredItems();
  const question_ids = items.map((i) => i.id);

  if (!(UNLOCKED_QUARTERS || []).map(normalizeQuarterClient).includes(quarter)) {
    showToast(`${quarter} is locked. Admin has unlocked through ${CURRENT_QUARTER} only.`, 'error');
    fillUnlockedQuarterSelect(document.getElementById('qb-exam-quarter'), CURRENT_QUARTER);
    return;
  }

  if (!grade_level || !section) {
    showToast('Select one of your assigned classes.', 'error');
    return;
  }
  if (!question_ids.length) {
    showToast('Select Classwork sets or Materials with at least one item.', 'error');
    return;
  }

  const subject_id = subjectRaw
    ? Number(subjectRaw)
    : items.find((i) => i.subject_id)?.subject_id || null;

  const section_totals = collectSectionTotalsFromWrap(document.getElementById('qb-exam-sections'));
  const max_score = Number(document.getElementById('qb-exam-max')?.value) || sumSectionTotals(section_totals) || items.length;

  const confirmBtn = document.getElementById('qb-exam-confirm');
  if (confirmBtn) confirmBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/teacher/assessments/from-bank`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || `${quarter} Periodical Exam`,
        type: 'exam',
        section,
        grade_level,
        quarter,
        subject_id,
        question_ids,
        max_score,
        section_totals
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create exam');
    document.getElementById('qb-exam-modal').hidden = true;
    showToast(data.message || 'Exam created in Records.');
    applyTeacherPanel('progress');
    if (data.id) {
      setTimeout(() => openProgressEditor(data.id, 'edit'), 200);
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    updateExamComposerPreview();
  }
});

document.getElementById('qb-add-grade')?.addEventListener('change', () => {
  fillAddQuizSubjectOptions();
});

document.getElementById('qb-add-quiz-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('qb-add-quiz-modal');
  if (modal) modal.hidden = true;
});

document.getElementById('qb-add-quiz-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('qb-add-title')?.value?.trim();
  const grade_level = Number(document.getElementById('qb-add-grade')?.value);
  const subjectRaw = document.getElementById('qb-add-subject')?.value;
  const subject_id = subjectRaw ? Number(subjectRaw) : null;
  if (!title) {
    showToast('Enter a title.', 'error');
    return;
  }
  if (!grade_level) {
    showToast('Select a grade.', 'error');
    return;
  }
  if (!subject_id) {
    showToast('Select a subject.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/sets`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, grade_level, subject_id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const modal = document.getElementById('qb-add-quiz-modal');
    if (modal) modal.hidden = true;
    showToast(data.message || 'Classwork set created.');
    questionBankCurrentSetId = null;
    questionBankCurrentCategory = null;
    questionBankSelected.clear();
    await loadQuestionBank();
    if (data.id) await openQuizBankSet(data.id);
  } catch (err) {
    showToast(err.message || 'Could not create set.', 'error');
  }
});

document.getElementById('qb-create-cancel')?.addEventListener('click', () => {
  const modal = document.getElementById('qb-create-modal');
  if (modal) modal.hidden = true;
});

document.getElementById('qb-create-confirm')?.addEventListener('click', async () => {
  const title = document.getElementById('qb-create-title')?.value?.trim();
  const type = document.getElementById('qb-create-type')?.value || 'quiz';
  const classVal = document.getElementById('qb-create-class')?.value || '';
  const quarter = normalizeQuarterClient(document.getElementById('qb-create-quarter')?.value || CURRENT_QUARTER || 'Q1');
  const question_ids = [...questionBankSelected];

  if (!(UNLOCKED_QUARTERS || []).map(normalizeQuarterClient).includes(quarter)) {
    showToast(`${quarter} is locked. Admin has unlocked through ${CURRENT_QUARTER} only.`, 'error');
    fillUnlockedQuarterSelect(document.getElementById('qb-create-quarter'), CURRENT_QUARTER);
    return;
  }

  const [gradePart, ...sectionParts] = classVal.split('|');
  const grade_level = Number(gradePart);
  const section = sectionParts.join('|').trim();
  if (!grade_level || !section) {
    showToast('Select one of your assigned classes.', 'error');
    return;
  }
  if (!question_ids.length) {
    showToast('Select at least one bank item.', 'error');
    return;
  }

  const selectedItems = questionBankItems.filter((i) => questionBankSelected.has(i.id));
  const subject_id = selectedItems.find((i) => i.subject_id)?.subject_id || null;
  const section_totals = collectSectionTotalsFromWrap(document.getElementById('qb-create-sections'));
  const max_score = Number(document.getElementById('qb-create-max')?.value) || sumSectionTotals(section_totals) || selectedItems.length;

  try {
    const res = await fetch(`${API_URL}/teacher/assessments/from-bank`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        section,
        grade_level,
        quarter,
        subject_id,
        question_ids,
        max_score,
        section_totals
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('qb-create-modal').hidden = true;
    questionBankSelected.clear();
    updateQuizBankSelectionMeta();
    showToast(data.message || 'Progress record created.');
    applyTeacherPanel('progress');
    if (data.id) {
      setTimeout(() => openProgressEditor(data.id, 'edit'), 200);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
});

window.deleteLessonPlan = async function(id) {
  if (!confirm('Delete this material?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/lesson-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Material deleted.');
    loadLessonPlans();
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('upload-material-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('lp-message');
  const title = document.getElementById('lp-title')?.value.trim();
  const subjectId = document.getElementById('lp-subject')?.value;
  const grade = document.getElementById('lp-grade')?.value;
  const objectives = document.getElementById('lp-objectives')?.value.trim();
  const fileInput = document.getElementById('lp-file');

  if (!title) {
    if (msg) msg.textContent = 'Please enter a title.';
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('subject_id', subjectId || '');
  formData.append('grade_level', grade);
  formData.append('objectives', objectives);
  if (fileInput?.files?.[0]) formData.append('file', fileInput.files[0]);

  try {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/teacher/lesson-plans`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (msg) msg.textContent = '';
    e.target.reset();
    fillLessonPlanGradeOptions();
    fillTeacherSubjectSelects();
    const modal = document.getElementById('upload-material-modal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('hidden', '');
    }
    showToast(data.message || 'Material uploaded.');
    loadLessonPlans();
  } catch (err) {
    if (msg) { msg.textContent = err.message; msg.style.color = '#b71c1c'; }
    showToast(err.message, 'error');
  }
});

const teacherObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.type === 'attributes' && m.attributeName === 'hidden') {
      const view = m.target;
      if (!view.hidden && view.dataset.view === 'teacher') {
        console.log('[Teacher] View activated');
        applyTeacherPanel('classroom');
        loadTeacherClasses();
        loadTeacherInbox();
      }
    }
  });
});

const teacherView = document.getElementById('view-teacher');
if (teacherView) {
  teacherObserver.observe(teacherView, { attributes: true });
}

// ========== PARENT PORTAL ==========
let parentCurrentChild = null;
let parentAllChildren = [];
let parentProfile = null;

// Parent tab history & back button
const parentTabHistory = [];
let isParentNavigatingBack = false;
const parentBackBtn = document.getElementById('parent-back-btn');

function updateParentBackButton() {
  if (parentBackBtn) {
    parentBackBtn.style.display = parentTabHistory.length > 0 ? 'inline-flex' : 'none';
  }
}

if (parentBackBtn) {
  parentBackBtn.addEventListener('click', () => {
    if (parentTabHistory.length > 0) {
      isParentNavigatingBack = true;
      const prevTab = parentTabHistory.pop();
      document.querySelector(`[data-parent-tab="${prevTab}"]`)?.click();
      updateParentBackButton();
    }
  });
}

async function loadParentProfile() {
  try {
    const res = await fetch(`${API_URL}/parent/me`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok) {
      parentProfile = data;
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = `${data.first_name} ${data.last_name}`;
      });
      const avatarImg = document.getElementById('parent-topbar-avatar-img') || document.getElementById('parent-avatar-img');
      if (avatarImg && data.avatar_url) {
        avatarImg.src = data.avatar_url;
        avatarImg.style.display = 'block';
        const initial = avatarImg.nextElementSibling;
        if (initial) initial.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Load profile error:', err);
  }
}

function updateParentChildName(text) {
  const childNameEl = document.getElementById('parent-child-name');
  if (!childNameEl) return;

  if (!parentAllChildren || parentAllChildren.length <= 1) {
    childNameEl.textContent = text || 'No linked children';
    childNameEl.style.display = '';
    return;
  }

  childNameEl.innerHTML = '';
  childNameEl.style.display = 'flex';
  childNameEl.style.alignItems = 'center';
  childNameEl.style.gap = '6px';
  childNameEl.style.flexWrap = 'nowrap';
  childNameEl.style.minWidth = '0';
  childNameEl.style.maxWidth = '100%';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'parent-child-name-text';
  nameSpan.textContent = text || 'No linked children';
  childNameEl.appendChild(nameSpan);

  const menu = document.createElement('div');
  menu.className = 'download-menu';
  menu.id = 'parent-child-switch-menu';
  menu.innerHTML = `
    <button type="button" class="chip-ghost parent-child-switch-btn" id="parent-child-switch-btn" aria-haspopup="true" aria-expanded="false" aria-label="Switch child" title="Switch child">▾</button>
    <div class="download-menu-panel download-menu-panel--scroll" id="parent-child-switch-panel" hidden></div>
  `;
  childNameEl.appendChild(menu);

  wireDownloadSelectMenu({
    menuId: 'parent-child-switch-menu',
    btnId: 'parent-child-switch-btn',
    panelId: 'parent-child-switch-panel',
    options: parentAllChildren.map((child) => ({
      value: String(child.id),
      label: `${child.last_name}, ${child.first_name} (Grade ${child.grade_level}-${child.section})`
    })),
    getValue: () => String(parentCurrentChild?.id || ''),
    setValue: (v) => {
      const selected = parentAllChildren.find((c) => String(c.id) === String(v));
      if (selected) parentCurrentChild = selected;
    },
    formatButtonLabel: () => '▾',
    onPick: () => {
      const selected = parentCurrentChild;
      if (!selected) return;
      updateParentChildName(`${selected.first_name} ${selected.last_name}`);
      const activeTab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab;
      if (activeTab === 'overview') renderParentOverview(selected);
      else if (activeTab === 'attendance') renderParentAttendance(selected);
      else if (activeTab === 'progress') renderParentProgress(selected);
      else if (activeTab === 'inbox' || activeTab === 'contact') renderParentInbox();
    }
  });
}

async function loadParentDashboard() {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  await loadParentProfile();

  try {
    const res = await fetch(`${API_URL}/parent/children`, { headers: getAuthHeaders() });
    const children = await res.json();
    if (!res.ok) throw new Error(children.error);

    if (!children.length) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"></div>
          <p>No children linked to your account yet.</p>
          <p style="font-size:0.78rem;">Contact the school admin if you believe this is an error.</p>
        </div>`;
      updateParentChildName('No linked children');
      parentAllChildren = [];
      parentCurrentChild = null;
      return;
    }

    parentAllChildren = children;
    parentCurrentChild = children[0];
    updateParentChildName(`${parentCurrentChild.first_name} ${parentCurrentChild.last_name}`);

    renderParentOverview(parentCurrentChild);

  } catch (err) {
    console.error('Load parent dashboard error:', err);
    contentEl.innerHTML = `<div class="empty-state"><p>Failed to load dashboard</p></div>`;
  }
}

function parentReportStudentHeading(student) {
  const name = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
  const grade = student.grade_level != null
    ? `Grade ${student.grade_level}-${student.section || ''}`
    : '';
  const lrn = student.lrn ? `LRN ${student.lrn}` : '';
  const bits = [grade, lrn].filter(Boolean).join(' · ');
  return { name, bits };
}

async function buildParentReportHtml(student, tab) {
  // No top identity header — section titles + tables are enough (same as Overview).
  if (tab === 'attendance') {
    let records = parentAttendanceCache;
    if (!Array.isArray(records) || !records.length) {
      records = await fetchParentAttendance(student.id);
      parentAttendanceCache = records;
    }
    if (!parentAttendanceMonth) {
      const now = new Date();
      parentAttendanceMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!parentAttendanceStatus) parentAttendanceStatus = 'all';
    const filtered = filterParentAttendanceRecords(records, {
      month: parentAttendanceMonth,
      status: parentAttendanceStatus
    });
    const statusBit = parentAttendanceStatus === 'all' ? 'All statuses' : parentAttendanceStatus;
    const monthBit = parentAttendanceMonthLabel(parentAttendanceMonth) || 'Selected month';
    const rows = filtered.map((r) => {
      const when = parentAttendanceWhenLabel(r);
      const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '-';
      return `<tr>
        <td>${escapeHtml(dateStr)}</td>
        <td>${escapeHtml(when)}</td>
        <td>${escapeHtml(r.status || '-')}</td>
      </tr>`;
    }).join('');
    return `
      <h2>Attendance Records</h2>
      <p>${escapeHtml(monthBit)} · ${escapeHtml(statusBit)} · ${filtered.length} record(s)</p>
      ${filtered.length ? `<table>
        <thead><tr><th>Date</th><th>Session / Subject</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` : '<p>No attendance records for this filter.</p>'}`;
  }

  if (tab === 'progress') {
    const res = await fetch(`${API_URL}/parent/child/${student.id}/progress`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load progress');
    const records = data.records || [];
    const rows = records.map((r) => {
      const typeLabel = r.type === 'quiz' ? 'Quiz' : r.type === 'activity' ? 'Activity' : 'Exam';
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : '-';
      return `<tr>
        <td>${escapeHtml(dateStr)}</td>
        <td>${escapeHtml(typeLabel)}</td>
        <td>${escapeHtml(r.title || '')}</td>
        <td>${escapeHtml(r.subject_name || '—')}</td>
        <td>${escapeHtml(`${r.score} / ${r.max_score}`)}</td>
        <td>${escapeHtml(`${r.percent}%`)}</td>
      </tr>`;
    }).join('');
    return `
      <h2>Progress Tracking</h2>
      <p>${records.length
        ? `Average across recorded items: ${escapeHtml(String(data.average))}% · ${records.length} item(s)`
        : 'No quiz, activity, or exam scores yet.'}</p>
      ${records.length ? `<table>
        <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Subject</th><th>Score</th><th>%</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>` : ''}`;
  }

  // Default: overview report
  let stats = { attendanceRate: 0, present: 0, absent: 0, late: 0, todayStatus: 'Not recorded' };
  try {
    const res = await fetch(`${API_URL}/parent/child/${student.id}/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok) stats = data;
  } catch { /* keep defaults */ }

  let recent = [];
  try {
    const records = await fetchParentAttendance(student.id);
    parentAttendanceCache = records;
    recent = filterParentAttendanceRecords(records, { limit: 5 });
  } catch { /* ignore */ }

  const gender = student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'N/A';
  const attRows = recent.map((r) => {
    const when = parentAttendanceWhenLabel(r);
    const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '-';
    return `<tr>
      <td>${escapeHtml(dateStr)}</td>
      <td>${escapeHtml(when)}</td>
      <td>${escapeHtml(r.status || '-')}</td>
    </tr>`;
  }).join('');

  return `
    <h2>Student Information</h2>
    <table>
      <tbody>
        <tr><th>Name</th><td>${escapeHtml(`${student.last_name || ''}, ${student.first_name || ''}`)}</td></tr>
        <tr><th>LRN</th><td>${escapeHtml(student.lrn || 'N/A')}</td></tr>
        <tr><th>Grade &amp; Section</th><td>${escapeHtml(`Grade ${student.grade_level}-${student.section || ''}`)}</td></tr>
        <tr><th>Gender</th><td>${escapeHtml(gender)}</td></tr>
      </tbody>
    </table>
    <h2>Attendance Summary</h2>
    <table>
      <tbody class="kpi-row">
        <tr><th>Attendance Rate (30 days)</th><td>${escapeHtml(String(stats.attendanceRate))}%</td></tr>
        <tr><th>Days Present (this month)</th><td>${escapeHtml(String(stats.present))}</td></tr>
        <tr><th>Days Absent (this month)</th><td>${escapeHtml(String(stats.absent))}</td></tr>
        <tr><th>Today's Status</th><td>${escapeHtml(stats.todayStatus || 'Not recorded')}</td></tr>
      </tbody>
    </table>
    <h2>Recent Attendance</h2>
    ${recent.length ? `<table>
      <thead><tr><th>Date</th><th>Session / Subject</th><th>Status</th></tr></thead>
      <tbody>${attRows}</tbody>
    </table>` : '<p>No attendance records yet.</p>'}`;
}

async function printParentReport() {
  if (!parentCurrentChild) {
    showToast('No child selected to print.', 'error');
    return;
  }

  const tab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab || 'overview';
  if (tab === 'inbox' || tab === 'contact') {
    showToast('Open Overview, Attendance, or Progress to print a report.', 'error');
    return;
  }

  try {
    const bodyHtml = await buildParentReportHtml(parentCurrentChild, tab);
    // Blank title → no student name in browser print header
    openPrintHtmlDocument('', bodyHtml);
  } catch (err) {
    showToast(err.message || 'Failed to prepare report.', 'error');
  }
}

document.getElementById('parent-print-btn')?.addEventListener('click', () => {
  printParentReport();
});

const avatarUploadInput = document.getElementById('parent-avatar-upload');
if (avatarUploadInput) {
  avatarUploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(`${API_URL}/upload/avatar`, {
        method: 'POST',
        headers: { 'Authorization': getAuthHeaders().Authorization },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const avatarImg = document.getElementById('parent-avatar-img');
      if (avatarImg) avatarImg.src = data.avatarUrl + '?t=' + Date.now();
      alert('Profile picture updated!');

    } catch (err) {
      alert(err.message);
    }
  });
}

async function renderParentOverview(student) {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  let stats = { attendanceRate: 0, present: 0, absent: 0, late: 0, todayStatus: 'Not recorded' };
  try {
    const res = await fetch(`${API_URL}/parent/child/${student.id}/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok) stats = data;
  } catch (e) { console.error('Stats error:', e); }

  contentEl.innerHTML = `
    <div class="parent-main">
      <div id="parent-child-selector" style="margin-bottom:12px;"></div>

      <div class="parent-kpis">
        <div class="kpi-card">
          <div class="kpi-title">Attendance Rate</div>
          <div class="kpi-value"><span>${stats.attendanceRate}%</span></div>
          <div class="kpi-sub">Last 30 days</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Days Present</div>
          <div class="kpi-value"><span>${stats.present}</span></div>
          <div class="kpi-sub">This month</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Days Absent</div>
          <div class="kpi-value"><span>${stats.absent}</span></div>
          <div class="kpi-sub">This month</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Today's Status</div>
          <div class="kpi-value"><span style="color:${stats.todayStatus === 'Present' ? '#1b5e20' : stats.todayStatus === 'Absent' ? '#b71c1c' : '#666'}">${stats.todayStatus}</span></div>
          <div class="kpi-sub">${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="chart-card">
        <h3 style="font-size:1rem;color:var(--maroon-deep);margin-bottom:12px;">Student Information</h3>
        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:12px;font-size:0.85rem;">
          <div><strong>Name:</strong> ${student.last_name}, ${student.first_name}</div>
          <div><strong>LRN:</strong> ${student.lrn || 'N/A'}</div>
          <div><strong>Grade & Section:</strong> Grade ${student.grade_level}-${student.section}</div>
          <div><strong>Gender:</strong> ${student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'N/A'}</div>
        </div>
      </div>

      <div class="chart-card">
        <div class="teacher-header-row" style="align-items:center;">
          <h3 style="font-size:1rem;color:var(--maroon-deep);margin:0;">Recent Attendance</h3>
          <button type="button" class="chip-ghost" id="parent-attendance-see-more" style="font-size:0.78rem;">See More →</button>
        </div>
        <div id="parent-attendance-table-wrap">
          <p style="color:var(--text-muted);font-size:0.84rem;">Loading...</p>
        </div>
      </div>

      <div class="chart-card" style="background:var(--peach-soft);border-color:rgba(243,156,18,0.35);">
        <h3 style="font-size:1rem;color:var(--maroon-deep);margin-bottom:8px;">🤖 AI Progress Summary</h3>
        <p style="font-size:0.85rem;color:var(--text-dark);line-height:1.6;">
          <em>AI-generated insights will appear here once enough attendance and assessment data is collected.</em>
        </p>
      </div>
    </div>
  `;

  loadParentAttendanceTable(student.id);
  document.getElementById('parent-attendance-see-more')?.addEventListener('click', () => {
    document.querySelector('[data-parent-tab="attendance"]')?.click();
  });
}

let parentAttendanceCache = [];
let parentAttendanceMonth = ''; // YYYY-MM
let parentAttendanceStatus = 'all'; // all | Late | Absent | Present
let parentAttStatusMenuApi = null;
let parentAttMonthMenuApi = null;

function parentAttendanceWhenLabel(r) {
  return r.subject_name
    ? r.subject_name
    : (r.session === 'PM' ? 'Afternoon' : 'Morning');
}

function parentAttendanceMonthKey(r) {
  if (!r?.date) return '';
  const d = new Date(r.date);
  if (Number.isNaN(d.getTime())) {
    const s = String(r.date).slice(0, 7);
    return /^\d{4}-\d{2}$/.test(s) ? s : '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parentAttendanceMonthOptions(records) {
  const keys = new Set();
  (records || []).forEach((r) => {
    const k = parentAttendanceMonthKey(r);
    if (k) keys.add(k);
  });
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  keys.add(current);
  return [...keys].sort((a, b) => b.localeCompare(a));
}

function parentAttendanceMonthLabel(ym) {
  if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return ym || '';
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(y, m - 1, 1);
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function filterParentAttendanceRecords(records, { month = '', status = 'all', limit = null } = {}) {
  let list = Array.isArray(records) ? [...records] : [];
  list.sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    if (db !== da) return db - da; // newest date first
    // Same day: PM (later) above AM
    const sa = String(a.session || '').toUpperCase() === 'PM' ? 0
      : String(a.session || '').toUpperCase() === 'AM' ? 1 : 2;
    const sb = String(b.session || '').toUpperCase() === 'PM' ? 0
      : String(b.session || '').toUpperCase() === 'AM' ? 1 : 2;
    if (sa !== sb) return sa - sb;
    const subA = String(a.subject_name || '').toLowerCase();
    const subB = String(b.subject_name || '').toLowerCase();
    return subA.localeCompare(subB);
  });
  if (month) list = list.filter((r) => parentAttendanceMonthKey(r) === month);
  if (status && status !== 'all') {
    list = list.filter((r) => String(r.status || '').toLowerCase() === String(status).toLowerCase());
  }
  if (limit != null) list = list.slice(0, limit);
  return list;
}

function parentAttendanceRowsHtml(records) {
  return records.map((r) => {
    const when = escapeHtml(parentAttendanceWhenLabel(r));
    const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '-';
    const status = r.status || '-';
    const rowTint = status === 'Absent'
      ? 'background:rgba(183,28,28,0.08);'
      : status === 'Late'
        ? 'background:rgba(230,126,34,0.08);'
        : status === 'Excused'
          ? 'background:rgba(100,116,139,0.1);'
          : '';
    return `
      <tr style="${rowTint}">
        <td>${dateStr}</td>
        <td>${when}</td>
        <td><span class="badge ${(status || '').toLowerCase()}">${escapeHtml(status)}</span></td>
      </tr>`;
  }).join('');
}

function parentAttendanceTableHtml(records, { emptyText = 'No attendance records yet.' } = {}) {
  if (!records.length) {
    return `<p style="color:var(--text-muted);font-size:0.84rem;margin:0;">${escapeHtml(emptyText)}</p>`;
  }
  return `
    <table style="width:100%;font-size:0.82rem;">
      <thead style="background:var(--maroon-header);color:#fff;">
        <tr><th>Date</th><th>Session / Subject</th><th>Status</th></tr>
      </thead>
      <tbody>${parentAttendanceRowsHtml(records)}</tbody>
    </table>`;
}

async function fetchParentAttendance(studentId) {
  const res = await fetch(`${API_URL}/parent/child/${studentId}/attendance`, { headers: getAuthHeaders() });
  const records = await res.json();
  if (!res.ok) throw new Error(records.error);
  return Array.isArray(records) ? records : [];
}

async function loadParentAttendanceTable(studentId) {
  const wrap = document.getElementById('parent-attendance-table-wrap');
  if (!wrap) return;

  try {
    const records = await fetchParentAttendance(studentId);
    parentAttendanceCache = records;
    const recent = filterParentAttendanceRecords(records, { limit: 5 });
    wrap.innerHTML = parentAttendanceTableHtml(recent, {
      emptyText: 'No attendance records yet.'
    });
    const seeMore = document.getElementById('parent-attendance-see-more');
    if (seeMore) seeMore.hidden = records.length === 0;
  } catch (err) {
    wrap.innerHTML = '<p style="color:#b71c1c;font-size:0.84rem;">Failed to load attendance</p>';
  }
}

document.querySelectorAll('[data-parent-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentTab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab;
    const tabId = btn.dataset.parentTab;

    if (!isParentNavigatingBack && currentTab && currentTab !== tabId) {
      resetParentTabState(currentTab);
      parentTabHistory.push(currentTab);
      updateParentBackButton();
    }
    isParentNavigatingBack = false;

    document.querySelectorAll('[data-parent-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const contentEl = document.getElementById('parent-content');
    if (!contentEl || !parentCurrentChild) return;

    if (tabId === 'overview') renderParentOverview(parentCurrentChild);
    else if (tabId === 'attendance') renderParentAttendance(parentCurrentChild);
    else if (tabId === 'progress') renderParentProgress(parentCurrentChild);
    else if (tabId === 'inbox' || tabId === 'contact') renderParentInbox();
    else {
      contentEl.innerHTML = `
        <div class="empty-state">
          <p>${tabId.charAt(0).toUpperCase() + tabId.slice(1)} coming soon.</p>
        </div>`;
    }
    scrollPortalMain('view-parent');
    closeMobileNav();
  });
});

function renderParentAttendance(student) {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  const now = new Date();
  if (!parentAttendanceMonth) {
    parentAttendanceMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  if (!parentAttendanceStatus) parentAttendanceStatus = 'all';

  const statusOpts = [
    { value: 'all', label: 'All statuses' },
    { value: 'Late', label: 'Late' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Excused', label: 'Excused' },
    { value: 'Present', label: 'Present' }
  ];

  contentEl.innerHTML = `
    <div class="parent-main">
      <div class="chart-card">
        <div class="teacher-header-row">
          <div>
            <h3 class="page-heading font-heading" style="font-size:1.15rem;margin:0;">Attendance Records</h3>
            <p class="page-subheading" style="margin:4px 0 0;">Newest first. Filter by status or month.</p>
          </div>
        </div>
        <div class="parent-att-toolbar">
          <div class="download-menu" id="parent-att-status-menu">
            <button type="button" class="chip-ghost" id="parent-att-status-btn" aria-haspopup="true" aria-expanded="false">All Statuses ▾</button>
            <div class="download-menu-panel" id="parent-att-status-panel" hidden></div>
          </div>
          <div class="download-menu parent-att-menu--right" id="parent-att-month-menu">
            <button type="button" class="chip-ghost" id="parent-att-month-btn" aria-haspopup="true" aria-expanded="false">Month ▾</button>
            <div class="download-menu-panel download-menu-panel--scroll" id="parent-att-month-panel" hidden></div>
          </div>
        </div>
        <div id="parent-attendance-full" style="margin-top:8px;">
          <p style="color:var(--text-muted);">Loading…</p>
        </div>
      </div>
    </div>`;

  parentAttStatusMenuApi = wireDownloadSelectMenu({
    menuId: 'parent-att-status-menu',
    btnId: 'parent-att-status-btn',
    panelId: 'parent-att-status-panel',
    options: statusOpts,
    getValue: () => parentAttendanceStatus,
    setValue: (v) => { parentAttendanceStatus = v || 'all'; },
    onPick: () => paintParentAttendanceFull()
  });

  parentAttMonthMenuApi = wireDownloadSelectMenu({
    menuId: 'parent-att-month-menu',
    btnId: 'parent-att-month-btn',
    panelId: 'parent-att-month-panel',
    options: [],
    getValue: () => parentAttendanceMonth,
    setValue: (v) => { parentAttendanceMonth = v || ''; },
    emptyLabel: 'No months',
    onPick: () => paintParentAttendanceFull()
  });

  loadParentAttendanceFull(student.id);
}

function paintParentAttendanceFull() {
  const wrap = document.getElementById('parent-attendance-full');
  if (!wrap) return;

  const months = parentAttendanceMonthOptions(parentAttendanceCache);
  const selected = months.includes(parentAttendanceMonth)
    ? parentAttendanceMonth
    : (months[0] || parentAttendanceMonth);
  parentAttendanceMonth = selected;

  if (parentAttMonthMenuApi) {
    parentAttMonthMenuApi.setOptions(months.map((ym) => ({
      value: ym,
      label: parentAttendanceMonthLabel(ym)
    })));
  }

  const filtered = filterParentAttendanceRecords(parentAttendanceCache, {
    month: parentAttendanceMonth,
    status: parentAttendanceStatus
  });

  const statusBit = parentAttendanceStatus === 'all' ? '' : ` (${parentAttendanceStatus})`;
  wrap.innerHTML = parentAttendanceTableHtml(filtered, {
    emptyText: `No${statusBit} records for ${parentAttendanceMonthLabel(parentAttendanceMonth) || 'this month'}.`
  });
}

async function loadParentAttendanceFull(studentId) {
  const wrap = document.getElementById('parent-attendance-full');
  if (!wrap) return;
  try {
    parentAttendanceCache = await fetchParentAttendance(studentId);
    paintParentAttendanceFull();
  } catch (err) {
    wrap.innerHTML = '<p style="color:#b71c1c;">Failed to load</p>';
  }
}

function renderParentProgress(student) {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;
  contentEl.innerHTML = `
    <div class="parent-main">
      <div class="chart-card">
        <h3 style="font-size:1.1rem;color:var(--maroon-deep);">Progress Tracking</h3>
        <p class="page-subheading" id="parent-progress-avg">Loading scores…</p>
        <div id="parent-progress-table-wrap" style="margin-top:12px;"></div>
      </div>
    </div>`;
  loadParentProgress(student.id);
}

async function loadParentProgress(studentId) {
  const wrap = document.getElementById('parent-progress-table-wrap');
  const avgEl = document.getElementById('parent-progress-avg');
  if (!wrap) return;

  try {
    const res = await fetch(`${API_URL}/parent/child/${studentId}/progress`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const records = data.records || [];
    if (avgEl) {
      avgEl.textContent = records.length
        ? `Average across recorded items: ${data.average}%`
        : 'No quiz, activity, or exam scores yet.';
    }
    if (!records.length) {
      wrap.innerHTML = '<p style="color:var(--text-muted);">Teachers have not published scores for this student yet.</p>';
      return;
    }

    wrap.innerHTML = `
      <table style="width:100%;font-size:0.85rem;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th>Date</th><th>Type</th><th>Title</th><th>Subject</th><th>Score</th><th>%</th></tr>
        </thead>
        <tbody>
          ${records.map(r => `
            <tr>
              <td>${new Date(r.created_at).toLocaleDateString()}</td>
              <td><span class="badge type-${r.type}">${r.type === 'quiz' ? 'Quiz' : r.type === 'activity' ? 'Activity' : 'Exam'}</span></td>
              <td>${r.title}</td>
              <td>${r.subject_name || '—'}</td>
              <td>${r.score} / ${r.max_score}</td>
              <td>${r.percent}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    wrap.innerHTML = '<p style="color:#b71c1c;">Failed to load progress</p>';
  }
}

function renderParentContact() {
  // Contact Teachers merged into Inbox
  renderParentInbox();
}

async function openParentConcernModal() {
  const modal = document.getElementById('parent-concern-modal');
  const form = document.getElementById('parent-concern-form');
  const msg = document.getElementById('parent-concern-msg');
  const studentSelect = document.getElementById('concern-student');
  if (!modal || !studentSelect) return;

  const children = parentAllChildren || [];
  const selectedId = parentCurrentChild?.id || children[0]?.id || '';
  studentSelect.innerHTML = children.length
    ? children.map((c) =>
      `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${escapeHtml(c.last_name)}, ${escapeHtml(c.first_name)} (Grade ${c.grade_level}-${escapeHtml(c.section)})</option>`
    ).join('')
    : '<option value="">No linked students</option>';

  if (form) form.reset();
  // restore student after reset
  if (selectedId) studentSelect.value = String(selectedId);
  if (msg) {
    msg.hidden = true;
    msg.textContent = '';
  }
  document.getElementById('concern-subject').value = '';
  document.getElementById('concern-message').value = '';

  await loadContactTeachers(studentSelect.value);
  modal.hidden = false;
  modal.removeAttribute('hidden');
}

function closeParentConcernModal() {
  const modal = document.getElementById('parent-concern-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute('hidden', '');
}

async function loadContactTeachers(studentId) {
  const select = document.getElementById('concern-teacher');
  if (!select) return;
  if (!studentId) {
    select.innerHTML = '<option value="">Select student first</option>';
    return;
  }
  select.innerHTML = '<option value="">Loading…</option>';
  try {
    const res = await fetch(`${API_URL}/parent/child/${studentId}/teachers`, { headers: getAuthHeaders() });
    const teachers = await res.json();
    if (!res.ok) throw new Error(teachers.error);
    if (!teachers.length) {
      select.innerHTML = '<option value="">No teachers assigned yet</option>';
      return;
    }
    select.innerHTML = teachers.map((t) =>
      `<option value="${t.id}">${escapeHtml(t.last_name)}, ${escapeHtml(t.first_name)} (${escapeHtml(t.role_label || 'Teacher')})</option>`
    ).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load teachers</option>';
  }
}

async function submitParentConcern(e) {
  e.preventDefault();
  const msg = document.getElementById('parent-concern-msg');
  const payload = {
    student_id: document.getElementById('concern-student')?.value,
    teacher_id: document.getElementById('concern-teacher')?.value,
    subject: document.getElementById('concern-subject')?.value.trim(),
    message: document.getElementById('concern-message')?.value.trim()
  };
  if (!payload.student_id || !payload.teacher_id || !payload.message) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = 'Please choose a student and teacher, then write a message.';
    }
    return;
  }
  try {
    const res = await fetch(`${API_URL}/parent/concerns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    closeParentConcernModal();
    showToast('Concern sent to the teacher.');
    parentInboxFilter = 'unresolved';
    parentExpandedConcernId = data.id || null;
    renderParentInbox();
  } catch (err) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = err.message;
    }
    showToast(err.message, 'error');
  }
}

let parentConcernFilter = 'unresolved';
let parentConcernSearchQuery = '';
let parentConcernsCache = [];

async function loadParentConcerns() {
  // Concerns now load with the unified Inbox
  if (document.querySelector('[data-parent-tab].active')?.dataset.parentTab === 'inbox') {
    renderParentInbox();
  }
}

function paintParentConcernsList() {
  paintParentInboxList();
}

window.toggleParentConcern = async function(id) {
  const concernId = Number(id);
  if (!concernId) return;
  if (Number(parentExpandedConcernId) === concernId) {
    parentExpandedConcernId = null;
    paintParentInboxList();
    return;
  }
  parentExpandedConcernId = concernId;
  parentExpandedInboxKey = null;
  await markConcernReadForRole(concernId);
  const cached = (parentInboxCache.concerns || parentConcernsCache || []).find((c) => Number(c.id) === concernId);
  if (cached) {
    cached.is_read = 1;
    cached.read_at = new Date().toISOString();
  }
  paintParentInboxList();
};

const parentObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.type === 'attributes' && m.attributeName === 'hidden') {
      const view = m.target;
      if (!view.hidden && view.dataset.view === 'parent') {
        console.log('[Parent] View activated');
        loadParentDashboard();
        refreshParentInboxBadge();
      }
    }
  });
});

const parentView = document.getElementById('view-parent');
if (parentView) {
  parentObserver.observe(parentView, { attributes: true });
}

// ========== ADMIN VIEW OBSERVER ==========
const adminObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.type === 'attributes' && m.attributeName === 'hidden') {
      const view = m.target;
      if (!view.hidden && view.dataset.view === 'admin') {
        console.log('[Admin] View activated');
        const activeTab = document.querySelector('[data-admin-tab].active')?.dataset.adminTab;
        if (activeTab === 'overview' || !activeTab) { loadOverviewStats(); loadActivityLog(); }
        else if (activeTab === 'accounts') loadAccountsTable();
        else if (activeTab === 'students') { loadDropdowns(); loadStudentsTable(); }
        else if (activeTab === 'subjects') loadSubjectsTable();
        else if (activeTab === 'inbox') loadAdminInbox();
        else if (activeTab === 'announcements') loadAdminAnnouncements();
      }
    }
  });
});

// ========== ADMIN EDIT PROFILE MODAL ==========
const adminEditProfileBtn = document.getElementById('admin-edit-profile-btn');
const adminProfileModal = document.getElementById('admin-profile-modal');
const adminProfileCancel = document.getElementById('admin-profile-cancel');
const adminProfileForm = document.getElementById('admin-profile-form');

if (adminEditProfileBtn && adminProfileModal) {
  adminEditProfileBtn.addEventListener('click', () => {
    adminProfileModal.removeAttribute('hidden');
    adminSettingsDropdown?.setAttribute('hidden', '');
  });
}

if (adminProfileCancel && adminProfileModal) {
  adminProfileCancel.addEventListener('click', () => {
    adminProfileModal.setAttribute('hidden', '');
  });
}

if (adminProfileForm) {
  adminProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const avatarFile = document.getElementById('admin-profile-avatar').files[0];
    let avatarUrl = null;
    let uploadErr = null;

    // Step 1: Upload avatar independently
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      try {
        const avatarRes = await fetch(`${API_URL}/upload/avatar`, {
          method: 'POST',
          headers: { 'Authorization': getAuthHeaders().Authorization },
          body: formData
        });

        const contentType = avatarRes.headers.get('content-type') || '';
        let avatarData;
        if (contentType.includes('application/json')) {
          avatarData = await avatarRes.json();
        } else {
          const text = await avatarRes.text();
          throw new Error(`Avatar upload returned HTML (status ${avatarRes.status})`);
        }

        if (avatarRes.ok && (avatarData.avatarUrl || avatarData.avatar_url)) {
          avatarUrl = avatarData.avatarUrl || avatarData.avatar_url;
        } else {
          uploadErr = avatarData.error || `Avatar upload failed (status ${avatarRes.status})`;
        }
      } catch (err) {
        uploadErr = err.message;
      }
    }

    // Step 2: Try to update profile info (backend may not have this endpoint yet)
    const payload = {
      first_name: document.getElementById('admin-profile-first').value.trim(),
      last_name: document.getElementById('admin-profile-last').value.trim(),
      email: document.getElementById('admin-profile-email').value.trim()
    };

    let profileSaved = false;
    let profileErr = null;

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('HTML_RESPONSE');
      }

      if (!res.ok) throw new Error(data.error || `Profile update failed`);
      profileSaved = true;

    } catch (err) {
      // If endpoint doesn't exist, we just skip it and update localStorage only
      if (err.message === 'HTML_RESPONSE' || err.message.includes('Failed to fetch')) {
        profileErr = 'Backend endpoint not found — saved locally only';
      } else {
        profileErr = err.message;
      }
    }

    // Step 3: Always update localStorage and UI regardless of backend availability
    const user = getAuthUser() || {};
    user.first_name = payload.first_name;
    user.last_name = payload.last_name;
    user.name = `${payload.first_name} ${payload.last_name}`;
    user.email = payload.email;
    if (avatarUrl) user.avatar_url = avatarUrl;
    persistAuthUser(user);

    // Update UI
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.name;
    });
    document.querySelectorAll('[data-user-initial]').forEach(el => {
      el.textContent = user.name.charAt(0).toUpperCase();
    });

    // Update avatar image immediately
    const avatarImg = document.getElementById('admin-topbar-avatar-img');
    if (avatarImg && avatarUrl) {
      avatarImg.src = avatarUrl + '?t=' + Date.now();
      avatarImg.style.display = 'block';
      const initialSpan = avatarImg.nextElementSibling;
      if (initialSpan) initialSpan.style.display = 'none';
    }

    // Clear file input
    document.getElementById('admin-profile-avatar').value = '';

    // Refresh from server to ensure avatar persists
    loadUserProfile();

    // Build status message
    let msg = 'Profile updated';
    if (avatarUrl && !uploadErr) msg += ' • Avatar saved';
    if (uploadErr) msg += ` • Avatar failed: ${uploadErr}`;
    if (!profileSaved && profileErr) msg += ` • ${profileErr}`;

    alert(msg);
    adminProfileModal.setAttribute('hidden', '');
  });
}

const adminView = document.getElementById('view-admin');
if (adminView) {
  adminObserver.observe(adminView, { attributes: true });
}

// ========== ADMIN: SUBJECTS ==========
const subjectForm = document.getElementById('admin-subject-form');
if (subjectForm) {
  subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      code: document.getElementById('subject-code').value.trim().toUpperCase(),
      name: document.getElementById('subject-name').value.trim(),
      description: document.getElementById('subject-desc').value.trim(),
      applicable_grades: document.getElementById('subject-grades').value.trim()
    };
    try {
      const res = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      e.target.reset();
      closeAdminModal('add-subject-modal', { reset: false });
      await refreshSchoolData({ subjects: true, teachers: true, overview: true });
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadSubjectsTable() {
  const tbody = document.getElementById('admin-subjects-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_URL}/subjects`, { headers: getAuthHeaders() });
    const subjects = await res.json();

    console.log('[Subjects] Raw response:', subjects);
    if (subjects.length > 0) {
      console.log('[Subjects] First object keys:', Object.keys(subjects[0]));
      console.log('[Subjects] First object:', subjects[0]);
    }

    if (!res.ok) throw new Error(subjects.error);
    if (!Array.isArray(subjects)) throw new Error('Invalid data format');

    if (!subjects.length) {
      selectedSubjectIds.clear();
      updateSubjectsBulkBar();
      tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No subjects yet</td></tr>';
      return;
    }

    tbody.innerHTML = subjects.map(s => {
      const id = Number(s.id);
      const checked = selectedSubjectIds.has(id) ? 'checked' : '';
      return `
      <tr data-subject-id="${s.id || ''}">
        <td class="col-check">
          <input type="checkbox" class="admin-subject-check" data-subject-id="${s.id}" ${checked} aria-label="Select subject" />
        </td>
        <td class="sub-code">${escapeHtml(s.code || s.subject_code || s.Code || '—')}</td>
        <td class="sub-name">${escapeHtml(s.name || s.subject_name || s.Name || '—')}</td>
        <td class="sub-desc">${escapeHtml(s.description || '')}</td>
        <td class="sub-grades">${escapeHtml(s.applicable_grades || '')}</td>
        <td class="row-actions">
          <div class="row-menu-wrap">
            <button type="button" class="icon-btn row-menu-toggle" title="More actions" aria-label="More actions" aria-expanded="false">⋮</button>
            <div class="row-menu" hidden>
              <button type="button" class="row-menu-item" data-action="edit-subject" data-subject-id="${s.id}">Edit</button>
              <button type="button" class="row-menu-item row-menu-item--danger" data-action="delete-subject" data-subject-id="${s.id}">Delete</button>
            </div>
          </div>
        </td>
      </tr>`;
    }).join('');
    updateSubjectsBulkBar();

  } catch (err) {
    console.error('Load subjects error:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="empty-cell">Failed to load subjects: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function updateSubjectsBulkBar() {
  const bar = document.getElementById('admin-subjects-bulk-bar');
  const countEl = document.getElementById('admin-subjects-bulk-count');
  const selectAll = document.getElementById('admin-subjects-select-all');
  const n = selectedSubjectIds.size;
  if (countEl) countEl.textContent = `${n} selected`;
  if (bar) {
    bar.hidden = n === 0;
    if (n === 0) bar.setAttribute('hidden', '');
    else bar.removeAttribute('hidden');
  }
  const checks = [...document.querySelectorAll('#admin-subjects-table .admin-subject-check')];
  if (selectAll) {
    const anyChecked = checks.some((c) => c.checked);
    const allChecked = checks.length > 0 && checks.every((c) => c.checked);
    selectAll.indeterminate = false;
    selectAll.checked = allChecked;
    selectAll.indeterminate = anyChecked && !allChecked;
  }
}

(function setupSubjectsTableDelegation() {
  const tbody = document.getElementById('admin-subjects-tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const toggle = e.target.closest('.row-menu-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      toggleRowMenu(toggle, '#admin-subjects-table');
      return;
    }
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    closeAllRowMenus();
    const id = Number(btn.dataset.subjectId);
    if (!id) return;
    if (btn.dataset.action === 'edit-subject') startEditSubject(id);
    else if (btn.dataset.action === 'delete-subject') deleteSubject(id);
  });

  tbody.addEventListener('change', (e) => {
    const check = e.target.closest('.admin-subject-check');
    if (!check) return;
    const id = Number(check.dataset.subjectId);
    if (!id) return;
    if (check.checked) selectedSubjectIds.add(id);
    else selectedSubjectIds.delete(id);
    updateSubjectsBulkBar();
  });
})();

(function wireSubjectsSelectAll() {
  const selectAll = document.getElementById('admin-subjects-select-all');
  if (!selectAll) return;
  let wasIndeterminate = false;

  const captureState = () => {
    wasIndeterminate = !!selectAll.indeterminate;
  };
  selectAll.addEventListener('pointerdown', captureState);
  selectAll.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') captureState();
  });

  selectAll.addEventListener('click', () => {
    const checks = [...document.querySelectorAll('#admin-subjects-table .admin-subject-check')];
    const shouldSelectAll = !wasIndeterminate && selectAll.checked;

    checks.forEach((cb) => {
      cb.checked = shouldSelectAll;
      const id = Number(cb.dataset.subjectId);
      if (!id) return;
      if (shouldSelectAll) selectedSubjectIds.add(id);
      else selectedSubjectIds.delete(id);
    });
    if (!shouldSelectAll) selectedSubjectIds.clear();

    selectAll.indeterminate = false;
    selectAll.checked = shouldSelectAll;
    wasIndeterminate = false;
    updateSubjectsBulkBar();
  });
})();

document.getElementById('admin-subjects-bulk-delete')?.addEventListener('click', async () => {
  const ids = [...selectedSubjectIds];
  if (!ids.length) return;
  if (!confirm(`Delete ${ids.length} selected subject(s)?`)) return;
  try {
    for (const id of ids) {
      const res = await fetch(`${API_URL}/subjects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to delete subject #${id}`);
    }
    selectedSubjectIds.clear();
    showToast('Selected subjects deleted.');
    await refreshSchoolData({ subjects: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
});

window.startEditSubject = function(id) {
  const row = document.querySelector(`tr[data-subject-id="${id}"]`);
  if (!row) return;

  const code = row.querySelector('.sub-code').textContent.trim();
  const name = row.querySelector('.sub-name').textContent.trim();
  const desc = row.querySelector('.sub-desc').textContent.trim();
  const grades = row.querySelector('.sub-grades').textContent.trim();

  row.innerHTML = `
    <td class="col-check"></td>
    <td><input type="text" class="sub-input" value="${code.replace(/"/g, '&quot;')}" disabled style="background:#f0f0f0;color:#666;"></td>
    <td><input type="text" class="sub-input sub-input-name" value="${name.replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;"></td>
    <td><input type="text" class="sub-input sub-input-desc" value="${desc.replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;"></td>
    <td><input type="text" class="sub-input sub-input-grades" value="${grades.replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;"></td>
    <td style="white-space:nowrap;">
      <button class="chip-ghost primary" onclick="saveSubjectEdit(${id})">Save</button>
      <button class="chip-ghost" onclick="cancelSubjectEdit()">Cancel</button>
    </td>
  `;
};

window.cancelSubjectEdit = function() {
  loadSubjectsTable();
};

window.saveSubjectEdit = async function(id) {
  const row = document.querySelector(`tr[data-subject-id="${id}"]`);
  if (!row) return;

  const payload = {
    name: row.querySelector('.sub-input-name').value.trim(),
    description: row.querySelector('.sub-input-desc').value.trim(),
    applicable_grades: row.querySelector('.sub-input-grades').value.trim()
  };

  if (!payload.name) {
    alert('Subject name is required');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await refreshSchoolData({ subjects: true, teachers: true, overview: true });

  } catch (err) {
    alert(err.message);
  }
};

// FIX #5: Add confirmation before deleting subject
window.deleteSubject = async function(id) {
  if (!confirm('Delete this subject?')) return;
  try {
    const res = await fetch(`${API_URL}/subjects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshSchoolData({ subjects: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
};

// ========== CHANGE PASSWORD ==========
const changePasswordModal = document.getElementById('change-password-modal');
const changePasswordForm = document.getElementById('change-password-form');
const changePasswordCancel = document.getElementById('change-password-cancel');
let forcePasswordChange = false;

function openChangePasswordModal(forced) {
  forcePasswordChange = !!forced;
  const hint = document.getElementById('change-password-hint');
  const title = document.getElementById('change-password-title');
  const errEl = document.getElementById('change-password-error');
  if (hint) hint.hidden = !forcePasswordChange;
  if (title) title.textContent = forcePasswordChange ? 'Set a New Password' : 'Change Password';
  if (changePasswordCancel) changePasswordCancel.hidden = forcePasswordChange;
  if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
  changePasswordForm?.reset();
  resetChangePasswordFields();
  changePasswordModal?.classList.toggle('is-forced', forcePasswordChange);
  changePasswordModal?.removeAttribute('hidden');
}

function maybeForcePasswordChange(user) {
  if (!user?.must_change_password) return;
  openChangePasswordModal(true);
}

document.getElementById('admin-change-password-btn')?.addEventListener('click', () => {
  openChangePasswordModal(false);
  adminSettingsDropdown?.setAttribute('hidden', '');
});
document.getElementById('teacher-change-password-btn')?.addEventListener('click', () => {
  openChangePasswordModal(false);
  teacherSettingsDropdown?.setAttribute('hidden', '');
});
document.getElementById('parent-change-password-btn')?.addEventListener('click', () => {
  openChangePasswordModal(false);
  parentSettingsDropdown?.setAttribute('hidden', '');
});
document.getElementById('teacher-edit-profile-btn')?.addEventListener('click', () => {
  document.getElementById('admin-profile-modal')?.removeAttribute('hidden');
  teacherSettingsDropdown?.setAttribute('hidden', '');
});
document.getElementById('parent-edit-profile-btn')?.addEventListener('click', () => {
  document.getElementById('admin-profile-modal')?.removeAttribute('hidden');
  parentSettingsDropdown?.setAttribute('hidden', '');
});

changePasswordCancel?.addEventListener('click', () => {
  if (forcePasswordChange) return;
  changePasswordModal?.setAttribute('hidden', '');
});
changePasswordModal?.addEventListener('click', (e) => {
  if (e.target.id !== 'change-password-modal') return;
  if (forcePasswordChange) return;
  changePasswordModal.setAttribute('hidden', '');
});

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('change-password-error');
    const current = document.getElementById('cp-current').value;
    const newPass = document.getElementById('cp-new').value;
    const confirm = document.getElementById('cp-confirm').value;

    if (newPass !== confirm) {
      if (errEl) { errEl.hidden = false; errEl.textContent = 'New passwords do not match.'; }
      else showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ current_password: current, new_password: newPass })
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Server returned non-JSON response. The change-password endpoint may not exist yet.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      const user = getAuthUser() || {};
      user.must_change_password = false;
      persistAuthUser(user);
      forcePasswordChange = false;
      if (changePasswordCancel) changePasswordCancel.hidden = false;
      changePasswordModal?.classList.remove('is-forced');
      showToast('Password changed successfully');
      e.target.reset();
      resetChangePasswordFields();
      changePasswordModal?.setAttribute('hidden', '');

    } catch (err) {
      if (errEl) { errEl.hidden = false; errEl.textContent = err.message; }
      else showToast(err.message, 'error');
    }
  });
}

document.getElementById('admin-account-password-regen')?.addEventListener('click', () => {
  fillTempPasswordInput('admin-account-password');
});
document.getElementById('admin-account-password-copy')?.addEventListener('click', async () => {
  const el = document.getElementById('admin-account-password');
  const pw = el?.value?.trim() || '';
  if (!pw) return;
  try {
    await navigator.clipboard.writeText(pw);
    showToast('Temporary password copied.');
  } catch {
    el?.select?.();
    showToast('Select and copy the password manually.');
  }
});
document.getElementById('reset-password-regen')?.addEventListener('click', () => {
  fillTempPasswordInput('reset-password-temp');
});

document.getElementById('reset-password-cancel')?.addEventListener('click', () => {
  document.getElementById('reset-password-modal')?.setAttribute('hidden', '');
});
document.getElementById('reset-password-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'reset-password-modal') e.currentTarget.setAttribute('hidden', '');
});
document.getElementById('reset-password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('reset-password-user-id').value;
  const temp = document.getElementById('reset-password-temp').value.trim();
  const errEl = document.getElementById('reset-password-error');
  const user = lastAccountsData.find(u => String(u.id) === String(id));
  const label = user ? `${user.first_name} ${user.last_name}` : 'this account';
  if (temp.length < 6) {
    if (errEl) { errEl.hidden = false; errEl.textContent = 'Temporary password must be at least 6 characters.'; }
    return;
  }
  try {
    const res = await fetch(`${API_URL}/admin/accounts/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password: temp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('reset-password-modal')?.setAttribute('hidden', '');
    showToast(`Temporary password set for ${label}. Tell them to sign in and change it.`);
    refreshAdminOverview();
  } catch (err) {
    if (errEl) { errEl.hidden = false; errEl.textContent = err.message; }
    else showToast(err.message, 'error');
  }
});

function updateAnnouncementScopeFields() {
  const scopeEl = document.getElementById('announcement-scope');
  if (!scopeEl) return;
  const scope = scopeEl.value;
  const gradeWrap = document.getElementById('announcement-grade-wrap');
  const sectionWrap = document.getElementById('announcement-section-wrap');
  const gradeSelect = document.getElementById('announcement-grade');
  const sectionInput = document.getElementById('announcement-section');

  if (scope === 'school_wide') {
    if (gradeWrap) { gradeWrap.hidden = true; gradeWrap.style.display = 'none'; }
    if (sectionWrap) { sectionWrap.hidden = true; sectionWrap.style.display = 'none'; }
    if (gradeSelect) gradeSelect.value = '';
    if (sectionInput) sectionInput.value = '';
  } else if (scope === 'grade_wide') {
    if (gradeWrap) { gradeWrap.hidden = false; gradeWrap.style.display = ''; }
    if (sectionWrap) { sectionWrap.hidden = true; sectionWrap.style.display = 'none'; }
    if (sectionInput) sectionInput.value = '';
  } else if (scope === 'class_specific') {
    if (gradeWrap) { gradeWrap.hidden = false; gradeWrap.style.display = ''; }
    if (sectionWrap) { sectionWrap.hidden = false; sectionWrap.style.display = ''; }
  }
}

document.getElementById('announcement-scope')?.addEventListener('change', updateAnnouncementScopeFields);

// Force correct visibility whenever Announcements tab is opened
const _origLoadAdminAnnouncements = loadAdminAnnouncements;
loadAdminAnnouncements = function() {
  updateAnnouncementScopeFields();
  return _origLoadAdminAnnouncements.apply(this, arguments);
};
// Student table search & filters
document.getElementById('admin-student-search')?.addEventListener('input', (e) => {
  currentStudentFilter = e.target.value.trim();
  filterStudentsTable();
});

studentGradeMenuApi = wireDownloadSelectMenu({
  menuId: 'admin-student-grade-menu',
  btnId: 'admin-student-grade-btn',
  panelId: 'admin-student-grade-panel',
  options: STUDENT_GRADE_FILTER_OPTS,
  getValue: () => currentStudentGradeFilter,
  setValue: (v) => { currentStudentGradeFilter = v || ''; },
  onPick: async () => {
    currentStudentSectionFilter = '';
    await loadStudentFilterSections(currentStudentGradeFilter);
    filterStudentsTable();
  }
});

studentSectionMenuApi = wireDownloadSelectMenu({
  menuId: 'admin-student-section-menu',
  btnId: 'admin-student-section-btn',
  panelId: 'admin-student-section-panel',
  options: [{ value: '', label: 'All sections' }],
  getValue: () => currentStudentSectionFilter,
  setValue: (v) => { currentStudentSectionFilter = v || ''; },
  disabled: true,
  onPick: () => filterStudentsTable()
});

document.getElementById('admin-student-filter-clear')?.addEventListener('click', clearStudentFilters);

// Announcements form
function buildAnnouncementPayload(prefix) {
  const scope = document.getElementById(`${prefix}-scope`).value;
  const audienceEl = document.getElementById(`${prefix}-audience`);
  const payload = {
    title: document.getElementById(`${prefix}-title`).value.trim(),
    body: document.getElementById(`${prefix}-body`).value.trim(),
    scope,
    priority: document.getElementById(`${prefix}-priority`).value,
    audience: audienceEl ? audienceEl.value : 'everyone'
  };

  if (!payload.title || !payload.body) {
    throw new Error('Title and message are required');
  }

  if (scope === 'grade_wide' || scope === 'class_specific') {
    const gradeVal = document.getElementById(`${prefix}-grade`).value;
    if (!gradeVal) throw new Error('Select a grade for this scope');
    payload.target_grade = parseInt(gradeVal, 10);
  }
  if (scope === 'class_specific') {
    const sectionVal = document.getElementById(`${prefix}-section`).value.trim();
    if (!sectionVal) throw new Error('Enter a section for class-specific announcements');
    payload.target_section = sectionVal;
  }
  return payload;
}

document.getElementById('admin-announcement-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('admin-announcement-message');

  let payload;
  try {
    payload = buildAnnouncementPayload('announcement');
  } catch (err) {
    if (msgEl) { msgEl.textContent = err.message; msgEl.style.color = '#b71c1c'; }
    else showToast(err.message, 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Server returned ${res.status}: ${responseText.substring(0, 200)}`);
    }

    if (!res.ok) {
      const err = new Error(data.error || `Server error ${res.status}`);
      err.details = data.details || null;
      throw err;
    }

    showToast('Announcement sent successfully');
    e.target.reset();
    document.getElementById('announcement-grade-wrap').hidden = true;
    document.getElementById('announcement-section-wrap').hidden = true;
    closeAdminModal('compose-announcement-modal', { reset: false });
    await refreshSchoolData({ announcements: true, overview: true });
  } catch (err) {
    console.error('[Announcements] Error:', err);
    let displayMsg = err.message;
    if (err.details) displayMsg += ' • ' + err.details;
    showToast(displayMsg, 'error');
  }
});

function getCurrentUserId() {
  const user = getAuthUser() || {};
  return user.id || user.userId;
}

window.updateEditAnnouncementScopeFields = function() {
  const scopeEl = document.getElementById('edit-announcement-scope');
  if (!scopeEl) return;
  const scope = scopeEl.value;
  const gradeWrap = document.getElementById('edit-announcement-grade-wrap');
  const sectionWrap = document.getElementById('edit-announcement-section-wrap');
  const gradeSelect = document.getElementById('edit-announcement-grade');
  const sectionInput = document.getElementById('edit-announcement-section');

  if (scope === 'school_wide') {
    if (gradeWrap) { gradeWrap.hidden = true; gradeWrap.style.display = 'none'; }
    if (sectionWrap) { sectionWrap.hidden = true; sectionWrap.style.display = 'none'; }
    if (gradeSelect) gradeSelect.value = '';
    if (sectionInput) sectionInput.value = '';
  } else if (scope === 'grade_wide') {
    if (gradeWrap) { gradeWrap.hidden = false; gradeWrap.style.display = ''; }
    if (sectionWrap) { sectionWrap.hidden = true; sectionWrap.style.display = 'none'; }
    if (sectionInput) sectionInput.value = '';
  } else if (scope === 'class_specific') {
    if (gradeWrap) { gradeWrap.hidden = false; gradeWrap.style.display = ''; }
    if (sectionWrap) { sectionWrap.hidden = false; sectionWrap.style.display = ''; }
  }
};

window.startEditAnnouncement = async function(id) {
  try {
    const res = await fetch(`${API_URL}/admin/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const announcement = (data.announcements || []).find(a => a.id === id);
    if (!announcement) throw new Error('Announcement not found');

    document.getElementById('edit-announcement-id').value = id;
    document.getElementById('edit-announcement-title').value = announcement.title;
    document.getElementById('edit-announcement-body').value = announcement.body || '';
    document.getElementById('edit-announcement-scope').value = announcement.scope || 'school_wide';
    document.getElementById('edit-announcement-priority').value = announcement.priority || 'normal';
    const audienceEl = document.getElementById('edit-announcement-audience');
    if (audienceEl) audienceEl.value = announcement.audience || 'everyone';
    document.getElementById('edit-announcement-grade').value = announcement.target_grade || '';
    document.getElementById('edit-announcement-section').value = announcement.target_section || '';

    updateEditAnnouncementScopeFields();
    document.getElementById('edit-announcement-modal').removeAttribute('hidden');
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('edit-announcement-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-announcement-id').value;

  let payload;
  try {
    payload = buildAnnouncementPayload('edit-announcement');
  } catch (err) {
    showToast(err.message, 'error');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    document.getElementById('edit-announcement-modal').setAttribute('hidden', '');
    showToast('Announcement updated');
    loadAdminAnnouncements();
    refreshAdminOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('edit-announcement-cancel')?.addEventListener('click', () => {
  document.getElementById('edit-announcement-modal').setAttribute('hidden', '');
});

document.getElementById('edit-announcement-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'edit-announcement-modal') {
    document.getElementById('edit-announcement-modal').setAttribute('hidden', '');
  }
});

window.deleteAnnouncement = async function(id) {
  if (!confirm('Delete this announcement? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadAdminAnnouncements();
    refreshAdminOverview();
  } catch (err) {
    alert(err.message);
  }
};


window.toggleAnnouncementRead = toggleAnnouncementRead;
window.markAllAnnouncementsRead = markAllAnnouncementsRead;

// ========== TEACHER & PARENT DETAIL MODALS ==========
let currentDetailAccountId = null;
let currentDetailAccountRole = null;
let currentDetailAccountStatus = 'active';

function closeDetailActionsMenus() {
  closeDownloadMenu(
    document.getElementById('teacher-detail-actions-menu'),
    document.getElementById('teacher-detail-actions-btn')
  );
  closeDownloadMenu(
    document.getElementById('parent-detail-actions-menu'),
    document.getElementById('parent-detail-actions-btn')
  );
}

function updateDetailStatusActionLabel(status) {
  const label = status === 'active' ? 'Deactivate' : 'Activate';
  const teacherBtn = document.getElementById('teacher-detail-action-status');
  const parentBtn = document.getElementById('parent-detail-action-status');
  if (teacherBtn) teacherBtn.textContent = label;
  if (parentBtn) parentBtn.textContent = label;
}

function toggleDetailActionsMenu(role) {
  const menuId = role === 'teacher' ? 'teacher-detail-actions-menu' : 'parent-detail-actions-menu';
  const btnId = role === 'teacher' ? 'teacher-detail-actions-btn' : 'parent-detail-actions-btn';
  const otherRole = role === 'teacher' ? 'parent' : 'teacher';
  closeDownloadMenu(
    document.getElementById(`${otherRole}-detail-actions-menu`),
    document.getElementById(`${otherRole}-detail-actions-btn`)
  );
  toggleDownloadMenu(
    document.getElementById(btnId),
    document.getElementById(menuId)
  );
}

window.openTeacherDetailModal = async function(teacherId) {
  const modal = document.getElementById('teacher-detail-modal');
  const nameEl = document.getElementById('teacher-detail-name');
  const contentEl = document.getElementById('teacher-detail-content');

  closeDetailActionsMenus();
  modal.removeAttribute('hidden');
  contentEl.innerHTML = '<p style="color:var(--text-muted);">Loading...</p>';
  currentDetailAccountId = teacherId;
  currentDetailAccountRole = 'teacher';

  try {
    const res = await fetch(`${API_URL}/admin/teachers/${teacherId}/detail`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    currentDetailAccountStatus = data.status || 'active';
    updateDetailStatusActionLabel(currentDetailAccountStatus);
    nameEl.textContent = `${data.first_name} ${data.last_name}`;

    let html = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-size:0.88rem;margin-bottom:16px;">
        <div><strong>Email:</strong> ${data.email || '-'}</div>
        <div><strong>Phone:</strong> ${data.phone || '-'}</div>
        <div><strong>Status:</strong> ${statusBadgeHtml(data.status)}</div>
        <div><strong>Teaching Mode:</strong> ${teachingModeDisplay(data.teaching_mode, data.teaching_mode_label)}</div>
      </div>
    `;

    if (data.class_adviser_assignments && data.class_adviser_assignments.length > 0) {
      const uniqueCA = [...new Map(data.class_adviser_assignments.map(a => [
        `${a.grade_level}-${a.section}-${a.school_year}`, a
      ])).values()];

      html += `<h4 style="color:var(--maroon-deep);font-size:0.95rem;margin:16px 0 8px;">Class Adviser Assignment</h4>`;
      html += `<table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th style="padding:6px;text-align:left;">Grade</th><th style="padding:6px;text-align:left;">Section</th><th style="padding:6px;text-align:left;">School Year</th></tr>
        </thead>
        <tbody>`;
      uniqueCA.forEach(a => {
        html += `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:6px;">Grade ${a.grade_level}</td>
          <td style="padding:6px;">${a.section}</td>
          <td style="padding:6px;">${a.school_year}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }

    const adviserSubjects = data.adviser_subjects || [];
    if (adviserSubjects.length > 0) {
      html += `<h4 style="color:var(--maroon-deep);font-size:0.95rem;margin:16px 0 8px;">Subjects Taught as Class Adviser</h4>`;
      html += `<table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th style="padding:6px;text-align:left;">Subject</th><th style="padding:6px;text-align:left;">Class</th></tr>
        </thead>
        <tbody>`;
      adviserSubjects.forEach(a => {
        html += `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:6px;">${a.subject_name || a.subject_code || 'Subject ID ' + a.subject_id}</td>
          <td style="padding:6px;">Grade ${a.grade_level} – ${a.section}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }

    if (data.subject_assignments && data.subject_assignments.length > 0) {
      html += `<h4 style="color:var(--maroon-deep);font-size:0.95rem;margin:16px 0 8px;">Subject Teacher Assignments (Grades 4–6)</h4>`;
      html += `<table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th style="padding:6px;text-align:left;">Subject</th><th style="padding:6px;text-align:left;">Class</th></tr>
        </thead>
        <tbody>`;
      data.subject_assignments.forEach(a => {
        html += `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:6px;">${a.subject_name || a.subject_code || 'Subject ID ' + a.subject_id}</td>
          <td style="padding:6px;">Grade ${a.grade_level} – ${a.section}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }

    if ((!data.class_adviser_assignments || data.class_adviser_assignments.length === 0) &&
        (!adviserSubjects.length) &&
        (!data.subject_assignments || data.subject_assignments.length === 0)) {
      html += `<p style="color:var(--text-muted);font-size:0.85rem;margin-top:12px;">No assignments found for this teacher.</p>`;
    }

    contentEl.innerHTML = html;
  } catch (err) {
    contentEl.innerHTML = `<p style="color:#b71c1c;">Failed to load teacher details: ${err.message}</p>`;
  }
};

window.openParentDetailModal = async function(parentId) {
  const modal = document.getElementById('parent-detail-modal');
  const nameEl = document.getElementById('parent-detail-name');
  const contentEl = document.getElementById('parent-detail-content');

  closeDetailActionsMenus();
  modal.removeAttribute('hidden');
  contentEl.innerHTML = '<p style="color:var(--text-muted);">Loading...</p>';
  currentDetailAccountId = parentId;
  currentDetailAccountRole = 'parent';

  try {
    const res = await fetch(`${API_URL}/admin/parents/${parentId}/detail`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    currentDetailAccountStatus = data.status || 'active';
    updateDetailStatusActionLabel(currentDetailAccountStatus);
    nameEl.textContent = `${data.first_name} ${data.last_name}`;

    let html = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-size:0.88rem;margin-bottom:16px;">
        <div><strong>Email:</strong> ${data.email || '-'}</div>
        <div><strong>Phone:</strong> ${data.phone || '-'}</div>
        <div><strong>Status:</strong> ${statusBadgeHtml(data.status)}</div>
        <div><strong>Emergency Contact:</strong> ${data.emergency_contact || '-'}</div>
      </div>
    `;

    if (data.address) {
      html += `<div style="font-size:0.88rem;margin-bottom:16px;"><strong>Address:</strong> ${data.address}</div>`;
    }

    if (data.linked_students && data.linked_students.length > 0) {
      html += `<h4 style="color:var(--maroon-deep);font-size:0.95rem;margin:16px 0 8px;">👶 Linked Students</h4>`;
      html += `<table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr>
            <th style="padding:6px;text-align:left;">Name</th>
            <th style="padding:6px;text-align:left;">LRN</th>
            <th style="padding:6px;text-align:left;">Grade & Section</th>
            <th style="padding:6px;text-align:left;">Gender</th>
            <th style="padding:6px;text-align:left;">Status</th>
          </tr>
        </thead>
        <tbody>`;
      data.linked_students.forEach(s => {
        const middle = s.middle_name ? ' ' + s.middle_name : '';
        html += `<tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:6px;">${s.last_name}, ${s.first_name}${middle}</td>
          <td style="padding:6px;">${s.lrn || '-'}</td>
          <td style="padding:6px;">Grade ${s.grade_level}-${s.section}</td>
          <td style="padding:6px;">${s.gender === 'M' ? 'Male' : s.gender === 'F' ? 'Female' : '-'}</td>
          <td style="padding:6px;">${statusBadgeHtml(s.student_status)}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    } else {
      html += `<p style="color:var(--text-muted);font-size:0.85rem;margin-top:12px;">No students linked to this parent.</p>`;
    }

    contentEl.innerHTML = html;
  } catch (err) {
    contentEl.innerHTML = `<p style="color:#b71c1c;">Failed to load parent details: ${err.message}</p>`;
  }
};

// Modal close handlers
document.getElementById('teacher-detail-actions-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDetailActionsMenu('teacher');
});
document.getElementById('parent-detail-actions-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDetailActionsMenu('parent');
});

document.getElementById('teacher-detail-action-reset')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  document.getElementById('teacher-detail-modal')?.setAttribute('hidden', '');
  if (currentDetailAccountId) resetAccountPassword(currentDetailAccountId);
});
document.getElementById('parent-detail-action-reset')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  document.getElementById('parent-detail-modal')?.setAttribute('hidden', '');
  if (currentDetailAccountId) resetAccountPassword(currentDetailAccountId);
});

async function openEditAccountInfoModal(accountId, role) {
  closeDetailActionsMenus();
  const modal = document.getElementById('edit-account-info-modal');
  const msg = document.getElementById('edit-account-info-msg');
  if (!modal || !accountId) return;
  if (msg) {
    msg.hidden = true;
    msg.textContent = '';
  }

  try {
    const res = await fetch(`${API_URL}/admin/accounts/${accountId}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load account');

    document.getElementById('edit-account-id').value = String(data.id);
    document.getElementById('edit-account-role').value = data.role || role || '';
    document.getElementById('edit-account-first').value = data.first_name || '';
    document.getElementById('edit-account-last').value = data.last_name || '';
    document.getElementById('edit-account-email').value = data.email || '';
    document.getElementById('edit-account-phone').value = data.phone || '';

    const parentFields = document.getElementById('edit-account-parent-fields');
    const isParent = (data.role || role) === 'parent';
    if (parentFields) parentFields.hidden = !isParent;
    document.getElementById('edit-account-address').value = data.address || '';
    document.getElementById('edit-account-emergency').value = data.emergency_contact || '';

    const title = document.getElementById('edit-account-info-title');
    const sub = document.getElementById('edit-account-info-subtitle');
    if (title) title.textContent = isParent ? 'Edit Parent Info' : 'Edit Teacher Info';
    if (sub) sub.textContent = `Editing ${data.last_name || ''}, ${data.first_name || ''}`;


    modal.removeAttribute('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('teacher-detail-action-edit-info')?.addEventListener('click', () => {
  if (currentDetailAccountId) openEditAccountInfoModal(currentDetailAccountId, 'teacher');
});
document.getElementById('parent-detail-action-edit-info')?.addEventListener('click', () => {
  if (currentDetailAccountId) openEditAccountInfoModal(currentDetailAccountId, 'parent');
});

document.getElementById('edit-account-info-cancel')?.addEventListener('click', () => {
  document.getElementById('edit-account-info-modal')?.setAttribute('hidden', '');
});
document.getElementById('edit-account-info-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'edit-account-info-modal') {
    e.currentTarget.setAttribute('hidden', '');
  }
});

document.getElementById('edit-account-info-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-account-id')?.value;
  const role = document.getElementById('edit-account-role')?.value;
  const msg = document.getElementById('edit-account-info-msg');
  if (!id) return;

  const payload = {
    first_name: document.getElementById('edit-account-first').value.trim(),
    last_name: document.getElementById('edit-account-last').value.trim(),
    email: document.getElementById('edit-account-email').value.trim(),
    phone: document.getElementById('edit-account-phone').value.trim()
  };
  if (role === 'parent') {
    payload.address = document.getElementById('edit-account-address').value.trim();
    payload.emergency_contact = document.getElementById('edit-account-emergency').value.trim();
  }

  try {
    const res = await fetch(`${API_URL}/admin/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Update failed');

    document.getElementById('edit-account-info-modal')?.setAttribute('hidden', '');
    showToast(data.message || 'Account updated');

    await refreshSchoolData({ accounts: true, teachers: true, parents: true, overview: true });

    if (role === 'teacher') openTeacherDetailModal(id);
    else if (role === 'parent') openParentDetailModal(id);
  } catch (err) {
    if (msg) {
      msg.hidden = false;
      msg.textContent = err.message;
      msg.style.color = '#b71c1c';
    } else {
      showToast(err.message, 'error');
    }
  }
});

document.getElementById('teacher-detail-action-edit')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  const id = currentDetailAccountId;
  document.getElementById('teacher-detail-modal')?.setAttribute('hidden', '');
  if (id) openEditTeacherModal(id);
});

document.getElementById('teacher-detail-action-status')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  if (!currentDetailAccountId) return;
  const next = currentDetailAccountStatus === 'active' ? 'inactive' : 'active';
  toggleAccountStatus(currentDetailAccountId, next);
});
document.getElementById('parent-detail-action-status')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  if (!currentDetailAccountId) return;
  const next = currentDetailAccountStatus === 'active' ? 'inactive' : 'active';
  toggleAccountStatus(currentDetailAccountId, next);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.modal-actions-wrap')) closeDetailActionsMenus();
});

document.getElementById('teacher-detail-close')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  document.getElementById('teacher-detail-modal')?.setAttribute('hidden', '');
});
document.getElementById('teacher-detail-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'teacher-detail-modal') {
    closeDetailActionsMenus();
    document.getElementById('teacher-detail-modal')?.setAttribute('hidden', '');
  }
});

document.getElementById('parent-detail-close')?.addEventListener('click', () => {
  closeDetailActionsMenus();
  document.getElementById('parent-detail-modal')?.setAttribute('hidden', '');
});
document.getElementById('parent-detail-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'parent-detail-modal') {
    closeDetailActionsMenus();
    document.getElementById('parent-detail-modal')?.setAttribute('hidden', '');
  }
});