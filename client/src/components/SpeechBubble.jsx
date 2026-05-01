import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function SpeechBubble({ message, color = '#ffffff', duration = 3 }) {
  const groupRef = useRef()
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const timeRef = useRef(0)

  useEffect(() => {
    setVisible(true)
    setOpacity(1)
    timeRef.current = 0
  }, [message])

  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return

    timeRef.current += delta

    // Gentle float
    groupRef.current.position.y = 2.4 + Math.sin(state.clock.elapsedTime * 2) * 0.05

    // Fade out near end
    if (timeRef.current > duration - 0.5) {
      const fadeProgress = (timeRef.current - (duration - 0.5)) / 0.5
      setOpacity(Math.max(0, 1 - fadeProgress))
    }

    if (timeRef.current >= duration) {
      setVisible(false)
    }
  })

  if (!visible || !message) return null

  return (
    <group ref={groupRef} position={[0, 2.4, 0]}>
      {/* Bubble background */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[Math.min(message.length * 0.12 + 0.4, 3), 0.4]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={opacity * 0.85} />
      </mesh>
      {/* Bubble border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[Math.min(message.length * 0.12 + 0.5, 3.1), 0.5]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} />
      </mesh>
      {/* Bubble tail (triangle pointing down) */}
      <mesh position={[0, -0.28, -0.01]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.08, 0.15, 3]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} />
      </mesh>
      {/* Text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.14}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
        fillOpacity={opacity}
      >
        {message}
      </Text>
    </group>
  )
}
