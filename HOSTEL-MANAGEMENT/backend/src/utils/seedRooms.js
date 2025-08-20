import dotenv from 'dotenv';
dotenv.config();
import { connectToDatabase } from '../config/db.js';
import { Room } from '../models/Room.js';

async function run() {
  await connectToDatabase();
  const count = await Room.countDocuments();
  if (count >= 100) {
    console.log('Rooms already seeded');
    process.exit(0);
  }
  const rooms = [];
  let roomNumber = 101;
  for (let floor = 1; floor <= 3; floor += 1) {
    for (let i = 0; i < 34 && rooms.length + count < 100; i += 1) {
      rooms.push({ roomNumber, floor, hostelName: 'Ponnar', capacity: 2, occupants: [] });
      roomNumber += 1;
    }
    roomNumber = (floor + 1) * 100 + 1;
  }
  await Room.insertMany(rooms);
  console.log(`Seeded ${rooms.length} rooms`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


