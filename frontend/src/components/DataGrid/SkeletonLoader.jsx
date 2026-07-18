import React from 'react';

export function SkeletonLoader({ columns = 6, rows = 8 }) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c}>
              <span className="placeholder-glow d-block">
                <span className="placeholder col-8 rounded" />
              </span>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default SkeletonLoader;
