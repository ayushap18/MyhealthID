import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },
  specializations: [{
    type: String,
    enum: [
      'General',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Oncology',
      'Emergency',
      'Trauma',
      'Surgery',
      'ICU',
      'Gynecology',
      'Dermatology',
      'Psychiatry',
      'Ophthalmology',
      'ENT'
    ]
  }],
  facilities: [{
    type: String,
    enum: [
      'Emergency Services',
      'ICU',
      'NICU',
      'Blood Bank',
      'Ambulance',
      'Pharmacy',
      'Lab',
      'X-Ray',
      'MRI',
      'CT Scan',
      'Dialysis',
      'Ventilator'
    ]
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'emergency-only', 'closed'],
    default: 'available'
  },
  emergencyCapacity: {
    total: { type: Number, default: 10 },
    available: { type: Number, default: 10 }
  },
  icuBeds: {
    total: { type: Number, default: 5 },
    available: { type: Number, default: 5 }
  },
  ventilators: {
    total: { type: Number, default: 3 },
    available: { type: Number, default: 3 }
  },
  ambulances: {
    total: { type: Number, default: 2 },
    available: { type: Number, default: 2 }
  },
  operatingHours: {
    open: { type: String, default: '00:00' },
    close: { type: String, default: '23:59' },
    is24x7: { type: Boolean, default: true }
  },
  emergencyContact: {
    phone: String,
    email: String
  },
  wallet: {
    address: String,
    verified: { type: Boolean, default: false }
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

// Index for searching
hospitalSchema.index({ name: 'text', 'address.city': 'text' });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return [addr.street, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(', ');
});

// Method to calculate distance from a point
hospitalSchema.methods.distanceFrom = function(lat, lng) {
  const [hospitalLng, hospitalLat] = this.location.coordinates;
  
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat - hospitalLat);
  const dLng = toRad(lng - hospitalLng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(hospitalLat)) * Math.cos(toRad(lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Static method to find nearby hospitals
hospitalSchema.statics.findNearby = async function(lat, lng, maxDistanceKm = 10, limit = 10) {
  const hospitals = await this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat] // MongoDB uses [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert to meters
      }
    },
    status: { $ne: 'closed' }
  }).limit(limit);

  // Add distance to each hospital
  return hospitals.map(hospital => {
    const hospitalObj = hospital.toObject();
    hospitalObj.distance = hospital.distanceFrom(lat, lng);
    return hospitalObj;
  });
};

export default mongoose.model('Hospital', hospitalSchema);
