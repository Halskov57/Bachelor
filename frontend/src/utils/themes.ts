export interface Theme {
  name: string;
  label: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    sidebarBackground: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
}

export const themes: Theme[] = [
  {
    name: 'light',
    label: 'Light Blue',
    colors: {
      background: '210 20% 98%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96.1%',
      secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%',
      accentForeground: '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%',
      sidebarBackground: '210 40% 98%',
      sidebarForeground: '222.2 47.4% 11.2%',
      sidebarPrimary: '221.2 83.2% 53.3%',
      sidebarPrimaryForeground: '210 40% 98%',
      sidebarAccent: '210 40% 96.1%',
      sidebarAccentForeground: '222.2 47.4% 11.2%',
      sidebarBorder: '214.3 31.8% 91.4%',
      sidebarRing: '221.2 83.2% 53.3%',
    },
  },
  {
    name: 'beige',
    label: 'Warm Beige',
    colors: {
      background: '40 30% 97%',
      foreground: '30 15% 25%',
      card: '0 0% 100%',
      cardForeground: '30 15% 25%',
      popover: '0 0% 100%',
      popoverForeground: '30 15% 25%',
      primary: '35 55% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '40 25% 90%',
      secondaryForeground: '30 15% 25%',
      muted: '40 25% 92%',
      mutedForeground: '30 10% 45%',
      accent: '38 50% 85%',
      accentForeground: '30 15% 25%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 100%',
      border: '40 20% 88%',
      input: '40 20% 88%',
      ring: '35 55% 55%',
      sidebarBackground: '40 35% 94%',
      sidebarForeground: '30 15% 25%',
      sidebarPrimary: '35 55% 55%',
      sidebarPrimaryForeground: '0 0% 100%',
      sidebarAccent: '40 25% 90%',
      sidebarAccentForeground: '30 15% 25%',
      sidebarBorder: '40 20% 85%',
      sidebarRing: '35 55% 55%',
    },
  },
  {
    name: 'dark',
    label: 'Dark Mode',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '217.2 32.6% 8%',
      cardForeground: '210 40% 98%',
      popover: '217.2 32.6% 8%',
      popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 50.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '224.3 76.3% 48%',
      sidebarBackground: '222.2 84% 4.9%',
      sidebarForeground: '210 40% 98%',
      sidebarPrimary: '217.2 91.2% 59.8%',
      sidebarPrimaryForeground: '222.2 47.4% 11.2%',
      sidebarAccent: '217.2 32.6% 17.5%',
      sidebarAccentForeground: '210 40% 98%',
      sidebarBorder: '217.2 32.6% 17.5%',
      sidebarRing: '224.3 76.3% 48%',
    },
  },
];

export const getTheme = (name: string): Theme => {
  return themes.find(t => t.name === name) || themes[0];
};

export const applyTheme = (themeName: string): void => {
  const theme = getTheme(themeName);
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssVarName}`, value);
  });

  localStorage.setItem('theme', themeName);
};

export const getCurrentTheme = (): string => {
  return localStorage.getItem('theme') || 'light';
};
