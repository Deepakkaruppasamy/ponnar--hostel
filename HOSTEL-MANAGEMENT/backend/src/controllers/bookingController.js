import { BookingRequest } from '../models/BookingRequest.js';
import { Room } from '../models/Room.js';
import { User } from '../models/User.js';

export async function createBookingRequest(req, res) {
    const { desiredRoomNumber, roommatesRollNumbers = [], preferences = {} } = req.body;
    if (!desiredRoomNumber) return res.status(400).json({ message: 'desiredRoomNumber required' });
    const studentId = req.user._id;
    const booking = await BookingRequest.create({ student: studentId, desiredRoomNumber, roommatesRollNumbers, preferences });
    res.status(201).json(booking);
}

export async function listMyRequests(req, res) {
    const studentId = req.user._id;
    const requests = await BookingRequest.find({ student: studentId }).sort({ createdAt: -1 }).lean();
    res.json(requests);
}

export async function listAllRequests(_req, res) {
    const requests = await BookingRequest.find({}).populate('student', 'name email rollNumber').sort({ createdAt: -1 }).lean();
    res.json(requests);
}

export async function approveRequest(req, res) {
    const { id } = req.params;
    const request = await BookingRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const room = await Room.findOne({ roomNumber: request.desiredRoomNumber });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // gather student and roommates by roll number
    const mainStudent = await User.findById(request.student);
    const roommates = await User.find({ rollNumber: { $in: request.roommatesRollNumbers || [] } });
    const occupants = [mainStudent, ...roommates].map((u) => u._id);

    if (room.occupants.length + occupants.length > room.capacity) {
        return res.status(400).json({ message: 'Room capacity exceeded' });
    }

    room.occupants.push(...occupants);
    await room.save();

    request.status = 'approved';
    await request.save();
    try {
        (await
            import ('../realtime/socket.js')).io().emit('rooms:update'); } catch {}
    res.json({ message: 'Approved', room });
}

export async function rejectRequest(req, res) {
    const { id } = req.params;
    const request = await BookingRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    request.status = 'rejected';
    request.remarks = req.body.remarks || '';
    await request.save();
    try {
        (await
            import ('../realtime/socket.js')).io().emit('booking:update'); } catch {}
    res.json({ message: 'Rejected' });
}

export async function waitlistRequest(req, res) {
    const { id } = req.params;
    const request = await BookingRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    request.status = 'waitlisted';
    await request.save();
    res.json({ message: 'Waitlisted' });
}