import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type OrthodoxCrossVariant = 'lalibela' | 'gondar' | 'axum' | 'meskel';

export interface OrthodoxCrossProps {
  size?: number;
  variant?: OrthodoxCrossVariant;
  color?: string;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ----------------------------------------------------------------------
// 1. MESKEL BLESSING HAND CROSS WITH TABOT BASE (መስቀለ መስቀል / እደ መስቀል)
// The single universal fixed Ethiopian Orthodox cross:
// - Crown Finial
// - Flared Cross Head with Center Jewel Rosette
// - Priest's Blessing Side Loops (Handholds)
// - Baluster Shaft with Gold Ring Beads
// - The Sacred Ark of the Covenant Foundation (መሠረተ ታቦት / ጽላት) with Openwork Lattice
// - Golgotha Foot Anchor
// ----------------------------------------------------------------------
const MeskelHandCross = ({ size, color = '#e5a93c' }: { size: number; color?: string }) => {
  const headSize = Math.round(size * 0.52);
  const finialSize = Math.max(3, Math.round(size * 0.11));
  const sideEarSize = Math.max(4, Math.round(size * 0.18));
  const shaftHeight = Math.max(4, Math.round(size * 0.18));
  const shaftWidth = Math.max(2.5, Math.round(size * 0.08));
  const tabotWidth = Math.round(size * 0.58);
  const tabotHeight = Math.round(size * 0.28);
  const footFinialSize = Math.max(3, Math.round(size * 0.1));

  const barThickness = Math.max(2.5, Math.round(size * 0.12));
  const flareCapLength = Math.max(5, Math.round(size * 0.26));
  const flareCapThickness = Math.max(1.5, Math.round(size * 0.07));

  return (
    <View style={[styles.centerBox, { width: size, height: size }]}>
      {/* 1. Crown Top Finial (Crowning the Cross Head) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: finialSize,
          height: finialSize,
          backgroundColor: '#ffea9f',
          transform: [{ rotate: '45deg' }],
          zIndex: 4,
        }}
      />

      {/* 2. Upper Cross Head (Flared Ethiopian Cross with Side Loops) */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(size * 0.04),
          alignItems: 'center',
          justifyContent: 'center',
          width: headSize,
          height: headSize,
          zIndex: 3,
        }}
      >
        {/* Priest's Side Blessing Loops (Left & Right Handles) */}
        <View
          style={{
            position: 'absolute',
            left: -sideEarSize * 0.5,
            width: sideEarSize,
            height: sideEarSize,
            borderRadius: sideEarSize / 2,
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: 'rgba(229, 169, 60, 0.15)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -sideEarSize * 0.5,
            width: sideEarSize,
            height: sideEarSize,
            borderRadius: sideEarSize / 2,
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: 'rgba(229, 169, 60, 0.15)',
          }}
        />

        {/* Central Flared Cross Bars (Guaranteed to render on all platforms) */}
        {/* Vertical Bar */}
        <View
          style={{
            position: 'absolute',
            width: barThickness,
            height: headSize,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
        {/* Horizontal Bar */}
        <View
          style={{
            position: 'absolute',
            width: headSize,
            height: barThickness,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />

        {/* Flared Trefoil Terminal Endcaps */}
        {/* Top Cap */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: flareCapLength,
            height: flareCapThickness,
            backgroundColor: '#ffea9f',
            borderRadius: 1,
          }}
        />
        {/* Bottom Cap */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: flareCapLength,
            height: flareCapThickness,
            backgroundColor: '#ffea9f',
            borderRadius: 1,
          }}
        />
        {/* Left Cap */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: flareCapThickness,
            height: flareCapLength,
            backgroundColor: '#ffea9f',
            borderRadius: 1,
          }}
        />
        {/* Right Cap */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            width: flareCapThickness,
            height: flareCapLength,
            backgroundColor: '#ffea9f',
            borderRadius: 1,
          }}
        />

        {/* Central Bolnisi / Trefoil Accent */}
        <MaterialCommunityIcons
          name="cross-bolnisi"
          size={Math.round(headSize * 0.95)}
          color={color}
          style={{ position: 'absolute' }}
        />

        {/* Center Jewel Rosette */}
        <View
          style={{
            position: 'absolute',
            width: Math.max(3.5, Math.round(size * 0.16)),
            height: Math.max(3.5, Math.round(size * 0.16)),
            borderRadius: Math.round(size * 0.08),
            backgroundColor: '#ffea9f',
            borderWidth: 1,
            borderColor: '#8c5e07',
          }}
        />
      </View>

      {/* 3. Connecting Baluster Shaft / Stem with Ring Beads */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(size * 0.52),
          width: shaftWidth,
          height: shaftHeight,
          backgroundColor: '#b88318',
          borderRadius: 1,
          alignItems: 'center',
          justifyContent: 'space-evenly',
          zIndex: 2,
        }}
      >
        <View
          style={{
            width: shaftWidth * 1.8,
            height: 1.5,
            backgroundColor: '#ffea9f',
            borderRadius: 0.8,
          }}
        />
        <View
          style={{
            width: shaftWidth * 1.8,
            height: 1.5,
            backgroundColor: '#ffea9f',
            borderRadius: 0.8,
          }}
        />
      </View>

