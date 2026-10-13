import test from 'node:test';
import assert from 'node:assert/strict';
import { findCodeColors, colorReplacement } from '../src/code-colors.js';
test('finds literal colors at exact positions, excluding comments and unrelated literals',()=>{
 const source=`// 0xffffff\nconst a=0xff8800,b=0xff8800;const c='#abc',d="#11223380"; /* '#eee' */ const id=0x12345678;const path='image-#ffffff.png';`;
 const colors=findCodeColors(source);assert.deepEqual(colors.map(c=>c.value),['0xff8800','0xff8800','#abc','#11223380']);assert.equal(colors[2].color,'#aabbcc');assert.ok(colors[0].start!==colors[1].start);for(const c of colors){assert.equal(source.slice(c.start,c.end),c.value);assert.equal(c.line,2);}
});
test('keeps JS number syntax and preserves color alpha when expanding shorthand',()=>{assert.equal(colorReplacement('0XFFFFFF','#123abc'),'0X123abc');assert.equal(colorReplacement('#abcd','#123456'),'#123456dd');assert.equal(colorReplacement('#aabbcc80','#123456'),'#12345680');assert.equal(colorReplacement('#abc','#123456'),'#123456');});
