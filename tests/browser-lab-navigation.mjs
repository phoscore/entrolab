// Use the same exposed controls on desktop and in the compact disclosure.
export async function chooseLab(page,id,key){
 const tab=page.locator('[data-tab="'+id+'"]');
 if(!await tab.isVisible())await page.locator('#labMenu').click();
 if(key==='tap')await tab.tap();
 else if(key)await tab.press(key);
 else await tab.click();
}
