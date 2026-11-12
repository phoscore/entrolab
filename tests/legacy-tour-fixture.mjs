import {readFileSync} from 'node:fs';
const [button,aside]=readFileSync(new URL('./fixtures/discovery-controls.html',import.meta.url),'utf8').trim().split('\n');

// Mount the retired tour in browser tests only. Public navigation never loads it.
export async function routeLegacyTour(context){
 await context.route(url=>url.pathname==='/'&&url.searchParams.has('legacyTour'),async route=>{
  const response=await route.fetch(),html=await response.text();
  const body=html.replace('<div class="header-tools">','<div class="header-tools">'+button)
   .replace('<main id="mainContent" tabindex="-1">','<main id="mainContent" tabindex="-1">'+aside)
   .replace('</body>','<script type="module" src="discovery.mjs"></script></body>');
  await route.fulfill({response,body});
 });
}
