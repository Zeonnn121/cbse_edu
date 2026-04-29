export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function speakText(text) {
  if (!canSpeak()) return false

  const cleaned = (text ?? '').toString().trim()
  if (!cleaned) return false

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(cleaned)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking() {
  if (!canSpeak()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // ignore
  }
}
