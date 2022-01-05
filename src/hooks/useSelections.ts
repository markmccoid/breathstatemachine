import { useBreathState, objCompare, SessionSettingsType } from "../context/breathMachineContext";
import { useSelector } from "@xstate/react";
import { Sender } from "xstate";
import { BreathContext, BreathEvent } from "../machines/breathMachine2022";

type BreathContextWOElapsed = Omit<BreathContext, "elapsed">;
const getData = (state) => {
  const context = { ...state.context };
  delete context.elapsed;
  const newData: { context: BreathContextWOElapsed; value: String | Object } = {
    context,
    value: state.value,
  };
  return newData;
};

//------------------------------------
//
//------------------------------------
export const useSelections = (): [
  { context: BreathContextWOElapsed; value: String | Object },
  Sender<BreathEvent>
] => {
  const breathStateServices = useBreathState();
  const send = breathStateServices.breathStateService.send;
  const breathData = useSelector(
    breathStateServices.breathStateService,
    getData,
    objCompare
  );
  // console.log("BREATH DATA", breathData);
  // return [breathData, send];
  return [breathData, send];
};

//------------------------------------
//
//------------------------------------
export const useBreathFlags = () => {
  const breathStateServices = useBreathState();
  const canPause = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("PAUSE") && !state.can("UNPAUSE")
  );
  const canUnPause = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("UNPAUSE")
  );
  const canExtend = useSelector(
    breathStateServices.breathStateService,
    (state) => state.can("EXTEND_TOGGLE")
  );
  const isExtending = useSelector(
    breathStateServices.breathStateService,
    (state) => state.context.extend
  );

  return { canPause, canUnPause, canExtend, isExtending };
};

//------------------------------------
//
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
    updateDefaults: (sessionSettings: SessionSettingsType) => send({ type: "UPDATE_DEFAULTS", sessionSettings }),
  };
  return breathEvents;
};
