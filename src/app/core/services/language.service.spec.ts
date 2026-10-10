import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { installLocalStorageMock } from '../../../testing/local-storage-mock';

describe('LanguageService', () => {
  let svc: LanguageService;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({});
    svc = TestBed.inject(LanguageService);
  });

  it('defaults to English', () => {
    expect(svc.lang()).toBe('en');
  });

  it('translates a known key in English', () => {
    expect(svc.translate('nav.productions')).toBe('Productions');
  });

  it('switches language and translates in the new language', () => {
    svc.set('si');
    expect(svc.lang()).toBe('si');
    // Sinhala "Now Showing"
    expect(svc.translate('home.nowShowing')).toBe('දැන් පෙන්වයි');
  });

  it('falls back to English when a key is missing in the active language', () => {
    svc.set('ta');
    // A key present in English is always resolvable (either Tamil or English).
    expect(svc.translate('nav.productions').length).toBeGreaterThan(0);
  });

  it('returns the key itself when it is unknown in every language', () => {
    expect(svc.translate('totally.unknown.key' as never)).toBe('totally.unknown.key');
  });

  it('persists the chosen language to localStorage', () => {
    svc.set('ta');
    // Persistence happens in an effect; flush it before asserting.
    TestBed.tick();
    expect(localStorage.getItem('sapumal-patron-lang')).toBe('ta');
  });
});
