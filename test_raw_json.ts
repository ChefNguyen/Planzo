async function testRaw() {
  const res = await fetch('http://localhost:3000/api/generate-itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: 'Thủ Đức, TP.HCM',
      dates: 'Next Weekend',
      vibes: ['Coffee'],
    }),
  });

  const data = await res.json();
  console.log('Keys of first activity:', Object.keys(data.days[0].activities[0]));
  console.log('First activity sample:', JSON.stringify(data.days[0].activities[0], null, 2));
}

testRaw();
