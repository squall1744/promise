import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import Promise from '../src/promise'
chai.use(sinonChai)

const assert = chai.assert

//describe和it方法是mocha提供的, 用来美化测试结果的显示
describe('Promise', () => {
    it('Promise is class', () => {
        //chai的断言方法
        // @ts-ignore
        assert.isFunction(Promise)
        assert.exists(Promise.prototype)
    });

    it('new Promise must received a function as first argument', () => {

        // 当符合报错条件时, 则测试通过
        assert.throw(() => {
            // @ts-ignore
            new Promise()
        })
    })

    it('promise object has a then function', () => {
        const promise = new Promise(() => {

        })
        assert.isFunction(promise.then)
    })

    //fn参数时立即执行函数
    it('new Promise(fn) fn is a IIFE', () => {
        //使用sinon创建一个假函数, 判断该函数是否被执行
        let fn = sinon.fake()

        new Promise(fn)

        assert(fn.called)
    })


    //fn参数时立即执行函数， 并且接收resolve和reject两个函数作为参数
    it('fn must has two functional arguments', done => {
        new Promise((resolve, reject) => {

            assert.isFunction(resolve)
            assert.isFunction(reject)
            done()
        })

    })

    //当resolve被调用时, then中的success才会执行
    it('in promise.then(success), success will run as resolve executed', done => {
        let success = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(success.called)
            resolve()
            //因为resolve是异步函数, 所以判断resolve执行也需要是异步函数
            setTimeout(() => {
                assert.isTrue(success.called)
                done()
            }, 0)
        })

        // @ts-ignore
        promise.then(success)
    });

    //当resolve被调用时, then中的success才会执行
    it('in promise.then(null, fail), fail will run as reject executed', done => {
        let fail = sinon.fake()
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(fail.called)
            reject()
            //因为resolve是异步函数, 所以判断resolve执行也需要是异步函数
            setTimeout(() => {
                assert.isTrue(fail.called)
                done()
            }, 0)
        })

        // @ts-ignore
        promise.then(null, fail)
    });

    it('2.2.1 if success and fail not a function, ignore', () => {
        const promise = new Promise(resolve => {
            resolve()
        })

        promise.then(false, null)
    })

    it('2.2.2 ', done => {
        const success = sinon.fake()

       const promise =  new Promise(resolve => {
            assert.isFalse(success.called)
            resolve(123)
            resolve(233)

            setTimeout(() => {
                assert(promise.state === 'fulfilled')
                assert.isTrue(success.calledOnce)
                assert.isTrue(success.calledWith(123)) // calledWih用来验证传入的参数是否正确
                done()
            }, 0)
        })

        promise.then(success)
    });

    it('2.2.3', done => {
        const fail = sinon.fake()

        const promise =  new Promise((resolve, reject) => {
            assert.isFalse(fail.called)
            reject(123)
            reject(233)

            setTimeout(() => {
                assert(promise.state === 'rejected')
                assert.isTrue(fail.calledOnce)
                assert.isTrue(fail.calledWith(123)) // calledWih用来验证传入的参数是否正确
                done()
            }, 0)
        })

        promise.then(null, fail)
    });

    it('2.2.4', done => {
        const success = sinon.fake()

        const promise =  new Promise(resolve => {
            resolve()
        })

        promise.then(success)
        assert.isFalse(success.called)
        setTimeout(() => {
            assert.isTrue(success.called)
            done()
        })
    });

    it('2.2.5', done => {
        const promise =  new Promise(resolve => {
            resolve()
        })

        //测试this, 所以不能使用箭头函数
        promise.then(function() {
            'use strict'
            assert(this === undefined)
            done()
        })

    });

    it('2.2.6', done => {
        //给三个假函数, 当都被调用了就说明可以多次调用
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
        const promise =  new Promise(resolve => {
            resolve()
        })

        promise.then(callbacks[0])
        promise.then(callbacks[1])
        promise.then(callbacks[2])

        setTimeout(() => {
            assert(callbacks[0].called)
            assert(callbacks[1].calledAfter(callbacks[0]))
            assert(callbacks[2].calledAfter(callbacks[1]))
            done()
        })
    });

    it('2.2.7', done => {
        const promise = new Promise(resolve => {
            resolve()
            done()
        })

        const promise2 = promise.then(() => {})

        // @ts-ignore
        assert(promise2 instanceof Promise)
    })

    it('2.2.7.1', done => {
        const promise = new Promise(resolve => {
            resolve()
            done()
        })

       promise.then(() => 'success').then(result => {
           assert.equal(result, 'success')
           done()
       })
    })

    it('2.2.7.1.2', done => {
        const promise = new Promise(resolve => {
            resolve()
        })
        const fn = sinon.fake()
        promise.then(() => new Promise(resolve => resolve())).then(fn)
        setTimeout(() => {
            assert(fn.called)
            done()
        }, 0)
    })
})