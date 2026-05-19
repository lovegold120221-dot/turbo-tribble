const dns = require('dns');

const hosts = [
  'tcwhnoxzqibqtpgedvbv.supabase.co',
  'db.tcwhnoxzqibqtpgedvbv.supabase.co',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-us-east-2.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'google.com'
];

async function check() {
  for (const h of hosts) {
    try {
      const ip = await new Promise((resolve, reject) => {
        dns.lookup(h, (err, address) => {
          if (err) reject(err);
          else resolve(address);
        });
      });
      console.log(`Success: ${h} -> ${ip}`);
    } catch (e) {
      console.log(`Failed: ${h} -> ${e.message}`);
    }
  }
}

check();
