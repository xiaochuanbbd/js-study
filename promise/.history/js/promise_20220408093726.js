/*
理解promise： 
promise三种状态： pending  resolved rejected
改变三个状态： resolve() reject() 
⚠️： promise一旦状态确定是不可逆的
promise原型上有两个方法：then，catch 
then接受两个参数， 一个是成功的回调，一个是失败的回调
catch只接受一个回调，即失败的回调
then方法是返回一个新的promise ，里面执行的方法是异步的
触发then方法的时候，三种可能： resolved rejected pending
promise里面的代码是同步代码，then catch是微任务 


*/



const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'
const PENDING = 'PENDING'
class myPromise{
    //接受一个函数作为接收器，并且立即执行该函数
    constructor(executor){
        this.status = PENDING
        this.value = undefined
        this.reason = undefined
        let resolve = (value)=>{
            if(this.status ===PENDING){
                this.value = value
                this.status = RESOLVED  
            }
         
        }
        let reject = (reason)=>{
            if(this.status ===PENDING){

            this.reason =reason
            this.status = REJECTED
            }
        }
    executor(resolve,reject)

    }
}
let p = new Promise((resolve,reject)=>{
    resolve('1')  
})
let p1 = new myPromise((resolve,reject)=>{
    resolve(222)
}) 
console.log(p);
console.log(p1);