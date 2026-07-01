import mongoose from 'mongoose';

const AttendeeSchema = new mongoose.Schema(
  {
    ref:      { type: String, required: true, unique: true, index: true },
    fname:    { type: String, required: true, trim: true },
    lname:    { type: String, required: true, trim: true },
    mname:    { type: String, default: '', trim: true },

    // YYYY-MM-DD string (matches HTML date input). Optional on the schema
    // so older records still load, but enforced by the form for new entries.
    birthday: { type: String, default: '' },

    email:    { type: String, default: '', trim: true, lowercase: true, index: true },
    phone:    { type: String, required: true, trim: true },

    rollnum:      { type: String, required: true, trim: true },
    chapter:      { type: String, required: true, trim: true, index: true },
    barAdmission: { type: String, default: '', trim: true },
    category: {
      type: String,
      required: true,
      enum: ['earlybird', 'regular', 'walkin', 'senior'],
      index: true
    },
    dietary:  { type: String, default: '' },

    // Proof of payment
    // For an MVP we accept a base64 dataURL. For production swap this
    // for a URL pointing to S3 / Cloudinary / GCS.
    proofName:    { type: String, default: '' },
    proofType:    { type: String, default: '' },
    proofDataUrl: { type: String, default: null },

    registeredAt:        { type: Date, default: Date.now },
    paid:                { type: Boolean, default: false, index: true },
    checkedIn:           { type: Boolean, default: false, index: true },
    checkedInAt:         { type: Date, default: null },
    certificateIssued:   { type: Boolean, default: false },
    certificateIssuedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

AttendeeSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Attendee = mongoose.model('Attendee', AttendeeSchema);
