const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tmpa_builder', {
    authSource: 'admin',
    user: 'admin',
    pass: 'password123'
  });

  const db = mongoose.connection.db;

  const user = await db.collection('users').findOne({ email: 'dev@tmpa.com' });
  if (!user) {
    console.log("User not found");
    process.exit(1);
  }

  const pageId = new ObjectId();
  
  // Page
  await db.collection('pages').insertOne({
    _id: pageId,
    name: 'Layout Test Page',
    description: 'Test layout',
    ownerId: user._id,
    status: 'draft',
    version: 5,
    schema: { components: [] },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Versions
  for (let i = 1; i <= 5; i++) {
    await db.collection('page_versions').insertOne({
      _id: new ObjectId(),
      pageId: pageId,
      versionNumber: i,
      schemaSnapshot: { components: [] },
      createdAt: new Date(),
      createdBy: user._id,
      reason: 'manual-save'
    });
  }

  // Reviews
  const reviews = [
    { versionNumber: 1, status: 'superseded', roundNumber: 1 },
    { versionNumber: 2, status: 'changes_requested', roundNumber: 2 },
    { versionNumber: 3, status: 'approved', roundNumber: 3 },
    { versionNumber: 4, status: 'submitted', roundNumber: 4 } // IN REVIEW
  ];

  for (const rev of reviews) {
    const reviewId = new ObjectId();
    await db.collection('page_reviews').insertOne({
      _id: reviewId,
      pageId: pageId,
      versionNumber: rev.versionNumber,
      roundNumber: rev.roundNumber,
      status: rev.status,
      submittedBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Set active review id to the latest one
    if (rev.versionNumber === 4) {
      await db.collection('pages').updateOne({ _id: pageId }, { $set: { activeReviewId: reviewId } });
    }
  }

  console.log(`Page created: ${pageId}`);
  process.exit(0);
}

run().catch(console.error);
