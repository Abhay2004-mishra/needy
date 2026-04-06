require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data.');

    // Create sample users
    const users = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'both',
        skills: ['Driving', 'Customer Service', 'Time Management'],
        bio: 'Experienced professional with 5+ years in logistics and customer service.',
        phone: '+1 (555) 123-4567',
        avatar: 'JD'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'poster',
        skills: ['Management', 'Marketing'],
        bio: 'Business owner looking for talented individuals.',
        phone: '+1 (555) 987-6543',
        avatar: 'JS'
      }
    ]);

    console.log(`Created ${users.length} users.`);

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Urgent Delivery Driver',
        description: "Looking for reliable delivery drivers for same-day deliveries in the downtown area. Must have valid driver's license and clean driving record. Flexible hours available.",
        category: 'delivery',
        location: 'new-york',
        locationDisplay: 'New York, NY',
        skills: ["Driver's License", 'GPS Navigation', 'Time Management'],
        totalSeats: 5,
        bookedSeats: 3,
        salary: 25,
        paymentType: 'hourly',
        paymentDisplay: '$25/hour',
        contactEmail: 'hr@quickdeliver.com',
        contactPhone: '+1 (555) 123-4567',
        isPremium: true,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Frontend Developer - React',
        description: 'Seeking an experienced React developer for a 3-month project. Must be proficient with React hooks, Redux, and TypeScript. Remote work allowed.',
        category: 'tech',
        location: 'remote',
        locationDisplay: 'Remote (US)',
        skills: ['React', 'TypeScript', 'Redux', 'REST APIs'],
        totalSeats: 2,
        bookedSeats: 1,
        salary: 45,
        paymentType: 'hourly',
        paymentDisplay: '$45/hour',
        contactEmail: 'careers@techstartup.io',
        contactPhone: '+1 (555) 987-6543',
        isPremium: false,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Event Setup Crew',
        description: 'Need energetic individuals for event setup and teardown. Physical work involved - must be able to lift 50lbs. Weekend availability required.',
        category: 'events',
        location: 'los-angeles',
        locationDisplay: 'Los Angeles, CA',
        skills: ['Physical Fitness', 'Team Player', 'Reliable'],
        totalSeats: 8,
        bookedSeats: 5,
        salary: 20,
        paymentType: 'hourly',
        paymentDisplay: '$20/hour',
        contactEmail: 'staffing@eventpros.com',
        contactPhone: '+1 (555) 456-7890',
        isPremium: false,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Office Cleaning Specialist',
        description: 'Professional cleaning service looking for experienced cleaners for commercial offices. Evening shifts, 3-4 hours per night.',
        category: 'cleaning',
        location: 'chicago',
        locationDisplay: 'Chicago, IL',
        skills: ['Cleaning Experience', 'Attention to Detail', 'Reliable Transportation'],
        totalSeats: 4,
        bookedSeats: 4,
        salary: 18,
        paymentType: 'hourly',
        paymentDisplay: '$18/hour',
        contactEmail: 'jobs@cleanpro.com',
        contactPhone: '+1 (555) 321-0987',
        isPremium: false,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'closed'
      },
      {
        title: 'Graphic Designer - Freelance',
        description: 'Looking for a creative graphic designer for ongoing projects. Portfolio required. Social media graphics, logos, and marketing materials.',
        category: 'freelance',
        location: 'remote',
        locationDisplay: 'Remote',
        skills: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Creative Thinking'],
        totalSeats: 3,
        bookedSeats: 0,
        salary: 35,
        paymentType: 'hourly',
        paymentDisplay: '$35/hour',
        contactEmail: 'design@creativeagency.co',
        contactPhone: '',
        isPremium: true,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Warehouse Worker - Immediate Start',
        description: 'Busy warehouse needs additional workers for inventory management and order fulfillment. No experience necessary, training provided.',
        category: 'labor',
        location: 'houston',
        locationDisplay: 'Houston, TX',
        skills: ['Reliable', 'Physical Stamina', 'Basic Math'],
        totalSeats: 10,
        bookedSeats: 4,
        salary: 16,
        paymentType: 'hourly',
        paymentDisplay: '$16/hour',
        contactEmail: 'recruiting@logisticsco.com',
        contactPhone: '+1 (555) 654-3210',
        isPremium: false,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Food Delivery Driver - Own Vehicle',
        description: 'Join our growing team of food delivery drivers! Use your own vehicle, set your own schedule. High earning potential during peak hours.',
        category: 'delivery',
        location: 'new-york',
        locationDisplay: 'New York, NY',
        skills: ["Valid Driver's License", 'Own Vehicle', 'Smartphone'],
        totalSeats: 15,
        bookedSeats: 12,
        salary: 22,
        paymentType: 'hourly',
        paymentDisplay: '$22/hour + tips',
        contactEmail: 'drivers@foodexpress.com',
        contactPhone: '+1 (555) 789-0123',
        isPremium: true,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      },
      {
        title: 'Python Backend Developer',
        description: 'Experienced Python developer needed for API development. Django/FastAPI experience preferred. Full-time contract position.',
        category: 'tech',
        location: 'remote',
        locationDisplay: 'Remote',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        totalSeats: 2,
        bookedSeats: 0,
        salary: 55,
        paymentType: 'hourly',
        paymentDisplay: '$55/hour',
        contactEmail: 'tech@datapro.com',
        contactPhone: '',
        isPremium: true,
        postedBy: users[1]._id,
        postedByName: 'Jane Smith',
        status: 'active'
      }
    ]);

    console.log(`Created ${jobs.length} jobs.`);

    // Create sample bookings
    const bookings = await Booking.create([
      { userId: users[0]._id, jobId: jobs[1]._id, status: 'confirmed' },
      { userId: users[0]._id, jobId: jobs[4]._id, status: 'confirmed' }
    ]);

    console.log(`Created ${bookings.length} bookings.`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Test credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
