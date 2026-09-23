const mongoose = require('mongoose');
const { mongoUri } = require('./src/config/env');
const Event = require('./src/models/Event');
const Sponsor = require('./src/models/Sponsor');
const SponsorshipPackage = require('./src/models/SponsorshipPackage');
const SponsorAssignment = require('./src/models/SponsorAssignment');

async function seedSponsorData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const event = await Event.findOne();
    const sponsor = await Sponsor.findOne({ event: event._id });

    if (!event || !sponsor) {
      console.log('No event or sponsor found. Exiting.');
      process.exit(1);
    }

    // Check if package exists
    let spPackage = await SponsorshipPackage.findOne({ event: event._id, name: 'Platinum Innovator Package' });
    if (!spPackage) {
      spPackage = await SponsorshipPackage.create({
        event: event._id,
        name: 'Platinum Innovator Package',
        description: 'Top tier sponsorship including keynote speaking slot, premium booth, and maximum logo placement.',
        price: 15000,
        benefits: [
          'Keynote Speaker Slot (20 mins)',
          'Premium 20x20 Booth space',
          'Logo on main stage screens',
          'Dedicated email blast to attendees'
        ],
        capacity: 2
      });
      console.log('Created Sponsorship Package');
    }

    // Check if assignment exists
    let assignment = await SponsorAssignment.findOne({ event: event._id, sponsor: sponsor._id });
    if (!assignment) {
      assignment = await SponsorAssignment.create({
        event: event._id,
        sponsor: sponsor._id,
        sponsorshipPackage: spPackage._id,
        paymentStatus: 'PAID',
        deliverables: [
          {
            title: 'High-Res Company Logo',
            description: 'Provide an SVG or high-res PNG with transparent background for main stage screens.',
            dueDate: new Date(Date.now() + 86400000 * 7),
            status: 'PENDING'
          },
          {
            title: 'Promotional Video (30s)',
            description: 'A 30-second video to be played before the keynote.',
            dueDate: new Date(Date.now() + 86400000 * 14),
            status: 'PENDING'
          },
          {
            title: 'Provide Booth Staff Names',
            description: 'List of 4 staff members who will manage the premium booth.',
            dueDate: new Date(),
            status: 'COMPLETED',
            completedAt: new Date()
          }
        ]
      });
      console.log('Created Sponsor Assignment with Deliverables');
    } else {
      console.log('Sponsor Assignment already exists');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  }
}

seedSponsorData();
