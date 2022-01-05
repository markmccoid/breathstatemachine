// import { faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMachine, useActor } from '@xstate/react';
// import { breathMachine } from './machines/breathMachine2022';
import { useBreathState } from './context/breathMachineContext';
import { useState } from 'react';
import { inspect } from '@xstate/inspect';
// import { ProgressCircle } from '../ProgressCircle';
// import { timerMachine } from './timerMachine.final';
import TestSelect from './components/TestSelect';

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
const Breath = () => {
  // const [state, send] = useMachine(timerMachine);
  // const [state, send] = useMachine(breathMachine, { devTools: true });
  const breathStateServices = useBreathState();
  const [state] = useActor(breathStateServices.breathStateService);
  const send = breathStateServices.breathStateService.send;

  const [config, setConfig] = useState({
    breathReps: 3,
    holdTime: 10,
    breathRounds: 3,
  });
  const bContext = state.context;
  // console.log('STATE', state);
  // console.log('STATE', state);
  // console.log('CONTEXT', bContext);
  const updateConfig = (event) => {
    event.preventDefault();
    console.log(config);
    send('UPDATE_DEFAULTS', config);
  };

  // if (state.done) {
  //   console.log('STATE', state.value, state.toStrings().slice(-1));
  // console.log('can extend', state.value, state.nextEvents);
  // }
  console.log('rerendering');
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
      <TestSelect />
      <form onSubmit={updateConfig}>
        <div>
          <label htmlFor="breathRepsinput">Breaths Per Round: </label>
          <input
            id="breathRepsinput"
            type="text"
            value={config.breathReps}
            onChange={(e) =>
              setConfig({ ...config, breathReps: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <label htmlFor="holdInput">Hold Seconds: </label>
          <input
            id="holdInput"
            type="text"
            value={config.holdTime}
            onChange={(e) =>
              setConfig({ ...config, holdTime: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <label htmlFor="breathRounds">Rounds: </label>
          <input
            id="breathRounds"
            type="text"
            value={config.breathRounds}
            onChange={(e) =>
              setConfig({ ...config, breathRounds: parseInt(e.target.value) })
            }
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div
        className="display"
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          padding: '10px',
          border: `1px solid ${state.value === 'idle' ? 'red' : 'yellow'}`,
        }}
      >
        <div className="label">{state.toStrings().slice(-1)}</div>
      </div>
      {/* <div>{state.context.}</div> */}
      <button onClick={() => send('START')}>Start</button>
      <button onClick={() => send('STOP')}>Stop</button>
      <div>
        <button onClick={() => send('NEXT')}>Next</button>
        <button onClick={() => send('PAUSE')}>Pause</button>
        <button onClick={() => send('UNPAUSE')}>Unpause</button>
        <button
          disabled={!state.can('EXTEND_TOGGLE')}
          style={{ background: state.can('EXTEND_TOGGLE') ? 'gray' : 'red' }}
          onClick={() => send('EXTEND_TOGGLE')}
        >
          Extend
        </button>
      </div>
      <div>{state.context.extend ? 'Extend = true' : 'Extend = false'}</div>
      <div>
        {/* <div>{bContext.elapsed.toFixed(2)}</div> */}
        <div>Current Breath: {bContext.breathCurrRep}</div>
        <div>Current Round: {bContext.breathCurrRound}</div>
      </div>
      <h1>{`${bContext.breathCurrRep}-${
        stateToString[state.toStrings().slice(-1)]
      }${state.value.toString()}`}</h1>

      <div>
        <button
          onClick={() =>
            send('UPDATE_DEFAULTS', { breathReps: 5, breathRounds: 2 })
          }
        >
          Set Context
        </button>
      </div>
    </div>
  );
};

export default Breath;
