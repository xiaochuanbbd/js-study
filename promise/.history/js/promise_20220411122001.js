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
		//判断 then传入的是一个函数还是一个普通值，普通值直接返回一个promise结果
		onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : (value) => value;
		onrejected =
			typeof onrejected === 'function'
				? onrejected
				: (err) => {
						throw err;
					};
		let promise2 = new Promise((resolve, reject) => {
			if (this.status === RESOLVED) {
				setTimeout(() => {
					try {
						let x = onfulfilled(this.value);
						resolvePromise(promise2, x, resolve, reject);
					} catch (e) {
						reject(e);
					}
				}, 0);
			}
			if (this.status === REJECTED) {
				//异步
				setTimeout(() => {
					try {
						let x = onrejected(this.reason);
						resolvePromise(promise2, x, resolve, reject);
					} catch (e) {
						reject(e);
					}
				}, 0);
			}
			// console.log(this.status)   // PENDING
			// 要点 8: 定时器执行resolve时,状态仍然是pending
			if (this.status === PENDING) {
				// 要点 10: 一个 promise 实例可以被 then 多次，存放 成功回调事件
				this.onfulfilledCallbacks.push(() => {
					setTimeout(() => {
						try {
							let x = onfulfilled(this.value);
							resolvePromise(promise2, x, resolve, reject);
						} catch (e) {
							reject(e);
						}
					}, 0);
				});
				// 要点 10: 一个 promise 实例可以被 then 多次，存放 失败回调事件
				this.onrejectedCallbacks.push(() => {
					//异步
					setTimeout(() => {
						try {
							let x = onrejected(this.reason);
							resolvePromise(promise2, x, resolve, reject);
						} catch (e) {
							reject(e);
						}
					}, 0);
				});
			}
		});
		return promise2;
	}
	all(promissArrs) {
		let arr = [];
		let i = 0;
		function processData(index, data) {
			arr[index] = data;
			i++;
			if (i == promissArrs.length) {
				resolve(arr);
			}
		}
		return new MyPromise((resolve, reject) => {
			for (let i = 0; i < promissArrs.length; i++) {
				promissArrs[i].then((value) => {
					processData(i, value);
				}, reject);
			}
		});
	}
}
// MyPromise.all = function(promissArrs) {
// 	let arr = [];
// 	let i = 0;
// 	function processData(index, data) {
// 		arr[index] = data;
// 		i++;
// 		if (i == promissArrs.length) {
// 			resolve(arr);
// 		}
// 	}
// 	return new MyPromise((resolve, reject) => {
// 		for (let i = 0; i < promissArrs.length; i++) {
// 			promissArrs[i].then((value) => {
// 				processData(i, value);
// 			}, reject);
// 		}
// 	});
// };
/*
x 不能是null，
x 是普通值，直接resolve（x）
x 是对象或者函数，当是函数默认为promise
声明then
then报错，reject
then是个函数， 执行then，判断成功和失败
如果then成功的回调还是promise，那么继续递归调用resolvePromise，如果是普通值，那么返回reject，如果是失败的值， 那么就返回reject
called是指有没有被成功或者失败过的标志位，一旦被调用了，就不能改变状态了

*/

function resolvePromise(promise2, x, resolve, reject) {
	//如果自己等待自己， 循环引用 直接return错误
	if (x === promise2) {
		return reject(new TypeError('Chaining cycle detected for promise'));
	}
	let called;
	// x不是null 且x是对象或者函数
	if (x != null && (typeof x === 'object' || typeof x === 'function')) {
		try {
			// A+规定，声明then = x的then方法
			let then = x.then;
			// 如果then是函数，就默认是promise了
			if (typeof then === 'function') {
				// 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
				then.call(
					x,
					(y) => {
						// 成功和失败只能调用一个
						if (called) return;
						called = true;
						// resolve的结果依旧是promise 那就继续解析
						resolvePromise(promise2, y, resolve, reject);
					},
					(err) => {
						// 成功和失败只能调用一个
						if (called) return;
						called = true;
						reject(err); // 失败了就失败了
					}
				);
			} else {
				resolve(x); // 直接成功即可
			}
		} catch (e) {
			// 也属于失败
			if (called) return;
			called = true;
			// 取then出错了那就不要在继续执行了
			reject(e);
		}
	} else {
		resolve(x);
	}
}
// new Promise((resolve, reject) => {
// 	resolve('Promise');
// })
// .then(
// 	(value) => {
// 		return new Promise((resolve, reject) => {
//             resolve('123');
//         })
// 	},
// 	(err) => {
// 		return err;
// 	}
// )
// .then(
// 	((value) => {
// 		console.log(value);
// 	},
// 	(err) => {
// 		console.log(err);
// 	})
// );

// let p = new myPromise((resolve, reject) => {
// 	resolve('myPromise');
// });

// p.then((data) => {
// 	return undefined
// 	// return data
// 	// throw new Error()     // 用例2. 报错或异常: 抛出异常，会直接走下一次then的失败
// 	// return new Error()    // 用例3. 返回的是普通值: error对象，需要特别注意
// 	// return new Promise((s,j)=>s(222))    // 用例4. 返回的是promise: 会传递当前promise的已成功结果
// 	// return new myPromise((resolve, reject) => {
// 	// 	resolve('123');
// 	// }); // 用例5. 返回的是promise: 会传递当前promise的已失败结果
// })
// .then(
// 	(data) => {
// 		console.log(data, 2); // 执行结果：用例1, 用例3, 用例4
// 	},
// 	(err) => {
// 		console.log(err, 3); // 执行结果：用例2, 用例5
// 	}
// );
// let p1 = new Promise((resolve, reject) => {
// 	resolve('Promise1');
// });
// let p2 = new Promise((resolve, reject) => {
// 	resolve('Promise2');
// });
// let p3 = new Promise((resolve, reject) => {
// 	resolve('Promise3');
// });
// let ps =Promise.all([ p1, p2, p3 ]);
let p1 = new MyPromise((resolve, reject) => {
	resolve('Promise1');
});
let p2 = new MyPromise((resolve, reject) => {
	resolve('Promise2');
});
let p3 = new MyPromise((resolve, reject) => {
	resolve('Promise3');
});
let ps =new  MyPromise();

 let result  =ps.all(p1,p2,p3)
// console.log(13);
