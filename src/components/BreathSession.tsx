import { useEffect } from 'react';
import { useSelector } from '@xstate/react';
import { inspect } from '@xstate/inspect';

import {
  SessionSettingsType,
  useBreathState,
} from '../context/breathMachineContext';
import UpdateConfigForm from '../components/UpdateConfigForm';
import TimeDisplay from '../components/TimeDisplay';

import {
  useBreathMachineMain,
  useBreathEvents,
  useBreathFlags,
} from '../hooks/useBreathMachineHooks';

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

// const stateToString = {
//   'breathing.inhale': 'Inhale',
//   'breathing.hold': 'Hold',
//   'breathing.exhale': 'Exhale',
//   'breathing.paused': 'Breathing Paused',
//   'holding.breathhold': 'Long Hold',
//   'holding.paused': 'Holding Paused',
//   idle: 'Idle',
//   holding: 'HOLD',
// };

type Props = {
  sessionSettings: SessionSettingsType;
};
const BreathSession = ({ sessionSettings }: Props) => {
  const [{ context, value: currStateValue }, send] = useBreathMachineMain();
  const breathEvents = useBreathEvents();

  const breathState = useBreathState();
  const isIdle = useSelector(breathState.breathStateService, (state) =>
    state.matches('idle')
  );

  const { canExtend, canPause, canUnPause, canStart, canStop, isExtending } =
    useBreathFlags();
  console.log('Breath Session Render', canStart, currStateValue);
  // console.log('rerendering - isIdle', isIdle, canUnPause, canPause);
  // sessionSettings are expected to be passed as props,
  // this useEffect will run whenever new settings are sent.
  useEffect(() => {
    console.log('in useEffect');
    breathEvents.updateSessionSettings(sessionSettings);
  }, [sessionSettings]);
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
        {canStart && <button onClick={breathEvents.startSession}>Start</button>}
        {canStop && <button onClick={breathEvents.stopSession}>Stop</button>}
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

export default BreathSession;
