/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#F5F7FF',
    tint: '#06B6D4',

    background: '#0A0D14',
    foreground: '#F5F7FF',

    card: '#141A29',
    cardForeground: '#F5F7FF',

    primary: '#A855F7',
    primaryForeground: '#ffffff',

    secondary: '#20283A',
    secondaryForeground: '#D8E0F0',

    muted: '#182133',
    mutedForeground: '#8A94AB',

    accent: '#06B6D4',
    accentForeground: '#071018',

    destructive: '#FB7185',
    destructiveForeground: '#ffffff',

    border: '#273149',
    input: '#273149',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
