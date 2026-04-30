export const TRAITS = {
  bodyShape: {
    Globular: 0,
    ShortColumnar: 1,
    Columnar: 2,
    Barrel: 3,
    Clumping: 4,
    Depressed: 5,
    Segmented: 6,
    Tuberculate: 7,
    CrestedTendency: 8,
    MonstroseTendency: 9,
    Spiral: 10,
    Flattened: 11,
    Irregular: 12,
  },

  ribCount: {
    VeryLow: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    VeryHigh: 4,
    Extreme: 5,
    Irregular: 6,
  },

  epidermisColor: {
    DarkGreen: 0,
    BlueGreen: 1,
    GreyGreen: 2,
    Olive: 3,
    PurpleTint: 4,
    Bronze: 5,
    YellowVariegated: 6,
    WhiteVariegated: 7,
    RedStressTint: 8,
    Grey: 9,
  },

  spineLength: {
    None: 0,
    VeryShort: 1,
    Short: 2,
    Medium: 3,
    Long: 4,
    VeryLong: 5,
    Extreme: 6,
  },

  spineDensity: {
    None: 0,
    Sparse: 1,
    Medium: 2,
    Dense: 3,
    VeryDense: 4,
    WoolCovered: 5,
  },

  spineColor: {
    White: 0,
    Cream: 1,
    Yellow: 2,
    Golden: 3,
    Brown: 4,
    Black: 5,
    Red: 6,
    DarkPurple: 7,
  },

  areoleSize: {
    Tiny: 0,
    Small: 1,
    Medium: 2,
    Large: 3,
    Huge: 4,
  },

  woolAmount: {
    None: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    Extreme: 4,
  },

  flowerColor: {
    White: 0,
    Pink: 1,
    Yellow: 2,
    Red: 3,
    Purple: 4,
    Orange: 5,
    Multicolor: 6,
    RareBiColor: 7,
  },

  growthSpeed: {
    VerySlow: 0,
    Slow: 1,
    Medium: 2,
    Fast: 3,
    VeryFast: 4,
  },

  rotResistance: {
    VeryLow: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    VeryHigh: 4,
  },

  offsetRate: {
    None: 0,
    Rare: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    Aggressive: 5,
  }
} as const;