      {/* 4. Base: The Sacred Ark / Tabot (መሠረተ ታቦት / ጽላት) Foundation */}
      <View
        style={{
          position: 'absolute',
          bottom: Math.round(footFinialSize * 0.5),
          width: tabotWidth,
          height: tabotHeight,
          borderRadius: 3,
          borderWidth: 1.5,
          borderColor: color,
          backgroundColor: 'rgba(229, 169, 60, 0.25)',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Openwork Ethiopian Interlace Knotwork inside Tabot */}
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Vertical openwork mullions */}
          <View
            style={{
              position: 'absolute',
              width: tabotWidth * 0.38,
              height: '100%',
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: 'rgba(255, 234, 159, 0.55)',
            }}
          />
          {/* Horizontal cross bar */}
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 1,
              backgroundColor: 'rgba(255, 234, 159, 0.75)',
            }}
          />
          {/* Center Tabot jewel dot */}
          <View
            style={{
              width: Math.max(2.5, Math.round(size * 0.08)),
              height: Math.max(2.5, Math.round(size * 0.08)),
              borderRadius: Math.round(size * 0.04),
              backgroundColor: '#ffea9f',
            }}
          />
        </View>
      </View>

      {/* 5. Bottom Foot Finial (Golgotha Base Anchor) */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: footFinialSize,
          height: footFinialSize,
          backgroundColor: '#ffea9f',
          transform: [{ rotate: '45deg' }],
          zIndex: 3,
        }}
      />
    </View>
  );
};

