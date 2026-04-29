import { supabase } from './supabase'

const BASE = '/api'

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token ?? ''}`
  }
}

export async function getContentLibrary() {
  const res = await fetch(`${BASE}/content/library`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch content library')
  return res.json()
}

export async function getSummary(contentId) {
  const qs = new URLSearchParams()
  if (contentId) qs.set('content_id', contentId)
  const url = qs.toString() ? `${BASE}/summary?${qs.toString()}` : `${BASE}/summary`
  const res = await fetch(url, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

export async function askQuestion(question, mode, contentId) {
  const res = await fetch(`${BASE}/ask`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ question, mode, content_id: contentId || null })
  })
  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = data?.detail ?? ''
    } catch {
      // ignore
    }
    throw new Error(detail || 'Failed to get answer')
  }
  return res.json()
}

export async function getChatHistory() {
  const res = await fetch(`${BASE}/history`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function deleteHistory(historyId) {
  const res = await fetch(`${BASE}/history/${historyId}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete history')
  return res.json()
}

export async function getTeachLesson(contentId) {
  const qs = new URLSearchParams()
  if (contentId) qs.set('content_id', contentId)
  const url = qs.toString() ? `${BASE}/teach?${qs.toString()}` : `${BASE}/teach`
  const res = await fetch(url, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch lesson')
  return res.json()
}

export async function getTeachStructured(contentId) {
  const qs = new URLSearchParams()
  if (contentId) qs.set('content_id', contentId)
  const url = qs.toString() ? `${BASE}/teach/structured?${qs.toString()}` : `${BASE}/teach/structured`
  const res = await fetch(url, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch structured lesson')
  return res.json()
}

export async function getQuiz(contentId) {
  const qs = new URLSearchParams()
  if (contentId) qs.set('content_id', contentId)
  const url = qs.toString() ? `${BASE}/quiz?${qs.toString()}` : `${BASE}/quiz`
  const res = await fetch(url, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch quiz')
  return res.json()
}

export async function saveQuizAttempt(score, total, breakdown) {
  const res = await fetch(`${BASE}/quiz/attempt`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ score, total, breakdown })
  })
  if (!res.ok) throw new Error('Failed to save quiz attempt')
  return res.json()
}

export async function getProgress() {
  const res = await fetch(`${BASE}/progress`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch progress')
  return res.json()
}

export async function getGraphExport(maxNodes = 250, maxEdges = 800, contentId) {
  const qs = new URLSearchParams({
    max_nodes: String(maxNodes),
    max_edges: String(maxEdges),
  })
  if (contentId) qs.set('content_id', contentId)
  const res = await fetch(`${BASE}/graph/export?${qs.toString()}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch graph')
  return res.json()
}

export async function getCuriosity(historyId) {
  const res = await fetch(`${BASE}/curiosity/${historyId}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch curiosity suggestions')
  return res.json()
}

export async function saveFeedback(historyId, rating, note) {
  const res = await fetch(`${BASE}/feedback`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ history_id: historyId, rating, note })
  })
  if (!res.ok) throw new Error('Failed to save feedback')
  return res.json()
}
