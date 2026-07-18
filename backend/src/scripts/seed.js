import mongoose from 'mongoose';
import env from '../config/env.js';
import Employee from '../modules/example/employee.model.js';

const DEPARTMENTS = ['Engineering', 'Sales', 'Support', 'HR', 'Finance'];
const STATUSES = ['active', 'inactive', 'archived'];

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  await Employee.deleteMany({});

  const docs = Array.from({ length: 250 }).map((_, i) => ({
    firstName: `First${i}`,
    lastName: `Last${i}`,
    email: `employee${i}@example.com`,
    department: randomOf(DEPARTMENTS),
    role: randomOf(['Engineer', 'Manager', 'Analyst', 'Director', 'Associate']),
    status: randomOf(STATUSES),
    salary: 40000 + Math.floor(Math.random() * 120000),
    hireDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 365 * 24 * 3600 * 1000),
    isRemote: Math.random() > 0.5,
    tags: [randomOf(['senior', 'junior', 'lead', 'contractor'])],
  }));

  await Employee.insertMany(docs);
  // eslint-disable-next-line no-console
  console.log(`Seeded ${docs.length} employees`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
