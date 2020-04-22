import React from 'react'
import ContentLoader from 'react-content-loader'

export const PhotoPlaceholder = (props: any) => (
  <ContentLoader
    viewBox="0 0 820 450"
    height={350}
    width={820}
    backgroundColor="#f5f6f7"
    foregroundColor="#e4e4e4"
    style={{ width: '100%' }}
    {...props}
  >
    <rect x="10" y="0" rx="5" ry="5" width="640" height="40" />
    <rect x="10" y="50" rx="5" ry="5" width="320" height="30" />
    <rect x="10" y="90" rx="5" ry="5" width="260" height="140" />
    <rect x="280" y="90" rx="5" ry="5" width="260" height="280" />
    <rect x="550" y="90" rx="5" ry="5" width="260" height="140" />
    <rect x="10" y="240" rx="5" ry="5" width="260" height="280" />
    <rect x="280" y="380" rx="5" ry="5" width="260" height="140" />
    <rect x="550" y="240" rx="5" ry="5" width="260" height="280" />
  </ContentLoader>
)
