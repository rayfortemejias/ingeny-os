// Next.js Imports
import dynamic from 'next/dynamic'

// Component Imports
const PromptGenerator = dynamic(() => import('@views/tools/PromptGenerator'))

const PromptGeneratorPage = () => {
  return <PromptGenerator />
}

export default PromptGeneratorPage
