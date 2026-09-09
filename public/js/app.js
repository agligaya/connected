const API_URL = `${window.location.origin}/api`;
let SCHOOL_YEAR = '2025-2026';
let CURRENT_QUARTER = 'Q1';
let UNLOCKED_QUARTERS = ['Q1'];
let lastAccountsData = [];
let lastStudentsData = [];
let currentAccountRoleFilter = 'all';
let currentAccountStatusFilter = 'active';

function normalizeQuarterClient(value) {
  const q = String(value || 'Q1').toUpperCase();
  return ['Q1', 'Q2', 'Q3', 'Q4'].includes(q) ? q : 'Q1';
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
    note.textContent = `Unlocked through ${CURRENT_QUARTER}. Earlier quarters stay available.`;
  }

  const help = document.getElementById('admin-quarter-help');
  if (help) {
    help.textContent = CURRENT_QUARTER === 'Q4'
      ? 'All quarters are unlocked for Progress records.'
      : `Teachers can record Progress through ${CURRENT_QUARTER}.`;
  }

  const select = document.getElementById('admin-current-quarter');
  if (select) select.value = CURRENT_QUARTER;
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
      <td><span class="badge ${u.role}">${u.role}</span></td>
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
          : (u.emergency_contact || '-')}
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

window.resetAccountPassword = async function(id) {
  const user = lastAccountsData.find(u => u.id === id);
  const label = user ? `${user.first_name} ${user.last_name}` : 'this account';
  const modal = document.getElementById('reset-password-modal');
  const subtitle = document.getElementById('reset-password-subtitle');
  const errEl = document.getElementById('reset-password-error');
  document.getElementById('reset-password-user-id').value = id;
  document.getElementById('reset-password-temp').value = 'changeme123';
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

gradeSelect?.addEventListener('change', (e) => {
  loadSectionsForGrade(e.target.value);
  // Reset class adviser when grade changes
  const displayText = document.getElementById('student-class-adviser-text');
  const hiddenInput = document.getElementById('student-homeroom');
  if (displayText) {
    displayText.textContent = '-- Select Grade & Section --';
    displayText.style.color = 'var(--text-muted)';
  }
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
    if (displayText) {
      displayText.textContent = '-- Select Grade & Section --';
      displayText.style.color = 'var(--text-muted)';
    }
    if (hiddenInput) hiddenInput.value = '';
    return;
  }

  if (displayText) {
    displayText.textContent = 'Loading...';
    displayText.style.color = 'var(--text-muted)';
  }

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
      if (displayText) {
        displayText.textContent = `${data.teacher.last_name}, ${data.teacher.first_name}`;
        displayText.style.color = 'var(--text-dark)';
      }
      if (hiddenInput) hiddenInput.value = data.teacher.id;
      if (displayBox) displayBox.style.borderColor = 'var(--border-maroon)';
      if (errorEl) errorEl.style.display = 'none';
    } else {
      if (displayText) {
        displayText.textContent = data.message || 'No class adviser assigned';
        displayText.style.color = '#b71c1c';
      }
      if (hiddenInput) hiddenInput.value = '';
      if (displayBox) displayBox.style.borderColor = '#b71c1c';
      if (errorEl) {
        errorEl.textContent = data.message || 'No class adviser assigned';
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Load class adviser error:', err);
    if (displayText) {
      displayText.textContent = err.message || 'Failed to load';
      displayText.style.color = '#b71c1c';
    }
    if (hiddenInput) hiddenInput.value = '';
  }
}

// Helper to render a single student row from cached data (no API call)
function renderStudentRow(student) {
  return `
    <td class="att-lrn-cell">${escapeHtml(student.lrn || '-')}</td>
    <td class="att-name-cell">${formatStudentNameStacked(student)}</td>
    <td>Grade ${escapeHtml(String(student.grade_level))}</td>
    <td>${escapeHtml(student.section)}</td>
    <td>${student.parent_last ? escapeHtml(student.parent_last + ', ' + student.parent_first) : '<span style="color:#b71c1c">Unlinked</span>'}</td>
    <td>${statusBadgeHtml(student.status)}</td>
    <td class="row-actions">
      <button type="button" class="icon-btn" title="Edit student" aria-label="Edit student" onclick="startEditStudent(${student.id})">✎</button>
      ${student.status === 'inactive'
        ? `<button type="button" class="icon-btn icon-btn--ok" title="Re-enroll student" aria-label="Re-enroll student" onclick="reenrollStudent(${student.id})">↻</button>`
        : `<button type="button" class="icon-btn icon-btn--warn" title="Unenroll student" aria-label="Unenroll student" onclick="unenrollStudent(${student.id})">⊘</button>`
      }
      <button type="button" class="icon-btn icon-btn--danger" title="Delete student" aria-label="Delete student" onclick="deleteStudent(${student.id})">🗑</button>
    </td>
  `;
}

let currentStudentFilter = '';
let currentStudentGradeFilter = '';
let currentStudentSectionFilter = '';

async function loadStudentFilterSections(grade) {
  const sel = document.getElementById('admin-student-filter-section');
  if (!sel) return;

  if (!grade) {
    sel.innerHTML = '<option value="">All sections</option>';
    sel.disabled = true;
    sel.value = '';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/sections?grade_level=${encodeURIComponent(grade)}`, { headers: getAuthHeaders() });
    const sections = await res.json();
    if (!res.ok) throw new Error(sections.error);

    if (!sections.length) {
      sel.innerHTML = '<option value="">No sections yet</option>';
      sel.disabled = true;
      sel.value = '';
      return;
    }

    sel.innerHTML = '<option value="">All sections</option>' +
      sections.map((sec) => `<option value="${sec}">${sec}</option>`).join('');
    sel.disabled = false;

    if (currentStudentSectionFilter && sections.includes(currentStudentSectionFilter)) {
      sel.value = currentStudentSectionFilter;
    } else {
      currentStudentSectionFilter = '';
      sel.value = '';
    }
  } catch (err) {
    console.error('Load student filter sections error:', err);
    sel.innerHTML = '<option value="">Failed to load</option>';
    sel.disabled = true;
    sel.value = '';
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
  const gradeSel = document.getElementById('admin-student-filter-grade');
  if (search) search.value = '';
  if (gradeSel) gradeSel.value = '';
  loadStudentFilterSections('');
  filterStudentsTable();
}

function filterStudentsTable() {
  const tbody = document.querySelector('#admin-students-table tbody');
  if (!tbody) return;

  if (!lastStudentsData.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No students enrolled</td></tr>';
    return;
  }

  const filtered = getFilteredStudents();

  if (!filtered.length) {
    const parts = [];
    if (currentStudentGradeFilter) parts.push(`Grade ${currentStudentGradeFilter}`);
    if (currentStudentSectionFilter) parts.push(`Section ${currentStudentSectionFilter}`);
    if (currentStudentFilter) parts.push(`"${currentStudentFilter}"`);
    const label = parts.length ? parts.join(', ') : 'your filters';
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">No students match ${label}</td></tr>`;
    return;
  }

  const sorted = [...filtered].sort(compareStudentsByName);

  tbody.innerHTML = sorted.map(s => `
    <tr data-student-id="${s.id}" style="${s.status === 'inactive' ? 'opacity:0.6;background:#f9f9f9;' : ''}">
      ${renderStudentRow(s)}
    </tr>
  `).join('');
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
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Failed to load students</td></tr>`;
  }
}


// Event delegation for student table action buttons (Edit/Unenroll/Re-enroll/Delete)
// This ensures buttons work even after table re-renders
(function setupStudentTableDelegation() {
  const tbody = document.querySelector('#admin-students-table tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const studentId = parseInt(btn.dataset.studentId, 10);
    if (!studentId || isNaN(studentId)) return;

    e.preventDefault();
    e.stopPropagation();

    switch (action) {
      case 'edit-student': startEditStudent(studentId); break;
      case 'unenroll-student': unenrollStudent(studentId); break;
      case 'reenroll-student': reenrollStudent(studentId); break;
      case 'delete-student': deleteStudent(studentId); break;
    }
  });
})();

window.startEditStudent = function(id) {
  const student = lastStudentsData.find(s => s.id === id);
  if (!student) return;

  const row = document.querySelector(`tr[data-student-id="${id}"]`);
  if (!row) return;

  row.innerHTML = `
    <td><input type="text" class="sub-input sub-input-lrn" value="${(student.lrn || '').replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;" placeholder="12-digit LRN" maxlength="12" oninput="this.value=this.value.replace(/\D/g,'').slice(0,12)"></td>
    <td>
      <input type="text" class="sub-input sub-input-last" value="${student.last_name.replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;margin-bottom:4px;" placeholder="Last Name">
      <input type="text" class="sub-input sub-input-first" value="${student.first_name.replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;margin-bottom:4px;" placeholder="First Name">
      <input type="text" class="sub-input sub-input-middle" value="${(student.middle_name || '').replace(/"/g, '&quot;')}" style="width:100%;padding:6px;font-size:0.82rem;border:1px solid var(--border-maroon);border-radius:6px;" placeholder="Middle Name">
    </td>
    <td>Grade ${student.grade_level}</td>
    <td>${student.section}</td>
    <td>${student.parent_last ? student.parent_last + ', ' + student.parent_first : '<span style="color:#b71c1c">Unlinked</span>'}</td>
    <td>${statusBadgeHtml(student.status)}</td>
    <td class="row-actions">
      <button type="button" class="icon-btn icon-btn--ok" title="Save changes" aria-label="Save changes" onclick="saveStudentEdit(${id})">✓</button>
      <button type="button" class="icon-btn" title="Cancel" aria-label="Cancel" onclick="cancelStudentEdit(${id})">✕</button>
    </td>
  `;
};

// Cancel now re-renders from cached data instantly (no API call)
window.cancelStudentEdit = function(id) {
  const student = lastStudentsData.find(s => s.id === id);
  if (!student) {
    loadStudentsTable(); // fallback
    return;
  }

  const row = document.querySelector(`tr[data-student-id="${id}"]`);
  if (!row) return;

  row.innerHTML = renderStudentRow(student);
};

window.saveStudentEdit = async function(id) {
  const row = document.querySelector(`tr[data-student-id="${id}"]`);
  if (!row) return;

  const payload = {
    lrn: row.querySelector('.sub-input-lrn')?.value.trim() || null,
    last_name: row.querySelector('.sub-input-last')?.value.trim(),
    first_name: row.querySelector('.sub-input-first')?.value.trim(),
    middle_name: row.querySelector('.sub-input-middle')?.value.trim() || null
  };

  if (!payload.last_name || !payload.first_name) {
    alert('First and last name are required');
    return;
  }

  // LRN must be exactly 12 digits if provided
  if (payload.lrn && payload.lrn.length !== 12) {
    alert('LRN must be exactly 12 digits');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    // Check if response is JSON before parsing
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error('Server returned HTML instead of JSON. The update endpoint may not exist.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await refreshSchoolData({ students: true, teachers: true, overview: true });
  } catch (err) {
    alert(err.message);
  }
};

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
  const displayText = document.getElementById('reenroll-class-adviser-text');
  if (displayText) {
    displayText.textContent = '-- Select Grade & Section --';
    displayText.style.color = 'var(--text-muted)';
  }

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
    if (displayText) {
      displayText.textContent = '-- Select Grade & Section --';
      displayText.style.color = 'var(--text-muted)';
    }
    if (hiddenInput) hiddenInput.value = '';
    return;
  }

  if (displayText) {
    displayText.textContent = 'Loading...';
    displayText.style.color = 'var(--text-muted)';
  }

  try {
    const res = await fetch(`${API_URL}/admin/class-adviser?grade_level=${encodeURIComponent(grade)}&section=${encodeURIComponent(section)}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    if (data.teacher) {
      if (displayText) {
        displayText.textContent = `${data.teacher.last_name}, ${data.teacher.first_name}`;
        displayText.style.color = 'var(--text-dark)';
      }
      if (hiddenInput) hiddenInput.value = data.teacher.id;
      if (displayBox) displayBox.style.borderColor = 'var(--border-maroon)';
      if (errorEl) errorEl.style.display = 'none';
    } else {
      if (displayText) {
        displayText.textContent = data.message || 'No class adviser assigned';
        displayText.style.color = '#b71c1c';
      }
      if (hiddenInput) hiddenInput.value = '';
      if (displayBox) displayBox.style.borderColor = '#b71c1c';
      if (errorEl) {
        errorEl.textContent = data.message || 'No class adviser assigned';
        errorEl.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Load reenroll class adviser error:', err);
    if (displayText) {
      displayText.textContent = 'Failed to load';
      displayText.style.color = '#b71c1c';
    }
    if (hiddenInput) hiddenInput.value = '';
  }
}

