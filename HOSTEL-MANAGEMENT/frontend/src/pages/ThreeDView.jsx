import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import gsap from 'gsap'

// Helper to color rooms by dashboard-aligned status
const STATUS_COLORS = {
  available: new THREE.Color('#22c55e'),  // green
  booked: new THREE.Color('#ef4444'),     // red
  partial: new THREE.Color('#38bdf8'),    // sky (partially filled)
  maintenance: new THREE.Color('#f59e0b') // amber
}

function normalizeStatus(raw, occ, cap) {
  const v = String(raw || '').toLowerCase()
  if (v === 'booked' || v === 'partial' || v === 'available' || v === 'maintenance') return v
  const o = Number(occ || 0)
  const c = Number(cap || 0)
  if (v === 'occupied' || v === 'full') return 'booked'
  if (c > 0 && o >= c) return 'booked'
  if (o > 0) return 'partial'
  return 'available'
}

// Compute deterministic distribution of rooms across buildings and floors
function buildDistribution(totalRooms = 331) {
  // Split between 2 buildings roughly equally: 166 and 165
  const b1 = Math.ceil(totalRooms / 2)
  const b2 = totalRooms - b1
  const perFloor1 = [0, 0, 0]
  const perFloor2 = [0, 0, 0]
  // Spread across 3 floors per building, near-equal
  ;[b1, b2].forEach((rooms, bi) => {
    const base = Math.floor(rooms / 3)
    const rem = rooms % 3
    const arr = [base, base, base]
    for (let i = 0; i < rem; i++) arr[i] += 1
    if (bi === 0) {
      perFloor1.splice(0, 3, ...arr)
    } else {
      perFloor2.splice(0, 3, ...arr)
    }
  })
  return { perFloor1, perFloor2 }
}

// Arrange rooms on each floor into two bands separated by a corridor
// Returns an array of local positions for the given count
function layoutFloor(count, { cols = 11, spacing = 6, rowSpacing = 6, corridorWidth = 10, roomSize = 4 }) {
  const half = Math.ceil(count / 2)
  const sideA = half
  const sideB = count - half

  function gridPositions(n, side) {
    const rows = Math.ceil(n / cols)
    const positions = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        if (idx >= n) break
        const x = (c - (cols - 1) / 2) * spacing
        const zBase = (r - (rows - 1) / 2) * rowSpacing
        const z = side === 'A' ? zBase - (corridorWidth / 2 + roomSize) : zBase + (corridorWidth / 2 + roomSize)
        positions.push(new THREE.Vector3(x, 0, z))
      }
    }
    return positions
  }

  const a = gridPositions(sideA, 'A')
  const b = gridPositions(sideB, 'B')
  return [...a, ...b]
}

