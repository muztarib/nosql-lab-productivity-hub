// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
//
//  Required minimum:
//    - 2 users
//    - 4 projects (split across the users)
//    - 5 tasks (with embedded subtasks and tags arrays)
//    - 5 notes (some attached to projects, some standalone)
//
//  Use the bcrypt module to hash passwords before inserting users.
//  Use ObjectId references for relationships (projectId, ownerId).
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  try {
    const db = await connect();

    // Make duplicate-email behavior consistent with auth route expectations.
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    // Clear existing data so re-seeding is idempotent.
    await db.collection('users').deleteMany({});
    await db.collection('projects').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('notes').deleteMany({});

    const now = Date.now();
    const daysAgo = n => new Date(now - n * 24 * 60 * 60 * 1000);
    const daysFromNow = n => new Date(now + n * 24 * 60 * 60 * 1000);

    const [muaazHash, saraHash] = await Promise.all([
      bcrypt.hash('password123', 10),
      bcrypt.hash('securepass456', 10)
    ]);

    const usersResult = await db.collection('users').insertMany([
      {
        email: 'muaaz@example.com',
        passwordHash: muaazHash,
        name: 'Muaaz',
        createdAt: daysAgo(20)
      },
      {
        email: 'sara@example.com',
        passwordHash: saraHash,
        name: 'Sara',
        createdAt: daysAgo(18)
      }
    ]);

    const user1Id = usersResult.insertedIds[0];
    const user2Id = usersResult.insertedIds[1];

    const projectsResult = await db.collection('projects').insertMany([
      {
        ownerId: user1Id,
        name: 'ADB NoSQL Lab',
        description: 'Complete Task 1 and all query functions',
        archived: false,
        createdAt: daysAgo(14)
      },
      {
        ownerId: user1Id,
        name: 'Seminar Presentation',
        description: 'Prepare slides and speaking notes',
        archived: false,
        createdAt: daysAgo(12)
      },
      {
        ownerId: user2Id,
        name: 'Internship Applications',
        description: 'Track applications and follow-ups',
        archived: false,
        createdAt: daysAgo(10)
      },
      {
        ownerId: user2Id,
        name: 'Fitness Plan',
        description: 'Weekly routine and nutrition planning',
        archived: false,
        createdAt: daysAgo(8)
      }
    ]);

    const p1Id = projectsResult.insertedIds[0];
    const p2Id = projectsResult.insertedIds[1];
    const p3Id = projectsResult.insertedIds[2];
    const p4Id = projectsResult.insertedIds[3];

    const tasksResult = await db.collection('tasks').insertMany([
      {
        ownerId: user1Id,
        projectId: p1Id,
        title: 'Write MODELING.md decisions',
        status: 'done',
        priority: 5,
        tags: ['nosql', 'documentation'],
        subtasks: [
          { title: 'Decide embed vs reference', done: true },
          { title: 'Document optional fields', done: true }
        ],
        dueDate: daysFromNow(2),
        createdAt: daysAgo(7)
      },
      {
        ownerId: user1Id,
        projectId: p1Id,
        title: 'Implement seed.js',
        status: 'in-progress',
        priority: 4,
        tags: ['mongodb', 'seeding'],
        subtasks: [
          { title: 'Insert users', done: true },
          { title: 'Insert projects/tasks/notes', done: false }
        ],
        createdAt: daysAgo(6)
      },
      {
        ownerId: user1Id,
        projectId: p2Id,
        title: 'Draft seminar outline',
        status: 'todo',
        priority: 3,
        tags: ['seminar'],
        subtasks: [
          { title: 'Pick topic sections', done: false }
        ],
        dueDate: daysFromNow(5),
        createdAt: daysAgo(5)
      },
      {
        ownerId: user2Id,
        projectId: p3Id,
        title: 'Update CV for backend roles',
        status: 'todo',
        priority: 5,
        tags: ['career', 'cv'],
        subtasks: [
          { title: 'Add project section', done: false },
          { title: 'Proofread final version', done: false }
        ],
        createdAt: daysAgo(4)
      },
      {
        ownerId: user2Id,
        projectId: p4Id,
        title: 'Plan weekly workouts',
        status: 'done',
        priority: 2,
        tags: ['health', 'routine'],
        subtasks: [
          { title: 'Mon/Wed/Fri schedule', done: true }
        ],
        createdAt: daysAgo(3)
      },
      {
        ownerId: user2Id,
        projectId: p3Id,
        title: 'Send two internship applications',
        status: 'in-progress',
        priority: 4,
        tags: ['career', 'applications'],
        subtasks: [
          { title: 'Customize cover letter', done: true },
          { title: 'Submit via portal', done: false }
        ],
        dueDate: daysFromNow(1),
        createdAt: daysAgo(2)
      }
    ]);

    const notesResult = await db.collection('notes').insertMany([
      {
        ownerId: user1Id,
        projectId: p1Id,
        title: 'Lab reminder',
        body: 'Remember to run npm run seed before npm start.',
        tags: ['lab', 'setup'],
        pinned: true,
        createdAt: daysAgo(6)
      },
      {
        ownerId: user1Id,
        title: 'General ideas',
        body: 'Try indexing frequently queried fields later.',
        tags: ['ideas', 'mongodb'],
        createdAt: daysAgo(5)
      },
      {
        ownerId: user1Id,
        projectId: p2Id,
        title: 'Presentation notes',
        body: 'Keep slides concise and demo-driven.',
        tags: ['seminar', 'slides'],
        createdAt: daysAgo(4)
      },
      {
        ownerId: user2Id,
        projectId: p3Id,
        title: 'Application tracker',
        body: 'Follow up after 5 working days.',
        tags: ['career', 'tracking'],
        createdAt: daysAgo(3)
      },
      {
        ownerId: user2Id,
        title: 'Health reminder',
        body: 'Sleep 7+ hours and stay hydrated.',
        tags: ['health', 'habits'],
        createdAt: daysAgo(2)
      },
      {
        ownerId: user2Id,
        projectId: p4Id,
        title: 'Meal prep plan',
        body: 'Prepare lunches on Sunday evening.',
        tags: ['nutrition', 'planning'],
        createdAt: daysAgo(1)
      }
    ]);

    console.log('Seed complete');
    console.log(`Users: ${usersResult.insertedCount}`);
    console.log(`Projects: ${projectsResult.insertedCount}`);
    console.log(`Tasks: ${tasksResult.insertedCount}`);
    console.log(`Notes: ${notesResult.insertedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
