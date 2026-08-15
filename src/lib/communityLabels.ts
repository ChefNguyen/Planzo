const COMMUNITY_LABELS_EN: Record<string, string> = {
  // Continents, Regions & Geographic Zones
  'dong nam a': 'Southeast Asia',
  'dong nam a / vietnam': 'Southeast Asia / Vietnam',
  'dong nam a / viet nam': 'Southeast Asia / Vietnam',
  'chau a': 'Asia',
  'chau a / vietnam': 'Asia / Vietnam',
  'chau a / viet nam': 'Asia / Vietnam',
  'chau a, vietnam': 'Asia / Vietnam',
  'chau au': 'Europe',
  'chau my': 'Americas',
  'bac my': 'North America',
  'nam my': 'South America',
  'chau phi': 'Africa',
  'chau uc': 'Oceania',
  'mien trung': 'Central Vietnam',
  'mien trung, vietnam': 'Central Vietnam',
  'mien trung / vietnam': 'Central Vietnam',
  'mien bac': 'Northern Vietnam',
  'mien bac, vietnam': 'Northern Vietnam',
  'mien nam': 'Southern Vietnam',
  'mien nam, vietnam': 'Southern Vietnam',
  'tay nguyen': 'Central Highlands',
  'dong bang song cuu long': 'Mekong Delta',
  'dong bac': 'Northeast Vietnam',
  'tay bac': 'Northwest Vietnam',
  'dong nam bo': 'Southeast Vietnam',
  'tay nam bo': 'Southwest Vietnam',
  'mien tay nam bo': 'Southwest Vietnam',
  'mien tay nam bo, vietnam': 'Southwest Vietnam',
  'mien tay': 'Mekong Delta',
  'mien tay, vietnam': 'Mekong Delta',
  'duyen hai mien trung': 'Central Coast Vietnam',

  // Destinations & Cities
  'ha noi': 'Hanoi',
  hanoi: 'Hanoi',
  'ha noi, vietnam': 'Hanoi, Vietnam',
  'ha noi, vietnam region': 'Hanoi, Vietnam Region',
  'nhat ban': 'Japan',
  'viet nam': 'Vietnam',
  'han quoc': 'South Korea',
  'trung quoc': 'China',
  'thai lan': 'Thailand',
  phap: 'France',
  'quy nhon': 'Quy Nhon',
  'quy nhon, vietnam': 'Quy Nhon, Vietnam',
  'nhon ly, quy nhon': 'Nhon Ly, Quy Nhon',
  'da nang': 'Da Nang',
  'da nang, vietnam': 'Da Nang, Vietnam',
  'ho chi minh': 'Ho Chi Minh City',
  'sai gon': 'Saigon (HCMC)',
  'phu quoc': 'Phu Quoc Island',
  'phu quoc, vietnam': 'Phu Quoc, Vietnam',
  'phu quoc island, vietnam': 'Phu Quoc Island, Vietnam',
  'nha trang': 'Nha Trang',
  'nha trang, vietnam': 'Nha Trang, Vietnam',
  'da lat': 'Dalat',
  'da lat, vietnam': 'Dalat, Vietnam',
  'sa pa': 'Sapa',
  sapa: 'Sapa',
  'sa pa, vietnam': 'Sapa, Vietnam',
  'hoi an': 'Hoi An',
  'hoi an, vietnam': 'Hoi An, Vietnam',
  hue: 'Hue',
  'hue, vietnam': 'Hue, Vietnam',
  'ha long': 'Ha Long Bay',
  'ha long, vietnam': 'Ha Long Bay, Vietnam',
  'ninh binh': 'Ninh Binh',
  'ninh binh, vietnam': 'Ninh Binh, Vietnam',
  'binh dinh': 'Binh Dinh',
  'binh dinh, vietnam': 'Binh Dinh, Vietnam',
  'vung tau': 'Vung Tau',
  'phan thiet': 'Phan Thiet',
  bangkok: 'Bangkok',
  'bangkok, thailand': 'Bangkok, Thailand',
  'bangkok, thailand region': 'Bangkok, Thailand Region',
  zurich: 'Zurich',
  'zurich, switzerland': 'Zurich, Switzerland',
  tokyo: 'Tokyo',
  'tokyo, japan': 'Tokyo, Japan',
  kyoto: 'Kyoto',
  'kyoto, japan': 'Kyoto, Japan',
  osaka: 'Osaka',
  'osaka, japan': 'Osaka, Japan',
  seoul: 'Seoul',
  'seoul, south korea': 'Seoul, South Korea',
  singapore: 'Singapore',
  paris: 'Paris',
  'paris, france': 'Paris, France',
  rome: 'Rome',
  'rome, italy': 'Rome, Italy',
  london: 'London',
  'london, uk': 'London, UK',
  bali: 'Bali',
  'bali, indonesia': 'Bali, Indonesia',
  ubud: 'Ubud',
  'ubud, bali': 'Ubud, Bali',

  // Travel Vibe Tags (Strict English Mappings)
  'bien dao': 'Beach & Island',
  'bien': 'Beach & Coast',
  'dao': 'Island Escape',
  'am thuc': 'Foodie',
  'van hoa': 'Culture',
  'nghi duong': 'Relax & Resort',
  'thu gian': 'Relax',
  chill: 'Chill',
  'phieu luu': 'Adventure',
  adventure: 'Adventure',
  'the thao mao hiem': 'Extreme Sports',
  'kham pha nang dong': 'Active Exploration',
  'kham pha': 'Exploration',
  'van hoa tra matcha': 'Matcha Tea Culture',
  'di san unesco': 'UNESCO Heritage',
  'co kinh tinh lang': 'Quiet Old Town',
  'thien nhien tho mong': 'Scenic Nature',
  'thien nhien': 'Nature',
  'tam linh': 'Spiritual',
  'lich su': 'History',
  'di tich': 'Heritage',
  'bao tang': 'Museums',
  'nghe thuat': 'Art & Design',
  'ca phe': 'Cafe Culture',
  'mua sam': 'Shopping',
  shopping: 'Shopping',
  'dem': 'Nightlife',
  nightlife: 'Nightlife',
  'bar': 'Bars & Pubs',
  'sang trong': 'Luxury',
  luxury: 'Luxury',
  'tiet kiem': 'Budget',
  budget: 'Budget',
  'gia dinh': 'Family',
  'cap doi': 'Romantic',
  'lang man': 'Romantic',
  romantic: 'Romantic',
  'leo nui': 'Hiking & Trekking',
  'cam trai': 'Camping',
  camping: 'Camping',
  'du lich sinh thai': 'Eco-Tourism',
  'sinh thai': 'Eco-Tourism',
  'song ao': 'Photography',
  'check in': 'Sightseeing',
  'suc khoe': 'Wellness',
  wellness: 'Wellness',
  'duong pho': 'Street Life',
  'an uong': 'Dining',
  'du thuyen': 'Cruise',
  'chua chien': 'Temples & Pagodas',
  'chua': 'Temples',
  'song nuoc': 'Riverways',
};

