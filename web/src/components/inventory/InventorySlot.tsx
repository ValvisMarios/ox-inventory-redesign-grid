import React, { useCallback, useRef } from 'react';
import { DragSource, InventoryType, SlotWithItem } from '../../typings';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../store';
import WeightBar from '../utils/WeightBar';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { Items } from '../../store/items';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { Locale } from '../../store/locale';
import { onCraft } from '../../dnd/onCraft';
import useNuiEvent from '../../hooks/useNuiEvent';
import { ItemsPayload } from '../../reducers/refreshSlots';
import { closeTooltip, openTooltip } from '../../store/tooltip';
import { openContextMenu } from '../../store/contextMenu';
import { useMergeRefs } from '@floating-ui/react';
import { Rarity, getRarityKey, getRarityDisplayName } from '../../store/rarity';
import { getDefaultGridSize } from './gridSizes';

export function getItemWidth(item: any): number {
  if (!item?.name) return 1;
  
  // Priority 1: Check if the item slot has gridWidth (from metadata)
  if (item.gridWidth !== undefined) return item.gridWidth;
  
  // Priority 2: Check the Items store
  const itemData = Items[item.name];
  if (itemData) {
    // Try to access gridWidth from the item data
    // Cast to any to avoid TypeScript errors if the property doesn't exist in the type
    const data = itemData as any;
    if (data.gridWidth !== undefined) return data.gridWidth;
  }
  
  // Priority 3: Check if the item name is in the items.lua data that might be in metadata
  if (item.metadata?.gridWidth !== undefined) return item.metadata.gridWidth;
  
  // Priority 4: Fallback to gridSizes.ts
  return getDefaultGridSize(item.name).w;
}

export function getItemHeight(item: any): number {
  if (!item?.name) return 1;
  
  // Priority 1: Check if the item slot has gridHeight (from metadata)
  if (item.gridHeight !== undefined) return item.gridHeight;
  
  // Priority 2: Check the Items store
  const itemData = Items[item.name];
  if (itemData) {
    const data = itemData as any;
    if (data.gridHeight !== undefined) return data.gridHeight;
  }
  
  // Priority 3: Check if the item name is in the items.lua data that might be in metadata
  if (item.metadata?.gridHeight !== undefined) return item.metadata.gridHeight;
  
  // Priority 4: Fallback to gridSizes.ts
  return getDefaultGridSize(item.name).h;
}

interface SlotProps {
  inventoryId: string;
  inventoryType: string;
  displayInventoryType?: string;
  inventoryGroups: any;
  item: any;
  onUse?: (item: any) => void;
  canDrop?: (item: any) => boolean;
  style?: React.CSSProperties;
  onCtrlClick?: (item: any) => void;
  posLeft?: number;
  posTop?: number;
  slotWidth?: number;
  slotHeight?: number;
  absolute?: boolean;
}