// ----------------------------------------------------------------------
// 2. LALIBELA DIAMOND LATTICE CROSS (መስቀለ ላሊበላ)
// ----------------------------------------------------------------------
const LalibelaCross = ({ size, color = '#e5a93c' }: { size: number; color?: string }) => {
  const innerDiamondSize = Math.round(size * 0.7);
  const finialSize = Math.max(3, Math.round(size * 0.12));

  return (
    <View style={[styles.centerBox, { width: size, height: size }]}>
      <View
        style={{
          width: innerDiamondSize,
          height: innerDiamondSize,
          borderWidth: 1.5,
          borderColor: color,
          backgroundColor: 'rgba(229, 169, 60, 0.15)',
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          borderRadius: 2,
        }}
      />
      <View style={{ position: 'absolute', top: 0, width: finialSize, height: finialSize, backgroundColor: '#ffea9f', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', bottom: 0, width: finialSize, height: finialSize, backgroundColor: '#ffea9f', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', left: 0, width: finialSize, height: finialSize, backgroundColor: '#ffea9f', transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', right: 0, width: finialSize, height: finialSize, backgroundColor: '#ffea9f', transform: [{ rotate: '45deg' }] }} />
      <MaterialCommunityIcons name="cross-bolnisi" size={Math.round(size * 0.65)} color={color} />
      <View
        style={{
          position: 'absolute',
          width: Math.max(4, Math.round(size * 0.18)),
          height: Math.max(4, Math.round(size * 0.18)),
          borderRadius: Math.round(size * 0.09),
          backgroundColor: '#ffea9f',
          borderWidth: 1,
          borderColor: '#8c5e07',
        }}
      />
    </View>
  );
};

// ----------------------------------------------------------------------
// 3. GONDAR RADIANT SUN HALO CROSS (መስቀለ ጎንደር)
// ----------------------------------------------------------------------
const GondarCross = ({ size, color = '#e5a93c' }: { size: number; color?: string }) => {
  const outerCircle = Math.round(size * 0.92);
  const innerCircle = Math.round(size * 0.72);
  const finialSize = Math.max(3, Math.round(size * 0.1));

  return (
    <View style={[styles.centerBox, { width: size, height: size }]}>
      <View
        style={{
          width: outerCircle,
          height: outerCircle,
          borderRadius: outerCircle / 2,
          borderWidth: 1.5,
          borderColor: color,
          backgroundColor: 'rgba(229, 169, 60, 0.12)',
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: innerCircle,
          height: innerCircle,
          borderRadius: innerCircle / 2,
          borderWidth: 1,
          borderColor: 'rgba(255, 234, 159, 0.45)',
          borderStyle: 'dashed',
          position: 'absolute',
        }}
      />
      <View style={{ position: 'absolute', top: 1, width: finialSize, height: finialSize, borderRadius: finialSize / 2, backgroundColor: '#ffea9f' }} />
      <View style={{ position: 'absolute', bottom: 1, width: finialSize, height: finialSize, borderRadius: finialSize / 2, backgroundColor: '#ffea9f' }} />
      <View style={{ position: 'absolute', left: 1, width: finialSize, height: finialSize, borderRadius: finialSize / 2, backgroundColor: '#ffea9f' }} />
      <View style={{ position: 'absolute', right: 1, width: finialSize, height: finialSize, borderRadius: finialSize / 2, backgroundColor: '#ffea9f' }} />
      <MaterialCommunityIcons name="cross-celtic" size={Math.round(size * 0.65)} color={color} />
      <View
        style={{
          position: 'absolute',
          width: Math.max(4, Math.round(size * 0.16)),
          height: Math.max(4, Math.round(size * 0.16)),
          borderRadius: Math.round(size * 0.08),
          backgroundColor: '#ffea9f',
          borderWidth: 1,
          borderColor: '#8c5e07',
        }}
      />
    </View>
  );
};

// ----------------------------------------------------------------------
// 4. AXUM STEPPED TRINITY CROSS (መስቀለ አክሱም)
// ----------------------------------------------------------------------
const AxumCross = ({ size, color = '#e5a93c' }: { size: number; color?: string }) => {
  const boxSize = Math.round(size * 0.88);
  const cornerSize = Math.max(3, Math.round(size * 0.14));

  return (
    <View style={[styles.centerBox, { width: size, height: size }]}>
      <View style={{ width: boxSize, height: boxSize, position: 'absolute' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: cornerSize, height: cornerSize, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: color }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: cornerSize, height: cornerSize, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: cornerSize, height: cornerSize, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: color }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: cornerSize, height: cornerSize, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: color }} />
      </View>
      <MaterialCommunityIcons name="cross-bolnisi" size={Math.round(size * 0.72)} color={color} />
      <View
        style={{
          position: 'absolute',
          width: Math.max(5, Math.round(size * 0.2)),
          height: Math.max(5, Math.round(size * 0.2)),
          backgroundColor: '#ffea9f',
          transform: [{ rotate: '45deg' }],
          borderWidth: 1,
          borderColor: '#8c5e07',
        }}
      />
    </View>
  );
};

/**
 * Authentic Traditional Ethiopian Orthodox Cross Component
 *
 * Guaranteed 100% visible and beautifully rendered across Web, Android, and iOS.
 * Defaults to the revered Meskel Hand Cross with Tabot base (መስቀለ መስቀል / እደ መስቀል).
 */
export default function OrthodoxCross({
  size = 24,
  variant = 'meskel',
  color = '#e5a93c',
  glow = false,
  style,
}: OrthodoxCrossProps) {
  const glowShadowStyle: ViewStyle = glow
    ? {
        shadowColor: '#e5a93c',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 4,
      }
    : {};

  const renderCrossContent = () => {
    switch (variant) {
      case 'lalibela':
        return <LalibelaCross size={size} color={color} />;
      case 'gondar':
        return <GondarCross size={size} color={color} />;
      case 'axum':
        return <AxumCross size={size} color={color} />;
      case 'meskel':
      default:
        return <MeskelHandCross size={size} color={color} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        glowShadowStyle,
        style,
      ]}
    >
      {renderCrossContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
