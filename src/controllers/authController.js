const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function ensureAuthColumns() {
  try {
    await db.query(
      'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'
    );
  } catch (e) { /* exists */ }
}

ensureAuthColumns().catch((e) => console.error('[auth] schema:', e.message));

function formatUser(user) {
  const mustChange = !!(user.must_change_password === 1 || user.must_change_password === true);
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    must_change_password: mustChange
  };
}

async function verifyPassword(plain, hash) {
  if (!hash) return false;
  if (String(hash).startsWith('$2')) {
    return bcrypt.compare(plain, hash);
  }
  return plain === hash;
}

exports.login = async (req, res) => {
  try {
    await ensureAuthColumns();
    const { email, password, remember } = req.body;

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    const rawStatus = user.STATUS || user.status || '';
    const normalizedStatus = String(rawStatus).toLowerCase().trim();

    if (normalizedStatus === 'inactive') {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!String(user.password_hash).startsWith('$2')) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, user.id]);
    }

    const staySignedIn = remember === true || remember === 'true' || remember === 1 || remember === '1';
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: staySignedIn ? '30d' : '8h' }
    );

    res.json({
      token,
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.me = async (req, res) => {
  try {
    await ensureAuthColumns();
    const userId = req.user.id;

    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, role, avatar_url, must_change_password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(users[0]));
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    await ensureAuthColumns();
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const [users] = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const isMatch = await verifyPassword(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query(
      'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
      [hashed, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error during password change' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const [dupes] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [String(email).trim(), userId]
    );
    if (dupes.length) {
      return res.status(400).json({ error: 'That email is already in use' });
    }

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [String(first_name).trim(), String(last_name).trim(), String(email).trim(), userId]
    );

    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, role, avatar_url, must_change_password FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated', user: formatUser(users[0]) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile', details: error.message });
  }
};
