const Logo = props => {
  return (
    <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(0, 3)">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00fbff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="#00fbff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#00fbff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="32" y="22" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="currentColor" letterSpacing="-0.5">nodepath</text>
    </svg>
  )
}

export default Logo
