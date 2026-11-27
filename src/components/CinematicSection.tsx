import React from 'react'

export interface CinematicSectionProps {
  id?: string
  className?: string
  children: React.ReactNode
  type?: 'hero' | 'section' | 'footer'
  style?: React.CSSProperties
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  id,
  className = '',
  children,
  type = 'section',
  style = {},
}) => {
  const Tag = type === 'footer' ? 'footer' : 'section'

  return (
    <Tag id={id} className={`cinematic-crossfade-section ${className}`} style={style}>
      {children}
    </Tag>
  )
}

export default CinematicSection
