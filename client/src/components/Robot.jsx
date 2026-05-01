import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function getDanceTier(amount) {
  if (amount >= 50) return 'epic'
  if (amount >= 20) return 'large'
  if (amount >= 5) return 'medium'
  return 'small'
}

// Smooth metallic material
function MetalMaterial({ color = '#e0e0e0', roughness = 0.3, metalness = 0.7 }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
}

// Glowing material for lights/screens
function GlowMaterial({ color, intensity = 1 }) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      roughness={0.2}
      metalness={0.1}
    />
  )
}

// Joint connector (ball joint look)
function Joint({ position, size = 0.08 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <MetalMaterial color="#888888" roughness={0.4} metalness={0.8} />
    </mesh>
  )
}

export default function Robot({ donation, onDanceComplete }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftForearmRef = useRef()
  const rightForearmRef = useRef()
  const torsoRef = useRef()
  const screenRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const antennaLightRef = useRef()
  const earLeftRef = useRef()
  const earRightRef = useRef()

  const [dancing, setDancing] = useState(false)
  const [danceTier, setDanceTier] = useState(null)
  const [danceTime, setDanceTime] = useState(0)
  const [accentColor, setAccentColor] = useState('#4a9eff')

  const [idlePhase, setIdlePhase] = useState(0)
  const idleTimerRef = useRef(0)

  const danceDurations = useMemo(() => ({
    small: 10,
    medium: 12,
    large: 14,
    epic: 18,
  }), [])

  useEffect(() => {
    if (donation) {
      const tier = getDanceTier(donation.amount)
      setDanceTier(tier)
      setDancing(true)
      setDanceTime(0)

      const colors = {
        small: '#55efc4',
        medium: '#ff9f43',
        large: '#ee5a24',
        epic: '#e056fd',
      }
      setAccentColor(colors[tier])
    }
  }, [donation])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    if (dancing && danceTier) {
      // =====================
      //   DANCE STATES
      // =====================
      setDanceTime((prev) => {
        const next = prev + delta
        if (next >= danceDurations[danceTier]) {
          setDancing(false)
          setDanceTier(null)
          setAccentColor('#4a9eff')
          if (onDanceComplete) onDanceComplete()
          return 0
        }
        return next
      })

      // --- SMALL: Happy Nod ---
      if (danceTier === 'small') {
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 6) * 0.2
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 0.6 + Math.sin(t * 6) * 0.6
          leftArmRef.current.rotation.x = -0.4
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.6 - Math.sin(t * 6) * 0.6
          rightArmRef.current.rotation.x = -0.4
        }
        if (leftForearmRef.current) {
          leftForearmRef.current.rotation.x = -0.3 + Math.sin(t * 6) * 0.2
        }
        if (rightForearmRef.current) {
          rightForearmRef.current.rotation.x = -0.3 + Math.sin(t * 6) * 0.2
        }
        if (torsoRef.current) {
          torsoRef.current.rotation.x = Math.sin(t * 6) * 0.04
        }
      }

      // --- MEDIUM: Robot Groove ---
      if (danceTier === 'medium') {
        if (torsoRef.current) {
          torsoRef.current.rotation.y = Math.sin(t * 4) * 0.3
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.sin(t * 4) * 0.5
          leftArmRef.current.rotation.x = Math.cos(t * 4) * 0.25
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.sin(t * 4 + Math.PI) * 0.5
          rightArmRef.current.rotation.x = Math.cos(t * 4 + Math.PI) * 0.25
        }
        if (leftForearmRef.current) {
          leftForearmRef.current.rotation.x = -0.8 + Math.sin(t * 4) * 0.3
        }
        if (rightForearmRef.current) {
          rightForearmRef.current.rotation.x = -0.8 + Math.sin(t * 4 + Math.PI) * 0.3
        }
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 4) * 0.15
          headRef.current.rotation.x = 0
        }
      }

      // --- LARGE: Cabbage Patch ---
      if (danceTier === 'large') {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = 0.3 + Math.sin(t * 5) * 0.4
          leftArmRef.current.rotation.x = -0.5 + Math.cos(t * 5) * 0.3
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -0.3 - Math.sin(t * 5) * 0.4
          rightArmRef.current.rotation.x = -0.5 + Math.cos(t * 5 + Math.PI) * 0.3
        }
        if (leftForearmRef.current) {
          leftForearmRef.current.rotation.x = -1.0 + Math.sin(t * 5) * 0.3
        }
        if (rightForearmRef.current) {
          rightForearmRef.current.rotation.x = -1.0 + Math.sin(t * 5 + Math.PI) * 0.3
        }
        if (torsoRef.current) {
          torsoRef.current.rotation.z = Math.sin(t * 2.5) * 0.12
          torsoRef.current.rotation.y = Math.sin(t * 2.5) * 0.08
        }
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 2.5) * 0.08
          headRef.current.rotation.x = 0
        }
      }

      // --- EPIC: Full Celebration ---
      if (danceTier === 'epic') {
        groupRef.current.rotation.y += delta * 1.2
        if (torsoRef.current) {
          torsoRef.current.rotation.y = Math.sin(t * 5) * 0.25
          torsoRef.current.rotation.z = Math.sin(t * 2.5) * 0.08
        }
        const armPhase = Math.floor(t * 0.8) % 2
        if (armPhase === 0) {
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z = 1.2 + Math.sin(t * 7) * 0.4
            leftArmRef.current.rotation.x = Math.sin(t * 3.5) * 0.15
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z = -1.2 - Math.sin(t * 7 + Math.PI) * 0.4
            rightArmRef.current.rotation.x = Math.sin(t * 3.5 + Math.PI) * 0.15
          }
          if (leftForearmRef.current) {
            leftForearmRef.current.rotation.x = -0.5 + Math.sin(t * 7) * 0.4
          }
          if (rightForearmRef.current) {
            rightForearmRef.current.rotation.x = -0.5 + Math.sin(t * 7 + Math.PI) * 0.4
          }
        } else {
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z = 0.3 + Math.sin(t * 6) * 0.4
            leftArmRef.current.rotation.x = -0.4 + Math.cos(t * 6) * 0.3
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z = -0.3 - Math.sin(t * 6) * 0.4
            rightArmRef.current.rotation.x = -0.4 + Math.cos(t * 6 + Math.PI) * 0.3
          }
          if (leftForearmRef.current) {
            leftForearmRef.current.rotation.x = -0.8 + Math.sin(t * 6) * 0.3
          }
          if (rightForearmRef.current) {
            rightForearmRef.current.rotation.x = -0.8 + Math.cos(t * 6) * 0.3
          }
        }
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(t * 5) * 0.15
          headRef.current.rotation.z = Math.sin(t * 3) * 0.1
        }
      }

      // Shared dance effects
      if (screenRef.current) {
        screenRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 8) * 0.8
      }
      if (antennaLightRef.current) {
        antennaLightRef.current.material.emissiveIntensity = 2 + Math.sin(t * 10) * 1.5
      }
      if (leftEyeRef.current) {
        leftEyeRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 6) * 0.5
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 6) * 0.5
      }
      if (earLeftRef.current) {
        earLeftRef.current.material.emissiveIntensity = 1 + Math.sin(t * 8) * 0.5
      }
      if (earRightRef.current) {
        earRightRef.current.material.emissiveIntensity = 1 + Math.sin(t * 8) * 0.5
      }

    } else {
      // =====================
      //   IDLE STATE
      // =====================
      idleTimerRef.current += delta
      if (idleTimerRef.current > 3.5) {
        idleTimerRef.current = 0
        setIdlePhase((prev) => (prev + 1) % 4)
      }

      groupRef.current.position.y = 0
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15

      if (torsoRef.current) {
        torsoRef.current.rotation.y = 0
        torsoRef.current.rotation.z = 0
        torsoRef.current.rotation.x = Math.sin(t * 1.2) * 0.015
      }

      if (headRef.current) {
        headRef.current.rotation.z = 0
        headRef.current.rotation.x = 0
        if (idlePhase === 1) {
          headRef.current.rotation.y = Math.sin(t * 1.5) * 0.35
        } else if (idlePhase === 3) {
          headRef.current.rotation.y = -Math.sin(t * 1.5) * 0.35
        } else {
          headRef.current.rotation.y = Math.sin(t * 0.6) * 0.08
        }
      }

      // Right arm: wave
      if (rightArmRef.current) {
        if (idlePhase === 0 || idlePhase === 2) {
          rightArmRef.current.rotation.z = -1.8 + Math.sin(t * 5) * 0.3
          rightArmRef.current.rotation.x = 0
        } else {
          rightArmRef.current.rotation.z = -0.08 + Math.sin(t * 1) * 0.04
          rightArmRef.current.rotation.x = 0
        }
      }
      if (rightForearmRef.current) {
        if (idlePhase === 0 || idlePhase === 2) {
          rightForearmRef.current.rotation.x = -0.5 + Math.sin(t * 6) * 0.4
        } else {
          rightForearmRef.current.rotation.x = 0
        }
      }

      // Left arm: beckon or rest
      if (leftArmRef.current) {
        if (idlePhase === 2) {
          leftArmRef.current.rotation.z = 1.0 + Math.sin(t * 4) * 0.25
          leftArmRef.current.rotation.x = Math.sin(t * 4) * 0.15
        } else {
          leftArmRef.current.rotation.z = 0.08 + Math.sin(t * 1) * 0.04
          leftArmRef.current.rotation.x = 0
        }
      }
      if (leftForearmRef.current) {
        if (idlePhase === 2) {
          leftForearmRef.current.rotation.x = -0.8 + Math.sin(t * 4) * 0.3
        } else {
          leftForearmRef.current.rotation.x = 0
        }
      }

      // Idle glow
      if (screenRef.current) {
        screenRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.2
      }
      if (antennaLightRef.current) {
        antennaLightRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.3
      }
      if (leftEyeRef.current) {
        leftEyeRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.material.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2
      }
      if (earLeftRef.current) {
        earLeftRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15
      }
      if (earRightRef.current) {
        earRightRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15
      }
    }
  })

  const bodyWhite = '#f0f0f0'
  const bodyGray = '#d0d0d0'
  const darkGray = '#555555'

  return (
    <group ref={groupRef}>
      <group ref={torsoRef}>

        {/* ========== HEAD ========== */}
        <group ref={headRef} position={[0, 1.25, 0]}>
          {/* Head — rounded capsule shape */}
          <mesh>
            <sphereGeometry args={[0.32, 32, 32]} />
            <MetalMaterial color={bodyWhite} roughness={0.2} metalness={0.3} />
          </mesh>

          {/* Face plate — darker front panel */}
          <mesh position={[0, -0.02, 0.2]}>
            <planeGeometry args={[0.42, 0.32]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.5} />
          </mesh>

          {/* Left eye — glowing oval */}
          <mesh ref={leftEyeRef} position={[-0.1, 0.02, 0.28]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <GlowMaterial color={accentColor} intensity={0.8} />
          </mesh>

          {/* Right eye */}
          <mesh ref={rightEyeRef} position={[0.1, 0.02, 0.28]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <GlowMaterial color={accentColor} intensity={0.8} />
          </mesh>

          {/* Mouth — LED strip smile */}
          <mesh position={[0, -0.1, 0.28]}>
            <boxGeometry args={[0.15, 0.02, 0.01]} />
            <GlowMaterial color={dancing ? '#ffdd59' : accentColor} intensity={0.6} />
          </mesh>
          {/* Smile curve left */}
          <mesh position={[-0.09, -0.085, 0.28]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.05, 0.02, 0.01]} />
            <GlowMaterial color={dancing ? '#ffdd59' : accentColor} intensity={0.6} />
          </mesh>
          {/* Smile curve right */}
          <mesh position={[0.09, -0.085, 0.28]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.05, 0.02, 0.01]} />
            <GlowMaterial color={dancing ? '#ffdd59' : accentColor} intensity={0.6} />
          </mesh>

          {/* Ear sensors — left */}
          <mesh ref={earLeftRef} position={[-0.33, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
            <GlowMaterial color={accentColor} intensity={0.3} />
          </mesh>
          {/* Ear sensors — right */}
          <mesh ref={earRightRef} position={[0.33, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
            <GlowMaterial color={accentColor} intensity={0.3} />
          </mesh>

          {/* Antenna — thin rod with light */}
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
            <MetalMaterial color="#aaaaaa" />
          </mesh>
          <mesh ref={antennaLightRef} position={[0, 0.47, 0]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <GlowMaterial color={dancing ? '#ff3838' : accentColor} intensity={0.8} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
          <MetalMaterial color={darkGray} />
        </mesh>
        <Joint position={[0, 0.9, 0]} size={0.06} />

        {/* ========== TORSO ========== */}
        {/* Upper chest — rounded */}
        <mesh position={[0, 0.6, 0]}>
          <capsuleGeometry args={[0.28, 0.3, 16, 32]} />
          <MetalMaterial color={bodyWhite} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Chest screen / display panel */}
        <mesh ref={screenRef} position={[0, 0.6, 0.25]}>
          <planeGeometry args={[0.32, 0.25]} />
          <GlowMaterial color={accentColor} intensity={0.6} />
        </mesh>
        {/* Screen border */}
        <mesh position={[0, 0.6, 0.245]}>
          <planeGeometry args={[0.36, 0.29]} />
          <meshStandardMaterial color="#222222" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Lower torso / waist */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.25, 16]} />
          <MetalMaterial color={bodyGray} roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Waist accent ring */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.23, 0.015, 8, 32]} />
          <GlowMaterial color={accentColor} intensity={0.3} />
        </mesh>

        {/* ========== LEFT ARM ========== */}
        <group ref={leftArmRef} position={[-0.42, 0.7, 0]}>
          <Joint position={[0, 0, 0]} size={0.07} />
          {/* Upper arm */}
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
            <MetalMaterial color={bodyWhite} />
          </mesh>
          {/* Elbow joint */}
          <Joint position={[0, -0.35, 0]} size={0.06} />
          {/* Forearm */}
          <group ref={leftForearmRef} position={[0, -0.35, 0]}>
            <mesh position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.05, 0.18, 8, 16]} />
              <MetalMaterial color={bodyGray} />
            </mesh>
            {/* Hand — sphere */}
            <mesh position={[0, -0.35, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <MetalMaterial color={darkGray} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Finger hint */}
            <mesh position={[0, -0.4, 0.02]}>
              <boxGeometry args={[0.04, 0.06, 0.03]} />
              <MetalMaterial color={darkGray} />
            </mesh>
          </group>
        </group>

        {/* ========== RIGHT ARM ========== */}
        <group ref={rightArmRef} position={[0.42, 0.7, 0]}>
          <Joint position={[0, 0, 0]} size={0.07} />
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
            <MetalMaterial color={bodyWhite} />
          </mesh>
          <Joint position={[0, -0.35, 0]} size={0.06} />
          <group ref={rightForearmRef} position={[0, -0.35, 0]}>
            <mesh position={[0, -0.16, 0]}>
              <capsuleGeometry args={[0.05, 0.18, 8, 16]} />
              <MetalMaterial color={bodyGray} />
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <MetalMaterial color={darkGray} roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, -0.4, 0.02]}>
              <boxGeometry args={[0.04, 0.06, 0.03]} />
              <MetalMaterial color={darkGray} />
            </mesh>
          </group>
        </group>

      </group>

      {/* ========== BASE / LEGS (Fixed — never moves) ========== */}
      {/* Hip section */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.12, 16]} />
        <MetalMaterial color={darkGray} />
      </mesh>

      {/* Left leg */}
      <group position={[-0.14, -0.15, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
          <MetalMaterial color={bodyGray} />
        </mesh>
        <Joint position={[0, -0.4, 0]} size={0.055} />
        {/* Lower leg */}
        <mesh position={[0, -0.55, 0]}>
          <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
          <MetalMaterial color={bodyWhite} />
        </mesh>
        {/* Foot — flat pad */}
        <mesh position={[0, -0.72, 0.02]}>
          <boxGeometry args={[0.14, 0.04, 0.2]} />
          <MetalMaterial color={darkGray} roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Foot accent */}
        <mesh position={[0, -0.71, 0.02]}>
          <boxGeometry args={[0.12, 0.02, 0.18]} />
          <GlowMaterial color={accentColor} intensity={0.15} />
        </mesh>
      </group>

      {/* Right leg */}
      <group position={[0.14, -0.15, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
          <MetalMaterial color={bodyGray} />
        </mesh>
        <Joint position={[0, -0.4, 0]} size={0.055} />
        <mesh position={[0, -0.55, 0]}>
          <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
          <MetalMaterial color={bodyWhite} />
        </mesh>
        <mesh position={[0, -0.72, 0.02]}>
          <boxGeometry args={[0.14, 0.04, 0.2]} />
          <MetalMaterial color={darkGray} roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.71, 0.02]}>
          <boxGeometry args={[0.12, 0.02, 0.18]} />
          <GlowMaterial color={accentColor} intensity={0.15} />
        </mesh>
      </group>
    </group>
  )
}
