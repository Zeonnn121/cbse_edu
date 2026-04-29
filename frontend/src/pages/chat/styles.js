export const s = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' },

  // Sidebar
  sidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    width: '280px', background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.25s ease',
  },
  sidebarHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px', borderBottom: '1px solid var(--border)',
  },
  sidebarTitle: { fontWeight: '600', color: 'var(--cream)', fontSize: '14px' },
  historyList: { flex: 1, overflowY: 'auto', padding: '12px' },
  emptyHistory: { color: 'var(--muted)', fontSize: '13px', textAlign: 'center', marginTop: '24px' },
  historyItem: { padding: '12px', borderRadius: '10px', marginBottom: '8px', background: 'var(--surface2)', cursor: 'pointer' },
  historyQ: { fontSize: '13px', color: 'var(--cream)', fontWeight: '500', marginBottom: '4px' },
  historyA: { fontSize: '12px', color: 'var(--muted)' },
  privacyNotice: {
    padding: '12px 20px',
    background: 'rgba(59,130,246,0.08)',
    borderBottom: '1px solid rgba(59,130,246,0.2)',
    color: 'var(--muted)',
    fontSize: '12px',
  },
  overlay: { position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)' },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: '60px', flexShrink: 0,
    borderBottom: '1px solid var(--border)', background: 'var(--surface)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  navTitle: { fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: '22px', color: 'var(--cream)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBtn: { background: 'transparent', color: 'var(--muted)', fontSize: '16px', padding: '6px' },
  pillBtn: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--cream)', borderRadius: '20px',
    padding: '6px 14px', fontSize: '12px', fontWeight: '600',
  },
  userEmail: { color: 'var(--muted)', fontSize: '12px' },
  signOutBtn: {
    background: 'transparent', color: 'var(--muted)',
    fontSize: '12px', padding: '6px 10px',
    border: '1px solid var(--border)', borderRadius: '8px',
  },

  // Summary
  summaryBanner: {
    margin: '12px 20px', padding: '16px 20px',
    background: 'rgba(244,167,51,0.08)', border: '1px solid rgba(244,167,51,0.2)',
    borderRadius: '12px', flexShrink: 0,
  },
  summaryLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--saffron)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
  summaryText: { fontSize: '14px', color: 'var(--cream)', lineHeight: '1.7' },

  // Shared tab wrapper — fills remaining space, clips, lets feed scroll
  tabPane: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' },

  // Feed
  feed: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  empty: { margin: 'auto', textAlign: 'center', padding: '40px 0' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: '24px', color: 'var(--cream)', marginBottom: '8px' },
  emptyHint: { color: 'var(--muted)', fontSize: '14px' },

  // Chat bubbles
  bubble: { display: 'flex', gap: '12px', maxWidth: '720px', animation: 'fadeUp 0.2s ease' },
  bubbleUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse', background: 'var(--saffron)', borderRadius: '18px 18px 4px 18px', padding: '12px 16px' },
  bubbleBot: { alignSelf: 'flex-start', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px' },
  botIcon: { fontSize: '18px', flexShrink: 0, marginTop: '2px' },
  bubbleBody: { display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 },
  bubbleText: { fontSize: '14px', lineHeight: '1.7', color: 'inherit' },
  typing: { display: 'flex', gap: '5px', alignItems: 'center', padding: '4px 0' },

  // Feedback
  feedbackRow: { display: 'flex', gap: '8px' },
  feedbackBtn: {
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--cream)',
    borderRadius: '10px',
    padding: '6px 10px',
    fontSize: '14px',
    lineHeight: 1,
    cursor: 'pointer',
    opacity: 0.9,
  },
  feedbackBtnActive: {
    background: 'var(--saffron)',
    borderColor: 'var(--saffron)',
    color: '#0f0e0c',
    opacity: 1,
  },
  curiosityRow: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  curiosityBtn: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'var(--cream)',
    transition: 'all 0.15s ease',
  },

  // Ask input
  inputBar: {
    display: 'flex', gap: '10px', padding: '16px 20px',
    borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
  },
  inputField: {
    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '12px 16px',
    color: 'var(--cream)', fontSize: '14px',
  },
  sendBtn: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'var(--saffron)', color: '#0f0e0c',
    fontSize: '20px', fontWeight: '700', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
}
