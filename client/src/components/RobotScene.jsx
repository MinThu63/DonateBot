import { useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import Robot from './Robot'
import Confetti from './Confetti'
import SpeechBubble from './SpeechBubble'
import { getIdleGreeting } from '../hooks/useRobotVoice'

// Spotlight that reacts to donations
function StageSpotlight({ active }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.intensity = active
        ? 3 + Math.sin(state.clock.elapsedTime * 8) * 1.5
        : 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <spotLight
      ref={ref}
      position={[0, 5, 2]}
      angle={0.4}
      penumbra={0.5}
      intensity={1.2}
      color={active ? '#ffdd59' : '#4a9eff'}
      castShadow
    />
  )
}

export default function RobotScene({ donation, danceTier, speechMessage, onDanceComplete }) {
  const [idleMessage, setIdleMessage] = useState(null)

  // Cycle idle greetings when not dancing
  useEffect(() => {
    if (donation) {
      setIdleMessage(null)
      return
    }

    // Show an idle greeting every 5 seconds
    const interval = setInterval(() => {
      setIdleMessage(getIdleGreeting())
    }, 5000)

    // Show first one after 2 seconds
    const initial = setTimeout(() => {
      setIdleMessage(getIdleGreeting())
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(initial)
    }
  }, [donation])

  const bubbleMessage = speechMessage || idleMessage
  const bubbleColor = donation
    ? danceTier === 'epic'
      ? '#e056fd'
      : danceTier === 'large'
      ? '#ee5a24'
      : danceTier === 'medium'
      ? '#ff9f43'
      : '#55efc4'
    : '#4a9eff'

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#4a9eff" />

        <StageSpotlight active={!!donation} />

        {/* Stage floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
          <circleGeometry args={[2, 64]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>

        {/* Stage rim glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.74, 0]}>
          <ringGeometry args={[1.9, 2.05, 64]} />
          <meshStandardMaterial
            color={donation ? '#ffdd59' : '#4a9eff'}
            emissive={donation ? '#ffdd59' : '#4a9eff'}
            emissiveIntensity={donation ? 2.5 : 0.6}
          />
        </mesh>

        <Robot donation={donation} onDanceComplete={onDanceComplete} />

        {/* Confetti on donation */}
        {donation && <Confetti tier={danceTier} />}

        {/* Speech bubble */}
        {bubbleMessage && (
          <SpeechBubble
            message={bubbleMessage}
            color={bubbleColor}
            duration={donation ? 4 : 3.5}
          />
        )}

        <ContactShadows
          position={[0, -0.74, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
        />

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={2.5}
          maxDistance={7}
        />
      </Canvas>
    </div>
  )
}
