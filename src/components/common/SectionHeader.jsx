import React from 'react';
import { C } from '../../utils/constants';

export const SectionHeader = ({ eyebrow, title, desc }) => {
  return (
    <div className="mb-8">
      <div className="f-display uppercase text-xs font-semibold" style={{ color: C.amber }}>
        {eyebrow}
      </div>
      <h2 className="f-display font-bold text-3xl mt-1" style={{ color: C.paper }}>
        {title}
      </h2>
      {desc && (
        <p className="text-sm mt-2 max-w-lg" style={{ color: C.steel }}>
          {desc}
        </p>
      )}
    </div>
  );
};