const stripVietnameseMarks = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

export const toCommunityEnglishLabel = (value?: string): string => {
  if (!value) return '';

  // If string contains slash separators like 'Chau A / Vietnam', process parts
  if (value.includes('/')) {
    return value
      .split('/')
      .map((part) => toCommunityEnglishLabel(part.trim()))
      .join(' / ');
  }

  const normalized = stripVietnameseMarks(value)
    .replace(/^\s*(thanh pho|tp\.?|tinh|quan|huyen|phuong|xa)\s+/i, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  const key = normalized.toLowerCase();

  if (COMMUNITY_LABELS_EN[key]) return COMMUNITY_LABELS_EN[key];

  let translated = normalized
    .replace(/\bdong nam a\b/gi, 'Southeast Asia')
    .replace(/\bchau a\b/gi, 'Asia')
    .replace(/\bchau au\b/gi, 'Europe')
    .replace(/\bchau my\b/gi, 'Americas')
    .replace(/\bbac my\b/gi, 'North America')
    .replace(/\bnam my\b/gi, 'South America')
    .replace(/\bchau uc\b/gi, 'Oceania')
    .replace(/\bchau phi\b/gi, 'Africa')
    .replace(/\bmien trung\b/gi, 'Central Vietnam')
    .replace(/\bmien bac\b/gi, 'Northern Vietnam')
    .replace(/\bmien nam\b/gi, 'Southern Vietnam')
    .replace(/\btay nguyen\b/gi, 'Central Highlands')
    .replace(/\bdong bang song cuu long\b/gi, 'Mekong Delta')
    .replace(/\bNhat Ban\b/gi, 'Japan')
    .replace(/\bViet Nam\b/gi, 'Vietnam')
    .replace(/\bHan Quoc\b/gi, 'South Korea')
    .replace(/\bTrung Quoc\b/gi, 'China')
    .replace(/\bThai Lan\b/gi, 'Thailand')
    .replace(/\bPhap\b/gi, 'France')
    .replace(/\bHa Noi\b/gi, 'Hanoi')
    .replace(/\bQuy Nhon\b/gi, 'Quy Nhon')
    .replace(/\bDa Nang\b/gi, 'Da Nang')
    .replace(/\bPhu Quoc\b/gi, 'Phu Quoc')
    .replace(/\bDa Lat\b/gi, 'Dalat')
    .replace(/\bNha Trang\b/gi, 'Nha Trang')
    .replace(/\bHoi An\b/gi, 'Hoi An')
    .replace(/\bHue\b/gi, 'Hue')
    .replace(/\bHa Long\b/gi, 'Ha Long')
    .replace(/\bNinh Binh\b/gi, 'Ninh Binh')
    .replace(/\bBinh Dinh\b/gi, 'Binh Dinh')
    .replace(/\bVung Tau\b/gi, 'Vung Tau')
    .replace(/\bPhan Thiet\b/gi, 'Phan Thiet')
    .replace(/\bSa Pa\b/gi, 'Sapa')
    .replace(/\bBien Dao\b/gi, 'Beach & Island')
    .replace(/\bAm Thuc\b/gi, 'Foodie')
    .replace(/\bVan Hoa\b/gi, 'Culture')
    .replace(/\bNghi Duong\b/gi, 'Relax & Resort')
    .replace(/\bThu Gian\b/gi, 'Relax');

  translated = translated.replace(/Central Vietnam,\s*Vietnam/gi, 'Central Vietnam');

  return translated.replace(/\b\w/g, (char) => char.toUpperCase());
};
