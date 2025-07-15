export const generateOrderNumber = (): string => {
  const prefix = 'TS';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
};