// Re-enroll modal event listeners
document.getElementById('reenroll-grade')?.addEventListener('change', async (e) => {
  await loadReenrollSections(e.target.value);
  const displayText = document.getElementById('reenroll-class-adviser-text');
  const hiddenInput = document.getElementById('reenroll-homeroom');
  if (displayText) {
    displayText.textContent = '-- Select Grade & Section --';
    displayText.style.color = 'var(--text-muted)';
  }
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
    if (displayText) {
      displayText.textContent = '-- Select Grade & Section --';
      displayText.style.color = 'var(--text-muted)';
    }
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

    const recent = Array.isArray(logs) ? logs.slice(0, 8) : [];

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
    if (role === 'teacher') loadTeacherInbox(document.querySelector('[data-inbox-filter].active')?.dataset.inboxFilter || 'all');
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
      loadParentConcerns(document.getElementById('contact-student')?.value || parentCurrentChild?.id);
    }
    else if (role === 'teacher') loadTeacherInbox(document.querySelector('[data-inbox-filter].active')?.dataset.inboxFilter || 'all');
  } catch (err) {
    showToast(err.message, 'error');
  }
};


async function loadAdminAnnouncements() {
  const listEl = document.getElementById('admin-announcement-list');
  if (!listEl) return;

  try {
    const res = await fetch(`${API_URL}/admin/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const announcements = data.announcements || [];
    announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (!announcements.length) {
      listEl.innerHTML = '<li class="empty-state"><p>No announcements sent yet</p></li>';
      return;
    }

    listEl.innerHTML = announcements.map(a => {
      const isEdited = a.updated_at && new Date(a.updated_at).getTime() > new Date(a.created_at).getTime() + 1000;
      const editedLabel = isEdited ? `<span style="font-size:0.72rem;color:var(--text-muted);margin-left:6px;">(Edited ${new Date(a.updated_at).toLocaleString()})</span>` : '';
      return `
        <li class="inbox-item inbox-item--announcement ${priorityCardClass(a)}">
          <div class="inbox-item-header" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="badge" style="background:var(--maroon);color:#fff;">Announcement</span>
            ${priorityBadgeHtml(a)}
            <span style="font-size:0.75rem;color:var(--text-muted);flex:1;">${new Date(a.created_at).toLocaleString()}${editedLabel}</span>
          </div>
          <div style="margin-top:6px;font-weight:600;">${a.title}</div>
          <p style="margin-top:4px;color:var(--text-dark);font-size:0.85rem;">${a.body}</p>
          <div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);">
            ${announcementMeta(a)}
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button class="chip-ghost" onclick="startEditAnnouncement(${a.id})">Edit</button>
            <button class="chip-ghost" style="color:#b71c1c;border-color:#b71c1c;" onclick="deleteAnnouncement(${a.id})">Delete</button>
          </div>
        </li>
      `;
    }).join('');

  } catch (err) {
    console.error('Load announcements error:', err);
    listEl.innerHTML = '<li class="empty-state"><p>Failed to load announcements</p></li>';
  }
}

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

  const thread = replies.length
    ? `<div class="concern-thread">${replies.map(r => `
        <div class="concern-reply concern-reply--${r.sender_role || 'user'}">
          <div class="concern-reply-meta">
            <strong>${roleLabel(r.sender_role)}</strong>
            ${r.sender_name ? ` · ${r.sender_name}` : ''}
            ${r.created_at ? ` <span style="color:var(--text-muted);font-size:0.75rem;">(${new Date(r.created_at).toLocaleString()})</span>` : ''}
          </div>
          <div class="concern-reply-body">${r.message}</div>
        </div>`).join('')}</div>`
    : '<p style="margin-top:6px;color:var(--text-muted);font-size:0.82rem;">No replies yet. You can keep messaging until this is marked resolved.</p>';

  const replyForm = canReply && open
    ? `<textarea id="concern-reply-${item.id}" rows="2" class="concern-reply-input" placeholder="Write a follow-up message..."></textarea>`
    : '';

  const actions = canReply
    ? `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
         ${open ? `<button type="button" class="chip-ghost primary" onclick="replyToConcern(${item.id}, this)">Send Reply</button>` : ''}
         ${canReply && getAuthUser()?.role !== 'parent' && open
           ? `<button class="chip-ghost" onclick="resolveConcern(${item.id})">Mark Resolved</button>`
           : ''}
         ${!open ? '<span class="badge" style="background:#1b5e20;color:#fff;">Resolved — replies closed</span>' : ''}
       </div>`
    : (!open ? '<span class="badge" style="background:#1b5e20;color:#fff;margin-top:8px;display:inline-block;">Resolved</span>' : '');

  return thread + replyForm + actions;
}

function concernReplyHtml(item, canReply) {
  return concernThreadHtml(item, canReply);
}

async function refreshParentInboxBadge() {
  try {
    const res = await fetch(`${API_URL}/parent/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const announcements = data.announcements || [];
    const notices = data.messages || [];
    const unreadCount = announcements.filter(a => isUnread(a)).length
      + notices.filter(m => m.is_read === 0 || m.is_read === false).length;
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
    applyAccountFilters();
  }
}

