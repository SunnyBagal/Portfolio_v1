import React from 'react';

// Animated terminal wordmark. Collapsed it shows the initials "SB_"; on hover
// (fine pointers only) the hidden segments expand so it reads "Sunny Bagal_".
// The two visible anchors are the S of "Sunny" and the B of "Bagal", with the
// hidden text filling in around the B. Styled by `.logo a` in nav.js.
const IconLogo = () => (
  <span className="logo-term" aria-hidden="true">
    S
    <span className="hide" style={{ '--w': '5.5ch' }}>
      unny{' '}
    </span>
    B
    <span className="hide" style={{ '--w': '4.5ch' }}>
      agal
    </span>
    <span className="caret">_</span>
  </span>
);

export default IconLogo;
