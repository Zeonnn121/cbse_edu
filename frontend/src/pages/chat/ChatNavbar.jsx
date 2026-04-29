import {
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import { s } from './styles'

export default function ChatNavbar({
  mode,
  onModeChange,
  showSummary,
  onToggleSummary,
  userEmail,
  onOpenSidebar,
  onSignOut,
}) {
  return (
    <header style={s.nav}>
      <div style={s.navLeft}>
        <button onClick={onOpenSidebar} style={s.iconBtn}>☰</button>
        <span style={s.navTitle}>Deev</span>
      </div>

      <div style={s.navRight}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            sx={{
              color: 'var(--cream)',
              backgroundColor: 'var(--surface2)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--saffron2)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--saffron)' },
              '& .MuiSvgIcon-root': { color: 'var(--muted)' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: 'var(--surface)',
                  color: 'var(--cream)',
                  border: '1px solid var(--border)',
                },
              },
            }}
          >
            <MenuItem value="default">Tutor mode: Normal</MenuItem>
            <MenuItem value="explain7">Tutor mode: Explain like I'm 7</MenuItem>
            <MenuItem value="example">Tutor mode: Give an example</MenuItem>
            <MenuItem value="stepbystep">Tutor mode: Step-by-step</MenuItem>
          </Select>
        </FormControl>

        <button onClick={onToggleSummary} style={s.pillBtn}>
          {showSummary ? 'Hide Summary' : '📋 Summary'}
        </button>

        <span style={s.userEmail}>{userEmail}</span>
        <button onClick={onSignOut} style={s.signOutBtn}>Sign out</button>
      </div>
    </header>
  )
}