function resetTeacherPanelState(panelId) {
  if (panelId === 'progress') {
    showProgressCreateForm(false);
    const editor = document.getElementById('progress-editor');
    const listWrap = document.getElementById('progress-list-wrap');
    if (editor) editor.hidden = true;
    if (listWrap) listWrap.hidden = false;
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
      btn.classList.toggle('active', btn.dataset.inboxFilter === 'all');
    });
  }
}

function resetParentTabState(tabId) {
  if (tabId === 'inbox') parentInboxFilter = 'all';
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


// ========== TEACHER INBOX ==========
async function loadTeacherInbox(filter = 'all') {
  const listEl = document.getElementById('teacher-inbox-list');
  const badgeEl = document.getElementById('teacher-inbox-badge');
  if (!listEl) return;

  document.querySelectorAll('[data-inbox-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.inboxFilter === filter);
  });

  try {
    const res = await fetch(`${API_URL}/teacher/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    let items = [];
    if (data.announcements) items = items.concat(data.announcements.map(a => ({ ...a, type: 'admin' })));
    if (data.concerns) items = items.concat(data.concerns.map(c => ({ ...c, type: 'parent' })));

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (filter !== 'all') {
      items = items.filter(i => i.type === filter);
    }

    // Update badge to unread announcements only
    const unreadAnnouncements = (data.announcements || []).filter(a => isUnread(a));
    const openConcerns = (data.concerns || []).filter(c => concernStatus(c) === 'open').length;
    const badgeCount = unreadAnnouncements.length + openConcerns;
    if (badgeEl) {
      badgeEl.textContent = badgeCount;
      badgeEl.hidden = badgeCount === 0;
    }

    const unreadCount = items.filter(i => i.type === 'admin' && isUnread(i)).length;
    const markAllBtn = unreadCount > 0
      ? `<div style="margin-bottom:10px;"><button class="chip-ghost primary" onclick="markAllAnnouncementsRead()">Mark All as Read (${unreadCount})</button></div>`
      : '';

    if (!items.length) {
      listEl.innerHTML = markAllBtn + `<li class="empty-state"><p>No ${filter === 'all' ? 'messages' : filter} found</p></li>`;
      return;
    }

    listEl.innerHTML = markAllBtn + items.map(item => {
      if (item.type === 'admin') {
        const unread = isUnread(item);
        const textStyle = unread ? 'font-weight:600;' : '';
        return `
          <li class="inbox-item inbox-item--announcement ${priorityCardClass(item)}" style="${unread ? '' : ''}">
            <div class="inbox-item-header" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="badge" style="background:var(--maroon);color:#fff;">Admin Announcement</span>
              ${priorityBadgeHtml(item)}
              <span style="font-size:0.75rem;color:var(--text-muted);flex:1;">${new Date(item.created_at).toLocaleString()}</span>
              <button type="button" class="chip-ghost announcement-read-btn ${unread ? 'primary' : ''}" data-id="${item.id}" data-unread="${unread}" onclick="toggleAnnouncementRead(${item.id}, ${!unread})" style="font-size:0.72rem;padding:4px 10px;">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>
            </div>
            <div style="margin-top:6px;font-weight:600;${textStyle}">${item.title}</div>
            <p style="margin-top:4px;color:var(--text-dark);font-size:0.85rem;${textStyle}">${item.body}</p>
            <div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);">
              From: ${item.sender_name || 'Admin'} | ${announcementMeta(item)}
            </div>
          </li>
        `;
      } else {
        return `
          <li class="inbox-item inbox-item--concern">
            <div class="inbox-item-header">
              <span class="badge" style="background:#b71c1c;color:#fff;">Parent Concern</span>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(item.created_at).toLocaleString()}</span>
            </div>
            <div style="margin-top:6px;"><strong>From:</strong> ${item.parent_name || 'Parent'}</div>
            <div><strong>Student:</strong> ${item.student_name || 'N/A'} (Grade ${item.grade_level || '?'}-${item.section || '?'}) | <strong>Subject:</strong> ${concernSubject(item)}</div>
            <p style="margin-top:6px;color:var(--text-dark);font-size:0.85rem;">${item.message}</p>
            ${concernReplyHtml(item, true)}
          </li>
        `;
      }
    }).join('');

  } catch (err) {
    console.error('Load teacher inbox error:', err);
    listEl.innerHTML = '<li class="empty-state"><p>Failed to load inbox</p></li>';
    if (badgeEl) badgeEl.hidden = true;
  }
}

let parentInboxFilter = 'all';

async function renderParentInbox() {
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  try {
    const res = await fetch(`${API_URL}/parent/inbox`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const announcements = data.announcements || [];
    const notices = data.messages || [];
    const unreadAnn = announcements.filter(a => isUnread(a)).length;
    const unreadMsg = notices.filter(m => m.is_read === 0 || m.is_read === false).length;
    const unreadCount = unreadAnn + unreadMsg;

    const isAdminAnnouncement = (a) => String(a.sender_role || 'admin') !== 'teacher';
    const filter = parentInboxFilter || 'all';
    let shownAnn = announcements;
    let shownNotices = notices;
    if (filter === 'admin') {
      shownAnn = announcements.filter(isAdminAnnouncement);
      shownNotices = [];
    } else if (filter === 'teacher') {
      shownAnn = announcements.filter(a => !isAdminAnnouncement(a));
      shownNotices = notices;
    }

    const markAllBtn = unreadAnn > 0 && filter !== 'teacher'
      ? `<div style="margin-bottom:10px;"><button class="chip-ghost primary" onclick="markAllAnnouncementsRead()">Mark All Announcements Read (${unreadAnn})</button></div>`
      : '';

    const noticeHtml = shownNotices.length
      ? shownNotices.map(m => {
          const unread = m.is_read === 0 || m.is_read === false;
          return `
            <li class="inbox-item inbox-item--concern" style="${unread ? 'background:rgba(255,140,0,0.06);' : ''}">
              <div class="inbox-item-header" style="display:flex;align-items:center;gap:8px;">
                <span class="badge" style="background:var(--orange);color:#fff;">Teacher notice</span>
                <span style="font-size:0.75rem;color:var(--text-muted);flex:1;">${new Date(m.created_at).toLocaleString()}</span>
                <button type="button" class="chip-ghost ${unread ? 'primary' : ''}" onclick="toggleParentMessageRead(${m.id}, ${unread})" style="font-size:0.72rem;padding:4px 10px;">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>
              </div>
              <div style="margin-top:6px;font-weight:600;">${m.subject || 'Notice'}</div>
              <p style="margin-top:4px;color:var(--text-dark);font-size:0.85rem;">${m.message}</p>
              <div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);">From: ${m.sender_name || 'Teacher'}${m.student_name ? ' · Student: ' + m.student_name : ''}</div>
            </li>`;
        }).join('')
      : '';

    const listHtml = shownAnn.length
      ? shownAnn.map(a => {
          const unread = isUnread(a);
          const textStyle = unread ? 'font-weight:600;' : '';
          const fromTeacher = !isAdminAnnouncement(a);
          return `
            <li class="inbox-item inbox-item--announcement ${priorityCardClass(a)}">
              <div class="inbox-item-header" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="badge" style="background:${fromTeacher ? 'var(--orange)' : 'var(--maroon)'};color:#fff;">${fromTeacher ? 'Class notice' : 'Announcement'}</span>
                ${priorityBadgeHtml(a)}
                <span style="font-size:0.75rem;color:var(--text-muted);flex:1;">${new Date(a.created_at).toLocaleString()}</span>
                <button type="button" class="chip-ghost announcement-read-btn ${unread ? 'primary' : ''}" data-id="${a.id}" data-unread="${unread}" onclick="toggleAnnouncementRead(${a.id}, ${!unread})" style="font-size:0.72rem;padding:4px 10px;">${unread ? 'Mark as Read' : 'Mark as Unread'}</button>
              </div>
              <div style="margin-top:6px;font-weight:600;${textStyle}">${a.title}</div>
              <p style="margin-top:4px;color:var(--text-dark);font-size:0.85rem;${textStyle}">${a.body}</p>
              <div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);">
                From: ${a.sender_name || (fromTeacher ? 'Teacher' : 'Admin')} | ${announcementMeta(a)}
              </div>
            </li>
          `;
        }).join('')
      : '';

    const empty = !shownAnn.length && !shownNotices.length
      ? `<li class="empty-state"><p>${filter === 'admin' ? 'No admin announcements yet' : filter === 'teacher' ? 'No teacher notices yet' : 'No announcements or teacher notices yet'}</p></li>`
      : '';

    contentEl.innerHTML = `
      <div class="parent-main">
        <div class="chart-card">
          <h3 style="font-size:1.1rem;color:var(--maroon-deep);margin-bottom:12px;">Inbox</h3>
          <div class="inbox-filters">
            <button type="button" class="${filter === 'all' ? 'active' : ''}" data-parent-inbox-filter="all">All</button>
            <button type="button" class="${filter === 'admin' ? 'active' : ''}" data-parent-inbox-filter="admin">Admin</button>
            <button type="button" class="${filter === 'teacher' ? 'active' : ''}" data-parent-inbox-filter="teacher">Teacher</button>
          </div>
          ${markAllBtn}
          <ul class="inbox-list" style="list-style:none;padding:0;margin:0;">${noticeHtml}${listHtml}${empty}</ul>
        </div>
      </div>
    `;

    contentEl.querySelectorAll('[data-parent-inbox-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        parentInboxFilter = btn.dataset.parentInboxFilter;
        renderParentInbox();
      });
    });

    const badgeEl = document.getElementById('parent-inbox-badge');
    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.hidden = unreadCount === 0;
    }

  } catch (err) {
    console.error('Load parent inbox error:', err);
    contentEl.innerHTML = `<div class="parent-main"><div class="chart-card"><p style="color:#b71c1c;">Failed to load inbox</p></div></div>`;
  }
}

// ========== TEACHER PANEL SWITCHING ==========
const teacherTabHistory = [];
let isTeacherNavigatingBack = false;
const teacherBackBtn = document.getElementById('teacher-back-btn');
const TEACHER_PANEL_TITLES = {
  classroom: 'Teacher Portal',
  'attendance-sheet': 'Attendance Sheet',
  progress: 'Progress',
  'lesson-plans': 'Lesson Plans',
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

  const classScoped = panelId === 'classroom' || panelId === 'progress' || panelId === 'attendance-sheet';
  const classroomSidebar = document.getElementById('teacher-sidebar-classroom');
  classroomSidebar?.classList.toggle('is-hidden', !classScoped);

  // Topbar search only where the roster/sheet needs it (Progress has its own search)
  const classroomTopbar = document.getElementById('teacher-classroom-topbar-actions');
  const showTopbarSearch = panelId === 'classroom' || panelId === 'attendance-sheet';
  if (classroomTopbar) classroomTopbar.hidden = !showTopbarSearch;

  const searchInput = document.getElementById('teacher-search-input');
  if (searchInput) {
    searchInput.placeholder =
      panelId === 'attendance-sheet' ? 'Search student' : 'Search Student';
    searchInput.value = '';
  }

  const titleEl = document.getElementById('teacher-topbar-title');
  if (titleEl) titleEl.textContent = TEACHER_PANEL_TITLES[panelId] || 'Teacher Portal';

  if (panelId === 'inbox') {
    loadTeacherInbox();
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
    loadTeacherInbox(btn.dataset.inboxFilter);
  });
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

    if (subjectBtn) {
      const grade = subjectBtn.dataset.grade;
      const goClassroom = isSubjectAttendanceGrade(grade);
      await selectTeacherClassContext({
        grade,
        section: subjectBtn.dataset.section,
        subjectName: subjectBtn.dataset.subjectName || null,
        subjectId: subjectBtn.dataset.subjectId || null,
        goToPanel: goClassroom ? 'classroom' : 'progress',
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
        goToPanel: 'classroom',
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

  const searchInput = document.getElementById('teacher-search-input');
  if (searchInput) searchInput.value = '';

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
    const activePanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
    if (activePanel === 'classroom' || !activePanel) {
      await Promise.all([loadClassStats(grade, section), loadRoster(grade, section)]);
    }
    if (activePanel === 'progress') loadProgressList();
    if (activePanel === 'attendance-sheet') loadAttendanceSheet();
  }
}

window.selectTeacherClass = async function(el) {
  if (!el) return;
  await selectTeacherClassContext({
    grade: el.dataset.grade,
    section: el.dataset.section,
    subjectName: null,
    goToPanel: 'classroom',
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
  const query = (document.getElementById('teacher-search-input')?.value || '').trim().toLowerCase();
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
      el.textContent = `Attendance complete for today (${data.total} students). You can enable a shared quiz in Progress.`;
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

document.getElementById('teacher-search-input')?.addEventListener('input', () => {
  const activePanel = document.querySelector('[data-teacher-panel].active')?.dataset.teacherPanel;
  if (activePanel === 'attendance-sheet') filterAttendanceSheet();
  else filterRoster();
});

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

function localISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const query = (document.getElementById('teacher-search-input')?.value || '').trim().toLowerCase();
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
      ? `Grade ${grade} – ${section} · ${teacherCurrentClass.subjectName || 'Subject'} · weekly register`
      : `Grade ${grade} – ${section} · weekly AM / PM register`;
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
      const win = window.open('', '_blank');
      if (!win) {
        showToast('Allow pop-ups to download PDF.', 'error');
        return;
      }
      win.document.write(html);
      win.document.close();
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
  const panel = document.getElementById('attendance-download-panel');
  const btn = document.getElementById('attendance-download-btn');
  if (panel) panel.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

document.getElementById('attendance-download-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  const panel = document.getElementById('attendance-download-panel');
  const btn = document.getElementById('attendance-download-btn');
  if (!panel || !btn) return;
  const open = panel.hidden;
  panel.hidden = !open;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('attendance-download-menu');
  if (menu && !menu.contains(e.target)) closeAttendanceDownloadMenu();
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
    const linkEl = document.getElementById('progress-quiz-link');
    const maxEl = document.getElementById('progress-max');
    const typeEl = document.getElementById('progress-type');
    if (titleEl) titleEl.value = '';
    if (linkEl) linkEl.value = '';
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
    listEl.innerHTML = '<p class="empty-state">No progress records yet. For a live ConnectED quiz, create from Classwork. Use + New Record for manual scores only.</p>';
    return;
  }

  listEl.innerHTML = records.map(r => {
    const shareActive = Number(r.share_enabled) === 1 && r.share_token;
    const hasQuestions = Number(r.question_count) > 0;
    return `
    <article class="lesson-plan-card">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="badge type-${r.type}">${typeLabel(r.type)}</span>
        <h4 style="margin:0;">${escapeHtml(r.title)}</h4>
        ${shareActive ? '<span class="ai-status-badge ai-status-approved">LINK ON</span>' : ''}
        ${!shareActive && !hasQuestions ? '<span class="page-subheading">Manual / no live quiz</span>' : ''}
      </div>
      <p>${escapeHtml(r.subject_name || 'No subject')} · Max ${r.max_score} · ${r.scored_count || 0} scored · ${new Date(r.created_at).toLocaleDateString()}</p>
      <div class="lesson-plan-card-actions">
        <button type="button" class="chip-ghost primary" onclick="openProgressEditor(${r.id}, 'view')">View scores</button>
        ${shareActive
          ? `<button type="button" class="chip-ghost" onclick="copySharedQuizLink('${escapeHtml(r.share_token)}')">Copy link</button>
             <button type="button" class="chip-ghost chip-danger" onclick="revokeSharedQuizLink(${r.id})">Turn off link</button>`
          : hasQuestions
            ? `<button type="button" class="chip-ghost" onclick="assignSharedQuizLink(${r.id})">Enable link</button>`
            : `<button type="button" class="chip-ghost" disabled title="Create from Classwork with questions first">Enable link</button>`}
        ${r.quiz_link ? `<a class="chip-ghost" href="${escapeHtml(r.quiz_link)}" target="_blank" rel="noopener">Open external link</a>` : ''}
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
  if (editor) editor.hidden = true;
  const listWrap = document.getElementById('progress-list-wrap');
  if (listWrap) listWrap.hidden = false;

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

