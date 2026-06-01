'use client'
import { useEffect } from 'react'

export default function IOSProvider() {
  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isIOS) {
      document.documentElement.classList.add('ios-device')
      // Set meta viewport for iOS
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover')
      }
    }
  }, [])

  return null
}
