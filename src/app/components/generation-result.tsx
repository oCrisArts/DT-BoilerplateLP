import type {Variable} from '@/data/preset-contract/types';
import {ExportPanel} from './ExportPanel';
import ring from '@/assets/figma/1ddb9.svg?inline';
import './generation-result.css';
export type GenerationSnapshot={tokens:Variable[];presetName:string};
export type GenerationResult={count:number;created:number;updated:number;documentationGenerated:boolean};
export function GenerationResultScreen({snapshot,result,demo=false}:{snapshot:GenerationSnapshot;result:GenerationResult;demo?:boolean}){
 return <section className="generation-result" aria-label="Generation result">
  <div className="result-intro"><div className="result-success" aria-hidden="true"><img src={ring} alt="" width="28" height="28"/>✓</div><h1>Your theme is ready</h1><p>Use the same tokens in Figma and in your codebase.</p></div>
  <div className="result-completion"><h2><span aria-hidden="true">✓</span>Figma Variables</h2><p title={result.created+' created · '+result.updated+' updated'}>{result.count} variables {demo?'ready to generate':'generated'}</p></div>
  <div className="result-completion"><h2><span aria-hidden="true">{result.documentationGenerated?'✓':'–'}</span>Visual Documentation</h2><p>{snapshot.presetName} documentation {demo?'available in Figma':result.documentationGenerated?'created':'not generated'}</p></div>
  <ExportPanel tokens={snapshot.tokens}/>
 </section>;
}