const InventorySlot: React.ForwardRefRenderFunction<HTMLDivElement, SlotProps> = (
  { item, inventoryId, inventoryType, displayInventoryType, inventoryGroups, onUse, canDrop, style, onCtrlClick, posLeft, posTop, slotWidth, slotHeight, absolute = false },
  ref
) => {
  const manager = useDragDropManager();
  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);
  const visualInventoryType = displayInventoryType ?? inventoryType;

  const hasItem = isSlotWithItem(item);
  const rarityKey = hasItem ? getRarityKey(item?.rarity) : null;
  const rarityColor = rarityKey ? Rarity[rarityKey] : null;

  const itemW = getItemWidth(item);
  const itemH = getItemHeight(item);
  
  // 🔥 NEW: Check if item is at least 2x2
  const isLargeItem = itemW >= 2 && itemH >= 2;

  const withAlpha = (color: string, alpha: number) => {
    return color.replace(/rgba?\(([^)]+)\)/, (match, contents) => {
      if (!contents) return match;
      const parts = contents.split(',').map((p: string) => p.trim());
      if (parts.length === 3) return `rgba(${parts.join(', ')}, ${alpha})`;
      if (parts.length === 4) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      return match;
    });
  };

  const canDragCb = useCallback(() => {
    if (!isSlotWithItem(item, true)) return false;
    if (inventoryType === InventoryType.SHOP) return true;
    return (canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) && canCraftItem(item, inventoryType));
  }, [item, inventoryType, inventoryGroups]);

  const [{ isDragging }, drag] = useDrag<DragSource, void, { isDragging: boolean }>(
    () => ({
      type: 'SLOT',
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: () => {
        if (!canDragCb()) return null;
        return { inventory: inventoryType, item: { ...item, label: item.metadata?.label ?? item.label ?? Items[item.name]?.label ?? item.name }, image: item?.name && `url(${getItemUrl(item) || 'none'})` };
      },
      canDrag: canDragCb,
    }),
    [inventoryType, item, canDragCb]
  );

  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean; canDrop: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
      drop: (source) => {
        dispatch(closeTooltip());
        switch (source.inventory) {
          case InventoryType.SHOP: onBuy(source, { inventory: inventoryType, item: { ...item } }); break;
          case InventoryType.CRAFTING: onCraft(source, { inventory: inventoryType, item: { ...item } }); break;
          default: onDrop(source, { inventory: inventoryType, item: { ...item } }); break;
        }
      },
      canDrop: (source) => {
        if (source.inventory === InventoryType.SHOP) return false;

        if (
          inventoryType === InventoryType.SHOP ||
          inventoryType === InventoryType.CRAFTING
        ) {
          return false;
        }

        // Allow drop if:
        // - Different inventory
        // - OR different slot
        // - OR target slot is empty
        const isSameSlot =
          source.item.slot === item.slot &&
          source.inventory === inventoryType;

        const targetIsEmpty = !item?.name;

        if (isSameSlot && !targetIsEmpty) return false;

        return canDrop ? canDrop(source.item) : true;
      },

    }),
    [inventoryType, item, canDrop]
  );

  useNuiEvent('refreshSlots', (data: { items?: ItemsPayload | ItemsPayload[] }) => {
    if (!isDragging && !data.items) return;
    if (!Array.isArray(data.items)) return;
    const itemSlot = data.items.find((dataItem) => dataItem.item.slot === item.slot && dataItem.inventory === inventoryId);
    if (!itemSlot) return;
    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  const connectRef = (element: HTMLDivElement) => drag(drop(element));
  const refs = useMergeRefs([connectRef, ref]);

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if ((inventoryType !== 'player' && inventoryType !== 'backpack') || !isSlotWithItem(item)) return;
    dispatch(closeTooltip());
    dispatch(openContextMenu({ item, coords: { x: event.clientX, y: event.clientY }, inventoryType }));
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    dispatch(closeTooltip());
    if (timerRef.current) clearTimeout(timerRef.current);
    if (event.ctrlKey && isSlotWithItem(item)) {
      if (inventoryType === InventoryType.SHOP && onCtrlClick) { onCtrlClick(item); }
      else if (inventoryType !== InventoryType.CRAFTING) { onDrop({ item: item, inventory: inventoryType }); }
    } else if (event.altKey && isSlotWithItem(item) && inventoryType === 'player') {
      if (onUse) onUse(item);
    }
  };

  const imgSizePct = Math.min(88, 50 + (itemW - 1) * 12 + (itemH - 1) * 12);
  const positionStyle: React.CSSProperties = absolute ? { position: 'absolute', left: posLeft, top: posTop, width: slotWidth, height: slotHeight, zIndex: hasItem ? 2 : 1 } : {};

  return (
    <div
      ref={refs}
      onContextMenu={handleContext}
      onClick={handleClick}
      className="inventory-slot"
      style={{
        ...positionStyle,
        borderRadius: rarityColor ? '4px' : '0px',
        padding: '6px',
        boxSizing: 'border-box',
        border: isOver ? '1px dashed rgba(255,255,255,0.5)' : '1px solid transparent',
        background: isOver
          ? `${item?.name ? `url(${getItemUrl(item as SlotWithItem)}) center / contain no-repeat padding-box,` : ''} linear-gradient(45deg, #ffffff00, #00000000) padding-box, linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0)) border-box`
          : rarityColor
          ? `${item?.name ? `url(${getItemUrl(item as SlotWithItem)}) center / contain no-repeat padding-box,` : ''} linear-gradient(45deg, #161616bb, #000000b4) padding-box, linear-gradient(-45deg, rgba(255, 255, 255, 0), ${withAlpha(rarityColor, 1)}) border-box`
          : `${item?.name ? `url(${getItemUrl(item as SlotWithItem)}) center / contain no-repeat padding-box,` : ''} linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03)) border-box`,
        filter: (!canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) || !canCraftItem(item, inventoryType))
          ? 'brightness(80%) grayscale(100%)'
          : undefined,
        opacity: isDragging ? 0.35 : 1.0,

        overflow: 'hidden', // <-- prevent overflow
        ...style,
      }}
    >
      {isSlotWithItem(item) && (
        <div
          className="item-slot-wrapper"
          onMouseEnter={() => {
            timerRef.current = window.setTimeout(() => {
              dispatch(openTooltip({ item, inventoryType }));
            }, 500) as unknown as number;
          }}
          onMouseLeave={() => {
            dispatch(closeTooltip());
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }}
          style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
        >
          <div className="item-slot-header-wrapper" style={{ color: rarityColor ?? undefined, overflow: 'hidden' }}>
            <div className="hotbar-slot-header-wrapper" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.count && item.count > 1 && (
                <div className={visualInventoryType === 'utility' ? 'item-slot-info-wrapper2' : 'item-slot-info-wrapper'} style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.count.toLocaleString('en-us')}x</p>
                </div>
              )}
            </div>
            {visualInventoryType === 'utility' && item.slot <= 5 && (
              <div className="hotbar-slot-header-wrapper" style={{ overflow: 'hidden' }}>
                <div
                  className="inventory-slot-number"
                  style={{
                    background: rarityColor ?? undefined,
                    border: rarityColor ? `1px solid ${rarityColor}` : undefined,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.slot}
                </div>
              </div>
            )}
            {/* 🔥 MODIFIED: Only show rarity for large items (2x2 or bigger) */}
            {isLargeItem && (
              <div
                className="inventory-slot-rarity"
                style={{
                  color: rarityColor ?? undefined,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getRarityDisplayName(item.rarity)}
              </div>
            )}
          </div>

          <div style={{ overflow: 'hidden' }}>
            {inventoryType === 'shop' && item?.price !== undefined ? (
              <div className="inventory-slot-label-box" style={{ overflow: 'hidden' }}>
                {/* 🔥 MODIFIED: Only show label for large items (2x2 or bigger) */}
                {isLargeItem && (
                  <div
                    className="inventory-slot-label-text"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {item.metadata?.label ?? Items[item.name]?.label ?? item.label ?? item.name}
                  </div>
                )}
                {item?.currency !== 'money' && item.currency ? (
                  <div className="item-slot-currency-wrapper" style={{ overflow: 'hidden' }}>
                    <img
                      src={item.currency === 'black_money' ? 'assets/icons/black_money.png' : 'assets/icons/money.png'}
                      alt={item.currency}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <p style={{ margin: 0, color: 'rgba(171,171,171,1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.price.toLocaleString('en-us')}
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'rgba(171,171,171,1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {Locale.$ || '$'}
                    {item.price.toLocaleString('en-us')}
                  </p>
                )}
              </div>
            ) : (
              <div className="inventory-slot-label-box" style={{ overflow: 'hidden' }}>
                {/* 🔥 MODIFIED: Only show label for large items (2x2 or bigger) */}
                {isLargeItem && (
                  <div
                    className="inventory-slot-label-text"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {item.metadata?.label ?? Items[item.name]?.label ?? item.label ?? item.name}
                  </div>
                )}
                {/* 🔥 MODIFIED: Only show weight for large items (2x2 or bigger) */}
                {isLargeItem && (
                  <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.weight > 0
                      ? item.weight >= 1000
                        ? `${(item.weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg`
                        : `${item.weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g`
                      : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {inventoryType !== 'shop' && item?.durability !== undefined && (
        <WeightBar percent={item.durability} durability rarityColor={rarityColor || undefined} />
      )}
    </div>
  );

};

export default React.memo(React.forwardRef(InventorySlot));