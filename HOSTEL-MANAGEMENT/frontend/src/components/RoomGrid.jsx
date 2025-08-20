export default function RoomGrid({ rooms, onSelect, selectedRoomNumber, filterFloor }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {rooms
        .filter((r) => (filterFloor ? r.floor === filterFloor : true))
        .map((room) => {
        const availableSlots = room.capacity - (room.occupants?.length || 0)
        const isAvailable = availableSlots > 0
          const isSelected = selectedRoomNumber === room.roomNumber
        return (
          <button
            key={room.roomNumber}
            onClick={() => isAvailable && onSelect?.(room)}
            className={`rounded p-3 text-left border shadow-sm transition relative ${isAvailable ? 'bg-available/10 hover:bg-available/20 border-available' : 'bg-booked/10 border-booked text-gray-700 cursor-not-allowed'} ${isSelected ? 'ring-4 ring-brand' : ''}`}
          >
            <div className="font-semibold">Room {room.roomNumber}</div>
            <div className="text-xs text-gray-600">Floor {room.floor} • Ponnar</div>
            <div className="text-sm mt-1">{isAvailable ? `${availableSlots} available` : 'Booked'}</div>
          </button>
        )
      })}
    </div>
  )
}


