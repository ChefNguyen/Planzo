const COMMUNITY_LABELS_EN: Record<string, string> = {
  'chau au': 'Europe',
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
  'da nang': 'Da Nang',
  'da nang, vietnam': 'Da Nang, Vietnam',
  'ho chi minh': 'Ho Chi Minh City',
  'sai gon': 'Saigon (HCMC)',
  'phu quoc': 'Phu Quoc Island',
  'nha trang': 'Nha Trang',
  'da lat': 'Dalat',
  'sa pa': 'Sapa',
  sapa: 'Sapa',
  'hoi an': 'Hoi An',
  hue: 'Hue',
  'ha long': 'Ha Long Bay',
  'ninh binh': 'Ninh Binh',
  'binh dinh': 'Binh Dinh',
  'mien trung': 'Central Vietnam',
  'mien bac': 'Northern Vietnam',
  'mien nam': 'Southern Vietnam',
  'tay nguyen': 'Central Highlands',
  'dong bang song cuu long': 'Mekong Delta',
  'vung tau': 'Vung Tau',
  'phan thiet': 'Phan Thiet',
  'phieu luu': 'Adventure',
  'the thao mao hiem': 'Extreme Sports',
  'kham pha nang dong': 'Active Exploration',
  'van hoa tra matcha': 'Matcha Tea Culture',
  'di san unesco': 'UNESCO Heritage',
  'co kinh tinh lang': 'Quiet Old Town',
  'thien nhien tho mong': 'Scenic Nature',
};

const stripVietnameseMarks = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

export const toCommunityEnglishLabel = (value?: string): string => {
  if (!value) return '';

  const normalized = stripVietnameseMarks(value)
    .replace(/^\s*(thanh pho|tp\.?|tinh|quan|huyen|phuong|xa)\s+/i, '')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  const key = normalized.toLowerCase();

  if (COMMUNITY_LABELS_EN[key]) return COMMUNITY_LABELS_EN[key];

  const translated = normalized
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
    .replace(/\bDa Lat\b/gi, 'Dalat');

  return translated.replace(/\b\w/g, (char) => char.toUpperCase());
};
