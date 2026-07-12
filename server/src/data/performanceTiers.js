// Relative performance tiers for common desktop CPUs and GPUs, roughly the
// last ten years of parts. Scores are 0-100 on a blended scale (gaming plus
// everyday/productivity work) where ~100 is the fastest consumer part as of
// mid-2026. Derived from widely published benchmark rankings; intentionally
// coarse — the analysis needs "how far apart are these parts", not exact FPS.
//
// key: lowercase token the matcher looks for inside a user's part name.
// Longer keys win over shorter ones (so "rtx 4060 ti" beats "rtx 4060").

export const cpuTiers = [
  // AMD Ryzen 9000 (AM5)
  { key: 'ryzen 9 9950x3d', name: 'AMD Ryzen 9 9950X3D', score: 100, platform: 'am5' },
  { key: 'ryzen 9 9950x', name: 'AMD Ryzen 9 9950X', score: 96, platform: 'am5' },
  { key: 'ryzen 9 9900x', name: 'AMD Ryzen 9 9900X', score: 88, platform: 'am5' },
  { key: 'ryzen 7 9800x3d', name: 'AMD Ryzen 7 9800X3D', score: 86, platform: 'am5' },
  { key: 'ryzen 7 9700x', name: 'AMD Ryzen 7 9700X', score: 78, platform: 'am5' },
  { key: 'ryzen 5 9600x', name: 'AMD Ryzen 5 9600X', score: 70, platform: 'am5' },

  // AMD Ryzen 7000 (AM5)
  { key: 'ryzen 9 7950x3d', name: 'AMD Ryzen 9 7950X3D', score: 94, platform: 'am5' },
  { key: 'ryzen 9 7950x', name: 'AMD Ryzen 9 7950X', score: 92, platform: 'am5' },
  { key: 'ryzen 9 7900x', name: 'AMD Ryzen 9 7900X', score: 85, platform: 'am5' },
  { key: 'ryzen 9 7900', name: 'AMD Ryzen 9 7900', score: 82, platform: 'am5' },
  { key: 'ryzen 7 7800x3d', name: 'AMD Ryzen 7 7800X3D', score: 80, platform: 'am5' },
  { key: 'ryzen 7 7700x', name: 'AMD Ryzen 7 7700X', score: 74, platform: 'am5' },
  { key: 'ryzen 7 7700', name: 'AMD Ryzen 7 7700', score: 72, platform: 'am5' },
  { key: 'ryzen 5 7600x', name: 'AMD Ryzen 5 7600X', score: 66, platform: 'am5' },
  { key: 'ryzen 5 7600', name: 'AMD Ryzen 5 7600', score: 64, platform: 'am5' },

  // AMD Ryzen 5000 (AM4)
  { key: 'ryzen 9 5950x', name: 'AMD Ryzen 9 5950X', score: 78, platform: 'am4' },
  { key: 'ryzen 9 5900x', name: 'AMD Ryzen 9 5900X', score: 72, platform: 'am4' },
  { key: 'ryzen 7 5800x3d', name: 'AMD Ryzen 7 5800X3D', score: 65, platform: 'am4' },
  { key: 'ryzen 7 5800x', name: 'AMD Ryzen 7 5800X', score: 60, platform: 'am4' },
  { key: 'ryzen 7 5700x3d', name: 'AMD Ryzen 7 5700X3D', score: 60, platform: 'am4' },
  { key: 'ryzen 7 5700x', name: 'AMD Ryzen 7 5700X', score: 56, platform: 'am4' },
  { key: 'ryzen 7 5700g', name: 'AMD Ryzen 7 5700G', score: 52, platform: 'am4' },
  { key: 'ryzen 5 5600x', name: 'AMD Ryzen 5 5600X', score: 52, platform: 'am4' },
  { key: 'ryzen 5 5600g', name: 'AMD Ryzen 5 5600G', score: 48, platform: 'am4' },
  { key: 'ryzen 5 5600', name: 'AMD Ryzen 5 5600', score: 50, platform: 'am4' },
  { key: 'ryzen 5 5500', name: 'AMD Ryzen 5 5500', score: 44, platform: 'am4' },

  // AMD Ryzen 3000 (AM4)
  { key: 'ryzen 9 3950x', name: 'AMD Ryzen 9 3950X', score: 68, platform: 'am4' },
  { key: 'ryzen 9 3900x', name: 'AMD Ryzen 9 3900X', score: 62, platform: 'am4' },
  { key: 'ryzen 7 3800x', name: 'AMD Ryzen 7 3800X', score: 52, platform: 'am4' },
  { key: 'ryzen 7 3700x', name: 'AMD Ryzen 7 3700X', score: 50, platform: 'am4' },
  { key: 'ryzen 5 3600x', name: 'AMD Ryzen 5 3600X', score: 45, platform: 'am4' },
  { key: 'ryzen 5 3600', name: 'AMD Ryzen 5 3600', score: 43, platform: 'am4' },
  { key: 'ryzen 3 3300x', name: 'AMD Ryzen 3 3300X', score: 35, platform: 'am4' },
  { key: 'ryzen 3 3100', name: 'AMD Ryzen 3 3100', score: 30, platform: 'am4' },

  // AMD Ryzen 1000/2000 (AM4)
  { key: 'ryzen 7 2700x', name: 'AMD Ryzen 7 2700X', score: 42, platform: 'am4' },
  { key: 'ryzen 5 2600', name: 'AMD Ryzen 5 2600', score: 35, platform: 'am4' },
  { key: 'ryzen 7 1800x', name: 'AMD Ryzen 7 1800X', score: 35, platform: 'am4' },
  { key: 'ryzen 5 1600', name: 'AMD Ryzen 5 1600', score: 28, platform: 'am4' },

  // Intel Core Ultra 200 (LGA1851)
  { key: 'core ultra 9 285k', name: 'Intel Core Ultra 9 285K', score: 95, platform: 'lga1851' },
  { key: 'core ultra 7 265k', name: 'Intel Core Ultra 7 265K', score: 88, platform: 'lga1851' },
  { key: 'core ultra 5 245k', name: 'Intel Core Ultra 5 245K', score: 76, platform: 'lga1851' },

  // Intel 12th-14th gen (LGA1700)
  { key: 'i9-14900k', name: 'Intel Core i9-14900K', score: 94, platform: 'lga1700' },
  { key: 'i7-14700k', name: 'Intel Core i7-14700K', score: 88, platform: 'lga1700' },
  { key: 'i5-14600k', name: 'Intel Core i5-14600K', score: 76, platform: 'lga1700' },
  { key: 'i5-14400', name: 'Intel Core i5-14400', score: 60, platform: 'lga1700' },
  { key: 'i9-13900k', name: 'Intel Core i9-13900K', score: 92, platform: 'lga1700' },
  { key: 'i7-13700k', name: 'Intel Core i7-13700K', score: 84, platform: 'lga1700' },
  { key: 'i5-13600k', name: 'Intel Core i5-13600K', score: 72, platform: 'lga1700' },
  { key: 'i5-13400', name: 'Intel Core i5-13400', score: 58, platform: 'lga1700' },
  { key: 'i9-12900k', name: 'Intel Core i9-12900K', score: 82, platform: 'lga1700' },
  { key: 'i7-12700k', name: 'Intel Core i7-12700K', score: 74, platform: 'lga1700' },
  { key: 'i5-12600k', name: 'Intel Core i5-12600K', score: 64, platform: 'lga1700' },
  { key: 'i5-12400f', name: 'Intel Core i5-12400F', score: 52, platform: 'lga1700' },
  { key: 'i5-12400', name: 'Intel Core i5-12400', score: 52, platform: 'lga1700' },
  { key: 'i3-12100', name: 'Intel Core i3-12100', score: 40, platform: 'lga1700' },

  // Intel 10th-11th gen (LGA1200)
  { key: 'i9-11900k', name: 'Intel Core i9-11900K', score: 62, platform: 'lga1200' },
  { key: 'i7-11700k', name: 'Intel Core i7-11700K', score: 58, platform: 'lga1200' },
  { key: 'i5-11400', name: 'Intel Core i5-11400', score: 48, platform: 'lga1200' },
  { key: 'i9-10900k', name: 'Intel Core i9-10900K', score: 60, platform: 'lga1200' },
  { key: 'i7-10700k', name: 'Intel Core i7-10700K', score: 54, platform: 'lga1200' },
  { key: 'i5-10600k', name: 'Intel Core i5-10600K', score: 48, platform: 'lga1200' },
  { key: 'i5-10400', name: 'Intel Core i5-10400', score: 42, platform: 'lga1200' },
  { key: 'i3-10100', name: 'Intel Core i3-10100', score: 32, platform: 'lga1200' },

  // Intel 8th-9th gen (LGA1151v2)
  { key: 'i9-9900k', name: 'Intel Core i9-9900K', score: 55, platform: 'lga1151' },
  { key: 'i7-9700k', name: 'Intel Core i7-9700K', score: 50, platform: 'lga1151' },
  { key: 'i5-9600k', name: 'Intel Core i5-9600K', score: 42, platform: 'lga1151' },
  { key: 'i5-9400', name: 'Intel Core i5-9400', score: 36, platform: 'lga1151' },
  { key: 'i7-8700k', name: 'Intel Core i7-8700K', score: 48, platform: 'lga1151' },
  { key: 'i5-8600k', name: 'Intel Core i5-8600K', score: 42, platform: 'lga1151' },
  { key: 'i5-8400', name: 'Intel Core i5-8400', score: 36, platform: 'lga1151' },

  // Intel 6th-7th gen and older (LGA1151/LGA1150)
  { key: 'i7-7700k', name: 'Intel Core i7-7700K', score: 38, platform: 'intel-legacy' },
  { key: 'i5-7600k', name: 'Intel Core i5-7600K', score: 32, platform: 'intel-legacy' },
  { key: 'i7-6700k', name: 'Intel Core i7-6700K', score: 34, platform: 'intel-legacy' },
  { key: 'i5-6600k', name: 'Intel Core i5-6600K', score: 29, platform: 'intel-legacy' },
  { key: 'i7-4790k', name: 'Intel Core i7-4790K', score: 28, platform: 'intel-legacy' },
  { key: 'i5-4690k', name: 'Intel Core i5-4690K', score: 24, platform: 'intel-legacy' },
]

