import {test} from 'node:test';
import assert from 'node:assert/strict';
import {browserHarness} from './v08-browser-harness.mjs';
import {chooseLab} from './browser-lab-navigation.mjs';

const labs=['gravity','blackhole','extreme','temperature','entropy','matter','explorer','science'];

test('all lab headers share typography, geometry and accessible theme colours in DE and EN',{timeout:120000},async()=>{
 const harness=await browserHarness();
 try{
  for(const width of [320,390,768,1440]){
   const {p,context}=await harness.lab({viewport:{width,height:1000},hasTouch:width<=390});
   try{
    for(const lang of ['de','en']){
     await p.locator('[data-language='+lang+']').click();
     const accents=new Set();
     let reference;
     for(const id of labs){
      await chooseLab(p,id);
      if(id==='explorer')await p.waitForFunction(()=>document.querySelector('link[data-explorer-style]')?.sheet);
      const header=p.locator('#'+id+' .lab-header');
      const styles=await header.evaluate(el=>{
       const pick=s=>el.querySelector(s);
       const title=pick('.lab-title'),line=pick('.lab-tagline'),symbol=pick('.lab-symbol');
       const question=pick('.page-heading details > summary');
       const description=pick('.page-heading > div > p:last-child');
       const help=pick('a.lab-help, .lab-inline-help > summary');
       const id=el.closest('.view').id;
       const tab=document.querySelector('[data-tab="'+id+'"]'),menu=document.getElementById('labMenu');
       const elements=[title,line,question,description,help];
       const rect=node=>node.getBoundingClientRect();
       const type=node=>{
        const css=getComputedStyle(node);
        return [css.fontSize,css.fontWeight,css.lineHeight,css.paddingInlineStart,css.paddingBlockStart];
       };
       const outer=rect(el);
       const boxes=elements.map(node=>rect(node).toJSON());
       const helpCss=getComputedStyle(help);
       const css=getComputedStyle(el);
       const colour=node=>getComputedStyle(node).color;
       const surface=css.backgroundColor;
       const canvas=document.createElement('canvas');
       canvas.width=canvas.height=1;
       const paint=canvas.getContext('2d',{willReadFrequently:true});
       const luminosity=value=>{
        paint.clearRect(0,0,1,1);
        paint.fillStyle=value;
        paint.fillRect(0,0,1,1);
        const rgb=[...paint.getImageData(0,0,1,1).data].slice(0,3).map(value=>{
         const normalized=value/255;
         return normalized<=.04045?normalized/12.92:((normalized+.055)/1.055)**2.4;
        });
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
       };
       const contrast=(a,b)=>{
        const first=luminosity(a),second=luminosity(b);
        return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
       };
       const tabCss=getComputedStyle(tab);
       const questionCss=getComputedStyle(question);
       const menuCss=getComputedStyle(menu);
       return {
        top:Math.round(outer.top+scrollY),type:elements.map(type),inset:boxes.map(box=>box.left-outer.left),
        positions:boxes.map(({top,bottom,right})=>({top,bottom,right})),
        icon:[rect(symbol).width,rect(symbol).height],
        clip:outer.right,scrollWidth:document.documentElement.scrollWidth,
        helpLabel:help.textContent.trim(),helpHeight:rect(help).height,
        questionHeight:rect(question).height,accent:colour(line),tab:tabCss.color,
        menu:menuCss.display==='none'?null:menuCss.color,
        textContrast:[
         contrast(colour(title),surface),contrast(colour(line),surface),contrast(colour(description),surface),
         contrast(colour(question),questionCss.backgroundColor),contrast(colour(help),helpCss.backgroundColor),
         contrast(tabCss.color,tabCss.backgroundColor),
         ...(menuCss.display==='none'?[]:[contrast(menuCss.color,menuCss.backgroundColor)]),
        ],
        borderContrast:[contrast(questionCss.borderTopColor,surface),contrast(helpCss.borderTopColor,surface)],
       };
      });
      const where=`${width}px ${lang} ${id}`;
      const appearance={top:styles.top,type:styles.type,inset:styles.inset,icon:styles.icon};
      reference??=appearance;
      assert.deepEqual(appearance,reference,where);
      assert(styles.positions.every((box,index,boxes)=>box.right<=styles.clip&&(!index||box.top>=boxes[index-1].bottom)),where);
      assert(styles.scrollWidth<=width+1,where);
      assert(styles.helpHeight>=44&&styles.questionHeight>=44,where);
      assert.equal(styles.helpLabel,lang==='de'?'Was bedeutet das?':'What does this mean?',where);
      assert.equal(styles.tab,styles.accent,where);
      if(styles.menu!==null)assert.equal(styles.menu,styles.accent,where);
      assert(Math.min(...styles.textContrast)>=4.5,`${where} text contrast: ${styles.textContrast}`);
      assert(Math.min(...styles.borderContrast)>=3,`${where} border contrast: ${styles.borderContrast}`);
      accents.add(styles.accent);
     }
     assert.equal(accents.size,labs.length);
    }
   }finally{await context.close();}
  }
  assert.deepEqual(harness.errors,[]);
 }finally{await harness.close();}
});
