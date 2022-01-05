import { useBreathState, objCompare, SessionSettingsType } from "../context/breathMachineContext";
import { useSelector } from "@xstate/react";
import { Sender } from "xstate";
import { BreathContext, BreathEvent } from "../machines/breathMachine";

type BreathContextWOElapsed = Omit<BreathContext, "elapsed">;
// Selector that excludes elapsed from the context
const getContextSansElapsed = (state) => {
  const context = { ...state.context };
  delete context.elapsed;
  const newData: { context: BreathContextWOElapsed; value: String | Object } = {
    context,
    value: state.value,
  };
  return newData;
};

//------------------------------------
// Main hook that returns all context except elapsed
// AND returns the send function to send events
// -- opt for useBreathEvents instead of send --
//------------------------------------
export const useBreathMachineMain = (): [
  { context: BreathContextWOElapsed; value: String | Object },
  Sender<BreathEvent>
] => {
  const breathStateServices = useBreathState();
  const send = breathStateServices.breathStateService.send;
  const breathData = useSelector(
    breathStateServices.breathStateService,
    getContextSansElapsed,
    objCompare
  );

  return [breathData, send];
};

//------------------------------------
// just returns the elapsed number
//------------------------------------
export const useTimer = (): number => {
  const breathStateServices = useBreathState();
  // const [state] = useActor(breathStateServices.breathStateService);
  const elapsed = useSelector(
    breathStateServices.breathStateService,
    (state) => state.context.elapsed
  );
  return elapsed
}
//------------------------------------
// Useful flags helpful in indicating 
// state and thus events possible
//------------------------------------
export const useBreathFlags = () => {
  const breathStateServices = useBreathState();
  // - - - - - - - - - - - - - - 
  const canPause = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("PAUSE") && !state.can("UNPAUSE")
  );
  // - - - - - - - - - - - - - - 
  const canUnPause = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("UNPAUSE")
  );
  // - - - - - - - - - - - - - - 
  const canExtend = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("EXTEND_TOGGLE")
  );
  // - - - - - - - - - - - - - - 
  const canStart = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("START")
  );
  // - - - - - - - - - - - - - - 
  const canStop = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("STOP")
  );
  // - - - - - - - - - - - - - - 
  const isExtending = useSelector(
    breathStateServices.breathStateService,
    (state) => state.context.extend
  );

  return { canPause, canUnPause, canExtend, canStart, canStop, isExtending };
};

//------------------------------------
// update sessionSettings function used in useBreathEvents
//------------------------------------
const updateSessionSettings = (send) => (sessionSettings: SessionSettingsType, clearSessionStats: boolean = true) => {
  if (clearSessionStats) {
    send({ type: "UPDATE_DEFAULTS", sessionSettings: { ...sessionSettings, sessionStats: undefined, sessionComplete: false } })
  } else {
    send({ type: "UPDATE_DEFAULTS", sessionSettings })
  }
}
//------------------------------------
// Hook the encapulates events for easy use.
//------------------------------------
export const useBreathEvents = () => {
  const breathStateServices = useBreathState();
  const send = breathStateServices.breathStateService.send;
  const breathEvents = {
    startSession: () => send("START"),
    stopSession: () => send("STOP"),
    pauseSession: () => send("PAUSE"),
    unpauseSession: () => send("UNPAUSE"),
    goToNext: () => send("NEXT"),
    extendSession: () => send("EXTEND_TOGGLE"),
    updateSessionSettings: updateSessionSettings(send), //(sessionSettings: SessionSettingsType) => send({ type: "UPDATE_DEFAULTS", sessionSettings }),
  };
  return breathEvents;
};