export const gpuTiers = [
  // NVIDIA RTX 50 series
  { key: 'rtx 5090', name: 'NVIDIA GeForce RTX 5090', score: 100 },
  { key: 'rtx 5080', name: 'NVIDIA GeForce RTX 5080', score: 88 },
  { key: 'rtx 5070 ti', name: 'NVIDIA GeForce RTX 5070 Ti', score: 80 },
  { key: 'rtx 5070', name: 'NVIDIA GeForce RTX 5070', score: 72 },
  { key: 'rtx 5060 ti', name: 'NVIDIA GeForce RTX 5060 Ti', score: 62 },
  { key: 'rtx 5060', name: 'NVIDIA GeForce RTX 5060', score: 55 },

  // NVIDIA RTX 40 series
  { key: 'rtx 4090', name: 'NVIDIA GeForce RTX 4090', score: 92 },
  { key: 'rtx 4080 super', name: 'NVIDIA GeForce RTX 4080 Super', score: 84 },
  { key: 'rtx 4080', name: 'NVIDIA GeForce RTX 4080', score: 82 },
  { key: 'rtx 4070 ti super', name: 'NVIDIA GeForce RTX 4070 Ti Super', score: 76 },
  { key: 'rtx 4070 ti', name: 'NVIDIA GeForce RTX 4070 Ti', score: 73 },
  { key: 'rtx 4070 super', name: 'NVIDIA GeForce RTX 4070 Super', score: 70 },
  { key: 'rtx 4070', name: 'NVIDIA GeForce RTX 4070', score: 65 },
  { key: 'rtx 4060 ti', name: 'NVIDIA GeForce RTX 4060 Ti', score: 55 },
  { key: 'rtx 4060', name: 'NVIDIA GeForce RTX 4060', score: 50 },

  // NVIDIA RTX 30 series
  { key: 'rtx 3090 ti', name: 'NVIDIA GeForce RTX 3090 Ti', score: 76 },
  { key: 'rtx 3090', name: 'NVIDIA GeForce RTX 3090', score: 73 },
  { key: 'rtx 3080 ti', name: 'NVIDIA GeForce RTX 3080 Ti', score: 72 },
  { key: 'rtx 3080', name: 'NVIDIA GeForce RTX 3080', score: 68 },
  { key: 'rtx 3070 ti', name: 'NVIDIA GeForce RTX 3070 Ti', score: 60 },
  { key: 'rtx 3070', name: 'NVIDIA GeForce RTX 3070', score: 57 },
  { key: 'rtx 3060 ti', name: 'NVIDIA GeForce RTX 3060 Ti', score: 52 },
  { key: 'rtx 3060', name: 'NVIDIA GeForce RTX 3060', score: 42 },
  { key: 'rtx 3050', name: 'NVIDIA GeForce RTX 3050', score: 30 },

  // NVIDIA RTX 20 series
  { key: 'rtx 2080 ti', name: 'NVIDIA GeForce RTX 2080 Ti', score: 58 },
  { key: 'rtx 2080 super', name: 'NVIDIA GeForce RTX 2080 Super', score: 52 },
  { key: 'rtx 2080', name: 'NVIDIA GeForce RTX 2080', score: 50 },
  { key: 'rtx 2070 super', name: 'NVIDIA GeForce RTX 2070 Super', score: 47 },
  { key: 'rtx 2070', name: 'NVIDIA GeForce RTX 2070', score: 43 },
  { key: 'rtx 2060 super', name: 'NVIDIA GeForce RTX 2060 Super', score: 40 },
  { key: 'rtx 2060', name: 'NVIDIA GeForce RTX 2060', score: 37 },

  // NVIDIA GTX 16 and 10 series
  { key: 'gtx 1660 super', name: 'NVIDIA GeForce GTX 1660 Super', score: 30 },
  { key: 'gtx 1660 ti', name: 'NVIDIA GeForce GTX 1660 Ti', score: 30 },
  { key: 'gtx 1660', name: 'NVIDIA GeForce GTX 1660', score: 28 },
  { key: 'gtx 1650 super', name: 'NVIDIA GeForce GTX 1650 Super', score: 22 },
  { key: 'gtx 1650', name: 'NVIDIA GeForce GTX 1650', score: 18 },
  { key: 'gtx 1080 ti', name: 'NVIDIA GeForce GTX 1080 Ti', score: 45 },
  { key: 'gtx 1080', name: 'NVIDIA GeForce GTX 1080', score: 38 },
  { key: 'gtx 1070 ti', name: 'NVIDIA GeForce GTX 1070 Ti', score: 36 },
  { key: 'gtx 1070', name: 'NVIDIA GeForce GTX 1070', score: 33 },
  { key: 'gtx 1060', name: 'NVIDIA GeForce GTX 1060', score: 22 },
  { key: 'gtx 1050 ti', name: 'NVIDIA GeForce GTX 1050 Ti', score: 13 },
  { key: 'gtx 1050', name: 'NVIDIA GeForce GTX 1050', score: 10 },

  // NVIDIA GTX 900 series
  { key: 'gtx 970', name: 'NVIDIA GeForce GTX 970', score: 18 },
  { key: 'gtx 960', name: 'NVIDIA GeForce GTX 960', score: 12 },
  { key: 'gtx 950', name: 'NVIDIA GeForce GTX 950', score: 9 },

  // AMD RX 9000 series
  { key: 'rx 9070 xt', name: 'AMD Radeon RX 9070 XT', score: 78 },
  { key: 'rx 9070', name: 'AMD Radeon RX 9070', score: 70 },
  { key: 'rx 9060 xt', name: 'AMD Radeon RX 9060 XT', score: 56 },

  // AMD RX 7000 series
  { key: 'rx 7900 xtx', name: 'AMD Radeon RX 7900 XTX', score: 84 },
  { key: 'rx 7900 xt', name: 'AMD Radeon RX 7900 XT', score: 78 },
  { key: 'rx 7900 gre', name: 'AMD Radeon RX 7900 GRE', score: 70 },
  { key: 'rx 7800 xt', name: 'AMD Radeon RX 7800 XT', score: 64 },
  { key: 'rx 7700 xt', name: 'AMD Radeon RX 7700 XT', score: 58 },
  { key: 'rx 7600 xt', name: 'AMD Radeon RX 7600 XT', score: 48 },
  { key: 'rx 7600', name: 'AMD Radeon RX 7600', score: 45 },

  // AMD RX 6000 series
  { key: 'rx 6950 xt', name: 'AMD Radeon RX 6950 XT', score: 70 },
  { key: 'rx 6900 xt', name: 'AMD Radeon RX 6900 XT', score: 68 },
  { key: 'rx 6800 xt', name: 'AMD Radeon RX 6800 XT', score: 64 },
  { key: 'rx 6800', name: 'AMD Radeon RX 6800', score: 60 },
  { key: 'rx 6750 xt', name: 'AMD Radeon RX 6750 XT', score: 54 },
  { key: 'rx 6700 xt', name: 'AMD Radeon RX 6700 XT', score: 51 },
  { key: 'rx 6650 xt', name: 'AMD Radeon RX 6650 XT', score: 44 },
  { key: 'rx 6600 xt', name: 'AMD Radeon RX 6600 XT', score: 42 },
  { key: 'rx 6600', name: 'AMD Radeon RX 6600', score: 38 },
  { key: 'rx 6500 xt', name: 'AMD Radeon RX 6500 XT', score: 20 },

  // AMD RX 5000 and older
  { key: 'rx 5700 xt', name: 'AMD Radeon RX 5700 XT', score: 44 },
  { key: 'rx 5700', name: 'AMD Radeon RX 5700', score: 41 },
  { key: 'rx 5600 xt', name: 'AMD Radeon RX 5600 XT', score: 37 },
  { key: 'rx 590', name: 'AMD Radeon RX 590', score: 22 },
  { key: 'rx 580', name: 'AMD Radeon RX 580', score: 20 },
  { key: 'rx 570', name: 'AMD Radeon RX 570', score: 17 },
  { key: 'rx 480', name: 'AMD Radeon RX 480', score: 19 },
  { key: 'rx 470', name: 'AMD Radeon RX 470', score: 16 },
  { key: 'vega 64', name: 'AMD Radeon RX Vega 64', score: 33 },
  { key: 'vega 56', name: 'AMD Radeon RX Vega 56', score: 30 },

  // Intel Arc
  { key: 'arc b580', name: 'Intel Arc B580', score: 48 },
  { key: 'arc a770', name: 'Intel Arc A770', score: 40 },
  { key: 'arc a750', name: 'Intel Arc A750', score: 36 },
  { key: 'arc a380', name: 'Intel Arc A380', score: 15 },

  // Integrated graphics (rough buckets — always far below any real card)
  { key: 'iris xe', name: 'Intel Iris Xe (integrated)', score: 10, integrated: true },
  { key: 'uhd graphics', name: 'Intel UHD Graphics (integrated)', score: 5, integrated: true },
  { key: 'hd graphics', name: 'Intel HD Graphics (integrated)', score: 4, integrated: true },
  { key: 'vega 8', name: 'AMD Radeon Vega 8 (integrated)', score: 8, integrated: true },
  { key: 'vega 7', name: 'AMD Radeon Vega 7 (integrated)', score: 8, integrated: true },
  { key: 'radeon graphics', name: 'AMD Radeon Graphics (integrated)', score: 8, integrated: true },
  { key: 'radeon 780m', name: 'AMD Radeon 780M (integrated)', score: 14, integrated: true },
]
