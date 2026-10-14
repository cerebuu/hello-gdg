import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../app.js'
import { validateDiagnosis, createGeminiDiagnoser } from '../gemini.js'
import { matchKnowledge, diseases } from '../knowledge.js'
import { createRoboflowDetector } from '../roboflow.js'
const result = { crop: 'banana', problemNameEnglish: 'Possible Sigatoka', problemNameLocal: 'Posibleng Sigatoka', confidence: 'Low', severity: 'Unknown', actionSteps: ['Observe', 'Clean tools', 'Ask an expert'], whenToCallExpert: 'Ask the agriculture office', notAPlant: false }
const input = { imageBytes: Buffer.from('image'), mimeType: 'image/png', language: 'bisaya' }
const mockCredential = 'not-a-credential' // Synthetic test fixture, never a real key.

async function withServer(options, run) {
 const server = createApp({ classifyCrop: async () => 'banana', ...options }).listen(0, '127.0.0.1')
 await new Promise(resolve => server.once('listening', resolve))
 try { await run(`http://127.0.0.1:${server.address().port}`) }
 finally { await new Promise(resolve => server.close(resolve)) }
}
async function post(base, language='bisaya') {
 const response=await fetch(`${base}/api/diagnose`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({imageBase64:'dGVzdA==',mimeType:'image/png',language}) })
 assert.equal(response.status,200); return response.json()
}
test('thirteen named entries use only source-backed names and empty symptoms', () => {
 assert.equal(diseases.length,13); assert.ok(diseases.every(entry=>entry.visibleSymptoms.length===0))
 assert.deepEqual(matchKnowledge(result),{id:'banana-sigatoka',name:'Sigatoka'})
 for(const name of ['Not Sigatoka','Sigatoka or Cordana','Unknown','No disease visible'])assert.equal(matchKnowledge({...result,problemNameEnglish:name}),null)
 assert.equal(matchKnowledge({...result,crop:'unknown'}),null)
 assert.equal(matchKnowledge({...result,notAPlant:true}),null)
})
test('old responses pass and invalid optional fields fail validation', () => {
 assert.deepEqual(validateDiagnosis(result),result)
 for(const extra of [{knowledgeMatch:{id:'banana-sigatoka',name:'wrong'}},{secondOpinion:{source:'roboflow',crop:'banana',label:'sigatoka',confidence:.49}},{note:''}])assert.throws(()=>validateDiagnosis({...result,...extra}))
})
test('prompt includes candidates without claiming sourced symptoms or confirmed diagnosis', async () => {
 let request
 const diagnose=createGeminiDiagnoser({model:'test-model',client:{models:{generateContent:async value=>{request=value;return {text:JSON.stringify(result)}}}}})
 await diagnose(input)
 assert.match(request.config.systemInstruction,/Candidate conditions to consider/)
 assert.match(request.config.systemInstruction,/sources do not describe visible symptoms/)
 assert.match(request.config.systemInstruction,/Say possible, never confirmed/)
})
test('missing detector key avoids every network request', async () => {
 let calls=0
 const state=createRoboflowDetector({apiKey:'',fetchImpl:async()=>{calls++}})(input)
 assert.equal(state.result,null);assert.equal(calls,0)
})
test('REST uses header auth; junk and low confidence labels are ignored', async () => {
 let requestUrl,options
 const job=createRoboflowDetector({apiKey:mockCredential,fetchImpl:async(url,opts)=>{
  requestUrl=url;options=opts
  return {ok:true,json:async()=>({predictions:[{class:'hai - v1 junk',confidence:.99},{class:'cordana',confidence:.75},{class:'sigatoka',confidence:.5},{class:'pestalotiopsis',confidence:.49}]})}
 }})(input)
 await job.done
 assert.equal(requestUrl,'https://serverless.roboflow.com/banana-leaf-disease-qesr2-m44h9/1')
 assert.ok(!requestUrl.includes(mockCredential));assert.equal(options.headers.Authorization,`Bearer ${mockCredential}`)
 assert.equal(options.body,input.imageBytes.toString('base64'))
 assert.deepEqual(job.result,{source:'roboflow',crop:'banana',label:'cordana',confidence:.75})
})
test('HTTP failure, invalid JSON, and low confidence safely return null', async () => {
 for(const fetchImpl of [async()=>({ok:false}),async()=>({ok:true,json:async()=>{throw new Error('malformed')}}),async()=>({ok:true,json:async()=>({predictions:[{class:'sigatoka',confidence:.49}]})})]){
  const state=createRoboflowDetector({apiKey:mockCredential,fetchImpl})(input);await state.done;assert.equal(state.result,null)
 }
})
test('hard 3-second timeout includes stalled body parsing and aborts', async () => {
 let signal
 const started=performance.now()
 const state=createRoboflowDetector({apiKey:mockCredential,fetchImpl:async(_url,options)=>{signal=options.signal;return {ok:true,json:async()=>new Promise(()=>{})}}})(input)
 await state.done
 assert.equal(state.result,null);assert.equal(signal.aborted,true)
 assert.ok(performance.now()-started>=2900 && performance.now()-started<3500)
})
test('crop gates detectors after Gemini within a remaining budget', async () => {
 const calls=[]
 await withServer({classifyCrop:async()=>{calls.push('gate');return 'banana'},diagnose:async()=>{calls.push('gemini');return result},detector:async(_input,crop,budget)=>{calls.push(crop);assert.ok(budget<=3000);return []}},async base=>{
  const body=await post(base);assert.equal(body.secondOpinion,null);assert.equal(calls[0],'gate');assert.ok(calls.includes('banana') && calls.includes('gemini'))
 })
})
test('ready disagreement gets localized note; cacao and non-plant suppress detector output', async () => {
 const opinion={source:'roboflow',model:'banana-leaf-disease-qesr2-m44h9/1',crop:'banana',label:'cordana',confidence:.8}
 for(const language of ['bisaya','filipino'])await withServer({diagnose:async()=>result,detector:async()=>[opinion]},async base=>{
  const body=await post(base,language);validateDiagnosis(body);assert.equal(body.secondOpinion.label,'cordana');assert.match(body.note,language==='bisaya'?/Lahi ang mga/:/Magkaiba ang mga/);assert.ok(body.whenToCallExpert.includes(body.note))
 })
 for(const extra of [{crop:'cacao',problemNameEnglish:'Possible black pod rot'},{crop:'unknown',notAPlant:true}])await withServer({diagnose:async()=>({...result,...extra}),detector:async()=>[opinion]},async base=>assert.equal((await post(base)).secondOpinion,null))
})
test('optional detector exceptions and malformed output preserve main result', async () => {
 for(const detector of [()=>{throw new Error('optional failure')},()=>null,()=>({result:{label:'junk'},cancel(){throw new Error('cleanup failure')}})])await withServer({diagnose:async()=>result,detector},async base=>{
  const body=await post(base);assert.equal(body.problemNameEnglish,result.problemNameEnglish);assert.equal(body.secondOpinion,null)
 })
})
