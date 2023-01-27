import { RecoilRoot } from 'recoil'
import WindowContent from '@components/appWindowContent/WindowContent'
import WindowToolbar from '@components/appWindowToolbar/WindowToolbar'
import WindowStatusBar from '@components/appWindowStatusbar/WindowStatusBar'

const App = () => {
   return (
      <RecoilRoot>
         <main id={"app-mainwindow"}>
            <WindowToolbar />
            <WindowContent />
            <WindowStatusBar />
         </main>
      </RecoilRoot>
   )
}

export default App