require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Page = require('./backend/dist/models/page.model.js').default;
const PageReview = require('./backend/dist/models/pageReview.model.js').default;

async function test() {
  await mongoose.connect('mongodb://localhost:27017/tmpa_ui_builder');
  
  const page = await Page.findOne({ activeReviewId: { $ne: null } }).populate('activeReviewId');
  if (page) {
    console.log("Found page with activeReviewId populated:", typeof page.activeReviewId);
    console.log(page.activeReviewId);
  } else {
    console.log("No page with activeReviewId found. Let's find any page and review.");
    const review = await PageReview.findOne();
    if (review) {
      console.log("Found review:", review);
      const pageToUpdate = await Page.findById(review.pageId);
      if (pageToUpdate) {
        pageToUpdate.activeReviewId = review._id;
        await pageToUpdate.save();
        console.log("Updated page to have activeReviewId");
        const populated = await Page.findById(pageToUpdate._id).populate('activeReviewId');
        console.log("Populated activeReviewId:", typeof populated.activeReviewId, populated.activeReviewId);
      }
    } else {
      console.log("No reviews found.");
    }
  }
  
  await mongoose.disconnect();
}
test();
