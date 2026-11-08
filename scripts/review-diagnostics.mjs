import {evaluate} from '../tests/kepler-reference.mjs';
import {crossing} from '../tests/collision-review.mjs';
const kepler=[];for(const e of [0,.5,.8])for(const mode of ['adaptive','fixed'])kepler.push(evaluate(e,e===0?3652.5:365.25,mode));
console.log(JSON.stringify({kepler,collisions:[crossing({mode:'large'}),crossing({mode:'adaptive'}),crossing({mode:'fixed',h:.0001}),crossing({mode:'fixed',h:.00005}),crossing({mode:'adaptive',offset:.0003})]},null,2));
