import {checks} from './checks.mjs';
// A separate module realm owns the physics ID allocator used by these self-checks.
self.onmessage=()=>{try{self.postMessage({results:checks()})}catch{self.postMessage({error:true})}};
