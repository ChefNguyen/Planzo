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

  return normalized
    .replace(/\bNhat Ban\b/gi, 'Japan')
    .replace(/\bViet Nam\b/gi, 'Vietnam')
    .replace(/\bHan Quoc\b/gi, 'South Korea')
    .replace(/\bTrung Quoc\b/gi, 'China')
    .replace(/\bThai Lan\b/gi, 'Thailand')
    .replace(/\bPhap\b/gi, 'France')
    .replace(/\bHa Noi\b/gi, 'Hanoi');
};
