import Chrome from './components/interface/Chrome'
import Scene01Specimen from './scenes/Scene01Specimen'
import Scene02Expansion from './scenes/Scene02Expansion'
import Scene03Interruption from './scenes/Scene03Interruption'
import Scene04Distortion from './scenes/Scene04Distortion'
import Scene05Fragmentation from './scenes/Scene05Fragmentation'
import Scene06Collage from './scenes/Scene06Collage'
import Scene07Composition from './scenes/Scene07Composition'
import Scene07Colophon from './scenes/Scene07Colophon'

export default function App() {
  return (
    <>
      <Chrome />
      <div className="grain" aria-hidden />
      <main>
        <Scene01Specimen />
        <Scene02Expansion />
        <Scene03Interruption />
        <Scene04Distortion />
        <Scene05Fragmentation />
        <Scene06Collage />
        <Scene07Composition />
        <Scene07Colophon />
      </main>
    </>
  )
}
