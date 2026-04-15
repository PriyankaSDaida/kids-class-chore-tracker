const KEY = 'class-quest-device-id';

export const getDeviceId = (): string => {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
};