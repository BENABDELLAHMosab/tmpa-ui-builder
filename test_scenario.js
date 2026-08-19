const axios = require('axios');

async function runTest() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api' });

    console.log('Logging in...');
    // 1. Login as Dev
    const devLogin = await api.post('/auth/login', {
      email: 'developer@tmpa.ma',
      password: 'password123'
    });
    const devToken = devLogin.data.token;
    const devApi = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${devToken}` }
    });

    // 2. Login as Admin
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@tmpa.ma',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    const adminApi = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('--- TEST START ---');
    
    // Create Page
    const pageRes = await devApi.post('/pages', {
      name: 'Test Bug Scenario ' + Date.now(),
      description: 'Test Page'
    });
    const pageId = pageRes.data._id || pageRes.data.id;
    console.log(`Page created: ${pageId}`);

    // Save V1
    const save1Res = await devApi.patch(`/pages/${pageId}`, {
      schema: { components: [{ id: '1', type: 'Button' }] }
    });
    console.log(`V1 Saved. Page version: ${save1Res.data.version}`);

    // Submit V1
    const submitRes = await devApi.post(`/pages/${pageId}/submit`);
    console.log(`V1 Submitted. Active Review ID: ${submitRes.data.activeReviewId}`);

    // Save V2
    const save2Res = await devApi.patch(`/pages/${pageId}`, {
      schema: { components: [{ id: '1', type: 'Button' }, { id: '2', type: 'Text' }] }
    });
    const pageAfterSave2 = save2Res.data;
    console.log('\n--- AFTER SAVE V2 (FRONTEND STATE) ---');
    console.log(`page.version = ${pageAfterSave2.version}`);
    console.log(`activeReview is object? = ${typeof pageAfterSave2.activeReviewId === 'object'}`);
    if (typeof pageAfterSave2.activeReviewId === 'object' && pageAfterSave2.activeReviewId !== null) {
      console.log(`activeReview.versionNumber = ${pageAfterSave2.activeReviewId.versionNumber}`);
      console.log(`activeReview full object:`, JSON.stringify(pageAfterSave2.activeReviewId, null, 2));
    } else {
      console.log(`activeReview is just an ID or null:`, pageAfterSave2.activeReviewId);
    }
    console.log(`page.status = ${pageAfterSave2.status}`);
    
    const reviewId = typeof pageAfterSave2.activeReviewId === 'object' ? pageAfterSave2.activeReviewId._id : pageAfterSave2.activeReviewId;

    // Admin approves
    console.log('\n--- ADMIN APPROVES ---');
    const approveRes = await adminApi.post(`/pages/${pageId}/reviews/${reviewId}/approve`);
    console.log(`Approve response page version: ${approveRes.data.version}`);
    console.log(`Approve response status: ${approveRes.data.status}`);

    // Admin publishes
    console.log('\n--- ADMIN PUBLISHES ---');
    const publishRes = await adminApi.post(`/pages/${pageId}/publish`);
    const finalPage = publishRes.data;
    console.log(`Final Page version: ${finalPage.version}`);
    console.log(`Final Page publishedVersionNumber: ${finalPage.publishedVersionNumber}`);
    console.log(`Final Page status: ${finalPage.status}`);
    console.log(`Final Page activeReviewId:`, finalPage.activeReviewId);
    
    console.log('\n--- TEST END ---');
  } catch (error) {
    console.error('Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

runTest();
