import { useMachine, useActor } from '@xstate/react';
import { useEffect } from 'react';
import { useBreathState } from './context/breathMachineContext';
import { useSelector } from '@xstate/react';
import { inspect } from '@xstate/inspect';

import UpdateConfigForm from './components/UpdateConfigForm';
import TimeDisplay from './components/TimeDisplay';

import {
  useSelections,
  useBreathEvents,
  useBreathFlags,
} from './hooks/useSelections';

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const stateToString = {
  'breathing.inhale': 'Inhale',
  'breathing.hold': 'Hold',
  'breathing.exhale': 'Exhale',
  'breathing.paused': 'Breathing Paused',
  'holding.breathhold': 'Long Hold',
  'holding.paused': 'Holding Paused',
  idle: 'Idle',
  holding: 'HOLD',
};
const getValue = (state) => state.value;
const Breath = (props) => {
  // if (state.done) {
  //   console.log('STATE', state.value, state.toStrings().slice(-1));
  // console.log('can extend', state.value, state.nextEvents);
  // }
  // const canExtend = useSelector(
  //   breathStateServices.breathStateService,
  //   canExtendTimeSelector
  // );

  //   const breathStateServices = useBreathState();
  //   const send = breathStateServices.breathStateService.send;
  // const currStateValue = useSelector(
  //   breathStateServices.breathStateService,
  //   getValue,
  //   objCompare
  //   );

  const [{ context, value: currStateValue }, send] = useSelections();
  const breathState = useBreathState();
  const breathEvents = useBreathEvents();
  const isIdle = useSelector(breathState.breathStateService, (state) =>
    state.matches('idle')
  );
  const { canExtend, canPause, canUnPause, isExtending } = useBreathFlags();
  // const canExtend = useSelector(breathState.breathStateService, (state) =>
  //   state.can("EXTEND_TOGGLE")
  // );
  // const isExtending = context.extend;
  // const canPause = useSelector(
  //   breathState.breathStateService,
  //   (state) => state.can("PAUSE") && !state.can("UNPAUSE")
  // );
  // const canUnPause = useSelector(breathState.breathStateService, (state) =>
  //   state.can("UNPAUSE")
  // );
  console.log('rerendering - isIdle', isIdle, canUnPause, canPause);
  useEffect(() => {
    console.log('in useEffect');
    breathEvents.updateDefaults(props.sessionSettings);
  }, [props.sessionSettings]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <header>
        <h1>Breathing Machine Testing</h1>
      </header>
      <div>
        <h2> {JSON.stringify(currStateValue)}</h2>
      </div>
      {/* <TestSelect /> */}
      <div>
        <button onClick={breathEvents.startSession}>Start</button>
        <button onClick={breathEvents.stopSession}>Stop</button>
      </div>
      <div>
        {canPause && <button onClick={breathEvents.pauseSession}>Pause</button>}
        {canUnPause && (
          <button onClick={breathEvents.unpauseSession}>unPause</button>
        )}
      </div>
      <UpdateConfigForm />
      {canExtend && (
        <button onClick={() => send('EXTEND_TOGGLE')}>
          {isExtending ? 'stop extending' : 'Extend'}
        </button>
      )}
      <TimeDisplay />
    </div>
  );
};

export default Breath;
