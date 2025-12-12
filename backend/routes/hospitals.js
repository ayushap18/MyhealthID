import express from 'express';
import Hospital from '../models/Hospital.js';
import { authenticateToken } from '../middleware/auth.js';
import { sentryService } from '../services/sentryService.js';

const router = express.Router();

/**
 * @route GET /api/hospitals/nearby
 * @desc Get hospitals near a location
 * @access Public (or authenticated based on needs)
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseFloat(radius);
    const maxResults = parseInt(limit);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ 
        error: 'Invalid coordinates' 
      });
    }

    // Try to find from database first
    let hospitals = await Hospital.findNearby(latitude, longitude, maxDistance, maxResults);

    // If no hospitals in DB, return demo data
    if (!hospitals || hospitals.length === 0) {
      hospitals = generateDemoHospitals(latitude, longitude);
    }

    // Sort by distance
    hospitals.sort((a, b) => a.distance - b.distance);

    res.json(hospitals);

  } catch (error) {
    sentryService.captureException(error, {
      extra: { 
        route: '/hospitals/nearby',
        query: req.query 
      }
    });
    console.error('Error finding nearby hospitals:', error);
    res.status(500).json({ error: 'Failed to find nearby hospitals' });
  }
});

/**
 * @route GET /api/hospitals/:id
 * @desc Get hospital details by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(hospital);

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to fetch hospital details' });
  }
});

/**
 * @route POST /api/hospitals/register
 * @desc Register a new hospital
 * @access Private (Admin only)
 */
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      registrationNumber,
      address,
      location,
      specializations,
      facilities,
      emergencyContact
    } = req.body;

    // Check if hospital already exists
    const existing = await Hospital.findOne({
      $or: [
        { email },
        { registrationNumber }
      ]
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Hospital with this email or registration number already exists' 
      });
    }

    const hospital = new Hospital({
      name,
      email,
      phone,
      registrationNumber,
      address,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat] // MongoDB: [longitude, latitude]
      },
      specializations,
      facilities,
      emergencyContact
    });

    await hospital.save();

    sentryService.addBreadcrumb({
      category: 'hospital',
      message: 'New hospital registered',
      data: { hospitalId: hospital._id, name }
    });

    res.status(201).json({
      message: 'Hospital registered successfully',
      hospital
    });

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to register hospital' });
  }
});

/**
 * @route PUT /api/hospitals/:id/status
 * @desc Update hospital status (available, busy, etc.)
 * @access Private
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, emergencyCapacity, icuBeds, ventilators, ambulances } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    if (status) hospital.status = status;
    if (emergencyCapacity) hospital.emergencyCapacity = emergencyCapacity;
    if (icuBeds) hospital.icuBeds = icuBeds;
    if (ventilators) hospital.ventilators = ventilators;
    if (ambulances) hospital.ambulances = ambulances;

    await hospital.save();

    res.json({
      message: 'Hospital status updated',
      hospital
    });

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to update hospital status' });
  }
});

/**
 * @route POST /api/hospitals/:id/emergency-alert
 * @desc Send emergency alert to a hospital
 * @access Private
 */
router.post('/:id/emergency-alert', authenticateToken, async (req, res) => {
  try {
    const { patientId, location, patientInfo, emergencyType } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Calculate distance
    const distance = hospital.distanceFrom(location.lat, location.lng);

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`hospital_${hospital._id}`).emit('emergency_alert', {
        patientId,
        patientInfo,
        location,
        distance: distance.toFixed(2),
        emergencyType: emergencyType || 'medical',
        timestamp: new Date().toISOString()
      });
    }

    sentryService.addBreadcrumb({
      category: 'emergency',
      message: 'Emergency alert sent to hospital',
      data: { 
        hospitalId: hospital._id, 
        patientId,
        distance 
      }
    });

    res.json({
      message: 'Emergency alert sent',
      hospital: {
        id: hospital._id,
        name: hospital.name,
        distance,
        emergencyContact: hospital.emergencyContact
      }
    });

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to send emergency alert' });
  }
});

/**
 * @route POST /api/hospitals/emergency-broadcast
 * @desc Broadcast emergency to multiple nearby hospitals
 * @access Private
 */
router.post('/emergency-broadcast', authenticateToken, async (req, res) => {
  try {
    const { 
      patientId, 
      location, 
      patientInfo, 
      emergencyType,
      hospitalIds,
      radius = 10 
    } = req.body;

    let hospitals;

    if (hospitalIds && hospitalIds.length > 0) {
      // Send to specific hospitals
      hospitals = await Hospital.find({ _id: { $in: hospitalIds } });
    } else {
      // Find nearby hospitals
      hospitals = await Hospital.findNearby(
        location.lat, 
        location.lng, 
        radius, 
        10
      );

      // If no hospitals in DB, use demo data
      if (!hospitals || hospitals.length === 0) {
        hospitals = generateDemoHospitals(location.lat, location.lng);
      }
    }

    const io = req.app.get('io');
    const notifiedHospitals = [];

    for (const hospital of hospitals) {
      // Emit to each hospital
      if (io) {
        io.to(`hospital_${hospital._id}`).emit('emergency_alert', {
          patientId,
          patientInfo,
          location,
          distance: hospital.distance?.toFixed(2) || 'Unknown',
          emergencyType: emergencyType || 'medical',
          timestamp: new Date().toISOString()
        });
      }

      notifiedHospitals.push({
        id: hospital._id,
        name: hospital.name,
        distance: hospital.distance,
        status: 'notified'
      });
    }

    sentryService.addBreadcrumb({
      category: 'emergency',
      message: 'Emergency broadcast sent',
      data: { 
        patientId,
        hospitalCount: notifiedHospitals.length
      }
    });

    res.json({
      message: `Emergency broadcast sent to ${notifiedHospitals.length} hospitals`,
      hospitals: notifiedHospitals
    });

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to broadcast emergency' });
  }
});

