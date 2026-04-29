import { Box, Button, Card, Typography } from '@mui/material'
import { s } from './styles'

export default function QuizTab({
  quizLoading,
  quiz,
  quizAnswers,
  onQuizAnswersChange,
  quizResult,
  onGenerateQuiz,
  onGradeQuiz,
}) {
  return (
    <div style={s.tabPane}>
      <div style={s.feed}>
        <Card sx={{ p: 2, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
          <Typography sx={{ color: 'var(--cream)', fontWeight: 900, fontSize: 16, mb: 1 }}>Practice Quiz</Typography>
          <Typography sx={{ color: 'var(--muted)', fontSize: 13, mb: 2 }}>Answer, then check your score.</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={onGenerateQuiz}
              disabled={quizLoading}
              sx={{ backgroundColor: 'var(--saffron)', color: '#0f0e0c', fontWeight: 900, borderRadius: '12px', '&:hover': { backgroundColor: 'var(--saffron2)' } }}
            >
              {quizLoading ? 'Making quiz…' : (quiz ? 'New quiz' : 'Generate quiz')}
            </Button>
            <Button
              variant="outlined"
              onClick={onGradeQuiz}
              disabled={!quiz}
              sx={{ borderColor: 'var(--border)', color: 'var(--cream)', fontWeight: 800, borderRadius: '12px' }}
            >
              Check answers
            </Button>
          </Box>
          {quizResult && (
            <Typography sx={{ mt: 2, color: 'var(--cream)', fontWeight: 900 }}>
              Score: {quizResult.score}/{quizResult.total}
            </Typography>
          )}
        </Card>

        {!quiz && !quizLoading && (
          <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
            <Typography sx={{ color: 'var(--muted)' }}>Click "Generate quiz" to start.</Typography>
          </Card>
        )}

        {quiz && (
          <>
            <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
              <Typography sx={{ color: 'var(--cream)', fontWeight: 900, mb: 1 }}>MCQs</Typography>
              {(quiz.mcq ?? []).map((q, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography sx={{ color: 'var(--cream)', fontWeight: 800 }}>{i + 1}. {q.question}</Typography>
                  <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
                    {(q.options ?? []).map((opt, oi) => (
                      <label key={oi} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--cream)', fontSize: 13 }}>
                        <input
                          type="radio"
                          name={`mcq-${i}`}
                          checked={Number(quizAnswers.mcq[i]) === oi}
                          onChange={() => onQuizAnswersChange({ ...quizAnswers, mcq: { ...quizAnswers.mcq, [i]: oi } })}
                        />
                        {opt}
                      </label>
                    ))}
                  </Box>
                </Box>
              ))}
            </Card>

            <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
              <Typography sx={{ color: 'var(--cream)', fontWeight: 900, mb: 1 }}>True / False</Typography>
              {(quiz.trueFalse ?? []).map((q, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography sx={{ color: 'var(--cream)', fontWeight: 800 }}>{i + 1}. {q.statement}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--cream)', fontSize: 13 }}>
                      <input
                        type="radio"
                        name={`tf-${i}`}
                        checked={quizAnswers.trueFalse[i] === true}
                        onChange={() => onQuizAnswersChange({ ...quizAnswers, trueFalse: { ...quizAnswers.trueFalse, [i]: true } })}
                      />
                      True
                    </label>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--cream)', fontSize: 13 }}>
                      <input
                        type="radio"
                        name={`tf-${i}`}
                        checked={quizAnswers.trueFalse[i] === false}
                        onChange={() => onQuizAnswersChange({ ...quizAnswers, trueFalse: { ...quizAnswers.trueFalse, [i]: false } })}
                      />
                      False
                    </label>
                  </Box>
                </Box>
              ))}
            </Card>

            <Card sx={{ p: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'visible' }}>
              <Typography sx={{ color: 'var(--cream)', fontWeight: 900, mb: 1 }}>Fill in the blanks</Typography>
              {(quiz.fillBlanks ?? []).map((q, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography sx={{ color: 'var(--cream)', fontWeight: 800 }}>{i + 1}. {q.prompt}</Typography>
                  <input
                    value={quizAnswers.fillBlanks[i] ?? ''}
                    onChange={(e) => onQuizAnswersChange({ ...quizAnswers, fillBlanks: { ...quizAnswers.fillBlanks, [i]: e.target.value } })}
                    placeholder="Your answer"
                    style={{ marginTop: 8, width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', color: 'var(--cream)' }}
                  />
                </Box>
              ))}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
