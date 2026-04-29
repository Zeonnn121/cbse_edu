export default function ChatKeyframes() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes dot {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
        40%            { opacity: 1;   transform: scale(1); }
      }
    `}</style>
  )
}
