import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { throttle } from 'lodash';

const ResizableGrid = ({
  cols = [], // 列比例
  rows = [], // 行比例
  splits = [], // 分割线位置
  width, // 容器宽
  height, // 容器高
  onChange, // 分割线改变时的回调
  children,
}) => {
  const [moveSplit, setMoveSplit] = useState(null);
  const [rect, setRect] = useState({});

  const containerRef = useRef();
  useEffect(() => {
    setRect(containerRef.current.getBoundingClientRect());
    return () => setMoveSplit(null);
  }, []);

  const gridStyles = useMemo(() => {
    const gridTemplateColumns = cols.map((col) => `${col}%`).join(' ');
    const gridTemplateRows = rows.map((row) => `${row}%`).join(' ');

    const styles = {
      gridTemplate: `${gridTemplateRows} / ${gridTemplateColumns}`,
    };

    return styles;
  }, [cols, rows]);

  const splitLines = useMemo(() => {
    return splits
      .map(([startRow, startCol, endRow, endCol]) => {
        // 分割线的方向
        const isHorizontal = startRow === endRow;
        const isVertical = startCol === endCol;

        // 不合理的分割线
        if (isHorizontal && isVertical) return null;
        if (isHorizontal && (startRow === 1 || endRow === rows.length + 1))
          return null;
        if (isVertical && (startCol === 1 || endCol === cols.length + 1))
          return null;

        let top = 0,
          bottom = 0,
          left = 0,
          right = 0;

        for (let i = 0; i < rows.length; i++) {
          if (i + 1 < startRow) {
            top += rows[i];
          }
          if (i + 1 < endRow && isVertical) {
            bottom += rows[i];
          }
        }

        for (let i = 0; i < cols.length; i++) {
          if (i + 1 < startCol) {
            left += cols[i];
          }
          if (i + 1 < endCol && isHorizontal) {
            right += cols[i];
          }
        }

        let style = Object.assign(
          {
            background: '#ff9988',
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
          },
          isVertical
            ? {
                width: 4,
                transform: 'translateX(-50%)',
                bottom: `${100 - bottom}%`,
                cursor: 'col-resize',
              }
            : {
                height: 4,
                transform: 'translateY(-50%)',
                right: `${100 - right}%`,
                cursor: 'row-resize',
              },
        );

        return isVertical
          ? {
              style,
              dir: 'vertical',
              index: startCol,
            }
          : {
              style,
              dir: 'horizontal',
              index: startRow,
            };
      })
      .filter(Boolean);
  }, [cols, rows, splits]);

  const onMouseMove = useCallback(
    throttle((e) => {
      if (!moveSplit) return;

      const { dir, index } = moveSplit;

      // 移动方向默认为向右和向下;
      const decreaseIndex = index - 1;
      const increaseIndex = index - 2;

      if (dir === 'horizontal') {
        const movePercent =
          Math.round(((e.movementY - rect.top) / rect.height) * 10000) / 100;

        const newRows = [...rows];

        if (
          rows[decreaseIndex] - movePercent > 5 &&
          rows[increaseIndex] + movePercent > 5
        ) {
          newRows[decreaseIndex] = rows[decreaseIndex] - movePercent;
          newRows[increaseIndex] = rows[increaseIndex] + movePercent;
        }

        onChange({ rows: newRows });
      } else if (dir === 'vertical') {
        const movePercent =
          Math.round(((e.movementX - rect.left) / rect.width) * 10000) / 100;

        const newCols = [...cols];

        if (
          cols[decreaseIndex] - movePercent > 5 &&
          cols[increaseIndex] + movePercent > 5
        ) {
          newCols[decreaseIndex] = cols[decreaseIndex] - movePercent;

          newCols[increaseIndex] = cols[increaseIndex] + movePercent;
        }

        onChange({ cols: newCols });
      }
    }, 24),
    [rect, moveSplit, cols, rows, onChange],
  );

  const onMouseDown = useCallback((e, dir, index, origin) => {
    setMoveSplit({ dir, index, origin });
  }, []);

  const onMouseUp = useCallback(
    (e) => {
      if (!moveSplit) return;
      // 事件解绑
      e.target.removeEventListener('mousemove', onMouseMove);
      e.target.removeEventListener('mouseup', onMouseUp);

      setMoveSplit(null);
    },
    [moveSplit, onMouseMove],
  );

  return (
    <div
      className="grid"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      draggable={false}
      style={{ width, height, ...gridStyles }}
    >
      {children}
      {splitLines.map(({ style, dir, index }) => (
        <span
          style={style}
          key={`${dir}-${index}`}
          onMouseDown={(e) => onMouseDown(e, dir, index)}
        />
      ))}
    </div>
  );
};

export default ResizableGrid;
