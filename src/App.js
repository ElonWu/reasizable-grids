import { useState } from 'react';
import './app.css';
import ResizableGrid from './components/ResizableGrid';

function App() {
  const [cols, setCols] = useState([30, 50, 20]);
  const [rows, setRows] = useState([30, 30, 40]);

  return (
    <div>
      <ResizableGrid
        width={'100vw'}
        height={'100vh'}
        cols={cols}
        rows={rows}
        splits={[
          [1, 2, 4, 2],
          [2, 2, 2, 3],
          [3, 2, 3, 3],
          [1, 3, 4, 3],
        ]}
        onChange={({ cols, rows }) => {
          if (cols) setCols(cols);
          if (rows) setRows(rows);
        }}
      >
        <div
          className="grid__elm"
          style={{
            gridArea: `1 / 1 / 4 / 2`,
            background: 'lightblue',
          }}
        />

        <div
          className="grid__elm"
          style={{
            gridArea: `1 / 2 / 2 / 3`,
            background: 'lightyellow',
          }}
        />

        <div
          className="grid__elm"
          style={{
            gridArea: `2 / 2 / 2 / 3`,
            background: 'purple',
          }}
        />

        <div
          className="grid__elm"
          style={{
            gridArea: `3 / 2 / 4 / 3`,
            background: 'lightgreen',
          }}
        />

        <div
          className="grid__elm"
          style={{
            gridArea: `1 / 3 / 4 / 4`,
            background: 'deepskyblue',
          }}
        />
      </ResizableGrid>
    </div>
  );
}

export default App;
