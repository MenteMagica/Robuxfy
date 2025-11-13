const emailRegex = /^(?:[A-Z0-9_'^&%+-]+(?:\.[A-Z0-9_'^&%+-]+)*|".+")@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;

export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload?.[field];
    if (value === undefined || value === null) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    return false;
  });
  return missing.length > 0 ? missing : null;
};

export const ensureValidEmail = (email) => emailRegex.test(email?.trim() ?? '');

export const normalize = (value) => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim().toLowerCase();
};
