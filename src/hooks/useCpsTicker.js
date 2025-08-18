import { useEffect } from 'react';

export default function useCpsTicker(state, dispatch, actions, notify) {
    useEffect(() => {
        if (state.cps <= 0) return;
        const id = setInterval(() => {
            dispatch({ type: actions.FEED_PASSIVE, amount: state.cps, notify});
        }, 1000);
        return () => clearInterval(id);
    }, [state.cps]);
}