'use client';

import React, { useRef } from 'react';

interface Props {
  delay: number;
  children: React.ReactNode;
}

export function DelayRender(props: Props) {
  const { delay, children } = props;
  const [show, setShow] = React.useState(false);
  const executionFlag = useRef<boolean>(false);

  React.useEffect(() => {
    if (!executionFlag.current) {
      setTimeout(() => {
        setShow(true);
        executionFlag.current = true;
      }, delay);
    }
  }, [delay]);

  return show ? <>{children}</> : null;
}
