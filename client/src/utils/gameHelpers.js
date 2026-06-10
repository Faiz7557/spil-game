export const PORTS = ['SBY', 'MKS', 'JYP', 'MDN'];
export const BAYS = ['18', '14', '10', '06', '02'];

export const getBayConfig = (bay) => {
  const isBay18 = bay === '18';
  return {
    rows: isBay18 ? ['01', '00', '02'] : ['03', '01', '02', '04'],
    tiers: isBay18 ? ['84', '82'] : ['84', '82', '02'],
    containerType: (bay === '14' || bay === '10') ? 'REEFER' : 'DRY'
  };
};

export const formatRupiah = (value) => {
  if (value === undefined || value === null) return 'Rp 0';
  const prefix = value < 0 ? '-Rp ' : 'Rp ';
  const absVal = Math.abs(value);
  return prefix + absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const PORT_NAMES = {
  SBY: 'Surabaya',
  MKS: 'Makassar',
  JYP: 'Jayapura',
  MDN: 'Medan'
};

export const PORT_COLORS = {
  SBY: 'from-emerald-500 to-teal-600 border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  MKS: 'from-blue-500 to-indigo-600 border-blue-500/50 bg-blue-500/10 text-blue-400',
  JYP: 'from-purple-500 to-fuchsia-600 border-purple-500/50 bg-purple-500/10 text-purple-400',
  MDN: 'from-orange-500 to-amber-600 border-orange-500/50 bg-orange-500/10 text-orange-400'
};

export const PORT_SOLID_BG = {
  SBY: 'bg-emerald-600 text-white border-emerald-500',
  MKS: 'bg-blue-600 text-white border-blue-500',
  JYP: 'bg-purple-600 text-white border-purple-500',
  MDN: 'bg-orange-600 text-white border-orange-500'
};

export const PORT_BORDER_HOVER = {
  SBY: 'hover:border-emerald-400/50 hover:bg-emerald-500/5',
  MKS: 'hover:border-blue-400/50 hover:bg-blue-500/5',
  JYP: 'hover:border-purple-400/50 hover:bg-purple-500/5',
  MDN: 'hover:border-orange-400/50 hover:bg-orange-500/5'
};

export const getNextPort = (port) => {
  const ports = ['SBY', 'MKS', 'JYP', 'MDN'];
  const idx = ports.indexOf(port);
  return ports[(idx + 1) % ports.length];
};

export const getLaterPorts = (port) => {
  const ports = ['SBY', 'MKS', 'JYP', 'MDN'];
  const idx = ports.indexOf(port);
  return [
    ports[(idx + 2) % ports.length],
    ports[(idx + 3) % ports.length]
  ];
};
