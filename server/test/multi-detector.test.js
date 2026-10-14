import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDetectorRunner, detectorModels } from '../roboflow.js'
import { combineDiagnosis } from '../combine.js'
import { validateDiagnosis } from '../gemini.js'
import { message } from '../messages.js'
const fixture='not-a-credential'
const input={imageBytes:Buffer.from('test'),mimeType:'image/png',language:'bisaya'}
const base={crop:'banana',problemNameEnglish:'Leaf Spot Disease',problemNameLocal:'Posibleng sakit sa dahon',confidence:'Low',severity:'Unknown',actionSteps:['Bantayi','Limpyoha','Pangayo og tabang'],whenToCallExpert:'Duol sa opisina sa agrikultura.',notAPlant:false}
const peer=(model,label,confidence=.8)=>({source:'roboflow',model,crop:'banana',label,confidence})

test('crop-only model selection, classifier shapes, foreign-crop and junk filtering', async()=>{
 const urls=[]
 const runner=createDetectorRunner({apiKey:fixture,fetchImpl:async(url,options)=>{
  urls.push(url);assert.ok(!url.includes(fixture));assert.equal(options.headers.Authorization,`Bearer ${fixture}`)
  return {ok:true,json:async()=>url.includes('kilimo')?{predictions:{'rice___healthy':{confidence:.99},'banana___cordana':{confidence:.8}}}:{predictions:[{class:'hai - v1 junk',confidence:.99},{class:'sigatoka',confidence:.7}]}}
 }})
 const banana=await runner(input,'banana');assert.equal(banana.length,2);assert.ok(urls.every(url=>!url.includes('cacao-project')))
 urls.length=0
 await runner(input,'unknown');assert.equal(urls.length,0)
 await runner(input,'cacao');assert.equal(urls.length,1);assert.ok(urls[0].includes('cacao-project'))
})
test('all optional peers stop by the remaining budget and cannot fail the main path', async()=>{
 const signals=[]
 const runner=createDetectorRunner({apiKey:fixture,fetchImpl:async(_url,options)=>{signals.push(options.signal);return new Promise(()=>{})}})
 const started=performance.now();assert.deepEqual(await runner(input,'banana',80),[])
 assert.ok(performance.now()-started<300);assert.ok(signals.every(signal=>signal.aborted))
 const missing=createDetectorRunner({apiKey:'',fetchImpl:async()=>{throw new Error('must not call')}})
 assert.deepEqual(await missing(input,'banana'),[])
})
test('low/generic primary comes from detector without inflating confidence',()=>{
 const fused=combineDiagnosis(base,[peer(detectorModels[0].model,'cordana')],'bisaya')
 validateDiagnosis(fused);assert.equal(fused.problemNameEnglish,'Cordana');assert.equal(fused.confidence,'Low')
 assert.equal(fused.primarySource,'roboflow');assert.equal(fused.knowledgeMatch.id,'banana-cordana')
 assert.ok(fused.problemNameLocal.startsWith('Posibleng'));assert.match(fused.note,/Roboflow/);assert.equal(fused.agreement,null)
})
test('agreement does not count promoted primary as an independent Gemini vote',()=>{
 const a=peer(detectorModels[0].model,'sigatoka'),b=peer(detectorModels[1].model,'banana___sigatoka')
 assert.equal(combineDiagnosis(base,[a],'filipino').agreement,null)
 assert.equal(combineDiagnosis(base,[a,b],'filipino').agreement,'agree')
 const differs=combineDiagnosis({...base,problemNameEnglish:'Possible Cordana'},[a],'filipino')
 assert.equal(differs.agreement,'differ');assert.match(differs.note,/Magkaiba/)
 const strong=combineDiagnosis({...base,confidence:'High',problemNameEnglish:'Possible Cordana'},[a],'filipino')
 assert.equal(strong.problemNameEnglish,'Possible Cordana');assert.equal(strong.primarySource,'gemini')
})
test('canonical classification labels, cacao labels and optional response validation',()=>{
 const cacao={...base,crop:'cacao',problemNameEnglish:'Black pod rot'}
 const opinion={source:'roboflow',model:detectorModels[2].model,crop:'cacao',label:'MIRID',confidence:.8}
 const result=combineDiagnosis(cacao,[opinion],'bisaya');validateDiagnosis(result)
 assert.equal(result.knowledgeMatch.id,'cacao-mirid');assert.equal(result.agreement,'differ')
 assert.throws(()=>validateDiagnosis({...base,agreement:'sure'}))
 assert.throws(()=>validateDiagnosis({...base,secondOpinions:[{...opinion,crop:'banana'}]}))
 assert.throws(()=>validateDiagnosis({...base,visibleEvidence:['']}))
 assert.deepEqual(validateDiagnosis(base),base)
})
test('all server message codes localize and never expose provider details',()=>{
 for(const code of ['object','image','base64','size','mime','language','json','failed','missingKey','missingModel','timeout','low','differ','detector']){
  assert.equal(typeof message(code,'bisaya'),'string');assert.equal(typeof message(code,'filipino'),'string')
  assert.ok(!/not configured|Diagnosis failed|timed out|not sure/i.test(message(code,'bisaya')))
 }
})


test('optional crop gate is bounded, validates crop, and skips missing key', async()=>{
 const {createCropGate}=await import('../crop-gate.js')
 let calls=0
 const client={models:{generateContent:async()=>{calls++;return {text:'{"crop":"banana"}'}}}}
 assert.equal(await createCropGate({enabled:false,model:'test',client})(input),'unknown');assert.equal(calls,0)
 assert.equal(await createCropGate({enabled:true,model:'test',client})(input),'banana')
 const stalled=createCropGate({enabled:true,model:'test',timeoutMs:30,client:{models:{generateContent:async()=>new Promise(()=>{})}}})
 const start=performance.now();assert.equal(await stalled(input),'unknown');assert.ok(performance.now()-start<200)
 const invalid=createCropGate({enabled:true,model:'test',client:{models:{generateContent:async()=>({text:'{"crop":"rice"}'})}}})
 assert.equal(await invalid(input),'unknown')
})
