export const PRESENTER_MASTER_PIN = '2089227';

export function getDayPin(): string {
  return String(new Date().getDate());
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

export function validateAccessKey(input: string): 'presenter' | 'audience' | null {
  const clean = input.trim();
  if (clean === PRESENTER_MASTER_PIN) {
    return 'presenter';
  }
  const todayDay = String(new Date().getDate());
  const todayDayPadded = todayDay.padStart(2, '0');
  if (clean === todayDay || clean === todayDayPadded) {
    return 'audience';
  }
  return null;
}

export function validateMonthPin(input: string): boolean {
  const clean = input.trim();
  const expected = getMonthPin();
  return clean === expected || clean === String(parseInt(expected, 10));
}

export function validateYearPin(input: string): boolean {
  const clean = input.trim();
  const expected = getYearPin();
  return clean === expected || clean === String(new Date().getFullYear());
}
