import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeType = 'light' | 'dark';

const THEME_KEY = 'PRM_THEME';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeType>(this.getStoredTheme());
  theme$ = this.themeSubject.asObservable();

  setTheme(theme: ThemeType) {
    this.themeSubject.next(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyThemeClass(theme);
  }

  toggleTheme() {
    const newTheme: ThemeType = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private getStoredTheme(): ThemeType {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  }

  applyThemeClass(theme: ThemeType) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
  }

  initTheme() {
    this.applyThemeClass(this.themeSubject.value);
  }
}
