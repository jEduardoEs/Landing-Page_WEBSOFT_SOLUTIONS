'use client'
import { useEffect, useState } from 'react'

export type DeviceType = 'ios' | 'android' | 'desktop'

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /Android/.test(ua)
    const mobile = window.innerWidth <= 1024 || 'ontouchstart' in window

    setIsMobile(mobile)
    if (isIOS) setDevice('ios')
    else if (isAndroid) setDevice('android')
    else setDevice('desktop')
  }, [])

  return { device, isMobile, isIOS: device === 'ios' }
}
