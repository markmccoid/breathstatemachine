import React from 'react';
// import { useBreathState } from "../context/breathMachineContext";
import { useTimer } from '../hooks/useBreathMachineHooks';
import { useSelector } from '@xstate/react';

const TimeDisplay = () => {
  // const breathStateServices = useBreathState();
  // // const [state] = useActor(breathStateServices.breathStateService);
  // const elapsed = useSelector(
  //   breathStateServices.breathStateService,
  //   (state) => state.context.elapsed
  // );

  const elapsed = useTimer();

  return (
    <div style={{ color: 'red', padding: 10, border: '1px solid yellow' }}>
      TimeDisplay - {elapsed.toFixed(2)}
    </div>
  );
};

export default TimeDisplay;
