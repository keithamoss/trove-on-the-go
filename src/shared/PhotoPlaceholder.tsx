import React from 'react'
import ContentLoader from 'react-content-loader'

export const PhotoPlaceholder = (props: any) => (
  <ContentLoader
    viewBox="0 0 550 370"
    // backgroundColor="#f5f6f7"
    foregroundColor="#e4e4e4"
    style={{opacity: 0.8, marginBottom: 15}}
    {...props}
  >
    {/* Title */}
    <rect x="10" y="10" rx="5" ry="5" width="430" height="25" />
    {/* Subtitle */}
    <rect x="10" y="40" rx="5" ry="5" width="215" height="20" />

    {/* First Row */}
    <rect x="10" y="70" rx="5" ry="5" width="170" height="95" />
    <rect x="185" y="70" rx="5" ry="5" width="170" height="165" />
    <rect x="360" y="70" rx="5" ry="5" width="170" height="95" />

    {/* Second Row */}
    <rect x="10" y="170" rx="5" ry="5" width="170" height="190" />
    <rect x="185" y="240" rx="5" ry="5" width="170" height="120" />
    <rect x="360" y="170" rx="5" ry="5" width="170" height="190" />
  </ContentLoader>
)
