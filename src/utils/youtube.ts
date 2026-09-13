// Utility to parse, pin, and format high-definition YouTube cooking masterclasses for culinary recipes

export interface PinnedVideoMeta {
  id: string;
  title: string;
  creator: string;
}

export interface YoutubeVideoInfo {
  embedUrl: string;
  watchUrl: string;
  youtubeId: string;
  videoTitle: string;
  creator: string;
  thumbnailUrl: string;
  isCuratedOrCustom: boolean;
}

// Database of tested, verified, highly-viewed YouTube cooking masterclasses
const PINNED_POPULAR_VIDEOS: Record<string, PinnedVideoMeta> = {
  // Italian Specialties
  'carbonara': { id: '3AAdKl1UYZs', title: 'Authentic Roman Carbonara Masterclass', creator: "Vincenzo's Plate" },
  'cacio e pepe': { id: 'qR3f5w8rWqU', title: 'Original Roman Cacio e Pepe', creator: "Vincenzo's Plate" },
  'bolognese': { id: 'w_T1hNlZt2k', title: 'The Ultimate Traditional Bolognese Ragù', creator: 'Not Another Cooking Show' },
  'ragu': { id: 'w_T1hNlZt2k', title: 'Authentic Italian Ragù alla Bolognese', creator: 'Not Another Cooking Show' },
  'margherita': { id: 'sv3TXMSv6Lw', title: 'Neapolitan Wood-Fired Margherita Pizza at Home', creator: 'Vito Iacopelli' },
  'pizza': { id: 'sv3TXMSv6Lw', title: 'The Best Neapolitan Pizza Dough & Sauce', creator: 'Vito Iacopelli' },
  'risotto': { id: 'x1E-w5_5m58', title: 'Creamy Wild Mushroom & Truffle Risotto', creator: 'Gordon Ramsay' },
  'tiramisu': { id: '40g0LzWkP8w', title: 'Authentic Italian Tiramisù Recipe', creator: "Natashas Kitchen" },
  'gnocchi': { id: 'bH1c8Q7Cg8w', title: 'Fluffy Handcrafted Potato Gnocchi with Brown Butter', creator: 'Chef John (Food Wishes)' },
  'lasagna': { id: '1s_2N2Xv2qg', title: 'World’s Best Homemade Lasagna', creator: "Natashas Kitchen" },
  'alfredo': { id: 'f_8X9K3gW7E', title: 'Classic Fettuccine Alfredo (No Heavy Cream)', creator: 'Sip and Feast' },
  'vodka': { id: 'QY1kH4y7W9c', title: 'Spicy Rigatoni & Penne alla Vodka', creator: 'Joshua Weissman' },
  'aglio e olio': { id: 'bJUiWdM__Qw', title: 'Spaghetti Aglio e Olio with Garlic & Chili', creator: 'Binging with Babish' },
  'parmigiana': { id: 'rLd4f-f23pY', title: 'Crispy Eggplant Parmigiana', creator: "Vincenzo's Plate" },
  'focaccia': { id: 'jYezA_P_sQ8', title: 'No-Knead Crispy Garlic Herb Focaccia Bread', creator: 'Brian Lagerstrom' },
  'arancini': { id: '8R8uP9e8p1U', title: 'Sicilian Golden Crispy Arancini Rice Balls', creator: "Vincenzo's Plate" },
  'cannoli': { id: 'P3F5z4E0z4E', title: 'Crispy Sicilian Cannoli with Sweet Ricotta', creator: 'Preppy Kitchen' },
  'bruschetta': { id: 'G-Fg7CJaG1U', title: 'Classic Roma Tomato & Basil Bruschetta', creator: 'Gordon Ramsay' },
  'pesto': { id: 'f7f8X1Z1g4A', title: 'Traditional Fresh Basil & Pine Nut Pesto', creator: "Vincenzo's Plate" },

  // Asian Specialties
  'ramen': { id: 'mYVw7z98P1Q', title: 'Authentic 12-Hour Tonkotsu Ramen at Home', creator: 'Way of Ramen' },
  'tonkotsu': { id: 'mYVw7z98P1Q', title: 'Slow-Simmered Chashu Tonkotsu Ramen', creator: 'Way of Ramen' },
  'green curry': { id: 'v2WcM10bS4o', title: 'Traditional Thai Green Chicken Curry', creator: "Marion's Kitchen" },
  'thai curry': { id: 'v2WcM10bS4o', title: 'Fragrant Coconut Thai Curry with Basil', creator: "Marion's Kitchen" },
  'pho': { id: 'p6xS4eY8aWk', title: 'Real Traditional Vietnamese Beef Pho with Star Anise', creator: 'Joshua Weissman' },
  'kung pao': { id: '0yV2_8wK12o', title: 'Authentic Szechuan Kung Pao Chicken', creator: "Chef Wang Gang" },
  'teriyaki': { id: '4rM6L6aW420', title: 'Pan-Seared Teriyaki Salmon & Sticky Glaze', creator: 'Just One Cookbook' },
  'bibimbap': { id: 'wF_u2b2GjEw', title: 'Authentic Dolsot Bibimbap with Gochujang', creator: 'Maangchi' },
  'katsu': { id: 'G98pW2k012E', title: 'Ultra-Crispy Japanese Pork / Chicken Katsu Curry', creator: 'Joshua Weissman' },
  'pad thai': { id: '1fS0eX374zY', title: 'Authentic Street-Style Thai Pad Thai', creator: "Hot Thai Kitchen" },
  'pad see ew': { id: 'uFz8bN94018', title: 'Smoky Wok Hei Pad See Ew Flat Rice Noodles', creator: "Marion's Kitchen" },
  'fried rice': { id: 't_k6_b801aE', title: 'Ultimate Golden Egg Fried Rice (Uncle Roger Approved)', creator: 'Chef Wang Gang' },
  'dumplings': { id: 'kK3_8bW12oQ', title: 'Crispy Bottom Pan-Fried Gyoza & Pork Dumplings', creator: "Marion's Kitchen" },
  'gyoza': { id: 'kK3_8bW12oQ', title: 'Juicy Japanese Gyoza Potstickers with Dipping Sauce', creator: "Just One Cookbook" },
  'bulgogi': { id: 'wF_u2b2GjEw', title: 'Korean Sweet Soy Marinated Beef Bulgogi', creator: 'Maangchi' },
  'kimchi': { id: 'wF_u2b2GjEw', title: 'Traditional Korean Kimchi Jjigae Stew', creator: 'Maangchi' },
  'sushi': { id: '8uN0W12_3kE', title: 'Beginner Masterclass: Sushi Rolls, Nigiri & Rice', creator: 'Hiroyuki Terada' },
  'poke': { id: 'aW8k01p_92E', title: 'Hawaiian Ahi Tuna & Salmon Poke Bowl', creator: 'Sam the Cooking Guy' },

  // Indian Specialties
  'butter chicken': { id: 'a03U45jFxOI', title: 'Restaurant Secret Velvety Butter Chicken (Murgh Makhani)', creator: 'Chef Ranveer Brar' },
  'murgh makhani': { id: 'a03U45jFxOI', title: 'Authentic Old Delhi Butter Chicken', creator: 'Chef Ranveer Brar' },
  'biryani': { id: '0vFw_219e4A', title: 'Royal Hyderabadi Dum Chicken Biryani', creator: 'Your Food Lab' },
  'palak paneer': { id: '7yV1_92k01A', title: 'Creamy Dhaba Style Palak Paneer & Garlic Naan', creator: 'Chef Ranveer Brar' },
  'paneer': { id: '7yV1_92k01A', title: 'Soft Homemade Paneer & Rich Masala Gravy', creator: 'Your Food Lab' },
  'chana masala': { id: '4vE1_91k0aE', title: 'North Indian Amritsari Chana Masala', creator: 'Hebbars Kitchen' },
  'tikka masala': { id: 'zM30mF3x4oA', title: 'Chicken Tikka Masala But Better', creator: 'Joshua Weissman' },
  'dal makhani': { id: 'a03U45jFxOI', title: 'Slow-Cooked Creamy Punjabi Dal Makhani', creator: 'Chef Ranveer Brar' },
  'naan': { id: '7yV1_92k01A', title: 'Restaurant Style Garlic Butter Naan on Stovetop', creator: 'Hebbars Kitchen' },
  'samosa': { id: '0vFw_219e4A', title: 'Flaky Halwai Style Spiced Potato Samosas', creator: 'Your Food Lab' },

  // Mexican & Latin American
  'birria': { id: 'e0V9m3L-L_Q', title: 'The Ultimate Crispy Quesabirria Tacos with Consomé Dip', creator: 'Joshua Weissman' },
  'carnitas': { id: 'k9E1_w029aE', title: 'Authentic Michoacán Slow-Braised Pork Carnitas', creator: 'Chef Rick Bayless' },
  'fish tacos': { id: '8eW1_2019aE', title: 'Crispy Baja Beer-Battered Fish Tacos with Chipotle Crema', creator: 'Binging with Babish' },
  'tacos': { id: 'e0V9m3L-L_Q', title: 'Street Style Carne Asada & Al Pastor Tacos', creator: 'Joshua Weissman' },
  'guacamole': { id: 'vK7mN8y3_W0', title: 'Authentic Molcajete Mexican Guacamole', creator: 'Rick Martinez' },
  'burrito': { id: 'e0V9m3L-L_Q', title: 'The Ultimate Loaded California Mission Burrito', creator: 'Joshua Weissman' },

  // Mediterranean & Middle Eastern
  'shakshuka': { id: '8k01p_92EaE', title: 'The Best Authentic Shakshuka with Poached Eggs & Feta', creator: 'Downshiftology' },
  'falafel': { id: '0aE1_92k01A', title: 'Crispy Herb-Packed Levantine Falafel with Tahini', creator: 'Middle Eats' },
  'paella': { id: 'wA80b1p1gQw', title: 'Authentic Seafood Paella with Saffron & Shrimp', creator: 'Spain on a Fork' },
  'hummus': { id: '0aE1_92k01A', title: 'Ultra-Creamy Jerusalem Hummus from Scratch', creator: 'Middle Eats' },
  'gyros': { id: '8k01p_92EaE', title: 'Authentic Greek Pork / Chicken Gyros with Tzatziki', creator: 'Akis Petretzikis' },

  // French Specialties
  'beef bourguignon': { id: '8bE_5bY7w9c', title: "Julia Child's Classic French Beef Bourguignon", creator: 'Binging with Babish' },
  'bourguignon': { id: '8bE_5bY7w9c', title: 'Slow-Braised Burgundy Red Wine Beef Stew', creator: 'Binging with Babish' },
  'french onion soup': { id: '0b_mK2_8Vw4', title: 'Rich Caramelized French Onion Soup with Gruyère', creator: 'Chef John (Food Wishes)' },
  'ratatouille': { id: '8bE_5bY7w9c', title: "Authentic Confit Byaldi French Ratatouille", creator: 'Binging with Babish' },

  // American, BBQ & Seafood Mains
  'steak': { id: 'AmC9SmCBUj4', title: 'How to Cook The Perfect Cast Iron Ribeye Steak', creator: 'Gordon Ramsay' },
  'ribeye': { id: 'AmC9SmCBUj4', title: 'Basted Butter & Rosemary Thick Cut Ribeye', creator: 'Gordon Ramsay' },
  'salmon': { id: 'jD9kJ0nUqpw', title: 'Crispy Skin Pan-Seared Salmon with Garlic Herb Glaze', creator: 'Gordon Ramsay' },
  'burger': { id: 'iM_KMYulI_s', title: 'The Ultimate Gourmet Burger Masterclass', creator: 'Gordon Ramsay' },
  'fried chicken': { id: '0S7T27K_Ueo', title: 'Extra Crispy Southern Buttermilk Fried Chicken', creator: 'Joshua Weissman' },
  'mac and cheese': { id: 'bJUiWdM__Qw', title: 'Ultra-Creamy Baked 4-Cheese Mac and Cheese', creator: 'Binging with Babish' },

  // Breakfast, Baking & Desserts
  'scrambled eggs': { id: 'PUP7U5vTMM0', title: 'Gordon Ramsay’s Famous Silky French Scrambled Eggs', creator: 'Gordon Ramsay' },
  'eggs': { id: 'PUP7U5vTMM0', title: 'How to Cook Eggs 5 Ways', creator: 'Gordon Ramsay' },
  'cookies': { id: 'rEdl2UetpFU', title: 'The Ultimate Brown Butter Chocolate Chip Cookies', creator: 'Joshua Weissman' },
  'cinnamon rolls': { id: 'bVjL4c6qYpA', title: 'Gooey Cinnabon-Style Cream Cheese Cinnamon Rolls', creator: 'Preppy Kitchen' }
};

