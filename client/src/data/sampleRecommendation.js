//This file gives the results page something to display while we build the frontend.

export const sampleRecommendation = {
  bestUpgrade: {
    part: "RX 6750 XT",
    type: "GPU",
    estimatedPrice: "$300 - $370 used",
    reason:
      "Your CPU is still usable, but your GPU is likely the bigger limit in most games. A GPU upgrade should give the biggest performance boost for this budget."
  },

  compatibilityNotes: [
    "Because you did not enter your exact PSU model, this recommendation assumes you have enough wattage. A 650W+ PSU is recommended for this upgrade.",
    "Because you did not enter your case, GPU size compatibility cannot be fully verified. Before buying, check your case's max GPU length.",
    "Motherboard compatibility is usually not an issue for this GPU upgrade because modern GPUs use PCIe."
  ],

  buyOptions: [
    {
      store: "eBay",
      price: "Example used price: $325",
      url: "https://www.ebay.com"
    },
    {
      store: "Best Buy",
      price: "Example new price: varies",
      url: "https://www.bestbuy.com"
    }
  ]
};