async function testGeocoding() {
  const testPlaces = [
    'Eo Gió Quy Nhơn',
    'Bãi biển Kỳ Co Quy Nhơn',
    'Chùa Ông Núi Bình Định',
    'Tháp Bánh Ít Quy Nhơn',
    'Nhơn Lý Quy Nhơn',
    'Cầu Rồng Đà Nẵng',
    'Bãi biển Mỹ Khê Đà Nẵng',
    'Bà Nà Hills Đà Nẵng',
  ];

  console.log('Testing OpenStreetMap Nominatim / Photon Geocoding APIs:\n');

  for (const place of testPlaces) {
    // 1. Try Photon (OpenStreetMap based, fast & free, no key)
    try {
      const pRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(place)}&limit=1`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.features && pData.features.length > 0) {
          const coords = pData.features[0].geometry.coordinates; // [lng, lat]
          const props = pData.features[0].properties;
          console.log(`✅ [Photon] "${place}" -> Lat: ${coords[1]}, Lng: ${coords[0]} (${props.name || props.city || ''})`);
          continue;
        }
      }
    } catch {}

    // 2. Try Nominatim (OpenStreetMap official geocoder, free, no key)
    try {
      const nRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'PlanzoTravelApp/1.0' }
      });
      if (nRes.ok) {
        const nData = await nRes.json();
        if (nData && nData.length > 0) {
          console.log(`✅ [Nominatim] "${place}" -> Lat: ${nData[0].lat}, Lng: ${nData[0].lon} (${nData[0].display_name.substring(0, 40)})`);
          continue;
        }
      }
    } catch {}

    console.log(`❌ No result for "${place}"`);
  }
}

testGeocoding();
