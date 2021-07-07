import * as React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';

export interface DisplayProps {
  id: string;
}

const Display = ({ id }: DisplayProps) => {
  const display = useSelector(({ displays }: AppState) => displays.find((dis) => dis.id === id));

  if (!display) return null;

  return (
    <div>{display.id}</div>
  );
};

export default Display;
