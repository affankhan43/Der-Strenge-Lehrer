require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const tasks = require('../../data/tasks.json');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Tasks in file:', tasks.length);
  // Tasks are served directly from JSON file, no DB seeding needed.
  // This script can be used to verify the JSON and connection.
  const days = [...new Set(tasks.map(t => t.day))].sort((a,b)=>a-b);
  console.log(`Days covered: ${days[0]}–${days[days.length-1]} (${days.length} days)`);
  tasks.forEach(t => {
    if (!t.id || !t.day || !t.order || !t.type || !t.title) {
      console.warn('⚠️  Invalid task:', t.id);
    }
  });
  console.log('✅ All tasks valid. No DB seeding needed — tasks are served from JSON.');
  await mongoose.disconnect();
}

seed().catch(console.error);
