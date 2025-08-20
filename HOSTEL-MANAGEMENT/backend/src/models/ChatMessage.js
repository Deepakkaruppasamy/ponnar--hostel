import mongoose from 'mongoose'

const ChatMessageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, index: true },
    text: { type: String, required: true },
    from: { type: String, required: true },
    // Optionally link to user later
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

ChatMessageSchema.index({ room: 1, createdAt: -1 })

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema)
