const id='1r_p5-XWGlX9lmj6grB9UDbV37T2slVpA';
const gid='299257227';
for(const href of ['https://docs.google.com/spreadsheets/d/'+id+'/gviz/tq?tqx=out%3Acsv&gid='+gid,'https://docs.google.com/spreadsheets/d/'+id+'/export?format=csv&gid='+gid]){
 try{
  const res=await fetch(href,{signal:AbortSignal.timeout(18000)});
  const txt=await res.text();
  console.log('Excel QA público:',res.status,txt.length,txt.startsWith('<')?'HTML/login':'text/CSV');
  if(res.ok&&!/^\\s*</.test(txt)&&txt.includes('Solicitud de Inscripcion de Proveedores')){
   console.log('Excel accesible para compilación estática');process.exit(0);
  }
 }catch(err){console.error('Excel no accesible:',err.message)}
}
throw new Error('No se puede consultar la planilla en GitHub Actions');
