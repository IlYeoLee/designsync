"use client";

import * as React from "react";

// Lucide
import {
  Home, Settings, User, Search, Plus, X, Check, ChevronDown, ArrowRight,
  Bell, Mail, Heart, Star, Trash2, Edit, Eye, Download, Upload, Filter,
  Menu, LogOut, Sun, Moon, Zap, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, LayoutDashboard, FileText, Calendar,
  AlertCircle, CheckCircle2, Info, Calculator, Smile, ChevronsUpDown,
  PanelLeft, PanelLeftClose,
} from "lucide-react";

// Tabler
import {
  IconHome, IconSettings, IconUser, IconSearch, IconPlus, IconX, IconCheck,
  IconChevronDown, IconArrowRight, IconBell, IconMail, IconHeart, IconStar,
  IconTrash, IconEdit, IconEye, IconDownload, IconUpload, IconFilter,
  IconMenu2, IconLogout, IconSun, IconMoon, IconBolt, IconBold, IconItalic,
  IconUnderline, IconAlignLeft, IconAlignCenter, IconAlignRight,
  IconLayoutDashboard, IconFileText, IconCalendar, IconAlertCircle,
  IconCircleCheck, IconInfoCircle, IconCalculator, IconMoodSmile,
  IconSelector, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

// Phosphor
import {
  House, Gear, UserCircle, MagnifyingGlass, Plus as PhPlus, X as PhX,
  Check as PhCheck, CaretDown, ArrowRight as PhArrowRight, BellSimple,
  Envelope, Heart as PhHeart, Star as PhStar, Trash, PencilSimple,
  Eye as PhEye, DownloadSimple, UploadSimple, Funnel, List,
  SignOut, Sun as PhSun, Moon as PhMoon, Lightning, TextB, TextItalic,
  TextUnderline, TextAlignLeft, TextAlignCenter, TextAlignRight,
  SquaresFour, FileText as PhFileText, CalendarBlank, WarningCircle,
  CheckCircle, Info as PhInfo, Calculator as PhCalculator, Smiley,
  CaretUpDown, SidebarSimple, Sidebar as PhSidebar,
} from "@phosphor-icons/react";

// Remix
import {
  RiHome2Line, RiSettings3Line, RiUserLine, RiSearchLine, RiAddLine,
  RiCloseLine, RiCheckLine, RiArrowDownSLine, RiArrowRightLine,
  RiNotification3Line, RiMailLine, RiHeartLine, RiStarLine, RiDeleteBinLine,
  RiEditLine, RiEyeLine, RiDownloadLine, RiUploadLine, RiFilter3Line,
  RiMenuLine, RiLogoutBoxLine, RiSunLine, RiMoonLine, RiFlashlightLine,
  RiBold, RiItalic, RiUnderline, RiAlignLeft, RiAlignCenter, RiAlignRight,
  RiDashboardLine, RiFileTextLine, RiCalendarLine, RiErrorWarningLine,
  RiCheckboxCircleLine, RiInformationLine, RiCalculatorLine, RiEmotionLine,
  RiExpandUpDownLine, RiSideBarLine, RiMenuFoldLine,
} from "@remixicon/react";

// Hugeicons
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon, Settings01Icon, Search01Icon, Notification01Icon, Mail01Icon,
  UserIcon as HgUserIcon, Add01Icon, Cancel01Icon, Tick01Icon, ArrowDown01Icon,
  ArrowRight01Icon, FavouriteIcon, StarIcon as HgStarIcon, Delete01Icon, PencilEdit01Icon,
  ViewIcon as HgViewIcon, Download01Icon, Upload01Icon, FilterIcon as HgFilterIcon, Menu01Icon,
  Logout01Icon, Sun01Icon, Moon01Icon, FlashIcon as HgFlashIcon, TextBoldIcon,
  TextItalicIcon, TextUnderlineIcon, AlignBoxMiddleCenterIcon as HgAlignCenter,
  AlignBoxMiddleCenterIcon, AlignBoxMiddleRightIcon,
  DashboardSquare01Icon, File01Icon, Calendar01Icon, Alert01Icon,
  CheckmarkCircle01Icon, InformationCircleIcon, Calculator01Icon,
  SmileIcon as HgSmileIcon, SidebarLeft01Icon, SidebarLeftIcon as HgSidebarIcon,
} from "@hugeicons/core-free-icons";

