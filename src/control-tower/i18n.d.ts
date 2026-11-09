export function getLang(): 'pt' | 'en';
export function setLang(next: string): void;
export function tr(text: string, ...args: Array<string | number>): string;
export function translateStatic(root: Element): void;
