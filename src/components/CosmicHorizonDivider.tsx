import React from 'react'

export interface CosmicHorizonDividerProps {
  theme?: 'hero' | 'about' | 'skills' | 'projects' | 'contact' | 'footer'
  className?: string
}

export const CosmicHorizonDivider: React.FC<CosmicHorizonDividerProps> = ({
  theme = 'about',
  className = '',
}) => {
  return (
    <div
      className={`cosmic-horizon-divider cosmic-horizon-${theme} ${className}`}
      aria-hidden="true"
    >
      <div className="cosmic-horizon-line" />
      <div className="cosmic-horizon-beacon-node">
        <span className="cosmic-horizon-beacon-glow" />
      </div>
    </div>
  )
}

export default CosmicHorizonDivider
