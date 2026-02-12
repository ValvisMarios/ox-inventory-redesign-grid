/**
 * gridSizes.ts
 *
 * Default grid footprint (width × height) for item name prefixes and exact names.
 * These are used as FALLBACKS when neither the item store definition nor slot metadata
 * carry explicit gridWidth / gridHeight values.
 *
 * HOW ITEM SIZES ARE RESOLVED (priority order):
 *  1. Items[name].gridWidth / gridHeight  (from items store / server)
 *  2. slot.gridWidth / slot.gridHeight    (per-slot metadata from server)
 *  3. Prefix match in GRID_SIZE_PREFIXES  (this file)
 *  4. Exact name match in GRID_SIZE_OVERRIDES (this file)
 *  5. Default: 1 × 1
 *
 * To add custom item sizes for your server, add entries here
 * OR (preferred) add gridWidth/gridHeight to your items.lua definition.
 */

export interface GridSize { w: number; h: number; }

/** Prefix-based defaults — order from MOST specific to LEAST specific */
export const GRID_SIZE_PREFIXES: Array<{ prefix: string; size: GridSize }> = [
  // ── Long rifles ─────────────────────────────────────────────────────────────
  { prefix: 'weapon_carbinerifle',     size: { w: 3, h: 2 } },
  { prefix: 'weapon_assaultrifle',     size: { w: 3, h: 2 } },
  { prefix: 'weapon_heavyrifle',       size: { w: 3, h: 2 } },
  { prefix: 'weapon_sniperrifle',      size: { w: 4, h: 2 } },
  { prefix: 'weapon_heavysniper',      size: { w: 4, h: 2 } },
  { prefix: 'weapon_marksmanrifle',    size: { w: 4, h: 2 } },
  { prefix: 'weapon_bullpuprifle',     size: { w: 3, h: 2 } },
  { prefix: 'weapon_compactrifle',     size: { w: 2, h: 2 } },
  { prefix: 'weapon_specialcarbine',   size: { w: 3, h: 2 } },
  { prefix: 'weapon_militaryrifle',    size: { w: 3, h: 2 } },
  { prefix: 'weapon_remotesniper',     size: { w: 4, h: 2 } },
  { prefix: 'weapon_gusenberg',        size: { w: 3, h: 2 } },
  { prefix: 'weapon_musket',           size: { w: 4, h: 2 } },

  // ── Shotguns ─────────────────────────────────────────────────────────────────
  { prefix: 'weapon_pumpshotgun',      size: { w: 3, h: 2 } },
  { prefix: 'weapon_sawnoffshotgun',   size: { w: 2, h: 2 } },
  { prefix: 'weapon_combatshotgun',    size: { w: 3, h: 2 } },
  { prefix: 'weapon_bullpupshotgun',   size: { w: 3, h: 2 } },
  { prefix: 'weapon_heavyshotgun',     size: { w: 3, h: 2 } },
  { prefix: 'weapon_dbshotgun',        size: { w: 2, h: 2 } },
  { prefix: 'weapon_autoshotgun',      size: { w: 3, h: 2 } },

  // ── SMGs ─────────────────────────────────────────────────────────────────────
  { prefix: 'weapon_microsmg',         size: { w: 2, h: 1 } },
  { prefix: 'weapon_minismg',          size: { w: 2, h: 1 } },
  { prefix: 'weapon_machinepistol',    size: { w: 2, h: 1 } },
  { prefix: 'weapon_assaultsmg',       size: { w: 2, h: 2 } },
  { prefix: 'weapon_combatpdw',        size: { w: 2, h: 2 } },
  { prefix: 'weapon_smg',             size: { w: 2, h: 2 } },

  // ── Machine guns ─────────────────────────────────────────────────────────────
  { prefix: 'weapon_combatmg',         size: { w: 4, h: 2 } },
  { prefix: 'weapon_mg',              size: { w: 4, h: 2 } },
  { prefix: 'weapon_minigun',          size: { w: 4, h: 3 } },

  // ── Pistols ──────────────────────────────────────────────────────────────────
  { prefix: 'weapon_appistol',         size: { w: 2, h: 1 } },
  { prefix: 'weapon_combatpistol',     size: { w: 2, h: 1 } },
  { prefix: 'weapon_heavypistol',      size: { w: 2, h: 1 } },
  { prefix: 'weapon_vintagepistol',    size: { w: 2, h: 1 } },
  { prefix: 'weapon_marksmanpistol',   size: { w: 2, h: 1 } },
  { prefix: 'weapon_snspistol',        size: { w: 2, h: 1 } },
  { prefix: 'weapon_ceramicpistol',    size: { w: 2, h: 1 } },
  { prefix: 'weapon_pistol50',         size: { w: 2, h: 1 } },
  { prefix: 'weapon_pistol',          size: { w: 2, h: 1 } },
  { prefix: 'weapon_revolver',         size: { w: 2, h: 1 } },
  { prefix: 'weapon_doubleaction',     size: { w: 2, h: 1 } },
  { prefix: 'weapon_navyrevolver',     size: { w: 2, h: 1 } },
  { prefix: 'weapon_raypistol',        size: { w: 2, h: 1 } },
  { prefix: 'weapon_stungun',          size: { w: 2, h: 1 } },
  { prefix: 'weapon_flaregun',         size: { w: 2, h: 1 } },

  // ── Melee ────────────────────────────────────────────────────────────────────
  { prefix: 'weapon_knife',            size: { w: 1, h: 2 } },
  { prefix: 'weapon_dagger',           size: { w: 1, h: 2 } },
  { prefix: 'weapon_switchblade',      size: { w: 1, h: 1 } },
  { prefix: 'weapon_machete',          size: { w: 1, h: 2 } },
  { prefix: 'weapon_hatchet',          size: { w: 1, h: 2 } },
  { prefix: 'weapon_stone_hatchet',    size: { w: 1, h: 2 } },
  { prefix: 'weapon_hammer',           size: { w: 1, h: 2 } },
  { prefix: 'weapon_wrench',           size: { w: 1, h: 2 } },
  { prefix: 'weapon_crowbar',          size: { w: 1, h: 2 } },
  { prefix: 'weapon_bat',              size: { w: 1, h: 3 } },
  { prefix: 'weapon_poolcue',          size: { w: 1, h: 3 } },
  { prefix: 'weapon_nightstick',       size: { w: 1, h: 2 } },
  { prefix: 'weapon_knuckle',          size: { w: 1, h: 1 } },

  // ── Launchers ────────────────────────────────────────────────────────────────
  { prefix: 'weapon_rpg',              size: { w: 4, h: 2 } },
  { prefix: 'weapon_hominglauncher',   size: { w: 4, h: 2 } },
  { prefix: 'weapon_grenadelauncher',  size: { w: 3, h: 2 } },
  { prefix: 'weapon_rayminigun',       size: { w: 4, h: 3 } },
  { prefix: 'weapon_raycarbine',       size: { w: 3, h: 2 } },
  { prefix: 'weapon_railgun',          size: { w: 4, h: 2 } },

  // ── Throwables ───────────────────────────────────────────────────────────────
  { prefix: 'weapon_grenade',          size: { w: 1, h: 1 } },
  { prefix: 'weapon_smokegrenade',     size: { w: 1, h: 1 } },
  { prefix: 'weapon_stickybomb',       size: { w: 1, h: 1 } },
  { prefix: 'weapon_pipebomb',         size: { w: 1, h: 1 } },
  { prefix: 'weapon_molotov',          size: { w: 1, h: 1 } },
  { prefix: 'weapon_proximitymine',    size: { w: 1, h: 1 } },
  { prefix: 'weapon_snowball',         size: { w: 1, h: 1 } },
  { prefix: 'weapon_flare',            size: { w: 1, h: 1 } },
  { prefix: 'weapon_hazardcan',        size: { w: 2, h: 2 } },
  { prefix: 'weapon_petrolcan',        size: { w: 2, h: 2 } },
  { prefix: 'weapon_fireextinguisher', size: { w: 2, h: 2 } },

  // ── Generic weapon_ fallback (catches any remaining weapons) ─────────────────
  { prefix: 'weapon_',                 size: { w: 2, h: 1 } },

  // ── Ammo ─────────────────────────────────────────────────────────────────────
  { prefix: 'ammo_',                   size: { w: 1, h: 1 } },

  // ── Bags / containers ────────────────────────────────────────────────────────
  { prefix: 'backpack',                size: { w: 2, h: 3 } },
  { prefix: 'duffelbag',               size: { w: 2, h: 3 } },
  { prefix: 'bag_',                    size: { w: 2, h: 2 } },
  { prefix: 'briefcase',               size: { w: 2, h: 2 } },
  { prefix: 'package',                 size: { w: 2, h: 2 } },
];

