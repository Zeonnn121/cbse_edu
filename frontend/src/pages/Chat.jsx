import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import {
  askQuestion,
  getChatHistory,
  getCuriosity,
  getProgress,
  getQuiz,
  getSummary,
  getTeachLesson,
  getTeachStructured,
  saveFeedback,
  saveQuizAttempt,
  deleteHistory,
} from '../lib/api'

import AskTab from './chat/AskTab'
import ChatKeyframes from './chat/ChatKeyframes'
import ChatNavbar from './chat/ChatNavbar'
import ChatTabs from './chat/ChatTabs'
import HistorySidebar from './chat/HistorySidebar'
import ProgressTab from './chat/ProgressTab'
import QuizTab from './chat/QuizTab'
import SummaryBanner from './chat/SummaryBanner'
import TeachTab from './chat/TeachTab'
import { s } from './chat/styles'

export default function Chat({ session, initialTab = 'teach' }) {
  const location = useLocation()

  const urlContentId = new URLSearchParams(location.search).get('content_id') || ''
  const storedContentId = (localStorage.getItem('tisd.content_id') || '').trim()
  const contentId = (urlContentId || storedContentId || '').trim() || null

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedbackByHistoryId, setFeedbackByHistoryId] = useState({})
  const [feedbackSaving, setFeedbackSaving] = useState({})
  const [mode, setMode] = useState('default')
  const [summary, setSummary] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [history, setHistory] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState(initialTab)

  const [lesson, setLesson] = useState('')
  const [structuredLesson, setStructuredLesson] = useState(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({ mcq: {}, trueFalse: {}, fillBlanks: {} })
  const [quizResult, setQuizResult] = useState(null)

  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [curiosityByHistoryId, setCuriosityByHistoryId] = useState({})
  const [curiosityLoading, setCuriosityLoading] = useState({})

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Reset per-chapter UI state when switching chapters
    setMessages([])
    setInput('')
    setLesson('')
    setStructuredLesson(null)
    setQuiz(null)
    setQuizAnswers({ mcq: {}, trueFalse: {}, fillBlanks: {} })
    setQuizResult(null)
    setShowSummary(false)
    setSummary('')

    getSummary(contentId).then((d) => setSummary(d.summary)).catch(() => {})
  }, [contentId])

  useEffect(() => {
    getChatHistory().then((d) => setHistory(d.history ?? [])).catch(() => {})
    setProgressLoading(true)
    getProgress().then(setProgress).catch(() => {}).finally(() => setProgressLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleAsk(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return

    const userMsg = { role: 'user', text: q, id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await askQuestion(q, mode, contentId)
      const historyId = data.history_id ?? null
      const botMsg = { role: 'bot', text: data.answer, id: Date.now() + 1, historyId }
      setMessages((prev) => [...prev, botMsg])

      // Load curiosity suggestions
      if (historyId) {
        setCuriosityLoading(prev => ({ ...prev, [historyId]: true }))
        getCuriosity(historyId).then(({ suggestions }) => {
          setCuriosityByHistoryId(prev => ({ ...prev, [historyId]: suggestions }))
        }).catch(e => {
          console.warn('Failed to load curiosity suggestions', e)
        }).finally(() => {
          setCuriosityLoading(prev => ({ ...prev, [historyId]: false }))
        })
      }

      getChatHistory().then((d) => setHistory(d.history ?? [])).catch(() => {})
      getProgress().then(setProgress).catch(() => {})
    } catch (e) {
      const msg = (e?.message || '').toString().trim()
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: `⚠️ ${msg || 'Could not reach the server. Is the backend running?'}`,
        id: Date.now() + 1,
      }])
    } finally {
      setLoading(false)
    }
  }

  async function handleTeach() {
    if (lessonLoading) return
    setLessonLoading(true)
    setStructuredLesson(null)
    setLesson('')
    setTab('teach')
    try {
      const data = await getTeachStructured(contentId)
      setStructuredLesson(data)
    } catch {
      // Fallback to plain text lesson
      try {
        const data = await getTeachLesson(contentId)
        setLesson(data.lesson ?? '')
      } catch {
        setLesson('⚠️ Could not generate the lesson right now. Please try again.')
      }
    } finally {
      setLessonLoading(false)
    }
  }

  async function handleGenerateQuiz() {
    if (quizLoading) return
    setQuizLoading(true)
    setQuizResult(null)
    try {
      const data = await getQuiz(contentId)
      setQuiz(data.quiz ?? null)
      setQuizAnswers({ mcq: {}, trueFalse: {}, fillBlanks: {} })
      setTab('quiz')
    } catch {
      setQuiz(null)
    } finally {
      setQuizLoading(false)
    }
  }

  function gradeQuiz() {
    if (!quiz) return

    let score = 0
    let total = 0
    const breakdown = { mcq: 0, trueFalse: 0, fillBlanks: 0 }

    const mcq = Array.isArray(quiz.mcq) ? quiz.mcq : []
    const tf = Array.isArray(quiz.trueFalse) ? quiz.trueFalse : []
    const fb = Array.isArray(quiz.fillBlanks) ? quiz.fillBlanks : []

    mcq.forEach((q, i) => {
      total += 1
      const a = quizAnswers.mcq[i]
      const correct = Number(q.answerIndex)
      if (a !== undefined && Number(a) === correct) { score += 1; breakdown.mcq += 1 }
    })

    tf.forEach((q, i) => {
      total += 1
      const a = quizAnswers.trueFalse[i]
      const correct = Boolean(q.answer)
      if (a !== undefined && Boolean(a) === correct) { score += 1; breakdown.trueFalse += 1 }
    })

    fb.forEach((q, i) => {
      total += 1
      const a = (quizAnswers.fillBlanks[i] ?? '').toString().trim().toLowerCase()
      const correct = (q.answer ?? '').toString().trim().toLowerCase()
      if (a && correct && a === correct) { score += 1; breakdown.fillBlanks += 1 }
    })

    const result = { score, total, breakdown }
    setQuizResult(result)
    saveQuizAttempt(score, total, breakdown).catch(() => {})
    getProgress().then(setProgress).catch(() => {})
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function handleFeedback(historyId, rating) {
    if (!historyId) return
    if (feedbackSaving[historyId]) return

    setFeedbackSaving((p) => ({ ...p, [historyId]: true }))
    try {
      await saveFeedback(historyId, rating)
      setFeedbackByHistoryId((p) => ({ ...p, [historyId]: rating }))
    } catch (e) {
      console.warn('Failed to save feedback', e)
    } finally {
      setFeedbackSaving((p) => ({ ...p, [historyId]: false }))
    }
  }

  async function handleDeleteHistory(historyId) {
    if (!historyId) return
    try {
      await deleteHistory(historyId)
      setHistory((prev) => prev.filter(h => h.id !== historyId))
    } catch (e) {
      console.warn('Failed to delete history', e)
    }
  }

  const userEmail = session?.user?.email ?? 'Student'

  return (
    <div style={s.shell}>
      <HistorySidebar
        open={sidebarOpen}
        history={history}
        onClose={() => setSidebarOpen(false)}
        onPickQuestion={(q) => {
          setInput(q)
          setSidebarOpen(false)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        onDeleteQuestion={handleDeleteHistory}
      />

      <div style={s.main}>
        <ChatNavbar
          mode={mode}
          onModeChange={setMode}
          showSummary={showSummary}
          onToggleSummary={() => setShowSummary((v) => !v)}
          userEmail={userEmail}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSignOut={signOut}
        />

        <ChatTabs tab={tab} onTabChange={setTab} />

        {showSummary && summary && <SummaryBanner summary={summary} />}

        {tab === 'teach' && (
          <TeachTab
            contentId={contentId}
            lesson={lesson}
            structuredLesson={structuredLesson}
            lessonLoading={lessonLoading}
            onTeach={handleTeach}
            onGenerateQuiz={handleGenerateQuiz}
            quizLoading={quizLoading}
          />
        )}

        {tab === 'ask' && (
          <AskTab
            messages={messages}
            loading={loading}
            input={input}
            onInputChange={setInput}
            onSubmit={handleAsk}
            feedbackByHistoryId={feedbackByHistoryId}
            feedbackSaving={feedbackSaving}
            onFeedback={handleFeedback}
            curiosityByHistoryId={curiosityByHistoryId}
            curiosityLoading={curiosityLoading}
            bottomRef={bottomRef}
            inputRef={inputRef}
          />
        )}

        {tab === 'quiz' && (
          <QuizTab
            quizLoading={quizLoading}
            quiz={quiz}
            quizAnswers={quizAnswers}
            onQuizAnswersChange={setQuizAnswers}
            quizResult={quizResult}
            onGenerateQuiz={handleGenerateQuiz}
            onGradeQuiz={gradeQuiz}
          />
        )}

        {tab === 'progress' && (
          <ProgressTab
            progress={progress}
            progressLoading={progressLoading}
            historyLength={history.length}
          />
        )}
      </div>

      <ChatKeyframes />
    </div>
  )
}