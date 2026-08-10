import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;
const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

console.log('Testing Google Custom Search API status:');
console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
console.log('- CX Engine ID:', cx);

async function testSearch() {
  const query = 'Eo Gio Quy Nhon Vietnam';
  try {
    const url = `https://customsearch.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&num=1&key=${apiKey}&cx=${cx}`;
    const res = await fetch(url);
    console.log('Response Status:', res.status, res.statusText);
    const data = await res.json();
    if (res.ok && data.items && data.items.length > 0) {
      console.log('\n🎉 SUCCESS! Authentic Google Search Image fetched:');
      console.log('- Title:', data.items[0].title);
      console.log('- Image URL:', data.items[0].link);
    } else {
      console.log('\nResponse details:', JSON.stringify(data, null, 2).substring(0, 600));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testSearch();
