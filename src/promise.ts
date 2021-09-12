class Promise2 {
    state = 'pending'
    callbacks = []

    // resolve函数, 当resolve执行时, 运行then中的succeed方法, 并将result传给succeed函数
    resolve(result) {
        //当resolve运行时, 调用then的succeed, 这里用异步是为了让then中的this.succeed = succeed和this.fail = fail先用resolve中的this.succeed()执行, 不然会报错
        setImmediate(() => {
            if (this.state !== 'pending') return
            this.state = 'fulfilled'

            this.callbacks.forEach(handle => {
                if (typeof handle[0] === 'function') {
                    const x = handle[0].call(undefined, result)
                    handle[2].resolveWith(x)
                }

            })
        })
    }

    reject(reason) {
        setImmediate(() => {
            if (this.state !== 'pending') return
            this.state = 'rejected'

            this.callbacks.forEach(handle => {
                if (typeof handle[1] === 'function') {
                    const x =  handle[1].call(undefined, reason)
                    handle[2].resolveWith(x)
                }

            })
        })
    }

    constructor(fn) {
        //当参数不为函数时, 报错
        if (typeof fn !== 'function') throw new Error('arguments must be a function')

        //fn为立即执行函数, 接受两个函数, 第一个是resolve, 第二个是reject
        fn(this.resolve.bind(this), this.reject.bind(this))
    }

    then(succeed?, fail?) {
        //handle数组为了解决多次调用then的问题, 每次调用都往callbacks里推一组succeed和fail, 在resovle或reject时, 遍历数组, 依次调用then中所有的succeed或fail
        const handle = []
        // 满足2.2.1
        if (typeof succeed == 'function') handle[0] = succeed //handle[0]记录fulfilled后调用的函数
        if (typeof fail == 'function') handle[1] = fail //handle[1]记录rejected后调用的函数

        handle[2] = new Promise2(() => {}) //handle[2]记录then返回的Promise

        this.callbacks.push(handle)

        return handle[2]
    }

    //2.2.7.1
    resolveWith(x) {
        // this就是promise2
        if (this === x)  return this.reject(new TypeError())

        if(x instanceof Promise2) {
            x.then(result => {
                this.resolve(result)
            }, reason => {
                this.reject(reason)
            })
        }

        if(x instanceof Object) {
            let then
            try {
                then = x.then
            } catch (e) {
                this.reject(e)
            }

            if (then instanceof Function) {
                try {
                    x.then(y => {
                        this.resolveWith(y)
                    }, r => {
                        this.reject(r)
                    })
                } catch (e) {
                    this.reject(e)
                }
            } else {
                this.resolve(x)
            }
        }
    }
}


export default Promise2