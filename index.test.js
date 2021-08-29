const rewire = require("rewire")
const index = rewire("./index")
const getFirst = index.__get__("getFirst")
// @ponicode
describe("getFirst", () => {
    test("0", () => {
        let param1 = [{ 7: 1, key3: -100 }]
        let callFunction = () => {
            getFirst(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param1 = [{ 7: 0, key3: 1 }]
        let callFunction = () => {
            getFirst(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let param1 = [{ 7: 100, key3: 0 }]
        let callFunction = () => {
            getFirst(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let param1 = [{ 7: -5.48, key3: 100 }]
        let callFunction = () => {
            getFirst(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let param1 = [{ 7: -100, key3: 0 }]
        let callFunction = () => {
            getFirst(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            getFirst(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("index.default.createPool", () => {
    test("0", () => {
        let callFunction = () => {
            index.default.createPool({ key4: -5.48, 0: -5.48 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            index.default.createPool({ key4: -100, 0: 100 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            index.default.createPool({ key4: 100, 0: 1 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            index.default.createPool({ key4: -100, 0: 1 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            index.default.createPool({ key4: 1, 0: 0 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            index.default.createPool(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
