import { Box, Card, Typography } from '@mui/material'
import { s } from './styles'

export default function ProgressTab({
  progress,
  progressLoading,
  historyLength,
}) {
  return (
    <div style={s.tabPane}>
      <div style={s.feed}>
        <Card sx={{ p: 2, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
          <Typography sx={{ color: 'var(--cream)', fontWeight: 900, fontSize: 16, mb: 1 }}>Your progress</Typography>
          <Typography sx={{ color: 'var(--muted)', fontSize: 13, mb: 2 }}>Simple stats to help you improve.</Typography>

          {progressLoading && <Typography sx={{ color: 'var(--muted)' }}>Loading…</Typography>}

          {!progressLoading && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'visible' }}>
                <Typography sx={{ color: 'var(--muted)', fontSize: 12, fontWeight: 800 }}>Questions asked</Typography>
                <Typography sx={{ color: 'var(--cream)', fontSize: 22, fontWeight: 900 }}>
                  {progress?.questions_asked ?? historyLength}
                </Typography>
              </Card>

              <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'visible' }}>
                <Typography sx={{ color: 'var(--muted)', fontSize: 12, fontWeight: 800 }}>Quiz attempts</Typography>
                <Typography sx={{ color: 'var(--cream)', fontSize: 22, fontWeight: 900 }}>
                  {progress?.quiz_attempts ?? 0}
                </Typography>
              </Card>

              <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'visible' }}>
                <Typography sx={{ color: 'var(--muted)', fontSize: 12, fontWeight: 800 }}>Best quiz score</Typography>
                <Typography sx={{ color: 'var(--cream)', fontSize: 22, fontWeight: 900 }}>
                  {progress?.best_quiz_score ?? '—'}
                </Typography>
              </Card>
            </Box>
          )}
        </Card>
      </div>
    </div>
  )
}
