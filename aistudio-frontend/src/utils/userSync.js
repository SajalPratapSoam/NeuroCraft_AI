import api from '../api/axios';

export function persistUserUpdate(updates = {}, options = {}) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const nextUser = {
      ...currentUser,
      ...updates,
    };

    localStorage.setItem('user', JSON.stringify(nextUser));

    if (options.userId !== undefined && options.userId !== null && options.userId !== '') {
      localStorage.setItem('userId', String(options.userId));
    }

    window.dispatchEvent(new Event('auth:changed'));
    window.dispatchEvent(new Event('user:updated'));

    return nextUser;
  } catch {
    return updates;
  }
}

export async function refreshUserFromServer() {
  try {
    const { data } = await api.get('/api/auth/me');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const nextUser = {
      ...currentUser,
      email: data.email || currentUser.email || '',
      id: data.userId ?? currentUser.id,
      credits: data.credits ?? currentUser.credits ?? 0,
      currentPlan: data.currentPlan ?? currentUser.currentPlan ?? 'FREE',
    };

    localStorage.setItem('user', JSON.stringify(nextUser));
    if (data.userId !== undefined && data.userId !== null) {
      localStorage.setItem('userId', String(data.userId));
    }

    window.dispatchEvent(new Event('auth:changed'));
    window.dispatchEvent(new Event('user:updated'));
    return nextUser;
  } catch {
    return null;
  }
}
