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
	//接受一个函数作为接收器，并且立即执行该函数 executor
	constructor(executor) {
		this.status = PENDING;
		this.value = undefined;
		this.reason = undefined;
		let resolve = (value) => {
			if (this.status === PENDING) {
				//当状态为pending的时候才会去修改值
				this.value = value;
				this.status = RESOLVED;
			}
		};
		let reject = (reason) => {
			if (this.status === PENDING) {
				this.reason = reason;
				this.status = REJECTED;
			}
		};
		try {
			executor(resolve, reject); //立即执行函数
		} catch (error) {
			reject(error);
		}
	}
	then(onFulfilled, onRejected) {
		setTimeout(() => {
			if (this.status == RESOLVED) {
				onFulfilled(this.value);
			}
			if (this.status == REJECTED) {
				onRejected(this.reason);
			}
		});
	}
}
new Promise((resolve, reject) => {
	reject('1');
}).then(
	(value) => {
		console.log(value);
	},
	(err) => {
		console.log(err);
	}
);
new myPromise((resolve, reject) => {
	reject(222);
}).then(
	(value) => {
		console.log(value);
	},
	(err) => {
		console.log(err);
	}
);
// console.log(p);
// console.log(p1);
