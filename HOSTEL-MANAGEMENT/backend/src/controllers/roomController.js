import { Room } from '../models/Room.js';

export async function listRooms(req, res) {
  const rooms = await Room.find({}).sort({ roomNumber: 1 }).lean();
  res.json(rooms);
}

export async function getRoomSummary(_req, res) {
  const rooms = await Room.find({}, { roomNumber: 1, capacity: 1, occupants: 1, status: 1, floor: 1, hostelName: 1, building: 1 }).sort({ roomNumber: 1 }).lean()
  const summary = rooms.map(r => ({
    roomNumber: r.roomNumber,
    capacity: r.capacity,
    occupantsCount: Array.isArray(r.occupants) ? r.occupants.length : 0,
    status: r.status || 'available',
    floor: typeof r.floor === 'number' ? r.floor : undefined,
    hostelName: r.hostelName || undefined,
    building: r.building || undefined,
  }))
  // Pad to HOSTEL_TOTAL_ROOMS if fewer exist
  const TARGET = Number(process.env.HOSTEL_TOTAL_ROOMS) || 331
  if (summary.length < TARGET) {
    const existing = new Set(summary.map(r => Number(r.roomNumber)))
    let seq = 1
    // generate in floor cycles: 1xx, 2xx, 3xx
    while (summary.length < TARGET) {
      for (let floor = 1; floor <= 3 && summary.length < TARGET; floor++) {
        const num = floor * 100 + seq // 101, 201, 301, 102, 202, 302, ...
        if (!existing.has(num)) {
          summary.push({
            roomNumber: num,
            capacity: 2,
            occupantsCount: 0,
            status: 'available',
            floor,
            hostelName: 'Ponnar Hostel',
            building: floor >= 3 ? 2 : 1,
          })
          existing.add(num)
        }
      }
      seq++
      if (seq > 2000) break // safety guard
    }
  }
  res.json({ rooms: summary.slice(0, TARGET) })
}

export async function createRoomsIfMissing(req, res) {
  // Admin only route. Creates 100 rooms across 3 floors: 1xx, 2xx, 3xx
  const existingCount = await Room.countDocuments();
  if (existingCount >= 100) return res.json({ created: 0, message: 'Rooms already seeded' });
  const rooms = [];
  let roomNumber = 101;
  for (let floor = 1; floor <= 3; floor += 1) {
    for (let i = 0; i < 34 && rooms.length + existingCount < 100; i += 1) {
      rooms.push({ roomNumber, floor, hostelName: 'Ponnar', capacity: 2, occupants: [] });
      roomNumber += 1;
    }
    // align next floor to x01
    roomNumber = (floor + 1) * 100 + 1;
  }
  const created = await Room.insertMany(rooms);
  res.status(201).json({ created: created.length });
}

export async function getRoomStats(_req, res) {
  const [dbTotalRooms, occupiedRoomsArr, fullyBookedRoomsArr] = await Promise.all([
    Room.countDocuments({}),
    Room.aggregate([
      {
        $project: {
          booked: { $gt: [{ $size: { $ifNull: ['$occupants', []] } }, 0] },
        },
      },
      { $match: { booked: true } },
      { $count: 'count' },
    ]),
    Room.aggregate([
      {
        $project: {
          full: { $gte: [{ $size: { $ifNull: ['$occupants', []] } }, '$capacity'] },
        },
      },
      { $match: { full: true } },
      { $count: 'count' },
    ]),
  ])
  const bookedRooms = occupiedRoomsArr?.[0]?.count || 0
  const fullyBookedRooms = fullyBookedRoomsArr?.[0]?.count || 0
  const configuredTotal = Number(process.env.HOSTEL_TOTAL_ROOMS || process.env.TOTAL_ROOMS)
  const totalRooms = Number.isFinite(configuredTotal) && configuredTotal > 0 ? configuredTotal : dbTotalRooms
  res.json({ totalRooms, bookedRooms, fullyBookedRooms, availableRooms: Math.max(totalRooms - bookedRooms, 0) })
}