/** Exact-name overrides — checked after prefix matching */
export const GRID_SIZE_OVERRIDES: Record<string, GridSize> = {
  // Armour
  body_armor:          { w: 2, h: 3 },
  heavyarmor:          { w: 2, h: 3 },
  lightarmor:          { w: 2, h: 2 },
  ceramic_plate:       { w: 2, h: 2 },
  kevlar_plate:        { w: 2, h: 2 },
  brokenplate:         { w: 2, h: 2 },
  harness:             { w: 2, h: 2 },

  // Medical
  medkit:              { w: 2, h: 2 },
  firstaid:            { w: 2, h: 2 },
  advancedkit:         { w: 2, h: 2 },
  bandage:             { w: 1, h: 1 },
  painkillers:         { w: 1, h: 1 },
  oxy:                 { w: 1, h: 1 },

  // Electronics
  phone:               { w: 1, h: 2 },
  iphone:              { w: 1, h: 2 },
  laptop:              { w: 3, h: 2 },
  heavypc:             { w: 3, h: 3 },
  lightpc:             { w: 3, h: 2 },
  radio:               { w: 1, h: 2 },
  cryptostick:         { w: 1, h: 1 },
  fitbit:              { w: 1, h: 1 },

  // Documents / IDs
  id_card:             { w: 2, h: 1 },
  driver_license:      { w: 2, h: 1 },
  weapon_license:      { w: 2, h: 1 },
  lawyerpass:          { w: 2, h: 1 },
  certificate:         { w: 2, h: 1 },
  mastercard:          { w: 2, h: 1 },

  // Money
  cash_roll:           { w: 1, h: 1 },
  money:               { w: 1, h: 1 },
  markedbills:         { w: 1, h: 1 },
  moneybag:            { w: 2, h: 2 },
  casinochips:         { w: 1, h: 1 },
  goldbar:             { w: 1, h: 1 },
  gold_nugget:         { w: 1, h: 1 },
  diamond_ring:        { w: 1, h: 1 },
  goldchain:           { w: 1, h: 1 },
  '10kgoldchain':      { w: 1, h: 1 },

  // Tools
  toolbox:             { w: 2, h: 2 },
  drill:               { w: 2, h: 2 },
  electronickit:       { w: 2, h: 2 },
  cleaningkit:         { w: 2, h: 1 },
  lockpick:            { w: 1, h: 1 },
  advancedlockpick:    { w: 1, h: 1 },
  handcuffs:           { w: 1, h: 1 },
  rope:                { w: 2, h: 1 },
  binoculars:          { w: 2, h: 1 },
  fishingrod:          { w: 1, h: 3 },
  huntingrifle:        { w: 3, h: 2 },
  diving_gear:         { w: 2, h: 3 },

  // Drugs / consumables (1×1 by default)
  cocaine_baggy:       { w: 1, h: 1 },
  crack_baggy:         { w: 1, h: 1 },
  meth_bag:            { w: 1, h: 1 },
  meth_baggy:          { w: 1, h: 1 },
  weed_baggy:          { w: 1, h: 1 },
  joint:               { w: 1, h: 1 },
  xtc_baggy:           { w: 1, h: 1 },
  coke_brick:          { w: 2, h: 1 },
  coke_small_brick:    { w: 1, h: 1 },
  weed_brick:          { w: 2, h: 1 },

  // Food / drink
  burger:              { w: 1, h: 1 },
  cola:                { w: 1, h: 1 },
  water:               { w: 1, h: 1 },
  beer:                { w: 1, h: 1 },
  coffee:              { w: 1, h: 1 },
  whiskey:             { w: 1, h: 1 },
  wine:                { w: 1, h: 1 },
  baquette:            { w: 1, h: 1 },
  grapejuice:          { w: 1, h: 1 },
  grape:               { w: 1, h: 1 },

  // Containers / crates
  crate:               { w: 3, h: 3 },
  box:                 { w: 2, h: 2 },
  jerry_can:           { w: 2, h: 2 },

  // Raw materials
  iron_bar:            { w: 1, h: 1 },
  iron_nugget:         { w: 1, h: 1 },
  aluminum:            { w: 1, h: 1 },
  copper:              { w: 1, h: 1 },
  copperore:           { w: 1, h: 1 },
  metalscrap:          { w: 1, h: 1 },

  // Misc
  parachute:           { w: 2, h: 2 },
  labkey:              { w: 1, h: 1 },
  fertilizer:          { w: 2, h: 1 },
  nitrousoxide:        { w: 1, h: 1 },
  blindfold:           { w: 1, h: 1 },
  evidence:            { w: 1, h: 1 },
};

/** Return grid size for an item name, falling back through prefix table then 1×1 */
export function getDefaultGridSize(name: string): GridSize {
  const lower = (name || '').toLowerCase();
  if (GRID_SIZE_OVERRIDES[lower]) return GRID_SIZE_OVERRIDES[lower];
  for (const entry of GRID_SIZE_PREFIXES) {
    if (lower.startsWith(entry.prefix)) return entry.size;
  }
  return { w: 1, h: 1 };
}
