/**
 * Icon name mapping between libraries.
 * Only covers icons actually used inside shadcn/ui components.
 *
 * Key   = lucide-react component name
 * Value = { tabler, phosphor, remix, hugeicons } equivalents
 */
export const ICON_MAP: Record<
  string,
  { tabler: string; phosphor: string; remix: string; hugeicons: string }
> = {
  ArrowLeft:          { tabler: "IconArrowLeft",        phosphor: "ArrowLeft",        remix: "RiArrowLeftLine",       hugeicons: "ArrowLeft01Icon" },
  ArrowRight:         { tabler: "IconArrowRight",       phosphor: "ArrowRight",       remix: "RiArrowRightLine",      hugeicons: "ArrowRight01Icon" },
  ArrowUpDown:        { tabler: "IconArrowsUpDown",     phosphor: "ArrowsDownUp",     remix: "RiArrowUpDownLine",     hugeicons: "ArrowUpDown01Icon" },
  CalendarIcon:       { tabler: "IconCalendar",         phosphor: "Calendar",         remix: "RiCalendarLine",        hugeicons: "Calendar01Icon" },
  CheckIcon:          { tabler: "IconCheck",            phosphor: "Check",            remix: "RiCheckLine",           hugeicons: "Tick01Icon" },
  ChevronDownIcon:    { tabler: "IconChevronDown",      phosphor: "CaretDown",        remix: "RiArrowDownSLine",      hugeicons: "ArrowDown01Icon" },
  ChevronLeft:        { tabler: "IconChevronLeft",      phosphor: "CaretLeft",        remix: "RiArrowLeftSLine",      hugeicons: "ArrowLeft01Icon" },
  ChevronRight:       { tabler: "IconChevronRight",     phosphor: "CaretRight",       remix: "RiArrowRightSLine",     hugeicons: "ArrowRight01Icon" },
  ChevronRightIcon:   { tabler: "IconChevronRight",     phosphor: "CaretRight",       remix: "RiArrowRightSLine",     hugeicons: "ArrowRight01Icon" },
  ChevronUpIcon:      { tabler: "IconChevronUp",        phosphor: "CaretUp",          remix: "RiArrowUpSLine",        hugeicons: "ArrowUp01Icon" },
  ChevronsUpDown:     { tabler: "IconSelector",         phosphor: "CaretUpDown",      remix: "RiExpandUpDownLine",    hugeicons: "UnfoldMore01Icon" },
  CircleIcon:         { tabler: "IconCircle",           phosphor: "Circle",           remix: "RiCircleLine",          hugeicons: "Circle01Icon" },
  GripVerticalIcon:   { tabler: "IconGripVertical",     phosphor: "DotsSixVertical",  remix: "RiDraggable",           hugeicons: "DragDropVerticalIcon" },
  MenuIcon:           { tabler: "IconMenu2",            phosphor: "List",             remix: "RiMenuLine",            hugeicons: "Menu01Icon" },
  MinusIcon:          { tabler: "IconMinus",            phosphor: "Minus",            remix: "RiSubtractLine",        hugeicons: "MinusSignIcon" },
  MoreHorizontalIcon: { tabler: "IconDotsHorizontal",   phosphor: "DotsThree",        remix: "RiMore2Line",           hugeicons: "MoreHorizontalIcon" },
  PanelLeftIcon:      { tabler: "IconLayoutSidebar",    phosphor: "SidebarSimple",    remix: "RiLayoutLeftLine",      hugeicons: "LeftToRightBlockQuoteIcon" },
  SearchIcon:         { tabler: "IconSearch",           phosphor: "MagnifyingGlass",  remix: "RiSearchLine",          hugeicons: "Search01Icon" },
  XIcon:              { tabler: "IconX",                phosphor: "X",                remix: "RiCloseLine",           hugeicons: "Cancel01Icon" },
};

const LIBRARY_PKG: Record<string, string> = {
  lucide: "lucide-react",
  tabler: "@tabler/icons-react",
  phosphor: "@phosphor-icons/react",
  remix: "@remixicon/react",
  hugeicons: "@hugeicons/react",
};

/**
 * Rewrite all `lucide-react` imports in component source code to the target icon library.
 * Returns the modified source code.
 */
export function rewriteIconImports(source: string, targetLib: string): string {
  if (targetLib === "lucide" || !targetLib) return source;

  const targetPkg = LIBRARY_PKG[targetLib];
  if (!targetPkg) return source;

  // Match: import { Foo, Bar } from "lucide-react"
  return source.replace(
    /import\s*\{([^}]+)\}\s*from\s*"lucide-react"/g,
    (_match, importList: string) => {
      const icons = importList.split(",").map((s) => s.trim()).filter(Boolean);
      const mapped = icons.map((icon) => {
        const entry = ICON_MAP[icon];
        if (!entry || !entry[targetLib as keyof typeof entry]) return icon;
        const newName = entry[targetLib as keyof typeof entry];
        return newName === icon ? icon : `${newName} as ${icon}`;
      });
      return `import { ${mapped.join(", ")} } from "${targetPkg}"`;
    }
  );
}

/**
 * Rewrite icon dependency in a registry JSON's dependencies field.
 * Handles both array format (shadcn v2) and object format.
 */
export function rewriteIconDependency(
  deps: string[] | Record<string, string>,
  targetLib: string
): string[] | Record<string, string> {
  if (targetLib === "lucide" || !targetLib) return deps;
  const targetPkg = LIBRARY_PKG[targetLib];
  if (!targetPkg) return deps;

  // Array format: ["lucide-react", "@radix-ui/react-accordion"]
  if (Array.isArray(deps)) {
    return deps.map((d) => (d === "lucide-react" ? targetPkg : d));
  }

  // Object format: { "lucide-react": "^0.x" }
  const newDeps = { ...deps };
  if (newDeps["lucide-react"]) {
    delete newDeps["lucide-react"];
    newDeps[targetPkg] = "latest";
  }
  return newDeps;
}
