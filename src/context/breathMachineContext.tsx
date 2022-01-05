import React, { createContext } from 'react';
import { useInterpret } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { breathMachine, BreathContext } from '../machines/breathMachine2022';

import { isEqual } from 'lodash';

interface BreathMachineContextType {
  breathStateService: ActorRefFrom<typeof breathMachine>;
}

// Object compare for xstate's useSelectors compare function.
export const objCompare = (prevObj, nextObj) => isEqual(prevObj, nextObj);

export const BreathMachineContext = createContext(
  {} as BreathMachineContextType
);

//************************
//*- BreathMachineProvider
//************************
export type SessionSettingsType = Partial<
  Omit<
    BreathContext,
    'extend' | 'sessionStats' | 'sessionComplete' | 'interval' | 'elapsed'
  >
>;
// -- passed sessionSettings prop will allow for individual session settings
// -- to be applied when the machine provider is used and the machine is instantiated.
export const BreathMachineProvider = ({
  children,
  sessionSettings,
}: {
  children: any;
  sessionSettings: SessionSettingsType | undefined;
}) => {
  const breathStateService = useInterpret(breathMachine, {
    context: { ...sessionSettings },
    devTools: true,
  });
  React.useEffect(() => {
    console.log('In Provider UseEffect');

    return () => {
      console.log('cleaing up breath context');
    };
  }, [sessionSettings]);
  // console.log("STATE SERVICE", breathStateService, breathMachine);
  return (
    <BreathMachineContext.Provider value={{ breathStateService }}>
      {children}
    </BreathMachineContext.Provider>
  );
};

export const useBreathState = (): BreathMachineContextType => {
  return React.useContext(BreathMachineContext);
};

//----
// Selectors
export const canExtendTimeSelector = (state) => state.can('EXTEND_TOGGLE');
