/* Lucide-style SVG icons (MIT) — inline to avoid install issues.
   All icons use strokeWidth=1.75 for a consistent premium look. */

const Icon = ({ d, size = 20, stroke, style, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke || 'currentColor'}
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
    {...rest}
  >
    {d}
  </svg>
);

export const IconHome = (p) => <Icon {...p} d={
  <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
}/>;

export const IconSwords = (p) => <Icon {...p} d={
  <><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="19.2" y2="19.2"/><line x1="16" y1="16" x2="19.2" y2="19.2"/><polyline points="9.5 6.5 3 6 3 3 6 3 6.5 9.5"/><line x1="5" y1="5" x2="9" y2="9"/><line x1="14.5" y1="17.5 21 21"/><line x1="14.5" y1="17.5" x2="21" y2="21"/></>
}/>;

export const IconPlay = (p) => <Icon {...p} d={
  <polygon points="5 3 19 12 5 21 5 3"/>
}/>;

export const IconBookmark = (p) => <Icon {...p} d={
  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
}/>;

export const IconHistory = (p) => <Icon {...p} d={
  <><polyline points="2.5 12 8.5 12"/><path d="M6.5 8.5 3 12l3.5 3.5"/><path d="M5 12A7 7 0 1 0 12 5"/><polyline points="12 7 12 12 16 14"/></>
}/>;

export const IconUser = (p) => <Icon {...p} d={
  <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
}/>;

export const IconSettings = (p) => <Icon {...p} d={
  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>
}/>;

export const IconPenLine = (p) => <Icon {...p} d={
  <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></>
}/>;

export const IconLayoutDashboard = (p) => <Icon {...p} d={
  <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>
}/>;

export const IconFlame = (p) => <Icon {...p} d={
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
}/>;

export const IconChevronLeft = (p) => <Icon {...p} d={
  <polyline points="15 18 9 12 15 6"/>
}/>;

export const IconChevronRight = (p) => <Icon {...p} d={
  <polyline points="9 18 15 12 9 6"/>
}/>;

export const IconSun = (p) => <Icon {...p} d={
  <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
}/>;

export const IconMoon = (p) => <Icon {...p} d={
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
}/>;

export const IconLogOut = (p) => <Icon {...p} d={
  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>
}/>;

export const IconShield = (p) => <Icon {...p} d={
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
}/>;

export const IconTrophy = (p) => <Icon {...p} d={
  <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>
}/>;

export const IconGraduationCap = (p) => <Icon {...p} d={
  <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>
}/>;

export const IconMenu = (p) => <Icon {...p} d={
  <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
}/>;

export const IconX = (p) => <Icon {...p} d={
  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
}/>;
