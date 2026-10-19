export interface NailPhotoPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const NAIL_PHOTO_PRESETS: NailPhotoPreset[] = [
  {
    id: 'preset-1',
    name: 'Alongamento em Fibra Nude Chic',
    category: 'Alongamento',
    url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-2',
    name: 'Vermelho Marsala & Esmaltação em Gel',
    category: 'Esmaltação & Gel',
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-3',
    name: 'Francesinha Clássica & Delicada',
    category: 'Mãos & Pés',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-4',
    name: 'Nail Art com Glitter & Encapsulada',
    category: 'Nail Art',
    url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-5',
    name: 'SPA dos Pés & Cuidados Podais',
    category: 'SPA & Tratamentos',
    url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-6',
    name: 'Cutilagem e Formato Alinhado',
    category: 'Mãos & Pés',
    url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-7',
    name: 'Blindagem Diamante com Alto Brilho',
    category: 'Esmaltação & Gel',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'preset-8',
    name: 'Manutenção em Fibra Almond',
    category: 'Manutenção',
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'
  }
];

export const getDefaultServiceImage = (category: string, name: string): string => {
  const catLower = (category || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (nameLower.includes('fibra') || nameLower.includes('alongamento')) return NAIL_PHOTO_PRESETS[0].url;
  if (nameLower.includes('marsala') || nameLower.includes('gel') || catLower.includes('gel')) return NAIL_PHOTO_PRESETS[1].url;
  if (nameLower.includes('frances') || nameLower.includes('art') || catLower.includes('art')) return NAIL_PHOTO_PRESETS[3].url;
  if (nameLower.includes('spa') || nameLower.includes('pés') || nameLower.includes('pedicure') || catLower.includes('spa')) return NAIL_PHOTO_PRESETS[4].url;
  if (nameLower.includes('blindagem')) return NAIL_PHOTO_PRESETS[6].url;
  if (nameLower.includes('manuten')) return NAIL_PHOTO_PRESETS[7].url;
  return NAIL_PHOTO_PRESETS[2].url;
};
