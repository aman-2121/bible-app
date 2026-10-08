import React from 'react';
import { View, StyleSheet, Platform, Image, ViewStyle, StyleProp } from 'react-native';

export type OrthodoxCrossVariant = 'lalibela' | 'gondar' | 'axum' | 'meskel';

interface OrthodoxCrossProps {
  size?: number;
  variant?: OrthodoxCrossVariant;
  color?: string;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

// 1. Lalibela Diamond Lattice Cross (መስቀለ ላሊበላ)
const LALIBELA_SVG = `
  <path d="M60 4 L64 12 L60 17 L56 12 Z M60 10 L68 18 L60 22 L52 18 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M60 116 L64 108 L60 103 L56 108 Z M60 110 L68 102 L60 98 L52 102 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M4 60 L12 56 L17 60 L12 64 Z M10 60 L18 52 L22 60 L18 68 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M116 60 L108 56 L103 60 L108 64 Z M110 60 L102 52 L98 60 L102 68 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M60 16 L104 60 L60 104 L16 60 Z" stroke="url(#ethiopianGoldGrad)" stroke-width="3.2" fill="none" stroke-linejoin="round"/>
  <path d="M60 24 L96 60 L60 96 L24 60 Z" stroke="url(#ethiopianGoldGrad)" stroke-width="1.6" stroke-dasharray="2.5 1.5" fill="none"/>
  <path d="M66 32 C72 32 78 38 78 44 C78 50 72 52 68 48 C64 44 68 38 74 38 M82 46 C88 48 92 54 90 60 M66 22 C76 24 86 34 88 44" stroke="url(#ethiopianGoldGrad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M54 32 C48 32 42 38 42 44 C42 50 48 52 52 48 C56 44 52 38 46 38 M38 46 C32 48 28 54 30 60 M54 22 C44 24 34 34 32 44" stroke="url(#ethiopianGoldGrad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M66 88 C72 88 78 82 78 76 C78 70 72 68 68 72 C64 76 68 82 74 82 M82 74 C88 72 92 66 90 60 M66 98 C76 96 86 86 88 76" stroke="url(#ethiopianGoldGrad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M54 88 C48 88 42 82 42 76 C42 70 48 68 52 72 C56 76 52 82 46 82 M38 74 C32 72 28 66 30 60 M54 98 C44 96 34 86 32 76" stroke="url(#ethiopianGoldGrad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M54 54 L44 32 L76 32 L66 54 L88 44 L88 76 L66 66 L76 88 L44 88 L54 66 L32 76 L32 44 Z" fill="url(#ethiopianBronzeGrad)"/>
  <path d="M55 55 L46 34 L74 34 L65 55 L86 46 L86 74 L65 65 L74 86 L46 86 L55 65 L34 74 L34 46 Z" fill="url(#ethiopianGoldGrad)" stroke="#ffea9f" stroke-width="1" stroke-linejoin="bevel"/>
  <path d="M56 46 L50 36 L70 36 L64 46 Z" fill="#080f21" stroke="url(#ethiopianGoldGrad)" stroke-width="1"/>
  <path d="M56 74 L50 84 L70 84 L64 74 Z" fill="#080f21" stroke="url(#ethiopianGoldGrad)" stroke-width="1"/>
  <path d="M46 56 L36 50 L36 70 L46 64 Z" fill="#080f21" stroke="url(#ethiopianGoldGrad)" stroke-width="1"/>
  <path d="M74 56 L84 50 L84 70 L74 64 Z" fill="#080f21" stroke="url(#ethiopianGoldGrad)" stroke-width="1"/>
  <rect x="56" y="56" width="8" height="8" rx="2" fill="#ffea9f" stroke="url(#ethiopianBronzeGrad)" stroke-width="1"/>
  <path d="M60 52 L60 68 M52 60 L68 60" stroke="#b88318" stroke-width="1.2" stroke-linecap="round"/>
`;

// 2. Gondar Halo Cross (መስቀለ ጎንደር) — Majestic circular sun/halo with radiating loops & trefoils
const GONDAR_SVG = `
  <!-- Outer Gondar Radiant Rings -->
  <circle cx="60" cy="60" r="48" stroke="url(#ethiopianGoldGrad)" stroke-width="2.5" fill="none"/>
  <circle cx="60" cy="60" r="40" stroke="url(#ethiopianGoldGrad)" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/>
  <circle cx="60" cy="60" r="32" stroke="url(#ethiopianBronzeGrad)" stroke-width="1.5" fill="none"/>

  <!-- Radiating Halo Petals / Openwork Loops (12 Rays of the Apostles) -->
  <path d="M60 12 L60 20 M60 100 L60 108 M12 60 L20 60 M100 60 L108 60" stroke="url(#ethiopianGoldGrad)" stroke-width="2" stroke-linecap="round"/>
  <path d="M26 26 L32 32 M88 88 L94 94 M26 94 L32 88 M88 26 L94 32" stroke="url(#ethiopianGoldGrad)" stroke-width="2" stroke-linecap="round"/>
  <path d="M42 14 L46 22 M78 14 L74 22 M42 106 L46 98 M78 106 L74 98" stroke="url(#ethiopianGoldGrad)" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M14 42 L22 46 M14 78 L22 74 M106 42 L98 46 M106 78 L98 74" stroke="url(#ethiopianGoldGrad)" stroke-width="1.6" stroke-linecap="round"/>

  <!-- Outer Halo Crown Finials (Four Cardinal Trefoils) -->
  <path d="M60 4 C57 7 57 11 60 12 C63 11 63 7 60 4 Z M54 9 C53 12 57 13 58 11 Z M66 9 C67 12 63 13 62 11 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M60 116 C57 113 57 109 60 108 C63 109 63 113 60 116 Z M54 111 C53 108 57 107 58 109 Z M66 111 C67 108 63 107 62 109 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M4 60 C7 57 11 57 12 60 C11 63 7 63 4 60 Z M9 54 C12 53 13 57 11 58 Z M9 66 C12 67 13 63 11 62 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M116 60 C113 57 109 57 108 60 C109 63 113 63 116 60 Z M111 54 C108 53 107 57 109 58 Z M111 66 C108 67 107 63 109 62 Z" fill="url(#ethiopianGoldGrad)"/>

  <!-- Central Flared Equilateral Cross with Trefoil Finials -->
  <path d="M52 52 L50 28 C46 26 46 22 50 20 C54 22 56 26 54 28 L56 52 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M68 52 L70 28 C74 26 74 22 70 20 C66 22 64 26 66 28 L64 52 Z" fill="url(#ethiopianGoldGrad)"/>
  <path d="M56 22 L60 16 L64 22 Z" fill="url(#ethiopianGoldGrad)"/>

  <!-- Vertical & Horizontal Solid Cross Body -->
  <path d="M54 28 L66 28 L62 50 L84 46 L84 58 L62 62 L66 84 L54 84 L58 62 L36 58 L36 46 L58 50 Z" fill="url(#ethiopianBronzeGrad)"/>
  <path d="M55 30 L65 30 L61 51 L82 48 L82 56 L61 61 L65 82 L55 82 L59 61 L38 56 L38 48 L59 51 Z" fill="url(#ethiopianGoldGrad)"/>

  <!-- Trefoil arm terminals -->
  <circle cx="60" cy="24" r="4.5" fill="url(#ethiopianGoldGrad)"/>
  <circle cx="60" cy="88" r="4.5" fill="url(#ethiopianGoldGrad)"/>
  <circle cx="28" cy="60" r="4.5" fill="url(#ethiopianGoldGrad)"/>
  <circle cx="92" cy="60" r="4.5" fill="url(#ethiopianGoldGrad)"/>

  <!-- Center Jewel Rosette -->
  <circle cx="60" cy="60" r="9" fill="url(#ethiopianBronzeGrad)" stroke="#ffea9f" stroke-width="1.2"/>
  <circle cx="60" cy="60" r="5" fill="#ffea9f"/>
  <path d="M60 52 L60 68 M52 60 L68 60" stroke="#8c5e07" stroke-width="1.4" stroke-linecap="round"/>
`;

// 3. Axumite Stepped Cross (መስቀለ አክሱም) — Ancient stepped monument geometry & Trinity symbolism
const AXUM_SVG = `
  <!-- Stepped Cross Arms (Top, Bottom, Left, Right) -->
  <path d="
    M52 48 L46 48 L46 28 L40 28 L40 18 L60 6 L80 18 L80 28 L74 28 L74 48 L68 48
    L68 52 L74 52 L74 46 L92 46 L92 40 L102 40 L114 60 L102 80 L92 80 L92 74 L74 74 L74 68
    L68 68 L68 74 L74 74 L74 92 L80 92 L80 102 L60 114 L40 102 L40 92 L46 92 L46 74 L52 74
    L52 68 L46 68 L46 74 L28 74 L28 80 L18 80 L6 60 L18 40 L28 40 L28 46 L46 46 L46 52 L52 52 Z
  " fill="url(#ethiopianBronzeGrad)" stroke="url(#ethiopianGoldGrad)" stroke-width="1.5" stroke-linejoin="bevel"/>

  <path d="
    M54 50 L48 50 L48 30 L42 30 L42 20 L60 9 L78 20 L78 30 L72 30 L72 50 L66 50
    L66 54 L72 54 L72 48 L90 48 L90 42 L100 42 L111 60 L100 78 L90 78 L90 72 L72 72 L72 66
    L66 66 L66 72 L72 72 L72 90 L78 90 L78 100 L60 111 L42 100 L42 90 L48 90 L48 72 L54 72
    L54 66 L48 66 L48 72 L30 72 L30 78 L20 78 L9 60 L20 42 L30 42 L30 48 L48 48 L48 54 L54 54 Z
  " fill="url(#ethiopianGoldGrad)"/>

  <!-- Four Cross Cutout Piercings in each arm (Trinity & Holy Light) -->
  <path d="M60 22 L55 30 L65 30 Z" fill="#080f21" stroke="url(#ethiopianBronzeGrad)" stroke-width="1"/>
  <path d="M60 98 L55 90 L65 90 Z" fill="#080f21" stroke="url(#ethiopianBronzeGrad)" stroke-width="1"/>
  <path d="M22 60 L30 55 L30 65 Z" fill="#080f21" stroke="url(#ethiopianBronzeGrad)" stroke-width="1"/>
  <path d="M98 60 L90 55 L90 65 Z" fill="#080f21" stroke="url(#ethiopianBronzeGrad)" stroke-width="1"/>

  <!-- Corner Stepped Quadrant Accents (Aksumite Pillars) -->
  <path d="M38 38 L44 38 L44 44 M76 38 L82 38 L76 44 M38 82 L44 82 L44 76 M82 82 L76 82 L76 76" stroke="url(#ethiopianGoldGrad)" stroke-width="2" stroke-linecap="square"/>

  <!-- Central Solomon's Knot (የጥበብ መስቀል) -->
  <rect x="52" y="52" width="16" height="16" rx="3" fill="url(#ethiopianBronzeGrad)" stroke="#ffea9f" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="4.5" fill="#ffea9f"/>
  <path d="M56 56 L64 64 M64 56 L56 64" stroke="#8c5e07" stroke-width="1.2" stroke-linecap="round"/>
`;

// 4. Meskel Blessing Hand Cross (መስቀለ መስቀል / እደ መስቀል) — Sacred Hand Blessing Cross with Ark/Tabot base
const MESKEL_SVG = `
  <!-- Top Finial of Cross Head -->
  <path d="M60 4 L64 10 L60 14 L56 10 Z" fill="url(#ethiopianGoldGrad)"/>
  <circle cx="60" cy="9" r="2" fill="#ffea9f"/>

  <!-- Upper Cross Head with Flared Arms & Trefoil Terminals -->
  <path d="
    M54 36 L48 24 C44 24 42 20 46 17 C50 17 52 20 50 24 L56 34
    L60 20 L64 20 L64 34
    L70 24 C68 20 70 17 74 17 C78 20 76 24 72 24 L66 36
    L76 30 C80 26 84 28 84 32 C84 36 80 38 76 34 L66 40
    L76 46 C80 42 84 44 84 48 C84 52 80 54 76 50 L66 44
    L64 52 L56 52 L54 44
    L44 50 C40 54 36 52 36 48 C36 44 40 42 44 46 L54 40
    L44 34 C40 38 36 36 36 32 C36 28 40 26 44 30 L54 36 Z
  " fill="url(#ethiopianGoldGrad)" stroke="url(#ethiopianBronzeGrad)" stroke-width="1.2" stroke-linejoin="bevel"/>

  <!-- Upper Cross Center Cutout (Diamond Window) -->
  <path d="M60 32 L66 40 L60 48 L54 40 Z" fill="#080f21" stroke="url(#ethiopianGoldGrad)" stroke-width="1.2"/>
  <circle cx="60" cy="40" r="3" fill="#ffea9f"/>

  <!-- Priest's Side Ring Handles (Blessing Handholds) -->
  <path d="M42 54 C38 58 40 64 45 64 C48 64 50 61 50 58" stroke="url(#ethiopianGoldGrad)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M78 54 C82 58 80 64 75 64 C72 64 70 61 70 58" stroke="url(#ethiopianGoldGrad)" stroke-width="2.2" fill="none" stroke-linecap="round"/>

  <!-- Ornate Connecting Shaft with Baluster Rings -->
  <rect x="56" y="52" width="8" height="24" rx="2" fill="url(#ethiopianBronzeGrad)"/>
  <rect x="54" y="55" width="12" height="3" rx="1.5" fill="url(#ethiopianGoldGrad)"/>
  <rect x="54" y="63" width="12" height="3" rx="1.5" fill="url(#ethiopianGoldGrad)"/>
  <rect x="54" y="71" width="12" height="3" rx="1.5" fill="url(#ethiopianGoldGrad)"/>

  <!-- Base: The Sacred Ark / Tabot Base (ጽላት / ታቦት) with Openwork Interlace Knotwork -->
  <rect x="38" y="78" width="44" height="28" rx="4" fill="url(#ethiopianBronzeGrad)" stroke="url(#ethiopianGoldGrad)" stroke-width="1.8"/>
  <rect x="42" y="82" width="36" height="20" rx="2" fill="#080f21"/>

  <!-- Ethiopian Interlaced Lattice Knotwork inside Tabot base -->
  <path d="M48 82 L48 102 M54 82 L54 102 M60 82 L60 102 M66 82 L66 102 M72 82 L72 102" stroke="url(#ethiopianGoldGrad)" stroke-width="1.2"/>
  <path d="M42 87 L78 87 M42 92 L78 92 M42 97 L78 97" stroke="url(#ethiopianGoldGrad)" stroke-width="1.2"/>
  <circle cx="51" cy="87" r="1.5" fill="#ffea9f"/>
  <circle cx="69" cy="87" r="1.5" fill="#ffea9f"/>
  <circle cx="60" cy="92" r="2" fill="#ffea9f"/>
  <circle cx="51" cy="97" r="1.5" fill="#ffea9f"/>
  <circle cx="69" cy="97" r="1.5" fill="#ffea9f"/>

  <!-- Base Terminal / Foot Finial (Golgotha Base) -->
  <path d="M54 106 L60 115 L66 106 Z" fill="url(#ethiopianGoldGrad)"/>
  <circle cx="60" cy="115" r="2" fill="#ffea9f"/>
`;

const getCrossSvgContent = (variant: OrthodoxCrossVariant) => {
  switch (variant) {
    case 'gondar':
      return GONDAR_SVG;
    case 'axum':
      return AXUM_SVG;
    case 'meskel':
      return MESKEL_SVG;
    case 'lalibela':
    default:
      return LALIBELA_SVG;
  }
};

const buildSvgXml = (variant: OrthodoxCrossVariant, glow: boolean) => `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ethiopianGoldGrad" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#ffea9f" />
      <stop offset="25%" stop-color="#e5a93c" />
      <stop offset="50%" stop-color="#f5cf6d" />
      <stop offset="75%" stop-color="#b88318" />
      <stop offset="100%" stop-color="#ffd875" />
    </linearGradient>
    <linearGradient id="ethiopianBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8c5e07" />
      <stop offset="50%" stop-color="#c69214" />
      <stop offset="100%" stop-color="#6e4600" />
    </linearGradient>
    <radialGradient id="crossAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e5a93c" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#e5a93c" stop-opacity="0" />
    </radialGradient>
  </defs>
  ${glow ? '<circle cx="60" cy="60" r="56" fill="url(#crossAura)" />' : ''}
  ${getCrossSvgContent(variant)}
</svg>`;

/**
 * Authentic Traditional Ethiopian Orthodox Cross Component
 *
 * Supports 4 revered historical Ethiopian Orthodox cross traditions:
 * - 'lalibela': Diamond lattice openwork processional cross (መስቀለ ላሊበላ)
 * - 'gondar': Imperial halo sun cross with radiating rays & trefoils (መስቀለ ጎንደር)
 * - 'axum': Stepped Trinity cross potent with ancient geometric knotwork (መስቀለ አክሱም)
 * - 'meskel': Sacred clergy blessing hand cross with Ark/Tabot base (መስቀለ መስቀል / እደ መስቀል)
 *
 * Infinitely crisp vector rendering on both Web & Native with gold craftsmanship gradients.
 */
export default function OrthodoxCross({
  size = 24,
  variant = 'lalibela',
  glow = false,
  style,
}: OrthodoxCrossProps) {
  if (Platform.OS === 'web') {
    const glowFilter = glow ? 'drop-shadow(0 0 6px rgba(229, 169, 60, 0.45))' : 'none';

    return (
      <View
        style={[
          styles.container,
          { width: size, height: size },
          style,
        ]}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: glowFilter, display: 'block', width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="ethiopianGoldGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#ffea9f" />
              <stop offset="25%" stopColor="#e5a93c" />
              <stop offset="50%" stopColor="#f5cf6d" />
              <stop offset="75%" stopColor="#b88318" />
              <stop offset="100%" stopColor="#ffd875" />
            </linearGradient>

            <linearGradient id="ethiopianBronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8c5e07" />
              <stop offset="50%" stopColor="#c69214" />
              <stop offset="100%" stopColor="#6e4600" />
            </linearGradient>

            <radialGradient id="crossAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e5a93c" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e5a93c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {glow && <circle cx="60" cy="60" r="56" fill="url(#crossAura)" />}

          {/* Render variant body */}
          <g dangerouslySetInnerHTML={{ __html: getCrossSvgContent(variant) }} />
        </svg>
      </View>
    );
  }

  // Native (Android / iOS): Vector Data URI
  const svgXml = buildSvgXml(variant, glow);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgXml)}`;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
    >
      <Image
        source={{ uri: dataUri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
});
