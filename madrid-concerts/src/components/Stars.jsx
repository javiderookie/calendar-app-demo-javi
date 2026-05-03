import { useState } from 'react'

export default function Stars({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hov, setHov] = useState(0)
  const sz = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHov(n)}
          onMouseLeave={() => !readonly && setHov(0)}
          className={`${sz} leading-none transition-transform ${!readonly && 'cursor-pointer hover:scale-110'} ${readonly && 'cursor-default'}`}
        >
          <span className={n <= (hov || value) ? 'text-yellow-400' : 'text-gray-700'}>★</span>
        </button>
      ))}
    </div>
  )
}
