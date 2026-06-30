export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  pothole: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
  streetlight: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
  garbage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
  water: "https://images.unsplash.com/photo-1600606154635-500a1069d782?auto=format&fit=crop&w=800&q=80",
  water_leakage: "https://images.unsplash.com/photo-1600606154635-500a1069d782?auto=format&fit=crop&w=800&q=80",
  sewage: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
  property_damage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  other: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80"
};

export function getIssueImageUrl(imageUrl: string | undefined | null, category: string): string | undefined {
  const normCategory = category ? category.toLowerCase() : "other";
  
  // List of old, redundant, or incorrect placeholder image snippets
  const isPlaceholderOrIncorrect = !imageUrl ||
    imageUrl.includes("picsum.photos") ||
    // Old pothole (if it's not a pothole category)
    (imageUrl.includes("photo-1515162816999-a0c47dc192f7") && normCategory !== "pothole") ||
    // Old pancakes (street light)
    imageUrl.includes("photo-1506084868230") ||
    // Old abstract curves (incorrect street light)
    imageUrl.includes("photo-1518005020951-eccb494ad742") ||
    // Incorrect street light galaxy/sunset
    imageUrl.includes("photo-1478760329108-5c3ed9d495a0") ||
    // Incorrect book image (previously used for streetlights)
    imageUrl.includes("photo-1509021436665") ||
    // Incorrect streetlight handlamp
    imageUrl.includes("photo-1513542789411") ||
    // Old dumplings / food (incorrect garbage)
    imageUrl.includes("photo-1563245372-f21724e3856d") ||
    // Incorrect garbage blue recycling bins
    imageUrl.includes("photo-1611284446314-60a58ac0deb9") ||
    // Old portrait of young man (incorrect water)
    imageUrl.includes("photo-1541855492-581f618f69a0") ||
    // Old park / path with trees (incorrect water)
    imageUrl.includes("photo-1519331379826-f10be5486c6f") ||
    // Incorrect water logging snowy forest
    imageUrl.includes("photo-1485594050903") ||
    // Incorrect water logging street forest
    imageUrl.includes("photo-1485738422979") ||
    // Old camping site (incorrect sewage)
    imageUrl.includes("photo-1504280390367-361c6d9f38f4") ||
    // Old sewage / abstract (incorrect sewage)
    imageUrl.includes("photo-1542060748-10c28b629f6f") ||
    // Incorrect sewage chemist/lab worker
    imageUrl.includes("photo-1581056771107-24ca5f033842") ||
    // Incorrect sewage laboratory/old wastewater
    imageUrl.includes("photo-1628157582853") ||
    // Old dentist room (incorrect property damage)
    imageUrl.includes("photo-1584622650111-993a426fbf0a") ||
    // Old property damage construction (incorrect property damage)
    imageUrl.includes("photo-1589939705384-5185137a7f0f") ||
    // Old street / other placeholder
    imageUrl.includes("photo-1473163928189-364b2c4e1135") ||
    imageUrl === "url";

  if (isPlaceholderOrIncorrect) {
    return CATEGORY_FALLBACK_IMAGES[normCategory] || CATEGORY_FALLBACK_IMAGES.other;
  }
  return imageUrl;
}
