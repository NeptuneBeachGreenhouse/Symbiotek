import { testConnection } from '../src/lib/supabase-test';

console.log('Testing Supabase connection...');
testConnection().then(success => {
  if (success) {
    console.log('✅ Connection test passed!');
  } else {
    console.log('❌ Connection test failed!');
  }
});
