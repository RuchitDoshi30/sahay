/**
 * PageContainer — Standardized page wrapper with consistent max-width and padding.
 * Wraps the main page content area with the correct layout constraints.
 *
 * Props:
 *   children  {ReactNode} — Child content to render
 *   wide      {boolean}   — Use wide layout (1420px) vs standard (1100px) for map pages
 *   style     {object}    — Additional inline styles
 */
function PageContainer({ children, wide = false, style = {} }) {
  return (
    <main
      className={wide ? undefined : 'profile-main'}
      style={
        wide
          ? { maxWidth: '1420px', margin: '0 auto', padding: '30px 4% 60px', ...style }
          : style
      }
    >
      {children}
    </main>
  )
}

export default PageContainer