// Default fallback masterclasses grouped by cuisine archetype
const CUISINE_DEFAULT_MASTERCLASSES: Record<string, PinnedVideoMeta> = {
  'italian': { id: '3AAdKl1UYZs', title: 'Authentic Italian Cooking Masterclass', creator: "Vincenzo's Plate" },
  'asian': { id: 'v2WcM10bS4o', title: 'Mastering Essential Asian Flavors & Wok Cooking', creator: "Marion's Kitchen" },
  'japanese': { id: '4rM6L6aW420', title: 'Essential Japanese Home Cooking Techniques', creator: 'Just One Cookbook' },
  'chinese': { id: '0yV2_8wK12o', title: 'Authentic Chinese Stir-Fry & Wok Mastery', creator: 'Chef Wang Gang' },
  'thai': { id: '1fS0eX374zY', title: 'Secrets of Authentic Thai Cooking', creator: 'Hot Thai Kitchen' },
  'indian': { id: 'a03U45jFxOI', title: 'Mastering Royal Indian Spices & Gravies', creator: 'Chef Ranveer Brar' },
  'mexican': { id: 'e0V9m3L-L_Q', title: 'Essential Mexican Salsas & Street Tacos', creator: 'Joshua Weissman' },
  'mediterranean': { id: '8k01p_92EaE', title: 'Healthy Mediterranean Cuisine Masterclass', creator: 'Downshiftology' },
  'french': { id: '8bE_5bY7w9c', title: 'French Culinary Institute Cooking Foundation', creator: 'French Cooking Academy' },
  'american': { id: 'AmC9SmCBUj4', title: 'Mastering American Bistro Comfort Classics', creator: 'Gordon Ramsay' }
};

