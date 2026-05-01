import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Confetti({ tier }) {
  const meshRef = useRef()

  const count = tier === 'epic' ? 150 : tier === 'full' ? 80 : tier === 'spin' ? 40 : 20

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 4,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 4,
        ],
        speed: Math.random() * 2 + 1,
        rotationSpeed: Math.random() * 5,
        color: ['#ff6b6b', '#ffdd59', '#4a9eff', '#e056fd', '#26de81', '#ff9f43'][
          Math.floor(Math.random() * 6)
        ],
        scale: Math.random() * 0.08 + 0.03,
      })
    }
    return temp
  }, [count])

  return (
    <group>
      {particles.map((p, i) => (
        <ConfettiPiece key={i} {...p} />
      ))}
    </group>
  )
}

function ConfettiPiece({ position, speed, rotationSpeed, color, scale }) {
  const ref = useRef()

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.position.y -= delta * speed
    ref.current.rotation.x += delta * rotationSpeed
    ref.current.rotation.z += delta * rotationSpeed * 0.5

    // Reset when fallen below stage
    if (ref.current.position.y < -1) {
      ref.current.position.y = Math.random() * 3 + 2
      ref.current.position.x = (Math.random() - 0.5) * 4
      ref.current.position.z = (Math.random() - 0.5) * 4
    }
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
