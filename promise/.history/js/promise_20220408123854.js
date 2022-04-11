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

const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';
const PENDING = 'PENDING';

class myPromise {
	constructor(executor) {
		this.status = PENDING;
		this.value = undefined;
		this.reason = undefined;
		// 要点 9: 分别创建一个`队列用来存放成功和失败回调事件
		this.onfulfilledCallbacks = [];
		this.onrejectedCallbacks = [];
		let resolve = (value) => {
			if (this.status === PENDING) {
				this.value = value;
				this.status = RESOLVED;
				this.onfulfilledCallbacks.forEach((fn) => fn()); // 要点 11: 状态变为成功时遍历队列依次执行
			}
		};
		let reject = (reason) => {
			if (this.status === PENDING) {
				this.reason = reason;
				this.status = REJECTED;
				this.onrejectedCallbacks.forEach((fn) => fn()); // 要点 11: 状态变为失败时遍历队列依次执行
			}
		};

		try {
			executor(resolve, reject);
		} catch (e) {
			reject(e);
		}
	}
	then(onfulfilled, onrejected) {
		if (this.status === RESOLVED) {
			onfulfilled(this.value);
		}
		if (this.status === REJECTED) {
			onrejected(this.reason);
		}
		// console.log(this.status)   // PENDING
		// 要点 8: 定时器执行resolve时,状态仍然是pending
		// if (this.status === PENDING) {
			// 要点 10: 一个 promise 实例可以被 then 多次，存放 成功回调事件
			this.onfulfilledCallbacks.push(() => {
				onfulfilled(this.value);
			});
			// 要点 10: 一个 promise 实例可以被 then 多次，存放 失败回调事件
			this.onrejectedCallbacks.push(() => {
				onrejected(this.reason);
			});
		// }
	}
}
// new Promise((resolve, reject) => {
// 	resolve('Promise');
// })
// 	.then(
// 		(value) => {
// 			return value;
// 		},
// 		(err) => {
// 			return err;
// 		}
// 	)
// 	.then(
// 		((value) => {
// 			console.log(value);
// 		},
// 		(err) => {
// 			console.log(err);
// 		})
// 	);

let p = new myPromise((resolve, reject) => {
	resolve('myPromise');
});


p.then((data) => {

    // return data 
    // throw new Error()     // 用例2. 报错或异常: 抛出异常，会直接走下一次then的失败
    return new Error()    // 用例3. 返回的是普通值: error对象，需要特别注意
    // return new Promise((s,j)=>s(1))    // 用例4. 返回的是promise: 会传递当前promise的已成功结果
    // return new Promise((s,j)=>j(1))    // 用例5. 返回的是promise: 会传递当前promise的已失败结果
  })
  p.then((data) => {
    console.log(data,2)      // 执行结果：用例1, 用例3, 用例4 
  }, (err) => {
    console.log(err,3)       // 执行结果：用例2, 用例5
  
})
