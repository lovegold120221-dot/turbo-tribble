const { Client } = require('pg');

async function testPassword(password) {
  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.tcwhnoxzqibqtpgedvbv.supabase.co:5432/postgres`;
  console.log(`Testing with password: ${password.substring(0, 3)}...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Success! Connected to Supabase PostgreSQL.");
    await client.end();
    return true;
  } catch (err) {
    console.error(`Failed: ${err.message}`);
    return false;
  }
}

async function run() {
  const passwords = ["Master120221@@@", "120221", "Master120221"];
  for (const pw of passwords) {
    const success = await testPassword(pw);
    if (success) {
      console.log(`DATABASE_URL=postgresql://postgres:${pw}@db.tcwhnoxzqibqtpgedvbv.supabase.co:5432/postgres`);
      break;
    }
  }
}

run();