window.openProgressEditor = async function(id, mode = 'view') {
  const editor = document.getElementById('progress-editor');
  const listWrap = document.getElementById('progress-list-wrap');
  showProgressCreateForm(false);
  if (listWrap) listWrap.hidden = true;
  if (editor) editor.hidden = false;

  const editMode = mode === 'edit';
  if (editor) editor.dataset.mode = editMode ? 'edit' : 'view';

  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const a = data.assessment;
    progressEditorMax = Number(a.max_score) || 100;
    if (editor) editor.dataset.assessmentId = String(a.id);
    const titleEl = document.getElementById('progress-editor-title');
    const metaEl = document.getElementById('progress-editor-meta');
    if (titleEl) titleEl.textContent = a.title;
    if (metaEl) {
      metaEl.textContent = `${typeLabel(a.type)} · ${a.subject_name || 'No subject'} · Max ${progressEditorMax}` +
        (editMode ? ' · Editing' : ' · Viewing');
    }

    setProgressEditorMode(editMode);

    const linkInput = document.getElementById('progress-editor-quiz-link');
    const linkOpen = document.getElementById('progress-quiz-link-open');
    if (linkInput) {
      linkInput.value = a.quiz_link || '';
      linkInput.readOnly = !editMode;
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

    updateProgressMakeupUi(a, data.makeup_candidates);

    const qWrap = document.getElementById('progress-attached-questions');
    const qList = document.getElementById('progress-questions-list');
    const questions = Array.isArray(data.questions) ? data.questions : [];
    window._progressEditorQuestions = questions;
    updateProgressShareUi(a, data.attendance_meta, questions.length);
    if (qWrap && qList) {
      if (editMode && questions.length) {
        qWrap.hidden = false;
        qList.innerHTML = questions.map((q) => {
          const choices = Array.isArray(q.choices) && q.choices.length
            ? `<ul class="progress-choice-list">${q.choices.map((c, i) =>
                `<li><strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(c)}</li>`
              ).join('')}</ul>`
            : '';
          return `<li><div>${escapeHtml(q.question || '')}</div>${choices}</li>`;
        }).join('');
      } else {
        qWrap.hidden = true;
        qList.innerHTML = '';
      }
    }

    const tbody = document.querySelector('#progress-scores-table tbody');
    const sortedStudents = [...(data.students || [])].sort(compareStudentsByName);
    tbody.innerHTML = sortedStudents.map(s => {
      const score = s.score === null || s.score === undefined ? '' : s.score;
      const pct = score === '' ? '—' : `${Math.round((Number(score) / progressEditorMax) * 100)}%`;
      if (editMode) {
        return `
        <tr data-student-id="${s.id}">
          <td class="att-name-cell"><strong>${formatStudentNameStacked(s)}</strong></td>
          <td>
            <input type="number" class="progress-score-input" min="0" max="${progressEditorMax}" step="0.01"
                   value="${score}" data-student-id="${s.id}" style="width:90px;" />
          </td>
          <td class="progress-pct-cell">${pct}</td>
        </tr>`;
      }
      return `
        <tr data-student-id="${s.id}">
          <td class="att-name-cell"><strong>${formatStudentNameStacked(s)}</strong></td>
          <td>${score === '' ? '—' : escapeHtml(String(score))}</td>
          <td>${pct}</td>
        </tr>`;
    }).join('');

    if (editMode) {
      tbody.querySelectorAll('.progress-score-input').forEach(input => {
        input.addEventListener('input', () => {
          const cell = input.closest('tr')?.querySelector('.progress-pct-cell');
          if (!cell) return;
          if (input.value === '') { cell.textContent = '—'; return; }
          const n = Number(input.value);
          cell.textContent = Number.isNaN(n) ? '—' : `${Math.round((n / progressEditorMax) * 100)}%`;
        });
      });
    }
  } catch (err) {
    showToast(err.message, 'error');
    loadProgressList();
  }
};

