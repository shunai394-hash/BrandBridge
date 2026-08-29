/**
 * Local blog image library under public/images/blog/japan/.
 * Filenames were copied from the folder on disk — do not invent extra paths.
 */
export const BLOG_JAPAN_IMAGE_FILES = {
  consultant: "462634-consultant-779590.jpg",
  shoppingStreet: "anthr_photoblog-woman-4335235_1920 (1).jpg",
  analytics: "as_photography-digital-marketing-1725340_1920.jpg",
  asPhotographyDigitalMarketing: "as_photography-digital-marketing-1725340_1920.jpg",
  templeLantern: "binmassam-temple-4807321.jpg",
  goldenPavilion: "chiemseherin-golden-pavilion-9469712.jpg",
  citySkyline: "deltaworks-city-5716456.jpg",
  waterTorii: "deltaworks-japan-530348.jpg",
  kimono: "djedj-kimono-5507132.jpg",
  newYear: "hirokazutouwaku-new-year-7006590.jpg",
  gardenTsukubai: "jana-japanese-garden-437289.jpg",
  zenGarden: "jggrz-nature-4955817.jpg",
  mtFuji: "kimura2-mountain-477832.jpg",
  kyotoStreet: "lapisbleue-women-6670092.jpg",
  fushimiTorii: "leonpendragon-woman-6805531.jpg",
  handshake: "mudaylahkholil-ai-generated-9180034.jpg",
  villageRoad: "nguyengianga2-road-7704729.jpg",
  chureitoPagoda: "pexels-ebrar-photography-2148748546-30626074.jpg",
  fujiSakura: "pexels-nguyen-khac-tien-252426281-12544861.jpg",
  souvenirShop: "pexels-shtefutsa-38944339.jpg",
  tokouNobuhiro: "pexels-tokuo-nobuhiro-79378678-17844153.jpg",
  akihabara: "sofi5t-japan-4141581.jpg",
  gusbellsstudioTokyoTower: "gusbellsstudio-tokyo-tower-825196.jpg",
  mirkostoedterTea: "mirkostoedter-tea-6568547.jpg",
  watappoJapan: "watappo-japan-2531766.jpg",
  djedjKimono: "djedj-kimono-5507132.jpg",
  derwegGoldenTemple: "derweg-golden-temple-7658947.jpg",
  lapisbleueWomen: "lapisbleue-women-6670092.jpg",
  cristobagarciaModern: "cristobagarcia-modern-3107019_1920.jpg",
  fernandozBusinessMeeting: "fernandoz-business-meeting-10409773_1920.jpg",
  mromerortaSkyscraper: "mromerorta-skyscraper-3032786.jpg",
  shioDesignJpFood: "shio_design_jp-food-9384171.jpg",
  tungart7Ecommerce: "tungart7-e-commerce-8656646_1920.jpg",
  binmassamMemory: "binmassam-memory-4807332.jpg",
} as const;

export type BlogJapanImageId = keyof typeof BLOG_JAPAN_IMAGE_FILES;

export function blogJapanSrc(id: BlogJapanImageId): string {
  // Pass the real filename. next/image encodes the optimizer URL itself.
  return `/images/blog/japan/${BLOG_JAPAN_IMAGE_FILES[id]}`;
}









