import React, { useRef, useEffect, useState } from 'react';

interface ThreeDotsMenuProps {
  onEdit?: () => void;
  onAddChild?: () => void;
  onDelete?: () => void;
  addChildText?: string;
  menuItems?: { label: string; onClick: () => void; color?: string }[];
  iconColor?: string;
  size?: number;
}

const ThreeDotsMenu: React.FC<ThreeDotsMenuProps> = ({
  onEdit,
  onAddChild,
  onDelete,
  addChildText = 'Add Child',
  menuItems,
  iconColor = '#022AFF',
  size = 22,
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <span ref={btnRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          cursor: 'pointer',
          fontSize: size,
          color: iconColor,
          userSelect: 'none',
          padding: 2,
        }}
        onClick={e => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
        title="Menu"
      >
        ⋯
      </span>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: size + 4,
            right: 0,
            background: '#fff',
            border: '1px solid #022AFF',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(2,42,255,0.15)',
            zIndex: 1000,
            minWidth: 120,
            padding: 4,
          }}
          onClick={e => e.stopPropagation()}
        >
          {menuItems ? (
            menuItems.map(item => (
              <button
                key={item.label}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: item.color || '#022AFF',
                  padding: '8px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))
          ) : (
            <>
              {onEdit && (
                <button
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#022AFF',
                    padding: '8px 0',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                >
                  Edit
                </button>
              )}
              {onAddChild && (
                <button
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#022AFF',
                    padding: '8px 0',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setOpen(false);
                    onAddChild();
                  }}
                >
                  {addChildText}
                </button>
              )}
              {onDelete && (
                <button
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: '#d11a2a',
                    padding: '8px 0',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </span>
  );
};

export default ThreeDotsMenu;