function setProgressEditorMode(editMode) {
  const saveBtn = document.getElementById('progress-scores-save');
  const viewBtn = document.getElementById('progress-mode-view');
  const editBtn = document.getElementById('progress-mode-edit');
  const linkSave = document.getElementById('progress-quiz-link-save');
  if (saveBtn) saveBtn.hidden = !editMode;
  if (viewBtn) viewBtn.hidden = !editMode;
  if (editBtn) editBtn.hidden = editMode;
  if (linkSave) linkSave.hidden = !editMode;

  // View scores = scores only; share / makeup / links / questions stay in Edit
  document.querySelectorAll('#progress-editor .progress-manage-only').forEach((el) => {
    if (el.id === 'progress-attached-questions' || el.id === 'progress-makeup-section') {
      // These also have their own visibility rules; force-hide in view mode.
      if (!editMode) {
        el.hidden = true;
        el.setAttribute('hidden', '');
      }
      return;
    }
    el.hidden = !editMode;
    if (editMode) el.removeAttribute('hidden');
    else el.setAttribute('hidden', '');
  });
}

document.getElementById('progress-mode-edit')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) openProgressEditor(id, 'edit');
});

document.getElementById('progress-mode-view')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) openProgressEditor(id, 'view');
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
  const quizLink = document.getElementById('progress-quiz-link')?.value.trim() || '';
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
        quarter: teacherCurrentQuarter,
        quiz_link: quizLink || null
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('progress-title').value = '';
    const linkEl = document.getElementById('progress-quiz-link');
    if (linkEl) linkEl.value = '';
    showToast('Progress record created.');
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
    showToast(data.quiz_link ? 'Quiz link saved.' : 'Quiz link cleared.');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

function sharedQuizAbsoluteUrl(token) {
  return `${window.location.origin}/quiz/${token}`;
}

function updateProgressShareUi(assessment, attendanceMeta, questionCount = 0) {
  const urlInput = document.getElementById('progress-share-url');
  const assignBtn = document.getElementById('progress-share-assign');
  const copyBtn = document.getElementById('progress-share-copy');
  const revokeBtn = document.getElementById('progress-share-revoke');
  const openBtn = document.getElementById('progress-share-open');
  const noteEl = document.getElementById('progress-share-attendance-note');
  const active = assessment && Number(assessment.share_enabled) === 1 && assessment.share_token;
  const hasQuestions = Number(questionCount) > 0;
  if (urlInput) {
    urlInput.value = active ? sharedQuizAbsoluteUrl(assessment.share_token) : '';
  }
  if (assignBtn) {
    assignBtn.hidden = !!active;
    assignBtn.disabled = !active && !hasQuestions;
    assignBtn.title = !hasQuestions && !active
      ? 'Create this quiz from Classwork with selected questions first'
      : '';
  }
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
    if (!hasQuestions && !active) {
      noteEl.textContent = 'No questions attached. Create a Progress quiz from Classwork (select items → Next), then Enable link here. + New Record is for manual scores only.';
      noteEl.style.color = '#b71c1c';
    } else if (active) {
      noteEl.textContent = 'Live quiz: Present and Late students can submit (name + LRN required). Grant make-up below for Absent or Excused students.';
      noteEl.style.color = 'var(--text-muted)';
    } else if (attendanceMeta) {
      if (attendanceMeta.complete) {
        noteEl.textContent = 'Attendance is complete for today. You can enable the shared quiz link.';
        noteEl.style.color = '#1b5e20';
      } else {
        const n = attendanceMeta.unmarked_count ?? (attendanceMeta.unmarked?.length || 0);
        noteEl.textContent = `Mark attendance for every student in Classroom before enabling the quiz (${n} unmarked).`;
        noteEl.style.color = '#b71c1c';
      }
    } else {
      noteEl.textContent = 'Mark complete attendance in Classroom before enabling a shared quiz link.';
      noteEl.style.color = 'var(--text-muted)';
    }
  }
}

function updateProgressMakeupUi(assessment, makeupCandidates) {
  const section = document.getElementById('progress-makeup-section');
  const list = document.getElementById('progress-makeup-list');
  const hint = document.getElementById('progress-makeup-hint');
  const allBtn = document.getElementById('progress-makeup-all');
  const selectedBtn = document.getElementById('progress-makeup-selected');
  const active = assessment && Number(assessment.share_enabled) === 1;
  const editMode = document.getElementById('progress-editor')?.dataset.mode === 'edit';
  if (!section) return;
  if (!active || !editMode) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const makeupIds = new Set(
    Array.isArray(assessment.quiz_makeup_student_ids) ? assessment.quiz_makeup_student_ids.map(Number) : []
  );
  const candidates = Array.isArray(makeupCandidates) ? makeupCandidates : [];
  if (!candidates.length) {
    if (hint) hint.textContent = 'No absent or excused students need make-up (or all have already submitted).';
    if (list) list.innerHTML = '';
    allBtn?.setAttribute('disabled', 'disabled');
    selectedBtn?.setAttribute('disabled', 'disabled');
    return;
  }
  if (hint) {
    hint.textContent = 'Check students below, then allow all or selected. Already granted make-up stays checked.';
  }
  allBtn?.removeAttribute('disabled');
  selectedBtn?.removeAttribute('disabled');
  if (list) {
    list.innerHTML = candidates.map((c) => {
      const granted = makeupIds.has(Number(c.id));
      const status = c.attendance_status || '';
      return `
        <label class="progress-makeup-row">
          <input type="checkbox" data-student-id="${c.id}" ${granted ? 'checked disabled' : ''} />
          <span class="progress-makeup-name">${formatStudentNameStacked(c)}</span>
          <span class="badge ${status.toLowerCase()}">${escapeHtml(status)}</span>
          ${granted ? '<span class="progress-makeup-granted">Make-up allowed</span>' : ''}
        </label>`;
    }).join('');
  }
}

