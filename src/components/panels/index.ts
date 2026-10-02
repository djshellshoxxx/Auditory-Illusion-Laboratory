import type {ExperimentPanels} from './types';
import {phantomWordsPanels} from './phantomWords';
import {zwickerPanels} from './zwicker';
import {missingFundamentalPanels} from './missingFundamental';
import {combinationTonesPanels} from './combinationTones';
import {precedencePanels} from './precedence';
import {glissandoPanels} from './glissando';
import {speechToSongPanels} from './speechToSong';
/** Registry: experiment id → its Lab controls, analysis and response panels. */
export const experimentPanels:Record<string,ExperimentPanels>={
  'phantom-words':phantomWordsPanels,
  zwicker:zwickerPanels,
  'missing-fundamental':missingFundamentalPanels,
  'combination-tones':combinationTonesPanels,
  precedence:precedencePanels,
  glissando:glissandoPanels,
  'speech-to-song':speechToSongPanels
};
