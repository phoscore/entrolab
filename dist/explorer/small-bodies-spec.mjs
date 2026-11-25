const JD_UNIX=2440587.5, MS_PER_DAY=86400000;
export function parseSmallDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const ms=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value?JD_UNIX+ms/MS_PER_DAY:null;
}
export const formatSmallDate=day=>new Date(Math.round((day-JD_UNIX)*MS_PER_DAY)).toISOString().slice(0,16);

export const RELEASE='v0.9.5-horizons-small-bodies.1';
export const FRAME='ICRF / Ecliptic of J2000.0 / Sun centre (10) / TDB / KM-S / geometric';
export const GROUPS=Object.freeze({
  "dwarf": [
    [
      "ceres",
      "1",
      "Ceres"
    ],
    [
      "haumea",
      "136108",
      "Haumea"
    ],
    [
      "makemake",
      "136472",
      "Makemake"
    ],
    [
      "eris",
      "136199",
      "Eris"
    ]
  ],
  "asteroid": [
    [
      "vesta",
      "4",
      "Vesta"
    ],
    [
      "pallas",
      "2",
      "Pallas"
    ],
    [
      "hygiea",
      "10",
      "Hygiea"
    ],
    [
      "bennu",
      "101955",
      "Bennu",
      0.5
    ],
    [
      "ryugu",
      "162173",
      "Ryugu",
      0.5
    ],
    [
      "apophis",
      "99942",
      "Apophis",
      0.25
    ],
    [
      "eros",
      "433",
      "Eros",
      0.5
    ]
  ],
  "tno": [
    [
      "sedna",
      "90377",
      "Sedna"
    ],
    [
      "quaoar",
      "50000",
      "Quaoar"
    ],
    [
      "orcus",
      "90482",
      "Orcus"
    ],
    [
      "gonggong",
      "225088",
      "Gonggong"
    ],
    [
      "salacia",
      "120347",
      "Salacia"
    ],
    [
      "arrokoth",
      "486958",
      "Arrokoth"
    ]
  ],
  "comet": [
    [
      "halley",
      "1P",
      "Halley",
      2,
      "1985-01-01",
      "2064-01-01"
    ],
    [
      "churyumov",
      "67P",
      "Churyumov–Gerasimenko",
      1,
      "2014-01-01",
      "2031-01-01"
    ],
    [
      "encke",
      "2P",
      "Encke",
      0.5,
      "2023-01-01",
      "2030-01-01"
    ],
    [
      "swift",
      "109P",
      "Swift–Tuttle",
      2,
      "1990-01-01",
      "2031-01-01"
    ],
    [
      "halebopp",
      "C/1995 O1",
      "Hale–Bopp",
      2,
      "1995-01-01",
      "2031-01-01"
    ]
  ]
});
export const catalog=Object.entries(GROUPS).flatMap(([group,objects])=>objects.map(([id,designation,name,cadence,first,last])=>({
  id,group,designation,name,
  command:group==='comet'?`DES=${designation};NOFRAG;CAP`:`${designation};`,
  step:cadence??(group==='tno'?4:2),
  start:parseSmallDate(first??'2025-01-01'),end:parseSmallDate(last??'2029-01-01'),
})));
