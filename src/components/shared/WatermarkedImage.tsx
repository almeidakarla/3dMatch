'use client'

import { useState } from 'react'

interface WatermarkedImageProps {
  src: string
  alt: string
  isApproved: boolean
}

export default function WatermarkedImage({ src, alt, isApproved }: WatermarkedImageProps) {
  const [showModal, setShowModal] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  return (
    <>
      <div
        style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        {!isApproved && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '60%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0.4
            }}
          >
            <div style={{
              background: 'linear-gradient(224.78deg, #5390E3 8.12%, #1357B3 92.21%)',
              borderRadius: '20px',
              padding: '20px 40px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              transform: 'rotate(-15deg)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '60px',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '-2px'
              }}>
                3D
              </div>
              <div style={{
                fontSize: '40px',
                fontWeight: '600',
                color: 'white',
                fontFamily: 'Arial, sans-serif'
              }}>
                Match
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001
              }}
            >
              ×
            </button>

            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '90vh' }}>
              <img
                src={src}
                alt={alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
              {!isApproved && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50%',
                    height: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.3
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(224.78deg, #5390E3 8.12%, #1357B3 92.21%)',
                    borderRadius: '30px',
                    padding: '40px 80px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    transform: 'rotate(-15deg)',
                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{
                      fontSize: '120px',
                      fontWeight: '900',
                      color: 'white',
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '-4px'
                    }}>
                      3D
                    </div>
                    <div style={{
                      fontSize: '80px',
                      fontWeight: '600',
                      color: 'white',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      Match
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
