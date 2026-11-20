// Third-party Imports
import styled from '@emotion/styled'

const StyledVerticalNavBgColorContainer = styled.div`
  position: relative;
  block-size: 100%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: white;

  /* Hide native scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`

export default StyledVerticalNavBgColorContainer
