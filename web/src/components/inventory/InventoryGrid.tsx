import React, { useCallback, useMemo, useState } from 'react';
import { Inventory, InventoryType, Slot } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot, { getItemWidth, getItemHeight } from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { toAsciiLower } from '../../utils/string';

// ─────────────────────────────────────────────────────────────────────────────
// Grid constants
// ─────────────────────────────────────────────────────────────────────────────
const CELL_SIZE = 56;   // px — size of one grid square
const CELL_GAP  = 3;    // px — gap between squares
const GRID_COLS = 10;   // number of columns in the grid

// ─────────────────────────────────────────────────────────────────────────────
// Packing — assigns each slot a visual (col, row) in the 2D grid
// ─────────────────────────────────────────────────────────────────────────────
interface Placement { slot: number; col: number; row: number; w: number; h: number; }

function packItems(slots: Slot[], cols: number): { placements: Placement[]; rows: number } {
  const occupied: boolean[][] = [];

  const ensureRows = (maxRow: number) => {
    while (occupied.length <= maxRow) occupied.push(new Array(cols).fill(false));
  };

  const markOccupied = (col: number, row: number, w: number, h: number) => {
    for (let r = row; r < row + h; r++) {
      ensureRows(r);
      for (let c = col; c < col + w; c++) occupied[r][c] = true;
    }
  };

  const findFree = (w: number, h: number): { col: number; row: number } => {
    for (let r = 0; ; r++) {
      ensureRows(r + h - 1);
      for (let c = 0; c <= cols - w; c++) {
        let fits = true;
        outer: for (let dr = 0; dr < h; dr++) {
          ensureRows(r + dr);
          for (let dc = 0; dc < w; dc++) {
            if (occupied[r + dr][c + dc]) { fits = false; break outer; }
          }
        }
        if (fits) return { col: c, row: r };
      }
    }
  };

  const placements: Placement[] = [];

  for (const slot of slots) {
    const w = getItemWidth(slot);
    const h = getItemHeight(slot);
    // Honour server-assigned grid position if present
    const fixedCol: number | undefined = (slot as any).gridX;
    const fixedRow: number | undefined = (slot as any).gridY;
    if (fixedCol !== undefined && fixedRow !== undefined) {
      markOccupied(fixedCol, fixedRow, w, h);
      placements.push({ slot: slot.slot, col: fixedCol, row: fixedRow, w, h });
      continue;
    }
    const pos = findFree(w, h);
    markOccupied(pos.col, pos.row, w, h);
    placements.push({ slot: slot.slot, col: pos.col, row: pos.row, w, h });
  }

  const maxRow = placements.reduce((m, p) => Math.max(m, p.row + p.h), 0);
  return { placements, rows: Math.max(maxRow, 4) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface InventoryGridProps {
  inventory: Inventory;
  itemsOverride?: Slot[];
  hideHeader?: boolean;
  hideExtras?: boolean;
  noWrapper?: boolean;
  onCtrlClick?: (item: any) => void;
  collapsible?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory, itemsOverride, hideHeader, hideExtras, noWrapper, onCtrlClick, collapsible,
}) => {
  const weight = useMemo(
    () => inventory.maxWeight !== undefined ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000 : 0,
    [inventory.maxWeight, inventory.items]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  // For OTHERPLAYER we skip the first 9 utility/hotbar slots
  const slotsToRender = useMemo(() => {
    const base = itemsOverride ?? inventory.items;
    return inventory.type === InventoryType.OTHERPLAYER ? base.slice(9) : base;
  }, [itemsOverride, inventory.items, inventory.type]);

  const { placements, rows } = useMemo(() => packItems(slotsToRender, GRID_COLS), [slotsToRender]);

  // Map (col,row) → the REAL slot object sitting there, so empty cells can
  // reference the correct slot number that the reducer expects.
  const placementMap = useMemo(() => {
    const map = new Map<string, { placement: Placement; slot: Slot }>();
    for (const p of placements) {
      const slot = slotsToRender.find((s) => s.slot === p.slot);
      if (!slot) continue;
      // Mark every cell this item covers
      for (let r = p.row; r < p.row + p.h; r++) {
        for (let c = p.col; c < p.col + p.w; c++) {
          map.set(`${c},${r}`, { placement: p, slot });
        }
      }
    }
    return map;
  }, [placements, slotsToRender]);

  // All empty cells — we render them as drop targets using the REAL slot
  // object from slotsToRender that corresponds to that grid position.
  // Empty cells are slots that have no item (slot.name === undefined).
  // We need to find which real empty slot to use for each empty visual cell.
  const emptyCellSlots = useMemo(() => {
    const emptySlots = slotsToRender.filter((s) => s.name === undefined);
    const result: Array<{ col: number; row: number; slot: Slot }> = [];
    let emptyIdx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!placementMap.has(`${c},${r}`)) {
          // Assign the next real empty slot to this visual cell
          const realSlot = emptySlots[emptyIdx];
          if (realSlot !== undefined) {
            result.push({ col: c, row: r, slot: realSlot });
            emptyIdx++;
          }
          // If we've used all empty slots we stop rendering drop targets
          // (shouldn't happen unless the grid is over-packed)
        }
      }
    }
    return result;
  }, [placementMap, slotsToRender, rows]);

  const normalizedQuery = toAsciiLower(searchQuery);
  const cellStep = CELL_SIZE + CELL_GAP;
  const gridW = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * CELL_GAP;
  const gridH = rows * CELL_SIZE + (rows - 1) * CELL_GAP;

  const headerTitle = useMemo(() => {
    if (inventory.type === InventoryType.PLAYER) return 'Pockets';
    if (inventory.type === InventoryType.SHOP) return 'Shop';
    if (inventory.type === InventoryType.CRAFTING) return 'Crafting';
    if (inventory.type === InventoryType.CRAFTING_STORAGE) return 'Crafting Storage';
    if (inventory.type === InventoryType.BACKPACK) return inventory.label || 'Backpack';
    if (inventory.type === InventoryType.CONTAINER) return 'Storage';
    if (inventory.type === InventoryType.OTHERPLAYER) return 'Robed Pockets';
    if (inventory.type === InventoryType.OTHERPLAYER_HOTBAR) return 'Robed Pockets Hotbar';
    if (inventory.type === 'stash') return inventory.label || 'Stash';
    if (inventory.type === 'drop') return 'Ground';
    if (inventory.type === 'trunk') return 'Trunk';
    if (inventory.type === 'glovebox') return 'Glovebox';
    return 'Ground';
  }, [inventory.label, inventory.type]);

  const handleHeaderClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!collapsible) return;
    const target = event.target as HTMLElement;
    if (target.closest('input') || target.closest('[data-stop-collapse]')) return;
    setIsCollapsed((prev) => !prev);
  }, [collapsible]);

  const gridContent = (
    <div
      className="inventory-grid-container"
      style={{ position: 'relative', width: gridW, height: gridH, flexShrink: 0 }}
    >
      {/* ── Empty cells as drop targets, using REAL slot numbers ─────────── */}
      {emptyCellSlots.map(({ col, row, slot }) => (
        <InventorySlot
          key={`empty-${slot.slot}`}
          item={slot}
          inventoryId={inventory.id}
          inventoryType={inventory.type}
          inventoryGroups={inventory.groups}
          absolute
          posLeft={col * cellStep}
          posTop={row * cellStep}
          slotWidth={CELL_SIZE}
          slotHeight={CELL_SIZE}
          style={{
            border: '1px solid rgba(255,255,255,0.04)',
            background: 'linear-gradient(135deg, rgba(22,22,22,0.5), rgba(0,0,0,0.6))',
            boxShadow: 'none',
          }}
        />
      ))}

      {/* ── Items ────────────────────────────────────────────────────────── */}
      {placements.map((p) => {
        const slot = slotsToRender.find((s) => s.slot === p.slot);
        if (!slot) return null;
        const matches = toAsciiLower(slot?.name ?? '').includes(normalizedQuery);
        const w = p.w * CELL_SIZE + (p.w - 1) * CELL_GAP;
        const h = p.h * CELL_SIZE + (p.h - 1) * CELL_GAP;
        return (
          <InventorySlot
            key={`${inventory.type}-${inventory.id}-${slot.slot}`}
            item={slot}
            inventoryType={inventory.type}
            inventoryGroups={inventory.groups}
            inventoryId={inventory.id}
            onCtrlClick={onCtrlClick}
            absolute
            posLeft={p.col * cellStep}
            posTop={p.row * cellStep}
            slotWidth={w}
            slotHeight={h}
            style={{ opacity: searchQuery && !matches ? 0.25 : 1, transition: 'opacity 0.2s ease' }}
          />
        );
      })}
    </div>
  );

  const content = (
    <>
      {!hideHeader && (
        <div>
          <div
            className="inventory-grid-header-wrapper"
            onClick={collapsible ? handleHeaderClick : undefined}
            role={collapsible ? 'button' : undefined}
            aria-expanded={collapsible ? !isCollapsed : undefined}
            style={collapsible ? { cursor: 'pointer' } : undefined}
          >
            <div className="inventory-grid-header-wrapper2"><h1>{headerTitle}</h1></div>
            {!hideExtras && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vh', cursor: 'auto' }} data-stop-collapse>
                  <input
                    style={{ border: '1px solid rgba(255,255,255,0.2)', height: '2.5vh', fontSize: '1vh', display: 'flex', alignItems: 'center' }}
                    type="search"
                    placeholder="Search Item"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => { fetch(`https://${GetParentResourceName()}/thisfuckingsucks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ focus: true }) }); }}
                    onBlur={() => { fetch(`https://${GetParentResourceName()}/lolthisisstupid`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ focus: false }) }); }}
                  />
                  <i className="far fa-search"></i>
                </div>
                <div className="inventory-grid-header-weight">
                  {inventory.maxWeight && (
                    <p>
                      <i className="fa-light fa-weight-hanging"></i>{' '}
                      {weight / 1000} / {inventory.maxWeight / 1000}kg
                      {collapsible && <i className={`fas fa-angle-${isCollapsed ? 'down' : 'up'}`} style={{ marginLeft: '0.5rem' }}></i>}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {!hideExtras && <WeightBar percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0} />}
        </div>
      )}

      {collapsible ? (
        <div
          className={`inventory-collapse${isCollapsed ? '' : ' open'}`}
          style={{ maxHeight: isCollapsed ? 0 : gridH + 32, opacity: isCollapsed ? 0 : 1, overflow: 'hidden', transition: 'max-height 0.3s ease, opacity 0.2s ease', pointerEvents: isCollapsed ? 'none' : 'auto' }}
        >
          <div style={{ paddingTop: 6 }}>{gridContent}</div>
        </div>
      ) : gridContent}
    </>
  );

  if (noWrapper) return content;

  return (
    <div className="inventory-grid-wrapper" style={{ pointerEvents: isBusy ? 'none' : 'auto', overflowX: 'auto' }}>
      {content}
    </div>
  );
};

export default InventoryGrid;
