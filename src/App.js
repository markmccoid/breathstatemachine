import * as React from 'react';
import {
  BreathMachineProvider,
  SessionSettingsType,
} from './context/breathMachineContext';

import Breath from './AppPerformance';

const machineSettings = [
  {
    breathReps: 30,
    holdTime: 120,
    breathRounds: 5,
    pauseTime: 2,
  },
  {
    breathReps: 5,
    holdTime: 12,
    breathRounds: 2,
    inhaleTime: 8,
  },
];
const App = () => {
  // const [state, send] = useMachine(timerMachine);
  const [showMachine, setShowMachine] = React.useState(false);
  const [machineToUse, setMachineToUse] = React.useState({});
  const startMachine = (machineNumber) => {
    setShowMachine(false);
    setMachineToUse(machineSettings[machineNumber]);
    setShowMachine(true);
  };
  console.log('machineToUse', machineToUse);
  return (
    <div>
      <h1>Select A Breath Machine</h1>
      <button onClick={() => startMachine(0)}>Start Machine 0</button>
      <button onClick={() => startMachine(1)}>Start Machine 1</button>
      <div>
        <button onClick={() => setShowMachine(false)}>Clost Machine</button>
      </div>
      {showMachine && (
        <BreathMachineProvider>
          <Breath sessionSettings={machineToUse} />
        </BreathMachineProvider>
      )}
    </div>
  );
};

export default App;
