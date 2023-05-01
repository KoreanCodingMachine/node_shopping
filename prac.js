const a = [
    {title:'hi',name:'jh',done:false, id:0},
    {title:'hi',name:'jh',done:false, id:1},
    {title:'hi',name:'jh',done:false, id:2},
    {title:'hi',name:'jh',done:false, id:3}
]

const b = [
    {title:'hi',name:'jh',done:false, id:0},
    {title:'hi',name:'jh',done:false, id:1},
    {title:'hi',name:'jh',done:false, id:2},
    {title:'hi',name:'jh',done:false, id:3}
]

const c = a.filter((data) => {
    console.log(data)
    return b.includes(data)
})

const d = a.map((data) => ({...data, id:data.id.toString()}))
console.log(d)