/* ============================================================
   OUD HOUSE — Fragrance catalogue
   ------------------------------------------------------------
   EDIT THIS FILE to add / change fragrances.
   Each entry:
     id       — unique slug used in the URL (no spaces)
     name     — display name
     family   — olfactory family (used for the filter chips)
     desc     — short description
     image    — path to the product photo
     price    — display price (string, so you can write "From €25")
     priceEUR — numeric price in euro, used by the cart / checkout
     size     — bottle size text
     type     — "Oil" or "Eau de Parfum"
     longevity— display text shown on the detail page
     notes    — top / heart / base arrays (Fragrantica-style pyramid)
     accords  — main accords, strongest first. strength is 0–100
                (bar width). Colours come from ACCORD_COLORS in main.js.
     wear     — when-to-wear meters, 0–100 for each of:
                winter, spring, summer, fall, day, night
   ============================================================ */

const FRAGRANCES = [
  {
    id: 'royal-oud',
    name: 'Royal Oud',
    family: 'Woody Oriental',
    desc: 'The house signature. Deep Cambodian oud wrapped in smoked amber and a whisper of rose — regal, dark and unmistakable.',
    image: 'assets/img/product-collection.jpg',
    price: 'From €35',
    priceEUR: 35,
    size: '12ml',
    type: 'Oil',
    longevity: '10–12 hrs',
    notes: {
      top: ['Saffron', 'Bergamot'],
      heart: ['Cambodian Oud', 'Taif Rose'],
      base: ['Smoked Amber', 'Musk', 'Sandalwood']
    },
    accords: [
      { name: 'oud', strength: 100 },
      { name: 'woody', strength: 88 },
      { name: 'amber', strength: 74 },
      { name: 'smoky', strength: 62 },
      { name: 'rose', strength: 50 },
      { name: 'musky', strength: 38 }
    ],
    wear: { winter: 95, spring: 40, summer: 20, fall: 85, day: 35, night: 95 }
  },
  {
    id: 'amber-nuit',
    name: 'Amber Nuit',
    family: 'Amber',
    desc: 'Golden amber melted over vanilla and labdanum. A warm evening scent that lingers on skin and fabric alike.',
    image: 'assets/img/product-box-bottles.jpg',
    price: 'From €28',
    priceEUR: 28,
    size: '12ml',
    type: 'Oil',
    longevity: '8–10 hrs',
    notes: {
      top: ['Orange Blossom', 'Pink Pepper'],
      heart: ['Amber', 'Labdanum'],
      base: ['Vanilla', 'Tonka Bean', 'Benzoin']
    },
    accords: [
      { name: 'amber', strength: 100 },
      { name: 'vanilla', strength: 86 },
      { name: 'balsamic', strength: 70 },
      { name: 'sweet', strength: 60 },
      { name: 'warm spicy', strength: 45 },
      { name: 'white floral', strength: 32 }
    ],
    wear: { winter: 85, spring: 45, summer: 25, fall: 90, day: 45, night: 85 }
  },
  {
    id: 'musk-al-lail',
    name: 'Musk Al Lail',
    family: 'Musk',
    desc: 'A clean, powdery white musk with a soft floral heart — the scent of freshly pressed linen at midnight.',
    image: 'assets/img/product-oil-cap.jpg',
    price: 'From €22',
    priceEUR: 22,
    size: '12ml',
    type: 'Oil',
    longevity: '6–8 hrs',
    notes: {
      top: ['Aldehydes', 'Lily of the Valley'],
      heart: ['White Musk', 'Jasmine'],
      base: ['Powdery Musk', 'Cedarwood']
    },
    accords: [
      { name: 'musky', strength: 100 },
      { name: 'powdery', strength: 84 },
      { name: 'white floral', strength: 68 },
      { name: 'fresh', strength: 55 },
      { name: 'woody', strength: 36 }
    ],
    wear: { winter: 45, spring: 90, summer: 75, fall: 50, day: 90, night: 55 }
  },
  {
    id: 'oud-safari',
    name: 'Oud Safari',
    family: 'Woody Oriental',
    desc: 'Raw African oud with leather and spice — untamed, smoky and built for those who want to be remembered.',
    image: 'assets/img/product-collection.jpg',
    price: 'From €38',
    priceEUR: 38,
    size: '12ml',
    type: 'Oil',
    longevity: '12+ hrs',
    notes: {
      top: ['Black Pepper', 'Cardamom'],
      heart: ['African Oud', 'Leather'],
      base: ['Patchouli', 'Vetiver', 'Dark Amber']
    },
    accords: [
      { name: 'oud', strength: 100 },
      { name: 'leather', strength: 90 },
      { name: 'warm spicy', strength: 76 },
      { name: 'smoky', strength: 66 },
      { name: 'woody', strength: 54 },
      { name: 'earthy', strength: 40 }
    ],
    wear: { winter: 90, spring: 30, summer: 15, fall: 90, day: 25, night: 100 }
  },
  {
    id: 'rose-taifi',
    name: 'Rose Taifi',
    family: 'Floral',
    desc: 'The queen of roses, distilled in the old way. Honeyed Taif rose deepened with a touch of oud and saffron.',
    image: 'assets/img/product-box-bottles.jpg',
    price: 'From €30',
    priceEUR: 30,
    size: '12ml',
    type: 'Oil',
    longevity: '8–10 hrs',
    notes: {
      top: ['Saffron', 'Geranium'],
      heart: ['Taif Rose', 'Damask Rose'],
      base: ['Oud', 'Honey', 'Amber']
    },
    accords: [
      { name: 'rose', strength: 100 },
      { name: 'floral', strength: 85 },
      { name: 'honey', strength: 70 },
      { name: 'warm spicy', strength: 55 },
      { name: 'oud', strength: 45 },
      { name: 'amber', strength: 34 }
    ],
    wear: { winter: 60, spring: 85, summer: 45, fall: 70, day: 70, night: 75 }
  },
  {
    id: 'sultan-edp',
    name: 'Sultan',
    family: 'Woody Oriental',
    desc: 'Our flagship eau de parfum. The Royal Oud DNA, lifted with bergamot and built to project — bottled at 50ml.',
    image: 'assets/img/product-collection.jpg',
    price: 'From €65',
    priceEUR: 65,
    size: '50ml',
    type: 'Eau de Parfum',
    longevity: '8–10 hrs',
    notes: {
      top: ['Bergamot', 'Saffron', 'Cinnamon'],
      heart: ['Oud', 'Rose', 'Incense'],
      base: ['Amber', 'Musk', 'Vanilla']
    },
    accords: [
      { name: 'oud', strength: 100 },
      { name: 'warm spicy', strength: 88 },
      { name: 'amber', strength: 78 },
      { name: 'incense', strength: 64 },
      { name: 'citrus', strength: 48 },
      { name: 'vanilla', strength: 36 }
    ],
    wear: { winter: 85, spring: 55, summer: 30, fall: 85, day: 55, night: 90 }
  },
  {
    id: 'white-oud',
    name: 'White Oud',
    family: 'Musk',
    desc: 'Oud without the smoke — creamy, soft and luminous. The gentlest way into the world of agarwood.',
    image: 'assets/img/product-oil-cap.jpg',
    price: 'From €32',
    priceEUR: 32,
    size: '12ml',
    type: 'Oil',
    longevity: '8–10 hrs',
    notes: {
      top: ['Bergamot', 'Nutmeg'],
      heart: ['White Oud', 'Orris'],
      base: ['Sandalwood', 'White Musk', 'Tonka']
    },
    accords: [
      { name: 'woody', strength: 100 },
      { name: 'musky', strength: 86 },
      { name: 'powdery', strength: 72 },
      { name: 'oud', strength: 58 },
      { name: 'citrus', strength: 42 },
      { name: 'sweet', strength: 30 }
    ],
    wear: { winter: 55, spring: 80, summer: 60, fall: 65, day: 85, night: 60 }
  },
  {
    id: 'ambre-du-soir',
    name: 'Ambre du Soir',
    family: 'Amber',
    desc: 'A dense amber-incense accord with dried fruits and myrrh — winter evenings in a bottle.',
    image: 'assets/img/product-box-bottles.jpg',
    price: 'From €34',
    priceEUR: 34,
    size: '12ml',
    type: 'Oil',
    longevity: '10–12 hrs',
    notes: {
      top: ['Dried Fruits', 'Clove'],
      heart: ['Amber', 'Myrrh', 'Incense'],
      base: ['Oakmoss', 'Vanilla', 'Musk']
    },
    accords: [
      { name: 'amber', strength: 100 },
      { name: 'incense', strength: 88 },
      { name: 'balsamic', strength: 74 },
      { name: 'sweet', strength: 62 },
      { name: 'warm spicy', strength: 50 },
      { name: 'earthy', strength: 35 }
    ],
    wear: { winter: 100, spring: 25, summer: 10, fall: 90, day: 30, night: 95 }
  }
];

/* Contact links — update these with the client's real details */
const CONTACT = {
  instagram: 'https://www.instagram.com/oudhousedbn',
  whatsapp: 'https://wa.me/353000000000', // TODO: replace with real WhatsApp number (Irish format: 353 + number without leading 0)
  email: 'orders@oudhousedbn.ie'          // TODO: replace with real email
};
