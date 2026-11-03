import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'progress' | 'activity' | 'customize' | 'more'
  | 'menu' | 'bell' | 'back' | 'share' | 'calendar' | 'dots'
  | 'flame' | 'diamond' | 'spark' | 'chevron' | 'check' | 'lock'
  | 'pin' | 'walk' | 'clock' | 'close' | 'plus' | 'minus' | 'chat' | 'widget' | 'settings';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  fill?: string;
}

/** Небольшой набор линейных иконок (stroke 2, 24×24). */
export default function Icon({ name, size = 22, color, fill = 'none' }: Props) {
  const p = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const body = (() => {
    switch (name) {
      case 'home':
        return <Path {...p} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />;
      case 'progress':
        return <Path {...p} d="M4 20V14M10 20V9M16 20V4M22 20H2" />;
      case 'activity':
        return <Path {...p} d="M3 12h4l3-8 4 16 3-8h4" />;
      case 'customize':
        return <Path {...p} d="M8 3 4 6v4h3v11h10V10h3V6l-4-3c-.5 1.8-2 3-4 3S8.5 4.8 8 3z" />;
      case 'more':
        return (
          <>
            <Circle {...p} cx="5" cy="12" r="1.2" />
            <Circle {...p} cx="12" cy="12" r="1.2" />
            <Circle {...p} cx="19" cy="12" r="1.2" />
          </>
        );
      case 'dots':
        return (
          <>
            <Circle cx="5" cy="12" r="1.6" fill={color} />
            <Circle cx="12" cy="12" r="1.6" fill={color} />
            <Circle cx="19" cy="12" r="1.6" fill={color} />
          </>
        );
      case 'menu':
        return <Path {...p} d="M4 7h16M4 12h16M4 17h10" />;
      case 'bell':
        return <Path {...p} d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4" />;
      case 'back':
        return <Path {...p} d="M15 5l-7 7 7 7" />;
      case 'chevron':
        return <Path {...p} d="M9 5l7 7-7 7" />;
      case 'share':
        return <Path {...p} d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />;
      case 'calendar':
        return (
          <>
            <Rect {...p} x="3" y="5" width="18" height="16" rx="3" />
            <Path {...p} d="M3 10h18M8 3v4M16 3v4" />
          </>
        );
      case 'flame':
        return <Path {...p} fill={fill} d="M12 22c4 0 7-2.8 7-7 0-4-3-6.5-4.5-10-1 2.5-2.5 3.5-3.5 4-1-2-1.5-3-1.5-5C6 7 5 11 5 15c0 4.2 3 7 7 7z" />;
      case 'diamond':
        return <Path {...p} fill={fill} d="M12 2.5 21 12l-9 9.5L3 12z" />;
      case 'spark':
        return <Path {...p} fill={fill} d="M12 2c.6 5 2.9 7.4 8 8-5.1.6-7.4 3-8 8-.6-5-2.9-7.4-8-8 5.1-.6 7.4-3 8-8z" />;
      case 'check':
        return <Path {...p} d="M5 12.5 10 17 19 7" />;
      case 'lock':
        return (
          <>
            <Rect {...p} x="5" y="11" width="14" height="10" rx="2" />
            <Path {...p} d="M8 11V8a4 4 0 0 1 8 0v3" />
          </>
        );
      case 'pin':
        return <Path {...p} d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />;
      case 'walk':
        return <Path {...p} d="M13 4.5a1.5 1.5 0 1 0 0-.01M10 21l2-6 3 3v3M8 12l2-4 4 1 2 4 3 1M12 15l-1-6" />;
      case 'clock':
        return (
          <>
            <Circle {...p} cx="12" cy="12" r="9" />
            <Path {...p} d="M12 7v5l3 2" />
          </>
        );
      case 'close':
        return <Path {...p} d="M6 6l12 12M18 6 6 18" />;
      case 'plus':
        return <Path {...p} d="M12 5v14M5 12h14" />;
      case 'minus':
        return <Path {...p} d="M5 12h14" />;
      case 'chat':
        return <Path {...p} d="M4 5h16v11H9l-5 4z" />;
      case 'widget':
        return (
          <>
            <Rect {...p} x="3" y="3" width="8" height="8" rx="2" />
            <Rect {...p} x="13" y="3" width="8" height="8" rx="2" />
            <Rect {...p} x="3" y="13" width="18" height="8" rx="2" />
          </>
        );
      case 'settings':
        return (
          <>
            <Circle {...p} cx="12" cy="12" r="3" />
            <Path {...p} d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
          </>
        );
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
