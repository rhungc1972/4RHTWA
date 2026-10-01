export const PRESENTER_MASTER_PIN = '2089227';

export function getDayPin(): string {
  const day = new Date().getDate();
  return String(day).padStart(2, '0');
}

export function getMonthPin(): string {
  const month = new Date().getMonth() + 1;
  return String(month).padStart(2, '0');
}

export function getYearPin(): string {
  const year = new Date().getFullYear();
  return String(year).slice(-2);
}

export function getMonthName(): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[new Date().getMonth()];
}

export function validateDayPin(input: string): boolean {
  const clean = input.trim();
  if (!clean) return false;
  if (clean === PRESENTER_MASTER_PIN) return true;

  const dayNum = new Date().getDate();
  const dayStr = String(dayNum);
  const dayPadded = dayStr.padStart(2, '0');

  return clean === dayStr || clean === dayPadded;
}

export function validateMonthPin(input: string): boolean {
  const clean = input.trim();
  if (!clean) return false;
  if (clean === PRESENTER_MASTER_PIN) return true;

  const monthNum = new Date().getMonth() + 1;
  const monthStr = String(monthNum);
  const monthPadded = monthStr.padStart(2, '0');

  return clean === monthStr || clean === monthPadded;
}

export function validateYearPin(input: string): boolean {
  const clean = input.trim();
  if (!clean) return false;
  if (clean === PRESENTER_MASTER_PIN) return true;

  const fullYear = String(new Date().getFullYear());
  const shortYear = fullYear.slice(-2);

  return clean === shortYear || clean === fullYear;
}

export function validateAccessKey(input: string): 'presenter' | 'audience' | null {
  const clean = input.trim();
  if (clean === PRESENTER_MASTER_PIN) {
    return 'presenter';
  }
  if (validateDayPin(clean)) {
    return 'audience';
  }
  return null;
}
