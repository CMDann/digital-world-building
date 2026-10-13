// Locate literal colors without mistaking comments or longer numeric IDs for colors.
export function findCodeColors(source){
 const colors=[];
 const tokens=/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b0[xX][\da-fA-F]+\b/g;
 for(const match of source.matchAll(tokens)){
  const token=match[0];let value,start=match.index;
  if(/^0[xX][\da-fA-F]{6}$/.test(token))value=token;
  else if(/^["'`]#[\da-fA-F]+["'`]$/.test(token)){value=token.slice(1,-1);start++;if(![4,5,7,9].includes(value.length))continue;}
  else continue;
  let rgb=value.startsWith('#')?value.slice(1):value.slice(2);
  if(rgb.length===3||rgb.length===4)rgb=rgb.slice(0,3).split('').map(c=>c+c).join('');else rgb=rgb.slice(0,6);
  const before=source.slice(0,start),line=before.split('\n').length,column=start-before.lastIndexOf('\n');
  colors.push({start,end:start+value.length,value,color:'#'+rgb.toLowerCase(),line,column});
 }
 return colors;
}
export function colorReplacement(token,hex){
 const rgb=hex.slice(1).toLowerCase();
 if(token.startsWith('#')){const alpha=token.length===5?token[4].repeat(2):token.length===9?token.slice(7):'';return '#'+rgb+alpha;}
 return token.slice(0,2)+rgb;
}
export function attachColorPickers(editor,host){
 function refresh(){host.replaceChildren();if(editor.disabled)return;const snapshot=editor.value,colors=findCodeColors(snapshot);if(!colors.length){const note=document.createElement('span');note.className='color-empty';note.textContent='Hex colors in your code will appear here.';host.append(note);return;}
 for(const color of colors){const chip=document.createElement('label');chip.className='code-color-chip';const picker=document.createElement('input');picker.type='color';picker.value=color.color;picker.dataset.start=color.start;picker.setAttribute('aria-label',`Change ${color.value} on line ${color.line}, column ${color.column}`);picker.title=`Choose a color for ${color.value} · line ${color.line}`;const value=document.createElement('span');value.textContent=color.value;const location=document.createElement('small');location.textContent='L'+color.line;chip.append(picker,value,location);
 picker.addEventListener('change',()=>{if(editor.value!==snapshot){refresh();return;}const replacement=colorReplacement(color.value,picker.value);const scroll=editor.scrollTop;editor.setRangeText(replacement,color.start,color.end,'select');editor.scrollTop=scroll;editor.dispatchEvent(new Event('input',{bubbles:true}));});host.append(chip);
 }}
 editor.addEventListener('input',refresh);return refresh;
}