async function grantMakeupQuiz(mode) {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (!id) return;
  const body = { mode };
  if (mode === 'selected') {
    const ids = [...document.querySelectorAll('#progress-makeup-list input[type="checkbox"]:checked:not(:disabled)')]
      .map((cb) => Number(cb.dataset.studentId))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!ids.length) {
      showToast('Select at least one student for make-up.', 'error');
      return;
    }
    body.student_ids = ids;
  } else if (mode === 'all') {
    if (!confirm('Allow make-up quiz access for all absent and excused students who have not submitted?')) return;
  }
  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/makeup-quiz`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(data.message || 'Make-up access granted.');
    openProgressEditor(id, document.getElementById('progress-editor')?.dataset.mode === 'edit' ? 'edit' : 'view');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.grantMakeupQuiz = grantMakeupQuiz;

window.copySharedQuizLink = async function(token) {
  const url = sharedQuizAbsoluteUrl(token);
  try {
    await navigator.clipboard.writeText(url);
    showToast('Shared quiz link copied.');
  } catch {
    prompt('Copy this quiz link:', url);
  }
};

window.assignSharedQuizLink = async function(id) {
  try {
    const res = await fetch(`${API_URL}/teacher/assessments/${id}/assign-link`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(data.message || 'Shared link ready.');
    if (data.share_token) {
      await copySharedQuizLink(data.share_token);
    }
    const editor = document.getElementById('progress-editor');
    if (editor && !editor.hidden && editor.dataset.assessmentId === String(id)) {
      openProgressEditor(id, 'view');
    } else {
      loadProgressList();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.revokeSharedQuizLink = async function(id) {
  if (!confirm('Turn off the shared quiz link? Students will no longer be able to open it.')) return;
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
      openProgressEditor(id, 'view');
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

document.getElementById('progress-share-copy')?.addEventListener('click', async () => {
  const url = document.getElementById('progress-share-url')?.value;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Shared quiz link copied.');
  } catch {
    prompt('Copy this quiz link:', url);
  }
});

document.getElementById('progress-share-revoke')?.addEventListener('click', () => {
  const id = document.getElementById('progress-editor')?.dataset.assessmentId;
  if (id) revokeSharedQuizLink(id);
});

document.getElementById('progress-makeup-all')?.addEventListener('click', () => grantMakeupQuiz('all'));
document.getElementById('progress-makeup-selected')?.addEventListener('click', () => grantMakeupQuiz('selected'));

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
      listEl.innerHTML = '<p class="empty-state">No lesson plans uploaded yet.</p>';
      return;
    }

    listEl.innerHTML = plans.map(p => `
      <article class="lesson-plan-card">
        <h4>${escapeHtml(p.title)}</h4>
        <p>Grade ${p.grade_level}${p.subject_name ? ' · ' + escapeHtml(p.subject_name) : ''} · ${new Date(p.created_at).toLocaleDateString()}</p>
        ${p.objectives ? `<p style="margin-top:8px;color:var(--text-dark);">${escapeHtml(p.objectives)}</p>` : ''}
        <div class="lesson-plan-card-actions">
          ${p.file_path ? `<a class="chip-ghost primary" href="${p.file_path}" target="_blank" rel="noopener">Open file</a>` : ''}
          <button type="button" class="chip-ghost primary" onclick="generateAiForLesson(${p.id})">Generate AI</button>
          <button type="button" class="chip-ghost" onclick="deleteLessonPlan(${p.id})">Delete</button>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Load lesson plans error:', err);
    listEl.innerHTML = '<p class="empty-state">Failed to load lesson plans.</p>';
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
    if (data.mode === 'openai') {
      hint.textContent = 'AI: OpenAI (live)';
    } else {
      hint.textContent = 'AI: mock (set OPENAI_API_KEY for live)';
    }
  } catch {
    hint.textContent = '';
  }
}

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

    listEl.innerHTML = rows.map((r) => {
      const c = r.content || {};
      const statusClass = r.status === 'pending' ? 'ai-status-pending'
        : r.status === 'approved' ? 'ai-status-approved' : 'ai-status-rejected';
      return `
      <article class="lesson-plan-card ai-rec-card" data-rec-id="${r.id}" data-grade="${r.grade_level}">
        <div class="ai-rec-header">
          <h4>${escapeHtml(r.lesson_title || 'Lesson')}</h4>
          <span class="ai-status-badge ${statusClass}">${escapeHtml(r.status)} · ${escapeHtml(r.provider)}</span>
        </div>
        <p>Grade ${r.grade_level}${r.subject_name ? ' · ' + escapeHtml(r.subject_name) : ''} · ${new Date(r.created_at).toLocaleDateString()}</p>
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
      </article>`;
    }).join('');
  } catch (err) {
    console.error('Load AI recommendations error:', err);
    listEl.innerHTML = '<p class="empty-state">Failed to load AI drafts.</p>';
  }
}

