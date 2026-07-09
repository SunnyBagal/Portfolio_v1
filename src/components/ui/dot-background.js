import React from 'react';
import { cn } from '@utils/cn';

export function DotBackground({ children, className }) {
  return (
    <div className={cn('tw-relative', className)}>
      {/* Full-viewport dot layer — positioned absolutely, breaks out of parent
          max-width/padding using viewport units + negative calc offsets */}
      <div
        className="tw-absolute tw-top-0 tw-left-1/2 tw-pointer-events-none"
        style={{
          width: '100vw',
          height: '100%',
          transform: 'translateX(-50%)',
          zIndex: 0,
        }}>
        <div
          className={cn(
            'tw-absolute tw-inset-0',
            '[background-size:20px_20px]',
            '[background-image:radial-gradient(circle,var(--dark-slate)_1px,transparent_1px)]',
          )}
        />
        {/* Radial fade mask — dots fade out toward the edges */}
        <div
          className="tw-absolute tw-inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          style={{ backgroundColor: 'var(--navy)' }}
        />
      </div>
      {/* Content sits above the dot layer */}
      <div className="tw-relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default DotBackground;