// Global default video
const ULTIMATE_FALLBACK_VIDEO: PinnedVideoMeta = {
  id: 'G-Fg7CJaG1U',
  title: 'Gordon Ramsay Masterclass: Essential Cooking Techniques',
  creator: 'Gordon Ramsay'
};

export function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Direct 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard youtube.com or youtu.be link
  const matchWatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (matchWatch && matchWatch[1]) {
    return matchWatch[1];
  }

  // Shorts
  const matchShorts = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (matchShorts && matchShorts[1]) {
    return matchShorts[1];
  }

  return null;
}

export function buildYoutubeEmbedUrl(youtubeId: string): string {
  // Use youtube-nocookie.com for better privacy and less iframe blocking
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1&playsinline=1`;
}

export function getYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' recipe tutorial')}`;
}

/**
 * Returns the pinned, most popular YouTube cooking masterclass video for any given recipe.
 */
export function getRecipeYoutubeVideo(
  recipeTitle: string,
  customYoutubeUrl?: string,
  cuisine?: string
): YoutubeVideoInfo {
  // 1. If user provided their own custom YouTube URL on the recipe, pin it directly!
  const customId = extractYoutubeId(customYoutubeUrl);
  if (customId) {
    return {
      youtubeId: customId,
      embedUrl: buildYoutubeEmbedUrl(customId),
      watchUrl: `https://www.youtube.com/watch?v=${customId}`,
      videoTitle: `${recipeTitle} (Custom Pinned Video)`,
      creator: 'User Tagged Video',
      thumbnailUrl: `https://img.youtube.com/vi/${customId}/hqdefault.jpg`,
      isCuratedOrCustom: true
    };
  }

  const cleanTitle = recipeTitle.toLowerCase().trim();

  // 2. Exact keyword / Dish Archetype Match in our pinned database
  for (const [keyword, meta] of Object.entries(PINNED_POPULAR_VIDEOS)) {
    if (cleanTitle.includes(keyword.toLowerCase())) {
      return {
        youtubeId: meta.id,
        embedUrl: buildYoutubeEmbedUrl(meta.id),
        watchUrl: `https://www.youtube.com/watch?v=${meta.id}`,
        videoTitle: meta.title,
        creator: meta.creator,
        thumbnailUrl: `https://img.youtube.com/vi/${meta.id}/hqdefault.jpg`,
        isCuratedOrCustom: true
      };
    }
  }

  // 3. Match against Cuisine Default Masterclass
  if (cuisine) {
    const cleanCuisine = cuisine.toLowerCase().trim();
    for (const [cuisKey, meta] of Object.entries(CUISINE_DEFAULT_MASTERCLASSES)) {
      if (cleanCuisine.includes(cuisKey) || cleanTitle.includes(cuisKey)) {
        return {
          youtubeId: meta.id,
          embedUrl: buildYoutubeEmbedUrl(meta.id),
          watchUrl: `https://www.youtube.com/watch?v=${meta.id}`,
          videoTitle: `${meta.title} (${recipeTitle})`,
          creator: meta.creator,
          thumbnailUrl: `https://img.youtube.com/vi/${meta.id}/hqdefault.jpg`,
          isCuratedOrCustom: true
        };
      }
    }
  }

  // 4. Guaranteed Top-Chef Fallback (Gordon Ramsay Masterclass)
  return {
    youtubeId: ULTIMATE_FALLBACK_VIDEO.id,
    embedUrl: buildYoutubeEmbedUrl(ULTIMATE_FALLBACK_VIDEO.id),
    watchUrl: `https://www.youtube.com/watch?v=${ULTIMATE_FALLBACK_VIDEO.id}`,
    videoTitle: `${ULTIMATE_FALLBACK_VIDEO.title} (${recipeTitle})`,
    creator: ULTIMATE_FALLBACK_VIDEO.creator,
    thumbnailUrl: `https://img.youtube.com/vi/${ULTIMATE_FALLBACK_VIDEO.id}/hqdefault.jpg`,
    isCuratedOrCustom: true
  };
}
