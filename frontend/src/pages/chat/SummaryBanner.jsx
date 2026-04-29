import { s } from './styles'

export default function SummaryBanner({ summary }) {
  return (
    <div style={s.summaryBanner}>
      <p style={s.summaryLabel}>Chapter Summary</p>
      <p style={s.summaryText}>{summary}</p>
    </div>
  )
}
