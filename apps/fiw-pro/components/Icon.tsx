import React from 'react';
import {
  MagnifyingGlass, X, ArrowLeft, List, NavigationArrow, MapPin, MapPinLine,
  Clock, House, Briefcase, Plus, CaretRight, Car, Motorcycle, Package, Key,
  Wrench, Phone, ChatCircle, ShareFat, Warning, Star, HandWaving, PersonSimpleWalk,
  CheckCircle, HandsPraying, Person, PencilSimple, CaretDown,
  Check, Timer, FlagBannerFold, Handshake, Lifebuoy,
  Info, Hourglass, Coins, Lightning, CaretUp,
  Wallet, Lock,
  type IconProps as PhosphorProps,
} from 'phosphor-react-native';
import { Colors } from '@/constants/tokens';

const REGISTRY = {
  search: MagnifyingGlass,
  close: X,
  back: ArrowLeft,
  menu: List,
  navigate: NavigationArrow,
  pin: MapPin,
  location: MapPinLine,
  clock: Clock,
  home: House,
  work: Briefcase,
  add: Plus,
  edit: PencilSimple,
  chevronRight: CaretRight,
  chevronDown: CaretDown,
  car: Car,
  moto: Motorcycle,
  package: Package,
  handshake: Handshake,
  lifebuoy: Lifebuoy,
  key: Key,
  wrench: Wrench,
  phone: Phone,
  chat: ChatCircle,
  share: ShareFat,
  sos: Warning,
  star: Star,
  hail: HandWaving,
  rider: Person,
  walk: PersonSimpleWalk,
  flag: FlagBannerFold,
  timer: Timer,
  check: CheckCircle,
  tick: Check,
  thanks: HandsPraying,
  info: Info,
  hourglass: Hourglass,
  coins: Coins,
  lightning: Lightning,
  chevronUp: CaretUp,
  wallet: Wallet,
  lock: Lock,
} as const;

export type IconName = keyof typeof REGISTRY;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: PhosphorProps['weight'];
};

export default function Icon({ name, size = 22, color = Colors.textPrimary, weight = 'bold' }: Props) {
  const Glyph = REGISTRY[name];
  return <Glyph size={size} color={color} weight={weight} />;
}
