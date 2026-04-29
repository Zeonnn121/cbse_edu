import {
  Box,
  Tab,
  Tabs,
} from '@mui/material'

export default function ChatTabs({ tab, onTabChange }) {
  return (
    <Box sx={{ px: 2, pt: 1, flexShrink: 0 }}>
      <Tabs
        value={tab}
        onChange={(_e, v) => onTabChange(v)}
        textColor="inherit"
        indicatorColor="secondary"
        sx={{
          '& .MuiTab-root': { color: 'var(--muted)', fontWeight: 800, textTransform: 'none' },
          '& .Mui-selected': { color: 'var(--cream)' },
          '& .MuiTabs-indicator': { backgroundColor: 'var(--saffron)' },
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Tab value="teach" label="Teach" />
        <Tab value="ask" label="Ask a doubt" />
        <Tab value="quiz" label="Quiz" />
        <Tab value="progress" label="Progress" />
      </Tabs>
    </Box>
  )
}
