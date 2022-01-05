import React from 'react';
import { useSelector } from '@xstate/react';
import { useBreathState } from '../context/breathMachineContext';

const TestSelect = () => {
  const breathStateServices = useBreathState();
  const currentBreath = useSelector(
    breathStateServices.breathStateService,
    (state) => state.context.breathCurrRep
  );
  console.log('curr Breath', currentBreath);
  return (
    <div>
      <h1>Current Breath</h1>
      <h2>{currentBreath}</h2>
    </div>
  );
};

export default React.memo(TestSelect);
