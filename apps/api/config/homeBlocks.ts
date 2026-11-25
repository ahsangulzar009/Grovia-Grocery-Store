export const HOME_BLOCKS = [
  { 
    key: "hero", 
    label: "Hero carousel", 
    description: "The promotional slides from Ads banners." 
  },
  { 
    key: "categories", 
    label: "Shop by category", 
    description: "The aisles as round tiles." 
  },
  { 
    key: "best-selling", 
    label: "Best selling products", 
    description: "A product rail ranked by top sales." 
  },
  { 
    key: "new-arrivals", 
    label: "New arrivals", 
    description: "The newest ten products." 
  },
  { 
    key: "seller-banner", 
    label: "Seller banner", 
    description: "The featured seller strip with a call to action." 
  },
  { 
    key: "gourmet-selection", 
    label: "Gourmet selection", 
    description: "Shops and the editors' top picks." 
  },
  { 
    key: "visit-store", 
    label: "Visit our store", 
    description: "The \"Visit Our Store\" rail - highlighting physical locations." 
  },
  { 
    key: "new-launch", 
    label: "New launch", 
    description: "The launch spotlight." 
  },
  { 
    key: "perks", 
    label: "Perks", 
    description: "Delivery, freshness and returns promises." 
  },
  { 
    key: "grocery-cta", 
    label: "Grocery call to action", 
    description: "The closing banner." 
  },
  { 
    key: "latest-blogs", 
    label: "Latest blogs", 
    description: "The four newest journal posts." 
  }
] as const;

export type HomeBlockKey = (typeof HOME_BLOCKS)[number]["key"];