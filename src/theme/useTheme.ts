import { useAppStore } from '../store/useAppStore';
import { themes } from './tokens';

export function useTheme() {
  const name = useAppStore(s => s.theme);
  return { name, t: themes[name] };
}
