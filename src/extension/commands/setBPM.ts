import type { ComEventDataMeta } from '../../utils/com';
import store from '../store';

export default function setBPM() {
  return (newBPM: number, meta: ComEventDataMeta) => {
    // console.info('[ext] set BPM', newBPM);
    store.dispatch({ type: 'setBPM', payload: newBPM, meta });
  };
}
