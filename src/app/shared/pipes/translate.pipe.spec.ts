import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { installLocalStorageMock } from '../../../testing/local-storage-mock';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let language: LanguageService;

  beforeEach(() => {
    installLocalStorageMock();
    TestBed.configureTestingModule({ providers: [TranslatePipe] });
    pipe = TestBed.inject(TranslatePipe);
    language = TestBed.inject(LanguageService);
  });

  it('translates a key in the active language', () => {
    expect(pipe.transform('nav.productions')).toBe('Productions');
  });

  it('reflects a language switch', () => {
    language.set('si');
    expect(pipe.transform('home.nowShowing')).toBe('දැන් පෙන්වයි');
  });

  it('passes an unknown key through unchanged', () => {
    expect(pipe.transform('no.such.key')).toBe('no.such.key');
  });
});
