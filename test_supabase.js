const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // Try to create bucket
  await supabase.storage.createBucket('melofilia_public', { public: true });
  const { data, error } = await supabase.storage.from('melofilia_public').createSignedUploadUrl('test.txt');
  console.log("Data:", data, "Error:", error);
}
test();