/**
 * @route POST /api/hospitals/:id/acknowledge-emergency
 * @desc Hospital acknowledges emergency alert
 * @access Private
 */
router.post('/:id/acknowledge-emergency', authenticateToken, async (req, res) => {
  try {
    const { patientId, eta, dispatchAmbulance } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Notify the patient
    const io = req.app.get('io');
    if (io) {
      io.to(`patient_${patientId}`).emit('emergency_acknowledged', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        eta,
        ambulanceDispatched: dispatchAmbulance || false,
        timestamp: new Date().toISOString()
      });

      if (dispatchAmbulance) {
        // Update ambulance availability
        if (hospital.ambulances.available > 0) {
          hospital.ambulances.available -= 1;
          await hospital.save();
        }

        io.to(`patient_${patientId}`).emit('ambulance_dispatched', {
          hospitalId: hospital._id,
          hospitalName: hospital.name,
          eta,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      message: 'Emergency acknowledged',
      ambulanceDispatched: dispatchAmbulance || false
    });

  } catch (error) {
    sentryService.captureException(error);
    res.status(500).json({ error: 'Failed to acknowledge emergency' });
  }
});

/**
 * Generate demo hospitals based on user location
 */
function generateDemoHospitals(lat, lng) {
  const hospitals = [
    {
      _id: 'demo_hospital_1',
      name: 'AIIMS Delhi',
      distance: 2.3 + Math.random() * 0.5,
      rating: 4.8,
      status: 'available',
      specializations: ['Emergency', 'Cardiology', 'Neurology', 'Trauma'],
      facilities: ['Emergency Services', 'ICU', 'Blood Bank', 'Ambulance'],
      emergencyCapacity: { total: 50, available: 35 },
      icuBeds: { total: 20, available: 8 },
      ambulances: { total: 10, available: 6 },
      emergencyContact: { phone: '+91 11 2658 8500', email: 'emergency@aiims.edu' }
    },
    {
      _id: 'demo_hospital_2',
      name: 'Max Super Speciality Hospital',
      distance: 3.1 + Math.random() * 0.5,
      rating: 4.6,
      status: 'available',
      specializations: ['Emergency', 'Cardiology', 'Orthopedics'],
      facilities: ['Emergency Services', 'ICU', 'Ambulance', 'MRI'],
      emergencyCapacity: { total: 30, available: 22 },
      icuBeds: { total: 15, available: 5 },
      ambulances: { total: 5, available: 3 },
      emergencyContact: { phone: '+91 11 2651 5050', email: 'emergency@maxhealthcare.com' }
    },
    {
      _id: 'demo_hospital_3',
      name: 'Fortis Hospital',
      distance: 4.5 + Math.random() * 0.5,
      rating: 4.5,
      status: 'busy',
      specializations: ['Emergency', 'Oncology', 'Neurology'],
      facilities: ['Emergency Services', 'ICU', 'Lab', 'CT Scan'],
      emergencyCapacity: { total: 25, available: 5 },
      icuBeds: { total: 12, available: 2 },
      ambulances: { total: 4, available: 1 },
      emergencyContact: { phone: '+91 11 4713 5000', email: 'emergency@fortishealthcare.com' }
    },
    {
      _id: 'demo_hospital_4',
      name: 'Apollo Hospital',
      distance: 5.2 + Math.random() * 0.5,
      rating: 4.7,
      status: 'available',
      specializations: ['Emergency', 'Cardiology', 'Surgery', 'Pediatrics'],
      facilities: ['Emergency Services', 'ICU', 'NICU', 'Blood Bank', 'Ambulance'],
      emergencyCapacity: { total: 40, available: 28 },
      icuBeds: { total: 18, available: 10 },
      ambulances: { total: 8, available: 5 },
      emergencyContact: { phone: '+91 11 2987 1234', email: 'emergency@apollohospitals.com' }
    },
    {
      _id: 'demo_hospital_5',
      name: 'Medanta - The Medicity',
      distance: 7.8 + Math.random() * 0.5,
      rating: 4.9,
      status: 'available',
      specializations: ['Emergency', 'Cardiology', 'Neurology', 'Oncology', 'Trauma'],
      facilities: ['Emergency Services', 'ICU', 'Blood Bank', 'Ambulance', 'MRI', 'CT Scan'],
      emergencyCapacity: { total: 60, available: 45 },
      icuBeds: { total: 30, available: 15 },
      ambulances: { total: 12, available: 8 },
      emergencyContact: { phone: '+91 124 4141 414', email: 'emergency@medanta.org' }
    },
    {
      _id: 'demo_hospital_6',
      name: 'Sir Ganga Ram Hospital',
      distance: 3.8 + Math.random() * 0.5,
      rating: 4.4,
      status: 'available',
      specializations: ['Emergency', 'General', 'Surgery'],
      facilities: ['Emergency Services', 'ICU', 'Lab', 'X-Ray'],
      emergencyCapacity: { total: 35, available: 20 },
      icuBeds: { total: 14, available: 6 },
      ambulances: { total: 3, available: 2 },
      emergencyContact: { phone: '+91 11 2575 0000', email: 'emergency@sgrh.com' }
    }
  ];

  // Sort by distance
  return hospitals.sort((a, b) => a.distance - b.distance);
}

export default router;
