var b=Object.defineProperty;var S=(o,t,e)=>t in o?b(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var d=(o,t,e)=>(S(o,typeof t!="symbol"?t+"":t,e),e),I=(o,t,e)=>{if(!t.has(o))throw TypeError("Cannot "+e)};var r=(o,t,e)=>(I(o,t,"read from private field"),e?e.call(o):t.get(o)),h=(o,t,e)=>{if(t.has(o))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(o):t.set(o,e)},p=(o,t,e,a)=>(I(o,t,"write to private field"),a?a.call(o,e):t.set(o,e),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function e(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(s){if(s.ep)return;s.ep=!0;const n=e(s);fetch(s.href,n)}})();var T,y,g;class w{constructor({id:t=null,text:e,position:a,onEditTask:s,onDeleteTask:n}){h(this,T,null);h(this,y,"");h(this,g,-1);p(this,T,t||crypto.randomUUID()),p(this,y,e),p(this,g,a),this.onEditTask=s,this.onDeleteTask=n}get taskID(){return r(this,T)}get taskText(){return r(this,y)}set taskText(t){typeof t=="string"&&p(this,y,t)}get taskPosition(){return r(this,g)}set taskPosition(t){typeof t=="number"&&t>=0&&p(this,g,t)}render(){const t=document.createElement("li");t.classList.add("tasklist__tasks-list-item","task"),t.setAttribute("id",r(this,T)),t.setAttribute("draggable",!0),t.addEventListener("dragstart",m=>{m.target.classList.add("task_selected"),localStorage.setItem("movedTaskID",r(this,T))}),t.addEventListener("dragend",m=>m.target.classList.remove("task_selected"));const e=document.createElement("span");e.classList.add("task__text"),e.innerHTML=r(this,y),t.appendChild(e);const a=document.createElement("div");a.classList.add("task__controls");const s=document.createElement("div");s.classList.add("task__controls-row");const n=document.createElement("button");n.setAttribute("type","button"),n.classList.add("task__contol-btn","edit-icon"),n.addEventListener("click",()=>this.onEditTask({taskID:r(this,T)})),s.appendChild(n);const i=document.createElement("button");return i.setAttribute("type","button"),i.classList.add("task__contol-btn","delete-icon"),i.addEventListener("click",()=>this.onDeleteTask({taskID:r(this,T)})),s.appendChild(i),a.appendChild(s),t.appendChild(a),t}}T=new WeakMap,y=new WeakMap,g=new WeakMap;const v="http://localhost:4321";class l{static async fetchData(t,e,a={},s=""){try{const n=await fetch(`${v}/${t}`,{method:e,body:e!=="GET"?JSON.stringify(a):void 0,headers:{"Content-Type":"application/json"}});let i=null;return e==="GET"&&(i=await n.json()),n.status!==200?Promise.reject(i):i?i.tasklists:{timestamp:new Date().toISOString(),message:s}}catch(n){return Promise.reject({timestamp:new Date().toISOString(),statusCode:0,message:n})}}static async getTasklists(){return l.fetchData("tasklists","GET")}static async addTasklists({id:t=null,name:e="",position:a=-1}){return l.fetchData("tasklists","POST",{id:t,name:e,position:a},"Success addTasklists")}static async addTasks({id:t=null,text:e="",position:a=-1,tasklistId:s=null}){return l.fetchData("tasks","POST",{id:t,text:e,position:a,tasklistId:s},"Success addTasks")}static async editTasks({id:t=null,text:e="",position:a=-1}){return l.fetchData(`tasks/${t}`,"PATCH",{text:e,position:a},"Success editTasks")}static async editMultipleTasks({reorderedTasks:t=[]}){return l.fetchData("tasks","PATCH",{reorderedTasks:t},"Success editMultipleTasks")}static async deleteTasks({id:t=null}){return l.fetchData(`tasks/${t}`,"DELETE",{},"Success deleteTasks")}static async moveTasks({id:t=null,srcTasklistId:e=null,destTasklistId:a=null}){return l.fetchData("tasklists","PATCH",{id:t,srcTasklistId:e,destTasklistId:a},"Success moveTasks")}}var c,E,u,D;class _{constructor({id:t=null,name:e,position:a,onDropTaskInTasklist:s,onEditTask:n,onDeleteTask:i}){h(this,c,[]);h(this,E,"");h(this,u,null);h(this,D,-1);d(this,"addTask",({task:t})=>r(this,c).push(t));d(this,"getTaskById",({taskID:t})=>r(this,c).find(e=>e.taskID===t));d(this,"deleteTask",({taskID:t})=>{const e=r(this,c).findIndex(s=>s.taskID===t);if(e===-1)return;const[a]=r(this,c).splice(e,1);return a});d(this,"reorderTasks",async()=>{const t=Array.from(document.querySelector(`[id="${r(this,u)}"] .tasklist__tasks-list`).children,a=>a.getAttribute("id"));let e=[];if(t.forEach((a,s)=>{const n=r(this,c).find(i=>i.taskID===a);n.taskPosition!==s&&(e.push({id:a,position:s}),n.taskPosition=s)}),e.length>=1)try{await l.editMultipleTasks({reorderedTasks:e})}catch(a){console.error(a)}});d(this,"onAddNewTask",async()=>{const t=prompt("Введите описание задачи:","Новая задача");if(t)try{const e=crypto.randomUUID(),a=await l.addTasks({id:e,text:t,position:r(this,c).length,tasklistId:r(this,u)});this.onAddNewTaskLocal({id:e,text:t,position:r(this,c).length}),console.log(a)}catch(e){console.error(e)}});d(this,"onAddNewTaskLocal",({id:t=null,text:e="",position:a=-1})=>{const s=new w({id:t,text:e,position:a,onEditTask:this.onEditTask,onDeleteTask:this.onDeleteTask});r(this,c).push(s);const n=s.render();document.querySelector(`[id="${r(this,u)}"] .tasklist__tasks-list`).appendChild(n)});p(this,u,t||crypto.randomUUID()),p(this,E,e),this.position=a,this.onDropTaskInTasklist=s,this.onEditTask=n,this.onDeleteTask=i}get tasklistID(){return r(this,u)}render(){const t=document.createElement("li");t.classList.add("tasklists-list__item","tasklist"),t.setAttribute("id",r(this,u)),t.addEventListener("dragstart",()=>localStorage.setItem("srcTasklistID",r(this,u))),t.addEventListener("drop",this.onDropTaskInTasklist);const e=document.createElement("h2");e.classList.add("tasklist__name"),e.innerHTML=r(this,E),t.appendChild(e);const a=document.createElement("ul");a.classList.add("tasklist__tasks-list"),t.appendChild(a);const s=document.createElement("button");s.setAttribute("type","button"),s.classList.add("tasklist__add-task-btn"),s.innerHTML="&#10010; Добавить карточку",s.addEventListener("click",this.onAddNewTask),t.appendChild(s);const n=document.querySelector(".tasklist-adder");n.parentElement.insertBefore(t,n)}}c=new WeakMap,E=new WeakMap,u=new WeakMap,D=new WeakMap;var k;class x{constructor(){h(this,k,[]);d(this,"onEscapeKeydown",t=>{if(t.key==="Escape"){const e=document.querySelector(".tasklist-adder__input");e.style.display="none",e.value="",document.querySelector(".tasklist-adder__btn").style.display="inherit"}});d(this,"onInputKeydown",async t=>{if(t.key==="Enter"){if(t.target.value){const e=crypto.randomUUID();try{const a=await l.addTasklists({id:e,name:t.target.value,position:r(this,k).length});console.log("add to model");const s=new _({id:e,name:t.target.value,position:r(this,k).length,onDropTaskInTasklist:this.onDropTaskInTasklist,onEditTask:this.onEditTask,onDeleteTask:this.onDeleteTask});console.log("created local"),r(this,k).push(s),s.render(),console.log(a)}catch(a){console.error(a)}}t.target.style.display="none",t.target.value="",document.querySelector(".tasklist-adder__btn").style.display="inherit"}});d(this,"onDropTaskInTasklist",async t=>{t.stopPropagation();const e=t.currentTarget;e.classList.remove("tasklist_droppable");const a=localStorage.getItem("movedTaskID"),s=localStorage.getItem("srcTasklistID"),n=e.getAttribute("id");if(localStorage.setItem("movedTaskID",""),localStorage.setItem("srcTasklistID",""),!e.querySelector(`[id="${a}"]`))return;const i=r(this,k).find(f=>f.tasklistID===s),m=r(this,k).find(f=>f.tasklistID===n);try{if(s!==n){const f=await l.moveTasks({id:a,srcTasklistId:s,destTasklistId:n}),L=i.deleteTask({taskID:a});m.addTask({task:L}),i.reorderTasks()}m.reorderTasks()}catch(f){console.error(f)}});d(this,"onEditTask",async({taskID:t})=>{let e=null;for(let n of r(this,k))if(e=n.getTaskById({taskID:t}),e)break;const a=e.taskText,s=prompt("Введите новое описание задачи");if(!(!s||s===a))try{const n=await l.editTasks({id:t,text:s});e.taskText=s,document.querySelector(`[id="${t}"] span.task__text`).innerHTML=s,console.log(n)}catch(n){console.error(n)}});d(this,"onDeleteTask",async({taskID:t})=>{let e=null,a=null;for(let s of r(this,k))if(a=s,e=s.getTaskById({taskID:t}),e)break;try{const s=await l.deleteTasks({id:t});a.deleteTask({taskID:t}),document.getElementById(t).remove(),console.log(s)}catch(s){console.log(s)}})}async init(){document.querySelector(".tasklist-adder__btn").addEventListener("click",t=>{t.target.style.display="none";const e=document.querySelector(".tasklist-adder__input");e.style.display="inherit",e.focus()}),document.addEventListener("keydown",this.onEscapeKeydown),document.querySelector(".tasklist-adder__input").addEventListener("keydown",this.onInputKeydown),document.getElementById("theme-switch").addEventListener("change",t=>{t.target.checked?document.body.classList.add("dark-theme"):document.body.classList.remove("dark-theme")}),document.addEventListener("dragover",t=>{t.preventDefault();const e=document.querySelector(".task.task_selected"),a=e.closest(".tasklist"),s=t.target,n=document.querySelector(".tasklist_droppable");let i=t.target;for(;!i.matches(".tasklist")&&i!==document.body;)i=i.parentElement;if(i!==n&&(n&&n.classList.remove("tasklist_droppable"),i.matches(".tasklist")&&i.classList.add("tasklist_droppable")),!(!i.matches(".tasklist")||e===s)){if(i===a){if(!s.matches(".task"))return;const m=s===e.nextElementSibling?s.nextElementSibling:s;i.querySelector(".tasklist__tasks-list").insertBefore(e,m);return}if(s.matches(".task")){i.querySelector(".tasklist__tasks-list").insertBefore(e,s);return}i.querySelector(".tasklist__tasks-list").children.length||i.querySelector(".tasklist__tasks-list").appendChild(e)}});try{const t=await l.getTasklists();for(const e of t){const a=new _({id:e.id,name:e.name,position:e.position,onDropTaskInTasklist:this.onDropTaskInTasklist,onEditTask:this.onEditTask,onDeleteTask:this.onDeleteTask});r(this,k).push(a),a.render();for(const s of e.tasks)a.onAddNewTaskLocal({id:s.id,text:s.text,position:s.position})}}catch(t){console.error(t)}}}k=new WeakMap;document.addEventListener("DOMContentLoaded",()=>{console.log("OK"),new x().init()});