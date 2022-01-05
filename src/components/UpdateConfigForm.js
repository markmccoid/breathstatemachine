import React, { useCallback } from 'react';
import { useSelector } from '@xstate/react';
// import { breathMachine } from './machines/breathMachine2022';
import { useBreathState, objCompare } from '../context/breathMachineContext';
import { useBreathEvents } from '../hooks/useBreathMachineHooks';

const getConfigData = (state) => {
  return {
    breathReps: state.context.breathReps,
    holdTime: state.context.holdTime,
    breathRounds: state.context.breathRounds,
  };
};

const setConfig = (config) => {
  console.log('Setting Config', config);
};
const UpdateConfigForm = () => {
  const breathStateServices = useBreathState();
  const breathEvents = useBreathEvents();
  const send = breathStateServices.breathStateService.send;
  const { breathReps, holdTime, breathRounds } = useSelector(
    breathStateServices.breathStateService,
    getConfigData,
    objCompare
  );
  // const [breathReps, holdTime, breathRounds] = useSelector(
  //   breathStateServices.breathStateService,
  //   getConfigData
  // );
  // const [holdTime, breathRounds] = [3, 5, 2];
  console.log('in form', { breathReps, holdTime, breathRounds });

  const updateConfig = (event) => {
    event.preventDefault();
    // console.log(config);
    send('UPDATE_DEFAULTS', { breathReps, holdTime, breathRounds });
  };

  return (
    <>
      {/* <button onClick={() => send('START')}>Start</button>
      <button onClick={() => send('STOP')}>Stop</button> */}
      <form onSubmit={updateConfig}>
        <div>
          <label htmlFor="breathRepsinput">Breaths Per Round: </label>
          <input
            id="breathRepsinput"
            type="text"
            value={breathReps}
            onChange={(e) =>
              // setConfig({ ...config, breathReps: parseInt(e.target.value) })
              // send({
              //   type: 'UPDATE_DEFAULTS',
              //   sessionSettings: {
              //     breathReps: parseInt(e.target.value),
              //   },
              // })
              breathEvents.updateSessionSettings({
                breathReps: parseInt(e.target.value),
              })
            }
          />
        </div>
        <div>
          <label htmlFor="holdInput">Hold Seconds: </label>
          <input
            id="holdInput"
            type="text"
            value={holdTime}
            onChange={(e) =>
              // setConfig({ {breathReps, holdTime, breathRounds}, holdTime: parseInt(e.target.value) })

              breathEvents.updateSessionSettings({
                holdTime: parseInt(e.target.value),
              })
            }
          />
        </div>
        <div>
          <label htmlFor="breathRounds">Rounds: </label>
          <input
            id="breathRounds"
            type="text"
            value={breathRounds}
            onChange={(e) =>
              // setConfig({ {breathReps, holdTime, breathRounds}, breathRounds: parseInt(e.target.value) })

              breathEvents.updateSessionSettings({
                breathRounds: parseInt(e.target.value),
              })
            }
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default React.memo(UpdateConfigForm);
