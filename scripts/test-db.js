const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
      if (m) {
        let key = m[1].trim();
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

const env = loadEnv(path.resolve(__dirname, '..', '.env'));
const uri = env.MONGO_URI || env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGO_URI found in .env or environment');
  process.exit(2);
}

console.log('Attempting MongoDB connection (credentials masked):',
  uri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@')
);

mongoose.connect(uri, { connectTimeoutMS: 10000 })
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully.');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Failed to connect:', err && err.message ? err.message : err);
    process.exit(1);
  });
