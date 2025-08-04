// src/app/apple-icon.tsx
import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        TIGR
      </div>
    ),
    { ...size }
  )
}