// Icon name keys used throughout the app
type IconName =
  | "home" | "settings" | "user" | "search" | "plus" | "x" | "check"
  | "chevronDown" | "arrowRight" | "bell" | "mail" | "heart" | "star"
  | "trash" | "edit" | "eye" | "download" | "upload" | "filter"
  | "menu" | "logout" | "sun" | "moon" | "zap" | "bold" | "italic"
  | "underline" | "alignLeft" | "alignCenter" | "alignRight"
  | "dashboard" | "fileText" | "calendar" | "alertCircle" | "checkCircle"
  | "info" | "calculator" | "smile" | "chevronsUpDown"
  | "panelLeft" | "panelLeftClose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

function makeHuge(icon: unknown): IconComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = (props: any) => <HugeiconsIcon icon={icon as any} {...props} />;
  return Comp;
}

const ICON_MAPS: Record<string, Record<IconName, IconComponent>> = {
  lucide: {
    home: Home, settings: Settings, user: User, search: Search, plus: Plus,
    x: X, check: Check, chevronDown: ChevronDown, arrowRight: ArrowRight,
    bell: Bell, mail: Mail, heart: Heart, star: Star, trash: Trash2,
    edit: Edit, eye: Eye, download: Download, upload: Upload, filter: Filter,
    menu: Menu, logout: LogOut, sun: Sun, moon: Moon, zap: Zap,
    bold: Bold, italic: Italic, underline: Underline, alignLeft: AlignLeft,
    alignCenter: AlignCenter, alignRight: AlignRight, dashboard: LayoutDashboard,
    fileText: FileText, calendar: Calendar, alertCircle: AlertCircle,
    checkCircle: CheckCircle2, info: Info, calculator: Calculator, smile: Smile,
    chevronsUpDown: ChevronsUpDown, panelLeft: PanelLeft, panelLeftClose: PanelLeftClose,
  },
  tabler: {
    home: IconHome, settings: IconSettings, user: IconUser, search: IconSearch,
    plus: IconPlus, x: IconX, check: IconCheck, chevronDown: IconChevronDown,
    arrowRight: IconArrowRight, bell: IconBell, mail: IconMail, heart: IconHeart,
    star: IconStar, trash: IconTrash, edit: IconEdit, eye: IconEye,
    download: IconDownload, upload: IconUpload, filter: IconFilter,
    menu: IconMenu2, logout: IconLogout, sun: IconSun, moon: IconMoon,
    zap: IconBolt, bold: IconBold, italic: IconItalic, underline: IconUnderline,
    alignLeft: IconAlignLeft, alignCenter: IconAlignCenter, alignRight: IconAlignRight,
    dashboard: IconLayoutDashboard, fileText: IconFileText, calendar: IconCalendar,
    alertCircle: IconAlertCircle, checkCircle: IconCircleCheck, info: IconInfoCircle,
    calculator: IconCalculator, smile: IconMoodSmile, chevronsUpDown: IconSelector,
    panelLeft: IconLayoutSidebarLeftExpand, panelLeftClose: IconLayoutSidebarLeftCollapse,
  },
  phosphor: {
    home: House, settings: Gear, user: UserCircle, search: MagnifyingGlass,
    plus: PhPlus, x: PhX, check: PhCheck, chevronDown: CaretDown,
    arrowRight: PhArrowRight, bell: BellSimple, mail: Envelope, heart: PhHeart,
    star: PhStar, trash: Trash, edit: PencilSimple, eye: PhEye,
    download: DownloadSimple, upload: UploadSimple, filter: Funnel,
    menu: List, logout: SignOut, sun: PhSun, moon: PhMoon, zap: Lightning,
    bold: TextB, italic: TextItalic, underline: TextUnderline,
    alignLeft: TextAlignLeft, alignCenter: TextAlignCenter, alignRight: TextAlignRight,
    dashboard: SquaresFour, fileText: PhFileText, calendar: CalendarBlank,
    alertCircle: WarningCircle, checkCircle: CheckCircle, info: PhInfo,
    calculator: PhCalculator, smile: Smiley, chevronsUpDown: CaretUpDown,
    panelLeft: PhSidebar, panelLeftClose: SidebarSimple,
  },
  remix: {
    home: RiHome2Line, settings: RiSettings3Line, user: RiUserLine,
    search: RiSearchLine, plus: RiAddLine, x: RiCloseLine, check: RiCheckLine,
    chevronDown: RiArrowDownSLine, arrowRight: RiArrowRightLine,
    bell: RiNotification3Line, mail: RiMailLine, heart: RiHeartLine,
    star: RiStarLine, trash: RiDeleteBinLine, edit: RiEditLine, eye: RiEyeLine,
    download: RiDownloadLine, upload: RiUploadLine, filter: RiFilter3Line,
    menu: RiMenuLine, logout: RiLogoutBoxLine, sun: RiSunLine, moon: RiMoonLine,
    zap: RiFlashlightLine, bold: RiBold, italic: RiItalic, underline: RiUnderline,
    alignLeft: RiAlignLeft, alignCenter: RiAlignCenter, alignRight: RiAlignRight,
    dashboard: RiDashboardLine, fileText: RiFileTextLine, calendar: RiCalendarLine,
    alertCircle: RiErrorWarningLine, checkCircle: RiCheckboxCircleLine,
    info: RiInformationLine, calculator: RiCalculatorLine, smile: RiEmotionLine,
    chevronsUpDown: RiExpandUpDownLine, panelLeft: RiSideBarLine,
    panelLeftClose: RiMenuFoldLine,
  },
  hugeicons: {
    home: makeHuge(Home01Icon), settings: makeHuge(Settings01Icon),
    user: makeHuge(HgUserIcon), search: makeHuge(Search01Icon),
    plus: makeHuge(Add01Icon), x: makeHuge(Cancel01Icon),
    check: makeHuge(Tick01Icon), chevronDown: makeHuge(ArrowDown01Icon),
    arrowRight: makeHuge(ArrowRight01Icon), bell: makeHuge(Notification01Icon),
    mail: makeHuge(Mail01Icon), heart: makeHuge(FavouriteIcon),
    star: makeHuge(HgStarIcon), trash: makeHuge(Delete01Icon),
    edit: makeHuge(PencilEdit01Icon), eye: makeHuge(HgViewIcon),
    download: makeHuge(Download01Icon), upload: makeHuge(Upload01Icon),
    filter: makeHuge(HgFilterIcon), menu: makeHuge(Menu01Icon),
    logout: makeHuge(Logout01Icon), sun: makeHuge(Sun01Icon),
    moon: makeHuge(Moon01Icon), zap: makeHuge(HgFlashIcon),
    bold: makeHuge(TextBoldIcon), italic: makeHuge(TextItalicIcon),
    underline: makeHuge(TextUnderlineIcon),
    alignLeft: makeHuge(HgAlignCenter),
    alignCenter: makeHuge(AlignBoxMiddleCenterIcon),
    alignRight: makeHuge(AlignBoxMiddleRightIcon),
    dashboard: makeHuge(DashboardSquare01Icon), fileText: makeHuge(File01Icon),
    calendar: makeHuge(Calendar01Icon), alertCircle: makeHuge(Alert01Icon),
    checkCircle: makeHuge(CheckmarkCircle01Icon), info: makeHuge(InformationCircleIcon),
    calculator: makeHuge(Calculator01Icon), smile: makeHuge(HgSmileIcon),
    chevronsUpDown: makeHuge(ArrowDown01Icon),
    panelLeft: makeHuge(HgSidebarIcon), panelLeftClose: makeHuge(SidebarLeft01Icon),
  },
};

export function getIconMap(library: string): Record<IconName, IconComponent> {
  return ICON_MAPS[library] || ICON_MAPS.lucide;
}

export function useIcon(library: string, name: IconName): IconComponent {
  return (ICON_MAPS[library] || ICON_MAPS.lucide)[name];
}

export type { IconName };
