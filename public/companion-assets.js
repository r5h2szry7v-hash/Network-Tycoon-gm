(()=>{
 'use strict';
 const characters=[
  {
   id:'mack',name:'Mack',src:'/images/dog-dark.webp',role:'Steady observer who spots risks and plans ahead.',
   lines:['That machine came together nicely.','Solid work. You gave every part a purpose.']
  },
  {
   id:'pooch',name:'Pooch',src:'/images/dog-tan.webp',role:'Upbeat guide who celebrates progress and helps players get started.',
   lines:['The marble made it! Let’s see what the next machine asks of us.','Bell rung! I knew those parts would work together.']
  }
 ];
 const moods=['idle','celebrate','think','reassure'];
 window.PortfolioCompanionAssets=Object.freeze({
  schemaVersion:1,
  characters:Object.freeze(characters.map(character=>Object.freeze({...character,lines:Object.freeze([...character.lines])}))),
  moods:Object.freeze(moods)
 });
})();