window.generateAiForLesson = async function(lessonPlanId) {
  try {
    showToast('Generating…');
    const res = await fetch(`${API_URL}/teacher/lesson-plans/${lessonPlanId}/generate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Generation failed');
    showToast(data.message || 'AI draft created.');
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.regenerateAiRecommendation = async function(id) {
  if (!confirm('Replace this draft with a new AI generation?')) return;
  try {
    showToast('Regenerating…');
    const res = await fetch(`${API_URL}/teacher/ai/recommendations/${id}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Regenerate failed');
    showToast(data.message || 'Draft regenerated.');
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
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
    let block = `${i + 1}. ${q.question || ''}`;
    if (Array.isArray(q.choices) && q.choices.length) {
      block += '\n' + q.choices.map((c, j) => `   ${String.fromCharCode(65 + j)}. ${c}`).join('\n');
    }
    if (q.answer) block += `\n   Answer: ${q.answer}`;
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
  const sel = document.getElementById('qb-filter-grade');
  if (!sel) return;
  const current = sel.value;
  const grades = getTeacherAssignedGrades();
  sel.innerHTML = '<option value="">All my grades</option>' +
    grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('');
  if (current && grades.some((g) => String(g) === String(current))) sel.value = current;
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
  const sel = document.getElementById('qb-filter-subject');
  if (!sel) return;
  const current = sel.value;
  const grade = document.getElementById('qb-filter-grade')?.value;
  const subjects = getAssignedSubjectsForGrade(grade);
  sel.innerHTML = subjectSelectOptionsHtml(subjects, { emptyLabel: 'All subjects' });
  if (current && [...sel.options].some((o) => o.value === current)) sel.value = current;
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
      meta.textContent = n ? `${n} selected` : 'Select items to create a Progress quiz';
    } else if (questionBankCurrentSetId) {
      meta.textContent = 'Open Quizzes or Activity';
    } else {
      meta.textContent = 'Open a set to pick items';
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
    listEl.innerHTML = '<p class="empty-state">No classwork sets yet. Click + Add Quiz or save an AI draft.</p>';
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
}

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
  if (backBtn) backBtn.textContent = '← Back to sets';
  if (!groupsEl) return;

  if (!questionBankCategories.length) {
    groupsEl.innerHTML = `
      <p class="empty-state" style="margin-bottom:12px;">
        This set has no questions yet.
      </p>
      <p class="page-subheading" style="margin:0 0 12px;">
        Generate an AI draft in <strong>Lesson Plans</strong>, then use <strong>Save to Classwork</strong>.
        Or create Progress records from other Classwork sets that already have items.
      </p>
      <button type="button" class="btn-toolbar btn-toolbar--solid" id="qb-empty-goto-lessons">Go to Lesson Plans</button>`;
    document.getElementById('qb-empty-goto-lessons')?.addEventListener('click', () => {
      applyTeacherPanel('lesson-plans');
    });
    updateQuizBankSelectionMeta();
    return;
  }

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
  if (backBtn) backBtn.textContent = '← Back to folders';
  if (!groupsEl) return;

  const groups = cat?.groups || [];
  if (!groups.length) {
    groupsEl.innerHTML = '<p class="empty-state">No items in this folder.</p>';
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
  const cats = [];
  if (quizItems.length) {
    cats.push({ category: 'quizzes', label: 'Quizzes', item_count: quizItems.length, groups: byType(quizItems) });
  }
  if (activityItems.length) {
    cats.push({ category: 'activity', label: 'Activity', item_count: activityItems.length, groups: byType(activityItems) });
  }
  return cats;
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
  const grade = document.getElementById('qb-filter-grade')?.value;
  const subjectId = document.getElementById('qb-filter-subject')?.value;
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
    questionBankCategories = Array.isArray(data.categories) && data.categories.length
      ? data.categories
      : buildCategoriesClientSide(questionBankItems);
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


window.openQuizBankEdit = function(id) {
  const item = questionBankItems.find((i) => i.id === id);
  const modal = document.getElementById('qb-edit-modal');
  if (!item || !modal) return;
  document.getElementById('qb-edit-id').value = String(item.id);
  document.getElementById('qb-edit-question').value = item.question || '';
  document.getElementById('qb-edit-choices').value = Array.isArray(item.choices) ? item.choices.join('\n') : '';
  document.getElementById('qb-edit-answer').value = item.answer || '';
  document.getElementById('qb-edit-points').value = String(Number(item.points) || 1);
  const gradeSel = document.getElementById('qb-edit-grade');
  const grades = getTeacherAssignedGrades();
  if (gradeSel) {
    gradeSel.innerHTML = grades.length
      ? grades.map((g) => `<option value="${g}">Grade ${g}</option>`).join('')
      : '<option value="">No assigned grades</option>';
    if (grades.includes(Number(item.grade_level))) gradeSel.value = String(item.grade_level);
    else if (grades[0]) gradeSel.value = String(grades[0]);
  }
  modal.hidden = false;
};

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

document.getElementById('qb-filter-refresh')?.addEventListener('click', async () => {
  const btn = document.getElementById('qb-filter-refresh');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('is-pressed');
  }
  try {
    const stayOnSet = questionBankCurrentSetId;
    const stayCategory = questionBankCurrentCategory;
    questionBankCurrentSetId = null;
    questionBankCurrentSet = null;
    questionBankCurrentCategory = null;
    await loadQuestionBank();
    if (stayOnSet && questionBankSets.some((s) => Number(s.id) === Number(stayOnSet))) {
      await openQuizBankSet(stayOnSet, { keepCategory: stayCategory });
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-pressed');
    }
  }
});
document.getElementById('qb-filter-grade')?.addEventListener('change', () => {
  questionBankCurrentSetId = null;
  questionBankCurrentCategory = null;
  questionBankSelected.clear();
  fillQuizBankSubjectFilter();
  loadQuestionBank();
});
document.getElementById('qb-filter-subject')?.addEventListener('change', () => {
  questionBankCurrentSetId = null;
  questionBankCurrentCategory = null;
  questionBankSelected.clear();
  loadQuestionBank();
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

document.getElementById('qb-edit-save')?.addEventListener('click', async () => {
  const id = document.getElementById('qb-edit-id')?.value;
  if (!id) return;
  const question = document.getElementById('qb-edit-question')?.value?.trim();
  const choicesRaw = document.getElementById('qb-edit-choices')?.value || '';
  const choices = choicesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
  const answer = document.getElementById('qb-edit-answer')?.value?.trim() || null;
  const points = document.getElementById('qb-edit-points')?.value;
  const grade_level = document.getElementById('qb-edit-grade')?.value;
  if (!grade_level) {
    showToast('Select an assigned grade.', 'error');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/teacher/question-bank/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        choices: choices.length ? choices : null,
        answer,
        points,
        grade_level: Number(grade_level),
        item_type: choices.length >= 2 ? 'mcq' : undefined
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    document.getElementById('qb-edit-modal').hidden = true;
    showToast('Bank item updated.');
    if (questionBankCurrentSetId) {
      await openQuizBankSet(questionBankCurrentSetId, { keepCategory: questionBankCurrentCategory });
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
    showToast('Select items from one grade only, then create a Progress quiz.', 'error');
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
  if (qtrSel && teacherCurrentQuarter) qtrSel.value = teacherCurrentQuarter;

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
  modal.hidden = false;
}

document.getElementById('qb-add-quiz-btn')?.addEventListener('click', () => openAddQuizModal());

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
  const quarter = document.getElementById('qb-create-quarter')?.value || 'Q1';
  const question_ids = [...questionBankSelected];

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
        question_ids
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
  if (!confirm('Delete this lesson plan?')) return;
  try {
    const res = await fetch(`${API_URL}/teacher/lesson-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast('Lesson plan deleted.');
    loadLessonPlans();
    loadAiRecommendations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('upload-lesson-btn')?.addEventListener('click', async () => {
  const msg = document.getElementById('lp-message');
  const title = document.getElementById('lp-title')?.value.trim();
  const subjectId = document.getElementById('lp-subject')?.value;
  const grade = document.getElementById('lp-grade')?.value;
  const objectives = document.getElementById('lp-objectives')?.value.trim();
  const fileInput = document.getElementById('lp-file');

  if (!title) {
    if (msg) msg.textContent = 'Please enter a lesson title.';
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

    if (msg) msg.textContent = 'Lesson plan uploaded.';
    document.getElementById('lp-title').value = '';
    document.getElementById('lp-objectives').value = '';
    if (fileInput) fileInput.value = '';
    showToast('Lesson plan uploaded.');
    loadLessonPlans();
  } catch (err) {
    if (msg) msg.textContent = err.message;
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

  // Multiple children — name text + inline dropdown arrow ▼
  childNameEl.innerHTML = '';
  childNameEl.style.display = 'flex';
  childNameEl.style.alignItems = 'center';
  childNameEl.style.gap = '6px';
  childNameEl.style.flexWrap = 'wrap';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = text || 'No linked children';
  childNameEl.appendChild(nameSpan);

  // Dropdown wrapper: hidden select + visible ▼ arrow
  const ddWrapper = document.createElement('span');
  ddWrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;cursor:pointer;';

  const select = document.createElement('select');
  select.id = 'parent-child-select-inline';
  select.style.cssText = 'position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;z-index:2;';

  parentAllChildren.forEach(child => {
    const opt = document.createElement('option');
    opt.value = child.id;
    opt.textContent = `${child.last_name}, ${child.first_name} (Grade ${child.grade_level}-${child.section})`;
    opt.selected = child.id === parentCurrentChild?.id;
    select.appendChild(opt);
  });

  const arrow = document.createElement('span');
  arrow.textContent = '▼';
  arrow.style.cssText = 'font-size:0.65rem;color:rgba(255,255,255,0.7);';

  ddWrapper.appendChild(select);
  ddWrapper.appendChild(arrow);
  childNameEl.appendChild(ddWrapper);

  select.addEventListener('change', (e) => {
    const selectedId = parseInt(e.target.value);
    const selected = parentAllChildren.find(c => c.id === selectedId);
    if (selected) {
      parentCurrentChild = selected;
      updateParentChildName(`Student: ${selected.first_name} ${selected.last_name}`);
      const activeTab = document.querySelector('[data-parent-tab].active')?.dataset.parentTab;
      if (activeTab === 'overview') renderParentOverview(selected);
      else if (activeTab === 'attendance') renderParentAttendance(selected);
      else if (activeTab === 'progress') renderParentProgress(selected);
      else if (activeTab === 'inbox') renderParentInbox();
      else if (activeTab === 'contact') renderParentContact();
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
    updateParentChildName(`Student: ${parentCurrentChild.first_name} ${parentCurrentChild.last_name}`);

    renderParentOverview(parentCurrentChild);

  } catch (err) {
    console.error('Load parent dashboard error:', err);
    contentEl.innerHTML = `<div class="empty-state"><p>Failed to load dashboard</p></div>`;
  }
}

function printParentReport() {
  if (!parentCurrentChild) {
    showToast('No child selected to print.', 'error');
    return;
  }
  showToast('In the print dialog, choose a printer or “Save as PDF”.');
  window.print();
}

document.getElementById('parent-print-btn')?.addEventListener('click', printParentReport);

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
        <h3 style="font-size:1rem;color:var(--maroon-deep);margin-bottom:12px;">Recent Attendance</h3>
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
}

async function loadParentAttendanceTable(studentId) {
  const wrap = document.getElementById('parent-attendance-table-wrap');
  if (!wrap) return;

  try {
    const res = await fetch(`${API_URL}/parent/child/${studentId}/attendance`, { headers: getAuthHeaders() });
    const records = await res.json();
    if (!res.ok) throw new Error(records.error);

    if (!records.length) {
      wrap.innerHTML = '<p style="color:var(--text-muted);font-size:0.84rem;">No attendance records yet.</p>';
      return;
    }

    wrap.innerHTML = `
      <table style="width:100%;font-size:0.82rem;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th>Date</th><th>Session / Subject</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${records.map(r => {
            const when = r.subject_name
              ? r.subject_name
              : (r.session === 'PM' ? 'Afternoon' : 'Morning');
            const dateStr = r.date ? new Date(r.date).toLocaleDateString() : '-';
            return `
            <tr style="${r.status === 'Absent' ? 'background:rgba(183,28,28,0.08);' : r.status === 'Late' ? 'background:rgba(230,126,34,0.08);' : ''}">
              <td>${dateStr}</td>
              <td>${when}</td>
              <td><span class="badge ${(r.status || '').toLowerCase()}">${r.status || '-'}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
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
    else if (tabId === 'inbox') renderParentInbox();
    else if (tabId === 'contact') renderParentContact();
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
  contentEl.innerHTML = `<div class="parent-main"><div class="chart-card"><h3 style="font-size:1.1rem;color:var(--maroon-deep);">Attendance Records</h3><div id="parent-attendance-full"></div></div></div>`;
  loadParentAttendanceFull(student.id);
}

async function loadParentAttendanceFull(studentId) {
  const wrap = document.getElementById('parent-attendance-full');
  if (!wrap) return;
  try {
    const res = await fetch(`${API_URL}/parent/child/${studentId}/attendance`, { headers: getAuthHeaders() });
    const records = await res.json();
    if (!res.ok) throw new Error(records.error);
    if (!records.length) { wrap.innerHTML = '<p style="color:var(--text-muted);">No records yet.</p>'; return; }
    wrap.innerHTML = `
      <table style="width:100%;font-size:0.85rem;margin-top:12px;">
        <thead style="background:var(--maroon-header);color:#fff;">
          <tr><th>Date</th><th>Session / Subject</th><th>Status</th></tr>
        </thead>
        <tbody>${records.map(r => {
          const when = r.subject_name
            ? r.subject_name
            : (r.session === 'PM' ? 'Afternoon' : 'Morning');
          return `<tr>
            <td>${r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
            <td>${when}</td>
            <td><span class="badge ${(r.status || '').toLowerCase()}">${r.status || '-'}</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
  } catch (err) { wrap.innerHTML = '<p style="color:#b71c1c;">Failed to load</p>'; }
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
  const contentEl = document.getElementById('parent-content');
  if (!contentEl) return;

  const children = parentAllChildren || [];
  const selectedId = parentCurrentChild?.id || '';

  contentEl.innerHTML = `
    <div class="parent-main">
      <div class="chart-card">
        <h3 style="font-size:1.1rem;color:var(--maroon-deep);">Contact Teachers</h3>
        <p class="page-subheading">Send a concern to your child's teacher.</p>
        <form id="parent-contact-form" class="admin-form" style="margin-top:16px;">
          <div class="form-row">
            <div class="field-small">
              <label for="contact-student">Student</label>
              <select id="contact-student" required>
                ${children.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.last_name}, ${c.first_name} (Grade ${c.grade_level}-${c.section})</option>`).join('')}
              </select>
            </div>
            <div class="field-small">
              <label for="contact-teacher">Teacher</label>
              <select id="contact-teacher" required>
                <option value="">Loading teachers…</option>
              </select>
            </div>
          </div>
          <div class="field-small">
            <label for="contact-subject">Subject</label>
            <input type="text" id="contact-subject" placeholder="e.g., Attendance, Mathematics, Behavior" required />
          </div>
          <div class="field-small">
            <label for="contact-message">Message</label>
            <textarea id="contact-message" rows="4" placeholder="Describe your concern..." required></textarea>
          </div>
          <button type="submit" class="btn-solid">Send Concern</button>
          <p id="contact-form-msg" class="inline-message"></p>
        </form>
      </div>
      <div class="chart-card" style="margin-top:16px;">
        <h3 style="font-size:1.05rem;color:var(--maroon-deep);">Sent concerns</h3>
        <div id="parent-concerns-list" style="margin-top:12px;"><p style="color:var(--text-muted);">Loading…</p></div>
      </div>
    </div>`;

  const studentSelect = document.getElementById('contact-student');
  studentSelect?.addEventListener('change', () => {
    const selected = children.find(c => String(c.id) === studentSelect.value);
    if (selected) parentCurrentChild = selected;
    loadContactTeachers(studentSelect.value);
    loadParentConcerns(studentSelect.value);
  });

  document.getElementById('parent-contact-form')?.addEventListener('submit', submitParentConcern);
  if (studentSelect?.value) loadContactTeachers(studentSelect.value);
  loadParentConcerns(studentSelect?.value || selectedId);
}

async function loadContactTeachers(studentId) {
  const select = document.getElementById('contact-teacher');
  if (!select || !studentId) return;
  select.innerHTML = '<option value="">Loading…</option>';
  try {
    const res = await fetch(`${API_URL}/parent/child/${studentId}/teachers`, { headers: getAuthHeaders() });
    const teachers = await res.json();
    if (!res.ok) throw new Error(teachers.error);
    if (!teachers.length) {
      select.innerHTML = '<option value="">No teachers assigned yet</option>';
      return;
    }
    select.innerHTML = teachers.map(t =>
      `<option value="${t.id}">${t.last_name}, ${t.first_name} (${t.role_label})</option>`
    ).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Failed to load teachers</option>';
  }
}

async function submitParentConcern(e) {
  e.preventDefault();
  const msg = document.getElementById('contact-form-msg');
  const payload = {
    student_id: document.getElementById('contact-student')?.value,
    teacher_id: document.getElementById('contact-teacher')?.value,
    subject: document.getElementById('contact-subject')?.value.trim(),
    message: document.getElementById('contact-message')?.value.trim()
  };
  if (!payload.student_id || !payload.teacher_id || !payload.message) {
    if (msg) msg.textContent = 'Please choose a student and teacher, then write a message.';
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
    document.getElementById('contact-message').value = '';
    document.getElementById('contact-subject').value = '';
    if (msg) msg.textContent = 'Concern sent. The teacher will see it in their inbox.';
    showToast('Concern sent to the teacher.');
    const studentId = document.getElementById('contact-student')?.value;
    loadParentConcerns(studentId);
  } catch (err) {
    if (msg) msg.textContent = err.message;
    showToast(err.message, 'error');
  }
}

async function loadParentConcerns(studentId) {
  const wrap = document.getElementById('parent-concerns-list');
  if (!wrap) return;

  const selectedId = studentId || document.getElementById('contact-student')?.value || parentCurrentChild?.id || '';
  const child = (parentAllChildren || []).find((c) => String(c.id) === String(selectedId));
  const childLabel = child
    ? `${child.first_name || ''} ${child.last_name || ''}`.trim()
    : '';

  try {
    const qs = selectedId ? `?student_id=${encodeURIComponent(selectedId)}` : '';
    const res = await fetch(`${API_URL}/parent/concerns${qs}`, { headers: getAuthHeaders() });
    const rows = await res.json();
    if (!res.ok) throw new Error(rows.error);
    if (!rows.length) {
      wrap.innerHTML = childLabel
        ? `<p style="color:var(--text-muted);">No concerns sent for ${escapeHtml(childLabel)} yet.</p>`
        : '<p style="color:var(--text-muted);">You have not sent any concerns yet.</p>';
      return;
    }
    wrap.innerHTML = `<ul class="inbox-list">${rows.map(c => {
      const status = concernStatus(c);
      return `
        <li class="inbox-item inbox-item--concern">
          <div class="inbox-item-header">
            <span class="badge" style="background:${status === 'resolved' || status === 'closed' ? '#1b5e20' : '#b71c1c'};color:#fff;">${status}</span>
            <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(c.created_at).toLocaleString()}</span>
          </div>
          <div style="margin-top:6px;"><strong>To:</strong> ${c.teacher_name || 'Teacher'} · <strong>Student:</strong> ${c.student_name || 'N/A'}</div>
          <div><strong>Subject:</strong> ${concernSubject(c)}</div>
          <p style="margin-top:6px;font-size:0.85rem;"><strong>You:</strong> ${c.message}</p>
          ${concernThreadHtml(c, true)}
        </li>`;
    }).join('')}</ul>`;
  } catch (err) {
    wrap.innerHTML = '<p style="color:#b71c1c;">Failed to load sent concerns</p>';
  }
}

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
      tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No subjects yet</td></tr>';
      return;
    }

    tbody.innerHTML = subjects.map(s => `
      <tr data-subject-id="${s.id || ''}">
        <td class="sub-code">${s.code || s.subject_code || s.Code || '—'}</td>
        <td class="sub-name">${s.name || s.subject_name || s.Name || '—'}</td>
        <td class="sub-desc">${s.description || ''}</td>
        <td class="sub-grades">${s.applicable_grades || ''}</td>
        <td style="white-space:nowrap;">
          <button class="chip-ghost" onclick="startEditSubject(${s.id})">Edit</button>
          <button class="chip-ghost" style="color:#b71c1c;border-color:#b71c1c;" onclick="deleteSubject(${s.id})">Delete</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Load subjects error:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="empty-cell">Failed to load subjects: ${err.message}</td></tr>`;
  }
}

window.startEditSubject = function(id) {
  const row = document.querySelector(`tr[data-subject-id="${id}"]`);
  if (!row) return;

  const code = row.querySelector('.sub-code').textContent.trim();
  const name = row.querySelector('.sub-name').textContent.trim();
  const desc = row.querySelector('.sub-desc').textContent.trim();
  const grades = row.querySelector('.sub-grades').textContent.trim();

  row.innerHTML = `
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
  if (title) title.textContent = forcePasswordChange ? 'Set a new password' : 'Change Password';
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

document.getElementById('admin-student-filter-grade')?.addEventListener('change', async (e) => {
  currentStudentGradeFilter = e.target.value;
  currentStudentSectionFilter = '';
  await loadStudentFilterSections(currentStudentGradeFilter);
  filterStudentsTable();
});

document.getElementById('admin-student-filter-section')?.addEventListener('change', (e) => {
  currentStudentSectionFilter = e.target.value;
  filterStudentsTable();
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
  document.getElementById('teacher-detail-actions-menu')?.setAttribute('hidden', '');
  document.getElementById('parent-detail-actions-menu')?.setAttribute('hidden', '');
  document.getElementById('teacher-detail-actions-btn')?.setAttribute('aria-expanded', 'false');
  document.getElementById('parent-detail-actions-btn')?.setAttribute('aria-expanded', 'false');
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
  const menu = document.getElementById(menuId);
  const btn = document.getElementById(btnId);
  if (!menu || !btn) return;
  const otherRole = role === 'teacher' ? 'parent' : 'teacher';
  document.getElementById(`${otherRole}-detail-actions-menu`)?.setAttribute('hidden', '');
  const isHidden = menu.hasAttribute('hidden');
  if (isHidden) {
    menu.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
  } else {
    menu.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', 'false');
  }
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
    if (sub) {
      sub.textContent = isParent
        ? 'Update name, email, phone, address, and emergency contact.'
        : 'Update name, email, and phone number.';
    }

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