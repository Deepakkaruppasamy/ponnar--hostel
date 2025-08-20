import { Room } from '../models/Room.js';
import { Complaint } from '../models/Complaint.js';
import { Invoice } from '../models/Invoice.js';
import { MealRSVP } from '../models/MealRSVP.js';
import { HousekeepingLog } from '../models/HousekeepingLog.js';

export async function getAnalytics(req, res) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const [rooms, unresolvedComplaints, invoices, todayRSVP, hkCompleted, hkScheduled] = await Promise.all([
    Room.find({}).lean(),
    Complaint.countDocuments({ status: { $ne: 'resolved' } }),
    Invoice.find({}).lean(),
    MealRSVP.aggregate([
      { $match: { date: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, breakfast: { $sum: { $cond: ['$breakfast', 1, 0] } }, lunch: { $sum: { $cond: ['$lunch', 1, 0] } }, dinner: { $sum: { $cond: ['$dinner', 1, 0] } } } },
    ]),
    HousekeepingLog.countDocuments({ status: 'completed', updatedAt: { $gte: startOfDay, $lt: endOfDay } }),
    HousekeepingLog.countDocuments({ status: 'scheduled', updatedAt: { $gte: startOfDay, $lt: endOfDay } }),
  ]);

  const totalCapacity = rooms.reduce((s, r) => s + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((s, r) => s + ((r.occupants?.length) || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Revenue and arrears
  const totalBilled = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const arrears = Math.max(totalBilled - totalPaid, 0);

  const rsvp = todayRSVP?.[0] || { breakfast: 0, lunch: 0, dinner: 0 };

  res.json({
    occupancy: { totalCapacity, totalOccupied, rate: occupancyRate },
    complaints: { unresolved: unresolvedComplaints },
    revenue: { totalBilled, totalPaid, arrears },
    mess: { today: rsvp },
    housekeeping: { completedToday: hkCompleted, scheduledToday: hkScheduled },
  });
}