// Simple popup component
function RoomPopup({ info, onClose }) {
  if (!info) return null
  const availability = info.status === 'booked'
    ? `Booked${Number.isFinite(info.occupants) && Number.isFinite(info.capacity) ? ` (${info.occupants}/${info.capacity})` : ''}`
    : info.status === 'maintenance'
      ? 'Maintenance'
      : info.status === 'partial'
        ? `${info.occupants}/${info.capacity} occupied`
        : `${Math.max(info.capacity - (info.occupants || 0), 0)} available`
  return (
    <div className="fixed top-20 right-6 z-40 rounded-xl shadow-xl p-4 backdrop-blur bg-white/80 dark:bg-black/60 border border-zinc-200/60 dark:border-white/10">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🏠</div>
        <div>
          <div className="font-semibold">Room {info.roomNumber}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">Floor {info.floor} • {info.hostelName ? (String(info.hostelName).toLowerCase().includes('hostel') ? info.hostelName : `${info.hostelName} Hostel`) : 'Ponnar Hostel'}</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">{availability}</div>
        </div>
      </div>
      <div className="mt-3 text-right">
        <button className="btn-ghost btn-sm rounded-lg" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default function ThreeDView() {
  const mountRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let renderer, scene, camera, controls, raycaster, frame = 0
    const pointer = new THREE.Vector2()
    const hovered = { id: -1, scale: 1 }

    const host = mountRef.current
    const width = host.clientWidth
    const height = Math.max(host.clientHeight, 520)

    scene = new THREE.Scene()
    scene.background = new THREE.Color('#e5e7eb') // zinc-200
    scene.fog = new THREE.Fog(0xe5e7eb, 200, 800)

    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000)

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.outputColorSpace = THREE.SRGBColorSpace
    host.appendChild(renderer.domElement)

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8b8b8b, 0.6)
    scene.add(hemi)
    const amb = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(amb)
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(70, 120, 60)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.near = 1
    dir.shadow.camera.far = 600
    dir.shadow.camera.left = -200
    dir.shadow.camera.right = 200
    dir.shadow.camera.top = 200
    dir.shadow.camera.bottom = -200
    scene.add(dir)

    // Procedural sky
    const sky = new Sky()
    sky.scale.setScalar(10000)
    scene.add(sky)
    const sun = new THREE.Vector3()
    const turbidity = 8
    const rayleigh = 1.2
    const mieCoefficient = 0.005
    const mieDirectionalG = 0.8
    const elevation = 45
    const azimuth = 135
    const uniforms = sky.material.uniforms
    uniforms['turbidity'].value = turbidity
    uniforms['rayleigh'].value = rayleigh
    uniforms['mieCoefficient'].value = mieCoefficient
    uniforms['mieDirectionalG'].value = mieDirectionalG
    const phi = THREE.MathUtils.degToRad(90 - elevation)
    const theta = THREE.MathUtils.degToRad(azimuth)
    sun.setFromSphericalCoords(1, phi, theta)
    uniforms['sunPosition'].value.copy(sun)

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 400),
      new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 1, metalness: 0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = true
    scene.add(ground)
    const grid = new THREE.GridHelper(600, 60, 0xd1d5db, 0xe5e7eb)
    grid.position.y = -1.99
    scene.add(grid)

    // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.target.set(0, 40, 0)

    // Camera start and intro fly-in
    camera.position.set(-220, 160, 240)
    gsap.to(camera.position, { x: -140, y: 140, z: 180, duration: 1.8, ease: 'power2.out' })

    raycaster = new THREE.Raycaster()

    // Fetch status (best-effort)
    const statusMap = new Map() // roomNumber -> status
    const roomsData = [] // exact rooms from backend
    ;(async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
        const url = `${base}/rooms/summary`
        const r = await fetch(url)
        if (r.ok) {
          const data = await r.json()
          const arr = Array.isArray(data.rooms) ? data.rooms : []
          // Save exact rooms list (limit to 331 if more)
          arr.slice(0, 331).forEach((it) => {
            roomsData.push(it)
            const st = normalizeStatus(it.status, it.occupantsCount, it.capacity)
            statusMap.set(it.roomNumber, st)
          })
        } else {
          console.error(`[3D] Failed to fetch rooms summary (${r.status}) from`, url)
        }
      } catch (e) {
        console.error('[3D] Error fetching rooms summary:', e)
      } finally {
        // Ensure exactly 331 rooms
        const TARGET = 331
        if (roomsData.length < TARGET) {
          const existing = new Set(roomsData.map(r => Number(r.roomNumber)))
          let index = 1
          while (roomsData.length < TARGET) {
            for (let floor = 1; floor <= 3 && roomsData.length < TARGET; floor++) {
              const num = floor * 100 + index // 101,201,301,102,...
              if (!existing.has(num)) {
                roomsData.push({ roomNumber: num, capacity: 2, occupantsCount: 0, status: 'available', floor, hostelName: 'Ponnar Hostel', building: 1 })
                existing.add(num)
              }
            }
            index += 1
            if (index > 2000) break
          }
        } else if (roomsData.length > TARGET) {
          roomsData.length = TARGET
        }
        buildCampus()
        setLoading(false)
      }
    })()

    // Build two buildings with 3 floors each
    function buildCampus() {
      const roomSize = 4
      const boxGeo = new THREE.BoxGeometry(roomSize, roomSize, roomSize)
      const mat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.6, metalness: 0.1 })

      // Group for fade-in
      const campus = new THREE.Group()
      scene.add(campus)

      // Partition exact rooms into two buildings and 3 floors
      const list = roomsData.slice(0, 331)
      // If backend provides building/floor, use them; otherwise, derive
      function deriveBuilding(r, idx) {
        if (typeof r.building === 'number') return r.building
        // fallback: first half -> building 1, second -> 2
        return idx < Math.ceil(list.length / 2) ? 1 : 2
      }
      function deriveFloor(r) {
        if (typeof r.floor === 'number') return Math.max(1, Math.min(3, r.floor))
        // try infer from roomNumber, e.g., 1xx -> 1
        const n = Number(String(r.roomNumber)[0])
        if (!Number.isNaN(n) && n >= 1 && n <= 3) return n
        // fallback: distribute by modulo
        // fallback: based on hash/index
        return ((typeof r.roomNumber === 'number' ? r.roomNumber : 0) % 3) + 1
      }
      const buildingBuckets = { 1: { 1: [], 2: [], 3: [] }, 2: { 1: [], 2: [], 3: [] } }
      list.forEach((r, idx) => {
        const b = deriveBuilding(r, idx)
        const f = deriveFloor(r)
        const st = statusMap.get(r.roomNumber) || 'available'
        buildingBuckets[b]?.[f]?.push({ ...r, state: st, floor: f, building: b })
      })
      // Merge both buildings into a single building across 3 floors
      const singleBuckets = { 1: [], 2: [], 3: [] }
      for (let f = 1; f <= 3; f++) {
        singleBuckets[f] = [
          ...buildingBuckets[1][f].slice().sort((a,b) => a.roomNumber - b.roomNumber),
          ...buildingBuckets[2][f].slice().sort((a,b) => a.roomNumber - b.roomNumber),
        ]
      }
      const perFloorSingle = [1,2,3].map(f => singleBuckets[f].length)

      // Helper to build a building at x offset
      function buildBuilding(xOffset, floorsCounts, sourceBuckets) {
        const totalRooms = floorsCounts.reduce((a, b) => a + b, 0)
        const mesh = new THREE.InstancedMesh(boxGeo, mat, totalRooms)
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        const colors = new Float32Array(totalRooms * 3)
        mesh.castShadow = true
        mesh.receiveShadow = true

        let instanceId = 0
        const yFloorGap = 16
        const buildingGroup = new THREE.Group()
        buildingGroup.position.x = xOffset

        // Keep mapping of id -> room info
        const info = []

        for (let f = 0; f < 3; f++) {
          const count = floorsCounts[f]
          const positions = layoutFloor(count, { cols: 11, spacing: 6, rowSpacing: 6, corridorWidth: 10, roomSize })
          const y = f * yFloorGap

          // Simple floor slab
          const slab = new THREE.Mesh(
            new THREE.BoxGeometry(80, 1, 120),
            new THREE.MeshStandardMaterial({ color: '#d1d5db', roughness: 1 }) // zinc-300
          )
          slab.position.set(0, y - roomSize / 2 - 1, 0)
          slab.receiveShadow = true
          buildingGroup.add(slab)

          // Corridor strip (visual): darker rectangle along center
          const corridor = new THREE.Mesh(
            new THREE.BoxGeometry(82, 0.6, 10),
            new THREE.MeshStandardMaterial({ color: '#9ca3af', roughness: 1 })
          )
          corridor.position.set(0, y - roomSize / 2 - 0.7, 0)
          corridor.receiveShadow = true
          buildingGroup.add(corridor)

          // Sort rooms to keep stable visual ordering
          const roomsForThisFloor = (sourceBuckets[f + 1] || []).slice()
          for (let i = 0; i < positions.length; i++) {
            const p = positions[i]
            const m = new THREE.Matrix4()
            m.compose(new THREE.Vector3(p.x, y, p.z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1))
            mesh.setMatrixAt(instanceId, m)

            const room = roomsForThisFloor[i]
            const roomNumber = room ? room.roomNumber : Number(`1${f + 1}${String(i + 1).padStart(2, '0')}`)
            const status = room ? normalizeStatus(room.state, room.occupantsCount, room.capacity) : (statusMap.get(roomNumber) || 'available')
            const c = STATUS_COLORS[status] || STATUS_COLORS.available
            colors[instanceId * 3 + 0] = c.r
            colors[instanceId * 3 + 1] = c.g
            colors[instanceId * 3 + 2] = c.b

            const capacity = Number.isFinite(room?.capacity) ? room.capacity : 2
            const occupants = Number.isFinite(room?.occupantsCount) ? room.occupantsCount : (status === 'booked' ? capacity : status === 'partial' ? Math.max(1, Math.min(1, capacity)) : 0)
            const hostelName = room?.hostelName || 'Ponnar'
            info.push({ id: instanceId, building: 1, floor: f + 1, roomNumber, status, capacity, occupants, hostelName })
            instanceId++
          }
        }

        mesh.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3))
        mesh.material.vertexColors = true
        buildingGroup.add(mesh)

        // Building shell (wireframe facade)
        const floorsHeight = yFloorGap * 3
        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(90, floorsHeight + 6, 130),
          new THREE.MeshBasicMaterial({ color: '#9ca3af', wireframe: true, transparent: true, opacity: 0.25 })
        )
        shell.position.set(0, (floorsHeight - roomSize) / 2, 0)
        buildingGroup.add(shell)

        // Outline/edges glow proxy using transparent bigger box on hover (one shared mesh)
        const hoverMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.15 }) // sky-400 glow
        const hoverGeo = new THREE.BoxGeometry(roomSize * 1.2, roomSize * 1.2, roomSize * 1.2)
        const hoverMesh = new THREE.Mesh(hoverGeo, hoverMat)
        hoverMesh.visible = false
        buildingGroup.add(hoverMesh)

        campus.add(buildingGroup)

        return { mesh, info, hoverMesh, group: buildingGroup }
      }

      // Single centered building
      const single = buildBuilding(0, perFloorSingle, singleBuckets)

      // Fade-in animation
      campus.children.forEach((g) => {
        g.children.forEach((child) => {
          child.visible = false
          gsap.to(child, { duration: 0.6, delay: Math.random() * 0.3, onStart: () => (child.visible = true) })
        })
      })

      // Events
      function onPointerMove(e) {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      }
      function onClick() {
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(single.mesh)
        if (intersects.length > 0) {
          const id = intersects[0].instanceId
          const picked = single.info[id]
          const mat = new THREE.Matrix4()
          single.mesh.getMatrixAt(id, mat)
          const pos = new THREE.Vector3().setFromMatrixPosition(mat)
          const worldPos = pos.clone().applyMatrix4(single.group.matrixWorld)
          const to = worldPos.clone().add(new THREE.Vector3(12, 10, 12))
          gsap.to(camera.position, { x: to.x, y: to.y, z: to.z, duration: 1.0, ease: 'power2.out' })
          gsap.to(controls.target, { x: worldPos.x, y: worldPos.y, z: worldPos.z, duration: 1.0, ease: 'power2.out', onUpdate: () => controls.update() })
          setSelected(picked)
        }
      }

      renderer.domElement.addEventListener('mousemove', onPointerMove)
      renderer.domElement.addEventListener('click', onClick)

      // Render loop
      const tempMatrix = new THREE.Matrix4()
      function animate() {
        frame = requestAnimationFrame(animate)
        controls.update()

        // Hover detection on single building
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(single.mesh)
        if (intersects.length > 0) {
          const id = intersects[0].instanceId
          if (hovered.id !== id) {
            if (hovered.id !== -1) {
              single.mesh.getMatrixAt(hovered.id, tempMatrix)
              const posPrev = new THREE.Vector3().setFromMatrixPosition(tempMatrix)
              const rotPrev = new THREE.Quaternion()
              tempMatrix.decompose(posPrev, rotPrev, new THREE.Vector3())
              const mPrev = new THREE.Matrix4().compose(posPrev, rotPrev, new THREE.Vector3(1, 1, 1))
              single.mesh.setMatrixAt(hovered.id, mPrev)
              single.mesh.instanceMatrix.needsUpdate = true
            }
            hovered.id = id
          }
          single.mesh.getMatrixAt(id, tempMatrix)
          const pos = new THREE.Vector3().setFromMatrixPosition(tempMatrix)
          const rot = new THREE.Quaternion()
          tempMatrix.decompose(pos, rot, new THREE.Vector3())
          const m = new THREE.Matrix4().compose(pos, rot, new THREE.Vector3(1.12, 1.12, 1.12))
          single.mesh.setMatrixAt(id, m)
          single.mesh.instanceMatrix.needsUpdate = true

          const worldPos = pos.clone().applyMatrix4(single.group.matrixWorld)
          single.hoverMesh.position.copy(worldPos)
          single.hoverMesh.visible = true
        } else {
          if (hovered.id !== -1) {
            single.mesh.getMatrixAt(hovered.id, tempMatrix)
            const posPrev = new THREE.Vector3().setFromMatrixPosition(tempMatrix)
            const rotPrev = new THREE.Quaternion()
            tempMatrix.decompose(posPrev, rotPrev, new THREE.Vector3())
            const mPrev = new THREE.Matrix4().compose(posPrev, rotPrev, new THREE.Vector3(1, 1, 1))
            single.mesh.setMatrixAt(hovered.id, mPrev)
            single.mesh.instanceMatrix.needsUpdate = true
            hovered.id = -1
          }
          single.hoverMesh.visible = false
        }

        renderer.render(scene, camera)
      }
      animate()

      // Cleanup
      return () => {
        cancelAnimationFrame(frame)
        renderer.domElement.removeEventListener('mousemove', onPointerMove)
        renderer.domElement.removeEventListener('click', onClick)
        renderer.dispose()
        host.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="min-h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">3D View • Ponnar Hostel</h1>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{loading ? 'Loading scene…' : 'Drag to rotate • Scroll to zoom • Right-drag to pan'}</div>
      </div>
      <div ref={mountRef} className="w-full h-[70vh] rounded-xl overflow-hidden border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-black" />
      <RoomPopup info={selected} onClose={() => setSelected(null)} />
      <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Colors: Green=Available, Red=Booked, Sky=Partial, Amber=Maintenance. Uses instanced meshes for performance.</div>
    </div>
  )
}
