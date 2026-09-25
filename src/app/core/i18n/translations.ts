// ─────────────────────────────────────────────────────────────────────────────
// Runtime translation dictionaries for the patron web app.
// Sapumal Theatre stages productions in Sinhala, Tamil and English, so patrons
// can switch the UI language instantly (no rebuild). English is the default and
// the fallback for any missing key.
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'si' | 'ta';

export interface LangOption {
  code: Lang;
  /** Native label shown in the switcher (e.g. සිංහල). */
  label: string;
  /** Short badge (e.g. EN). */
  short: string;
}

export const LANGUAGES: readonly LangOption[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'si', label: 'සිංහල', short: 'සිං' },
  { code: 'ta', label: 'தமிழ்', short: 'த' },
];

export type TranslationKey = keyof (typeof translations)['en'];

export const translations = {
  en: {
    // Header / nav
    'nav.home': 'Home',
    'nav.productions': 'Productions',
    'nav.about': 'About',
    'nav.planYourVisit': 'Plan Your Visit',
    'nav.contact': 'Contact',
    'nav.search': 'Search',
    'action.login': 'Log In',
    'action.signup': 'Sign Up',
    'action.browseProductions': 'Browse Productions',
    'action.viewAll': 'View All',
    'action.bookTickets': 'Book Tickets',

    // Language switcher
    'lang.label': 'Language',

    // Hero
    'hero.title': 'Live Theatre, Real Emotions',
    'hero.subtitle': 'Great stories. Unforgettable experiences.',

    // Upcoming productions
    'productions.upcoming': 'Upcoming Productions',

    // Genres
    'genre.drama': 'Drama',
    'genre.historical': 'Historical',
    'genre.comedy': 'Comedy',
    'genre.musical': 'Musical',

    // Footer
    'footer.tagline': 'A mid-sized performing arts venue in Colombo 07.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.support': 'Support',
  },

  si: {
    // Header / nav
    'nav.home': 'මුල් පිටුව',
    'nav.productions': 'නිෂ්පාදන',
    'nav.about': 'අප ගැන',
    'nav.planYourVisit': 'ඔබේ සංචාරය සැලසුම් කරන්න',
    'nav.contact': 'සම්බන්ධ වන්න',
    'nav.search': 'සොයන්න',
    'action.login': 'පිවිසෙන්න',
    'action.signup': 'ලියාපදිංචි වන්න',
    'action.browseProductions': 'නිෂ්පාදන බලන්න',
    'action.viewAll': 'සියල්ල බලන්න',
    'action.bookTickets': 'ප්‍රවේශපත්‍ර වෙන්කරන්න',

    // Language switcher
    'lang.label': 'භාෂාව',

    // Hero
    'hero.title': 'සජීවී රංග කලාව, සැබෑ හැඟීම්',
    'hero.subtitle': 'විශිෂ්ට කථා. අමතක නොවන අත්දැකීම්.',

    // Upcoming productions
    'productions.upcoming': 'ඉදිරි නිෂ්පාදන',

    // Genres
    'genre.drama': 'නාට්‍ය',
    'genre.historical': 'ඓතිහාසික',
    'genre.comedy': 'හාස්‍ය',
    'genre.musical': 'සංගීත',

    // Footer
    'footer.tagline': 'කොළඹ 07 හි මධ්‍යම ප්‍රමාණයේ රංග කලා ශාලාවකි.',
    'footer.quickLinks': 'ඉක්මන් සබැඳි',
    'footer.contact': 'සම්බන්ධ වන්න',
    'footer.followUs': 'අප අනුගමනය කරන්න',
    'footer.rights': 'සියලු හිමිකම් ඇවිරිණි.',
    'footer.privacy': 'පෞද්ගලිකත්වය',
    'footer.terms': 'නියම',
    'footer.support': 'සහාය',
  },

  ta: {
    // Header / nav
    'nav.home': 'முகப்பு',
    'nav.productions': 'நிகழ்ச்சிகள்',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.planYourVisit': 'உங்கள் வருகையைத் திட்டமிடுங்கள்',
    'nav.contact': 'தொடர்பு',
    'nav.search': 'தேடு',
    'action.login': 'உள்நுழைக',
    'action.signup': 'பதிவு செய்க',
    'action.browseProductions': 'நிகழ்ச்சிகளைப் பார்க்க',
    'action.viewAll': 'அனைத்தையும் காண்க',
    'action.bookTickets': 'டிக்கெட்டுகளை முன்பதிவு செய்க',

    // Language switcher
    'lang.label': 'மொழி',

    // Hero
    'hero.title': 'நேரடி நாடகம், உண்மையான உணர்வுகள்',
    'hero.subtitle': 'சிறந்த கதைகள். மறக்க முடியாத அனுபவங்கள்.',

    // Upcoming productions
    'productions.upcoming': 'வரவிருக்கும் நிகழ்ச்சிகள்',

    // Genres
    'genre.drama': 'நாடகம்',
    'genre.historical': 'வரலாற்று',
    'genre.comedy': 'நகைச்சுவை',
    'genre.musical': 'இசை',

    // Footer
    'footer.tagline': 'கொழும்பு 07 இல் உள்ள ஒரு நடுத்தர அரங்கம்.',
    'footer.quickLinks': 'விரைவு இணைப்புகள்',
    'footer.contact': 'தொடர்பு',
    'footer.followUs': 'எங்களைப் பின்தொடருங்கள்',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'footer.privacy': 'தனியுரிமை',
    'footer.terms': 'விதிமுறைகள்',
    'footer.support': 'ஆதரவு',
  },
} as const;
