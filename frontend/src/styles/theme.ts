import { extendTheme, ThemeConfig } from '@chakra-ui/react';

/**
 * Chakra UI theme configuration
 * Per Constitution Section III: UX Consistency
 * - 8px base unit spacing system
 * - Defined color palette
 * - Typography scale
 * - WCAG 2.1 Level AA color contrast
 */

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,

  // 8px base unit spacing (Constitution requirement)
  space: {
    px: '1px',
    0: '0',
    1: '8px', // 8 * 1
    2: '16px', // 8 * 2
    3: '24px', // 8 * 3
    4: '32px', // 8 * 4
    5: '40px', // 8 * 5
    6: '48px', // 8 * 6
    8: '64px', // 8 * 8
    10: '80px', // 8 * 10
    12: '96px', // 8 * 12
    16: '128px', // 8 * 16
    20: '160px', // 8 * 20
    24: '192px', // 8 * 24
  },

  // Color palette (Constitution: primary, secondary, semantic)
  colors: {
    brand: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF', // Primary brand color
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    // Semantic colors for OKR categories
    career: {
      500: '#1890FF', // Blue
      600: '#096DD9',
    },
    health: {
      500: '#52C41A', // Green
      600: '#389E0D',
    },
    relationships: {
      500: '#EB2F96', // Pink
      600: '#C41D7F',
    },
    skills: {
      500: '#722ED1', // Purple
      600: '#531DAB',
    },
    financial: {
      500: '#FAAD14', // Gold
      600: '#D48806',
    },
    personal: {
      500: '#13C2C2', // Cyan
      600: '#08979C',
    },
  },

  // Typography (Constitution: max 3 font families)
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    mono: `'Fira Code', 'Courier New', monospace`,
  },

  // Font sizes with defined scale
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  // Component overrides for accessibility
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: '8px',
      },
      variants: {
        solid: {
          // Ensure 3:1 contrast for large text (Constitution)
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    // Focus indicators (Constitution: minimum 2px outline, 3:1 contrast)
    FormLabel: {
      baseStyle: {
        fontSize: 'sm',
        fontWeight: 'medium',
        marginBottom: '8px',
      },
    },
  },

  // Responsive breakpoints (Constitution requirements)
  breakpoints: {
    sm: '320px', // Mobile start
    md: '768px', // Tablet start
    lg: '1024px', // Desktop start
    xl: '1280px',
    '2xl': '1536px',
  },
});

export default theme;
